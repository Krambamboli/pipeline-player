"""
ColPali Pipeline Schema
-------------------------
Pydantic models for the ColPali visual document retrieval pipeline.

ColPali processes PDF pages as images and generates multi-vector embeddings
(one set of patch vectors per page) for late-interaction retrieval via MaxSim.
"""

from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class ColPaliConfig(BaseModel):
    """Configuration for the ColPali visual retrieval pipeline."""

    # Document input
    pdf_path: str = Field(..., description="Path to the PDF file to process.")

    # Model settings
    model_name: str = Field(
        default="vidore/colqwen2-v1.0",
        description="HuggingFace model ID for the ColPali/ColQwen2 model."
    )
    device: str = Field(
        default="mps",
        description="PyTorch device to use: 'mps' (Apple Silicon), 'cuda', or 'cpu'."
    )
    batch_size: int = Field(
        default=2,
        description="Number of pages to embed per batch. Lower = less VRAM usage."
    )

    # Image conversion settings
    dpi: int = Field(
        default=144,
        description="DPI for PDF → image conversion. Higher = more detail but slower."
    )
    max_pages: Optional[int] = Field(
        default=None,
        description="Limit the number of pages to process. None = all pages."
    )

    # User-provided metadata enrichment (attached to every page's Qdrant payload)
    metadata: Dict[str, str] = Field(
        default_factory=dict,
        description="Key-value metadata to attach to each page (e.g. course name, document title)."
    )

    # Qdrant settings
    collection_name: str = Field(
        default="",
        description="Target Qdrant collection name. Auto-generated if empty."
    )
    qdrant_storage_path: str = Field(
        default="",
        description="Path to local Qdrant storage directory."
    )


class ColPaliRetrieveRequest(BaseModel):
    """Request body for MaxSim retrieval against a ColPali collection."""
    collection_name: str = Field(..., description="Name of the ColPali Qdrant collection.")
    query: str = Field(..., description="Natural language search query.")
    limit: int = Field(default=5, description="Number of top pages to return.")


class ColPaliRetrievedPage(BaseModel):
    """A single page result from MaxSim retrieval."""
    id: str
    score: float
    page_number: int
    doc_source: str
    metadata: Dict[str, str] = Field(default_factory=dict)


class ColPaliRetrieveResponse(BaseModel):
    """Response from a ColPali MaxSim retrieval query."""
    query: str
    results: List[ColPaliRetrievedPage]
