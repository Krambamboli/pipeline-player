"use client";

/**
 * RunConsole — Real-time log output panel.
 * Displays streaming SSE log lines from the pipeline runner,
 * colour-coded by line content.
 */

import { useEffect, useRef } from "react";

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
