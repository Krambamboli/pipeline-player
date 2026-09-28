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
Enrichment Router
------------------
FastAPI routes for the Step 4 Collection Enrichment pipeline.

Routes:
  POST  /api/enrich/run           — Start enrichment run (SSE stream)
  GET   /api/enrich/ollama/status — Check if Ollama is running + list models
"""

from __future__ import annotations

import asyncio
import logging
from typing import Any, Dict

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from models.enrichment_schema import EnrichmentConfig
from services.enrichment_runner import run_enrichment

router = APIRouter(prefix="/api/enrich", tags=["enrich"])
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# POST /api/enrich/run
# ---------------------------------------------------------------------------

@router.post("/run")
async def enrich_run(cfg: EnrichmentConfig) -> StreamingResponse:
    """
    Start a collection enrichment run.
    Returns a Server-Sent Events (SSE) stream of progress messages.
    Each event is either:
      - "__PROGRESS__=<int>"   (0–100 progress bar update)
      - "[HH:MM:SS] ..."       (log line for the UI)
    """
    async def _stream():
        try:
            async for line in run_enrichment(cfg):
                yield f"data: {line}\n\n"
        except Exception as exc:
            logger.exception("Enrichment run crashed")
            yield f"data: [ERROR] Unhandled exception: {exc}\n\n"

    return StreamingResponse(
        _stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


# ---------------------------------------------------------------------------
# GET /api/enrich/ollama/status
# ---------------------------------------------------------------------------

@router.get("/ollama/status")
async def ollama_status(host: str = "http://localhost:11434") -> Dict[str, Any]:
    """
    Check whether Ollama is running and return the list of available models.
    Used by the frontend to validate LLM config before running enrichment.
    """
    from services.llm_client import OllamaClient
    client = OllamaClient(host=host)
    available = await client.is_available()
    models = await client.list_models() if available else []
    return {
        "available": available,
        "host": host,
        "models": models,
    }
