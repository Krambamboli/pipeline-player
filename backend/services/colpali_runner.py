# Copyright (C) 2024 Oliver Schneider
#
# This file is part of Pipeline Player.
# SPDX-License-Identifier: GPL-3.0-or-later
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program. If not, see <https://www.gnu.org/licenses/>.

"""
ColPali Pipeline Runner
-------------------------
Executes the PDF → page-images → ColQwen2 multi-vector embedding → Qdrant upsert pipeline.

WHY: ColPali treats each document page as an image and generates a set of
patch-level embeddings (multi-vector). This enables visual retrieval via
MaxSim that captures layout, charts, tables, and typography — things that
text-only pipelines miss entirely.

HOW:
  1. Convert PDF pages to PIL Images using pdf2image (poppler backend)
  2. Load a ColPali/ColQwen2 model via sentence_transformers.MultiVectorEncoder
  3. Batch-encode page images into multi-vector embeddings
  4. Create a Qdrant collection with MultiVectorConfig(MAX_SIM)
  5. Upsert each page's multi-vector + metadata payload

Yields structured log lines for SSE streaming to the UI.

References:
  https://sbert.net/docs/package_reference/sentence_transformer/MultiVectorEncoder.html
  https://qdrant.tech/documentation/concepts/vectors/#multivectors
"""

from __future__ import annotations

import logging
import time
import uuid
import datetime
from pathlib import Path
from typing import AsyncGenerator, Dict, List, Optional

logger = logging.getLogger(__name__)

# Root paths (same convention as chunk_runner)
REPO_ROOT = Path(__file__).resolve().parent.parent.parent
QDRANT_STORAGE_DEFAULT = REPO_ROOT / "qdrant_storage"


def _emit(msg: str) -> str:
    """Format a timestamped log line for SSE streaming."""
    ts = datetime.datetime.now().strftime("%H:%M:%S")
    return f"[{ts}] {msg}"


def _resolve_qdrant_path(storage_path: str) -> Path:
    """Resolve the Qdrant storage path (relative paths → repo root)."""
    p = Path(storage_path)
    if not p.is_absolute():
        p = REPO_ROOT / p
    p.mkdir(parents=True, exist_ok=True)
    return p


def _build_collection_name(pdf_path: str) -> str:
    """Auto-generate a Qdrant collection name from the PDF filename + timestamp."""
    stem = Path(pdf_path).stem.replace(" ", "_").lower()
    ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    return f"colpali_{stem}_{ts}"


# ---------------------------------------------------------------------------
# Reusable building blocks (shared by the ColPali page and the RAG Tester)
# ---------------------------------------------------------------------------

def count_pdf_pages(pdf: Path) -> int:
    """Return the number of pages of a PDF (cheap, no rendering)."""
    import fitz  # PyMuPDF
    with fitz.open(str(pdf)) as doc:
        return len(doc)


def render_pdf_pages(pdf: Path, dpi: int, max_pages: Optional[int] = None):
    """
    Render PDF pages to PIL images with PyMuPDF.
    Returns (images, total_pages_in_document).
    """
    import fitz  # PyMuPDF
    from PIL import Image

    images = []
    with fitz.open(str(pdf)) as doc:
        total = len(doc)
        n = min(total, max_pages) if max_pages else total
        for i in range(n):
            pix = doc.load_page(i).get_pixmap(dpi=dpi)
            mode = "RGBA" if pix.alpha else "RGB"
            img = Image.frombytes(mode, [pix.width, pix.height], pix.samples)
            # ColPali processors expect RGB
            images.append(img.convert("RGB") if mode == "RGBA" else img)
    return images, total


def resolve_torch_device(device: str) -> str:
    """Map the requested device to an available torch device (fallback: cpu)."""
    import torch
    if device == "mps" and torch.backends.mps.is_available():
        return "mps"
    if device == "cuda" and torch.cuda.is_available():
        return "cuda"
    return "cpu"


def load_colpali_model(model_name: str, device: str):
    """
    Load a ColPali/ColQwen2 model via sentence-transformers' MultiVectorEncoder.
    Returns (model, torch_device).
    """
    from sentence_transformers import MultiVectorEncoder
    torch_device = resolve_torch_device(device)
    model = MultiVectorEncoder(model_name, device=torch_device)
    return model, torch_device


def encode_pages(model, images, batch_size: int):
    """
    Encode page images in batches.
    Yields (pages_done, batch_embeddings) after every batch so callers can
    report progress. Embeddings are converted to plain Python lists.
    """
    total = len(images)
    for start in range(0, total, batch_size):
        end = min(start + batch_size, total)
        batch_embs = model.encode_document(images[start:end])
        yield end, [e.tolist() if hasattr(e, "tolist") else e for e in batch_embs]


def ensure_colpali_collection(client, collection_name: str, token_dim: int) -> bool:
    """
    Create a MaxSim multi-vector collection (named vector "colpali") if missing.
    Returns True if created, False if it already existed.
    """
    from qdrant_client import models
    from services.qdrant_client_manager import qdrant_write_lock

    with qdrant_write_lock:
        if client.collection_exists(collection_name):
            return False
        client.create_collection(
            collection_name=collection_name,
            vectors_config={
                "colpali": models.VectorParams(
                    size=token_dim,
                    distance=models.Distance.COSINE,
                    multivector_config=models.MultiVectorConfig(
                        comparator=models.MultiVectorComparator.MAX_SIM
                    ),
                    # Disable HNSW index — MaxSim uses brute-force scoring
                    hnsw_config=models.HnswConfigDiff(m=0),
                )
            },
        )
    return True


def upsert_page_points(client, collection_name: str, embeddings: List, payloads: List[Dict]):
    """Upsert one point per page (multi-vector + payload) under the write lock."""
    from qdrant_client import models
    from services.qdrant_client_manager import qdrant_write_lock

    points = [
        models.PointStruct(id=str(uuid.uuid4()), vector={"colpali": emb}, payload=payload)
        for emb, payload in zip(embeddings, payloads)
    ]
    with qdrant_write_lock:
        client.upsert(collection_name=collection_name, points=points)
    return len(points)


# ---------------------------------------------------------------------------
# Main runner (ColPali page — single document)
# ---------------------------------------------------------------------------

async def run_colpali_pipeline(
    pdf_path: str,
    model_name: str = "vidore/colqwen2-v1.0",
    device: str = "mps",
    batch_size: int = 2,
    dpi: int = 144,
    max_pages: Optional[int] = None,
    metadata: Optional[Dict[str, str]] = None,
    collection_name: str = "",
    qdrant_storage_path: str = "",
) -> AsyncGenerator[str, None]:
    """
    Top-level ColPali pipeline generator.

    Yields:
        "__PROGRESS__=<0-100>" strings for progress bar updates
        "[HH:MM:SS] ..." log lines for live display
    """
    emit = _emit
    start = time.time()
    metadata = metadata or {}

    # ── Step 1: Resolve paths ─────────────────────────────────────────
    pdf = Path(pdf_path)
    if not pdf.is_absolute():
        pdf = REPO_ROOT / "test_data" / pdf
    if not pdf.exists():
        yield emit(f"❌ PDF not found: {pdf}")
        return

    qdrant_path = _resolve_qdrant_path(
        qdrant_storage_path or str(QDRANT_STORAGE_DEFAULT)
    )
    col_name = collection_name.strip() or _build_collection_name(str(pdf))

    yield emit(f"🚀 Starting ColPali pipeline")
    yield emit(f"   PDF     : {pdf.name}")
    yield emit(f"   Model   : {model_name}")
    yield emit(f"   Device  : {device}")
    yield emit(f"   DPI     : {dpi}")
    yield emit(f"   Batch   : {batch_size}")
    yield emit(f"   Output  : {col_name}")
    yield "__PROGRESS__=5"

    # ── Step 2: Convert PDF → page images ─────────────────────────────
    yield emit("📄 Converting PDF pages to images...")
    try:
        images, doc_pages = render_pdf_pages(pdf, dpi, max_pages)
        total_pages = len(images)
        if total_pages < doc_pages:
            yield emit(f"   (limited to {total_pages} out of {doc_pages} pages)")
    except Exception as e:
        yield emit(f"❌ PDF conversion failed: {e}")
        raise e

    yield emit(f"✅ Converted {total_pages} pages at {dpi} DPI")
    yield "__PROGRESS__=15"

    # ── Step 3: Load ColPali model ────────────────────────────────────
    yield emit(f"🔢 Loading model '{model_name}' on {device}...")
    try:
        model, torch_device = load_colpali_model(model_name, device)
        if torch_device != device:
            yield emit(f"⚠️  {device} not available, falling back to {torch_device}")
        yield emit(f"✅ Model ready on {torch_device}")
    except Exception as e:
        yield emit(f"❌ Failed to load model: {e}")
        raise e
    yield "__PROGRESS__=25"

    # ── Step 4: Encode pages ──────────────────────────────────────────
    yield emit(f"🖼️  Encoding {total_pages} pages (batch_size={batch_size})...")
    all_embeddings: List = []
    try:
        prev = 0
        for done, batch_embs in encode_pages(model, images, batch_size):
            all_embeddings.extend(batch_embs)
            yield f"__PROGRESS__={25 + int(55 * (done / total_pages))}"
            yield emit(f"   Encoded pages {prev + 1}–{done}/{total_pages}")
            prev = done
    except Exception as e:
        yield emit(f"❌ Encoding failed: {e}")
        raise e

    yield emit(f"✅ All {total_pages} pages encoded")
    yield "__PROGRESS__=80"

    # ── Step 5: Create Qdrant collection & upsert ─────────────────────
    yield emit(f"🗄️  Creating Qdrant collection '{col_name}'...")
    try:
        from services.qdrant_client_manager import get_qdrant_client

        client = get_qdrant_client(str(qdrant_path))

        # Each embedding is a list of token vectors (list of lists)
        first_emb = all_embeddings[0]
        token_dim = len(first_emb[0])
        yield emit(f"   Vector config: {len(first_emb)} tokens × {token_dim}d per page")

        if ensure_colpali_collection(client, col_name, token_dim):
            yield emit(f"✅ Collection created")
        else:
            yield emit(f"➕ Appending to existing collection '{col_name}'")

        payloads = [
            {
                "page_number": i + 1,
                "doc_source": pdf.name,
                "chunk_type": "colpali_page",
                "dpi": dpi,
                "model": model_name,
                **metadata,
            }
            for i in range(len(all_embeddings))
        ]
        n = upsert_page_points(client, col_name, all_embeddings, payloads)
        yield emit(f"✅ Upserted {n} page vectors")

    except Exception as e:
        yield emit(f"❌ Qdrant upsert failed: {e}")
        raise e

    yield "__PROGRESS__=100"
    total_time = time.time() - start
    yield emit(f"⏱️  Pipeline complete in {total_time:.1f}s")
    yield emit(f"📊 Collection: {col_name} ({total_pages} pages)")
