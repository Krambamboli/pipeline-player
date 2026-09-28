# Pipeline Player

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

A localhost web application for **testing, configuring, and benchmarking Docling and ColPali document ingestion pipelines**.

Pipeline Player is a GUI wrapper for Docling v2 and ColPali/ColQwen2, designed to make tuning complex AI document parsing and visual retrieval pipelines intuitive, fast, and reproducible — without writing a single line of code.

---

## Features

| Feature | Description |
|---|---|
| **Real-Time Progress & ETA** | SSE-based live progress bar with estimated completion time |
| **Pipeline Cancellation** | Gracefully terminate heavy pipeline workers at any time |
| **Hardware Fallback** | Automatically falls back from MPS to AUTO for unsupported VLMs |
| **Full Docling Coverage** | Every `PdfPipelineOptions` parameter exposed in the UI |
| **Annotated HTML Output** | Bounding box overlays rendered over page images |
| **Config Profiles** | Named YAML profiles with auto-save (debounced 300 ms) |
| **Reproducible Runs** | Full config snapshot + timing log saved per run |
| **ColPali Visual Retrieval** | Page-level multi-vector embeddings via ColQwen2 |
| **Hybrid RAG** | Dense + Sparse (BM25) retrieval with RRF/DBSF fusion |
| **Graph RAG** | Entity/relationship extraction with community summaries |
| **Download Settings** | Export any pipeline's active settings as annotated Markdown |

---

## Architecture

```
pipeline-player/
├── backend/           # FastAPI (Python) — pipeline execution + SSE streaming
│   ├── routers/       # Per-stage API endpoints
│   ├── services/      # Pipeline business logic
│   └── main.py        # App entry point, router registration
├── frontend/          # Next.js 16 (React/TypeScript) — UI
│   └── src/
│       ├── app/       # Page routes (one folder per pipeline stage)
│       ├── components/# Shared UI components
│       ├── hooks/     # SSE streaming hooks (useRunStream, useChunkStream, …)
│       └── lib/       # API client helpers + settings export utility
├── configs/           # YAML config profiles (Docling pipeline)
└── test_data/         # Place your PDFs here (git-ignored)
```

---

## Prerequisites

Install these **before** running `pip install`:

| Tool | Version | Notes |
|---|---|---|
| **Python** | 3.10 – 3.12 | 3.12 recommended (best ONNX/MPS compatibility) |
| **Node.js** | 18+ | With npm |
| **Ollama** | latest | Required for RAPTOR, Graph RAG, and local LLM answer generation |
| **git** | any | For cloning |

> **Apple Silicon (M-series):** MPS acceleration works out-of-the-box. Ensure Xcode Command Line Tools are installed.

---

## Installation

### 1 — Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/pipeline-player.git
cd pipeline-player
```

### 2 — Add your documents

```bash
# Place any PDF you want to process into test_data/
cp /path/to/your-document.pdf test_data/
```

> **Looking for test documents?** The [ViDoRe Benchmark v3](https://huggingface.co/collections/vidore/vidore-benchmark-v3) collection on HuggingFace contains a curated set of scientific and university-level PDFs — ideal for benchmarking visual retrieval quality.

### 3 — Python virtual environment & backend

```bash
# Create and activate a virtual environment
python3 -m venv .venv
source .venv/bin/activate       # macOS / Linux
# .venv\Scripts\activate        # Windows

# Install all backend dependencies
pip install -r backend/requirements.txt
```

> **Model downloads on first use:** Pipeline Player pulls model weights automatically the first time each stage is used. The models listed below are the **defaults** — most can be swapped for alternatives in the UI. Plan for ~7–15 GB total for a full local setup:
>
> | Stage | Default Model | Size | When |
> |---|---|---|---|
> | Docling Parser | Layout + Table + OCR models | ~1–2 GB | First pipeline run |
> | Chunk & Vectorize | fastembed BGE-Small (dense) + BM25 | ~130 MB | First chunk run |
> | ColPali Pipeline | ColQwen2 v1.0 via HuggingFace | ~5 GB | First ColPali run |
> | Enrichment (RAPTOR/Graph RAG) | Any Ollama text model, e.g. `llama3.2` | ~2 GB | `ollama pull` — manual |
> | Answer Generation (local) | Any Ollama vision model, e.g. `llava` | ~4 GB | `ollama pull llava` — manual |
>
> Cloud-based answer generation (Gemini, GPT-4o) has no local download — only an API key is needed.

### 4 — PyTorch (required for ColPali)

PyTorch must be installed separately because the correct build depends on your hardware:

```bash
# Apple Silicon (MPS) — standard PyPI build:
pip install torch torchvision

# NVIDIA GPU (CUDA 12.1):
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121

# CPU only (slow, no GPU):
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
```

### 5 — Environment variables (API keys)

```bash
# Copy the template and fill in your keys
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```dotenv
# Required for Gemini answer generation (get yours at https://ai.studio)
GEMINI_API_KEY="your-key-here"

# Optional — only needed for GPT-4o answer generation
OPENAI_API_KEY=""
```

> **Note:** `.env` is git-ignored and will never be committed.

### 6 — Frontend

```bash
cd frontend
npm install
cd ..
```

---

## Running locally

Open **two terminals** from the project root:

**Terminal 1 — Backend:**
```bash
source .venv/bin/activate
cd backend
uvicorn main:app --reload --port 8000 --env-file .env
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Open **http://localhost:3000** in your browser.  
FastAPI interactive docs: **http://localhost:8000/api/docs**

---

## Pipeline Stages & On-Demand Dependencies

Each stage is independent. Nothing beyond `pip install -r requirements.txt` is needed just to start the app — additional models and services are fetched automatically or pulled manually the first time a stage is used.

---

### Step 1 — Docling Parser

Parse PDFs with full parameter control. Docling model weights (~1–2 GB) are downloaded automatically on first run into HuggingFace's default cache (`~/.cache/huggingface/`).

**Optional OCR engines** (enable in UI after installing):

```bash
# OCRmyPDF — recommended for scanned/image-only PDFs
brew install ghostscript tesseract   # macOS system deps
pip install ocrmypdf

# EasyOCR — GPU-accelerated, downloads ~300 MB model on first use
pip install easyocr

# Tesseract bindings only
brew install tesseract && pip install pytesseract
```

---

### Step 2 — Chunk & Vectorize

Chunks Docling output, embeds it, and upserts into a local Qdrant collection.

- **Qdrant** runs in local file mode (stored in `qdrant_storage/`) — no Docker needed.
- **fastembed** auto-downloads embedding models on first use:
  - BGE-Small-EN-v1.5 (dense, ~130 MB)
  - BM25 (sparse, negligible size)

---

### Step 3 — Vector DB Inspector

Browse and filter any Qdrant collection. No additional dependencies.

---

### Step 4 — Enrich Collection (RAPTOR & Graph RAG)

Requires **Ollama** running locally with at least one text generation model:

```bash
# Install Ollama from: https://ollama.com/download
# Then pull a model:
ollama pull llama3.2       # recommended — 2 GB, fast
ollama pull gemma3:4b      # alternative — good quality
```

Ollama must be running before you start the backend:
```bash
ollama serve   # starts automatically on macOS if installed via the app
```

---

### Step 5 — Retrieval & Answer Generation

Hybrid dense + sparse RAG search over Qdrant. No extra setup beyond Step 2.

**For answer generation**, choose your model:

| Model | Setup |
|---|---|
| **Gemini Flash / Pro** | Set `GEMINI_API_KEY` in `backend/.env` |
| **GPT-4o / GPT-4o Mini** | Set `OPENAI_API_KEY` in `backend/.env` |
| **Ollama Llama 3.2 (text)** | Ollama running with `llama3.2` pulled |
| **Ollama LLaVA (vision)** | `ollama pull llava` (~4 GB) |

---

### ColPali — Visual Retrieval Pipeline

A parallel, image-first pipeline that processes entire PDF pages as visual embeddings. Runs alongside Steps 1–5 independently.

**Sub-stages:**

| Tab | Route | Purpose |
|---|---|---|
| **ColPali: Process** | `/colpali` | Rasterize PDF → encode pages with ColQwen2 → upsert to Qdrant |
| **ColPali: Retrieve** | `/colpali/retrieve` | MaxSim retrieval + optional vision-model answer generation |

**Setup:** PyTorch (see Installation Step 4) + the ColQwen2 model (~5 GB, auto-downloaded from HuggingFace on first pipeline run).

```bash
# For visual answer generation on ColPali results:
ollama pull llava
```

---

## Using the UI

### Tab Navigation

| Tab | Route | Pipeline Step |
|---|---|---|
| **📄 Step 1: Docling Parser** | `/` | Parse PDFs with full parameter control |
| **✂️ Step 2: Chunk & Vectorize** | `/chunk` | Chunk → embed → upsert into Qdrant |
| **🔍 Step 3: Vector DB Inspector** | `/inspector` | Browse & filter any Qdrant collection |
| **🧠 Step 4: Enrich Collection** | `/enrich` | RAPTOR summarisation + Graph RAG |
| **🔎 Step 5: Retrieval** | `/retrieve` | Hybrid RAG search + answer generation |
| **🖼️ ColPali: Process** | `/colpali` | Visual page-level embedding pipeline |
| **🔎 ColPali: Retrieve** | `/colpali/retrieve` | MaxSim retrieval + visual answer generation |

---

### Step 1 — Docling Parser

- Every parameter has a **?** tooltip explaining its effect.
- Changes auto-save to the active YAML profile (debounced 300 ms).
- Use **💾 Save As** to create named profiles, **🗑** to delete.
- Select a document from the dropdown and click **▶ Run Pipeline**.
- Watch the live progress bar and log console — cancel at any time with **■ Cancel**.
- When complete, switch between output tabs (HTML, Markdown, JSON) in the center panel.
- HTML output renders with high-fidelity bounding box overlays directly in the browser.

### Step 2 — Chunk & Vectorize

- Select the source Docling run from the dropdown.
- Configure the chunker (Hybrid/Hierarchical/Page), embedding mode (Dense/Sparse/Hybrid), and Qdrant collection settings.
- Click **▶ Run Chunk Pipeline** — progress streams live.
- The resulting Qdrant collection is immediately available in Steps 3–5.

### Step 3 — Vector DB Inspector

- Select any Qdrant collection.
- Filter by chunk type, element type, and custom metadata.
- Inspect individual chunks and their embedding metadata.

### Step 4 — Enrich Collection

- Select a collection chunked in Step 2.
- Run **RAPTOR** to add hierarchical summary nodes, or **Graph RAG** to extract entities and relationships.
- Requires Ollama running locally (see Prerequisites).

### Step 5 — Retrieval & Answer Generation

- Select a collection, enter a natural language question.
- The backend rewrites the query, runs hybrid search (RRF/DBSF fusion), and shows ranked results.
- Click **▶ Generate Answer** to stream a grounded AI answer using your selected model.

### ColPali: Process

- Select a PDF from `test_data/`.
- Configure model (`colqwen2-v1.0` or `colpali-v1.3`), device, DPI, and batch size.
- Click **▶ Run ColPali Pipeline** — pages are rasterized, encoded, and upserted as multi-vector points.
- Click **⬇ Download Settings** to save the current configuration as annotated Markdown.

### ColPali: Retrieve

- Select a ColPali collection.
- Enter a query — MaxSim scoring ranks pages by visual similarity.
- Click **▶ Generate Answer** to run visual answer generation using Gemini, GPT-4o, or LLaVA.

### Download Settings

Each pipeline page has a **⬇** button (Docling: in the profile toolbar; ColPali: below the Run button) that exports the current configuration as an annotated Markdown file — useful for documenting experiments and sharing reproducible setups.

---

## Outputs & Reproducibility

Every Docling run saves to `outputs/run_{YYYYMMDD_HHMMSS}_{profile}/`:

```
outputs/run_20240901_143022_default/
├── parsed_doc.html     # Split-page view with bounding box overlays
├── parsed_doc.md       # Markdown output
├── parsed_doc.json     # Full DoclingDocument JSON
├── config.yaml         # Exact config snapshot used for this run
└── run.log             # Timing, page count, warnings
```

> `outputs/` and `qdrant_storage/` are **git-ignored** and stay local.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | FastAPI, Uvicorn, Python 3.12, Multiprocessing |
| **Document Parsing** | Docling v2, docling-core |
| **Visual Retrieval** | ColQwen2 / ColPali (via sentence-transformers MultiVectorEncoder) |
| **Vector DB** | Qdrant (local file mode) with fastembed |
| **Embeddings** | BGE-Small-EN-v1.5 (dense), BM25 (sparse) via fastembed |
| **LLM / Enrichment** | Ollama (local), OpenAI, Google Gemini |
| **Frontend** | Next.js 16 (App Router), TypeScript |
| **Styling** | Vanilla CSS — custom dark theme, no Tailwind |
| **Config** | Pydantic v2 ↔ YAML |

---

## Docling Parameters Reference

All parameters map directly to Docling's `PdfPipelineOptions`:  
https://docling-project.github.io/docling/reference/pipeline_options/

| Section | Key Parameters |
|---|---|
| **Core** | `do_ocr`, `do_table_structure`, `do_chart_extraction`, `do_code_enrichment`, `do_formula_enrichment`, `do_picture_classification`, `do_picture_description` |
| **Output** | `formats`, `html_split_page_view`, `html_include_annotations` |
| **OCR** | `ocr_options.kind`, `lang`, `force_full_page_ocr`, `bitmap_area_threshold` |
| **Tables** | `table_structure_options.mode`, `do_cell_matching` |
| **Images** | `generate_page_images`, `generate_picture_images`, `images_scale` |
| **Layout** | `layout_options.model`, `keep_images`, `use_legacy_layout` |
| **Headings** | `heading_hierarchy_options` |
| **Enrichment** | `picture_description_options`, `code_formula_options`, `chart_extraction_options` |
| **Accelerator** | `accelerator_options.device`, `num_threads` |
| **Performance** | `layout_batch_size`, `ocr_batch_size`, `table_batch_size`, `queue_max_size` |

---

## License

Copyright (C) 2024 Oliver Schneider

This program is free software: you can redistribute it and/or modify it under the terms of the **GNU General Public License version 3** as published by the Free Software Foundation.

See [`LICENSE`](LICENSE) for the full license text.

### Dependency Licenses

Pipeline Player uses the following key open source libraries:

| Library | License | Notes |
|---|---|---|
| [Docling](https://github.com/docling-project/docling) | MIT | IBM document parser |
| [PyMuPDF](https://github.com/pymupdf/PyMuPDF) | GNU AGPL-3.0 | PDF rasterizer — AGPL applies to network distribution |
| [sentence-transformers](https://github.com/UKPLab/sentence-transformers) | Apache 2.0 | ColPali/ColQwen2 model loader |
| [PyTorch](https://github.com/pytorch/pytorch) | BSD-3-Clause | ML inference backend |
| [Qdrant client](https://github.com/qdrant/qdrant-client) | Apache 2.0 | Vector DB client |
| [FastAPI](https://github.com/tiangolo/fastapi) | MIT | Backend framework |
| [Transformers](https://github.com/huggingface/transformers) | Apache 2.0 | HuggingFace model hub |
| [PEFT](https://github.com/huggingface/peft) | Apache 2.0 | LoRA adapter support |
| [Next.js](https://github.com/vercel/next.js) | MIT | Frontend framework |
| [scikit-learn](https://github.com/scikit-learn/scikit-learn) | BSD-3-Clause | RAPTOR clustering |
| [NetworkX](https://github.com/networkx/networkx) | BSD-3-Clause | Graph RAG |
