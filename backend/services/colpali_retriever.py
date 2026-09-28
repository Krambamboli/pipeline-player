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
ColPali MaxSim Retriever
--------------------------
Retrieval service for ColPali multi-vector collections using MaxSim scoring.

WHY: ColPali collections store multi-vector embeddings (one set of patch
vectors per page). MaxSim computes the maximum similarity between each
query token and all document patch vectors, then sums them — this captures
fine-grained visual and textual overlap.

HOW:
  1. Load the same MultiVectorEncoder model used during indexing
  2. Encode the text query into query token vectors
  3. Query Qdrant using the "colpali" named vector with MaxSim
  4. Return scored page results with metadata

References:
  https://qdrant.tech/documentation/concepts/vectors/#multivectors
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import List

from models.colpali_schema import ColPaliRetrievedPage, ColPaliRetrieveResponse

logger = logging.getLogger(__name__)

# Root paths
REPO_ROOT = Path(__file__).resolve().parent.parent.parent
QDRANT_STORAGE_DEFAULT = REPO_ROOT / "qdrant_storage"


def _resolve_qdrant_path(storage_path: str) -> Path:
    """Resolve Qdrant storage path."""
    p = Path(storage_path)
    if not p.is_absolute():
        p = REPO_ROOT / p
    return p


def _detect_model_from_collection(client, collection_name: str) -> str:
    """
    Try to detect the ColPali model used from the first point's payload.
    Falls back to the default model if not found.
    """
    try:
        points = client.scroll(
            collection_name=collection_name,
            limit=1,
            with_payload=True,
            with_vectors=False,
        )[0]
        if points:
            return points[0].payload.get("model", "vidore/colqwen2-v1.0")
    except Exception:
        pass
    return "vidore/colqwen2-v1.0"


def run_colpali_retrieval(
    collection_name: str,
    query: str,
    limit: int = 5,
    qdrant_storage_path: str = "",
) -> ColPaliRetrieveResponse:
    """
    Run MaxSim retrieval against a ColPali collection.

    Args:
        collection_name: Name of the Qdrant collection with multi-vector config.
        query: Natural language search query.
        limit: Number of top results to return.
        qdrant_storage_path: Path to local Qdrant storage.

    Returns:
        ColPaliRetrieveResponse with ranked page results.
    """
    from services.qdrant_client_manager import get_qdrant_client

    client = get_qdrant_client(
        qdrant_storage_path or str(QDRANT_STORAGE_DEFAULT)
    )

    # Detect which model was used for indexing
    model_name = _detect_model_from_collection(client, collection_name)
    logger.info("Using model %s for query encoding", model_name)

    # Load the model and encode the query
    from sentence_transformers import MultiVectorEncoder
    model = MultiVectorEncoder(model_name)

    # Many ColPali checkpoints (like v1.3-merged) don't have a modules.json that sets prompt_name="query".
    # They were trained with the "Question: " prefix. Forcing it dramatically improves maxsim scores.
    prefix = "Question: " if not query.startswith("Question:") else ""
    query_embeddings = model.encode_query([f"{prefix}{query}"])[0]

    # Convert to list if numpy
    if hasattr(query_embeddings, 'tolist'):
        query_embeddings = query_embeddings.tolist()

    # Query Qdrant with MaxSim (the collection is already configured for it)
    results = client.query_points(
        collection_name=collection_name,
        query=query_embeddings,
        using="colpali",
        limit=limit,
    ).points

    # Build response
    pages = []
    for pt in results:
        payload = pt.payload or {}
        pages.append(ColPaliRetrievedPage(
            id=str(pt.id),
            score=pt.score,
            page_number=payload.get("page_number", 0),
            doc_source=payload.get("doc_source", ""),
            metadata={
                k: str(v) for k, v in payload.items()
                if k not in ("page_number", "doc_source")
            },
        ))

    return ColPaliRetrieveResponse(query=query, results=pages)
