import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { VelocitySeries } from "@/lib/report";
import { CHART, pitchColor } from "@/lib/pitch-colors";
import { ChartCard } from "@/features/dashboard/components/chart-card";
import { PitchLegendMulti } from "@/features/dashboard/components/pitch-legend-multi";
import { TipRow, TooltipShell } from "@/features/dashboard/components/chart-tooltip";

/**
 * Velocity trend — velocity (y) across each pitch type's own throw order (x),
 * one line per pitch type. The x-axis is a per-type occurrence count (a pitch
 * type's 1st, 2nd, 3rd, ... throw) rather than its position in the overall
 * session, so lines compare each pitch's own progression regardless of how
 * the types were interleaved. Any combination of types can be toggled on.
 */
export function VelocityTrendChart({ series }: { series: VelocitySeries[] }) {
  const types = series.map((s) => s.pitch_type);
  const [selected, setSelected] = useState<string[]>([]);
  const shown = selected.length === 0 ? types : types.filter((t) => selected.includes(t));

  const { rows, yDomain, yTicks, maxOccurrence } = useMemo(() => {
    const byOccurrence = new Map<number, Record<string, number>>();
    let min = Infinity;
    let max = -Infinity;
    let maxOccurrence = 1;
    for (const s of series) {
      // `s.data` is already sorted to just this type's pitches in
      // chronological order, so its index doubles as "the Nth <type> thrown".
      s.data.forEach((pt, i) => {
        const occurrence = i + 1;
        maxOccurrence = Math.max(maxOccurrence, occurrence);
        const row = byOccurrence.get(occurrence) ?? { occurrence };
        row[s.pitch_type] = pt.velocity;
        byOccurrence.set(occurrence, row);
        min = Math.min(min, pt.velocity);
        max = Math.max(max, pt.velocity);
      });
    }
    const rows = [...byOccurrence.values()].sort(
      (a, b) => (a.occurrence as number) - (b.occurrence as number),
    );
    const lo = Number.isFinite(min) ? Math.floor(min / 5) * 5 : 60;
    const hi = Number.isFinite(max) ? Math.ceil(max / 5) * 5 : 100;
    const ticks: number[] = [];
    for (let t = lo; t <= hi; t += 5) ticks.push(t);
    return { rows, yDomain: [lo, hi] as [number, number], yTicks: ticks, maxOccurrence };
  }, [series]);

  return (
    <ChartCard
      title="Velocity trend"
      description="Velocity by pitch type across your outing"
      actions={
        <PitchLegendMulti pitchTypes={types} selected={selected} onChange={setSelected} />
      }
    >
      <div className="h-[380px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 8, right: 24, bottom: 24, left: 4 }}>
            <CartesianGrid stroke={CHART.grid} vertical={false} />
            <XAxis
              dataKey="occurrence"
              type="number"
              domain={[1, maxOccurrence]}
              tickLine={false}
              axisLine={{ stroke: CHART.axis }}
              tick={{ fill: CHART.inkSoft, fontSize: 12, fontFamily: CHART.mono }}
              allowDecimals={false}
              label={{
                value: "Pitch # (by type)",
                position: "insideBottom",
                offset: -14,
                fill: CHART.inkSoft,
                fontSize: 12,
              }}
            />
            <YAxis
              domain={yDomain}
              ticks={yTicks}
              tickLine={false}
              axisLine={{ stroke: CHART.axis }}
              tick={{ fill: CHART.inkSoft, fontSize: 12, fontFamily: CHART.mono }}
              label={{
                value: "Velocity (mph)",
                angle: -90,
                position: "insideLeft",
                offset: 16,
                fill: CHART.inkSoft,
                fontSize: 12,
              }}
            />
            <Tooltip
              cursor={{ stroke: CHART.axis, strokeWidth: 1 }}
              content={({ active: on, payload, label }) => {
                if (!on || !payload?.length) return null;
                return (
                  <TooltipShell title={`Pitch #${label}`}>
                    {payload
                      .filter((it) => it.value != null)
                      .map((it) => (
                        <TipRow
                          key={String(it.dataKey)}
                          label={
                            <span className="inline-flex items-center gap-1.5">
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: pitchColor(String(it.dataKey)) }}
                              />
                              {String(it.dataKey)}
                            </span>
                          }
                          value={`${Number(it.value).toFixed(1)} mph`}
                        />
                      ))}
                  </TooltipShell>
                );
              }}
            />

            {shown.map((t) => (
              <Line
                key={t}
                type="monotone"
                dataKey={t}
                stroke={pitchColor(t)}
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 0, fill: pitchColor(t) }}
                activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
                connectNulls
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
