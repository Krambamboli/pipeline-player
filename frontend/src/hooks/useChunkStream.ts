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
 * useChunkStream — SSE hook for the chunk → embed → Qdrant upsert pipeline
 * -------------------------------------------------------------------------
 * Mirrors the pattern of useRunStream.ts but consumes the /api/chunk/run SSE.
 */

"use client";

import { useCallback, useRef, useState } from "react";

const API_BASE = "http://localhost:8000";

// Default chunk config shape sent to the backend
export interface ChunkConfig {
  profile_name: string;
  description: string;
  source_run_id: string;
  chunker: "hybrid" | "hierarchical" | "page";
  hybrid_chunker_options: {
    tokenizer_model: string;
    max_tokens: number;
    repeat_table_header: boolean;
    merge_peers: boolean;
    omit_header_on_overflow: boolean;
    always_emit_headings: boolean;
  };
  hierarchical_chunker_options: {
    always_emit_headings: boolean;
    merge_list_items: boolean;
  };
  serialization: {
    include_headings_in_text: boolean;
    include_captions_in_text: boolean;
  };
  metadata: {
    add_doc_source: boolean;
    add_run_id: boolean;
    add_page_numbers: boolean;
    add_headings: boolean;
    add_element_types: boolean;
    add_token_count: boolean;
    custom_fields: Record<string, string>;
  };
  embedding: {
    mode: "dense" | "sparse" | "hybrid";
    dense_model: string;
    sparse_model: string;
    batch_size: number;
  };
  qdrant: {
    storage_path: string;
    collection_name: string;
    overwrite_collection: boolean;
    on_disk_payload: boolean;
  };
}

export const DEFAULT_CHUNK_CONFIG: ChunkConfig = {
  profile_name: "default-chunk",
  description: "Default chunking & vectorization configuration",
  source_run_id: "",
  chunker: "hybrid",
  hybrid_chunker_options: {
    tokenizer_model: "BAAI/bge-small-en-v1.5",
    max_tokens: 512,
    repeat_table_header: true,
    merge_peers: true,
    omit_header_on_overflow: false,
    always_emit_headings: false,
  },
  hierarchical_chunker_options: {
    always_emit_headings: false,
    merge_list_items: true,
  },
  serialization: {
    include_headings_in_text: true,
    include_captions_in_text: true,
  },
  metadata: {
    add_doc_source: true,
    add_run_id: true,
    add_page_numbers: true,
    add_headings: true,
    add_element_types: true,
    add_token_count: true,
    custom_fields: {},
  },
  embedding: {
    mode: "dense",
    dense_model: "BAAI/bge-small-en-v1.5",
    sparse_model: "Qdrant/bm25",
    batch_size: 32,
  },
  qdrant: {
    storage_path: "./qdrant_storage",
    collection_name: "",
    overwrite_collection: false,
    on_disk_payload: true,
  },
};

export interface ChunkResult {
  status: string;
  chunk_run_id?: string;
  collection_name?: string;
  chunk_count?: number;
  avg_tokens?: number;
  elapsed_seconds?: number;
  source_run_id?: string;
  error?: string;
}

export function useChunkStream() {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ChunkResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const clearLogs = useCallback(() => {
    setLogs([]);
    setResult(null);
    setErrorMessage(null);
    setProgress(0);
  }, []);

  const startRun = useCallback(async (config: ChunkConfig) => {
    if (isRunning) return;

    setIsRunning(true);
    setLogs([]);
    setResult(null);
    setErrorMessage(null);
    setProgress(0);

    const abort = new AbortController();
    abortRef.current = abort;

    try {
      const res = await fetch(`${API_BASE}/api/chunk/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
        signal: abort.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error(`Server returned ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE events
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const block of lines) {
          const dataLine = block.trim();
          if (!dataLine.startsWith("data:")) continue;
          const raw = dataLine.slice(5).trim();
          if (raw === "[DONE]") break;

          // Progress events
          if (raw.startsWith("__PROGRESS__=")) {
            const pct = parseInt(raw.split("=")[1], 10);
            if (!isNaN(pct)) setProgress(pct);
            continue;
          }

          try {
            const evt = JSON.parse(raw);
            if (evt.log) {
              setLogs((prev) => [...prev, evt.log]);
            }
            if (evt.result) {
              setResult(evt.result);
              if (evt.result.status === "error") {
                setErrorMessage(evt.result.error ?? "Unknown error");
              }
            }
          } catch {
            // plain text log line
            if (raw) setLogs((prev) => [...prev, raw]);
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setErrorMessage(err.message);
      }
    } finally {
      setIsRunning(false);
      abortRef.current = null;
    }
  }, [isRunning]);

  const cancelRun = useCallback(() => {
    abortRef.current?.abort();
    setIsRunning(false);
    setLogs((prev) => [...prev, "⚠️ Run cancelled by user"]);
  }, []);

  return {
    isRunning,
    logs,
    progress,
    result,
    errorMessage,
    startRun,
    cancelRun,
    clearLogs,
  };
}
