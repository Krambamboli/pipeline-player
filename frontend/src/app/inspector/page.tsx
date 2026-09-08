"use client";

/**
 * Vector DB Inspector Page
 * -------------------------
 * Browse Qdrant collections and their chunks. For each chunk shows:
 *   - Chunk text
 *   - Metadata badges (headings, pages, element types, custom fields)
 *   - Token count
 *   - Vector preview (first 8 dims for dense, top terms for sparse)
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  listCollections,
  getPoints,
  deleteCollection,
  QdrantCollection,
  QdrantPoint,
  PointsPage,
} from "@/lib/qdrant";

// Mini sparkline component for dense vector preview
function DenseSparkline({ values }: { values: number[] }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const h = 28;
  const barW = 10;
  const gap = 2;
  const width = values.length * (barW + gap);

  return (
    <svg width={width} height={h} style={{ display: "block" }}>
      {values.map((v, i) => {
        const norm = (v - min) / range;
        const barH = Math.max(2, Math.round(norm * (h - 4)));
        return (
          <rect
            key={i}
            x={i * (barW + gap)}
            y={h - barH}
            width={barW}
            height={barH}
            fill={v >= 0 ? "var(--c-accent)" : "var(--c-error)"}
            rx={2}
          />
        );
      })}
    </svg>
  );
}

// Chunk card component
function ChunkCard({ point, withVectors }: { point: QdrantPoint; withVectors: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const text = point.chunk_text;
  const isLong = text.length > 300;

  return (
    <div className="chunk-card">
      <div className="chunk-card__header">
        <span className="chunk-badge chunk-badge--index">#{point.chunk_index}</span>
        {point.token_count != null && (
          <span className="chunk-badge chunk-badge--tokens">{point.token_count} tokens</span>
        )}
        {point.page_numbers.length > 0 && (
          <span className="chunk-badge chunk-badge--page">
            p. {point.page_numbers.join(", ")}
          </span>
        )}
        {point.element_types.map((t) => (
          <span key={t} className="chunk-badge chunk-badge--type">{t}</span>
        ))}
        <span
          style={{
            marginLeft: "auto",
            fontSize: "0.65rem",
            color: "var(--c-text-3)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {point.id.slice(0, 8)}…
        </span>
      </div>

      {/* Headings breadcrumb */}
      {point.headings.length > 0 && (
        <div className="chunk-card__headings">
          {point.headings.join(" › ")}
        </div>
      )}

      {/* Chunk text */}
      <div
        className="chunk-card__text"
        style={{ WebkitLineClamp: expanded ? "none" : 4 }}
      >
        {text}
      </div>
      {isLong && (
        <button
          className="chunk-card__expand-btn"
          onClick={() => setExpanded((e) => !e)}
        >
          {expanded ? "▲ Collapse" : "▼ Show full text"}
        </button>
      )}

      {/* Extra payload */}
      {Object.keys(point.extra_payload).length > 0 && (
        <div className="chunk-card__extra">
          {Object.entries(point.extra_payload).map(([k, v]) => (
            <span key={k} className="chunk-badge chunk-badge--custom">
              {k}: {String(v)}
            </span>
          ))}
        </div>
      )}

      {/* Vector preview */}
      {withVectors && Object.keys(point.vector_preview).length > 0 && (
        <div className="chunk-card__vector">
          {Object.entries(point.vector_preview).map(([name, vp]) => (
            <div key={name} className="chunk-card__vector-entry">
              <span className="chunk-card__vector-label">{name}:</span>
              {vp.type === "dense" && vp.preview && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <DenseSparkline values={vp.preview} />
                  <span style={{ fontSize: "0.65rem", color: "var(--c-text-3)" }}>
                    [{vp.preview.map((v) => v.toFixed(3)).join(", ")}…] ({vp.dims}d)
                  </span>
                </div>
              )}
              {vp.type === "sparse" && vp.top_terms && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {vp.top_terms.map((t) => (
                    <span key={t.index} className="chunk-badge chunk-badge--sparse">
                      [{t.index}]:{t.value.toFixed(3)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function InspectorPage() {
  const [collections, setCollections] = useState<QdrantCollection[]>([]);
  const [selectedCol, setSelectedCol] = useState<string | null>(null);
  const [page, setPage] = useState<PointsPage | null>(null);
  const [withVectors, setWithVectors] = useState(false);
  const [offset, setOffset] = useState(0);
  const [limit] = useState(20);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const loadCollections = useCallback(async () => {
    try {
      const cols = await listCollections();
      setCollections(cols);
      if (cols.length > 0 && !selectedCol) {
        setSelectedCol(cols[0].name);
      }
    } catch (e) {
      console.error(e);
    }
  }, [selectedCol]);

  useEffect(() => {
    loadCollections();
    const id = setInterval(loadCollections, 10000); // refresh every 10s
    return () => clearInterval(id);
  }, []);

  const loadPoints = useCallback(async () => {
    if (!selectedCol) return;
    setIsLoading(true);
    try {
      const p = await getPoints(selectedCol, offset, limit, withVectors);
      setPage(p);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCol, offset, limit, withVectors]);

  useEffect(() => {
    setOffset(0);
  }, [selectedCol]);

  useEffect(() => {
    loadPoints();
  }, [loadPoints]);

  const handleDelete = useCallback(async (name: string) => {
    try {
      await deleteCollection(name);
      setCollections((c) => c.filter((col) => col.name !== name));
      if (selectedCol === name) setSelectedCol(null);
      setPage(null);
      setConfirmDelete(null);
    } catch (e) {
      console.error(e);
    }
  }, [selectedCol]);

  const selectedColInfo = collections.find((c) => c.name === selectedCol);

  return (
    <div style={{ display: "flex", height: "100%", gap: 0, overflow: "hidden" }}>
      {/* LEFT: Collection List */}
      <aside
        className="panel"
        style={{ width: 240, flexShrink: 0, borderRight: "1px solid var(--c-border)" }}
      >
        <div className="panel__header">
          <span className="panel__title">🗄️ Collections</span>
          <button
            onClick={loadCollections}
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              color: "var(--c-text-3)",
              cursor: "pointer",
              fontSize: "0.8rem",
            }}
            title="Refresh"
          >
            ↺
          </button>
        </div>
        <div className="panel__body" style={{ padding: "8px" }}>
          {collections.length === 0 && (
            <div
              style={{
                color: "var(--c-text-3)",
                fontSize: "0.75rem",
                textAlign: "center",
                padding: "24px 8px",
              }}
            >
              No collections yet.
              <br />
              Run Step 2 to create one.
            </div>
          )}
          {collections.map((col) => (
            <div
              key={col.name}
              className={`collection-item ${selectedCol === col.name ? "collection-item--active" : ""}`}
              onClick={() => setSelectedCol(col.name)}
            >
              <div className="collection-item__name">{col.name}</div>
              <div className="collection-item__meta">
                {col.points_count?.toLocaleString() ?? "?"} points
                {col.dense_vectors && Object.keys(col.dense_vectors).length > 0 && (
                  <span className="chunk-badge chunk-badge--type" style={{ marginLeft: 4 }}>
                    dense
                  </span>
                )}
                {col.sparse_vectors && col.sparse_vectors.length > 0 && (
                  <span className="chunk-badge chunk-badge--sparse" style={{ marginLeft: 4 }}>
                    sparse
                  </span>
                )}
              </div>
              {/* Delete button */}
              {confirmDelete === col.name ? (
                <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                  <button
                    className="run-btn"
                    style={{
                      fontSize: "0.65rem",
                      padding: "2px 6px",
                      background: "var(--c-danger)",
                      color: "white",
                      minWidth: 0,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(col.name);
                    }}
                  >
                    Confirm
                  </button>
                  <button
                    className="run-btn"
                    style={{ fontSize: "0.65rem", padding: "2px 6px", minWidth: 0 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDelete(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  className="collection-item__delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDelete(col.name);
                  }}
                  title="Delete collection"
                >
                  🗑
                </button>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* MAIN: Points Browser */}
      <main
        className="panel"
        style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}
      >
        <div className="panel__header">
          <span className="panel__title">
            🔍 {selectedCol ? selectedCol : "Select a collection"}
          </span>
          {selectedColInfo && (
            <span style={{ marginLeft: 12, fontSize: "0.72rem", color: "var(--c-text-3)" }}>
              {selectedColInfo.points_count?.toLocaleString()} points
              {Object.keys(selectedColInfo.dense_vectors ?? {}).map((k) => (
                <span key={k} style={{ marginLeft: 6 }}>
                  · {k}: {selectedColInfo.dense_vectors[k]?.size}d
                </span>
              ))}
            </span>
          )}
          {/* Vector toggle */}
          <label
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: "0.75rem",
              color: "var(--c-text-2)",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={withVectors}
              onChange={(e) => setWithVectors(e.target.checked)}
            />
            Show vectors
          </label>
        </div>

        {/* Points list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
          {isLoading && (
            <div
              style={{
                textAlign: "center",
                color: "var(--c-text-3)",
                paddingTop: 40,
                fontSize: "0.85rem",
              }}
            >
              Loading chunks…
            </div>
          )}
          {!isLoading && !selectedCol && (
            <div
              style={{
                textAlign: "center",
                color: "var(--c-text-3)",
                paddingTop: 60,
                fontSize: "0.85rem",
              }}
            >
              Select a collection from the left panel.
            </div>
          )}
          {!isLoading && page && page.points.length === 0 && (
            <div
              style={{
                textAlign: "center",
                color: "var(--c-text-3)",
                paddingTop: 60,
                fontSize: "0.85rem",
              }}
            >
              Collection is empty.
            </div>
          )}
          {!isLoading &&
            page?.points.map((pt) => (
              <ChunkCard key={pt.id} point={pt} withVectors={withVectors} />
            ))}
        </div>

        {/* Pagination */}
        {page && (
          <div
            style={{
              borderTop: "1px solid var(--c-border)",
              padding: "8px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexShrink: 0,
              fontSize: "0.8rem",
              color: "var(--c-text-3)",
            }}
          >
            <button
              className="run-btn"
              style={{ fontSize: "0.75rem", padding: "4px 12px", minWidth: 0 }}
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - limit))}
            >
              ← Prev
            </button>
            <span>
              Showing {offset + 1}–{offset + (page.points.length)} of{" "}
              {selectedColInfo?.points_count?.toLocaleString() ?? "?"} 
            </span>
            <button
              className="run-btn"
              style={{ fontSize: "0.75rem", padding: "4px 12px", minWidth: 0 }}
              disabled={!page.has_more}
              onClick={() => setOffset(offset + limit)}
            >
              Next →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
