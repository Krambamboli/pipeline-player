"use client";

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
 * Chunk & Vectorize Page
 * ----------------------
 * Step 2 of the pipeline: chunk a Docling document, embed it, and upsert
 * into a local Qdrant collection.
 *
 * Layout:
 *   LEFT:   ChunkConfigPanel — all chunking/embedding/Qdrant options
 *   CENTER: Source run selector + result summary
 *   RIGHT:  Run console (SSE log stream + progress)
 */

import { useCallback, useEffect, useState } from "react";
import { listDoclingRuns, DoclingRun } from "@/lib/qdrant";
import { useChunkStream, DEFAULT_CHUNK_CONFIG, ChunkConfig } from "@/hooks/useChunkStream";
import ChunkConfigPanel from "@/components/ChunkConfigPanel";

export default function ChunkPage() {
  const [doclingRuns, setDoclingRuns] = useState<DoclingRun[]>([]);
  const [config, setConfig] = useState<ChunkConfig>({ ...DEFAULT_CHUNK_CONFIG });
  const [customKeyInput, setCustomKeyInput] = useState("");
  const [customValInput, setCustomValInput] = useState("");

  const {
    isRunning,
    logs,
    progress,
    result,
    errorMessage,
    startRun,
    cancelRun,
    clearLogs,
  } = useChunkStream();

  // Load available Docling runs on mount
  useEffect(() => {
    listDoclingRuns()
      .then((runs) => {
        setDoclingRuns(runs);
        if (runs.length > 0 && !config.source_run_id) {
          setConfig((c) => ({ ...c, source_run_id: runs[0].run_id }));
        }
      })
      .catch(console.error);
  }, []);

  const updateField = useCallback((path: string, value: unknown) => {
    setConfig((prev) => {
      const next = structuredClone(prev);
      // path like "embedding.mode" or "hybrid_chunker_options.max_tokens"
      const keys = path.split(".");
      let obj: Record<string, unknown> = next as unknown as Record<string, unknown>;
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]] as Record<string, unknown>;
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  }, []);

  const handleRun = useCallback(() => {
    startRun(config);
  }, [config, startRun]);

  const addCustomField = useCallback(() => {
    if (!customKeyInput.trim()) return;
    setConfig((c) => ({
      ...c,
      metadata: {
        ...c.metadata,
        custom_fields: {
          ...c.metadata.custom_fields,
          [customKeyInput.trim()]: customValInput,
        },
      },
    }));
    setCustomKeyInput("");
    setCustomValInput("");
  }, [customKeyInput, customValInput]);

  const removeCustomField = useCallback((key: string) => {
    setConfig((c) => {
      const fields = { ...c.metadata.custom_fields };
      delete fields[key];
      return { ...c, metadata: { ...c.metadata, custom_fields: fields } };
    });
  }, []);

  return (
    <div className="app-shell">
      {/* LEFT: Config Panel */}
      <aside className="panel panel--config">
        <div className="panel__header">
          <span className="panel__title">✂️ Chunking Configuration</span>
        </div>
        <div className="panel__body">
          <ChunkConfigPanel
            config={config}
            onUpdate={updateField}
            customKeyInput={customKeyInput}
            customValInput={customValInput}
            onCustomKeyChange={setCustomKeyInput}
            onCustomValChange={setCustomValInput}
            onAddCustomField={addCustomField}
            onRemoveCustomField={removeCustomField}
          />
        </div>
      </aside>

      {/* CENTER: Source selector + last result */}
      <main className="panel panel--main" style={{ display: "flex", flexDirection: "column" }}>
        <div className="panel__header">
          <span className="panel__title">📄 Source Document</span>
        </div>
        <div className="panel__body" style={{ padding: "16px" }}>
          {/* Run selector */}
          <label className="form-label">Select Docling Run to Chunk</label>
          <select
            className="form-select"
            value={config.source_run_id}
            onChange={(e) => updateField("source_run_id", e.target.value)}
            disabled={isRunning}
          >
            {doclingRuns.length === 0 && (
              <option value="">No parsed runs found — run Step 1 first</option>
            )}
            {doclingRuns.map((r) => (
              <option key={r.run_id} value={r.run_id}>
                run_{r.run_id} ({r.json_size_kb} KB)
              </option>
            ))}
          </select>

          {/* Result summary */}
          {result && (
            <div className="chunk-result-card" style={{ marginTop: 24 }}>
              {result.status === "success" ? (
                <>
                  <div className="chunk-result-card__title">✅ Chunk Run Complete</div>
                  <div className="stat-grid" style={{ marginTop: 12 }}>
                    <div className="stat-box">
                      <div className="stat-box__label">Chunks</div>
                      <div className="stat-box__value">{result.chunk_count}</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-box__label">Avg Tokens</div>
                      <div className="stat-box__value">{result.avg_tokens}</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-box__label">Duration</div>
                      <div className="stat-box__value">{result.elapsed_seconds}s</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 12, fontSize: "0.8rem", color: "var(--c-text-3)" }}>
                    Collection:{" "}
                    <strong style={{ color: "var(--c-accent)", fontFamily: "var(--font-mono)" }}>
                      {result.collection_name}
                    </strong>
                  </div>
                  <div style={{ marginTop: 8, fontSize: "0.75rem", color: "var(--c-text-3)" }}>
                    View chunks in the{" "}
                    <a href="/inspector" style={{ color: "var(--c-accent)" }}>
                      🔍 Vector DB Inspector
                    </a>
                  </div>
                </>
              ) : (
                <div style={{ color: "var(--c-error)" }}>
                  ❌ Error: {result.error}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* RIGHT: Run Console */}
      <aside className="panel panel--console" style={{ display: "flex", flexDirection: "column" }}>
        <div className="panel__header">
          <span className="panel__title">⚡ Chunk Console</span>
          {logs.length > 0 && !isRunning && (
            <button
              onClick={clearLogs}
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                color: "var(--c-text-3)",
                cursor: "pointer",
                fontSize: "0.75rem",
              }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Run controls */}
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--c-border)", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              id="run-chunk-btn"
              className={`run-btn ${isRunning ? "run-btn--running" : ""}`}
              disabled={isRunning || !config.source_run_id}
              onClick={handleRun}
              style={{ flex: 1 }}
            >
              {isRunning ? (
                <>
                  <div className="run-btn__spinner" />
                  Chunking…
                </>
              ) : (
                <>✂️ Run Chunking Pipeline</>
              )}
            </button>
            {isRunning && (
              <button
                className="run-btn"
                style={{ background: "var(--c-danger)", color: "white" }}
                onClick={cancelRun}
              >
                ■ Cancel
              </button>
            )}
          </div>

          {/* Progress bar */}
          {isRunning && (
            <div
              style={{
                width: "100%",
                background: "var(--c-bg-2)",
                height: "6px",
                borderRadius: "3px",
                overflow: "hidden",
                marginTop: "8px",
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  background: "var(--c-accent)",
                  height: "100%",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          )}

          {errorMessage && !isRunning && (
            <div style={{ color: "var(--c-error)", fontSize: "0.75rem", marginTop: 8 }}>
              ❌ {errorMessage}
            </div>
          )}
        </div>

        {/* Log stream */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "8px 12px",
            fontFamily: "var(--font-mono)",
            fontSize: "0.72rem",
            lineHeight: "1.6",
          }}
        >
          {logs.length === 0 && (
            <div style={{ color: "var(--c-text-3)", textAlign: "center", paddingTop: 32 }}>
              Select a run and click ✂️ to start chunking.
            </div>
          )}
          {logs.map((log, i) => (
            <div
              key={i}
              style={{
                color: log.includes("❌")
                  ? "var(--c-error)"
                  : log.includes("✅")
                  ? "var(--c-success)"
                  : "var(--c-text-2)",
                padding: "1px 0",
              }}
            >
              {log}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
