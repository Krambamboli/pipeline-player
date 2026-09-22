"""
GraphRAG Enricher
------------------
Builds a knowledge graph from Qdrant chunk payloads:

  1. For each chunk: ask the LLM to extract entities & relationships (JSON)
  2. Build a NetworkX graph (DiGraph) — OR write to Neo4j if configured
  3. Run Louvain community detection on the graph
  4. Summarise each community with the LLM
  5. Write community summaries + entity nodes to the output Qdrant collection

Qdrant payload format for entity nodes:
    chunk_type   : "entity" | "community_summary"
    entity_name  : str  (for entity nodes)
    entity_type  : str  (PERSON, ORG, etc.)
    related_chunks: [chunk_id, ...]
    community_id : int
    chunk_text   : str  (entity description or community summary)

NetworkX graph is stored as JSON in:
    output_collection metadata (Qdrant collection aliases are not available in
    local mode, so we write graph.json to qdrant_storage_path/../graph_<name>.json)

References:
  https://microsoft.github.io/graphrag/
  https://python-louvain.readthedocs.io/
"""

from __future__ import annotations

import json
import logging
import time
import uuid
from pathlib import Path
from typing import Any, AsyncGenerator, Dict, List, Optional, Tuple

import numpy as np

logger = logging.getLogger(__name__)


_EXTRACT_PROMPT = """\
Extract entities and relationships from the text below.
Return ONLY valid JSON in this exact format (no markdown, no explanation):

{{
  "entities": [
    {{"name": "Entity Name", "type": "ENTITY_TYPE", "description": "short description"}}
  ],
  "relationships": [
    {{"source": "Entity A", "target": "Entity B", "relation": "relation label"}}
  ]
}}

Entity types to use (pick the best fit): {entity_types}
Maximum {max_entities} entities.

Text:
{text}
"""


def _parse_entity_json(raw: str) -> Dict:
    """Robustly parse LLM output that should be JSON."""
    if not raw:
        return {"entities": [], "relationships": []}
    raw = str(raw).strip()
    # Strip markdown code fences if present
    if raw.startswith("```"):
        lines = raw.split("\n")
        raw = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {"entities": [], "relationships": []}


async def run_graph_rag(
    *,
    source_collection: str,
    output_collection: str,
    qdrant_storage_path: str,
    llm_client,
    options,
    dense_model_name: str,
    emit,
) -> AsyncGenerator[str, None]:
    """
    Streaming generator that performs GraphRAG enrichment.
    """
    from qdrant_client import QdrantClient
    from qdrant_client.models import Distance, PointStruct, VectorParams
    from fastembed import TextEmbedding
    import networkx as nx

    start = time.time()

    # ------------------------------------------------------------------
    # 1. Setup
    # ------------------------------------------------------------------
    yield emit("🗄️  Opening Qdrant storage...")
    from services.qdrant_client_manager import get_qdrant_client
    client = get_qdrant_client(str(qdrant_storage_path))

    yield emit(f"📥 Loading chunks from '{source_collection}'...")
    all_points = []
    offset = None
    while True:
        batch, next_off = client.scroll(
            collection_name=source_collection,
            offset=offset, limit=100,
            with_payload=True, with_vectors=True,
        )
        all_points.extend(batch)
        if next_off is None:
            break
        offset = next_off

    if not all_points:
        yield emit("❌ Source collection is empty.")
        return
    yield emit(f"✅ Loaded {len(all_points)} chunks")

    yield emit(f"🤖 Checking Ollama...")
    if not await llm_client.is_available():
        yield emit("❌ Ollama not running. Start with: ollama serve")
        return
    yield emit("✅ Ollama available")

    yield emit(f"🔢 Loading embedding model '{dense_model_name}'...")
    embed_model = TextEmbedding(model_name=dense_model_name)
    probe = list(embed_model.embed(["probe"]))[0]
    dim = len(probe)
    yield emit(f"✅ Embedding model ready ({dim}d)")

    # ------------------------------------------------------------------
    # 2. Create output collection + copy source chunks
    # ------------------------------------------------------------------
    yield emit(f"🏗️  Creating output collection '{output_collection}'...")
    src_info = client.get_collection(source_collection)
    src_vectors = src_info.config.params.vectors
    
    if isinstance(src_vectors, dict):
        vec_cfg = {k: VectorParams(size=v.size, distance=v.distance) for k, v in src_vectors.items()}
        dense_vec_name = next(iter(vec_cfg.keys()))
    else:
        size = dim or getattr(src_vectors, "size", 384)
        vec_cfg = VectorParams(size=size, distance=Distance.COSINE)
        dense_vec_name = None

    src_sparse = getattr(src_info.config.params, "sparse_vectors", None)
    if src_sparse:
        from qdrant_client.models import SparseVectorParams
        sparse_cfg = {k: SparseVectorParams() for k in src_sparse.keys()}
    else:
        sparse_cfg = None

    if client.collection_exists(output_collection):
        client.delete_collection(output_collection)
    client.create_collection(
        collection_name=output_collection,
        vectors_config=vec_cfg,
        sparse_vectors_config=sparse_cfg,
    )

    for i in range(0, len(all_points), 64):
        batch_pts = all_points[i:i+64]
        pts = []
        for pt in batch_pts:
            pts.append(PointStruct(
                id=str(pt.id),
                vector=pt.vector,
                payload={**(pt.payload or {}), "chunk_type": "child"},
            ))
        client.upsert(collection_name=output_collection, points=pts)
    yield emit(f"✅ Copied {len(all_points)} source chunks")

    # ------------------------------------------------------------------
    # 3. Entity extraction
    # ------------------------------------------------------------------
    yield emit(f"🔍 Extracting entities from {len(all_points)} chunks...")
    G = nx.DiGraph()
    entity_chunk_map: Dict[str, List[str]] = {}  # entity_name → [chunk_id]
    entity_meta: Dict[str, Dict] = {}            # entity_name → {type, description}

    entity_types_str = ", ".join(options.entity_types)
    total = len(all_points)

    for i, pt in enumerate(all_points):
        yield f"__PROGRESS__={int(i / total * 60)}"  # 0–60% for extraction
        text = (pt.payload or {}).get("chunk_text", "").strip()
        if not text:
            continue

        prompt = _EXTRACT_PROMPT.format(
            entity_types=entity_types_str,
            max_entities=options.max_entities_per_chunk,
            text=text[:3000],
        )

        try:
            raw = await llm_client.complete(prompt)
            extracted = _parse_entity_json(raw)
        except Exception as exc:
            yield emit(f"⚠️  Extraction failed for chunk {i}: {exc}")
            continue

        chunk_id = str(pt.id)
        for ent in extracted.get("entities", []):
            name = ent.get("name", "").strip()
            if not name:
                continue
            etype = ent.get("type", "UNKNOWN")
            desc = ent.get("description", "")

            G.add_node(name, entity_type=etype, description=desc)
            entity_chunk_map.setdefault(name, []).append(chunk_id)
            entity_meta[name] = {"type": etype, "description": desc}

        for rel in extracted.get("relationships", []):
            src = rel.get("source", "").strip()
            tgt = rel.get("target", "").strip()
            relation = rel.get("relation", "related_to")
            if src and tgt and G.has_node(src) and G.has_node(tgt):
                G.add_edge(src, tgt, relation=relation)

    yield emit(f"✅ Graph: {G.number_of_nodes()} entities, {G.number_of_edges()} relationships")

    # ------------------------------------------------------------------
    # 4. Community detection (Louvain)
    # ------------------------------------------------------------------
    community_map: Dict[str, int] = {}
    communities: Dict[int, List[str]] = {}

    if options.run_community_detection and G.number_of_nodes() >= 3:
        yield emit("🔗 Running Louvain community detection...")
        try:
            import community as louvain_community
            partition = louvain_community.best_partition(G.to_undirected())
            community_map = partition
            for node, comm_id in partition.items():
                communities.setdefault(comm_id, []).append(node)
            yield emit(f"✅ {len(communities)} communities detected")
        except Exception as exc:
            yield emit(f"⚠️  Community detection failed: {exc}")

    # ------------------------------------------------------------------
    # 5. Write entity nodes to Qdrant
    # ------------------------------------------------------------------
    yield emit("📝 Writing entity nodes to Qdrant...")
    entity_nodes_written = 0
    for entity_name, meta in entity_meta.items():
        desc = meta.get("description") or entity_name
        vec = np.array(list(embed_model.embed([desc]))[0])
        if np.isnan(vec).any():
            continue

        payload = {
            "chunk_type": "entity",
            "chunk_text": desc,
            "embedded_text": desc,
            "entity_name": entity_name,
            "entity_type": meta.get("type", "UNKNOWN"),
            "related_chunk_ids": entity_chunk_map.get(entity_name, []),
            "community_id": community_map.get(entity_name, -1),
            "source_collection": source_collection,
        }
        vec_obj = {dense_vec_name: vec.tolist()} if dense_vec_name else vec.tolist()
        client.upsert(
            collection_name=output_collection,
            points=[PointStruct(id=str(uuid.uuid4()), vector=vec_obj, payload=payload)],
        )
        entity_nodes_written += 1

    yield emit(f"✅ Wrote {entity_nodes_written} entity nodes")
    yield f"__PROGRESS__=80"

    # ------------------------------------------------------------------
    # 6. Community summaries
    # ------------------------------------------------------------------
    community_summaries_written = 0
    if communities:
        yield emit(f"📝 Summarising {len(communities)} communities...")
        for comm_id, members in communities.items():
            # Gather descriptions of all entities in this community
            combined = "\n".join(
                f"- {e}: {entity_meta.get(e, {}).get('description', '')}"
                for e in members
            )
            prompt = (
                f"The following entities form a related group in a document. "
                f"Write a concise summary (max {options.community_summary_max_tokens} tokens) "
                f"explaining what this group represents:\n\n{combined[:3000]}\n\nSummary:"
            )
            try:
                raw_summary = await llm_client.complete(prompt)
                summary = str(raw_summary).strip() if raw_summary else ""
            except Exception as exc:
                yield emit(f"⚠️  Community {comm_id} summary failed: {exc}")
                continue

            vec = np.array(list(embed_model.embed([summary]))[0])
            if np.isnan(vec).any():
                continue

            payload = {
                "chunk_type": "community_summary",
                "chunk_text": summary,
                "embedded_text": summary,
                "community_id": comm_id,
                "community_members": members,
                "source_collection": source_collection,
            }
            vec_obj = {dense_vec_name: vec.tolist()} if dense_vec_name else vec.tolist()
            client.upsert(
                collection_name=output_collection,
                points=[PointStruct(id=str(uuid.uuid4()), vector=vec_obj, payload=payload)],
            )
            community_summaries_written += 1

        yield emit(f"✅ Wrote {community_summaries_written} community summary nodes")

    # ------------------------------------------------------------------
    # 7. Persist NetworkX graph as JSON (if networkx backend)
    # ------------------------------------------------------------------
    if options.graph_backend.value == "networkx":
        graph_path = Path(qdrant_storage_path).parent / f"graph_{output_collection}.json"
        graph_data = nx.node_link_data(G)
        with open(graph_path, "w", encoding="utf-8") as f:
            json.dump(graph_data, f, ensure_ascii=False, indent=2)
        yield emit(f"💾 Graph saved to: {graph_path}")

    # ------------------------------------------------------------------
    # 8. Neo4j export (optional)
    # ------------------------------------------------------------------
    if options.graph_backend.value == "neo4j":
        yield emit(f"📡 Writing to Neo4j ({options.neo4j_uri})...")
        try:
            from neo4j import GraphDatabase
            driver = GraphDatabase.driver(
                options.neo4j_uri,
                auth=(options.neo4j_user, options.neo4j_password),
            )
            with driver.session() as session:
                for node, data in G.nodes(data=True):
                    session.run(
                        "MERGE (e:Entity {name: $name}) "
                        "SET e.type = $type, e.description = $desc",
                        name=node,
                        type=data.get("entity_type", "UNKNOWN"),
                        desc=data.get("description", ""),
                    )
                for src, tgt, data in G.edges(data=True):
                    rel = data.get("relation", "RELATED_TO").upper().replace(" ", "_")
                    session.run(
                        f"MATCH (a:Entity {{name: $src}}), (b:Entity {{name: $tgt}}) "
                        f"MERGE (a)-[:{rel}]->(b)",
                        src=src, tgt=tgt,
                    )
            driver.close()
            yield emit("✅ Neo4j graph written")
        except ImportError:
            yield emit("⚠️  neo4j package not installed. Run: pip install neo4j")
        except Exception as exc:
            yield emit(f"⚠️  Neo4j export failed: {exc}")

    elapsed = time.time() - start
    yield emit(
        f"🏁 GraphRAG enrichment complete in {elapsed:.1f}s. "
        f"Output: '{output_collection}' — "
        f"{len(all_points)} chunks + {entity_nodes_written} entities + "
        f"{community_summaries_written} community summaries"
    )
    yield "__PROGRESS__=100"
