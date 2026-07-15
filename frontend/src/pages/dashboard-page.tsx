import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import type { PitchingReport } from "@/lib/report";
import { loadReport } from "@/features/analysis/report-storage";
import ThemeToggle from "@/components/theme-toggle";
import { DashboardSidebar } from "@/features/dashboard/components/dashboard-sidebar";
import { KpiRow } from "@/features/dashboard/components/kpi-row";
import { PitchMix } from "@/features/dashboard/components/pitch-mix";
import { StatGauge } from "@/features/dashboard/components/stat-gauge";
import { ArsenalTable } from "@/features/dashboard/components/arsenal-table";
import { MovementChart } from "@/features/dashboard/components/movement-chart";
import { VelocityTrendChart } from "@/features/dashboard/components/velocity-trend-chart";
import { LocationChart } from "@/features/dashboard/components/location-chart";
import { MetricBars } from "@/features/dashboard/components/metric-bars";

const STRIKE_TARGET = 65; // a reasonable session strike-rate goal, for the gauge

/**
 * The dashboards page. The report arrives via router state (freshest) or the
 * sessionStorage backup (so a refresh survives). There is no server round-trip
 * here — everything is computed once at upload and rendered from that payload.
 *
 * Layout: a fixed left rail of section links, a slim sticky top bar, then a
 * KPI overview and a two-column card grid, with the wide movement/location
 * scenes full-width below.
 */
export default function DashboardPage() {
  const location = useLocation();
  const [report, setReport] = useState<PitchingReport | null>(
    (location.state as { report?: PitchingReport } | null)?.report ?? null,
  );
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!report) setReport(loadReport());
  }, [report]);

  if (!report) return <EmptyState />;

  const exportReport = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const base = (report.meta.player_name ?? "kineo-report")
      .trim()
      .replace(/\s+/g, "-")
      .toLowerCase();
    a.download = `${base}-report.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-paper text-ink">
      <DashboardSidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
      />

      <div
        className={`flex min-h-screen flex-col transition-[padding] duration-200 ${
          collapsed ? "lg:pl-[76px]" : "lg:pl-64"
        }`}
      >
        {/* Slim sticky top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-paper/80 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 lg:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-lime">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
                <circle cx="12" cy="12" r="9" stroke="var(--color-lime-ink)" strokeWidth="2" />
              </svg>
            </span>
            <span className="font-display text-xl leading-none text-ink">Kineo</span>
          </Link>
          <span className="hidden text-sm font-medium text-ink-soft lg:block">
            Dashboard
          </span>
          <div className="ml-auto flex items-center gap-3">
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 px-4 pb-14 sm:px-6 lg:px-8">
          <DashboardHeader report={report} onExport={exportReport} />

          {/* Overview KPIs */}
          <section id="overview" className="mt-6 scroll-mt-24">
            <KpiRow summary={report.summary} />
          </section>

          {/* Main two-column grid */}
          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
            {/* Left (wider) */}
            <div className="flex flex-col gap-4 xl:col-span-2">
              <section id="velocity" className="scroll-mt-24">
                <VelocityTrendChart series={report.velocity_series} />
              </section>
              <PitchMix arsenal={report.arsenal} />
              <section id="arsenal" className="scroll-mt-24">
                <ArsenalTable arsenal={report.arsenal} />
              </section>
            </div>

            {/* Right (narrower) */}
            <div className="flex flex-col gap-4">
              <section id="command" className="scroll-mt-24">
                <MetricBars
                  title="Command by pitch"
                  description="Strike rate for each pitch type."
                  arsenal={report.arsenal}
                  metric="strike_pct"
                />
              </section>
              <StatGauge
                value={report.summary.strike_pct}
                target={STRIKE_TARGET}
                label="Strike rate"
                caption={
                  report.summary.strike_pct == null
                    ? "No called/zone data in this file"
                    : `Target ${STRIKE_TARGET}% for the session`
                }
              />
              <MetricBars
                title="Spin efficiency"
                description="Active-spin share by pitch type."
                arsenal={report.arsenal}
                metric="avg_spin_efficiency"
              />
            </div>
          </div>

          {/* Wide scenes, full width */}
          <section id="movement" className="mt-4 scroll-mt-24">
            <MovementChart points={report.movement} />
          </section>
          <section id="location" className="mt-4 scroll-mt-24">
            <LocationChart points={report.location} />
          </section>
        </main>
      </div>
    </div>
  );
}

function DashboardHeader({
  report,
  onExport,
}: {
  report: PitchingReport;
  onExport: () => void;
}) {
  const { meta } = report;
  const session = useMemo(
    () => formatSession(meta.first_pitch_at, meta.last_pitch_at),
    [meta.first_pitch_at, meta.last_pitch_at],
  );

  return (
    <header className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <span className="text-[12px] font-semibold uppercase tracking-[0.15em] text-accent">
          Pitching report
        </span>
        <h1 className="mt-2 font-display text-5xl leading-none tracking-tight text-ink">
          {meta.player_name ?? "Pitcher"}
        </h1>
        <p className="mt-2 text-[14px] text-ink-soft">
          {[
            meta.player_id && `ID ${meta.player_id}`,
            session,
            `${meta.tracked_pitches} tracked pitches`,
          ]
            .filter(Boolean)
            .join("  ·  ")}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {session && (
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-[13px] font-medium text-ink-soft">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="17" rx="2" />
              <path d="M3 9h18M8 2v4M16 2v4" />
            </svg>
            {session}
          </span>
        )}
        <Link
          to="/"
          className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line-strong bg-surface px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-lime/50"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New upload
        </Link>
        <button
          type="button"
          onClick={onExport}
          className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-lime px-4 py-2 text-sm font-semibold text-lime-ink shadow-[0_8px_24px_-8px_rgba(201,242,77,0.6)] transition-all hover:bg-lime-bright"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <path d="M7 10l5 5 5-5" />
            <path d="M12 15V3" />
          </svg>
          Export
        </button>
      </div>
    </header>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center text-ink">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime">
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
          <circle cx="12" cy="12" r="9" stroke="var(--color-lime-ink)" strokeWidth="2" />
          <path
            d="M6 6 C 12 10, 12 14, 18 18 M18 6 C 12 10, 12 14, 6 18"
            stroke="var(--color-lime-ink)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <h1 className="mt-6 font-display text-4xl tracking-tight text-ink">
        No report loaded
      </h1>
      <p className="mt-3 max-w-sm text-ink-soft">
        Upload a Rapsodo pitching CSV to build your dashboards.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-full bg-lime px-6 py-2.5 font-semibold text-lime-ink shadow-[0_8px_24px_-8px_rgba(201,242,77,0.6)] transition-colors hover:bg-lime-bright"
      >
        Go to upload
      </Link>
    </div>
  );
}

function formatSession(first: string | null, last: string | null): string | null {
  const f = first ? new Date(first) : null;
  const l = last ? new Date(last) : null;
  const valid = (d: Date | null): d is Date => d != null && !Number.isNaN(d.getTime());
  const fmt = (d: Date) =>
    d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  if (valid(f) && valid(l)) {
    const a = fmt(f);
    const b = fmt(l);
    return a === b ? a : `${a} – ${b}`;
  }
  if (valid(f)) return fmt(f);
  if (valid(l)) return fmt(l);
  return null;
}
