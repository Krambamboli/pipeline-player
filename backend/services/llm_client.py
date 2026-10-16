# Copyright (C) 2026 olischn
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
LLM Client — Ollama
--------------------
Thin async wrapper around the Ollama Python SDK.
Provides a unified interface so the enricher services don't depend
on Ollama-specific API details directly.

Usage:
    client = OllamaClient(host="http://localhost:11434", model="llama3.2")
    text = await client.complete("Summarise: ...")

References:
    https://github.com/ollama/ollama-python
"""

from __future__ import annotations

import asyncio
import logging
from typing import AsyncGenerator, Optional

logger = logging.getLogger(__name__)


# Receives an error message string from `OllamaClient.complete` when all retry attempts fail.
# Represents a runtime error indicating that the local Ollama daemon could not be reached or timed out.
# Raised to callers such as `enrichment_runner.py`, strategy enrichers, and `retriever.rewrite_query`.
class LLMUnavailableError(RuntimeError):
    """Raised when the Ollama daemon is not reachable."""


# Instantiated by `routers/enrich.py`, `services/enrichment_runner.py`, and `services/retriever.py` with connection settings.
# Wraps the Ollama Python SDK (with an `httpx` REST fallback) to provide a unified async LLM interface for health checks, model listing, and text generation.
# Exposes async methods (`is_available`, `list_models`, `complete`, `stream`) to enrichment and retrieval services.
class OllamaClient:
    """
    Async LLM client backed by a local Ollama instance.

    All calls are non-streaming by default (await .complete()).
    Use .stream() for token-level streaming if needed.
    """

    # Receives `host`, `model`, `timeout_seconds`, and `max_retries` from callers instantiating `OllamaClient` (`routers/enrich.py`, `enrichment_runner.py`, `retriever.py`).
    # Stores the connection and retry configuration on the client instance for subsequent Ollama API calls.
    # Returns `None` to the instantiating caller.
    def __init__(
        self,
        host: str = "http://localhost:11434",
        model: str = "llama3.2",
        timeout_seconds: int = 120,
        max_retries: int = 2,
    ) -> None:
        self.host = host
        self.model = model
        self.timeout = timeout_seconds
        self.max_retries = max_retries

    # ------------------------------------------------------------------
    # Health check
    # ------------------------------------------------------------------

    # Called with no extra arguments by `routers/enrich.py` (`ollama_status`) and `services/enrichment_runner.py` (`run_enrichment`).
    # Pings the configured Ollama daemon via the `ollama` SDK (or `/api/tags` via `httpx` fallback) to verify that the server is reachable before running LLM tasks.
    # Returns a `bool` (`True` if reachable, `False` otherwise) to the calling router or runner.
    async def is_available(self) -> bool:
        """Return True if the Ollama daemon is running and reachable."""
        try:
            import ollama
            client = ollama.AsyncClient(host=self.host)
            await client.list()
            return True
        except ImportError:
            try:
                import httpx
                async with httpx.AsyncClient(timeout=5.0) as http:
                    resp = await http.get(f"{self.host.rstrip('/')}/api/tags")
                    return resp.status_code == 200
            except Exception:
                return False
        except Exception:
            return False

    # Called with no extra arguments by `routers/enrich.py` (`ollama_status`) and `services/enrichment_runner.py` (`run_enrichment`).
    # Queries the local Ollama daemon for all installed model tags so the UI and enrichment runner can validate model availability.
    # Returns a `list[str]` of model names to the calling router or service (or an empty list on error).
    async def list_models(self) -> list[str]:
        """Return names of all locally available Ollama models."""
        try:
            import ollama
            client = ollama.AsyncClient(host=self.host)
            response = await client.list()
            return [m.model for m in response.models]
        except ImportError:
            try:
                import httpx
                async with httpx.AsyncClient(timeout=5.0) as http:
                    resp = await http.get(f"{self.host.rstrip('/')}/api/tags")
                    resp.raise_for_status()
                    data = resp.json()
                    return [m.get("name") or m.get("model", "") for m in data.get("models", [])]
            except Exception as exc:
                logger.warning("Could not list Ollama models via httpx: %s", exc)
                return []
        except Exception as exc:
            logger.warning("Could not list Ollama models: %s", exc)
            return []

    # ------------------------------------------------------------------
    # Core generation
    # ------------------------------------------------------------------

    # Receives a user `prompt` string and optional `system` prompt from `retriever.rewrite_query` or the Step 4 enricher modules (`parent_child_enricher`, `raptor_enricher`, `graph_enricher`).
    # Sends a non-streaming chat completion request to Ollama (with timeout and exponential-backoff retries, falling back to `httpx` if `ollama` is not installed) to generate summaries, graph entities, or rewritten queries.
    # Returns the generated response `str` to the caller, or raises `LLMUnavailableError` if all retries fail.
    async def complete(self, prompt: str, system: str = "") -> str:
        """
        Generate a completion for the given prompt.
        Returns the full response text as a string.
        Retries on transient errors up to max_retries times.
        """
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})

        last_exc: Optional[Exception] = None
        for attempt in range(self.max_retries + 1):
            try:
                try:
                    import ollama
                    client = ollama.AsyncClient(host=self.host)
                    response = await asyncio.wait_for(
                        client.chat(model=self.model, messages=messages),
                        timeout=self.timeout,
                    )
                    return response.message.content or ""
                except ImportError:
                    # Fallback to direct Ollama REST API via httpx when `ollama` package is not installed
                    import httpx
                    async with httpx.AsyncClient(timeout=float(self.timeout)) as http:
                        resp = await http.post(
                            f"{self.host.rstrip('/')}/api/chat",
                            json={"model": self.model, "messages": messages, "stream": False},
                        )
                        resp.raise_for_status()
                        data = resp.json()
                        return (data.get("message") or {}).get("content", "") or ""
            except asyncio.TimeoutError:
                last_exc = TimeoutError(
                    f"Ollama request timed out after {self.timeout}s"
                )
                logger.warning("Ollama timeout (attempt %d/%d)", attempt + 1, self.max_retries + 1)
            except Exception as exc:
                last_exc = exc
                logger.warning("Ollama error (attempt %d/%d): %s", attempt + 1, self.max_retries + 1, exc)
                if attempt < self.max_retries:
                    await asyncio.sleep(1.5 * (attempt + 1))  # exponential back-off

        raise LLMUnavailableError(
            f"Ollama call failed after {self.max_retries + 1} attempts. "
            f"Last error: {last_exc}"
        )

    # Receives a user `prompt` string and optional `system` prompt from callers needing incremental token output.
    # Opens a streaming chat request against Ollama (via the `ollama` SDK or `httpx` line streaming) so responses can be consumed token by token as they are generated.
    # Yields each generated token `str` via an `AsyncGenerator` back to the awaiting caller.
    async def stream(self, prompt: str, system: str = "") -> AsyncGenerator[str, None]:
        """Yield tokens one-by-one as they are generated."""
        import json

        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})

        try:
            import ollama
            client = ollama.AsyncClient(host=self.host)
            async for chunk in await client.chat(
                model=self.model,
                messages=messages,
                stream=True,
            ):
                token = chunk.message.content or ""
                if token:
                    yield token
        except ImportError:
            import httpx
            async with httpx.AsyncClient(timeout=float(self.timeout)) as http:
                async with http.stream(
                    "POST",
                    f"{self.host.rstrip('/')}/api/chat",
                    json={"model": self.model, "messages": messages, "stream": True},
                ) as resp:
                    resp.raise_for_status()
                    async for line in resp.aiter_lines():
                        if not line.strip():
                            continue
                        data = json.loads(line)
                        token = (data.get("message") or {}).get("content", "")
                        if token:
                            yield token
