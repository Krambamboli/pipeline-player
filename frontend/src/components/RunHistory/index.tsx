"use client";

/**
 * RunHistory — displays a list of past pipeline runs.
 */

import { useEffect, useState } from "react";
import { listRuns } from "@/lib/api";
import type { RunResult } from "@/types/config";

interface Props {
  refreshTrigger: number;
  onSelect: (run: RunResult) => void;
  selectedRunId: string | null;
}

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
