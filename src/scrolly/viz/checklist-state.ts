/**
 * Persisted state for the interactive checklist viz.
 *
 * Extracted from `checklist.ts` so the load/save logic is pure and unit-testable
 * with an injectable storage object (no global `localStorage` / DOM coupling).
 *
 * The item shape lives in `props.schema.ts` (single source of truth for the zod
 * contract and the renderer's prop type); re-exported here so this module and
 * its tests keep importing from here.
 */
import type { ChecklistItem } from '../props.schema';

export type { ChecklistItem };

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const CHECKLIST_STORAGE_PREFIX = 'scrolly-checklist:';

export function checklistStorageKey(mountId: string): string {
  return `${CHECKLIST_STORAGE_PREFIX}${mountId}`;
}

/** Read persisted done-state; falls back to the static props when storage is
 * empty, corrupt, or length-mismatched (props changed since last save). */
export function loadChecklistState(
  key: string,
  fallback: ChecklistItem[],
  storage: StorageLike,
): boolean[] {
  try {
    const raw = storage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length === fallback.length) {
        return parsed.map((v) => Boolean(v));
      }
    }
  } catch {
    /* ignore corrupt storage */
  }
  return fallback.map((i) => i.done);
}

export function saveChecklistState(key: string, state: boolean[], storage: StorageLike): void {
  try {
    storage.setItem(key, JSON.stringify(state));
  } catch {
    /* storage may be unavailable (private mode) — keep session-only state */
  }
}
