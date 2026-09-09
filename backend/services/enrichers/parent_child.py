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

    from qdrant_client import QdrantClient
    from qdrant_client.models import (
        Distance, PointStruct, VectorParams,
        PointIdsList, SetPayloadOperation,
    )
    from fastembed import TextEmbedding

    start = time.time()

    # ------------------------------------------------------------------
    # 1. Open Qdrant
    # ------------------------------------------------------------------
    yield emit("🗄️  Opening Qdrant storage...")
    client = QdrantClient(path=str(qdrant_storage_path))

    # ------------------------------------------------------------------
    # 2. Load all points from the source collection via scroll
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
            with_vectors=False,  # we don't need vectors for grouping
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
        embed_model = TextEmbedding(model_name=dense_model_name)
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
    else:
        size = dim or getattr(src_vectors, "size", 384)
        vec_cfg = VectorParams(size=size, distance=Distance.COSINE)

    if client.collection_exists(output_collection):
        client.delete_collection(output_collection)

    client.create_collection(
        collection_name=output_collection,
        vectors_config=vec_cfg,
    )
    yield emit("✅ Output collection ready")

    # ------------------------------------------------------------------
    # 7. Copy all child chunks into the output collection
    # ------------------------------------------------------------------
    yield emit("📋 Copying child chunks to output collection...")
    # Re-scroll with vectors this time
    all_points_with_vec = []
    offset = None
    while True:
        batch, offset = client.scroll(
            collection_name=source_collection,
            offset=offset,
            limit=100,
            with_payload=True,
            with_vectors=True,
        )
        all_points_with_vec.extend(batch)
        if offset is None:
            break

    child_points = []
    for pt in all_points_with_vec:
        child_points.append(PointStruct(
            id=str(pt.id),
            vector=pt.vector,
            payload={**(pt.payload or {}), "chunk_type": "child"},
        ))

    for i in range(0, len(child_points), 64):
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

        # Build LLM prompt
        prompt = options.summary_prompt_template.format(
            max_tokens=options.summary_max_tokens,
            heading=heading_key,
            content=section_text[:4000],  # cap to avoid context overflow
        )

        yield emit(f"🤖 [{g_idx+1}/{total_groups}] Summarising: '{heading_key[:60]}...'")
        try:
            summary = await llm_client.complete(prompt)
            summary = summary.strip()
        except Exception as exc:
            yield emit(f"⚠️  LLM call failed for '{heading_key}': {exc}")
            continue

        # Embed the summary
        parent_id = str(uuid.uuid4())
        if options.embed_summaries and embed_model is not None:
            import numpy as np
            vec = np.array(list(embed_model.embed([summary]))[0])
            if np.isnan(vec).any():
                yield emit(f"⚠️  NaN embedding for parent '{heading_key}' — skipping")
                continue
            vector = vec.tolist()
        else:
            # Fallback: average child vectors
            vector = None  # will be handled below

        # Build parent payload
        child_ids = [str(pt.id) for pt in group_pts]
        parent_payload = {
            "chunk_type": "parent",
            "chunk_text": summary,
            "embedded_text": summary,
            "headings": heading_key.split(" › ") if heading_key != "__root__" else [],
            "child_ids": child_ids,
            "chunk_index": -(g_idx + 1),  # negative index for parents
            "source_collection": source_collection,
        }

        if vector is not None:
            parent_pt = PointStruct(id=parent_id, vector=vector, payload=parent_payload)
        else:
            parent_pt = PointStruct(id=parent_id, vector=[0.0] * dim, payload=parent_payload)

        parent_points.append(parent_pt)

        for cid in child_ids:
            child_parent_map[cid] = parent_id

    # Write all parent points
    if parent_points:
        for i in range(0, len(parent_points), 64):
            client.upsert(collection_name=output_collection, points=parent_points[i:i+64])
        yield emit(f"✅ Wrote {len(parent_points)} parent summary chunks")

    # ------------------------------------------------------------------
    # 9. Update children with parent_id (in output collection)
    # ------------------------------------------------------------------
    if options.link_children and child_parent_map:
        yield emit("🔗 Linking children to parents...")
        for child_id, parent_id in child_parent_map.items():
            try:
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
