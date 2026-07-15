import { useTheme } from "@/lib/theme";

/**
 * Sun/moon pill switch that flips the app theme. Shared by the marketing navbar
 * and the dashboard shell. Pass `showLabel={false}` for a compact, switch-only
 * version (used in tight toolbars).
 */
export default function ThemeToggle({ showLabel = true }: { showLabel?: boolean }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle dark mode"
      className="group inline-flex cursor-pointer select-none items-center gap-2.5"
    >
      {showLabel && (
        <span className="text-[13px] font-medium text-ink-soft transition-colors group-hover:text-ink">
          {isDark ? "Dark" : "Light"}
        </span>
      )}
      <span
        className={`relative flex h-6 w-11 items-center rounded-full border border-line transition-colors ${
          isDark ? "bg-lime/20" : "bg-surface-2"
        }`}
      >
        <span
          className={`flex items-center justify-center rounded-full bg-lime text-lime-ink shadow-sm transition-transform duration-300 ${
            isDark ? "translate-x-[22px]" : "translate-x-[2px]"
          }`}
          style={{ height: "1.125rem", width: "1.125rem" }}
        >
          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor" aria-hidden="true">
            {isDark ? (
              <path d="M12 3a9 9 0 1 0 9 9c0-.46-.03-.92-.1-1.36a5.5 5.5 0 0 1-7.54-7.54c-.44-.07-.9-.1-1.36-.1z" />
            ) : (
              <path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0-5v2m0 16v2m10-10h-2M4 12H2m15.07-7.07-1.41 1.41M8.34 15.66l-1.41 1.41m0-11.14 1.41 1.41m7.32 7.32 1.41 1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
            )}
          </svg>
        </span>
      </span>
    </button>
  );
}
