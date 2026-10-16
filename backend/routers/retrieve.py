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
Retrieve Router
---------------
API endpoints for query rewriting, retrieval (Step 5),
and GPT-4o answer generation from ranked chunks.
"""
import json
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

# Receives no arguments from GET /api/retrieve/collections (called by the frontend Step 5 /retrieve page).
# Inspects local Qdrant collections, filters out ColPali multi-vector collections, and flags whether each text collection supports hybrid (dense + sparse) search.
# Returns a list of dicts (`name`, `is_hybrid`) to the frontend collection dropdown.
@router.get("/collections")
def get_collections():
    try:
        q_path = _resolve_qdrant_path(str(REPO_ROOT / "qdrant_storage"))
        client = get_qdrant_client(str(q_path))
        cols = client.get_collections().collections
        
        # Determine if hybrid for UI toggles, skipping ColPali multi-vector collections
        results = []
        for c in cols:
            info = client.get_collection(c.name)
            vectors = info.config.params.vectors
            # Skip ColPali multi-vector collections (handled by /api/colpali/collections)
            if isinstance(vectors, dict) and any(
                getattr(v, "multivector_config", None) is not None for v in vectors.values()
            ):
                continue

            has_sparse = bool(
                info.config.params.sparse_vectors and "sparse" in info.config.params.sparse_vectors
            )
            has_dense = False
            if isinstance(vectors, dict) and "dense" in vectors:
                has_dense = True
            elif vectors is not None and not isinstance(vectors, dict):
                has_dense = True
            
            is_hybrid = has_dense and has_sparse
            results.append({"name": c.name, "is_hybrid": is_hybrid})
            
        return results
    except Exception as e:
        logger.error(f"Failed to list collections: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Receives a validated RewriteRequest (`req`) from POST /api/retrieve/rewrite (called by the frontend Step 5 /retrieve page).
# Awaits `services/retriever.py::rewrite_query` to extract concise search keywords via the local Ollama LLM.
# Returns a RewriteResponse containing `rewritten_query` to the frontend.
@router.post("/rewrite", response_model=RewriteResponse)
async def rewrite(req: RewriteRequest):
    rewritten = await rewrite_query(req.query)
    return RewriteResponse(rewritten_query=rewritten)

# Receives a validated RetrieveRequest (`req`) from POST /api/retrieve/run (called by the frontend Step 5 /retrieve page).
# Executes dense, sparse, and fused (RRF/DBSF) vector search against the selected Qdrant collection via `run_retrieval(req)`.
# Returns a RetrieveResponse with query vectors, pre-fusion lists, and final ranked chunks to the frontend.
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
# HOW: The frontend sends the query + chunk texts, we forward them to the LLM
# and stream back JSON-encoded tokens as SSE `data:` frames so embedded newlines
# never split an SSE frame. A final `data: [DONE]` signals completion.
# Receives a validated AnswerRequest (`req`) from POST /api/retrieve/answer (called by `/retrieve`, `/colpali/retrieve`, and `/fusion` pages).
# Invokes `services/answer_generator.py::generate_answer_stream` with the user query, text chunks, and optional page images.
# Returns a FastAPI StreamingResponse that streams JSON-encoded token SSE frames to the frontend.
@router.post("/answer")
def answer(req: AnswerRequest):
    """Stream an LLM-generated answer from the provided chunks via SSE."""
    from services.answer_generator import generate_answer_stream

    # Receives no arguments; iterated by FastAPI's StreamingResponse to stream LLM tokens.
    # Consumes `generate_answer_stream(...)` and wraps each token in `{"token": token}` JSON SSE frames followed by `[DONE]`.
    # Yields SSE strings (`data: ...\n\n`) to the HTTP response stream.
    def sse_stream():
        try:
            for token in generate_answer_stream(
                query=req.query,
                chunks=req.chunks,
                model=req.model,
                image_references=req.image_references,
                prelabeled=req.prelabeled,
            ):
                # JSON-encode token so multi-line tokens (\n) stay inside a single SSE data frame
                yield f"data: {json.dumps({'token': token})}\n\n"
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

