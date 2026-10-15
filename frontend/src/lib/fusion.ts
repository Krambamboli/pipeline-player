// Copyright (C) 2024 Oliver Schneider
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

/** A normalised hit (text chunk or ColPali page) — the same dict the reranker receives. */
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

export interface TextCollectionInfo {
  name: string;
  points: number;
  dense_dim: number | null;
  has_sparse: boolean;
  dense_model: string | null;
  sparse_model: string | null;
  model_source: "payload" | "manifest" | "dimension-guess";
}

export interface ColPaliCollectionInfo {
  name: string;
  points: number;
  model: string;
}

/** How the dense and sparse lists of the text collection are fused. */
export type TextFusion = "rrf" | "dbsf" | "dense" | "sparse";

export interface EmbeddingModelOption {
  model: string;
  dim?: number | null;
  size_gb?: number | null;
  description?: string;
}

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

export interface RerankResult {
  ok: boolean;
  selected?: FusionHit[];
  error?: string;
  line?: number | null;
  traceback?: string;
  stdout?: string;
  elapsed_ms: number;
}

/** Throw a readable error for non-2xx responses (uses FastAPI's `detail`). */
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

export async function listFusionCollections(): Promise<{ text: TextCollectionInfo[]; colpali: ColPaliCollectionInfo[] }> {
  return (await check(await fetch(`${BASE}/collections`))).json();
}

/** Dense/sparse query models supported by the backend's fastembed version. */
export async function listEmbeddingModels(): Promise<{ dense: EmbeddingModelOption[]; sparse: EmbeddingModelOption[] }> {
  return (await check(await fetch(`${BASE}/embedding-models`))).json();
}

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

/** URL of a PNG thumbnail for a PDF page. */
export function pageImageUrl(filePath: string, page: number, dpi = 72): string {
  const q = new URLSearchParams({ file_path: filePath, page: String(page), dpi: String(dpi) });
  return `${BASE}/page-image?${q.toString()}`;
}

export async function getDefaultScript(): Promise<string> {
  return (await (await check(await fetch(`${BASE}/default-script`))).json()).code;
}

export async function listScripts(): Promise<string[]> {
  return (await check(await fetch(`${BASE}/scripts`))).json();
}

export async function loadScript(name: string): Promise<string> {
  return (await (await check(await fetch(`${BASE}/scripts/${encodeURIComponent(name)}`))).json()).code;
}

export async function saveScript(name: string, code: string): Promise<void> {
  await check(
    await fetch(`${BASE}/scripts/${encodeURIComponent(name)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
  );
}

export async function deleteScript(name: string): Promise<void> {
  await check(await fetch(`${BASE}/scripts/${encodeURIComponent(name)}`, { method: "DELETE" }));
}

/** Human-readable page label, e.g. "p.14" or "p.3–5". */
export function pageLabel(hit: FusionHit): string {
  const pages = hit.pages?.filter((p) => p != null) ?? [];
  if (pages.length > 1) return `p.${Math.min(...pages)}–${Math.max(...pages)}`;
  return hit.page ? `p.${hit.page}` : "";
}

/**
 * Build the LLM context for the final selection: every item gets an explicit
 * "[Source N — …]" label; ColPali pages are attached as images (in order).
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
