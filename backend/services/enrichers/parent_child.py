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
Parent-Child Enricher
----------------------
Reads an existing Qdrant collection, groups child chunks by their heading
hierarchy, asks an LLM to summarise each group, embeds the summaries and
writes them as "parent" chunks into a new output collection.

The output collection is a copy of the source plus the new parent points.
Each parent point has:
    chunk_type  : "parent"
    headings    : [heading_path, ...]
    child_ids   : [qdrant_point_id, ...]
    chunk_text  : LLM-generated summary
    chunk_index : negative integer (to distinguish from children)

Each child point in the *source* collection is updated with:
    parent_id   : qdrant_point_id of its parent (if link_children=True)
"""

from __future__ import annotations

import json
import logging
import time
import uuid
from collections import defaultdict
from pathlib import Path
from typing import Any, AsyncGenerator, Dict, List, Optional

logger = logging.getLogger(__name__)


def _heading_key(headings: list[str], level: int) -> str:
    """Return the heading path truncated at the requested depth."""
    return " › ".join(headings[:level]) if headings else "__root__"


async def run_parent_child(
    *,
    source_collection: str,
    output_collection: str,
    qdrant_storage_path: str,
    llm_client,                  # OllamaClient instance
    options,                      # ParentChildOptions instance
    dense_model_name: str,        # must match the source collection's model
    emit,                         # callable(str) → str  (for SSE messages)
) -> AsyncGenerator[str, None]:
    """
    Streaming generator that performs Parent-Child enrichment.
    Yields SSE-formatted progress strings.
    """

    import numpy as np
    from qdrant_client.models import (
        Distance, PointStruct, VectorParams,
        PointIdsList, SparseVector,
    )
    from services.fusion_retriever import _dense_model, _sparse_model
    from services.qdrant_client_manager import get_qdrant_client, qdrant_write_lock

    start = time.time()

    # ------------------------------------------------------------------
    # 1. Open Qdrant
    # ------------------------------------------------------------------
    yield emit("🗄️  Opening Qdrant storage...")
    client = get_qdrant_client(str(qdrant_storage_path))

    # ------------------------------------------------------------------
    # 2. Load all points (with vectors) from the source collection once
    # ------------------------------------------------------------------
    yield emit(f"📥 Loading all chunks from '{source_collection}'...")
    all_points = []
    offset = None
    while True:
        batch, offset = client.scroll(
            collection_name=source_collection,
            offset=offset,
            limit=100,
            with_payload=True,
            with_vectors=True,
        )
        all_points.extend(batch)
        if offset is None:
            break
    yield emit(f"✅ Loaded {len(all_points)} child chunks")

    if not all_points:
        yield emit("❌ Source collection is empty — nothing to enrich.")
        return

    # ------------------------------------------------------------------
    # 3. Group chunks by heading hierarchy at the requested level
    # ------------------------------------------------------------------
    yield emit(f"🗂️  Grouping by heading level {options.grouping_level}...")
    groups: Dict[str, List[Any]] = defaultdict(list)
    for pt in all_points:
        payload = pt.payload or {}
        headings = payload.get("headings", [])
        key = _heading_key(headings, options.grouping_level)
        groups[key].append(pt)

    yield emit(f"✅ {len(groups)} groups formed")

    # ------------------------------------------------------------------
    # 4. Check LLM availability
    # ------------------------------------------------------------------
    yield emit(f"🤖 Checking Ollama ({llm_client.host}, model: {llm_client.model})...")
    if not await llm_client.is_available():
        yield emit(
            "❌ Ollama is not running or not reachable. "
            "Start it with: ollama serve"
        )
        return
    yield emit("✅ Ollama is available")

    # ------------------------------------------------------------------
    # 5. Load embedding model (same as source so dimensions match)
    # ------------------------------------------------------------------
    if options.embed_summaries:
        yield emit(f"🔢 Loading embedding model '{dense_model_name}'...")
        embed_model = _dense_model(dense_model_name)
        # Probe dimension
        probe = list(embed_model.embed(["probe"]))[0]
        dim = len(probe)
        yield emit(f"✅ Embedding model ready ({dim}d)")
    else:
        embed_model = None
        dim = None

    # ------------------------------------------------------------------
    # 6. Create output collection (clone config from source)
    # ------------------------------------------------------------------
    yield emit(f"🏗️  Creating output collection '{output_collection}'...")
    src_info = client.get_collection(source_collection)
    src_vectors = src_info.config.params.vectors

    # Determine vector config — copy from source (or use probed dim)
    if isinstance(src_vectors, dict):
        vec_cfg = {
            k: VectorParams(size=v.size, distance=v.distance)
            for k, v in src_vectors.items()
        }
        dense_vec_name = "dense" if "dense" in vec_cfg else next(iter(vec_cfg.keys()))
        if dim is None:
            dim = vec_cfg[dense_vec_name].size
    else:
        size = dim or getattr(src_vectors, "size", 384)
        dim = size
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
    yield emit("✅ Output collection ready")

    # ------------------------------------------------------------------
    # 7. Copy all child chunks into the output collection
    # ------------------------------------------------------------------
    yield emit("📋 Copying child chunks to output collection...")
    child_points = [
        PointStruct(
            id=str(pt.id),
            vector=pt.vector,
            payload={**(pt.payload or {}), "chunk_type": "child"},
        )
        for pt in all_points
    ]

    for i in range(0, len(child_points), 64):
        with qdrant_write_lock:
            client.upsert(collection_name=output_collection, points=child_points[i:i+64])
    yield emit(f"✅ Copied {len(child_points)} child chunks")

    # ------------------------------------------------------------------
    # 8. Summarise each group, embed, and write parent chunks
    # ------------------------------------------------------------------
    parent_points: List[PointStruct] = []
    child_parent_map: Dict[str, str] = {}  # child_id → parent_id

    total_groups = len(groups)
    for g_idx, (heading_key, group_pts) in enumerate(groups.items()):
        progress_pct = int((g_idx / total_groups) * 100)
        yield f"__PROGRESS__={progress_pct}"

        # Build combined section text for the LLM
        section_text = "\n\n".join(
            (pt.payload or {}).get("chunk_text", "") for pt in group_pts
        ).strip()

        if not section_text:
            continue

        # Build LLM prompt (safely handle user-modified format strings)
        try:
            prompt = options.summary_prompt_template.format(
                max_tokens=options.summary_max_tokens,
                heading=heading_key,
                content=section_text[:4000],  # cap to avoid context overflow
            )
        except (KeyError, ValueError, IndexError):
            prompt = (
                f"Summarise the following section ('{heading_key}') in at most "
                f"{options.summary_max_tokens} tokens:\n\n{section_text[:4000]}\n\nSummary:"
            )

        yield emit(f"🤖 [{g_idx+1}/{total_groups}] Summarising: '{heading_key[:60]}...'")
        try:
            summary = await llm_client.complete(prompt)
            summary = summary.strip() if summary else ""
        except Exception as exc:
            yield emit(f"⚠️  LLM call failed for '{heading_key}': {exc}")
            continue

        if not summary:
            continue

        # Embed the summary or average child dense vectors when embed_summaries=False
        parent_id = str(uuid.uuid4())
        if options.embed_summaries and embed_model is not None:
            vec = np.array(list(embed_model.embed([summary]))[0], dtype=np.float32)
            if np.isnan(vec).any():
                yield emit(f"⚠️  NaN embedding for parent '{heading_key}' — skipping")
                continue
            vector = vec.tolist()
        else:
            # Average the dense vectors of the child chunks in this group
            child_vecs = []
            for pt in group_pts:
                v = pt.vector
                if isinstance(v, dict):
                    v = v.get(dense_vec_name or "dense")
                if isinstance(v, list) and v:
                    child_vecs.append(np.array(v, dtype=np.float32))
            if child_vecs:
                mean_vec = np.mean(np.stack(child_vecs), axis=0)
                norm = float(np.linalg.norm(mean_vec))
                if norm > 0:
                    mean_vec = mean_vec / norm
                vector = mean_vec.tolist()
            else:
                vector = [0.0] * (dim or 384)

        # Build parent payload (carry over dense_model/sparse_model from children)
        first_child_payload = group_pts[0].payload or {}
        child_ids = [str(pt.id) for pt in group_pts]
        parent_payload = {
            "chunk_type": "parent",
            "chunk_text": summary,
            "embedded_text": summary,
            "headings": heading_key.split(" › ") if heading_key != "__root__" else [],
            "child_ids": child_ids,
            "chunk_index": -(g_idx + 1),  # negative index for parents
            "source_collection": source_collection,
            "dense_model": first_child_payload.get("dense_model", dense_model_name),
        }
        if first_child_payload.get("sparse_model"):
            parent_payload["sparse_model"] = first_child_payload["sparse_model"]

        # Format vector depending on if collection uses named vectors (+ sparse if hybrid)
        if dense_vec_name:
            vec_obj: Any = {dense_vec_name: vector}
            if sparse_embed_model is not None:
                sv = list(sparse_embed_model.embed([summary]))[0]
                vec_obj["sparse"] = SparseVector(indices=sv.indices.tolist(), values=sv.values.tolist())
        else:
            vec_obj = vector

        parent_pt = PointStruct(id=parent_id, vector=vec_obj, payload=parent_payload)
        parent_points.append(parent_pt)

        for cid in child_ids:
            child_parent_map[cid] = parent_id

    # Write all parent points
    if parent_points:
        for i in range(0, len(parent_points), 64):
            with qdrant_write_lock:
                client.upsert(collection_name=output_collection, points=parent_points[i:i+64])
        yield emit(f"✅ Wrote {len(parent_points)} parent summary chunks")

    # ------------------------------------------------------------------
    # 9. Update children with parent_id (in output collection)
    # ------------------------------------------------------------------
    if options.link_children and child_parent_map:
        yield emit("🔗 Linking children to parents...")
        for child_id, parent_id in child_parent_map.items():
            try:
                with qdrant_write_lock:
                    client.set_payload(
                        collection_name=output_collection,
                        payload={"parent_id": parent_id},
                        points=PointIdsList(points=[child_id]),
                    )
            except Exception as exc:
                logger.warning("Could not set parent_id on %s: %s", child_id, exc)
        yield emit("✅ Parent-child links established")

    elapsed = time.time() - start
    yield emit(
        f"🏁 Parent-Child enrichment complete in {elapsed:.1f}s. "
        f"Output: '{output_collection}' "
        f"({len(child_points)} children + {len(parent_points)} parents)"
    )
    yield "__PROGRESS__=100"
