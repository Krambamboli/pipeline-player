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
        OcrAutoOptions,
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
            elif kind == OcrEngine.MAC_OS_VISION:
                import ocrmac  # noqa: F401
                return OcrMacOptions()
            elif kind == OcrEngine.AUTO:
                return OcrAutoOptions()
            else:
                # RAPIDOCR / OCRMYPDF / unknown — all use RapidOCR as the safe default
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
    
    selected_device = dev_map.get(o.accelerator_options.device, DAccDevice.AUTO)
    
    # Force AUTO if user chose MPS but enabled VLM models that don't support it
    if selected_device == DAccDevice.MPS and (o.do_code_enrichment or o.do_formula_enrichment or getattr(o, "do_picture_description", False)):
        import logging
        logging.getLogger(__name__).warning(
            "MPS is not supported by VLM models (Code/Formula/Picture Description). "
            "Falling back to AUTO so supported models use MPS and VLMs use CPU."
        )
        selected_device = DAccDevice.AUTO

    acc_opts = DAcceleratorOptions(
        device=selected_device,
        num_threads=o.accelerator_options.num_threads,
    )

    # --- Build the main PdfPipelineOptions ---
    artifacts_path = Path(o.artifacts_path) if o.artifacts_path else None

    from docling.datamodel.pipeline_options import HeadingHierarchyOptions as DHeadingOptions
    from docling.datamodel.pipeline_options import CodeFormulaVlmOptions
    
    heading_opts = DHeadingOptions(
        enabled=o.heading_hierarchy_options.enabled,
        use_bookmarks=o.heading_hierarchy_options.use_bookmarks,
        use_numbering=o.heading_hierarchy_options.use_numbering,
        use_style=o.heading_hierarchy_options.use_style,
        use_font_style=o.heading_hierarchy_options.use_font_style,
        style_size_tolerance=o.heading_hierarchy_options.style_size_tolerance,
        max_level=o.heading_hierarchy_options.max_level,
        bookmark_match_threshold=o.heading_hierarchy_options.bookmark_match_threshold,
    )

    code_formula_opts = CodeFormulaVlmOptions.from_preset("codeformulav2")
    if o.code_formula_options and o.code_formula_options.kind == "granite":
        code_formula_opts = CodeFormulaVlmOptions.from_preset("granite_docling")

    from docling.datamodel.pipeline_options import LayoutObjectDetectionOptions

    if o.layout_options.model.value == "default":
        layout_opts = LayoutObjectDetectionOptions() # uses built-in default
    else:
        layout_opts = LayoutObjectDetectionOptions.from_preset(o.layout_options.model.value)

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
        heading_hierarchy_options=heading_opts,
        code_formula_options=code_formula_opts,
        layout_options=layout_opts,
    )

    # Apply optional or newer fields if supported by installed version
    if artifacts_path:
        pipeline_opts.artifacts_path = artifacts_path
    if o.document_timeout is not None:
        pipeline_opts.document_timeout = o.document_timeout

    # Map missing fields dynamically if they exist on the target version
    optional_fields = {
        "do_chart_extraction": o.do_chart_extraction,
        "enable_remote_services": o.enable_remote_services,
        "allow_external_plugins": o.allow_external_plugins,
        "layout_batch_size": o.layout_batch_size,
        "ocr_batch_size": o.ocr_batch_size,
        "table_batch_size": o.table_batch_size,
        "queue_max_size": o.queue_max_size,
        "batch_polling_interval_seconds": o.batch_polling_interval_seconds,
        "stage_shutdown_timeout_seconds": o.stage_shutdown_timeout_seconds,
    }
    
    for key, val in optional_fields.items():
        if hasattr(pipeline_opts, key):
            setattr(pipeline_opts, key, val)

    return pipeline_opts


# ---------------------------------------------------------------------------
# Main runner
# ---------------------------------------------------------------------------

import sys
import subprocess
import json
from typing import Dict, Generator
from datetime import datetime

_active_processes: Dict[str, subprocess.Popen] = {}

def get_active_process(run_id: str) -> subprocess.Popen | None:
    return _active_processes.get(run_id)

def cancel_run(run_id: str) -> bool:
    """Cancels an active run by terminating its subprocess."""
    process = _active_processes.get(run_id)
    if process:
        process.terminate()
        return True
    return False

def run_pipeline(config: PipelineConfig, filename: str) -> Generator[str, None, RunResult]:
    """
    Spawns the docling_worker.py subprocess to execute the pipeline.
    Yields log lines and progress events for SSE streaming.
    Returns RunResult metadata when exhausted.
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    run_id = f"{timestamp}_{config.profile_name}"
    run_dir = OUTPUTS_DIR / f"run_{run_id}"
    run_dir.mkdir(parents=True, exist_ok=True)

    worker_script = Path(__file__).parent / "docling_worker.py"
    cmd = [
        sys.executable,
        str(worker_script),
        config.profile_name,
        filename,
        str(run_dir)
    ]

    process = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )
    
    _active_processes[run_id] = process
    log_lines = []

    try:
        # We need to yield the run_id first so the client knows it
        yield f"__RUN_ID__={run_id}"

        for line in iter(process.stdout.readline, ""):
            line = line.strip()
            if not line:
                continue
                
            if line.startswith("__PROGRESS__="):
                # Yield progress events as-is
                yield line
            else:
                log_lines.append(line)
                yield line

        process.wait()
    finally:
        _active_processes.pop(run_id, None)

    # Always write run.log (useful even if cancelled)
    log_path = run_dir / "run.log"
    log_path.write_text("\n".join(log_lines), encoding="utf-8")

    # Read the run_result.json produced by the worker
    res_path = run_dir / "run_result.json"
    if res_path.exists():
        return RunResult.model_validate_json(res_path.read_text("utf-8"))
    
    # If it crashed or was cancelled before creating the result
    return RunResult(
        run_id=run_id,
        profile_name=config.profile_name,
        status=RunStatus.ERROR,
        output_dir=str(run_dir.relative_to(REPO_ROOT)),
        error_message="Process terminated unexpectedly or was cancelled.",
        finished_at=datetime.utcnow()
    )
