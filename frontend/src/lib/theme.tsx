import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

/**
 * Two-theme system. Dark is the default Kineo look; "light" flips the CSS
 * tokens (see index.css). The <html> class is set before first paint by the
 * inline script in index.html — this provider just keeps React state, the
 * class, and localStorage in sync, and re-renders the tree on toggle so
 * anything that reads resolved CSS variables at render (the charts) updates.
 */
export type Theme = "dark" | "light";

const STORAGE_KEY = "kineo-theme";

function currentTheme(): Theme {
  return document.documentElement.classList.contains("light") ? "light" : "dark";
}

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "dark",
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(currentTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* storage unavailable — theme just won't persist */
    }
  }, [theme]);

  const toggle = useCallback(
    () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    [],
  );

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
