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
        import fitz  # PyMuPDF
        from PIL import Image

        doc = fitz.open(str(pdf))
        total_pages = len(doc)
        
        if max_pages and total_pages > max_pages:
            yield emit(f"   (limited to {max_pages} out of {total_pages} pages)")
            total_pages = max_pages

        images = []
        for i in range(total_pages):
            page = doc.load_page(i)
            # Render page at requested DPI
            pix = page.get_pixmap(dpi=dpi)
            
            # Convert PyMuPDF Pixmap to PIL Image
            mode = "RGBA" if pix.alpha else "RGB"
            img = Image.frombytes(mode, [pix.width, pix.height], pix.samples)
            images.append(img)
            
    except Exception as e:
        yield emit(f"❌ PDF conversion failed: {e}")
        raise e

    yield emit(f"✅ Converted {total_pages} pages at {dpi} DPI")
    yield "__PROGRESS__=15"

    # ── Step 3: Load ColPali model ────────────────────────────────────
    yield emit(f"🔢 Loading model '{model_name}' on {device}...")
    try:
        from sentence_transformers import MultiVectorEncoder
        import torch

        # Determine torch device
        if device == "mps" and torch.backends.mps.is_available():
            torch_device = "mps"
        elif device == "cuda" and torch.cuda.is_available():
            torch_device = "cuda"
        else:
            torch_device = "cpu"
            if device != "cpu":
                yield emit(f"⚠️  {device} not available, falling back to CPU")

        model = MultiVectorEncoder(model_name, device=torch_device)
        yield emit(f"✅ Model ready on {torch_device}")
    except Exception as e:
        yield emit(f"❌ Failed to load model: {e}")
        raise e
    yield "__PROGRESS__=25"

    # ── Step 4: Encode pages ──────────────────────────────────────────
    yield emit(f"🖼️  Encoding {total_pages} pages (batch_size={batch_size})...")
    all_embeddings = []
    try:
        for batch_start in range(0, total_pages, batch_size):
            batch_end = min(batch_start + batch_size, total_pages)
            batch_images = images[batch_start:batch_end]

            # MultiVectorEncoder.encode_document accepts PIL Images
            batch_embs = model.encode_document(batch_images)
            all_embeddings.extend(batch_embs)

            progress = 25 + int(55 * (batch_end / total_pages))
            yield f"__PROGRESS__={progress}"
            yield emit(f"   Encoded pages {batch_start + 1}–{batch_end}/{total_pages}")
    except Exception as e:
        yield emit(f"❌ Encoding failed: {e}")
        raise e

    yield emit(f"✅ All {total_pages} pages encoded")
    yield "__PROGRESS__=80"

    # ── Step 5: Create Qdrant collection & upsert ─────────────────────
    yield emit(f"🗄️  Creating Qdrant collection '{col_name}'...")
    try:
        from qdrant_client import models
        from services.qdrant_client_manager import get_qdrant_client

        client = get_qdrant_client(str(qdrant_path))

        # Determine vector dimensionality from the first embedding
        # Each embedding is a list of token vectors (list of lists)
        first_emb = all_embeddings[0]
        if hasattr(first_emb, 'tolist'):
            first_emb = first_emb.tolist()
        token_dim = len(first_emb[0]) if isinstance(first_emb[0], (list, tuple)) else len(first_emb[0])

        yield emit(f"   Vector config: {len(first_emb)} tokens × {token_dim}d per page")

        # Create collection with MaxSim multi-vector configuration
        client.create_collection(
            collection_name=col_name,
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
        yield emit(f"✅ Collection created")

        # Upsert each page as a point
        points = []
        for i, emb in enumerate(all_embeddings):
            # Convert numpy arrays to lists if needed
            if hasattr(emb, 'tolist'):
                emb = emb.tolist()

            payload = {
                "page_number": i + 1,
                "doc_source": pdf.name,
                "chunk_type": "colpali_page",
                "dpi": dpi,
                "model": model_name,
                **metadata,
            }

            points.append(models.PointStruct(
                id=str(uuid.uuid4()),
                vector={"colpali": emb},
                payload=payload,
            ))

        client.upsert(collection_name=col_name, points=points)
        yield emit(f"✅ Upserted {len(points)} page vectors")

    except Exception as e:
        yield emit(f"❌ Qdrant upsert failed: {e}")
        raise e

    yield "__PROGRESS__=100"
    total_time = time.time() - start
    yield emit(f"⏱️  Pipeline complete in {total_time:.1f}s")
    yield emit(f"📊 Collection: {col_name} ({total_pages} pages)")
