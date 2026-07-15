import type { PitchingReport } from "@/lib/report";

/**
 * The report lives only on the client (the backend keeps nothing). We stash the
 * most recent one in sessionStorage so a page refresh on /dashboard doesn't lose
 * it. Cleared when the tab closes — nothing is persisted long-term.
 */
const KEY = "bsbl:last-report";

export function saveReport(report: PitchingReport): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(report));
  } catch {
    /* storage may be unavailable (private mode, quota) — non-fatal */
  }
}

export function loadReport(): PitchingReport | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PitchingReport) : null;
  } catch {
    return null;
  }
}

export function clearReport(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
