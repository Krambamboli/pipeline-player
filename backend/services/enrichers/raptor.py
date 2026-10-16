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
RAPTOR Enricher
----------------
Implements the RAPTOR algorithm (Recursive Abstractive Processing for
Tree-Organized Retrieval) on an existing Qdrant collection.

Algorithm per level:
  1. Load existing leaf vectors from Qdrant
  2. Reduce dimensionality with UMAP (768d → 2d by default)
  3. Fit a Gaussian Mixture Model (GMM) to find clusters
     - If gmm_n_components == 0: auto-select n_components via BIC
  4. For each cluster: concatenate texts → LLM summary → embed
  5. Write summary nodes to Qdrant with { level, child_ids }
  6. Repeat with the new summary nodes as input (next level)
  7. Stop when ≤ 1 cluster remains or max_levels reached

References:
  https://arxiv.org/abs/2401.18059
"""

from __future__ import annotations

import logging
import time
import uuid
from typing import Any, AsyncGenerator, Dict, List, Optional

import numpy as np

logger = logging.getLogger(__name__)


# Called by run_raptor with vectors (2D np.ndarray of UMAP-reduced embeddings) and optional max_k (int) when options.gmm_n_components is 0.
# Fits Gaussian Mixture Models across candidate cluster counts (2..max_k) and selects the k that minimizes the Bayesian Information Criterion (BIC).
# Returns the optimal integer number of GMM clusters to run_raptor.
def _auto_n_components(vectors: np.ndarray, max_k: int = 15) -> int:
    """Pick the number of GMM components via BIC (lower is better)."""
    from sklearn.mixture import GaussianMixture

    n = len(vectors)
    max_k = min(max_k, n - 1)
    if max_k < 2:
        return 1

    best_bic = float("inf")
    best_k = 2
    for k in range(2, max_k + 1):
        gm = GaussianMixture(n_components=k, random_state=42)
        try:
            gm.fit(vectors)
            bic = gm.bic(vectors)
            if bic < best_bic:
                best_bic = bic
                best_k = k
        except Exception:
            break
    return best_k


# Called by enrichment_runner.run_enrichment with source_collection, output_collection, qdrant_storage_path, llm_client (OllamaClient), options (RaptorOptions), dense_model_name, and emit callback.
# Copies leaf chunks into output_collection and iteratively applies UMAP dimensionality reduction, GMM clustering, LLM cluster summarization, and FastEmbed encoding across tree levels.
# Yields "__PROGRESS__=<0-100>" updates and formatted log lines back to enrichment_runner.run_enrichment for SSE streaming.
async def run_raptor(
    *,
    source_collection: str,
    output_collection: str,
    qdrant_storage_path: str,
    llm_client,
    options,
    dense_model_name: str,
    emit,
) -> AsyncGenerator[str, None]:
    """
    Streaming generator that performs RAPTOR enrichment.
    Yields SSE-formatted progress strings.
    """

    from qdrant_client.models import Distance, PointStruct, SparseVector, VectorParams
    from services.fusion_retriever import _dense_model, _sparse_model
    from services.qdrant_client_manager import get_qdrant_client, qdrant_write_lock
    from sklearn.mixture import GaussianMixture
    import umap

    start = time.time()

    # ------------------------------------------------------------------
    # 1. Open Qdrant + load source
    # ------------------------------------------------------------------
    yield emit("🗄️  Opening Qdrant storage...")
    client = get_qdrant_client(str(qdrant_storage_path))

    yield emit(f"📥 Loading chunks + vectors from '{source_collection}'...")
    all_points = []
    offset = None
    while True:
        batch, next_off = client.scroll(
            collection_name=source_collection,
            offset=offset,
            limit=100,
            with_payload=True,
            with_vectors=True,
        )
        all_points.extend(batch)
        if next_off is None:
            break
        offset = next_off

    if not all_points:
        yield emit("❌ Source collection is empty.")
        return
    yield emit(f"✅ Loaded {len(all_points)} chunks")

    # ------------------------------------------------------------------
    # 2. Check LLM + load embed model
    # ------------------------------------------------------------------
    yield emit("🤖 Checking Ollama...")
    if not await llm_client.is_available():
        yield emit("❌ Ollama not running. Start with: ollama serve")
        return
    yield emit("✅ Ollama available")

    yield emit(f"🔢 Loading embedding model '{dense_model_name}'...")
    embed_model = _dense_model(dense_model_name)
    probe = list(embed_model.embed(["probe"]))[0]
    dim = len(probe)
    yield emit(f"✅ Embedding model ready ({dim}d)")

    # ------------------------------------------------------------------
    # 3. Create output collection
    # ------------------------------------------------------------------
    yield emit(f"🏗️  Creating output collection '{output_collection}'...")
    src_info = client.get_collection(source_collection)
    src_vectors = src_info.config.params.vectors
    
    if isinstance(src_vectors, dict):
        vec_cfg = {k: VectorParams(size=v.size, distance=v.distance) for k, v in src_vectors.items()}
        dense_vec_name = "dense" if "dense" in vec_cfg else next(iter(vec_cfg.keys()))
    else:
        size = dim or getattr(src_vectors, "size", 384)
        vec_cfg = VectorParams(size=size, distance=Distance.COSINE)
        dense_vec_name = None

    src_sparse = getattr(src_info.config.params, "sparse_vectors", None)
    has_sparse = bool(src_sparse and "sparse" in src_sparse)
    if src_sparse:
        from qdrant_client.models import SparseVectorParams
        sparse_cfg = {k: SparseVectorParams() for k in src_sparse.keys()}
        sparse_embed_model = _sparse_model("Qdrant/bm25") if has_sparse else None
    else:
        sparse_cfg = None
        sparse_embed_model = None

    with qdrant_write_lock:
        if client.collection_exists(output_collection):
            client.delete_collection(output_collection)
        client.create_collection(
            collection_name=output_collection,
            vectors_config=vec_cfg,
            sparse_vectors_config=sparse_cfg,
        )

    # Reuse already-loaded all_points as level-0 leaf nodes (no second scroll)
    copied = [
        PointStruct(
            id=str(pt.id),
            vector=pt.vector,
            payload={**(pt.payload or {}), "chunk_type": "raptor_leaf", "raptor_level": 0},
        )
        for pt in all_points
    ]

    for i in range(0, len(copied), 64):
        with qdrant_write_lock:
            client.upsert(collection_name=output_collection, points=copied[i:i+64])
    yield emit(f"✅ Copied {len(copied)} leaf nodes (level 0)")

    # ------------------------------------------------------------------
    # 4. RAPTOR: iterative clustering + summarisation
    # ------------------------------------------------------------------
    current_nodes = all_points   # list of qdrant Points
    total_summaries_written = 0

    for level in range(1, options.max_levels + 1):
        yield emit(f"🌲 RAPTOR level {level}...")

        # Extract dense vectors (handle dict-style for hybrid collections)
        vecs = []
        for pt in current_nodes:
            v = pt.vector
            if isinstance(v, dict):
                v = v.get(dense_vec_name or "dense", list(v.values())[0])
            vecs.append(np.array(v, dtype=np.float32))
        vecs_np = np.stack(vecs)

        n_pts = len(vecs_np)
        if n_pts < 3:
            yield emit(f"⏭️  Only {n_pts} nodes at level {level} — stopping RAPTOR tree.")
            break

        # UMAP reduction
        n_neighbors = min(options.umap_n_neighbors, n_pts - 1)
        reducer = umap.UMAP(
            n_components=min(options.umap_n_components, n_pts - 1),
            n_neighbors=n_neighbors,
            random_state=42,
            min_dist=0.0,
        )
        try:
            reduced = reducer.fit_transform(vecs_np)
        except Exception as exc:
            yield emit(f"⚠️  UMAP failed at level {level}: {exc}")
            break

        # GMM clustering
        n_clusters = options.gmm_n_components or _auto_n_components(reduced)
        n_clusters = min(n_clusters, n_pts - 1)
        if n_clusters < 2:
            yield emit(f"⏭️  Level {level}: collapsed to 1 cluster — tree complete.")
            break

        yield emit(f"   Clustering into {n_clusters} groups (UMAP→GMM)...")
        gmm = GaussianMixture(n_components=n_clusters, random_state=42)
        labels = gmm.fit_predict(reduced)

        # Gather clusters
        clusters: Dict[int, List[Any]] = {}
        for pt, label in zip(current_nodes, labels):
            clusters.setdefault(int(label), []).append(pt)

        # Summarise each cluster
        next_level_nodes = []
        for c_idx, cluster_pts in clusters.items():
            texts = [
                (pt.payload or {}).get("chunk_text", "")
                for pt in cluster_pts
            ]
            combined = "\n\n".join(t for t in texts if t).strip()
            if not combined:
                continue

            prompt = (
                f"Summarise the following related passages in up to "
                f"{options.summary_max_tokens} tokens. Be concise and factual.\n\n"
                f"{combined[:4000]}\n\nSummary:"
            )

            try:
                raw_sum = await llm_client.complete(prompt)
                summary = raw_sum.strip() if raw_sum else ""
            except Exception as exc:
                yield emit(f"⚠️  LLM failed for cluster {c_idx}: {exc}")
                continue

            if not summary:
                continue

            # Embed summary
            sv = np.array(list(embed_model.embed([summary]))[0])
            if np.isnan(sv).any():
                yield emit(f"⚠️  NaN embedding for cluster {c_idx} — skipping")
                continue

            parent_id = str(uuid.uuid4())
            child_ids = [str(pt.id) for pt in cluster_pts]
            first_child_payload = cluster_pts[0].payload or {}
            payload = {
                "chunk_type": "raptor_summary",
                "raptor_level": level,
                "raptor_cluster": int(c_idx),
                "chunk_text": summary,
                "embedded_text": summary,
                "child_ids": child_ids,
                "chunk_index": -(level * 1000 + c_idx),
                "source_collection": source_collection,
                "dense_model": first_child_payload.get("dense_model", dense_model_name),
            }
            if first_child_payload.get("sparse_model"):
                payload["sparse_model"] = first_child_payload["sparse_model"]

            if dense_vec_name:
                vec_obj: Any = {dense_vec_name: sv.tolist()}
                if sparse_embed_model is not None:
                    sp = list(sparse_embed_model.embed([summary]))[0]
                    vec_obj["sparse"] = SparseVector(indices=sp.indices.tolist(), values=sp.values.tolist())
            else:
                vec_obj = sv.tolist()

            pt_struct = PointStruct(id=parent_id, vector=vec_obj, payload=payload)
            with qdrant_write_lock:
                client.upsert(collection_name=output_collection, points=[pt_struct])
            next_level_nodes.append(pt_struct)
            total_summaries_written += 1

        yield emit(f"   Level {level}: wrote {len(next_level_nodes)} summary nodes")

        if not next_level_nodes:
            break
        current_nodes = next_level_nodes

    elapsed = time.time() - start
    yield emit(
        f"🏁 RAPTOR enrichment complete in {elapsed:.1f}s. "
        f"Output: '{output_collection}' "
        f"({len(copied)} leaves + {total_summaries_written} summary nodes)"
    )
    yield "__PROGRESS__=100"
