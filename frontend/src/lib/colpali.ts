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
 * ColPali API Client
 * -------------------
 * Frontend functions for the ColPali visual retrieval pipeline.
 * Communicates with the /api/colpali backend endpoints.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const API_BASE = `${BASE_URL}/api/colpali`;

/* ── Types ──────────────────────────────────────────────────────── */

/**
 * Metadata for an available PDF file returned by `GET /api/colpali/pdfs`.
 * Consumed by `listPdfs()` and the `/colpali` page to populate the source PDF selector.
 */
export interface PdfFile {
  name: string;
  path: string;
  size_mb: number;
}

/**
 * Configuration payload assembled on the `/colpali` page and sent to `POST /api/colpali/run` via `runColPali`.
 * Specifies the target PDF, ColPali/ColQwen2 model, hardware device, rendering DPI, page limit, metadata, and Qdrant collection settings.
 */
export interface ColPaliConfig {
  pdf_path: string;
  model_name: string;
  device: string;
  batch_size: number;
  dpi: number;
  max_pages: number | null;
  metadata: Record<string, string>;
  collection_name: string;
  qdrant_storage_path: string;
}

/**
 * Single ranked page result returned inside `ColPaliRetrieveResponse` from `POST /api/colpali/retrieve`.
 * Consumed by the `/colpali/retrieve` page to display MaxSim score, page number, document source, and payload metadata.
 */
export interface ColPaliRetrievedPage {
  id: string;
  score: number;
  page_number: number;
  doc_source: string;
  metadata: Record<string, unknown>;
}

/**
 * Response payload from `POST /api/colpali/retrieve` returned by `retrieveColPali`.
 * Delivers the original query and ranked `ColPaliRetrievedPage` array to the `/colpali/retrieve` page.
 */
export interface ColPaliRetrieveResponse {
  query: string;
  results: ColPaliRetrievedPage[];
}

/* ── API Functions ──────────────────────────────────────────────── */

/**
 * List available PDFs from test_data/.
 * Receives no arguments; called by the `/colpali` page on mount.
 * Queries `GET /api/colpali/pdfs` and returns `PdfFile[]` to populate the PDF selection dropdown.
 */
export async function listPdfs(): Promise<PdfFile[]> {
  const res = await fetch(`${API_BASE}/pdfs`);
  if (!res.ok) throw new Error(`Failed to list PDFs: ${res.statusText}`);
  return res.json();
}

/**
 * Start the ColPali pipeline and stream SSE progress.
 * Receives `config` (`ColPaliConfig`) and event callbacks (`onLog`, `onProgress`, `onDone`, `onError`) from the `/colpali` page.
 *
 * WHY: We use fetch + ReadableStream (not EventSource) because the
 * endpoint is a POST, and EventSource only supports GET.
 *
 * HOW: We read the response body as a stream, parsing SSE `data:` lines
 * and invoking callbacks for log lines and progress updates. Wrapped in
 * try/catch so network or stream failures always invoke onError.
 * Emits log lines, percentage progress, completion, or error messages back to the `/colpali` page state.
 */
export async function runColPali(
  config: ColPaliConfig,
  onLog: (line: string) => void,
  onProgress: (pct: number) => void,
  onDone: () => void,
  onError: (err: string) => void
): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });

    if (!res.ok || !res.body) {
      onError(`Pipeline request failed: ${res.statusText}`);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const payload = line.slice(6);
          if (payload.startsWith("[ERROR]")) {
            onError(payload.slice(8));
            return;
          }
          if (payload.startsWith("__PROGRESS__=")) {
            onProgress(Number(payload.split("=")[1]));
          } else {
            onLog(payload);
          }
        }
      }
    }
    onDone();
  } catch (e: unknown) {
    onError(e instanceof Error ? e.message : String(e));
  }
}

/**
 * Run MaxSim retrieval against a ColPali collection.
 * Receives `collection_name`, `query`, and optional `limit` from the `/colpali/retrieve` page.
 * Sends `POST /api/colpali/retrieve` to the backend and returns the parsed `ColPaliRetrieveResponse` to the caller.
 */
export async function retrieveColPali(
  collection_name: string,
  query: string,
  limit: number = 5
): Promise<ColPaliRetrieveResponse> {
  const res = await fetch(`${API_BASE}/retrieve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ collection_name, query, limit }),
  });
  if (!res.ok) throw new Error(`ColPali retrieval failed: ${res.statusText}`);
  return res.json();
}
