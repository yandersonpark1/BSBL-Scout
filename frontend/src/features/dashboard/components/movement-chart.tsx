import { useMemo, useState } from "react";
import {
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import type { MovementPoint } from "@/lib/report";
import { CHART, pitchColor } from "@/lib/pitch-colors";
import { ChartCard } from "./chart-card";
import { PitchLegendMulti } from "./pitch-legend-multi";
import { TipRow, TooltipShell } from "./chart-tooltip";

/**
 * Movement profile — the classic pitch-movement quadrant plot (à la Rapsodo /
 * Baseball Savant): horizontal break (x) vs vertical break (y) in inches, with
 * thick zeroed cross-hairs and colour-by-pitch clusters. A bolded axis frame
 * sits outside the zeroed cross-hairs (with padding so it never crowds the
 * plotted points), and the pitch-type filter is a stacked side panel so any
 * combination of types can be toggled on.
 */
export function MovementChart({ points }: { points: MovementPoint[] }) {
  const [selected, setSelected] = useState<string[]>([]);

  const types = useMemo(
    () => uniqueInOrder(points.map((p) => p.pitch_type)),
    [points],
  );

  // Fixed ±30 in frame — the familiar movement-plot bounds regardless of the
  // session's actual break range.
  const domain = 30;

  const ticks = useMemo(() => {
    const out: number[] = [];
    for (let t = -domain; t <= domain; t += 10) out.push(t);
    return out;
  }, [domain]);

  const shown = (t: string) => selected.length === 0 || selected.includes(t);

  return (
    <ChartCard
      title="Pitch movement"
      description="Right-handed pitcher's perspective: horizontal break vs. vertical break (inches)."
    >
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <div className="relative mx-auto h-[640px] w-full max-w-[720px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 12, right: 16, bottom: 24, left: 4 }}>
              {/* Thick zeroed cross-hairs. */}
              <ReferenceLine x={0} stroke={CHART.ink} strokeWidth={2.5} />
              <ReferenceLine y={0} stroke={CHART.ink} strokeWidth={2.5} />

              <XAxis
                type="number"
                dataKey="hb"
                domain={[-domain, domain]}
                ticks={ticks}
                tickLine={false}
                axisLine={{ stroke: CHART.ink, strokeWidth: 2.5 }}
                tick={{ fill: CHART.inkSoft, fontSize: 12, fontFamily: CHART.mono }}
                label={{
                  value: "Horizontal break (in)",
                  position: "insideBottom",
                  offset: -14,
                  fill: CHART.inkSoft,
                  fontSize: 12,
                }}
              />
              <YAxis
                type="number"
                dataKey="vb"
                domain={[-domain, domain]}
                ticks={ticks}
                tickLine={false}
                axisLine={{ stroke: CHART.ink, strokeWidth: 2.5 }}
                tick={{ fill: CHART.inkSoft, fontSize: 12, fontFamily: CHART.mono }}
                label={{
                  value: "Vertical break (in)",
                  angle: -90,
                  position: "insideLeft",
                  offset: 16,
                  fill: CHART.inkSoft,
                  fontSize: 12,
                }}
              />
              <ZAxis range={[70, 70]} />
              <Tooltip
                cursor={{ strokeDasharray: "3 3", stroke: CHART.axis }}
                content={({ active: on, payload }) => {
                  if (!on || !payload?.length) return null;
                  const p = payload[0].payload as MovementPoint;
                  return (
                    <TooltipShell title={p.pitch_type} accent={pitchColor(p.pitch_type)}>
                      <TipRow label="HB" value={`${p.hb.toFixed(1)} in`} />
                      <TipRow label="VB" value={`${p.vb.toFixed(1)} in`} />
                      {p.velocity != null && (
                        <TipRow label="Velo" value={`${p.velocity.toFixed(1)} mph`} />
                      )}
                    </TooltipShell>
                  );
                }}
              />

              {types.filter(shown).map((t) => (
                <Scatter
                  key={t}
                  data={points.filter((p) => p.pitch_type === t)}
                  fill={pitchColor(t)}
                  fillOpacity={0.78}
                  stroke={CHART.surface}
                  strokeWidth={0.75}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Filter panel, stacked to the side, close against the chart. */}
        <div className="flex shrink-0 items-start justify-center md:w-auto md:justify-start">
          <PitchLegendMulti
            pitchTypes={types}
            selected={selected}
            onChange={setSelected}
            orientation="column"
            size="sm"
          />
        </div>
      </div>
    </ChartCard>
  );
}

function uniqueInOrder(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of values) {
    if (!seen.has(v)) {
      seen.add(v);
      out.push(v);
    }
  }
  return out;
}
