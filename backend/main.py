"""
Pipeline Player — FastAPI Backend
==================================
Entry point for the backend server. Configures CORS, mounts all routers,
and runs startup tasks (e.g., ensuring the default config profile exists).

Run with:
    uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import config as config_router
from routers import pipeline as pipeline_router
from routers import status as status_router
from routers import chunk as chunk_router
from routers import qdrant as qdrant_router
from routers import enrich as enrich_router
from routers import retrieve as retrieve_router
from routers import colpali as colpali_router
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


@app.on_event("startup")
async def on_startup() -> None:
    """
    Run startup tasks:
    - Ensure the default config profile exists in /configs/
    """
    ensure_default_profile()
    print("✅ Pipeline Player backend ready.")
    print("   API docs: http://localhost:8000/api/docs")
