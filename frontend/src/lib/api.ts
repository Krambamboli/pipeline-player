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
 * Typed API helpers for communicating with the FastAPI backend.
 * Base URL is configurable via NEXT_PUBLIC_API_URL env var.
 */

import { PipelineConfig, RunResult } from "@/types/config";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ---------------------------------------------------------------------------
// Generic fetch helper
// ---------------------------------------------------------------------------

/**
 * Internal generic HTTP helper that receives a backend endpoint `path` and optional `RequestInit` options from API functions in this module.
 * Performs a JSON `fetch` request against the FastAPI backend (`BASE_URL`) and throws an Error with status/body on non-2xx responses.
 * Returns the parsed JSON response typed as `Promise<T>` to the calling API helper function.
 */
async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Config API
// ---------------------------------------------------------------------------

/**
 * List all saved profile names.
 * Receives no arguments; called by `ProfileManager` and the RAG Tester page.
 * Queries `GET /api/config/profiles` on the backend and returns an array of profile name strings to populate profile selector dropdowns.
 */
export async function listProfiles(): Promise<string[]> {
  return apiFetch<string[]>("/api/config/profiles");
}

/**
 * Load a config profile by name.
 * Receives the profile `name` from `useConfig.switchProfile`.
 * Fetches `GET /api/config/{name}` from the backend and returns the resolved `PipelineConfig` object to `useConfig`.
 */
export async function loadProfile(name: string): Promise<PipelineConfig> {
  return apiFetch<PipelineConfig>(`/api/config/${encodeURIComponent(name)}`);
}

/**
 * Save (immediately write) a config profile. Called on every UI change.
 * Receives the profile `name` and updated `PipelineConfig` from the debounced auto-save in `useConfig.updateField`.
 * Sends `PUT /api/config/{name}` to persist changes to disk and returns the saved `PipelineConfig` back to `useConfig`.
 */
export async function saveProfile(name: string, config: PipelineConfig): Promise<PipelineConfig> {
  return apiFetch<PipelineConfig>(`/api/config/${encodeURIComponent(name)}`, {
    method: "PUT",
    body: JSON.stringify(config),
  });
}

/**
 * Save the current config as a new profile (Save As).
 * Receives a `PipelineConfig` (with the new `profile_name`) from `useConfig.saveAs` (triggered via `ProfileManager`).
 * Sends `POST /api/config/save-as` to create a new YAML profile on the backend and returns the persisted `PipelineConfig` to `useConfig`.
 */
export async function saveAsProfile(config: PipelineConfig): Promise<PipelineConfig> {
  return apiFetch<PipelineConfig>("/api/config/save-as", {
    method: "POST",
    body: JSON.stringify(config),
  });
}

/**
 * Delete a config profile.
 * Receives the profile `name` to remove from `ProfileManager.handleDelete`.
 * Sends `DELETE /api/config/{name}` to the backend to delete the profile YAML file and resolves `void` back to `ProfileManager`.
 */
export async function deleteProfile(name: string): Promise<void> {
  await apiFetch<void>(`/api/config/${encodeURIComponent(name)}`, {
    method: "DELETE",
  });
}

// ---------------------------------------------------------------------------
// Pipeline API
// ---------------------------------------------------------------------------

/**
 * List all past run results.
 * Receives no arguments; called by `RunHistory` when mounted or when `refreshTrigger` changes.
 * Queries `GET /api/pipeline/runs` and returns an array of `RunResult` objects for display in `RunHistory`.
 */
export async function listRuns(): Promise<RunResult[]> {
  return apiFetch<RunResult[]>("/api/pipeline/runs");
}

/**
 * Metadata for a parseable input document returned by `GET /api/pipeline/documents`.
 * Consumed by `listDocuments()` and the Step 1 Docling Parser page to display filenames and estimated run times.
 */
export interface DocumentInfo {
  filename: string;
  estimated_seconds: number;
}

/**
 * List available documents for parsing.
 * Receives no arguments; called by the Step 1 Docling Parser page on mount.
 * Queries `GET /api/pipeline/documents` and returns an array of `DocumentInfo` records for the document selector UI.
 */
export async function listDocuments(): Promise<DocumentInfo[]> {
  return apiFetch<DocumentInfo[]>("/api/pipeline/documents");
}

/**
 * Get a specific run result by ID.
 * Receives a `runId` string from pipeline consumers inspecting a specific run.
 * Queries `GET /api/pipeline/run/{runId}` on the backend and returns the matching `RunResult` metadata object.
 */
export async function getRun(runId: string): Promise<RunResult> {
  return apiFetch<RunResult>(`/api/pipeline/run/${encodeURIComponent(runId)}`);
}

/**
 * Get the URL for streaming a run's output file content.
 * Receives `runId` and `filename` from `OutputViewer` when loading an output tab.
 * Constructs and returns the full backend URL (`GET /api/pipeline/run/{runId}/file/{filename}`) to `OutputViewer`.
 */
export function getRunFileUrl(runId: string, filename: string): string {
  return `${BASE_URL}/api/pipeline/run/${encodeURIComponent(runId)}/file/${encodeURIComponent(filename)}`;
}

/**
 * Health check.
 * Receives no arguments; called by frontend status checks to verify backend connectivity.
 * Queries `GET /api/health` and returns `{ status: string }` to the caller.
 */
export async function checkHealth(): Promise<{ status: string }> {
  return apiFetch<{ status: string }>("/api/health");
}
