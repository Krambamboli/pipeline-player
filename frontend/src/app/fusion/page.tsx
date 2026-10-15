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
 * Fusion Retriever Page
 * ---------------------
 * One query → hybrid search on a text collection (top-N chunks) AND MaxSim
 * search on a ColPali collection (top-N pages), in parallel. A user-written
 * Python reranker (RRF by default) fuses both lists; the final top-k items
 * that would be passed to the LLM update live while the code is edited.
 * When the ranking looks right, "Generate answer" sends them to the LLM
 * (text chunks as text, ColPali pages as images).
 *
 * Layout:
 *   LEFT   — query, collections, limits, answer model
 *   CENTER — text hits | ColPali hits (selected items are highlighted)
 *   RIGHT  — reranker editor, final top-k ("→ LLM"), answer
 */

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ColPaliCollectionInfo,
  EmbeddingModelOption,
  FusionHit,
  FusionSearchResult,
  RerankResult,
  TextCollectionInfo,
  TextFusion,
  buildLlmContext,
  deleteScript,
  fusionSearch,
  getDefaultScript,
  listEmbeddingModels,
  listFusionCollections,
  listScripts,
  loadScript,
  pageImageUrl,
  pageLabel,
  runRerank,
  saveScript,
} from "@/lib/fusion";
import { generateAnswer } from "@/lib/retrieve";

// CodeMirror touches the DOM → load the editor on the client only
const PythonEditor = dynamic(() => import("@/components/PythonEditor"), {
  ssr: false,
  loading: () => <div className="python-editor python-editor--loading">Loading editor…</div>,
});

/** Same answer models as on the ColPali: Retrieve page. */
const ANSWER_MODELS = [
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini" },
  { value: "gemini-3.6-flash", label: "Gemini 3.6 Flash" },
  { value: "gemini-3.1-pro-preview", label: "Gemini 3.1 Pro" },
  { value: "ollama/llava", label: "Ollama: LLaVA Vision (Local/Free)" },
];

const hitKey = (h: { source: string; id: string }) => `${h.source}:${h.id}`;

/** Fusion methods for the text collection (see Qdrant hybrid-queries docs). */
const FUSION_OPTIONS: { value: TextFusion; label: string; tip: string }[] = [
  { value: "rrf", label: "RRF", tip: "Reciprocal Rank Fusion — uses only the ranks of both lists" },
  { value: "dbsf", label: "DBSF", tip: "Distribution-Based Score Fusion — normalises the raw scores (mean ± 3σ) and sums them" },
  { value: "dense", label: "Dense", tip: "Dense (semantic) retriever only" },
  { value: "sparse", label: "Sparse", tip: "Sparse (keyword) retriever only" },
];

/** Badge text for the retriever that produced a text hit. */
const DRIVER_LABEL: Record<string, string> = {
  dense: "◆ dense-driven",
  sparse: "◇ sparse-driven",
  balanced: "⚖ both",
  none: "–",
};

const shortModel = (m?: string | null) => (m ? m.split("/").pop() : "—");
const pct = (x: number) => `${Math.round(x * 100)}%`;

export default function FusionPage() {
  /* ── Collections & query ─────────────────────────────────────── */
  const [textCols, setTextCols] = useState<TextCollectionInfo[]>([]);
  const [colpaliCols, setColpaliCols] = useState<ColPaliCollectionInfo[]>([]);
  const [textCol, setTextCol] = useState("");
  const [colpaliCol, setColpaliCol] = useState("");
  const [denseOverride, setDenseOverride] = useState("");
  const [sparseOverride, setSparseOverride] = useState("");
  const [embedModels, setEmbedModels] = useState<{ dense: EmbeddingModelOption[]; sparse: EmbeddingModelOption[] }>({ dense: [], sparse: [] });
  const [textFusion, setTextFusion] = useState<TextFusion>("rrf");
  const [rrfK, setRrfK] = useState(60);
  const [denseWeight, setDenseWeight] = useState(1);
  const [sparseWeight, setSparseWeight] = useState(1);
  const [query, setQuery] = useState("");
  const [textLimit, setTextLimit] = useState(5);
  const [colpaliLimit, setColpaliLimit] = useState(5);
  const [finalK, setFinalK] = useState(3);

  /* ── Search state ────────────────────────────────────────────── */
  const [isSearching, setIsSearching] = useState(false);
  const [search, setSearch] = useState<FusionSearchResult | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  /* ── Reranker ────────────────────────────────────────────────── */
  const [code, setCode] = useState("");
  const [defaultCode, setDefaultCode] = useState("");
  const [savedCode, setSavedCode] = useState(""); // last loaded/saved version (dirty check)
  const [scripts, setScripts] = useState<string[]>([]);
  const [scriptName, setScriptName] = useState(""); // "" = built-in RRF
  const [saveAsName, setSaveAsName] = useState<string | null>(null);
  const [scriptMsg, setScriptMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [rerankState, setRerank] = useState<RerankResult | null>(null);
  // Last successful selection — stays visible while the code is broken
  const [lastSelected, setLastSelected] = useState<FusionHit[]>([]);
  const [isReranking, setIsReranking] = useState(false);
  const rerankAbort = useRef<AbortController | null>(null);

  /* ── Answer ──────────────────────────────────────────────────── */
  const [answerModel, setAnswerModel] = useState("gpt-4o");
  const [answer, setAnswer] = useState("");
  const [answerError, setAnswerError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const flash = useCallback((text: string, isError = false) => {
    setScriptMsg({ text, isError });
    window.setTimeout(() => setScriptMsg(null), 3000);
  }, []);

  /* ── Initial load ────────────────────────────────────────────── */
  useEffect(() => {
    listFusionCollections()
      .then(({ text, colpali }) => {
        setTextCols(text);
        setColpaliCols(colpali);
        // Pre-select the first "<x>_hybrid" + "<x>_colpali" pair (RAG Tester output)
        const pair = text.find((t) => t.name.endsWith("_hybrid") && colpali.some((c) => c.name === t.name.replace(/_hybrid$/, "_colpali")));
        if (pair) {
          setTextCol(pair.name);
          setColpaliCol(pair.name.replace(/_hybrid$/, "_colpali"));
        }
      })
      .catch((e) => setSearchError(e.message));
    getDefaultScript()
      .then((c) => {
        setDefaultCode(c);
        setCode(c);
        setSavedCode(c);
      })
      .catch((e) => flash(e.message, true));
    listScripts().then(setScripts).catch(console.error);
    listEmbeddingModels().then(setEmbedModels).catch(console.error);
  }, [flash]);

  // Selecting a text collection auto-selects its ColPali sibling (same prefix)
  const handleTextCol = (name: string) => {
    setTextCol(name);
    setDenseOverride("");
    setSparseOverride("");
    const sibling = name.replace(/_hybrid$/, "_colpali");
    if (sibling !== name && colpaliCols.some((c) => c.name === sibling)) setColpaliCol(sibling);
  };

  const textInfo = textCols.find((c) => c.name === textCol);
  const hybridPossible = !!textInfo?.dense_dim && !!textInfo?.has_sparse;
  // Dense models that produce vectors of the collection's size (others would fail)
  const denseFit = embedModels.dense.filter((m) => m.dim === textInfo?.dense_dim);
  const denseOther = embedModels.dense.filter((m) => m.dim !== textInfo?.dense_dim);
  // Detected models are reliable when they come from the payload or the manifest
  const reliableDetection = textInfo?.model_source === "payload" || textInfo?.model_source === "manifest";

  /* ── Search ──────────────────────────────────────────────────── */
  const searchSeq = useRef(0); // ignore responses of outdated searches
  const handleSearch = useCallback(async () => {
    if (!query.trim() || (!textCol && !colpaliCol)) return;
    const seq = ++searchSeq.current;
    setIsSearching(true);
    setSearchError(null);
    setAnswer("");
    setAnswerError(null);
    try {
      const res = await fusionSearch({
        query,
        text_collection: textCol,
        colpali_collection: colpaliCol,
        text_limit: textLimit,
        colpali_limit: colpaliLimit,
        dense_model_override: denseOverride,
        sparse_model_override: sparseOverride,
        text_fusion: textFusion,
        rrf_k: rrfK,
        dense_weight: denseWeight,
        sparse_weight: sparseWeight,
      });
      if (seq !== searchSeq.current) return;
      setSearch(res);
      const errs = Object.entries(res.errors);
      if (errs.length) setSearchError(errs.map(([k, v]) => `${k}: ${v}`).join(" · "));
    } catch (e) {
      if (seq === searchSeq.current) setSearchError((e as Error).message);
    } finally {
      if (seq === searchSeq.current) setIsSearching(false);
    }
  }, [query, textCol, colpaliCol, textLimit, colpaliLimit, denseOverride, sparseOverride, textFusion, rrfK, denseWeight, sparseWeight]);

  /* ── Auto re-search when the text retrieval settings change ────── */
  const handleSearchRef = useRef(handleSearch);
  const canAutoSearch = useRef(false);
  useEffect(() => {
    handleSearchRef.current = handleSearch;
  }, [handleSearch]);
  useEffect(() => {
    canAutoSearch.current = !!search && !!textCol;
  }, [search, textCol]);
  const textOptsKey = [denseOverride, sparseOverride, textFusion, rrfK, denseWeight, sparseWeight].join("|");
  const lastOptsKey = useRef(textOptsKey);
  useEffect(() => {
    if (lastOptsKey.current === textOptsKey) return;
    lastOptsKey.current = textOptsKey;
    if (!canAutoSearch.current) return;
    const handle = window.setTimeout(() => handleSearchRef.current(), 350); // debounce typing in k / weights
    return () => window.clearTimeout(handle);
  }, [textOptsKey]);

  const textHits = useMemo(() => search?.text?.hits ?? [], [search]);
  const colpaliHits = useMemo(() => search?.colpali?.hits ?? [], [search]);
  // How many text hits were produced mainly by dense / sparse / both
  const driverCounts = useMemo(() => {
    const c: Record<string, number> = { dense: 0, sparse: 0, balanced: 0 };
    textHits.forEach((h) => {
      if (h.driver && h.driver in c) c[h.driver] += 1;
    });
    return c;
  }, [textHits]);

  /* ── Live rerank: re-run ~400 ms after code / k / results change ── */
  const hasHits = textHits.length > 0 || colpaliHits.length > 0;
  useEffect(() => {
    if (!code || !hasHits) return; // nothing to rerank (state is ignored below)
    const handle = window.setTimeout(async () => {
      rerankAbort.current?.abort();
      const abort = new AbortController();
      rerankAbort.current = abort;
      setIsReranking(true);
      try {
        const res = await runRerank(code, textHits, colpaliHits, finalK, abort.signal);
        setRerank(res);
        if (res.ok && res.selected) setLastSelected(res.selected);
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          setRerank({ ok: false, error: (e as Error).message, elapsed_ms: 0 });
        }
      } finally {
        if (rerankAbort.current === abort) setIsReranking(false);
      }
    }, 400);
    return () => window.clearTimeout(handle);
  }, [code, finalK, textHits, colpaliHits, hasHits]);

  // Without hits there is no rerank result and nothing goes to the LLM
  const rerank = hasHits && code ? rerankState : null;
  const selected = useMemo(
    () => (!hasHits ? [] : rerank?.ok ? rerank.selected ?? [] : lastSelected),
    [hasHits, rerank, lastSelected]
  );
  const selectedPos = useMemo(() => new Map(selected.map((h, i) => [hitKey(h), i + 1])), [selected]);

  /* ── Script management ───────────────────────────────────────── */
  const isDirty = code !== savedCode;

  const handleLoadScript = async (name: string) => {
    if (isDirty && !window.confirm("Discard unsaved changes in the editor?")) return;
    setScriptName(name);
    try {
      const c = name ? await loadScript(name) : defaultCode;
      setCode(c);
      setSavedCode(c);
      if (name) flash(`Loaded '${name}'`);
    } catch (e) {
      flash((e as Error).message, true);
    }
  };

  const doSave = async (name: string) => {
    try {
      await saveScript(name, code);
      setScripts(await listScripts());
      setScriptName(name);
      setSavedCode(code);
      setSaveAsName(null);
      flash(`Saved '${name}'`);
    } catch (e) {
      flash((e as Error).message, true);
    }
  };

  const handleSave = () => (scriptName ? doSave(scriptName) : setSaveAsName(""));

  const handleDeleteScript = async () => {
    if (!scriptName || !window.confirm(`Delete reranker script '${scriptName}'?`)) return;
    try {
      await deleteScript(scriptName);
      setScripts(await listScripts());
      setScriptName("");
      setCode(defaultCode);
      setSavedCode(defaultCode);
      flash("Deleted");
    } catch (e) {
      flash((e as Error).message, true);
    }
  };

  /* ── Answer generation ───────────────────────────────────────── */
  const handleGenerate = () => {
    if (!selected.length) return;
    const { chunks, imageRefs } = buildLlmContext(selected);
    setIsGenerating(true);
    setAnswer("");
    setAnswerError(null);
    generateAnswer(
      query,
      chunks,
      answerModel,
      imageRefs.length ? imageRefs : undefined,
      (t) => setAnswer((prev) => prev + t),
      () => setIsGenerating(false),
      (err) => {
        setAnswerError(err);
        setIsGenerating(false);
      },
      true
    );
  };

  /* ── Render helpers ──────────────────────────────────────────── */
  const llmBadge = (h: FusionHit) => {
    const pos = selectedPos.get(hitKey(h));
    return pos ? <span className="fusion-llm-badge">→ LLM #{pos}</span> : null;
  };

  const scoreBar = (h: FusionHit) => (
    <div className="fusion-scorebar" title={`normalised score ${h.score_norm}`}>
      <div className="fusion-scorebar__fill" style={{ width: `${Math.round((h.score_norm ?? 0) * 100)}%` }} />
    </div>
  );

  /** Dense/sparse split of a text hit's fused score + per-list rank chips. */
  const contribution = (h: FusionHit) => {
    const share = h.dense_share;
    const fusion = search?.text?.fusion;
    const prefetch = search?.text?.prefetch_limit;
    const contribLabel = (c?: number) =>
      share == null || c == null || fusion === "dense" || fusion === "sparse" ? "" : ` · ${c.toFixed(fusion === "rrf" ? 4 : 3)}`;
    // In hybrid modes, a hit only one retriever found is worth calling out
    const onlyOne = (fusion === "rrf" || fusion === "dbsf") && (h.found_by === "dense" || h.found_by === "sparse");
    return (
      <>
        {share != null && (
          <div className="fusion-contrib" title={`dense ${pct(share)} · sparse ${pct(1 - share)} of the fused score`}>
            <div className="fusion-contrib__dense" style={{ width: pct(share) }} />
            <div className="fusion-contrib__sparse" style={{ width: pct(1 - share) }} />
          </div>
        )}
        <div className="rag-chips">
          <span
            className={`rag-chip fusion-chip--dense ${h.dense_rank == null ? "fusion-chip--miss" : ""}`}
            title={h.dense_rank != null
              ? `dense rank ${h.dense_rank} of ${prefetch} · cosine ${h.dense_score?.toFixed(4)} · contribution ${h.dense_contrib}`
              : `not in the dense top ${prefetch}`}
          >
            dense #{h.dense_rank ?? "–"}{contribLabel(h.dense_contrib)}
          </span>
          <span
            className={`rag-chip fusion-chip--sparse ${h.sparse_rank == null ? "fusion-chip--miss" : ""}`}
            title={h.sparse_rank != null
              ? `sparse rank ${h.sparse_rank} of ${prefetch} · score ${h.sparse_score?.toFixed(3)} · contribution ${h.sparse_contrib}`
              : `not in the sparse top ${prefetch}`}
          >
            sparse #{h.sparse_rank ?? "–"}{contribLabel(h.sparse_contrib)}
          </span>
          {h.driver && (
            <span className={`fusion-driver fusion-driver--${onlyOne ? h.found_by : h.driver}`}>
              {onlyOne ? `only ${h.found_by}` : DRIVER_LABEL[h.driver]}
            </span>
          )}
        </div>
      </>
    );
  };

  /* ── Render ──────────────────────────────────────────────────── */
  return (
    <div className="fusion-shell">
      {/* ═══ LEFT: Setup ═══════════════════════════════════════════ */}
      <aside className="panel panel--config">
        <div className="panel__header">
          <span className="panel__title">🔀 Fusion Setup</span>
        </div>
        <div className="panel__body rag-setup">
          <section className="rag-section">
            <div className="rag-section__title">1 · Query</div>
            <textarea
              id="fusion-query"
              className="input"
              rows={4}
              placeholder="Ask a question… (⌘/Ctrl + Enter to search)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSearch();
              }}
              style={{ resize: "vertical", fontFamily: "var(--font-body)" }}
            />
          </section>

          <section className="rag-section">
            <div className="rag-section__title">2 · Collections</div>
            <label className="field">
              <span className="field__label">📝 Text collection (hybrid)</span>
              <select id="fusion-text-col" className="select" value={textCol} onChange={(e) => handleTextCol(e.target.value)}>
                <option value="">— none —</option>
                {textCols.map((c) => (
                  <option key={c.name} value={c.name}>{c.name} ({c.points})</option>
                ))}
              </select>
            </label>
            {textInfo && (
              <div className="rag-chips">
                <span className={`rag-chip ${textInfo.model_source === "dimension-guess" && !denseOverride ? "rag-chip--warn" : ""}`}
                  title={`detected via ${textInfo.model_source}`}>
                  {shortModel(textInfo.dense_model) ?? "no dense"}{textInfo.dense_dim ? ` · ${textInfo.dense_dim}d` : ""}
                </span>
                {textInfo.sparse_model && <span className="rag-chip">{shortModel(textInfo.sparse_model)}</span>}
                <span className="rag-chip">via {textInfo.model_source}</span>
              </div>
            )}
            <label className="field">
              <span className="field__label">🖼️ ColPali collection (MaxSim)</span>
              <select id="fusion-colpali-col" className="select" value={colpaliCol} onChange={(e) => setColpaliCol(e.target.value)}>
                <option value="">— none —</option>
                {colpaliCols.map((c) => (
                  <option key={c.name} value={c.name}>{c.name} ({c.points} p.)</option>
                ))}
              </select>
            </label>
          </section>

          {textInfo && (
            <section className="rag-section">
              <div className="rag-section__title">3 · Text retrieval</div>

              {/* Dense query model — only models with the collection's vector size are selectable */}
              <label className="field">
                <span className="field__label">Dense query model</span>
                <select id="fusion-dense-model" className="select" value={denseOverride}
                  disabled={!textInfo.dense_dim} onChange={(e) => setDenseOverride(e.target.value)}>
                  <option value="">auto · {shortModel(textInfo.dense_model)} ({textInfo.model_source})</option>
                  {denseFit.length > 0 && (
                    <optgroup label={`Fits this collection (${textInfo.dense_dim}-dim)`}>
                      {denseFit.map((m) => <option key={m.model} value={m.model} title={m.description}>{m.model}</option>)}
                    </optgroup>
                  )}
                  {denseOther.length > 0 && (
                    <optgroup label="Other vector size — incompatible">
                      {denseOther.map((m) => <option key={m.model} value={m.model} disabled>{m.model} · {m.dim}d</option>)}
                    </optgroup>
                  )}
                </select>
              </label>
              {denseOverride && reliableDetection && denseOverride !== textInfo.dense_model && (
                <div className="fusion-warn">⚠ Indexed with {shortModel(textInfo.dense_model)} — another model with the same size runs, but its vectors live in a different space.</div>
              )}

              {/* Sparse query model */}
              <label className="field">
                <span className="field__label">Sparse query model</span>
                <select id="fusion-sparse-model" className="select" value={sparseOverride}
                  disabled={!textInfo.has_sparse} onChange={(e) => setSparseOverride(e.target.value)}>
                  <option value="">{textInfo.has_sparse ? `auto · ${shortModel(textInfo.sparse_model)}` : "— no sparse vectors —"}</option>
                  {embedModels.sparse.map((m) => <option key={m.model} value={m.model} title={m.description}>{m.model}</option>)}
                </select>
              </label>
              {sparseOverride && reliableDetection && sparseOverride !== textInfo.sparse_model && (
                <div className="fusion-warn">⚠ Indexed with {shortModel(textInfo.sparse_model)} — a different sparse model uses a different vocabulary, so matches are meaningless.</div>
              )}

              {/* Fusion method */}
              <div className="field">
                <span className="field__label">Fusion (dense + sparse)</span>
                <div className="fusion-seg" role="radiogroup" aria-label="Text fusion method">
                  {FUSION_OPTIONS.map((o) => {
                    const disabled = (o.value === "rrf" || o.value === "dbsf") ? !hybridPossible
                      : o.value === "dense" ? !textInfo.dense_dim : !textInfo.has_sparse;
                    return (
                      <button key={o.value} id={`fusion-mode-${o.value}`} type="button" role="radio"
                        aria-checked={textFusion === o.value} title={o.tip} disabled={disabled}
                        className={`fusion-seg__btn ${textFusion === o.value ? "fusion-seg__btn--active" : ""}`}
                        onClick={() => setTextFusion(o.value)}>
                        {o.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              {textFusion === "rrf" && (
                <>
                  <div className="fusion-limits">
                    <label className="field"><span className="field__label">k</span>
                      <input id="fusion-rrf-k" type="number" className="input" min={1} max={1000} value={rrfK}
                        onChange={(e) => setRrfK(Math.max(1, Number(e.target.value) || 1))} />
                    </label>
                    <label className="field"><span className="field__label">w dense</span>
                      <input id="fusion-w-dense" type="number" className="input" min={0} max={10} step={0.5} value={denseWeight}
                        onChange={(e) => setDenseWeight(Math.max(0, Number(e.target.value) || 0))} />
                    </label>
                    <label className="field"><span className="field__label">w sparse</span>
                      <input id="fusion-w-sparse" type="number" className="input" min={0} max={10} step={0.5} value={sparseWeight}
                        onChange={(e) => setSparseWeight(Math.max(0, Number(e.target.value) || 0))} />
                    </label>
                  </div>
                  <div className="rag-hint">
                    Qdrant: <code>score = Σ 1 / (rank / w + k − 1)</code>. The weight divides the <em>rank</em>, so with
                    k = 60 weights only nudge the order — lower k (e.g. 2, Qdrant&apos;s default) for a stronger effect.
                  </div>
                </>
              )}
              {textFusion === "dbsf" && (
                <div className="rag-hint">
                  Each list&apos;s raw scores are mapped from [mean − 3σ, mean + 3σ] to [0, 1] and summed. Qdrant offers no weights for DBSF.
                </div>
              )}
            </section>
          )}

          <section className="rag-section">
            <div className="rag-section__title">{textInfo ? 4 : 3} · Limits</div>
            <div className="fusion-limits">
              <label className="field"><span className="field__label">Text top-N</span>
                <input type="number" className="input" min={1} max={50} value={textLimit} onChange={(e) => setTextLimit(Number(e.target.value) || 1)} />
              </label>
              <label className="field"><span className="field__label">ColPali top-N</span>
                <input type="number" className="input" min={1} max={50} value={colpaliLimit} onChange={(e) => setColpaliLimit(Number(e.target.value) || 1)} />
              </label>
              <label className="field"><span className="field__label">→ LLM (k)</span>
                <input id="fusion-final-k" type="number" className="input" min={1} max={20} value={finalK} onChange={(e) => setFinalK(Number(e.target.value) || 1)} />
              </label>
            </div>
          </section>

          <section className="rag-section">
            <div className="rag-section__title">{textInfo ? 5 : 4} · Answer model</div>
            <select id="fusion-answer-model" className="select" value={answerModel} onChange={(e) => setAnswerModel(e.target.value)}>
              {ANSWER_MODELS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </section>

          <button
            id="fusion-search-btn"
            className={`run-btn ${isSearching ? "run-btn--running" : ""}`}
            disabled={isSearching || !query.trim() || (!textCol && !colpaliCol)}
            onClick={handleSearch}
          >
            {isSearching ? <><div className="run-btn__spinner" /> Searching…</> : <>🔎 Search both</>}
          </button>
          {isSearching && !search && (
            <div className="rag-hint">First search loads the models (~15–30 s), later searches take ~1 s.</div>
          )}
          {searchError && <div className="rag-hint rag-hint--error">❌ {searchError}</div>}
        </div>
      </aside>

      {/* ═══ CENTER: Hits ══════════════════════════════════════════ */}
      <main className="panel panel--main">
        <div className="panel__header">
          <span className="panel__title">📊 Candidates</span>
          {search && (
            <span className="fusion-meta">
              {search.text && <>📝 {search.text.mode} · {search.text.elapsed_ms} ms</>}
              {search.text && search.colpali && " · "}
              {search.colpali && <>🖼️ {search.colpali.model.split("/").pop()} · {search.colpali.elapsed_ms} ms</>}
            </span>
          )}
        </div>
        <div className="panel__body fusion-columns">
          {!search && !isSearching && (
            <div className="fusion-empty">
              Enter a query and click <strong>🔎 Search both</strong>.<br />
              <span>Text chunks (hybrid) and ColPali pages (MaxSim) appear side by side; the reranker on the right decides what goes to the LLM.</span>
            </div>
          )}

          {search && (
            <>
              {/* Text hits */}
              <section className="fusion-col">
                <div className="fusion-col__title">
                  📝 Text · top {textHits.length}
                  {search.text && <span className="fusion-col__mode"> · {search.text.mode}</span>}
                </div>
                {textHits.length > 0 && (search.text?.fusion === "rrf" || search.text?.fusion === "dbsf") && (
                  <div className="fusion-legend">
                    <span><i className="fusion-dot fusion-dot--dense" /> dense {driverCounts.dense}</span>
                    <span><i className="fusion-dot fusion-dot--sparse" /> sparse {driverCounts.sparse}</span>
                    <span>⚖ both {driverCounts.balanced}</span>
                    <span className="fusion-legend__hint" title="Share of each hit's fused score; ≥60 % = driven by that retriever">bar = share of fused score</span>
                  </div>
                )}
                {textHits.map((h) => (
                  <article key={h.id} className={`fusion-hit ${selectedPos.has(hitKey(h)) ? "fusion-hit--selected" : ""}`}>
                    <header className="fusion-hit__head">
                      <strong>#{h.rank}</strong>
                      <span className="fusion-hit__score">{h.score.toFixed(4)}</span>
                      {llmBadge(h)}
                    </header>
                    {scoreBar(h)}
                    <div className="fusion-hit__src">{h.doc_name} · {pageLabel(h)}</div>
                    {contribution(h)}
                    <details className="fusion-hit__text">
                      <summary>{(h.text || "").slice(0, 160)}{(h.text || "").length > 160 ? "…" : ""}</summary>
                      <p>{h.text}</p>
                    </details>
                  </article>
                ))}
                {!textHits.length && <div className="rag-hint">No text collection selected or no hits.</div>}
              </section>

              {/* ColPali hits */}
              <section className="fusion-col">
                <div className="fusion-col__title">🖼️ ColPali · top {colpaliHits.length}</div>
                {colpaliHits.map((h) => (
                  <article key={h.id} className={`fusion-hit fusion-hit--page ${selectedPos.has(hitKey(h)) ? "fusion-hit--selected" : ""}`}>
                    {h.file_path && h.page ? (
                      <a href={pageImageUrl(h.file_path, h.page, 144)} target="_blank" rel="noreferrer" title="Open large">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img className="fusion-thumb" src={pageImageUrl(h.file_path, h.page, 60)} alt={`${h.doc_name} page ${h.page}`} loading="lazy" />
                      </a>
                    ) : (
                      <div className="fusion-thumb fusion-thumb--missing">no PDF</div>
                    )}
                    <div className="fusion-hit__body">
                      <header className="fusion-hit__head">
                        <strong>#{h.rank}</strong>
                        <span className="fusion-hit__score">{h.score.toFixed(2)}</span>
                        {llmBadge(h)}
                      </header>
                      {scoreBar(h)}
                      <div className="fusion-hit__src">{h.doc_name} · {pageLabel(h)}</div>
                    </div>
                  </article>
                ))}
                {!colpaliHits.length && <div className="rag-hint">No ColPali collection selected or no hits.</div>}
              </section>
            </>
          )}
        </div>
      </main>

      {/* ═══ RIGHT: Reranker + final selection ═════════════════════ */}
      <aside className="panel panel--console fusion-right">
        <div className="panel__header">
          <span className="panel__title">🧮 Reranker (Python)</span>
          {isDirty && <span className="fusion-dirty" title="Unsaved changes">● unsaved</span>}
        </div>

        {/* Script bar */}
        <div className="saved-profile-bar">
          <div className="saved-profile-bar__row">
            {saveAsName !== null ? (
              <>
                <input
                  id="fusion-script-name"
                  className="input"
                  autoFocus
                  placeholder="script name, e.g. colpali-boost"
                  value={saveAsName}
                  onChange={(e) => setSaveAsName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && saveAsName.trim()) doSave(saveAsName.trim());
                    if (e.key === "Escape") setSaveAsName(null);
                  }}
                  style={{ flex: 1 }}
                />
                <button className="btn-icon" disabled={!saveAsName.trim()} onClick={() => doSave(saveAsName.trim())} title="Save">✓</button>
                <button className="btn-icon" onClick={() => setSaveAsName(null)} title="Cancel">✕</button>
              </>
            ) : (
              <>
                <select id="fusion-script-select" className="select" value={scriptName} onChange={(e) => handleLoadScript(e.target.value)} style={{ flex: 1 }}>
                  <option value="">⚙️ built-in RRF</option>
                  {scripts.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <button className="btn-icon" disabled={!scriptName} onClick={handleDeleteScript} title="Delete script">🗑</button>
              </>
            )}
          </div>
          {saveAsName === null && (
            <div className="saved-profile-bar__actions">
              <button id="fusion-script-save" className="saved-profile-bar__btn saved-profile-bar__btn--primary" onClick={handleSave}>
                💾 {scriptName ? `Save “${scriptName}”` : "Save script"}
              </button>
              <button className="saved-profile-bar__btn" onClick={() => setSaveAsName(scriptName ? `${scriptName}-copy` : "")}>＋ Save as new…</button>
              <button className="saved-profile-bar__btn" onClick={() => setCode(defaultCode)} title="Replace the editor content with the built-in RRF script">↺ RRF</button>
            </div>
          )}
          {scriptMsg && (
            <div className={`saved-profile-bar__msg ${scriptMsg.isError ? "saved-profile-bar__msg--error" : ""}`}>{scriptMsg.text}</div>
          )}
        </div>

        {/* Editor */}
        <div className="fusion-editor">
          <PythonEditor value={code} onChange={setCode} errorLine={rerank && !rerank.ok ? rerank.line ?? null : null} />
        </div>

        {/* Run status */}
        <div className={`fusion-status ${rerank && !rerank.ok ? "fusion-status--error" : ""}`}>
          {isReranking ? "⏳ running…"
            : !rerank ? "Search first — the reranker runs live on the results."
            : rerank.ok ? `✅ ran in ${rerank.elapsed_ms} ms · ${selected.length} item(s) selected`
            : `❌ ${rerank.error}${rerank.line ? ` (line ${rerank.line})` : ""}`}
        </div>
        {rerank?.stdout && <pre className="fusion-stdout">{rerank.stdout}</pre>}

        {/* Final selection + answer */}
        <div className="fusion-final">
          <div className="fusion-col__title">
            ➜ Sent to LLM (top {finalK})
            {rerank && !rerank.ok && selected.length > 0 && <span className="fusion-stale"> · last valid result</span>}
          </div>
          {selected.length === 0 && <div className="rag-hint">Nothing selected yet.</div>}
          {selected.map((h, i) => (
            <article key={hitKey(h)} className="fusion-pick">
              <div className="fusion-pick__pos">{i + 1}</div>
              {h.source === "colpali" && h.file_path && h.page ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="fusion-pick__thumb" src={pageImageUrl(h.file_path, h.page, 60)} alt="" />
              ) : null}
              <div className="fusion-pick__body">
                <div className="fusion-pick__title">
                  {h.source === "text" ? "📝 Chunk" : "🖼️ Page"} · {h.doc_name} {pageLabel(h)}
                  <span className="fusion-pick__orig"> ({h.source} #{h.rank})</span>
                </div>
                {h.reason && <div className="fusion-pick__reason">{h.reason}{h.fused_score != null && ` · ${h.fused_score}`}</div>}
                {h.source === "text" && <div className="fusion-pick__text">{(h.text || "").slice(0, 220)}{(h.text || "").length > 220 ? "…" : ""}</div>}
              </div>
            </article>
          ))}

          {/* Answer generation (same models as ColPali: Retrieve) */}
          <div className="fusion-answer-bar">
            <button id="fusion-generate-btn" className="run-btn" disabled={isGenerating || selected.length === 0 || !query.trim()} onClick={handleGenerate}>
              {isGenerating ? "⏳ Generating…" : "▶ Generate answer"}
            </button>
            <span className="fusion-meta">{ANSWER_MODELS.find((m) => m.value === answerModel)?.label}</span>
          </div>
          {answerError && <div className="rag-hint rag-hint--error">❌ {answerError}</div>}
          {(answer || isGenerating) && (
            <div className="fusion-answer">
              {answer}
              {isGenerating && <span className="fusion-cursor" />}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
