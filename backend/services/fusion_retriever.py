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
Fusion Retriever
----------------
Runs ONE query against two collections built from the same documents:

  * text collection (dense + sparse)  → Qdrant RRF hybrid search → top-N chunks
  * ColPali collection (multi-vector) → MaxSim                   → top-N pages

Both searches run in parallel. The hits are normalised into plain dicts so a
user-written reranker (services/reranker_sandbox.py) can fuse them.

Query embedding models:
  * Text: read from the point payload ("dense_model"/"sparse_model", stored
    since the Fusion Retriever was added), else from the RAG Tester manifest
    (rag_runs/*.json), else guessed from the vector dimension.
  * ColPali: read from the point payload ("model").
Models are cached in memory after the first query.

Text fusion (dense + sparse lists of the text collection):
  * "rrf"  — Reciprocal Rank Fusion with constant k and optional per-list weights
  * "dbsf" — Distribution-Based Score Fusion (scores normalised with mean ± 3σ)
  * "dense" / "sparse" — a single retriever
The fused ranking itself is computed by Qdrant. In addition, every hit gets
the share of its fused score that came from the dense and from the sparse
list ("dense_contrib"/"sparse_contrib"/"dense_share"/"driver"), recomputed
with the same formulas as qdrant-client (qdrant_client/hybrid/fusion.py).

References:
  https://qdrant.tech/documentation/concepts/hybrid-queries/
  https://qdrant.tech/documentation/concepts/vectors/#multivectors
  https://github.com/qdrant/qdrant-client/blob/master/qdrant_client/hybrid/fusion.py
  https://qdrant.github.io/fastembed/examples/Supported_Models/
"""

from __future__ import annotations

import json
import logging
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from services.qdrant_client_manager import get_qdrant_client

logger = logging.getLogger(__name__)

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
TEST_DATA_DIR = REPO_ROOT / "test_data"
RAG_RUNS_DIR = REPO_ROOT / "rag_runs"

# Fallback when a collection carries no model information (legacy collections)
_DIM_MODEL_MAP = {
    384: "BAAI/bge-small-en-v1.5",
    768: "jinaai/jina-embeddings-v2-base-de",
    1024: "intfloat/multilingual-e5-large",
}


# Receives a dense vector dimension `dim` from `detect_text_models` or `services/retriever.py` (`run_retrieval`).
# Infers the likely `fastembed` dense model name for legacy collections lacking payload/manifest metadata, checking the local `~/.cache/fastembed` directory for 768-dim models.
# Returns the guessed model name `Optional[str]` (or `None` if `dim` is falsy) to the calling model detector or retriever.
def _guess_dense_model_by_dim(dim: Optional[int]) -> Optional[str]:
    """
    Guess the dense embedding model for a legacy collection without payload metadata.
    For 768d, prefers 'jinaai/jina-embeddings-v2-base-de' if present in the local
    fastembed cache (or as default), else falls back to paraphrase-multilingual-mpnet-base-v2
    if only that model is cached.
    """
    if not dim:
        return None
    if dim == 768:
        import os
        cache_dir = Path(os.environ.get("FASTEMBED_CACHE_PATH", str(Path.home() / ".cache" / "fastembed")))
        jina_dir = cache_dir / "models--jinaai--jina-embeddings-v2-base-de"
        mpnet_dir = cache_dir / "models--sentence-transformers--paraphrase-multilingual-mpnet-base-v2"
        if mpnet_dir.exists() and not jina_dir.exists():
            return "sentence-transformers/paraphrase-multilingual-mpnet-base-v2"
        return "jinaai/jina-embeddings-v2-base-de"
    return _DIM_MODEL_MAP.get(dim, "BAAI/bge-small-en-v1.5")

# fastembed model caches (loading takes seconds; keep them for the session)
_DENSE: Dict[str, Any] = {}
_SPARSE: Dict[str, Any] = {}
_EMBED_LOCK = threading.Lock()

# Serialises first-time imports of heavy ML libs (concurrent first imports of
# transformers in two threads can leave half-initialised modules behind).
_IMPORT_LOCK = threading.Lock()


# ---------------------------------------------------------------------------
# Collection inspection
# ---------------------------------------------------------------------------

# Receives the shared `client` (`QdrantClient`) and `collection` name from `list_fusion_collections`, `detect_text_models`, or `search_colpali`.
# Scrolls a single point from the Qdrant collection without vectors so callers can inspect stored payload metadata (such as `"dense_model"`, `"sparse_model"`, or `"model"`).
# Returns the first point's payload `Dict[str, Any]` (or `{}` if empty or on error) to the caller.
def _first_payload(client, collection: str) -> Dict[str, Any]:
    """Payload of one point (used to detect models and fields)."""
    try:
        pts = client.scroll(collection_name=collection, limit=1, with_payload=True, with_vectors=False)[0]
        return (pts[0].payload or {}) if pts else {}
    except Exception:
        return {}


# Receives a `QdrantClient` (`client`) and collection `name` from `list_fusion_collections`, `detect_text_models`, or `search_text`.
# Inspects the Qdrant collection's vector configuration to classify whether it is a `"text"` (dense/sparse), `"colpali"` (multi-vector), or `"other"` collection.
# Returns a metadata dict (`{"name", "kind", "points", "has_sparse", "dense_dim"}`) to the calling function.
def classify_collection(client, name: str) -> Dict[str, Any]:
    """Return {name, kind: text|colpali|other, points, ...} for the UI."""
    info = client.get_collection(name)
    params = info.config.params
    vectors = params.vectors
    kind = "other"
    dense_dim = None
    if isinstance(vectors, dict):
        if "colpali" in vectors and getattr(vectors["colpali"], "multivector_config", None) is not None:
            kind = "colpali"
        elif "dense" in vectors:
            kind = "text"
            dense_dim = vectors["dense"].size
    elif vectors is not None:
        kind = "text"
        dense_dim = vectors.size
    has_sparse = bool(params.sparse_vectors and "sparse" in params.sparse_vectors)
    if kind == "other" and has_sparse:
        kind = "text"
    return {
        "name": name,
        "kind": kind,
        "points": info.points_count or 0,
        "has_sparse": has_sparse,
        "dense_dim": dense_dim,
    }


# Called with no arguments by `routers/fusion.py` (`GET /api/fusion/collections`) and `routers/rag_chat.py`.
# Iterates over all Qdrant collections, classifies each into `"text"` or `"colpali"`, and attaches the detected embedding model names so the UI can populate collection selectors.
# Returns `{"text": [...], "colpali": [...]}` sorted by collection name to the calling router.
def list_fusion_collections() -> Dict[str, List[Dict[str, Any]]]:
    """Split all collections into text and ColPali collections (+ detected models)."""
    client = get_qdrant_client()
    text, colpali = [], []
    for c in client.get_collections().collections:
        try:
            meta = classify_collection(client, c.name)
        except Exception as exc:
            logger.warning("Cannot inspect collection %s: %s", c.name, exc)
            continue
        if meta["kind"] == "text":
            dense, sparse, src = detect_text_models(client, c.name, meta)
            text.append({**meta, "dense_model": dense, "sparse_model": sparse, "model_source": src})
        elif meta["kind"] == "colpali":
            colpali.append({**meta, "model": _first_payload(client, c.name).get("model", "vidore/colqwen2-v1.0")})
    return {"text": sorted(text, key=lambda x: x["name"]), "colpali": sorted(colpali, key=lambda x: x["name"])}


# Receives a `collection` name string from `detect_text_models`.
# Scans `rag_runs/*.json` manifests (newest first) to recover the `(dense_model, sparse_model)` used when a RAG Tester run created `collection`.
# Returns a `(dense_model, sparse_model)` tuple (or `None` if no matching manifest is found) to `detect_text_models`.
def _model_from_manifest(collection: str) -> Optional[Tuple[str, str]]:
    """Find (dense_model, sparse_model) of a collection in the RAG Tester manifests."""
    if not RAG_RUNS_DIR.exists():
        return None
    for path in sorted(RAG_RUNS_DIR.glob("*.json"), key=lambda p: p.stat().st_mtime, reverse=True):
        try:
            data = json.loads(path.read_text("utf-8"))
        except Exception:
            continue
        if data.get("hybrid_collection") != collection:
            continue
        emb = ((data.get("profiles") or {}).get("chunk") or {}).get("embedding") or {}
        if emb.get("dense_model"):
            return emb["dense_model"], emb.get("sparse_model") or "Qdrant/bm25"
    return None


# Receives a `QdrantClient` (`client`), `collection` name, and optional `meta` dict from `list_fusion_collections`, `search_text`, or `services/retriever.py` (`run_retrieval`).
# Determines the dense and sparse embedding models used to index `collection` by checking point payload metadata first, then RAG Tester manifests, and finally a dimension-based guess.
# Returns `(dense_model, sparse_model, source)` where `source` is `"payload"`, `"manifest"`, or `"dimension-guess"` to the caller.
def detect_text_models(client, collection: str, meta: Optional[Dict[str, Any]] = None) -> Tuple[Optional[str], Optional[str], str]:
    """
    Detect the embedding models of a text collection.
    Returns (dense_model|None, sparse_model|None, source) where source is
    "payload", "manifest" or "dimension-guess".
    """
    meta = meta or classify_collection(client, collection)
    payload = _first_payload(client, collection)
    if payload.get("dense_model") or payload.get("sparse_model"):
        return payload.get("dense_model"), payload.get("sparse_model") or ("Qdrant/bm25" if meta["has_sparse"] else None), "payload"
    found = _model_from_manifest(collection)
    if found:
        return found[0], found[1] if meta["has_sparse"] else None, "manifest"
    dense = _guess_dense_model_by_dim(meta["dense_dim"])
    return dense, "Qdrant/bm25" if meta["has_sparse"] else None, "dimension-guess"


# ---------------------------------------------------------------------------
# Embedding helpers (cached)
# ---------------------------------------------------------------------------

# Receives a `fastembed` dense model `name` from `search_text` or `services/retriever.py` (`run_retrieval`).
# Lazily loads and caches the `TextEmbedding` instance in `_DENSE` under `_EMBED_LOCK` so subsequent queries reuse the in-memory model without reloading weights.
# Returns the cached `TextEmbedding` instance to `search_text` or `run_retrieval`.
def _dense_model(name: str):
    with _EMBED_LOCK:
        if name not in _DENSE:
            from fastembed import TextEmbedding
            logger.info("Loading dense query model %s", name)
            _DENSE[name] = TextEmbedding(model_name=name)
        return _DENSE[name]


# Receives a `fastembed` sparse model `name` from `search_text` or `services/retriever.py` (`run_retrieval`).
# Lazily loads and caches the `SparseTextEmbedding` instance in `_SPARSE` under `_EMBED_LOCK` to avoid repeated model initialization overhead.
# Returns the cached `SparseTextEmbedding` instance to `search_text` or `run_retrieval`.
def _sparse_model(name: str):
    with _EMBED_LOCK:
        if name not in _SPARSE:
            from fastembed import SparseTextEmbedding
            logger.info("Loading sparse query model %s", name)
            _SPARSE[name] = SparseTextEmbedding(model_name=name)
        return _SPARSE[name]


# Receives boolean flags `text` and `colpali` from `run_fusion_search`.
# Pre-imports `fastembed`, `transformers`, and `sentence_transformers` sequentially under `_IMPORT_LOCK` before spawning worker threads so concurrent lazy imports cannot leave modules half-initialized.
# Returns `None` to `run_fusion_search`.
def _warm_imports(text: bool, colpali: bool) -> None:
    """Import heavy libraries sequentially before the parallel searches start."""
    with _IMPORT_LOCK:
        if text:
            import fastembed  # noqa: F401
        if colpali:
            import transformers  # noqa: F401
            from sentence_transformers import MultiVectorEncoder  # noqa: F401


# Called with no arguments by `routers/fusion.py` (`GET /api/fusion/embedding-models`).
# Queries `fastembed` for all supported dense and sparse text embedding models (caching the result via `@lru_cache`) and filters out deprecated alias names so the UI can populate model override dropdowns.
# Returns `{"dense": [...], "sparse": [...]}` to `routers/fusion.py`.
@lru_cache(maxsize=1)
def list_embedding_models() -> Dict[str, List[Dict[str, Any]]]:
    """
    Dense and sparse query models supported by the installed fastembed version
    (for the override dropdowns). Dense entries carry their vector size so the
    UI can tell which models fit a collection.
    """
    with _IMPORT_LOCK:
        from fastembed import SparseTextEmbedding, TextEmbedding
    dense = [
        {"model": m["model"], "dim": m.get("dim"), "size_gb": m.get("size_in_GB"),
         "description": m.get("description", "")}
        for m in TextEmbedding.list_supported_models()
    ]
    sparse, seen = [], set()
    for m in SparseTextEmbedding.list_supported_models():
        # fastembed also lists the misspelled alias "prithvida/Splade_PP_en_v1"
        # (kept for backwards compatibility) — show the canonical name only.
        if m["model"].startswith("prithvida/") or m["model"] in seen:
            continue
        seen.add(m["model"])
        sparse.append({"model": m["model"], "size_gb": m.get("size_in_GB"),
                       "description": m.get("description", "")})
    return {"dense": sorted(dense, key=lambda x: (x["dim"] or 0, x["model"])), "sparse": sparse}


# ---------------------------------------------------------------------------
# Fusion maths (mirrors qdrant_client/hybrid/fusion.py so the per-retriever
# contributions add up to the fused score Qdrant returns)
# ---------------------------------------------------------------------------

# Receives a 1-based `rank` (or `None`), RRF constant `k`, and list `weight` from `search_text`.
# Computes a single retriever's weighted Reciprocal Rank Fusion contribution (`1 / (rank / weight + k - 1)`) matching `qdrant-client`'s formula so the UI can display how much dense vs. sparse contributed.
# Returns the contribution `float` to `search_text`.
def _rrf_contrib(rank: Optional[int], k: int, weight: float) -> float:
    """
    RRF contribution of one result list for a point at 1-based `rank`:
    1 / (rank / weight + k - 1)  — with weight 1 this is 1 / (k + rank - 1).
    Points missing from the list (rank None) or weight ≤ 0 contribute 0.
    """
    if rank is None or weight <= 0:
        return 0.0
    return 1.0 / (rank / weight + k - 1.0)


# Receives a list of Qdrant scored `points` from `search_text` when `fusion == "dbsf"`.
# Normalizes point scores across `[mean - 3σ, mean + 3σ]` using sample standard deviation (matching Qdrant's DBSF formula) so per-retriever score contributions can be inspected.
# Returns a `Dict[str, float]` mapping each `point_id` to its normalized DBSF score back to `search_text`.
def _dbsf_normalise(points: List[Any]) -> Dict[str, float]:
    """
    DBSF normalisation of one result list: scores are mapped from
    [mean - 3σ, mean + 3σ] to [0, 1] (sample standard deviation). A single
    point or zero variance yields 0.5. Returns {point_id: normalised score}.
    """
    if not points:
        return {}
    scores = [float(p.score) for p in points]
    if len(scores) == 1:
        return {str(points[0].id): 0.5}
    mean = sum(scores) / len(scores)
    var = sum((s - mean) ** 2 for s in scores) / (len(scores) - 1)
    if var == 0:
        return {str(p.id): 0.5 for p in points}
    sd = var ** 0.5
    low, high = mean - 3 * sd, mean + 3 * sd
    return {str(p.id): (float(p.score) - low) / (high - low) for p in points}


# Receives `dense_share` (`Optional[float]` in `0..1`) from `search_text`.
# Categorizes whether a hybrid hit was primarily driven by the dense retriever (`>= 0.6`), sparse retriever (`<= 0.4`), or both (`"balanced"`).
# Returns the driver label `str` (`"dense"`, `"sparse"`, `"balanced"`, or `"none"`) to `search_text`.
def _driver(dense_share: Optional[float]) -> str:
    """Classify which retriever produced a hit: dense / sparse / balanced."""
    if dense_share is None:
        return "none"
    if dense_share >= 0.6:
        return "dense"
    if dense_share <= 0.4:
        return "sparse"
    return "balanced"


# ---------------------------------------------------------------------------
# Hit normalisation
# ---------------------------------------------------------------------------

# Receives a list of hit dicts (`hits`) from `search_text` or `search_colpali`.
# Computes and attaches a min-max normalized score (`score_norm` in `0.0..1.0`) to each hit within its list for easier cross-list comparison in custom rerankers.
# Returns the mutated `List[Dict[str, Any]]` back to `search_text` or `search_colpali`.
def _add_norm(hits: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Add min-max normalised scores (0..1) within one result list."""
    if not hits:
        return hits
    scores = [h["score"] for h in hits]
    lo, hi = min(scores), max(scores)
    for h in hits:
        h["score_norm"] = round((h["score"] - lo) / (hi - lo), 4) if hi > lo else 1.0
    return hits


# Receives a Qdrant point `payload` dict from `search_text` or `search_colpali`.
# Resolves a best-effort absolute filesystem path to the source PDF by checking `file_path` first and falling back to searching `TEST_DATA_DIR` for `doc_name` / `doc_source`.
# Returns the resolved PDF path `Optional[str]` (or `None` if not found) to `search_text` or `search_colpali`.
def _resolve_pdf(payload: Dict[str, Any]) -> Optional[str]:
    """Best-effort absolute PDF path for a hit (for thumbnails and the LLM)."""
    fp = payload.get("file_path")
    if fp and Path(fp).is_file():
        return str(fp)
    name = payload.get("doc_name") or payload.get("doc_source")
    if name:
        direct = TEST_DATA_DIR / name
        if direct.is_file():
            return str(direct)
        match = next(TEST_DATA_DIR.rglob(Path(name).name), None) if TEST_DATA_DIR.exists() else None
        if match:
            return str(match)
    return None


# ---------------------------------------------------------------------------
# Searches
# ---------------------------------------------------------------------------

# Receives `collection`, `query`, `limit`, model overrides, and fusion parameters (`fusion`, `rrf_k`, `dense_weight`, `sparse_weight`) from `run_fusion_search` (via its `timed` worker wrapper).
# Embeds `query` with the detected or overridden dense/sparse `fastembed` models, runs individual prefetch queries plus Qdrant's fused query (`RrfQuery`, `Fusion.DBSF`, or single-vector), and computes each retriever's exact score contribution.
# Returns a dict containing normalized `"hits"` and fusion/model metadata to `run_fusion_search`.
def search_text(collection: str, query: str, limit: int, dense_override: str = "",
                sparse_override: str = "", fusion: str = "rrf", rrf_k: int = 60,
                dense_weight: float = 1.0, sparse_weight: float = 1.0) -> Dict[str, Any]:
    """
    Search a text collection with dense + sparse vectors.

    `fusion` selects how both lists are merged ("rrf", "dbsf", "dense",
    "sparse"). Every hit reports its rank/score in each individual list and
    the contribution of each list to the fused score.
    """
    from qdrant_client import models

    client = get_qdrant_client()
    meta = classify_collection(client, collection)
    dense_name, sparse_name, src = detect_text_models(client, collection, meta)
    if dense_override.strip():
        dense_name, src = dense_override.strip(), "override"
    if sparse_override.strip() and meta["has_sparse"]:
        sparse_name = sparse_override.strip()

    named_dense = isinstance(client.get_collection(collection).config.params.vectors, dict)
    using_dense = "dense" if named_dense else None
    prefetch_limit = max(limit * 4, 20)  # more candidates before fusion

    dense_vec = sparse_vec = None
    if meta["dense_dim"] and dense_name:
        dense_vec = list(_dense_model(dense_name).embed([query]))[0].tolist()
        if len(dense_vec) != meta["dense_dim"]:
            raise ValueError(
                f"Dense model '{dense_name}' returns {len(dense_vec)}-dim vectors but the collection "
                f"expects {meta['dense_dim']}. Choose the model that was used for indexing."
            )
    if meta["has_sparse"] and sparse_name:
        sv = list(_sparse_model(sparse_name).embed([query]))[0]
        sparse_vec = models.SparseVector(indices=sv.indices.tolist(), values=sv.values.tolist())

    # Individual searches with the SAME limit as the prefetches below → these
    # are exactly the lists Qdrant fuses (ranks/scores per retriever).
    dense_res, sparse_res = [], []
    if dense_vec is not None:
        dense_res = client.query_points(collection_name=collection, query=dense_vec, using=using_dense,
                                        limit=prefetch_limit, with_payload=False).points
    if sparse_vec is not None:
        sparse_res = client.query_points(collection_name=collection, query=sparse_vec, using="sparse",
                                         limit=prefetch_limit, with_payload=False).points
    dense_info = {str(p.id): (i + 1, float(p.score)) for i, p in enumerate(dense_res)}
    sparse_info = {str(p.id): (i + 1, float(p.score)) for i, p in enumerate(sparse_res)}

    # Fall back to the available retriever if the requested mode is impossible
    if fusion in ("rrf", "dbsf") and (dense_vec is None or sparse_vec is None):
        fusion = "dense" if dense_vec is not None else "sparse"
    if fusion == "dense" and dense_vec is None:
        fusion = "sparse"
    if fusion == "sparse" and sparse_vec is None:
        fusion = "dense"
    if dense_vec is None and sparse_vec is None:
        raise ValueError("Collection has neither a usable dense nor sparse vector.")

    weights: Optional[List[float]] = None
    if fusion in ("rrf", "dbsf"):
        prefetch = [
            models.Prefetch(query=dense_vec, using=using_dense, limit=prefetch_limit),
            models.Prefetch(query=sparse_vec, using="sparse", limit=prefetch_limit),
        ]
        if fusion == "rrf":
            # Parametrised RRF (k) and weighted RRF; weights only when non-default
            # so older Qdrant servers without weight support keep working.
            if dense_weight != 1.0 or sparse_weight != 1.0:
                weights = [dense_weight, sparse_weight]
            fused_query = models.RrfQuery(rrf=models.Rrf(k=rrf_k, weights=weights))
            w_label = f" · w {dense_weight:g}:{sparse_weight:g}" if weights else ""
            mode = f"hybrid · RRF k={rrf_k}{w_label}"
        else:
            fused_query = models.FusionQuery(fusion=models.Fusion.DBSF)
            mode = "hybrid · DBSF"
        points = client.query_points(collection_name=collection, prefetch=prefetch, query=fused_query,
                                     limit=limit, with_payload=True).points
    elif fusion == "dense":
        points = client.query_points(collection_name=collection, query=dense_vec, using=using_dense,
                                     limit=limit, with_payload=True).points
        mode = "dense only"
    else:
        points = client.query_points(collection_name=collection, query=sparse_vec, using="sparse",
                                     limit=limit, with_payload=True).points
        mode = "sparse only"

    # DBSF: per-list normalised scores (only needed for the contribution split)
    dense_norm = _dbsf_normalise(dense_res) if fusion == "dbsf" else {}
    sparse_norm = _dbsf_normalise(sparse_res) if fusion == "dbsf" else {}

    hits = []
    for i, p in enumerate(points):
        pid = str(p.id)
        pl = p.payload or {}
        pages = pl.get("page_numbers") or []
        d_rank, d_score = dense_info.get(pid, (None, None))
        s_rank, s_score = sparse_info.get(pid, (None, None))

        # Contribution of each retriever to the fused score
        if fusion == "rrf":
            d_c = _rrf_contrib(d_rank, rrf_k, dense_weight)
            s_c = _rrf_contrib(s_rank, rrf_k, sparse_weight)
        elif fusion == "dbsf":
            d_c, s_c = dense_norm.get(pid, 0.0), sparse_norm.get(pid, 0.0)
        elif fusion == "dense":
            d_c, s_c = float(p.score), 0.0
        else:
            d_c, s_c = 0.0, float(p.score)
        total = d_c + s_c
        share = (d_c / total) if total > 0 else (1.0 if fusion == "dense" else 0.0 if fusion == "sparse" else None)

        hits.append({
            "source": "text",
            "id": pid,
            "rank": i + 1,
            "score": float(p.score),
            "dense_rank": d_rank, "dense_score": d_score,
            "sparse_rank": s_rank, "sparse_score": s_score,
            "dense_contrib": round(d_c, 6), "sparse_contrib": round(s_c, 6),
            "dense_share": round(share, 4) if share is not None else None,
            # Which individual lists contained the point at all
            "found_by": "both" if d_rank and s_rank else "dense" if d_rank else "sparse" if s_rank else "none",
            "driver": _driver(share),
            "doc_name": pl.get("doc_name") or pl.get("doc_source") or "",
            "file_path": _resolve_pdf(pl),
            "page": pl.get("page_start") or (pages[0] if pages else None),
            "pages": pages,
            "headings": pl.get("headings") or [],
            "text": pl.get("chunk_text") or "",
            "embedded_text": pl.get("embedded_text") or pl.get("chunk_text") or "",
            "metadata": {k: v for k, v in pl.items() if k not in ("chunk_text", "embedded_text")},
        })
    return {"hits": _add_norm(hits), "mode": mode, "fusion": fusion, "rrf_k": rrf_k,
            "weights": [dense_weight, sparse_weight], "prefetch_limit": prefetch_limit,
            "dense_model": dense_name, "sparse_model": sparse_name, "model_source": src}


# Receives `collection`, `query`, and `limit` from `run_fusion_search` (via its `timed` worker wrapper).
# Encodes `query` into multi-vector token embeddings with the collection's ColPali/ColQwen2 model and queries Qdrant using MaxSim (`using="colpali"`).
# Returns `{"hits": [...], "model": model_name}` with normalized page hits to `run_fusion_search`.
def search_colpali(collection: str, query: str, limit: int) -> Dict[str, Any]:
    """MaxSim search on a ColPali multi-vector collection."""
    from services.colpali_retriever import encode_query

    client = get_qdrant_client()
    model_name = _first_payload(client, collection).get("model", "vidore/colqwen2-v1.0")
    q = encode_query(model_name, query)
    points = client.query_points(collection_name=collection, query=q, using="colpali",
                                 limit=limit, with_payload=True).points
    hits = []
    for i, p in enumerate(points):
        pl = p.payload or {}
        hits.append({
            "source": "colpali",
            "id": str(p.id),
            "rank": i + 1,
            "score": float(p.score),
            "doc_name": pl.get("doc_name") or pl.get("doc_source") or "",
            "file_path": _resolve_pdf(pl),
            "page": pl.get("page_number"),
            "pages": [pl.get("page_number")] if pl.get("page_number") else [],
            "metadata": pl,
        })
    return {"hits": _add_norm(hits), "model": model_name}


# Receives `query`, `text_collection`, `colpali_collection`, `text_limit`, `colpali_limit`, and `text_opts` from `routers/fusion.py` (`POST /api/fusion/search`) or `services/rag_chat_service.py`.
# Warms up heavy ML imports and executes `search_text` and `search_colpali` concurrently in a 2-worker `ThreadPoolExecutor` so both modalities are searched in parallel.
# Returns `{"query", "text", "colpali", "errors"}` with hits, elapsed timings, and model details to the calling router or service.
def run_fusion_search(query: str, text_collection: str, colpali_collection: str,
                      text_limit: int = 5, colpali_limit: int = 5,
                      text_opts: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Run both searches in parallel and return hits + timings + used models.
    `text_opts` is passed to search_text (overrides, fusion, rrf_k, weights).
    """
    _warm_imports(bool(text_collection), bool(colpali_collection))
    out: Dict[str, Any] = {"query": query, "text": None, "colpali": None, "errors": {}}
    text_opts = text_opts or {}

    # Receives a target search function `fn` (`search_text` or `search_colpali`) and its positional/keyword arguments from `ThreadPoolExecutor.submit` inside `run_fusion_search`.
    # Executes `fn(*args, **kwargs)` while measuring wall-clock duration and attaches `"elapsed_ms"` to the returned dict.
    # Returns the augmented result dict back to the `Future` awaited by `run_fusion_search`.
    def timed(fn, *args, **kwargs):
        t0 = time.time()
        res = fn(*args, **kwargs)
        res["elapsed_ms"] = round((time.time() - t0) * 1000)
        return res

    with ThreadPoolExecutor(max_workers=2, thread_name_prefix="fusion") as pool:
        fut_text = pool.submit(timed, search_text, text_collection, query, text_limit, **text_opts) if text_collection else None
        fut_col = pool.submit(timed, search_colpali, colpali_collection, query, colpali_limit) if colpali_collection else None
        for key, fut in (("text", fut_text), ("colpali", fut_col)):
            if fut is None:
                continue
            try:
                out[key] = fut.result()
            except Exception as exc:
                logger.exception("Fusion %s search failed", key)
                out["errors"][key] = str(exc)
    return out


# ---------------------------------------------------------------------------
# Page thumbnails
# ---------------------------------------------------------------------------

# Receives resolved PDF `path`, 1-based `page` number, `dpi`, and file `mtime` from `render_page_png`.
# Opens the PDF with PyMuPDF (`fitz`), renders the requested page at `dpi` to PNG bytes, and caches up to 256 rendered pages in memory (invalidated automatically when `mtime` changes).
# Returns the raw PNG `bytes` to `render_page_png`.
@lru_cache(maxsize=256)
def _render_png(path: str, page: int, dpi: int, mtime: float) -> bytes:
    """Render one PDF page to PNG bytes (cached; mtime invalidates the cache)."""
    import fitz  # PyMuPDF

    with fitz.open(path) as doc:
        if not 1 <= page <= len(doc):
            raise ValueError(f"Page {page} out of range (1–{len(doc)}).")
        return doc.load_page(page - 1).get_pixmap(dpi=dpi).tobytes("png")


# Receives `file_path`, 1-based `page` number, and `dpi` from `routers/fusion.py` (`GET /api/fusion/page-image`) or `services/answer_generator.py` / `services/rag_chat_service.py`.
# Validates that `file_path` points to an existing `.pdf` file, clamps `dpi` to `36..200`, and delegates rendering to the LRU-cached `_render_png`.
# Returns the rendered PNG image `bytes` to the calling router or service.
def render_page_png(file_path: str, page: int, dpi: int = 72) -> bytes:
    """Validate the path (must be an existing .pdf) and render the page."""
    p = Path(file_path).expanduser().resolve()
    if p.suffix.lower() != ".pdf" or not p.is_file():
        raise FileNotFoundError(f"PDF not found: {file_path}")
    dpi = max(36, min(int(dpi), 200))
    return _render_png(str(p), int(page), dpi, p.stat().st_mtime)
