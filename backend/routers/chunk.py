"""
Chunk Pipeline Router
---------------------
Exposes endpoints to run the chunking → embedding → Qdrant upsert pipeline
and retrieve the list of past chunk runs.

Routes:
  POST /api/chunk/run          — Start a chunk+embed+upsert run (SSE)
  GET  /api/chunk/runs         — List past chunk run result summaries
  GET  /api/chunk/docling-runs — List available Docling runs to chunk
"""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import List

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from models.chunk_schema import ChunkPipelineConfig
from services.chunk_runner import OUTPUTS_DIR, REPO_ROOT, run_chunk_pipeline

router = APIRouter(prefix="/api/chunk", tags=["chunk"])
logger = logging.getLogger(__name__)

# Directory where chunk run results (JSON) are stored
CHUNK_RUNS_DIR = REPO_ROOT / "chunk_runs"
CHUNK_RUNS_DIR.mkdir(parents=True, exist_ok=True)


# ---------------------------------------------------------------------------
# GET /api/chunk/docling-runs
# ---------------------------------------------------------------------------

@router.get("/docling-runs")
def list_docling_runs() -> List[dict]:
    """
    List all available Docling pipeline runs that have a parsed_doc.json,
    so the frontend can offer them as chunking sources.
    """
    runs = []
    if not OUTPUTS_DIR.exists():
        return runs

    for run_dir in sorted(OUTPUTS_DIR.iterdir(), reverse=True):
        if not run_dir.is_dir():
            continue
        doc_json = run_dir / "parsed_doc.json"
        if not doc_json.exists():
            continue
        config_yaml = run_dir / "config.yaml"
        # Parse run_id from directory name: run_{run_id}
        run_id = run_dir.name[len("run_"):] if run_dir.name.startswith("run_") else run_dir.name
        runs.append({
            "run_id": run_id,
            "dir": run_dir.name,
            "has_config": config_yaml.exists(),
            "json_size_kb": round(doc_json.stat().st_size / 1024, 1),
        })
    return runs


# ---------------------------------------------------------------------------
# POST /api/chunk/run
# ---------------------------------------------------------------------------

@router.post("/run")
def start_chunk_run(config: ChunkPipelineConfig) -> StreamingResponse:
    """
    Start a chunk → embed → Qdrant upsert pipeline run.
    Streams SSE log lines. The final result JSON is saved to /chunk_runs/.
    """
    if not config.source_run_id:
        raise HTTPException(status_code=400, detail="source_run_id is required")

    def event_stream():
        result = {}
        try:
            gen = run_chunk_pipeline(config)
            while True:
                try:
                    line = next(gen)
                    if line.startswith("__PROGRESS__="):
                        yield f"data: {line}\n\n"
                    else:
                        yield f"data: {json.dumps({'log': line})}\n\n"
                except StopIteration as e:
                    result = e.value or {}
                    break
        except Exception as exc:
            logger.exception("Chunk pipeline error")
            result = {"status": "error", "error": str(exc)}
            yield f"data: {json.dumps({'log': f'❌ Pipeline error: {exc}'})}\n\n"

        # Save result to disk
        if result:
            run_id = result.get("chunk_run_id", "unknown")
            result_path = CHUNK_RUNS_DIR / f"{run_id}.json"
            result_path.write_text(json.dumps(result, indent=2), encoding="utf-8")

        yield f"data: {json.dumps({'result': result})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


# ---------------------------------------------------------------------------
# GET /api/chunk/runs
# ---------------------------------------------------------------------------

@router.get("/runs")
def list_chunk_runs() -> List[dict]:
    """Return all past chunk run results, newest first."""
    runs = []
    for f in sorted(CHUNK_RUNS_DIR.glob("*.json"), reverse=True):
        try:
            data = json.loads(f.read_text("utf-8"))
            runs.append(data)
        except Exception:
            continue
    return runs
