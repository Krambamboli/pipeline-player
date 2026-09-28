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
 * downloadSettings.ts
 * -------------------
 * WHY: Allows users to export the current pipeline configuration as an
 * annotated Markdown file — great for documenting experiments, sharing
 * reproducible setups, or keeping a history of what worked.
 *
 * HOW: Pure client-side. Reads the current React state, generates a
 * Markdown string with inline comments for every setting, and triggers
 * a browser file download via Blob + URL.createObjectURL.
 */

import type { PipelineConfig } from "@/types/config";
import type { ChunkConfig } from "@/hooks/useChunkStream";

// ── Generic download helper ───────────────────────────────────────────────

/**
 * Triggers a browser download of a text file.
 * @param content   - The text content to write into the file
 * @param filename  - The suggested filename (e.g. "my-config.md")
 */
function triggerDownload(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Docling Profile Export ────────────────────────────────────────────────

/**
 * Exports the currently active Docling pipeline profile as an annotated
 * Markdown file. Each setting includes a comment explaining its effect.
 */
export function downloadDoclingProfile(config: PipelineConfig): void {
  const p = config.pdf_options;
  const o = config.output;
  const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

  const md = `# Pipeline Player — Docling Profile Export
> Profile: **${config.profile_name ?? "default"}**  
> Exported: ${new Date().toLocaleString()}

---

## Profile

| Key | Value |
|---|---|
| **Name** | \`${config.profile_name ?? ""}\` |
| **Description** | ${config.description ?? "—"} |

---

## Core Processing Flags

| Setting | Value | Description |
|---|---|---|
| \`do_ocr\` | \`${p.do_ocr}\` | Run OCR on pages. Disable only if the PDF contains selectable text and you trust its quality. |
| \`do_table_structure\` | \`${p.do_table_structure}\` | Detect and reconstruct table structures. Adds significant processing time on complex tables. |
| \`do_chart_extraction\` | \`${p.do_chart_extraction}\` | Extract and parse charts (bar, line, pie). Requires Docling chart models. |
| \`do_code_enrichment\` | \`${p.do_code_enrichment}\` | Detect code blocks and apply syntax-aware formatting. |
| \`do_formula_enrichment\` | \`${p.do_formula_enrichment}\` | Detect mathematical formulas and convert to LaTeX. Requires CodeFormulaV2. |
| \`do_picture_classification\` | \`${p.do_picture_classification}\` | Classify extracted images (photo, diagram, chart, etc.). |
| \`do_picture_description\` | \`${p.do_picture_description}\` | Generate natural-language captions for images using a VLM. Slow but enriches RAG context. |
| \`force_backend_text\` | \`${p.force_backend_text}\` | Use the PDF's embedded text instead of OCR output, even when OCR is enabled. |
| \`enable_remote_services\` | \`${p.enable_remote_services}\` | Allow Docling to call external APIs for enrichment (e.g. cloud OCR). |

---

## Performance & Batching

| Setting | Value | Description |
|---|---|---|
| \`document_timeout\` | \`${p.document_timeout}s\` | Hard timeout per document. Increase for very large PDFs. |
| \`layout_batch_size\` | \`${p.layout_batch_size}\` | Number of pages processed in parallel by the layout model. Higher = faster but more VRAM. |
| \`ocr_batch_size\` | \`${p.ocr_batch_size}\` | Batch size for OCR inference. |
| \`table_batch_size\` | \`${p.table_batch_size}\` | Batch size for table detection inference. |
| \`queue_max_size\` | \`${p.queue_max_size}\` | Max items queued between pipeline stages before backpressure kicks in. |

---

## Image Generation

| Setting | Value | Description |
|---|---|---|
| \`generate_page_images\` | \`${p.generate_page_images}\` | **Required for HTML annotation view.** Renders each PDF page as a raster image. |
| \`generate_picture_images\` | \`${p.generate_picture_images}\` | Extract cropped images for each detected picture element. |
| \`generate_table_images\` | \`${p.generate_table_images}\` | Extract cropped images for each detected table. |
| \`images_scale\` | \`${p.images_scale}×\` | DPI multiplier for rasterized page images (2.0 = 144 DPI, 3.5 = 252 DPI). Higher = sharper but larger files. |

---

## OCR Engine

| Setting | Value | Description |
|---|---|---|
| \`kind\` | \`${p.ocr_options?.kind ?? "rapidocr"}\` | OCR engine: \`rapidocr\` (fast, bundled), \`easyocr\` (GPU, better accuracy), \`tesseract\`, \`ocrmypdf\`. |
| \`lang\` | \`${(p.ocr_options?.lang ?? []).join(", ")}\` | Languages to recognise. Use ISO 639-1 codes (e.g. \`en\`, \`de\`, \`fr\`). |
| \`force_full_page_ocr\` | \`${p.ocr_options?.force_full_page_ocr}\` | Run OCR on every page even if selectable text exists. Useful for scanned PDFs with embedded font glyphs. |
| \`bitmap_area_threshold\` | \`${p.ocr_options?.bitmap_area_threshold}\` | Min fraction of a page that must be bitmap before OCR is triggered (0–1). |

---

## Table Structure

| Setting | Value | Description |
|---|---|---|
| \`mode\` | \`${p.table_structure_options?.mode ?? "accurate"}\` | \`fast\` = rule-based (quick), \`accurate\` = ML model (better for complex tables). |
| \`do_cell_matching\` | \`${p.table_structure_options?.do_cell_matching}\` | Match detected table cells to the PDF's text layer. Increases accuracy. |

---

## Layout

| Setting | Value | Description |
|---|---|---|
| \`keep_images\` | \`${p.layout_options?.keep_images}\` | Retain picture elements in the output document. |
| \`use_legacy_layout\` | \`${p.layout_options?.use_legacy_layout}\` | Use the older rule-based layout model instead of the deep-learning one. |

---

## Heading Hierarchy

| Setting | Value | Description |
|---|---|---|
| \`enabled\` | \`${p.heading_hierarchy_options?.enabled}\` | Reconstruct document heading hierarchy from visual cues. |
| \`use_bookmarks\` | \`${p.heading_hierarchy_options?.use_bookmarks}\` | Use PDF bookmarks/outlines as heading anchors. |
| \`use_numbering\` | \`${p.heading_hierarchy_options?.use_numbering}\` | Infer heading level from numbered prefixes (1., 1.1., etc.). |
| \`use_style\` | \`${p.heading_hierarchy_options?.use_style}\` | Use font style (bold/italic) to determine heading level. |
| \`use_font_style\` | \`${p.heading_hierarchy_options?.use_font_style}\` | Use font size differences to infer hierarchy. |
| \`max_level\` | \`${p.heading_hierarchy_options?.max_level}\` | Maximum heading depth to detect (1–6). |

---

## Accelerator

| Setting | Value | Description |
|---|---|---|
| \`device\` | \`${p.accelerator_options?.device ?? "auto"}\` | Inference device: \`cpu\`, \`cuda\` (NVIDIA), \`mps\` (Apple Silicon), \`auto\`. |
| \`num_threads\` | \`${p.accelerator_options?.num_threads}\` | CPU thread count for ONNX/PyTorch inference. |

---

## Output Formats

| Setting | Value | Description |
|---|---|---|
| \`formats\` | \`${(o?.formats ?? []).join(", ")}\` | Which output files to generate per run. |
| \`html_split_page_view\` | \`${o?.html_split_page_view}\` | Render HTML with one page per section (vs. continuous scroll). |
| \`html_include_annotations\` | \`${o?.html_include_annotations}\` | Overlay bounding boxes and element labels on page images in HTML. |

---

*Generated by Pipeline Player · ${ts}*
`;

  triggerDownload(md, `docling-profile-${config.profile_name ?? "default"}-${ts}.md`);
}

// ── ColPali Settings Export ───────────────────────────────────────────────

export interface ColPaliExportSettings {
  selectedPdf: string;
  modelName: string;
  device: string;
  batchSize: number;
  dpi: number;
  maxPages: string;
  collectionName: string;
  metadata: Record<string, string>;
}

/**
 * Exports the current ColPali pipeline configuration as an annotated
 * Markdown file.
 */
export function downloadColPaliSettings(settings: ColPaliExportSettings): void {
  const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const metaRows =
    Object.keys(settings.metadata).length > 0
      ? Object.entries(settings.metadata)
          .map(([k, v]) => `| \`${k}\` | \`${v}\` |`)
          .join("\n")
      : "| — | *(no custom metadata)* |";

  const md = `# Pipeline Player — ColPali Settings Export
> Exported: ${new Date().toLocaleString()}

---

## Source

| Setting | Value | Description |
|---|---|---|
| \`pdf\` | \`${settings.selectedPdf}\` | The PDF file processed by this pipeline run. |
| \`collection_name\` | \`${settings.collectionName || "(auto-generated)"}\` | Target Qdrant collection name. Auto-generated from PDF name + timestamp if empty. |

---

## Model & Hardware

| Setting | Value | Description |
|---|---|---|
| \`model\` | \`${settings.modelName}\` | ColPali/ColQwen2 model variant. \`vidore/colqwen2-v1.0\` is the recommended default (late-interaction multi-vector). |
| \`device\` | \`${settings.device}\` | Inference device: \`mps\` (Apple Silicon), \`cuda\` (NVIDIA GPU), \`cpu\` (slow, fallback). |
| \`batch_size\` | \`${settings.batchSize}\` | Number of pages processed per model forward pass. Reduce if you hit OOM errors. |

---

## PDF Rendering

| Setting | Value | Description |
|---|---|---|
| \`dpi\` | \`${settings.dpi}\` | Resolution at which PDF pages are rasterized before embedding. Higher DPI = more detail captured but slower and more memory. 144 DPI is a good balance. |
| \`max_pages\` | \`${settings.maxPages || "all"}\` | Limit processing to the first N pages. Leave empty to process the entire document. Useful for large PDFs during experimentation. |

---

## Collection Metadata

These key-value pairs are stored alongside every page embedding in Qdrant.
They are searchable via the Inspector and can be used to filter results at retrieval time.

| Key | Value |
|---|---|
${metaRows}

---

## Model Notes

### \`vidore/colqwen2-v1.0\` (recommended)
- **Architecture:** Late-interaction multi-vector model (ColPali family)
- **Embedding:** One vector per image patch (~1000 vectors/page)
- **Scoring:** MaxSim — the query token with the highest similarity to each patch determines the page score
- **Strength:** Captures layout, tables, charts, and visual structure without OCR
- **First use:** ~5 GB model download from HuggingFace

---

*Generated by Pipeline Player · ${ts}*
`;

  triggerDownload(md, `colpali-settings-${ts}.md`);
}
