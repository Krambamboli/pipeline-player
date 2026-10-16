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
 * Qdrant Browser API Client
 * --------------------------
 * Functions for browsing the local Qdrant vector DB from the frontend.
 * All calls go through the FastAPI backend (not directly to Qdrant).
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/**
 * Summary metadata for a Qdrant collection returned by `GET /api/qdrant/collections` via `listCollections`.
 * Consumed by the `/inspector`, `/enrich`, `/colpali/retrieve`, and `/chunk` pages to display collection counts, vector dimensions, and multivector flags.
 */
export interface QdrantCollection {
  name: string;
  points_count: number;
  vectors_count: number;
  dense_vectors: Record<string, { size: number; distance: string }>;
  sparse_vectors: string[];
  status: string;
  is_multivector?: boolean;
  error?: string;
}

/**
 * Truncated vector preview for a single named dense or sparse vector inside `QdrantPoint.vector_preview`.
 * Returned by `GET /api/qdrant/collections/{name}/points` (when `with_vectors=true`) and rendered on the `/inspector` page.
 */
export interface VectorPreviewEntry {
  type: "dense" | "sparse";
  dims?: number;
  preview?: number[];
  top_terms?: { index: number; value: number }[];
}

/**
 * Normalized Qdrant point record returned inside `PointsPage` from `GET /api/qdrant/collections/{name}/points`.
 * Consumed by the `/inspector` page to display chunk text, embedded text, headings, page numbers, metadata, and optional vector previews.
 */
export interface QdrantPoint {
  id: string;
  chunk_text: string;
  embedded_text: string;
  chunk_index: number;
  token_count: number | null;
  headings: string[];
  page_numbers: number[];
  element_types: string[];
  doc_source: string;
  run_id: string;
  extra_payload: Record<string, unknown>;
  vector_preview: Record<string, VectorPreviewEntry>;
}

/**
 * Cursor-paginated response of `QdrantPoint` items returned by `GET /api/qdrant/collections/{name}/points` via `getPoints`.
 * Consumed by the `/inspector` page to render a page of points and manage `next_offset` pagination.
 */
export interface PointsPage {
  collection: string;
  points: QdrantPoint[];
  offset: string | null;
  limit: number;
  has_more: boolean;
  next_offset: string | null;
}

/**
 * Metadata for a completed Step 1 Docling run that has a `document.json` file available for chunking, returned by `GET /api/chunk/docling-runs`.
 * Consumed by `listDoclingRuns()` and the `/chunk` page to populate the source Docling run selector.
 */
export interface DoclingRun {
  run_id: string;
  dir: string;
  has_config: boolean;
  json_size_kb: number;
}

/**
 * Summary record of a past Step 2 chunking & vectorization run returned by `GET /api/chunk/runs` via `listChunkRuns`.
 * Consumed by the `/chunk` page to display historical chunk runs, chunk counts, token averages, and target collections.
 */
export interface ChunkRun {
  status: string;
  chunk_run_id: string;
  collection_name: string;
  chunk_count: number;
  avg_tokens: number;
  elapsed_seconds: number;
  source_run_id: string;
  error?: string;
}

/**
 * List all Qdrant collections.
 * Receives an optional `storagePath` from the `/inspector`, `/enrich`, or `/colpali/retrieve` pages.
 * Queries `GET /api/qdrant/collections` and returns `QdrantCollection[]` to the caller.
 */
export async function listCollections(storagePath = ""): Promise<QdrantCollection[]> {
  const params = storagePath ? `?storage_path=${encodeURIComponent(storagePath)}` : "";
  const res = await fetch(`${API_BASE}/api/qdrant/collections${params}`);
  if (!res.ok) throw new Error(`Failed to list collections: ${res.statusText}`);
  return res.json();
}

/**
 * Get paginated points from a collection using Qdrant cursor pagination.
 * Receives `collectionName`, cursor `offset`, `limit`, `withVectors` flag, and optional `storagePath` from the `/inspector` page.
 * Queries `GET /api/qdrant/collections/{collectionName}/points` and returns a `PointsPage` object to the `/inspector` page.
 */
export async function getPoints(
  collectionName: string,
  offset: string | null = null,
  limit = 20,
  withVectors = false,
  storagePath = ""
): Promise<PointsPage> {
  const params = new URLSearchParams({
    limit: String(limit),
    with_vectors: String(withVectors),
  });
  if (offset) params.set("offset", offset);
  if (storagePath) params.set("storage_path", storagePath);
  const res = await fetch(`${API_BASE}/api/qdrant/collections/${collectionName}/points?${params}`);
  if (!res.ok) throw new Error(`Failed to get points: ${res.statusText}`);
  return res.json();
}

/**
 * Delete a collection.
 * Receives the collection `name` and optional `storagePath` from the `/inspector` page when the user deletes a collection.
 * Sends `DELETE /api/qdrant/collections/{name}` to the backend and resolves `void` to the caller.
 */
export async function deleteCollection(name: string, storagePath = ""): Promise<void> {
  const params = storagePath ? `?storage_path=${encodeURIComponent(storagePath)}` : "";
  const res = await fetch(`${API_BASE}/api/qdrant/collections/${name}${params}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Failed to delete collection: ${res.statusText}`);
}

/**
 * List available Docling runs that can be chunked.
 * Receives no arguments; called by the `/chunk` page on mount.
 * Queries `GET /api/chunk/docling-runs` and returns `DoclingRun[]` to populate the source run dropdown on `/chunk`.
 */
export async function listDoclingRuns(): Promise<DoclingRun[]> {
  const res = await fetch(`${API_BASE}/api/chunk/docling-runs`);
  if (!res.ok) throw new Error(`Failed to list runs: ${res.statusText}`);
  return res.json();
}

/**
 * List past chunk runs.
 * Receives no arguments; called by the `/chunk` page on mount and after a chunk run completes.
 * Queries `GET /api/chunk/runs` and returns `ChunkRun[]` to display the chunk run history list on `/chunk`.
 */
export async function listChunkRuns(): Promise<ChunkRun[]> {
  const res = await fetch(`${API_BASE}/api/chunk/runs`);
  if (!res.ok) throw new Error(`Failed to list chunk runs: ${res.statusText}`);
  return res.json();
}
