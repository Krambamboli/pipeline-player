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

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const API_BASE = `${BASE_URL}/api/retrieve`;

/**
 * Descriptor for a searchable Qdrant text collection returned by `GET /api/retrieve/collections` via `getCollections`.
 * Consumed by the Step 5 (`/retrieve`) page to populate the collection dropdown and indicate whether hybrid (dense + sparse) retrieval is supported.
 */
export interface RetrieveCollection {
  name: string;
  is_hybrid: boolean;
}

/**
 * Single ranked chunk item returned inside `PrefetchResult` or `RetrieveResponse.fused_results` from `POST /api/retrieve/run`.
 * Consumed by the `/retrieve` page to display similarity score, chunk text, and Qdrant payload metadata.
 */
export interface RetrievedChunk {
  id: string;
  score: number;
  text: string;
  metadata: Record<string, unknown>;
}

/**
 * Pre-fusion candidate list for a single vector space (`using`, e.g. dense or sparse) returned inside `RetrieveResponse`.
 * Consumed by the `/retrieve` page to inspect individual retriever rankings prior to RRF/DBSF fusion.
 */
export interface PrefetchResult {
  using: string;
  chunks: RetrievedChunk[];
}

/**
 * Full retrieval response payload returned by `POST /api/retrieve/run` via `runRetrieve`.
 * Delivers the query, encoded vector previews, `pre_fusion` lists, and final `fused_results` to the `/retrieve` page.
 */
export interface RetrieveResponse {
  rewritten_query: string;
  query_vectors: Record<string, unknown>;
  pre_fusion: PrefetchResult[];
  fused_results: RetrievedChunk[];
}

/**
 * Fetches all Qdrant text collections compatible with Step 5 retrieval.
 * Receives no arguments; called by the `/retrieve` page on mount.
 * Queries `GET /api/retrieve/collections` and returns `RetrieveCollection[]` to the `/retrieve` page.
 */
export async function getCollections(): Promise<RetrieveCollection[]> {
  const res = await fetch(`${API_BASE}/collections`);
  if (!res.ok) throw new Error("Failed to fetch retrieve collections");
  return res.json();
}

/**
 * Rewrites or expands a user search query using the backend LLM helper.
 * Receives the raw `query` string from the `/retrieve` page.
 * Sends `POST /api/retrieve/rewrite` to the backend and returns the `rewritten_query` string to the caller.
 */
export async function rewriteQuery(query: string): Promise<string> {
  const res = await fetch(`${API_BASE}/rewrite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error("Failed to rewrite query");
  const data = await res.json();
  return data.rewritten_query;
}

/**
 * Executes dense, sparse, or hybrid (RRF/DBSF) vector search against a Qdrant collection.
 * Receives `collectionName`, `query`, top-k `limit`, and `fusionStrategy` from the `/retrieve` page.
 * Sends `POST /api/retrieve/run` to the backend and returns the `RetrieveResponse` with pre-fusion and fused chunks to `/retrieve`.
 */
export async function runRetrieve(
  collectionName: string,
  query: string,
  limit: number,
  fusionStrategy: string
): Promise<RetrieveResponse> {
  const res = await fetch(`${API_BASE}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      collection_name: collectionName,
      query,
      limit,
      fusion_strategy: fusionStrategy,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to run retrieval");
  }
  return res.json();
}

/**
 * Streams a grounded LLM answer synthesized from retrieved text chunks and/or page images.
 * Receives `query`, `chunks`, Ollama `model`, optional `imageRefs`, streaming callbacks (`onToken`, `onDone`, `onError`), and `prelabeled` flag from `/retrieve`, `/colpali/retrieve`, or `/fusion`.
 *
 * WHY: After retrieval, we want the selected LLM to synthesise a grounded answer
 * from the ranked chunks. We stream tokens in real-time for a typing effect.
 *
 * HOW: We POST the query + chunk texts to the /answer SSE endpoint and
 * read the response body as a stream, invoking the callback for each token.
 * Wrapped in try/catch so network failures always trigger onError instead of
 * leaving isGenerating stuck at true.
 * Emits incremental text tokens via `onToken` and signals completion (`onDone`) or errors (`onError`) to the calling page.
 */
export async function generateAnswer(
  query: string,
  chunks: string[],
  model: string,
  imageRefs: { source: string; page: number; file_path?: string }[] | undefined,
  onToken: (token: string) => void,
  onDone: () => void,
  onError: (err: string) => void,
  // true = chunks already carry their own "[Source N — …]" labels (Fusion Retriever)
  prelabeled = false
): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, chunks, model, image_references: imageRefs, prelabeled }),
    });

    if (!res.ok || !res.body) {
      onError(`Failed to start answer generation (HTTP ${res.status})`);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      // Parse SSE lines from the buffer
      const lines = buffer.split("\n");
      // Keep the last potentially incomplete line in the buffer
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const payload = line.slice(6);
          if (payload === "[DONE]") {
            onDone();
            return;
          }
          if (payload.startsWith("[ERROR]")) {
            onError(payload.slice(8));
            return;
          }
          // Decode JSON-encoded token if sent as JSON string, fallback to raw text
          if (payload.startsWith("{") && payload.endsWith("}")) {
            try {
              const parsed = JSON.parse(payload) as { token?: string };
              if (typeof parsed.token === "string") {
                onToken(parsed.token);
                continue;
              }
            } catch {
              // Fall through to raw payload
            }
          }
          onToken(payload);
        }
      }
    }
    onDone();
  } catch (e: unknown) {
    onError(e instanceof Error ? e.message : String(e));
  }
}
