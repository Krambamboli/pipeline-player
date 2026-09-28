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
Config Manager Service
----------------------
Handles reading and writing YAML configuration profiles to/from the /configs/
directory. Every change from the UI is immediately persisted via this service.

The YAML file format is the single source of truth for reproducibility —
a copy of the exact config is saved alongside every run output.
"""

from __future__ import annotations

import shutil
from pathlib import Path
from typing import Dict, List

import yaml

from models.config_schema import PipelineConfig

# Root directory where all config YAML profiles are stored.
CONFIGS_DIR = Path(__file__).resolve().parent.parent.parent / "configs"
CONFIGS_DIR.mkdir(parents=True, exist_ok=True)


def _profile_path(name: str) -> Path:
    """Return the path to a config profile YAML file."""
    return CONFIGS_DIR / f"{name}.yaml"


def list_profiles() -> List[str]:
    """Return a list of all saved profile names (without .yaml extension)."""
    return sorted(
        p.stem for p in CONFIGS_DIR.glob("*.yaml")
    )


def load_profile(name: str) -> PipelineConfig:
    """
    Load a config profile from disk.
    Raises FileNotFoundError if the profile does not exist.
    """
    path = _profile_path(name)
    if not path.exists():
        raise FileNotFoundError(f"Config profile '{name}' not found at {path}")

    with path.open("r", encoding="utf-8") as f:
        raw = yaml.safe_load(f)

    # Pydantic validates and coerces all fields.
    return PipelineConfig.model_validate(raw)


def save_profile(config: PipelineConfig) -> Path:
    """
    Persist a PipelineConfig to disk as YAML.
    The profile_name field determines the filename.
    Returns the path where the config was saved.
    """
    path = _profile_path(config.profile_name)
    data = config.model_dump(mode="json")

    with path.open("w", encoding="utf-8") as f:
        yaml.dump(data, f, default_flow_style=False, sort_keys=False, allow_unicode=True)

    return path


def delete_profile(name: str) -> None:
    """Delete a config profile. Raises FileNotFoundError if not found."""
    path = _profile_path(name)
    if not path.exists():
        raise FileNotFoundError(f"Config profile '{name}' not found.")
    path.unlink()


def copy_profile_to(config: PipelineConfig, destination: Path) -> Path:
    """
    Copy a config to an arbitrary destination path (used for run reproducibility
    — each output directory gets an exact copy of the config used).
    """
    source = _profile_path(config.profile_name)
    dest_path = destination / "config.yaml"
    shutil.copy2(source, dest_path)
    return dest_path


def ensure_default_profile() -> None:
    """
    Create the default config profile if it doesn't exist yet.
    Called at application startup.
    """
    if not _profile_path("default").exists():
        default_cfg = PipelineConfig(
            profile_name="default",
            description="Default Docling pipeline configuration — a balanced starting point.",
        )
        save_profile(default_cfg)
