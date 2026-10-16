"use client";

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
 * RunConsole — Real-time log output panel.
 * Displays streaming SSE log lines from the pipeline runner,
 * colour-coded by line content.
 */

import { useEffect, useRef } from "react";

/**
 * Props received by `RunConsole` from the Step 1 Docling Parser page (`app/page.tsx`).
 * Supplies streaming `logs`, `isRunning` status, completion details (`lastStatus`, `lastDuration`, `lastOutputFiles`, `lastOutputDir`, `errorMessage`) from `useRunStream`, and `onSelectFile`.
 */
interface Props {
  logs: string[];
  isRunning: boolean;
  lastStatus: "success" | "error" | null;
  lastDuration: number | null;
  lastOutputFiles: string[];
  lastOutputDir: string | null;
  errorMessage: string | null;
  onSelectFile: (dir: string, file: string) => void;
}

/**
 * Maps a raw console log `line` string to a semantic CSS modifier class for colour-coding.
 * Receives `line` from `RunConsole`'s log rendering loop and returns the matching `.console__line--*` class name (or `""`).
 */
function classifyLine(line: string): string {
  if (line.includes("✅") || line.includes("✓")) return "console__line--success";
  if (line.includes("❌") || line.includes("Error") || line.includes("failed"))
    return "console__line--error";
  if (line.includes("⚠") || line.includes("warn") || line.includes("Warning"))
    return "console__line--warn";
  if (line.startsWith("─") || line.startsWith("  ")) return "console__line--dim";
  if (line.includes("▶") || line.includes("⚙") || line.includes("💾"))
    return "console__line--header";
  return "";
}

/**
 * Real-time streaming log console and run completion summary banner for Step 1 Docling runs.
 * Receives `Props` from the Step 1 page (`app/page.tsx`).
 * Renders auto-scrolling colour-coded log lines and clickable output file chips that invoke `onSelectFile(dir, file)` to open files in `OutputViewer`.
 */
export default function RunConsole({
  logs,
  isRunning,
  lastStatus,
  lastDuration,
  lastOutputFiles,
  lastOutputDir,
  errorMessage,
  onSelectFile,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new log lines
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <>
      {/* Log output */}
      <div className="console">
        {logs.length === 0 && !isRunning ? (
          <div className="console__empty">
            <div className="console__empty-icon">⚡</div>
            <div className="console__empty-text">Run the pipeline to see output here</div>
          </div>
        ) : (
          <>
            {logs.map((line, i) => (
              <div key={i} className={`console__line ${classifyLine(line)}`}>
                {line}
              </div>
            ))}
            {isRunning && (
              <div className="console__line" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "var(--c-warn)", animation: "pulse 1s infinite" }} />
                <span style={{ color: "var(--c-warn)" }}>Running…</span>
              </div>
            )}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Result summary */}
      {lastStatus && !isRunning && (
        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid var(--c-border)",
            background: lastStatus === "success" ? "var(--c-success-bg)" : "var(--c-error-bg)",
          }}
        >
          {lastStatus === "success" ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ color: "var(--c-success)", fontWeight: 700, fontSize: "0.82rem" }}>
                  ✅ Complete in {lastDuration?.toFixed(2)}s
                </span>
              </div>
              {lastOutputFiles.length > 0 && (
                <div className="file-chips">
                  {lastOutputFiles.map((f) => (
                    <button
                      key={f}
                      className="file-chip"
                      onClick={() => lastOutputDir && onSelectFile(lastOutputDir, f)}
                      title={`View ${f}`}
                    >
                      📄 {f}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={{ color: "var(--c-error)", fontSize: "0.8rem", fontWeight: 600 }}>
              ❌ {errorMessage ?? "Pipeline failed — see logs above"}
            </div>
          )}
        </div>
      )}
    </>
  );
}
