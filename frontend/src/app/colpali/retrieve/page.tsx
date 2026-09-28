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
 * ColPali MaxSim Retrieval Page
 * --------------------------------
 * WHY: ColPali collections use multi-vector embeddings (patch-level) which
 * require MaxSim scoring for retrieval. This is a dedicated retrieval page
 * that filters to only show ColPali collections and returns page-level results.
 *
 * HOW: The user selects a ColPali collection, types a query, and retrieves
 * the top pages ranked by MaxSim score. The GPT-4o answer generation
 * can also be used on the results.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { listCollections, QdrantCollection } from "@/lib/qdrant";
import { retrieveColPali, ColPaliRetrievedPage } from "@/lib/colpali";
import { generateAnswer } from "@/lib/retrieve";

export default function ColPaliRetrievePage() {
  // ── Collection selection (filtered to multivector only) ───────────
  const [collections, setCollections] = useState<QdrantCollection[]>([]);
  const [selectedCol, setSelectedCol] = useState("");

  // ── Query state ──────────────────────────────────────────────────
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(5);
  const [isRetrieving, setIsRetrieving] = useState(false);
  const [results, setResults] = useState<ColPaliRetrievedPage[]>([]);
  const [error, setError] = useState<string | null>(null);

  // ── GPT-4o answer generation ─────────────────────────────────────
  const [answerModel, setAnswerModel] = useState("gpt-4o");
  const [answer, setAnswer] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [answerError, setAnswerError] = useState<string | null>(null);
  const answerRef = useRef<HTMLDivElement>(null);

  // ── Load collections on mount (filter to multivector) ─────────────
  useEffect(() => {
    listCollections()
      .then((cols) => {
        // Filter to only show ColPali (multivector) collections
        const colpaliCols = cols.filter(
          (c) => (c as unknown as Record<string, unknown>).is_multivector === true
        );
        setCollections(colpaliCols);
      })
      .catch(console.error);
  }, []);

  // ── Run MaxSim retrieval ──────────────────────────────────────────
  const handleRetrieve = useCallback(async () => {
    if (!selectedCol || !query.trim()) return;
    setIsRetrieving(true);
    setError(null);
    setResults([]);
    setAnswer("");

    try {
      const res = await retrieveColPali(selectedCol, query, limit);
      setResults(res.results);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsRetrieving(false);
    }
  }, [selectedCol, query, limit]);

  return (
    <div style={{ display: "flex", height: "100%", gap: 0 }}>
      {/* ── LEFT: Config Sidebar ──────────────────────────────────── */}
      <aside
        className="panel"
        style={{ width: 260, flexShrink: 0, borderRight: "1px solid var(--c-border)", display: "flex", flexDirection: "column" }}
      >
        <div className="panel__header">
          <span className="panel__title">⚙️ Config</span>
        </div>
        <div className="panel__body" style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Collection selector */}
          <section>
            <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--c-text-3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
              ColPali Collection
            </div>
            <select
              className="select"
              value={selectedCol}
              onChange={(e) => setSelectedCol(e.target.value)}
              style={{ width: "100%" }}
            >
              <option value="">Select collection…</option>
              {collections.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.points_count} pages)
                </option>
              ))}
            </select>
            {collections.length === 0 && (
              <div style={{ fontSize: "0.65rem", color: "var(--c-text-3)", marginTop: 6 }}>
                No ColPali collections found. Run the ColPali pipeline first.
              </div>
            )}
          </section>

          {/* Query input */}
          <section>
            <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--c-text-3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
              Search Query
            </div>
            <textarea
              className="input"
              rows={3}
              placeholder="Enter your question…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ width: "100%", resize: "vertical", fontFamily: "var(--font-body)" }}
            />
          </section>

          {/* Result limit */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--c-text-2)" }}>Results</span>
            <input
              type="number"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              min={1}
              max={20}
              style={{ width: 50, padding: "2px 6px", background: "var(--c-bg-2)", border: "1px solid var(--c-border)", borderRadius: 4, color: "var(--c-text-1)", fontSize: "0.8rem", textAlign: "right" }}
            />
          </div>

          {/* Answer model selector */}
          <section>
            <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--c-text-3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
              Answer Generation
            </div>
            <select
              className="select"
              value={answerModel}
              onChange={(e) => setAnswerModel(e.target.value)}
              style={{ width: "100%" }}
            >
              <option value="gpt-4o">GPT-4o</option>
              <option value="gpt-4o-mini">GPT-4o Mini</option>
              <option value="gemini-3.6-flash">Gemini 3.6 Flash</option>
              <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro</option>
              <option value="ollama/llava">Ollama: LLaVA Vision (Local/Free)</option>
            </select>
          </section>

          {/* Run button */}
          <button
            className="run-btn"
            onClick={handleRetrieve}
            disabled={isRetrieving || !selectedCol || !query.trim()}
            style={{ width: "100%" }}
          >
            {isRetrieving ? "⏳ Retrieving…" : "🔎 MaxSim Retrieve"}
          </button>
        </div>
      </aside>

      {/* ── MAIN: Results ─────────────────────────────────────────── */}
      <main
        className="panel"
        style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}
      >
        <div className="panel__header">
          <span className="panel__title">🔎 ColPali: MaxSim Retrieval</span>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Empty state */}
          {!isRetrieving && results.length === 0 && !error && (
            <div style={{ color: "var(--c-text-3)", textAlign: "center", paddingTop: 60, fontSize: "0.85rem" }}>
              Select a ColPali collection and enter a query to search.
              <br /><br />
              <span style={{ fontSize: "0.7rem" }}>
                MaxSim computes maximum similarity between query tokens and page patch vectors.
              </span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ padding: "12px", background: "var(--c-error-bg, #3a1a1a)", color: "var(--c-error, #f87171)", borderRadius: 6, fontSize: "0.8rem", border: "1px solid var(--c-error, #f87171)" }}>
              {error}
            </div>
          )}

          {/* Loading */}
          {isRetrieving && (
            <div style={{ color: "var(--c-text-3)", textAlign: "center", paddingTop: 40, fontSize: "0.85rem" }}>
              ⏳ Running MaxSim retrieval…
            </div>
          )}

          {/* Results */}
          {results.length > 0 && (
            <>
              <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--c-success, #4ade80)", textTransform: "uppercase", letterSpacing: 1 }}>
                Top {results.length} Pages (MaxSim)
              </div>

              {results.map((page, i) => (
                <div
                  key={page.id}
                  style={{
                    background: "var(--c-bg-2)",
                    border: "1px solid var(--c-border)",
                    borderRadius: 8,
                    padding: "14px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <strong style={{ color: "var(--c-text-1)", fontSize: "0.85rem" }}>
                        #{i + 1}
                      </strong>
                      <span
                        className="chunk-badge chunk-badge--type"
                        style={{ fontSize: "0.7rem" }}
                      >
                        Page {page.page_number}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "var(--c-text-3)" }}>
                        {page.doc_source}
                      </span>
                    </div>
                    <span style={{ color: "var(--c-accent)", fontSize: "0.8rem", fontWeight: 600 }}>
                      Score: {page.score.toFixed(4)}
                    </span>
                  </div>

                  {/* Metadata */}
                  <details style={{ fontSize: "0.75rem", color: "var(--c-text-2)" }}>
                    <summary style={{ cursor: "pointer", color: "var(--c-accent)" }}>Show Metadata</summary>
                    <pre style={{ marginTop: 8, padding: 8, background: "var(--c-bg)", borderRadius: 4, overflowX: "auto" }}>
                      {JSON.stringify(page.metadata, null, 2)}
                    </pre>
                  </details>
                </div>
              ))}

              {/* GPT-4o Answer Generation */}
              <section style={{ marginTop: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--c-text-3)", textTransform: "uppercase", letterSpacing: 1 }}>
                    🤖 AI Answer ({answerModel})
                  </div>
                  <button
                    className="run-btn"
                    disabled={isGenerating || results.length === 0}
                    onClick={() => {
                      setIsGenerating(true);
                      setAnswer("");
                      setAnswerError(null);
                      // For ColPali pages we send the metadata as context
                      const chunkTexts = results.map(
                        (p) => `[Page ${p.page_number} of ${p.doc_source}]\n${JSON.stringify(p.metadata, null, 2)}`
                      );
                      const imageRefs = results.map(p => ({ source: p.doc_source, page: p.page_number }));
                      
                      generateAnswer(
                        query,
                        chunkTexts,
                        answerModel,
                        imageRefs,
                        (token) => setAnswer((prev) => prev + token),
                        () => setIsGenerating(false),
                        (err) => { setAnswerError(err); setIsGenerating(false); }
                      );
                    }}
                    style={{ padding: "4px 16px", fontSize: "0.75rem" }}
                  >
                    {isGenerating ? "⏳ Generating…" : "▶ Generate Answer"}
                  </button>
                </div>

                {answerError && (
                  <div style={{ padding: "10px", background: "var(--c-error-bg, #3a1a1a)", color: "var(--c-error, #f87171)", borderRadius: 6, fontSize: "0.8rem", border: "1px solid var(--c-error, #f87171)", marginBottom: 12 }}>
                    {answerError}
                  </div>
                )}

                {(answer || isGenerating) && (
                  <div
                    ref={answerRef}
                    style={{
                      background: "var(--c-bg-2)",
                      border: "1px solid var(--c-accent)",
                      borderRadius: 8,
                      padding: "16px",
                      fontSize: "0.85rem",
                      color: "var(--c-text-1)",
                      lineHeight: 1.7,
                      whiteSpace: "pre-wrap",
                      minHeight: 60,
                    }}
                  >
                    {answer}
                    {isGenerating && (
                      <span style={{ display: "inline-block", width: 6, height: 16, background: "var(--c-accent)", marginLeft: 2, animation: "blink 1s step-end infinite", verticalAlign: "text-bottom" }} />
                    )}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
