"""
Qdrant Browser Router
---------------------
Read-only endpoints for browsing the local Qdrant vector DB.
Used by the Vector DB Inspector in the frontend.

Routes:
  GET    /api/qdrant/collections                        — List collections with stats
  GET    /api/qdrant/collections/{name}/points          — Paginated points with metadata
  GET    /api/qdrant/collections/{name}/stats           — Collection stats
  DELETE /api/qdrant/collections/{name}                 — Delete a collection
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Query

from services.qdrant_client_manager import get_qdrant_client

router = APIRouter(prefix="/api/qdrant", tags=["qdrant"])
logger = logging.getLogger(__name__)


# Thin wrapper so callers inside this module can pass storage_path optionally
def _get_client(storage_path: str = ""):
    """Return the shared singleton Qdrant client."""
    return get_qdrant_client(storage_path)


# ---------------------------------------------------------------------------
# GET /api/qdrant/collections
# ---------------------------------------------------------------------------

@router.get("/collections")
def list_collections(storage_path: str = "") -> List[Dict[str, Any]]:
    """List all Qdrant collections with their point counts and vector config."""
    try:
        client = _get_client(storage_path)
        collections = client.get_collections().collections
    except Exception as exc:
        logger.warning("Qdrant not available: %s", exc)
        return []

    result = []
    for col in collections:
        try:
            info = client.get_collection(col.name)
            # Extract vector config summary
            vectors_cfg = {}
            if hasattr(info.config.params, "vectors"):
                vc = info.config.params.vectors
                if isinstance(vc, dict):
                    vectors_cfg = {k: {"size": v.size, "distance": str(v.distance)} for k, v in vc.items() if hasattr(v, "size")}
                elif hasattr(vc, "size"):
                    vectors_cfg = {"default": {"size": vc.size, "distance": str(vc.distance)}}

            sparse_cfg = {}
            if hasattr(info.config.params, "sparse_vectors") and info.config.params.sparse_vectors:
                sparse_cfg = list(info.config.params.sparse_vectors.keys())

            # points_count can be None for hybrid collections while the optimizer
            # is still running. Fall back to count_points() for an exact number.
            points_count = info.points_count
            if points_count is None:
                try:
                    count_result = client.count(collection_name=col.name, exact=True)
                    points_count = count_result.count
                except Exception:
                    points_count = 0

            # Detect multi-vector configuration (ColPali collections)
            is_multivector = False
            if isinstance(info.config.params.vectors, dict):
                for vec_cfg in info.config.params.vectors.values():
                    if hasattr(vec_cfg, "multivector_config") and vec_cfg.multivector_config:
                        is_multivector = True
                        break

            result.append({
                "name": col.name,
                "points_count": points_count,
                "vectors_count": getattr(info, "vectors_count", getattr(info, "indexed_vectors_count", 0)),
                "dense_vectors": vectors_cfg,
                "sparse_vectors": sparse_cfg,
                "status": str(info.status),
                "is_multivector": is_multivector,
            })
        except Exception as exc:
            result.append({"name": col.name, "error": str(exc)})

    return result


# ---------------------------------------------------------------------------
# GET /api/qdrant/collections/{name}/points
# ---------------------------------------------------------------------------

@router.get("/collections/{name}/points")
def get_points(
    name: str,
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    storage_path: str = "",
    with_vectors: bool = Query(default=False),
) -> Dict[str, Any]:
    """
    Return paginated points from a collection.
    Each point includes chunk_text, metadata payload, token_count,
    and optionally a truncated vector preview.
    """
    try:
        client = _get_client(storage_path)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Qdrant error: {exc}")

    try:
        # Use scroll for pagination
        points, next_offset = client.scroll(
            collection_name=name,
            offset=offset or None,
            limit=limit,
            with_payload=True,
            with_vectors=with_vectors,
        )
    except Exception as exc:
        raise HTTPException(status_code=404, detail=f"Collection '{name}' not found or error: {exc}")

    serialized = []
    for pt in points:
        payload = pt.payload or {}

        # Build a vector preview (first 8 dims for dense, top tokens for sparse)
        vector_preview: Dict[str, Any] = {}
        if with_vectors and pt.vector is not None:
            vec = pt.vector
            if isinstance(vec, dict):
                for vec_name, v in vec.items():
                    if hasattr(v, "indices"):
                        # Sparse: top 10 by abs value
                        pairs = sorted(
                            zip(v.indices, v.values),
                            key=lambda x: abs(x[1]),
                            reverse=True,
                        )[:10]
                        vector_preview[vec_name] = {
                            "type": "sparse",
                            "top_terms": [{"index": i, "value": round(float(v2), 4)} for i, v2 in pairs],
                        }
                    elif isinstance(v, list):
                        vector_preview[vec_name] = {
                            "type": "dense",
                            "dims": len(v),
                            "preview": [round(x, 4) for x in v[:8]],
                        }
            elif isinstance(vec, list):
                vector_preview["default"] = {
                    "type": "dense",
                    "dims": len(vec),
                    "preview": [round(x, 4) for x in vec[:8]],
                }

        serialized.append({
            "id": str(pt.id),
            "chunk_text": payload.get("chunk_text", ""),
            "embedded_text": payload.get("embedded_text", ""),
            "chunk_index": payload.get("chunk_index", -1),
            "token_count": payload.get("token_count", None),
            "headings": payload.get("headings", []),
            "page_numbers": payload.get("page_numbers", []),
            "element_types": payload.get("element_types", []),
            "doc_source": payload.get("doc_source", ""),
            "run_id": payload.get("run_id", ""),
            "extra_payload": {
                k: v for k, v in payload.items()
                if k not in {"chunk_text", "embedded_text", "chunk_index", "token_count",
                             "headings", "page_numbers", "element_types", "doc_source", "run_id"}
            },
            "vector_preview": vector_preview,
        })

    return {
        "collection": name,
        "points": serialized,
        "offset": offset,
        "limit": limit,
        "has_more": next_offset is not None,
        "next_offset": str(next_offset) if next_offset else None,
    }


# ---------------------------------------------------------------------------
# GET /api/qdrant/collections/{name}/stats
# ---------------------------------------------------------------------------

@router.get("/collections/{name}/stats")
def collection_stats(name: str, storage_path: str = "") -> Dict[str, Any]:
    """Return detailed stats for a collection."""
    try:
        client = _get_client(storage_path)
        info = client.get_collection(name)
    except Exception as exc:
        raise HTTPException(status_code=404, detail=str(exc))

    return {
        "name": name,
        "points_count": info.points_count,
        "vectors_count": getattr(info, "vectors_count", getattr(info, "indexed_vectors_count", 0)),
        "indexed_vectors_count": info.indexed_vectors_count,
        "status": str(info.status),
        "optimizer_status": str(info.optimizer_status),
        "config": info.config.model_dump(mode="json") if hasattr(info.config, "model_dump") else {},
    }


# ---------------------------------------------------------------------------
# DELETE /api/qdrant/collections/{name}
# ---------------------------------------------------------------------------

@router.delete("/collections/{name}")
def delete_collection(name: str, storage_path: str = "") -> Dict[str, str]:
    """Delete a Qdrant collection by name."""
    try:
        client = _get_client(storage_path)
        client.delete_collection(name)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    return {"deleted": name}
