// Copyright (C) 2026 olischn
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
 * TypeScript types that mirror the backend Pydantic config schema.
 * Keep this in sync with backend/models/config_schema.py.
 */

/**
 * Supported OCR backend engine identifiers received from and sent to the `/api/config` endpoints.
 * Selects which OCR implementation Docling uses on scanned pages; consumed by `ConfigPanel` and `OcrOptions`.
 */
export type OcrEngine = "easyocr" | "rapidocr" | "tesseract" | "tesseract_cli" | "ocrmypdf" | "ocrmac" | "auto";

/**
 * Table structure parser execution modes exchanged with `/api/config` and controlled via `ConfigPanel`.
 * Selects between fast rule-based table parsing and accurate ML-based TableTransformer inference in `TableStructureOptions`.
 */
export type TableStructureMode = "fast" | "accurate";

/**
 * Hardware accelerator device identifiers exchanged with `/api/config` and selected in `ConfigPanel`.
 * Configures PyTorch/ONNX execution hardware (`AcceleratorOptions`) for Docling pipeline runs.
 */
export type AcceleratorDevice = "auto" | "cpu" | "cuda" | "mps" | "xpu";

/**
 * Document export format identifiers selected in `ConfigPanel` and sent to `/api/config` and `/api/pipeline/run`.
 * Determines which output files (`OutputSettings.formats`) the backend generates and `OutputViewer` displays.
 */
export type OutputFormat = "markdown" | "json" | "doctags" | "text" | "html" | "iterated_items";

/**
 * Local values = Docling VLM presets; "api" = OpenAI-compatible endpoint (e.g. Ollama).
 * Vision-language model backend selector exchanged with `/api/config` and used by `ConfigPanel` (`PictureDescriptionOptions`).
 */
export type PictureDescriptionKind = "smolvlm" | "granite_vision" | "qwen" | "pixtral" | "api" | "disabled";

/**
 * Picture classifier backend selector exchanged with `/api/config` and controlled in `ConfigPanel`.
 * Enables or disables Docling's figure classification stage in `PictureClassificationOptions`.
 */
export type PictureClassificationKind = "docling" | "disabled";

/**
 * Code and formula recognition model selector exchanged with `/api/config` and controlled in `ConfigPanel`.
 * Configures which model enriches code blocks and LaTeX formulas in `CodeFormulaOptions`.
 */
export type CodeFormulaKind = "granite" | "codeformulav2" | "disabled";

/**
 * Chart data extraction model selector exchanged with `/api/config` and controlled in `ConfigPanel`.
 * Enables or disables chart-to-table extraction in `ChartExtractionOptions`.
 */
export type ChartExtractionKind = "docling" | "disabled";

/**
 * Document content layer identifiers exchanged with `/api/config` and selected in `ConfigPanel`.
 * Filters which structural layers Docling yields during item iteration (`IterateItemsOptions`).
 */
export type ContentLayer = "body" | "furniture" | "background" | "invisible" | "notes";

/**
 * Parameters controlling `DoclingDocument.iterate_items()`, loaded from `/api/config` and edited in `ConfigPanel`.
 * Configures group traversal, picture traversal, page filtering, and content layers for `PipelineConfig`.
 */
export interface IterateItemsOptions {
  with_groups: boolean;
  traverse_pictures: boolean;
  page_no: number | null;
  included_content_layers: ContentLayer[];
}

/**
 * OCR stage configuration parameters loaded from `/api/config` and edited in `ConfigPanel`.
 * Defines engine choice, language codes, full-page OCR forcing, and bitmap area threshold inside `PdfPipelineOptions`.
 */
export interface OcrOptions {
  kind: OcrEngine;
  lang: string[];
  force_full_page_ocr: boolean;
  bitmap_area_threshold: number;
}

/**
 * Table structure recognition options loaded from `/api/config` and edited in `ConfigPanel`.
 * Configures parser mode (`fast` vs. `accurate`) and PDF cell text matching inside `PdfPipelineOptions`.
 */
export interface TableStructureOptions {
  mode: TableStructureMode;
  do_cell_matching: boolean;
}

/**
 * Hardware acceleration settings loaded from `/api/config` and edited in `ConfigPanel`.
 * Specifies the compute device and CPU thread count inside `PdfPipelineOptions` for backend inference.
 */
export interface AcceleratorOptions {
  device: AcceleratorDevice;
  num_threads: number;
}

/**
 * Enumeration of Docling layout analysis object-detection model presets exchanged with `/api/config`.
 * Used by `LayoutOptions` and `ConfigPanel` to choose between Heron and Egret layout architectures.
 */
export enum LayoutModelKind {
  DEFAULT = "default",
  HERON_DEFAULT = "layout_heron_default",
  HERON_101 = "layout_heron_101",
  EGRET_MEDIUM = "layout_egret_medium",
  EGRET_LARGE = "layout_egret_large",
  EGRET_XLARGE = "layout_egret_xlarge",
}

/**
 * Layout detection configuration loaded from `/api/config` and edited in `ConfigPanel`.
 * Specifies the layout model preset (`LayoutModelKind`) within `PdfPipelineOptions`.
 */
export interface LayoutOptions {
  model: LayoutModelKind;
  /** @deprecated ignored by the backend (no Docling 2.x counterpart) */
  keep_images?: boolean;
  /** @deprecated ignored by the backend (no Docling 2.x counterpart) */
  use_legacy_layout?: boolean;
}

/**
 * Heading hierarchy reconstruction options loaded from `/api/config` and edited in `ConfigPanel`.
 * Controls how Docling infers document heading levels from bookmarks, numbering, styles, and font sizes in `PdfPipelineOptions`.
 */
export interface HeadingHierarchyOptions {
  enabled: boolean;
  use_bookmarks: boolean;
  use_numbering: boolean;
  use_style: boolean;
  use_font_style: boolean;
  style_size_tolerance: number;
  max_level: number;
  bookmark_match_threshold: number;
}

/**
 * Vision-language picture captioning configuration loaded from `/api/config` and edited in `ConfigPanel`.
 * Configures local VLM presets or OpenAI-compatible API endpoints, prompts, and thresholds inside `PdfPipelineOptions`.
 */
export interface PictureDescriptionOptions {
  kind: PictureDescriptionKind;
  prompt: string;
  /** Skip pictures smaller than this fraction of the page area. */
  picture_area_threshold: number;
  // Only used when kind === "api"
  api_url: string;
  api_model: string;
  /** Name of an env var holding the bearer token (secret never stored). */
  api_key_env: string | null;
  api_timeout: number;
  api_concurrency: number;
}

/**
 * Picture classification options loaded from `/api/config` and edited in `ConfigPanel`.
 * Holds the classifier backend selection (`PictureClassificationKind`) inside `PdfPipelineOptions`.
 */
export interface PictureClassificationOptions {
  kind: PictureClassificationKind;
}

/**
 * Code and mathematical formula enrichment options loaded from `/api/config` and edited in `ConfigPanel`.
 * Holds the model selection (`CodeFormulaKind`) inside `PdfPipelineOptions`.
 */
export interface CodeFormulaOptions {
  kind: CodeFormulaKind;
}

/**
 * Chart data extraction options loaded from `/api/config` and edited in `ConfigPanel`.
 * Holds the chart extractor selection (`ChartExtractionKind`) inside `PdfPipelineOptions`.
 */
export interface ChartExtractionOptions {
  kind: ChartExtractionKind;
}

/**
 * Comprehensive Docling PDF pipeline options loaded from `/api/config` via `useConfig` and edited in `ConfigPanel`.
 * Aggregates core feature toggles, image rendering, batching, queue tuning, and nested stage options for `PipelineConfig`.
 */
export interface PdfPipelineOptions {
  // Core toggles
  do_ocr: boolean;
  do_table_structure: boolean;
  do_chart_extraction: boolean;
  do_code_enrichment: boolean;
  do_formula_enrichment: boolean;
  do_picture_classification: boolean;
  do_picture_description: boolean;
  force_backend_text: boolean;
  enable_remote_services: boolean;
  allow_external_plugins: boolean;
  document_timeout: number | null;
  artifacts_path: string | null;

  // Image generation
  generate_page_images: boolean;
  generate_picture_images: boolean;
  generate_table_images: boolean;
  images_scale: number;
  generate_parsed_pages: boolean;

  // Batch sizes
  layout_batch_size: number;
  ocr_batch_size: number;
  table_batch_size: number;

  // Queue / async
  queue_max_size: number;
  batch_polling_interval_seconds: number;
  stage_shutdown_timeout_seconds: number;

  // Nested options
  ocr_options: OcrOptions;
  table_structure_options: TableStructureOptions;
  layout_options: LayoutOptions;
  heading_hierarchy_options: HeadingHierarchyOptions;
  accelerator_options: AcceleratorOptions;
  picture_description_options: PictureDescriptionOptions;
  picture_classification_options: PictureClassificationOptions;
  code_formula_options: CodeFormulaOptions;
  chart_extraction_options: ChartExtractionOptions;
}

/**
 * Export format and HTML rendering settings loaded from `/api/config` and edited in `ConfigPanel`.
 * Specifies which output formats and HTML page/annotation views the backend generates for `PipelineConfig`.
 */
export interface OutputSettings {
  formats: OutputFormat[];
  /** HTML export: one section per page with the page image as background. */
  html_split_page_view: boolean;
  /** HTML export: overlay bounding-box annotations on page images. */
  html_include_annotations: boolean;
}

/**
 * Top-level Docling configuration profile exchanged with `/api/config` via `lib/api.ts` and managed by `useConfig`.
 * Combines profile metadata, `PdfPipelineOptions`, `OutputSettings`, and `IterateItemsOptions` for `ConfigPanel` and `downloadDoclingProfile`.
 */
export interface PipelineConfig {
  profile_name: string;
  description: string;
  pdf_options: PdfPipelineOptions;
  output: OutputSettings;
  iterate_items_options: IterateItemsOptions;
}

/**
 * Terminal status of a completed pipeline run received from `/api/pipeline/run` SSE events.
 * Consumed by `useRunStream` and `RunConsole` to indicate whether parsing succeeded or failed.
 */
export type RunStatus = "success" | "error";

/**
 * SSE event payloads from the pipeline stream (must match backend/routers/pipeline.py).
 * Emitted by `POST /api/pipeline/run` and parsed by `useRunStream` to update logs, run ID, progress, and completion state.
 */
export type RunEvent =
  | { type: "log"; message: string }
  | { type: "run_id"; run_id: string }
  | {
      type: "progress";
      data: {
        percent: number;
        current?: number;
        total?: number;
        eta_seconds?: number | null;
      };
    }
  | {
      type: "done";
      run_id: string;
      status: RunStatus;
      duration_seconds: number | null;
      output_files: string[];
      output_dir: string;
      error_message: string | null;
    };

/**
 * Metadata and outcome record for a historical or active Docling pipeline run returned by `/api/pipeline/runs` and `/api/pipeline/run/{id}`.
 * Consumed by `RunHistory` and the Step 1 page to list past runs and load their output files into `OutputViewer`.
 */
export interface RunResult {
  run_id: string;
  profile_name: string;
  status: "running" | "success" | "error";
  started_at: string;
  finished_at: string | null;
  duration_seconds: number | null;
  output_dir: string;
  output_files: string[];
  page_count: number | null;
  error_message: string | null;
  warnings: string[];
}
