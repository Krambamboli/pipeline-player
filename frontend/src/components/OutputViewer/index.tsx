"use client";

/**
 * OutputViewer — tabbed viewer for parsed document output files.
 *
 * - .html files  → rendered in a sandboxed <iframe> using srcDoc
 * - all others   → syntax-highlighted <pre> block
 *
 * HTML tab is automatically selected first if present (it's the richest view).
 */

import { useEffect, useRef, useState } from "react";
import { getRunFileUrl } from "@/lib/api";

interface Props {
  runDir: string | null;
  outputFiles: string[];
}

/** Returns a display label + icon for a given filename. */
function fileLabel(filename: string): { icon: string; label: string } {
  if (filename.endsWith(".html"))   return { icon: "🖼", label: "HTML" };
  if (filename.endsWith(".md"))     return { icon: "📝", label: "Markdown" };
  if (filename.endsWith(".json"))   return { icon: "{ }", label: "JSON" };
  if (filename.endsWith(".txt"))    return { icon: "📄", label: "Text" };
  if (filename.endsWith(".yaml") || filename.endsWith(".yml"))
                                    return { icon: "⚙", label: "Config" };
  if (filename.endsWith(".log"))    return { icon: "📋", label: "Log" };
  if (filename.endsWith(".doctags")) return { icon: "🏷", label: "DocTags" };
  return { icon: "📁", label: filename };
}

/** Priority order for auto-selection: richest format first. */
const TAB_PRIORITY = [".html", ".md", ".json", ".txt", ".doctags", ".log", ".yaml"];

function pickDefaultFile(files: string[]): string | null {
  for (const ext of TAB_PRIORITY) {
    const match = files.find((f) => f.endsWith(ext));
    if (match) return match;
  }
  return files[0] ?? null;
}

export default function OutputViewer({ runDir, outputFiles }: Props) {
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Track iframe height for the expand/collapse toggle
  const [iframeExpanded, setIframeExpanded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Derive run_id from the dir path: "outputs/run_<id>" → "<id>"
  const runId = runDir?.split("/").pop()?.replace("run_", "") ?? null;

  const isHtml = activeFile?.endsWith(".html") ?? false;

  // Auto-select richest format (HTML first) when file list changes
  useEffect(() => {
    const best = pickDefaultFile(
      outputFiles.filter((f) => !f.endsWith(".log") && !f.endsWith(".yaml"))
    ) ?? pickDefaultFile(outputFiles);
    if (best) setActiveFile(best);
  }, [outputFiles]);

  // Fetch file content when the active tab changes
  useEffect(() => {
    if (!runId || !activeFile) {
      setContent(null);
      return;
    }

    setLoading(true);
    setError(null);
    setContent(null);

    fetch(getRunFileUrl(runId, activeFile))
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then((text) => setContent(text))
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [runId, activeFile]);

  // ── Empty state ─────────────────────────────────────────────────────────────
  if (!runDir || outputFiles.length === 0) {
    return (
      <div className="output-viewer">
        <div className="output-placeholder">
          <div className="output-placeholder__icon">📄</div>
          <div className="output-placeholder__title">No output yet</div>
          <div className="output-placeholder__sub">
            Configure the pipeline on the left and click{" "}
            <strong>Run Pipeline</strong> to see parsed document output here.
          </div>
        </div>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="output-viewer">

      {/* ── Tab bar ─────────────────────────────────────────────────────── */}
      <div className="output-tabs">
        {outputFiles.map((f) => {
          const { icon, label } = fileLabel(f);
          return (
            <button
              key={f}
              className={`output-tab ${activeFile === f ? "active" : ""}`}
              onClick={() => setActiveFile(f)}
              title={f}
            >
              <span className="output-tab__icon">{icon}</span>
              <span className="output-tab__label">{label}</span>
            </button>
          );
        })}

        {/* Expand/collapse button for HTML view */}
        {isHtml && (
          <button
            className="output-tab output-tab--action"
            onClick={() => setIframeExpanded((v) => !v)}
            title={iframeExpanded ? "Collapse HTML view" : "Expand HTML view"}
          >
            {iframeExpanded ? "⊟ Collapse" : "⊞ Expand"}
          </button>
        )}
      </div>

      {/* ── Content area ────────────────────────────────────────────────── */}
      <div className={`output-content ${isHtml ? "output-content--html" : ""} ${iframeExpanded ? "output-content--expanded" : ""}`}>

        {loading && (
          <div className="output-loading">
            <span className="output-loading__spinner" />
            Loading…
          </div>
        )}

        {error && (
          <div className="output-error">⚠ Error loading file: {error}</div>
        )}

        {!loading && !error && content !== null && (
          isHtml ? (
            /* ── HTML renderer: sandboxed iframe with srcDoc ────────────── */
            <div className="output-iframe-wrap">
              <div className="output-iframe-badge">
                🖼 Rendered HTML — page images with bounding-box annotations
              </div>
              <iframe
                ref={iframeRef}
                className="output-iframe"
                srcDoc={content}
                // allow-scripts: needed for docling's inline annotation JS
                // No allow-same-origin: iframe cannot access parent context
                sandbox="allow-scripts"
                title="Parsed document HTML output"
              />
            </div>
          ) : (
            /* ── Plain text renderer ────────────────────────────────────── */
            <pre className="output-pre">{content}</pre>
          )
        )}
      </div>
    </div>
  );
}
