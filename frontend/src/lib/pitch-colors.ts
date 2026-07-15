/**
 * Pitch-type colour system + chart chrome tokens.
 *
 * Colours come from the data-viz skill's validated categorical ramp (CVD-safe,
 * worst adjacent ΔE 24.2 on this app's warm surface). Each pitch type is pinned
 * to a FIXED slot in canonical order, so a pitch keeps one colour no matter how
 * many types appear or how often it was thrown — colour follows the entity,
 * never its rank. Two slots (Sinker/aqua, Cutter/yellow) fall below 3:1 contrast,
 * which is why every chart ships a legend + the arsenal table (the relief rule).
 */

// Canonical pitch order → colour slot. Do not reorder: the order is the
// CVD-safety mechanism, not cosmetic.
export const PITCH_COLORS: Record<string, string> = {
  Fastball: "#2a78d6", // slot 1 · blue
  Sinker: "#1baf7a", // slot 2 · aqua
  Cutter: "#eda100", // slot 3 · yellow
  Slider: "#008300", // slot 4 · green
  Curveball: "#4a3aa7", // slot 5 · violet
  Changeup: "#e34948", // slot 6 · red
  Splitter: "#e87ba4", // slot 7 · magenta
  Knuckleball: "#eb6834", // slot 8 · orange
};

// Neutral for any pitch type outside the canonical set ("Other").
export const OTHER_COLOR = "#8a8272";

export function pitchColor(pitchType: string): string {
  return PITCH_COLORS[pitchType] ?? OTHER_COLOR;
}

/**
 * Chart chrome, referenced by role (never as raw hex scattered through the
 * components). Each value points at a semantic CSS token from index.css, so the
 * chrome follows the active theme automatically: SVG stroke/fill and React
 * inline styles both resolve `var(--…)` live, with no re-render needed on a
 * theme flip. The pitch-type ramp above stays fixed — only the chrome is
 * theme-aware.
 */
export const CHART = {
  surface: "var(--color-surface)", // card surface (dot outlines)
  ink: "var(--color-ink)", // primary text / crosshairs
  inkSoft: "var(--color-ink-soft)", // secondary text / axis labels
  grid: "var(--color-line)", // hairline gridlines
  axis: "var(--color-line-strong)", // baseline / reference lines
  strike: "#3fae6b", // status:good — in-zone / strike (reads on both themes)
  ball: "var(--color-blush)", // ball / out of zone
  font: '"Inter", ui-sans-serif, system-ui, sans-serif',
  mono: '"IBM Plex Mono", ui-monospace, monospace',
} as const;
