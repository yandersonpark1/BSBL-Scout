import { useEffect, useRef, useState } from "react";

interface Stat {
  value: number;
  decimals: number;
  suffix: string;
  label: string;
}

const STATS: Stat[] = [
  { value: 94.7, decimals: 1, suffix: " mph", label: "avg fastball velo" },
  { value: 2480, decimals: 0, suffix: " rpm", label: "avg spin rate" },
  { value: 31.2, decimals: 1, suffix: "%", label: "whiff rate" },
  { value: 6.2, decimals: 1, suffix: " ft", label: "avg release height" },
];

/** Counts from 0 → target once the row scrolls into view. */
function useCountUp(target: number, decimals: number, run: boolean) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!run) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(target);
      return;
    }
    const duration = 1100;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setN(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, decimals, run]);
  return n;
}

function StatItem({ stat, run }: { stat: Stat; run: boolean }) {
  const n = useCountUp(stat.value, stat.decimals, run);
  const formatted = n.toLocaleString(undefined, {
    minimumFractionDigits: stat.decimals,
    maximumFractionDigits: stat.decimals,
  });
  return (
    <div className="text-center">
      <p className="font-display text-5xl leading-none tracking-tight text-ink sm:text-6xl">
        {formatted}
        <span className="text-2xl text-ink-soft">{stat.suffix}</span>
      </p>
      <span className="mx-auto mt-3 block h-[3px] w-8 rounded-full bg-lime" />
      <p className="mt-3 text-[13px] text-ink-soft">{stat.label}</p>
    </div>
  );
}

export default function Stats() {
  const [run, setRun] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRun(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="px-6 pb-16">
      <div
        ref={ref}
        className="mx-auto grid max-w-4xl grid-cols-2 gap-y-12 border-y border-line py-12 md:grid-cols-4"
      >
        {STATS.map((s) => (
          <StatItem key={s.label} stat={s} run={run} />
        ))}
      </div>
    </section>
  );
}
