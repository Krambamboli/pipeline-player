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
├── configs/           # Saved profiles (git-ignored): Docling *.yaml, chunk/, colpali/, reranker/
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

**OCR engines.** RapidOCR (bundled) and macOS Vision (`ocrmac`) work out of the box. If the selected engine is not installed, the backend falls back to RapidOCR and writes a `⚠` line into the run log. The recognition languages from the UI are forwarded to every engine in its own format: macOS Vision `de`→`de-DE`, Tesseract `de`→`deu`, RapidOCR uses the first language only.

```bash
# EasyOCR — GPU-accelerated, downloads ~300 MB model on first use
pip install easyocr

# Tesseract (Python bindings used by Docling's "tesseract" engine)
brew install tesseract && pip install tesserocr
# Tesseract CLI engine only needs the binary:
brew install tesseract
```

> [!NOTE]
> "OCRmyPDF" is listed for completeness but is not a Docling OCR engine; it runs as RapidOCR.

**Picture description (VLM captions).** Turn on *Generate Picture Captions* and pick the model under *Enrichment Models → VLM Backend*. Both controls stay in sync, and the toggle is the master switch. The generated descriptions are part of the chunk text in Step 2 and the RAG Tester.

| Backend | Model | Size (first download) |
|---|---|---|
| `smolvlm` | HuggingFaceTB/SmolVLM-256M-Instruct (Docling default) | ~0.5 GB |
| `granite_vision` | ibm-granite/granite-vision-3.3-2b | ~5 GB |
| `qwen` | Qwen/Qwen2.5-VL-3B-Instruct | ~7 GB |
| `pixtral` | mistral-community/pixtral-12b | ~25 GB |
| `api` | any OpenAI-compatible endpoint, e.g. Ollama `http://localhost:11434/v1/chat/completions` with `llama3.2-vision` / `llava` | — |

For `api`, *Allow Remote Services* is switched on automatically. An API key is read from the env var named in *API Key Env Var*, and only that variable's name is stored in the profile. The run log shows which model was actually used.

*Classify Pictures* uses DocumentFigureClassifier-v2.5. *Chart Data Extraction* uses granite-vision-v4 and enables classification automatically, because only pictures classified as charts are processed.

---

### Step 2 — Chunk & Vectorize

Chunks Docling output, embeds it, and upserts into a local Qdrant collection.

- **Qdrant** runs in local file mode (stored in `qdrant_storage/`) — no Docker needed.
- **fastembed** auto-downloads embedding models on first use into `~/.cache/fastembed`. The backend sets `FASTEMBED_CACHE_PATH` at startup; fastembed's default, the macOS temp dir, gets purged by the OS. You can override the path in `backend/.env`.
  - BGE-Small-EN-v1.5 (dense, ~130 MB)
  - BM25 (sparse, negligible size)
- **Include captions in text** (Serialization) removes figure/table captions from the chunk text when switched off.

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

> [!NOTE]
> Step 5 picks the dense query model from the collection's vector size (384 → BGE-Small, …), not from the model stored in the payload. Size-ambiguous collections (e.g. 768-dim jina vs. e5-base) can therefore be queried with the wrong model. The **Fusion Retriever** reads the stored model and lets you override it.

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

### RAG Tester — Whole Course Folder → Two Collections

Builds **two complete Qdrant collections for a whole folder of PDFs** (e.g. one course) in a single run, re-using your proven, saved settings:

| Collection | Built from | Search | Used in |
|---|---|---|---|
| `<course>_hybrid` | Docling profile (Step 1) → chunk profile (Step 2) → dense + sparse | Hybrid / RRF | Step 4 Enrich, Step 5 Retrieval |
| `<course>_colpali` | ColPali process profile → page images → ColQwen2 multi-vectors | MaxSim late interaction | ColPali: Retrieve |

- The **text track** parses several PDFs in parallel (configurable Docling workers, ~2–3 GB RAM each). Each document is chunked, embedded and upserted as soon as its parse finishes.
- The **visual track** runs at the same time. It loads the ColPali model **once** and encodes the documents one after another.
- Every point in **both** collections carries the same metadata: `doc_name`, `file_path`, `rel_path`, `course`, `doc_source` and the page (`page_numbers` / `page_start` for chunks, `page_number` for ColPali pages), plus optional custom fields.
- Only PDFs are ingested, so that both collections contain exactly the same documents.

**Prerequisites:** at least one saved **chunk profile** (Step 2 → 💾 Profile bar) and one saved **ColPali profile** (ColPali: Process → 💾 Profile bar). No extra installation is needed beyond Steps 1, 2 and ColPali.

---

### Fusion Retriever — Hybrid + MaxSim + Your Own Reranker

Queries a **text collection** (hybrid dense + sparse, Qdrant RRF) and a **ColPali collection** (MaxSim) with the same question, in parallel. A small **Python reranker** that you write in the browser merges both lists. The final top-k items that would go to the LLM update live while you edit the code.

- **Model detection.** The dense model of a text collection is read from the point payload (`dense_model` / `sparse_model`, written by Step 2 and the RAG Tester). For older collections it comes from the RAG Tester manifest. As a last resort it is guessed from the vector size; such guesses show a warning chip and can be overridden.
- **Model dropdowns.** The dense and sparse query models can be overridden from dropdowns filled by the installed fastembed version. Only dense models with the collection's vector size can be selected. A warning appears if you pick a model other than the one used for indexing.
- **Text fusion.** The dense and sparse lists of the text collection can be merged in four ways, all computed by Qdrant:
  - **RRF** with adjustable `k` and per-list weights. Qdrant scores `Σ 1 / (rank / w + k − 1)`, so the weight divides the rank.
  - **DBSF**: scores normalised to mean ± 3σ, then summed.
  - **Dense only** or **sparse only**.
- **Transparency.** Every text candidate shows its rank in the dense and the sparse list, how much of its fused score came from each list (blue/amber bar), and a badge: *dense-driven* (≥ 60 %), *sparse-driven* (≤ 40 %), *both*, or *only dense/sparse* if just one retriever found it. These shares are recomputed with the same formulas as qdrant-client and add up to Qdrant's fused score.
- **Reranker contract.** The script must define the function below. Every hit is a dict with:
  - `source` (`"text"` / `"colpali"`), `id`, `rank`, `score`, `score_norm` (0..1 within its list), `doc_name`, `file_path` and page fields;
  - for text hits also `text`, `dense_rank`/`dense_score`, `sparse_rank`/`sparse_score`, `dense_contrib`/`sparse_contrib`, `dense_share`, `found_by` and `driver`.

  Returned hits may add `fused_score` and `reason`, which are shown in the UI.

  ```python
  def rerank(text_hits: list[dict], colpali_hits: list[dict], k: int) -> list[dict]:
      ...
  ```

- **Sandbox.** The script runs in a separate, isolated Python process (`python -I`) with a 3-second timeout. `print()` output is shown below the editor, and syntax or runtime errors highlight the affected line.
- **Saved scripts** are stored as `configs/reranker/<name>.py`. Like all of `configs/`, this folder is git-ignored. The built-in default is weighted RRF (`k = 60`), with a commented-out example rule: *"if ColPali #1 scores ≥ 30 % higher than ColPali #2, put it first"*.
- **Generate answer** uses the same models as ColPali: Retrieve. Text chunks are sent as text, ColPali pages as page images, each labelled `[Source N]`.

> [!WARNING]
> The reranker runs **arbitrary Python code on your machine**. The timeout guards against endless loops, but the process is not a security sandbox. Keep the backend bound to `localhost` and only run scripts you trust.

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
| **🧪 RAG Tester** | `/rag-tester` | Whole folder → hybrid + ColPali collections in one run |
| **🔀 Fusion Retriever** | `/fusion` | Hybrid + MaxSim in parallel, custom Python reranker, answer generation |

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
- Use the **💾 Profile** bar to save proven chunking + embedding settings (`configs/chunk/<name>.yaml`) for re-use in the RAG Tester. The source run and collection name are not stored in the profile.
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
- Use the **💾 Profile** bar to save these process settings (`configs/colpali/<name>.yaml`) for re-use in the RAG Tester.
- Click **▶ Run ColPali Pipeline** — pages are rasterized, encoded, and upserted as multi-vector points.
- Click **⬇ Download Settings** to save the current configuration as annotated Markdown.

### ColPali: Retrieve

- Select a ColPali collection.
- Enter a query — MaxSim scoring ranks pages by visual similarity.
- Click **▶ Generate Answer** to run visual answer generation using Gemini, GPT-4o, or LLaVA.

### RAG Tester

1. **Course folder.** Pick a sub-folder of `test_data/` or type any path (`/abs/path`, `~/path`). A preview lists every PDF with its page count.
2. **Profiles.** Choose the Docling, chunk and ColPali profiles. *Force hybrid embedding* (on by default) always stores dense + sparse vectors. Either track can be switched off.
3. **Collections.** Names are suggested from the folder name and can be edited. If a collection already exists, the run stops unless **Overwrite** is ticked.
4. **Parallel Docling workers.** Default is 3. Optionally add extra metadata (e.g. `semester: FS13`), which is written into both collections.
5. Click **🧪 Build both collections**. The table shows the live status of every document in both tracks. Failed documents are reported and skipped; the rest continue.

Keep the tab open during the run. Closing it cancels the run.

### Fusion Retriever

1. **Query and collections.** Enter a question. When you pick a `<course>_hybrid` collection, its `<course>_colpali` sibling is selected automatically. Either side can be set to *none*.
2. **Limits.** Set top-N per list (default 5) and *→ LLM (k)*, the number of items passed to the model (default 3).
3. Click **🔎 Search both** (or press ⌘/Ctrl + Enter). The first search loads the models (~15–30 s); later searches take well under a second. The candidates appear side by side, with ColPali pages as thumbnails (click to enlarge).
4. **Edit the reranker** on the right (CodeMirror editor with Python syntax highlighting). It re-runs about 400 ms after every change. Selected candidates get a **→ LLM #n** badge. Save proven scripts with **💾**, or go back to the built-in RRF with **↺ RRF**.
5. When the ranking looks right, click **▶ Generate answer**.

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

Every **RAG Tester** run additionally writes:

```
outputs/rag_{run_id}/run_01_<doc>/   # Docling outputs per document (parsed_doc.json, config.yaml, run.log)
rag_runs/{run_id}.json               # Manifest: request, full copies of all 3 profiles, collections, per-document results
```

> `rag_runs/` is git-ignored as well.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | FastAPI, Uvicorn, Python 3.12, Multiprocessing |
| **Document Parsing** | Docling v2, docling-core |
| **Visual Retrieval** | ColQwen2 / ColPali (via sentence-transformers MultiVectorEncoder) |
| **Vector DB** | Qdrant (local file mode) with fastembed |
| **Embeddings** | fastembed: BGE-Small-EN-v1.5 (dense, default) + BM25 (sparse); any other fastembed model selectable per chunk profile |
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
| **Layout** | `layout_options.model` |
| **Headings** | `heading_hierarchy_options` |
| **Enrichment** | `picture_description_options` (VLM preset or API, prompt, area threshold), `picture_classification_options`, `code_formula_options`, `chart_extraction_options` |
| **Accelerator** | `accelerator_options.device`, `num_threads` |
| **Performance** | `layout_batch_size`, `ocr_batch_size`, `table_batch_size`, `queue_max_size` |

---

## License

Copyright (C) 2026 Oliver Schneider

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
