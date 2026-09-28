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
 * ColPali API Client
 * -------------------
 * Frontend functions for the ColPali visual retrieval pipeline.
 * Communicates with the /api/colpali backend endpoints.
 */

const API_BASE = "http://localhost:8000/api/colpali";

/* ── Types ──────────────────────────────────────────────────────── */

export interface PdfFile {
  name: string;
  path: string;
  size_mb: number;
}

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

export interface ColPaliRetrievedPage {
  id: string;
  score: number;
  page_number: number;
  doc_source: string;
  metadata: Record<string, string>;
}

export interface ColPaliRetrieveResponse {
  query: string;
  results: ColPaliRetrievedPage[];
}

/* ── API Functions ──────────────────────────────────────────────── */

/** List available PDFs from test_data/. */
export async function listPdfs(): Promise<PdfFile[]> {
  const res = await fetch(`${API_BASE}/pdfs`);
  if (!res.ok) throw new Error(`Failed to list PDFs: ${res.statusText}`);
  return res.json();
}

/**
 * Start the ColPali pipeline and stream SSE progress.
 *
 * WHY: We use fetch + ReadableStream (not EventSource) because the
 * endpoint is a POST, and EventSource only supports GET.
 *
 * HOW: We read the response body as a stream, parsing SSE `data:` lines
 * and invoking callbacks for log lines and progress updates.
 */
export async function runColPali(
  config: ColPaliConfig,
  onLog: (line: string) => void,
  onProgress: (pct: number) => void,
  onDone: () => void,
  onError: (err: string) => void
): Promise<void> {
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
}

/** Run MaxSim retrieval against a ColPali collection. */
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
