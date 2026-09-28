"use client";

/**
 * ColPali Visual Retrieval Pipeline
 * ------------------------------------
 * WHY: ColPali/ColQwen2 processes entire PDF pages as images, generating
 * multi-vector (patch-level) embeddings that capture layout, charts, tables,
 * and typography — things that text-only pipelines miss.
 *
 * HOW: Three-panel layout:
 *   Left   — Configuration (PDF, model, DPI, metadata)
 *   Center — Live pipeline console (SSE log + progress bar)
 *   Right  — Results summary after pipeline completion
 */

import { useCallback, useRef, useState, useEffect } from "react";
import { PdfFile, ColPaliConfig, listPdfs, runColPali } from "@/lib/colpali";
import { downloadColPaliSettings } from "@/lib/downloadSettings";

export default function ColPaliPage() {
  // ── PDF file list ─────────────────────────────────────────────────
  const [pdfs, setPdfs] = useState<PdfFile[]>([]);
  const [selectedPdf, setSelectedPdf] = useState("");

  // ── Configuration ─────────────────────────────────────────────────
  const [modelName, setModelName] = useState("vidore/colqwen2-v1.0");
  const [device, setDevice] = useState("mps");
  const [batchSize, setBatchSize] = useState(2);
  const [dpi, setDpi] = useState(144);
  const [maxPages, setMaxPages] = useState<string>("");
  const [collectionName, setCollectionName] = useState("");

  // Metadata key-value pairs
  const [metaKeys, setMetaKeys] = useState<string[]>([""]);
  const [metaValues, setMetaValues] = useState<string[]>([""]);

  // ── Pipeline state ────────────────────────────────────────────────
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  // ── Load PDFs on mount ────────────────────────────────────────────
  useEffect(() => {
    listPdfs()
      .then(setPdfs)
      .catch((e) => console.warn("Could not load PDFs:", e));
  }, []);

  // Auto-scroll log console
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // ── Build metadata dict from key-value pairs ──────────────────────
  const buildMetadata = useCallback((): Record<string, string> => {
    const meta: Record<string, string> = {};
    metaKeys.forEach((k, i) => {
      if (k.trim() && metaValues[i]?.trim()) {
        meta[k.trim()] = metaValues[i].trim();
      }
    });
    return meta;
  }, [metaKeys, metaValues]);

  // ── Add metadata row ──────────────────────────────────────────────
  const addMetaRow = () => {
    setMetaKeys((prev) => [...prev, ""]);
    setMetaValues((prev) => [...prev, ""]);
  };

  const removeMetaRow = (idx: number) => {
    setMetaKeys((prev) => prev.filter((_, i) => i !== idx));
    setMetaValues((prev) => prev.filter((_, i) => i !== idx));
  };

  // ── Run pipeline ──────────────────────────────────────────────────
  const handleRun = useCallback(() => {
    if (!selectedPdf) return;

    setIsRunning(true);
    setLogs([]);
    setProgress(0);
    setIsDone(false);
    setError(null);

    const config: ColPaliConfig = {
      pdf_path: selectedPdf,
      model_name: modelName,
      device,
      batch_size: batchSize,
      dpi,
      max_pages: maxPages ? Number(maxPages) : null,
      metadata: buildMetadata(),
      collection_name: collectionName,
      qdrant_storage_path: "",
    };

    runColPali(
      config,
      (line) => setLogs((prev) => [...prev, line]),
      (pct) => setProgress(pct),
      () => {
        setIsRunning(false);
        setIsDone(true);
      },
      (err) => {
        setError(err);
        setIsRunning(false);
      }
    );
  }, [selectedPdf, modelName, device, batchSize, dpi, maxPages, collectionName, buildMetadata]);

  return (
    <div style={{ display: "flex", height: "100%", gap: 0 }}>
      {/* ── LEFT: Configuration ───────────────────────────────────── */}
      <aside
        className="panel"
        style={{ width: 280, flexShrink: 0, borderRight: "1px solid var(--c-border)", display: "flex", flexDirection: "column" }}
      >
        <div className="panel__header">
          <span className="panel__title">⚙️ Configuration</span>
        </div>
        <div className="panel__body" style={{ padding: "12px 16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* PDF selector */}
          <section>
            <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--c-text-3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
              Document
            </div>
            <select
              className="select"
              value={selectedPdf}
              onChange={(e) => setSelectedPdf(e.target.value)}
              style={{ width: "100%", marginBottom: 4 }}
            >
              <option value="">Select a PDF…</option>
              {pdfs.map((p) => (
                <option key={p.name} value={p.path}>
                  {p.name} ({p.size_mb} MB)
                </option>
              ))}
            </select>
          </section>

          {/* Model settings */}
          <section>
            <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--c-text-3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
              Model
            </div>
            <label className="field" style={{ marginBottom: 8 }}>
              <span className="field__label">VLM Model</span>
              <select
                className="select"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
              >
                <option value="vidore/colqwen2-v1.0">ColQwen2 v1.0</option>
                <option value="vidore/colpali-v1.3-merged">ColPali v1.3</option>
              </select>
            </label>
            <label className="field" style={{ marginBottom: 8 }}>
              <span className="field__label">Device</span>
              <select
                className="select"
                value={device}
                onChange={(e) => setDevice(e.target.value)}
              >
                <option value="mps">MPS (Apple Silicon)</option>
                <option value="cuda">CUDA (NVIDIA)</option>
                <option value="cpu">CPU</option>
              </select>
            </label>
            <label className="field" style={{ marginBottom: 8 }}>
              <span className="field__label">Batch Size</span>
              <input
                type="number"
                className="input"
                value={batchSize}
                min={1}
                max={16}
                onChange={(e) => setBatchSize(Number(e.target.value))}
              />
            </label>
          </section>

          {/* Image settings */}
          <section>
            <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--c-text-3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
              Image
            </div>
            <label className="field" style={{ marginBottom: 8 }}>
              <span className="field__label">DPI ({dpi})</span>
              <input
                type="range"
                min={72}
                max={300}
                step={12}
                value={dpi}
                onChange={(e) => setDpi(Number(e.target.value))}
                style={{ width: "100%" }}
              />
            </label>
            <label className="field">
              <span className="field__label">Max Pages (optional)</span>
              <input
                type="number"
                className="input"
                placeholder="All pages"
                value={maxPages}
                min={1}
                onChange={(e) => setMaxPages(e.target.value)}
              />
            </label>
          </section>

          {/* Metadata enrichment */}
          <section>
            <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--c-text-3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
              Metadata
            </div>
            {metaKeys.map((key, i) => (
              <div key={i} style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                <input
                  className="input"
                  placeholder="Key"
                  value={key}
                  onChange={(e) => {
                    const copy = [...metaKeys];
                    copy[i] = e.target.value;
                    setMetaKeys(copy);
                  }}
                  style={{ flex: 1, fontSize: "0.75rem" }}
                />
                <input
                  className="input"
                  placeholder="Value"
                  value={metaValues[i] || ""}
                  onChange={(e) => {
                    const copy = [...metaValues];
                    copy[i] = e.target.value;
                    setMetaValues(copy);
                  }}
                  style={{ flex: 1, fontSize: "0.75rem" }}
                />
                {metaKeys.length > 1 && (
                  <button
                    onClick={() => removeMetaRow(i)}
                    style={{ background: "none", border: "none", color: "var(--c-text-3)", cursor: "pointer", fontSize: "0.8rem", padding: "0 4px" }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addMetaRow}
              style={{ background: "none", border: "1px dashed var(--c-border)", borderRadius: 4, color: "var(--c-text-3)", cursor: "pointer", fontSize: "0.7rem", padding: "4px 8px", width: "100%" }}
            >
              + Add Field
            </button>
          </section>

          {/* Output collection name */}
          <section>
            <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--c-text-3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
              Output
            </div>
            <label className="field">
              <span className="field__label">Collection Name (auto if empty)</span>
              <input
                className="input"
                placeholder="auto-generated"
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
              />
            </label>
          </section>

          {/* Run button */}
          <button
            className="run-btn"
            onClick={handleRun}
            disabled={isRunning || !selectedPdf}
            style={{ width: "100%", marginTop: 8 }}
          >
            {isRunning ? "⏳ Running…" : "▶ Run ColPali Pipeline"}
          </button>

          {/* Download settings button — available any time */}
          <button
            onClick={() =>
              downloadColPaliSettings({
                selectedPdf,
                modelName,
                device,
                batchSize,
                dpi,
                maxPages,
                collectionName,
                metadata: buildMetadata(),
              })
            }
            style={{
              width: "100%",
              marginTop: 4,
              background: "none",
              border: "1px solid var(--c-border)",
              borderRadius: 6,
              color: "var(--c-text-3)",
              cursor: "pointer",
              fontSize: "0.72rem",
              padding: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
            title="Download current ColPali settings as annotated Markdown"
          >
            ⬇ Download Settings
          </button>
        </div>
      </aside>

      {/* ── CENTER: Pipeline Console ──────────────────────────────── */}
      <main
        className="panel"
        style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}
      >
        <div className="panel__header">
          <span className="panel__title">🖼️ ColPali: Process Documents</span>
        </div>

        {/* Progress bar */}
        {(isRunning || isDone) && (
          <div style={{ padding: "0 16px 8px" }}>
            <div
              style={{
                height: 6,
                background: "var(--c-bg-3)",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  background: isDone ? "var(--c-success, #4ade80)" : "var(--c-accent)",
                  transition: "width 0.4s ease",
                  borderRadius: 3,
                }}
              />
            </div>
            <div style={{ fontSize: "0.65rem", color: "var(--c-text-3)", marginTop: 4, textAlign: "right" }}>
              {progress}%
            </div>
          </div>
        )}

        {/* Log console */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "12px 16px",
            fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
            fontSize: "0.75rem",
            lineHeight: 1.7,
            color: "var(--c-text-2)",
            background: "var(--c-bg)",
          }}
        >
          {logs.length === 0 && !isRunning && !isDone && (
            <div style={{ color: "var(--c-text-3)", textAlign: "center", paddingTop: 60 }}>
              Configure and run the ColPali pipeline to process PDF pages as visual embeddings.
              <br /><br />
              <span style={{ fontSize: "0.65rem" }}>
                Requires: PyMuPDF, sentence-transformers[image]
              </span>
            </div>
          )}
          {logs.map((line, i) => (
            <div key={i} style={{ color: line.includes("❌") ? "var(--c-error, #f87171)" : line.includes("✅") ? "var(--c-success, #4ade80)" : "var(--c-text-2)" }}>
              {line}
            </div>
          ))}
          {error && (
            <div style={{ color: "var(--c-error, #f87171)", fontWeight: 600, marginTop: 8 }}>
              ❌ {error}
            </div>
          )}
          <div ref={logEndRef} />
        </div>

        {/* Done summary */}
        {isDone && (
          <div style={{ padding: "12px 16px", borderTop: "1px solid var(--c-border)", background: "var(--c-bg-2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "var(--c-success, #4ade80)", fontWeight: 600, fontSize: "0.85rem" }}>
                ✅ Pipeline Complete
              </span>
              <a href="/inspector" style={{ fontSize: "0.75rem", color: "var(--c-accent)", marginLeft: "auto" }}>
                → View in Inspector
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
