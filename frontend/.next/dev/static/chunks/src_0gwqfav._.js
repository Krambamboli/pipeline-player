(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/app/inspector/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>InspectorPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * Vector DB Inspector Page
 * -------------------------
 * Browse Qdrant collections and their chunks. For each chunk shows:
 *   - Chunk text
 *   - Metadata badges (headings, pages, element types, custom fields)
 *   - Token count
 *   - Vector preview (first 8 dims for dense, top terms for sparse)
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$qdrant$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/qdrant.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
// Mini sparkline component for dense vector preview
function DenseSparkline({ values }) {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const h = 28;
    const barW = 10;
    const gap = 2;
    const width = values.length * (barW + gap);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: width,
        height: h,
        style: {
            display: "block"
        },
        children: values.map((v, i)=>{
            const norm = (v - min) / range;
            const barH = Math.max(2, Math.round(norm * (h - 4)));
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                x: i * (barW + gap),
                y: h - barH,
                width: barW,
                height: barH,
                fill: v >= 0 ? "var(--c-accent)" : "var(--c-error)",
                rx: 2
            }, i, false, {
                fileName: "[project]/src/app/inspector/page.tsx",
                lineNumber: 39,
                columnNumber: 11
            }, this);
        })
    }, void 0, false, {
        fileName: "[project]/src/app/inspector/page.tsx",
        lineNumber: 34,
        columnNumber: 5
    }, this);
}
_c = DenseSparkline;
// Chunk card component
function ChunkCard({ point, withVectors }) {
    _s();
    const [expanded, setExpanded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const text = point.chunk_text;
    const isLong = text.length > 300;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "chunk-card",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "chunk-card__header",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "chunk-badge chunk-badge--index",
                        children: [
                            "#",
                            point.chunk_index
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/inspector/page.tsx",
                        lineNumber: 63,
                        columnNumber: 9
                    }, this),
                    point.token_count != null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "chunk-badge chunk-badge--tokens",
                        children: [
                            point.token_count,
                            " tokens"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/inspector/page.tsx",
                        lineNumber: 65,
                        columnNumber: 11
                    }, this),
                    point.page_numbers.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "chunk-badge chunk-badge--page",
                        children: [
                            "p. ",
                            point.page_numbers.join(", ")
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/inspector/page.tsx",
                        lineNumber: 68,
                        columnNumber: 11
                    }, this),
                    point.element_types.map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "chunk-badge chunk-badge--type",
                            children: t
                        }, t, false, {
                            fileName: "[project]/src/app/inspector/page.tsx",
                            lineNumber: 73,
                            columnNumber: 11
                        }, this)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            marginLeft: "auto",
                            fontSize: "0.65rem",
                            color: "var(--c-text-3)",
                            fontFamily: "var(--font-mono)"
                        },
                        children: [
                            point.id.slice(0, 8),
                            "…"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/inspector/page.tsx",
                        lineNumber: 75,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/inspector/page.tsx",
                lineNumber: 62,
                columnNumber: 7
            }, this),
            point.headings.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "chunk-card__headings",
                children: point.headings.join(" › ")
            }, void 0, false, {
                fileName: "[project]/src/app/inspector/page.tsx",
                lineNumber: 89,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "chunk-card__text",
                style: {
                    WebkitLineClamp: expanded ? "none" : 4
                },
                children: text
            }, void 0, false, {
                fileName: "[project]/src/app/inspector/page.tsx",
                lineNumber: 95,
                columnNumber: 7
            }, this),
            isLong && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: "chunk-card__expand-btn",
                onClick: ()=>setExpanded((e)=>!e),
                children: expanded ? "▲ Collapse" : "▼ Show full text"
            }, void 0, false, {
                fileName: "[project]/src/app/inspector/page.tsx",
                lineNumber: 102,
                columnNumber: 9
            }, this),
            Object.keys(point.extra_payload).length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "chunk-card__extra",
                children: Object.entries(point.extra_payload).map(([k, v])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "chunk-badge chunk-badge--custom",
                        children: [
                            k,
                            ": ",
                            String(v)
                        ]
                    }, k, true, {
                        fileName: "[project]/src/app/inspector/page.tsx",
                        lineNumber: 114,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/app/inspector/page.tsx",
                lineNumber: 112,
                columnNumber: 9
            }, this),
            withVectors && Object.keys(point.vector_preview).length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "chunk-card__vector",
                children: Object.entries(point.vector_preview).map(([name, vp])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "chunk-card__vector-entry",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "chunk-card__vector-label",
                                children: [
                                    name,
                                    ":"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/inspector/page.tsx",
                                lineNumber: 126,
                                columnNumber: 15
                            }, this),
                            vp.type === "dense" && vp.preview && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DenseSparkline, {
                                        values: vp.preview
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/inspector/page.tsx",
                                        lineNumber: 129,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontSize: "0.65rem",
                                            color: "var(--c-text-3)"
                                        },
                                        children: [
                                            "[",
                                            vp.preview.map((v)=>v.toFixed(3)).join(", "),
                                            "…] (",
                                            vp.dims,
                                            "d)"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/inspector/page.tsx",
                                        lineNumber: 130,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/inspector/page.tsx",
                                lineNumber: 128,
                                columnNumber: 17
                            }, this),
                            vp.type === "sparse" && vp.top_terms && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 4
                                },
                                children: vp.top_terms.map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "chunk-badge chunk-badge--sparse",
                                        children: [
                                            "[",
                                            t.index,
                                            "]:",
                                            t.value.toFixed(3)
                                        ]
                                    }, t.index, true, {
                                        fileName: "[project]/src/app/inspector/page.tsx",
                                        lineNumber: 138,
                                        columnNumber: 21
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/app/inspector/page.tsx",
                                lineNumber: 136,
                                columnNumber: 17
                            }, this)
                        ]
                    }, name, true, {
                        fileName: "[project]/src/app/inspector/page.tsx",
                        lineNumber: 125,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/app/inspector/page.tsx",
                lineNumber: 123,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/inspector/page.tsx",
        lineNumber: 61,
        columnNumber: 5
    }, this);
}
_s(ChunkCard, "DuL5jiiQQFgbn7gBKAyxwS/H4Ek=");
_c1 = ChunkCard;
function InspectorPage() {
    _s1();
    const [collections, setCollections] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [selectedCol, setSelectedCol] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [page, setPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [withVectors, setWithVectors] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [offset, setOffset] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [filterText, setFilterText] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [filterType, setFilterType] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [filterChunkType, setFilterChunkType] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [filterRaptorLevel, setFilterRaptorLevel] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [filterCluster, setFilterCluster] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [filterPage, setFilterPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [limit, setLimit] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(20);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [confirmDelete, setConfirmDelete] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const loadCollections = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "InspectorPage.useCallback[loadCollections]": async ()=>{
            try {
                const cols = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$qdrant$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["listCollections"])();
                setCollections(cols);
                setSelectedCol({
                    "InspectorPage.useCallback[loadCollections]": (current)=>{
                        // Auto-select the first collection only if nothing is selected yet
                        if (cols.length > 0 && !current) {
                            return cols[0].name;
                        }
                        return current;
                    }
                }["InspectorPage.useCallback[loadCollections]"]);
            } catch (e) {
                console.error(e);
            }
        }
    }["InspectorPage.useCallback[loadCollections]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "InspectorPage.useEffect": ()=>{
            loadCollections();
            const id = setInterval(loadCollections, 10000); // refresh every 10s
            return ({
                "InspectorPage.useEffect": ()=>clearInterval(id)
            })["InspectorPage.useEffect"];
        }
    }["InspectorPage.useEffect"], []);
    const loadPoints = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "InspectorPage.useCallback[loadPoints]": async ()=>{
            if (!selectedCol) return;
            setIsLoading(true);
            try {
                const p = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$qdrant$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getPoints"])(selectedCol, offset, limit, withVectors);
                setPage(p);
            } catch (e) {
                console.error(e);
            } finally{
                setIsLoading(false);
            }
        }
    }["InspectorPage.useCallback[loadPoints]"], [
        selectedCol,
        offset,
        limit,
        withVectors
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "InspectorPage.useEffect": ()=>{
            setOffset(0);
        }
    }["InspectorPage.useEffect"], [
        selectedCol
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "InspectorPage.useEffect": ()=>{
            loadPoints();
        }
    }["InspectorPage.useEffect"], [
        loadPoints
    ]);
    const handleDelete = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "InspectorPage.useCallback[handleDelete]": async (name)=>{
            try {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$qdrant$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteCollection"])(name);
                setCollections({
                    "InspectorPage.useCallback[handleDelete]": (c)=>c.filter({
                            "InspectorPage.useCallback[handleDelete]": (col)=>col.name !== name
                        }["InspectorPage.useCallback[handleDelete]"])
                }["InspectorPage.useCallback[handleDelete]"]);
                if (selectedCol === name) setSelectedCol(null);
                setPage(null);
                setConfirmDelete(null);
            } catch (e) {
                console.error(e);
            }
        }
    }["InspectorPage.useCallback[handleDelete]"], [
        selectedCol
    ]);
    const selectedColInfo = collections.find((c)=>c.name === selectedCol);
    // Extract unique RAPTOR cluster IDs from loaded points for the cluster dropdown
    const uniqueClusters = Array.from(new Set((page?.points ?? []).map((pt)=>pt.extra_payload.raptor_cluster).filter((v)=>v != null).map(Number))).sort((a, b)=>a - b);
    const filteredPoints = page?.points.filter((pt)=>{
        if (filterText && !pt.chunk_text.toLowerCase().includes(filterText.toLowerCase())) return false;
        if (filterType) {
            const ft = filterType.toLowerCase();
            const matchElem = pt.element_types.some((t)=>t.toLowerCase().includes(ft));
            const matchExtra = Object.values(pt.extra_payload).some((v)=>String(v).toLowerCase().includes(ft));
            if (!matchElem && !matchExtra) return false;
        }
        if (filterChunkType) {
            const ct = filterChunkType.toLowerCase();
            const payloadCt = String(pt.extra_payload.chunk_type || "").toLowerCase();
            if (!payloadCt.includes(ct)) return false;
        }
        if (filterRaptorLevel) {
            const rl = Number(filterRaptorLevel);
            if (pt.extra_payload.raptor_level !== rl) return false;
        }
        if (filterCluster) {
            const cl = Number(filterCluster);
            if (pt.extra_payload.raptor_cluster !== cl) return false;
        }
        if (filterPage) {
            const fp = Number(filterPage);
            if (!pt.page_numbers.includes(fp)) return false;
        }
        return true;
    });
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
                    width: 240,
                    flexShrink: 0,
                    borderRight: "1px solid var(--c-border)"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "panel__header",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "panel__title",
                                children: "🗄️ Collections"
                            }, void 0, false, {
                                fileName: "[project]/src/app/inspector/page.tsx",
                                lineNumber: 271,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: loadCollections,
                                style: {
                                    marginLeft: "auto",
                                    background: "none",
                                    border: "none",
                                    color: "var(--c-text-3)",
                                    cursor: "pointer",
                                    fontSize: "0.8rem"
                                },
                                title: "Refresh",
                                children: "↺"
                            }, void 0, false, {
                                fileName: "[project]/src/app/inspector/page.tsx",
                                lineNumber: 272,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/inspector/page.tsx",
                        lineNumber: 270,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "panel__body",
                        style: {
                            padding: "8px"
                        },
                        children: [
                            collections.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    color: "var(--c-text-3)",
                                    fontSize: "0.75rem",
                                    textAlign: "center",
                                    padding: "24px 8px"
                                },
                                children: [
                                    "No collections yet.",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                        fileName: "[project]/src/app/inspector/page.tsx",
                                        lineNumber: 298,
                                        columnNumber: 15
                                    }, this),
                                    "Run Step 2 to create one."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/inspector/page.tsx",
                                lineNumber: 289,
                                columnNumber: 13
                            }, this),
                            collections.map((col)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `collection-item ${selectedCol === col.name ? "collection-item--active" : ""}`,
                                    onClick: ()=>setSelectedCol(col.name),
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "collection-item__name",
                                            children: col.name
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/inspector/page.tsx",
                                            lineNumber: 308,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "collection-item__meta",
                                            children: [
                                                typeof col.points_count === "number" ? col.points_count.toLocaleString() : "…",
                                                " pts",
                                                col.dense_vectors && Object.keys(col.dense_vectors).length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "chunk-badge chunk-badge--type",
                                                    style: {
                                                        marginLeft: 4
                                                    },
                                                    children: "dense"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/inspector/page.tsx",
                                                    lineNumber: 314,
                                                    columnNumber: 19
                                                }, this),
                                                col.sparse_vectors && col.sparse_vectors.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "chunk-badge chunk-badge--sparse",
                                                    style: {
                                                        marginLeft: 4
                                                    },
                                                    children: "sparse"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/inspector/page.tsx",
                                                    lineNumber: 319,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/inspector/page.tsx",
                                            lineNumber: 309,
                                            columnNumber: 15
                                        }, this),
                                        confirmDelete === col.name ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                display: "flex",
                                                gap: 4,
                                                marginTop: 4
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    className: "run-btn",
                                                    style: {
                                                        fontSize: "0.65rem",
                                                        padding: "2px 6px",
                                                        background: "var(--c-danger)",
                                                        color: "white",
                                                        minWidth: 0
                                                    },
                                                    onClick: (e)=>{
                                                        e.stopPropagation();
                                                        handleDelete(col.name);
                                                    },
                                                    children: "Confirm"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/inspector/page.tsx",
                                                    lineNumber: 327,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    className: "run-btn",
                                                    style: {
                                                        fontSize: "0.65rem",
                                                        padding: "2px 6px",
                                                        minWidth: 0
                                                    },
                                                    onClick: (e)=>{
                                                        e.stopPropagation();
                                                        setConfirmDelete(null);
                                                    },
                                                    children: "Cancel"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/inspector/page.tsx",
                                                    lineNumber: 343,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/inspector/page.tsx",
                                            lineNumber: 326,
                                            columnNumber: 17
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            className: "collection-item__delete",
                                            onClick: (e)=>{
                                                e.stopPropagation();
                                                setConfirmDelete(col.name);
                                            },
                                            title: "Delete collection",
                                            children: "🗑"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/inspector/page.tsx",
                                            lineNumber: 355,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, col.name, true, {
                                    fileName: "[project]/src/app/inspector/page.tsx",
                                    lineNumber: 303,
                                    columnNumber: 13
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/inspector/page.tsx",
                        lineNumber: 287,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/inspector/page.tsx",
                lineNumber: 266,
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
                        style: {
                            flexWrap: "wrap",
                            gap: "12px"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: "flex",
                                    alignItems: "center",
                                    width: "100%"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "panel__title",
                                        children: [
                                            "🔍 ",
                                            selectedCol ? selectedCol : "Select a collection"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/inspector/page.tsx",
                                        lineNumber: 378,
                                        columnNumber: 13
                                    }, this),
                                    selectedColInfo && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            marginLeft: 12,
                                            fontSize: "0.72rem",
                                            color: "var(--c-text-3)"
                                        },
                                        children: [
                                            selectedColInfo.points_count?.toLocaleString(),
                                            " points",
                                            Object.keys(selectedColInfo.dense_vectors ?? {}).map((k)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        marginLeft: 6
                                                    },
                                                    children: [
                                                        "· ",
                                                        k,
                                                        ": ",
                                                        selectedColInfo.dense_vectors[k]?.size,
                                                        "d"
                                                    ]
                                                }, k, true, {
                                                    fileName: "[project]/src/app/inspector/page.tsx",
                                                    lineNumber: 385,
                                                    columnNumber: 19
                                                }, this))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/inspector/page.tsx",
                                        lineNumber: 382,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        style: {
                                            marginLeft: "auto",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 6,
                                            fontSize: "0.75rem",
                                            color: "var(--c-text-2)",
                                            cursor: "pointer"
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "checkbox",
                                                checked: withVectors,
                                                onChange: (e)=>setWithVectors(e.target.checked)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/inspector/page.tsx",
                                                lineNumber: 403,
                                                columnNumber: 15
                                            }, this),
                                            "Show vectors"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/inspector/page.tsx",
                                        lineNumber: 392,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/inspector/page.tsx",
                                lineNumber: 377,
                                columnNumber: 11
                            }, this),
                            selectedCol && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: "flex",
                                    gap: "12px",
                                    width: "100%",
                                    alignItems: "flex-end"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "field",
                                        style: {
                                            flex: 1
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "field__label",
                                                children: "Search Text"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/inspector/page.tsx",
                                                lineNumber: 416,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "text",
                                                className: "input",
                                                placeholder: "Search in chunk...",
                                                value: filterText,
                                                onChange: (e)=>setFilterText(e.target.value)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/inspector/page.tsx",
                                                lineNumber: 417,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/inspector/page.tsx",
                                        lineNumber: 415,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "field",
                                        style: {
                                            width: 140
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "field__label",
                                                children: "Element Type"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/inspector/page.tsx",
                                                lineNumber: 426,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                className: "select",
                                                value: filterType,
                                                onChange: (e)=>setFilterType(e.target.value),
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "",
                                                        children: "All Types"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/inspector/page.tsx",
                                                        lineNumber: 432,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "text",
                                                        children: "text"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/inspector/page.tsx",
                                                        lineNumber: 433,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "table",
                                                        children: "table"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/inspector/page.tsx",
                                                        lineNumber: 434,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "list_item",
                                                        children: "list_item"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/inspector/page.tsx",
                                                        lineNumber: 435,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "section_header",
                                                        children: "section_header"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/inspector/page.tsx",
                                                        lineNumber: 436,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "page_header",
                                                        children: "page_header"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/inspector/page.tsx",
                                                        lineNumber: 437,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "page_footer",
                                                        children: "page_footer"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/inspector/page.tsx",
                                                        lineNumber: 438,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "picture",
                                                        children: "picture"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/inspector/page.tsx",
                                                        lineNumber: 439,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "formula",
                                                        children: "formula"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/inspector/page.tsx",
                                                        lineNumber: 440,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/inspector/page.tsx",
                                                lineNumber: 427,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/inspector/page.tsx",
                                        lineNumber: 425,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "field",
                                        style: {
                                            width: 120
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "field__label",
                                                children: "Chunk Type"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/inspector/page.tsx",
                                                lineNumber: 444,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                className: "select",
                                                value: filterChunkType,
                                                onChange: (e)=>setFilterChunkType(e.target.value),
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "",
                                                        children: "All"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/inspector/page.tsx",
                                                        lineNumber: 450,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "parent",
                                                        children: "parent"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/inspector/page.tsx",
                                                        lineNumber: 451,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "child",
                                                        children: "child"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/inspector/page.tsx",
                                                        lineNumber: 452,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "raptor_leaf",
                                                        children: "raptor_leaf"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/inspector/page.tsx",
                                                        lineNumber: 453,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "raptor_summary",
                                                        children: "raptor_summary"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/inspector/page.tsx",
                                                        lineNumber: 454,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/inspector/page.tsx",
                                                lineNumber: 445,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/inspector/page.tsx",
                                        lineNumber: 443,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "field",
                                        style: {
                                            width: 80
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "field__label",
                                                children: "Raptor Lvl"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/inspector/page.tsx",
                                                lineNumber: 458,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "number",
                                                className: "input",
                                                placeholder: "e.g. 1",
                                                value: filterRaptorLevel,
                                                onChange: (e)=>setFilterRaptorLevel(e.target.value)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/inspector/page.tsx",
                                                lineNumber: 459,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/inspector/page.tsx",
                                        lineNumber: 457,
                                        columnNumber: 15
                                    }, this),
                                    uniqueClusters.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "field",
                                        style: {
                                            width: 100
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "field__label",
                                                children: "Cluster"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/inspector/page.tsx",
                                                lineNumber: 470,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                className: "select",
                                                value: filterCluster,
                                                onChange: (e)=>setFilterCluster(e.target.value),
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "",
                                                        children: "All"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/inspector/page.tsx",
                                                        lineNumber: 476,
                                                        columnNumber: 21
                                                    }, this),
                                                    uniqueClusters.map((cl)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: String(cl),
                                                            children: [
                                                                "Cluster ",
                                                                cl
                                                            ]
                                                        }, cl, true, {
                                                            fileName: "[project]/src/app/inspector/page.tsx",
                                                            lineNumber: 478,
                                                            columnNumber: 23
                                                        }, this))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/inspector/page.tsx",
                                                lineNumber: 471,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/inspector/page.tsx",
                                        lineNumber: 469,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "field",
                                        style: {
                                            width: 80
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "field__label",
                                                children: "Page"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/inspector/page.tsx",
                                                lineNumber: 486,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "number",
                                                className: "input",
                                                placeholder: "e.g. 5",
                                                value: filterPage,
                                                onChange: (e)=>setFilterPage(e.target.value)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/inspector/page.tsx",
                                                lineNumber: 487,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/inspector/page.tsx",
                                        lineNumber: 485,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "field",
                                        style: {
                                            width: 100
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "field__label",
                                                children: "Fetch Limit"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/inspector/page.tsx",
                                                lineNumber: 496,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                className: "select",
                                                value: limit,
                                                onChange: (e)=>setLimit(Number(e.target.value)),
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: 20,
                                                        children: "20"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/inspector/page.tsx",
                                                        lineNumber: 502,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: 50,
                                                        children: "50"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/inspector/page.tsx",
                                                        lineNumber: 503,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: 100,
                                                        children: "100 (Max)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/inspector/page.tsx",
                                                        lineNumber: 504,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/inspector/page.tsx",
                                                lineNumber: 497,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/inspector/page.tsx",
                                        lineNumber: 495,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/inspector/page.tsx",
                                lineNumber: 414,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/inspector/page.tsx",
                        lineNumber: 376,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            flex: 1,
                            overflowY: "auto",
                            padding: "12px 16px"
                        },
                        children: [
                            isLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    textAlign: "center",
                                    color: "var(--c-text-3)",
                                    paddingTop: 40,
                                    fontSize: "0.85rem"
                                },
                                children: "Loading chunks…"
                            }, void 0, false, {
                                fileName: "[project]/src/app/inspector/page.tsx",
                                lineNumber: 514,
                                columnNumber: 13
                            }, this),
                            !isLoading && !selectedCol && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    textAlign: "center",
                                    color: "var(--c-text-3)",
                                    paddingTop: 60,
                                    fontSize: "0.85rem"
                                },
                                children: "Select a collection from the left panel."
                            }, void 0, false, {
                                fileName: "[project]/src/app/inspector/page.tsx",
                                lineNumber: 526,
                                columnNumber: 13
                            }, this),
                            !isLoading && page && page.points.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    textAlign: "center",
                                    color: "var(--c-text-3)",
                                    paddingTop: 60,
                                    fontSize: "0.85rem"
                                },
                                children: "Collection is empty."
                            }, void 0, false, {
                                fileName: "[project]/src/app/inspector/page.tsx",
                                lineNumber: 538,
                                columnNumber: 13
                            }, this),
                            !isLoading && filteredPoints?.map((pt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ChunkCard, {
                                    point: pt,
                                    withVectors: withVectors
                                }, pt.id, false, {
                                    fileName: "[project]/src/app/inspector/page.tsx",
                                    lineNumber: 551,
                                    columnNumber: 15
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/inspector/page.tsx",
                        lineNumber: 512,
                        columnNumber: 9
                    }, this),
                    page && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            borderTop: "1px solid var(--c-border)",
                            padding: "8px 16px",
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            flexShrink: 0,
                            fontSize: "0.8rem",
                            color: "var(--c-text-3)"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "run-btn",
                                style: {
                                    fontSize: "0.75rem",
                                    padding: "4px 12px",
                                    minWidth: 0
                                },
                                disabled: offset === 0,
                                onClick: ()=>setOffset(Math.max(0, offset - limit)),
                                children: "← Prev"
                            }, void 0, false, {
                                fileName: "[project]/src/app/inspector/page.tsx",
                                lineNumber: 569,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: [
                                    "Showing ",
                                    offset + 1,
                                    "–",
                                    offset + page.points.length,
                                    " of",
                                    " ",
                                    typeof selectedColInfo?.points_count === "number" ? selectedColInfo.points_count.toLocaleString() : "…"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/inspector/page.tsx",
                                lineNumber: 577,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "run-btn",
                                style: {
                                    fontSize: "0.75rem",
                                    padding: "4px 12px",
                                    minWidth: 0
                                },
                                disabled: !page.has_more,
                                onClick: ()=>setOffset(offset + limit),
                                children: "Next →"
                            }, void 0, false, {
                                fileName: "[project]/src/app/inspector/page.tsx",
                                lineNumber: 583,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/inspector/page.tsx",
                        lineNumber: 557,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/inspector/page.tsx",
                lineNumber: 372,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/inspector/page.tsx",
        lineNumber: 264,
        columnNumber: 5
    }, this);
}
_s1(InspectorPage, "rud1mRoddkfr5r9ZdG2Ed7kjgxc=");
_c2 = InspectorPage;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "DenseSparkline");
__turbopack_context__.k.register(_c1, "ChunkCard");
__turbopack_context__.k.register(_c2, "InspectorPage");
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

//# sourceMappingURL=src_0gwqfav._.js.map