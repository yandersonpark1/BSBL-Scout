import type { ReactNode } from "react";

interface Feature {
  title: string;
  desc: string;
  icon: ReactNode;
}

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const FEATURES: Feature[] = [
  {
    title: "Velocity trends",
    desc: "Per pitch and rolling averages, View your stamina",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" {...stroke}>
        <path d="M3 17 9 11l4 4 8-9" />
        <path d="M17 6h4v4" />
      </svg>
    ),
  },
  {
    title: "Spin & efficiency",
    desc: "Spin rate, spin axis, and active-spin efficiency by pitch type.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" {...stroke}>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="4" />
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
      </svg>
    ),
  },
  {
    title: "Location heat maps",
    desc: "Zone-by-zone command with strike percentage",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" {...stroke}>
        <rect x="4" y="4" width="16" height="16" rx="1.5" />
        <path d="M9 4v16M15 4v16M4 9h16M4 15h16" />
      </svg>
    ),
  },
  {
    title: "Movement profiles",
    desc: "Horizontal and vertical break. How do your pitches pair?",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" {...stroke}>
        <path d="M3 12c3 0 3-6 6-6s3 12 6 12 3-6 6-6" />
      </svg>
    ),
  },
];

export default function FeatureGrid() {
  return (
    <section id="features" className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <p className="text-center text-[13px] font-semibold uppercase tracking-[0.18em] text-accent">
          What you get
        </p>
        <h2 className="mx-auto mt-3 max-w-2xl text-center font-display text-4xl leading-tight tracking-tight text-ink sm:text-5xl">
          Every metric, mapped the moment you upload
        </h2>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-3xl border border-line bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-lime/40"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime-wash text-accent">
                {f.icon}
              </span>
              <h3 className="mt-5 font-display text-xl leading-snug text-ink">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {f.desc}
              </p>
              {/* Accent sweep on hover */}
              <span className="absolute bottom-0 left-0 h-1 w-full origin-left scale-x-0 bg-lime transition-transform duration-300 group-hover:scale-x-100" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
