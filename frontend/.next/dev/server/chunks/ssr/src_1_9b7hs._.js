module.exports = [
"[project]/src/app/retrieve/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RetrievePage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$retrieve$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/retrieve.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
function RetrievePage() {
    const [collections, setCollections] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [selectedCol, setSelectedCol] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [isHybrid, setIsHybrid] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [prompt, setPrompt] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [limit, setLimit] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(5);
    const [fusionStrategy, setFusionStrategy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("rrf");
    const [useCrossEncoder, setUseCrossEncoder] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isProcessing, setIsProcessing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [result, setResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [showVectors, setShowVectors] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // GPT-4o answer generation state
    const [answerModel, setAnswerModel] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("gpt-4o");
    const [answer, setAnswer] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [isGenerating, setIsGenerating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [answerError, setAnswerError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const answerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    /**
   * WHY: We need to populate the collection dropdown on initial load so the user 
   * can select which vector database to search against.
   *
   * HOW: We run a side effect once on component mount (empty dependency array) 
   * that fetches collections from the backend and pre-selects the first one if available.
   */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$retrieve$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getCollections"])().then((cols)=>{
            setCollections(cols);
            if (cols.length > 0) {
                setSelectedCol(cols[0].name);
                setIsHybrid(cols[0].is_hybrid);
            }
        }).catch(console.error);
    }, []);
    /**
   * WHY: When the user selects a different collection, we need to know if it's a hybrid
   * collection (dense + sparse) or just dense. This is crucial because Fusion strategies
   * (RRF/DBSF) only make sense if there are multiple vector types to fuse.
   *
   * HOW: We look up the selected collection name in our cached `collections` array 
   * and update the `isHybrid` state accordingly.
   */ const handleColChange = (val)=>{
        setSelectedCol(val);
        const col = collections.find((c)=>c.name === val);
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
   */ const handleRun = async ()=>{
        if (!prompt.trim() || !selectedCol) return;
        setIsProcessing(true);
        setError(null);
        setResult(null);
        try {
            // 1. Rewrite
            const rewritten = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$retrieve$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["rewriteQuery"])(prompt);
            // 2. Retrieve
            const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$retrieve$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["runRetrieve"])(selectedCol, rewritten, limit, fusionStrategy);
            setResult(res);
        } catch (err) {
            setError(err.message || "Failed to run retrieval");
        } finally{
            setIsProcessing(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: "flex",
            height: "100%",
            gap: 0,
            overflow: "hidden"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                className: "panel",
                style: {
                    width: 320,
                    flexShrink: 0,
                    borderRight: "1px solid var(--c-border)",
                    overflowY: "auto"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "panel__header",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "panel__title",
                            children: "🔎 Retrieval Config"
                        }, void 0, false, {
                            fileName: "[project]/src/app/retrieve/page.tsx",
                            lineNumber: 112,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/retrieve/page.tsx",
                        lineNumber: 111,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "panel__body",
                        style: {
                            padding: "12px 14px",
                            display: "flex",
                            flexDirection: "column",
                            gap: 18
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: "0.7rem",
                                            fontWeight: 600,
                                            color: "var(--c-text-3)",
                                            textTransform: "uppercase",
                                            letterSpacing: 1,
                                            marginBottom: 6
                                        },
                                        children: "Target Collection"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/retrieve/page.tsx",
                                        lineNumber: 118,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        value: selectedCol,
                                        onChange: (e)=>handleColChange(e.target.value),
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
                                            collections.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "",
                                                children: "No collections found"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/retrieve/page.tsx",
                                                lineNumber: 134,
                                                columnNumber: 44
                                            }, this),
                                            collections.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: c.name,
                                                    children: [
                                                        c.name,
                                                        " ",
                                                        c.is_hybrid ? "(Hybrid)" : "(Dense Only)"
                                                    ]
                                                }, c.name, true, {
                                                    fileName: "[project]/src/app/retrieve/page.tsx",
                                                    lineNumber: 136,
                                                    columnNumber: 17
                                                }, this))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/retrieve/page.tsx",
                                        lineNumber: 121,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/retrieve/page.tsx",
                                lineNumber: 117,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: "0.7rem",
                                            fontWeight: 600,
                                            color: "var(--c-text-3)",
                                            textTransform: "uppercase",
                                            letterSpacing: 1,
                                            marginBottom: 6
                                        },
                                        children: "Search Settings"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/retrieve/page.tsx",
                                        lineNumber: 144,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            marginBottom: 12
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: "0.75rem",
                                                    color: "var(--c-text-2)"
                                                },
                                                children: "Max Results (Limit)"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/retrieve/page.tsx",
                                                lineNumber: 149,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "number",
                                                value: limit,
                                                onChange: (e)=>setLimit(Number(e.target.value)),
                                                min: 1,
                                                max: 50,
                                                style: {
                                                    width: 60,
                                                    padding: "2px 6px",
                                                    background: "var(--c-bg-2)",
                                                    border: "1px solid var(--c-border)",
                                                    borderRadius: 4,
                                                    color: "var(--c-text-1)",
                                                    fontSize: "0.8rem",
                                                    textAlign: "right"
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/retrieve/page.tsx",
                                                lineNumber: 150,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/retrieve/page.tsx",
                                        lineNumber: 148,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            marginBottom: 12
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontSize: "0.75rem",
                                                    color: "var(--c-text-2)",
                                                    marginBottom: 4
                                                },
                                                children: "Fusion Strategy (Hybrid only)"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/retrieve/page.tsx",
                                                lineNumber: 160,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: "flex",
                                                    gap: 6
                                                },
                                                children: [
                                                    "rrf",
                                                    "dbsf"
                                                ].map((strat)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        disabled: !isHybrid,
                                                        onClick: ()=>setFusionStrategy(strat),
                                                        style: {
                                                            flex: 1,
                                                            padding: "4px 8px",
                                                            borderRadius: 4,
                                                            border: `1px solid ${fusionStrategy === strat && isHybrid ? "var(--c-accent)" : "var(--c-border)"}`,
                                                            background: fusionStrategy === strat && isHybrid ? "var(--c-accent)" : "var(--c-bg-2)",
                                                            color: fusionStrategy === strat && isHybrid ? "var(--c-bg-1)" : "var(--c-text-2)",
                                                            fontSize: "0.75rem",
                                                            cursor: isHybrid ? "pointer" : "not-allowed",
                                                            opacity: isHybrid ? 1 : 0.5
                                                        },
                                                        children: strat.toUpperCase()
                                                    }, strat, false, {
                                                        fileName: "[project]/src/app/retrieve/page.tsx",
                                                        lineNumber: 163,
                                                        columnNumber: 19
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/retrieve/page.tsx",
                                                lineNumber: 161,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/retrieve/page.tsx",
                                        lineNumber: 159,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        title: "Coming Soon: Second-pass reranking using local cross-encoder models.",
                                        style: {
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            opacity: 0.5,
                                            cursor: "not-allowed"
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: "0.75rem",
                                                    color: "var(--c-text-2)"
                                                },
                                                children: "Use Cross-Encoder"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/retrieve/page.tsx",
                                                lineNumber: 189,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "checkbox",
                                                disabled: true,
                                                checked: useCrossEncoder
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/retrieve/page.tsx",
                                                lineNumber: 190,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/retrieve/page.tsx",
                                        lineNumber: 185,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/retrieve/page.tsx",
                                lineNumber: 143,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: "0.7rem",
                                            fontWeight: 600,
                                            color: "var(--c-text-3)",
                                            textTransform: "uppercase",
                                            letterSpacing: 1,
                                            marginBottom: 6
                                        },
                                        children: "Answer Generation"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/retrieve/page.tsx",
                                        lineNumber: 196,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            marginBottom: 8
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: "0.75rem",
                                                    color: "var(--c-text-2)"
                                                },
                                                children: "Model"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/retrieve/page.tsx",
                                                lineNumber: 200,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                value: answerModel,
                                                onChange: (e)=>setAnswerModel(e.target.value),
                                                style: {
                                                    width: 130,
                                                    padding: "2px 6px",
                                                    background: "var(--c-bg-2)",
                                                    border: "1px solid var(--c-border)",
                                                    borderRadius: 4,
                                                    color: "var(--c-text-1)",
                                                    fontSize: "0.75rem"
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "gpt-4o",
                                                        children: "GPT-4o"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/retrieve/page.tsx",
                                                        lineNumber: 214,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "gpt-4o-mini",
                                                        children: "GPT-4o Mini"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/retrieve/page.tsx",
                                                        lineNumber: 215,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "gemini-3.6-flash",
                                                        children: "Gemini 3.6 Flash"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/retrieve/page.tsx",
                                                        lineNumber: 216,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "gemini-3.1-pro-preview",
                                                        children: "Gemini 3.1 Pro"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/retrieve/page.tsx",
                                                        lineNumber: 217,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "ollama/llama3.2",
                                                        children: "Ollama: Llama 3.2 Text (Local/Free)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/retrieve/page.tsx",
                                                        lineNumber: 218,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "ollama/llava",
                                                        children: "Ollama: LLaVA Vision (Local/Free)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/retrieve/page.tsx",
                                                        lineNumber: 219,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/retrieve/page.tsx",
                                                lineNumber: 201,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/retrieve/page.tsx",
                                        lineNumber: 199,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: "0.65rem",
                                            color: "var(--c-text-3)",
                                            lineHeight: 1.4
                                        },
                                        children: "Generates a grounded answer from the retrieved chunks. Requires OPENAI_API_KEY (for GPT) or GEMINI_API_KEY (for Gemini) in backend environment."
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/retrieve/page.tsx",
                                        lineNumber: 222,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/retrieve/page.tsx",
                                lineNumber: 195,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/retrieve/page.tsx",
                        lineNumber: 115,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/retrieve/page.tsx",
                lineNumber: 102,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "panel",
                style: {
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "panel__header",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "panel__title",
                            children: "🔎 Step 5: Retrieval & Ranking"
                        }, void 0, false, {
                            fileName: "[project]/src/app/retrieve/page.tsx",
                            lineNumber: 237,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/retrieve/page.tsx",
                        lineNumber: 236,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            flex: 1,
                            overflowY: "auto",
                            padding: "20px 24px",
                            display: "flex",
                            flexDirection: "column",
                            gap: 24
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: "0.75rem",
                                            fontWeight: 600,
                                            color: "var(--c-text-3)",
                                            textTransform: "uppercase",
                                            letterSpacing: 1,
                                            marginBottom: 8
                                        },
                                        children: "Search Prompt"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/retrieve/page.tsx",
                                        lineNumber: 243,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                        value: prompt,
                                        onChange: (e)=>setPrompt(e.target.value),
                                        placeholder: "What are the key takeaways regarding document extraction?",
                                        style: {
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
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/retrieve/page.tsx",
                                        lineNumber: 246,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            marginTop: 12
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            className: "run-btn",
                                            onClick: handleRun,
                                            disabled: isProcessing || !prompt.trim(),
                                            style: {
                                                padding: "8px 24px"
                                            },
                                            children: isProcessing ? "⏳ Processing..." : "▶ Search"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/retrieve/page.tsx",
                                            lineNumber: 264,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/retrieve/page.tsx",
                                        lineNumber: 263,
                                        columnNumber: 13
                                    }, this),
                                    error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            marginTop: 12,
                                            padding: "10px",
                                            background: "var(--c-error-bg, #3a1a1a)",
                                            color: "var(--c-error, #f87171)",
                                            borderRadius: 6,
                                            fontSize: "0.8rem",
                                            border: "1px solid var(--c-error, #f87171)"
                                        },
                                        children: error
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/retrieve/page.tsx",
                                        lineNumber: 274,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/retrieve/page.tsx",
                                lineNumber: 242,
                                columnNumber: 11
                            }, this),
                            result && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                        style: {
                                            background: "var(--c-bg-2)",
                                            border: "1px solid var(--c-border)",
                                            borderRadius: 8,
                                            padding: "14px"
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontSize: "0.75rem",
                                                    fontWeight: 600,
                                                    color: "var(--c-text-3)",
                                                    textTransform: "uppercase",
                                                    letterSpacing: 1,
                                                    marginBottom: 8
                                                },
                                                children: "Query Processing"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/retrieve/page.tsx",
                                                lineNumber: 283,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontSize: "0.85rem",
                                                    color: "var(--c-text-1)",
                                                    marginBottom: 12
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: "Rewritten Query:"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/retrieve/page.tsx",
                                                        lineNumber: 287,
                                                        columnNumber: 19
                                                    }, this),
                                                    " ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            color: "var(--c-accent)"
                                                        },
                                                        children: result.rewritten_query
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/retrieve/page.tsx",
                                                        lineNumber: 287,
                                                        columnNumber: 53
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/retrieve/page.tsx",
                                                lineNumber: 286,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setShowVectors(!showVectors),
                                                style: {
                                                    background: "none",
                                                    border: "none",
                                                    color: "var(--c-text-3)",
                                                    fontSize: "0.75rem",
                                                    cursor: "pointer",
                                                    padding: 0,
                                                    textDecoration: "underline"
                                                },
                                                children: showVectors ? "Hide Query Vectors" : "Show Query Vectors"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/retrieve/page.tsx",
                                                lineNumber: 289,
                                                columnNumber: 17
                                            }, this),
                                            showVectors && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                                                style: {
                                                    marginTop: 8,
                                                    padding: 10,
                                                    background: "var(--c-bg-1)",
                                                    borderRadius: 6,
                                                    fontSize: "0.7rem",
                                                    overflowX: "auto",
                                                    color: "var(--c-text-2)"
                                                },
                                                children: JSON.stringify(result.query_vectors, null, 2)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/retrieve/page.tsx",
                                                lineNumber: 296,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/retrieve/page.tsx",
                                        lineNumber: 282,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: "flex",
                                            gap: 20
                                        },
                                        children: [
                                            result.pre_fusion.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                                style: {
                                                    flex: 1,
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    gap: 12
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: "0.75rem",
                                                            fontWeight: 600,
                                                            color: "var(--c-text-3)",
                                                            textTransform: "uppercase",
                                                            letterSpacing: 1
                                                        },
                                                        children: "Pre-Fusion Retrieval"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/retrieve/page.tsx",
                                                        lineNumber: 306,
                                                        columnNumber: 21
                                                    }, this),
                                                    result.pre_fusion.map((pf)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                background: "var(--c-bg-2)",
                                                                border: "1px solid var(--c-border)",
                                                                borderRadius: 8,
                                                                padding: "12px"
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    style: {
                                                                        fontSize: "0.8rem",
                                                                        fontWeight: 600,
                                                                        color: "var(--c-accent)",
                                                                        marginBottom: 8
                                                                    },
                                                                    children: [
                                                                        pf.using.toUpperCase(),
                                                                        " Search"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/app/retrieve/page.tsx",
                                                                    lineNumber: 311,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    style: {
                                                                        display: "flex",
                                                                        flexDirection: "column",
                                                                        gap: 8
                                                                    },
                                                                    children: pf.chunks.map((c, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            style: {
                                                                                fontSize: "0.75rem",
                                                                                padding: "6px",
                                                                                background: "var(--c-bg-1)",
                                                                                borderRadius: 4,
                                                                                border: "1px solid var(--c-border)"
                                                                            },
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    style: {
                                                                                        color: "var(--c-text-3)",
                                                                                        marginBottom: 4,
                                                                                        display: "flex",
                                                                                        justifyContent: "space-between"
                                                                                    },
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                            children: [
                                                                                                "#",
                                                                                                i + 1
                                                                                            ]
                                                                                        }, void 0, true, {
                                                                                            fileName: "[project]/src/app/retrieve/page.tsx",
                                                                                            lineNumber: 318,
                                                                                            columnNumber: 33
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                            children: [
                                                                                                "Score: ",
                                                                                                c.score.toFixed(4)
                                                                                            ]
                                                                                        }, void 0, true, {
                                                                                            fileName: "[project]/src/app/retrieve/page.tsx",
                                                                                            lineNumber: 319,
                                                                                            columnNumber: 33
                                                                                        }, this)
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/src/app/retrieve/page.tsx",
                                                                                    lineNumber: 317,
                                                                                    columnNumber: 31
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    style: {
                                                                                        color: "var(--c-text-2)",
                                                                                        maxHeight: 60,
                                                                                        overflow: "hidden",
                                                                                        textOverflow: "ellipsis",
                                                                                        marginBottom: 6
                                                                                    },
                                                                                    children: c.text
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/app/retrieve/page.tsx",
                                                                                    lineNumber: 321,
                                                                                    columnNumber: 31
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("details", {
                                                                                    style: {
                                                                                        fontSize: "0.7rem",
                                                                                        color: "var(--c-text-2)"
                                                                                    },
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("summary", {
                                                                                            style: {
                                                                                                cursor: "pointer",
                                                                                                color: "var(--c-accent)"
                                                                                            },
                                                                                            children: "Metadata"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/app/retrieve/page.tsx",
                                                                                            lineNumber: 325,
                                                                                            columnNumber: 33
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                                                                                            style: {
                                                                                                marginTop: 4,
                                                                                                padding: 6,
                                                                                                background: "rgba(0,0,0,0.2)",
                                                                                                borderRadius: 4,
                                                                                                overflowX: "auto"
                                                                                            },
                                                                                            children: JSON.stringify(c.metadata, null, 2)
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/app/retrieve/page.tsx",
                                                                                            lineNumber: 326,
                                                                                            columnNumber: 33
                                                                                        }, this)
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/src/app/retrieve/page.tsx",
                                                                                    lineNumber: 324,
                                                                                    columnNumber: 31
                                                                                }, this)
                                                                            ]
                                                                        }, c.id, true, {
                                                                            fileName: "[project]/src/app/retrieve/page.tsx",
                                                                            lineNumber: 316,
                                                                            columnNumber: 29
                                                                        }, this))
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/retrieve/page.tsx",
                                                                    lineNumber: 314,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, pf.using, true, {
                                                            fileName: "[project]/src/app/retrieve/page.tsx",
                                                            lineNumber: 310,
                                                            columnNumber: 23
                                                        }, this))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/retrieve/page.tsx",
                                                lineNumber: 305,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                                style: {
                                                    flex: 1,
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    gap: 12
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: "0.75rem",
                                                            fontWeight: 600,
                                                            color: "var(--c-success, #4ade80)",
                                                            textTransform: "uppercase",
                                                            letterSpacing: 1
                                                        },
                                                        children: [
                                                            "Final Ranked Results (",
                                                            fusionStrategy.toUpperCase(),
                                                            ")"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/retrieve/page.tsx",
                                                        lineNumber: 340,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: "flex",
                                                            flexDirection: "column",
                                                            gap: 12
                                                        },
                                                        children: result.fused_results.map((c, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    background: "var(--c-bg-2)",
                                                                    border: "1px solid var(--c-accent)",
                                                                    borderRadius: 8,
                                                                    padding: "12px"
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        style: {
                                                                            fontSize: "0.8rem",
                                                                            color: "var(--c-text-3)",
                                                                            marginBottom: 8,
                                                                            display: "flex",
                                                                            justifyContent: "space-between"
                                                                        },
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                                style: {
                                                                                    color: "var(--c-text-1)"
                                                                                },
                                                                                children: [
                                                                                    "Rank #",
                                                                                    i + 1
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/src/app/retrieve/page.tsx",
                                                                                lineNumber: 347,
                                                                                columnNumber: 27
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                style: {
                                                                                    color: "var(--c-accent)"
                                                                                },
                                                                                children: [
                                                                                    "Fusion Score: ",
                                                                                    c.score.toFixed(4)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/src/app/retrieve/page.tsx",
                                                                                lineNumber: 348,
                                                                                columnNumber: 27
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/app/retrieve/page.tsx",
                                                                        lineNumber: 346,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        style: {
                                                                            fontSize: "0.85rem",
                                                                            color: "var(--c-text-1)",
                                                                            lineHeight: 1.5,
                                                                            whiteSpace: "pre-wrap",
                                                                            marginBottom: 8
                                                                        },
                                                                        children: c.text
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/retrieve/page.tsx",
                                                                        lineNumber: 350,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("details", {
                                                                        style: {
                                                                            fontSize: "0.75rem",
                                                                            color: "var(--c-text-2)"
                                                                        },
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("summary", {
                                                                                style: {
                                                                                    cursor: "pointer",
                                                                                    color: "var(--c-accent)"
                                                                                },
                                                                                children: "Show Metadata"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/app/retrieve/page.tsx",
                                                                                lineNumber: 354,
                                                                                columnNumber: 27
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                                                                                style: {
                                                                                    marginTop: 8,
                                                                                    padding: 8,
                                                                                    background: "var(--c-bg-1)",
                                                                                    borderRadius: 4,
                                                                                    overflowX: "auto"
                                                                                },
                                                                                children: JSON.stringify(c.metadata, null, 2)
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/app/retrieve/page.tsx",
                                                                                lineNumber: 355,
                                                                                columnNumber: 27
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/app/retrieve/page.tsx",
                                                                        lineNumber: 353,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                ]
                                                            }, c.id, true, {
                                                                fileName: "[project]/src/app/retrieve/page.tsx",
                                                                lineNumber: 345,
                                                                columnNumber: 23
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/retrieve/page.tsx",
                                                        lineNumber: 343,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/retrieve/page.tsx",
                                                lineNumber: 339,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/retrieve/page.tsx",
                                        lineNumber: 302,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                        style: {
                                            marginTop: 24
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 12,
                                                    marginBottom: 12
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: "0.75rem",
                                                            fontWeight: 600,
                                                            color: "var(--c-text-3)",
                                                            textTransform: "uppercase",
                                                            letterSpacing: 1
                                                        },
                                                        children: [
                                                            "🤖 AI Answer (",
                                                            answerModel,
                                                            ")"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/retrieve/page.tsx",
                                                        lineNumber: 368,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        className: "run-btn",
                                                        disabled: isGenerating || result.fused_results.length === 0,
                                                        onClick: ()=>{
                                                            setIsGenerating(true);
                                                            setAnswer("");
                                                            setAnswerError(null);
                                                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$retrieve$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateAnswer"])(result.rewritten_query, result.fused_results.map((c)=>c.text), answerModel, undefined, (token)=>setAnswer((prev)=>prev + token), ()=>setIsGenerating(false), (err)=>{
                                                                setAnswerError(err);
                                                                setIsGenerating(false);
                                                            });
                                                        },
                                                        style: {
                                                            padding: "4px 16px",
                                                            fontSize: "0.75rem"
                                                        },
                                                        children: isGenerating ? "⏳ Generating..." : "▶ Generate Answer"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/retrieve/page.tsx",
                                                        lineNumber: 371,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/retrieve/page.tsx",
                                                lineNumber: 367,
                                                columnNumber: 17
                                            }, this),
                                            answerError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    padding: "10px",
                                                    background: "var(--c-error-bg, #3a1a1a)",
                                                    color: "var(--c-error, #f87171)",
                                                    borderRadius: 6,
                                                    fontSize: "0.8rem",
                                                    border: "1px solid var(--c-error, #f87171)",
                                                    marginBottom: 12
                                                },
                                                children: answerError
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/retrieve/page.tsx",
                                                lineNumber: 395,
                                                columnNumber: 19
                                            }, this),
                                            (answer || isGenerating) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                ref: answerRef,
                                                style: {
                                                    background: "var(--c-bg-2)",
                                                    border: "1px solid var(--c-accent)",
                                                    borderRadius: 8,
                                                    padding: "16px",
                                                    fontSize: "0.85rem",
                                                    color: "var(--c-text-1)",
                                                    lineHeight: 1.7,
                                                    whiteSpace: "pre-wrap",
                                                    minHeight: 60
                                                },
                                                children: [
                                                    answer,
                                                    isGenerating && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            display: "inline-block",
                                                            width: 6,
                                                            height: 16,
                                                            background: "var(--c-accent)",
                                                            marginLeft: 2,
                                                            animation: "blink 1s step-end infinite",
                                                            verticalAlign: "text-bottom"
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/retrieve/page.tsx",
                                                        lineNumber: 417,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/retrieve/page.tsx",
                                                lineNumber: 401,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/retrieve/page.tsx",
                                        lineNumber: 366,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/retrieve/page.tsx",
                                lineNumber: 281,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/retrieve/page.tsx",
                        lineNumber: 240,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/retrieve/page.tsx",
                lineNumber: 232,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/retrieve/page.tsx",
        lineNumber: 100,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/lib/retrieve.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateAnswer",
    ()=>generateAnswer,
    "getCollections",
    ()=>getCollections,
    "rewriteQuery",
    ()=>rewriteQuery,
    "runRetrieve",
    ()=>runRetrieve
]);
const API_BASE = "http://localhost:8000/api/retrieve";
async function getCollections() {
    const res = await fetch(`${API_BASE}/collections`);
    if (!res.ok) throw new Error("Failed to fetch retrieve collections");
    return res.json();
}
async function rewriteQuery(query) {
    const res = await fetch(`${API_BASE}/rewrite`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            query
        })
    });
    if (!res.ok) throw new Error("Failed to rewrite query");
    const data = await res.json();
    return data.rewritten_query;
}
async function runRetrieve(collectionName, query, limit, fusionStrategy) {
    const res = await fetch(`${API_BASE}/run`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            collection_name: collectionName,
            query,
            limit,
            fusion_strategy: fusionStrategy
        })
    });
    if (!res.ok) {
        const err = await res.json().catch(()=>({}));
        throw new Error(err.detail || "Failed to run retrieval");
    }
    return res.json();
}
async function generateAnswer(query, chunks, model, imageRefs, onToken, onDone, onError) {
    const res = await fetch(`${API_BASE}/answer`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            query,
            chunks,
            model,
            image_references: imageRefs
        })
    });
    if (!res.ok || !res.body) {
        onError("Failed to start answer generation");
        return;
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while(true){
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, {
            stream: true
        });
        // Parse SSE lines from the buffer
        const lines = buffer.split("\n");
        // Keep the last potentially incomplete line in the buffer
        buffer = lines.pop() || "";
        for (const line of lines){
            if (line.startsWith("data: ")) {
                const payload = line.slice(6);
                if (payload === "[DONE]") {
                    onDone();
                    return;
                }
                if (payload.startsWith("[ERROR]")) {
                    onError(payload.slice(8));
                    return;
                }
                onToken(payload);
            }
        }
    }
    onDone();
}
}),
];

//# sourceMappingURL=src_1_9b7hs._.js.map