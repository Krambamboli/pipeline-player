"use client";

/**
 * ChunkConfigPanel
 * ----------------
 * Config form for all chunking, serialization, metadata enrichment,
 * embedding and Qdrant options. Mirrors ConfigPanel.tsx in style.
 */

import type { ChunkConfig } from "@/hooks/useChunkStream";

interface Props {
  config: ChunkConfig;
  onUpdate: (path: string, value: unknown) => void;
  customKeyInput: string;
  customValInput: string;
  onCustomKeyChange: (v: string) => void;
  onCustomValChange: (v: string) => void;
  onAddCustomField: () => void;
  onRemoveCustomField: (key: string) => void;
}

// Reusable form field components
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="config-section">
      <div className="config-section__title">{title}</div>
      {children}
    </div>
  );
}

function Toggle({
  label,
  value,
  path,
  tooltip,
  onUpdate,
}: {
  label: string;
  value: boolean;
  path: string;
  tooltip?: string;
  onUpdate: (path: string, value: unknown) => void;
}) {
  return (
    <div className="config-row config-row--toggle">
      <label className="config-label" title={tooltip}>
        {label}
        {tooltip && <span className="config-tooltip">?</span>}
      </label>
      <label className="toggle">
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onUpdate(path, e.target.checked)}
        />
        <span className="toggle__track" />
      </label>
    </div>
  );
}

function NumberField({
  label,
  value,
  path,
  min,
  max,
  tooltip,
  onUpdate,
}: {
  label: string;
  value: number;
  path: string;
  min?: number;
  max?: number;
  tooltip?: string;
  onUpdate: (path: string, value: unknown) => void;
}) {
  return (
    <div className="config-row">
      <label className="config-label" title={tooltip}>
        {label}
        {tooltip && <span className="config-tooltip">?</span>}
      </label>
      <input
        type="number"
        className="config-input"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onUpdate(path, Number(e.target.value))}
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  path,
  options,
  tooltip,
  onUpdate,
}: {
  label: string;
  value: string;
  path: string;
  options: { label: string; value: string }[];
  tooltip?: string;
  onUpdate: (path: string, value: unknown) => void;
}) {
  return (
    <div className="config-row">
      <label className="config-label" title={tooltip}>
        {label}
        {tooltip && <span className="config-tooltip">?</span>}
      </label>
      <select
        className="config-select"
        value={value}
        onChange={(e) => onUpdate(path, e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextField({
  label,
  value,
  path,
  placeholder,
  tooltip,
  onUpdate,
}: {
  label: string;
  value: string;
  path: string;
  placeholder?: string;
  tooltip?: string;
  onUpdate: (path: string, value: unknown) => void;
}) {
  return (
    <div className="config-row">
      <label className="config-label" title={tooltip}>
        {label}
        {tooltip && <span className="config-tooltip">?</span>}
      </label>
      <input
        type="text"
        className="config-input"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onUpdate(path, e.target.value)}
      />
    </div>
  );
}

export default function ChunkConfigPanel({
  config,
  onUpdate,
  customKeyInput,
  customValInput,
  onCustomKeyChange,
  onCustomValChange,
  onAddCustomField,
  onRemoveCustomField,
}: Props) {
  const o = config;
  const isHybrid = o.chunker === "hybrid";
  const isHierarchical = o.chunker === "hierarchical";

  return (
    <div>
      {/* ── Chunker Strategy ─────────────────────────────────────── */}
      <Section title="✂️ Chunker Strategy">
        <SelectField
          label="Chunker"
          value={o.chunker}
          path="chunker"
          tooltip="hybrid: token-aware with heading hierarchy (best for RAG). hierarchical: one chunk per section. page: one chunk per page."
          options={[
            { value: "hybrid", label: "Hybrid (token-aware)" },
            { value: "hierarchical", label: "Hierarchical" },
            { value: "page", label: "Page" },
          ]}
          onUpdate={onUpdate}
        />
      </Section>

      {/* ── HybridChunker Options ─────────────────────────────────── */}
      {isHybrid && (
        <Section title="⚙️ Hybrid Chunker Options">
          <TextField
            label="Tokenizer Model"
            value={o.hybrid_chunker_options.tokenizer_model}
            path="hybrid_chunker_options.tokenizer_model"
            placeholder="BAAI/bge-small-en-v1.5"
            tooltip="HuggingFace tokenizer to use for token counting. Should match the embedding model."
            onUpdate={onUpdate}
          />
          <NumberField
            label="Max Tokens"
            value={o.hybrid_chunker_options.max_tokens}
            path="hybrid_chunker_options.max_tokens"
            min={32}
            max={8192}
            tooltip="Maximum tokens per chunk. Typical: 256–512 for retrieval models."
            onUpdate={onUpdate}
          />
          <Toggle
            label="Repeat Table Header"
            value={o.hybrid_chunker_options.repeat_table_header}
            path="hybrid_chunker_options.repeat_table_header"
            tooltip="Repeat the table header row at the start of each continuation chunk."
            onUpdate={onUpdate}
          />
          <Toggle
            label="Merge Peers"
            value={o.hybrid_chunker_options.merge_peers}
            path="hybrid_chunker_options.merge_peers"
            tooltip="Merge small sibling chunks into one if they fit within max_tokens."
            onUpdate={onUpdate}
          />
          <Toggle
            label="Omit Header on Overflow"
            value={o.hybrid_chunker_options.omit_header_on_overflow}
            path="hybrid_chunker_options.omit_header_on_overflow"
            tooltip="Skip heading prefix if the content alone already exceeds max_tokens."
            onUpdate={onUpdate}
          />
          <Toggle
            label="Always Emit Headings"
            value={o.hybrid_chunker_options.always_emit_headings}
            path="hybrid_chunker_options.always_emit_headings"
            tooltip="Emit standalone chunks for headings with no body text."
            onUpdate={onUpdate}
          />
        </Section>
      )}

      {/* ── HierarchicalChunker Options ───────────────────────────── */}
      {isHierarchical && (
        <Section title="⚙️ Hierarchical Chunker Options">
          <Toggle
            label="Always Emit Headings"
            value={o.hierarchical_chunker_options.always_emit_headings}
            path="hierarchical_chunker_options.always_emit_headings"
            tooltip="Emit standalone chunks for headings with no body text."
            onUpdate={onUpdate}
          />
          <Toggle
            label="Merge List Items"
            value={o.hierarchical_chunker_options.merge_list_items}
            path="hierarchical_chunker_options.merge_list_items"
            tooltip="Merge consecutive list items into one chunk instead of one per bullet."
            onUpdate={onUpdate}
          />
        </Section>
      )}

      {/* ── Serialization ─────────────────────────────────────────── */}
      <Section title="📝 Serialization">
        <Toggle
          label="Include Headings in Text"
          value={o.serialization.include_headings_in_text}
          path="serialization.include_headings_in_text"
          tooltip="Prepend heading path to the text before embedding. Improves semantic accuracy."
          onUpdate={onUpdate}
        />
        <Toggle
          label="Include Captions in Text"
          value={o.serialization.include_captions_in_text}
          path="serialization.include_captions_in_text"
          tooltip="Include figure/table captions in the embedded chunk text."
          onUpdate={onUpdate}
        />
      </Section>

      {/* ── Metadata Enrichment ───────────────────────────────────── */}
      <Section title="🏷️ Metadata Enrichment">
        <Toggle label="Source Filename" value={o.metadata.add_doc_source} path="metadata.add_doc_source" onUpdate={onUpdate} />
        <Toggle label="Run ID" value={o.metadata.add_run_id} path="metadata.add_run_id" onUpdate={onUpdate} />
        <Toggle label="Page Numbers" value={o.metadata.add_page_numbers} path="metadata.add_page_numbers" tooltip="Extract and store page number(s) each chunk spans." onUpdate={onUpdate} />
        <Toggle label="Headings" value={o.metadata.add_headings} path="metadata.add_headings" tooltip="Store the heading hierarchy above each chunk." onUpdate={onUpdate} />
        <Toggle label="Element Types" value={o.metadata.add_element_types} path="metadata.add_element_types" tooltip="Store DocItem labels (text, table, figure...) in the chunk." onUpdate={onUpdate} />
        <Toggle label="Token Count" value={o.metadata.add_token_count} path="metadata.add_token_count" onUpdate={onUpdate} />

        {/* Custom fields */}
        <div style={{ marginTop: 8, fontSize: "0.78rem", color: "var(--c-text-3)", marginBottom: 4 }}>
          Custom fields (e.g. course_id, semester):
        </div>
        {Object.entries(o.metadata.custom_fields).map(([k, v]) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.72rem",
                background: "var(--c-bg-3)",
                padding: "2px 6px",
                borderRadius: 4,
                flex: 1,
              }}
            >
              {k}: {String(v)}
            </span>
            <button
              onClick={() => onRemoveCustomField(k)}
              style={{
                background: "none",
                border: "none",
                color: "var(--c-error)",
                cursor: "pointer",
                fontSize: "0.8rem",
              }}
            >
              ✕
            </button>
          </div>
        ))}
        <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
          <input
            type="text"
            className="config-input"
            placeholder="key"
            value={customKeyInput}
            onChange={(e) => onCustomKeyChange(e.target.value)}
            style={{ flex: 1 }}
          />
          <input
            type="text"
            className="config-input"
            placeholder="value"
            value={customValInput}
            onChange={(e) => onCustomValChange(e.target.value)}
            style={{ flex: 1 }}
          />
          <button
            className="run-btn"
            style={{ padding: "4px 10px", fontSize: "0.8rem", minWidth: 0 }}
            onClick={onAddCustomField}
          >
            +
          </button>
        </div>
      </Section>

      {/* ── Embedding ─────────────────────────────────────────────── */}
      <Section title="🔢 Embedding">
        <SelectField
          label="Mode"
          value={o.embedding.mode}
          path="embedding.mode"
          tooltip="dense: semantic vectors. sparse: BM25 keyword vectors. hybrid: both (enables RRF fusion)."
          options={[
            { value: "dense", label: "Dense (semantic)" },
            { value: "sparse", label: "Sparse (BM25)" },
            { value: "hybrid", label: "Hybrid (dense + sparse)" },
          ]}
          onUpdate={onUpdate}
        />
        {(o.embedding.mode === "dense" || o.embedding.mode === "hybrid") && (
          <SelectField
            label="Dense Model"
            value={o.embedding.dense_model}
            path="embedding.dense_model"
            tooltip="fastembed dense models. Auto-downloaded on first run."
            options={[
              { value: "BAAI/bge-small-en-v1.5", label: "BAAI/bge-small-en (English, Fast, 384d)" },
              { value: "jinaai/jina-embeddings-v2-base-de", label: "Jina DE (German+EN, 8k ctx, 768d)" },
              { value: "intfloat/multilingual-e5-large", label: "E5-Large (100+ Langs, High Qual, 1024d)" },
              { value: "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2", label: "MiniLM-L12 (50+ Langs, Fast, 384d)" }
            ]}
            onUpdate={onUpdate}
          />
        )}
        {(o.embedding.mode === "sparse" || o.embedding.mode === "hybrid") && (
          <TextField
            label="Sparse Model"
            value={o.embedding.sparse_model}
            path="embedding.sparse_model"
            placeholder="Qdrant/bm25"
            tooltip="fastembed model for sparse BM25/BM42 embedding."
            onUpdate={onUpdate}
          />
        )}
        <NumberField
          label="Batch Size"
          value={o.embedding.batch_size}
          path="embedding.batch_size"
          min={1}
          max={512}
          tooltip="Chunks embedded per batch. Larger = faster but more RAM."
          onUpdate={onUpdate}
        />
      </Section>

      {/* ── Qdrant Storage ────────────────────────────────────────── */}
      <Section title="🗄️ Qdrant Storage">
        <TextField
          label="Storage Path"
          value={o.qdrant.storage_path}
          path="qdrant.storage_path"
          placeholder="./qdrant_storage"
          tooltip="On-disk storage directory. Shared between all collections (text + ColPali)."
          onUpdate={onUpdate}
        />
        <TextField
          label="Collection Name"
          value={o.qdrant.collection_name}
          path="qdrant.collection_name"
          placeholder="Auto-generated if empty"
          tooltip="Leave empty to auto-generate from run ID + mode."
          onUpdate={onUpdate}
        />
        <Toggle
          label="Overwrite Collection"
          value={o.qdrant.overwrite_collection}
          path="qdrant.overwrite_collection"
          tooltip="Delete and recreate the collection before upserting. If false, appends."
          onUpdate={onUpdate}
        />
        <Toggle
          label="On-Disk Payload"
          value={o.qdrant.on_disk_payload}
          path="qdrant.on_disk_payload"
          tooltip="Store metadata on disk instead of RAM. Lower memory usage for large collections."
          onUpdate={onUpdate}
        />
      </Section>
    </div>
  );
}
