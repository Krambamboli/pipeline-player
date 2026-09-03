# Pipeline Player ⚡

A localhost web application for **testing, configuring, and benchmarking Docling and ColPali document ingestion pipelines**.

## What it does

- Exposes **every `PdfPipelineOptions` parameter** from Docling as an annotated UI control (toggles, sliders, dropdowns, tooltips).
- Generates **Rich Annotated HTML Output** in a split-page view using `docling-core`'s native LayoutVisualizer, overlaying bounding boxes for elements over page images.
- **Intelligently manages hardware acceleration** (like properly splitting MPS and CPU on Apple Silicon) via `device: auto`.
- **Immediately persists** every config change to a YAML file on disk (debounced 300ms).
- Executes Docling's `DocumentConverter` against a test PDF and **streams live logs** to the browser.
- Saves every run's output, config snapshot, and timing log in `/outputs/run_{timestamp}_{profile}/`.
- Supports **multiple named config profiles** — Save As, switch, delete.

---

## Architecture

```
pipeline-player/
├── backend/          # FastAPI (Python) — Docling execution + config management
├── frontend/         # Next.js (React) — annotated config UI + iframe output viewer
├── configs/          # YAML config profiles (source of truth)
├── test_data/        # Place your test_document.pdf here
├── outputs/          # Auto-created; one subdirectory per run
└── src/pipelines/    # Stub folders for future pipeline stages
    ├── serialization/
    ├── chunking/
    ├── rag/
    └── colpali/
```

---

## Prerequisites

- **Python 3.12+** (Recommended to avoid ONNX/MPS compatibility bugs)
- **Node.js 18+** and npm
- (Optional) NVIDIA GPU with CUDA or Apple Silicon for fast inference

---

## Installation

### 1 — Place your test document

```bash
cp /path/to/your.pdf test_data/test_document.pdf
```

### 2 — Backend

```bash
# Create a virtual environment (recommended)
python3 -m venv .venv
source .venv/bin/activate       # macOS/Linux
# .venv\Scripts\activate        # Windows

# Install dependencies
pip install -r backend/requirements.txt
```

> **First run note:** Docling will download model weights (~1–2 GB) on first use.  
> Set `artifacts_path` in the UI to point to a local cache for offline use.

### 3 — Frontend

```bash
cd frontend
npm install
```

---

## Running locally

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
source .venv/bin/activate
cd backend
uvicorn main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Then open **http://localhost:3000** in your browser.

The FastAPI docs are available at **http://localhost:8000/api/docs**.

---

## Using the UI

### Config Panel (left)
- Every Docling `PdfPipelineOptions` parameter is exposed as an interactive control.
- Hover the **?** icon on any parameter for a detailed tooltip explaining its effect.
- Changes are **automatically saved** to the active YAML profile (debounced 300ms).
- A **saving…** indicator in the top bar confirms writes.

### Profile Manager
- Use the dropdown to switch between saved config profiles.
- Click 💾 to **Save As** a new named profile.
- Click 🗑 to delete a non-default profile.

### Running the Pipeline
1. Adjust config parameters in the left panel.
2. Click **▶ Run Pipeline** (top right panel).
3. Live logs stream in the console pane in real time.
4. When complete, click any output file tab to preview its content. 
5. If **HTML output** is enabled, it renders inside a sandboxed iframe with high-fidelity annotations drawn perfectly over the document pages.

### Reproducibility
Every run saves to `/outputs/run_{YYYYMMDD_HHMMSS}_{profile}/`:
```
outputs/run_20240901_143022_default/
├── parsed_doc.html     # Rich split-page view with bounding box overlays
├── parsed_doc.md       # Markdown output
├── parsed_doc.json     # Full DoclingDocument JSON
├── config.yaml         # Exact copy of the config used
└── run.log             # Timing, page count, warnings
```

---

## Docling Parameters Reference

All parameters map directly to Docling's `PdfPipelineOptions`. Full reference:  
https://docling-project.github.io/docling/reference/pipeline_options/

| Section | Key Parameters |
|---------|----------------|
| **Core** | `do_ocr`, `do_table_structure`, `do_chart_extraction`, `do_code_enrichment`, `do_formula_enrichment`, `do_picture_classification`, `do_picture_description`, `force_backend_text` |
| **Output Formats** | `output.formats` (HTML, Markdown, JSON, etc.), `output.html_split_page_view`, `output.html_include_annotations` |
| **OCR** | `ocr_options.kind` (easyocr/rapidocr/tesseract), `ocr_options.lang`, `force_full_page_ocr`, `bitmap_area_threshold` |
| **Tables** | `table_structure_options.mode` (fast/accurate), `do_cell_matching` |
| **Images** | `generate_page_images` (required for HTML annotations), `generate_picture_images`, `generate_table_images`, `images_scale` |
| **Layout** | `keep_images`, `use_legacy_layout`, `heading_hierarchy_options.hierarchy_expansion_depth` |
| **Enrichment** | `picture_description_options`, `picture_classification_options`, `code_formula_options`, `chart_extraction_options` |
| **Accelerator** | `accelerator_options.device` (cpu/cuda/mps/auto), `num_threads` |
| **Performance** | `layout_batch_size`, `ocr_batch_size`, `table_batch_size`, `queue_max_size` |

---

## Future Pipeline Stages (Phase 2+)

The following stub modules are ready to implement:

| Module | Path | Purpose |
|--------|------|---------|
| **Serialization** | `src/pipelines/serialization/` | Custom output format adapters |
| **Chunking** | `src/pipelines/chunking/` | Hierarchical, semantic, fixed-size chunking |
| **RAG** | `src/pipelines/rag/` | Embedding + vector store + retrieval pipeline |
| **ColPali** | `src/pipelines/colpali/` | Visual page-level retrieval (requires `generate_page_images=True`) |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI, Uvicorn, Pydantic, PyYAML, `docling` and `docling-core` |
| Frontend | Next.js 14 (App Router), TypeScript |
| Styling | Vanilla CSS (custom dark theme, no Tailwind) |
| Config | YAML files |
