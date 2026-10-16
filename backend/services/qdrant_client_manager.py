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
Qdrant Client Manager (Singleton)
-----------------------------------
Provides a single shared QdrantClient instance for the entire backend.

Qdrant's local file-storage mode allows only ONE open client at a time.
If multiple routers or services each create their own QdrantClient pointing
at the same folder, Qdrant raises:
    "Storage folder is already accessed by another instance."

Solution: all backend code must call `get_qdrant_client()` instead of
constructing a QdrantClient directly.

Usage:
    from services.qdrant_client_manager import get_qdrant_client

    qc = get_qdrant_client()
    cols = qc.get_collections()
"""

from __future__ import annotations

import logging
import threading
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

# Module-level state — protected by a lock so concurrent startup requests
# don't race to create two clients simultaneously.
_lock = threading.Lock()
_client = None
_client_path: Optional[str] = None

# Serialises WRITE operations (create/delete collection, upsert) on the shared
# local client. Qdrant's local mode is not designed for concurrent writers, and
# the RAG Tester runs a text track and a visual track in parallel threads.
qdrant_write_lock = threading.RLock()


# Receives an optional `storage_path` string from backend routers (`retrieve.py`, `inspector.py`) and services (`chunk_runner.py`, `colpali_runner.py`, `colpali_retriever.py`, `fusion_retriever.py`, `rag_tester_runner.py`, `retriever.py`, enrichers).
# Lazily initializes and caches a single process-wide `QdrantClient` under a thread lock so multiple threads/services never open conflicting local file locks on the same Qdrant storage directory.
# Returns the shared `QdrantClient` singleton instance to the caller.
def get_qdrant_client(storage_path: str = ""):
    """
    Return the shared QdrantClient, creating it on first call.

    Args:
        storage_path: Absolute path to the Qdrant storage folder.
                      If empty, the default from REPO_ROOT is used.
                      On subsequent calls this parameter is ignored —
                      pass it only on the very first call (or after reset).
    """
    global _client, _client_path

    from qdrant_client import QdrantClient
    from services.chunk_runner import REPO_ROOT, _resolve_qdrant_path

    # Resolve to absolute path
    resolved = str(_resolve_qdrant_path(storage_path or str(REPO_ROOT / "qdrant_storage")))

    with _lock:
        # Always reuse the active singleton client once opened (per docstring contract)
        if _client is not None:
            if _client_path != resolved:
                logger.warning(
                    "Qdrant singleton already open at %s; ignoring requested path %s.",
                    _client_path,
                    resolved,
                )
            return _client

        # Create the shared client on first call (or after explicit reset_qdrant_client).
        logger.info("Opening shared Qdrant client at: %s", resolved)
        _client = QdrantClient(path=resolved)
        _client_path = resolved
        return _client


# Called with no arguments by test suites or runtime reconfiguration helpers when the active Qdrant storage path needs to be released.
# Acquires the singleton lock, safely closes the open `QdrantClient` instance if present, and clears the cached singleton references.
# Returns `None` to the caller.
def reset_qdrant_client():
    """
    Close and discard the shared client.
    Only needed in tests or if the storage path must change at runtime.
    """
    global _client, _client_path
    with _lock:
        if _client is not None:
            try:
                _client.close()
            except Exception:
                pass
        _client = None
        _client_path = None
