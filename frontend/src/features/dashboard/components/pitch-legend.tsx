import { pitchColor } from "@/lib/pitch-colors";

/**
 * The always-present pitch-type legend. Because two palette slots dip below 3:1
 * contrast, identity must never be colour-alone — this legend (plus the arsenal
 * table) is the required secondary encoding.
 *
 * Doubles as a filter: clicking a type toggles the active selection. `active`
 * of `null` means "show all".
 */
export function PitchLegend({
  pitchTypes,
  active,
  onSelect,
}: {
  pitchTypes: string[];
  active: string | null;
  onSelect?: (pitchType: string | null) => void;
}) {
  const interactive = Boolean(onSelect);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {interactive && (
        <Chip
          label="All"
          color={active === null ? "var(--color-lime)" : "#8a8272"}
          ink={active === null ? "var(--color-lime-ink)" : "#fff"}
          filled={active === null}
          onClick={() => onSelect?.(null)}
        />
      )}
      {pitchTypes.map((type) => (
        <Chip
          key={type}
          label={type}
          color={pitchColor(type)}
          filled={!interactive || active === type}
          dimmed={interactive && active !== null && active !== type}
          onClick={interactive ? () => onSelect?.(active === type ? null : type) : undefined}
        />
      ))}
    </div>
  );
}

export function Chip({
  label,
  color,
  filled,
  dimmed = false,
  onClick,
  ink = "#fff",
  size = "sm",
}: {
  label: string;
  color: string;
  filled: boolean;
  dimmed?: boolean;
  onClick?: () => void;
  /** Text/dot colour when the chip is filled (defaults to white on the hue). */
  ink?: string;
  size?: "sm" | "lg";
}) {
  const Tag = onClick ? "button" : "span";
  return (
    <Tag
      {...(onClick ? { type: "button", onClick } : {})}
      className={`inline-flex items-center rounded-full border font-medium transition-opacity ${
        size === "lg" ? "gap-2 px-4 py-2 text-[14px]" : "gap-1.5 px-2.5 py-1 text-[12px]"
      } ${onClick ? "cursor-pointer hover:opacity-100" : ""} ${
        dimmed ? "opacity-45" : "opacity-100"
      }`}
      style={
        filled
          ? { backgroundColor: color, borderColor: color, color: ink }
          : { borderColor: color, color }
      }
    >
      <span
        className={`rounded-full ${size === "lg" ? "h-2.5 w-2.5" : "h-2 w-2"}`}
        style={{ backgroundColor: filled ? ink : color }}
      />
      {label}
    </Tag>
  );
}
