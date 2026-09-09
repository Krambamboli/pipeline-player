"use client";

/**
 * ChunkConfigPanel
 * ----------------
 * Config form for all chunking, serialization, metadata enrichment,
 * embedding and Qdrant options.
 *
 * Uses the same Controls.tsx components as the Docling ConfigPanel
 * (Step 1) so the visual style, tooltips and paramKey labels are identical.
 */

import type { ChunkConfig } from "@/hooks/useChunkStream";
import {
  ConfigSection,
  NumberField,
  SelectField,
  TextField,
  ToggleRow,
} from "@/components/ui/Controls";

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

/**
 * Dense embedding model options — verified working with fastembed.
 * NOTE: jinaai/jina-embeddings-v2-base-de is excluded: it produces all-NaN
 * vectors in the current fastembed ONNX runtime (known upstream bug).
 * Use jina-embeddings-v2-base-en or paraphrase-multilingual-mpnet-base-v2
 * for German text instead.
 */
const DENSE_MODELS = [
  {
    value: "BAAI/bge-small-en-v1.5",
    label: "BGE-Small-EN (English · Fast · 384d · 67 MB)",
  },
  {
    value: "BAAI/bge-base-en-v1.5",
    label: "BGE-Base-EN (English · Better Quality · 768d · 210 MB)",
  },
  {
    value: "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
    label: "MiniLM-L12-Multilingual (50+ Langs · Compact · 384d · 220 MB)",
  },
  {
    value: "sentence-transformers/paraphrase-multilingual-mpnet-base-v2",
    label: "MPNet-Multilingual (50+ Langs · High Quality · 768d · 1.0 GB)",
  },
  {
    value: "jinaai/jina-embeddings-v2-base-en",
    label: "Jina-EN (German + EN · 8 192 ctx · 768d · 520 MB)",
  },
  {
    value: "intfloat/multilingual-e5-large",
    label: "E5-Large-Multilingual (100+ Langs · Top Quality · 1 024d · 2.2 GB)",
  },
];

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
  const useDense =
    o.embedding.mode === "dense" || o.embedding.mode === "hybrid";
  const useSparse =
    o.embedding.mode === "sparse" || o.embedding.mode === "hybrid";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

      {/* ── Section: Chunker Strategy ──────────────────────────────────── */}
      <ConfigSection icon="✂️" title="Chunker Strategy" defaultOpen={true}>
        <SelectField
          id="chunker"
          label="Strategy"
          paramKey="chunker"
          value={o.chunker}
          options={[
            { value: "hybrid", label: "HybridChunker — Hierarchie + Token-Limit (empfohlen)" },
            { value: "hierarchical", label: "HierarchicalChunker — Hierarchie, kein Token-Limit" },
            { value: "page", label: "PageChunker — 1 Chunk pro Seite" },
          ]}
          onChange={(v) => onUpdate("chunker", v)}
          tooltip="Docling-Chunking-Algorithmus. HybridChunker: teilt Abschnitte respektiert Heading-Struktur UND erzwingt ein Token-Limit — empfohlen für RAG. HINWEIS: 'Hybrid' hier ist ein Docling-Algorithmus-Name und hat nichts mit dem Embedding-Modus 'Hybrid (Dense + Sparse)' zu tun. HierarchicalChunker: ein Chunk pro Dokument-Abschnitt, kein Token-Limit — konkurriert mit HybridChunker, nicht mit semantischem Chunking. PageChunker: eine PDF-Seite = ein Chunk."
        />
      </ConfigSection>

      {/* ── Section: Hybrid Chunker Options (conditional) ─────────────── */}
      {isHybrid && (
        <ConfigSection icon="⚙️" title="HybridChunker — Optionen" defaultOpen={true}>
          <SelectField
            id="hybrid_tokenizer"
            label="Tokenizer Model"
            paramKey="hybrid_chunker_options.tokenizer_model"
            value={o.hybrid_chunker_options.tokenizer_model}
            options={[
              {
                value: "BAAI/bge-small-en-v1.5",
                label: "BGE-Small-EN (matches default dense model)",
              },
              {
                value: "jinaai/jina-embeddings-v2-base-de",
                label: "Jina-DE (for German/multilingual, 8 192 ctx)",
              },
              {
                value: "intfloat/multilingual-e5-large",
                label: "E5-Large (multilingual, 512 ctx)",
              },
              {
                value: "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
                label: "MiniLM-L12 (multilingual, 512 ctx)",
              },
            ]}
            onChange={(v) => onUpdate("hybrid_chunker_options.tokenizer_model", v)}
            tooltip="HuggingFace tokenizer used to count tokens and enforce max_tokens. Should match the dense embedding model so the chunk fits inside the model's context window exactly."
          />

          <NumberField
            id="max_tokens"
            label="Max Tokens per Chunk"
            paramKey="hybrid_chunker_options.max_tokens"
            value={o.hybrid_chunker_options.max_tokens}
            min={32}
            max={8192}
            onChange={(v) => onUpdate("hybrid_chunker_options.max_tokens", v ?? 512)}
            tooltip="Maximum number of tokens a single chunk may contain. Chunks that exceed this are split further. Typical values: 256–512 for dense retrieval models (512 ctx window), up to 8 192 for Jina-DE."
          />

          <ToggleRow
            id="repeat_table_header"
            label="Repeat Table Header"
            paramKey="hybrid_chunker_options.repeat_table_header"
            checked={o.hybrid_chunker_options.repeat_table_header}
            onChange={(v) => onUpdate("hybrid_chunker_options.repeat_table_header", v)}
            tooltip="When a table is split across multiple chunks, repeat the header row at the beginning of each continuation chunk. Keeps the column context intact for retrieval."
          />

          <ToggleRow
            id="merge_peers"
            label="Merge Peer Chunks"
            paramKey="hybrid_chunker_options.merge_peers"
            checked={o.hybrid_chunker_options.merge_peers}
            onChange={(v) => onUpdate("hybrid_chunker_options.merge_peers", v)}
            tooltip="Merge small sibling chunks at the same heading level into one larger chunk if their combined token count is still below max_tokens. Reduces the number of tiny orphan chunks."
          />

          <ToggleRow
            id="omit_header_on_overflow"
            label="Omit Header on Overflow"
            paramKey="hybrid_chunker_options.omit_header_on_overflow"
            checked={o.hybrid_chunker_options.omit_header_on_overflow}
            onChange={(v) => onUpdate("hybrid_chunker_options.omit_header_on_overflow", v)}
            tooltip="If a chunk's body content alone already exceeds max_tokens, skip the heading prefix rather than creating an oversized chunk. Use for documents with extremely long sections."
          />

          <ToggleRow
            id="always_emit_headings"
            label="Always Emit Headings"
            paramKey="hybrid_chunker_options.always_emit_headings"
            checked={o.hybrid_chunker_options.always_emit_headings}
            onChange={(v) => onUpdate("hybrid_chunker_options.always_emit_headings", v)}
            tooltip="Emit a standalone chunk for every heading element, even if the heading has no body text beneath it. Useful for navigation-heavy documents or indexes."
          />
        </ConfigSection>
      )}

      {/* ── Section: Hierarchical Chunker Options (conditional) ────────── */}
      {isHierarchical && (
        <ConfigSection icon="⚙️" title="HierarchicalChunker — Optionen" defaultOpen={true}>
          <ToggleRow
            id="hier_always_emit_headings"
            label="Always Emit Headings"
            paramKey="hierarchical_chunker_options.always_emit_headings"
            checked={o.hierarchical_chunker_options.always_emit_headings}
            onChange={(v) => onUpdate("hierarchical_chunker_options.always_emit_headings", v)}
            tooltip="Emit standalone chunks for headings with no body text. Without this, empty-body headings are merged into their next sibling chunk."
          />

          <ToggleRow
            id="merge_list_items"
            label="Merge List Items"
            paramKey="hierarchical_chunker_options.merge_list_items"
            checked={o.hierarchical_chunker_options.merge_list_items}
            onChange={(v) => onUpdate("hierarchical_chunker_options.merge_list_items", v)}
            tooltip="Merge consecutive list items at the same nesting level into a single chunk instead of one chunk per bullet point. Reduces fragmentation in documents with many bullet lists."
          />
        </ConfigSection>
      )}

      {/* ── Section: Serialization ─────────────────────────────────────── */}
      <ConfigSection icon="📝" title="Serialization">
        <ToggleRow
          id="include_headings_in_text"
          label="Include Headings in Text"
          paramKey="serialization.include_headings_in_text"
          checked={o.serialization.include_headings_in_text}
          onChange={(v) => onUpdate("serialization.include_headings_in_text", v)}
          tooltip="Prepend the full heading path (e.g. 'Chapter 1 > Section 2') to the embedded chunk text. Significantly improves retrieval accuracy for queries that reference section names or chapter titles."
        />

        <ToggleRow
          id="include_captions_in_text"
          label="Include Captions in Text"
          paramKey="serialization.include_captions_in_text"
          checked={o.serialization.include_captions_in_text}
          onChange={(v) => onUpdate("serialization.include_captions_in_text", v)}
          tooltip="Include figure and table captions in the chunk text that is embedded. Captions often contain the most information-dense description of a visual element."
        />
      </ConfigSection>

      {/* ── Section: Metadata Enrichment ──────────────────────────────── */}
      <ConfigSection icon="🏷️" title="Metadata Enrichment">
        <ToggleRow
          id="add_doc_source"
          label="Source Filename"
          paramKey="metadata.add_doc_source"
          checked={o.metadata.add_doc_source}
          onChange={(v) => onUpdate("metadata.add_doc_source", v)}
          tooltip="Store the original document filename (e.g. 'lecture_01.pdf') in the Qdrant payload. Enables filename-level filtering when querying multiple documents in one collection."
        />

        <ToggleRow
          id="add_run_id"
          label="Docling Run ID"
          paramKey="metadata.add_run_id"
          checked={o.metadata.add_run_id}
          onChange={(v) => onUpdate("metadata.add_run_id", v)}
          tooltip="Store the Docling parse run ID that produced this document. Lets you trace every chunk back to the exact parsing run for reproducibility and debugging."
        />

        <ToggleRow
          id="add_page_numbers"
          label="Page Numbers"
          paramKey="metadata.add_page_numbers"
          checked={o.metadata.add_page_numbers}
          onChange={(v) => onUpdate("metadata.add_page_numbers", v)}
          tooltip="Extract and store the page number(s) that each chunk spans. Enables page-level citation generation — e.g. 'Source: page 4 of lecture_01.pdf'."
        />

        <ToggleRow
          id="add_headings"
          label="Heading Path"
          paramKey="metadata.add_headings"
          checked={o.metadata.add_headings}
          onChange={(v) => onUpdate("metadata.add_headings", v)}
          tooltip="Store the heading hierarchy above each chunk as an ordered list (e.g. ['Chapter 3', 'Section 3.2']). Enables course/chapter/section reference generation automatically per chunk."
        />

        <ToggleRow
          id="add_element_types"
          label="Element Types"
          paramKey="metadata.add_element_types"
          checked={o.metadata.add_element_types}
          onChange={(v) => onUpdate("metadata.add_element_types", v)}
          tooltip="Store a list of DocItem labels present in the chunk (e.g. ['text', 'table', 'figure']). Useful for content-type filtering — e.g. retrieve only chunks that contain tables."
        />

        <ToggleRow
          id="add_token_count"
          label="Token Count"
          paramKey="metadata.add_token_count"
          checked={o.metadata.add_token_count}
          onChange={(v) => onUpdate("metadata.add_token_count", v)}
          tooltip="Store the number of tokens in the chunk text in the payload. Useful for size-aware retrieval strategies and for inspecting chunk quality in the Vector DB Inspector."
        />

        {/* Custom static fields ──────────────────────────────── */}
        <div style={{ marginTop: 12 }}>
          <div
            className="field__label"
            style={{ marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}
          >
            <span>Custom Fields</span>
            <code style={{ fontSize: "0.7rem" }}>metadata.custom_fields</code>
          </div>
          <div
            style={{
              fontSize: "0.72rem",
              color: "var(--c-text-3)",
              marginBottom: 8,
              lineHeight: 1.5,
            }}
          >
            Static key-value pairs added to every chunk payload — e.g.&nbsp;
            <code>course_id</code>, <code>semester</code>, <code>language</code>.
          </div>

          {/* Existing custom fields */}
          {Object.entries(o.metadata.custom_fields).map(([k, v]) => (
            <div
              key={k}
              style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}
            >
              <code
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.72rem",
                  background: "var(--c-bg-3)",
                  border: "1px solid var(--c-border)",
                  padding: "2px 8px",
                  borderRadius: 4,
                  flex: 1,
                  color: "var(--c-text-2)",
                }}
              >
                {k}:{" "}
                <span style={{ color: "var(--c-accent)" }}>{String(v)}</span>
              </code>
              <button
                onClick={() => onRemoveCustomField(k)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--c-error)",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  lineHeight: 1,
                  padding: "2px 4px",
                }}
                title={`Remove ${k}`}
              >
                ✕
              </button>
            </div>
          ))}

          {/* Add new custom field ─ labeled row with compact button */}
          <div style={{ marginTop: 8 }}>
            {/* Column labels */}
            <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
              <span style={{ flex: 1, fontSize: "0.68rem", color: "var(--c-text-3)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>Key</span>
              <span style={{ flex: 1, fontSize: "0.68rem", color: "var(--c-text-3)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>Value</span>
              <span style={{ width: 28 }} />
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input
                type="text"
                className="input"
                placeholder="e.g. course_id"
                value={customKeyInput}
                onChange={(e) => onCustomKeyChange(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") onAddCustomField(); }}
                style={{ flex: 1, fontSize: "0.8rem" }}
              />
              <input
                type="text"
                className="input"
                placeholder="e.g. ML101"
                value={customValInput}
                onChange={(e) => onCustomValChange(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") onAddCustomField(); }}
                style={{ flex: 1, fontSize: "0.8rem" }}
              />
              <button
                onClick={onAddCustomField}
                disabled={!customKeyInput.trim() || !customValInput.trim()}
                title="Add field (or press Enter)"
                style={{
                  width: 28,
                  height: 28,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: customKeyInput.trim() && customValInput.trim()
                    ? "var(--c-accent)"
                    : "var(--c-surface-2)",
                  border: "1px solid var(--c-border)",
                  borderRadius: "var(--r-sm)",
                  color: customKeyInput.trim() && customValInput.trim()
                    ? "#fff"
                    : "var(--c-text-3)",
                  cursor: customKeyInput.trim() && customValInput.trim()
                    ? "pointer"
                    : "not-allowed",
                  fontSize: "1rem",
                  lineHeight: 1,
                  transition: "background var(--t-fast), color var(--t-fast)",
                }}
              >
                +
              </button>
            </div>
          </div>
        </div>
      </ConfigSection>

      {/* ── Section: Embedding ────────────────────────────────────────── */}
      <ConfigSection icon="🔢" title="Embedding">
        <SelectField
          id="embedding_mode"
          label="Mode"
          paramKey="embedding.mode"
          value={o.embedding.mode}
          options={[
            { value: "dense", label: "Dense (semantic similarity)" },
            { value: "sparse", label: "Sparse (BM25 keyword)" },
            { value: "hybrid", label: "Hybrid (dense + sparse, enables RRF)" },
          ]}
          onChange={(v) => onUpdate("embedding.mode", v)}
          tooltip="dense: one semantic vector per chunk using a neural encoder. sparse: BM25 keyword-frequency vector (no model needed). hybrid: both — stored as named vectors in Qdrant, enabling Reciprocal Rank Fusion (RRF) at query time."
        />

        {useDense && (
          <SelectField
            id="dense_model"
            label="Dense Model"
            paramKey="embedding.dense_model"
            value={o.embedding.dense_model}
            options={DENSE_MODELS}
            onChange={(v) => onUpdate("embedding.dense_model", v)}
            tooltip="fastembed model for dense embedding. Downloaded automatically on first use — no API key required. Choose Jina-DE for German or multilingual documents. E5-Large gives the best retrieval quality but is 2.2 GB."
          />
        )}

        {useSparse && (
          <SelectField
            id="sparse_model"
            label="Sparse Model"
            paramKey="embedding.sparse_model"
            value={o.embedding.sparse_model}
            options={[
              { value: "Qdrant/bm25", label: "Qdrant/bm25 (BM25, language-aware)" },
              { value: "prithivida/Splade_PP_en_v1", label: "SPLADE++ (learned sparse, EN)" },
            ]}
            onChange={(v) => onUpdate("embedding.sparse_model", v)}
            tooltip="fastembed model for sparse embedding. Qdrant/bm25 is a classic BM25 term-frequency model — fast and language-aware. SPLADE++ is a learned sparse model with better recall but slower."
          />
        )}

        <NumberField
          id="batch_size"
          label="Embedding Batch Size"
          paramKey="embedding.batch_size"
          value={o.embedding.batch_size}
          min={1}
          max={512}
          onChange={(v) => onUpdate("embedding.batch_size", v ?? 32)}
          tooltip="Number of chunks embedded per batch. Larger batches are faster but require more RAM. 32 is a safe default for most machines. Increase to 128+ if you have ≥32 GB RAM and a large document."
        />
      </ConfigSection>

      {/* ── Section: Qdrant Storage ───────────────────────────────────── */}
      <ConfigSection icon="🗄️" title="Qdrant Storage">
        <TextField
          id="storage_path"
          label="Storage Path"
          paramKey="qdrant.storage_path"
          value={o.qdrant.storage_path}
          placeholder="./qdrant_storage"
          onChange={(v) => onUpdate("qdrant.storage_path", v ?? "./qdrant_storage")}
          tooltip="Path to the on-disk Qdrant storage directory. Relative paths are resolved from the repo root. The same storage is shared between all Docling text collections and future ColPali image collections."
        />

        <TextField
          id="collection_name"
          label="Collection Name"
          paramKey="qdrant.collection_name"
          value={o.qdrant.collection_name || null}
          placeholder="Auto-generated (docling_dense_YYYYMMDD…)"
          onChange={(v) => onUpdate("qdrant.collection_name", v ?? "")}
          tooltip="Name of the Qdrant collection to write chunks into. Leave empty to auto-generate a name from the run ID and embedding mode (e.g. 'docling_hybrid_20240901'). Use a fixed name to append multiple documents into the same collection."
        />

        <ToggleRow
          id="overwrite_collection"
          label="Overwrite Collection"
          paramKey="qdrant.overwrite_collection"
          checked={o.qdrant.overwrite_collection}
          onChange={(v) => onUpdate("qdrant.overwrite_collection", v)}
          tooltip="If ON and the collection already exists, delete it and start fresh before upserting. If OFF, new chunks are appended to the existing collection. Turn ON when re-indexing a document after a config change."
        />

        <ToggleRow
          id="on_disk_payload"
          label="On-Disk Payload"
          paramKey="qdrant.on_disk_payload"
          checked={o.qdrant.on_disk_payload}
          onChange={(v) => onUpdate("qdrant.on_disk_payload", v)}
          tooltip="Store chunk metadata (payload) on disk rather than in RAM. Recommended for collections with thousands of chunks. Slightly higher latency on reads but much lower peak memory usage."
        />
      </ConfigSection>
    </div>
  );
}
