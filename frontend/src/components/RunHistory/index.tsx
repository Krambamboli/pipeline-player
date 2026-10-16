"use client";

// Copyright (C) 2026 olischn
//
// This file is part of Pipeline Player.
// SPDX-License-Identifier: GPL-3.0-or-later
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program. If not, see <https://www.gnu.org/licenses/>.


/**
 * RunHistory — displays a list of past pipeline runs.
 */

import { useEffect, useState } from "react";
import { listRuns } from "@/lib/api";
import type { RunResult } from "@/types/config";

/**
 * Props received by `RunHistory` from the Step 1 Docling Parser page (`app/page.tsx`).
 * Provides a `refreshTrigger` value (e.g. `lastRunId`), `onSelect` callback when a run card is clicked, and the currently `selectedRunId`.
 */
interface Props {
  refreshTrigger: number | string;
  onSelect: (run: RunResult) => void;
  selectedRunId: string | null;
}

/**
 * List component displaying past Step 1 Docling pipeline runs.
 * Receives `Props` (`refreshTrigger`, `onSelect`, `selectedRunId`) from the Step 1 page (`app/page.tsx`).
 * Fetches `RunResult[]` via `listRuns()` whenever `refreshTrigger` changes and renders selectable run cards that emit the chosen `RunResult` via `onSelect`.
 */
export default function RunHistory({ refreshTrigger, onSelect, selectedRunId }: Props) {
  const [runs, setRuns] = useState<RunResult[]>([]);

  useEffect(() => {
    listRuns().then(setRuns).catch(console.error);
  }, [refreshTrigger]);

  if (runs.length === 0) {
    return (
      <div style={{ color: "var(--c-text-3)", fontSize: "0.8rem", textAlign: "center", padding: "24px 0" }}>
        No runs yet
      </div>
    );
  }

  return (
    <div className="run-history">
      {runs.map((run) => (
        <div
          key={run.run_id}
          className={`run-card ${selectedRunId === run.run_id ? "run-card--active" : ""}`}
          onClick={() => onSelect(run)}
        >
          <div className="run-card__header">
            <span className="run-card__id">{run.run_id}</span>
            <span className={`run-card__status run-card__status--${run.status}`}>
              {run.status}
            </span>
          </div>
          <div className="run-card__meta">
            Profile: {run.profile_name}
            {run.duration_seconds != null && ` · ${run.duration_seconds.toFixed(2)}s`}
            {run.page_count != null && ` · ${run.page_count}p`}
          </div>
        </div>
      ))}
    </div>
  );
}
