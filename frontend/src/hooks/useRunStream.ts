"use client";

// Copyright (C) 2024 Oliver Schneider
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

import { useCallback, useRef, useState } from "react";
import type { RunEvent, RunStatus } from "@/types/config";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

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

interface UseRunStreamReturn extends RunStreamState {
  startRun: (profileName: string, filename: string) => void;
  cancelRun: () => void;
  clearLogs: () => void;
}

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

  const startRun = useCallback((profileName: string, filename: string) => {
    // Cancel any previous run stream
    abortRef.current?.abort();
    abortRef.current = new AbortController();

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

    const fetchStream = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/pipeline/run`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile_name: profileName, filename }),
          signal: abortRef.current!.signal,
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
                setState((prev) => ({ ...prev, lastRunId: evt.run_id }));
              } else if (evt.type === "progress") {
                setState((prev) => ({ ...prev, progress: evt.data.percent }));
              } else if (evt.type === "done") {
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

  const cancelRun = useCallback(async () => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    setState((prev) => ({ ...prev, isRunning: false, errorMessage: "Run cancelled by user." }));
    
    // Attempt to terminate backend process
    if (state.lastRunId) {
      try {
        await fetch(`${BASE_URL}/api/pipeline/run/${state.lastRunId}/cancel`, {
          method: "POST"
        });
      } catch (e) {
        console.error("Failed to cancel on backend", e);
      }
    }
  }, [state.lastRunId]);

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
