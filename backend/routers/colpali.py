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
ColPali Router
---------------
API endpoints for the ColPali visual document retrieval pipeline.

Endpoints:
  GET  /api/colpali/pdfs       — List available PDFs from test_data/
  POST /api/colpali/run        — Start ColPali pipeline (SSE stream)
  POST /api/colpali/retrieve   — MaxSim retrieval query
"""

import logging
from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from models.colpali_schema import ColPaliConfig, ColPaliRetrieveRequest, ColPaliRetrieveResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/colpali", tags=["colpali"])

# Root paths
REPO_ROOT = Path(__file__).resolve().parent.parent.parent
TEST_DATA_DIR = REPO_ROOT / "test_data"


# Receives no arguments from GET /api/colpali/pdfs (called by the frontend /colpali page).
# Scans `test_data/` for `.pdf` files and computes their file size in megabytes for selection in the UI.
# Returns a list of dicts (`name`, `path`, `size_mb`) to the frontend.
@router.get("/pdfs")
def list_pdfs():
    """List available PDF files from the test_data/ directory."""
    if not TEST_DATA_DIR.exists():
        return []

    pdfs = []
    for f in sorted(TEST_DATA_DIR.iterdir()):
        if f.suffix.lower() == ".pdf":
            size_mb = f.stat().st_size / (1024 * 1024)
            pdfs.append({
                "name": f.name,
                "path": str(f),
                "size_mb": round(size_mb, 2),
            })
    return pdfs


# Receives a validated ColPaliConfig (`cfg`) from POST /api/colpali/run (called by `runColPali` in `frontend/src/lib/colpali.ts`).
# Initiates the visual page rasterization and ColQwen2/ColPali multi-vector indexing pipeline.
# Returns a FastAPI StreamingResponse that streams live SSE log and progress events to the frontend.
@router.post("/run")
async def run_pipeline(cfg: ColPaliConfig):
    """
    Start the ColPali pipeline and stream progress via SSE.

    The pipeline converts PDF pages to images, encodes them with
    ColQwen2/ColPali, and upserts multi-vector embeddings to Qdrant.
    """
    from services.colpali_runner import run_colpali_pipeline

    # Receives no arguments; consumed asynchronously by FastAPI's StreamingResponse.
    # Iterates over `run_colpali_pipeline(...)` and wraps each emitted status/progress line in an SSE data frame.
    # Yields SSE strings (`data: ...\n\n`) to the client browser.
    async def sse_stream():
        try:
            async for line in run_colpali_pipeline(
                pdf_path=cfg.pdf_path,
                model_name=cfg.model_name,
                device=cfg.device,
                batch_size=cfg.batch_size,
                dpi=cfg.dpi,
                max_pages=cfg.max_pages,
                metadata=cfg.metadata,
                collection_name=cfg.collection_name,
                qdrant_storage_path=cfg.qdrant_storage_path,
            ):
                yield f"data: {line}\n\n"
        except Exception as e:
            logger.exception("ColPali pipeline failed")
            yield f"data: [ERROR] {e}\n\n"

    return StreamingResponse(
        sse_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


# Receives a ColPaliRetrieveRequest (`req`) from POST /api/colpali/retrieve (called by the frontend /colpali/retrieve page).
# Delegates late-interaction MaxSim query encoding and Qdrant multi-vector search to `services/colpali_retriever.py`.
# Returns a ColPaliRetrieveResponse containing ranked PDF pages and scores to the frontend.
@router.post("/retrieve", response_model=ColPaliRetrieveResponse)
def retrieve(req: ColPaliRetrieveRequest):
    """Run MaxSim retrieval against a ColPali collection."""
    try:
        from services.colpali_retriever import run_colpali_retrieval
        return run_colpali_retrieval(
            collection_name=req.collection_name,
            query=req.query,
            limit=req.limit,
        )
    except Exception as e:
        logger.exception("ColPali retrieval failed")
        raise HTTPException(status_code=500, detail=str(e))
