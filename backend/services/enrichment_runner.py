"""
Enrichment Pipeline Runner
---------------------------
Streaming SSE generator that orchestrates Step 4 enrichment.
Dispatches to the appropriate strategy-specific enricher module.

Usage (from the FastAPI router):
    async for line in run_enrichment(cfg):
        yield line
"""

from __future__ import annotations

import logging
import time
from pathlib import Path
from typing import AsyncGenerator

from models.enrichment_schema import EnrichmentConfig, EnrichStrategy
from services.llm_client import OllamaClient
from services.chunk_runner import REPO_ROOT, _resolve_qdrant_path

logger = logging.getLogger(__name__)


def _build_output_collection(cfg: EnrichmentConfig) -> str:
    """Derive the output collection name from source + strategy (or explicit suffix)."""
    suffix = cfg.output_collection_suffix.strip()
    if not suffix:
        strategy_suffix_map = {
            EnrichStrategy.PARENT_CHILD: "_parentchild",
            EnrichStrategy.RAPTOR:       "_raptor",
            EnrichStrategy.GRAPH_RAG:    "_graphrag",
        }
        suffix = strategy_suffix_map.get(cfg.strategy, "_enriched")
    return f"{cfg.source_collection}{suffix}"


def _emit(msg: str) -> str:
    """Format a log/status line for SSE streaming (mirrors chunk_runner convention)."""
    import datetime
    ts = datetime.datetime.now().strftime("%H:%M:%S")
    return f"[{ts}] {msg}"


async def run_enrichment(cfg: EnrichmentConfig) -> AsyncGenerator[str, None]:
    """
    Top-level enrichment pipeline generator.

    Yields:
        "__PROGRESS__=<0-100>" strings for progress bar updates
        "[HH:MM:SS] ..." log lines for the live log display
    """
    emit = _emit
    start = time.time()

    # ------------------------------------------------------------------ 
    # Setup
    # ------------------------------------------------------------------
    output_collection = _build_output_collection(cfg)

    yield emit(f"🚀 Starting enrichment: strategy={cfg.strategy.value}")
    yield emit(f"   Source  : {cfg.source_collection}")
    yield emit(f"   Output  : {output_collection}")
    yield emit(f"   LLM     : {cfg.llm.host}  model={cfg.llm.model}")

    # Resolve Qdrant path
    qdrant_path = _resolve_qdrant_path(
        cfg.qdrant_storage_path or str(REPO_ROOT / "qdrant_storage")
    )

    # Verify source collection exists using the shared singleton client
    from services.qdrant_client_manager import get_qdrant_client
    try:
        qc = get_qdrant_client(str(qdrant_path))
        if not qc.collection_exists(cfg.source_collection):
            yield emit(f"❌ Source collection '{cfg.source_collection}' not found.")
            return
        info = qc.get_collection(cfg.source_collection)
    except Exception as exc:
        yield emit(f"❌ Cannot open Qdrant: {exc}")
        return

    # Detect dense model from source collection vector config
    vec_cfg = info.config.params.vectors
    if isinstance(vec_cfg, dict):
        first = next(iter(vec_cfg.values()))
        source_dim = getattr(first, "size", 384)
    else:
        source_dim = getattr(vec_cfg, "size", 384)

    # Map dim → a known fastembed model that matches
    # (best-effort — user can override via cfg later)
    _DIM_MODEL_MAP = {
        384:  "BAAI/bge-small-en-v1.5",
        768:  "sentence-transformers/paraphrase-multilingual-mpnet-base-v2",
        1024: "intfloat/multilingual-e5-large",
    }
    dense_model_name = _DIM_MODEL_MAP.get(source_dim, "BAAI/bge-small-en-v1.5")
    yield emit(f"📐 Source dim: {source_dim}d → using embed model: {dense_model_name}")

    # Build LLM client
    llm = OllamaClient(
        host=cfg.llm.host,
        model=cfg.llm.model,
        timeout_seconds=cfg.llm.timeout_seconds,
        max_retries=cfg.llm.max_retries,
    )

    # ------------------------------------------------------------------ 
    # Dispatch to strategy
    # ------------------------------------------------------------------
    common_kwargs = dict(
        source_collection=cfg.source_collection,
        output_collection=output_collection,
        qdrant_storage_path=str(qdrant_path),
        llm_client=llm,
        dense_model_name=dense_model_name,
        emit=emit,
    )

    if cfg.strategy == EnrichStrategy.PARENT_CHILD:
        from services.enrichers.parent_child import run_parent_child
        async for line in run_parent_child(
            options=cfg.parent_child_options,
            **common_kwargs,
        ):
            yield line

    elif cfg.strategy == EnrichStrategy.RAPTOR:
        from services.enrichers.raptor import run_raptor
        async for line in run_raptor(
            options=cfg.raptor_options,
            **common_kwargs,
        ):
            yield line

    elif cfg.strategy == EnrichStrategy.GRAPH_RAG:
        from services.enrichers.graph_rag import run_graph_rag
        async for line in run_graph_rag(
            options=cfg.graph_rag_options,
            **common_kwargs,
        ):
            yield line

    else:
        yield emit(f"❌ Unknown strategy: {cfg.strategy}")

    total = time.time() - start
    yield emit(f"⏱️  Total pipeline time: {total:.1f}s")
