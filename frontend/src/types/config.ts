/**
 * TypeScript types that mirror the backend Pydantic config schema.
 * Keep this in sync with backend/models/config_schema.py.
 */

export type OcrEngine = "easyocr" | "rapidocr" | "tesseract" | "tesseract_cli" | "ocrmypdf" | "ocrmac" | "suryaocr" | "auto";
export type TableStructureMode = "fast" | "accurate";
export type AcceleratorDevice = "cpu" | "cuda" | "mps";
export type OutputFormat = "markdown" | "json" | "doctags" | "text" | "html" | "iterated_items";
export type PictureDescriptionKind = "granite_vision" | "api" | "disabled";
export type PictureClassificationKind = "docling" | "disabled";
export type CodeFormulaKind = "granite" | "codeformulav2" | "disabled";
export type ChartExtractionKind = "docling" | "disabled";
export type ContentLayer = "body" | "furniture" | "background" | "invisible" | "notes";

export interface IterateItemsOptions {
  with_groups: boolean;
  traverse_pictures: boolean;
  page_no: number | null;
  included_content_layers: ContentLayer[];
}

export interface OcrOptions {
  kind: OcrEngine;
  lang: string[];
  force_full_page_ocr: boolean;
  bitmap_area_threshold: number;
}

export interface TableStructureOptions {
  mode: TableStructureMode;
  do_cell_matching: boolean;
}

export interface AcceleratorOptions {
  device: AcceleratorDevice;
  num_threads: number;
}

export enum LayoutModelKind {
  DEFAULT = 'default',
  HERON_DEFAULT = 'layout_heron_default',
  HERON_V1 = 'layout_heron_v1',
  SMOCK_V1 = 'layout_smock_v1',
}

export interface LayoutOptions {
  model: LayoutModelKind;
  keep_images: boolean;
  use_legacy_layout: boolean;
}

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

export interface PictureDescriptionOptions {
  kind: PictureDescriptionKind;
  prompt: string;
}

export interface PictureClassificationOptions {
  kind: PictureClassificationKind;
}

export interface CodeFormulaOptions {
  kind: CodeFormulaKind;
}

export interface ChartExtractionOptions {
  kind: ChartExtractionKind;
}

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

export interface OutputSettings {
  formats: OutputFormat[];
}

export interface PipelineConfig {
  profile_name: string;
  description: string;
  pdf_options: PdfPipelineOptions;
  output: OutputSettings;
  iterate_items_options: IterateItemsOptions;
}

/** SSE event payloads from the pipeline stream */
export type RunEvent =
  | { type: "log"; message: string }
  | {
      type: "done";
      run_id: string;
      status: "success" | "error";
      duration_seconds: number | null;
      output_files: string[];
      output_dir: string;
      error_message: string | null;
    };

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
