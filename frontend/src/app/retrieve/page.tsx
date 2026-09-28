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


import { useEffect, useRef, useState } from "react";
import { getCollections, RetrieveCollection, rewriteQuery, runRetrieve, RetrieveResponse, generateAnswer } from "@/lib/retrieve";

/**
 * WHY: This is the main page component for the "Retrieval & Ranking" step (Step 5).
 * It provides a user interface to test the quality of vector search, view query vectors,
 * and compare pre-fusion and post-fusion results side-by-side.
 *
 * HOW: It maintains state for user inputs (collection, prompt, limits), calls the 
 * backend retrieve endpoints via `lib/retrieve`, and renders the JSON/text results.
 */
export default function RetrievePage() {
  const [collections, setCollections] = useState<RetrieveCollection[]>([]);
  const [selectedCol, setSelectedCol] = useState<string>("");
  const [isHybrid, setIsHybrid] = useState(false);

  const [prompt, setPrompt] = useState("");
  const [limit, setLimit] = useState(5);
  const [fusionStrategy, setFusionStrategy] = useState<"rrf" | "dbsf">("rrf");
  const [useCrossEncoder, setUseCrossEncoder] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RetrieveResponse | null>(null);
  const [showVectors, setShowVectors] = useState(false);

  // GPT-4o answer generation state
  const [answerModel, setAnswerModel] = useState<string>("gpt-4o");
  const [answer, setAnswer] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [answerError, setAnswerError] = useState<string | null>(null);
  const answerRef = useRef<HTMLDivElement>(null);

  /**
   * WHY: We need to populate the collection dropdown on initial load so the user 
   * can select which vector database to search against.
   *
   * HOW: We run a side effect once on component mount (empty dependency array) 
   * that fetches collections from the backend and pre-selects the first one if available.
   */
  useEffect(() => {
    getCollections()
      .then((cols) => {
        setCollections(cols);
        if (cols.length > 0) {
          setSelectedCol(cols[0].name);
          setIsHybrid(cols[0].is_hybrid);
        }
      })
      .catch(console.error);
  }, []);

  /**
   * WHY: When the user selects a different collection, we need to know if it's a hybrid
   * collection (dense + sparse) or just dense. This is crucial because Fusion strategies
   * (RRF/DBSF) only make sense if there are multiple vector types to fuse.
   *
   * HOW: We look up the selected collection name in our cached `collections` array 
   * and update the `isHybrid` state accordingly.
   */
  const handleColChange = (val: string) => {
    setSelectedCol(val);
    const col = collections.find((c) => c.name === val);
    if (col) setIsHybrid(col.is_hybrid);
  };

  /**
   * WHY: This is the main action trigger when the user clicks "Search". It orchestrates
   * the entire retrieval pipeline step-by-step.
   *
   * HOW: 
   * 1. It validates the input.
   * 2. It sets processing state to true to disable the button and show a loader.
   * 3. It asks the backend to rewrite the natural language prompt into a clean search query.
   * 4. It asks the backend to run the retrieval with the rewritten query and returns the results.
   */
  const handleRun = async () => {
    if (!prompt.trim() || !selectedCol) return;
    setIsProcessing(true);
    setError(null);
    setResult(null);
    
    try {
      // 1. Rewrite
      const rewritten = await rewriteQuery(prompt);
      
      // 2. Retrieve
      const res = await runRetrieve(selectedCol, rewritten, limit, fusionStrategy);
      setResult(res);
    } catch (err: any) {
      setError(err.message || "Failed to run retrieval");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ display: "flex", height: "100%", gap: 0, overflow: "hidden" }}>
      {/* ── LEFT PANEL: Config ───────────────────────────────────────────── */}
      <aside
        className="panel"
        style={{
          width: 320,
          flexShrink: 0,
          borderRight: "1px solid var(--c-border)",
          overflowY: "auto",
        }}
      >
        <div className="panel__header">
          <span className="panel__title">🔎 Retrieval Config</span>
        </div>

        <div className="panel__body" style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 18 }}>
          
          <section>
            <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--c-text-3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
              Target Collection
            </div>
            <select
              value={selectedCol}
              onChange={(e) => handleColChange(e.target.value)}
              style={{
                width: "100%",
                padding: "6px 8px",
                background: "var(--c-bg-2)",
                border: "1px solid var(--c-border)",
                borderRadius: 6,
                color: "var(--c-text-1)",
                fontSize: "0.8rem",
              }}
            >
              {collections.length === 0 && <option value="">No collections found</option>}
              {collections.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} {c.is_hybrid ? "(Hybrid)" : "(Dense Only)"}
                </option>
              ))}
            </select>
          </section>

          <section>
            <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--c-text-3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
              Search Settings
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: "0.75rem", color: "var(--c-text-2)" }}>Max Results (Limit)</span>
              <input 
                type="number" 
                value={limit} 
                onChange={e => setLimit(Number(e.target.value))}
                min={1} max={50}
                style={{ width: 60, padding: "2px 6px", background: "var(--c-bg-2)", border: "1px solid var(--c-border)", borderRadius: 4, color: "var(--c-text-1)", fontSize: "0.8rem", textAlign: "right" }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: "0.75rem", color: "var(--c-text-2)", marginBottom: 4 }}>Fusion Strategy (Hybrid only)</div>
              <div style={{ display: "flex", gap: 6 }}>
                {(["rrf", "dbsf"] as const).map(strat => (
                  <button
                    key={strat}
                    disabled={!isHybrid}
                    onClick={() => setFusionStrategy(strat)}
                    style={{
                      flex: 1,
                      padding: "4px 8px",
                      borderRadius: 4,
                      border: `1px solid ${fusionStrategy === strat && isHybrid ? "var(--c-accent)" : "var(--c-border)"}`,
                      background: fusionStrategy === strat && isHybrid ? "var(--c-accent)" : "var(--c-bg-2)",
                      color: fusionStrategy === strat && isHybrid ? "var(--c-bg-1)" : "var(--c-text-2)",
                      fontSize: "0.75rem",
                      cursor: isHybrid ? "pointer" : "not-allowed",
                      opacity: isHybrid ? 1 : 0.5
                    }}
                  >
                    {strat.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div 
              title="Coming Soon: Second-pass reranking using local cross-encoder models."
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", opacity: 0.5, cursor: "not-allowed" }}
            >
              <span style={{ fontSize: "0.75rem", color: "var(--c-text-2)" }}>Use Cross-Encoder</span>
              <input type="checkbox" disabled checked={useCrossEncoder} />
            </div>
          </section>

          {/* GPT-4o Answer Generation Config */}
          <section>
            <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--c-text-3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
              Answer Generation
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: "0.75rem", color: "var(--c-text-2)" }}>Model</span>
              <select
                value={answerModel}
                onChange={e => setAnswerModel(e.target.value)}
                style={{
                  width: 130,
                  padding: "2px 6px",
                  background: "var(--c-bg-2)",
                  border: "1px solid var(--c-border)",
                  borderRadius: 4,
                  color: "var(--c-text-1)",
                  fontSize: "0.75rem",
                }}
              >
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-4o-mini">GPT-4o Mini</option>
                <option value="gemini-3.6-flash">Gemini 3.6 Flash</option>
                <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro</option>
                <option value="ollama/llama3.2">Ollama: Llama 3.2 Text (Local/Free)</option>
                <option value="ollama/llava">Ollama: LLaVA Vision (Local/Free)</option>
              </select>
            </div>
            <div style={{ fontSize: "0.65rem", color: "var(--c-text-3)", lineHeight: 1.4 }}>
              Generates a grounded answer from the retrieved chunks.
              Requires OPENAI_API_KEY (for GPT) or GEMINI_API_KEY (for Gemini) in backend environment.
            </div>
          </section>

        </div>
      </aside>

      {/* ── MAIN AREA ────────────────────────────────────────────────────── */}
      <main
        className="panel"
        style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}
      >
        <div className="panel__header">
          <span className="panel__title">🔎 Step 5: Retrieval & Ranking</span>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 24 }}>
          
          <section>
            <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--c-text-3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
              Search Prompt
            </div>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="What are the key takeaways regarding document extraction?"
              style={{
                width: "100%",
                height: 100,
                padding: "10px",
                background: "var(--c-bg-1)",
                border: "1px solid var(--c-border)",
                borderRadius: 8,
                color: "var(--c-text-1)",
                fontSize: "0.9rem",
                fontFamily: "inherit",
                resize: "vertical"
              }}
            />
            <div style={{ marginTop: 12 }}>
              <button 
                className="run-btn"
                onClick={handleRun}
                disabled={isProcessing || !prompt.trim()}
                style={{ padding: "8px 24px" }}
              >
                {isProcessing ? "⏳ Processing..." : "▶ Search"}
              </button>
            </div>
            {error && (
              <div style={{ marginTop: 12, padding: "10px", background: "var(--c-error-bg, #3a1a1a)", color: "var(--c-error, #f87171)", borderRadius: 6, fontSize: "0.8rem", border: "1px solid var(--c-error, #f87171)" }}>
                {error}
              </div>
            )}
          </section>

          {result && (
            <>
              <section style={{ background: "var(--c-bg-2)", border: "1px solid var(--c-border)", borderRadius: 8, padding: "14px" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--c-text-3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                  Query Processing
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--c-text-1)", marginBottom: 12 }}>
                  <strong>Rewritten Query:</strong> <span style={{ color: "var(--c-accent)" }}>{result.rewritten_query}</span>
                </div>
                <button 
                  onClick={() => setShowVectors(!showVectors)}
                  style={{ background: "none", border: "none", color: "var(--c-text-3)", fontSize: "0.75rem", cursor: "pointer", padding: 0, textDecoration: "underline" }}
                >
                  {showVectors ? "Hide Query Vectors" : "Show Query Vectors"}
                </button>
                {showVectors && (
                  <pre style={{ marginTop: 8, padding: 10, background: "var(--c-bg-1)", borderRadius: 6, fontSize: "0.7rem", overflowX: "auto", color: "var(--c-text-2)" }}>
                    {JSON.stringify(result.query_vectors, null, 2)}
                  </pre>
                )}
              </section>

              <div style={{ display: "flex", gap: 20 }}>
                {/* Pre-fusion Results */}
                {result.pre_fusion.length > 0 && (
                  <section style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--c-text-3)", textTransform: "uppercase", letterSpacing: 1 }}>
                      Pre-Fusion Retrieval
                    </div>
                    {result.pre_fusion.map(pf => (
                      <div key={pf.using} style={{ background: "var(--c-bg-2)", border: "1px solid var(--c-border)", borderRadius: 8, padding: "12px" }}>
                        <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--c-accent)", marginBottom: 8 }}>
                          {pf.using.toUpperCase()} Search
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {pf.chunks.map((c, i) => (
                            <div key={c.id} style={{ fontSize: "0.75rem", padding: "6px", background: "var(--c-bg-1)", borderRadius: 4, border: "1px solid var(--c-border)" }}>
                              <div style={{ color: "var(--c-text-3)", marginBottom: 4, display: "flex", justifyContent: "space-between" }}>
                                <span>#{i + 1}</span>
                                <span>Score: {c.score.toFixed(4)}</span>
                              </div>
                              <div style={{ color: "var(--c-text-2)", maxHeight: 60, overflow: "hidden", textOverflow: "ellipsis", marginBottom: 6 }}>
                                {c.text}
                              </div>
                              <details style={{ fontSize: "0.7rem", color: "var(--c-text-2)" }}>
                                <summary style={{ cursor: "pointer", color: "var(--c-accent)" }}>Metadata</summary>
                                <pre style={{ marginTop: 4, padding: 6, background: "rgba(0,0,0,0.2)", borderRadius: 4, overflowX: "auto" }}>
                                  {JSON.stringify(c.metadata, null, 2)}
                                </pre>
                              </details>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </section>
                )}

                {/* Final Fused Results */}
                <section style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--c-success, #4ade80)", textTransform: "uppercase", letterSpacing: 1 }}>
                    Final Ranked Results ({fusionStrategy.toUpperCase()})
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {result.fused_results.map((c, i) => (
                      <div key={c.id} style={{ background: "var(--c-bg-2)", border: "1px solid var(--c-accent)", borderRadius: 8, padding: "12px" }}>
                        <div style={{ fontSize: "0.8rem", color: "var(--c-text-3)", marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
                          <strong style={{ color: "var(--c-text-1)" }}>Rank #{i + 1}</strong>
                          <span style={{ color: "var(--c-accent)" }}>Fusion Score: {c.score.toFixed(4)}</span>
                        </div>
                        <div style={{ fontSize: "0.85rem", color: "var(--c-text-1)", lineHeight: 1.5, whiteSpace: "pre-wrap", marginBottom: 8 }}>
                          {c.text}
                        </div>
                        <details style={{ fontSize: "0.75rem", color: "var(--c-text-2)" }}>
                          <summary style={{ cursor: "pointer", color: "var(--c-accent)" }}>Show Metadata</summary>
                          <pre style={{ marginTop: 8, padding: 8, background: "var(--c-bg-1)", borderRadius: 4, overflowX: "auto" }}>
                            {JSON.stringify(c.metadata, null, 2)}
                          </pre>
                        </details>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* ── GPT-4o Answer Section ──────────────────────────────────── */}
              <section style={{ marginTop: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--c-text-3)", textTransform: "uppercase", letterSpacing: 1 }}>
                    🤖 AI Answer ({answerModel})
                  </div>
                  <button
                    className="run-btn"
                    disabled={isGenerating || result.fused_results.length === 0}
                    onClick={() => {
                      setIsGenerating(true);
                      setAnswer("");
                      setAnswerError(null);
                      generateAnswer(
                        result.rewritten_query,
                        result.fused_results.map(c => c.text),
                        answerModel,
                        undefined,
                        (token) => setAnswer(prev => prev + token),
                        () => setIsGenerating(false),
                        (err) => { setAnswerError(err); setIsGenerating(false); }
                      );
                    }}
                    style={{ padding: "4px 16px", fontSize: "0.75rem" }}
                  >
                    {isGenerating ? "⏳ Generating..." : "▶ Generate Answer"}
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
