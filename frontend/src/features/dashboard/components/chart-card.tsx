import type { ReactNode } from "react";

/**
 * Shared surface for every dashboard panel — a raised warm card with a title,
 * optional description, and an optional top-right slot (used for legends /
 * toggles). Keeps all panels visually identical across the page.
 */
export function ChartCard({
  title,
  description,
  actions,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`flex flex-col rounded-3xl border border-line bg-surface p-6 shadow-[0_1px_2px_rgba(29,27,43,0.04),0_10px_30px_-20px_rgba(29,27,43,0.18)] ${className}`}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-display text-xl leading-snug tracking-tight text-ink">
            {title}
          </h3>
          {description && (
            <p className="mt-0.5 text-sm leading-snug text-ink-soft">{description}</p>
          )}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </section>
  );
}
