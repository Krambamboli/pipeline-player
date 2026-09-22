(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/app/enrich/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>EnrichPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * Step 4: Enrich Collection
 * --------------------------
 * Lets the user pick an existing Qdrant collection, choose an enrichment
 * strategy (Parent-Child / RAPTOR / GraphRAG), configure LLM + strategy
 * options, and run the enrichment pipeline while watching a live log.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$qdrant$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/qdrant.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$enrich$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/enrich.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
// ---------------------------------------------------------------------------
// Strategy card definitions
// ---------------------------------------------------------------------------
const STRATEGIES = [
    {
        id: "parent_child",
        icon: "🌿",
        title: "Parent-Child",
        subtitle: "Heading-based summarisation",
        description: "Groups child chunks by heading hierarchy. Calls an LLM to summarise each section. Stores parent summaries alongside the children in a new collection — ideal for documents with clear chapter structure.",
        complexity: 2
    },
    {
        id: "raptor",
        icon: "🦕",
        title: "RAPTOR",
        subtitle: "Recursive semantic abstraction",
        description: "Reduces vectors with UMAP, clusters them with a Gaussian Mixture Model, summarises each cluster, then repeats recursively — building a tree of abstractions from leaves up to a single root summary.",
        complexity: 3
    },
    {
        id: "graph_rag",
        icon: "🕸️",
        title: "GraphRAG",
        subtitle: "Knowledge graph + community detection",
        description: "Extracts named entities and relationships from every chunk. Builds a knowledge graph (NetworkX or Neo4j), runs Louvain community detection, and generates community-level summaries.",
        complexity: 4
    }
];
// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function ComplexityStars({ n }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        style: {
            fontSize: "0.7rem",
            color: "var(--c-text-3)",
            letterSpacing: 2
        },
        children: [
            "★".repeat(n),
            "☆".repeat(4 - n)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/enrich/page.tsx",
        lineNumber: 68,
        columnNumber: 5
    }, this);
}
_c = ComplexityStars;
function OllamaStatusBadge({ status }) {
    if (!status) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        style: {
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            fontSize: "0.72rem",
            padding: "2px 8px",
            borderRadius: 4,
            background: status.available ? "var(--c-success-bg, #1a3a1a)" : "var(--c-error-bg, #3a1a1a)",
            color: status.available ? "var(--c-success, #4ade80)" : "var(--c-error, #f87171)",
            border: `1px solid ${status.available ? "var(--c-success, #4ade80)" : "var(--c-error, #f87171)"}`
        },
        children: status.available ? "✓ Ollama running" : "✗ Ollama offline"
    }, void 0, false, {
        fileName: "[project]/src/app/enrich/page.tsx",
        lineNumber: 77,
        columnNumber: 5
    }, this);
}
_c1 = OllamaStatusBadge;
// Simple number input row
function NumberRow({ label, paramKey, value, onChange, min, max, tooltip }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 0",
            borderBottom: "1px solid var(--c-border)"
        },
        title: tooltip,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                style: {
                    fontSize: "0.68rem",
                    color: "var(--c-accent)",
                    minWidth: 0,
                    flex: "0 0 auto"
                },
                children: paramKey
            }, void 0, false, {
                fileName: "[project]/src/app/enrich/page.tsx",
                lineNumber: 124,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                style: {
                    flex: 1,
                    fontSize: "0.78rem",
                    color: "var(--c-text-2)"
                },
                children: label
            }, void 0, false, {
                fileName: "[project]/src/app/enrich/page.tsx",
                lineNumber: 127,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                type: "number",
                value: value,
                min: min,
                max: max,
                onChange: (e)=>onChange(Number(e.target.value)),
                style: {
                    width: 72,
                    padding: "2px 6px",
                    background: "var(--c-bg-2)",
                    border: "1px solid var(--c-border)",
                    borderRadius: 4,
                    color: "var(--c-text-1)",
                    fontSize: "0.8rem",
                    textAlign: "right"
                }
            }, void 0, false, {
                fileName: "[project]/src/app/enrich/page.tsx",
                lineNumber: 128,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/enrich/page.tsx",
        lineNumber: 114,
        columnNumber: 5
    }, this);
}
_c2 = NumberRow;
function ToggleRow({ label, paramKey, value, onChange, tooltip }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 0",
            borderBottom: "1px solid var(--c-border)",
            cursor: "pointer"
        },
        title: tooltip,
        onClick: ()=>onChange(!value),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                style: {
                    fontSize: "0.68rem",
                    color: "var(--c-accent)",
                    minWidth: 0,
                    flex: "0 0 auto"
                },
                children: paramKey
            }, void 0, false, {
                fileName: "[project]/src/app/enrich/page.tsx",
                lineNumber: 175,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                style: {
                    flex: 1,
                    fontSize: "0.78rem",
                    color: "var(--c-text-2)"
                },
                children: label
            }, void 0, false, {
                fileName: "[project]/src/app/enrich/page.tsx",
                lineNumber: 178,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    width: 36,
                    height: 20,
                    borderRadius: 10,
                    background: value ? "var(--c-accent)" : "var(--c-bg-3)",
                    position: "relative",
                    transition: "background 0.2s",
                    flexShrink: 0
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        position: "absolute",
                        top: 2,
                        left: value ? 18 : 2,
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        background: "white",
                        transition: "left 0.2s"
                    }
                }, void 0, false, {
                    fileName: "[project]/src/app/enrich/page.tsx",
                    lineNumber: 190,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/enrich/page.tsx",
                lineNumber: 179,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/enrich/page.tsx",
        lineNumber: 163,
        columnNumber: 5
    }, this);
}
_c3 = ToggleRow;
function EnrichPage() {
    _s();
    const [collections, setCollections] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [selectedCol, setSelectedCol] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [strategy, setStrategy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("parent_child");
    const [cfg, setCfg] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$enrich$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["defaultEnrichmentConfig"])(""));
    const [ollamaStatus, setOllamaStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [ollamaModels, setOllamaModels] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isRunning, setIsRunning] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [logLines, setLogLines] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [progress, setProgress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const logRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Load collections on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "EnrichPage.useEffect": ()=>{
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$qdrant$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["listCollections"])().then({
                "EnrichPage.useEffect": (cols)=>{
                    setCollections(cols);
                    if (cols.length > 0) {
                        setSelectedCol(cols[0].name);
                    }
                }
            }["EnrichPage.useEffect"]).catch(console.error);
        }
    }["EnrichPage.useEffect"], []);
    // Keep cfg in sync when selectedCol changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "EnrichPage.useEffect": ()=>{
            setCfg({
                "EnrichPage.useEffect": (prev)=>({
                        ...prev,
                        source_collection: selectedCol
                    })
            }["EnrichPage.useEffect"]);
        }
    }["EnrichPage.useEffect"], [
        selectedCol
    ]);
    // Keep cfg in sync when strategy changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "EnrichPage.useEffect": ()=>{
            setCfg({
                "EnrichPage.useEffect": (prev)=>({
                        ...prev,
                        strategy
                    })
            }["EnrichPage.useEffect"]);
        }
    }["EnrichPage.useEffect"], [
        strategy
    ]);
    // Check Ollama status
    const checkOllama = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "EnrichPage.useCallback[checkOllama]": async ()=>{
            try {
                const status = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$enrich$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["checkOllamaStatus"])(cfg.llm.host);
                setOllamaStatus(status);
                setOllamaModels(status.models);
                if (status.models.length > 0 && !status.models.includes(cfg.llm.model)) {
                    setCfg({
                        "EnrichPage.useCallback[checkOllama]": (prev)=>({
                                ...prev,
                                llm: {
                                    ...prev.llm,
                                    model: status.models[0]
                                }
                            })
                    }["EnrichPage.useCallback[checkOllama]"]);
                }
            } catch  {
                setOllamaStatus({
                    available: false,
                    host: cfg.llm.host,
                    models: []
                });
            }
        }
    }["EnrichPage.useCallback[checkOllama]"], [
        cfg.llm.host,
        cfg.llm.model
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "EnrichPage.useEffect": ()=>{
            checkOllama();
        }
    }["EnrichPage.useEffect"], []);
    // Auto-scroll log
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "EnrichPage.useEffect": ()=>{
            if (logRef.current) {
                logRef.current.scrollTop = logRef.current.scrollHeight;
            }
        }
    }["EnrichPage.useEffect"], [
        logLines
    ]);
    // Run enrichment
    const handleRun = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "EnrichPage.useCallback[handleRun]": async ()=>{
            if (!selectedCol) return;
            setIsRunning(true);
            setLogLines([]);
            setProgress(0);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$enrich$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["startEnrichmentFetch"])({
                ...cfg,
                source_collection: selectedCol,
                strategy
            }, {
                "EnrichPage.useCallback[handleRun]": (line)=>{
                    if (line.startsWith("__PROGRESS__=")) {
                        setProgress(parseInt(line.split("=")[1], 10));
                    } else {
                        setLogLines({
                            "EnrichPage.useCallback[handleRun]": (prev)=>[
                                    ...prev,
                                    line
                                ]
                        }["EnrichPage.useCallback[handleRun]"]);
                    }
                }
            }["EnrichPage.useCallback[handleRun]"], {
                "EnrichPage.useCallback[handleRun]": ()=>{
                    setIsRunning(false);
                    setProgress(100);
                }
            }["EnrichPage.useCallback[handleRun]"], {
                "EnrichPage.useCallback[handleRun]": (err)=>{
                    setLogLines({
                        "EnrichPage.useCallback[handleRun]": (prev)=>[
                                ...prev,
                                `❌ ${err.message}`
                            ]
                    }["EnrichPage.useCallback[handleRun]"]);
                    setIsRunning(false);
                }
            }["EnrichPage.useCallback[handleRun]"]);
        }
    }["EnrichPage.useCallback[handleRun]"], [
        cfg,
        selectedCol,
        strategy
    ]);
    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: "flex",
            height: "100%",
            gap: 0,
            overflow: "hidden"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                className: "panel",
                style: {
                    width: 320,
                    flexShrink: 0,
                    borderRight: "1px solid var(--c-border)",
                    overflowY: "auto"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "panel__header",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "panel__title",
                            children: "🧠 Enrichment Config"
                        }, void 0, false, {
                            fileName: "[project]/src/app/enrich/page.tsx",
                            lineNumber: 317,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/enrich/page.tsx",
                        lineNumber: 316,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "panel__body",
                        style: {
                            padding: "12px 14px",
                            display: "flex",
                            flexDirection: "column",
                            gap: 18
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: "0.7rem",
                                            fontWeight: 600,
                                            color: "var(--c-text-3)",
                                            textTransform: "uppercase",
                                            letterSpacing: 1,
                                            marginBottom: 6
                                        },
                                        children: "Source Collection"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/enrich/page.tsx",
                                        lineNumber: 324,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        id: "enrich-source-collection",
                                        value: selectedCol,
                                        onChange: (e)=>setSelectedCol(e.target.value),
                                        style: {
                                            width: "100%",
                                            padding: "6px 8px",
                                            background: "var(--c-bg-2)",
                                            border: "1px solid var(--c-border)",
                                            borderRadius: 6,
                                            color: "var(--c-text-1)",
                                            fontSize: "0.8rem"
                                        },
                                        children: [
                                            collections.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "",
                                                children: "No collections yet — run Step 2 first"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/enrich/page.tsx",
                                                lineNumber: 342,
                                                columnNumber: 17
                                            }, this),
                                            collections.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: c.name,
                                                    children: [
                                                        c.name,
                                                        " (",
                                                        c.points_count,
                                                        " pts)"
                                                    ]
                                                }, c.name, true, {
                                                    fileName: "[project]/src/app/enrich/page.tsx",
                                                    lineNumber: 345,
                                                    columnNumber: 17
                                                }, this))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/enrich/page.tsx",
                                        lineNumber: 327,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/enrich/page.tsx",
                                lineNumber: 323,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: "0.7rem",
                                            fontWeight: 600,
                                            color: "var(--c-text-3)",
                                            textTransform: "uppercase",
                                            letterSpacing: 1,
                                            marginBottom: 6,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8
                                        },
                                        children: [
                                            "LLM (Ollama)",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(OllamaStatusBadge, {
                                                status: ollamaStatus
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/enrich/page.tsx",
                                                lineNumber: 356,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: checkOllama,
                                                style: {
                                                    background: "none",
                                                    border: "none",
                                                    cursor: "pointer",
                                                    color: "var(--c-text-3)",
                                                    fontSize: "0.8rem",
                                                    marginLeft: "auto"
                                                },
                                                title: "Refresh Ollama status",
                                                children: "↺"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/enrich/page.tsx",
                                                lineNumber: 357,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/enrich/page.tsx",
                                        lineNumber: 354,
                                        columnNumber: 13
                                    }, this),
                                    !ollamaStatus?.available && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: "0.72rem",
                                            color: "var(--c-text-3)",
                                            background: "var(--c-bg-2)",
                                            border: "1px solid var(--c-border)",
                                            borderRadius: 6,
                                            padding: "8px 10px",
                                            marginBottom: 8
                                        },
                                        children: [
                                            "Ollama is not running. Install from",
                                            " ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                href: "https://ollama.com/download",
                                                target: "_blank",
                                                rel: "noreferrer",
                                                style: {
                                                    color: "var(--c-accent)"
                                                },
                                                children: "ollama.com"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/enrich/page.tsx",
                                                lineNumber: 369,
                                                columnNumber: 17
                                            }, this),
                                            ", then run ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                                style: {
                                                    color: "var(--c-accent)"
                                                },
                                                children: "ollama serve"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/enrich/page.tsx",
                                                lineNumber: 372,
                                                columnNumber: 28
                                            }, this),
                                            "."
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/enrich/page.tsx",
                                        lineNumber: 367,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 6
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        style: {
                                                            fontSize: "0.7rem",
                                                            color: "var(--c-text-3)",
                                                            display: "block",
                                                            marginBottom: 2
                                                        },
                                                        children: "Model"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/enrich/page.tsx",
                                                        lineNumber: 378,
                                                        columnNumber: 17
                                                    }, this),
                                                    ollamaModels.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                        id: "enrich-ollama-model",
                                                        value: cfg.llm.model,
                                                        onChange: (e)=>setCfg((p)=>({
                                                                    ...p,
                                                                    llm: {
                                                                        ...p.llm,
                                                                        model: e.target.value
                                                                    }
                                                                })),
                                                        style: {
                                                            width: "100%",
                                                            padding: "4px 6px",
                                                            background: "var(--c-bg-2)",
                                                            border: "1px solid var(--c-border)",
                                                            borderRadius: 4,
                                                            color: "var(--c-text-1)",
                                                            fontSize: "0.8rem"
                                                        },
                                                        children: ollamaModels.map((m)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: m,
                                                                children: m
                                                            }, m, false, {
                                                                fileName: "[project]/src/app/enrich/page.tsx",
                                                                lineNumber: 392,
                                                                columnNumber: 46
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/enrich/page.tsx",
                                                        lineNumber: 382,
                                                        columnNumber: 19
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        id: "enrich-ollama-model-input",
                                                        value: cfg.llm.model,
                                                        onChange: (e)=>setCfg((p)=>({
                                                                    ...p,
                                                                    llm: {
                                                                        ...p.llm,
                                                                        model: e.target.value
                                                                    }
                                                                })),
                                                        placeholder: "e.g. llama3.2",
                                                        style: {
                                                            width: "100%",
                                                            padding: "4px 6px",
                                                            background: "var(--c-bg-2)",
                                                            border: "1px solid var(--c-border)",
                                                            borderRadius: 4,
                                                            color: "var(--c-text-1)",
                                                            fontSize: "0.8rem"
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/enrich/page.tsx",
                                                        lineNumber: 395,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/enrich/page.tsx",
                                                lineNumber: 377,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        style: {
                                                            fontSize: "0.7rem",
                                                            color: "var(--c-text-3)",
                                                            display: "block",
                                                            marginBottom: 2
                                                        },
                                                        children: "Host"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/enrich/page.tsx",
                                                        lineNumber: 409,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        id: "enrich-ollama-host",
                                                        value: cfg.llm.host,
                                                        onChange: (e)=>setCfg((p)=>({
                                                                    ...p,
                                                                    llm: {
                                                                        ...p.llm,
                                                                        host: e.target.value
                                                                    }
                                                                })),
                                                        style: {
                                                            width: "100%",
                                                            padding: "4px 6px",
                                                            background: "var(--c-bg-2)",
                                                            border: "1px solid var(--c-border)",
                                                            borderRadius: 4,
                                                            color: "var(--c-text-1)",
                                                            fontSize: "0.8rem",
                                                            fontFamily: "var(--font-mono)"
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/enrich/page.tsx",
                                                        lineNumber: 412,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/enrich/page.tsx",
                                                lineNumber: 408,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/enrich/page.tsx",
                                        lineNumber: 376,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/enrich/page.tsx",
                                lineNumber: 353,
                                columnNumber: 11
                            }, this),
                            strategy === "parent_child" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: "0.7rem",
                                            fontWeight: 600,
                                            color: "var(--c-text-3)",
                                            textTransform: "uppercase",
                                            letterSpacing: 1,
                                            marginBottom: 6
                                        },
                                        children: "Parent-Child Options"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/enrich/page.tsx",
                                        lineNumber: 429,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(NumberRow, {
                                        label: "Grouping heading level",
                                        paramKey: "grouping_level",
                                        value: cfg.parent_child_options.grouping_level,
                                        onChange: (v)=>setCfg((p)=>({
                                                    ...p,
                                                    parent_child_options: {
                                                        ...p.parent_child_options,
                                                        grouping_level: v
                                                    }
                                                })),
                                        min: 1,
                                        max: 4,
                                        tooltip: "Which heading depth to group by. 1 = top-level chapters."
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/enrich/page.tsx",
                                        lineNumber: 432,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(NumberRow, {
                                        label: "Summary max tokens",
                                        paramKey: "summary_max_tokens",
                                        value: cfg.parent_child_options.summary_max_tokens,
                                        onChange: (v)=>setCfg((p)=>({
                                                    ...p,
                                                    parent_child_options: {
                                                        ...p.parent_child_options,
                                                        summary_max_tokens: v
                                                    }
                                                })),
                                        min: 64,
                                        max: 1024,
                                        tooltip: "Target length for each generated parent summary."
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/enrich/page.tsx",
                                        lineNumber: 440,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ToggleRow, {
                                        label: "Embed summaries",
                                        paramKey: "embed_summaries",
                                        value: cfg.parent_child_options.embed_summaries,
                                        onChange: (v)=>setCfg((p)=>({
                                                    ...p,
                                                    parent_child_options: {
                                                        ...p.parent_child_options,
                                                        embed_summaries: v
                                                    }
                                                })),
                                        tooltip: "Vectorise and store each parent summary in Qdrant."
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/enrich/page.tsx",
                                        lineNumber: 448,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ToggleRow, {
                                        label: "Link children to parents",
                                        paramKey: "link_children",
                                        value: cfg.parent_child_options.link_children,
                                        onChange: (v)=>setCfg((p)=>({
                                                    ...p,
                                                    parent_child_options: {
                                                        ...p.parent_child_options,
                                                        link_children: v
                                                    }
                                                })),
                                        tooltip: "Add parent_id to each child chunk payload."
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/enrich/page.tsx",
                                        lineNumber: 455,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/enrich/page.tsx",
                                lineNumber: 428,
                                columnNumber: 13
                            }, this),
                            strategy === "raptor" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: "0.7rem",
                                            fontWeight: 600,
                                            color: "var(--c-text-3)",
                                            textTransform: "uppercase",
                                            letterSpacing: 1,
                                            marginBottom: 6
                                        },
                                        children: "RAPTOR Options"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/enrich/page.tsx",
                                        lineNumber: 467,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(NumberRow, {
                                        label: "Max abstraction levels",
                                        paramKey: "max_levels",
                                        value: cfg.raptor_options.max_levels,
                                        onChange: (v)=>setCfg((p)=>({
                                                    ...p,
                                                    raptor_options: {
                                                        ...p.raptor_options,
                                                        max_levels: v
                                                    }
                                                })),
                                        min: 1,
                                        max: 6,
                                        tooltip: "How many recursive summarisation levels to build."
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/enrich/page.tsx",
                                        lineNumber: 470,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(NumberRow, {
                                        label: "UMAP components",
                                        paramKey: "umap_n_components",
                                        value: cfg.raptor_options.umap_n_components,
                                        onChange: (v)=>setCfg((p)=>({
                                                    ...p,
                                                    raptor_options: {
                                                        ...p.raptor_options,
                                                        umap_n_components: v
                                                    }
                                                })),
                                        min: 2,
                                        max: 10,
                                        tooltip: "Reduce vectors to N dimensions before clustering."
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/enrich/page.tsx",
                                        lineNumber: 478,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(NumberRow, {
                                        label: "UMAP neighbors",
                                        paramKey: "umap_n_neighbors",
                                        value: cfg.raptor_options.umap_n_neighbors,
                                        onChange: (v)=>setCfg((p)=>({
                                                    ...p,
                                                    raptor_options: {
                                                        ...p.raptor_options,
                                                        umap_n_neighbors: v
                                                    }
                                                })),
                                        min: 5,
                                        max: 50,
                                        tooltip: "Controls local vs. global structure in UMAP."
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/enrich/page.tsx",
                                        lineNumber: 486,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(NumberRow, {
                                        label: "GMM clusters (0 = auto)",
                                        paramKey: "gmm_n_components",
                                        value: cfg.raptor_options.gmm_n_components,
                                        onChange: (v)=>setCfg((p)=>({
                                                    ...p,
                                                    raptor_options: {
                                                        ...p.raptor_options,
                                                        gmm_n_components: v
                                                    }
                                                })),
                                        min: 0,
                                        max: 50,
                                        tooltip: "0 = auto-detect with BIC. Set manually to override."
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/enrich/page.tsx",
                                        lineNumber: 494,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(NumberRow, {
                                        label: "Summary max tokens",
                                        paramKey: "summary_max_tokens",
                                        value: cfg.raptor_options.summary_max_tokens,
                                        onChange: (v)=>setCfg((p)=>({
                                                    ...p,
                                                    raptor_options: {
                                                        ...p.raptor_options,
                                                        summary_max_tokens: v
                                                    }
                                                })),
                                        min: 64,
                                        max: 1024
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/enrich/page.tsx",
                                        lineNumber: 502,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/enrich/page.tsx",
                                lineNumber: 466,
                                columnNumber: 13
                            }, this),
                            strategy === "graph_rag" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: "0.7rem",
                                            fontWeight: 600,
                                            color: "var(--c-text-3)",
                                            textTransform: "uppercase",
                                            letterSpacing: 1,
                                            marginBottom: 6
                                        },
                                        children: "GraphRAG Options"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/enrich/page.tsx",
                                        lineNumber: 514,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            padding: "6px 0",
                                            borderBottom: "1px solid var(--c-border)"
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                                style: {
                                                    fontSize: "0.68rem",
                                                    color: "var(--c-accent)"
                                                },
                                                children: "graph_backend"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/enrich/page.tsx",
                                                lineNumber: 518,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: "flex",
                                                    gap: 6,
                                                    marginTop: 4
                                                },
                                                children: [
                                                    "networkx",
                                                    "neo4j"
                                                ].map((b)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>setCfg((p)=>({
                                                                    ...p,
                                                                    graph_rag_options: {
                                                                        ...p.graph_rag_options,
                                                                        graph_backend: b
                                                                    }
                                                                })),
                                                        style: {
                                                            padding: "3px 10px",
                                                            borderRadius: 4,
                                                            border: `1px solid ${cfg.graph_rag_options.graph_backend === b ? "var(--c-accent)" : "var(--c-border)"}`,
                                                            background: cfg.graph_rag_options.graph_backend === b ? "var(--c-accent)" : "var(--c-bg-2)",
                                                            color: cfg.graph_rag_options.graph_backend === b ? "var(--c-bg-1)" : "var(--c-text-2)",
                                                            fontSize: "0.75rem",
                                                            cursor: "pointer"
                                                        },
                                                        children: b
                                                    }, b, false, {
                                                        fileName: "[project]/src/app/enrich/page.tsx",
                                                        lineNumber: 521,
                                                        columnNumber: 21
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/enrich/page.tsx",
                                                lineNumber: 519,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/enrich/page.tsx",
                                        lineNumber: 517,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(NumberRow, {
                                        label: "Max entities per chunk",
                                        paramKey: "max_entities_per_chunk",
                                        value: cfg.graph_rag_options.max_entities_per_chunk,
                                        onChange: (v)=>setCfg((p)=>({
                                                    ...p,
                                                    graph_rag_options: {
                                                        ...p.graph_rag_options,
                                                        max_entities_per_chunk: v
                                                    }
                                                })),
                                        min: 1,
                                        max: 30
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/enrich/page.tsx",
                                        lineNumber: 539,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ToggleRow, {
                                        label: "Run community detection",
                                        paramKey: "run_community_detection",
                                        value: cfg.graph_rag_options.run_community_detection,
                                        onChange: (v)=>setCfg((p)=>({
                                                    ...p,
                                                    graph_rag_options: {
                                                        ...p.graph_rag_options,
                                                        run_community_detection: v
                                                    }
                                                })),
                                        tooltip: "Run Louvain algorithm and create community summaries."
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/enrich/page.tsx",
                                        lineNumber: 546,
                                        columnNumber: 15
                                    }, this),
                                    cfg.graph_rag_options.graph_backend === "neo4j" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            marginTop: 8,
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 4
                                        },
                                        children: [
                                            "neo4j_uri",
                                            "neo4j_user",
                                            "neo4j_password"
                                        ].map((k)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                placeholder: k,
                                                type: k === "neo4j_password" ? "password" : "text",
                                                value: cfg.graph_rag_options[k],
                                                onChange: (e)=>setCfg((p)=>({
                                                            ...p,
                                                            graph_rag_options: {
                                                                ...p.graph_rag_options,
                                                                [k]: e.target.value
                                                            }
                                                        })),
                                                style: {
                                                    width: "100%",
                                                    padding: "4px 6px",
                                                    background: "var(--c-bg-2)",
                                                    border: "1px solid var(--c-border)",
                                                    borderRadius: 4,
                                                    color: "var(--c-text-1)",
                                                    fontSize: "0.75rem",
                                                    fontFamily: "var(--font-mono)"
                                                }
                                            }, k, false, {
                                                fileName: "[project]/src/app/enrich/page.tsx",
                                                lineNumber: 556,
                                                columnNumber: 21
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/enrich/page.tsx",
                                        lineNumber: 554,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/enrich/page.tsx",
                                lineNumber: 513,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: "0.7rem",
                                            fontWeight: 600,
                                            color: "var(--c-text-3)",
                                            textTransform: "uppercase",
                                            letterSpacing: 1,
                                            marginBottom: 6
                                        },
                                        children: "Output Collection"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/enrich/page.tsx",
                                        lineNumber: 576,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: "0.72rem",
                                            color: "var(--c-text-3)",
                                            marginBottom: 6
                                        },
                                        children: [
                                            "Suffix (leave empty for default: ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                                style: {
                                                    color: "var(--c-accent)"
                                                },
                                                children: [
                                                    "_",
                                                    strategy === "parent_child" ? "parentchild" : strategy
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/enrich/page.tsx",
                                                lineNumber: 580,
                                                columnNumber: 48
                                            }, this),
                                            ")"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/enrich/page.tsx",
                                        lineNumber: 579,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        id: "enrich-output-suffix",
                                        value: cfg.output_collection_suffix,
                                        onChange: (e)=>setCfg((p)=>({
                                                    ...p,
                                                    output_collection_suffix: e.target.value
                                                })),
                                        placeholder: `_${strategy === "parent_child" ? "parentchild" : strategy}`,
                                        style: {
                                            width: "100%",
                                            padding: "4px 6px",
                                            background: "var(--c-bg-2)",
                                            border: "1px solid var(--c-border)",
                                            borderRadius: 4,
                                            color: "var(--c-text-1)",
                                            fontSize: "0.8rem",
                                            fontFamily: "var(--font-mono)"
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/enrich/page.tsx",
                                        lineNumber: 582,
                                        columnNumber: 13
                                    }, this),
                                    selectedCol && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: "0.68rem",
                                            color: "var(--c-text-3)",
                                            marginTop: 4
                                        },
                                        children: [
                                            "→ ",
                                            selectedCol,
                                            cfg.output_collection_suffix || `_${strategy === "parent_child" ? "parentchild" : strategy}`
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/enrich/page.tsx",
                                        lineNumber: 594,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/enrich/page.tsx",
                                lineNumber: 575,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/enrich/page.tsx",
                        lineNumber: 320,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/enrich/page.tsx",
                lineNumber: 307,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "panel",
                style: {
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "panel__header",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "panel__title",
                                children: "🧠 Step 4: Enrich Collection"
                            }, void 0, false, {
                                fileName: "[project]/src/app/enrich/page.tsx",
                                lineNumber: 609,
                                columnNumber: 11
                            }, this),
                            selectedCol && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    marginLeft: 10,
                                    fontSize: "0.72rem",
                                    color: "var(--c-text-3)"
                                },
                                children: [
                                    "Source: ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                        style: {
                                            color: "var(--c-text-2)"
                                        },
                                        children: selectedCol
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/enrich/page.tsx",
                                        lineNumber: 612,
                                        columnNumber: 23
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/enrich/page.tsx",
                                lineNumber: 611,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/enrich/page.tsx",
                        lineNumber: 608,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            flex: 1,
                            overflowY: "auto",
                            padding: "20px 24px",
                            display: "flex",
                            flexDirection: "column",
                            gap: 24
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: "0.75rem",
                                            fontWeight: 600,
                                            color: "var(--c-text-3)",
                                            textTransform: "uppercase",
                                            letterSpacing: 1,
                                            marginBottom: 12
                                        },
                                        children: "Choose Enrichment Strategy"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/enrich/page.tsx",
                                        lineNumber: 621,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: "grid",
                                            gridTemplateColumns: "repeat(3, 1fr)",
                                            gap: 14
                                        },
                                        children: STRATEGIES.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                id: `enrich-strategy-${s.id}`,
                                                onClick: ()=>setStrategy(s.id),
                                                style: {
                                                    padding: "16px",
                                                    borderRadius: 10,
                                                    border: `1.5px solid ${strategy === s.id ? "var(--c-accent)" : "var(--c-border)"}`,
                                                    background: strategy === s.id ? "var(--c-accent-bg, rgba(99,102,241,0.08))" : "var(--c-bg-2)",
                                                    cursor: "pointer",
                                                    transition: "all 0.15s",
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    gap: 6
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: "1.6rem",
                                                            lineHeight: 1
                                                        },
                                                        children: s.icon
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/enrich/page.tsx",
                                                        lineNumber: 642,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontWeight: 600,
                                                            fontSize: "0.9rem",
                                                            color: "var(--c-text-1)"
                                                        },
                                                        children: s.title
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/enrich/page.tsx",
                                                        lineNumber: 643,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: "0.72rem",
                                                            color: "var(--c-accent)",
                                                            fontWeight: 500
                                                        },
                                                        children: s.subtitle
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/enrich/page.tsx",
                                                        lineNumber: 644,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: "0.72rem",
                                                            color: "var(--c-text-3)",
                                                            lineHeight: 1.5
                                                        },
                                                        children: s.description
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/enrich/page.tsx",
                                                        lineNumber: 645,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            marginTop: 4,
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: 6
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    fontSize: "0.65rem",
                                                                    color: "var(--c-text-3)"
                                                                },
                                                                children: "Complexity:"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/enrich/page.tsx",
                                                                lineNumber: 647,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ComplexityStars, {
                                                                n: s.complexity
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/enrich/page.tsx",
                                                                lineNumber: 648,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/enrich/page.tsx",
                                                        lineNumber: 646,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, s.id, true, {
                                                fileName: "[project]/src/app/enrich/page.tsx",
                                                lineNumber: 626,
                                                columnNumber: 17
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/enrich/page.tsx",
                                        lineNumber: 624,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/enrich/page.tsx",
                                lineNumber: 620,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        id: "enrich-run-btn",
                                        className: "run-btn",
                                        disabled: isRunning || !selectedCol || !ollamaStatus?.available,
                                        onClick: handleRun,
                                        style: {
                                            minWidth: 200,
                                            fontSize: "0.9rem",
                                            padding: "10px 24px"
                                        },
                                        children: isRunning ? "⏳ Running enrichment…" : `▶ Run ${STRATEGIES.find((s)=>s.id === strategy)?.title}`
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/enrich/page.tsx",
                                        lineNumber: 657,
                                        columnNumber: 13
                                    }, this),
                                    !ollamaStatus?.available && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            marginLeft: 12,
                                            fontSize: "0.72rem",
                                            color: "var(--c-error, #f87171)"
                                        },
                                        children: "Ollama must be running to start enrichment"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/enrich/page.tsx",
                                        lineNumber: 667,
                                        columnNumber: 15
                                    }, this),
                                    (isRunning || progress > 0) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            marginTop: 12,
                                            height: 6,
                                            borderRadius: 3,
                                            background: "var(--c-bg-3)",
                                            overflow: "hidden"
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                height: "100%",
                                                width: `${progress}%`,
                                                background: "var(--c-accent)",
                                                transition: "width 0.3s",
                                                borderRadius: 3
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/enrich/page.tsx",
                                            lineNumber: 675,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/enrich/page.tsx",
                                        lineNumber: 674,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/enrich/page.tsx",
                                lineNumber: 656,
                                columnNumber: 11
                            }, this),
                            logLines.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                style: {
                                    flex: 1
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: "0.7rem",
                                            fontWeight: 600,
                                            color: "var(--c-text-3)",
                                            textTransform: "uppercase",
                                            letterSpacing: 1,
                                            marginBottom: 8
                                        },
                                        children: "Live Log"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/enrich/page.tsx",
                                        lineNumber: 691,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        ref: logRef,
                                        style: {
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
                                            wordBreak: "break-word"
                                        },
                                        children: logLines.map((line, i)=>{
                                            const isError = line.includes("❌") || line.includes("[ERROR]");
                                            const isWarn = line.includes("⚠️");
                                            const isOk = line.includes("✅") || line.includes("🏁");
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    color: isError ? "var(--c-error, #f87171)" : isWarn ? "var(--c-warning, #fbbf24)" : isOk ? "var(--c-success, #4ade80)" : undefined
                                                },
                                                children: line
                                            }, i, false, {
                                                fileName: "[project]/src/app/enrich/page.tsx",
                                                lineNumber: 716,
                                                columnNumber: 21
                                            }, this);
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/enrich/page.tsx",
                                        lineNumber: 694,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/enrich/page.tsx",
                                lineNumber: 690,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/enrich/page.tsx",
                        lineNumber: 617,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/enrich/page.tsx",
                lineNumber: 604,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/enrich/page.tsx",
        lineNumber: 305,
        columnNumber: 5
    }, this);
}
_s(EnrichPage, "US+dOQghfPPOe4U4QDkX8ljI7NM=");
_c4 = EnrichPage;
var _c, _c1, _c2, _c3, _c4;
__turbopack_context__.k.register(_c, "ComplexityStars");
__turbopack_context__.k.register(_c1, "OllamaStatusBadge");
__turbopack_context__.k.register(_c2, "NumberRow");
__turbopack_context__.k.register(_c3, "ToggleRow");
__turbopack_context__.k.register(_c4, "EnrichPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/enrich.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkOllamaStatus",
    ()=>checkOllamaStatus,
    "defaultEnrichmentConfig",
    ()=>defaultEnrichmentConfig,
    "startEnrichmentFetch",
    ()=>startEnrichmentFetch,
    "startEnrichmentStream",
    ()=>startEnrichmentStream
]);
/**
 * Enrichment API Client
 * ----------------------
 * Functions for the Step 4 Collection Enrichment pipeline.
 * Mirrors the structure of lib/qdrant.ts.
 */ const API_BASE = "http://localhost:8000";
function defaultEnrichmentConfig(source_collection) {
    return {
        source_collection,
        qdrant_storage_path: "",
        strategy: "parent_child",
        llm: {
            host: "http://localhost:11434",
            model: "llama3.2",
            timeout_seconds: 120,
            max_retries: 2
        },
        parent_child_options: {
            grouping_level: 1,
            summary_max_tokens: 256,
            summary_prompt_template: "Summarise the following section of a document in {max_tokens} tokens " + "or less. Focus on the key facts, definitions and conclusions.\n\n" + "Section heading: {heading}\n\n" + "Section content:\n{content}\n\nSummary:",
            embed_summaries: true,
            link_children: true
        },
        raptor_options: {
            max_levels: 3,
            umap_n_components: 2,
            umap_n_neighbors: 15,
            gmm_n_components: 0,
            summary_max_tokens: 256
        },
        graph_rag_options: {
            graph_backend: "networkx",
            neo4j_uri: "bolt://localhost:7687",
            neo4j_user: "neo4j",
            neo4j_password: "",
            max_entities_per_chunk: 10,
            entity_types: [
                "PERSON",
                "ORG",
                "LOCATION",
                "CONCEPT",
                "LAW",
                "DATE"
            ],
            run_community_detection: true,
            community_summary_max_tokens: 512
        },
        output_collection_suffix: ""
    };
}
async function checkOllamaStatus(host = "http://localhost:11434") {
    const res = await fetch(`${API_BASE}/api/enrich/ollama/status?host=${encodeURIComponent(host)}`);
    if (!res.ok) throw new Error(`Ollama status check failed: ${res.statusText}`);
    return res.json();
}
function startEnrichmentStream(cfg) {
    // We can't POST with EventSource, so we use fetch with ReadableStream
    // and expose the same interface via a custom wrapper.
    // This function returns a standard EventSource — the caller reads .onmessage.
    // Since EventSource only supports GET, we spin up a fetch-based stream
    // and expose progress via callbacks instead.
    throw new Error("Use startEnrichmentFetch instead");
}
async function startEnrichmentFetch(cfg, onLine, onDone, onError) {
    let res;
    try {
        res = await fetch(`${API_BASE}/api/enrich/run`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(cfg)
        });
    } catch (e) {
        onError(e instanceof Error ? e : new Error(String(e)));
        return;
    }
    if (!res.ok || !res.body) {
        onError(new Error(`HTTP ${res.status}: ${res.statusText}`));
        return;
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    try {
        while(true){
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, {
                stream: true
            });
            const parts = buffer.split("\n\n");
            buffer = parts.pop() ?? "";
            for (const part of parts){
                const line = part.replace(/^data: /, "").trim();
                if (line) onLine(line);
            }
        }
    } catch (e) {
        onError(e instanceof Error ? e : new Error(String(e)));
        return;
    }
    onDone();
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/qdrant.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "deleteCollection",
    ()=>deleteCollection,
    "getPoints",
    ()=>getPoints,
    "listChunkRuns",
    ()=>listChunkRuns,
    "listCollections",
    ()=>listCollections,
    "listDoclingRuns",
    ()=>listDoclingRuns
]);
/**
 * Qdrant Browser API Client
 * --------------------------
 * Functions for browsing the local Qdrant vector DB from the frontend.
 * All calls go through the FastAPI backend (not directly to Qdrant).
 */ const API_BASE = "http://localhost:8000";
async function listCollections(storagePath = "") {
    const params = storagePath ? `?storage_path=${encodeURIComponent(storagePath)}` : "";
    const res = await fetch(`${API_BASE}/api/qdrant/collections${params}`);
    if (!res.ok) throw new Error(`Failed to list collections: ${res.statusText}`);
    return res.json();
}
async function getPoints(collectionName, offset = 0, limit = 20, withVectors = false, storagePath = "") {
    const params = new URLSearchParams({
        offset: String(offset),
        limit: String(limit),
        with_vectors: String(withVectors)
    });
    if (storagePath) params.set("storage_path", storagePath);
    const res = await fetch(`${API_BASE}/api/qdrant/collections/${collectionName}/points?${params}`);
    if (!res.ok) throw new Error(`Failed to get points: ${res.statusText}`);
    return res.json();
}
async function deleteCollection(name, storagePath = "") {
    const params = storagePath ? `?storage_path=${encodeURIComponent(storagePath)}` : "";
    const res = await fetch(`${API_BASE}/api/qdrant/collections/${name}${params}`, {
        method: "DELETE"
    });
    if (!res.ok) throw new Error(`Failed to delete collection: ${res.statusText}`);
}
async function listDoclingRuns() {
    const res = await fetch(`${API_BASE}/api/chunk/docling-runs`);
    if (!res.ok) throw new Error(`Failed to list runs: ${res.statusText}`);
    return res.json();
}
async function listChunkRuns() {
    const res = await fetch(`${API_BASE}/api/chunk/runs`);
    if (!res.ok) throw new Error(`Failed to list chunk runs: ${res.statusText}`);
    return res.json();
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_1j7w2ig._.js.map