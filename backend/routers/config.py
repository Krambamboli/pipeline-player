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


@router.get("/profiles", response_model=List[str])
async def get_profiles() -> List[str]:
    """Return all saved configuration profile names."""
    return list_profiles()


@router.get("/{name}", response_model=PipelineConfig)
async def get_profile(name: str) -> PipelineConfig:
    """Load and return a specific configuration profile by name."""
    try:
        return load_profile(name)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/{name}", response_model=PipelineConfig)
async def update_profile(name: str, config: PipelineConfig) -> PipelineConfig:
    """
    Save (create or overwrite) a configuration profile.
    Called immediately whenever the user changes any parameter in the UI.
    The profile_name in the body overrides the URL name.
    """
    config.profile_name = name  # ensure consistency
    save_profile(config)
    return config


@router.post("/save-as", response_model=PipelineConfig)
async def save_as_profile(config: PipelineConfig) -> PipelineConfig:
    """
    Save the current config as a new profile with the name from config.profile_name.
    Used for the 'Save As' functionality in the Profile Manager.
    """
    existing = list_profiles()
    if config.profile_name in existing and config.profile_name != "default":
        # Allow overwrite — the UI confirms before calling this
        pass
    save_profile(config)
    return config


@router.delete("/{name}")
async def remove_profile(name: str) -> JSONResponse:
    """Delete a configuration profile. The 'default' profile cannot be deleted."""
    if name == "default":
        raise HTTPException(status_code=400, detail="Cannot delete the default profile.")
    try:
        delete_profile(name)
        return JSONResponse({"message": f"Profile '{name}' deleted."})
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
