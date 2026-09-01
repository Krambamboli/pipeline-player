(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/app/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * Main Dashboard Page
 * -------------------
 * Assembles all panels into the three-column application shell:
 *   LEFT:  Config Panel (all Docling parameters) + Profile Manager
 *   CENTER: Output Viewer (parsed document) + Run History
 *   RIGHT: Run Console (live log stream) + Run controls
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useConfig.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useRunStream$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useRunStream.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ConfigPanel$2f$index$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ConfigPanel/index.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ProfileManager$2f$index$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ProfileManager/index.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$RunConsole$2f$index$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/RunConsole/index.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$OutputViewer$2f$index$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/OutputViewer/index.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$RunHistory$2f$index$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/RunHistory/index.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
function Home() {
    _s();
    const [serverOk, setServerOk] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [historyTick, setHistoryTick] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [selectedRun, setSelectedRun] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Config state — manages active profile, debounced auto-save
    const { config, isSaving, isLoading, error: configError, updateField, switchProfile, saveAs } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useConfig"])("default");
    // Run stream state — SSE log streaming
    const { isRunning, logs, lastRunId, lastStatus, lastDuration, lastOutputFiles, lastOutputDir, errorMessage, startRun, clearLogs } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useRunStream$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRunStream"])();
    // Health check on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Home.useEffect": ()=>{
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["checkHealth"])().then({
                "Home.useEffect": ()=>setServerOk(true)
            }["Home.useEffect"]).catch({
                "Home.useEffect": ()=>setServerOk(false)
            }["Home.useEffect"]);
        }
    }["Home.useEffect"], []);
    // Refresh run history after each run completes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Home.useEffect": ()=>{
            if (lastStatus) setHistoryTick({
                "Home.useEffect": (t)=>t + 1
            }["Home.useEffect"]);
        }
    }["Home.useEffect"], [
        lastStatus
    ]);
    const handleRunHistorySelect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Home.useCallback[handleRunHistorySelect]": (run)=>{
            setSelectedRun(run);
        }
    }["Home.useCallback[handleRunHistorySelect]"], []);
    // Output source: prefer last stream result, fallback to history selection
    const displayDir = lastOutputDir ?? selectedRun?.output_dir ?? null;
    const displayFiles = lastOutputFiles.length > 0 ? lastOutputFiles : selectedRun?.output_files ?? [];
    const handleSelectFile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Home.useCallback[handleSelectFile]": (dir, file)=>{
            // The OutputViewer reads from the runId embedded in the dir name
            // Here we just ensure it has the latest dir/files
            setSelectedRun(null); // clear history selection so stream result takes priority
        }
    }["Home.useCallback[handleSelectFile]"], []);
    const statusDotClass = serverOk === null ? "" : serverOk ? isSaving ? "saving" : "connected" : "error";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "app-shell",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "topbar",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "topbar__logo",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "topbar__logo-icon",
                                children: "⚡"
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 84,
                                columnNumber: 11
                            }, this),
                            "Pipeline Player"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 83,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontSize: "0.7rem",
                            color: "var(--c-text-3)",
                            marginLeft: 8
                        },
                        children: "Docling & ColPali Benchmark Studio"
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 87,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "topbar__divider"
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 91,
                        columnNumber: 9
                    }, this),
                    config && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontSize: "0.75rem",
                            color: "var(--c-text-3)"
                        },
                        children: [
                            "Profile: ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                style: {
                                    color: "var(--c-text)"
                                },
                                children: config.profile_name
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 96,
                                columnNumber: 22
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 95,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "topbar__status",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `status-dot ${statusDotClass}`
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 102,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: serverOk === null ? "Connecting…" : serverOk ? isSaving ? "Saving…" : "Backend connected" : "Backend offline"
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 103,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 101,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 82,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                className: "panel panel--config",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "panel__header",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "panel__title",
                                children: "🛠 Docling Configuration"
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 115,
                                columnNumber: 11
                            }, this),
                            configError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontSize: "0.7rem",
                                    color: "var(--c-error)",
                                    marginLeft: "auto"
                                },
                                children: configError
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 117,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 114,
                        columnNumber: 9
                    }, this),
                    config && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ProfileManager$2f$index$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        currentProfile: config.profile_name,
                        onSwitch: switchProfile,
                        onSaveAs: saveAs
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 125,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "panel__body",
                        children: [
                            isLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    color: "var(--c-text-3)",
                                    fontSize: "0.8rem",
                                    textAlign: "center",
                                    padding: "32px 0"
                                },
                                children: "Loading config…"
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 134,
                                columnNumber: 13
                            }, this),
                            !isLoading && config && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ConfigPanel$2f$index$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                config: config,
                                onUpdate: updateField
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 139,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 132,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 113,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "panel panel--main",
                style: {
                    display: "flex",
                    flexDirection: "column"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            flex: 1,
                            overflow: "hidden",
                            display: "flex",
                            flexDirection: "column"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "panel__header",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "panel__title",
                                        children: "📄 Output Viewer"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 149,
                                        columnNumber: 13
                                    }, this),
                                    displayDir && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            marginLeft: "auto",
                                            fontSize: "0.7rem",
                                            color: "var(--c-text-3)",
                                            fontFamily: "var(--font-mono)"
                                        },
                                        children: displayDir
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 151,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 148,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    flex: 1,
                                    overflow: "hidden"
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$OutputViewer$2f$index$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    runDir: displayDir,
                                    outputFiles: displayFiles
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 157,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 156,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 147,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            maxHeight: 200,
                            overflow: "hidden",
                            borderTop: "1px solid var(--c-border)",
                            flexShrink: 0
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "panel__header",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "panel__title",
                                    children: "🕑 Run History"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 164,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 163,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "panel__body",
                                style: {
                                    padding: "8px 12px"
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$RunHistory$2f$index$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    refreshTrigger: historyTick,
                                    onSelect: handleRunHistorySelect,
                                    selectedRunId: selectedRun?.run_id ?? null
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 167,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 166,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 162,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 145,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                className: "panel panel--console",
                style: {
                    display: "flex",
                    flexDirection: "column"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "panel__header",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "panel__title",
                                children: "⚡ Run Console"
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 179,
                                columnNumber: 11
                            }, this),
                            logs.length > 0 && !isRunning && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 181,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 178,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            padding: "12px 16px",
                            borderBottom: "1px solid var(--c-border)",
                            flexShrink: 0
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                id: "run-pipeline-btn",
                                className: `run-btn ${isRunning ? "run-btn--running" : ""}`,
                                disabled: isRunning || !config || !serverOk,
                                onClick: ()=>config && startRun(config.profile_name),
                                children: isRunning ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "run-btn__spinner"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 200,
                                            columnNumber: 17
                                        }, this),
                                        "Running Pipeline…"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 199,
                                    columnNumber: 15
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: "▶ Run Pipeline"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 204,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 192,
                                columnNumber: 11
                            }, this),
                            lastStatus && !isRunning && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "stat-grid",
                                style: {
                                    marginTop: 10
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "stat-box",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "stat-box__label",
                                                children: "Duration"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 212,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "stat-box__value",
                                                children: [
                                                    lastDuration?.toFixed(2) ?? "—",
                                                    "s"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 213,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 211,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "stat-box",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "stat-box__label",
                                                children: "Status"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 216,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "stat-box__value",
                                                style: {
                                                    color: lastStatus === "success" ? "var(--c-success)" : "var(--c-error)",
                                                    fontSize: "0.9rem"
                                                },
                                                children: lastStatus === "success" ? "✅ OK" : "❌ Error"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 217,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 215,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 210,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 191,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            flex: 1,
                            overflow: "hidden",
                            display: "flex",
                            flexDirection: "column"
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$RunConsole$2f$index$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            logs: logs,
                            isRunning: isRunning,
                            lastStatus: lastStatus,
                            lastDuration: lastDuration,
                            lastOutputFiles: lastOutputFiles,
                            lastOutputDir: lastOutputDir,
                            errorMessage: errorMessage,
                            onSelectFile: handleSelectFile
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 230,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 229,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 177,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/page.tsx",
        lineNumber: 79,
        columnNumber: 5
    }, this);
}
_s(Home, "JwiyU0psFJ/P4wSSbRWB8F+k8bs=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useConfig"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useRunStream$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRunStream"]
    ];
});
_c = Home;
var _c;
__turbopack_context__.k.register(_c, "Home");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ConfigPanel/index.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ConfigPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/Controls.tsx [app-client] (ecmascript)");
"use client";
;
;
function ConfigPanel({ config, onUpdate }) {
    const o = config.pdf_options;
    const p = (path)=>`pdf_options.${path}`;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: "flex",
            flexDirection: "column",
            gap: 8
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ConfigSection"], {
                icon: "⚡",
                title: "Core Pipeline",
                defaultOpen: true,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ToggleRow"], {
                        id: "do_ocr",
                        label: "Enable OCR",
                        paramKey: "do_ocr",
                        checked: o.do_ocr,
                        onChange: (v)=>onUpdate(p("do_ocr"), v),
                        tooltip: "Run the selected OCR engine on pages identified as scanned or image-based. Disable to rely only on native PDF text extraction — much faster for text-based PDFs."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConfigPanel/index.tsx",
                        lineNumber: 38,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ToggleRow"], {
                        id: "do_table_structure",
                        label: "Parse Table Structure",
                        paramKey: "do_table_structure",
                        checked: o.do_table_structure,
                        onChange: (v)=>onUpdate(p("do_table_structure"), v),
                        tooltip: "Enable AI-powered table detection and cell structure parsing using TableTransformer/TATR. Produces structured table objects with rows, columns, and cell content. Disable for text-only documents."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConfigPanel/index.tsx",
                        lineNumber: 47,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ToggleRow"], {
                        id: "do_chart_extraction",
                        label: "Chart Data Extraction",
                        paramKey: "do_chart_extraction",
                        checked: o.do_chart_extraction,
                        onChange: (v)=>onUpdate(p("do_chart_extraction"), v),
                        tooltip: "Experimental: extract underlying data from bar charts, line graphs, and pie charts into structured tables. Significantly increases processing time. Requires chart_extraction_options to be configured."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConfigPanel/index.tsx",
                        lineNumber: 56,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ToggleRow"], {
                        id: "do_code_enrichment",
                        label: "Code Block Enrichment",
                        paramKey: "do_code_enrichment",
                        checked: o.do_code_enrichment,
                        onChange: (v)=>onUpdate(p("do_code_enrichment"), v),
                        tooltip: "Apply a language model to detected code blocks to identify the programming language and produce structured code elements with syntax awareness instead of plain text."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConfigPanel/index.tsx",
                        lineNumber: 65,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ToggleRow"], {
                        id: "do_formula_enrichment",
                        label: "Formula (LaTeX) Enrichment",
                        paramKey: "do_formula_enrichment",
                        checked: o.do_formula_enrichment,
                        onChange: (v)=>onUpdate(p("do_formula_enrichment"), v),
                        tooltip: "Convert detected mathematical expressions to LaTeX markup. Requires a formula recognition model. Increases processing time significantly on math-heavy documents like scientific papers."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConfigPanel/index.tsx",
                        lineNumber: 74,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ToggleRow"], {
                        id: "do_picture_classification",
                        label: "Classify Pictures",
                        paramKey: "do_picture_classification",
                        checked: o.do_picture_classification,
                        onChange: (v)=>onUpdate(p("do_picture_classification"), v),
                        tooltip: "Label detected figures as photograph, chart, diagram, logo, etc. The classification is stored as metadata on each picture element. Useful for routing different image types to specialised downstream processors."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConfigPanel/index.tsx",
                        lineNumber: 83,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ToggleRow"], {
                        id: "do_picture_description",
                        label: "Generate Picture Captions",
                        paramKey: "do_picture_description",
                        checked: o.do_picture_description,
                        onChange: (v)=>onUpdate(p("do_picture_description"), v),
                        tooltip: "Run a vision-language model on each detected figure to generate a natural language description. Captions are stored as annotations. Configure the VLM in the 'Enrichment' section below."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConfigPanel/index.tsx",
                        lineNumber: 92,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "divider"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConfigPanel/index.tsx",
                        lineNumber: 101,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ToggleRow"], {
                        id: "force_backend_text",
                        label: "Force Backend Text (Fast Mode)",
                        paramKey: "force_backend_text",
                        checked: o.force_backend_text,
                        onChange: (v)=>onUpdate(p("force_backend_text"), v),
                        tooltip: "Bypass the layout analysis model entirely and use only the PDF backend's native text extraction. Extremely fast, but loses all layout intelligence: no reading order correction, no heading detection, no table parsing."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConfigPanel/index.tsx",
                        lineNumber: 103,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ToggleRow"], {
                        id: "enable_remote_services",
                        label: "Allow Remote Services",
                        paramKey: "enable_remote_services",
                        checked: o.enable_remote_services,
                        onChange: (v)=>onUpdate(p("enable_remote_services"), v),
                        tooltip: "Permit Docling to call remote API endpoints for enrichment tasks (e.g., a hosted VLM for picture descriptions). Keep OFF for air-gapped environments or strict data privacy requirements."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConfigPanel/index.tsx",
                        lineNumber: 112,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ToggleRow"], {
                        id: "allow_external_plugins",
                        label: "Allow External Plugins",
                        paramKey: "allow_external_plugins",
                        checked: o.allow_external_plugins,
                        onChange: (v)=>onUpdate(p("allow_external_plugins"), v),
                        tooltip: "Allow loading third-party Docling plugins from the Python environment. Disable in production to prevent unexpected behaviour from untrusted plugin code."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConfigPanel/index.tsx",
                        lineNumber: 121,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NumberField"], {
                        id: "document_timeout",
                        label: "Document Timeout",
                        paramKey: "document_timeout",
                        value: o.document_timeout,
                        min: 0,
                        onChange: (v)=>onUpdate(p("document_timeout"), v),
                        tooltip: "Maximum wall-clock seconds allowed to process a single document. If exceeded, conversion aborts with an error. Leave empty (null) for no timeout — suitable for development but risky in batch processing.",
                        nullable: true
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConfigPanel/index.tsx",
                        lineNumber: 130,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextField"], {
                        id: "artifacts_path",
                        label: "Model Artifacts Path",
                        paramKey: "artifacts_path",
                        value: o.artifacts_path,
                        placeholder: "null — auto-download",
                        onChange: (v)=>onUpdate(p("artifacts_path"), v),
                        tooltip: "Local filesystem path to a pre-downloaded Docling model cache. Normally Docling downloads model weights on first use from HuggingFace Hub. Set this for offline/air-gapped environments."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConfigPanel/index.tsx",
                        lineNumber: 141,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ConfigPanel/index.tsx",
                lineNumber: 36,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ConfigSection"], {
                icon: "🔍",
                title: "OCR Options",
                badge: "requires do_ocr",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectField"], {
                        id: "ocr_engine",
                        label: "OCR Engine",
                        paramKey: "ocr_options.kind",
                        value: o.ocr_options.kind,
                        options: [
                            {
                                value: "easyocr",
                                label: "EasyOCR (GPU-accelerated, 80+ languages)"
                            },
                            {
                                value: "rapidocr",
                                label: "RapidOCR (fast, CPU-friendly)"
                            },
                            {
                                value: "tesseract",
                                label: "Tesseract (classic, via Python bindings)"
                            },
                            {
                                value: "tesseract_cli",
                                label: "Tesseract CLI (subprocess-based)"
                            },
                            {
                                value: "ocrmypdf",
                                label: "OCRmyPDF (searchable PDF output)"
                            }
                        ],
                        onChange: (v)=>onUpdate(p("ocr_options.kind"), v),
                        tooltip: "The OCR backend engine. EasyOCR handles 80+ languages with GPU support. RapidOCR is optimised for CPU inference. Tesseract is the classic open-source engine. OCRmyPDF produces a searchable PDF as a side effect."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConfigPanel/index.tsx",
                        lineNumber: 154,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TagListField"], {
                        id: "ocr_lang",
                        label: "Recognition Languages",
                        paramKey: "ocr_options.lang",
                        values: o.ocr_options.lang,
                        onChange: (v)=>onUpdate(p("ocr_options.lang"), v),
                        tooltip: "ISO language codes to load into the OCR engine (e.g. 'en', 'de', 'fr', 'zh'). Adding more languages increases accuracy for multilingual documents but also increases model loading time and memory usage."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConfigPanel/index.tsx",
                        lineNumber: 170,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ToggleRow"], {
                        id: "force_full_page_ocr",
                        label: "Force Full-Page OCR",
                        paramKey: "ocr_options.force_full_page_ocr",
                        checked: o.ocr_options.force_full_page_ocr,
                        onChange: (v)=>onUpdate(p("ocr_options.force_full_page_ocr"), v),
                        tooltip: "When enabled, OCR is run on the entire page even if the page has a native text layer. Useful when the embedded text layer is garbled, misaligned, or in a different encoding than the visible text."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConfigPanel/index.tsx",
                        lineNumber: 179,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SliderField"], {
                        id: "bitmap_threshold",
                        label: "Bitmap Area Threshold",
                        paramKey: "ocr_options.bitmap_area_threshold",
                        value: o.ocr_options.bitmap_area_threshold,
                        min: 0,
                        max: 1,
                        step: 0.01,
                        onChange: (v)=>onUpdate(p("ocr_options.bitmap_area_threshold"), v),
                        tooltip: "Minimum fraction of a page that must be covered by bitmap content before OCR is triggered on that page. 0.05 = OCR activates if >5% of the page is image-based. Lower values = more aggressive OCR triggering."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConfigPanel/index.tsx",
                        lineNumber: 188,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NumberField"], {
                        id: "ocr_batch_size",
                        label: "OCR Batch Size",
                        paramKey: "ocr_batch_size",
                        value: o.ocr_batch_size,
                        min: 1,
                        max: 64,
                        onChange: (v)=>onUpdate(p("ocr_batch_size"), v ?? 4),
                        tooltip: "Number of page crops processed simultaneously by the OCR engine. Higher values improve GPU throughput at the cost of more VRAM. Reduce on CPU-only systems or if you encounter out-of-memory errors."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConfigPanel/index.tsx",
                        lineNumber: 200,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ConfigPanel/index.tsx",
                lineNumber: 153,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ConfigSection"], {
                icon: "📊",
                title: "Table Structure",
                badge: "requires do_table_structure",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectField"], {
                        id: "table_mode",
                        label: "Parser Mode",
                        paramKey: "table_structure_options.mode",
                        value: o.table_structure_options.mode,
                        options: [
                            {
                                value: "fast",
                                label: "Fast — lightweight model, lower latency"
                            },
                            {
                                value: "accurate",
                                label: "Accurate — TableTransformer, handles merged cells"
                            }
                        ],
                        onChange: (v)=>onUpdate(p("table_structure_options.mode"), v),
                        tooltip: "'fast' uses a lightweight model optimised for throughput. 'accurate' uses TableTransformer (TATR) for higher fidelity on complex tables with spanning cells, rotated headers, and multi-level column structures. Accurate mode adds 2-4× latency per table."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConfigPanel/index.tsx",
                        lineNumber: 214,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ToggleRow"], {
                        id: "do_cell_matching",
                        label: "Cell Text Matching",
                        paramKey: "table_structure_options.do_cell_matching",
                        checked: o.table_structure_options.do_cell_matching,
                        onChange: (v)=>onUpdate(p("table_structure_options.do_cell_matching"), v),
                        tooltip: "When enabled, Docling matches detected table cell bounding boxes back to the PDF's native text runs, producing higher-quality cell text. Disable if you see duplicate or misaligned content in table cells (usually caused by complex table backgrounds)."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConfigPanel/index.tsx",
                        lineNumber: 227,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NumberField"], {
                        id: "table_batch_size",
                        label: "Table Batch Size",
                        paramKey: "table_batch_size",
                        value: o.table_batch_size,
                        min: 1,
                        max: 64,
                        onChange: (v)=>onUpdate(p("table_batch_size"), v ?? 4),
                        tooltip: "Number of table regions processed simultaneously by the table structure model. Tune based on available GPU memory — higher values improve throughput but require more VRAM."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConfigPanel/index.tsx",
                        lineNumber: 236,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ConfigPanel/index.tsx",
                lineNumber: 213,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ConfigSection"], {
                icon: "🖼️",
                title: "Image Generation",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ToggleRow"], {
                        id: "generate_page_images",
                        label: "Generate Page Images",
                        paramKey: "generate_page_images",
                        checked: o.generate_page_images,
                        onChange: (v)=>onUpdate(p("generate_page_images"), v),
                        tooltip: "Render each PDF page as a raster image and embed it in the output document. Required for ColPali multimodal retrieval (which operates on page screenshots). Significantly increases output file size and memory usage."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConfigPanel/index.tsx",
                        lineNumber: 250,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ToggleRow"], {
                        id: "generate_picture_images",
                        label: "Extract Figure Images",
                        paramKey: "generate_picture_images",
                        checked: o.generate_picture_images,
                        onChange: (v)=>onUpdate(p("generate_picture_images"), v),
                        tooltip: "Crop and extract each detected figure or picture as a standalone image embedded in the output. Enables downstream vision pipelines to process individual figures without re-rendering full pages."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConfigPanel/index.tsx",
                        lineNumber: 259,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ToggleRow"], {
                        id: "generate_table_images",
                        label: "Render Table Images",
                        paramKey: "generate_table_images",
                        checked: o.generate_table_images,
                        onChange: (v)=>onUpdate(p("generate_table_images"), v),
                        tooltip: "Render each detected table region as a standalone image. Useful as a visual fallback when structured cell text extraction is unreliable, or for visual comparison with the original table appearance."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConfigPanel/index.tsx",
                        lineNumber: 268,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SliderField"], {
                        id: "images_scale",
                        label: "Image Scale (DPI multiplier)",
                        paramKey: "images_scale",
                        value: o.images_scale,
                        min: 0.25,
                        max: 4.0,
                        step: 0.25,
                        unit: "×",
                        onChange: (v)=>onUpdate(p("images_scale"), v),
                        tooltip: "DPI scale factor for all rendered images. 1.0 = 72 DPI (screen quality). 2.0 = 144 DPI (HiDPI/Retina quality). 4.0 = 288 DPI (print quality). Higher values produce sharper images but increase file size and memory usage proportionally."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConfigPanel/index.tsx",
                        lineNumber: 277,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ToggleRow"], {
                        id: "generate_parsed_pages",
                        label: "Include Parsed Page Debug Data",
                        paramKey: "generate_parsed_pages",
                        checked: o.generate_parsed_pages,
                        onChange: (v)=>onUpdate(p("generate_parsed_pages"), v),
                        tooltip: "Include raw layout detection results (bounding boxes, element labels) in the output document before post-processing. Useful for debugging layout model predictions or understanding why certain content was misclassified."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConfigPanel/index.tsx",
                        lineNumber: 290,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ConfigPanel/index.tsx",
                lineNumber: 249,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ConfigSection"], {
                icon: "📐",
                title: "Layout Options",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ToggleRow"], {
                        id: "keep_images",
                        label: "Preserve Images in Output",
                        paramKey: "layout_options.keep_images",
                        checked: o.layout_options.keep_images,
                        onChange: (v)=>onUpdate(p("layout_options.keep_images"), v),
                        tooltip: "When enabled, detected image regions are preserved as picture elements in the parsed document. Disable to strip all images from the output, producing a text-only result with reduced file size."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConfigPanel/index.tsx",
                        lineNumber: 302,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ToggleRow"], {
                        id: "use_legacy_layout",
                        label: "Use Legacy Layout (Rule-based)",
                        paramKey: "layout_options.use_legacy_layout",
                        checked: o.layout_options.use_legacy_layout,
                        onChange: (v)=>onUpdate(p("layout_options.use_legacy_layout"), v),
                        tooltip: "Falls back to older rule-based layout heuristics instead of the neural layout model. Enable only for simple, well-structured single-column documents where the AI model produces incorrect results (e.g., single-column academic papers with simple formatting)."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConfigPanel/index.tsx",
                        lineNumber: 311,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NumberField"], {
                        id: "layout_batch_size",
                        label: "Layout Batch Size",
                        paramKey: "layout_batch_size",
                        value: o.layout_batch_size,
                        min: 1,
                        max: 64,
                        onChange: (v)=>onUpdate(p("layout_batch_size"), v ?? 4),
                        tooltip: "Number of pages processed simultaneously by the layout analysis model. Increasing this improves GPU utilisation but requires more VRAM. Reduce if you encounter CUDA out-of-memory errors on large documents."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConfigPanel/index.tsx",
                        lineNumber: 320,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SliderField"], {
                        id: "heading_depth",
                        label: "Heading Hierarchy Depth",
                        paramKey: "heading_hierarchy_options.hierarchy_expansion_depth",
                        value: o.heading_hierarchy_options.hierarchy_expansion_depth,
                        min: 1,
                        max: 6,
                        step: 1,
                        onChange: (v)=>onUpdate(p("heading_hierarchy_options.hierarchy_expansion_depth"), v),
                        tooltip: "Maximum heading nesting depth inferred from font size and style signals. Depth 3 constructs H1→H2→H3 levels. Increasing depth produces finer-grained document structure but may over-segment documents with inconsistent formatting."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConfigPanel/index.tsx",
                        lineNumber: 331,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ConfigPanel/index.tsx",
                lineNumber: 301,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ConfigSection"], {
                icon: "✨",
                title: "Enrichment Models",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "section-label",
                        children: "Picture Description VLM"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConfigPanel/index.tsx",
                        lineNumber: 346,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectField"], {
                        id: "picture_desc_kind",
                        label: "VLM Backend",
                        paramKey: "picture_description_options.kind",
                        value: o.picture_description_options.kind,
                        options: [
                            {
                                value: "disabled",
                                label: "Disabled (no captions)"
                            },
                            {
                                value: "granite_vision",
                                label: "Granite Vision (IBM, local)"
                            },
                            {
                                value: "api",
                                label: "Remote API endpoint"
                            }
                        ],
                        onChange: (v)=>onUpdate(p("picture_description_options.kind"), v),
                        tooltip: "Vision-language model backend for generating picture captions. 'granite_vision' runs locally using IBM Granite Vision. 'api' calls a remote VLM endpoint (requires enable_remote_services). 'disabled' skips captioning entirely."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConfigPanel/index.tsx",
                        lineNumber: 347,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextareaField"], {
                        id: "picture_desc_prompt",
                        label: "Caption Prompt",
                        paramKey: "picture_description_options.prompt",
                        value: o.picture_description_options.prompt,
                        onChange: (v)=>onUpdate(p("picture_description_options.prompt"), v),
                        tooltip: "The prompt sent to the VLM for each detected picture. Customise for domain-specific extraction — e.g., 'Identify all chemical structures and their IUPAC names' for chemistry documents, or 'Describe all axes, legend, and data trends' for charts."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConfigPanel/index.tsx",
                        lineNumber: 360,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "divider"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConfigPanel/index.tsx",
                        lineNumber: 369,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "section-label",
                        children: "Picture Classification"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConfigPanel/index.tsx",
                        lineNumber: 370,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectField"], {
                        id: "picture_class_kind",
                        label: "Classification Model",
                        paramKey: "picture_classification_options.kind",
                        value: o.picture_classification_options.kind,
                        options: [
                            {
                                value: "disabled",
                                label: "Disabled"
                            },
                            {
                                value: "docling",
                                label: "Docling built-in classifier"
                            }
                        ],
                        onChange: (v)=>onUpdate(p("picture_classification_options.kind"), v),
                        tooltip: "Model for classifying detected pictures into categories: photograph, chart, diagram, logo, table, etc. The label is stored as metadata on each picture element for downstream routing."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConfigPanel/index.tsx",
                        lineNumber: 371,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "divider"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConfigPanel/index.tsx",
                        lineNumber: 384,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "section-label",
                        children: "Code & Formula Recognition"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConfigPanel/index.tsx",
                        lineNumber: 385,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectField"], {
                        id: "code_formula_kind",
                        label: "Code/Formula Model",
                        paramKey: "code_formula_options.kind",
                        value: o.code_formula_options.kind,
                        options: [
                            {
                                value: "disabled",
                                label: "Disabled (plain text)"
                            },
                            {
                                value: "granite",
                                label: "Granite (IBM, local)"
                            }
                        ],
                        onChange: (v)=>onUpdate(p("code_formula_options.kind"), v),
                        tooltip: "Model for enriching code blocks and mathematical formulas. When enabled, code blocks are structured with language labels, and math expressions are converted to LaTeX. Requires additional model downloads on first use."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConfigPanel/index.tsx",
                        lineNumber: 386,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "divider"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConfigPanel/index.tsx",
                        lineNumber: 399,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "section-label",
                        children: "Chart Data Extraction"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConfigPanel/index.tsx",
                        lineNumber: 400,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectField"], {
                        id: "chart_extract_kind",
                        label: "Chart Extraction Model",
                        paramKey: "chart_extraction_options.kind",
                        value: o.chart_extraction_options.kind,
                        options: [
                            {
                                value: "disabled",
                                label: "Disabled (charts as images)"
                            },
                            {
                                value: "docling",
                                label: "Docling built-in chart extractor"
                            }
                        ],
                        onChange: (v)=>onUpdate(p("chart_extraction_options.kind"), v),
                        tooltip: "Automated data extraction from bar charts, line graphs, and pie charts into structured tables. When enabled, chart data becomes queryable text rather than opaque images. Experimental feature — adds significant processing time."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConfigPanel/index.tsx",
                        lineNumber: 401,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ConfigPanel/index.tsx",
                lineNumber: 345,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ConfigSection"], {
                icon: "🚀",
                title: "Accelerator & Performance",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectField"], {
                        id: "accel_device",
                        label: "Inference Device",
                        paramKey: "accelerator_options.device",
                        value: o.accelerator_options.device,
                        options: [
                            {
                                value: "cpu",
                                label: "CPU (works everywhere)"
                            },
                            {
                                value: "cuda",
                                label: "CUDA (NVIDIA GPU)"
                            },
                            {
                                value: "mps",
                                label: "MPS (Apple Silicon — M1/M2/M3/M4)"
                            }
                        ],
                        onChange: (v)=>onUpdate(p("accelerator_options.device"), v),
                        tooltip: "Hardware device for PyTorch model inference. CPU works universally. CUDA requires an NVIDIA GPU with matching drivers. MPS uses Apple Silicon's Metal Performance Shaders. GPU inference is 5–20× faster for OCR and table structure models."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConfigPanel/index.tsx",
                        lineNumber: 417,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SliderField"], {
                        id: "num_threads",
                        label: "CPU Threads",
                        paramKey: "accelerator_options.num_threads",
                        value: o.accelerator_options.num_threads,
                        min: 1,
                        max: 32,
                        step: 1,
                        onChange: (v)=>onUpdate(p("accelerator_options.num_threads"), v),
                        tooltip: "Number of CPU threads for PyTorch operations. Only effective when device=cpu. Higher values can improve throughput on multi-core machines up to a saturation point (typically 8–16 threads on modern CPUs)."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConfigPanel/index.tsx",
                        lineNumber: 431,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "divider"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConfigPanel/index.tsx",
                        lineNumber: 443,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "section-label",
                        children: "Queue & Pipeline Tuning"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConfigPanel/index.tsx",
                        lineNumber: 444,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NumberField"], {
                        id: "queue_max_size",
                        label: "Queue Max Size",
                        paramKey: "queue_max_size",
                        value: o.queue_max_size,
                        min: 1,
                        onChange: (v)=>onUpdate(p("queue_max_size"), v ?? 128),
                        tooltip: "Maximum number of page items buffered between pipeline stages. Larger values allow more in-flight work between model stages at the cost of higher memory usage during processing."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConfigPanel/index.tsx",
                        lineNumber: 446,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NumberField"], {
                        id: "batch_polling",
                        label: "Batch Poll Interval (s)",
                        paramKey: "batch_polling_interval_seconds",
                        value: o.batch_polling_interval_seconds,
                        min: 0.01,
                        onChange: (v)=>onUpdate(p("batch_polling_interval_seconds"), v ?? 0.5),
                        tooltip: "How frequently (in seconds) the pipeline checks each stage for completed batches. Lower values reduce latency between stages but increase CPU overhead. The default of 0.5s is suitable for most use cases."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConfigPanel/index.tsx",
                        lineNumber: 456,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NumberField"], {
                        id: "stage_timeout",
                        label: "Stage Shutdown Timeout (s)",
                        paramKey: "stage_shutdown_timeout_seconds",
                        value: o.stage_shutdown_timeout_seconds,
                        min: 0.5,
                        onChange: (v)=>onUpdate(p("stage_shutdown_timeout_seconds"), v ?? 5.0),
                        tooltip: "Maximum seconds to wait for a pipeline stage to flush its queue and shut down after processing completes. Increase this value if you see incomplete output on very large documents (100+ pages)."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConfigPanel/index.tsx",
                        lineNumber: 466,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ConfigPanel/index.tsx",
                lineNumber: 416,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ConfigSection"], {
                icon: "📤",
                title: "Output Formats",
                defaultOpen: true,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MultiCheckField"], {
                        label: "Generate Output Formats",
                        paramKey: "output.formats",
                        options: [
                            {
                                value: "markdown",
                                label: "Markdown (.md)"
                            },
                            {
                                value: "json",
                                label: "JSON (.json)"
                            },
                            {
                                value: "doctags",
                                label: "DocTags (.doctags)"
                            },
                            {
                                value: "text",
                                label: "Plain Text (.txt)"
                            },
                            {
                                value: "html",
                                label: "HTML (.html)"
                            }
                        ],
                        selected: config.output.formats,
                        onChange: (v)=>onUpdate("output.formats", v),
                        tooltip: "Select all output formats to generate for each run. Markdown and JSON are recommended for most RAG pipelines. DocTags is Docling's token format for fine-tuning. HTML requires a recent Docling version."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConfigPanel/index.tsx",
                        lineNumber: 479,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Controls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextField"], {
                        id: "profile_desc",
                        label: "Profile Description",
                        paramKey: "description",
                        value: config.description,
                        placeholder: "Describe what this config is optimised for…",
                        onChange: (v)=>onUpdate("description", v ?? ""),
                        tooltip: "A human-readable description of what this configuration profile is tuned for. Stored alongside every run output for reproducibility documentation."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConfigPanel/index.tsx",
                        lineNumber: 494,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ConfigPanel/index.tsx",
                lineNumber: 478,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ConfigPanel/index.tsx",
        lineNumber: 33,
        columnNumber: 5
    }, this);
}
_c = ConfigPanel;
var _c;
__turbopack_context__.k.register(_c, "ConfigPanel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/OutputViewer/index.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>OutputViewer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * OutputViewer — displays the parsed document content in tabbed view.
 * Fetches file content from the backend when a run file is selected.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function OutputViewer({ runDir, outputFiles }) {
    _s();
    const [activeFile, setActiveFile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [content, setContent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Extract run_id from the dir path (e.g., "outputs/run_20240901_143000_default")
    const runId = runDir?.split("/").pop()?.replace("run_", "") ?? null;
    // Auto-select first non-config file when files change
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "OutputViewer.useEffect": ()=>{
            const firstOutput = outputFiles.find({
                "OutputViewer.useEffect.firstOutput": (f)=>!f.endsWith(".yaml") && !f.endsWith(".log")
            }["OutputViewer.useEffect.firstOutput"]);
            if (firstOutput) setActiveFile(firstOutput);
        }
    }["OutputViewer.useEffect"], [
        outputFiles
    ]);
    // Fetch file content when active file changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "OutputViewer.useEffect": ()=>{
            if (!runId || !activeFile) {
                setContent(null);
                return;
            }
            setLoading(true);
            setError(null);
            fetch((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRunFileUrl"])(runId, activeFile)).then({
                "OutputViewer.useEffect": (r)=>{
                    if (!r.ok) throw new Error(`HTTP ${r.status}`);
                    return r.text();
                }
            }["OutputViewer.useEffect"]).then({
                "OutputViewer.useEffect": (text)=>setContent(text)
            }["OutputViewer.useEffect"]).catch({
                "OutputViewer.useEffect": (e)=>setError(e.message)
            }["OutputViewer.useEffect"]).finally({
                "OutputViewer.useEffect": ()=>setLoading(false)
            }["OutputViewer.useEffect"]);
        }
    }["OutputViewer.useEffect"], [
        runId,
        activeFile
    ]);
    if (!runDir || outputFiles.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "output-viewer",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "output-placeholder",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "output-placeholder__icon",
                        children: "📄"
                    }, void 0, false, {
                        fileName: "[project]/src/components/OutputViewer/index.tsx",
                        lineNumber: 55,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "output-placeholder__title",
                        children: "No output yet"
                    }, void 0, false, {
                        fileName: "[project]/src/components/OutputViewer/index.tsx",
                        lineNumber: 56,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "output-placeholder__sub",
                        children: [
                            "Configure the pipeline on the left and click ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "Run Pipeline"
                            }, void 0, false, {
                                fileName: "[project]/src/components/OutputViewer/index.tsx",
                                lineNumber: 58,
                                columnNumber: 58
                            }, this),
                            " to see parsed document output here."
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/OutputViewer/index.tsx",
                        lineNumber: 57,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/OutputViewer/index.tsx",
                lineNumber: 54,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/OutputViewer/index.tsx",
            lineNumber: 53,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "output-viewer",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "output-tabs",
                children: outputFiles.map((f)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: `output-tab ${activeFile === f ? "active" : ""}`,
                        onClick: ()=>setActiveFile(f),
                        children: f
                    }, f, false, {
                        fileName: "[project]/src/components/OutputViewer/index.tsx",
                        lineNumber: 70,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/components/OutputViewer/index.tsx",
                lineNumber: 68,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "output-content",
                children: [
                    loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            color: "var(--c-text-3)",
                            fontStyle: "italic"
                        },
                        children: "Loading…"
                    }, void 0, false, {
                        fileName: "[project]/src/components/OutputViewer/index.tsx",
                        lineNumber: 83,
                        columnNumber: 11
                    }, this),
                    error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            color: "var(--c-error)"
                        },
                        children: [
                            "Error loading file: ",
                            error
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/OutputViewer/index.tsx",
                        lineNumber: 86,
                        columnNumber: 11
                    }, this),
                    !loading && !error && content !== null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                        children: content
                    }, void 0, false, {
                        fileName: "[project]/src/components/OutputViewer/index.tsx",
                        lineNumber: 89,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/OutputViewer/index.tsx",
                lineNumber: 81,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/OutputViewer/index.tsx",
        lineNumber: 66,
        columnNumber: 5
    }, this);
}
_s(OutputViewer, "tJNEjGu3DrQgcJKc1ARYz64p++8=");
_c = OutputViewer;
var _c;
__turbopack_context__.k.register(_c, "OutputViewer");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ProfileManager/index.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ProfileManager
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * ProfileManager — toolbar for switching, saving, and deleting config profiles.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function ProfileManager({ currentProfile, onSwitch, onSaveAs }) {
    _s();
    const [profiles, setProfiles] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isSaveAsOpen, setIsSaveAsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [newName, setNewName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const refresh = ()=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["listProfiles"])().then(setProfiles).catch(console.error);
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ProfileManager.useEffect": ()=>{
            refresh();
        }
    }["ProfileManager.useEffect"], [
        currentProfile
    ]);
    const handleSaveAs = async ()=>{
        const name = newName.trim().toLowerCase().replace(/\s+/g, "_");
        if (!name) return;
        await onSaveAs(name);
        setIsSaveAsOpen(false);
        setNewName("");
        refresh();
    };
    const handleDelete = async ()=>{
        if (currentProfile === "default") return;
        if (!confirm(`Delete profile "${currentProfile}"?`)) return;
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteProfile"])(currentProfile);
        onSwitch("default");
        refresh();
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "profile-bar",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                className: "select profile-select",
                value: currentProfile,
                onChange: (e)=>onSwitch(e.target.value),
                title: "Switch configuration profile",
                children: profiles.map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                        value: p,
                        children: p
                    }, p, false, {
                        fileName: "[project]/src/components/ProfileManager/index.tsx",
                        lineNumber: 53,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/components/ProfileManager/index.tsx",
                lineNumber: 46,
                columnNumber: 7
            }, this),
            isSaveAsOpen ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        autoFocus: true,
                        className: "input",
                        style: {
                            width: 120,
                            padding: "4px 8px",
                            fontSize: "0.78rem"
                        },
                        value: newName,
                        placeholder: "new-profile",
                        onChange: (e)=>setNewName(e.target.value),
                        onKeyDown: (e)=>{
                            if (e.key === "Enter") handleSaveAs();
                            if (e.key === "Escape") setIsSaveAsOpen(false);
                        }
                    }, void 0, false, {
                        fileName: "[project]/src/components/ProfileManager/index.tsx",
                        lineNumber: 60,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "btn-icon",
                        onClick: handleSaveAs,
                        title: "Confirm",
                        children: "✓"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ProfileManager/index.tsx",
                        lineNumber: 69,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "btn-icon",
                        onClick: ()=>setIsSaveAsOpen(false),
                        title: "Cancel",
                        children: "✕"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ProfileManager/index.tsx",
                        lineNumber: 70,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ProfileManager/index.tsx",
                lineNumber: 59,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "btn-icon",
                        onClick: ()=>setIsSaveAsOpen(true),
                        title: "Save As new profile",
                        children: "💾"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ProfileManager/index.tsx",
                        lineNumber: 74,
                        columnNumber: 11
                    }, this),
                    currentProfile !== "default" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "btn-icon",
                        onClick: handleDelete,
                        title: "Delete profile",
                        style: {
                            color: "var(--c-error)"
                        },
                        children: "🗑"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ProfileManager/index.tsx",
                        lineNumber: 78,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ProfileManager/index.tsx",
                lineNumber: 73,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ProfileManager/index.tsx",
        lineNumber: 45,
        columnNumber: 5
    }, this);
}
_s(ProfileManager, "O+Cg3VjH8erkKZqNlQBN8UK3BKE=");
_c = ProfileManager;
var _c;
__turbopack_context__.k.register(_c, "ProfileManager");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/RunConsole/index.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RunConsole
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * RunConsole — Real-time log output panel.
 * Displays streaming SSE log lines from the pipeline runner,
 * colour-coded by line content.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function classifyLine(line) {
    if (line.includes("✅") || line.includes("✓")) return "console__line--success";
    if (line.includes("❌") || line.includes("Error") || line.includes("failed")) return "console__line--error";
    if (line.includes("⚠") || line.includes("warn") || line.includes("Warning")) return "console__line--warn";
    if (line.startsWith("─") || line.startsWith("  ")) return "console__line--dim";
    if (line.includes("▶") || line.includes("⚙") || line.includes("💾")) return "console__line--header";
    return "";
}
function RunConsole({ logs, isRunning, lastStatus, lastDuration, lastOutputFiles, lastOutputDir, errorMessage, onSelectFile }) {
    _s();
    const bottomRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Auto-scroll to bottom on new log lines
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "RunConsole.useEffect": ()=>{
            bottomRef.current?.scrollIntoView({
                behavior: "smooth"
            });
        }
    }["RunConsole.useEffect"], [
        logs
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "console",
                children: logs.length === 0 && !isRunning ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "console__empty",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "console__empty-icon",
                            children: "⚡"
                        }, void 0, false, {
                            fileName: "[project]/src/components/RunConsole/index.tsx",
                            lineNumber: 57,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "console__empty-text",
                            children: "Run the pipeline to see output here"
                        }, void 0, false, {
                            fileName: "[project]/src/components/RunConsole/index.tsx",
                            lineNumber: 58,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/RunConsole/index.tsx",
                    lineNumber: 56,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        logs.map((line, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `console__line ${classifyLine(line)}`,
                                children: line
                            }, i, false, {
                                fileName: "[project]/src/components/RunConsole/index.tsx",
                                lineNumber: 63,
                                columnNumber: 15
                            }, this)),
                        isRunning && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "console__line",
                            style: {
                                display: "flex",
                                alignItems: "center",
                                gap: 8
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        display: "inline-block",
                                        width: 8,
                                        height: 8,
                                        borderRadius: "50%",
                                        background: "var(--c-warn)",
                                        animation: "pulse 1s infinite"
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/src/components/RunConsole/index.tsx",
                                    lineNumber: 69,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        color: "var(--c-warn)"
                                    },
                                    children: "Running…"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/RunConsole/index.tsx",
                                    lineNumber: 70,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/RunConsole/index.tsx",
                            lineNumber: 68,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            ref: bottomRef
                        }, void 0, false, {
                            fileName: "[project]/src/components/RunConsole/index.tsx",
                            lineNumber: 73,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/RunConsole/index.tsx",
                    lineNumber: 61,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/RunConsole/index.tsx",
                lineNumber: 54,
                columnNumber: 7
            }, this),
            lastStatus && !isRunning && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    padding: "12px 16px",
                    borderTop: "1px solid var(--c-border)",
                    background: lastStatus === "success" ? "var(--c-success-bg)" : "var(--c-error-bg)"
                },
                children: lastStatus === "success" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                marginBottom: 8
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    color: "var(--c-success)",
                                    fontWeight: 700,
                                    fontSize: "0.82rem"
                                },
                                children: [
                                    "✅ Complete in ",
                                    lastDuration?.toFixed(2),
                                    "s"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/RunConsole/index.tsx",
                                lineNumber: 90,
                                columnNumber: 17
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/RunConsole/index.tsx",
                            lineNumber: 89,
                            columnNumber: 15
                        }, this),
                        lastOutputFiles.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "file-chips",
                            children: lastOutputFiles.map((f)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: "file-chip",
                                    onClick: ()=>lastOutputDir && onSelectFile(lastOutputDir, f),
                                    title: `View ${f}`,
                                    children: [
                                        "📄 ",
                                        f
                                    ]
                                }, f, true, {
                                    fileName: "[project]/src/components/RunConsole/index.tsx",
                                    lineNumber: 97,
                                    columnNumber: 21
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/components/RunConsole/index.tsx",
                            lineNumber: 95,
                            columnNumber: 17
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/RunConsole/index.tsx",
                    lineNumber: 88,
                    columnNumber: 13
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        color: "var(--c-error)",
                        fontSize: "0.8rem",
                        fontWeight: 600
                    },
                    children: [
                        "❌ ",
                        errorMessage ?? "Pipeline failed — see logs above"
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/RunConsole/index.tsx",
                    lineNumber: 110,
                    columnNumber: 13
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/RunConsole/index.tsx",
                lineNumber: 80,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/RunConsole/index.tsx",
        lineNumber: 52,
        columnNumber: 5
    }, this);
}
_s(RunConsole, "eaUWg0io6wE0buoFSqU1QLjVsUo=");
_c = RunConsole;
var _c;
__turbopack_context__.k.register(_c, "RunConsole");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/RunHistory/index.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RunHistory
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * RunHistory — displays a list of past pipeline runs.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function RunHistory({ refreshTrigger, onSelect, selectedRunId }) {
    _s();
    const [runs, setRuns] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "RunHistory.useEffect": ()=>{
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["listRuns"])().then(setRuns).catch(console.error);
        }
    }["RunHistory.useEffect"], [
        refreshTrigger
    ]);
    if (runs.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                color: "var(--c-text-3)",
                fontSize: "0.8rem",
                textAlign: "center",
                padding: "24px 0"
            },
            children: "No runs yet"
        }, void 0, false, {
            fileName: "[project]/src/components/RunHistory/index.tsx",
            lineNumber: 26,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "run-history",
        children: runs.map((run)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `run-card ${selectedRunId === run.run_id ? "run-card--active" : ""}`,
                onClick: ()=>onSelect(run),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "run-card__header",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "run-card__id",
                                children: run.run_id
                            }, void 0, false, {
                                fileName: "[project]/src/components/RunHistory/index.tsx",
                                lineNumber: 41,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: `run-card__status run-card__status--${run.status}`,
                                children: run.status
                            }, void 0, false, {
                                fileName: "[project]/src/components/RunHistory/index.tsx",
                                lineNumber: 42,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/RunHistory/index.tsx",
                        lineNumber: 40,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "run-card__meta",
                        children: [
                            "Profile: ",
                            run.profile_name,
                            run.duration_seconds != null && ` · ${run.duration_seconds.toFixed(2)}s`,
                            run.page_count != null && ` · ${run.page_count}p`
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/RunHistory/index.tsx",
                        lineNumber: 46,
                        columnNumber: 11
                    }, this)
                ]
            }, run.run_id, true, {
                fileName: "[project]/src/components/RunHistory/index.tsx",
                lineNumber: 35,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/src/components/RunHistory/index.tsx",
        lineNumber: 33,
        columnNumber: 5
    }, this);
}
_s(RunHistory, "QsnF5p0GjOe9fT/55l4k7W57NEo=");
_c = RunHistory;
var _c;
__turbopack_context__.k.register(_c, "RunHistory");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/Controls.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react-dom/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature();
"use client";
;
;
function ToggleRow({ id, label, paramKey, checked, onChange, tooltip }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "toggle-row",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "toggle-row__info",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "toggle-row__label",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            children: label
                        }, void 0, false, {
                            fileName: "[project]/src/components/ui/Controls.tsx",
                            lineNumber: 26,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                            className: "toggle-row__key",
                            children: paramKey
                        }, void 0, false, {
                            fileName: "[project]/src/components/ui/Controls.tsx",
                            lineNumber: 27,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Tooltip, {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                className: "toggle-switch",
                htmlFor: id,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        id: id,
                        type: "checkbox",
                        checked: checked,
                        onChange: (e)=>onChange(e.target.checked)
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/Controls.tsx",
                        lineNumber: 32,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "toggle-switch__track"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/Controls.tsx",
                        lineNumber: 38,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
_c = ToggleRow;
function SelectField({ id, label, paramKey, value, options, onChange, tooltip }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "field",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                htmlFor: id,
                className: "field__label",
                children: [
                    label,
                    " ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                        children: paramKey
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/Controls.tsx",
                        lineNumber: 66,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Tooltip, {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                id: id,
                className: "select",
                value: value,
                onChange: (e)=>onChange(e.target.value),
                children: options.map((o)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
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
_c1 = SelectField;
function SliderField({ id, label, paramKey, value, min, max, step, unit, onChange, tooltip }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "field",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                htmlFor: id,
                className: "field__label",
                children: [
                    label,
                    " ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                        children: paramKey
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/Controls.tsx",
                        lineNumber: 112,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Tooltip, {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "slider-row",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
_c2 = SliderField;
function NumberField({ id, label, paramKey, value, min, max, onChange, tooltip, nullable }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "field",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                htmlFor: id,
                className: "field__label",
                children: [
                    label,
                    " ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                        children: paramKey
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/Controls.tsx",
                        lineNumber: 160,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Tooltip, {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
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
_c3 = NumberField;
function TextField({ id, label, paramKey, value, placeholder, onChange, tooltip }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "field",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                htmlFor: id,
                className: "field__label",
                children: [
                    label,
                    " ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                        children: paramKey
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/Controls.tsx",
                        lineNumber: 202,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Tooltip, {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
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
_c4 = TextField;
function TextareaField({ id, label, paramKey, value, onChange, tooltip }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "field",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                htmlFor: id,
                className: "field__label",
                children: [
                    label,
                    " ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                        children: paramKey
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/Controls.tsx",
                        lineNumber: 236,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Tooltip, {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
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
_c5 = TextareaField;
function TagListField({ id, label, paramKey, values, onChange, tooltip }) {
    _s();
    const [inputVal, setInputVal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "field",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                htmlFor: id,
                className: "field__label",
                children: [
                    label,
                    " ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                        children: paramKey
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/Controls.tsx",
                        lineNumber: 278,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Tooltip, {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "tag-input input",
                style: {
                    minHeight: 36,
                    cursor: "text"
                },
                onClick: ()=>document.getElementById(id)?.focus(),
                children: [
                    values.map((v)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "tag",
                            children: [
                                v,
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
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
_s(TagListField, "v7NWqUIaMEKUmH29zqhacOysM34=");
_c6 = TagListField;
function MultiCheckField({ label, paramKey, options, selected, onChange, tooltip }) {
    const toggle = (v)=>{
        if (selected.includes(v)) onChange(selected.filter((x)=>x !== v));
        else onChange([
            ...selected,
            v
        ]);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "field",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "field__label",
                children: [
                    label,
                    " ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                        children: paramKey
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/Controls.tsx",
                        lineNumber: 345,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Tooltip, {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6
                },
                children: options.map((o)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
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
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
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
_c7 = MultiCheckField;
function ConfigSection({ icon, title, badge, defaultOpen = false, children }) {
    _s1();
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(defaultOpen);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "config-section",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: "config-section__trigger",
                onClick: ()=>setOpen((p)=>!p),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "config-section__trigger-icon",
                        children: icon
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/Controls.tsx",
                        lineNumber: 400,
                        columnNumber: 9
                    }, this),
                    title,
                    badge && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "config-section__badge",
                        children: badge
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/Controls.tsx",
                        lineNumber: 402,
                        columnNumber: 19
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
            open && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
_s1(ConfigSection, "pG0khZI24VrkSmCZcWM9qqrVMh4=");
_c8 = ConfigSection;
function Tooltip({ text }) {
    _s2();
    const iconRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [visible, setVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [pos, setPos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        top: 0,
        left: 0
    });
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Only use portals after hydration (avoids SSR mismatch)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Tooltip.useEffect": ()=>{
            setMounted(true);
        }
    }["Tooltip.useEffect"], []);
    const show = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Tooltip.useCallback[show]": ()=>{
            if (!iconRef.current) return;
            const rect = iconRef.current.getBoundingClientRect();
            // Position bubble to the right of the icon, vertically centred.
            // If it would overflow the right edge of the viewport, flip it left.
            const bubbleWidth = 260;
            const gap = 10;
            let left = rect.right + gap;
            if (left + bubbleWidth > window.innerWidth - 12) {
                // Flip: appear to the left of the icon instead
                left = rect.left - bubbleWidth - gap;
            }
            setPos({
                top: rect.top + rect.height / 2,
                left
            });
            setVisible(true);
        }
    }["Tooltip.useCallback[show]"], []);
    const hide = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Tooltip.useCallback[hide]": ()=>setVisible(false)
    }["Tooltip.useCallback[hide]"], []);
    const bubble = visible && mounted ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
        lineNumber: 449,
        columnNumber: 5
    }, this), document.body) : null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                lineNumber: 477,
                columnNumber: 7
            }, this),
            bubble
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/Controls.tsx",
        lineNumber: 476,
        columnNumber: 5
    }, this);
}
_s2(Tooltip, "ocZj74yIW/D4v3ACqRR3me6HN70=");
_c9 = Tooltip;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7, _c8, _c9;
__turbopack_context__.k.register(_c, "ToggleRow");
__turbopack_context__.k.register(_c1, "SelectField");
__turbopack_context__.k.register(_c2, "SliderField");
__turbopack_context__.k.register(_c3, "NumberField");
__turbopack_context__.k.register(_c4, "TextField");
__turbopack_context__.k.register(_c5, "TextareaField");
__turbopack_context__.k.register(_c6, "TagListField");
__turbopack_context__.k.register(_c7, "MultiCheckField");
__turbopack_context__.k.register(_c8, "ConfigSection");
__turbopack_context__.k.register(_c9, "Tooltip");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/hooks/useConfig.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useConfig",
    ()=>useConfig
]);
/**
 * useConfig hook
 * ---------------
 * Manages the active PipelineConfig state with:
 * - Optimistic local updates (instant UI feedback)
 * - Debounced (300ms) automatic persistence to the backend on every change
 * - Save-As / profile switching
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
;
/**
 * Recursively sets a value at a dot-notation path on an object.
 * e.g. setPath(obj, "pdf_options.do_ocr", true)
 * No external dependencies — pure TypeScript.
 */ function setPath(obj, path, value) {
    const keys = path.split(".");
    let current = obj;
    for(let i = 0; i < keys.length - 1; i++){
        if (current[keys[i]] == null || typeof current[keys[i]] !== "object") {
            current[keys[i]] = {};
        }
        current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
}
const DEBOUNCE_MS = 300;
function useConfig(initialProfileName = "default") {
    _s();
    const [config, setConfig] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isSaving, setIsSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Debounce timer ref
    const debounceTimer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Keep latest config in a ref so the debounced callback always has fresh state
    const latestConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // ── Initial load ────────────────────────────────────────────────────────
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useConfig.useEffect": ()=>{
            switchProfile(initialProfileName);
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["useConfig.useEffect"], [
        initialProfileName
    ]);
    // ── Switch profile ───────────────────────────────────────────────────────
    const switchProfile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useConfig.useCallback[switchProfile]": async (name)=>{
            setIsLoading(true);
            setError(null);
            try {
                const loaded = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["loadProfile"])(name);
                setConfig(loaded);
                latestConfig.current = loaded;
            } catch (e) {
                setError(`Failed to load profile "${name}": ${e.message}`);
            } finally{
                setIsLoading(false);
            }
        }
    }["useConfig.useCallback[switchProfile]"], []);
    // ── Field update with debounced persistence ──────────────────────────────
    const updateField = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useConfig.useCallback[updateField]": (path, value)=>{
            setConfig({
                "useConfig.useCallback[updateField]": (prev)=>{
                    if (!prev) return prev;
                    // Deep clone + set nested field via dot-path
                    const next = JSON.parse(JSON.stringify(prev));
                    setPath(next, path, value);
                    latestConfig.current = next;
                    // Debounce the backend write
                    if (debounceTimer.current) clearTimeout(debounceTimer.current);
                    debounceTimer.current = setTimeout({
                        "useConfig.useCallback[updateField]": async ()=>{
                            if (!latestConfig.current) return;
                            setIsSaving(true);
                            try {
                                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["saveProfile"])(latestConfig.current.profile_name, latestConfig.current);
                            } catch (e) {
                                setError(`Auto-save failed: ${e.message}`);
                            } finally{
                                setIsSaving(false);
                            }
                        }
                    }["useConfig.useCallback[updateField]"], DEBOUNCE_MS);
                    return next;
                }
            }["useConfig.useCallback[updateField]"]);
        }
    }["useConfig.useCallback[updateField]"], []);
    // ── Save As ──────────────────────────────────────────────────────────────
    const saveAs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useConfig.useCallback[saveAs]": async (newName)=>{
            if (!latestConfig.current) return;
            const toSave = {
                ...JSON.parse(JSON.stringify(latestConfig.current)),
                profile_name: newName
            };
            setIsSaving(true);
            try {
                const saved = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["saveAsProfile"])(toSave);
                setConfig(saved);
                latestConfig.current = saved;
            } catch (e) {
                setError(`Save As failed: ${e.message}`);
            } finally{
                setIsSaving(false);
            }
        }
    }["useConfig.useCallback[saveAs]"], []);
    return {
        config,
        isSaving,
        isLoading,
        error,
        updateField,
        switchProfile,
        saveAs
    };
}
_s(useConfig, "wpG/EsVBzxSaOzFsYeInT8BTFVU=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/hooks/useRunStream.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useRunStream",
    ()=>useRunStream
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
/**
 * useRunStream hook
 * ------------------
 * Triggers a pipeline run via POST /api/pipeline/run and streams
 * Server-Sent Events log lines back to the UI.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
const BASE_URL = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
function useRunStream() {
    _s();
    const [state, setState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        isRunning: false,
        logs: [],
        lastRunId: null,
        lastStatus: null,
        lastDuration: null,
        lastOutputFiles: [],
        lastOutputDir: null,
        errorMessage: null
    });
    const abortRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const startRun = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useRunStream.useCallback[startRun]": (profileName)=>{
            // Cancel any previous run stream
            abortRef.current?.abort();
            abortRef.current = new AbortController();
            setState({
                "useRunStream.useCallback[startRun]": (prev)=>({
                        ...prev,
                        isRunning: true,
                        logs: [],
                        lastRunId: null,
                        lastStatus: null,
                        lastDuration: null,
                        lastOutputFiles: [],
                        lastOutputDir: null,
                        errorMessage: null
                    })
            }["useRunStream.useCallback[startRun]"]);
            const fetchStream = {
                "useRunStream.useCallback[startRun].fetchStream": async ()=>{
                    try {
                        const res = await fetch(`${BASE_URL}/api/pipeline/run`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                profile_name: profileName
                            }),
                            signal: abortRef.current.signal
                        });
                        if (!res.ok || !res.body) {
                            const text = await res.text();
                            setState({
                                "useRunStream.useCallback[startRun].fetchStream": (prev)=>({
                                        ...prev,
                                        isRunning: false,
                                        lastStatus: "error",
                                        errorMessage: `HTTP ${res.status}: ${text}`
                                    })
                            }["useRunStream.useCallback[startRun].fetchStream"]);
                            return;
                        }
                        // Read the SSE stream
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
                            buffer = lines.pop() ?? ""; // keep incomplete line in buffer
                            for (const line of lines){
                                if (!line.startsWith("data: ")) continue;
                                const jsonStr = line.slice(6).trim();
                                if (!jsonStr) continue;
                                try {
                                    const event = JSON.parse(jsonStr);
                                    if (event.type === "log") {
                                        setState({
                                            "useRunStream.useCallback[startRun].fetchStream": (prev)=>({
                                                    ...prev,
                                                    logs: [
                                                        ...prev.logs,
                                                        event.message
                                                    ]
                                                })
                                        }["useRunStream.useCallback[startRun].fetchStream"]);
                                    } else if (event.type === "done") {
                                        setState({
                                            "useRunStream.useCallback[startRun].fetchStream": (prev)=>({
                                                    ...prev,
                                                    isRunning: false,
                                                    lastRunId: event.run_id,
                                                    lastStatus: event.status,
                                                    lastDuration: event.duration_seconds,
                                                    lastOutputFiles: event.output_files,
                                                    lastOutputDir: event.output_dir,
                                                    errorMessage: event.error_message
                                                })
                                        }["useRunStream.useCallback[startRun].fetchStream"]);
                                    }
                                } catch  {
                                // Ignore malformed SSE lines
                                }
                            }
                        }
                    } catch (e) {
                        if (e.name === "AbortError") return;
                        setState({
                            "useRunStream.useCallback[startRun].fetchStream": (prev)=>({
                                    ...prev,
                                    isRunning: false,
                                    lastStatus: "error",
                                    errorMessage: `Stream error: ${e.message}`
                                })
                        }["useRunStream.useCallback[startRun].fetchStream"]);
                    }
                }
            }["useRunStream.useCallback[startRun].fetchStream"];
            fetchStream();
        }
    }["useRunStream.useCallback[startRun]"], []);
    const clearLogs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useRunStream.useCallback[clearLogs]": ()=>{
            setState({
                "useRunStream.useCallback[clearLogs]": (prev)=>({
                        ...prev,
                        logs: []
                    })
            }["useRunStream.useCallback[clearLogs]"]);
        }
    }["useRunStream.useCallback[clearLogs]"], []);
    return {
        ...state,
        startRun,
        clearLogs
    };
}
_s(useRunStream, "/Go/MN1knIBuplYPrbTwmdLw9zw=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/api.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Typed API helpers for communicating with the FastAPI backend.
 * Base URL is configurable via NEXT_PUBLIC_API_URL env var.
 */ __turbopack_context__.s([
    "checkHealth",
    ()=>checkHealth,
    "deleteProfile",
    ()=>deleteProfile,
    "getRun",
    ()=>getRun,
    "getRunFileUrl",
    ()=>getRunFileUrl,
    "listProfiles",
    ()=>listProfiles,
    "listRuns",
    ()=>listRuns,
    "loadProfile",
    ()=>loadProfile,
    "saveAsProfile",
    ()=>saveAsProfile,
    "saveProfile",
    ()=>saveProfile
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
const BASE_URL = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
// ---------------------------------------------------------------------------
// Generic fetch helper
// ---------------------------------------------------------------------------
async function apiFetch(path, options) {
    const res = await fetch(`${BASE_URL}${path}`, {
        headers: {
            "Content-Type": "application/json"
        },
        ...options
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`API ${res.status}: ${text}`);
    }
    return res.json();
}
async function listProfiles() {
    return apiFetch("/api/config/profiles");
}
async function loadProfile(name) {
    return apiFetch(`/api/config/${encodeURIComponent(name)}`);
}
async function saveProfile(name, config) {
    return apiFetch(`/api/config/${encodeURIComponent(name)}`, {
        method: "PUT",
        body: JSON.stringify(config)
    });
}
async function saveAsProfile(config) {
    return apiFetch("/api/config/save-as", {
        method: "POST",
        body: JSON.stringify(config)
    });
}
async function deleteProfile(name) {
    await apiFetch(`/api/config/${encodeURIComponent(name)}`, {
        method: "DELETE"
    });
}
async function listRuns() {
    return apiFetch("/api/pipeline/runs");
}
async function getRun(runId) {
    return apiFetch(`/api/pipeline/run/${encodeURIComponent(runId)}`);
}
function getRunFileUrl(runId, filename) {
    return `${BASE_URL}/api/pipeline/run/${encodeURIComponent(runId)}/file/${encodeURIComponent(filename)}`;
}
async function checkHealth() {
    return apiFetch("/api/health");
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_0wbmvle._.js.map