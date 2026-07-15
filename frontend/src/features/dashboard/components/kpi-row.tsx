import type { ReactNode } from "react";
import type { SummaryKpis } from "@/lib/report";

/**
 * The headline KPI row — stat tiles, not a chart (a handful of scalar numbers is
 * a KPI row per the form heuristic). Each tile carries an icon, a large
 * proportional figure, and a context sub-label. Missing metrics render an em dash
 * rather than 0. There is no period-over-period delta: one upload is one session.
 */

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

interface Tile {
  label: string;
  value: string;
  sub?: string;
  icon: ReactNode;
}

export function KpiRow({ summary }: { summary: SummaryKpis }) {
  const tiles: Tile[] = [
    {
      label: "Tracked pitches",
      value: fmt(summary.tracked_pitches, 0),
      sub: "this session",
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4" {...stroke}>
          <circle cx="12" cy="12" r="9" />
          <path d="M8 12h8M12 8v8" />
        </svg>
      ),
    },
    {
      label: "Strike %",
      value: summary.strike_pct == null ? "—" : `${fmt(summary.strike_pct, 0)}`,
      sub: summary.strike_pct == null ? undefined : "% in zone / called",
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4" {...stroke}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      ),
    },
    {
      label: "Peak velocity",
      value: summary.peak_velocity == null ? "—" : `${fmt(summary.peak_velocity, 1)}`,
      sub:
        summary.peak_velocity == null
          ? "mph"
          : `mph${summary.peak_velocity_pitch ? ` · ${summary.peak_velocity_pitch}` : ""}`,
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4" {...stroke}>
          <path d="M3 17 9 11l4 4 8-9" />
          <path d="M17 6h4v4" />
        </svg>
      ),
    },
    {
      label: "Avg velocity",
      value: summary.avg_velocity == null ? "—" : `${fmt(summary.avg_velocity, 1)}`,
      sub: "mph",
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4" {...stroke}>
          <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
          <path d="M12 12 8 8" />
          <path d="M4.2 16a9 9 0 1 1 15.6 0" />
        </svg>
      ),
    },
    {
      label: "Arsenal",
      value: fmt(summary.pitch_type_count, 0),
      sub: summary.pitch_type_count === 1 ? "pitch type" : "pitch types",
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4" {...stroke}>
          <path d="M12 3 3 8l9 5 9-5-9-5z" />
          <path d="M3 13l9 5 9-5" />
        </svg>
      ),
    },
    {
      label: "Avg spin eff.",
      value:
        summary.avg_spin_efficiency == null
          ? "—"
          : `${fmt(summary.avg_spin_efficiency, 0)}`,
      sub: summary.avg_spin_efficiency == null ? undefined : "% active spin",
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4" {...stroke}>
          <path d="M21 12a9 9 0 1 1-3-6.7" />
          <path d="M21 4v4h-4" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      {tiles.map((t) => (
        <div
          key={t.label}
          className="rounded-2xl border border-line bg-surface p-4 transition-colors hover:border-lime/30"
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
              {t.label}
            </p>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-lime-wash text-accent">
              {t.icon}
            </span>
          </div>
          <p className="mt-3 flex items-baseline gap-1">
            <span className="font-display text-4xl leading-none tracking-tight text-ink">
              {t.value}
            </span>
          </p>
          {t.sub && <p className="mt-1.5 text-xs text-ink-soft">{t.sub}</p>}
        </div>
      ))}
    </div>
  );
}

function fmt(value: number, digits: number): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}
