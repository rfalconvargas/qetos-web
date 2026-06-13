/**
 * Local-first storage helpers for the Qetos MVP.
 * Everything is namespaced under `qetos:` and SSR-safe (no-ops on the server).
 */
const PREFIX = "qetos:";

export function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage full or unavailable — fail quietly, this is a calm app */
  }
}

export function removeKey(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch {
    /* no-op */
  }
}

/* ---- Domain-specific shapes ---------------------------------------- */

export type Victory = {
  id: string;
  kind: string;
  difficulty?: string;
  helped?: string;
  at: number; // epoch ms
};

export const VICTORIES_KEY = "victories";

/** A day is unmarked, or one of three equally-valid kinds of showing up. */
export type DayMark = "momentum" | "reset" | "reflection" | null;

export type ResetState = {
  experiment: string;
  startedAt: number;
  days: DayMark[]; // length 30
};

export const RESET_KEY = "reset";
