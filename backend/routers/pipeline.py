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


@router.post("/run")
async def trigger_run(request: RunRequest) -> StreamingResponse:
    """
    Execute the Docling pipeline using the given config profile.
    Returns a Server-Sent Events stream of log lines.

    The client opens an EventSource to this endpoint and receives
    log lines as they are produced by the runner.
    """
    try:
        config = load_profile(request.profile_name)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

    def event_generator():
        """Generator that yields SSE-formatted log lines."""
        result = None
        gen = run_pipeline(config)
        try:
            while True:
                try:
                    line = next(gen)
                    # SSE format: "data: <payload>\n\n"
                    payload = json.dumps({"type": "log", "message": line})
                    yield f"data: {payload}\n\n"
                except StopIteration as e:
                    result = e.value  # The RunResult returned by the generator
                    break
        finally:
            if result:
                _run_history[result.run_id] = result
                # Emit a final "done" event with the run metadata
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
            "X-Accel-Buffering": "no",  # Disable Nginx buffering if behind proxy
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

    media_type = "text/markdown" if filename.endswith(".md") else \
                 "application/json" if filename.endswith(".json") else \
                 "text/plain"

    return StreamingResponse(file_generator(), media_type=media_type)
