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
# Main runner
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
        if cfg.chunker == ChunkerKind.HYBRID:
            from docling.chunking import HybridChunker
            from docling_core.transforms.chunker.tokenizer.huggingface import HuggingFaceTokenizer
            from transformers import AutoTokenizer

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
            )
            active_tokenizer = hf_tok

        elif cfg.chunker == ChunkerKind.HIERARCHICAL:
            from docling_core.transforms.chunker import HierarchicalChunker
            chunker = HierarchicalChunker(
                always_emit_headings=cfg.hierarchical_chunker_options.always_emit_headings,
                merge_list_items=cfg.hierarchical_chunker_options.merge_list_items,
            )
            active_tokenizer = None

        else:  # PAGE
            from docling_core.transforms.chunker import PageChunker
            chunker = PageChunker()
            active_tokenizer = None

        yield emit(f"✅ Chunker ready: {type(chunker).__name__}")
    except Exception as exc:
        yield emit(f"❌ Failed to build chunker: {exc}")
        return {"status": "error", "error": str(exc)}

    # ------------------------------------------------------------------
    # Step 3: Chunk the document + build payloads
    # ------------------------------------------------------------------
    yield emit("✂️  Chunking document...")

    try:
        raw_chunks = list(chunker.chunk(dl_doc))
        yield emit(f"✅ Produced {len(raw_chunks)} raw chunks")
    except Exception as exc:
        yield emit(f"❌ Chunking failed: {exc}")
        return {"status": "error", "error": str(exc)}

    # Build texts and payloads
    texts: List[str] = []
    payloads: List[Dict[str, Any]] = []

    for idx, chunk in enumerate(raw_chunks):
        # Serialize chunk text (contextualize prepends heading context)
        if cfg.serialization.include_headings_in_text:
            text = chunker.contextualize(chunk)
        else:
            text = chunk.text

        texts.append(text)

        # Build metadata payload
        meta = chunk.meta
        payload: Dict[str, Any] = {
            "chunk_text": chunk.text,       # raw chunk text (without heading prefix)
            "embedded_text": text,          # the text that was actually embedded
            "chunk_index": idx,
        }

        if cfg.metadata.add_run_id:
            payload["run_id"] = cfg.source_run_id
        if cfg.metadata.add_doc_source:
            origin = getattr(meta, "origin", None)
            payload["doc_source"] = getattr(origin, "filename", cfg.source_run_id)
        if cfg.metadata.add_headings:
            payload["headings"] = getattr(meta, "headings", None) or []
        if cfg.metadata.add_page_numbers:
            doc_items = getattr(meta, "doc_items", [])
            payload["page_numbers"] = _get_page_numbers(doc_items)
        if cfg.metadata.add_element_types:
            doc_items = getattr(meta, "doc_items", [])
            payload["element_types"] = _get_element_types(doc_items)
        if cfg.metadata.add_token_count:
            payload["token_count"] = _count_tokens_simple(text, active_tokenizer)

        # Custom static fields
        payload.update(cfg.metadata.custom_fields)

        payloads.append(payload)

    # ------------------------------------------------------------------
    # Filter out empty / whitespace-only chunks — these would produce
    # NaN embeddings and cause Qdrant upsert to fail.
    # ------------------------------------------------------------------
    before_filter = len(texts)
    filtered = [(t, p) for t, p in zip(texts, payloads) if t and t.strip()]
    if not filtered:
        yield emit("❌ All chunks were empty after filtering. Nothing to embed.")
        return {"status": "error", "error": "No non-empty chunks produced."}

    texts, payloads = zip(*filtered)  # type: ignore[assignment]
    texts = list(texts)
    payloads = list(payloads)

    skipped = before_filter - len(texts)
    if skipped:
        yield emit(f"⚠️  Skipped {skipped} empty chunk(s) (headings with no body text)")

    avg_tokens = (
        sum(p.get("token_count", 0) for p in payloads) / len(payloads)
        if payloads else 0
    )
    yield emit(f"📊 Avg token count per chunk: {avg_tokens:.0f} ({len(texts)} non-empty chunks)")

    # ------------------------------------------------------------------
    # Step 4: Build Qdrant collection + embed + upsert
    # ------------------------------------------------------------------
    from qdrant_client import QdrantClient
    from qdrant_client.models import (
        Distance,
        VectorParams,
        SparseVectorParams,
        SparseIndexParams,
        PointStruct,
        SparseVector,
    )
    from fastembed import TextEmbedding, SparseTextEmbedding

    storage_path = _resolve_qdrant_path(cfg.qdrant.storage_path)
    collection_name = _build_collection_name(cfg)
    mode = cfg.embedding.mode

    yield emit(f"🗄️  Connecting to Qdrant at: {storage_path}")
    client = QdrantClient(path=str(storage_path))

    # Delete collection if overwrite requested
    if cfg.qdrant.overwrite_collection:
        existing = [c.name for c in client.get_collections().collections]
        if collection_name in existing:
            client.delete_collection(collection_name)
            yield emit(f"🗑️  Deleted existing collection '{collection_name}'")

    existing_collections = [c.name for c in client.get_collections().collections]

    if collection_name not in existing_collections:
        yield emit(f"🏗️  Creating collection '{collection_name}' (mode={mode.value})...")

        if mode == EmbeddingMode.DENSE:
            # Probe vector size by embedding one chunk
            dense_model = TextEmbedding(model_name=cfg.embedding.dense_model)
            sample = list(dense_model.embed(["probe"]))[0]
            dim = len(sample)
            client.create_collection(
                collection_name=collection_name,
                vectors_config=VectorParams(size=dim, distance=Distance.COSINE),
                on_disk_payload=cfg.qdrant.on_disk_payload,
            )
            yield emit(f"✅ Dense collection created ({dim}-dim, cosine)")

        elif mode == EmbeddingMode.SPARSE:
            client.create_collection(
                collection_name=collection_name,
                vectors_config={},
                sparse_vectors_config={
                    "sparse": SparseVectorParams(index=SparseIndexParams(on_disk=False))
                },
                on_disk_payload=cfg.qdrant.on_disk_payload,
            )
            yield emit("✅ Sparse collection created (BM25)")

        else:  # HYBRID
            dense_model_probe = TextEmbedding(model_name=cfg.embedding.dense_model)
            sample = list(dense_model_probe.embed(["probe"]))[0]
            dim = len(sample)
            client.create_collection(
                collection_name=collection_name,
                vectors_config={
                    "dense": VectorParams(size=dim, distance=Distance.COSINE)
                },
                sparse_vectors_config={
                    "sparse": SparseVectorParams(index=SparseIndexParams(on_disk=False))
                },
                on_disk_payload=cfg.qdrant.on_disk_payload,
            )
            yield emit(f"✅ Hybrid collection created ({dim}-dim dense + sparse BM25)")
    else:
        yield emit(f"➕ Appending to existing collection '{collection_name}'")

    # ------------------------------------------------------------------
    # Step 5: Embed texts
    # ------------------------------------------------------------------
    yield emit(f"🔢 Embedding {len(texts)} chunks (mode={mode.value})...")

    dense_vectors: Optional[List] = None
    sparse_vectors: Optional[List] = None

    if mode in (EmbeddingMode.DENSE, EmbeddingMode.HYBRID):
        try:
            dense_model = TextEmbedding(
                model_name=cfg.embedding.dense_model,
                batch_size=cfg.embedding.batch_size,
            )
            dense_vectors = list(dense_model.embed(texts))
        except Exception as exc:
            yield emit(f"❌ Dense embedding failed: {exc}")
            return {"status": "error", "error": str(exc)}

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

    if mode in (EmbeddingMode.SPARSE, EmbeddingMode.HYBRID):
        sparse_model = SparseTextEmbedding(
            model_name=cfg.embedding.sparse_model,
            batch_size=cfg.embedding.batch_size,
        )
        sparse_vectors = list(sparse_model.embed(texts))
        yield emit(f"✅ Sparse embeddings done ({len(sparse_vectors)} vectors)")

    # ------------------------------------------------------------------
    # Step 6: Build PointStructs and upsert in batches
    # ------------------------------------------------------------------
    yield emit("⬆️  Upserting points to Qdrant...")

    import math
    BATCH_SIZE = 64
    points: List[PointStruct] = []
    nan_skipped = 0

    for i, (text, payload) in enumerate(zip(texts, payloads)):
        point_id = str(uuid.uuid4())

        if mode == EmbeddingMode.DENSE:
            vec = dense_vectors[i].tolist()
            # Guard: skip points with NaN/Inf in dense vector
            if any(math.isnan(v) or math.isinf(v) for v in vec):
                nan_skipped += 1
                continue
            point = PointStruct(id=point_id, vector=vec, payload=payload)

        elif mode == EmbeddingMode.SPARSE:
            sv = sparse_vectors[i]
            sv_vals = sv.values.tolist()
            if any(math.isnan(v) or math.isinf(v) for v in sv_vals):
                nan_skipped += 1
                continue
            point = PointStruct(
                id=point_id,
                vector={"sparse": SparseVector(
                    indices=sv.indices.tolist(),
                    values=sv_vals,
                )},
                payload=payload,
            )

        else:  # HYBRID
            sv = sparse_vectors[i]
            dv = dense_vectors[i].tolist()
            sv_vals = sv.values.tolist()
            # Guard: skip if either vector has NaN/Inf
            if (any(math.isnan(v) or math.isinf(v) for v in dv) or
                    any(math.isnan(v) or math.isinf(v) for v in sv_vals)):
                nan_skipped += 1
                continue
            point = PointStruct(
                id=point_id,
                vector={
                    "dense": dv,
                    "sparse": SparseVector(
                        indices=sv.indices.tolist(),
                        values=sv_vals,
                    ),
                },
                payload=payload,
            )

        points.append(point)

        # Upsert in batches for progress reporting
        if len(points) == BATCH_SIZE or i == len(texts) - 1:
            if points:  # only upsert if there's something to send
                client.upsert(collection_name=collection_name, points=points)
            yield f"__PROGRESS__={min(100, int((i + 1) / len(texts) * 100))}"
            points = []

    if nan_skipped:
        yield emit(
            f"⚠️  Skipped {nan_skipped}/{len(texts)} chunk(s) with NaN/Inf vectors. "
            f"This usually means the embedding model produced bad output for those chunks. "
            f"Try a different dense model or check for extremely short/unusual chunk texts."
        )

    upserted_count = len(texts) - nan_skipped

    # Abort with a clear error if nothing was upserted — avoids leaving
    # an empty, misleading collection in Qdrant.
    if upserted_count == 0:
        # Clean up the empty collection we just created
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
