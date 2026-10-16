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
Config Router
-------------
Endpoints for managing configuration profiles. The frontend calls these
on every UI change (debounced) to maintain immediate config persistence.
"""

from __future__ import annotations

from typing import List

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

from models.config_schema import PipelineConfig
from services.config_manager import (
    delete_profile,
    list_profiles,
    load_profile,
    save_profile,
)

router = APIRouter(prefix="/api/config", tags=["config"])


# Receives no arguments from GET /api/config/profiles (called by `useConfig` and the RAG Tester page).
# Queries `services/config_manager.py::list_profiles` to enumerate all saved Docling YAML profiles in `configs/`.
# Returns a sorted list of profile name strings to the frontend.
@router.get("/profiles", response_model=List[str])
async def get_profiles() -> List[str]:
    """Return all saved configuration profile names."""
    return list_profiles()


# Receives a profile `name` path parameter from GET /api/config/{name} (called by `useConfig` in the frontend).
# Loads and validates the corresponding YAML profile from `configs/{name}.yaml` via `load_profile`.
# Returns the validated PipelineConfig object to the frontend (or raises HTTP 400/404).
@router.get("/{name}", response_model=PipelineConfig)
async def get_profile(name: str) -> PipelineConfig:
    """Load and return a specific configuration profile by name."""
    try:
        return load_profile(name)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


# Receives profile `name` from the URL path and `config` (PipelineConfig) from PUT /api/config/{name} (debounced auto-save from `useConfig`).
# Synchronizes `config.profile_name` with the URL parameter and persists the updated configuration to `configs/{name}.yaml`.
# Returns the saved PipelineConfig object to the frontend.
@router.put("/{name}", response_model=PipelineConfig)
async def update_profile(name: str, config: PipelineConfig) -> PipelineConfig:
    """
    Save (create or overwrite) a configuration profile.
    Called immediately whenever the user changes any parameter in the UI.
    The profile_name in the body overrides the URL name.
    """
    try:
        config.profile_name = name  # ensure consistency
        save_profile(config)
        return config
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# Receives a full PipelineConfig (`config`) from POST /api/config/save-as (triggered by the ProfileManager "Save As" dialog).
# Writes a new named YAML profile file under `configs/{config.profile_name}.yaml` via `save_profile`.
# Returns the newly persisted PipelineConfig object to the frontend.
@router.post("/save-as", response_model=PipelineConfig)
async def save_as_profile(config: PipelineConfig) -> PipelineConfig:
    """
    Save the current config as a new profile with the name from config.profile_name.
    Used for the 'Save As' functionality in the Profile Manager.
    """
    try:
        save_profile(config)
        return config
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# Receives a profile `name` path parameter from DELETE /api/config/{name} (called by ProfileManager in the frontend).
# Prevents deletion of the `"default"` profile and removes the target YAML file from `configs/`.
# Returns a confirmation JSONResponse to the frontend (or raises HTTP 400/404).
@router.delete("/{name}")
async def remove_profile(name: str) -> JSONResponse:
    """Delete a configuration profile. The 'default' profile cannot be deleted."""
    if name == "default":
        raise HTTPException(status_code=400, detail="Cannot delete the default profile.")
    try:
        delete_profile(name)
        return JSONResponse({"message": f"Profile '{name}' deleted."})
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
