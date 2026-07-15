/**
 * A semicircular tick gauge — the "Repeat Customer Rate" analog, repurposed for a
 * single 0–100% pitching rate (e.g. strike %). Ticks fill from left to right and
 * sweep from green to lime; a subtle marker shows the target. Self-contained card
 * so it drops straight into the dashboard grid.
 */

const GREEN = [47, 158, 96]; // #2f9e60
const LIME = [201, 242, 77]; // #c9f24d

function mix(t: number): string {
  const c = GREEN.map((g, i) => Math.round(g + (LIME[i] - g) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

const N = 44;
const CX = 110;
const CY = 112;
const R_OUT = 100;
const R_IN = 82;

export function StatGauge({
  value,
  target,
  label,
  caption,
  detailsHref = "#arsenal",
}: {
  value: number | null;
  target?: number;
  label: string;
  caption?: string;
  detailsHref?: string;
}) {
  const v = value == null ? 0 : Math.max(0, Math.min(100, value));
  const filledTo = v / 100;
  const targetFrac = target != null ? Math.max(0, Math.min(100, target)) / 100 : null;

  const ticks = Array.from({ length: N }, (_, i) => {
    const frac = i / (N - 1);
    const ang = (Math.PI * (1 - frac)); // π (left) → 0 (right)
    const cos = Math.cos(ang);
    const sin = Math.sin(ang);
    const filled = value != null && frac <= filledTo + 1e-9;
    return {
      x1: CX + R_IN * cos,
      y1: CY - R_IN * sin,
      x2: CX + R_OUT * cos,
      y2: CY - R_OUT * sin,
      color: filled ? mix(frac) : "var(--color-line-strong)",
      opacity: filled ? 1 : 0.6,
    };
  });

  // Target marker (a slightly longer tick just past the ring), with a small
  // "N%" label further out so the mark's meaning is legible at a glance
  // instead of relying only on the caption text below the gauge.
  const targetTick =
    targetFrac == null
      ? null
      : (() => {
          const ang = Math.PI * (1 - targetFrac);
          const cos = Math.cos(ang);
          const sin = Math.sin(ang);
          return {
            x1: CX + (R_IN - 4) * cos,
            y1: CY - (R_IN - 4) * sin,
            x2: CX + (R_OUT + 5) * cos,
            y2: CY - (R_OUT + 5) * sin,
          };
        })();

  const targetLabel =
    targetFrac == null || target == null
      ? null
      : (() => {
          const ang = Math.PI * (1 - targetFrac);
          const cos = Math.cos(ang);
          const sin = Math.sin(ang);
          const r = R_OUT + 15;
          return {
            x: CX + r * cos,
            y: CY - r * sin,
            anchor: (cos < -0.15 ? "end" : cos > 0.15 ? "start" : "middle") as
              | "end"
              | "start"
              | "middle",
          };
        })();

  return (
    <section className="flex flex-col rounded-3xl border border-line bg-surface p-6">
      <div className="mb-2 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-xl leading-snug tracking-tight text-ink">
            {label}
          </h3>
        </div>
        <span className="text-ink-soft" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
            <circle cx="5" cy="12" r="1.6" />
            <circle cx="12" cy="12" r="1.6" />
            <circle cx="19" cy="12" r="1.6" />
          </svg>
        </span>
      </div>

      <div className="relative mx-auto w-full max-w-[260px]">
        <svg viewBox="0 0 220 128" className="w-full" role="img" aria-label={`${label} ${Math.round(v)} percent`}>
          {ticks.map((t, i) => (
            <line
              key={i}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke={t.color}
              strokeOpacity={t.opacity}
              strokeWidth={3.2}
              strokeLinecap="round"
            />
          ))}
          {targetTick && (
            <line
              x1={targetTick.x1}
              y1={targetTick.y1}
              x2={targetTick.x2}
              y2={targetTick.y2}
              stroke="var(--color-ink)"
              strokeWidth={2}
              strokeLinecap="round"
            />
          )}
          {targetLabel && (
            <text
              x={targetLabel.x}
              y={targetLabel.y}
              textAnchor={targetLabel.anchor}
              dominantBaseline="middle"
              className="fill-ink text-[10px] font-semibold"
            >
              {`${Math.round(target!)}%`}
            </text>
          )}
        </svg>

        {/* Centered readout */}
        <div className="absolute left-1/2 top-[64%] -translate-x-1/2 -translate-y-1/2 text-center">
          <p className="font-display text-5xl leading-none tracking-tight text-ink">
            {value == null ? "—" : `${Math.round(v)}%`}
          </p>
        </div>
      </div>

      {caption && (
        <p className="mt-1 text-center text-[13px] text-ink-soft">{caption}</p>
      )}

      <a
        href={detailsHref}
        className="mx-auto mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-line bg-surface-2 px-4 py-1.5 text-[13px] font-medium text-ink transition-colors hover:border-lime/50"
      >
        Show details
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </a>
    </section>
  );
}
