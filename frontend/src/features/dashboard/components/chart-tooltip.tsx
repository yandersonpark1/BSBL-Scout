import type { ReactNode } from "react";

/**
 * A shared, design-system-styled tooltip shell for the recharts panels. Charts
 * pass a custom `content` renderer that composes `<TooltipShell>` + `<TipRow>`
 * so every hover card looks identical: warm surface, hairline border, ink text,
 * monospace numbers.
 */
export function TooltipShell({
  title,
  accent,
  children,
}: {
  title: string;
  accent?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface/95 px-3 py-2 shadow-lg backdrop-blur-sm">
      <p
        className="mb-1 text-[12px] font-semibold uppercase tracking-wide"
        style={{ color: accent ?? "#1d1b2b" }}
      >
        {title}
      </p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

export function TipRow({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <p className="flex items-baseline justify-between gap-4 text-xs text-ink-soft">
      <span>{label}</span>
      <span className="font-mono font-medium text-ink">{value}</span>
    </p>
  );
}
