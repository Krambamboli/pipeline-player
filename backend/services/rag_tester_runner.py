# Copyright (C) 2026 olischn
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
RAG Tester Runner
-----------------
Ingests a whole course folder of PDFs into TWO Qdrant collections in one run:

  Text track   (thread A)  Docling parse (N parallel subprocesses, Step 1 profile)
                           → chunk (chunk profile) → dense + sparse embed
                           → <course>_hybrid
  Visual track (thread B)  PDF pages → images → ColQwen2/ColPali multi-vector
                           (ColPali profile, model loaded once) → <course>_colpali

Both tracks run concurrently and push structured events into one queue that
the SSE endpoint drains. Every point in both collections carries the same
document metadata: doc_name, file_path, rel_path, course, doc_source and the
page number(s).

Each run writes a manifest (rag_runs/<run_id>.json) with full copies of the
profiles used, the collections and per-document results for reproducibility.
"""

from __future__ import annotations

import asyncio
import gc
import json
import logging
import queue
import re
import subprocess
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any, AsyncGenerator, Callable, Dict, List, Optional

from models.chunk_schema import ChunkPipelineConfig, EmbeddingMode
from models.colpali_schema import ColPaliProcessProfile
from models.rag_tester_schema import RagTesterRequest

logger = logging.getLogger(__name__)

# ── Paths ─────────────────────────────────────────────────────────────
REPO_ROOT = Path(__file__).resolve().parent.parent.parent
TEST_DATA_DIR = REPO_ROOT / "test_data"
OUTPUTS_DIR = REPO_ROOT / "outputs"
RAG_RUNS_DIR = REPO_ROOT / "rag_runs"
WORKER_SCRIPT = Path(__file__).resolve().parent / "docling_worker.py"

# Pages per Qdrant upsert request for ColPali points (multi-vectors are large)
COLPALI_UPSERT_PAGES = 16


# ---------------------------------------------------------------------------
# Folder discovery helpers
# ---------------------------------------------------------------------------

# Receives a user-supplied `folder_path` string from `scan_folder` or `run_rag_tester`.
# Expands `~`, resolves relative paths against `TEST_DATA_DIR`, and verifies that the target exists and is a directory.
# Returns the resolved `Path` object to `scan_folder` or `run_rag_tester`, or raises `FileNotFoundError` / `NotADirectoryError`.
def resolve_folder(folder_path: str) -> Path:
    """
    Resolve a user-supplied folder path:
      - '~/...'   → expanded home directory
      - absolute  → as is
      - relative  → relative to test_data/
    Raises FileNotFoundError / NotADirectoryError for invalid input.
    """
    raw = (folder_path or "").strip()
    if not raw:
        raise FileNotFoundError("No folder given.")
    p = Path(raw).expanduser()
    if not p.is_absolute():
        p = TEST_DATA_DIR / p
    p = p.resolve()
    if not p.exists():
        raise FileNotFoundError(f"Folder not found: {p}")
    if not p.is_dir():
        raise NotADirectoryError(f"Not a folder: {p}")
    return p


# Receives a folder or file stem `name` and optional `max_len` from `scan_folder`, `_text_track`, or `run_rag_tester`.
# Replaces non-alphanumeric characters with underscores and truncates to `max_len` to produce safe Qdrant collection and run directory names.
# Returns the sanitized slug `str` (defaulting to `"course"` if empty) to the caller.
def slugify(name: str, max_len: int = 48) -> str:
    """Turn a folder name into a safe Qdrant collection name fragment."""
    slug = re.sub(r"[^a-z0-9]+", "_", name.lower()).strip("_")
    return (slug[:max_len].rstrip("_")) or "course"


# Receives a resolved `folder` (`Path`) and `recursive` boolean from `scan_folder` or `run_rag_tester`.
# Globs for `.pdf` files (recursively or top-level only), filtering out hidden files/folders and sorting case-insensitively by relative path.
# Returns a sorted `List[Path]` of PDF files to `scan_folder` or `run_rag_tester`.
def discover_pdfs(folder: Path, recursive: bool) -> List[Path]:
    """Return all PDFs in a folder (optionally recursive), sorted, skipping hidden files."""
    pattern = "**/*" if recursive else "*"
    pdfs = [
        p for p in folder.glob(pattern)
        if p.is_file()
        and p.suffix.lower() == ".pdf"
        and not any(part.startswith(".") for part in p.relative_to(folder).parts)
    ]
    return sorted(pdfs, key=lambda p: str(p.relative_to(folder)).lower())


# Receives a `pdf` (`Path`) from `scan_folder` or `run_rag_tester`.
# Opens the PDF via PyMuPDF (`fitz`) to count its pages for UI previews and progress tracking.
# Returns the integer page count `Optional[int]` (or `None` if the PDF cannot be opened) to the caller.
def _page_count(pdf: Path) -> Optional[int]:
    """Return the page count of a PDF, or None if it cannot be opened."""
    try:
        import fitz  # PyMuPDF
        with fitz.open(str(pdf)) as doc:
            return len(doc)
    except Exception:
        return None


# Receives `folder_path` and `recursive` from `routers/rag_tester.py` (`POST /api/rag-tester/scan`).
# Resolves the folder, discovers all PDFs with their page counts and sizes, and generates default `<slug>_hybrid` and `<slug>_colpali` collection names.
# Returns a folder preview dict (`{"folder", "course", "pdfs", "total_pages", "suggested_hybrid_collection", "suggested_colpali_collection"}`) to `routers/rag_tester.py`.
def scan_folder(folder_path: str, recursive: bool = True) -> Dict[str, Any]:
    """Preview a course folder: PDFs, page counts and suggested collection names."""
    folder = resolve_folder(folder_path)
    pdfs = discover_pdfs(folder, recursive)
    items = []
    for p in pdfs:
        items.append({
            "name": p.name,
            "rel_path": str(p.relative_to(folder)),
            "path": str(p),
            "pages": _page_count(p),
            "size_mb": round(p.stat().st_size / (1024 * 1024), 2),
        })
    slug = slugify(folder.name)
    return {
        "folder": str(folder),
        "course": folder.name,
        "pdfs": items,
        "total_pages": sum(i["pages"] or 0 for i in items),
        "suggested_hybrid_collection": f"{slug}_hybrid",
        "suggested_colpali_collection": f"{slug}_colpali",
    }


# Called with no arguments by `routers/rag_tester.py` (`GET /api/rag-tester/folders`).
# Walks `TEST_DATA_DIR` to find every non-hidden directory that directly contains at least one `.pdf` file so the UI can offer quick-select course folders.
# Returns a `List[Dict[str, Any]]` with each folder's `name`, `rel_path`, `path`, and `pdf_count` to `routers/rag_tester.py`.
def list_course_folders() -> List[Dict[str, Any]]:
    """
    List candidate course folders below test_data/ (every folder that contains
    at least one PDF directly), plus test_data/ itself if it contains PDFs.
    """
    if not TEST_DATA_DIR.exists():
        return []
    candidates = [TEST_DATA_DIR] + sorted(
        (d for d in TEST_DATA_DIR.rglob("*") if d.is_dir() and not d.name.startswith(".")),
        key=lambda d: str(d).lower(),
    )
    result = []
    for d in candidates:
        n = sum(1 for f in d.iterdir() if f.is_file() and f.suffix.lower() == ".pdf")
        if n == 0:
            continue
        rel = "" if d == TEST_DATA_DIR else str(d.relative_to(TEST_DATA_DIR))
        result.append({
            "name": rel or "test_data (root)",
            "rel_path": rel,
            "path": str(d),
            "pdf_count": n,
        })
    return result


# ---------------------------------------------------------------------------
# Run state & cancellation
# ---------------------------------------------------------------------------

# Instantiated by `run_rag_tester` for each discovered PDF in the target folder (`idx`, `path`, `rel_path`, `name`, `pages`).
# Holds immutable per-document file metadata passed to both `_text_track` and `_visual_track`.
# Consumed by `_parse_doc`, `_text_track`, `_visual_track`, `_doc_meta`, and `run_rag_tester`.
@dataclass
class DocItem:
    """One PDF of the course folder."""
    idx: int
    path: Path
    rel_path: str
    name: str
    pages: Optional[int]


# Instantiated by `run_rag_tester` with a unique `run_id` and registered in `_active_runs`.
# Coordinates thread-safe cancellation events (`cancel_event`, `text_stop`) and tracks active `docling_worker.py` subprocesses across the text and visual tracks.
# Consumed by `run_rag_tester`, `_text_track`, `_visual_track`, `_parse_doc`, and `cancel_run`.
@dataclass
class RagRun:
    """Mutable state of an active RAG Tester run (shared between threads)."""
    run_id: str
    cancel_event: threading.Event = field(default_factory=threading.Event)
    text_stop: threading.Event = field(default_factory=threading.Event)
    procs: List[subprocess.Popen] = field(default_factory=list)
    procs_lock: threading.Lock = field(default_factory=threading.Lock)

    # Accessed as a property on `run` by `_parse_doc`, `_text_track`, `_visual_track`, and `run_rag_tester`.
    # Checks whether `self.cancel_event` has been set to signal that the run should abort.
    # Returns a `bool` (`True` if cancelled) to the checking thread or generator.
    @property
    def cancelled(self) -> bool:
        return self.cancel_event.is_set()

    # Called on `self` by `RagRun.cancel` or `_text_track` when aborting.
    # Iterates over `self.procs` under `self.procs_lock` and terminates any still-running `docling_worker.py` child processes.
    # Returns `None` to the caller.
    def kill_procs(self) -> None:
        """Terminate all running Docling subprocesses."""
        with self.procs_lock:
            for p in self.procs:
                if p.poll() is None:
                    try:
                        p.terminate()
                    except Exception:
                        pass

    # Called on `self` by `cancel_run` or `run_rag_tester` (on client disconnect).
    # Sets `self.cancel_event` to stop both tracks and calls `self.kill_procs()` to terminate active Docling subprocesses.
    # Returns `None` to the caller.
    def cancel(self) -> None:
        """Request cancellation of both tracks."""
        self.cancel_event.set()
        self.kill_procs()


_active_runs: Dict[str, RagRun] = {}


# Receives a `run_id` string from `routers/rag_tester.py` (`POST /api/rag-tester/cancel/{run_id}`).
# Looks up the active `RagRun` in `_active_runs` and invokes `run.cancel()` if found.
# Returns `True` if an active run was found and cancelled, or `False` otherwise, to `routers/rag_tester.py`.
def cancel_run(run_id: str) -> bool:
    """Cancel an active run. Returns False if the run is unknown/finished."""
    run = _active_runs.get(run_id)
    if not run:
        return False
    run.cancel()
    return True


# Called with no arguments by `_parse_doc`, `_text_track`, `_visual_track`, and `run_rag_tester`.
# Formats the current local time as `HH:MM:SS` for prefixing live SSE log messages.
# Returns the timestamp `str` to the caller.
def _ts() -> str:
    return datetime.now().strftime("%H:%M:%S")


# Seconds between "still parsing" heartbeat messages per document
HEARTBEAT_SECONDS = 60

# Serialises the one-time warm-up of heavy ML imports across concurrent runs
_ML_IMPORT_LOCK = threading.Lock()


# Receives boolean flags `text` and `visual` from `run_rag_tester` (via `asyncio.to_thread`).
# Imports `torch`, `transformers`, `docling`, `fastembed`, and `sentence_transformers` sequentially under `_ML_IMPORT_LOCK` before worker threads start to prevent thread-unsafe lazy-import races.
# Returns `None` to `run_rag_tester`.
def _warm_ml_imports(text: bool, visual: bool) -> None:
    """
    Import the heavy ML libraries ONCE, sequentially, before the text and
    visual threads start. Python's lazy module machinery (transformers uses a
    _LazyModule) is not safe against two threads importing the same package
    for the first time: one thread may see a half-initialised module. This
    broke docling-core's HuggingFaceTokenizer ("not fully defined") when the
    ColPali model and the chunker were loaded at the same moment.
    """
    with _ML_IMPORT_LOCK:
        import torch  # noqa: F401
        import transformers  # noqa: F401
        from transformers import AutoTokenizer, PreTrainedTokenizerBase  # noqa: F401
        if text:
            import docling_core.transforms.chunker.tokenizer.huggingface  # noqa: F401
            from docling.chunking import HybridChunker  # noqa: F401
            import fastembed  # noqa: F401
        if visual:
            from sentence_transformers import MultiVectorEncoder  # noqa: F401

# Known Docling failure signatures → actionable hint for the user
_KNOWN_ERROR_HINTS = [
    (
        ("cache_position", "create_causal_mask"),
        "Chart extraction model (granite-vision, trust_remote_code) is incompatible with the "
        "installed transformers version. Disable 'Chart extraction' in the Docling profile.",
    ),
]

# Generic wrapper lines that hide the real cause
_GENERIC_ERRORS = ("Pipeline StandardPdfPipeline failed", "Pipeline failed")


# Receives `log_lines` captured from `docling_worker.py` and a `fallback` error string from `_parse_doc`.
# Scans worker stdout lines for the first specific Python `*Error:` / `*Exception:` line (ignoring generic wrapper messages) and appends actionable user hints for known incompatibilities.
# Returns a concise, human-readable error cause `str` to `_parse_doc`.
def _root_cause(log_lines: List[str], fallback: str) -> str:
    """
    Extract the most specific exception line from a worker log (the first
    'XxxError: ...' that is not Docling's generic 'Pipeline ... failed'),
    and append a hint for known failure signatures.
    """
    cause = None
    for line in log_lines:
        stripped = line.strip()
        m = re.match(r"^([A-Za-z_.]*(?:Error|Exception)):\s*(.+)$", stripped)
        if m and not any(g in stripped for g in _GENERIC_ERRORS):
            cause = f"{m.group(1)}: {m.group(2)}"
            break
    text = cause or fallback
    joined = "\n".join(log_lines)
    for needles, hint in _KNOWN_ERROR_HINTS:
        if any(n in joined for n in needles):
            text = f"{text} → {hint}"
            break
    return text


# ---------------------------------------------------------------------------
# Text track
# ---------------------------------------------------------------------------

# Receives `run` (`RagRun`), Docling `profile` name, `doc` (`DocItem`), `out_dir` (`Path`), and event queue callback `put` from `_text_track`'s `ThreadPoolExecutor`.
# Spawns `docling_worker.py --force-json` in a subprocess to parse a single PDF, forwarding progress and heartbeat events via `put` and saving `run.log`.
# Returns `{"ok": bool, "json_path": Path|None, "error": str|None, "seconds": float}` to `_text_track`.
def _parse_doc(run: RagRun, profile: str, doc: DocItem, out_dir: Path, put: Callable) -> Dict[str, Any]:
    """
    Parse one PDF with Docling in a subprocess (docling_worker.py --force-json).
    Returns {"ok": bool, "json_path": Path|None, "error": str|None, "seconds": float}.
    """
    if run.cancelled or run.text_stop.is_set():
        return {"ok": False, "json_path": None, "error": "cancelled", "seconds": 0.0}

    put({"type": "doc", "track": "text", "doc": doc.rel_path, "status": "parsing", "progress": 0})
    out_dir.mkdir(parents=True, exist_ok=True)
    t0 = time.time()
    cmd = [sys.executable, str(WORKER_SCRIPT), profile, str(doc.path), str(out_dir), "--force-json"]
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1)
    with run.procs_lock:
        run.procs.append(proc)

    log_lines: List[str] = []
    # Last human-readable worker line — shown in the heartbeat messages
    last_step = {"msg": "starting"}
    hb_stop = threading.Event()

    # Invoked as the target of daemon thread `hb` inside `_parse_doc` (captures `hb_stop`, `run`, `t0`, `doc`, `last_step`, `put`).
    # Periodically pushes a `"still parsing"` log event every `HEARTBEAT_SECONDS` until `hb_stop` is set so long-running PDF parses show liveness in the UI.
    # Returns `None` when parsing finishes or the run is cancelled.
    def _heartbeat() -> None:
        """Emit a 'still parsing' log every HEARTBEAT_SECONDS so long parses don't look hung."""
        while not hb_stop.wait(HEARTBEAT_SECONDS):
            if run.cancelled:
                return
            mins = (time.time() - t0) / 60
            put({"type": "log", "track": "text",
                 "msg": f"[{_ts()}] ⏳ {doc.name}: still parsing ({mins:.0f} min) — {last_step['msg']}"})

    hb = threading.Thread(target=_heartbeat, name=f"hb-{doc.idx}", daemon=True)
    hb.start()
    try:
        for line in iter(proc.stdout.readline, ""):
            line = line.rstrip()
            if not line:
                continue
            if line.startswith("__PROGRESS__="):
                # Worker emits __PROGRESS__={"percent": n, "message": "..."}
                try:
                    prog = json.loads(line.split("=", 1)[1])
                    pct = int(prog.get("percent", 0))
                    if prog.get("message"):
                        last_step["msg"] = str(prog["message"])[:120]
                    put({"type": "doc", "track": "text", "doc": doc.rel_path, "status": "parsing", "progress": pct})
                except Exception:
                    pass
                continue
            log_lines.append(line)
            # Remember the latest non-traceback line for the heartbeat
            if not line.startswith((" ", "Traceback")):
                last_step["msg"] = line.split("] ", 1)[-1][:120]
            # Forward only the meaningful lines to keep the console readable
            if any(tok in line for tok in ("❌", "⚠", "✓ Conversion", "Pages processed")):
                put({"type": "log", "track": "text", "msg": f"[{_ts()}] 📄 {doc.name}: {line.split('] ', 1)[-1]}"})
        proc.wait()
    finally:
        hb_stop.set()
        with run.procs_lock:
            if proc in run.procs:
                run.procs.remove(proc)
        (out_dir / "run.log").write_text("\n".join(log_lines), encoding="utf-8")

    seconds = time.time() - t0
    if run.cancelled:
        return {"ok": False, "json_path": None, "error": "cancelled", "seconds": seconds}

    json_path = out_dir / "parsed_doc.json"
    res_path = out_dir / "run_result.json"
    status, error = "error", "Docling worker terminated unexpectedly."
    if res_path.exists():
        try:
            res = json.loads(res_path.read_text("utf-8"))
            status = res.get("status", "error")
            error = res.get("error_message") or error
        except Exception:
            pass
    if status == "success" and json_path.exists():
        return {"ok": True, "json_path": json_path, "error": None, "seconds": seconds}
    # Replace Docling's generic wrapper message by the real cause (+ hint)
    return {"ok": False, "json_path": None, "error": _root_cause(log_lines, error), "seconds": seconds}


# Invoked in background thread `rag-text-<run_id>` by `run_rag_tester` with `run`, `req`, `cfg`, `docs`, `collection`, `base_meta`, `run_out_dir`, shared `results`, and queue callback `put`.
# Runs `N` parallel Docling subprocesses via `_parse_doc`, loads the chunker and `fastembed` models once, and chunks, embeds, and upserts each document into `collection` as soon as its parse completes.
# Returns `None` on thread completion while mutating `results` in place and pushing progress/log events to `put` (drained by `run_rag_tester`).
def _text_track(
    run: RagRun,
    req: RagTesterRequest,
    cfg: ChunkPipelineConfig,
    docs: List[DocItem],
    collection: str,
    base_meta: Dict[str, Any],
    run_out_dir: Path,
    results: Dict[str, Dict[str, Any]],
    put: Callable,
) -> None:
    """Docling → chunk → hybrid embed → upsert, for all documents."""
    from docling_core.types.doc.document import DoclingDocument
    from services.chunk_runner import (
        EmbeddingModels, build_chunker, build_points, chunk_document,
        ensure_text_collection, upsert_in_batches,
    )
    from services.qdrant_client_manager import get_qdrant_client, qdrant_write_lock

    # Receives a log message string `msg` from `_text_track`.
    # Prefixes `msg` with the current timestamp (`_ts()`) and pushes a `"text"`-track log event to the shared SSE queue via `put`.
    # Returns `None` to `_text_track`.
    def log(msg: str) -> None:
        put({"type": "log", "track": "text", "msg": f"[{_ts()}] {msg}"})

    # 1) Start Docling parsing right away (N parallel subprocesses) so that the
    #    model loading below overlaps with parsing.
    log(f"🚀 Text track: parsing {len(docs)} PDF(s) with Docling profile "
        f"'{req.docling_profile}' ({req.docling_workers} parallel worker(s))")
    pool = ThreadPoolExecutor(max_workers=req.docling_workers, thread_name_prefix="docling")
    futures = {
        pool.submit(
            _parse_doc, run, req.docling_profile, doc,
            run_out_dir / f"run_{doc.idx:02d}_{slugify(doc.path.stem, 40)}", put,
        ): doc
        for doc in docs
    }

    try:
        # 2) Load chunker + embedding models ONCE
        log(f"✂️  Loading chunker '{cfg.chunker.value}' and embedding models "
            f"({cfg.embedding.mode.value}: {cfg.embedding.dense_model} + {cfg.embedding.sparse_model})...")
        chunker, tokenizer = build_chunker(cfg)
        models = EmbeddingModels(cfg)
        client = get_qdrant_client()
        with qdrant_write_lock:
            ensure_text_collection(client, collection, cfg, models.dense_dim)
        log(f"✅ Collection '{collection}' ready ({models.dense_dim}-dim dense + sparse)")

        # 3) Chunk + embed + upsert each document as soon as its parse finishes
        for fut in as_completed(futures):
            doc = futures[fut]
            res = fut.result()
            entry = results[doc.rel_path]
            entry["text"]["parse_seconds"] = round(res["seconds"], 1)

            if run.cancelled:
                entry["text"].update(status="cancelled")
                continue
            if not res["ok"]:
                entry["text"].update(status="error", error=res["error"])
                put({"type": "doc", "track": "text", "doc": doc.rel_path, "status": "error", "detail": res["error"]})
                log(f"❌ {doc.name}: Docling failed — {res['error']}")
                continue

            try:
                put({"type": "doc", "track": "text", "doc": doc.rel_path, "status": "chunking", "progress": 100})
                dl_doc = DoclingDocument.model_validate_json(res["json_path"].read_text("utf-8"))
                extra = {**base_meta, **_doc_meta(doc, base_meta)}
                texts, payloads, raw = chunk_document(
                    dl_doc, chunker, tokenizer, cfg,
                    run_id=res["json_path"].parent.name, extra_payload=extra,
                )
                if not texts:
                    raise RuntimeError("No non-empty chunks produced.")

                put({"type": "doc", "track": "text", "doc": doc.rel_path, "status": "embedding",
                     "detail": f"{len(texts)} chunks"})
                dense, sparse = models.embed(texts)
                points, nan_skipped = build_points(texts, payloads, dense, sparse, cfg.embedding.mode)
                for _ in upsert_in_batches(client, collection, points):
                    pass

                avg_tok = sum(p.get("token_count", 0) for p in payloads) / len(payloads)
                entry["text"].update(
                    status="done", chunks=len(points), raw_chunks=raw,
                    nan_skipped=nan_skipped, avg_tokens=round(avg_tok, 1),
                )
                put({"type": "doc", "track": "text", "doc": doc.rel_path, "status": "done",
                     "count": len(points), "detail": f"{len(points)} chunks"})
                log(f"✅ {doc.name}: {len(points)} chunks upserted (avg {avg_tok:.0f} tokens)")
            except Exception as exc:
                logger.exception("Text track failed for %s", doc.path)
                entry["text"].update(status="error", error=str(exc))
                put({"type": "doc", "track": "text", "doc": doc.rel_path, "status": "error", "detail": str(exc)})
                log(f"❌ {doc.name}: {exc}")

    except Exception as exc:
        # Fatal error (e.g. model load failed): stop all parsing for this track
        logger.exception("Text track crashed")
        log(f"❌ Text track aborted: {exc}")
        run.text_stop.set()
        run.kill_procs()
        for doc in docs:
            if results[doc.rel_path]["text"]["status"] in ("queued", "parsing"):
                results[doc.rel_path]["text"].update(status="error", error=str(exc))
                put({"type": "doc", "track": "text", "doc": doc.rel_path, "status": "error", "detail": str(exc)})
    finally:
        pool.shutdown(wait=True, cancel_futures=True)
        log("🏁 Text track finished")


# ---------------------------------------------------------------------------
# Visual track
# ---------------------------------------------------------------------------

# Invoked in background thread `rag-visual-<run_id>` by `run_rag_tester` with `run`, ColPali profile `prof`, `docs`, `collection`, `base_meta`, shared `results`, and queue callback `put`.
# Loads the ColPali/ColQwen2 multi-vector model once, renders each PDF's pages in batches at `prof.dpi`, encodes page images into multi-vectors, and upserts them into `collection` before releasing GPU/MPS memory.
# Returns `None` on thread completion while mutating `results` in place and pushing progress/log events to `put` (drained by `run_rag_tester`).
def _visual_track(
    run: RagRun,
    prof: ColPaliProcessProfile,
    docs: List[DocItem],
    collection: str,
    base_meta: Dict[str, Any],
    results: Dict[str, Dict[str, Any]],
    put: Callable,
) -> None:
    """Render pages → ColPali multi-vector embeddings → upsert, document by document."""
    import fitz  # PyMuPDF
    from PIL import Image
    from services.colpali_retriever import _QUERY_MODELS_LOCK
    from services.colpali_runner import ensure_colpali_collection, load_colpali_model, upsert_page_points
    from services.qdrant_client_manager import get_qdrant_client

    # Receives a log message string `msg` from `_visual_track`.
    # Prefixes `msg` with the current timestamp (`_ts()`) and pushes a `"visual"`-track log event to the shared SSE queue via `put`.
    # Returns `None` to `_visual_track`.
    def log(msg: str) -> None:
        put({"type": "log", "track": "visual", "msg": f"[{_ts()}] {msg}"})

    model = None
    try:
        log(f"🚀 Visual track: loading '{prof.model_name}' on {prof.device} "
            f"(ColPali profile '{prof.profile_name}', {prof.dpi} DPI, batch {prof.batch_size})...")
        with _QUERY_MODELS_LOCK:
            model, torch_device = load_colpali_model(prof.model_name, prof.device)
        if torch_device != prof.device:
            log(f"⚠️  {prof.device} not available — using {torch_device}")
        log(f"✅ Model ready on {torch_device}")
        client = get_qdrant_client()
        collection_ready = False

        for doc in docs:
            if run.cancelled:
                break
            entry = results[doc.rel_path]
            t0 = time.time()
            try:
                with fitz.open(str(doc.path)) as pdf:
                    total = len(pdf)
                    n = min(total, prof.max_pages) if prof.max_pages else total
                    embeddings: List = []
                    put({"type": "doc", "track": "visual", "doc": doc.rel_path, "status": "encoding",
                         "progress": 0, "detail": f"0/{n} pages"})
                    # Render + encode batch by batch to keep memory low
                    for start in range(0, n, prof.batch_size):
                        if run.cancelled:
                            break
                        end = min(start + prof.batch_size, n)
                        images = []
                        for i in range(start, end):
                            pix = pdf.load_page(i).get_pixmap(dpi=prof.dpi)
                            mode = "RGBA" if pix.alpha else "RGB"
                            img = Image.frombytes(mode, [pix.width, pix.height], pix.samples)
                            images.append(img.convert("RGB") if mode == "RGBA" else img)
                        with _QUERY_MODELS_LOCK:
                            embs = model.encode_document(images)
                        embeddings.extend(e.tolist() if hasattr(e, "tolist") else e for e in embs)
                        put({"type": "doc", "track": "visual", "doc": doc.rel_path, "status": "encoding",
                             "progress": int(end / n * 100), "detail": f"{end}/{n} pages"})

                if run.cancelled:
                    entry["visual"].update(status="cancelled")
                    break
                if not embeddings:
                    raise RuntimeError("PDF has no pages.")

                if not collection_ready:
                    ensure_colpali_collection(client, collection, len(embeddings[0][0]))
                    collection_ready = True
                    log(f"✅ Collection '{collection}' ready ({len(embeddings[0][0])}-dim multi-vector, MaxSim)")

                payloads = [
                    {
                        **base_meta,
                        **_doc_meta(doc, base_meta),
                        "page_number": i + 1,
                        "chunk_type": "colpali_page",
                        "dpi": prof.dpi,
                        "model": prof.model_name,
                        **prof.metadata,
                    }
                    for i in range(len(embeddings))
                ]
                # Upsert in groups — multi-vector points are large
                for s in range(0, len(embeddings), COLPALI_UPSERT_PAGES):
                    upsert_page_points(client, collection, embeddings[s:s + COLPALI_UPSERT_PAGES],
                                       payloads[s:s + COLPALI_UPSERT_PAGES])

                secs = time.time() - t0
                entry["visual"].update(status="done", pages=len(embeddings), seconds=round(secs, 1))
                put({"type": "doc", "track": "visual", "doc": doc.rel_path, "status": "done",
                     "count": len(embeddings), "detail": f"{len(embeddings)} pages"})
                log(f"✅ {doc.name}: {len(embeddings)} pages encoded in {secs:.0f}s")
            except Exception as exc:
                logger.exception("Visual track failed for %s", doc.path)
                entry["visual"].update(status="error", error=str(exc))
                put({"type": "doc", "track": "visual", "doc": doc.rel_path, "status": "error", "detail": str(exc)})
                log(f"❌ {doc.name}: {exc}")

    except Exception as exc:
        logger.exception("Visual track crashed")
        log(f"❌ Visual track aborted: {exc}")
        for doc in docs:
            if results[doc.rel_path]["visual"]["status"] in ("queued", "encoding"):
                results[doc.rel_path]["visual"].update(status="error", error=str(exc))
                put({"type": "doc", "track": "visual", "doc": doc.rel_path, "status": "error", "detail": str(exc)})
    finally:
        # Release the (large) ColPali model and the MPS/CUDA cache
        del model
        gc.collect()
        try:
            import torch
            if torch.backends.mps.is_available():
                torch.mps.empty_cache()
            elif torch.cuda.is_available():
                torch.cuda.empty_cache()
        except Exception:
            pass
        log("🏁 Visual track finished")


# Receives a `DocItem` (`doc`) and `base_meta` dict from `_text_track` and `_visual_track`.
# Builds the common per-document payload fields (`doc_name`, `doc_source`, `file_path`, `rel_path`) so points in both hybrid and ColPali collections share identical document identifiers.
# Returns the metadata `Dict[str, Any]` to `_text_track` or `_visual_track`.
def _doc_meta(doc: DocItem, base_meta: Dict[str, Any]) -> Dict[str, Any]:
    """Per-document metadata shared by BOTH collections."""
    return {
        "doc_name": doc.name,
        "doc_source": doc.name,          # kept for the existing retrievers / inspector
        "file_path": str(doc.path),
        "rel_path": doc.rel_path,
    }


# ---------------------------------------------------------------------------
# Orchestrator (async generator consumed by the SSE endpoint)
# ---------------------------------------------------------------------------

# Receives a `RagTesterRequest` (`req`) from `routers/rag_tester.py` (`POST /api/rag-tester/run`).
# Validates folder and profile inputs, warms up ML imports, launches `_text_track` and `_visual_track` in background threads, drains their shared event queue, and writes a run manifest to `rag_runs/<run_id>.json`.
# Yields structured SSE event dicts (`start`, `log`, `doc`, `result`) via an `AsyncGenerator` back to `routers/rag_tester.py`.
async def run_rag_tester(req: RagTesterRequest) -> AsyncGenerator[Dict[str, Any], None]:
    """
    Validate the request, start both tracks in background threads and yield
    structured events until both tracks finished. Event types:
      start · log · doc · result
    """
    from services import profile_store
    from services.config_manager import load_profile as load_docling_profile
    from services.qdrant_client_manager import get_qdrant_client, qdrant_write_lock

    t_start = time.time()

    # Receives an error message `msg` from validation checks inside `run_rag_tester`.
    # Formats a terminal `"result"` event with `"status": "error"` so the frontend SSE stream can display the failure reason cleanly.
    # Returns the structured error event `Dict[str, Any]` to `run_rag_tester` to be yielded to `routers/rag_tester.py`.
    def fail(msg: str) -> Dict[str, Any]:
        return {"type": "result", "result": {"status": "error", "error": msg}}

    # ── Validation ────────────────────────────────────────────────────
    if not (req.enable_text_track or req.enable_visual_track):
        yield fail("Enable at least one track (text or visual).")
        return
    try:
        folder = resolve_folder(req.folder_path)
    except Exception as exc:
        yield fail(str(exc))
        return

    pdfs = discover_pdfs(folder, req.recursive)
    if not pdfs:
        yield fail(f"No PDFs found in {folder}")
        return

    try:
        docling_cfg = load_docling_profile(req.docling_profile) if req.enable_text_track else None
        chunk_cfg: Optional[ChunkPipelineConfig] = (
            profile_store.load_profile("chunk", req.chunk_profile) if req.enable_text_track else None
        )
        colpali_prof: Optional[ColPaliProcessProfile] = (
            profile_store.load_profile("colpali", req.colpali_profile) if req.enable_visual_track else None
        )
    except Exception as exc:
        yield fail(f"Profile error: {exc}")
        return

    if chunk_cfg is not None and req.force_hybrid_embedding:
        chunk_cfg.embedding.mode = EmbeddingMode.HYBRID

    slug = slugify(folder.name)
    hybrid_col = req.hybrid_collection.strip() or f"{slug}_hybrid"
    colpali_col = req.colpali_collection.strip() or f"{slug}_colpali"
    if req.enable_text_track and req.enable_visual_track and hybrid_col == colpali_col:
        yield fail("Text and ColPali collection names must differ.")
        return

    # ── Collection conflicts: abort or overwrite ──────────────────────
    client = get_qdrant_client()
    targets = ([hybrid_col] if req.enable_text_track else []) + ([colpali_col] if req.enable_visual_track else [])
    existing = [c for c in targets if client.collection_exists(c)]
    if existing and not req.overwrite:
        yield fail(
            f"Collection(s) already exist: {', '.join(existing)}. "
            f"Enable 'Overwrite' or choose different names."
        )
        return

    run_id = datetime.now().strftime("%Y%m%d_%H%M%S") + f"_{slug[:24]}"
    run = RagRun(run_id=run_id)
    _active_runs[run_id] = run
    events: "queue.Queue[Dict[str, Any]]" = queue.Queue()
    put = events.put

    with qdrant_write_lock:
        for name in existing:
            client.delete_collection(name)
    for name in existing:
        put({"type": "log", "track": "system", "msg": f"[{_ts()}] 🗑️  Deleted existing collection '{name}' (overwrite)"})

    docs = [
        DocItem(idx=i + 1, path=p, rel_path=str(p.relative_to(folder)), name=p.name, pages=_page_count(p))
        for i, p in enumerate(pdfs)
    ]
    results: Dict[str, Dict[str, Any]] = {
        d.rel_path: {
            "name": d.name,
            "pages": d.pages,
            "text": {"status": "queued" if req.enable_text_track else "disabled"},
            "visual": {"status": "queued" if req.enable_visual_track else "disabled"},
        }
        for d in docs
    }
    # Metadata added to every point in BOTH collections
    base_meta: Dict[str, Any] = {"course": folder.name, "rag_run_id": run_id, **req.custom_metadata}
    run_out_dir = OUTPUTS_DIR / f"rag_{run_id}"

    yield {
        "type": "start",
        "run_id": run_id,
        "folder": str(folder),
        "course": folder.name,
        "hybrid_collection": hybrid_col if req.enable_text_track else None,
        "colpali_collection": colpali_col if req.enable_visual_track else None,
        "docs": [{"rel_path": d.rel_path, "name": d.name, "pages": d.pages} for d in docs],
    }

    # ── Preflight warnings for the Docling profile ────────────────────────
    if docling_cfg is not None:
        po = docling_cfg.pdf_options
        if getattr(po, "do_chart_extraction", False):
            put({"type": "log", "track": "system", "msg": (
                f"[{_ts()}] ⚠️  Docling profile '{req.docling_profile}' has Chart extraction enabled. "
                f"Its model is currently incompatible with the installed transformers version — "
                f"documents containing charts will fail. Disable it in Step 1 for reliable runs."
            )})
        heavy = [
            name for name, on in (
                ("chart extraction", getattr(po, "do_chart_extraction", False)),
                ("code enrichment", getattr(po, "do_code_enrichment", False)),
                ("formula enrichment", getattr(po, "do_formula_enrichment", False)),
                ("picture description", getattr(po, "do_picture_description", False)),
                (f"images_scale {getattr(po, 'images_scale', 1)}", (getattr(po, "images_scale", 1) or 1) > 2),
                ("force full-page OCR", getattr(getattr(po, "ocr_options", None), "force_full_page_ocr", False)),
            ) if on
        ]
        if heavy and req.docling_workers > 1:
            put({"type": "log", "track": "system", "msg": (
                f"[{_ts()}] ℹ️  Heavy Docling settings ({', '.join(heavy)}) × {req.docling_workers} workers: "
                f"parsing can take 10–30 min per document. Progress is reported every {HEARTBEAT_SECONDS}s."
            )})

    # ── Warm up ML imports sequentially (avoids concurrent-import races) ──
    yield {"type": "log", "track": "system", "msg": f"[{_ts()}] 📦 Loading ML libraries..."}
    try:
        await asyncio.to_thread(_warm_ml_imports, req.enable_text_track, req.enable_visual_track)
    except Exception as exc:
        logger.exception("ML warm-up import failed")
        _active_runs.pop(run_id, None)
        yield fail(f"Could not import ML libraries: {exc}")
        return

    # ── Start both tracks ─────────────────────────────────────────────
    threads: List[threading.Thread] = []
    if req.enable_text_track:
        threads.append(threading.Thread(
            target=_text_track, name=f"rag-text-{run_id}", daemon=True,
            args=(run, req, chunk_cfg, docs, hybrid_col, base_meta, run_out_dir, results, put),
        ))
    if req.enable_visual_track:
        threads.append(threading.Thread(
            target=_visual_track, name=f"rag-visual-{run_id}", daemon=True,
            args=(run, colpali_prof, docs, colpali_col, base_meta, results, put),
        ))
    for t in threads:
        t.start()

    finished = False
    try:
        # Drain the queue until both tracks are done
        while any(t.is_alive() for t in threads) or not events.empty():
            try:
                while True:
                    yield events.get_nowait()
            except queue.Empty:
                pass
            await asyncio.sleep(0.15)
        finished = True
    finally:
        if not finished:
            # Client disconnected (page closed / reload) → stop the run
            logger.warning("RAG Tester client disconnected — cancelling run %s", run_id)
            run.cancel()
        _active_runs.pop(run_id, None)

    # ── Summary + manifest ────────────────────────────────────────────
    # Receives `track` (`"text"` or `"visual"`) and metric `key` (`"chunks"` or `"pages"`) from `run_rag_tester`.
    # Sums the completed items (`chunks` or `pages`) across all documents in `results` whose track status is `"done"`.
    # Returns the total integer count to `run_rag_tester` for the run summary and manifest.
    def _count(track: str, key: str) -> int:
        return sum(r[track].get(key, 0) for r in results.values() if r[track].get("status") == "done")

    failures = [
        {"doc": rel, "track": track, "error": r[track].get("error", "")}
        for rel, r in results.items()
        for track in ("text", "visual")
        if r[track].get("status") == "error"
    ]
    if run.cancelled:
        status = "cancelled"
    elif failures:
        status = "partial"
    else:
        status = "success"

    summary = {
        "status": status,
        "run_id": run_id,
        "folder": str(folder),
        "course": folder.name,
        "documents": len(docs),
        "hybrid_collection": hybrid_col if req.enable_text_track else None,
        "colpali_collection": colpali_col if req.enable_visual_track else None,
        "total_chunks": _count("text", "chunks"),
        "total_pages": _count("visual", "pages"),
        "failures": failures,
        "elapsed_seconds": round(time.time() - t_start, 1),
    }

    try:
        RAG_RUNS_DIR.mkdir(parents=True, exist_ok=True)
        manifest = {
            **summary,
            "request": req.model_dump(mode="json"),
            "profiles": {
                "docling": docling_cfg.model_dump(mode="json") if docling_cfg else None,
                "chunk": chunk_cfg.model_dump(mode="json") if chunk_cfg else None,
                "colpali": colpali_prof.model_dump(mode="json") if colpali_prof else None,
            },
            "docling_outputs": str(run_out_dir) if req.enable_text_track else None,
            "results": results,
            "finished_at": datetime.now().isoformat(timespec="seconds"),
        }
        (RAG_RUNS_DIR / f"{run_id}.json").write_text(json.dumps(manifest, indent=2, ensure_ascii=False), "utf-8")
    except Exception as exc:
        logger.warning("Could not write RAG Tester manifest: %s", exc)

    yield {"type": "result", "result": summary}
