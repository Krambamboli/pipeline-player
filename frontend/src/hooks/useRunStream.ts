"use client";

/**
 * useRunStream hook
 * ------------------
 * Triggers a pipeline run via POST /api/pipeline/run and streams
 * Server-Sent Events log lines back to the UI.
 */

import { useCallback, useRef, useState } from "react";
import type { RunEvent } from "@/types/config";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface RunStreamState {
  isRunning: boolean;
  logs: string[];
  lastRunId: string | null;
  lastStatus: "success" | "error" | null;
  lastDuration: number | null;
  lastOutputFiles: string[];
  lastOutputDir: string | null;
  errorMessage: string | null;
}

interface UseRunStreamReturn extends RunStreamState {
  startRun: (profileName: string) => void;
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
  });

  const abortRef = useRef<AbortController | null>(null);

  const startRun = useCallback((profileName: string) => {
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
    }));

    const fetchStream = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/pipeline/run`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile_name: profileName }),
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
              const event = JSON.parse(jsonStr) as RunEvent;

              if (event.type === "log") {
                setState((prev) => ({
                  ...prev,
                  logs: [...prev.logs, event.message],
                }));
              } else if (event.type === "done") {
                setState((prev) => ({
                  ...prev,
                  isRunning: false,
                  lastRunId: event.run_id,
                  lastStatus: event.status,
                  lastDuration: event.duration_seconds,
                  lastOutputFiles: event.output_files,
                  lastOutputDir: event.output_dir,
                  errorMessage: event.error_message,
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

  const clearLogs = useCallback(() => {
    setState((prev) => ({ ...prev, logs: [] }));
  }, []);

  return { ...state, startRun, clearLogs };
}
