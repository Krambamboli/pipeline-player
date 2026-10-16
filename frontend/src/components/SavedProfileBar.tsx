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
 * SavedProfileBar
 * ---------------
 * Compact bar to load / save / save-as / delete a saved profile of a given
 * kind (chunk or colpali). Used on the Chunk page and the ColPali page so
 * that proven settings can later be selected in the RAG Tester.
 *
 * Selecting a profile in the dropdown loads it immediately via `onLoad`.
 * "Save" overwrites the selected profile, or asks for a name when no profile
 * is selected yet. "Save as new…" always asks for a (new) name.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ProfileKind,
  deleteSavedProfile,
  listSavedProfiles,
  loadSavedProfile,
  saveSavedProfile,
} from "@/lib/profiles";

/**
 * Props received by `SavedProfileBar<T>` from the `/chunk` or `/colpali` page.
 * Specifies the profile `kind` (`"chunk"` or `"colpali"`), `getCurrent` snapshot getter, `onLoad` callback for applying loaded profiles, and optional `disabled` state.
 */
interface Props<T> {
  kind: ProfileKind;
  /** Returns the current settings to persist. */
  getCurrent: () => T;
  /** Called with the loaded profile data. */
  onLoad: (data: T) => void;
  disabled?: boolean;
}

/**
 * Reusable profile management toolbar for Step 2 Chunk (`kind="chunk"`) and ColPali (`kind="colpali"`) configurations.
 * Receives `Props<T>` from the `/chunk` or `/colpali` page.
 * Renders a profile selector dropdown and Save / Save-as-new / Delete controls backed by `/api/profiles/{kind}`, emitting loaded profile objects to the parent page via `onLoad`.
 */
export default function SavedProfileBar<T extends object>({ kind, getCurrent, onLoad, disabled }: Props<T>) {
  const [profiles, setProfiles] = useState<string[]>([]);
  const [selected, setSelected] = useState("");
  const [isSaveAs, setIsSaveAs] = useState(false);
  const [newName, setNewName] = useState("");
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const flashTimerRef = useRef<number | null>(null);

  // Show a short status message that disappears after 3s, clearing any prior timer
  /**
   * Displays a transient 3-second status or error banner in `SavedProfileBar`.
   * Receives `text` and optional `isError` flag from internal profile actions (`refresh`, `handleSelect`, `save`, `handleDelete`) and updates `message` state.
   */
  const flash = useCallback((text: string, isError = false) => {
    setMessage({ text, isError });
    if (flashTimerRef.current !== null) {
      window.clearTimeout(flashTimerRef.current);
    }
    flashTimerRef.current = window.setTimeout(() => {
      setMessage(null);
      flashTimerRef.current = null;
    }, 3000);
  }, []);

  /**
   * Fetches the latest saved profile names for `kind` via `listSavedProfiles(kind)`.
   * Updates `profiles` state in `SavedProfileBar` or displays an error via `flash`.
   */
  const refresh = useCallback(async () => {
    try {
      setProfiles(await listSavedProfiles(kind));
    } catch (e) {
      flash(`Could not list profiles: ${(e as Error).message}`, true);
    }
  }, [kind, flash]);

  useEffect(() => {
    let active = true;
    listSavedProfiles(kind)
      .then((list) => {
        if (active) setProfiles(list);
      })
      .catch((e) => {
        if (active) flash(`Could not list profiles: ${(e as Error).message}`, true);
      });
    return () => {
      active = false;
      if (flashTimerRef.current !== null) {
        window.clearTimeout(flashTimerRef.current);
      }
    };
  }, [kind, flash]);

  // Load a profile as soon as it is selected
  /**
   * Loads the selected profile `name` from the backend via `loadSavedProfile` when the dropdown changes.
   * Passes the loaded configuration `T` up to the parent page via `onLoad`.
   */
  const handleSelect = async (name: string) => {
    setSelected(name);
    if (!name) return;
    try {
      onLoad(await loadSavedProfile<T>(kind, name));
      flash(`Loaded '${name}'`);
    } catch (e) {
      flash((e as Error).message, true);
    }
  };

  /**
   * Persists the current page settings (`getCurrent()`) under `name` via `saveSavedProfile`.
   * Refreshes the profile list, selects `name`, and returns `true` on success or `false` on error.
   */
  const save = async (name: string) => {
    try {
      await saveSavedProfile(kind, name, getCurrent());
      await refresh();
      setSelected(name);
      flash(`Saved '${name}'`);
      return true;
    } catch (e) {
      flash((e as Error).message, true);
      return false;
    }
  };

  /**
   * Validates `newName`, prompts for overwrite confirmation if needed, and saves a new profile via `save`.
   * Triggered by the Save-as confirm button or Enter key in `SavedProfileBar`.
   */
  const handleSaveAs = async () => {
    const name = newName.trim();
    if (!name) return;
    if (profiles.includes(name) && !window.confirm(`Overwrite existing profile '${name}'?`)) return;
    if (await save(name)) {
      setIsSaveAs(false);
      setNewName("");
    }
  };

  /**
   * Confirms and deletes the currently `selected` profile via `deleteSavedProfile(kind, selected)`.
   * Clears `selected` state and refreshes the dropdown list.
   */
  const handleDelete = async () => {
    if (!selected || !window.confirm(`Delete profile '${selected}'?`)) return;
    try {
      await deleteSavedProfile(kind, selected);
      flash(`Deleted '${selected}'`);
      setSelected("");
      await refresh();
    } catch (e) {
      flash((e as Error).message, true);
    }
  };

  // "Save": overwrite the selected profile, otherwise ask for a name first
  /**
   * Overwrites the currently `selected` profile via `save(selected)`, or opens the Save-as name input if no profile is selected.
   * Triggered by clicking the primary Save button in `SavedProfileBar`.
   */
  const handleSave = () => {
    if (selected) {
      save(selected);
    } else {
      setNewName("");
      setIsSaveAs(true);
    }
  };

  const label = kind === "chunk" ? "Chunk profile" : "ColPali profile";

  return (
    <div className="saved-profile-bar">
      <div className="saved-profile-bar__head">
        <span className="saved-profile-bar__label">💾 {label}</span>
        <span className="saved-profile-bar__hint">selectable in 🧪 RAG Tester</span>
      </div>
      <div className="saved-profile-bar__row">
        {isSaveAs ? (
          <>
            <input
              id={`${kind}-profile-name-input`}
              className="input"
              autoFocus
              placeholder="profile name, e.g. biopsych-512"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveAs();
                if (e.key === "Escape") setIsSaveAs(false);
              }}
              style={{ flex: 1 }}
            />
            <button
              id={`${kind}-profile-confirm-btn`}
              className="btn-icon"
              onClick={handleSaveAs}
              disabled={!newName.trim()}
              title="Save"
            >
              ✓
            </button>
            <button className="btn-icon" onClick={() => setIsSaveAs(false)} title="Cancel">✕</button>
          </>
        ) : (
          <>
            <select
              id={`${kind}-profile-select`}
              className="select"
              value={selected}
              disabled={disabled}
              onChange={(e) => handleSelect(e.target.value)}
              style={{ flex: 1 }}
            >
              <option value="">{profiles.length ? "— load saved profile —" : "— no saved profiles —"}</option>
              {profiles.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <button
              id={`${kind}-profile-delete-btn`}
              className="btn-icon"
              disabled={disabled || !selected}
              onClick={handleDelete}
              title="Delete selected profile"
            >
              🗑
            </button>
          </>
        )}
      </div>
      {/* Clearly labelled save actions (hidden while the name input is open) */}
      {!isSaveAs && (
        <div className="saved-profile-bar__actions">
          <button
            id={`${kind}-profile-save-btn`}
            className="saved-profile-bar__btn saved-profile-bar__btn--primary"
            disabled={disabled}
            onClick={handleSave}
            title={selected ? `Overwrite '${selected}' with the current settings` : "Save the current settings as a profile"}
          >
            💾 {selected ? `Save “${selected}”` : "Save settings"}
          </button>
          <button
            id={`${kind}-profile-saveas-btn`}
            className="saved-profile-bar__btn"
            disabled={disabled}
            onClick={() => { setNewName(selected ? `${selected}-copy` : ""); setIsSaveAs(true); }}
            title="Save the current settings under a new name"
          >
            ＋ Save as new…
          </button>
        </div>
      )}
      {message && (
        <div className={`saved-profile-bar__msg ${message.isError ? "saved-profile-bar__msg--error" : ""}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}
