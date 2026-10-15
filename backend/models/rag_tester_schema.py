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
RAG Tester Schema
-----------------
Request models for the RAG Tester: ingest a whole course folder of PDFs into
two Qdrant collections in one go —
  * a hybrid (dense + sparse) text collection   (Docling → chunk → embed)
  * a ColPali multi-vector page collection      (page images → MaxSim)
using saved Docling, chunk and ColPali profiles.
"""

from __future__ import annotations

from typing import Dict

from pydantic import BaseModel, Field


class FolderScanRequest(BaseModel):
    """Request body for previewing the PDFs in a folder."""
    folder_path: str = Field(..., description="Absolute path, '~/...' or a path relative to test_data/.")
    recursive: bool = Field(default=True, description="Include PDFs in sub-folders.")


class RagTesterRequest(BaseModel):
    """Full configuration of one RAG Tester run."""

    # ── Input ────────────────────────────────────────────────────────
    folder_path: str = Field(..., description="Course folder (absolute, '~/...' or relative to test_data/).")
    recursive: bool = Field(default=True, description="Include PDFs in sub-folders.")

    # ── Saved profiles ───────────────────────────────────────────────
    docling_profile: str = Field(..., description="Step 1 Docling profile name (configs/<name>.yaml).")
    chunk_profile: str = Field(default="", description="Chunk profile name (configs/chunk/<name>.yaml).")
    colpali_profile: str = Field(default="", description="ColPali profile name (configs/colpali/<name>.yaml).")

    # ── Tracks ───────────────────────────────────────────────────────
    enable_text_track: bool = Field(default=True, description="Build the hybrid text collection.")
    enable_visual_track: bool = Field(default=True, description="Build the ColPali page collection.")

    # ── Output collections ───────────────────────────────────────────
    hybrid_collection: str = Field(default="", description="Name of the text collection (auto if empty).")
    colpali_collection: str = Field(default="", description="Name of the ColPali collection (auto if empty).")
    overwrite: bool = Field(
        default=False,
        description="Delete and re-create collections that already exist. If False, the run aborts instead.",
    )

    # ── Behaviour ────────────────────────────────────────────────────
    force_hybrid_embedding: bool = Field(
        default=True,
        description="Always embed dense + sparse (hybrid), regardless of the chunk profile's mode.",
    )
    docling_workers: int = Field(
        default=3, ge=1, le=8,
        description="Number of Docling subprocesses running in parallel (each needs ~2–3 GB RAM).",
    )
    custom_metadata: Dict[str, str] = Field(
        default_factory=dict,
        description="Extra key-value metadata added to every point in BOTH collections.",
    )
