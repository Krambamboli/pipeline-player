module.exports = [
"[project]/src/app/colpali/retrieve/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ColPaliRetrievePage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
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
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$qdrant$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/qdrant.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$colpali$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/colpali.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$retrieve$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/retrieve.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
function ColPaliRetrievePage() {
    // ── Collection selection (filtered to multivector only) ───────────
    const [collections, setCollections] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [selectedCol, setSelectedCol] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    // ── Query state ──────────────────────────────────────────────────
    const [query, setQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [limit, setLimit] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(5);
    const [isRetrieving, setIsRetrieving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [results, setResults] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    // ── GPT-4o answer generation ─────────────────────────────────────
    const [answerModel, setAnswerModel] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("gpt-4o");
    const [answer, setAnswer] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [isGenerating, setIsGenerating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [answerError, setAnswerError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const answerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    // ── Load collections on mount (filter to multivector) ─────────────
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$qdrant$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listCollections"])().then((cols)=>{
            // Filter to only show ColPali (multivector) collections
            const colpaliCols = cols.filter((c)=>c.is_multivector === true);
            setCollections(colpaliCols);
        }).catch(console.error);
    }, []);
    // ── Run MaxSim retrieval ──────────────────────────────────────────
    const handleRetrieve = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        if (!selectedCol || !query.trim()) return;
        setIsRetrieving(true);
        setError(null);
        setResults([]);
        setAnswer("");
        try {
            const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$colpali$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["retrieveColPali"])(selectedCol, query, limit);
            setResults(res.results);
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        } finally{
            setIsRetrieving(false);
        }
    }, [
        selectedCol,
        query,
        limit
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: "flex",
            height: "100%",
            gap: 0
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                className: "panel",
                style: {
                    width: 260,
                    flexShrink: 0,
                    borderRight: "1px solid var(--c-border)",
                    display: "flex",
                    flexDirection: "column"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "panel__header",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "panel__title",
                            children: "⚙️ Config"
                        }, void 0, false, {
                            fileName: "[project]/src/app/colpali/retrieve/page.tsx",
                            lineNumber: 78,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/colpali/retrieve/page.tsx",
                        lineNumber: 77,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "panel__body",
                        style: {
                            padding: "12px 16px",
                            display: "flex",
                            flexDirection: "column",
                            gap: 16
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
                                        children: "ColPali Collection"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/colpali/retrieve/page.tsx",
                                        lineNumber: 83,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        className: "select",
                                        value: selectedCol,
                                        onChange: (e)=>setSelectedCol(e.target.value),
                                        style: {
                                            width: "100%"
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "",
                                                children: "Select collection…"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/colpali/retrieve/page.tsx",
                                                lineNumber: 92,
                                                columnNumber: 15
                                            }, this),
                                            collections.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: c.name,
                                                    children: [
                                                        c.name,
                                                        " (",
                                                        c.points_count,
                                                        " pages)"
                                                    ]
                                                }, c.name, true, {
                                                    fileName: "[project]/src/app/colpali/retrieve/page.tsx",
                                                    lineNumber: 94,
                                                    columnNumber: 17
                                                }, this))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/colpali/retrieve/page.tsx",
                                        lineNumber: 86,
                                        columnNumber: 13
                                    }, this),
                                    collections.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: "0.65rem",
                                            color: "var(--c-text-3)",
                                            marginTop: 6
                                        },
                                        children: "No ColPali collections found. Run the ColPali pipeline first."
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/colpali/retrieve/page.tsx",
                                        lineNumber: 100,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/colpali/retrieve/page.tsx",
                                lineNumber: 82,
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
                                        children: "Search Query"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/colpali/retrieve/page.tsx",
                                        lineNumber: 108,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                        className: "input",
                                        rows: 3,
                                        placeholder: "Enter your question…",
                                        value: query,
                                        onChange: (e)=>setQuery(e.target.value),
                                        style: {
                                            width: "100%",
                                            resize: "vertical",
                                            fontFamily: "var(--font-body)"
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/colpali/retrieve/page.tsx",
                                        lineNumber: 111,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/colpali/retrieve/page.tsx",
                                lineNumber: 107,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontSize: "0.75rem",
                                            color: "var(--c-text-2)"
                                        },
                                        children: "Results"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/colpali/retrieve/page.tsx",
                                        lineNumber: 123,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "number",
                                        value: limit,
                                        onChange: (e)=>setLimit(Number(e.target.value)),
                                        min: 1,
                                        max: 20,
                                        style: {
                                            width: 50,
                                            padding: "2px 6px",
                                            background: "var(--c-bg-2)",
                                            border: "1px solid var(--c-border)",
                                            borderRadius: 4,
                                            color: "var(--c-text-1)",
                                            fontSize: "0.8rem",
                                            textAlign: "right"
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/colpali/retrieve/page.tsx",
                                        lineNumber: 124,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/colpali/retrieve/page.tsx",
                                lineNumber: 122,
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
                                        fileName: "[project]/src/app/colpali/retrieve/page.tsx",
                                        lineNumber: 136,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        className: "select",
                                        value: answerModel,
                                        onChange: (e)=>setAnswerModel(e.target.value),
                                        style: {
                                            width: "100%"
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "gpt-4o",
                                                children: "GPT-4o"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/colpali/retrieve/page.tsx",
                                                lineNumber: 145,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "gpt-4o-mini",
                                                children: "GPT-4o Mini"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/colpali/retrieve/page.tsx",
                                                lineNumber: 146,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "gemini-3.6-flash",
                                                children: "Gemini 3.6 Flash"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/colpali/retrieve/page.tsx",
                                                lineNumber: 147,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "gemini-3.1-pro-preview",
                                                children: "Gemini 3.1 Pro"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/colpali/retrieve/page.tsx",
                                                lineNumber: 148,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "ollama/llava",
                                                children: "Ollama: LLaVA Vision (Local/Free)"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/colpali/retrieve/page.tsx",
                                                lineNumber: 149,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/colpali/retrieve/page.tsx",
                                        lineNumber: 139,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/colpali/retrieve/page.tsx",
                                lineNumber: 135,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "run-btn",
                                onClick: handleRetrieve,
                                disabled: isRetrieving || !selectedCol || !query.trim(),
                                style: {
                                    width: "100%"
                                },
                                children: isRetrieving ? "⏳ Retrieving…" : "🔎 MaxSim Retrieve"
                            }, void 0, false, {
                                fileName: "[project]/src/app/colpali/retrieve/page.tsx",
                                lineNumber: 154,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/colpali/retrieve/page.tsx",
                        lineNumber: 80,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/colpali/retrieve/page.tsx",
                lineNumber: 73,
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
                            children: "🔎 ColPali: MaxSim Retrieval"
                        }, void 0, false, {
                            fileName: "[project]/src/app/colpali/retrieve/page.tsx",
                            lineNumber: 171,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/colpali/retrieve/page.tsx",
                        lineNumber: 170,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            flex: 1,
                            overflowY: "auto",
                            padding: "20px 24px",
                            display: "flex",
                            flexDirection: "column",
                            gap: 16
                        },
                        children: [
                            !isRetrieving && results.length === 0 && !error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    color: "var(--c-text-3)",
                                    textAlign: "center",
                                    paddingTop: 60,
                                    fontSize: "0.85rem"
                                },
                                children: [
                                    "Select a ColPali collection and enter a query to search.",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                        fileName: "[project]/src/app/colpali/retrieve/page.tsx",
                                        lineNumber: 179,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                        fileName: "[project]/src/app/colpali/retrieve/page.tsx",
                                        lineNumber: 179,
                                        columnNumber: 21
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontSize: "0.7rem"
                                        },
                                        children: "MaxSim computes maximum similarity between query tokens and page patch vectors."
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/colpali/retrieve/page.tsx",
                                        lineNumber: 180,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/colpali/retrieve/page.tsx",
                                lineNumber: 177,
                                columnNumber: 13
                            }, this),
                            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    padding: "12px",
                                    background: "var(--c-error-bg, #3a1a1a)",
                                    color: "var(--c-error, #f87171)",
                                    borderRadius: 6,
                                    fontSize: "0.8rem",
                                    border: "1px solid var(--c-error, #f87171)"
                                },
                                children: error
                            }, void 0, false, {
                                fileName: "[project]/src/app/colpali/retrieve/page.tsx",
                                lineNumber: 188,
                                columnNumber: 13
                            }, this),
                            isRetrieving && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    color: "var(--c-text-3)",
                                    textAlign: "center",
                                    paddingTop: 40,
                                    fontSize: "0.85rem"
                                },
                                children: "⏳ Running MaxSim retrieval…"
                            }, void 0, false, {
                                fileName: "[project]/src/app/colpali/retrieve/page.tsx",
                                lineNumber: 195,
                                columnNumber: 13
                            }, this),
                            results.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
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
                                            "Top ",
                                            results.length,
                                            " Pages (MaxSim)"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/colpali/retrieve/page.tsx",
                                        lineNumber: 203,
                                        columnNumber: 15
                                    }, this),
                                    results.map((page, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                background: "var(--c-bg-2)",
                                                border: "1px solid var(--c-border)",
                                                borderRadius: 8,
                                                padding: "14px"
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "center",
                                                        marginBottom: 8
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: 8
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                    style: {
                                                                        color: "var(--c-text-1)",
                                                                        fontSize: "0.85rem"
                                                                    },
                                                                    children: [
                                                                        "#",
                                                                        i + 1
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/app/colpali/retrieve/page.tsx",
                                                                    lineNumber: 219,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "chunk-badge chunk-badge--type",
                                                                    style: {
                                                                        fontSize: "0.7rem"
                                                                    },
                                                                    children: [
                                                                        "Page ",
                                                                        page.page_number
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/app/colpali/retrieve/page.tsx",
                                                                    lineNumber: 222,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        fontSize: "0.75rem",
                                                                        color: "var(--c-text-3)"
                                                                    },
                                                                    children: page.doc_source
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/colpali/retrieve/page.tsx",
                                                                    lineNumber: 228,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/colpali/retrieve/page.tsx",
                                                            lineNumber: 218,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                color: "var(--c-accent)",
                                                                fontSize: "0.8rem",
                                                                fontWeight: 600
                                                            },
                                                            children: [
                                                                "Score: ",
                                                                page.score.toFixed(4)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/colpali/retrieve/page.tsx",
                                                            lineNumber: 232,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/colpali/retrieve/page.tsx",
                                                    lineNumber: 217,
                                                    columnNumber: 19
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
                                                            fileName: "[project]/src/app/colpali/retrieve/page.tsx",
                                                            lineNumber: 239,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                                                            style: {
                                                                marginTop: 8,
                                                                padding: 8,
                                                                background: "var(--c-bg)",
                                                                borderRadius: 4,
                                                                overflowX: "auto"
                                                            },
                                                            children: JSON.stringify(page.metadata, null, 2)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/colpali/retrieve/page.tsx",
                                                            lineNumber: 240,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/colpali/retrieve/page.tsx",
                                                    lineNumber: 238,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, page.id, true, {
                                            fileName: "[project]/src/app/colpali/retrieve/page.tsx",
                                            lineNumber: 208,
                                            columnNumber: 17
                                        }, this)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                        style: {
                                            marginTop: 12
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
                                                        fileName: "[project]/src/app/colpali/retrieve/page.tsx",
                                                        lineNumber: 250,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        className: "run-btn",
                                                        disabled: isGenerating || results.length === 0,
                                                        onClick: ()=>{
                                                            setIsGenerating(true);
                                                            setAnswer("");
                                                            setAnswerError(null);
                                                            // For ColPali pages we send the metadata as context
                                                            const chunkTexts = results.map((p)=>`[Page ${p.page_number} of ${p.doc_source}]\n${JSON.stringify(p.metadata, null, 2)}`);
                                                            const imageRefs = results.map((p)=>({
                                                                    source: p.doc_source,
                                                                    page: p.page_number
                                                                }));
                                                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$retrieve$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateAnswer"])(query, chunkTexts, answerModel, imageRefs, (token)=>setAnswer((prev)=>prev + token), ()=>setIsGenerating(false), (err)=>{
                                                                setAnswerError(err);
                                                                setIsGenerating(false);
                                                            });
                                                        },
                                                        style: {
                                                            padding: "4px 16px",
                                                            fontSize: "0.75rem"
                                                        },
                                                        children: isGenerating ? "⏳ Generating…" : "▶ Generate Answer"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/colpali/retrieve/page.tsx",
                                                        lineNumber: 253,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/colpali/retrieve/page.tsx",
                                                lineNumber: 249,
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
                                                fileName: "[project]/src/app/colpali/retrieve/page.tsx",
                                                lineNumber: 283,
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
                                                        fileName: "[project]/src/app/colpali/retrieve/page.tsx",
                                                        lineNumber: 305,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/colpali/retrieve/page.tsx",
                                                lineNumber: 289,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/colpali/retrieve/page.tsx",
                                        lineNumber: 248,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/colpali/retrieve/page.tsx",
                                lineNumber: 202,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/colpali/retrieve/page.tsx",
                        lineNumber: 174,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/colpali/retrieve/page.tsx",
                lineNumber: 166,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/colpali/retrieve/page.tsx",
        lineNumber: 71,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/lib/colpali.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "listPdfs",
    ()=>listPdfs,
    "retrieveColPali",
    ()=>retrieveColPali,
    "runColPali",
    ()=>runColPali
]);
/**
 * ColPali API Client
 * -------------------
 * Frontend functions for the ColPali visual retrieval pipeline.
 * Communicates with the /api/colpali backend endpoints.
 */ const API_BASE = "http://localhost:8000/api/colpali";
async function listPdfs() {
    const res = await fetch(`${API_BASE}/pdfs`);
    if (!res.ok) throw new Error(`Failed to list PDFs: ${res.statusText}`);
    return res.json();
}
async function runColPali(config, onLog, onProgress, onDone, onError) {
    const res = await fetch(`${API_BASE}/run`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(config)
    });
    if (!res.ok || !res.body) {
        onError(`Pipeline request failed: ${res.statusText}`);
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
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines){
            if (line.startsWith("data: ")) {
                const payload = line.slice(6);
                if (payload.startsWith("[ERROR]")) {
                    onError(payload.slice(8));
                    return;
                }
                if (payload.startsWith("__PROGRESS__=")) {
                    onProgress(Number(payload.split("=")[1]));
                } else {
                    onLog(payload);
                }
            }
        }
    }
    onDone();
}
async function retrieveColPali(collection_name, query, limit = 5) {
    const res = await fetch(`${API_BASE}/retrieve`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            collection_name,
            query,
            limit
        })
    });
    if (!res.ok) throw new Error(`ColPali retrieval failed: ${res.statusText}`);
    return res.json();
}
}),
"[project]/src/lib/qdrant.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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

//# sourceMappingURL=src_0jd0txt._.js.map