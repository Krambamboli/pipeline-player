"use client";

/**
 * ConfigPanel — The heart of the application.
 * Renders every Docling PdfPipelineOptions parameter as an annotated UI
 * control. Organised into collapsible sections. Every change is immediately
 * propagated up to the useConfig hook, which debounces it to the backend.
 */

import type { PipelineConfig } from "@/types/config";
import {
  ConfigSection,
  MultiCheckField,
  NumberField,
  SelectField,
  SliderField,
  TagListField,
  TextareaField,
  TextField,
  ToggleRow,
} from "@/components/ui/Controls";

interface Props {
  config: PipelineConfig;
  onUpdate: (path: string, value: unknown) => void;
}

export default function ConfigPanel({ config, onUpdate }: Props) {
  const o = config.pdf_options;
  const p = (path: string) => `pdf_options.${path}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

      {/* ── Section 1: Core Pipeline ──────────────────────────────────── */}
      <ConfigSection icon="⚡" title="Core Pipeline" defaultOpen={true}>

        <ToggleRow
          id="do_ocr"
          label="Enable OCR"
          paramKey="do_ocr"
          checked={o.do_ocr}
          onChange={(v) => onUpdate(p("do_ocr"), v)}
          tooltip="Run the selected OCR engine on pages identified as scanned or image-based. Disable to rely only on native PDF text extraction — much faster for text-based PDFs."
        />

        <ToggleRow
          id="do_table_structure"
          label="Parse Table Structure"
          paramKey="do_table_structure"
          checked={o.do_table_structure}
          onChange={(v) => onUpdate(p("do_table_structure"), v)}
          tooltip="Enable AI-powered table detection and cell structure parsing using TableTransformer/TATR. Produces structured table objects with rows, columns, and cell content. Disable for text-only documents."
        />

        <ToggleRow
          id="do_chart_extraction"
          label="Chart Data Extraction"
          paramKey="do_chart_extraction"
          checked={o.do_chart_extraction}
          onChange={(v) => onUpdate(p("do_chart_extraction"), v)}
          tooltip="Experimental: extract underlying data from bar charts, line graphs, and pie charts into structured tables. Significantly increases processing time. Requires chart_extraction_options to be configured."
        />

        <ToggleRow
          id="do_code_enrichment"
          label="Code Block Enrichment"
          paramKey="do_code_enrichment"
          checked={o.do_code_enrichment}
          onChange={(v) => onUpdate(p("do_code_enrichment"), v)}
          tooltip="Apply a language model to detected code blocks to identify the programming language and produce structured code elements with syntax awareness instead of plain text."
        />

        <ToggleRow
          id="do_formula_enrichment"
          label="Formula (LaTeX) Enrichment"
          paramKey="do_formula_enrichment"
          checked={o.do_formula_enrichment}
          onChange={(v) => onUpdate(p("do_formula_enrichment"), v)}
          tooltip="Convert detected mathematical expressions to LaTeX markup. Requires a formula recognition model. Increases processing time significantly on math-heavy documents like scientific papers."
        />

        <ToggleRow
          id="do_picture_classification"
          label="Classify Pictures"
          paramKey="do_picture_classification"
          checked={o.do_picture_classification}
          onChange={(v) => onUpdate(p("do_picture_classification"), v)}
          tooltip="Label detected figures as photograph, chart, diagram, logo, etc. The classification is stored as metadata on each picture element. Useful for routing different image types to specialised downstream processors."
        />

        <ToggleRow
          id="do_picture_description"
          label="Generate Picture Captions"
          paramKey="do_picture_description"
          checked={o.do_picture_description}
          onChange={(v) => onUpdate(p("do_picture_description"), v)}
          tooltip="Run a vision-language model on each detected figure to generate a natural language description. Captions are stored as annotations. Configure the VLM in the 'Enrichment' section below."
        />

        <div className="divider" />

        <ToggleRow
          id="force_backend_text"
          label="Force Backend Text (Fast Mode)"
          paramKey="force_backend_text"
          checked={o.force_backend_text}
          onChange={(v) => onUpdate(p("force_backend_text"), v)}
          tooltip="Bypass the layout analysis model entirely and use only the PDF backend's native text extraction. Extremely fast, but loses all layout intelligence: no reading order correction, no heading detection, no table parsing."
        />

        <ToggleRow
          id="enable_remote_services"
          label="Allow Remote Services"
          paramKey="enable_remote_services"
          checked={o.enable_remote_services}
          onChange={(v) => onUpdate(p("enable_remote_services"), v)}
          tooltip="Permit Docling to call remote API endpoints for enrichment tasks (e.g., a hosted VLM for picture descriptions). Keep OFF for air-gapped environments or strict data privacy requirements."
        />

        <ToggleRow
          id="allow_external_plugins"
          label="Allow External Plugins"
          paramKey="allow_external_plugins"
          checked={o.allow_external_plugins}
          onChange={(v) => onUpdate(p("allow_external_plugins"), v)}
          tooltip="Allow loading third-party Docling plugins from the Python environment. Disable in production to prevent unexpected behaviour from untrusted plugin code."
        />

        <NumberField
          id="document_timeout"
          label="Document Timeout"
          paramKey="document_timeout"
          value={o.document_timeout}
          min={0}
          onChange={(v) => onUpdate(p("document_timeout"), v)}
          tooltip="Maximum wall-clock seconds allowed to process a single document. If exceeded, conversion aborts with an error. Leave empty (null) for no timeout — suitable for development but risky in batch processing."
          nullable
        />

        <TextField
          id="artifacts_path"
          label="Model Artifacts Path"
          paramKey="artifacts_path"
          value={o.artifacts_path}
          placeholder="null — auto-download"
          onChange={(v) => onUpdate(p("artifacts_path"), v)}
          tooltip="Local filesystem path to a pre-downloaded Docling model cache. Normally Docling downloads model weights on first use from HuggingFace Hub. Set this for offline/air-gapped environments."
        />
      </ConfigSection>

      {/* ── Section 2: OCR ───────────────────────────────────────────── */}
      <ConfigSection icon="🔍" title="OCR Options" badge="requires do_ocr">
        <SelectField
          id="ocr_engine"
          label="OCR Engine"
          paramKey="ocr_options.kind"
          value={o.ocr_options.kind}
          options={[
            { value: "auto", label: "Auto (Best Available)" },
            { value: "easyocr", label: "EasyOCR (GPU-accelerated, 80+ languages)" },
            { value: "rapidocr", label: "RapidOCR (fast, CPU-friendly)" },
            { value: "tesseract", label: "Tesseract (classic, via Python bindings)" },
            { value: "tesseract_cli", label: "Tesseract CLI (subprocess-based)" },
            { value: "ocrmypdf", label: "OCRmyPDF (searchable PDF output)" },
            { value: "ocrmac", label: "macOS Vision (Native Apple, excellent quality)" },
            { value: "suryaocr", label: "SuryaOCR (Modern, complex layouts)" },
          ]}
          onChange={(v) => onUpdate(p("ocr_options.kind"), v)}
          tooltip="The OCR backend engine. Auto selects best. EasyOCR handles 80+ languages with GPU support. RapidOCR is optimised for CPU. macOS Vision uses native Apple APIs. SuryaOCR is good for complex layouts."
        />

        <TagListField
          id="ocr_lang"
          label="Recognition Languages"
          paramKey="ocr_options.lang"
          values={o.ocr_options.lang}
          onChange={(v) => onUpdate(p("ocr_options.lang"), v)}
          tooltip="ISO language codes to load into the OCR engine (e.g. 'en', 'de', 'fr', 'zh'). Adding more languages increases accuracy for multilingual documents but also increases model loading time and memory usage."
        />

        <ToggleRow
          id="force_full_page_ocr"
          label="Force Full-Page OCR"
          paramKey="ocr_options.force_full_page_ocr"
          checked={o.ocr_options.force_full_page_ocr}
          onChange={(v) => onUpdate(p("ocr_options.force_full_page_ocr"), v)}
          tooltip="When enabled, OCR is run on the entire page even if the page has a native text layer. Useful when the embedded text layer is garbled, misaligned, or in a different encoding than the visible text."
        />

        <SliderField
          id="bitmap_threshold"
          label="Bitmap Area Threshold"
          paramKey="ocr_options.bitmap_area_threshold"
          value={o.ocr_options.bitmap_area_threshold}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) => onUpdate(p("ocr_options.bitmap_area_threshold"), v)}
          tooltip="Minimum fraction of a page that must be covered by bitmap content before OCR is triggered on that page. 0.05 = OCR activates if >5% of the page is image-based. Lower values = more aggressive OCR triggering."
        />

        <NumberField
          id="ocr_batch_size"
          label="OCR Batch Size"
          paramKey="ocr_batch_size"
          value={o.ocr_batch_size}
          min={1}
          max={64}
          onChange={(v) => onUpdate(p("ocr_batch_size"), v ?? 4)}
          tooltip="Number of page crops processed simultaneously by the OCR engine. Higher values improve GPU throughput at the cost of more VRAM. Reduce on CPU-only systems or if you encounter out-of-memory errors."
        />
      </ConfigSection>

      {/* ── Section 3: Table Structure ───────────────────────────────── */}
      <ConfigSection icon="📊" title="Table Structure" badge="requires do_table_structure">
        <SelectField
          id="table_mode"
          label="Parser Mode"
          paramKey="table_structure_options.mode"
          value={o.table_structure_options.mode}
          options={[
            { value: "fast", label: "Fast — lightweight model, lower latency" },
            { value: "accurate", label: "Accurate — TableTransformer, handles merged cells" },
          ]}
          onChange={(v) => onUpdate(p("table_structure_options.mode"), v)}
          tooltip="'fast' uses a lightweight model optimised for throughput. 'accurate' uses TableTransformer (TATR) for higher fidelity on complex tables with spanning cells, rotated headers, and multi-level column structures. Accurate mode adds 2-4× latency per table."
        />

        <ToggleRow
          id="do_cell_matching"
          label="Cell Text Matching"
          paramKey="table_structure_options.do_cell_matching"
          checked={o.table_structure_options.do_cell_matching}
          onChange={(v) => onUpdate(p("table_structure_options.do_cell_matching"), v)}
          tooltip="When enabled, Docling matches detected table cell bounding boxes back to the PDF's native text runs, producing higher-quality cell text. Disable if you see duplicate or misaligned content in table cells (usually caused by complex table backgrounds)."
        />

        <NumberField
          id="table_batch_size"
          label="Table Batch Size"
          paramKey="table_batch_size"
          value={o.table_batch_size}
          min={1}
          max={64}
          onChange={(v) => onUpdate(p("table_batch_size"), v ?? 4)}
          tooltip="Number of table regions processed simultaneously by the table structure model. Tune based on available GPU memory — higher values improve throughput but require more VRAM."
        />
      </ConfigSection>

      {/* ── Section 4: Image Generation ─────────────────────────────── */}
      <ConfigSection icon="🖼️" title="Image Generation">
        <ToggleRow
          id="generate_page_images"
          label="Generate Page Images"
          paramKey="generate_page_images"
          checked={o.generate_page_images}
          onChange={(v) => onUpdate(p("generate_page_images"), v)}
          tooltip="Render each PDF page as a raster image and embed it in the output document. Required for ColPali multimodal retrieval (which operates on page screenshots). Significantly increases output file size and memory usage."
        />

        <ToggleRow
          id="generate_picture_images"
          label="Extract Figure Images"
          paramKey="generate_picture_images"
          checked={o.generate_picture_images}
          onChange={(v) => onUpdate(p("generate_picture_images"), v)}
          tooltip="Crop and extract each detected figure or picture as a standalone image embedded in the output. Enables downstream vision pipelines to process individual figures without re-rendering full pages."
        />

        <ToggleRow
          id="generate_table_images"
          label="Render Table Images"
          paramKey="generate_table_images"
          checked={o.generate_table_images}
          onChange={(v) => onUpdate(p("generate_table_images"), v)}
          tooltip="Render each detected table region as a standalone image. Useful as a visual fallback when structured cell text extraction is unreliable, or for visual comparison with the original table appearance."
        />

        <SliderField
          id="images_scale"
          label="Image Scale (DPI multiplier)"
          paramKey="images_scale"
          value={o.images_scale}
          min={0.25}
          max={4.0}
          step={0.25}
          unit="×"
          onChange={(v) => onUpdate(p("images_scale"), v)}
          tooltip="DPI scale factor for all rendered images. 1.0 = 72 DPI (screen quality). 2.0 = 144 DPI (HiDPI/Retina quality). 4.0 = 288 DPI (print quality). Higher values produce sharper images but increase file size and memory usage proportionally."
        />

        <ToggleRow
          id="generate_parsed_pages"
          label="Include Parsed Page Debug Data"
          paramKey="generate_parsed_pages"
          checked={o.generate_parsed_pages}
          onChange={(v) => onUpdate(p("generate_parsed_pages"), v)}
          tooltip="Include raw layout detection results (bounding boxes, element labels) in the output document before post-processing. Useful for debugging layout model predictions or understanding why certain content was misclassified."
        />
      </ConfigSection>

      {/* ── Section 5: Layout ────────────────────────────────────────── */}
      <ConfigSection icon="📐" title="Layout Options">
        <SelectField
          id="layout_model"
          label="Layout Model"
          paramKey="layout_options.model"
          value={o.layout_options.model}
          options={[
            { value: "default", label: "Default" },
            { value: "layout_heron_default", label: "Heron Default (Balanced)" },
            { value: "layout_heron_v1", label: "Heron V1 (Accurate)" },
            { value: "layout_smock_v1", label: "Smock V1" },
          ]}
          onChange={(v) => onUpdate(p("layout_options.model"), v)}
          tooltip="Select the underlying object detection model used to identify layout elements (e.g. text blocks, formulas, tables). Heron is the standard robust choice, but other models like Smock might perform better on complex documents or sparse formulas."
        />

        <ToggleRow
          id="keep_images"
          label="Preserve Images in Output"
          paramKey="layout_options.keep_images"
          checked={o.layout_options.keep_images}
          onChange={(v) => onUpdate(p("layout_options.keep_images"), v)}
          tooltip="When enabled, detected image regions are preserved as picture elements in the parsed document. Disable to strip all images from the output, producing a text-only result with reduced file size."
        />

        <ToggleRow
          id="use_legacy_layout"
          label="Use Legacy Layout (Rule-based)"
          paramKey="layout_options.use_legacy_layout"
          checked={o.layout_options.use_legacy_layout}
          onChange={(v) => onUpdate(p("layout_options.use_legacy_layout"), v)}
          tooltip="Falls back to older rule-based layout heuristics instead of the neural layout model. Enable only for simple, well-structured single-column documents where the AI model produces incorrect results (e.g., single-column academic papers with simple formatting)."
        />

        <NumberField
          id="layout_batch_size"
          label="Layout Batch Size"
          paramKey="layout_batch_size"
          value={o.layout_batch_size}
          min={1}
          max={64}
          onChange={(v) => onUpdate(p("layout_batch_size"), v ?? 4)}
          tooltip="Number of pages processed simultaneously by the layout analysis model. Increasing this improves GPU utilisation but requires more VRAM. Reduce if you encounter CUDA out-of-memory errors on large documents."
        />

        <p className="section-label">Heading Hierarchy</p>
        <ToggleRow
          label="Enable Hierarchy Inference"
          paramKey="heading_hierarchy_options.enabled"
          checked={o.heading_hierarchy_options.enabled}
          onChange={(v) => onUpdate(p("heading_hierarchy_options.enabled"), v)}
          tooltip="Enable docling's advanced heading hierarchy inference. If disabled, all headings are treated as level 1."
        />
        <SliderField
          id="heading_max_level"
          label="Maximum Heading Level"
          paramKey="heading_hierarchy_options.max_level"
          value={o.heading_hierarchy_options.max_level}
          min={1}
          max={6}
          step={1}
          onChange={(v) => onUpdate(p("heading_hierarchy_options.max_level"), v)}
          tooltip="Maximum heading nesting depth inferred. Depth 3 constructs H1→H2→H3 levels."
        />
        <ToggleRow
          label="Use PDF Bookmarks"
          paramKey="heading_hierarchy_options.use_bookmarks"
          checked={o.heading_hierarchy_options.use_bookmarks}
          onChange={(v) => onUpdate(p("heading_hierarchy_options.use_bookmarks"), v)}
          tooltip="Use internal PDF bookmarks (TOC) to infer heading structure."
        />
        <ToggleRow
          label="Use Numbering"
          paramKey="heading_hierarchy_options.use_numbering"
          checked={o.heading_hierarchy_options.use_numbering}
          onChange={(v) => onUpdate(p("heading_hierarchy_options.use_numbering"), v)}
          tooltip="Infer heading hierarchy based on explicit numbering patterns (e.g., 1.1, 1.2.1)."
        />
        <ToggleRow
          label="Use Visual Style"
          paramKey="heading_hierarchy_options.use_style"
          checked={o.heading_hierarchy_options.use_style}
          onChange={(v) => onUpdate(p("heading_hierarchy_options.use_style"), v)}
          tooltip="Use physical visual styling (bold, italic) to infer hierarchy. NOTE: This requires 'Generate Parsed Pages' to be enabled under Layout Options."
        />
        <ToggleRow
          label="Use Font Size"
          paramKey="heading_hierarchy_options.use_font_style"
          checked={o.heading_hierarchy_options.use_font_style}
          onChange={(v) => onUpdate(p("heading_hierarchy_options.use_font_style"), v)}
          tooltip="Use physical font size to infer hierarchy. NOTE: This requires 'Generate Parsed Pages' to be enabled under Layout Options."
        />
      </ConfigSection>

      {/* ── Section 6: Enrichment ────────────────────────────────────── */}
      <ConfigSection icon="✨" title="Enrichment Models">
        <p className="section-label">Picture Description VLM</p>
        <SelectField
          id="picture_desc_kind"
          label="VLM Backend"
          paramKey="picture_description_options.kind"
          value={o.picture_description_options.kind}
          options={[
            { value: "disabled", label: "Disabled (no captions)" },
            { value: "granite_vision", label: "Granite Vision (IBM, local)" },
            { value: "api", label: "Remote API endpoint" },
          ]}
          onChange={(v) => onUpdate(p("picture_description_options.kind"), v)}
          tooltip="Vision-language model backend for generating picture captions. 'granite_vision' runs locally using IBM Granite Vision. 'api' calls a remote VLM endpoint (requires enable_remote_services). 'disabled' skips captioning entirely."
        />
        <TextareaField
          id="picture_desc_prompt"
          label="Caption Prompt"
          paramKey="picture_description_options.prompt"
          value={o.picture_description_options.prompt}
          onChange={(v) => onUpdate(p("picture_description_options.prompt"), v)}
          tooltip="The prompt sent to the VLM for each detected picture. Customise for domain-specific extraction — e.g., 'Identify all chemical structures and their IUPAC names' for chemistry documents, or 'Describe all axes, legend, and data trends' for charts."
        />

        <div className="divider" />
        <p className="section-label">Picture Classification</p>
        <SelectField
          id="picture_class_kind"
          label="Classification Model"
          paramKey="picture_classification_options.kind"
          value={o.picture_classification_options.kind}
          options={[
            { value: "disabled", label: "Disabled" },
            { value: "docling", label: "Docling built-in classifier" },
          ]}
          onChange={(v) => onUpdate(p("picture_classification_options.kind"), v)}
          tooltip="Model for classifying detected pictures into categories: photograph, chart, diagram, logo, table, etc. The label is stored as metadata on each picture element for downstream routing."
        />

        <div className="divider" />
        <p className="section-label">Code & Formula Recognition</p>
        <SelectField
          id="code_formula_kind"
          label="Code/Formula Model"
          paramKey="code_formula_options.kind"
          value={o.code_formula_options.kind}
          options={[
            { value: "disabled", label: "Disabled (plain text)" },
            { value: "granite", label: "Granite (IBM, local)" },
            { value: "codeformulav2", label: "CodeFormulaV2 (New Default)" },
          ]}
          onChange={(v) => onUpdate(p("code_formula_options.kind"), v)}
          tooltip="Model for enriching code blocks and mathematical formulas. When enabled, code blocks are structured with language labels, and math expressions are converted to LaTeX. Requires additional model downloads on first use."
        />

        <div className="divider" />
        <p className="section-label">Chart Data Extraction</p>
        <SelectField
          id="chart_extract_kind"
          label="Chart Extraction Model"
          paramKey="chart_extraction_options.kind"
          value={o.chart_extraction_options.kind}
          options={[
            { value: "disabled", label: "Disabled (charts as images)" },
            { value: "docling", label: "Docling built-in chart extractor" },
          ]}
          onChange={(v) => onUpdate(p("chart_extraction_options.kind"), v)}
          tooltip="Automated data extraction from bar charts, line graphs, and pie charts into structured tables. When enabled, chart data becomes queryable text rather than opaque images. Experimental feature — adds significant processing time."
        />
      </ConfigSection>

      {/* ── Section 7: Accelerator ───────────────────────────────────── */}
      <ConfigSection icon="🚀" title="Accelerator & Performance">
        <SelectField
          id="accel_device"
          label="Inference Device"
          paramKey="accelerator_options.device"
          value={o.accelerator_options.device}
          options={[
            { value: "cpu", label: "CPU (works everywhere)" },
            { value: "cuda", label: "CUDA (NVIDIA GPU)" },
            { value: "mps", label: "MPS (Apple Silicon — M1/M2/M3/M4)" },
          ]}
          onChange={(v) => onUpdate(p("accelerator_options.device"), v)}
          tooltip="Hardware device for PyTorch model inference. CPU works universally. CUDA requires an NVIDIA GPU with matching drivers. MPS uses Apple Silicon's Metal Performance Shaders. GPU inference is 5–20× faster for OCR and table structure models."
        />

        <SliderField
          id="num_threads"
          label="CPU Threads"
          paramKey="accelerator_options.num_threads"
          value={o.accelerator_options.num_threads}
          min={1}
          max={32}
          step={1}
          onChange={(v) => onUpdate(p("accelerator_options.num_threads"), v)}
          tooltip="Number of CPU threads for PyTorch operations. Only effective when device=cpu. Higher values can improve throughput on multi-core machines up to a saturation point (typically 8–16 threads on modern CPUs)."
        />

        <div className="divider" />
        <p className="section-label">Queue & Pipeline Tuning</p>

        <NumberField
          id="queue_max_size"
          label="Queue Max Size"
          paramKey="queue_max_size"
          value={o.queue_max_size}
          min={1}
          onChange={(v) => onUpdate(p("queue_max_size"), v ?? 128)}
          tooltip="Maximum number of page items buffered between pipeline stages. Larger values allow more in-flight work between model stages at the cost of higher memory usage during processing."
        />

        <NumberField
          id="batch_polling"
          label="Batch Poll Interval (s)"
          paramKey="batch_polling_interval_seconds"
          value={o.batch_polling_interval_seconds}
          min={0.01}
          onChange={(v) => onUpdate(p("batch_polling_interval_seconds"), v ?? 0.5)}
          tooltip="How frequently (in seconds) the pipeline checks each stage for completed batches. Lower values reduce latency between stages but increase CPU overhead. The default of 0.5s is suitable for most use cases."
        />

        <NumberField
          id="stage_timeout"
          label="Stage Shutdown Timeout (s)"
          paramKey="stage_shutdown_timeout_seconds"
          value={o.stage_shutdown_timeout_seconds}
          min={0.5}
          onChange={(v) => onUpdate(p("stage_shutdown_timeout_seconds"), v ?? 5.0)}
          tooltip="Maximum seconds to wait for a pipeline stage to flush its queue and shut down after processing completes. Increase this value if you see incomplete output on very large documents (100+ pages)."
        />
      </ConfigSection>

      {/* ── Section 8: Iterate Items ─────────────────────────────────── */}
      <ConfigSection icon="🔄" title="Iterate Items Options">
        <ToggleRow
          label="With Groups"
          paramKey="iterate_items_options.with_groups"
          checked={config.iterate_items_options.with_groups}
          onChange={(v) => onUpdate("iterate_items_options.with_groups", v)}
          tooltip="If enabled, yields group items as well as leaf items."
        />
        <ToggleRow
          label="Traverse Pictures"
          paramKey="iterate_items_options.traverse_pictures"
          checked={config.iterate_items_options.traverse_pictures}
          onChange={(v) => onUpdate("iterate_items_options.traverse_pictures", v)}
          tooltip="If enabled, iterates through elements embedded within picture items."
        />
        <NumberField
          id="iterate_page_no"
          label="Page Number Filter"
          paramKey="iterate_items_options.page_no"
          value={config.iterate_items_options.page_no ?? undefined}
          min={1}
          onChange={(v) => onUpdate("iterate_items_options.page_no", v === undefined ? null : v)}
          tooltip="Only iterate items on a specific 1-indexed page. Leave blank to iterate all pages."
        />
        <MultiCheckField
          label="Included Content Layers"
          paramKey="iterate_items_options.included_content_layers"
          options={[
            { value: "body", label: "Body" },
            { value: "furniture", label: "Furniture (headers/footers)" },
            { value: "background", label: "Background" },
            { value: "invisible", label: "Invisible" },
            { value: "notes", label: "Notes" },
          ]}
          selected={config.iterate_items_options.included_content_layers}
          onChange={(v) => onUpdate("iterate_items_options.included_content_layers", v)}
          tooltip="Filter which layers of content are yielded."
        />
      </ConfigSection>

      {/* ── Section 9: Output Formats ────────────────────────────────── */}
      <ConfigSection icon="📤" title="Output Formats" defaultOpen={true}>
        <MultiCheckField
          label="Generate Output Formats"
          paramKey="output.formats"
          options={[
            { value: "markdown", label: "Markdown (.md)" },
            { value: "json", label: "JSON (.json)" },
            { value: "doctags", label: "DocTags (.doctags)" },
            { value: "text", label: "Plain Text (.txt)" },
            { value: "html", label: "HTML (.html)" },
            { value: "iterated_items", label: "Iterated Items (.json)" },
          ]}
          selected={config.output.formats}
          onChange={(v) => onUpdate("output.formats", v)}
          tooltip="Select all output formats to generate for each run. Markdown and JSON are recommended for most RAG pipelines. DocTags is Docling's token format for fine-tuning. HTML requires a recent Docling version."
        />

        <ToggleRow
          label="HTML: Split Page View"
          paramKey="output.html_split_page_view"
          checked={config.output.html_split_page_view}
          onChange={(v) => onUpdate("output.html_split_page_view", v)}
          tooltip="Render each page in its own section with the page image as background. Requires 'Generate Page Images' to be enabled."
        />

        <ToggleRow
          label="HTML: Include Annotations"
          paramKey="output.html_include_annotations"
          checked={config.output.html_include_annotations}
          onChange={(v) => onUpdate("output.html_include_annotations", v)}
          tooltip="Overlay bounding-box annotations for every detected element (text blocks, tables, figures, etc.) on the HTML page images."
        />


        <TextField
          id="profile_desc"
          label="Profile Description"
          paramKey="description"
          value={config.description}
          placeholder="Describe what this config is optimised for…"
          onChange={(v) => onUpdate("description", v ?? "")}
          tooltip="A human-readable description of what this configuration profile is tuned for. Stored alongside every run output for reproducibility documentation."
        />
      </ConfigSection>
    </div>
  );
}
