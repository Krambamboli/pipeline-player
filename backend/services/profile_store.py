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
Profile Store
-------------
Generic YAML store for the *secondary* profile kinds that are re-used by the
RAG Tester:

  kind="chunk"   → configs/chunk/<name>.yaml    (ChunkPipelineConfig)
  kind="colpali" → configs/colpali/<name>.yaml  (ColPaliProcessProfile)

Docling (Step 1) profiles keep living in configs/*.yaml and are managed by
config_manager.py. Because config_manager uses a non-recursive glob, these
sub-folders never show up in the Docling profile list.
"""

from __future__ import annotations

import re
from pathlib import Path
from typing import Dict, List, Type

import yaml
from pydantic import BaseModel

from models.chunk_schema import ChunkPipelineConfig
from models.colpali_schema import ColPaliProcessProfile
from services.config_manager import CONFIGS_DIR

# Registry: profile kind → (sub-directory, Pydantic model)
PROFILE_KINDS: Dict[str, tuple[Path, Type[BaseModel]]] = {
    "chunk": (CONFIGS_DIR / "chunk", ChunkPipelineConfig),
    "colpali": (CONFIGS_DIR / "colpali", ColPaliProcessProfile),
}

# Allowed profile names: letters, digits, dash, underscore, dot, space.
# Prevents path traversal ("../") and odd file names.
_NAME_RE = re.compile(r"^[\w\-. ]{1,80}$")

# Fields that are run-specific and therefore never persisted in a profile.
_RUN_SPECIFIC_FIELDS = {
    "chunk": {"source_run_id"},
}


def _resolve(kind: str) -> tuple[Path, Type[BaseModel]]:
    """Return (directory, model class) for a profile kind or raise ValueError."""
    if kind not in PROFILE_KINDS:
        raise ValueError(f"Unknown profile kind '{kind}'. Use one of: {list(PROFILE_KINDS)}")
    directory, model = PROFILE_KINDS[kind]
    directory.mkdir(parents=True, exist_ok=True)
    return directory, model


def _validate_name(name: str) -> str:
    """Validate a profile name and return it stripped."""
    name = (name or "").strip()
    if not _NAME_RE.match(name) or name.startswith("."):
        raise ValueError(
            f"Invalid profile name '{name}'. Use letters, digits, '-', '_', '.' or spaces."
        )
    return name


def list_profiles(kind: str) -> List[str]:
    """Return all saved profile names of the given kind, sorted."""
    directory, _ = _resolve(kind)
    return sorted(p.stem for p in directory.glob("*.yaml"))


def load_profile(kind: str, name: str) -> BaseModel:
    """Load and validate a profile. Raises FileNotFoundError if missing."""
    directory, model = _resolve(kind)
    path = directory / f"{_validate_name(name)}.yaml"
    if not path.exists():
        raise FileNotFoundError(f"{kind} profile '{name}' not found.")
    raw = yaml.safe_load(path.read_text("utf-8")) or {}
    return model.model_validate(raw)


def save_profile(kind: str, name: str, data: dict) -> BaseModel:
    """
    Validate and persist a profile. The given name always wins over any
    profile_name in the body. Run-specific fields are cleared before saving.
    """
    directory, model = _resolve(kind)
    name = _validate_name(name)
    obj = model.model_validate({**data, "profile_name": name})

    dumped = obj.model_dump(mode="json")
    for field in _RUN_SPECIFIC_FIELDS.get(kind, set()):
        if field in dumped:
            dumped[field] = ""
    # The target collection is chosen per run (Step 2 / RAG Tester), not per profile.
    if kind == "chunk" and isinstance(dumped.get("qdrant"), dict):
        dumped["qdrant"]["collection_name"] = ""

    path = directory / f"{name}.yaml"
    with path.open("w", encoding="utf-8") as f:
        yaml.dump(dumped, f, default_flow_style=False, sort_keys=False, allow_unicode=True)
    return model.model_validate(dumped)


def delete_profile(kind: str, name: str) -> None:
    """Delete a profile. Raises FileNotFoundError if missing."""
    directory, _ = _resolve(kind)
    path = directory / f"{_validate_name(name)}.yaml"
    if not path.exists():
        raise FileNotFoundError(f"{kind} profile '{name}' not found.")
    path.unlink()
