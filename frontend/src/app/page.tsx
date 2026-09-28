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
 * Main Dashboard Page
 * -------------------
 * Assembles all panels into the three-column application shell:
 *   LEFT:  Config Panel (all Docling parameters) + Profile Manager
 *   CENTER: Output Viewer (parsed document) + Run History
 *   RIGHT: Run Console (live log stream) + Run controls
 */

import { useCallback, useEffect, useState } from "react";
import { checkHealth, listDocuments, DocumentInfo } from "@/lib/api";
import { useConfig } from "@/hooks/useConfig";
import { useRunStream } from "@/hooks/useRunStream";
import type { RunResult } from "@/types/config";
import { downloadDoclingProfile } from "@/lib/downloadSettings";

import ConfigPanel from "@/components/ConfigPanel";
import ProfileManager from "@/components/ProfileManager";
import RunConsole from "@/components/RunConsole";
import OutputViewer from "@/components/OutputViewer";
import RunHistory from "@/components/RunHistory";

export default function Home() {
  const [serverOk, setServerOk] = useState<boolean | null>(null);
  const [historyTick, setHistoryTick] = useState(0);
  const [selectedRun, setSelectedRun] = useState<RunResult | null>(null);
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<string>("");

  // Config state — manages active profile, debounced auto-save
  const { config, isSaving, isLoading, error: configError, updateField, switchProfile, saveAs } = useConfig("default");

  // Run stream state — SSE log streaming
  const {
    isRunning,
    logs,
    lastRunId,
    lastStatus,
    lastDuration,
    lastOutputFiles,
    lastOutputDir,
    errorMessage,
    startRun,
    cancelRun,
    clearLogs,
    progress,
  } = useRunStream();

  // Health check and docs fetch on mount
  useEffect(() => {
    checkHealth()
      .then(() => setServerOk(true))
      .catch(() => setServerOk(false));
      
    listDocuments()
      .then((docs) => {
        setDocuments(docs);
        if (docs.length > 0) setSelectedDoc(docs[0].filename);
      })
      .catch(console.error);
  }, []);

  // Refresh run history after each run completes
  useEffect(() => {
    if (lastStatus) setHistoryTick((t) => t + 1);
  }, [lastStatus]);

  const handleRunHistorySelect = useCallback((run: RunResult) => {
    setSelectedRun(run);
  }, []);

  // Output source: prefer last stream result, fallback to history selection
  const displayDir = lastOutputDir ?? selectedRun?.output_dir ?? null;
  const displayFiles = lastOutputFiles.length > 0 ? lastOutputFiles : (selectedRun?.output_files ?? []);

  const handleSelectFile = useCallback((dir: string, file: string) => {
    // The OutputViewer reads from the runId embedded in the dir name
    // Here we just ensure it has the latest dir/files
    setSelectedRun(null); // clear history selection so stream result takes priority
  }, []);

  const statusDotClass = serverOk === null
    ? ""
    : serverOk
    ? (isSaving ? "saving" : "connected")
    : "error";

  return (
    <div className="app-shell">
      {/* ── Left: Config Panel ───────────────────────────────────────────── */}
      <aside className="panel panel--config">
        <div className="panel__header">
          <span className="panel__title">🛠 Docling Configuration</span>
          {/* Backend status + profile — moved here from removed topbar */}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            {config && (
              <span style={{ fontSize: "0.68rem", color: "var(--c-text-3)" }}>
                <strong style={{ color: "var(--c-text)" }}>{config.profile_name}</strong>
              </span>
            )}
            <div className={`status-dot ${statusDotClass}`} title={
              serverOk === null ? "Connecting…"
              : serverOk ? (isSaving ? "Saving…" : "Backend connected")
              : "Backend offline"
            } />
          </div>
          {configError && (
            <span style={{ fontSize: "0.7rem", color: "var(--c-error)", marginLeft: 4 }}>
              {configError}
            </span>
          )}
        </div>

        {/* Profile switcher — with download button */}
        {config && (
          <ProfileManager
            currentProfile={config.profile_name}
            onSwitch={switchProfile}
            onSaveAs={saveAs}
            onDownload={() => downloadDoclingProfile(config)}
          />
        )}

        <div className="panel__body">
          {isLoading && (
            <div style={{ color: "var(--c-text-3)", fontSize: "0.8rem", textAlign: "center", padding: "32px 0" }}>
              Loading config…
            </div>
          )}
          {!isLoading && config && (
            <ConfigPanel config={config} onUpdate={updateField} />
          )}
        </div>
      </aside>

      {/* ── Center: Output Viewer + Run History ─────────────────────────── */}
      <main className="panel panel--main" style={{ display: "flex", flexDirection: "column" }}>
        {/* Output viewer (takes most of the space) */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div className="panel__header">
            <span className="panel__title">📄 Output Viewer</span>
            {displayDir && (
              <span style={{ marginLeft: "auto", fontSize: "0.7rem", color: "var(--c-text-3)", fontFamily: "var(--font-mono)" }}>
                {displayDir}
              </span>
            )}
          </div>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <OutputViewer runDir={displayDir} outputFiles={displayFiles} />
          </div>
        </div>

        {/* Run history (collapsed at bottom) */}
        <div style={{ maxHeight: 200, overflow: "hidden", borderTop: "1px solid var(--c-border)", flexShrink: 0 }}>
          <div className="panel__header">
            <span className="panel__title">🕑 Run History</span>
          </div>
          <div className="panel__body" style={{ padding: "8px 12px" }}>
            <RunHistory
              refreshTrigger={historyTick}
              onSelect={handleRunHistorySelect}
              selectedRunId={selectedRun?.run_id ?? null}
            />
          </div>
        </div>
      </main>

      {/* ── Right: Run Controls + Console ───────────────────────────────── */}
      <aside className="panel panel--console" style={{ display: "flex", flexDirection: "column" }}>
        <div className="panel__header">
          <span className="panel__title">⚡ Run Console</span>
          {logs.length > 0 && !isRunning && (
            <button
              onClick={clearLogs}
              style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--c-text-3)", cursor: "pointer", fontSize: "0.75rem" }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Run + Stats summary */}
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--c-border)", flexShrink: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
          <select
            value={selectedDoc}
            onChange={(e) => setSelectedDoc(e.target.value)}
            disabled={isRunning || documents.length === 0}
            style={{ padding: "8px", borderRadius: "4px", border: "1px solid var(--c-border)", background: "var(--c-bg-2)", color: "var(--c-text)", fontSize: "0.85rem" }}
          >
            {documents.length === 0 && <option value="">No documents found</option>}
            {documents.map((doc) => (
              <option key={doc.filename} value={doc.filename}>
                {doc.filename} ({doc.estimated_seconds}s)
              </option>
            ))}
          </select>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              id="run-pipeline-btn"
              className={`run-btn ${isRunning ? "run-btn--running" : ""}`}
              disabled={isRunning || !config || !serverOk || !selectedDoc}
              onClick={() => config && startRun(config.profile_name, selectedDoc)}
              style={{ flex: 1 }}
            >
              {isRunning ? (
                <>
                  <div className="run-btn__spinner" />
                  Running Pipeline…
                </>
              ) : (
                <>▶ Run Pipeline</>
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
          {isRunning && (
            <div style={{ width: "100%", background: "var(--c-bg-2)", height: "6px", borderRadius: "3px", overflow: "hidden", marginTop: "4px" }}>
              <div style={{ width: `${progress}%`, background: "var(--c-accent)", height: "100%", transition: "width 0.3s ease" }} />
            </div>
          )}

          {/* Mini stats from last run */}
          {lastStatus && !isRunning && (
            <div className="stat-grid" style={{ marginTop: 10 }}>
              <div className="stat-box">
                <div className="stat-box__label">Duration</div>
                <div className="stat-box__value">{lastDuration?.toFixed(2) ?? "—"}s</div>
              </div>
              <div className="stat-box">
                <div className="stat-box__label">Status</div>
                <div
                  className="stat-box__value"
                  style={{ color: lastStatus === "success" ? "var(--c-success)" : "var(--c-error)", fontSize: "0.9rem" }}
                >
                  {lastStatus === "success" ? "✅ OK" : "❌ Error"}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Log stream */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <RunConsole
            logs={logs}
            isRunning={isRunning}
            lastStatus={lastStatus}
            lastDuration={lastDuration}
            lastOutputFiles={lastOutputFiles}
            lastOutputDir={lastOutputDir}
            errorMessage={errorMessage}
            onSelectFile={handleSelectFile}
          />
        </div>
      </aside>
    </div>
  );
}
