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
Retrieve Router
---------------
API endpoints for query rewriting, retrieval (Step 5),
and GPT-4o answer generation from ranked chunks.
"""
import logging
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from models.retrieve_schema import RewriteRequest, RewriteResponse, RetrieveRequest, RetrieveResponse
from models.answer_schema import AnswerRequest
from services.retriever import rewrite_query, run_retrieval
from services.qdrant_client_manager import get_qdrant_client
from services.chunk_runner import _resolve_qdrant_path, REPO_ROOT

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/retrieve", tags=["retrieve"])

@router.get("/collections")
def get_collections():
    try:
        q_path = _resolve_qdrant_path(str(REPO_ROOT / "qdrant_storage"))
        client = get_qdrant_client(str(q_path))
        cols = client.get_collections().collections
        
        # Determine if hybrid for UI toggles
        results = []
        for c in cols:
            info = client.get_collection(c.name)
            has_sparse = False
            if info.config.params.sparse_vectors and "sparse" in info.config.params.sparse_vectors:
                has_sparse = True
            has_dense = False
            if isinstance(info.config.params.vectors, dict) and "dense" in info.config.params.vectors:
                has_dense = True
            elif not isinstance(info.config.params.vectors, dict):
                has_dense = True
            
            is_hybrid = has_dense and has_sparse
            results.append({"name": c.name, "is_hybrid": is_hybrid})
            
        return results
    except Exception as e:
        logger.error(f"Failed to list collections: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/rewrite", response_model=RewriteResponse)
def rewrite(req: RewriteRequest):
    rewritten = rewrite_query(req.query)
    return RewriteResponse(rewritten_query=rewritten)

@router.post("/run", response_model=RetrieveResponse)
def run(req: RetrieveRequest):
    try:
        res = run_retrieval(req)
        return res
    except Exception as e:
        logger.exception("Retrieval failed")
        raise HTTPException(status_code=500, detail=str(e))


# WHY: After retrieval, users want a synthesised answer from the ranked chunks
# rather than reading each chunk individually. We stream tokens via SSE so the
# answer appears in real-time in the UI.
#
# HOW: The frontend sends the query + chunk texts, we forward them to GPT-4o
# and stream back tokens as SSE `data:` frames. A final `data: [DONE]` signals
# completion to the EventSource on the client side.
@router.post("/answer")
def answer(req: AnswerRequest):
    """Stream a GPT-4o generated answer from the provided chunks via SSE."""
    from services.answer_generator import generate_answer_stream

    def sse_stream():
        try:
            for token in generate_answer_stream(
                query=req.query,
                chunks=req.chunks,
                model=req.model,
                image_references=req.image_references,
            ):
                # SSE format: each token as a data line
                yield f"data: {token}\n\n"
            yield "data: [DONE]\n\n"
        except RuntimeError as e:
            # Missing API key or similar config error
            yield f"data: [ERROR] {e}\n\n"
        except Exception as e:
            logger.exception("Answer generation failed")
            yield f"data: [ERROR] {e}\n\n"

    return StreamingResponse(
        sse_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )

