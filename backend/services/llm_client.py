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


class LLMUnavailableError(RuntimeError):
    """Raised when the Ollama daemon is not reachable."""


class OllamaClient:
    """
    Async LLM client backed by a local Ollama instance.

    All calls are non-streaming by default (await .complete()).
    Use .stream() for token-level streaming if needed.
    """

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

    async def is_available(self) -> bool:
        """Return True if the Ollama daemon is running and reachable."""
        try:
            import ollama
            client = ollama.AsyncClient(host=self.host)
            await client.list()
            return True
        except Exception:
            return False

    async def list_models(self) -> list[str]:
        """Return names of all locally available Ollama models."""
        try:
            import ollama
            client = ollama.AsyncClient(host=self.host)
            response = await client.list()
            return [m.model for m in response.models]
        except Exception as exc:
            logger.warning("Could not list Ollama models: %s", exc)
            return []

    # ------------------------------------------------------------------
    # Core generation
    # ------------------------------------------------------------------

    async def complete(self, prompt: str, system: str = "") -> str:
        """
        Generate a completion for the given prompt.
        Returns the full response text as a string.
        Retries on transient errors up to max_retries times.
        """
        import ollama

        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})

        last_exc: Optional[Exception] = None
        for attempt in range(self.max_retries + 1):
            try:
                client = ollama.AsyncClient(host=self.host)
                response = await asyncio.wait_for(
                    client.chat(model=self.model, messages=messages),
                    timeout=self.timeout,
                )
                return response.message.content or ""
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

    async def stream(self, prompt: str, system: str = "") -> AsyncGenerator[str, None]:
        """Yield tokens one-by-one as they are generated."""
        import ollama

        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})

        client = ollama.AsyncClient(host=self.host)
        async for chunk in await client.chat(
            model=self.model,
            messages=messages,
            stream=True,
        ):
            token = chunk.message.content or ""
            if token:
                yield token
