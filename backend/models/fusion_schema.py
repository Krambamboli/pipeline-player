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
Fusion Retriever Schema
-----------------------
Request models for the Fusion Retriever (hybrid text + ColPali MaxSim,
fused by a user-written reranker).
"""

from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field, field_validator


class FusionSearchRequest(BaseModel):
    """One query against a text collection and a ColPali collection."""
    query: str = Field(..., min_length=1, description="Natural language query.")
    text_collection: Optional[str] = Field(default="", description="Text (dense+sparse) collection; empty = skip.")
    colpali_collection: Optional[str] = Field(default="", description="ColPali collection; empty = skip.")
    text_limit: int = Field(default=5, ge=1, le=50, description="Top-N chunks from the text collection.")
    colpali_limit: int = Field(default=5, ge=1, le=50, description="Top-N pages from the ColPali collection.")
    dense_model_override: Optional[str] = Field(default="", description="Force a dense query model (else auto-detected).")
    sparse_model_override: Optional[str] = Field(default="", description="Force a sparse query model (else auto-detected).")
    # How the dense and sparse result lists of the text collection are fused
    # (https://qdrant.tech/documentation/concepts/hybrid-queries/):
    #   rrf    — Reciprocal Rank Fusion (rank based, optional weights)
    #   dbsf   — Distribution-Based Score Fusion (mean ± 3σ normalised scores)
    #   dense  — dense retriever only
    #   sparse — sparse retriever only
    text_fusion: Literal["rrf", "dbsf", "dense", "sparse"] = Field(default="rrf")
    rrf_k: int = Field(default=60, ge=1, le=1000, description="RRF constant k (Qdrant default without k: 2).")
    dense_weight: float = Field(default=1.0, ge=0.0, le=10.0, description="Weight of the dense list in RRF.")
    sparse_weight: float = Field(default=1.0, ge=0.0, le=10.0, description="Weight of the sparse list in RRF.")

    @field_validator("text_collection", "colpali_collection", "dense_model_override", "sparse_model_override", mode="before")
    @classmethod
    def _none_to_empty(cls, v: Any) -> str:
        """Coerce None values (e.g. from JSON null) to empty strings."""
        return "" if v is None else str(v)


class RerankRequest(BaseModel):
    """Run the user reranker on cached search hits."""
    code: str = Field(..., description="Python source defining rerank(text_hits, colpali_hits, k).")
    text_hits: List[Dict[str, Any]] = Field(default_factory=list)
    colpali_hits: List[Dict[str, Any]] = Field(default_factory=list)
    k: int = Field(default=3, ge=1, le=20, description="Number of items passed to the LLM.")


class RerankScript(BaseModel):
    """Body for saving a reranker script."""
    code: str
