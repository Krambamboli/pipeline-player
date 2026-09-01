"use client";

/**
 * useConfig hook
 * ---------------
 * Manages the active PipelineConfig state with:
 * - Optimistic local updates (instant UI feedback)
 * - Debounced (300ms) automatic persistence to the backend on every change
 * - Save-As / profile switching
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { loadProfile, saveAsProfile, saveProfile } from "@/lib/api";
import type { PipelineConfig } from "@/types/config";

/**
 * Recursively sets a value at a dot-notation path on an object.
 * e.g. setPath(obj, "pdf_options.do_ocr", true)
 * No external dependencies — pure TypeScript.
 */
function setPath(obj: Record<string, unknown>, path: string, value: unknown): void {
  const keys = path.split(".");
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (current[keys[i]] == null || typeof current[keys[i]] !== "object") {
      current[keys[i]] = {};
    }
    current = current[keys[i]] as Record<string, unknown>;
  }
  current[keys[keys.length - 1]] = value;
}

const DEBOUNCE_MS = 300;

interface UseConfigReturn {
  config: PipelineConfig | null;
  isSaving: boolean;
  isLoading: boolean;
  error: string | null;
  /** Update a nested field using lodash path syntax e.g. "pdf_options.do_ocr" */
  updateField: (path: string, value: unknown) => void;
  /** Load a different profile by name */
  switchProfile: (name: string) => Promise<void>;
  /** Save current config as a new profile */
  saveAs: (newName: string) => Promise<void>;
}

export function useConfig(initialProfileName = "default"): UseConfigReturn {
  const [config, setConfig] = useState<PipelineConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce timer ref
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Keep latest config in a ref so the debounced callback always has fresh state
  const latestConfig = useRef<PipelineConfig | null>(null);

  // ── Initial load ────────────────────────────────────────────────────────
  useEffect(() => {
    switchProfile(initialProfileName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProfileName]);

  // ── Switch profile ───────────────────────────────────────────────────────
  const switchProfile = useCallback(async (name: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const loaded = await loadProfile(name);
      setConfig(loaded);
      latestConfig.current = loaded;
    } catch (e) {
      setError(`Failed to load profile "${name}": ${(e as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Field update with debounced persistence ──────────────────────────────
  const updateField = useCallback((path: string, value: unknown) => {
    setConfig((prev) => {
      if (!prev) return prev;
      // Deep clone + set nested field via dot-path
      const next = JSON.parse(JSON.stringify(prev)) as PipelineConfig;
      setPath(next as unknown as Record<string, unknown>, path, value);
      latestConfig.current = next;

      // Debounce the backend write
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(async () => {
        if (!latestConfig.current) return;
        setIsSaving(true);
        try {
          await saveProfile(latestConfig.current.profile_name, latestConfig.current);
        } catch (e) {
          setError(`Auto-save failed: ${(e as Error).message}`);
        } finally {
          setIsSaving(false);
        }
      }, DEBOUNCE_MS);

      return next;
    });
  }, []);

  // ── Save As ──────────────────────────────────────────────────────────────
  const saveAs = useCallback(async (newName: string) => {
    if (!latestConfig.current) return;
    const toSave: PipelineConfig = {
      ...JSON.parse(JSON.stringify(latestConfig.current)),
      profile_name: newName,
    };
    setIsSaving(true);
    try {
      const saved = await saveAsProfile(toSave);
      setConfig(saved);
      latestConfig.current = saved;
    } catch (e) {
      setError(`Save As failed: ${(e as Error).message}`);
    } finally {
      setIsSaving(false);
    }
  }, []);

  return { config, isSaving, isLoading, error, updateField, switchProfile, saveAs };
}
