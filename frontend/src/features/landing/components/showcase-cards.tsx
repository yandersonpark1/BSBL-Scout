/**
 * The two tilted "trading card" mock-ups that sit beside the hero copy — a blue
 * fastball card and a lime slider card, gently floating at fixed tilts. These
 * are pure decoration (aria-hidden): a taste of the metrics a real upload
 * produces. The blue and lime here are showcase-only hues, deliberately NOT the
 * app's semantic tokens, so they read the same in both themes.
 */

function SeamMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" opacity="0.7" />
      <path
        d="M6 6 C 12 10, 12 14, 18 18 M18 6 C 12 10, 12 14, 6 18"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}

function Chip({ children, tone }: { children: React.ReactNode; tone: "onBlue" | "onLime" }) {
  const cls =
    tone === "onBlue"
      ? "bg-white/15 text-white/90"
      : "bg-black/15 text-black/80";
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${cls}`}>
      {children}
    </span>
  );
}

export default function ShowcaseCards() {
  return (
    <div className="relative mx-auto h-[440px] w-full max-w-md sm:h-[480px]">
      {/* Fastball — blue, upper left, tilted counter-clockwise */}
      <article
        className="animate-card-float absolute left-0 top-2 w-[70%] rounded-[26px] p-6 shadow-[0_30px_60px_-24px_rgba(31,54,143,0.7)] ring-1 ring-white/10"
        style={{
          ["--tilt" as string]: "-7deg",
          background:
            "linear-gradient(150deg, var(--color-blue) 0%, var(--color-blue-deep) 100%)",
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">
            Fastball
          </span>
          <SeamMark className="h-5 w-5 text-white" />
        </div>
        <p className="mt-6 font-display leading-none text-white">
          <span className="text-6xl">94.7</span>
          <span className="ml-1 text-xl text-white/70">mph</span>
        </p>
        <p className="mt-3 font-mono text-[12px] text-white/70">
          2,480 rpm · 6.2 ft release
        </p>
        <div className="mt-5 flex gap-2">
          <Chip tone="onBlue">Four-seam</Chip>
          <Chip tone="onBlue">93–96</Chip>
        </div>
      </article>

      {/* Slider — lime, lower right, tilted clockwise, overlapping the fastball */}
      <article
        className="animate-card-float absolute bottom-0 right-0 w-[72%] rounded-[26px] p-6 shadow-[0_30px_60px_-24px_rgba(115,150,20,0.65)] ring-1 ring-black/10"
        style={{
          ["--tilt" as string]: "6deg",
          animationDelay: "-3.5s",
          background:
            "linear-gradient(150deg, var(--color-lime-bright) 0%, var(--color-lime) 55%, #a6cf2a 100%)",
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/60">
            Slider
          </span>
          <SeamMark className="h-5 w-5 text-black/70" />
        </div>
        <p className="mt-6 font-display leading-none text-lime-ink">
          <span className="text-6xl">31.2</span>
          <span className="ml-1 text-xl text-black/50">%</span>
        </p>
        <p className="mt-3 font-mono text-[12px] text-black/60">
          whiff · 14 in sweep · 84 mph
        </p>
        <div className="mt-5 flex gap-2">
          <Chip tone="onLime">Breaking</Chip>
          <Chip tone="onLime">Chase 30%</Chip>
        </div>
      </article>
    </div>
  );
}
