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

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class RewriteRequest(BaseModel):
    query: str = Field(..., description="The raw natural language query from the user.")

class RewriteResponse(BaseModel):
    rewritten_query: str = Field(..., description="The cleaned/extracted query from the LLM.")

class RetrieveRequest(BaseModel):
    collection_name: str = Field(..., description="Target Qdrant collection name.")
    query: str = Field(..., description="The query string (can be the rewritten one).")
    limit: int = Field(default=5, description="Number of results to return.")
    fusion_strategy: str = Field(default="rrf", description="Fusion strategy to use if hybrid ('rrf' or 'dbsf').")

class RetrievedChunk(BaseModel):
    id: str
    score: float
    text: str
    metadata: Dict[str, Any]

class PrefetchResult(BaseModel):
    using: str = Field(..., description="The vector name used (e.g. 'dense', 'sparse').")
    chunks: List[RetrievedChunk]

class RetrieveResponse(BaseModel):
    rewritten_query: str
    query_vectors: Dict[str, Any] = Field(..., description="Generated vectors for the DB (dense/sparse).")
    pre_fusion: List[PrefetchResult] = Field(default_factory=list, description="Results before fusion (per vector).")
    fused_results: List[RetrievedChunk] = Field(..., description="Final ranked results.")
