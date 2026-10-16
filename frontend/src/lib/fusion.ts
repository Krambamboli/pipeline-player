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
 * Fusion Retriever API Client
 * ---------------------------
 * Hybrid text search + ColPali MaxSim search with one query, a user-written
 * Python reranker that fuses both lists, and saved reranker scripts.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const BASE = `${API_BASE}/api/fusion`;

/**
 * A normalised hit (text chunk or ColPali page) — the same dict the reranker receives.
 * Returned by `POST /api/fusion/search` and `POST /api/fusion/rerank`, and consumed by the `/fusion` page, `pageLabel`, and `buildLlmContext`.
 */
export interface FusionHit {
  source: "text" | "colpali";
  id: string;
  rank: number;
  score: number;
  score_norm: number;
  doc_name: string;
  file_path: string | null;
  page: number | null;
  pages: number[];
  metadata: Record<string, unknown>;
  // text hits only
  text?: string;
  embedded_text?: string;
  headings?: string[];
  dense_rank?: number | null;
  dense_score?: number | null;
  sparse_rank?: number | null;
  sparse_score?: number | null;
  // share of the fused score per retriever (same formulas as qdrant-client)
  dense_contrib?: number;
  sparse_contrib?: number;
  dense_share?: number | null; // 0..1, null = no contribution at all
  found_by?: "both" | "dense" | "sparse" | "none";
  driver?: "dense" | "sparse" | "balanced" | "none";
  // set by the reranker
  fused_score?: number | null;
  reason?: string | null;
}

/**
 * Metadata for a Qdrant text collection returned by `GET /api/fusion/collections` via `listFusionCollections`.
 * Consumed by the `/fusion` page to display collection point counts, detected dense/sparse embedding models, and hybrid capabilities.
 */
export interface TextCollectionInfo {
  name: string;
  points: number;
  dense_dim: number | null;
  has_sparse: boolean;
  dense_model: string | null;
  sparse_model: string | null;
  model_source: "payload" | "manifest" | "dimension-guess";
}

/**
 * Metadata for a ColPali multi-vector Qdrant collection returned by `GET /api/fusion/collections` via `listFusionCollections`.
 * Consumed by the `/fusion` page to populate the visual collection selector.
 */
export interface ColPaliCollectionInfo {
  name: string;
  points: number;
  model: string;
}

/**
 * How the dense and sparse lists of the text collection are fused.
 * Selected on the `/fusion` page and sent to `POST /api/fusion/search` via `fusionSearch`.
 */
export type TextFusion = "rrf" | "dbsf" | "dense" | "sparse";

/**
 * Descriptor for a fastembed dense or sparse model returned by `GET /api/fusion/embedding-models` via `listEmbeddingModels`.
 * Consumed by the `/fusion` page to populate model override dropdowns.
 */
export interface EmbeddingModelOption {
  model: string;
  dim?: number | null;
  size_gb?: number | null;
  description?: string;
}

/**
 * Combined search response returned by `POST /api/fusion/search` via `fusionSearch`.
 * Delivers both the text retrieval results (`FusionHit[]` and fusion metadata), ColPali MaxSim results, and any per-track errors to the `/fusion` page.
 */
export interface FusionSearchResult {
  query: string;
  text: {
    hits: FusionHit[];
    mode: string;
    fusion: TextFusion;
    rrf_k: number;
    weights: [number, number];
    prefetch_limit: number;
    dense_model: string | null;
    sparse_model: string | null;
    model_source: string;
    elapsed_ms: number;
  } | null;
  colpali: { hits: FusionHit[]; model: string; elapsed_ms: number } | null;
  errors: Record<string, string>;
}

/**
 * Execution outcome of the user's Python reranker returned by `POST /api/fusion/rerank` via `runRerank`.
 * Delivers the fused `selected` hits, standard output, execution time, or syntax/runtime error details (`line`, `traceback`) to the `/fusion` page and `PythonEditor`.
 */
export interface RerankResult {
  ok: boolean;
  selected?: FusionHit[];
  error?: string;
  line?: number | null;
  traceback?: string;
  stdout?: string;
  elapsed_ms: number;
}

/**
 * Throw a readable error for non-2xx responses (uses FastAPI's `detail`).
 * Receives a `Response` object from `fetch` calls within `lib/fusion.ts`.
 * Inspects `res.ok`, extracts the FastAPI `detail` message on failure to throw an `Error`, or returns the valid `Response` to the calling function.
 */
async function check(res: Response): Promise<Response> {
  if (!res.ok) {
    let detail = res.statusText;
    try {
      detail = (await res.json()).detail ?? detail;
    } catch {
      /* keep statusText */
    }
    throw new Error(detail);
  }
  return res;
}

/**
 * Lists all available text and ColPali Qdrant collections for fusion retrieval.
 * Receives no arguments; called by the `/fusion` page on mount.
 * Queries `GET /api/fusion/collections` and returns `{ text: TextCollectionInfo[]; colpali: ColPaliCollectionInfo[] }` to the `/fusion` page.
 */
export async function listFusionCollections(): Promise<{ text: TextCollectionInfo[]; colpali: ColPaliCollectionInfo[] }> {
  return (await check(await fetch(`${BASE}/collections`))).json();
}

/**
 * Dense/sparse query models supported by the backend's fastembed version.
 * Receives no arguments; called by the `/fusion` page on mount.
 * Queries `GET /api/fusion/embedding-models` and returns `{ dense: EmbeddingModelOption[]; sparse: EmbeddingModelOption[] }` to the `/fusion` page.
 */
export async function listEmbeddingModels(): Promise<{ dense: EmbeddingModelOption[]; sparse: EmbeddingModelOption[] }> {
  return (await check(await fetch(`${BASE}/embedding-models`))).json();
}

/**
 * Executes parallel hybrid text search and ColPali MaxSim visual search for a single query.
 * Receives the search parameters (`query`, collection names, limits, optional model overrides, and `text_fusion` settings) from the `/fusion` page.
 * Sends `POST /api/fusion/search` to the backend and returns the `FusionSearchResult` to the `/fusion` page.
 */
export async function fusionSearch(body: {
  query: string;
  text_collection: string;
  colpali_collection: string;
  text_limit: number;
  colpali_limit: number;
  dense_model_override?: string;
  sparse_model_override?: string;
  text_fusion?: TextFusion;
  rrf_k?: number;
  dense_weight?: number;
  sparse_weight?: number;
}): Promise<FusionSearchResult> {
  const res = await fetch(`${BASE}/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await check(res)).json();
}

/**
 * Runs the user-defined Python `rerank()` script on the retrieved text and ColPali hits.
 * Receives the Python `code`, `textHits`, `colpaliHits`, top-`k` limit, and optional `AbortSignal` from the `/fusion` page.
 * Sends `POST /api/fusion/rerank` to execute the script in the backend sandbox and returns `RerankResult` to the `/fusion` page.
 */
export async function runRerank(
  code: string,
  textHits: FusionHit[],
  colpaliHits: FusionHit[],
  k: number,
  signal?: AbortSignal
): Promise<RerankResult> {
  const res = await fetch(`${BASE}/rerank`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, text_hits: textHits, colpali_hits: colpaliHits, k }),
    signal,
  });
  return (await check(res)).json();
}

/**
 * URL of a PNG thumbnail for a PDF page.
 * Receives `filePath`, 1-based `page` number, and optional `dpi` from the `/fusion` page when rendering ColPali page hit previews.
 * Builds and returns the `GET /api/fusion/page-image?...` URL string for `<img src={...}>` elements.
 */
export function pageImageUrl(filePath: string, page: number, dpi = 72): string {
  const q = new URLSearchParams({ file_path: filePath, page: String(page), dpi: String(dpi) });
  return `${BASE}/page-image?${q.toString()}`;
}

/**
 * Fetches the built-in default Python reranker script template.
 * Receives no arguments; called by the `/fusion` page on mount or when resetting the editor.
 * Queries `GET /api/fusion/default-script` and returns the Python source code string to the `/fusion` page.
 */
export async function getDefaultScript(): Promise<string> {
  return (await (await check(await fetch(`${BASE}/default-script`))).json()).code;
}

/**
 * Lists the names of all saved user Python reranker scripts.
 * Receives no arguments; called by the `/fusion` page to populate the saved scripts dropdown.
 * Queries `GET /api/fusion/scripts` and returns `string[]` of script names to the `/fusion` page.
 */
export async function listScripts(): Promise<string[]> {
  return (await check(await fetch(`${BASE}/scripts`))).json();
}

/**
 * Loads a saved Python reranker script by name.
 * Receives the script `name` from the `/fusion` page when the user selects a saved script.
 * Queries `GET /api/fusion/scripts/{name}` and returns the script's Python source code string to the `/fusion` page.
 */
export async function loadScript(name: string): Promise<string> {
  return (await (await check(await fetch(`${BASE}/scripts/${encodeURIComponent(name)}`))).json()).code;
}

/**
 * Saves or overwrites a named Python reranker script on the backend.
 * Receives the script `name` and Python `code` from the `/fusion` page.
 * Sends `PUT /api/fusion/scripts/{name}` to persist the `.py` file and resolves `void` to the caller.
 */
export async function saveScript(name: string, code: string): Promise<void> {
  await check(
    await fetch(`${BASE}/scripts/${encodeURIComponent(name)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
  );
}

/**
 * Deletes a saved Python reranker script by name.
 * Receives the script `name` from the `/fusion` page when the user clicks Delete.
 * Sends `DELETE /api/fusion/scripts/{name}` to the backend and resolves `void` to the caller.
 */
export async function deleteScript(name: string): Promise<void> {
  await check(await fetch(`${BASE}/scripts/${encodeURIComponent(name)}`, { method: "DELETE" }));
}

/**
 * Human-readable page label, e.g. "p.14" or "p.3–5".
 * Receives a `FusionHit` object from `buildLlmContext` or the `/fusion` page UI.
 * Formats `hit.pages` or `hit.page` into a compact page range string and returns it to the caller.
 */
export function pageLabel(hit: FusionHit): string {
  const pages = hit.pages?.filter((p) => p != null) ?? [];
  if (pages.length > 1) return `p.${Math.min(...pages)}–${Math.max(...pages)}`;
  return hit.page ? `p.${hit.page}` : "";
}

/**
 * Build the LLM context for the final selection: every item gets an explicit
 * "[Source N — …]" label; ColPali pages are attached as images (in order).
 * Receives the reranked `selected` (`FusionHit[]`) list from the `/fusion` page prior to calling `generateAnswer`.
 * Formats numbered text chunks and extracts PDF page image references, returning `{ chunks, imageRefs }` to the `/fusion` page.
 */
export function buildLlmContext(selected: FusionHit[]): {
  chunks: string[];
  imageRefs: { source: string; page: number; file_path?: string }[];
} {
  const chunks: string[] = [];
  const imageRefs: { source: string; page: number; file_path?: string }[] = [];
  selected.forEach((hit, i) => {
    const where = `${hit.doc_name} ${pageLabel(hit)}`.trim();
    if (hit.source === "text") {
      chunks.push(`[Source ${i + 1} — text chunk · ${where}]\n${hit.embedded_text || hit.text || ""}`);
    } else {
      imageRefs.push({ source: hit.doc_name, page: hit.page ?? 1, file_path: hit.file_path ?? undefined });
      chunks.push(`[Source ${i + 1} — page image · ${where}]\n(See attached page image ${imageRefs.length}.)`);
    }
  });
  return { chunks, imageRefs };
}
