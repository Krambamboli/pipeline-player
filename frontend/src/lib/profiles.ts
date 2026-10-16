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
 * Saved Profiles API Client
 * -------------------------
 * CRUD for the chunk and ColPali process profiles stored by the backend in
 * configs/chunk/*.yaml and configs/colpali/*.yaml. Docling (Step 1) profiles
 * keep using lib/api.ts (/api/config/...).
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/**
 * Identifier for the saved profile category ("chunk" or "colpali") passed by `SavedProfileBar` and the `/rag-tester` page.
 * Selects which `/api/profiles/{kind}` backend endpoint and YAML directory (`configs/chunk` or `configs/colpali`) is targeted.
 */
export type ProfileKind = "chunk" | "colpali";

/**
 * Throw a readable error for non-2xx responses (uses FastAPI's `detail`).
 * Receives a `Response` object from `fetch` calls within `lib/profiles.ts`.
 * Checks `res.ok`, parses and throws the FastAPI `detail` error message on failure, or returns the valid `Response` to the calling function.
 */
async function check(res: Response): Promise<Response> {
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail ?? detail;
    } catch {
      /* keep statusText */
    }
    throw new Error(detail);
  }
  return res;
}

/**
 * List all saved profile names of a kind.
 * Receives `kind` (`ProfileKind`) from `SavedProfileBar` or the `/rag-tester` page.
 * Queries `GET /api/profiles/{kind}` and returns `string[]` of saved profile names to populate dropdown selectors.
 */
export async function listSavedProfiles(kind: ProfileKind): Promise<string[]> {
  const res = await check(await fetch(`${API_BASE}/api/profiles/${kind}`));
  return res.json();
}

/**
 * Load a saved profile.
 * Receives `kind` (`ProfileKind`) and profile `name` from `SavedProfileBar.handleSelect`.
 * Queries `GET /api/profiles/{kind}/{name}` and returns the deserialized profile object `T` to `SavedProfileBar` (`onLoad`).
 */
export async function loadSavedProfile<T = Record<string, unknown>>(kind: ProfileKind, name: string): Promise<T> {
  const res = await check(await fetch(`${API_BASE}/api/profiles/${kind}/${encodeURIComponent(name)}`));
  return res.json();
}

/**
 * Create or overwrite a saved profile. Returns the validated profile.
 * Receives `kind` (`ProfileKind`), profile `name`, and configuration `data` from `SavedProfileBar.save`.
 * Sends `PUT /api/profiles/{kind}/{name}` to validate and write the YAML profile on the backend, returning the persisted profile `T` to `SavedProfileBar`.
 */
export async function saveSavedProfile<T = Record<string, unknown>>(
  kind: ProfileKind,
  name: string,
  data: object
): Promise<T> {
  const res = await check(
    await fetch(`${API_BASE}/api/profiles/${kind}/${encodeURIComponent(name)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
  );
  return res.json();
}

/**
 * Delete a saved profile.
 * Receives `kind` (`ProfileKind`) and profile `name` from `SavedProfileBar.handleDelete`.
 * Sends `DELETE /api/profiles/{kind}/{name}` to remove the YAML file on the backend and resolves `void` to `SavedProfileBar`.
 */
export async function deleteSavedProfile(kind: ProfileKind, name: string): Promise<void> {
  await check(
    await fetch(`${API_BASE}/api/profiles/${kind}/${encodeURIComponent(name)}`, { method: "DELETE" })
  );
}
