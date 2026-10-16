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
 * useRunStream hook
 * ------------------
 * Triggers a pipeline run via POST /api/pipeline/run and streams
 * Server-Sent Events log lines back to the UI.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { RunEvent, RunStatus } from "@/types/config";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/**
 * Reactive state tracked by `useRunStream` during and after a Step 1 Docling pipeline run.
 * Consumed by the Step 1 page (`app/page.tsx`), `RunConsole`, and `OutputViewer` to render live logs, progress, status, and output files.
 */
export interface RunStreamState {
  isRunning: boolean;
  logs: string[];
  lastRunId: string | null;
  lastStatus: RunStatus | null;
  lastDuration: number | null;
  lastOutputFiles: string[];
  lastOutputDir: string | null;
  errorMessage: string | null;
  progress: number;
}

/**
 * Full return value contract of `useRunStream`, combining `RunStreamState` with run lifecycle control methods.
 * Returned to the Step 1 Docling Parser page (`app/page.tsx`) to start, cancel, or clear pipeline runs.
 */
interface UseRunStreamReturn extends RunStreamState {
  startRun: (profileName: string, filename: string) => void;
  cancelRun: () => void;
  clearLogs: () => void;
}

/**
 * Custom React hook that triggers a Step 1 Docling pipeline run (`POST /api/pipeline/run`) and streams SSE `RunEvent` messages.
 * Receives no arguments; called by the Step 1 Docling Parser page (`app/page.tsx`).
 * Returns `UseRunStreamReturn` containing live logs, progress percentage, run outcome metadata, and `startRun` / `cancelRun` / `clearLogs` handlers.
 */
export function useRunStream(): UseRunStreamReturn {
  const [state, setState] = useState<RunStreamState>({
    isRunning: false,
    logs: [],
    lastRunId: null,
    lastStatus: null,
    lastDuration: null,
    lastOutputFiles: [],
    lastOutputDir: null,
    errorMessage: null,
    progress: 0,
  });

  const abortRef = useRef<AbortController | null>(null);
  // Track the active run_id in a ref so cancelRun always has immediate access
  // even before React commits the state update.
  const runIdRef = useRef<string | null>(null);

  // Abort any in-flight SSE stream when the component unmounts
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  /**
   * Initiates a new Docling pipeline run for the given `profileName` and document `filename`.
   * Called by the Step 1 page when the user clicks Run Pipeline; resets stream state and spawns `fetchStream` to consume SSE events.
   */
  const startRun = useCallback((profileName: string, filename: string) => {
    // Cancel any previous run stream
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    runIdRef.current = null;

    setState((prev) => ({
      ...prev,
      isRunning: true,
      logs: [],
      lastRunId: null,
      lastStatus: null,
      lastDuration: null,
      lastOutputFiles: [],
      lastOutputDir: null,
      errorMessage: null,
      progress: 0,
    }));

    /**
     * Internal async helper that sends `POST /api/pipeline/run` and reads the SSE `ReadableStream`.
     * Parses `RunEvent` JSON lines (`log`, `run_id`, `progress`, `done`) from the backend and updates `RunStreamState` accordingly.
     */
    const fetchStream = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/pipeline/run`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile_name: profileName, filename }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          const text = await res.text();
          setState((prev) => ({
            ...prev,
            isRunning: false,
            lastStatus: "error",
            errorMessage: `HTTP ${res.status}: ${text}`,
          }));
          return;
        }

        // Read the SSE stream
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? ""; // keep incomplete line in buffer

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (!jsonStr) continue;

            try {
              const evt = JSON.parse(jsonStr) as RunEvent;

              if (evt.type === "log") {
                setState((prev) => ({ ...prev, logs: [...prev.logs, evt.message] }));
              } else if (evt.type === "run_id") {
                runIdRef.current = evt.run_id;
                setState((prev) => ({ ...prev, lastRunId: evt.run_id }));
              } else if (evt.type === "progress") {
                setState((prev) => ({ ...prev, progress: evt.data.percent }));
              } else if (evt.type === "done") {
                runIdRef.current = evt.run_id;
                setState((prev) => ({
                  ...prev,
                  isRunning: false,
                  lastRunId: evt.run_id,
                  lastStatus: evt.status,
                  lastDuration: evt.duration_seconds,
                  lastOutputFiles: evt.output_files,
                  lastOutputDir: evt.output_dir,
                  errorMessage: evt.error_message,
                }));
              }
            } catch {
              // Ignore malformed SSE lines
            }
          }
        }

        // Ensure isRunning is cleared if the stream closed without a "done" event
        setState((prev) => (prev.isRunning ? { ...prev, isRunning: false } : prev));
      } catch (e: unknown) {
        if ((e as Error).name === "AbortError") return;
        setState((prev) => ({
          ...prev,
          isRunning: false,
          lastStatus: "error",
          errorMessage: `Stream error: ${(e as Error).message}`,
        }));
      }
    };

    fetchStream();
  }, []);

  /**
   * Cancels the currently running Docling pipeline stream and requests backend worker termination.
   * Called by the Step 1 page Cancel button; aborts the local fetch stream and sends `POST /api/pipeline/run/{runId}/cancel`.
   */
  const cancelRun = useCallback(async () => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    setState((prev) => ({ ...prev, isRunning: false, errorMessage: "Run cancelled by user." }));

    // Attempt to terminate backend worker process using the latest run ID
    const targetRunId = runIdRef.current ?? state.lastRunId;
    if (targetRunId) {
      try {
        await fetch(`${BASE_URL}/api/pipeline/run/${targetRunId}/cancel`, {
          method: "POST",
        });
      } catch (e) {
        console.error("Failed to cancel on backend", e);
      }
    }
  }, [state.lastRunId]);

  /**
   * Clears the accumulated log lines in `RunStreamState`.
   * Called by the Step 1 page when resetting the console view.
   */
  const clearLogs = useCallback(() => {
    setState((prev) => ({ ...prev, logs: [] }));
  }, []);

  return {
    ...state,
    startRun,
    cancelRun,
    clearLogs,
  };
}
