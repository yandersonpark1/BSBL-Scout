import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import type { ArsenalRow } from "@/lib/report";
import { CHART, pitchColor } from "@/lib/pitch-colors";
import { ChartCard } from "./chart-card";

type MetricKey = "strike_pct" | "avg_spin_efficiency";

/**
 * A compact horizontal bar panel ranking pitch types by a single 0–100 percent
 * metric. One measure, one axis. Bars are coloured by pitch identity (colour
 * follows the entity) and each bar carries a direct value label, so no legend is
 * needed — the category axis names every bar.
 */
export function MetricBars({
  title,
  description,
  arsenal,
  metric,
}: {
  title: string;
  description: string;
  arsenal: ArsenalRow[];
  metric: MetricKey;
}) {
  const data = arsenal
    .map((r) => ({ pitch_type: r.pitch_type, value: r[metric] }))
    .filter((r): r is { pitch_type: string; value: number } => r.value != null)
    .sort((a, b) => b.value - a.value);

  const height = Math.max(140, data.length * 46);

  return (
    <ChartCard title={title} description={description}>
      {data.length === 0 ? (
        <Empty />
      ) : (
        <div style={{ height }} className="w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 4, right: 44, bottom: 4, left: 8 }}
              barCategoryGap="28%"
            >
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis
                type="category"
                dataKey="pitch_type"
                width={78}
                tickLine={false}
                axisLine={false}
                tick={{ fill: CHART.ink, fontSize: 12, fontFamily: CHART.mono }}
              />
              <Bar dataKey="value" radius={[4, 4, 4, 4]} isAnimationActive={false}>
                {data.map((d) => (
                  <Cell key={d.pitch_type} fill={pitchColor(d.pitch_type)} />
                ))}
                <LabelList
                  dataKey="value"
                  position="right"
                  formatter={(v: number) => `${Math.round(v)}%`}
                  style={{ fill: CHART.inkSoft, fontSize: 12, fontFamily: CHART.mono }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}

function Empty() {
  return (
    <div className="flex h-[140px] items-center justify-center text-sm text-ink-soft">
      No data available for this metric.
    </div>
  );
}
