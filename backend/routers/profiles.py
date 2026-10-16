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
Profiles Router
---------------
CRUD endpoints for saved chunk and ColPali process profiles.

Routes:
  GET    /api/profiles/{kind}          — list profile names
  GET    /api/profiles/{kind}/{name}   — load a profile
  PUT    /api/profiles/{kind}/{name}   — create / overwrite a profile
  DELETE /api/profiles/{kind}/{name}   — delete a profile

kind ∈ {"chunk", "colpali"}
"""

from __future__ import annotations

from typing import Any, Dict, List

from fastapi import APIRouter, Body, HTTPException

from services import profile_store

router = APIRouter(prefix="/api/profiles", tags=["profiles"])


# Receives a caught `Exception` (`exc`) from any endpoint in `routers/profiles.py`.
# Maps `FileNotFoundError` to HTTP 404 and all validation/store errors to HTTP 400.
# Returns a FastAPI `HTTPException` to be raised by the route handler.
def _http_error(exc: Exception) -> HTTPException:
    """Map store exceptions to HTTP status codes."""
    if isinstance(exc, FileNotFoundError):
        return HTTPException(status_code=404, detail=str(exc))
    return HTTPException(status_code=400, detail=str(exc))


# Receives profile `kind` ("chunk" or "colpali") from GET /api/profiles/{kind} (called by SavedProfileBar and the RAG Tester page).
# Queries `profile_store.list_profiles(kind)` to list all YAML profiles under `configs/{kind}/`.
# Returns a sorted list of profile name strings to the frontend.
@router.get("/{kind}", response_model=List[str])
def list_profiles(kind: str) -> List[str]:
    """List all saved profile names of a kind."""
    try:
        return profile_store.list_profiles(kind)
    except Exception as exc:
        raise _http_error(exc)


# Receives profile `kind` and `name` path parameters from GET /api/profiles/{kind}/{name} (called by SavedProfileBar and RAG Tester).
# Loads and validates the YAML profile via `profile_store.load_profile(kind, name)`.
# Returns the serialized JSON dictionary of the profile to the frontend.
@router.get("/{kind}/{name}")
def get_profile(kind: str, name: str) -> Dict[str, Any]:
    """Load a single profile."""
    try:
        return profile_store.load_profile(kind, name).model_dump(mode="json")
    except Exception as exc:
        raise _http_error(exc)


# Receives `kind`, `name`, and a JSON dictionary `data` from PUT /api/profiles/{kind}/{name} (called by SavedProfileBar in the frontend).
# Validates `data` against the kind's Pydantic schema (`ChunkPipelineConfig` or `ColPaliProcessProfile`) and writes it to `configs/{kind}/{name}.yaml`.
# Returns the validated and serialized profile dictionary to the frontend.
@router.put("/{kind}/{name}")
def put_profile(kind: str, name: str, data: Dict[str, Any] = Body(...)) -> Dict[str, Any]:
    """Create or overwrite a profile. Validated against the kind's schema."""
    try:
        return profile_store.save_profile(kind, name, data).model_dump(mode="json")
    except Exception as exc:
        raise _http_error(exc)


# Receives `kind` and `name` path parameters from DELETE /api/profiles/{kind}/{name} (called by SavedProfileBar in the frontend).
# Removes the corresponding YAML profile file from `configs/{kind}/{name}.yaml` via `profile_store.delete_profile`.
# Returns a confirmation message dict to the frontend.
@router.delete("/{kind}/{name}")
def delete_profile(kind: str, name: str) -> Dict[str, str]:
    """Delete a profile."""
    try:
        profile_store.delete_profile(kind, name)
        return {"message": f"{kind} profile '{name}' deleted."}
    except Exception as exc:
        raise _http_error(exc)
