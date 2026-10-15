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
 * RAG Tester API Client
 * ---------------------
 * Folder discovery, PDF preview and the SSE run stream for the RAG Tester,
 * which ingests a whole course folder into a hybrid text collection and a
 * ColPali page collection in one run.
 */

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/rag-tester`;

/* ── Types ──────────────────────────────────────────────────────── */

export interface CourseFolder {
  name: string;
  rel_path: string;
  path: string;
  pdf_count: number;
}

export interface ScannedPdf {
  name: string;
  rel_path: string;
  path: string;
  pages: number | null;
  size_mb: number;
}

export interface FolderScan {
  folder: string;
  course: string;
  pdfs: ScannedPdf[];
  total_pages: number;
  suggested_hybrid_collection: string;
  suggested_colpali_collection: string;
}

export interface RagTesterRequest {
  folder_path: string;
  recursive: boolean;
  docling_profile: string;
  chunk_profile: string;
  colpali_profile: string;
  enable_text_track: boolean;
  enable_visual_track: boolean;
  hybrid_collection: string;
  colpali_collection: string;
  overwrite: boolean;
  force_hybrid_embedding: boolean;
  docling_workers: number;
  custom_metadata: Record<string, string>;
}

export type Track = "text" | "visual" | "system";
export type DocStatus =
  | "queued" | "parsing" | "chunking" | "embedding" | "encoding"
  | "done" | "error" | "cancelled" | "disabled";

export interface RagSummary {
  status: "success" | "partial" | "cancelled" | "error";
  error?: string;
  run_id?: string;
  course?: string;
  documents?: number;
  hybrid_collection?: string | null;
  colpali_collection?: string | null;
  total_chunks?: number;
  total_pages?: number;
  failures?: { doc: string; track: string; error: string }[];
  elapsed_seconds?: number;
}

/** Structured events emitted by POST /api/rag-tester/run. */
export type RagEvent =
  | {
      type: "start";
      run_id: string;
      folder: string;
      course: string;
      hybrid_collection: string | null;
      colpali_collection: string | null;
      docs: { rel_path: string; name: string; pages: number | null }[];
    }
  | { type: "log"; track: Track; msg: string }
  | {
      type: "doc";
      track: "text" | "visual";
      doc: string;
      status: DocStatus;
      progress?: number;
      count?: number;
      detail?: string;
    }
  | { type: "result"; result: RagSummary };

/* ── API ────────────────────────────────────────────────────────── */

/** Folders below test_data/ that contain PDFs. */
export async function listCourseFolders(): Promise<CourseFolder[]> {
  const res = await fetch(`${API_BASE}/folders`);
  if (!res.ok) throw new Error(`Failed to list folders: ${res.statusText}`);
  return res.json();
}

/** Preview the PDFs of any folder (absolute, ~/..., or relative to test_data/). */
export async function scanFolder(folder_path: string, recursive: boolean): Promise<FolderScan> {
  const res = await fetch(`${API_BASE}/scan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder_path, recursive }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? res.statusText);
  }
  return res.json();
}

/**
 * Start a run and stream its events.
 * WHY fetch + ReadableStream: the endpoint is a POST (EventSource is GET-only).
 * Closing the stream (abort) cancels the run on the backend.
 */
export async function runRagTester(
  req: RagTesterRequest,
  onEvent: (evt: RagEvent) => void,
  signal?: AbortSignal
): Promise<void> {
  const res = await fetch(`${API_BASE}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
    signal,
  });
  if (!res.ok || !res.body) throw new Error(`Run request failed: ${res.status} ${res.statusText}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // SSE events are separated by a blank line
    const blocks = buffer.split("\n\n");
    buffer = blocks.pop() ?? "";
    for (const block of blocks) {
      const line = block.trim();
      if (!line.startsWith("data:")) continue;
      const raw = line.slice(5).trim();
      if (raw === "[DONE]") return;
      try {
        onEvent(JSON.parse(raw) as RagEvent);
      } catch {
        /* ignore malformed lines */
      }
    }
  }
}

/** Ask the backend to cancel an active run. */
export async function cancelRagTester(run_id: string): Promise<void> {
  await fetch(`${API_BASE}/cancel/${encodeURIComponent(run_id)}`, { method: "POST" });
}
