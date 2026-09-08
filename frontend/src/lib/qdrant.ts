/**
 * Qdrant Browser API Client
 * --------------------------
 * Functions for browsing the local Qdrant vector DB from the frontend.
 * All calls go through the FastAPI backend (not directly to Qdrant).
 */

const API_BASE = "http://localhost:8000";

export interface QdrantCollection {
  name: string;
  points_count: number;
  vectors_count: number;
  dense_vectors: Record<string, { size: number; distance: string }>;
  sparse_vectors: string[];
  status: string;
  error?: string;
}

export interface VectorPreviewEntry {
  type: "dense" | "sparse";
  dims?: number;
  preview?: number[];
  top_terms?: { index: number; value: number }[];
}

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

export interface PointsPage {
  collection: string;
  points: QdrantPoint[];
  offset: number;
  limit: number;
  has_more: boolean;
  next_offset: string | null;
}

export interface DoclingRun {
  run_id: string;
  dir: string;
  has_config: boolean;
  json_size_kb: number;
}

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

/** List all Qdrant collections. */
export async function listCollections(storagePath = ""): Promise<QdrantCollection[]> {
  const params = storagePath ? `?storage_path=${encodeURIComponent(storagePath)}` : "";
  const res = await fetch(`${API_BASE}/api/qdrant/collections${params}`);
  if (!res.ok) throw new Error(`Failed to list collections: ${res.statusText}`);
  return res.json();
}

/** Get paginated points from a collection. */
export async function getPoints(
  collectionName: string,
  offset = 0,
  limit = 20,
  withVectors = false,
  storagePath = ""
): Promise<PointsPage> {
  const params = new URLSearchParams({
    offset: String(offset),
    limit: String(limit),
    with_vectors: String(withVectors),
  });
  if (storagePath) params.set("storage_path", storagePath);
  const res = await fetch(`${API_BASE}/api/qdrant/collections/${collectionName}/points?${params}`);
  if (!res.ok) throw new Error(`Failed to get points: ${res.statusText}`);
  return res.json();
}

/** Delete a collection. */
export async function deleteCollection(name: string, storagePath = ""): Promise<void> {
  const params = storagePath ? `?storage_path=${encodeURIComponent(storagePath)}` : "";
  const res = await fetch(`${API_BASE}/api/qdrant/collections/${name}${params}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Failed to delete collection: ${res.statusText}`);
}

/** List available Docling runs that can be chunked. */
export async function listDoclingRuns(): Promise<DoclingRun[]> {
  const res = await fetch(`${API_BASE}/api/chunk/docling-runs`);
  if (!res.ok) throw new Error(`Failed to list runs: ${res.statusText}`);
  return res.json();
}

/** List past chunk runs. */
export async function listChunkRuns(): Promise<ChunkRun[]> {
  const res = await fetch(`${API_BASE}/api/chunk/runs`);
  if (!res.ok) throw new Error(`Failed to list chunk runs: ${res.statusText}`);
  return res.json();
}
