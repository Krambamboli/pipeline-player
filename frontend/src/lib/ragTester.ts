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
 * RAG Tester API Client
 * ---------------------
 * Folder discovery, PDF preview and the SSE run stream for the RAG Tester,
 * which ingests a whole course folder into a hybrid text collection and a
 * ColPali page collection in one run.
 */

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/rag-tester`;

/* ── Types ──────────────────────────────────────────────────────── */

/**
 * Metadata for a subfolder under `test_data/` containing PDFs, returned by `GET /api/rag-tester/folders` via `listCourseFolders`.
 * Consumed by the `/rag-tester` page to populate quick-select course folder buttons.
 */
export interface CourseFolder {
  name: string;
  rel_path: string;
  path: string;
  pdf_count: number;
}

/**
 * Metadata for a single discovered PDF file inside a scanned folder, returned within `FolderScan` from `POST /api/rag-tester/scan`.
 * Consumed by the `/rag-tester` page to preview PDF filenames, page counts, and file sizes before starting a batch run.
 */
export interface ScannedPdf {
  name: string;
  rel_path: string;
  path: string;
  pages: number | null;
  size_mb: number;
}

/**
 * Folder scan response returned by `POST /api/rag-tester/scan` via `scanFolder`.
 * Provides the resolved folder path, course name, discovered `ScannedPdf[]`, total page count, and suggested collection names to the `/rag-tester` page.
 */
export interface FolderScan {
  folder: string;
  course: string;
  pdfs: ScannedPdf[];
  total_pages: number;
  suggested_hybrid_collection: string;
  suggested_colpali_collection: string;
}

/**
 * Batch ingestion configuration payload assembled on the `/rag-tester` page and sent to `POST /api/rag-tester/run` via `runRagTester`.
 * Specifies target folder, profile names (`docling_profile`, `chunk_profile`, `colpali_profile`), track toggles, collection names, worker count, and custom metadata.
 */
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

/**
 * Pipeline track identifier ("text", "visual", or "system") carried on `RagEvent` log messages from `POST /api/rag-tester/run`.
 * Used by the `/rag-tester` page to route and badge log lines by subsystem.
 */
export type Track = "text" | "visual" | "system";

/**
 * Per-document processing state on either the text or visual track, emitted in `RagEvent` (`type: "doc"`) by `POST /api/rag-tester/run`.
 * Consumed by the `/rag-tester` page to render live status badges and progress bars in the document matrix.
 */
export type DocStatus =
  | "queued" | "parsing" | "chunking" | "embedding" | "encoding"
  | "done" | "error" | "cancelled" | "disabled";

/**
 * Final summary payload emitted in `RagEvent` (`type: "result"`) when a batch RAG Tester run finishes on `POST /api/rag-tester/run`.
 * Consumed by the `/rag-tester` page to display overall status, created collections, total chunks/pages, elapsed time, and any per-document failures.
 */
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

/**
 * Structured events emitted by POST /api/rag-tester/run.
 * Parsed by `runRagTester` and delivered via `onEvent` to the `/rag-tester` page to drive the live progress table, logs, and final summary.
 */
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

/**
 * Folders below test_data/ that contain PDFs.
 * Receives no arguments; called by the `/rag-tester` page on mount.
 * Queries `GET /api/rag-tester/folders` and returns `CourseFolder[]` to populate the folder picker UI.
 */
export async function listCourseFolders(): Promise<CourseFolder[]> {
  const res = await fetch(`${API_BASE}/folders`);
  if (!res.ok) throw new Error(`Failed to list folders: ${res.statusText}`);
  return res.json();
}

/**
 * Preview the PDFs of any folder (absolute, ~/..., or relative to test_data/).
 * Receives `folder_path` and `recursive` boolean from the `/rag-tester` page when a folder is selected or scanned.
 * Sends `POST /api/rag-tester/scan` and returns a `FolderScan` object with discovered PDFs and suggested collection names to `/rag-tester`.
 */
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
 * Receives `req` (`RagTesterRequest`), `onEvent` callback, and optional `AbortSignal` from the `/rag-tester` page.
 * WHY fetch + ReadableStream: the endpoint is a POST (EventSource is GET-only).
 * Closing the stream (abort) cancels the run on the backend.
 * Reads SSE `data:` blocks from `POST /api/rag-tester/run` and emits parsed `RagEvent` objects to `onEvent` until `[DONE]`.
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

/**
 * Ask the backend to cancel an active run.
 * Receives the active `run_id` string from the `/rag-tester` page when the user clicks Cancel.
 * Sends `POST /api/rag-tester/cancel/{run_id}` to stop backend workers and resolves `void`.
 */
export async function cancelRagTester(run_id: string): Promise<void> {
  await fetch(`${API_BASE}/cancel/${encodeURIComponent(run_id)}`, { method: "POST" });
}
