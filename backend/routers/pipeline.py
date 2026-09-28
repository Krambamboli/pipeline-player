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


class RunRequest(BaseModel):
    """Request body for POST /run."""
    profile_name: str = "default"
    filename: str = "test_document.pdf"


class DocumentInfo(BaseModel):
    filename: str
    estimated_seconds: float


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


@router.post("/run/{run_id}/cancel")
async def cancel_pipeline_run(run_id: str):
    from services.docling_runner import cancel_run
    success = cancel_run(run_id)
    if not success:
        raise HTTPException(status_code=404, detail="Run not found or already completed.")
    return {"status": "cancelled"}


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
        finally:
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

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/runs", response_model=List[RunResult])
async def list_runs() -> List[RunResult]:
    """Return all run results from the in-memory history, newest first."""
    return sorted(
        _run_history.values(),
        key=lambda r: r.started_at,
        reverse=True,
    )


@router.get("/run/{run_id}", response_model=RunResult)
async def get_run(run_id: str) -> RunResult:
    """Get a specific run result by ID."""
    if run_id not in _run_history:
        raise HTTPException(status_code=404, detail=f"Run '{run_id}' not found.")
    return _run_history[run_id]


@router.get("/run/{run_id}/file/{filename}")
async def get_run_file(run_id: str, filename: str) -> StreamingResponse:
    """Stream the content of a specific output file from a run directory."""
    run_dir = OUTPUTS_DIR / f"run_{run_id}"
    file_path = run_dir / filename

    # Security: only allow files within the run directory
    try:
        file_path.resolve().relative_to(OUTPUTS_DIR.resolve())
    except ValueError:
        raise HTTPException(status_code=403, detail="Path traversal not allowed.")

    if not file_path.exists():
        raise HTTPException(status_code=404, detail=f"File '{filename}' not found in run {run_id}.")

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
