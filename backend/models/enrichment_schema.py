"""
Enrichment Pipeline Configuration Schema
-----------------------------------------
Pydantic models for Step 4: Collection Enrichment.

Three enrichment strategies are supported:
  - parent_child : LLM summarises heading-grouped chunks → parent nodes
  - raptor       : UMAP + GMM clustering + recursive LLM summaries (RAPTOR)
  - graph_rag    : Entity/relation extraction → NetworkX graph (+ optional Neo4j)

References:
  https://arxiv.org/abs/2401.18059  (RAPTOR)
  https://microsoft.github.io/graphrag/  (GraphRAG)
"""

from __future__ import annotations

from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class EnrichStrategy(str, Enum):
    """Which enrichment algorithm to run."""
    PARENT_CHILD = "parent_child"
    RAPTOR       = "raptor"
    GRAPH_RAG    = "graph_rag"


class GraphBackend(str, Enum):
    """Backend used to persist the knowledge graph (GraphRAG only)."""
    NETWORKX = "networkx"  # in-process, saved as JSON in Qdrant payload
    NEO4J    = "neo4j"     # external Neo4j instance


# ---------------------------------------------------------------------------
# LLM (Ollama)
# ---------------------------------------------------------------------------

class OllamaConfig(BaseModel):
    """Connection settings for the local Ollama daemon."""
    host: str = Field(
        default="http://localhost:11434",
        description="Base URL of the Ollama HTTP API.",
    )
    model: str = Field(
        default="llama3.2",
        description=(
            "Name of the Ollama model to use. "
            "Run `ollama pull <model>` before using."
        ),
    )
    timeout_seconds: int = Field(
        default=120,
        description="Per-request timeout for LLM calls.",
    )
    max_retries: int = Field(
        default=2,
        description="Number of retries on transient Ollama errors.",
    )


# ---------------------------------------------------------------------------
# Per-strategy option groups
# ---------------------------------------------------------------------------

class ParentChildOptions(BaseModel):
    """Options for the Parent-Child enrichment strategy."""
    grouping_level: int = Field(
        default=1,
        ge=1,
        le=4,
        description=(
            "Which heading depth to group by before summarising. "
            "1 = top-level chapters, 2 = subsections, etc."
        ),
    )
    summary_max_tokens: int = Field(
        default=256,
        ge=64,
        le=1024,
        description="Target length (in tokens) for each generated parent summary.",
    )
    summary_prompt_template: str = Field(
        default=(
            "Summarise the following section of a document in {max_tokens} tokens "
            "or less. Focus on the key facts, definitions and conclusions.\n\n"
            "Section heading: {heading}\n\n"
            "Section content:\n{content}\n\n"
            "Summary:"
        ),
        description="Jinja-style prompt template for LLM summarisation calls.",
    )
    embed_summaries: bool = Field(
        default=True,
        description=(
            "Embed the generated parent summaries and store them in Qdrant "
            "alongside the original child vectors."
        ),
    )
    link_children: bool = Field(
        default=True,
        description=(
            "Update each child chunk's payload with a 'parent_id' field "
            "pointing back to its parent's Qdrant point ID."
        ),
    )


class RaptorOptions(BaseModel):
    """Options for the RAPTOR enrichment strategy."""
    max_levels: int = Field(
        default=3,
        ge=1,
        le=6,
        description=(
            "Maximum number of abstraction levels to build above the leaf chunks. "
            "The algorithm stops early if all chunks fit into a single cluster."
        ),
    )
    umap_n_components: int = Field(
        default=2,
        ge=2,
        le=10,
        description="Number of UMAP dimensions to reduce vectors to before clustering.",
    )
    umap_n_neighbors: int = Field(
        default=15,
        ge=5,
        le=50,
        description="UMAP n_neighbors parameter — controls local vs global structure.",
    )
    gmm_n_components: int = Field(
        default=0,
        ge=0,
        le=50,
        description=(
            "Number of GMM clusters per level. 0 = auto-detect with BIC. "
            "Set to a fixed value to override."
        ),
    )
    summary_max_tokens: int = Field(
        default=256,
        ge=64,
        le=1024,
        description="Target length for each cluster summary.",
    )


class GraphRagOptions(BaseModel):
    """Options for the GraphRAG enrichment strategy."""
    graph_backend: GraphBackend = Field(
        default=GraphBackend.NETWORKX,
        description=(
            "Where to persist the knowledge graph. "
            "'networkx' stores the graph as JSON in Qdrant payloads. "
            "'neo4j' writes to a running Neo4j instance."
        ),
    )
    neo4j_uri: str = Field(
        default="bolt://localhost:7687",
        description="Neo4j connection URI (ignored when graph_backend=networkx).",
    )
    neo4j_user: str = Field(
        default="neo4j",
        description="Neo4j username.",
    )
    neo4j_password: str = Field(
        default="",
        description="Neo4j password.",
    )
    max_entities_per_chunk: int = Field(
        default=10,
        ge=1,
        le=30,
        description="Maximum number of entities to extract from a single chunk.",
    )
    entity_types: List[str] = Field(
        default=["PERSON", "ORG", "LOCATION", "CONCEPT", "LAW", "DATE"],
        description="Entity types to extract. Passed verbatim to the LLM prompt.",
    )
    run_community_detection: bool = Field(
        default=True,
        description=(
            "Run Louvain community detection on the extracted graph and create "
            "one summary node per community."
        ),
    )
    community_summary_max_tokens: int = Field(
        default=512,
        ge=64,
        le=2048,
        description="Target length for community-level summaries.",
    )


# ---------------------------------------------------------------------------
# Top-level config
# ---------------------------------------------------------------------------

class EnrichmentConfig(BaseModel):
    """
    Full configuration for a single enrichment pipeline run.
    Submitted by the frontend as JSON to POST /api/enrich/run.
    """

    # Source
    source_collection: str = Field(
        description="Name of the Qdrant collection to enrich (must already exist).",
    )
    qdrant_storage_path: str = Field(
        default="",
        description=(
            "Path to the Qdrant storage directory. "
            "Leave empty to use the default (qdrant_storage/ in the repo root)."
        ),
    )

    # Strategy
    strategy: EnrichStrategy = Field(
        default=EnrichStrategy.PARENT_CHILD,
        description="Which enrichment algorithm to run.",
    )

    # LLM
    llm: OllamaConfig = Field(default_factory=OllamaConfig)

    # Per-strategy options (only the one matching 'strategy' is used)
    parent_child_options: ParentChildOptions = Field(
        default_factory=ParentChildOptions,
    )
    raptor_options: RaptorOptions = Field(
        default_factory=RaptorOptions,
    )
    graph_rag_options: GraphRagOptions = Field(
        default_factory=GraphRagOptions,
    )

    # Output
    output_collection_suffix: str = Field(
        default="",
        description=(
            "Suffix appended to the source collection name for the output collection. "
            "Defaults to the strategy name (e.g. '_parentchild', '_raptor', '_graphrag'). "
            "Set explicitly to override."
        ),
    )
