import sys
import json
import time
import logging
import traceback
import warnings
from pathlib import Path
from datetime import datetime

# Setup paths
REPO_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(REPO_ROOT / "backend"))

from models.config_schema import OutputFormat
from models.run_result import RunResult, RunStatus
from services.config_manager import load_profile, copy_profile_to
from services.docling_runner import _build_docling_options

class ProgressLogHandler(logging.Handler):
    """Intercepts docling logs to emit progress percentages."""
    def emit(self, record):
        msg = record.getMessage()
        # Simple heuristics for progress based on docling-core logs
        pct = None
        if "Starting document conversion" in msg: pct = 10
        elif "PDF Parsing" in msg or "Docling" in msg: pct = 20
        elif "LayoutObjectDetection" in msg: pct = 40
        elif "TableStructure" in msg: pct = 60
        elif "OCR" in msg: pct = 70
        elif "Code/Formula" in msg: pct = 80
        elif "Assembling" in msg: pct = 90

        if pct is not None:
            print(f"__PROGRESS__={json.dumps({'percent': pct, 'message': msg})}", flush=True)

def main():
    if len(sys.argv) < 4:
        print("Usage: docling_worker.py <profile_name> <filename> <run_dir>")
        sys.exit(1)

    profile_name = sys.argv[1]
    filename = sys.argv[2]
    run_dir = Path(sys.argv[3])
    run_id = run_dir.name.replace("run_", "")
    
    # Configure docling logger
    docling_logger = logging.getLogger("docling")
    docling_logger.setLevel(logging.INFO)
    docling_logger.addHandler(ProgressLogHandler())

    def log(msg: str):
        timestamped = f"[{datetime.now().strftime('%H:%M:%S')}] {msg}"
        print(timestamped, flush=True)

    run_result = RunResult(
        run_id=run_id,
        profile_name=profile_name,
        status=RunStatus.RUNNING,
        output_dir=str(run_dir.relative_to(REPO_ROOT)),
    )

    try:
        config = load_profile(profile_name)
        test_doc_path = REPO_ROOT / "test_data" / filename
        
        log(f"🚀 Starting Pipeline Run ID: {run_id}")
        log(f"  Profile: {config.profile_name}")
        log(f"  Document: {filename}")
        log(f"  Output dir: {run_dir}")
        log("─" * 60)

        log("⚙ Importing Docling...")
        from docling.document_converter import DocumentConverter, PdfFormatOption
        from docling.datamodel.base_models import InputFormat

        log("⚙ Building pipeline options from config...")
        pipeline_opts = _build_docling_options(config.pdf_options)

        log("⚙ Initialising DocumentConverter...")
        converter = DocumentConverter(
            format_options={
                InputFormat.PDF: PdfFormatOption(pipeline_options=pipeline_opts)
            }
        )

        log("⚙ Running document conversion (this may take a moment)...")
        print(f"__PROGRESS__={json.dumps({'percent': 10, 'message': 'Conversion started'})}", flush=True)
        t_start = time.perf_counter()

        captured_warnings = []
        with warnings.catch_warnings(record=True) as caught_warnings:
            warnings.simplefilter("always")
            result = converter.convert(str(test_doc_path))
            for w in caught_warnings:
                if w.category == DeprecationWarning and "Field `annotations` is deprecated" in str(w.message):
                    continue
                captured_warnings.append(f"⚠ {w.category.__name__}: {w.message}")

        t_elapsed = time.perf_counter() - t_start
        log(f"✓ Conversion complete in {t_elapsed:.2f}s")
        print(f"__PROGRESS__={json.dumps({'percent': 95, 'message': 'Saving outputs'})}", flush=True)

        doc = result.document
        run_result.page_count = len(doc.pages) if hasattr(doc, "pages") else None
        if run_result.page_count:
            log(f"  Pages processed: {run_result.page_count}")
        run_result.warnings = captured_warnings

        log("─" * 60)
        log("💾 Writing output files...")
        output_files = []

        fmt_map = config.output.formats
        for fmt in fmt_map:
            if fmt == OutputFormat.MARKDOWN:
                out_path = run_dir / "parsed_doc.md"
                out_path.write_text(doc.export_to_markdown(), encoding="utf-8")
                output_files.append(str(out_path.name))
                log(f"  ✓ Markdown → {out_path.name}")
            elif fmt == OutputFormat.JSON:
                out_path = run_dir / "parsed_doc.json"
                out_path.write_text(doc.model_dump_json(indent=2), encoding="utf-8")
                output_files.append(str(out_path.name))
                log(f"  ✓ JSON → {out_path.name}")
            elif fmt == OutputFormat.TEXT:
                out_path = run_dir / "parsed_doc.txt"
                out_path.write_text(doc.export_to_text(), encoding="utf-8")
                output_files.append(str(out_path.name))
                log(f"  ✓ Plain text → {out_path.name}")
            elif fmt == OutputFormat.HTML:
                try:
                    from docling_core.transforms.serializer.html import HTMLDocSerializer, HTMLOutputStyle, HTMLParams
                    from docling_core.transforms.visualizer.layout_visualizer import LayoutVisualizer
                    from docling_core.types.doc import ImageRefMode
                    style = HTMLOutputStyle.SPLIT_PAGE if config.output.html_split_page_view else HTMLOutputStyle.FLOW
                    ser = HTMLDocSerializer(doc=doc, params=HTMLParams(image_mode=ImageRefMode.EMBEDDED, output_style=style))
                    visualizer = None
                    if config.output.html_include_annotations:
                        visualizer = LayoutVisualizer()
                        visualizer.params.show_label = True
                    out_path = run_dir / "parsed_doc.html"
                    out_path.write_text(ser.serialize(visualizer=visualizer).text, encoding="utf-8")
                    output_files.append(str(out_path.name))
                    log(f"  ✓ HTML → {out_path.name}")
                except Exception as ex:
                    log(f"  ⚠ Failed to export annotated HTML: {ex}")
            elif fmt == OutputFormat.ITERATED_ITEMS:
                try:
                    from docling_core.types.doc.common.content_layer import ContentLayer
                    iter_opts = config.iterate_items_options
                    layers = {ContentLayer(l.value) for l in iter_opts.included_content_layers} if iter_opts.included_content_layers else None
                    items_list = []
                    for item, level in doc.iterate_items(
                        with_groups=iter_opts.with_groups, traverse_pictures=iter_opts.traverse_pictures,
                        page_no=iter_opts.page_no, included_content_layers=layers
                    ):
                        items_list.append({
                            "label": getattr(item.label, "value", str(item.label)) if hasattr(item, "label") else None,
                            "text": getattr(item, "text", None),
                            "level": level, "self_ref": item.get_ref() if hasattr(item, "get_ref") else None
                        })
                    out_path = run_dir / "parsed_items.json"
                    out_path.write_text(json.dumps(items_list, indent=2), encoding="utf-8")
                    output_files.append(str(out_path.name))
                    log(f"  ✓ Iterated Items ({len(items_list)}) → {out_path.name}")
                except Exception as ex:
                    log(f"  ⚠ Failed to generate iterated items: {ex}")
            elif fmt == OutputFormat.DOCTAGS:
                out_path = run_dir / "parsed_doc.doctags"
                out_path.write_text(doc.export_to_document_tokens(), encoding="utf-8")
                output_files.append(str(out_path.name))
                log(f"  ✓ DocTags → {out_path.name}")

        try:
            copy_profile_to(config, run_dir)
            output_files.append("config.yaml")
        except Exception as e:
            log(f"  ⚠ Could not copy config: {e}")

        run_result.status = RunStatus.SUCCESS
        run_result.finished_at = datetime.utcnow()
        run_result.duration_seconds = t_elapsed
        run_result.output_files = output_files
        log("─" * 60)
        log(f"✅ Run complete — {t_elapsed:.2f}s | {len(output_files)} files written")
        print(f"__PROGRESS__={json.dumps({'percent': 100, 'message': 'Complete'})}", flush=True)

    except Exception as e:
        log(f"❌ Pipeline failed: {type(e).__name__}: {e}")
        log(traceback.format_exc())
        run_result.status = RunStatus.ERROR
        run_result.error_message = str(e)
        run_result.finished_at = datetime.utcnow()

    finally:
        res_path = run_dir / "run_result.json"
        res_path.write_text(run_result.model_dump_json(), encoding="utf-8")

if __name__ == "__main__":
    main()
