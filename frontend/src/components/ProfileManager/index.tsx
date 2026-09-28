"use client";

/**
 * ProfileManager — toolbar for switching, saving, and deleting config profiles.
 */

import { useEffect, useState } from "react";
import { deleteProfile, listProfiles } from "@/lib/api";

interface Props {
  currentProfile: string;
  onSwitch: (name: string) => void;
  onSaveAs: (name: string) => void;
  /** Optional: if provided, a "⬇ Download Settings" button is rendered */
  onDownload?: () => void;
}

export default function ProfileManager({ currentProfile, onSwitch, onSaveAs, onDownload }: Props) {
  const [profiles, setProfiles] = useState<string[]>([]);
  const [isSaveAsOpen, setIsSaveAsOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const refresh = () => {
    listProfiles().then(setProfiles).catch(console.error);
  };

  useEffect(() => { refresh(); }, [currentProfile]);

  const handleSaveAs = async () => {
    const name = newName.trim().toLowerCase().replace(/\s+/g, "_");
    if (!name) return;
    await onSaveAs(name);
    setIsSaveAsOpen(false);
    setNewName("");
    refresh();
  };

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
