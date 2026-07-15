import { useMemo, useState } from "react";
import type { LocationPoint } from "@/lib/report";
import { pitchColor } from "@/lib/pitch-colors";
import { ChartCard } from "./chart-card";
import { PitchLegend } from "./pitch-legend";
import { TipRow, TooltipShell } from "./chart-tooltip";

/**
 * Plate location — the "Pitch Tracker" catcher's-eye view (imported from the
 * Claude Design mockup): a night-stadium backdrop (stadium lights, outfield
 * band, mowed grass, dirt infield + mound, home plate) with a FLAT strike zone
 * floating in front of it — no 3-D box.
 *
 * The scene is a fixed 1101×717 stage rendered in CSS; the strike zone and the
 * pitch dots are drawn on an SVG overlay that shares the same coordinate box, so
 * everything scales together and the dots stay circular.
 *
 * The zone still adapts to the batter (rulebook bottom ≈ hollow of the knee,
 * top ≈ torso midpoint), driven by the 5'4"–6'3" slider, which also updates the
 * live in-zone %. Pitches that miss the zone by more than the wild-pitch
 * thresholds (way off to the side, or way high/low) are treated as wild and are
 * hidden from the plot — but they still count as out-of-zone in the in-zone %.
 */

// Scene stage — matches the "Pitch Tracker" Claude Design mockup exactly.
const VW = 1101;
const VH = 717;
const CX = 622; // strike-zone center x, in stage px
const PXPI = 15; // stage px per real inch (17" zone ≈ 255px wide)
const GROUND = 787; // stage y for a height of 0"; height increases upward

// Strike-zone model (rulebook, scaled to the batter).
const PLATE_HALF = 8.5; // plate & zone are 17" wide
const BALL_R = 1.45; // regulation ball radius, for the in-zone touch test
const KNEE_RATIO = 0.26; // zone bottom ≈ hollow of the knee
const MID_RATIO = 0.556; // zone top ≈ torso midpoint
const MIN_H = 64; // 5'4"
const MAX_H = 75; // 6'3"

// Wild pitch — hidden when it misses the zone by more than this. Tune freely.
const WILD_SIDE_IN = 18; // inches beyond the left/right plate edge
const WILD_VERT_IN = 13; // inches above the top / below the bottom of the zone

const DOT_R = 10; // pitch marker radius, stage px

// World inches -> stage px. Height is up (smaller y).
const sx = (side: number) => CX + side * PXPI;
const sy = (height: number) => GROUND - height * PXPI;

function isWild(p: LocationPoint, zoneTop: number, zoneBot: number): boolean {
  const hOver = Math.abs(p.side) - PLATE_HALF;
  const vOver = Math.max(p.height - zoneTop, zoneBot - p.height);
  return hOver > WILD_SIDE_IN || vOver > WILD_VERT_IN;
}

export function LocationChart({ points }: { points: LocationPoint[] }) {
  const [active, setActive] = useState<string | null>(null);
  const [batterHeight, setBatterHeight] = useState(70); // 5'10"
  const [hover, setHover] = useState<number | null>(null);

  const types = useMemo(
    () => uniqueInOrder(points.map((p) => p.pitch_type)),
    [points],
  );

  const zoneBot = KNEE_RATIO * batterHeight;
  const zoneTop = MID_RATIO * batterHeight;

  // Active-type filter, then drop wild pitches so only tracked, in-range pitches show.
  const shown = useMemo(
    () => points.filter((p) => active === null || p.pitch_type === active),
    [points, active],
  );
  const visible = useMemo(
    () => shown.filter((p) => !isWild(p, zoneTop, zoneBot)),
    [shown, zoneTop, zoneBot],
  );
  const wildCount = shown.length - visible.length;

  // In-zone (ball touches the zone). Wild pitches are hidden from the plot but
  // still count in the denominator as out-of-zone, so the % is over ALL pitches.
  const inZone = shown.filter(
    (p) =>
      Math.abs(p.side) <= PLATE_HALF + BALL_R &&
      p.height >= zoneBot - BALL_R &&
      p.height <= zoneTop + BALL_R,
  ).length;
  const zonePct = shown.length
    ? Math.round((inZone / shown.length) * 100)
    : null;

  const zTopY = sy(zoneTop);
  const zBotY = sy(zoneBot);
  const zoneLeft = sx(-PLATE_HALF);
  const zoneW = 2 * PLATE_HALF * PXPI;
  const zoneH = zBotY - zTopY;

  return (
    <ChartCard
      title="Plate location"
      description="Every pitch in a catcher's-eye strike zone sized to the batter. Wild pitches are hidden."
      actions={<PitchLegend pitchTypes={types} active={active} onSelect={setActive} />}
    >
      {points.length === 0 ? (
        <div className="flex h-[220px] items-center justify-center text-sm text-ink-soft">
          No plate-location data in this file.
        </div>
      ) : (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div
            className="relative mx-auto w-full max-w-[560px] flex-1 overflow-hidden rounded-xl"
            style={{ aspectRatio: `${VW} / ${VH}` }}
          >
            <Scene />

            <svg
              viewBox={`0 0 ${VW} ${VH}`}
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full"
              role="img"
              aria-label="Pitch locations in a catcher-view strike zone sized to the batter"
            >
              <defs>
                <radialGradient id="zoneGlow" cx="50%" cy="45%" r="72%">
                  <stop offset="0%" stopColor="rgba(120,170,220,0.18)" />
                  <stop offset="100%" stopColor="rgba(70,110,165,0)" />
                </radialGradient>
              </defs>

              {/* Strike zone — flat front face + thirds grid */}
              <rect x={zoneLeft} y={zTopY} width={zoneW} height={zoneH} fill="url(#zoneGlow)" />
              <rect
                x={zoneLeft}
                y={zTopY}
                width={zoneW}
                height={zoneH}
                fill="rgba(74,112,160,0.10)"
                stroke="rgba(226,238,245,0.65)"
                strokeWidth={1.6}
              />
              {[1, 2].map((i) => (
                <g key={i} stroke="rgba(232,240,245,0.22)" strokeWidth={1}>
                  <line
                    x1={zoneLeft + (i * zoneW) / 3}
                    y1={zTopY}
                    x2={zoneLeft + (i * zoneW) / 3}
                    y2={zBotY}
                  />
                  <line
                    x1={zoneLeft}
                    y1={zTopY + (i * zoneH) / 3}
                    x2={zoneLeft + zoneW}
                    y2={zTopY + (i * zoneH) / 3}
                  />
                </g>
              ))}

              {/* Pitches — glowing markers */}
              {visible.map((p, i) => (
                <g key={i}>
                  <circle
                    cx={sx(p.side)}
                    cy={sy(p.height)}
                    r={DOT_R + 3}
                    fill={pitchColor(p.pitch_type)}
                    opacity={0.3}
                  />
                  <circle
                    cx={sx(p.side)}
                    cy={sy(p.height)}
                    r={DOT_R}
                    fill={pitchColor(p.pitch_type)}
                    stroke="rgba(255,255,255,0.85)"
                    strokeWidth={1.4}
                  />
                </g>
              ))}
              {hover != null && visible[hover] && (
                <circle
                  cx={sx(visible[hover].side)}
                  cy={sy(visible[hover].height)}
                  r={DOT_R + 4}
                  fill="none"
                  stroke={pitchColor(visible[hover].pitch_type)}
                  strokeWidth={2}
                />
              )}
              {/* Oversized invisible hover targets */}
              {visible.map((p, i) => (
                <circle
                  key={`hit-${i}`}
                  cx={sx(p.side)}
                  cy={sy(p.height)}
                  r={DOT_R + 8}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                />
              ))}
            </svg>

            {hover != null && visible[hover] && (
              <div
                className="pointer-events-none absolute z-10"
                style={{
                  left: `${(sx(visible[hover].side) / VW) * 100}%`,
                  top: `${(sy(visible[hover].height) / VH) * 100}%`,
                  transform: "translate(-50%, -115%)",
                }}
              >
                <TooltipShell
                  title={visible[hover].pitch_type}
                  accent={pitchColor(visible[hover].pitch_type)}
                >
                  <TipRow label="Height" value={`${visible[hover].height.toFixed(1)}″`} />
                  <TipRow label="Side" value={`${visible[hover].side.toFixed(1)}″`} />
                  <TipRow
                    label="Device call"
                    value={
                      visible[hover].is_strike === true
                        ? "Strike"
                        : visible[hover].is_strike === false
                          ? "Ball"
                          : "—"
                    }
                  />
                </TooltipShell>
              </div>
            )}
          </div>

          {/* Batter-height control + zone stats */}
          <aside className="w-full shrink-0 space-y-5 lg:w-52">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                Batter height
              </p>
              <p className="mt-1 font-display text-4xl leading-none tracking-tight text-ink">
                {ftIn(batterHeight)}
              </p>
              <input
                type="range"
                min={MIN_H}
                max={MAX_H}
                step={1}
                value={batterHeight}
                onChange={(e) => setBatterHeight(Number(e.target.value))}
                aria-label="Batter height"
                className="mt-2 w-full cursor-pointer accent-lime"
              />
              <div className="flex justify-between font-mono text-[10px] text-ink-soft">
                <span>5'4"</span>
                <span>6'3"</span>
              </div>
              <p className="mt-2 font-mono text-[11px] text-ink-soft">
                Zone {ftIn(Math.round(zoneBot))} – {ftIn(Math.round(zoneTop))}
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-lime-wash px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                In zone{active ? ` · ${active}` : ""}
              </p>
              <p className="mt-1 font-display text-4xl leading-none tracking-tight text-ink">
                {zonePct == null ? "—" : `${zonePct}%`}
              </p>
              <p className="font-mono text-[11px] text-ink-soft">
                {inZone} of {shown.length} pitches
              </p>
            </div>

            {wildCount > 0 && (
              <p className="font-mono text-[11px] text-ink-soft">
                {wildCount} wild pitch{wildCount === 1 ? "" : "es"} hidden
              </p>
            )}

            <p className="text-[11px] leading-snug text-ink-soft">
              Zone estimated from batter height (knee ≈ 26%, torso midpoint ≈ 56%).
              Pitches more than {WILD_SIDE_IN}″ wide of the plate or {WILD_VERT_IN}″
              above/below the zone are treated as wild and hidden.
            </p>
          </aside>
        </div>
      )}
    </ChartCard>
  );
}

/**
 * The night-stadium backdrop, ported from the "Pitch Tracker" Claude Design
 * mockup. A fixed 1101×717 stage expressed in percentages so it scales with the
 * container. The strike zone, pitches and legend are drawn elsewhere.
 */
function Scene() {
  return (
    <div className="absolute inset-0" style={{ background: "#0a0f18" }}>
      {/* Sky */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 82% at 50% 0%, #16273c 0%, #0e1a2b 34%, #0a121f 60%, #070b13 100%)",
        }}
      />

      {/* Stadium lights — glows + banks */}
      <div
        className="absolute"
        style={{
          left: "7.45%",
          top: "-4.05%",
          width: "27.25%",
          height: "20.92%",
          borderRadius: "50%",
          background:
            "radial-gradient(50% 50% at 50% 50%, rgba(210,225,255,0.30), rgba(210,225,255,0.05) 55%, transparent 75%)",
          filter: "blur(4px)",
        }}
      />
      <div
        className="absolute"
        style={{
          left: "35.24%",
          top: "-8.51%",
          width: "32.70%",
          height: "26.50%",
          borderRadius: "50%",
          background:
            "radial-gradient(50% 50% at 50% 50%, rgba(222,233,255,0.40), rgba(222,233,255,0.07) 55%, transparent 75%)",
          filter: "blur(4px)",
        }}
      />
      <div
        className="absolute"
        style={{
          left: "68.30%",
          top: "-4.05%",
          width: "27.25%",
          height: "20.92%",
          borderRadius: "50%",
          background:
            "radial-gradient(50% 50% at 50% 50%, rgba(210,225,255,0.30), rgba(210,225,255,0.05) 55%, transparent 75%)",
          filter: "blur(4px)",
        }}
      />
      <div
        className="absolute"
        style={{
          left: "17.80%",
          top: "5.02%",
          width: "6.54%",
          height: "5px",
          borderRadius: "3px",
          background:
            "linear-gradient(90deg, transparent, #f4f8ff 22%, #ffffff 50%, #f4f8ff 78%, transparent)",
          boxShadow: "0 0 14px 3px rgba(230,240,255,0.55)",
        }}
      />
      <div
        className="absolute"
        style={{
          left: "46.05%",
          top: "3.77%",
          width: "11.08%",
          height: "5px",
          borderRadius: "3px",
          background:
            "linear-gradient(90deg, transparent, #f4f8ff 18%, #ffffff 50%, #f4f8ff 82%, transparent)",
          boxShadow: "0 0 16px 3px rgba(230,240,255,0.6)",
        }}
      />
      <div
        className="absolute"
        style={{
          left: "77.57%",
          top: "5.16%",
          width: "8.72%",
          height: "5px",
          borderRadius: "3px",
          background:
            "linear-gradient(90deg, transparent, #f4f8ff 20%, #ffffff 50%, #f4f8ff 80%, transparent)",
          boxShadow: "0 0 14px 3px rgba(230,240,255,0.55)",
        }}
      />

      {/* Stands / outfield dotted band */}
      <div
        className="absolute inset-x-0"
        style={{
          top: "27.34%",
          height: "16.18%",
          background:
            "linear-gradient(180deg, rgba(20,36,58,0) 0%, rgba(24,42,66,0.5) 35%, rgba(20,36,56,0.35) 100%), radial-gradient(rgba(130,160,200,0.12) 0.5px, transparent 1.5px)",
          backgroundSize: "auto, 10px 10px",
        }}
      />

      {/* Field — grass */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          top: "71.97%",
          background:
            "repeating-conic-gradient(from 90deg at 50% -12%, rgba(255,255,255,0.05) 0deg 6deg, rgba(0,0,0,0.05) 6deg 12deg), radial-gradient(95% 135% at 50% -5%, #549658 0%, #3b7c45 45%, #2c6236 75%, #214f2c 100%)",
        }}
      />
      <div
        className="absolute inset-x-0"
        style={{
          top: "71.83%",
          height: "2px",
          background:
            "linear-gradient(90deg, transparent, rgba(150,205,155,0.35) 30%, rgba(150,205,155,0.45) 50%, rgba(150,205,155,0.35) 70%, transparent)",
        }}
      />
      {/* Dirt infield diamond */}
      <div
        className="absolute"
        style={{
          left: "27.70%",
          top: "73.36%",
          width: "58.13%",
          height: "26.64%",
          clipPath: "polygon(50% 0%, 99% 47%, 50% 91%, 1% 47%)",
          background:
            "radial-gradient(80% 90% at 50% 30%, #7c5030 0%, #6a4223 55%, #543219 100%)",
        }}
      />
      {/* Home dirt lighter area */}
      <div
        className="absolute"
        style={{
          left: "42.69%",
          top: "92.33%",
          width: "27.25%",
          height: "13.95%",
          borderRadius: "50%",
          background:
            "radial-gradient(50% 50% at 50% 40%, rgba(146,98,54,0.9), rgba(146,98,54,0) 70%)",
        }}
      />
      {/* Pitcher mound */}
      <div
        className="absolute"
        style={{
          left: "53.41%",
          top: "81.73%",
          width: "5.81%",
          height: "4.18%",
          borderRadius: "50%",
          background:
            "radial-gradient(50% 50% at 50% 45%, rgba(140,92,52,0.85), rgba(140,92,52,0) 72%)",
        }}
      />
      {/* Foul lines */}
      <div
        className="absolute"
        style={{
          left: "56.31%",
          top: "96.10%",
          width: "25.89%",
          height: "2px",
          transformOrigin: "0 50%",
          transform: "rotate(-149.9deg)",
          background: "rgba(232,238,243,0.55)",
        }}
      />
      <div
        className="absolute"
        style={{
          left: "56.31%",
          top: "96.10%",
          width: "25.70%",
          height: "2px",
          transformOrigin: "0 50%",
          transform: "rotate(-30.4deg)",
          background: "rgba(232,238,243,0.55)",
        }}
      />
      {/* Home plate */}
      <div
        className="absolute"
        style={{
          left: "55.04%",
          top: "95.12%",
          width: "2.73%",
          height: "3.07%",
          clipPath: "polygon(0 0, 100% 0, 100% 48%, 50% 100%, 0 48%)",
          background: "#d8dde0",
        }}
      />

      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(125% 105% at 50% 42%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.5) 100%)",
        }}
      />
    </div>
  );
}

function ftIn(inches: number): string {
  const f = Math.floor(inches / 12);
  const i = Math.round(inches % 12);
  return i === 12 ? `${f + 1}'0"` : `${f}'${i}"`;
}

function uniqueInOrder(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of values) {
    if (!seen.has(v)) {
      seen.add(v);
      out.push(v);
    }
  }
  return out;
}
