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
 * ProfileManager — toolbar for switching, saving, and deleting config profiles.
 */

import { useEffect, useState } from "react";
import { deleteProfile, listProfiles } from "@/lib/api";

/**
 * Props received by `ProfileManager` from the Step 1 Docling Parser page (`app/page.tsx`).
 * Provides the active `currentProfile` name, `onSwitch` and `onSaveAs` callbacks from `useConfig`, and optional `onDownload` export callback.
 */
interface Props {
  currentProfile: string;
  onSwitch: (name: string) => void;
  onSaveAs: (name: string) => void;
  /** Optional: if provided, a "⬇ Download Settings" button is rendered */
  onDownload?: () => void;
}

/**
 * Toolbar component for switching, saving-as, deleting, and downloading Step 1 Docling configuration profiles.
 * Receives `Props` (`currentProfile`, `onSwitch`, `onSaveAs`, `onDownload`) from the Step 1 page (`app/page.tsx`).
 * Fetches saved profile names via `listProfiles` and renders the profile selector dropdown and action buttons.
 */
export default function ProfileManager({ currentProfile, onSwitch, onSaveAs, onDownload }: Props) {
  const [profiles, setProfiles] = useState<string[]>([]);
  const [isSaveAsOpen, setIsSaveAsOpen] = useState(false);
  const [newName, setNewName] = useState("");

  /**
   * Reloads the list of available Docling profile names from `GET /api/config/profiles` via `listProfiles`.
   * Updates `profiles` state in `ProfileManager`.
   */
  const refresh = () => {
    listProfiles().then(setProfiles).catch(console.error);
  };

  useEffect(() => { refresh(); }, [currentProfile]);

  /**
   * Normalizes `newName` (lowercase, underscores) and invokes `onSaveAs` to create a new Docling profile.
   * Triggered by the Save As confirm button or Enter key; closes the input and refreshes the profile list.
   */
  const handleSaveAs = async () => {
    const name = newName.trim().toLowerCase().replace(/\s+/g, "_");
    if (!name) return;
    await onSaveAs(name);
    setIsSaveAsOpen(false);
    setNewName("");
    refresh();
  };

  /**
   * Deletes the currently selected non-default profile via `deleteProfile` after user confirmation.
   * Triggered by the Delete button; switches back to `"default"` via `onSwitch` and refreshes the profile list.
   */
  const handleDelete = async () => {
    if (currentProfile === "default") return;
    if (!confirm(`Delete profile "${currentProfile}"?`)) return;
    await deleteProfile(currentProfile);
    onSwitch("default");
    refresh();
  };

  return (
    <div className="profile-bar">
      <select
        className="select profile-select"
        value={currentProfile}
        onChange={(e) => onSwitch(e.target.value)}
        title="Switch configuration profile"
      >
        {profiles.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      {/* Save As */}
      {isSaveAsOpen ? (
        <>
          <input
            autoFocus
            className="input"
            style={{ width: 120, padding: "4px 8px", fontSize: "0.78rem" }}
            value={newName}
            placeholder="new-profile"
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSaveAs(); if (e.key === "Escape") setIsSaveAsOpen(false); }}
          />
          <button className="btn-icon" onClick={handleSaveAs} title="Confirm">✓</button>
          <button className="btn-icon" onClick={() => setIsSaveAsOpen(false)} title="Cancel">✕</button>
        </>
      ) : (
        <>
          <button className="btn-icon" onClick={() => setIsSaveAsOpen(true)} title="Save As new profile">
            💾
          </button>
          {currentProfile !== "default" && (
            <button className="btn-icon" onClick={handleDelete} title="Delete profile" style={{ color: "var(--c-error)" }}>
              🗑
            </button>
          )}
          {/* Download current profile as annotated Markdown */}
          {onDownload && (
            <button
              className="btn-icon"
              onClick={onDownload}
              title="Download current profile as annotated Markdown"
              style={{ fontSize: "0.85rem" }}
            >
              ⬇
            </button>
          )}
        </>
      )}
    </div>
  );
}
