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
 * RAG Tester
 * ----------
 * One click → two complete collections for a whole course folder:
 *   • <course>_hybrid  — Docling → chunks → dense + sparse  (Step 4 / Step 5)
 *   • <course>_colpali — page images → ColPali multi-vector  (ColPali Retrieve)
 * using saved Docling (Step 1), chunk (Step 2) and ColPali process profiles.
 *
 * Layout:
 *   LEFT   — setup (folder, profiles, collections, options, metadata)
 *   CENTER — track overview + per-document status table
 *   RIGHT  — run controls + live console
 */

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { listProfiles as listDoclingProfiles } from "@/lib/api";
import { listSavedProfiles, loadSavedProfile } from "@/lib/profiles";
import {
  CourseFolder,
  DocStatus,
  FolderScan,
  RagEvent,
  RagSummary,
  Track,
  cancelRagTester,
  listCourseFolders,
  runRagTester,
  scanFolder,
} from "@/lib/ragTester";

/* ── Local types ────────────────────────────────────────────────── */

interface TrackState {
  status: DocStatus;
  progress: number;
  detail?: string;
  count?: number;
}

interface DocRow {
  rel_path: string;
  name: string;
  pages: number | null;
  text: TrackState;
  visual: TrackState;
}

interface ChunkProfileInfo {
  chunker: string;
  hybrid_chunker_options: { max_tokens: number; tokenizer_model: string };
  embedding: { mode: string; dense_model: string; sparse_model: string };
}

interface ColPaliProfileInfo {
  model_name: string;
  device: string;
  dpi: number;
  batch_size: number;
  max_pages: number | null;
}

/* ── Helpers ────────────────────────────────────────────────────── */

const STATUS_LABEL: Record<DocStatus, string> = {
  queued: "queued",
  parsing: "parsing",
  chunking: "chunking",
  embedding: "embedding",
  encoding: "encoding",
  done: "done",
  error: "error",
  cancelled: "cancelled",
  disabled: "—",
};

/** Map a track state to an overall progress value (0–100) for the track bars. */
function trackProgress(t: TrackState, track: "text" | "visual"): number {
  switch (t.status) {
    case "done":
    case "error":
    case "cancelled":
      return 100;
    case "parsing":
      return Math.round(t.progress * 0.7);
    case "chunking":
      return 75;
    case "embedding":
      return 90;
    case "encoding":
      return track === "visual" ? t.progress : 50;
    default:
      return 0;
  }
}

const emptyTrack = (enabled: boolean): TrackState => ({ status: enabled ? "queued" : "disabled", progress: 0 });

/* ── Page ───────────────────────────────────────────────────────── */

export default function RagTesterPage() {
  // ── Folder selection ───────────────────────────────────────────
  const [folders, setFolders] = useState<CourseFolder[]>([]);
  const [folderInput, setFolderInput] = useState("");
  const [recursive, setRecursive] = useState(true);
  const [scan, setScan] = useState<FolderScan | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // ── Profiles ───────────────────────────────────────────────────
  const [doclingProfiles, setDoclingProfiles] = useState<string[]>([]);
  const [chunkProfiles, setChunkProfiles] = useState<string[]>([]);
  const [colpaliProfiles, setColpaliProfiles] = useState<string[]>([]);
  const [doclingProfile, setDoclingProfile] = useState("");
  const [chunkProfile, setChunkProfile] = useState("");
  const [colpaliProfile, setColpaliProfile] = useState("");
  const [chunkInfo, setChunkInfo] = useState<ChunkProfileInfo | null>(null);
  const [colpaliInfo, setColpaliInfo] = useState<ColPaliProfileInfo | null>(null);

  // ── Options ────────────────────────────────────────────────────
  const [enableText, setEnableText] = useState(true);
  const [enableVisual, setEnableVisual] = useState(true);
  const [hybridName, setHybridName] = useState("");
  const [colpaliName, setColpaliName] = useState("");
  const [overwrite, setOverwrite] = useState(false);
  const [forceHybrid, setForceHybrid] = useState(true);
  const [workers, setWorkers] = useState(3);
  const [metaKeys, setMetaKeys] = useState<string[]>([""]);
  const [metaValues, setMetaValues] = useState<string[]>([""]);

  // ── Run state ──────────────────────────────────────────────────
  const [isRunning, setIsRunning] = useState(false);
  const [runId, setRunId] = useState<string | null>(null);
  const [rows, setRows] = useState<DocRow[]>([]);
  const [logs, setLogs] = useState<{ track: Track; msg: string }[]>([]);
  const [logFilter, setLogFilter] = useState<"all" | Track>("all");
  const [summary, setSummary] = useState<RagSummary | null>(null);
  const [runCollections, setRunCollections] = useState<{ hybrid: string | null; colpali: string | null }>({
    hybrid: null,
    colpali: null,
  });
  const abortRef = useRef<AbortController | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  /* ── Saved profiles: (re)load lists, keep the current selection ── */
  // Bumped on every refresh so the info chips re-load overwritten profiles too.
  const [profilesVersion, setProfilesVersion] = useState(0);
  const refreshProfiles = useCallback(async () => {
    // Keep the current choice if it still exists, otherwise fall back
    const keep = (list: string[], fallback?: string) => (cur: string) =>
      cur && list.includes(cur) ? cur : fallback && list.includes(fallback) ? fallback : list[0] ?? "";
    const [docling, chunk, colpali] = await Promise.allSettled([
      listDoclingProfiles(),
      listSavedProfiles("chunk"),
      listSavedProfiles("colpali"),
    ]);
    if (docling.status === "fulfilled") {
      setDoclingProfiles(docling.value);
      setDoclingProfile(keep(docling.value, "default"));
    }
    if (chunk.status === "fulfilled") {
      setChunkProfiles(chunk.value);
      setChunkProfile(keep(chunk.value));
    }
    if (colpali.status === "fulfilled") {
      setColpaliProfiles(colpali.value);
      setColpaliProfile(keep(colpali.value));
    }
    setProfilesVersion((v) => v + 1);
  }, []);

  /* ── Initial data & unmount cleanup ─────────────────────────── */
  useEffect(() => {
    listCourseFolders()
      .then((f) => {
        setFolders(f);
        // Pre-select the first real course sub-folder (not the root)
        const first = f.find((x) => x.rel_path) ?? f[0];
        if (first) setFolderInput(first.rel_path || first.path);
      })
      .catch((e) => setScanError(e.message));
    void Promise.resolve().then(() => refreshProfiles());

    // Profiles saved in another tab (Step 2 / ColPali) appear when returning here
    const onVisible = () => {
      if (document.visibilityState === "visible") void refreshProfiles();
    };
    const onFocus = () => void refreshProfiles();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
      abortRef.current?.abort();
    };
  }, [refreshProfiles]);

  /* ── Scan folder whenever input / recursion changes (debounced) ── */
  useEffect(() => {
    let active = true;
    const trimmed = folderInput.trim();
    const handle = window.setTimeout(async () => {
      if (!trimmed) {
        if (active) setScan(null);
        return;
      }
      setIsScanning(true);
      try {
        const s = await scanFolder(trimmed, recursive);
        if (!active) return;
        setScan(s);
        setScanError(null);
        setHybridName(s.suggested_hybrid_collection);
        setColpaliName(s.suggested_colpali_collection);
      } catch (e) {
        if (!active) return;
        setScan(null);
        setScanError((e as Error).message);
      } finally {
        if (active) setIsScanning(false);
      }
    }, trimmed ? 400 : 0);
    return () => {
      active = false;
      window.clearTimeout(handle);
    };
  }, [folderInput, recursive]);

  /* ── Load profile summaries for the info chips ──────────────── */
  useEffect(() => {
    let active = true;
    if (!chunkProfile) {
      void Promise.resolve().then(() => {
        if (active) setChunkInfo(null);
      });
    } else {
      loadSavedProfile<ChunkProfileInfo>("chunk", chunkProfile)
        .then((info) => {
          if (active) setChunkInfo(info);
        })
        .catch(() => {
          if (active) setChunkInfo(null);
        });
    }
    return () => {
      active = false;
    };
  }, [chunkProfile, profilesVersion]);

  useEffect(() => {
    let active = true;
    if (!colpaliProfile) {
      void Promise.resolve().then(() => {
        if (active) setColpaliInfo(null);
      });
    } else {
      loadSavedProfile<ColPaliProfileInfo>("colpali", colpaliProfile)
        .then((info) => {
          if (active) setColpaliInfo(info);
        })
        .catch(() => {
          if (active) setColpaliInfo(null);
        });
    }
    return () => {
      active = false;
    };
  }, [colpaliProfile, profilesVersion]);

  // Auto-scroll console
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  /* ── Derived values ─────────────────────────────────────────── */
  const tableRows: DocRow[] = useMemo(() => {
    if (rows.length) return rows;
    // Before a run: preview rows from the folder scan
    return (scan?.pdfs ?? []).map((p) => ({
      rel_path: p.rel_path,
      name: p.name,
      pages: p.pages,
      text: emptyTrack(enableText),
      visual: emptyTrack(enableVisual),
    }));
  }, [rows, scan, enableText, enableVisual]);

  const overall = useMemo(() => {
    const n = tableRows.length || 1;
    const sum = (track: "text" | "visual") =>
      Math.round(tableRows.reduce((acc, r) => acc + trackProgress(r[track], track), 0) / n);
    const done = (track: "text" | "visual") => tableRows.filter((r) => r[track].status === "done").length;
    const count = (track: "text" | "visual") =>
      tableRows.reduce((acc, r) => acc + (r[track].status === "done" ? r[track].count ?? 0 : 0), 0);
    return {
      text: { pct: sum("text"), done: done("text"), count: count("text") },
      visual: { pct: sum("visual"), done: done("visual"), count: count("visual") },
    };
  }, [tableRows]);

  const missing: string[] = [];
  if (!scan || scan.pdfs.length === 0) missing.push("a folder with PDFs");
  if (enableText && !doclingProfile) missing.push("a Docling profile");
  if (enableText && !chunkProfile) missing.push("a chunk profile (save one in Step 2)");
  if (enableVisual && !colpaliProfile) missing.push("a ColPali profile (save one on ColPali: Process)");
  if (!enableText && !enableVisual) missing.push("at least one track");
  const canRun = !isRunning && missing.length === 0;

  /* ── Event handling ─────────────────────────────────────────── */
  const handleEvent = useCallback((evt: RagEvent) => {
    switch (evt.type) {
      case "start":
        setRunId(evt.run_id);
        setRunCollections({ hybrid: evt.hybrid_collection, colpali: evt.colpali_collection });
        setRows(
          evt.docs.map((d) => ({
            ...d,
            text: emptyTrack(!!evt.hybrid_collection),
            visual: emptyTrack(!!evt.colpali_collection),
          }))
        );
        break;
      case "log":
        setLogs((prev) => [...prev, { track: evt.track, msg: evt.msg }]);
        break;
      case "doc":
        setRows((prev) =>
          prev.map((r) =>
            r.rel_path === evt.doc
              ? {
                  ...r,
                  [evt.track]: {
                    status: evt.status,
                    progress: evt.progress ?? r[evt.track].progress,
                    detail: evt.detail ?? r[evt.track].detail,
                    count: evt.count ?? r[evt.track].count,
                  },
                }
              : r
          )
        );
        break;
      case "result":
        setSummary(evt.result);
        break;
    }
  }, []);

  const buildMetadata = (): Record<string, string> => {
    const meta: Record<string, string> = {};
    metaKeys.forEach((k, i) => {
      if (k.trim() && metaValues[i]?.trim()) meta[k.trim()] = metaValues[i].trim();
    });
    return meta;
  };

  const handleRun = async () => {
    if (!canRun || !scan) return;
    setIsRunning(true);
    setLogs([]);
    setRows([]);
    setSummary(null);
    setRunId(null);
    const abort = new AbortController();
    abortRef.current = abort;
    try {
      await runRagTester(
        {
          folder_path: scan.folder,
          recursive,
          docling_profile: doclingProfile,
          chunk_profile: chunkProfile,
          colpali_profile: colpaliProfile,
          enable_text_track: enableText,
          enable_visual_track: enableVisual,
          hybrid_collection: hybridName,
          colpali_collection: colpaliName,
          overwrite,
          force_hybrid_embedding: forceHybrid,
          docling_workers: workers,
          custom_metadata: buildMetadata(),
        },
        handleEvent,
        abort.signal
      );
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setSummary({ status: "error", error: (e as Error).message });
      }
    } finally {
      setIsRunning(false);
      abortRef.current = null;
    }
  };

  const handleCancel = async () => {
    if (runId) await cancelRagTester(runId);
    setLogs((prev) => [...prev, { track: "system", msg: "⚠️ Cancellation requested…" }]);
  };

  const visibleLogs = logFilter === "all" ? logs : logs.filter((l) => l.track === logFilter);

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <div className="app-shell">
      {/* ═══ LEFT: Setup ═══════════════════════════════════════════ */}
      <aside className="panel panel--config">
        <div className="panel__header">
          <span className="panel__title">🧪 RAG Tester Setup</span>
        </div>
        <div className="panel__body rag-setup">
          {/* Folder */}
          <section className="rag-section">
            <div className="rag-section__title">1 · Course folder</div>
            <select
              id="rag-folder-select"
              className="select"
              value={folders.some((f) => (f.rel_path || f.path) === folderInput) ? folderInput : ""}
              disabled={isRunning}
              onChange={(e) => e.target.value && setFolderInput(e.target.value)}
            >
              <option value="">— custom path below —</option>
              {folders.map((f) => (
                <option key={f.path} value={f.rel_path || f.path}>
                  {f.name} ({f.pdf_count} PDFs)
                </option>
              ))}
            </select>
            <input
              id="rag-folder-input"
              className="input"
              placeholder="/absolute/path, ~/path or path in test_data/"
              value={folderInput}
              disabled={isRunning}
              onChange={(e) => setFolderInput(e.target.value)}
            />
            <label className="rag-check">
              <input type="checkbox" checked={recursive} disabled={isRunning} onChange={(e) => setRecursive(e.target.checked)} />
              Include sub-folders
            </label>
            {isScanning && <div className="rag-hint">Scanning…</div>}
            {scanError && <div className="rag-hint rag-hint--error">❌ {scanError}</div>}
            {scan && !isScanning && (
              <div className="rag-hint">
                📚 <strong>{scan.pdfs.length}</strong> PDFs · <strong>{scan.total_pages}</strong> pages
              </div>
            )}
          </section>

          {/* Profiles */}
          <section className="rag-section">
            <div className="rag-section__title" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>2 · Saved profiles</span>
              <button
                id="rag-refresh-profiles-btn"
                className="btn-icon"
                disabled={isRunning}
                onClick={refreshProfiles}
                title="Reload profile lists (after saving in Step 1 / Step 2 / ColPali)"
              >
                ↻
              </button>
            </div>

            <label className="rag-toggle-head">
              <input type="checkbox" checked={enableText} disabled={isRunning} onChange={(e) => setEnableText(e.target.checked)} />
              <span>📝 Text track → hybrid collection</span>
            </label>
            <div className={`rag-subgroup ${enableText ? "" : "rag-subgroup--off"}`}>
              <label className="field">
                <span className="field__label">Docling profile (Step 1)</span>
                <select id="rag-docling-profile" className="select" value={doclingProfile} disabled={isRunning || !enableText}
                  onChange={(e) => setDoclingProfile(e.target.value)}>
                  {doclingProfiles.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </label>
              <label className="field">
                <span className="field__label">Chunk profile (Step 2)</span>
                <select id="rag-chunk-profile" className="select" value={chunkProfile} disabled={isRunning || !enableText}
                  onChange={(e) => setChunkProfile(e.target.value)}>
                  {chunkProfiles.length === 0 && <option value="">— none saved yet —</option>}
                  {chunkProfiles.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </label>
              {chunkInfo && (
                <div className="rag-chips">
                  <span className="rag-chip">{chunkInfo.chunker}</span>
                  {chunkInfo.chunker === "hybrid" && <span className="rag-chip">{chunkInfo.hybrid_chunker_options.max_tokens} tok</span>}
                  <span className="rag-chip">{chunkInfo.embedding.dense_model.split("/").pop()}</span>
                  <span className={`rag-chip ${chunkInfo.embedding.mode !== "hybrid" && !forceHybrid ? "rag-chip--warn" : ""}`}>
                    {forceHybrid ? "hybrid (forced)" : chunkInfo.embedding.mode}
                  </span>
                </div>
              )}
              <label className="rag-check">
                <input type="checkbox" checked={forceHybrid} disabled={isRunning} onChange={(e) => setForceHybrid(e.target.checked)} />
                Force hybrid embedding (dense + sparse)
              </label>
            </div>

            <label className="rag-toggle-head">
              <input type="checkbox" checked={enableVisual} disabled={isRunning} onChange={(e) => setEnableVisual(e.target.checked)} />
              <span>🖼️ Visual track → ColPali collection</span>
            </label>
            <div className={`rag-subgroup ${enableVisual ? "" : "rag-subgroup--off"}`}>
              <label className="field">
                <span className="field__label">ColPali process profile</span>
                <select id="rag-colpali-profile" className="select" value={colpaliProfile} disabled={isRunning || !enableVisual}
                  onChange={(e) => setColpaliProfile(e.target.value)}>
                  {colpaliProfiles.length === 0 && <option value="">— none saved yet —</option>}
                  {colpaliProfiles.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </label>
              {colpaliInfo && (
                <div className="rag-chips">
                  <span className="rag-chip">{colpaliInfo.model_name.split("/").pop()}</span>
                  <span className="rag-chip">{colpaliInfo.device}</span>
                  <span className="rag-chip">{colpaliInfo.dpi} DPI</span>
                  <span className="rag-chip">batch {colpaliInfo.batch_size}</span>
                  {colpaliInfo.max_pages && <span className="rag-chip rag-chip--warn">max {colpaliInfo.max_pages} p.</span>}
                </div>
              )}
            </div>
          </section>

          {/* Collections */}
          <section className="rag-section">
            <div className="rag-section__title">3 · Output collections</div>
            <label className="field">
              <span className="field__label">Hybrid (dense + sparse)</span>
              <input id="rag-hybrid-name" className="input rag-mono" value={hybridName} disabled={isRunning || !enableText}
                onChange={(e) => setHybridName(e.target.value)} />
            </label>
            <label className="field">
              <span className="field__label">ColPali (MaxSim)</span>
              <input id="rag-colpali-name" className="input rag-mono" value={colpaliName} disabled={isRunning || !enableVisual}
                onChange={(e) => setColpaliName(e.target.value)} />
            </label>
            <label className="rag-check">
              <input type="checkbox" checked={overwrite} disabled={isRunning} onChange={(e) => setOverwrite(e.target.checked)} />
              Overwrite if the collections already exist
            </label>
          </section>

          {/* Performance */}
          <section className="rag-section">
            <div className="rag-section__title">4 · Parallelism</div>
            <label className="field">
              <span className="field__label">Parallel Docling workers: <strong>{workers}</strong></span>
              <input type="range" className="slider" min={1} max={6} value={workers} disabled={isRunning}
                onChange={(e) => setWorkers(Number(e.target.value))} />
            </label>
            <div className="rag-hint">Each worker ≈ 2–3 GB RAM. ColPali runs alongside with the model loaded once.</div>
          </section>

          {/* Metadata */}
          <section className="rag-section">
            <div className="rag-section__title">5 · Extra metadata (both collections)</div>
            <div className="rag-hint">
              Always added: <code>doc_name</code>, <code>file_path</code>, <code>rel_path</code>, <code>course</code>, page number(s).
            </div>
            {metaKeys.map((k, i) => (
              <div key={i} className="rag-meta-row">
                <input className="input" placeholder="key (e.g. semester)" value={k} disabled={isRunning}
                  onChange={(e) => setMetaKeys((prev) => prev.map((x, j) => (j === i ? e.target.value : x)))} />
                <input className="input" placeholder="value (e.g. FS13)" value={metaValues[i] ?? ""} disabled={isRunning}
                  onChange={(e) => setMetaValues((prev) => prev.map((x, j) => (j === i ? e.target.value : x)))} />
                {metaKeys.length > 1 && (
                  <button className="btn-icon" disabled={isRunning} onClick={() => {
                    setMetaKeys((prev) => prev.filter((_, j) => j !== i));
                    setMetaValues((prev) => prev.filter((_, j) => j !== i));
                  }}>✕</button>
                )}
              </div>
            ))}
            <button className="rag-add-btn" disabled={isRunning}
              onClick={() => { setMetaKeys((p) => [...p, ""]); setMetaValues((p) => [...p, ""]); }}>
              + Add field
            </button>
          </section>
        </div>
      </aside>

      {/* ═══ CENTER: Overview + document table ═════════════════════ */}
      <main className="panel panel--main" style={{ display: "flex", flexDirection: "column" }}>
        <div className="panel__header">
          <span className="panel__title">📚 {scan?.course ?? "Select a course folder"}</span>
          {runId && <span className="rag-runid">run {runId}</span>}
        </div>
        <div className="panel__body rag-main">
          {/* Track cards */}
          <div className="rag-tracks">
            <div className={`rag-track-card rag-track-card--text ${enableText ? "" : "rag-track-card--off"}`}>
              <div className="rag-track-card__head">
                <span>📝 Hybrid text collection</span>
                <span className="rag-track-card__pct">{overall.text.pct}%</span>
              </div>
              <div className="rag-track-card__name">{runCollections.hybrid ?? (enableText ? hybridName || "—" : "disabled")}</div>
              <div className="rag-bar"><div className="rag-bar__fill rag-bar__fill--text" style={{ width: `${overall.text.pct}%` }} /></div>
              <div className="rag-track-card__stats">
                {overall.text.done}/{tableRows.length} docs · {overall.text.count} chunks
              </div>
            </div>
            <div className={`rag-track-card rag-track-card--visual ${enableVisual ? "" : "rag-track-card--off"}`}>
              <div className="rag-track-card__head">
                <span>🖼️ ColPali page collection</span>
                <span className="rag-track-card__pct">{overall.visual.pct}%</span>
              </div>
              <div className="rag-track-card__name">{runCollections.colpali ?? (enableVisual ? colpaliName || "—" : "disabled")}</div>
              <div className="rag-bar"><div className="rag-bar__fill rag-bar__fill--visual" style={{ width: `${overall.visual.pct}%` }} /></div>
              <div className="rag-track-card__stats">
                {overall.visual.done}/{tableRows.length} docs · {overall.visual.count} pages
              </div>
            </div>
          </div>

          {/* Summary */}
          {summary && (
            <div className={`rag-summary rag-summary--${summary.status}`}>
              {summary.status === "error" ? (
                <div>❌ {summary.error}</div>
              ) : (
                <>
                  <div className="rag-summary__title">
                    {summary.status === "success" && "✅ Both collections are ready"}
                    {summary.status === "partial" && "⚠️ Finished with errors"}
                    {summary.status === "cancelled" && "⏹ Run cancelled"}
                    <span className="rag-summary__time">{summary.elapsed_seconds}s</span>
                  </div>
                  <div className="stat-grid" style={{ marginTop: 10 }}>
                    <div className="stat-box"><div className="stat-box__label">Documents</div><div className="stat-box__value">{summary.documents}</div></div>
                    <div className="stat-box"><div className="stat-box__label">Chunks</div><div className="stat-box__value">{summary.total_chunks}</div></div>
                    <div className="stat-box"><div className="stat-box__label">Pages</div><div className="stat-box__value">{summary.total_pages}</div></div>
                  </div>
                  {summary.failures && summary.failures.length > 0 && (
                    <ul className="rag-failures">
                      {summary.failures.map((f, i) => (
                        <li key={i}><strong>{f.track}</strong> · {f.doc}: {f.error}</li>
                      ))}
                    </ul>
                  )}
                  <div className="rag-links">
                    {summary.hybrid_collection && <Link href="/enrich" className="rag-link">🧠 Enrich in Step 4</Link>}
                    {summary.hybrid_collection && <Link href="/retrieve" className="rag-link">🔎 Hybrid retrieval</Link>}
                    {summary.colpali_collection && <Link href="/colpali/retrieve" className="rag-link">🔎 ColPali retrieval</Link>}
                    <Link href="/inspector" className="rag-link">🔍 Inspect payloads</Link>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Document table */}
          {tableRows.length === 0 ? (
            <div className="output-placeholder">
              <div className="output-placeholder__icon">📂</div>
              <div className="output-placeholder__title">No PDFs yet</div>
              <div className="output-placeholder__sub">Choose a course folder on the left.</div>
            </div>
          ) : (
            <table className="rag-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Document</th>
                  <th>Pages</th>
                  <th>📝 Text track</th>
                  <th>🖼️ Visual track</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((r, i) => (
                  <tr key={r.rel_path}>
                    <td className="rag-table__idx">{i + 1}</td>
                    <td className="rag-table__doc" title={r.rel_path}>{r.rel_path}</td>
                    <td className="rag-table__pages">{r.pages ?? "?"}</td>
                    {(["text", "visual"] as const).map((track) => {
                      const t = r[track];
                      const active = ["parsing", "chunking", "embedding", "encoding"].includes(t.status);
                      return (
                        <td key={track}>
                          <div className="rag-cell">
                            <span className={`rag-pill rag-pill--${t.status}`} title={t.detail}>
                              {active && <span className="rag-pill__dot" />}
                              {STATUS_LABEL[t.status]}
                            </span>
                            {t.detail && t.status !== "error" && <span className="rag-cell__detail">{t.detail}</span>}
                          </div>
                          {active && (
                            <div className="rag-bar rag-bar--mini">
                              <div className={`rag-bar__fill rag-bar__fill--${track}`} style={{ width: `${trackProgress(t, track)}%` }} />
                            </div>
                          )}
                          {t.status === "error" && <div className="rag-cell__error">{t.detail}</div>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* ═══ RIGHT: Run controls + console ═════════════════════════ */}
      <aside className="panel panel--console" style={{ display: "flex", flexDirection: "column" }}>
        <div className="panel__header">
          <span className="panel__title">⚡ Run</span>
        </div>
        <div className="rag-run-controls">
          <div style={{ display: "flex", gap: 8 }}>
            <button
              id="rag-run-btn"
              className={`run-btn ${isRunning ? "run-btn--running" : ""}`}
              disabled={!canRun}
              onClick={handleRun}
              style={{ flex: 1 }}
            >
              {isRunning ? (<><div className="run-btn__spinner" /> Building collections…</>) : <>🧪 Build both collections</>}
            </button>
            {isRunning && (
              <button id="rag-cancel-btn" className="run-btn" style={{ background: "var(--c-error)", color: "white", flex: "0 0 auto" }} onClick={handleCancel}>
                ■
              </button>
            )}
          </div>
          {!isRunning && missing.length > 0 && <div className="rag-hint">Missing: {missing.join(", ")}.</div>}
          {isRunning && <div className="rag-hint">Keep this tab open — closing it cancels the run.</div>}
          <div className="rag-log-tabs">
            {(["all", "text", "visual", "system"] as const).map((f) => (
              <button key={f} className={`rag-log-tab ${logFilter === f ? "rag-log-tab--active" : ""}`} onClick={() => setLogFilter(f)}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="rag-console">
          {visibleLogs.length === 0 && <div className="console__empty-text" style={{ textAlign: "center", paddingTop: 32 }}>Logs appear here during the run.</div>}
          {visibleLogs.map((l, i) => (
            <div
              key={i}
              className={`console__line rag-log rag-log--${l.track} ${
                l.msg.includes("❌") ? "console__line--error" : l.msg.includes("✅") ? "console__line--success" : l.msg.includes("⚠") ? "console__line--warn" : ""
              }`}
            >
              {l.msg}
            </div>
          ))}
          <div ref={logEndRef} />
        </div>
      </aside>
    </div>
  );
}
