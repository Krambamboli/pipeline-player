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
ColPali Pipeline Schema
-------------------------
Pydantic models for the ColPali visual document retrieval pipeline.

ColPali processes PDF pages as images and generates multi-vector embeddings
(one set of patch vectors per page) for late-interaction retrieval via MaxSim.
"""

from typing import Dict, List, Optional
from pydantic import BaseModel, Field


# Receives PDF path, ColPali model/device/batch settings, DPI, metadata, and Qdrant target from the frontend (/colpali) via routers/colpali.py.
# Validates all parameters required to rasterize PDF pages and encode multi-vector page embeddings.
# Returns a validated ColPaliConfig instance to routers/colpali.py and services/colpali_runner.py.
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


# Receives document-independent ColPali process settings from the frontend Profile bar or YAML files via routers/profiles.py.
# Validates reusable ColPali model, rendering, and metadata settings so they can be persisted in configs/colpali/ and shared with the RAG Tester.
# Returns a validated ColPaliProcessProfile instance to services/profile_store.py and services/rag_tester_runner.py.
class ColPaliProcessProfile(BaseModel):
    """
    Savable ColPali *process* settings (everything except the document and the
    target collection). Stored as YAML in configs/colpali/<profile_name>.yaml so
    proven settings can be re-used on the ColPali page and in the RAG Tester.
    """

    profile_name: str = Field(default="default-colpali", description="Profile name (= file name).")
    description: str = Field(default="", description="Optional note about what this profile is tuned for.")
    model_name: str = Field(
        default="vidore/colqwen2-v1.0",
        description="HuggingFace model ID for the ColPali/ColQwen2 model."
    )
    device: str = Field(default="mps", description="PyTorch device: 'mps', 'cuda' or 'cpu'.")
    batch_size: int = Field(default=2, ge=1, le=64, description="Pages embedded per batch.")
    dpi: int = Field(default=144, ge=36, le=600, description="DPI for PDF → image rendering.")
    max_pages: Optional[int] = Field(
        default=None,
        description="Limit pages per document. None = all pages."
    )
    metadata: Dict[str, str] = Field(
        default_factory=dict,
        description="Static key-value metadata attached to every page payload."
    )


# Receives collection_name, natural-language query, and top-k limit from the frontend (/colpali/retrieve) via routers/colpali.py.
# Validates the request payload for late-interaction MaxSim visual page retrieval.
# Returns a validated ColPaliRetrieveRequest instance to routers/colpali.py and services/colpali_retriever.py.
class ColPaliRetrieveRequest(BaseModel):
    """Request body for MaxSim retrieval against a ColPali collection."""
    collection_name: str = Field(..., description="Name of the ColPali Qdrant collection.")
    query: str = Field(..., description="Natural language search query.")
    limit: int = Field(default=5, description="Number of top pages to return.")


# Receives point ID, MaxSim score, page number, source document name, and payload metadata from services/colpali_retriever.py.
# Structures a single ranked PDF page hit returned by Qdrant multi-vector search.
# Returns a validated ColPaliRetrievedPage item inside ColPaliRetrieveResponse to the frontend.
class ColPaliRetrievedPage(BaseModel):
    """A single page result from MaxSim retrieval."""
    id: str
    score: float
    page_number: int
    doc_source: str
    metadata: Dict[str, str] = Field(default_factory=dict)


# Receives the original query string and list of ColPaliRetrievedPage hits from services/colpali_retriever.py.
# Wraps the ranked visual retrieval results into a typed HTTP response payload.
# Returns a serialized JSON response via routers/colpali.py to the frontend (/colpali/retrieve).
class ColPaliRetrieveResponse(BaseModel):
    """Response from a ColPali MaxSim retrieval query."""
    query: str
    results: List[ColPaliRetrievedPage]
