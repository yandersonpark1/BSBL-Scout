import type { ArsenalRow } from "@/lib/report";
import { pitchColor } from "@/lib/pitch-colors";

/**
 * Compact "pitch mix" panel — the most-thrown pitch types as segments, each with
 * its count, usage share, and a colour rule in the pitch's identity colour. A
 * quick-glance companion to the full arsenal table below it.
 */
export function PitchMix({ arsenal }: { arsenal: ArsenalRow[] }) {
  const top = [...arsenal].sort((a, b) => b.count - a.count).slice(0, 4);

  if (top.length === 0) return null;

  return (
    <section className="rounded-3xl border border-line bg-surface p-6">
      <div className="mb-4">
        <h3 className="font-display text-xl leading-snug tracking-tight text-ink">
          Pitch mix
        </h3>
        <p className="mt-0.5 text-sm leading-snug text-ink-soft">
          Most-thrown pitch types this session.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {top.map((r) => {
          const color = pitchColor(r.pitch_type);
          return (
            <div
              key={r.pitch_type}
              className="overflow-hidden rounded-2xl border border-line bg-surface-2/40 p-4"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="truncate text-[12px] font-medium text-ink-soft">
                  {r.pitch_type}
                </span>
              </div>
              <p className="mt-3 font-display text-3xl leading-none tracking-tight text-ink">
                {r.count.toLocaleString()}
              </p>
              <p className="mt-1 font-mono text-[11px] text-ink-soft">
                {Math.round(r.usage_pct)}% usage
              </p>
              <span
                className="mt-3 block h-1 rounded-full"
                style={{ backgroundColor: color }}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
