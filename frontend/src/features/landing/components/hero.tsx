import { Link } from "react-router-dom";
import ShowcaseCards from "./showcase-cards";

/** Four one-line capability tags under the hero copy. */
const MINI_FEATURES = [
  { title: "Velocity", desc: "Per-Pitch and Rolling Avg." },
  { title: "Spin & axis", desc: "Deep Dive into the Shape" },
  { title: "Location", desc: "In and Out Zone" },
  { title: "Movement", desc: "True Painting of your Pitches" },
];

export default function Hero() {
  return (
    <section
      id="top"
      className="relative mx-auto w-full max-w-6xl px-6 pt-32 pb-16 sm:pt-36"
    >
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
        {/* ── Left: copy ─────────────────────────────────────────── */}
        <div className="text-center lg:text-left">
          {/* Eyebrow */}
          <span
            className="reveal inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.15em] text-accent"
            style={{ animationDelay: "0ms" }}
          >
            <span className="animate-ping-dot h-1.5 w-1.5 rounded-full bg-lime" />
            Pitch Analytics
          </span>

          {/* Headline — serif with an italic accent word */}
          <h1
            className="reveal mt-6 font-display text-6xl leading-[1.02] tracking-tight text-ink sm:text-7xl"
            style={{ animationDelay: "80ms" }}
          >
            Stop guessing.
            <br />
            Start{" "}
            <span className="relative whitespace-nowrap italic text-accent">
              developing.
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 300 12"
                fill="none"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M2 8 C 80 2, 220 2, 298 6"
                  stroke="var(--color-lime)"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          {/* Subhead */}
          <p
            className="reveal mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink-soft lg:mx-0"
            style={{ animationDelay: "160ms" }}
          >
            Drop in a Rapsodo export and get velocity, spin, movement, and
            location dashboards in seconds.
          </p>

          {/* CTAs */}
          <div
            className="reveal mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start"
            style={{ animationDelay: "240ms" }}
          >
            <a
              href="#upload"
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-lime px-6 py-3 text-sm font-semibold text-lime-ink shadow-[0_8px_24px_-8px_rgba(201,242,77,0.6)] transition-all hover:bg-lime-bright"
            >
              Upload a CSV
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
            <Link
              to="/sample"
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line-strong bg-surface px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-lime/50"
            >
              View sample data
            </Link>
          </div>

          {/* Mini-feature grid */}
          <dl
            className="reveal mx-auto mt-10 grid max-w-md grid-cols-2 gap-x-8 gap-y-5 lg:mx-0"
            style={{ animationDelay: "320ms" }}
          >
            {MINI_FEATURES.map((f) => (
              <div key={f.title} className="border-l-2 border-lime/60 pl-3 text-left">
                <dt className="text-sm font-semibold text-accent">{f.title}</dt>
                <dd className="mt-0.5 text-[13px] text-ink-soft">{f.desc}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* ── Right: showcase cards ──────────────────────────────── */}
        <div className="reveal" style={{ animationDelay: "200ms" }}>
          <ShowcaseCards />
        </div>
      </div>
    </section>
  );
}
