# Copyright (C) 2024 Oliver Schneider
#
# This file is part of Pipeline Player.
# SPDX-License-Identifier: GPL-3.0-or-later
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program. If not, see <https://www.gnu.org/licenses/>.

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

def _build_picture_description_options(pd, notes: List[str]):
    """
    Map our PictureDescriptionOptions → a Docling picture-description options
    object (either a VLM preset or the OpenAI-compatible API client).

    Docs: https://docling-project.github.io/docling/examples/pictures_description/
          (PictureDescriptionVlmEngineOptions.from_preset / PictureDescriptionApiOptions)

    Args:
        pd:    our `PictureDescriptionOptions` model.
        notes: list that collects human-readable decisions for the run log.

    Returns:
        A Docling options instance ready for `picture_description_options`.
    """
    import os
    from docling.datamodel.pipeline_options import (
        PictureDescriptionApiOptions,
        PictureDescriptionVlmEngineOptions,
    )

    kind = pd.kind
    # Shared fields understood by every Docling picture-description backend.
    common = {
        "prompt": pd.prompt,
        "picture_area_threshold": pd.picture_area_threshold,
    }

    if kind == PictureDescriptionKind.API:
        # OpenAI-compatible endpoint (Ollama, LM Studio, vLLM, OpenAI …).
        headers = {}
        if pd.api_key_env:
            token = os.environ.get(pd.api_key_env)
            if token:
                headers["Authorization"] = f"Bearer {token}"
            else:
                notes.append(
                    f"⚠ Picture description API: env var '{pd.api_key_env}' is not set — "
                    "sending requests without Authorization header."
                )
        notes.append(
            f"🖼 Picture description: API '{pd.api_model}' @ {pd.api_url} "
            f"(timeout {pd.api_timeout:.0f}s, concurrency {pd.api_concurrency})"
        )
        return PictureDescriptionApiOptions(
            url=pd.api_url,
            params={"model": pd.api_model},
            headers=headers,
            timeout=pd.api_timeout,
            concurrency=pd.api_concurrency,
            provenance=f"api:{pd.api_model}",
            **common,
        )

    # Local VLM preset. 'disabled' with the toggle ON falls back to Docling's
    # own default (SmolVLM) — that is what Docling did implicitly before.
    preset_id = kind.value if kind != PictureDescriptionKind.DISABLED else "smolvlm"
    opts = PictureDescriptionVlmEngineOptions.from_preset(preset_id, **common)
    repo = getattr(opts.model_spec, "default_repo_id", preset_id)
    notes.append(f"🖼 Picture description: local preset '{preset_id}' ({repo})")
    return opts


def _build_docling_options(our_opts: OurPdfOptions, notes: List[str] | None = None):
    """
    Convert our Pydantic PdfPipelineOptions model to Docling's native
    PdfPipelineOptions object. This function is the bridge between our
    config schema and the live Docling library.

    Args:
        our_opts: the `pdf_options` block of a PipelineConfig.
        notes:    optional list; receives human-readable notes about how
                  settings were resolved (fallbacks, auto-enabled stages …)
                  so the worker can print them into the run log.
    """
    if notes is None:
        notes = []
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
    # The UI stores ISO 639-1 codes ('de', 'en'); each engine expects its own
    # format, so we translate them here.
    _TESS = {"en": "eng", "de": "deu", "fr": "fra", "es": "spa", "it": "ita", "pt": "por",
             "nl": "nld", "pl": "pol", "cs": "ces", "sv": "swe", "da": "dan", "fi": "fin",
             "no": "nor", "ru": "rus", "uk": "ukr", "tr": "tur", "el": "ell", "zh": "chi_sim",
             "ja": "jpn", "ko": "kor", "ar": "ara", "he": "heb", "hu": "hun", "ro": "ron"}
    _APPLE = {"en": "en-US", "de": "de-DE", "fr": "fr-FR", "es": "es-ES", "it": "it-IT",
              "pt": "pt-BR", "nl": "nl-NL", "pl": "pl-PL", "cs": "cs-CZ", "sv": "sv-SE",
              "da": "da-DK", "no": "nb-NO", "ru": "ru-RU", "uk": "uk-UA", "tr": "tr-TR",
              "zh": "zh-Hans", "ja": "ja-JP", "ko": "ko-KR", "ar": "ar-SA"}
    langs = [l.strip() for l in o.ocr_options.lang if l and l.strip()]

    def _map_langs(table: dict) -> list:
        """Translate 2-letter codes via `table`; codes already in the target format pass through."""
        return [table.get(l.lower(), l) for l in langs]

    def _rapid_with_lang():
        """
        RapidOCR options with the FIRST UI language (RapidOCR recognises one
        language per run; PP-OCRv6 accepts ISO codes like 'de', 'en').
        Validated with Docling's own resolver so an unsupported code falls
        back to Docling's default instead of crashing at model load time.
        """
        if not langs:
            return RapidOcrOptions()
        first = langs[0]
        try:
            # Private helper, but it is exactly what Docling runs at init time.
            from docling.models.stages.ocr.rapid_ocr_model import _resolve_rapidocr
            _resolve_rapidocr(first, RapidOcrOptions().backend)
        except Exception as exc:  # unsupported code or API change → keep default
            notes.append(f"⚠ RapidOCR does not support language '{first}' ({exc}) — using Docling default.")
            return RapidOcrOptions()
        if len(langs) > 1:
            notes.append(f"ℹ RapidOCR uses one language per run — using '{first}', ignoring {langs[1:]}.")
        return RapidOcrOptions(lang=[first])

    def _make_ocr_options():
        kind = o.ocr_options.kind
        try:
            if kind == OcrEngine.EASYOCR:
                import easyocr  # noqa: F401  — just validate it's installed
                return EasyOcrOptions(lang=langs or ["en"])
            elif kind == OcrEngine.TESSERACT:
                import tesserocr  # noqa: F401  — Python bindings must be installed
                return TesseractOcrOptions(lang=_map_langs(_TESS) or ["eng"])
            elif kind == OcrEngine.TESSERACT_CLI:
                import shutil
                if shutil.which("tesseract") is None:
                    raise ImportError("`tesseract` binary not found on PATH (brew install tesseract)")
                return TesseractCliOcrOptions(lang=_map_langs(_TESS) or ["eng"])
            elif kind == OcrEngine.MAC_OS_VISION:
                import ocrmac  # noqa: F401
                mapped = _map_langs(_APPLE)
                return OcrMacOptions(lang=mapped) if mapped else OcrMacOptions()
            elif kind == OcrEngine.AUTO:
                return OcrAutoOptions()
            else:
                # RAPIDOCR / OCRMYPDF / unknown — all use RapidOCR as the safe default.
                if kind == OcrEngine.OCRMYPDF:
                    notes.append("⚠ OCR engine 'ocrmypdf' is not a Docling engine — using RapidOCR instead.")
                return _rapid_with_lang()
        except ImportError as exc:
            # The requested engine's package isn't installed; fall back and warn
            import logging
            logging.getLogger(__name__).warning(
                "OCR engine '%s' requested but its package is not installed "
                "(%s). Falling back to RapidOCR. Install the missing package "
                "or switch the engine in the UI.", kind, exc
            )
            notes.append(
                f"⚠ OCR engine '{kind.value}' is not installed ({exc}) — using RapidOCR instead."
            )
            return _rapid_with_lang()

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

    # --- Reconcile enrichment toggles with their model selectors -----------
    # The UI exposes both a boolean toggle (do_*) and a model dropdown (kind)
    # for several stages. Previously only the toggle reached Docling and the
    # dropdown went nowhere. Rule now: the TOGGLE is the master switch (keeps
    # the behaviour of existing profiles — no surprise multi-GB downloads),
    # the dropdown selects the model. Contradictions are reported in the run
    # log; the UI keeps both in sync for new edits.
    pd_kind = o.picture_description_options.kind
    do_picture_description = bool(o.do_picture_description)
    if not do_picture_description and pd_kind != PictureDescriptionKind.DISABLED:
        notes.append(
            f"ℹ VLM backend '{pd_kind.value}' is selected but 'Generate Picture Captions' is OFF — "
            "picture description skipped."
        )

    pc_kind = o.picture_classification_options.kind
    do_picture_classification = bool(o.do_picture_classification)
    if not do_picture_classification and pc_kind != PictureClassificationKind.DISABLED:
        notes.append("ℹ Classification model 'docling' is selected but 'Classify Pictures' is OFF — skipped.")

    ce_kind = o.chart_extraction_options.kind
    do_chart_extraction = bool(o.do_chart_extraction)
    if not do_chart_extraction and ce_kind != ChartExtractionKind.DISABLED:
        notes.append("ℹ Chart extraction model 'docling' is selected but 'Chart Data Extraction' is OFF — skipped.")
    if do_chart_extraction and not do_picture_classification:
        # The chart extractor only processes pictures the classifier labelled
        # as bar/pie/line charts. Docling enables classification internally in
        # this case anyway (pipeline/base_pipeline.py) — we mirror it so the
        # run log states it explicitly.
        do_picture_classification = True
        notes.append("ℹ Picture classification auto-enabled (required by chart extraction).")

    # API-based picture description needs Docling's remote-services guard off.
    enable_remote_services = bool(o.enable_remote_services)
    if do_picture_description and pd_kind == PictureDescriptionKind.API and not enable_remote_services:
        enable_remote_services = True
        notes.append("ℹ enable_remote_services auto-enabled (picture description backend = 'api').")

    # Force AUTO if user chose MPS but enabled VLM models that don't support it
    if selected_device == DAccDevice.MPS and (o.do_code_enrichment or o.do_formula_enrichment or do_picture_description):
        import logging
        logging.getLogger(__name__).warning(
            "MPS is not supported by VLM models (Code/Formula/Picture Description). "
            "Falling back to AUTO so supported models use MPS and VLMs use CPU."
        )
        notes.append("ℹ Device MPS → AUTO (VLM enrichment models pick their own device).")
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

    # Code/formula model: 'granite' → granite_docling preset; 'codeformulav2'
    # or 'disabled' (with a toggle ON) → Docling's default CodeFormulaV2.
    code_formula_opts = CodeFormulaVlmOptions.from_preset("codeformulav2")
    if o.code_formula_options and o.code_formula_options.kind == CodeFormulaKind.GRANITE:
        code_formula_opts = CodeFormulaVlmOptions.from_preset("granite_docling")
    if (o.do_code_enrichment or o.do_formula_enrichment) and o.code_formula_options.kind == CodeFormulaKind.DISABLED:
        notes.append("ℹ Code/formula model is 'disabled' but a toggle is ON — using CodeFormulaV2 (Docling default).")

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
        do_picture_classification=do_picture_classification,
        do_picture_description=do_picture_description,
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

    # Picture description model (previously never passed → always SmolVLM).
    if do_picture_description:
        pipeline_opts.picture_description_options = _build_picture_description_options(
            o.picture_description_options, notes
        )

    # Apply optional or newer fields if supported by installed version
    if artifacts_path:
        pipeline_opts.artifacts_path = artifacts_path
    if o.document_timeout is not None:
        pipeline_opts.document_timeout = o.document_timeout

    # Map missing fields dynamically if they exist on the target version
    optional_fields = {
        "do_chart_extraction": do_chart_extraction,
        "enable_remote_services": enable_remote_services,
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
