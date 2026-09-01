"use client";

/**
 * OutputViewer — displays the parsed document content in tabbed view.
 * Fetches file content from the backend when a run file is selected.
 */

import { useEffect, useState } from "react";
import { getRunFileUrl } from "@/lib/api";

interface Props {
  runDir: string | null;
  outputFiles: string[];
}

export default function OutputViewer({ runDir, outputFiles }: Props) {
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract run_id from the dir path (e.g., "outputs/run_20240901_143000_default")
  const runId = runDir?.split("/").pop()?.replace("run_", "") ?? null;

  // Auto-select first non-config file when files change
  useEffect(() => {
    const firstOutput = outputFiles.find((f) => !f.endsWith(".yaml") && !f.endsWith(".log"));
    if (firstOutput) setActiveFile(firstOutput);
  }, [outputFiles]);

  // Fetch file content when active file changes
  useEffect(() => {
    if (!runId || !activeFile) {
      setContent(null);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(getRunFileUrl(runId, activeFile))
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then((text) => setContent(text))
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [runId, activeFile]);

  if (!runDir || outputFiles.length === 0) {
    return (
      <div className="output-viewer">
        <div className="output-placeholder">
          <div className="output-placeholder__icon">📄</div>
          <div className="output-placeholder__title">No output yet</div>
          <div className="output-placeholder__sub">
            Configure the pipeline on the left and click <strong>Run Pipeline</strong> to see parsed document output here.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="output-viewer">
      {/* File tabs */}
      <div className="output-tabs">
        {outputFiles.map((f) => (
          <button
            key={f}
            className={`output-tab ${activeFile === f ? "active" : ""}`}
            onClick={() => setActiveFile(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="output-content">
        {loading && (
          <div style={{ color: "var(--c-text-3)", fontStyle: "italic" }}>Loading…</div>
        )}
        {error && (
          <div style={{ color: "var(--c-error)" }}>Error loading file: {error}</div>
        )}
        {!loading && !error && content !== null && (
          <pre>{content}</pre>
        )}
      </div>
    </div>
  );
}
