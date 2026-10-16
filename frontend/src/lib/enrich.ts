// Copyright (C) 2026 olischn
//
// This file is part of Pipeline Player.
// SPDX-License-Identifier: GPL-3.0-or-later
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program. If not, see <https://www.gnu.org/licenses/>.

/**
 * Enrichment API Client
 * ----------------------
 * Functions for the Step 4 Collection Enrichment pipeline.
 * Mirrors the structure of lib/qdrant.ts.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Enrichment strategy identifier selected on the Step 4 (`/enrich`) page and sent to `POST /api/enrich/run`.
 * Chooses between Parent-Child section summaries, RAPTOR hierarchical clustering, or GraphRAG knowledge graph extraction in `EnrichmentConfig`.
 */
export type EnrichStrategy = "parent_child" | "raptor" | "graph_rag";

/**
 * Graph storage backend selector configured on the `/enrich` page for the `graph_rag` strategy.
 * Determines whether `GraphRagOptions` stores extracted entities/relations in an in-memory NetworkX graph or a Neo4j instance.
 */
export type GraphBackend = "networkx" | "neo4j";

/**
 * Local Ollama LLM connection settings configured on the `/enrich` page and sent inside `EnrichmentConfig`.
 * Specifies the Ollama host URL, model tag, request timeout, and retry count for enrichment summarisation and entity extraction.
 */
export interface OllamaConfig {
  host: string;
  model: string;
  timeout_seconds: number;
  max_retries: number;
}

/**
 * Options for the Parent-Child enrichment strategy edited on the `/enrich` page and sent in `EnrichmentConfig`.
 * Controls heading grouping level, summary token limit, prompt template, summary embedding, and child linking.
 */
export interface ParentChildOptions {
  grouping_level: number;
  summary_max_tokens: number;
  summary_prompt_template: string;
  embed_summaries: boolean;
  link_children: boolean;
}

/**
 * Options for the RAPTOR recursive clustering enrichment strategy edited on the `/enrich` page and sent in `EnrichmentConfig`.
 * Configures tree depth (`max_levels`), UMAP dimensionality reduction, GMM cluster components, and summary token limits.
 */
export interface RaptorOptions {
  max_levels: number;
  umap_n_components: number;
  umap_n_neighbors: number;
  gmm_n_components: number;
  summary_max_tokens: number;
}

/**
 * Options for the GraphRAG knowledge-graph enrichment strategy edited on the `/enrich` page and sent in `EnrichmentConfig`.
 * Configures the graph backend (`networkx` or `neo4j`), Neo4j credentials, entity extraction limits/types, and community detection summaries.
 */
export interface GraphRagOptions {
  graph_backend: GraphBackend;
  neo4j_uri: string;
  neo4j_user: string;
  neo4j_password: string;
  max_entities_per_chunk: number;
  entity_types: string[];
  run_community_detection: boolean;
  community_summary_max_tokens: number;
}

/**
 * Complete configuration payload for Step 4 Collection Enrichment, created by `defaultEnrichmentConfig`, edited on `/enrich`, and posted via `startEnrichmentFetch`.
 * Combines source collection, Qdrant path, selected `EnrichStrategy`, `OllamaConfig`, and strategy-specific option blocks.
 */
export interface EnrichmentConfig {
  source_collection: string;
  qdrant_storage_path: string;
  strategy: EnrichStrategy;
  llm: OllamaConfig;
  parent_child_options: ParentChildOptions;
  raptor_options: RaptorOptions;
  graph_rag_options: GraphRagOptions;
  output_collection_suffix: string;
}

/**
 * Availability and model list response returned by `GET /api/enrich/ollama/status` via `checkOllamaStatus`.
 * Consumed by the `/enrich`, `/retrieve`, `/colpali/retrieve`, and `/fusion` pages to verify Ollama connectivity and populate LLM dropdowns.
 */
export interface OllamaStatus {
  available: boolean;
  host: string;
  models: string[];
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

/**
 * Builds a default `EnrichmentConfig` object.
 * Receives the initial `source_collection` name from the `/enrich` page.
 * Populates sensible defaults for Ollama (`llama3.2`), Parent-Child, RAPTOR, and GraphRAG options, returning the `EnrichmentConfig` to `/enrich` page state.
 */
export function defaultEnrichmentConfig(
  source_collection: string
): EnrichmentConfig {
  return {
    source_collection,
    qdrant_storage_path: "",
    strategy: "parent_child",
    llm: {
      host: "http://localhost:11434",
      model: "llama3.2",
      timeout_seconds: 120,
      max_retries: 2,
    },
    parent_child_options: {
      grouping_level: 1,
      summary_max_tokens: 256,
      summary_prompt_template:
        "Summarise the following section of a document in {max_tokens} tokens " +
        "or less. Focus on the key facts, definitions and conclusions.\n\n" +
        "Section heading: {heading}\n\n" +
        "Section content:\n{content}\n\nSummary:",
      embed_summaries: true,
      link_children: true,
    },
    raptor_options: {
      max_levels: 3,
      umap_n_components: 2,
      umap_n_neighbors: 15,
      gmm_n_components: 0,
      summary_max_tokens: 256,
    },
    graph_rag_options: {
      graph_backend: "networkx",
      neo4j_uri: "bolt://localhost:7687",
      neo4j_user: "neo4j",
      neo4j_password: "",
      max_entities_per_chunk: 10,
      entity_types: ["PERSON", "ORG", "LOCATION", "CONCEPT", "LAW", "DATE"],
      run_community_detection: true,
      community_summary_max_tokens: 512,
    },
    output_collection_suffix: "",
  };
}

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------

/**
 * Check Ollama availability and list available models.
 * Receives an optional Ollama `host` URL from the `/enrich`, `/retrieve`, `/colpali/retrieve`, or `/fusion` pages.
 * Queries `GET /api/enrich/ollama/status` on the backend and returns an `OllamaStatus` object to the caller.
 */
export async function checkOllamaStatus(
  host = "http://localhost:11434"
): Promise<OllamaStatus> {
  const res = await fetch(
    `${API_BASE}/api/enrich/ollama/status?host=${encodeURIComponent(host)}`
  );
  if (!res.ok) throw new Error(`Ollama status check failed: ${res.statusText}`);
  return res.json();
}

/**
 * POST cfg to /api/enrich/run and read the SSE response as a fetch stream.
 * Receives `cfg` (`EnrichmentConfig`), callbacks (`onLine`, `onDone`, `onError`), and an optional `AbortSignal` from the `/enrich` page.
 * Streams SSE log/progress events from the backend enrichment job and invokes the callbacks to update the `/enrich` page UI.
 */
export async function startEnrichmentFetch(
  cfg: EnrichmentConfig,
  onLine: (line: string) => void,
  onDone: () => void,
  onError: (err: Error) => void,
  signal?: AbortSignal
): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/enrich/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cfg),
      signal,
    });
  } catch (e) {
    if ((e as Error).name === "AbortError") return;
    onError(e instanceof Error ? e : new Error(String(e)));
    return;
  }

  if (!res.ok || !res.body) {
    onError(new Error(`HTTP ${res.status}: ${res.statusText}`));
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() ?? "";
      for (const part of parts) {
        const line = part.replace(/^data: /, "").trim();
        if (!line) continue;
        // If backend reports an unhandled error in the SSE stream, route to onError
        // instead of letting onDone mark progress as 100%.
        if (line.startsWith("[ERROR]")) {
          onLine(line);
          onError(new Error(line.replace(/^\[ERROR\]\s*/, "")));
          return;
        }
        onLine(line);
      }
    }
  } catch (e) {
    if ((e as Error).name === "AbortError") return;
    onError(e instanceof Error ? e : new Error(String(e)));
    return;
  }

  onDone();
}
