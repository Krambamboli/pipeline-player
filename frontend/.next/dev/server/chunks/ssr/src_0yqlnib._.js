module.exports = [
"[project]/src/app/chunk/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ChunkPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
/**
 * Chunk & Vectorize Page
 * ----------------------
 * Step 2 of the pipeline: chunk a Docling document, embed it, and upsert
 * into a local Qdrant collection.
 *
 * Layout:
 *   LEFT:   ChunkConfigPanel — all chunking/embedding/Qdrant options
 *   CENTER: Source run selector + result summary
 *   RIGHT:  Run console (SSE log stream + progress)
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$qdrant$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/qdrant.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useChunkStream$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useChunkStream.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ChunkConfigPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ChunkConfigPanel.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
function ChunkPage() {
    const [doclingRuns, setDoclingRuns] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [config, setConfig] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useChunkStream$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_CHUNK_CONFIG"]
    });
    const [customKeyInput, setCustomKeyInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [customValInput, setCustomValInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const { isRunning, logs, progress, result, errorMessage, startRun, cancelRun, clearLogs } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useChunkStream$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useChunkStream"])();
    // Load available Docling runs on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$qdrant$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listDoclingRuns"])().then((runs)=>{
            setDoclingRuns(runs);
            if (runs.length > 0 && !config.source_run_id) {
                setConfig((c)=>({
                        ...c,
                        source_run_id: runs[0].run_id
                    }));
            }
        }).catch(console.error);
    }, []);
    const updateField = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((path, value)=>{
        setConfig((prev)=>{
            const next = structuredClone(prev);
            // path like "embedding.mode" or "hybrid_chunker_options.max_tokens"
            const keys = path.split(".");
            let obj = next;
            for(let i = 0; i < keys.length - 1; i++){
                obj = obj[keys[i]];
            }
            obj[keys[keys.length - 1]] = value;
            return next;
        });
    }, []);
    const handleRun = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        startRun(config);
    }, [
        config,
        startRun
    ]);
    const addCustomField = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (!customKeyInput.trim()) return;
        setConfig((c)=>({
                ...c,
                metadata: {
                    ...c.metadata,
                    custom_fields: {
                        ...c.metadata.custom_fields,
                        [customKeyInput.trim()]: customValInput
                    }
                }
            }));
        setCustomKeyInput("");
        setCustomValInput("");
    }, [
        customKeyInput,
        customValInput
    ]);
    const removeCustomField = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((key)=>{
        setConfig((c)=>{
            const fields = {
                ...c.metadata.custom_fields
            };
            delete fields[key];
            return {
                ...c,
                metadata: {
                    ...c.metadata,
                    custom_fields: fields
                }
            };
        });
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "app-shell",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                className: "panel panel--config",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "panel__header",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "panel__title",
                            children: "✂️ Chunking Configuration"
                        }, void 0, false, {
                            fileName: "[project]/src/app/chunk/page.tsx",
                            lineNumber: 96,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/chunk/page.tsx",
                        lineNumber: 95,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "panel__body",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ChunkConfigPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                            config: config,
                            onUpdate: updateField,
                            customKeyInput: customKeyInput,
                            customValInput: customValInput,
                            onCustomKeyChange: setCustomKeyInput,
                            onCustomValChange: setCustomValInput,
                            onAddCustomField: addCustomField,
                            onRemoveCustomField: removeCustomField
                        }, void 0, false, {
                            fileName: "[project]/src/app/chunk/page.tsx",
                            lineNumber: 99,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/chunk/page.tsx",
                        lineNumber: 98,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/chunk/page.tsx",
                lineNumber: 94,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "panel panel--main",
                style: {
                    display: "flex",
                    flexDirection: "column"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "panel__header",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "panel__title",
                            children: "📄 Source Document"
                        }, void 0, false, {
                            fileName: "[project]/src/app/chunk/page.tsx",
                            lineNumber: 115,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/chunk/page.tsx",
                        lineNumber: 114,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "panel__body",
                        style: {
                            padding: "16px"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "form-label",
                                children: "Select Docling Run to Chunk"
                            }, void 0, false, {
                                fileName: "[project]/src/app/chunk/page.tsx",
                                lineNumber: 119,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                className: "form-select",
                                value: config.source_run_id,
                                onChange: (e)=>updateField("source_run_id", e.target.value),
                                disabled: isRunning,
                                children: [
                                    doclingRuns.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "",
                                        children: "No parsed runs found — run Step 1 first"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/chunk/page.tsx",
                                        lineNumber: 127,
                                        columnNumber: 15
                                    }, this),
                                    doclingRuns.map((r)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: r.run_id,
                                            children: [
                                                "run_",
                                                r.run_id,
                                                " (",
                                                r.json_size_kb,
                                                " KB)"
                                            ]
                                        }, r.run_id, true, {
                                            fileName: "[project]/src/app/chunk/page.tsx",
                                            lineNumber: 130,
                                            columnNumber: 15
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/chunk/page.tsx",
                                lineNumber: 120,
                                columnNumber: 11
                            }, this),
                            result && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "chunk-result-card",
                                style: {
                                    marginTop: 24
                                },
                                children: result.status === "success" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "chunk-result-card__title",
                                            children: "✅ Chunk Run Complete"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/chunk/page.tsx",
                                            lineNumber: 141,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "stat-grid",
                                            style: {
                                                marginTop: 12
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "stat-box",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "stat-box__label",
                                                            children: "Chunks"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/chunk/page.tsx",
                                                            lineNumber: 144,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "stat-box__value",
                                                            children: result.chunk_count
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/chunk/page.tsx",
                                                            lineNumber: 145,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/chunk/page.tsx",
                                                    lineNumber: 143,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "stat-box",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "stat-box__label",
                                                            children: "Avg Tokens"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/chunk/page.tsx",
                                                            lineNumber: 148,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "stat-box__value",
                                                            children: result.avg_tokens
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/chunk/page.tsx",
                                                            lineNumber: 149,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/chunk/page.tsx",
                                                    lineNumber: 147,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "stat-box",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "stat-box__label",
                                                            children: "Duration"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/chunk/page.tsx",
                                                            lineNumber: 152,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "stat-box__value",
                                                            children: [
                                                                result.elapsed_seconds,
                                                                "s"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/chunk/page.tsx",
                                                            lineNumber: 153,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/chunk/page.tsx",
                                                    lineNumber: 151,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/chunk/page.tsx",
                                            lineNumber: 142,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                marginTop: 12,
                                                fontSize: "0.8rem",
                                                color: "var(--c-text-3)"
                                            },
                                            children: [
                                                "Collection:",
                                                " ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    style: {
                                                        color: "var(--c-accent)",
                                                        fontFamily: "var(--font-mono)"
                                                    },
                                                    children: result.collection_name
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/chunk/page.tsx",
                                                    lineNumber: 158,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/chunk/page.tsx",
                                            lineNumber: 156,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                marginTop: 8,
                                                fontSize: "0.75rem",
                                                color: "var(--c-text-3)"
                                            },
                                            children: [
                                                "View chunks in the",
                                                " ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                    href: "/inspector",
                                                    style: {
                                                        color: "var(--c-accent)"
                                                    },
                                                    children: "🔍 Vector DB Inspector"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/chunk/page.tsx",
                                                    lineNumber: 164,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/chunk/page.tsx",
                                            lineNumber: 162,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/chunk/page.tsx",
                                    lineNumber: 140,
                                    columnNumber: 17
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        color: "var(--c-error)"
                                    },
                                    children: [
                                        "❌ Error: ",
                                        result.error
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/chunk/page.tsx",
                                    lineNumber: 170,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/chunk/page.tsx",
                                lineNumber: 138,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/chunk/page.tsx",
                        lineNumber: 117,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/chunk/page.tsx",
                lineNumber: 113,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                className: "panel panel--console",
                style: {
                    display: "flex",
                    flexDirection: "column"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "panel__header",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "panel__title",
                                children: "⚡ Chunk Console"
                            }, void 0, false, {
                                fileName: "[project]/src/app/chunk/page.tsx",
                                lineNumber: 182,
                                columnNumber: 11
                            }, this),
                            logs.length > 0 && !isRunning && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: clearLogs,
                                style: {
                                    marginLeft: "auto",
                                    background: "none",
                                    border: "none",
                                    color: "var(--c-text-3)",
                                    cursor: "pointer",
                                    fontSize: "0.75rem"
                                },
                                children: "Clear"
                            }, void 0, false, {
                                fileName: "[project]/src/app/chunk/page.tsx",
                                lineNumber: 184,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/chunk/page.tsx",
                        lineNumber: 181,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            padding: "12px 16px",
                            borderBottom: "1px solid var(--c-border)",
                            flexShrink: 0
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: "flex",
                                    gap: "8px"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        id: "run-chunk-btn",
                                        className: `run-btn ${isRunning ? "run-btn--running" : ""}`,
                                        disabled: isRunning || !config.source_run_id,
                                        onClick: handleRun,
                                        style: {
                                            flex: 1
                                        },
                                        children: isRunning ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "run-btn__spinner"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/chunk/page.tsx",
                                                    lineNumber: 212,
                                                    columnNumber: 19
                                                }, this),
                                                "Chunking…"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/chunk/page.tsx",
                                            lineNumber: 211,
                                            columnNumber: 17
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                            children: "✂️ Run Chunking Pipeline"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/chunk/page.tsx",
                                            lineNumber: 216,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/chunk/page.tsx",
                                        lineNumber: 203,
                                        columnNumber: 13
                                    }, this),
                                    isRunning && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "run-btn",
                                        style: {
                                            background: "var(--c-danger)",
                                            color: "white"
                                        },
                                        onClick: cancelRun,
                                        children: "■ Cancel"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/chunk/page.tsx",
                                        lineNumber: 220,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/chunk/page.tsx",
                                lineNumber: 202,
                                columnNumber: 11
                            }, this),
                            isRunning && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    width: "100%",
                                    background: "var(--c-bg-2)",
                                    height: "6px",
                                    borderRadius: "3px",
                                    overflow: "hidden",
                                    marginTop: "8px"
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        width: `${progress}%`,
                                        background: "var(--c-accent)",
                                        height: "100%",
                                        transition: "width 0.3s ease"
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/src/app/chunk/page.tsx",
                                    lineNumber: 242,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/chunk/page.tsx",
                                lineNumber: 232,
                                columnNumber: 13
                            }, this),
                            errorMessage && !isRunning && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    color: "var(--c-error)",
                                    fontSize: "0.75rem",
                                    marginTop: 8
                                },
                                children: [
                                    "❌ ",
                                    errorMessage
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/chunk/page.tsx",
                                lineNumber: 254,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/chunk/page.tsx",
                        lineNumber: 201,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            flex: 1,
                            overflowY: "auto",
                            padding: "8px 12px",
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.72rem",
                            lineHeight: "1.6"
                        },
                        children: [
                            logs.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    color: "var(--c-text-3)",
                                    textAlign: "center",
                                    paddingTop: 32
                                },
                                children: "Select a run and click ✂️ to start chunking."
                            }, void 0, false, {
                                fileName: "[project]/src/app/chunk/page.tsx",
                                lineNumber: 272,
                                columnNumber: 13
                            }, this),
                            logs.map((log, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        color: log.includes("❌") ? "var(--c-error)" : log.includes("✅") ? "var(--c-success)" : "var(--c-text-2)",
                                        padding: "1px 0"
                                    },
                                    children: log
                                }, i, false, {
                                    fileName: "[project]/src/app/chunk/page.tsx",
                                    lineNumber: 277,
                                    columnNumber: 13
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/chunk/page.tsx",
                        lineNumber: 261,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/chunk/page.tsx",
                lineNumber: 180,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/chunk/page.tsx",
        lineNumber: 92,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/components/ChunkConfigPanel.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ChunkConfigPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/Controls.tsx [app-ssr] (ecmascript)");
"use client";
;
;
/**
 * Dense embedding model options — verified working with fastembed.
 * NOTE: jinaai/jina-embeddings-v2-base-de is excluded: it produces all-NaN
 * vectors in the current fastembed ONNX runtime (known upstream bug).
 * Use jina-embeddings-v2-base-en or paraphrase-multilingual-mpnet-base-v2
 * for German text instead.
 */ const DENSE_MODELS = [
    {
        value: "BAAI/bge-small-en-v1.5",
        label: "BGE-Small-EN (English · Fast · 384d · 67 MB)"
    },
    {
        value: "BAAI/bge-base-en-v1.5",
        label: "BGE-Base-EN (English · Better Quality · 768d · 210 MB)"
    },
    {
        value: "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
        label: "MiniLM-L12-Multilingual (50+ Langs · Compact · 384d · 220 MB)"
    },
    {
        value: "sentence-transformers/paraphrase-multilingual-mpnet-base-v2",
        label: "MPNet-Multilingual (50+ Langs · High Quality · 768d · 1.0 GB)"
    },
    {
        value: "jinaai/jina-embeddings-v2-base-en",
        label: "Jina-EN (German + EN · 8 192 ctx · 768d · 520 MB)"
    },
    {
        value: "intfloat/multilingual-e5-large",
        label: "E5-Large-Multilingual (100+ Langs · Top Quality · 1 024d · 2.2 GB)"
    }
];
function ChunkConfigPanel({ config, onUpdate, customKeyInput, customValInput, onCustomKeyChange, onCustomValChange, onAddCustomField, onRemoveCustomField }) {
    const o = config;
    const isHybrid = o.chunker === "hybrid";
    const isHierarchical = o.chunker === "hierarchical";
    const useDense = o.embedding.mode === "dense" || o.embedding.mode === "hybrid";
    const useSparse = o.embedding.mode === "sparse" || o.embedding.mode === "hybrid";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: "flex",
            flexDirection: "column",
            gap: 8
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ConfigSection"], {
                icon: "✂️",
                title: "Chunker Strategy",
                defaultOpen: true,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SelectField"], {
                    id: "chunker",
                    label: "Strategy",
                    paramKey: "chunker",
                    value: o.chunker,
                    options: [
                        {
                            value: "hybrid",
                            label: "HybridChunker — Hierarchie + Token-Limit (empfohlen)"
                        },
                        {
                            value: "hierarchical",
                            label: "HierarchicalChunker — Hierarchie, kein Token-Limit"
                        },
                        {
                            value: "page",
                            label: "PageChunker — 1 Chunk pro Seite"
                        }
                    ],
                    onChange: (v)=>onUpdate("chunker", v),
                    tooltip: "Docling-Chunking-Algorithmus. HybridChunker: teilt Abschnitte respektiert Heading-Struktur UND erzwingt ein Token-Limit — empfohlen für RAG. HINWEIS: 'Hybrid' hier ist ein Docling-Algorithmus-Name und hat nichts mit dem Embedding-Modus 'Hybrid (Dense + Sparse)' zu tun. HierarchicalChunker: ein Chunk pro Dokument-Abschnitt, kein Token-Limit — konkurriert mit HybridChunker, nicht mit semantischem Chunking. PageChunker: eine PDF-Seite = ein Chunk."
                }, void 0, false, {
                    fileName: "[project]/src/components/ChunkConfigPanel.tsx",
                    lineNumber: 90,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/ChunkConfigPanel.tsx",
                lineNumber: 89,
                columnNumber: 7
            }, this),
            isHybrid && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ConfigSection"], {
                icon: "⚙️",
                title: "HybridChunker — Optionen",
                defaultOpen: true,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SelectField"], {
                        id: "hybrid_tokenizer",
                        label: "Tokenizer Model",
                        paramKey: "hybrid_chunker_options.tokenizer_model",
                        value: o.hybrid_chunker_options.tokenizer_model,
                        options: [
                            {
                                value: "BAAI/bge-small-en-v1.5",
                                label: "BGE-Small-EN (matches default dense model)"
                            },
                            {
                                value: "jinaai/jina-embeddings-v2-base-de",
                                label: "Jina-DE (for German/multilingual, 8 192 ctx)"
                            },
                            {
                                value: "intfloat/multilingual-e5-large",
                                label: "E5-Large (multilingual, 512 ctx)"
                            },
                            {
                                value: "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
                                label: "MiniLM-L12 (multilingual, 512 ctx)"
                            }
                        ],
                        onChange: (v)=>onUpdate("hybrid_chunker_options.tokenizer_model", v),
                        tooltip: "HuggingFace tokenizer used to count tokens and enforce max_tokens. Should match the dense embedding model so the chunk fits inside the model's context window exactly."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ChunkConfigPanel.tsx",
                        lineNumber: 108,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["NumberField"], {
                        id: "max_tokens",
                        label: "Max Tokens per Chunk",
                        paramKey: "hybrid_chunker_options.max_tokens",
                        value: o.hybrid_chunker_options.max_tokens,
                        min: 32,
                        max: 8192,
                        onChange: (v)=>onUpdate("hybrid_chunker_options.max_tokens", v ?? 512),
                        tooltip: "Maximum number of tokens a single chunk may contain. Chunks that exceed this are split further. Typical values: 256–512 for dense retrieval models (512 ctx window), up to 8 192 for Jina-DE."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ChunkConfigPanel.tsx",
                        lineNumber: 135,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ToggleRow"], {
                        id: "repeat_table_header",
                        label: "Repeat Table Header",
                        paramKey: "hybrid_chunker_options.repeat_table_header",
                        checked: o.hybrid_chunker_options.repeat_table_header,
                        onChange: (v)=>onUpdate("hybrid_chunker_options.repeat_table_header", v),
                        tooltip: "When a table is split across multiple chunks, repeat the header row at the beginning of each continuation chunk. Keeps the column context intact for retrieval."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ChunkConfigPanel.tsx",
                        lineNumber: 146,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ToggleRow"], {
                        id: "merge_peers",
                        label: "Merge Peer Chunks",
                        paramKey: "hybrid_chunker_options.merge_peers",
                        checked: o.hybrid_chunker_options.merge_peers,
                        onChange: (v)=>onUpdate("hybrid_chunker_options.merge_peers", v),
                        tooltip: "Merge small sibling chunks at the same heading level into one larger chunk if their combined token count is still below max_tokens. Reduces the number of tiny orphan chunks."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ChunkConfigPanel.tsx",
                        lineNumber: 155,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ToggleRow"], {
                        id: "omit_header_on_overflow",
                        label: "Omit Header on Overflow",
                        paramKey: "hybrid_chunker_options.omit_header_on_overflow",
                        checked: o.hybrid_chunker_options.omit_header_on_overflow,
                        onChange: (v)=>onUpdate("hybrid_chunker_options.omit_header_on_overflow", v),
                        tooltip: "If a chunk's body content alone already exceeds max_tokens, skip the heading prefix rather than creating an oversized chunk. Use for documents with extremely long sections."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ChunkConfigPanel.tsx",
                        lineNumber: 164,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ToggleRow"], {
                        id: "always_emit_headings",
                        label: "Always Emit Headings",
                        paramKey: "hybrid_chunker_options.always_emit_headings",
                        checked: o.hybrid_chunker_options.always_emit_headings,
                        onChange: (v)=>onUpdate("hybrid_chunker_options.always_emit_headings", v),
                        tooltip: "Emit a standalone chunk for every heading element, even if the heading has no body text beneath it. Useful for navigation-heavy documents or indexes."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ChunkConfigPanel.tsx",
                        lineNumber: 173,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ChunkConfigPanel.tsx",
                lineNumber: 107,
                columnNumber: 9
            }, this),
            isHierarchical && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ConfigSection"], {
                icon: "⚙️",
                title: "HierarchicalChunker — Optionen",
                defaultOpen: true,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ToggleRow"], {
                        id: "hier_always_emit_headings",
                        label: "Always Emit Headings",
                        paramKey: "hierarchical_chunker_options.always_emit_headings",
                        checked: o.hierarchical_chunker_options.always_emit_headings,
                        onChange: (v)=>onUpdate("hierarchical_chunker_options.always_emit_headings", v),
                        tooltip: "Emit standalone chunks for headings with no body text. Without this, empty-body headings are merged into their next sibling chunk."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ChunkConfigPanel.tsx",
                        lineNumber: 187,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ToggleRow"], {
                        id: "merge_list_items",
                        label: "Merge List Items",
                        paramKey: "hierarchical_chunker_options.merge_list_items",
                        checked: o.hierarchical_chunker_options.merge_list_items,
                        onChange: (v)=>onUpdate("hierarchical_chunker_options.merge_list_items", v),
                        tooltip: "Merge consecutive list items at the same nesting level into a single chunk instead of one chunk per bullet point. Reduces fragmentation in documents with many bullet lists."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ChunkConfigPanel.tsx",
                        lineNumber: 196,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ChunkConfigPanel.tsx",
                lineNumber: 186,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ConfigSection"], {
                icon: "📝",
                title: "Serialization",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ToggleRow"], {
                        id: "include_headings_in_text",
                        label: "Include Headings in Text",
                        paramKey: "serialization.include_headings_in_text",
                        checked: o.serialization.include_headings_in_text,
                        onChange: (v)=>onUpdate("serialization.include_headings_in_text", v),
                        tooltip: "Prepend the full heading path (e.g. 'Chapter 1 > Section 2') to the embedded chunk text. Significantly improves retrieval accuracy for queries that reference section names or chapter titles."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ChunkConfigPanel.tsx",
                        lineNumber: 209,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ToggleRow"], {
                        id: "include_captions_in_text",
                        label: "Include Captions in Text",
                        paramKey: "serialization.include_captions_in_text",
                        checked: o.serialization.include_captions_in_text,
                        onChange: (v)=>onUpdate("serialization.include_captions_in_text", v),
                        tooltip: "Include figure and table captions in the chunk text that is embedded. Captions often contain the most information-dense description of a visual element."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ChunkConfigPanel.tsx",
                        lineNumber: 218,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ChunkConfigPanel.tsx",
                lineNumber: 208,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ConfigSection"], {
                icon: "🏷️",
                title: "Metadata Enrichment",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ToggleRow"], {
                        id: "add_doc_source",
                        label: "Source Filename",
                        paramKey: "metadata.add_doc_source",
                        checked: o.metadata.add_doc_source,
                        onChange: (v)=>onUpdate("metadata.add_doc_source", v),
                        tooltip: "Store the original document filename (e.g. 'lecture_01.pdf') in the Qdrant payload. Enables filename-level filtering when querying multiple documents in one collection."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ChunkConfigPanel.tsx",
                        lineNumber: 230,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ToggleRow"], {
                        id: "add_run_id",
                        label: "Docling Run ID",
                        paramKey: "metadata.add_run_id",
                        checked: o.metadata.add_run_id,
                        onChange: (v)=>onUpdate("metadata.add_run_id", v),
                        tooltip: "Store the Docling parse run ID that produced this document. Lets you trace every chunk back to the exact parsing run for reproducibility and debugging."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ChunkConfigPanel.tsx",
                        lineNumber: 239,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ToggleRow"], {
                        id: "add_page_numbers",
                        label: "Page Numbers",
                        paramKey: "metadata.add_page_numbers",
                        checked: o.metadata.add_page_numbers,
                        onChange: (v)=>onUpdate("metadata.add_page_numbers", v),
                        tooltip: "Extract and store the page number(s) that each chunk spans. Enables page-level citation generation — e.g. 'Source: page 4 of lecture_01.pdf'."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ChunkConfigPanel.tsx",
                        lineNumber: 248,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ToggleRow"], {
                        id: "add_headings",
                        label: "Heading Path",
                        paramKey: "metadata.add_headings",
                        checked: o.metadata.add_headings,
                        onChange: (v)=>onUpdate("metadata.add_headings", v),
                        tooltip: "Store the heading hierarchy above each chunk as an ordered list (e.g. ['Chapter 3', 'Section 3.2']). Enables course/chapter/section reference generation automatically per chunk."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ChunkConfigPanel.tsx",
                        lineNumber: 257,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ToggleRow"], {
                        id: "add_element_types",
                        label: "Element Types",
                        paramKey: "metadata.add_element_types",
                        checked: o.metadata.add_element_types,
                        onChange: (v)=>onUpdate("metadata.add_element_types", v),
                        tooltip: "Store a list of DocItem labels present in the chunk (e.g. ['text', 'table', 'figure']). Useful for content-type filtering — e.g. retrieve only chunks that contain tables."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ChunkConfigPanel.tsx",
                        lineNumber: 266,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ToggleRow"], {
                        id: "add_token_count",
                        label: "Token Count",
                        paramKey: "metadata.add_token_count",
                        checked: o.metadata.add_token_count,
                        onChange: (v)=>onUpdate("metadata.add_token_count", v),
                        tooltip: "Store the number of tokens in the chunk text in the payload. Useful for size-aware retrieval strategies and for inspecting chunk quality in the Vector DB Inspector."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ChunkConfigPanel.tsx",
                        lineNumber: 275,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginTop: 12
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "field__label",
                                style: {
                                    marginBottom: 6,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Custom Fields"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/ChunkConfigPanel.tsx",
                                        lineNumber: 290,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                        style: {
                                            fontSize: "0.7rem"
                                        },
                                        children: "metadata.custom_fields"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/ChunkConfigPanel.tsx",
                                        lineNumber: 291,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/ChunkConfigPanel.tsx",
                                lineNumber: 286,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontSize: "0.72rem",
                                    color: "var(--c-text-3)",
                                    marginBottom: 8,
                                    lineHeight: 1.5
                                },
                                children: [
                                    "Static key-value pairs added to every chunk payload — e.g. ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                        children: "course_id"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/ChunkConfigPanel.tsx",
                                        lineNumber: 302,
                                        columnNumber: 13
                                    }, this),
                                    ", ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                        children: "semester"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/ChunkConfigPanel.tsx",
                                        lineNumber: 302,
                                        columnNumber: 37
                                    }, this),
                                    ", ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                        children: "language"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/ChunkConfigPanel.tsx",
                                        lineNumber: 302,
                                        columnNumber: 60
                                    }, this),
                                    "."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/ChunkConfigPanel.tsx",
                                lineNumber: 293,
                                columnNumber: 11
                            }, this),
                            Object.entries(o.metadata.custom_fields).map(([k, v])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 6,
                                        marginBottom: 4
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                            style: {
                                                fontFamily: "var(--font-mono)",
                                                fontSize: "0.72rem",
                                                background: "var(--c-bg-3)",
                                                border: "1px solid var(--c-border)",
                                                padding: "2px 8px",
                                                borderRadius: 4,
                                                flex: 1,
                                                color: "var(--c-text-2)"
                                            },
                                            children: [
                                                k,
                                                ":",
                                                " ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        color: "var(--c-accent)"
                                                    },
                                                    children: String(v)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/ChunkConfigPanel.tsx",
                                                    lineNumber: 324,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/ChunkConfigPanel.tsx",
                                            lineNumber: 311,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>onRemoveCustomField(k),
                                            style: {
                                                background: "none",
                                                border: "none",
                                                color: "var(--c-error)",
                                                cursor: "pointer",
                                                fontSize: "0.9rem",
                                                lineHeight: 1,
                                                padding: "2px 4px"
                                            },
                                            title: `Remove ${k}`,
                                            children: "✕"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/ChunkConfigPanel.tsx",
                                            lineNumber: 326,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, k, true, {
                                    fileName: "[project]/src/components/ChunkConfigPanel.tsx",
                                    lineNumber: 307,
                                    columnNumber: 13
                                }, this)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 8
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: "flex",
                                            gap: 6,
                                            marginBottom: 4
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    flex: 1,
                                                    fontSize: "0.68rem",
                                                    color: "var(--c-text-3)",
                                                    fontWeight: 500,
                                                    textTransform: "uppercase",
                                                    letterSpacing: "0.06em"
                                                },
                                                children: "Key"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/ChunkConfigPanel.tsx",
                                                lineNumber: 348,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    flex: 1,
                                                    fontSize: "0.68rem",
                                                    color: "var(--c-text-3)",
                                                    fontWeight: 500,
                                                    textTransform: "uppercase",
                                                    letterSpacing: "0.06em"
                                                },
                                                children: "Value"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/ChunkConfigPanel.tsx",
                                                lineNumber: 349,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    width: 28
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/ChunkConfigPanel.tsx",
                                                lineNumber: 350,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/ChunkConfigPanel.tsx",
                                        lineNumber: 347,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: "flex",
                                            gap: 6,
                                            alignItems: "center"
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "text",
                                                className: "input",
                                                placeholder: "e.g. course_id",
                                                value: customKeyInput,
                                                onChange: (e)=>onCustomKeyChange(e.target.value),
                                                onKeyDown: (e)=>{
                                                    if (e.key === "Enter") onAddCustomField();
                                                },
                                                style: {
                                                    flex: 1,
                                                    fontSize: "0.8rem"
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/ChunkConfigPanel.tsx",
                                                lineNumber: 353,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "text",
                                                className: "input",
                                                placeholder: "e.g. ML101",
                                                value: customValInput,
                                                onChange: (e)=>onCustomValChange(e.target.value),
                                                onKeyDown: (e)=>{
                                                    if (e.key === "Enter") onAddCustomField();
                                                },
                                                style: {
                                                    flex: 1,
                                                    fontSize: "0.8rem"
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/ChunkConfigPanel.tsx",
                                                lineNumber: 362,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: onAddCustomField,
                                                disabled: !customKeyInput.trim() || !customValInput.trim(),
                                                title: "Add field (or press Enter)",
                                                style: {
                                                    width: 28,
                                                    height: 28,
                                                    flexShrink: 0,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    background: customKeyInput.trim() && customValInput.trim() ? "var(--c-accent)" : "var(--c-surface-2)",
                                                    border: "1px solid var(--c-border)",
                                                    borderRadius: "var(--r-sm)",
                                                    color: customKeyInput.trim() && customValInput.trim() ? "#fff" : "var(--c-text-3)",
                                                    cursor: customKeyInput.trim() && customValInput.trim() ? "pointer" : "not-allowed",
                                                    fontSize: "1rem",
                                                    lineHeight: 1,
                                                    transition: "background var(--t-fast), color var(--t-fast)"
                                                },
                                                children: "+"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/ChunkConfigPanel.tsx",
                                                lineNumber: 371,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/ChunkConfigPanel.tsx",
                                        lineNumber: 352,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/ChunkConfigPanel.tsx",
                                lineNumber: 345,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/ChunkConfigPanel.tsx",
                        lineNumber: 285,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ChunkConfigPanel.tsx",
                lineNumber: 229,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ConfigSection"], {
                icon: "🔢",
                title: "Embedding",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SelectField"], {
                        id: "embedding_mode",
                        label: "Mode",
                        paramKey: "embedding.mode",
                        value: o.embedding.mode,
                        options: [
                            {
                                value: "dense",
                                label: "Dense (semantic similarity)"
                            },
                            {
                                value: "sparse",
                                label: "Sparse (BM25 keyword)"
                            },
                            {
                                value: "hybrid",
                                label: "Hybrid (dense + sparse, enables RRF)"
                            }
                        ],
                        onChange: (v)=>onUpdate("embedding.mode", v),
                        tooltip: "dense: one semantic vector per chunk using a neural encoder. sparse: BM25 keyword-frequency vector (no model needed). hybrid: both — stored as named vectors in Qdrant, enabling Reciprocal Rank Fusion (RRF) at query time."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ChunkConfigPanel.tsx",
                        lineNumber: 407,
                        columnNumber: 9
                    }, this),
                    useDense && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SelectField"], {
                        id: "dense_model",
                        label: "Dense Model",
                        paramKey: "embedding.dense_model",
                        value: o.embedding.dense_model,
                        options: DENSE_MODELS,
                        onChange: (v)=>onUpdate("embedding.dense_model", v),
                        tooltip: "fastembed model for dense embedding. Downloaded automatically on first use — no API key required. Choose Jina-DE for German or multilingual documents. E5-Large gives the best retrieval quality but is 2.2 GB."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ChunkConfigPanel.tsx",
                        lineNumber: 422,
                        columnNumber: 11
                    }, this),
                    useSparse && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SelectField"], {
                        id: "sparse_model",
                        label: "Sparse Model",
                        paramKey: "embedding.sparse_model",
                        value: o.embedding.sparse_model,
                        options: [
                            {
                                value: "Qdrant/bm25",
                                label: "Qdrant/bm25 (BM25, language-aware)"
                            },
                            {
                                value: "prithivida/Splade_PP_en_v1",
                                label: "SPLADE++ (learned sparse, EN)"
                            }
                        ],
                        onChange: (v)=>onUpdate("embedding.sparse_model", v),
                        tooltip: "fastembed model for sparse embedding. Qdrant/bm25 is a classic BM25 term-frequency model — fast and language-aware. SPLADE++ is a learned sparse model with better recall but slower."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ChunkConfigPanel.tsx",
                        lineNumber: 434,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["NumberField"], {
                        id: "batch_size",
                        label: "Embedding Batch Size",
                        paramKey: "embedding.batch_size",
                        value: o.embedding.batch_size,
                        min: 1,
                        max: 512,
                        onChange: (v)=>onUpdate("embedding.batch_size", v ?? 32),
                        tooltip: "Number of chunks embedded per batch. Larger batches are faster but require more RAM. 32 is a safe default for most machines. Increase to 128+ if you have ≥32 GB RAM and a large document."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ChunkConfigPanel.tsx",
                        lineNumber: 448,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ChunkConfigPanel.tsx",
                lineNumber: 406,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ConfigSection"], {
                icon: "🗄️",
                title: "Qdrant Storage",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TextField"], {
                        id: "storage_path",
                        label: "Storage Path",
                        paramKey: "qdrant.storage_path",
                        value: o.qdrant.storage_path,
                        placeholder: "./qdrant_storage",
                        onChange: (v)=>onUpdate("qdrant.storage_path", v ?? "./qdrant_storage"),
                        tooltip: "Path to the on-disk Qdrant storage directory. Relative paths are resolved from the repo root. The same storage is shared between all Docling text collections and future ColPali image collections."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ChunkConfigPanel.tsx",
                        lineNumber: 462,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TextField"], {
                        id: "collection_name",
                        label: "Collection Name",
                        paramKey: "qdrant.collection_name",
                        value: o.qdrant.collection_name || null,
                        placeholder: "Auto-generated (docling_dense_YYYYMMDD…)",
                        onChange: (v)=>onUpdate("qdrant.collection_name", v ?? ""),
                        tooltip: "Name of the Qdrant collection to write chunks into. Leave empty to auto-generate a name from the run ID and embedding mode (e.g. 'docling_hybrid_20240901'). Use a fixed name to append multiple documents into the same collection."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ChunkConfigPanel.tsx",
                        lineNumber: 472,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ToggleRow"], {
                        id: "overwrite_collection",
                        label: "Overwrite Collection",
                        paramKey: "qdrant.overwrite_collection",
                        checked: o.qdrant.overwrite_collection,
                        onChange: (v)=>onUpdate("qdrant.overwrite_collection", v),
                        tooltip: "If ON and the collection already exists, delete it and start fresh before upserting. If OFF, new chunks are appended to the existing collection. Turn ON when re-indexing a document after a config change."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ChunkConfigPanel.tsx",
                        lineNumber: 482,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ToggleRow"], {
                        id: "on_disk_payload",
                        label: "On-Disk Payload",
                        paramKey: "qdrant.on_disk_payload",
                        checked: o.qdrant.on_disk_payload,
                        onChange: (v)=>onUpdate("qdrant.on_disk_payload", v),
                        tooltip: "Store chunk metadata (payload) on disk rather than in RAM. Recommended for collections with thousands of chunks. Slightly higher latency on reads but much lower peak memory usage."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ChunkConfigPanel.tsx",
                        lineNumber: 491,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ChunkConfigPanel.tsx",
                lineNumber: 461,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ChunkConfigPanel.tsx",
        lineNumber: 86,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/components/ui/Controls.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ConfigSection",
    ()=>ConfigSection,
    "MultiCheckField",
    ()=>MultiCheckField,
    "NumberField",
    ()=>NumberField,
    "SelectField",
    ()=>SelectField,
    "SliderField",
    ()=>SliderField,
    "TagListField",
    ()=>TagListField,
    "TextField",
    ()=>TextField,
    "TextareaField",
    ()=>TextareaField,
    "ToggleRow",
    ()=>ToggleRow,
    "Tooltip",
    ()=>Tooltip
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$dom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-dom.js [app-ssr] (ecmascript)");
"use client";
;
;
;
function ToggleRow({ id, label, paramKey, checked, onChange, tooltip }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "toggle-row",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "toggle-row__info",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "toggle-row__label",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            children: label
                        }, void 0, false, {
                            fileName: "[project]/src/components/ui/Controls.tsx",
                            lineNumber: 26,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                            className: "toggle-row__key",
                            children: paramKey
                        }, void 0, false, {
                            fileName: "[project]/src/components/ui/Controls.tsx",
                            lineNumber: 27,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Tooltip, {
                            text: tooltip
                        }, void 0, false, {
                            fileName: "[project]/src/components/ui/Controls.tsx",
                            lineNumber: 28,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/ui/Controls.tsx",
                    lineNumber: 25,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/ui/Controls.tsx",
                lineNumber: 24,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                className: "toggle-switch",
                htmlFor: id,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        id: id,
                        type: "checkbox",
                        checked: checked,
                        onChange: (e)=>onChange(e.target.checked)
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/Controls.tsx",
                        lineNumber: 32,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "toggle-switch__track"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/Controls.tsx",
                        lineNumber: 38,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "toggle-switch__thumb"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/Controls.tsx",
                        lineNumber: 39,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ui/Controls.tsx",
                lineNumber: 31,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/Controls.tsx",
        lineNumber: 23,
        columnNumber: 5
    }, this);
}
function SelectField({ id, label, paramKey, value, options, onChange, tooltip }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "field",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                htmlFor: id,
                className: "field__label",
                children: [
                    label,
                    " ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                        children: paramKey
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/Controls.tsx",
                        lineNumber: 66,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Tooltip, {
                        text: tooltip
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/Controls.tsx",
                        lineNumber: 67,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ui/Controls.tsx",
                lineNumber: 65,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                id: id,
                className: "select",
                value: value,
                onChange: (e)=>onChange(e.target.value),
                children: options.map((o)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                        value: o.value,
                        children: o.label
                    }, o.value, false, {
                        fileName: "[project]/src/components/ui/Controls.tsx",
                        lineNumber: 76,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/components/ui/Controls.tsx",
                lineNumber: 69,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/Controls.tsx",
        lineNumber: 64,
        columnNumber: 5
    }, this);
}
function SliderField({ id, label, paramKey, value, min, max, step, unit, onChange, tooltip }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "field",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                htmlFor: id,
                className: "field__label",
                children: [
                    label,
                    " ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                        children: paramKey
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/Controls.tsx",
                        lineNumber: 112,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Tooltip, {
                        text: tooltip
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/Controls.tsx",
                        lineNumber: 113,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ui/Controls.tsx",
                lineNumber: 111,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "slider-row",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        id: id,
                        type: "range",
                        className: "slider",
                        min: min,
                        max: max,
                        step: step,
                        value: value,
                        onChange: (e)=>onChange(parseFloat(e.target.value))
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/Controls.tsx",
                        lineNumber: 116,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "slider-value",
                        children: [
                            value,
                            unit
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/ui/Controls.tsx",
                        lineNumber: 126,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ui/Controls.tsx",
                lineNumber: 115,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/Controls.tsx",
        lineNumber: 110,
        columnNumber: 5
    }, this);
}
function NumberField({ id, label, paramKey, value, min, max, onChange, tooltip, nullable }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "field",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                htmlFor: id,
                className: "field__label",
                children: [
                    label,
                    " ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                        children: paramKey
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/Controls.tsx",
                        lineNumber: 160,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Tooltip, {
                        text: tooltip
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/Controls.tsx",
                        lineNumber: 161,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ui/Controls.tsx",
                lineNumber: 159,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                id: id,
                type: "number",
                className: "input",
                value: value ?? "",
                min: min,
                max: max,
                placeholder: nullable ? "null (no limit)" : "",
                onChange: (e)=>{
                    const raw = e.target.value;
                    if (nullable && raw === "") onChange(null);
                    else onChange(parseFloat(raw));
                }
            }, void 0, false, {
                fileName: "[project]/src/components/ui/Controls.tsx",
                lineNumber: 163,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/Controls.tsx",
        lineNumber: 158,
        columnNumber: 5
    }, this);
}
function TextField({ id, label, paramKey, value, placeholder, onChange, tooltip }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "field",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                htmlFor: id,
                className: "field__label",
                children: [
                    label,
                    " ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                        children: paramKey
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/Controls.tsx",
                        lineNumber: 202,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Tooltip, {
                        text: tooltip
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/Controls.tsx",
                        lineNumber: 203,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ui/Controls.tsx",
                lineNumber: 201,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                id: id,
                type: "text",
                className: "input",
                value: value ?? "",
                placeholder: placeholder ?? "null",
                onChange: (e)=>onChange(e.target.value || null)
            }, void 0, false, {
                fileName: "[project]/src/components/ui/Controls.tsx",
                lineNumber: 205,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/Controls.tsx",
        lineNumber: 200,
        columnNumber: 5
    }, this);
}
function TextareaField({ id, label, paramKey, value, onChange, tooltip }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "field",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                htmlFor: id,
                className: "field__label",
                children: [
                    label,
                    " ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                        children: paramKey
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/Controls.tsx",
                        lineNumber: 236,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Tooltip, {
                        text: tooltip
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/Controls.tsx",
                        lineNumber: 237,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ui/Controls.tsx",
                lineNumber: 235,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                id: id,
                className: "textarea",
                value: value,
                onChange: (e)=>onChange(e.target.value)
            }, void 0, false, {
                fileName: "[project]/src/components/ui/Controls.tsx",
                lineNumber: 239,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/Controls.tsx",
        lineNumber: 234,
        columnNumber: 5
    }, this);
}
function TagListField({ id, label, paramKey, values, onChange, tooltip }) {
    const [inputVal, setInputVal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const addTag = (val)=>{
        const trimmed = val.trim();
        if (trimmed && !values.includes(trimmed)) {
            onChange([
                ...values,
                trimmed
            ]);
        }
        setInputVal("");
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "field",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                htmlFor: id,
                className: "field__label",
                children: [
                    label,
                    " ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                        children: paramKey
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/Controls.tsx",
                        lineNumber: 278,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Tooltip, {
                        text: tooltip
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/Controls.tsx",
                        lineNumber: 279,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ui/Controls.tsx",
                lineNumber: 277,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "tag-input input",
                style: {
                    minHeight: 36,
                    cursor: "text"
                },
                onClick: ()=>document.getElementById(id)?.focus(),
                children: [
                    values.map((v)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "tag",
                            children: [
                                v,
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: "tag__remove",
                                    onClick: (e)=>{
                                        e.stopPropagation();
                                        onChange(values.filter((x)=>x !== v));
                                    },
                                    children: "×"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/ui/Controls.tsx",
                                    lineNumber: 289,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, v, true, {
                            fileName: "[project]/src/components/ui/Controls.tsx",
                            lineNumber: 287,
                            columnNumber: 11
                        }, this)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        id: id,
                        className: "tag-input__field",
                        value: inputVal,
                        placeholder: "Add language…",
                        onChange: (e)=>setInputVal(e.target.value),
                        onKeyDown: (e)=>{
                            if (e.key === "Enter" || e.key === ",") {
                                e.preventDefault();
                                addTag(inputVal);
                            } else if (e.key === "Backspace" && !inputVal && values.length > 0) {
                                onChange(values.slice(0, -1));
                            }
                        },
                        onBlur: ()=>{
                            if (inputVal) addTag(inputVal);
                        }
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/Controls.tsx",
                        lineNumber: 300,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ui/Controls.tsx",
                lineNumber: 281,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/Controls.tsx",
        lineNumber: 276,
        columnNumber: 5
    }, this);
}
function MultiCheckField({ label, paramKey, options, selected, onChange, tooltip }) {
    const toggle = (v)=>{
        if (selected.includes(v)) onChange(selected.filter((x)=>x !== v));
        else onChange([
            ...selected,
            v
        ]);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "field",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "field__label",
                children: [
                    label,
                    " ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                        children: paramKey
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/Controls.tsx",
                        lineNumber: 345,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Tooltip, {
                        text: tooltip
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/Controls.tsx",
                        lineNumber: 346,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ui/Controls.tsx",
                lineNumber: 344,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6
                },
                children: options.map((o)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        style: {
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "4px 10px",
                            borderRadius: 6,
                            border: `1px solid ${selected.includes(o.value) ? "var(--c-accent)" : "var(--c-border)"}`,
                            background: selected.includes(o.value) ? "var(--c-accent-glow)" : "var(--c-surface)",
                            cursor: "pointer",
                            fontSize: "0.78rem",
                            color: selected.includes(o.value) ? "var(--c-accent)" : "var(--c-text-2)",
                            transition: "all 120ms ease",
                            userSelect: "none"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "checkbox",
                                checked: selected.includes(o.value),
                                onChange: ()=>toggle(o.value),
                                style: {
                                    display: "none"
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/components/ui/Controls.tsx",
                                lineNumber: 367,
                                columnNumber: 13
                            }, this),
                            o.label
                        ]
                    }, o.value, true, {
                        fileName: "[project]/src/components/ui/Controls.tsx",
                        lineNumber: 350,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/components/ui/Controls.tsx",
                lineNumber: 348,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/Controls.tsx",
        lineNumber: 343,
        columnNumber: 5
    }, this);
}
function ConfigSection({ icon, title, badge, defaultOpen = false, children }) {
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(defaultOpen);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "config-section",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: "config-section__trigger",
                onClick: ()=>setOpen((p)=>!p),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "config-section__trigger-icon",
                        children: icon
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/Controls.tsx",
                        lineNumber: 400,
                        columnNumber: 9
                    }, this),
                    title,
                    badge && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "config-section__badge",
                        children: badge
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/Controls.tsx",
                        lineNumber: 402,
                        columnNumber: 19
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: `config-section__chevron ${open ? "open" : ""}`,
                        children: "▼"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/Controls.tsx",
                        lineNumber: 403,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ui/Controls.tsx",
                lineNumber: 399,
                columnNumber: 7
            }, this),
            open && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "config-section__content",
                children: children
            }, void 0, false, {
                fileName: "[project]/src/components/ui/Controls.tsx",
                lineNumber: 405,
                columnNumber: 16
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/Controls.tsx",
        lineNumber: 398,
        columnNumber: 5
    }, this);
}
function Tooltip({ text }) {
    const iconRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [visible, setVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [pos, setPos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        top: 0,
        left: 0
    });
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // Only use portals after hydration (avoids SSR mismatch)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setMounted(true);
    }, []);
    const show = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (!iconRef.current) return;
        const rect = iconRef.current.getBoundingClientRect();
        const bubbleWidth = 260;
        const bubbleEstimatedHeight = 120; // conservative estimate to avoid bottom overflow
        const gap = 10;
        const margin = 12; // min distance from viewport edges
        // --- Horizontal: prefer right of icon, flip left if it overflows ---
        let left = rect.right + gap;
        if (left + bubbleWidth > window.innerWidth - margin) {
            // Flip: appear to the left of the icon
            left = rect.left - bubbleWidth - gap;
        }
        // Final clamp: ensure bubble never escapes either horizontal edge
        left = Math.max(margin, Math.min(left, window.innerWidth - bubbleWidth - margin));
        // --- Vertical: centre on icon, clamp so bubble stays in viewport ---
        let top = rect.top + rect.height / 2;
        // Clamp so bubble doesn't overflow bottom
        if (top + bubbleEstimatedHeight / 2 > window.innerHeight - margin) {
            top = window.innerHeight - bubbleEstimatedHeight / 2 - margin;
        }
        // Clamp so bubble doesn't overflow top
        if (top - bubbleEstimatedHeight / 2 < margin) {
            top = bubbleEstimatedHeight / 2 + margin;
        }
        setPos({
            top,
            left
        });
        setVisible(true);
    }, []);
    const hide = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>setVisible(false), []);
    const bubble = visible && mounted ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$dom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            position: "fixed",
            top: pos.top,
            left: pos.left,
            transform: "translateY(-50%)",
            width: 260,
            padding: "10px 12px",
            background: "var(--c-surface-2)",
            border: "1px solid var(--c-border)",
            borderRadius: "var(--r-md)",
            fontSize: "0.75rem",
            color: "var(--c-text-2)",
            lineHeight: 1.55,
            zIndex: 9999,
            boxShadow: "var(--shadow-lg)",
            pointerEvents: "none",
            whiteSpace: "normal",
            wordBreak: "break-word"
        },
        children: text
    }, void 0, false, {
        fileName: "[project]/src/components/ui/Controls.tsx",
        lineNumber: 464,
        columnNumber: 5
    }, this), document.body) : null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                ref: iconRef,
                className: "tooltip-icon",
                onMouseEnter: show,
                onMouseLeave: hide,
                onFocus: show,
                onBlur: hide,
                tabIndex: 0,
                "aria-label": "More information",
                role: "button",
                children: "?"
            }, void 0, false, {
                fileName: "[project]/src/components/ui/Controls.tsx",
                lineNumber: 492,
                columnNumber: 7
            }, this),
            bubble
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/Controls.tsx",
        lineNumber: 491,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/hooks/useChunkStream.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_CHUNK_CONFIG",
    ()=>DEFAULT_CHUNK_CONFIG,
    "useChunkStream",
    ()=>useChunkStream
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
/**
 * useChunkStream — SSE hook for the chunk → embed → Qdrant upsert pipeline
 * -------------------------------------------------------------------------
 * Mirrors the pattern of useRunStream.ts but consumes the /api/chunk/run SSE.
 */ "use client";
;
const API_BASE = "http://localhost:8000";
const DEFAULT_CHUNK_CONFIG = {
    profile_name: "default-chunk",
    description: "Default chunking & vectorization configuration",
    source_run_id: "",
    chunker: "hybrid",
    hybrid_chunker_options: {
        tokenizer_model: "BAAI/bge-small-en-v1.5",
        max_tokens: 512,
        repeat_table_header: true,
        merge_peers: true,
        omit_header_on_overflow: false,
        always_emit_headings: false
    },
    hierarchical_chunker_options: {
        always_emit_headings: false,
        merge_list_items: true
    },
    serialization: {
        include_headings_in_text: true,
        include_captions_in_text: true
    },
    metadata: {
        add_doc_source: true,
        add_run_id: true,
        add_page_numbers: true,
        add_headings: true,
        add_element_types: true,
        add_token_count: true,
        custom_fields: {}
    },
    embedding: {
        mode: "dense",
        dense_model: "BAAI/bge-small-en-v1.5",
        sparse_model: "Qdrant/bm25",
        batch_size: 32
    },
    qdrant: {
        storage_path: "./qdrant_storage",
        collection_name: "",
        overwrite_collection: false,
        on_disk_payload: true
    }
};
function useChunkStream() {
    const [isRunning, setIsRunning] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [logs, setLogs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [progress, setProgress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [result, setResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [errorMessage, setErrorMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const abortRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const clearLogs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setLogs([]);
        setResult(null);
        setErrorMessage(null);
        setProgress(0);
    }, []);
    const startRun = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (config)=>{
        if (isRunning) return;
        setIsRunning(true);
        setLogs([]);
        setResult(null);
        setErrorMessage(null);
        setProgress(0);
        const abort = new AbortController();
        abortRef.current = abort;
        try {
            const res = await fetch(`${API_BASE}/api/chunk/run`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(config),
                signal: abort.signal
            });
            if (!res.ok || !res.body) {
                throw new Error(`Server returned ${res.status}`);
            }
            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";
            while(true){
                const { value, done } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, {
                    stream: true
                });
                // Process complete SSE events
                const lines = buffer.split("\n\n");
                buffer = lines.pop() ?? "";
                for (const block of lines){
                    const dataLine = block.trim();
                    if (!dataLine.startsWith("data:")) continue;
                    const raw = dataLine.slice(5).trim();
                    if (raw === "[DONE]") break;
                    // Progress events
                    if (raw.startsWith("__PROGRESS__=")) {
                        const pct = parseInt(raw.split("=")[1], 10);
                        if (!isNaN(pct)) setProgress(pct);
                        continue;
                    }
                    try {
                        const evt = JSON.parse(raw);
                        if (evt.log) {
                            setLogs((prev)=>[
                                    ...prev,
                                    evt.log
                                ]);
                        }
                        if (evt.result) {
                            setResult(evt.result);
                            if (evt.result.status === "error") {
                                setErrorMessage(evt.result.error ?? "Unknown error");
                            }
                        }
                    } catch  {
                        // plain text log line
                        if (raw) setLogs((prev)=>[
                                ...prev,
                                raw
                            ]);
                    }
                }
            }
        } catch (err) {
            if (err instanceof Error && err.name !== "AbortError") {
                setErrorMessage(err.message);
            }
        } finally{
            setIsRunning(false);
            abortRef.current = null;
        }
    }, [
        isRunning
    ]);
    const cancelRun = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        abortRef.current?.abort();
        setIsRunning(false);
        setLogs((prev)=>[
                ...prev,
                "⚠️ Run cancelled by user"
            ]);
    }, []);
    return {
        isRunning,
        logs,
        progress,
        result,
        errorMessage,
        startRun,
        cancelRun,
        clearLogs
    };
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
];

//# sourceMappingURL=src_0yqlnib._.js.map