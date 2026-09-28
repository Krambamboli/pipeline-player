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
Retriever Service
-----------------
Handles query rewriting via Ollama, generating vectors via fastembed,
and querying Qdrant with fusion (RRF/DBSF).
"""

import logging
from typing import Dict, Any, List

from qdrant_client import models

from models.retrieve_schema import RetrieveRequest, RetrieveResponse, RetrievedChunk, PrefetchResult
from services.llm_client import OllamaClient
from services.qdrant_client_manager import get_qdrant_client
from services.chunk_runner import _resolve_qdrant_path, REPO_ROOT

logger = logging.getLogger(__name__)

# WHY: User search prompts are often conversational, messy, or contain irrelevant words
# (e.g., "can you please tell me about..."). Vector databases perform best with concise keywords.
# 
# HOW: We send the raw query to a local LLM (Ollama) with a strict system prompt that 
# extracts only the core search intent while preserving the original language.
def rewrite_query(raw_query: str, llm_host: str = "http://localhost:11434", llm_model: str = "llama3.2:latest") -> str:
    """Uses Ollama to extract the core search intent from a messy prompt."""
    client = OllamaClient(host=llm_host, model=llm_model)
    prompt = f"""You are a search query extraction system.
Extract the core keywords and search intent from the following user prompt.
Do not answer the prompt. Just return a clean, concise search query optimized for vector retrieval.
Do not include any pleasantries or conversational text.
CRITICAL: The output MUST be in the exact same language as the user prompt. Do not translate it to English.

User prompt: {raw_query}

Clean search query:"""
    try:
        response = client.generate(prompt)
        return response.strip()
    except Exception as e:
        logger.error(f"Failed to rewrite query: {e}")
        return raw_query # Fallback to original

# WHY: This is the core logic for Step 5. It handles embedding the rewritten query 
# and fetching the most relevant chunks from Qdrant, using advanced fusion if the 
# collection supports it.
#
# HOW: 
# 1. Checks if the collection has dense and/or sparse vectors.
# 2. Uses `fastembed` to generate query vectors (Dense + Sparse).
# 3. Runs independent searches (Prefetch) for dense and sparse to show pre-fusion results.
# 4. Runs a combined `FusionQuery` (RRF or DBSF) to get the final re-ranked chunks.
def run_retrieval(req: RetrieveRequest, qdrant_storage_path: str = str(REPO_ROOT / "qdrant_storage")) -> RetrieveResponse:
    qdrant_path = _resolve_qdrant_path(qdrant_storage_path)
    client = get_qdrant_client(str(qdrant_path))
    
    # 1. Inspect collection to determine vectors
    info = client.get_collection(req.collection_name)
    vec_cfg = info.config.params.vectors
    
    has_dense = False
    has_sparse = False
    source_dim = 384
    
    if isinstance(vec_cfg, dict):
        has_dense = "dense" in vec_cfg
        if has_dense:
            source_dim = vec_cfg["dense"].size
    else:
        # Unnamed default vector
        has_dense = True
        source_dim = vec_cfg.size
        
    sparse_cfg = info.config.params.sparse_vectors
    if sparse_cfg and "sparse" in sparse_cfg:
        has_sparse = True
        
    # 2. Determine embedding models
    _DIM_MODEL_MAP = {
        384:  "BAAI/bge-small-en-v1.5",
        768:  "sentence-transformers/paraphrase-multilingual-mpnet-base-v2",
        1024: "intfloat/multilingual-e5-large",
    }
    dense_model_name = _DIM_MODEL_MAP.get(source_dim, "BAAI/bge-small-en-v1.5")
    
    query_vectors = {}
    prefetches = []
    
    if has_dense:
        from fastembed import TextEmbedding
        dense_model = TextEmbedding(model_name=dense_model_name)
        dense_vec = list(dense_model.embed([req.query]))[0].tolist()
        # For unnamed vectors, we don't supply a name, but usually it's named 'dense' in this project if dict
        vec_name = "dense" if isinstance(vec_cfg, dict) and "dense" in vec_cfg else ""
        query_vectors["dense"] = dense_vec
        prefetches.append(
            models.Prefetch(
                query=dense_vec,
                using=vec_name if vec_name else None,
                limit=req.limit * 2 # fetch more before fusion
            )
        )
        
    if has_sparse:
        from fastembed import SparseTextEmbedding
        sparse_model = SparseTextEmbedding(model_name="Qdrant/bm25")
        sv = list(sparse_model.embed([req.query]))[0]
        sparse_vec = models.SparseVector(indices=sv.indices.tolist(), values=sv.values.tolist())
        query_vectors["sparse"] = {"indices": sparse_vec.indices, "values": sparse_vec.values}
        prefetches.append(
            models.Prefetch(
                query=sparse_vec,
                using="sparse",
                limit=req.limit * 2
            )
        )
        
    # 3. Execute queries (individual to get pre-fusion, then fused)
    pre_fusion_results = []
    res_dense = []
    res_sparse = []
    
    # We query individually to show pre-fusion results
    if has_dense:
        vec_name = "dense" if isinstance(vec_cfg, dict) and "dense" in vec_cfg else None
        res_dense = client.query_points(
            collection_name=req.collection_name,
            query=query_vectors["dense"],
            using=vec_name,
            limit=req.limit
        ).points
        pre_fusion_results.append(PrefetchResult(
            using="dense",
            chunks=[RetrievedChunk(id=str(p.id), score=p.score, text=p.payload.get("chunk_text", ""), metadata=p.payload) for p in res_dense]
        ))
        
    if has_sparse:
        res_sparse = client.query_points(
            collection_name=req.collection_name,
            query=models.SparseVector(**query_vectors["sparse"]),
            using="sparse",
            limit=req.limit
        ).points
        pre_fusion_results.append(PrefetchResult(
            using="sparse",
            chunks=[RetrievedChunk(id=str(p.id), score=p.score, text=p.payload.get("chunk_text", ""), metadata=p.payload) for p in res_sparse]
        ))
        
    # Fused query
    if has_dense and has_sparse:
        fusion_map = {
            "rrf": models.Fusion.RRF,
            "dbsf": models.Fusion.DBSF
        }
        fusion_strategy = fusion_map.get(req.fusion_strategy.lower(), models.Fusion.RRF)
        
        fused_res = client.query_points(
            collection_name=req.collection_name,
            prefetch=prefetches,
            query=models.FusionQuery(fusion=fusion_strategy),
            limit=req.limit
        ).points
    else:
        # fallback to the single prefetch result
        if has_dense:
            fused_res = res_dense
        elif has_sparse:
            fused_res = res_sparse
        else:
            fused_res = []

    final_chunks = [
        RetrievedChunk(id=str(p.id), score=p.score, text=p.payload.get("chunk_text", ""), metadata=p.payload) 
        for p in fused_res
    ]
    
    return RetrieveResponse(
        rewritten_query=req.query,
        query_vectors=query_vectors,
        pre_fusion=pre_fusion_results,
        fused_results=final_chunks
    )
