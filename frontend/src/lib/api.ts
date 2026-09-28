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
 * Typed API helpers for communicating with the FastAPI backend.
 * Base URL is configurable via NEXT_PUBLIC_API_URL env var.
 */

import { PipelineConfig, RunResult } from "@/types/config";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ---------------------------------------------------------------------------
// Generic fetch helper
// ---------------------------------------------------------------------------

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

/** List all saved profile names. */
export async function listProfiles(): Promise<string[]> {
  return apiFetch<string[]>("/api/config/profiles");
}

/** Load a config profile by name. */
export async function loadProfile(name: string): Promise<PipelineConfig> {
  return apiFetch<PipelineConfig>(`/api/config/${encodeURIComponent(name)}`);
}

/** Save (immediately write) a config profile. Called on every UI change. */
export async function saveProfile(name: string, config: PipelineConfig): Promise<PipelineConfig> {
  return apiFetch<PipelineConfig>(`/api/config/${encodeURIComponent(name)}`, {
    method: "PUT",
    body: JSON.stringify(config),
  });
}

/** Save the current config as a new profile (Save As). */
export async function saveAsProfile(config: PipelineConfig): Promise<PipelineConfig> {
  return apiFetch<PipelineConfig>("/api/config/save-as", {
    method: "POST",
    body: JSON.stringify(config),
  });
}

/** Delete a config profile. */
export async function deleteProfile(name: string): Promise<void> {
  await apiFetch<void>(`/api/config/${encodeURIComponent(name)}`, {
    method: "DELETE",
  });
}

// ---------------------------------------------------------------------------
// Pipeline API
// ---------------------------------------------------------------------------

/** List all past run results. */
export async function listRuns(): Promise<RunResult[]> {
  return apiFetch<RunResult[]>("/api/pipeline/runs");
}

export interface DocumentInfo {
  filename: string;
  estimated_seconds: number;
}

/** List available documents for parsing. */
export async function listDocuments(): Promise<DocumentInfo[]> {
  return apiFetch<DocumentInfo[]>("/api/pipeline/documents");
}

/** Get a specific run result by ID. */
export async function getRun(runId: string): Promise<RunResult> {
  return apiFetch<RunResult>(`/api/pipeline/run/${encodeURIComponent(runId)}`);
}

/** Get the URL for streaming a run's output file content. */
export function getRunFileUrl(runId: string, filename: string): string {
  return `${BASE_URL}/api/pipeline/run/${encodeURIComponent(runId)}/file/${encodeURIComponent(filename)}`;
}

/** Health check. */
export async function checkHealth(): Promise<{ status: string }> {
  return apiFetch<{ status: string }>("/api/health");
}
