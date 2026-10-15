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
Chunk Runner Service
--------------------
Executes the chunk → embed → upsert pipeline:
  1. Loads a DoclingDocument from a Docling run's parsed_doc.json
  2. Chunks it with the configured Docling chunker
  3. Enriches each chunk with metadata (headings, pages, element types, custom)
  4. Embeds chunks via fastembed (dense, sparse or hybrid)
  5. Upserts points into a local Qdrant collection

Yields structured log lines for SSE streaming to the UI.

References:
  https://docling-project.github.io/docling/concepts/chunking/
  https://github.com/qdrant/qdrant-client
"""

from __future__ import annotations

import json
import logging
import time
import uuid
from datetime import datetime
from pathlib import Path
from typing import Generator, List, Dict, Any, Optional

from models.chunk_schema import (
    ChunkPipelineConfig,
    ChunkerKind,
    EmbeddingMode,
)

# Root paths
REPO_ROOT = Path(__file__).resolve().parent.parent.parent
OUTPUTS_DIR = REPO_ROOT / "outputs"
QDRANT_STORAGE_DEFAULT = REPO_ROOT / "qdrant_storage"

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _resolve_qdrant_path(storage_path: str) -> Path:
    """Resolve the Qdrant storage path (relative paths → repo root)."""
    p = Path(storage_path)
    if not p.is_absolute():
        p = REPO_ROOT / p
    p.mkdir(parents=True, exist_ok=True)
    return p


def _build_collection_name(cfg: ChunkPipelineConfig) -> str:
    """Auto-generate a Qdrant collection name from the run/config if not set.

    NOTE: The name deliberately includes the CURRENT timestamp (not the source
    run ID) so that every new pipeline execution creates a fresh collection by
    default. If the user wants to re-use a collection, they set collection_name
    explicitly in the config.
    """
    if cfg.qdrant.collection_name.strip():
        return cfg.qdrant.collection_name.strip()
    mode = cfg.embedding.mode.value
    # Always use the current time so repeated runs on the same document
    # don't accidentally append into the same collection.
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    # Optionally suffix with the source run ID for traceability
    src = cfg.source_run_id or "unknown"
    return f"docling_{mode}_{src}_{ts}"


def _get_page_numbers(doc_items: list) -> List[int]:
    """Extract unique page numbers from doc_items provenance."""
    pages = set()
    for item in doc_items:
        try:
            for prov in getattr(item, "prov", []):
                page_no = getattr(prov, "page_no", None)
                if page_no is not None:
                    pages.add(int(page_no))
        except Exception:
            pass
    return sorted(pages)


def _get_element_types(doc_items: list) -> List[str]:
    """Extract unique element type labels from doc_items."""
    labels = set()
    for item in doc_items:
        label = getattr(item, "label", None)
        if label is not None:
            labels.add(str(label))
    return sorted(labels)


def _count_tokens_simple(text: str, tokenizer=None) -> int:
    """Count tokens using the tokenizer if available, else approximate."""
    if tokenizer is not None:
        try:
            return len(tokenizer.encode(text, add_special_tokens=False))
        except Exception:
            pass
    # Fallback: approximate at ~0.75 tokens per whitespace-separated word
    return max(1, int(len(text.split()) * 1.3))


# ---------------------------------------------------------------------------
# Reusable building blocks (shared by Step 2 and the RAG Tester)
# ---------------------------------------------------------------------------

def _serializer_provider(cfg: ChunkPipelineConfig):
    """
    Return a docling-core serializer provider honouring the serialization
    options, or None to keep the chunker's built-in default.

    docling-core only emits figure/table captions when DocItemLabel.CAPTION is
    part of the serializer params' `labels` set (serializer/common.py
    ::serialize_captions). To drop captions we subclass the default
    ChunkingSerializerProvider and remove that label.
    """
    if cfg.serialization.include_captions_in_text:
        return None  # default behaviour already includes captions

    from docling_core.transforms.chunker.hierarchical_chunker import (
        ChunkingDocSerializer,
        ChunkingSerializerProvider,
    )
    from docling_core.types.doc.labels import DocItemLabel

    class _NoCaptionProvider(ChunkingSerializerProvider):
        """Chunking serializer without captions."""

        def get_serializer(self, doc):
            ser = ChunkingDocSerializer(doc=doc)
            # Copy the default params with CAPTION removed from the label set
            ser.params = ser.params.model_copy(
                update={"labels": set(ser.params.labels) - {DocItemLabel.CAPTION}}
            )
            return ser

    return _NoCaptionProvider()


def build_chunker(cfg: ChunkPipelineConfig):
    """
    Build the Docling chunker described by cfg.
    Returns (chunker, tokenizer_or_None). The tokenizer is only available for
    the HybridChunker and is used for accurate token counts.
    """
    # Optional custom serializer (e.g. captions excluded); passed only when set
    # so the chunkers keep their own defaults otherwise.
    provider = _serializer_provider(cfg)
    ser_kwargs = {"serializer_provider": provider} if provider is not None else {}
    if cfg.chunker == ChunkerKind.HYBRID:
        import importlib

        from docling.chunking import HybridChunker
        import docling_core.transforms.chunker.tokenizer.huggingface as hf_tok_mod
        from transformers import AutoTokenizer

        # docling-core imports transformers inside try/except at module load.
        # If that happened while another thread was still importing
        # transformers (RAG Tester: ColPali + chunker start in parallel), the
        # module stays broken (_TRANSFORMERS_AVAILABLE=False) and every
        # HuggingFaceTokenizer(...) fails with "not fully defined".
        # transformers is fully imported now (line above) → reload to heal.
        if not getattr(hf_tok_mod, "_TRANSFORMERS_AVAILABLE", True):
            logger.warning("Re-loading docling_core HuggingFace tokenizer module (broken concurrent import)")
            hf_tok_mod = importlib.reload(hf_tok_mod)
        HuggingFaceTokenizer = hf_tok_mod.HuggingFaceTokenizer

        hf_tok = AutoTokenizer.from_pretrained(cfg.hybrid_chunker_options.tokenizer_model)
        tokenizer = HuggingFaceTokenizer(
            tokenizer=hf_tok,
            max_tokens=cfg.hybrid_chunker_options.max_tokens,
        )
        chunker = HybridChunker(
            tokenizer=tokenizer,
            repeat_table_header=cfg.hybrid_chunker_options.repeat_table_header,
            merge_peers=cfg.hybrid_chunker_options.merge_peers,
            omit_header_on_overflow=cfg.hybrid_chunker_options.omit_header_on_overflow,
            always_emit_headings=cfg.hybrid_chunker_options.always_emit_headings,
            **ser_kwargs,
        )
        return chunker, hf_tok

    if cfg.chunker == ChunkerKind.HIERARCHICAL:
        from docling_core.transforms.chunker import HierarchicalChunker
        chunker = HierarchicalChunker(
            always_emit_headings=cfg.hierarchical_chunker_options.always_emit_headings,
            merge_list_items=cfg.hierarchical_chunker_options.merge_list_items,
            **ser_kwargs,
        )
        return chunker, None

    # PAGE
    from docling_core.transforms.chunker import PageChunker
    return PageChunker(**ser_kwargs), None


def chunk_document(
    dl_doc,
    chunker,
    tokenizer,
    cfg: ChunkPipelineConfig,
    run_id: str = "",
    extra_payload: Optional[Dict[str, Any]] = None,
):
    """
    Chunk a DoclingDocument and build one payload per chunk.

    Args:
        dl_doc:        the DoclingDocument
        chunker:       chunker from build_chunker()
        tokenizer:     tokenizer from build_chunker() (or None)
        cfg:           chunk config (serialization + metadata options)
        run_id:        Docling run ID stored as payload["run_id"] if enabled
        extra_payload: extra fields merged into every payload (e.g. doc_name,
                       file_path, course from the RAG Tester). Applied LAST so
                       they override auto-detected values like doc_source.

    Returns:
        (texts, payloads, raw_count) — empty/whitespace chunks are already
        filtered out; raw_count is the number of chunks before filtering.
    """
    raw_chunks = list(chunker.chunk(dl_doc))
    texts: List[str] = []
    payloads: List[Dict[str, Any]] = []

    for idx, chunk in enumerate(raw_chunks):
        # Serialize chunk text (contextualize prepends heading context)
        text = chunker.contextualize(chunk) if cfg.serialization.include_headings_in_text else chunk.text

        # Filter out empty / whitespace-only chunks — these would produce
        # NaN embeddings and cause Qdrant upsert to fail.
        if not text or not text.strip():
            continue

        meta = chunk.meta
        payload: Dict[str, Any] = {
            "chunk_text": chunk.text,       # raw chunk text (without heading prefix)
            "embedded_text": text,          # the text that was actually embedded
            "chunk_index": idx,
        }
        # Store the embedding models so retrievers can encode the query with
        # the SAME model (the vector dimension alone is ambiguous, e.g. 768).
        if cfg.embedding.mode in (EmbeddingMode.DENSE, EmbeddingMode.HYBRID):
            payload["dense_model"] = cfg.embedding.dense_model
        if cfg.embedding.mode in (EmbeddingMode.SPARSE, EmbeddingMode.HYBRID):
            payload["sparse_model"] = cfg.embedding.sparse_model

        if cfg.metadata.add_run_id:
            payload["run_id"] = run_id
        if cfg.metadata.add_doc_source:
            origin = getattr(meta, "origin", None)
            payload["doc_source"] = getattr(origin, "filename", run_id)
        if cfg.metadata.add_headings:
            payload["headings"] = getattr(meta, "headings", None) or []
        if cfg.metadata.add_page_numbers:
            pages = _get_page_numbers(getattr(meta, "doc_items", []))
            payload["page_numbers"] = pages
            # Convenience scalar for simple range/equality filters in Qdrant
            payload["page_start"] = pages[0] if pages else None
        if cfg.metadata.add_element_types:
            payload["element_types"] = _get_element_types(getattr(meta, "doc_items", []))
        if cfg.metadata.add_token_count:
            payload["token_count"] = _count_tokens_simple(text, tokenizer)

        # Custom static fields from the profile, then caller-supplied fields
        payload.update(cfg.metadata.custom_fields)
        if extra_payload:
            payload.update(extra_payload)

        texts.append(text)
        payloads.append(payload)

    return texts, payloads, len(raw_chunks)


class EmbeddingModels:
    """
    Holds the fastembed models for one embedding config so they are loaded
    only ONCE (important when embedding many documents in the RAG Tester).
    """

    def __init__(self, cfg: ChunkPipelineConfig):
        from fastembed import TextEmbedding, SparseTextEmbedding

        self.mode = cfg.embedding.mode
        self.batch_size = cfg.embedding.batch_size
        self.dense = None
        self.sparse = None
        self.dense_dim: Optional[int] = None

        if self.mode in (EmbeddingMode.DENSE, EmbeddingMode.HYBRID):
            self.dense = TextEmbedding(model_name=cfg.embedding.dense_model)
            # Probe the vector size once
            self.dense_dim = len(list(self.dense.embed(["probe"]))[0])
        if self.mode in (EmbeddingMode.SPARSE, EmbeddingMode.HYBRID):
            self.sparse = SparseTextEmbedding(model_name=cfg.embedding.sparse_model)

    def embed(self, texts: List[str]):
        """Return (dense_vectors|None, sparse_vectors|None) for the texts."""
        dense = list(self.dense.embed(texts, batch_size=self.batch_size)) if self.dense else None
        sparse = list(self.sparse.embed(texts, batch_size=self.batch_size)) if self.sparse else None
        return dense, sparse


def ensure_text_collection(client, collection_name: str, cfg: ChunkPipelineConfig, dense_dim: Optional[int]) -> bool:
    """
    Create the Qdrant collection for the given embedding mode if missing.
    Returns True if it was created, False if it already existed.
    """
    from qdrant_client.models import Distance, VectorParams, SparseVectorParams, SparseIndexParams

    if client.collection_exists(collection_name):
        return False

    mode = cfg.embedding.mode
    if mode == EmbeddingMode.DENSE:
        client.create_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(size=dense_dim, distance=Distance.COSINE),
            on_disk_payload=cfg.qdrant.on_disk_payload,
        )
    elif mode == EmbeddingMode.SPARSE:
        client.create_collection(
            collection_name=collection_name,
            vectors_config={},
            sparse_vectors_config={"sparse": SparseVectorParams(index=SparseIndexParams(on_disk=False))},
            on_disk_payload=cfg.qdrant.on_disk_payload,
        )
    else:  # HYBRID — named vectors "dense" + "sparse"
        client.create_collection(
            collection_name=collection_name,
            vectors_config={"dense": VectorParams(size=dense_dim, distance=Distance.COSINE)},
            sparse_vectors_config={"sparse": SparseVectorParams(index=SparseIndexParams(on_disk=False))},
            on_disk_payload=cfg.qdrant.on_disk_payload,
        )
    return True


def build_points(texts, payloads, dense_vectors, sparse_vectors, mode: EmbeddingMode):
    """
    Build Qdrant PointStructs. Points with NaN/Inf vectors are skipped.
    Returns (points, nan_skipped).
    """
    import math
    from qdrant_client.models import PointStruct, SparseVector

    def _bad(vals) -> bool:
        return any(math.isnan(v) or math.isinf(v) for v in vals)

    points = []
    nan_skipped = 0
    for i, payload in enumerate(payloads):
        point_id = str(uuid.uuid4())
        if mode == EmbeddingMode.DENSE:
            vec = dense_vectors[i].tolist()
            if _bad(vec):
                nan_skipped += 1
                continue
            points.append(PointStruct(id=point_id, vector=vec, payload=payload))
        elif mode == EmbeddingMode.SPARSE:
            sv = sparse_vectors[i]
            sv_vals = sv.values.tolist()
            if _bad(sv_vals):
                nan_skipped += 1
                continue
            points.append(PointStruct(
                id=point_id,
                vector={"sparse": SparseVector(indices=sv.indices.tolist(), values=sv_vals)},
                payload=payload,
            ))
        else:  # HYBRID
            sv = sparse_vectors[i]
            dv = dense_vectors[i].tolist()
            sv_vals = sv.values.tolist()
            if _bad(dv) or _bad(sv_vals):
                nan_skipped += 1
                continue
            points.append(PointStruct(
                id=point_id,
                vector={
                    "dense": dv,
                    "sparse": SparseVector(indices=sv.indices.tolist(), values=sv_vals),
                },
                payload=payload,
            ))
    return points, nan_skipped


def upsert_in_batches(client, collection_name: str, points, batch_size: int = 64):
    """
    Upsert points in batches. Yields the progress percentage after each batch.
    Uses the shared Qdrant write lock so concurrent tracks never write at once.
    """
    from services.qdrant_client_manager import qdrant_write_lock

    total = len(points)
    for start in range(0, total, batch_size):
        batch = points[start:start + batch_size]
        with qdrant_write_lock:
            client.upsert(collection_name=collection_name, points=batch)
        yield min(100, int((start + len(batch)) / max(total, 1) * 100))


# ---------------------------------------------------------------------------
# Main runner (Step 2 — single document)
# ---------------------------------------------------------------------------

def run_chunk_pipeline(cfg: ChunkPipelineConfig) -> Generator[str, None, Dict[str, Any]]:
    """
    Execute the chunk → embed → upsert pipeline.
    Yields log lines for SSE streaming.
    Returns a summary dict on completion.
    """
    start_time = time.time()
    chunk_run_id = datetime.now().strftime("%Y%m%d_%H%M%S")
    log = logging.getLogger(__name__)

    def emit(msg: str) -> str:
        """Yield a formatted log line."""
        ts = datetime.now().strftime("%H:%M:%S")
        line = f"[{ts}] {msg}"
        log.info(msg)
        return line

    # ------------------------------------------------------------------
    # Step 1: Load the DoclingDocument from the selected run
    # ------------------------------------------------------------------
    yield emit("📂 Loading Docling document...")

    run_dir = OUTPUTS_DIR / f"run_{cfg.source_run_id}"
    doc_json_path = run_dir / "parsed_doc.json"

    if not doc_json_path.exists():
        yield emit(f"❌ parsed_doc.json not found at: {doc_json_path}")
        return {"status": "error", "error": f"File not found: {doc_json_path}"}

    try:
        from docling_core.types.doc.document import DoclingDocument
        dl_doc = DoclingDocument.model_validate_json(doc_json_path.read_text("utf-8"))
        yield emit(f"✅ Loaded document: {dl_doc.name or cfg.source_run_id}")
    except Exception as exc:
        yield emit(f"❌ Failed to load document: {exc}")
        return {"status": "error", "error": str(exc)}

    # ------------------------------------------------------------------
    # Step 2: Build the chunker
    # ------------------------------------------------------------------
    yield emit(f"✂️  Building chunker: {cfg.chunker.value}...")
    try:
        chunker, active_tokenizer = build_chunker(cfg)
        yield emit(f"✅ Chunker ready: {type(chunker).__name__}")
    except Exception as exc:
        yield emit(f"❌ Failed to build chunker: {exc}")
        return {"status": "error", "error": str(exc)}

    # ------------------------------------------------------------------
    # Step 3: Chunk the document + build payloads
    # ------------------------------------------------------------------
    yield emit("✂️  Chunking document...")
    try:
        texts, payloads, raw_count = chunk_document(
            dl_doc, chunker, active_tokenizer, cfg, run_id=cfg.source_run_id
        )
        yield emit(f"✅ Produced {raw_count} raw chunks")
    except Exception as exc:
        yield emit(f"❌ Chunking failed: {exc}")
        return {"status": "error", "error": str(exc)}

    if not texts:
        yield emit("❌ All chunks were empty after filtering. Nothing to embed.")
        return {"status": "error", "error": "No non-empty chunks produced."}

    skipped = raw_count - len(texts)
    if skipped:
        yield emit(f"⚠️  Skipped {skipped} empty chunk(s) (headings with no body text)")

    avg_tokens = sum(p.get("token_count", 0) for p in payloads) / len(payloads)
    yield emit(f"📊 Avg token count per chunk: {avg_tokens:.0f} ({len(texts)} non-empty chunks)")

    # ------------------------------------------------------------------
    # Step 4: Load embedding models + build Qdrant collection
    # ------------------------------------------------------------------
    storage_path = _resolve_qdrant_path(cfg.qdrant.storage_path)
    collection_name = _build_collection_name(cfg)
    mode = cfg.embedding.mode

    yield emit(f"🗄️  Connecting to Qdrant at: {storage_path}")
    from services.qdrant_client_manager import get_qdrant_client
    client = get_qdrant_client(str(storage_path))

    try:
        models = EmbeddingModels(cfg)
    except Exception as exc:
        yield emit(f"❌ Failed to load embedding model(s): {exc}")
        return {"status": "error", "error": str(exc)}

    # Delete collection if overwrite requested
    if cfg.qdrant.overwrite_collection and client.collection_exists(collection_name):
        client.delete_collection(collection_name)
        yield emit(f"🗑️  Deleted existing collection '{collection_name}'")

    yield emit(f"🏗️  Preparing collection '{collection_name}' (mode={mode.value})...")
    created = ensure_text_collection(client, collection_name, cfg, models.dense_dim)
    if created:
        dims = f"{models.dense_dim}-dim dense" if models.dense_dim else ""
        yield emit(f"✅ Collection created ({mode.value}{', ' + dims if dims else ''})")
    else:
        yield emit(f"➕ Appending to existing collection '{collection_name}'")

    # ------------------------------------------------------------------
    # Step 5: Embed texts
    # ------------------------------------------------------------------
    yield emit(f"🔢 Embedding {len(texts)} chunks (mode={mode.value})...")
    try:
        dense_vectors, sparse_vectors = models.embed(texts)
    except Exception as exc:
        yield emit(f"❌ Embedding failed: {exc}")
        return {"status": "error", "error": str(exc)}

    if dense_vectors is not None:
        # --- Diagnostic: inspect first vector to catch silent NaN/zero issues ---
        import numpy as np
        first_vec = np.array(dense_vectors[0])
        nan_count = int(np.isnan(first_vec).sum())
        inf_count = int(np.isinf(first_vec).sum())
        total_nan_chunks = sum(
            1 for v in dense_vectors if np.isnan(np.array(v)).any() or np.isinf(np.array(v)).any()
        )
        sample_vals = [round(float(x), 5) for x in first_vec[:6]]
        yield emit(
            f"🔬 Dense vector diagnostic — dim: {len(first_vec)}, "
            f"first 6 values: {sample_vals}, "
            f"NaN in first vec: {nan_count}, Inf in first vec: {inf_count}, "
            f"chunks with NaN/Inf: {total_nan_chunks}/{len(dense_vectors)}"
        )
        if total_nan_chunks == len(dense_vectors):
            yield emit(
                f"❌ ALL dense vectors are NaN/Inf. "
                f"Model '{cfg.embedding.dense_model}' likely failed to load correctly. "
                f"Try switching to 'BAAI/bge-small-en-v1.5' (the most reliable fallback). "
                f"You may also need to clear the fastembed cache: "
                f"rm -rf ~/.cache/fastembed/{cfg.embedding.dense_model.replace('/', '_')}"
            )
            return {"status": "error", "error": "All dense vectors NaN — model load issue."}
        yield emit(f"✅ Dense embeddings done ({len(dense_vectors)} vectors)")

    if sparse_vectors is not None:
        yield emit(f"✅ Sparse embeddings done ({len(sparse_vectors)} vectors)")

    # ------------------------------------------------------------------
    # Step 6: Build PointStructs and upsert in batches
    # ------------------------------------------------------------------
    yield emit("⬆️  Upserting points to Qdrant...")
    points, nan_skipped = build_points(texts, payloads, dense_vectors, sparse_vectors, mode)
    for pct in upsert_in_batches(client, collection_name, points):
        yield f"__PROGRESS__={pct}"

    if nan_skipped:
        yield emit(
            f"⚠️  Skipped {nan_skipped}/{len(texts)} chunk(s) with NaN/Inf vectors. "
            f"This usually means the embedding model produced bad output for those chunks. "
            f"Try a different dense model or check for extremely short/unusual chunk texts."
        )

    upserted_count = len(points)

    # Abort with a clear error if nothing was upserted — avoids leaving
    # an empty, misleading collection in Qdrant.
    if upserted_count == 0:
        if created:
            try:
                client.delete_collection(collection_name)
            except Exception:
                pass
        yield emit(
            "❌ All vectors were invalid (NaN/Inf) — no points upserted. "
            "Collection has been removed. "
            "Cause: the selected embedding model may not support the chunk texts. "
            "Try Dense mode first, or switch to a different dense model."
        )
        return {
            "status": "error",
            "error": "All vectors were NaN/Inf — no points stored.",
            "chunk_count": 0,
        }

    elapsed = time.time() - start_time
    yield emit(f"✅ Upserted {upserted_count} chunks into '{collection_name}' in {elapsed:.1f}s")
    yield emit(f"🏁 Chunk pipeline complete. Collection: {collection_name}")

    return {
        "status": "success",
        "chunk_run_id": chunk_run_id,
        "collection_name": collection_name,
        "chunk_count": upserted_count,
        "avg_tokens": round(avg_tokens, 1),
        "elapsed_seconds": round(elapsed, 2),
        "source_run_id": cfg.source_run_id,
    }
