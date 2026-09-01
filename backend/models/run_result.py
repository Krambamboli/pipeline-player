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
