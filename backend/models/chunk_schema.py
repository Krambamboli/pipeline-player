"""
Chunk Pipeline Configuration Schema
------------------------------------
Pydantic models for all chunking, serialization, metadata enrichment,
embedding and Qdrant storage options. These mirror the parameters of
Docling's chunking API and Qdrant's vector configuration.

References:
  https://docling-project.github.io/docling/concepts/chunking/
  https://github.com/qdrant/qdrant-client
"""

from __future__ import annotations

from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class ChunkerKind(str, Enum):
    """Available Docling chunker strategies."""
    HYBRID = "hybrid"
    HIERARCHICAL = "hierarchical"
    PAGE = "page"


class EmbeddingMode(str, Enum):
    """
    Controls which vector type(s) are generated and stored in Qdrant.
    - dense:  single dense vector per chunk (e.g. BAAI/bge-small-en-v1.5)
    - sparse: single sparse vector per chunk (BM25/BM42 keyword-based)
    - hybrid: both dense + sparse vectors stored per point (enables RRF fusion)
    """
    DENSE = "dense"
    SPARSE = "sparse"
    HYBRID = "hybrid"


# ---------------------------------------------------------------------------
# Chunker option groups
# ---------------------------------------------------------------------------

class HybridChunkerOptions(BaseModel):
    """
    Options for Docling's HybridChunker, which splits documents respecting
    heading hierarchy while enforcing a token-count limit per chunk.
    """
    tokenizer_model: str = Field(
        default="BAAI/bge-small-en-v1.5",
        description=(
            "Hugging Face tokenizer to use for counting tokens. Should match "
            "the embedding model to ensure chunks fit the model's context window."
        ),
    )
    max_tokens: int = Field(
        default=512,
        ge=32,
        le=8192,
        description=(
            "Maximum number of tokens per chunk. Chunks exceeding this limit "
            "are split further. Typical values: 256–512 for dense retrieval models."
        ),
    )
    repeat_table_header: bool = Field(
        default=True,
        description=(
            "When a table spans multiple chunks, repeat the table header row "
            "at the start of each continuation chunk for context."
        ),
    )
    merge_peers: bool = Field(
        default=True,
        description=(
            "Merge small sibling chunks at the same heading level into a single "
            "chunk if their combined token count is below max_tokens. Reduces "
            "the number of tiny orphan chunks."
        ),
    )
    omit_header_on_overflow: bool = Field(
        default=False,
        description=(
            "If a chunk's content alone already exceeds max_tokens, omit the "
            "heading prefix rather than creating an oversized chunk. Use when "
            "individual sections are extremely long."
        ),
    )
    always_emit_headings: bool = Field(
        default=False,
        description=(
            "Emit a standalone chunk for every heading element, even if the "
            "heading has no body text beneath it. Useful for navigation-heavy docs."
        ),
    )


class HierarchicalChunkerOptions(BaseModel):
    """
    Options for Docling's HierarchicalChunker, which creates one chunk per
    document section without enforcing a token limit.
    """
    always_emit_headings: bool = Field(
        default=False,
        description="Emit standalone chunks for headings with no body text.",
    )
    merge_list_items: bool = Field(
        default=True,
        description=(
            "Merge consecutive list items at the same level into a single chunk "
            "instead of creating one chunk per bullet. Reduces chunk fragmentation."
        ),
    )


# ---------------------------------------------------------------------------
# Serialization options
# ---------------------------------------------------------------------------

class SerializationOptions(BaseModel):
    """
    Controls how each chunk's text is assembled from the document elements.
    These options affect what text is embedded and stored as chunk_text.
    """
    include_headings_in_text: bool = Field(
        default=True,
        description=(
            "Prepend the heading path (e.g. 'Section 1 > Subsection A') to the "
            "chunk text before embedding. Improves retrieval accuracy for queries "
            "that reference section names."
        ),
    )
    include_captions_in_text: bool = Field(
        default=True,
        description=(
            "Include figure and table captions in the chunk text. Captions often "
            "contain key descriptive information about visual elements."
        ),
    )


# ---------------------------------------------------------------------------
# Metadata enrichment options
# ---------------------------------------------------------------------------

class MetadataEnrichmentOptions(BaseModel):
    """
    Controls what metadata is stored in the Qdrant payload alongside each chunk.
    Rich metadata enables faceted filtering and structured retrieval.
    """
    add_doc_source: bool = Field(
        default=True,
        description="Store the source document filename in the payload.",
    )
    add_run_id: bool = Field(
        default=True,
        description="Store the Docling run ID that produced this document.",
    )
    add_page_numbers: bool = Field(
        default=True,
        description=(
            "Extract and store the page number(s) that each chunk spans. "
            "Enables page-level citation generation."
        ),
    )
    add_headings: bool = Field(
        default=True,
        description=(
            "Store the heading path above each chunk as a list. Enables "
            "course/chapter/section reference generation."
        ),
    )
    add_element_types: bool = Field(
        default=True,
        description=(
            "Store a list of DocItem labels (e.g. 'text', 'table', 'figure') "
            "present in the chunk. Useful for content-type filtering."
        ),
    )
    add_token_count: bool = Field(
        default=True,
        description="Store the token count of the chunk text in the payload.",
    )
    custom_fields: Dict[str, Any] = Field(
        default_factory=dict,
        description=(
            "Optional static key-value pairs added to every chunk's payload. "
            "Use for domain metadata like course_id, document_type, language, etc. "
            "Example: {\"course\": \"ML101\", \"semester\": \"WS2025\"}"
        ),
    )


# ---------------------------------------------------------------------------
# Embedding options
# ---------------------------------------------------------------------------

class EmbeddingOptions(BaseModel):
    """
    Controls the vector embedding strategy. Supports dense-only, sparse-only
    (BM25/BM42 keyword), or hybrid (both) — stored as named vectors in Qdrant.
    Designed to be forward-compatible with ColPali image embeddings.
    """
    mode: EmbeddingMode = Field(
        default=EmbeddingMode.DENSE,
        description=(
            "dense: one dense vector per chunk (semantic similarity). "
            "sparse: BM25 sparse vector (keyword retrieval). "
            "hybrid: both dense + sparse, enabling RRF fusion queries later."
        ),
    )
    dense_model: str = Field(
        default="BAAI/bge-small-en-v1.5",
        description=(
            "fastembed model ID for dense embedding. Downloaded automatically "
            "on first use (~130 MB). Other options: 'BAAI/bge-base-en-v1.5' (768-dim, "
            "higher quality but 4× slower), 'sentence-transformers/all-MiniLM-L6-v2'."
        ),
    )
    sparse_model: str = Field(
        default="Qdrant/bm25",
        description=(
            "fastembed model ID for sparse embedding (BM25/BM42). "
            "Only used when mode is 'sparse' or 'hybrid'."
        ),
    )
    batch_size: int = Field(
        default=32,
        ge=1,
        le=512,
        description="Number of chunks embedded per batch. Larger = faster but more RAM.",
    )


# ---------------------------------------------------------------------------
# Qdrant storage options
# ---------------------------------------------------------------------------

class QdrantOptions(BaseModel):
    """
    Configuration for the local Qdrant vector store.
    Uses on-disk storage (no Docker required).
    Designed to share one DB with future ColPali collections.
    """
    storage_path: str = Field(
        default="./qdrant_storage",
        description=(
            "Path to the local Qdrant storage directory. Relative paths are "
            "resolved from the repo root. The same storage is shared between "
            "Docling text collections and future ColPali image collections."
        ),
    )
    collection_name: str = Field(
        default="",
        description=(
            "Name of the Qdrant collection to upsert into. If empty, a name "
            "is auto-generated from the run ID and chunker mode "
            "(e.g. 'docling_dense_20240901_143022'). Use a fixed name to append "
            "multiple documents into the same collection."
        ),
    )
    overwrite_collection: bool = Field(
        default=False,
        description=(
            "If True and the collection already exists, delete it and start fresh. "
            "If False, append chunks to the existing collection."
        ),
    )
    on_disk_payload: bool = Field(
        default=True,
        description=(
            "Store payload (metadata) on disk rather than in RAM. Recommended "
            "for large collections. Slightly higher latency but much lower RAM usage."
        ),
    )


# ---------------------------------------------------------------------------
# Root chunk pipeline config
# ---------------------------------------------------------------------------

class ChunkPipelineConfig(BaseModel):
    """
    Root configuration for the chunking & vectorization pipeline.
    Stored alongside the chunk run output for full reproducibility.
    """
    profile_name: str = Field(
        default="default-chunk",
        description="Human-readable name for this chunk configuration profile.",
    )
    description: str = Field(
        default="Default chunking & vectorization configuration",
        description="Optional description of what this chunk profile is tuned for.",
    )

    # Source: which Docling run to chunk
    source_run_id: str = Field(
        default="",
        description=(
            "Run ID of the Docling parse run to chunk "
            "(e.g. '20240901_143022_good-try'). The runner will look for "
            "parsed_doc.json in /outputs/run_{source_run_id}/."
        ),
    )

    # Chunker selection
    chunker: ChunkerKind = Field(
        default=ChunkerKind.HYBRID,
        description=(
            "Which Docling chunker strategy to use. "
            "hybrid: token-aware, respects heading hierarchy (recommended for RAG). "
            "hierarchical: one chunk per section, no token limit. "
            "page: one chunk per page."
        ),
    )

    # Nested option groups
    hybrid_chunker_options: HybridChunkerOptions = Field(
        default_factory=HybridChunkerOptions,
        description="Options for the HybridChunker (only used if chunker='hybrid').",
    )
    hierarchical_chunker_options: HierarchicalChunkerOptions = Field(
        default_factory=HierarchicalChunkerOptions,
        description="Options for the HierarchicalChunker (only used if chunker='hierarchical').",
    )
    serialization: SerializationOptions = Field(
        default_factory=SerializationOptions,
        description="Controls how chunk text is assembled from document elements.",
    )
    metadata: MetadataEnrichmentOptions = Field(
        default_factory=MetadataEnrichmentOptions,
        description="Controls what metadata is stored in each Qdrant point payload.",
    )
    embedding: EmbeddingOptions = Field(
        default_factory=EmbeddingOptions,
        description="Embedding model and mode (dense / sparse / hybrid).",
    )
    qdrant: QdrantOptions = Field(
        default_factory=QdrantOptions,
        description="Qdrant local storage and collection settings.",
    )
