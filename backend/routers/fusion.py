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
Fusion Router
-------------
Routes:
  GET    /api/fusion/collections           — text + ColPali collections (with detected models)
  GET    /api/fusion/embedding-models      — dense/sparse query models supported by fastembed
  POST   /api/fusion/search                — parallel hybrid (RRF/DBSF) + MaxSim search
  POST   /api/fusion/rerank                — run the user reranker on cached hits
  GET    /api/fusion/page-image            — PNG thumbnail of a PDF page
  GET    /api/fusion/default-script        — built-in RRF reranker
  GET    /api/fusion/scripts               — list saved reranker scripts
  GET    /api/fusion/scripts/{name}        — load a script
  PUT    /api/fusion/scripts/{name}        — save a script
  DELETE /api/fusion/scripts/{name}        — delete a script
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException, Query
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import Response

from models.fusion_schema import FusionSearchRequest, RerankRequest, RerankScript
from services import fusion_retriever, reranker_sandbox

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/fusion", tags=["fusion"])


def _http_error(exc: Exception) -> HTTPException:
    """Map service exceptions to HTTP status codes."""
    if isinstance(exc, FileNotFoundError):
        return HTTPException(status_code=404, detail=str(exc))
    if isinstance(exc, (ValueError, SyntaxError)):
        return HTTPException(status_code=400, detail=str(exc))
    return HTTPException(status_code=500, detail=str(exc))


@router.get("/collections")
def collections() -> Dict[str, List[Dict[str, Any]]]:
    try:
        return fusion_retriever.list_fusion_collections()
    except Exception as exc:
        raise _http_error(exc)


@router.get("/embedding-models")
def embedding_models() -> Dict[str, List[Dict[str, Any]]]:
    """Options for the dense/sparse override dropdowns (from fastembed itself)."""
    try:
        return fusion_retriever.list_embedding_models()
    except Exception as exc:
        raise _http_error(exc)


@router.post("/search")
async def search(req: FusionSearchRequest) -> Dict[str, Any]:
    """Both searches run in a worker thread (model loading can take ~20 s once)."""
    if not (req.text_collection or req.colpali_collection):
        raise HTTPException(status_code=400, detail="Select at least one collection.")
    text_opts = {
        "dense_override": req.dense_model_override,
        "sparse_override": req.sparse_model_override,
        "fusion": req.text_fusion,
        "rrf_k": req.rrf_k,
        "dense_weight": req.dense_weight,
        "sparse_weight": req.sparse_weight,
    }
    try:
        return await run_in_threadpool(
            fusion_retriever.run_fusion_search,
            req.query, req.text_collection, req.colpali_collection,
            req.text_limit, req.colpali_limit, text_opts,
        )
    except Exception as exc:
        logger.exception("Fusion search failed")
        raise _http_error(exc)


@router.post("/rerank")
async def rerank(req: RerankRequest) -> Dict[str, Any]:
    """Errors in the user code are returned as {ok: false, error, line} (HTTP 200)."""
    return await run_in_threadpool(reranker_sandbox.run_reranker, req.code, req.text_hits, req.colpali_hits, req.k)


@router.get("/page-image")
def page_image(file_path: str = Query(...), page: int = Query(..., ge=1), dpi: int = Query(72)) -> Response:
    try:
        png = fusion_retriever.render_page_png(file_path, page, dpi)
    except Exception as exc:
        raise _http_error(exc)
    return Response(content=png, media_type="image/png", headers={"Cache-Control": "max-age=3600"})


@router.get("/default-script")
def default_script() -> Dict[str, str]:
    return {"code": reranker_sandbox.DEFAULT_SCRIPT}


@router.get("/scripts", response_model=List[str])
def list_scripts() -> List[str]:
    return reranker_sandbox.list_scripts()


@router.get("/scripts/{name}")
def get_script(name: str) -> Dict[str, str]:
    try:
        return {"name": name, "code": reranker_sandbox.load_script(name)}
    except Exception as exc:
        raise _http_error(exc)


@router.put("/scripts/{name}")
def put_script(name: str, body: RerankScript) -> Dict[str, str]:
    try:
        reranker_sandbox.save_script(name, body.code)
        return {"message": f"Reranker script '{name}' saved."}
    except SyntaxError as exc:
        raise HTTPException(status_code=400, detail=f"Syntax error in line {exc.lineno}: {exc.msg}")
    except Exception as exc:
        raise _http_error(exc)


@router.delete("/scripts/{name}")
def delete_script(name: str) -> Dict[str, str]:
    try:
        reranker_sandbox.delete_script(name)
        return {"message": f"Reranker script '{name}' deleted."}
    except Exception as exc:
        raise _http_error(exc)
