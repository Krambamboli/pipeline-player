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
RAG Tester Router
-----------------
Routes:
  GET  /api/rag-tester/folders          — course folder candidates below test_data/
  POST /api/rag-tester/scan             — preview PDFs (+ page counts) of any folder
  POST /api/rag-tester/run              — start a run (SSE stream of JSON events)
  POST /api/rag-tester/cancel/{run_id}  — cancel an active run
  GET  /api/rag-tester/runs             — past run manifests (summary only)
"""

from __future__ import annotations

import json
import logging
from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from models.rag_tester_schema import FolderScanRequest, RagTesterRequest
from services.rag_tester_runner import (
    RAG_RUNS_DIR,
    cancel_run,
    list_course_folders,
    run_rag_tester,
    scan_folder,
)

router = APIRouter(prefix="/api/rag-tester", tags=["rag-tester"])
logger = logging.getLogger(__name__)


@router.get("/folders")
def get_folders() -> List[Dict[str, Any]]:
    """List folders below test_data/ that contain PDFs."""
    return list_course_folders()


@router.post("/scan")
def post_scan(req: FolderScanRequest) -> Dict[str, Any]:
    """Preview the PDFs of a folder with page counts and suggested collection names."""
    try:
        return scan_folder(req.folder_path, req.recursive)
    except (FileNotFoundError, NotADirectoryError) as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@router.post("/run")
async def post_run(req: RagTesterRequest) -> StreamingResponse:
    """Start a RAG Tester run. Streams JSON events as Server-Sent Events."""

    async def sse():
        try:
            async for evt in run_rag_tester(req):
                yield f"data: {json.dumps(evt, ensure_ascii=False)}\n\n"
        except Exception as exc:
            logger.exception("RAG Tester run crashed")
            err = {"type": "result", "result": {"status": "error", "error": str(exc)}}
            yield f"data: {json.dumps(err)}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        sse(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.post("/cancel/{run_id}")
def post_cancel(run_id: str) -> Dict[str, str]:
    """Cancel an active run (kills Docling subprocesses, stops ColPali loop)."""
    if not cancel_run(run_id):
        raise HTTPException(status_code=404, detail=f"No active run '{run_id}'.")
    return {"message": f"Cancellation requested for '{run_id}'."}


@router.get("/runs")
def get_runs() -> List[Dict[str, Any]]:
    """Return summaries of past runs (newest first), without the large profile copies."""
    runs = []
    if not RAG_RUNS_DIR.exists():
        return runs
    for f in sorted(RAG_RUNS_DIR.glob("*.json"), reverse=True):
        try:
            data = json.loads(f.read_text("utf-8"))
            data.pop("profiles", None)
            data.pop("results", None)
            runs.append(data)
        except Exception:
            continue
    return runs
