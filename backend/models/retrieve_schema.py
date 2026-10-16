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

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

# Receives the raw natural-language user query string from the frontend (/retrieve) via routers/retrieve.py.
# Validates the request body for LLM-based search query extraction.
# Returns a validated RewriteRequest instance to routers/retrieve.py.
class RewriteRequest(BaseModel):
    query: str = Field(..., description="The raw natural language query from the user.")

# Receives the cleaned search query string from services/retriever.py::rewrite_query via routers/retrieve.py.
# Wraps the extracted keyword query into a typed JSON response.
# Returns a serialized RewriteResponse payload to the frontend (/retrieve).
class RewriteResponse(BaseModel):
    rewritten_query: str = Field(..., description="The cleaned/extracted query from the LLM.")

# Receives target collection name, query text, result limit, and fusion strategy from the frontend (/retrieve) via routers/retrieve.py.
# Validates parameters for dense, sparse, or hybrid (RRF/DBSF) vector search in Qdrant.
# Returns a validated RetrieveRequest instance to routers/retrieve.py and services/retriever.py.
class RetrieveRequest(BaseModel):
    collection_name: str = Field(..., description="Target Qdrant collection name.")
    query: str = Field(..., description="The query string (can be the rewritten one).")
    limit: int = Field(default=5, description="Number of results to return.")
    fusion_strategy: str = Field(default="rrf", description="Fusion strategy to use if hybrid ('rrf' or 'dbsf').")

# Receives point ID, similarity/fusion score, chunk text, and Qdrant payload metadata from services/retriever.py.
# Represents a single ranked document chunk returned by a Qdrant prefetch or fusion query.
# Returns a validated RetrievedChunk object included in PrefetchResult and RetrieveResponse.
class RetrievedChunk(BaseModel):
    id: str
    score: float
    text: str
    metadata: Dict[str, Any]

# Receives the vector space name (`using`, e.g. "dense" or "sparse") and its un-fused RetrievedChunk list from services/retriever.py.
# Captures individual retriever results before RRF/DBSF fusion for UI comparison in Step 5.
# Returns a validated PrefetchResult object inside RetrieveResponse to the frontend (/retrieve).
class PrefetchResult(BaseModel):
    using: str = Field(..., description="The vector name used (e.g. 'dense', 'sparse').")
    chunks: List[RetrievedChunk]

# Receives the query, generated query vectors, pre-fusion lists, and final fused chunks from services/retriever.py.
# Packages the full Step 5 retrieval diagnostics and ranked results into a single response schema.
# Returns a serialized RetrieveResponse JSON object via routers/retrieve.py to the frontend (/retrieve).
class RetrieveResponse(BaseModel):
    rewritten_query: str
    query_vectors: Dict[str, Any] = Field(..., description="Generated vectors for the DB (dense/sparse).")
    pre_fusion: List[PrefetchResult] = Field(default_factory=list, description="Results before fusion (per vector).")
    fused_results: List[RetrievedChunk] = Field(..., description="Final ranked results.")
