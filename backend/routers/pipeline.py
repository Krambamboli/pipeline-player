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
Pipeline Router
---------------
Endpoints for triggering pipeline runs and retrieving run history.
Uses Server-Sent Events (SSE) to stream live log output to the frontend.
"""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Dict, List

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from models.config_schema import PipelineConfig
from models.run_result import RunResult, RunStatus
from services.config_manager import load_profile
from services.docling_runner import OUTPUTS_DIR, REPO_ROOT, run_pipeline

router = APIRouter(prefix="/api/pipeline", tags=["pipeline"])

# In-memory run history (keyed by run_id). For a production app this would
# be persisted to a database, but for localhost benchmarking in-memory is fine.
_run_history: Dict[str, RunResult] = {}


# Receives `profile_name` and `filename` from POST /api/pipeline/run (called by `useRunStream` in the frontend).
# Validates the request body needed to launch a Step 1 Docling document parsing run.
# Returns a validated RunRequest instance to `trigger_run`.
class RunRequest(BaseModel):
    """Request body for POST /run."""
    profile_name: str = "default"
    filename: str = "test_document.pdf"


# Receives `filename` and `estimated_seconds` computed by `list_documents()`.
# Represents a selectable source document in `test_data/` along with a heuristic runtime estimate.
# Returns a serialized DocumentInfo object in the GET /api/pipeline/documents response to the frontend.
class DocumentInfo(BaseModel):
    filename: str
    estimated_seconds: float


# Receives no arguments from GET /api/pipeline/documents (called by the Step 1 Docling page on load).
# Scans `test_data/` for supported document files (`.pdf`, `.docx`, `.pptx`, `.html`, `.md`) and estimates processing time from file size.
# Returns a sorted list of DocumentInfo objects to the frontend document selector.
@router.get("/documents", response_model=List[DocumentInfo])
async def list_documents() -> List[DocumentInfo]:
    """List available documents in the test_data folder with estimated times."""
    data_dir = REPO_ROOT / "test_data"
    if not data_dir.exists():
        return []
    
    docs = []
    # Assume 10 seconds per MB as a rough heuristic for OCR/Parsing
    SECS_PER_MB = 10.0
    
    for f in data_dir.iterdir():
        if f.is_file() and f.suffix.lower() in [".pdf", ".docx", ".pptx", ".html", ".md"]:
            size_mb = f.stat().st_size / (1024 * 1024)
            # base time of 2s + size dependent time
            est = 2.0 + (size_mb * SECS_PER_MB)
            docs.append(DocumentInfo(filename=f.name, estimated_seconds=round(est, 1)))
            
    docs.sort(key=lambda x: x.filename)
    return docs


# Receives `run_id` path parameter from POST /api/pipeline/run/{run_id}/cancel (called by `useRunStream.cancelRun` in the frontend).
# Terminates the active `docling_worker.py` subprocess for that run via `services/docling_runner.py::cancel_run`.
# Returns `{"status": "cancelled"}` to the frontend (or raises HTTP 404 if the run is not active).
@router.post("/run/{run_id}/cancel")
async def cancel_pipeline_run(run_id: str):
    from services.docling_runner import cancel_run
    success = cancel_run(run_id)
    if not success:
        raise HTTPException(status_code=404, detail="Run not found or already completed.")
    return {"status": "cancelled"}


# Receives a validated RunRequest (`request`) from POST /api/pipeline/run (called by `useRunStream.startRun` in the frontend).
# Loads the requested Docling YAML profile and starts `services/docling_runner.py::run_pipeline` as a live SSE stream.
# Returns a FastAPI StreamingResponse emitting structured JSON SSE frames (`run_id`, `progress`, `log`, `done`) to the frontend.
@router.post("/run")
async def trigger_run(request: RunRequest) -> StreamingResponse:
    """
    Execute the Docling pipeline using the given config profile.
    Returns a Server-Sent Events stream of log lines.
    """
    try:
        config = load_profile(request.profile_name)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

    # Receives no arguments; iterated by FastAPI's StreamingResponse to push SSE events to the client.
    # Consumes `run_pipeline(config, request.filename)`, records the final RunResult in `_run_history`, and guarantees `gen.close()` on disconnect.
    # Yields SSE-formatted JSON strings (`data: {...}\n\n`) to the HTTP stream.
    def event_generator():
        result = None
        gen = run_pipeline(config, request.filename)
        try:
            while True:
                try:
                    line = next(gen)
                    if line.startswith("__RUN_ID__="):
                        run_id = line.split("=", 1)[1]
                        yield f"data: {json.dumps({'type': 'run_id', 'run_id': run_id})}\n\n"
                    elif line.startswith("__PROGRESS__="):
                        prog_json = line.split("=", 1)[1]
                        yield f"data: {json.dumps({'type': 'progress', 'data': json.loads(prog_json)})}\n\n"
                    else:
                        payload = json.dumps({"type": "log", "message": line})
                        yield f"data: {payload}\n\n"
                except StopIteration as e:
                    result = e.value
                    break

            if result:
                _run_history[result.run_id] = result
                payload = json.dumps({
                    "type": "done",
                    "run_id": result.run_id,
                    "status": result.status.value,
                    "duration_seconds": result.duration_seconds,
                    "output_files": result.output_files,
                    "output_dir": result.output_dir,
                    "error_message": result.error_message,
                })
                yield f"data: {payload}\n\n"
        finally:
            # Close the underlying generator so its finally block terminates any running worker
            gen.close()

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


# Receives no arguments from GET /api/pipeline/runs (called by the Step 1 Docling page to populate RunHistory).
# Sorts the in-memory `_run_history` dictionary by `started_at` descending.
# Returns a list of RunResult objects to the frontend.
@router.get("/runs", response_model=List[RunResult])
async def list_runs() -> List[RunResult]:
    """Return all run results from the in-memory history, newest first."""
    return sorted(
        _run_history.values(),
        key=lambda r: r.started_at,
        reverse=True,
    )


# Receives a `run_id` path parameter from GET /api/pipeline/run/{run_id}.
# Looks up the specified run's metadata record in `_run_history`.
# Returns the matching RunResult object to the caller (or raises HTTP 404).
@router.get("/run/{run_id}", response_model=RunResult)
async def get_run(run_id: str) -> RunResult:
    """Get a specific run result by ID."""
    if run_id not in _run_history:
        raise HTTPException(status_code=404, detail=f"Run '{run_id}' not found.")
    return _run_history[run_id]


# Receives `run_id` and `filename` path parameters from GET /api/pipeline/run/{run_id}/file/{filename} (called by OutputViewer in the frontend).
# Validates against path traversal and streams the requested output artifact (`parsed_doc.html`, `.md`, `.json`, etc.) from `outputs/run_{run_id}/`.
# Returns a StreamingResponse with the appropriate content-type header to the frontend OutputViewer.
@router.get("/run/{run_id}/file/{filename}")
async def get_run_file(run_id: str, filename: str) -> StreamingResponse:
    """Stream the content of a specific output file from a run directory."""
    # Disallow path separators in run_id
    if "/" in run_id or "\\" in run_id or ".." in run_id:
        raise HTTPException(status_code=403, detail="Invalid run_id.")
    run_dir = (OUTPUTS_DIR / f"run_{run_id}").resolve()
    try:
        run_dir.relative_to(OUTPUTS_DIR.resolve())
    except ValueError:
        raise HTTPException(status_code=403, detail="Path traversal not allowed.")

    file_path = (run_dir / filename).resolve()

    # Security: only allow files strictly within the specific run_dir
    try:
        file_path.relative_to(run_dir)
    except ValueError:
        raise HTTPException(status_code=403, detail="Path traversal not allowed.")

    if not file_path.is_file():
        raise HTTPException(status_code=404, detail=f"File '{filename}' not found in run {run_id}.")

    # Receives no arguments; invoked by FastAPI's StreamingResponse to read `file_path` in binary chunks.
    # Streams the output file from disk without loading the entire file into memory at once.
    # Yields raw `bytes` chunks to the HTTP response stream.
    def file_generator():
        with open(file_path, "rb") as f:
            yield from f

    media_type = (
        "text/html"       if filename.endswith(".html") else
        "text/markdown"   if filename.endswith(".md")   else
        "application/json" if filename.endswith(".json") else
        "text/plain"
    )

    return StreamingResponse(file_generator(), media_type=media_type)
