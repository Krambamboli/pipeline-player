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
Run result model — stores metadata about a completed pipeline execution.
This is used to populate the Run History panel in the UI.
"""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


class RunStatus(str, Enum):
    RUNNING = "running"
    SUCCESS = "success"
    ERROR = "error"


class RunResult(BaseModel):
    """Metadata record for a single pipeline execution."""

    run_id: str = Field(description="Unique run identifier (timestamp + profile name).")
    profile_name: str = Field(description="Name of the config profile used for this run.")
    status: RunStatus = Field(default=RunStatus.RUNNING)
    started_at: datetime = Field(default_factory=datetime.utcnow)
    finished_at: Optional[datetime] = Field(default=None)
    duration_seconds: Optional[float] = Field(default=None)
    output_dir: str = Field(description="Relative path to the run output directory.")
    output_files: List[str] = Field(default_factory=list, description="List of generated output file paths.")
    page_count: Optional[int] = Field(default=None)
    error_message: Optional[str] = Field(default=None)
    warnings: List[str] = Field(default_factory=list)
