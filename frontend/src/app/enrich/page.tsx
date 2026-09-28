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
 * Step 4: Enrich Collection
 * --------------------------
 * Lets the user pick an existing Qdrant collection, choose an enrichment
 * strategy (Parent-Child / RAPTOR / GraphRAG), configure LLM + strategy
 * options, and run the enrichment pipeline while watching a live log.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { listCollections, QdrantCollection } from "@/lib/qdrant";
import {
  EnrichmentConfig,
  EnrichStrategy,
  OllamaStatus,
  checkOllamaStatus,
  defaultEnrichmentConfig,
  startEnrichmentFetch,
} from "@/lib/enrich";

// ---------------------------------------------------------------------------
// Strategy card definitions
// ---------------------------------------------------------------------------
const STRATEGIES: {
  id: EnrichStrategy;
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  complexity: number; // 1–4 stars
}[] = [
  {
    id: "parent_child",
    icon: "🌿",
    title: "Parent-Child",
    subtitle: "Heading-based summarisation",
    description:
      "Groups child chunks by heading hierarchy. Calls an LLM to summarise each section. Stores parent summaries alongside the children in a new collection — ideal for documents with clear chapter structure.",
    complexity: 2,
  },
  {
    id: "raptor",
    icon: "🦕",
    title: "RAPTOR",
    subtitle: "Recursive semantic abstraction",
    description:
      "Reduces vectors with UMAP, clusters them with a Gaussian Mixture Model, summarises each cluster, then repeats recursively — building a tree of abstractions from leaves up to a single root summary.",
    complexity: 3,
  },
  {
    id: "graph_rag",
    icon: "🕸️",
    title: "GraphRAG",
    subtitle: "Knowledge graph + community detection",
    description:
      "Extracts named entities and relationships from every chunk. Builds a knowledge graph (NetworkX or Neo4j), runs Louvain community detection, and generates community-level summaries.",
    complexity: 4,
  },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ComplexityStars({ n }: { n: number }) {
  return (
    <span style={{ fontSize: "0.7rem", color: "var(--c-text-3)", letterSpacing: 2 }}>
      {"★".repeat(n)}{"☆".repeat(4 - n)}
    </span>
  );
}

function OllamaStatusBadge({ status }: { status: OllamaStatus | null }) {
  if (!status) return null;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: "0.72rem",
        padding: "2px 8px",
        borderRadius: 4,
        background: status.available ? "var(--c-success-bg, #1a3a1a)" : "var(--c-error-bg, #3a1a1a)",
        color: status.available ? "var(--c-success, #4ade80)" : "var(--c-error, #f87171)",
        border: `1px solid ${status.available ? "var(--c-success, #4ade80)" : "var(--c-error, #f87171)"}`,
      }}
    >
      {status.available ? "✓ Ollama running" : "✗ Ollama offline"}
    </span>
  );
}

// Simple number input row
function NumberRow({
  label,
  paramKey,
  value,
  onChange,
  min,
  max,
  tooltip,
}: {
  label: string;
  paramKey: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  tooltip?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 0",
        borderBottom: "1px solid var(--c-border)",
      }}
      title={tooltip}
    >
      <code style={{ fontSize: "0.68rem", color: "var(--c-accent)", minWidth: 0, flex: "0 0 auto" }}>
        {paramKey}
      </code>
      <span style={{ flex: 1, fontSize: "0.78rem", color: "var(--c-text-2)" }}>{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: 72,
          padding: "2px 6px",
          background: "var(--c-bg-2)",
          border: "1px solid var(--c-border)",
          borderRadius: 4,
          color: "var(--c-text-1)",
          fontSize: "0.8rem",
          textAlign: "right",
        }}
      />
    </div>
  );
}

function ToggleRow({
  label,
  paramKey,
  value,
  onChange,
  tooltip,
}: {
  label: string;
  paramKey: string;
  value: boolean;
  onChange: (v: boolean) => void;
  tooltip?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 0",
        borderBottom: "1px solid var(--c-border)",
        cursor: "pointer",
      }}
      title={tooltip}
      onClick={() => onChange(!value)}
    >
      <code style={{ fontSize: "0.68rem", color: "var(--c-accent)", minWidth: 0, flex: "0 0 auto" }}>
        {paramKey}
      </code>
      <span style={{ flex: 1, fontSize: "0.78rem", color: "var(--c-text-2)" }}>{label}</span>
      <div
        style={{
          width: 36,
          height: 20,
          borderRadius: 10,
          background: value ? "var(--c-accent)" : "var(--c-bg-3)",
          position: "relative",
          transition: "background 0.2s",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 2,
            left: value ? 18 : 2,
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "white",
            transition: "left 0.2s",
          }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function EnrichPage() {
  const [collections, setCollections] = useState<QdrantCollection[]>([]);
  const [selectedCol, setSelectedCol] = useState<string>("");
  const [strategy, setStrategy] = useState<EnrichStrategy>("parent_child");
  const [cfg, setCfg] = useState<EnrichmentConfig>(
    defaultEnrichmentConfig("")
  );
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus | null>(null);
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [logLines, setLogLines] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const logRef = useRef<HTMLDivElement>(null);

  // Load collections on mount
  useEffect(() => {
    listCollections()
      .then((cols) => {
        setCollections(cols);
        if (cols.length > 0) {
          setSelectedCol(cols[0].name);
        }
      })
      .catch(console.error);
  }, []);

  // Keep cfg in sync when selectedCol changes
  useEffect(() => {
    setCfg((prev) => ({ ...prev, source_collection: selectedCol }));
  }, [selectedCol]);

  // Keep cfg in sync when strategy changes
  useEffect(() => {
    setCfg((prev) => ({ ...prev, strategy }));
  }, [strategy]);

  // Check Ollama status
  const checkOllama = useCallback(async () => {
    try {
      const status = await checkOllamaStatus(cfg.llm.host);
      setOllamaStatus(status);
      setOllamaModels(status.models);
      if (status.models.length > 0 && !status.models.includes(cfg.llm.model)) {
        setCfg((prev) => ({
          ...prev,
          llm: { ...prev.llm, model: status.models[0] },
        }));
      }
    } catch {
      setOllamaStatus({ available: false, host: cfg.llm.host, models: [] });
    }
  }, [cfg.llm.host, cfg.llm.model]);

  useEffect(() => {
    checkOllama();
  }, []);

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logLines]);

  // Run enrichment
  const handleRun = useCallback(async () => {
    if (!selectedCol) return;
    setIsRunning(true);
    setLogLines([]);
    setProgress(0);

    await startEnrichmentFetch(
      { ...cfg, source_collection: selectedCol, strategy },
      (line) => {
        if (line.startsWith("__PROGRESS__=")) {
          setProgress(parseInt(line.split("=")[1], 10));
        } else {
          setLogLines((prev) => [...prev, line]);
        }
      },
      () => {
        setIsRunning(false);
        setProgress(100);
      },
      (err) => {
        setLogLines((prev) => [...prev, `❌ ${err.message}`]);
        setIsRunning(false);
      }
    );
  }, [cfg, selectedCol, strategy]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
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
          <span className="panel__title">🧠 Enrichment Config</span>
        </div>

        <div className="panel__body" style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Source collection */}
          <section>
            <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--c-text-3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
              Source Collection
            </div>
            <select
              id="enrich-source-collection"
              value={selectedCol}
              onChange={(e) => setSelectedCol(e.target.value)}
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
              {collections.length === 0 && (
                <option value="">No collections yet — run Step 2 first</option>
              )}
              {collections.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.points_count} pts)
                </option>
              ))}
            </select>
          </section>

          {/* LLM config */}
          <section>
            <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--c-text-3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
              LLM (Ollama)
              <OllamaStatusBadge status={ollamaStatus} />
              <button
                onClick={checkOllama}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--c-text-3)", fontSize: "0.8rem", marginLeft: "auto" }}
                title="Refresh Ollama status"
              >
                ↺
              </button>
            </div>

            {!ollamaStatus?.available && (
              <div style={{ fontSize: "0.72rem", color: "var(--c-text-3)", background: "var(--c-bg-2)", border: "1px solid var(--c-border)", borderRadius: 6, padding: "8px 10px", marginBottom: 8 }}>
                Ollama is not running. Install from{" "}
                <a href="https://ollama.com/download" target="_blank" rel="noreferrer" style={{ color: "var(--c-accent)" }}>
                  ollama.com
                </a>
                , then run <code style={{ color: "var(--c-accent)" }}>ollama serve</code>.
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div>
                <label style={{ fontSize: "0.7rem", color: "var(--c-text-3)", display: "block", marginBottom: 2 }}>
                  Model
                </label>
                {ollamaModels.length > 0 ? (
                  <select
                    id="enrich-ollama-model"
                    value={cfg.llm.model}
                    onChange={(e) => setCfg((p) => ({ ...p, llm: { ...p.llm, model: e.target.value } }))}
                    style={{
                      width: "100%", padding: "4px 6px",
                      background: "var(--c-bg-2)", border: "1px solid var(--c-border)",
                      borderRadius: 4, color: "var(--c-text-1)", fontSize: "0.8rem",
                    }}
                  >
                    {ollamaModels.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                ) : (
                  <input
                    id="enrich-ollama-model-input"
                    value={cfg.llm.model}
                    onChange={(e) => setCfg((p) => ({ ...p, llm: { ...p.llm, model: e.target.value } }))}
                    placeholder="e.g. llama3.2"
                    style={{
                      width: "100%", padding: "4px 6px",
                      background: "var(--c-bg-2)", border: "1px solid var(--c-border)",
                      borderRadius: 4, color: "var(--c-text-1)", fontSize: "0.8rem",
                    }}
                  />
                )}
              </div>
              <div>
                <label style={{ fontSize: "0.7rem", color: "var(--c-text-3)", display: "block", marginBottom: 2 }}>
                  Host
                </label>
                <input
                  id="enrich-ollama-host"
                  value={cfg.llm.host}
                  onChange={(e) => setCfg((p) => ({ ...p, llm: { ...p.llm, host: e.target.value } }))}
                  style={{
                    width: "100%", padding: "4px 6px",
                    background: "var(--c-bg-2)", border: "1px solid var(--c-border)",
                    borderRadius: 4, color: "var(--c-text-1)", fontSize: "0.8rem", fontFamily: "var(--font-mono)",
                  }}
                />
              </div>
            </div>
          </section>

          {/* Strategy-specific options */}
          {strategy === "parent_child" && (
            <section>
              <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--c-text-3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
                Parent-Child Options
              </div>
              <NumberRow
                label="Grouping heading level"
                paramKey="grouping_level"
                value={cfg.parent_child_options.grouping_level}
                onChange={(v) => setCfg((p) => ({ ...p, parent_child_options: { ...p.parent_child_options, grouping_level: v } }))}
                min={1} max={4}
                tooltip="Which heading depth to group by. 1 = top-level chapters."
              />
              <NumberRow
                label="Summary max tokens"
                paramKey="summary_max_tokens"
                value={cfg.parent_child_options.summary_max_tokens}
                onChange={(v) => setCfg((p) => ({ ...p, parent_child_options: { ...p.parent_child_options, summary_max_tokens: v } }))}
                min={64} max={1024}
                tooltip="Target length for each generated parent summary."
              />
              <ToggleRow
                label="Embed summaries"
                paramKey="embed_summaries"
                value={cfg.parent_child_options.embed_summaries}
                onChange={(v) => setCfg((p) => ({ ...p, parent_child_options: { ...p.parent_child_options, embed_summaries: v } }))}
                tooltip="Vectorise and store each parent summary in Qdrant."
              />
              <ToggleRow
                label="Link children to parents"
                paramKey="link_children"
                value={cfg.parent_child_options.link_children}
                onChange={(v) => setCfg((p) => ({ ...p, parent_child_options: { ...p.parent_child_options, link_children: v } }))}
                tooltip="Add parent_id to each child chunk payload."
              />
            </section>
          )}

          {strategy === "raptor" && (
            <section>
              <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--c-text-3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
                RAPTOR Options
              </div>
              <NumberRow
                label="Max abstraction levels"
                paramKey="max_levels"
                value={cfg.raptor_options.max_levels}
                onChange={(v) => setCfg((p) => ({ ...p, raptor_options: { ...p.raptor_options, max_levels: v } }))}
                min={1} max={6}
                tooltip="How many recursive summarisation levels to build."
              />
              <NumberRow
                label="UMAP components"
                paramKey="umap_n_components"
                value={cfg.raptor_options.umap_n_components}
                onChange={(v) => setCfg((p) => ({ ...p, raptor_options: { ...p.raptor_options, umap_n_components: v } }))}
                min={2} max={10}
                tooltip="Reduce vectors to N dimensions before clustering."
              />
              <NumberRow
                label="UMAP neighbors"
                paramKey="umap_n_neighbors"
                value={cfg.raptor_options.umap_n_neighbors}
                onChange={(v) => setCfg((p) => ({ ...p, raptor_options: { ...p.raptor_options, umap_n_neighbors: v } }))}
                min={5} max={50}
                tooltip="Controls local vs. global structure in UMAP."
              />
              <NumberRow
                label="GMM clusters (0 = auto)"
                paramKey="gmm_n_components"
                value={cfg.raptor_options.gmm_n_components}
                onChange={(v) => setCfg((p) => ({ ...p, raptor_options: { ...p.raptor_options, gmm_n_components: v } }))}
                min={0} max={50}
                tooltip="0 = auto-detect with BIC. Set manually to override."
              />
              <NumberRow
                label="Summary max tokens"
                paramKey="summary_max_tokens"
                value={cfg.raptor_options.summary_max_tokens}
                onChange={(v) => setCfg((p) => ({ ...p, raptor_options: { ...p.raptor_options, summary_max_tokens: v } }))}
                min={64} max={1024}
              />
            </section>
          )}

          {strategy === "graph_rag" && (
            <section>
              <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--c-text-3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
                GraphRAG Options
              </div>
              <div style={{ padding: "6px 0", borderBottom: "1px solid var(--c-border)" }}>
                <code style={{ fontSize: "0.68rem", color: "var(--c-accent)" }}>graph_backend</code>
                <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                  {(["networkx", "neo4j"] as const).map((b) => (
                    <button
                      key={b}
                      onClick={() => setCfg((p) => ({ ...p, graph_rag_options: { ...p.graph_rag_options, graph_backend: b } }))}
                      style={{
                        padding: "3px 10px",
                        borderRadius: 4,
                        border: `1px solid ${cfg.graph_rag_options.graph_backend === b ? "var(--c-accent)" : "var(--c-border)"}`,
                        background: cfg.graph_rag_options.graph_backend === b ? "var(--c-accent)" : "var(--c-bg-2)",
                        color: cfg.graph_rag_options.graph_backend === b ? "var(--c-bg-1)" : "var(--c-text-2)",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                      }}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
              <NumberRow
                label="Max entities per chunk"
                paramKey="max_entities_per_chunk"
                value={cfg.graph_rag_options.max_entities_per_chunk}
                onChange={(v) => setCfg((p) => ({ ...p, graph_rag_options: { ...p.graph_rag_options, max_entities_per_chunk: v } }))}
                min={1} max={30}
              />
              <ToggleRow
                label="Run community detection"
                paramKey="run_community_detection"
                value={cfg.graph_rag_options.run_community_detection}
                onChange={(v) => setCfg((p) => ({ ...p, graph_rag_options: { ...p.graph_rag_options, run_community_detection: v } }))}
                tooltip="Run Louvain algorithm and create community summaries."
              />
              {cfg.graph_rag_options.graph_backend === "neo4j" && (
                <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                  {(["neo4j_uri", "neo4j_user", "neo4j_password"] as const).map((k) => (
                    <input
                      key={k}
                      placeholder={k}
                      type={k === "neo4j_password" ? "password" : "text"}
                      value={cfg.graph_rag_options[k]}
                      onChange={(e) => setCfg((p) => ({ ...p, graph_rag_options: { ...p.graph_rag_options, [k]: e.target.value } }))}
                      style={{
                        width: "100%", padding: "4px 6px",
                        background: "var(--c-bg-2)", border: "1px solid var(--c-border)",
                        borderRadius: 4, color: "var(--c-text-1)", fontSize: "0.75rem", fontFamily: "var(--font-mono)",
                      }}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Output suffix */}
          <section>
            <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--c-text-3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
              Output Collection
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--c-text-3)", marginBottom: 6 }}>
              Suffix (leave empty for default: <code style={{ color: "var(--c-accent)" }}>_{strategy === "parent_child" ? "parentchild" : strategy}</code>)
            </div>
            <input
              id="enrich-output-suffix"
              value={cfg.output_collection_suffix}
              onChange={(e) => setCfg((p) => ({ ...p, output_collection_suffix: e.target.value }))}
              placeholder={`_${strategy === "parent_child" ? "parentchild" : strategy}`}
              style={{
                width: "100%", padding: "4px 6px",
                background: "var(--c-bg-2)", border: "1px solid var(--c-border)",
                borderRadius: 4, color: "var(--c-text-1)", fontSize: "0.8rem", fontFamily: "var(--font-mono)",
              }}
            />
            {selectedCol && (
              <div style={{ fontSize: "0.68rem", color: "var(--c-text-3)", marginTop: 4 }}>
                → {selectedCol}{cfg.output_collection_suffix || `_${strategy === "parent_child" ? "parentchild" : strategy}`}
              </div>
            )}
          </section>

        </div>
      </aside>

      {/* ── MAIN AREA ────────────────────────────────────────────────────── */}
      <main
        className="panel"
        style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}
      >
        <div className="panel__header">
          <span className="panel__title">🧠 Step 4: Enrich Collection</span>
          {selectedCol && (
            <span style={{ marginLeft: 10, fontSize: "0.72rem", color: "var(--c-text-3)" }}>
              Source: <strong style={{ color: "var(--c-text-2)" }}>{selectedCol}</strong>
            </span>
          )}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Strategy cards */}
          <section>
            <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--c-text-3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
              Choose Enrichment Strategy
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              {STRATEGIES.map((s) => (
                <div
                  key={s.id}
                  id={`enrich-strategy-${s.id}`}
                  onClick={() => setStrategy(s.id)}
                  style={{
                    padding: "16px",
                    borderRadius: 10,
                    border: `1.5px solid ${strategy === s.id ? "var(--c-accent)" : "var(--c-border)"}`,
                    background: strategy === s.id ? "var(--c-accent-bg, rgba(99,102,241,0.08))" : "var(--c-bg-2)",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  <div style={{ fontSize: "1.6rem", lineHeight: 1 }}>{s.icon}</div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--c-text-1)" }}>{s.title}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--c-accent)", fontWeight: 500 }}>{s.subtitle}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--c-text-3)", lineHeight: 1.5 }}>{s.description}</div>
                  <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: "0.65rem", color: "var(--c-text-3)" }}>Complexity:</span>
                    <ComplexityStars n={s.complexity} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Run button + progress */}
          <section>
            <button
              id="enrich-run-btn"
              className="run-btn"
              disabled={isRunning || !selectedCol || !ollamaStatus?.available}
              onClick={handleRun}
              style={{ minWidth: 200, fontSize: "0.9rem", padding: "10px 24px" }}
            >
              {isRunning ? "⏳ Running enrichment…" : `▶ Run ${STRATEGIES.find((s) => s.id === strategy)?.title}`}
            </button>
            {!ollamaStatus?.available && (
              <span style={{ marginLeft: 12, fontSize: "0.72rem", color: "var(--c-error, #f87171)" }}>
                Ollama must be running to start enrichment
              </span>
            )}

            {/* Progress bar */}
            {(isRunning || progress > 0) && (
              <div style={{ marginTop: 12, height: 6, borderRadius: 3, background: "var(--c-bg-3)", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${progress}%`,
                    background: "var(--c-accent)",
                    transition: "width 0.3s",
                    borderRadius: 3,
                  }}
                />
              </div>
            )}
          </section>

          {/* Live log */}
          {logLines.length > 0 && (
            <section style={{ flex: 1 }}>
              <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--c-text-3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                Live Log
              </div>
              <div
                ref={logRef}
                style={{
                  background: "var(--c-bg-1)",
                  border: "1px solid var(--c-border)",
                  borderRadius: 8,
                  padding: "12px 14px",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                  color: "var(--c-text-2)",
                  maxHeight: 380,
                  overflowY: "auto",
                  lineHeight: 1.7,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {logLines.map((line, i) => {
                  const isError = line.includes("❌") || line.includes("[ERROR]");
                  const isWarn  = line.includes("⚠️");
                  const isOk    = line.includes("✅") || line.includes("🏁");
                  return (
                    <div
                      key={i}
                      style={{
                        color: isError ? "var(--c-error, #f87171)"
                          : isWarn ? "var(--c-warning, #fbbf24)"
                          : isOk   ? "var(--c-success, #4ade80)"
                          : undefined,
                      }}
                    >
                      {line}
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
