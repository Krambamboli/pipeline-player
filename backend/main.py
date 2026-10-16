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
Pipeline Player — FastAPI Backend
==================================
Entry point for the backend server. Configures CORS, mounts all routers,
and runs startup tasks (e.g., ensuring the default config profile exists).

Run with:
    uvicorn main:app --reload --port 8000
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables (e.g. OPENAI_API_KEY, GEMINI_API_KEY) from backend/.env if present
load_dotenv(Path(__file__).resolve().parent / ".env")

# --- Persistent model caches -------------------------------------------------
# fastembed (dense + sparse/BM25 embedding models used by Steps 3/5, the RAG
# Tester and the Fusion Retriever) defaults to `tempfile.gettempdir()/fastembed_cache`.
# On macOS that is /var/folders/.../T/, which the OS purges periodically —
# leaving broken HF-style snapshots whose blobs are gone. We therefore pin the
# cache to ~/.cache/fastembed (next to the Hugging Face hub cache).
# Must run BEFORE any module imports fastembed; child processes (Docling and
# chunk workers) inherit the variable. An explicit value in the environment /
# .env file always wins thanks to setdefault().
# Docs: fastembed/common/utils.py::define_cache_dir (reads FASTEMBED_CACHE_PATH)
os.environ.setdefault(
    "FASTEMBED_CACHE_PATH", str(Path.home() / ".cache" / "fastembed")
)
Path(os.environ["FASTEMBED_CACHE_PATH"]).mkdir(parents=True, exist_ok=True)

from fastapi import FastAPI  # noqa: E402  (imports must follow the env setup)
from fastapi.middleware.cors import CORSMiddleware

from routers import config as config_router
from routers import pipeline as pipeline_router
from routers import status as status_router
from routers import chunk as chunk_router
from routers import qdrant as qdrant_router
from routers import enrich as enrich_router
from routers import retrieve as retrieve_router
from routers import colpali as colpali_router
from routers import profiles as profiles_router
from routers import rag_tester as rag_tester_router
from routers import fusion as fusion_router
from services.config_manager import ensure_default_profile

app = FastAPI(
    title="Pipeline Player API",
    description=(
        "Backend API for testing, benchmarking, and comparing Docling/ColPali "
        "document ingestion pipelines. Exposes config management and live pipeline "
        "execution via Server-Sent Events."
    ),
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS: allow the Next.js dev server (localhost:3000) to reach this backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(status_router.router)
app.include_router(config_router.router)
app.include_router(pipeline_router.router)
app.include_router(chunk_router.router)
app.include_router(qdrant_router.router)
app.include_router(enrich_router.router)
app.include_router(retrieve_router.router)
app.include_router(colpali_router.router)
app.include_router(profiles_router.router)
app.include_router(rag_tester_router.router)
app.include_router(fusion_router.router)


@app.on_event("startup")
async def on_startup() -> None:
    """
    Run startup tasks:
    - Ensure the default config profile exists in /configs/
    """
    ensure_default_profile()
    print("✅ Pipeline Player backend ready.")
    print("   API docs: http://localhost:8000/api/docs")
