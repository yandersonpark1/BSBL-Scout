import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";

/**
 * The dashboard's left rail. Its section links are in-page anchors that
 * smooth-scroll to each panel; a scrollspy keeps the active item in sync as you
 * scroll. Collapsible to an icon-only rail. Hidden below `lg` — on small screens
 * the panels simply stack and the top bar carries the actions.
 */

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
}

const SECTIONS: NavItem[] = [
  {
    id: "overview",
    label: "Overview",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" {...stroke}>
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </svg>
    ),
  },
  {
    id: "velocity",
    label: "Velocity",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" {...stroke}>
        <path d="M3 17 9 11l4 4 8-9" />
        <path d="M17 6h4v4" />
      </svg>
    ),
  },
  {
    id: "command",
    label: "Command",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" {...stroke}>
        <path d="M5 20V10M12 20V4M19 20v-7" />
      </svg>
    ),
  },
  {
    id: "arsenal",
    label: "Arsenal",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" {...stroke}>
        <path d="M8 6h13M8 12h13M8 18h13" />
        <path d="M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
      </svg>
    ),
  },
  {
    id: "movement",
    label: "Movement",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" {...stroke}>
        <path d="M12 3v18M3 12h18" opacity="0.5" />
        <circle cx="8" cy="9" r="1.6" />
        <circle cx="16" cy="15" r="1.6" />
        <circle cx="15" cy="8" r="1.6" />
      </svg>
    ),
  },
  {
    id: "location",
    label: "Location",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" {...stroke}>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
];

// How far below the sticky top bar counts as "reached" a section (matches
// each section's `scroll-mt-24` offset).
const ANCHOR_OFFSET = 104;

/**
 * Tracks which section the user has scrolled to. "Command" and "Arsenal" sit
 * side by side in a two-column grid rather than stacked, so picking whichever
 * section is geometrically nearest the top (e.g. via IntersectionObserver
 * ratios) can highlight the wrong one when the columns run different lengths.
 * Instead, walk the sections in their declared reading order and activate the
 * last one whose top has crossed the anchor line — the same rule a fixed
 * table of contents uses, and it degrades correctly at the bottom of the page
 * since the final section simply never gets overtaken.
 */
function useActiveSection(ids: string[]): string {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    let frame = 0;
    const compute = () => {
      frame = 0;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= ANCHOR_OFFSET) {
          current = id;
        }
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join(",")]);
  return active;
}

export function DashboardSidebar({
  collapsed,
  onToggleCollapse,
}: {
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const [clicked, setClicked] = useState<string | null>(null);
  const spied = useActiveSection(SECTIONS.map((s) => s.id));
  // A click wins briefly so the highlight feels instant, then scrollspy resumes.
  const active = clicked ?? spied;

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-line bg-surface/70 backdrop-blur-sm transition-[width] duration-200 lg:flex ${
        collapsed ? "w-[76px]" : "w-64"
      }`}
    >
      {/* Brand + collapse */}
      <div className="flex h-16 items-center gap-2.5 px-4">
        <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label="Kineo home">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-lime">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
              <circle cx="12" cy="12" r="9" stroke="var(--color-lime-ink)" strokeWidth="2" />
              <path
                d="M6 6 C 12 10, 12 14, 18 18 M18 6 C 12 10, 12 14, 6 18"
                stroke="var(--color-lime-ink)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
          {!collapsed && (
            <span className="font-display text-2xl leading-none tracking-tight text-ink">
              Kineo
            </span>
          )}
        </Link>
        {!collapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Collapse sidebar"
            className="ml-auto flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" {...stroke}>
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
        )}
      </div>

      {collapsed && (
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label="Expand sidebar"
          className="mx-auto mb-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" {...stroke}>
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      )}

      {/* Section nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {!collapsed && (
          <p className="px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft/70">
            Report
          </p>
        )}
        {SECTIONS.map((s) => {
          const isActive = active === s.id;
          return (
            <a
              key={s.id}
              href={`#${s.id}`}
              title={collapsed ? s.label : undefined}
              onClick={() => {
                setClicked(s.id);
                window.setTimeout(() => setClicked(null), 700);
              }}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                collapsed ? "justify-center" : ""
              } ${
                isActive
                  ? "bg-lime-wash text-accent"
                  : "text-ink-soft hover:bg-surface-2 hover:text-ink"
              }`}
            >
              <span className="shrink-0">{s.icon}</span>
              {!collapsed && <span>{s.label}</span>}
            </a>
          );
        })}

        <div className="my-2 border-t border-line" />

        {!collapsed && (
          <p className="px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft/70">
            Session
          </p>
        )}
        <SideLink to="/" collapsed={collapsed} label="New upload">
          <svg viewBox="0 0 24 24" className="h-5 w-5" {...stroke}>
            <path d="M12 20V8M6 14l6-6 6 6" />
            <path d="M4 4h16" />
          </svg>
        </SideLink>
        <SideLink to="/sample" collapsed={collapsed} label="Sample data">
          <svg viewBox="0 0 24 24" className="h-5 w-5" {...stroke}>
            <path d="M12 4v12M6 10l6 6 6-6" />
            <path d="M4 20h16" />
          </svg>
        </SideLink>
      </nav>

      {/* Footer: GitHub + local-first note */}
      <div
        className={`flex items-center gap-2.5 border-t border-line px-3 py-3 ${
          collapsed ? "justify-center" : ""
        }`}
      >
        <a
          href="https://github.com/yandersonpark1/BSBL-Scout"
          target="_blank"
          rel="noreferrer"
          title="GitHub"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.34.85.01 1.7.12 2.5.34 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85 0 1.34-.01 2.42-.01 2.75 0 .27.18.58.69.48A10.01 10.01 0 0 0 22 12c0-5.52-4.48-10-10-10z" />
          </svg>
        </a>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-[12px] font-medium text-ink">Local-first</p>
            <p className="truncate text-[11px] text-ink-soft">Runs on your machine</p>
          </div>
        )}
      </div>
    </aside>
  );
}

function SideLink({
  to,
  collapsed,
  label,
  children,
}: {
  to: string;
  collapsed: boolean;
  label: string;
  children: ReactNode;
}) {
  return (
    <Link
      to={to}
      title={collapsed ? label : undefined}
      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink ${
        collapsed ? "justify-center" : ""
      }`}
    >
      <span className="shrink-0">{children}</span>
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}
