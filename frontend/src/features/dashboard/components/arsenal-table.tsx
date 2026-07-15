import type { ArsenalRow } from "@/lib/report";
import { pitchColor } from "@/lib/pitch-colors";
import { ChartCard } from "./chart-card";

/**
 * The arsenal table — one row per pitch type with the full per-pitch profile.
 * It is both the analytical backbone and the "table view" the data-viz method
 * requires as the accessible fallback for the colour-coded charts.
 */
export function ArsenalTable({ arsenal }: { arsenal: ArsenalRow[] }) {
  const cols: { key: keyof ArsenalRow; label: string; fmt: (v: any) => string }[] = [
    { key: "usage_pct", label: "Usage", fmt: (v) => pct(v) },
    { key: "avg_velocity", label: "Velo", fmt: (v) => num(v, 1) },
    { key: "max_velocity", label: "Max", fmt: (v) => num(v, 1) },
    { key: "avg_spin", label: "Spin", fmt: (v) => num(v, 0) },
    { key: "avg_spin_efficiency", label: "Spin eff.", fmt: (v) => pct(v) },
    { key: "avg_vb", label: "VB", fmt: (v) => num(v, 1) },
    { key: "avg_hb", label: "HB", fmt: (v) => num(v, 1) },
    { key: "strike_pct", label: "Strike", fmt: (v) => pct(v) },
    { key: "avg_extension", label: "Ext.", fmt: (v) => num(v, 1) },
  ];

  return (
    <ChartCard
      title="Arsenal"
      description="Per-pitch-type summary. Sortable at a glance; the complete profile behind every chart above."
    >
      <div className="-mx-1 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left">
              <Th className="pl-1">Pitch</Th>
              <Th className="text-right">N</Th>
              {cols.map((c) => (
                <Th key={String(c.key)} className="text-right">
                  {c.label}
                </Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {arsenal.map((row) => (
              <tr
                key={row.pitch_type}
                className="border-b border-line/60 last:border-0 hover:bg-paper/50"
              >
                <td className="py-2.5 pl-1">
                  <span className="inline-flex items-center gap-2 font-medium text-ink">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: pitchColor(row.pitch_type) }}
                    />
                    {row.pitch_type}
                  </span>
                </td>
                <td className="py-2.5 text-right font-mono tabular-nums text-ink">
                  {row.count}
                </td>
                {cols.map((c) => (
                  <td
                    key={String(c.key)}
                    className="py-2.5 text-right font-mono tabular-nums text-ink-soft"
                  >
                    {c.fmt(row[c.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ChartCard>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={`pb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-soft ${className}`}
    >
      {children}
    </th>
  );
}

const num = (v: number | null, d: number) =>
  v == null ? "—" : v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
const pct = (v: number | null) => (v == null ? "—" : `${Math.round(v)}%`);
