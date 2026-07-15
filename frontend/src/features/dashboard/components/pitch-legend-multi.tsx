import { pitchColor } from "@/lib/pitch-colors";
import { Chip } from "@/features/dashboard/components/pitch-legend";

/**
 * Multi-select variant of the pitch legend: any combination of types can be
 * toggled on at once (vs. the single-select legend used by the location
 * chart). An empty selection means "show all", matching the single-select
 * legend's `active === null` convention.
 */
export function PitchLegendMulti({
  pitchTypes,
  selected,
  onChange,
  orientation = "row",
  size = "sm",
}: {
  pitchTypes: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  orientation?: "row" | "column";
  size?: "sm" | "lg";
}) {
  const allActive = selected.length === 0;

  const toggle = (type: string) => {
    if (allActive) {
      onChange([type]);
      return;
    }
    if (selected.includes(type)) {
      onChange(selected.filter((t) => t !== type));
    } else {
      onChange([...selected, type]);
    }
  };

  return (
    <div
      className={`flex gap-1.5 ${
        orientation === "column" ? "flex-col items-start" : "flex-wrap items-center"
      }`}
    >
      <Chip
        label="All"
        color={allActive ? "var(--color-lime)" : "#8a8272"}
        ink={allActive ? "var(--color-lime-ink)" : "#fff"}
        filled={allActive}
        onClick={() => onChange([])}
        size={size}
      />
      {pitchTypes.map((type) => (
        <Chip
          key={type}
          label={type}
          color={pitchColor(type)}
          filled={allActive || selected.includes(type)}
          dimmed={!allActive && !selected.includes(type)}
          onClick={() => toggle(type)}
          size={size}
        />
      ))}
    </div>
  );
}
