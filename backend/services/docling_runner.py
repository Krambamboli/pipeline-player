"""
Docling Runner Service
----------------------
Constructs a DocumentConverter from a PipelineConfig, executes it against
the test document, saves all outputs, and yields log lines via a generator
for Server-Sent Events streaming.

Key responsibilities:
  1. Map our Pydantic PipelineConfig → Docling's native option objects.
  2. Run the conversion with timing instrumentation.
  3. Write all output files + run.log + config copy to /outputs/run_{id}/.
  4. Yield structured log lines for real-time streaming to the UI.
"""

from __future__ import annotations

import logging
import time
import traceback
import warnings
from datetime import datetime
from pathlib import Path
from typing import Generator, List

from models.config_schema import (
    AcceleratorDevice,
    ChartExtractionKind,
    CodeFormulaKind,
    OcrEngine,
    OutputFormat,
    PdfPipelineOptions as OurPdfOptions,
    PictureClassificationKind,
    PictureDescriptionKind,
    PipelineConfig,
    TableStructureMode,
)
from models.run_result import RunResult, RunStatus
from services.config_manager import copy_profile_to

# Root paths
REPO_ROOT = Path(__file__).resolve().parent.parent.parent
TEST_DOC = REPO_ROOT / "test_data" / "test_document.pdf"
OUTPUTS_DIR = REPO_ROOT / "outputs"
OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)


# ---------------------------------------------------------------------------
# Helper: map our enums/models → Docling's native objects
# ---------------------------------------------------------------------------

def _build_docling_options(our_opts: OurPdfOptions):
    """
    Convert our Pydantic PdfPipelineOptions model to Docling's native
    PdfPipelineOptions object. This function is the bridge between our
    config schema and the live Docling library.
    """
    # Import Docling here so the rest of the app doesn't fail if it's not installed.
    from docling.datamodel.pipeline_options import (
        AcceleratorOptions as DAcceleratorOptions,
        EasyOcrOptions,
        OcrMacOptions,
        PdfPipelineOptions as DPdfPipelineOptions,
        RapidOcrOptions,
        TableStructureOptions as DTableStructureOptions,
        TesseractCliOcrOptions,
        TesseractOcrOptions,
    )
    from docling.datamodel.base_models import InputFormat

    o = our_opts

    # --- OCR engine selection ---
    # Build the options object; if a chosen engine's package isn't installed
    # (e.g. easyocr selected but `pip install easyocr` not done yet) we fall
    # back to RapidOCR, which is always available via docling[standard].
    def _make_ocr_options():
        kind = o.ocr_options.kind
        try:
            if kind == OcrEngine.EASYOCR:
                import easyocr  # noqa: F401  — just validate it's installed
                return EasyOcrOptions(lang=o.ocr_options.lang)
            elif kind == OcrEngine.TESSERACT:
                return TesseractOcrOptions(lang="+".join(o.ocr_options.lang))
            elif kind == OcrEngine.TESSERACT_CLI:
                return TesseractCliOcrOptions(lang="+".join(o.ocr_options.lang))
            else:
                # RAPIDOCR / OCRMAC / unknown — all use RapidOCR as the safe default
                return RapidOcrOptions()
        except ImportError as exc:
            # The requested engine's package isn't installed; fall back and warn
            import logging
            logging.getLogger(__name__).warning(
                "OCR engine '%s' requested but its package is not installed "
                "(%s). Falling back to RapidOCR. Install the missing package "
                "or switch the engine in the UI.", kind, exc
            )
            return RapidOcrOptions()

    ocr_options = _make_ocr_options()
    # Apply shared fields
    if hasattr(ocr_options, "force_full_page_ocr"):
        ocr_options.force_full_page_ocr = o.ocr_options.force_full_page_ocr
    if hasattr(ocr_options, "bitmap_area_threshold"):
        ocr_options.bitmap_area_threshold = o.ocr_options.bitmap_area_threshold


    # --- Table structure options ---
    from docling.datamodel.pipeline_options import TableFormerMode
    mode_map = {
        TableStructureMode.FAST: TableFormerMode.FAST,
        TableStructureMode.ACCURATE: TableFormerMode.ACCURATE,
    }
    table_opts = DTableStructureOptions(
        mode=mode_map.get(o.table_structure_options.mode, TableFormerMode.FAST),
        do_cell_matching=o.table_structure_options.do_cell_matching,
    )

    # --- Accelerator options ---
    # Note: some docling models (e.g. CodeFormulaVlmModel) don't support MPS.
    # With AUTO, docling picks the best available device *per model*, so layout
    # and table models use MPS while VLMs fall back to CPU automatically.
    from docling.datamodel.pipeline_options import AcceleratorDevice as DAccDevice
    dev_map = {
        AcceleratorDevice.AUTO: DAccDevice.AUTO,
        AcceleratorDevice.CPU: DAccDevice.CPU,
        AcceleratorDevice.CUDA: DAccDevice.CUDA,
        AcceleratorDevice.MPS: DAccDevice.MPS,
        AcceleratorDevice.XPU: DAccDevice.XPU,
    }
    acc_opts = DAcceleratorOptions(
        # Fall back to AUTO (not CPU) when device is unknown, so MPS is still used
        # for models that support it.
        device=dev_map.get(o.accelerator_options.device, DAccDevice.AUTO),
        num_threads=o.accelerator_options.num_threads,
    )

    # --- Build the main PdfPipelineOptions ---
    artifacts_path = Path(o.artifacts_path) if o.artifacts_path else None

    pipeline_opts = DPdfPipelineOptions(
        do_ocr=o.do_ocr,
        do_table_structure=o.do_table_structure,
        do_code_enrichment=o.do_code_enrichment,
        do_formula_enrichment=o.do_formula_enrichment,
        do_picture_classification=o.do_picture_classification,
        do_picture_description=o.do_picture_description,
        force_backend_text=o.force_backend_text,
        generate_page_images=o.generate_page_images,
        generate_picture_images=o.generate_picture_images,
        generate_table_images=o.generate_table_images,
        images_scale=o.images_scale,
        generate_parsed_pages=o.generate_parsed_pages,
        ocr_options=ocr_options,
        table_structure_options=table_opts,
        accelerator_options=acc_opts,
    )

    # Apply optional fields if supported by installed version
    if artifacts_path:
        pipeline_opts.artifacts_path = artifacts_path
    if o.document_timeout is not None:
        pipeline_opts.document_timeout = o.document_timeout

    return pipeline_opts


# ---------------------------------------------------------------------------
# Main runner
# ---------------------------------------------------------------------------

def run_pipeline(config: PipelineConfig) -> Generator[str, None, RunResult]:
    """
    Execute the Docling pipeline and yield log lines for SSE streaming.

    Yields:
        str — JSON-serializable log line strings prefixed with event type.

    Returns (via StopIteration value):
        RunResult — metadata about the completed run.
    """
    # Create the output directory for this run.
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    run_id = f"{timestamp}_{config.profile_name}"
    run_dir = OUTPUTS_DIR / f"run_{run_id}"
    run_dir.mkdir(parents=True, exist_ok=True)

    run_result = RunResult(
        run_id=run_id,
        profile_name=config.profile_name,
        status=RunStatus.RUNNING,
        output_dir=str(run_dir.relative_to(REPO_ROOT)),
    )

    log_lines: List[str] = []

    def log(msg: str) -> str:
        """Emit a log line, storing it for the run.log file."""
        timestamped = f"[{datetime.now().strftime('%H:%M:%S')}] {msg}"
        log_lines.append(timestamped)
        return timestamped

    try:
        yield log(f"▶ Starting pipeline run — ID: {run_id}")
        yield log(f"  Profile: {config.profile_name}")
        yield log(f"  Input: {TEST_DOC}")
        yield log(f"  Output dir: {run_dir}")
        yield log("─" * 60)

        # --- Validate test document exists ---
        if not TEST_DOC.exists():
            raise FileNotFoundError(
                f"Test document not found at {TEST_DOC}. "
                "Please ensure test_data/test_document.pdf exists."
            )

        # --- Import Docling ---
        yield log("⚙ Importing Docling...")
        try:
            from docling.document_converter import DocumentConverter, PdfFormatOption
            from docling.datamodel.base_models import InputFormat
        except ImportError as e:
            raise ImportError(
                f"Docling is not installed: {e}. "
                "Run: pip install docling"
            ) from e

        # --- Build pipeline options ---
        yield log("⚙ Building pipeline options from config...")
        pipeline_opts = _build_docling_options(config.pdf_options)

        # --- Initialize the converter ---
        yield log("⚙ Initialising DocumentConverter...")
        converter = DocumentConverter(
            format_options={
                InputFormat.PDF: PdfFormatOption(pipeline_options=pipeline_opts)
            }
        )

        # --- Run conversion ---
        yield log("⚙ Running document conversion (this may take a moment)...")
        t_start = time.perf_counter()

        captured_warnings: List[str] = []
        with warnings.catch_warnings(record=True) as caught_warnings:
            warnings.simplefilter("always")
            result = converter.convert(str(TEST_DOC))
            for w in caught_warnings:
                msg = f"⚠ {w.category.__name__}: {w.message}"
                captured_warnings.append(msg)
                yield log(msg)

        t_elapsed = time.perf_counter() - t_start
        yield log(f"✓ Conversion complete in {t_elapsed:.2f}s")

        doc = result.document
        run_result.page_count = len(doc.pages) if hasattr(doc, "pages") else None
        if run_result.page_count:
            yield log(f"  Pages processed: {run_result.page_count}")
        run_result.warnings = captured_warnings

        # --- Write output files ---
        yield log("─" * 60)
        yield log("💾 Writing output files...")
        output_files: List[str] = []

        fmt_map = config.output.formats
        for fmt in fmt_map:
            if fmt == OutputFormat.MARKDOWN:
                out_path = run_dir / "parsed_doc.md"
                out_path.write_text(doc.export_to_markdown(), encoding="utf-8")
                output_files.append(str(out_path.name))
                yield log(f"  ✓ Markdown → {out_path.name}")

            elif fmt == OutputFormat.JSON:
                out_path = run_dir / "parsed_doc.json"
                out_path.write_text(doc.model_dump_json(indent=2), encoding="utf-8")
                output_files.append(str(out_path.name))
                yield log(f"  ✓ JSON → {out_path.name}")

            elif fmt == OutputFormat.DOCTAGS:
                out_path = run_dir / "parsed_doc.doctags"
                out_path.write_text(doc.export_to_document_tokens(), encoding="utf-8")
                output_files.append(str(out_path.name))
                yield log(f"  ✓ DocTags → {out_path.name}")

            elif fmt == OutputFormat.TEXT:
                out_path = run_dir / "parsed_doc.txt"
                out_path.write_text(doc.export_to_text(), encoding="utf-8")
                output_files.append(str(out_path.name))
                yield log(f"  ✓ Plain text → {out_path.name}")

            elif fmt == OutputFormat.HTML:
                out_path = run_dir / "parsed_doc.html"
                if hasattr(doc, "export_to_html"):
                    try:
                        # Use EMBEDDED image mode so all page images are base64-encoded
                        # directly in the HTML — the iframe renderer needs self-contained HTML.
                        from docling_core.types.doc.base import ImageRefMode
                        html_content = doc.export_to_html(
                            split_page_view=config.output.html_split_page_view,
                            include_annotations=config.output.html_include_annotations,
                            image_mode=ImageRefMode.EMBEDDED,
                        )
                    except TypeError:
                        # Older docling versions don't support these kwargs; fall back.
                        html_content = doc.export_to_html()
                    out_path.write_text(html_content, encoding="utf-8")
                    output_files.append(str(out_path.name))
                    yield log(f"  ✓ HTML → {out_path.name} "
                              f"(split_page={config.output.html_split_page_view}, "
                              f"annotations={config.output.html_include_annotations})")
                else:
                    yield log("  ⚠ HTML export not supported by installed Docling version — skipped.")


        # --- Copy config ---
        try:
            copy_profile_to(config, run_dir)
            output_files.append("config.yaml")
            yield log("  ✓ Config copy → config.yaml")
        except Exception as e:
            yield log(f"  ⚠ Could not copy config: {e}")

        # --- Finalise ---
        finished_at = datetime.utcnow()
        run_result.status = RunStatus.SUCCESS
        run_result.finished_at = finished_at
        run_result.duration_seconds = t_elapsed
        run_result.output_files = output_files

        yield log("─" * 60)
        yield log(f"✅ Run complete — {t_elapsed:.2f}s | {len(output_files)} files written")

    except Exception as e:
        error_msg = f"❌ Pipeline failed: {type(e).__name__}: {e}"
        yield log(error_msg)
        yield log(traceback.format_exc())
        run_result.status = RunStatus.ERROR
        run_result.error_message = str(e)
        run_result.finished_at = datetime.utcnow()

    finally:
        # --- Always write run.log ---
        log_path = run_dir / "run.log"
        log_path.write_text("\n".join(log_lines), encoding="utf-8")

    return run_result
