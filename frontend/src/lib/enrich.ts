/**
 * Enrichment API Client
 * ----------------------
 * Functions for the Step 4 Collection Enrichment pipeline.
 * Mirrors the structure of lib/qdrant.ts.
 */

const API_BASE = "http://localhost:8000";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type EnrichStrategy = "parent_child" | "raptor" | "graph_rag";
export type GraphBackend = "networkx" | "neo4j";

export interface OllamaConfig {
  host: string;
  model: string;
  timeout_seconds: number;
  max_retries: number;
}

export interface ParentChildOptions {
  grouping_level: number;
  summary_max_tokens: number;
  summary_prompt_template: string;
  embed_summaries: boolean;
  link_children: boolean;
}

export interface RaptorOptions {
  max_levels: number;
  umap_n_components: number;
  umap_n_neighbors: number;
  gmm_n_components: number;
  summary_max_tokens: number;
}

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

export interface OllamaStatus {
  available: boolean;
  host: string;
  models: string[];
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

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

/** Check Ollama availability and list available models. */
export async function checkOllamaStatus(
  host = "http://localhost:11434"
): Promise<OllamaStatus> {
  const res = await fetch(
    `${API_BASE}/api/enrich/ollama/status?host=${encodeURIComponent(host)}`
  );
  if (!res.ok) throw new Error(`Ollama status check failed: ${res.statusText}`);
  return res.json();
}

/** Start an enrichment run and return an EventSource-like stream. */
export function startEnrichmentStream(cfg: EnrichmentConfig): EventSource {
  // We can't POST with EventSource, so we use fetch with ReadableStream
  // and expose the same interface via a custom wrapper.
  // This function returns a standard EventSource — the caller reads .onmessage.
  // Since EventSource only supports GET, we spin up a fetch-based stream
  // and expose progress via callbacks instead.
  throw new Error("Use startEnrichmentFetch instead");
}

/** POST cfg to /api/enrich/run and read the SSE response as a fetch stream. */
export async function startEnrichmentFetch(
  cfg: EnrichmentConfig,
  onLine: (line: string) => void,
  onDone: () => void,
  onError: (err: Error) => void
): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/enrich/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cfg),
    });
  } catch (e) {
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
        if (line) onLine(line);
      }
    }
  } catch (e) {
    onError(e instanceof Error ? e : new Error(String(e)));
    return;
  }

  onDone();
}
