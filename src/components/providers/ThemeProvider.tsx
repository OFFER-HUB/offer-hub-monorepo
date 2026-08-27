"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { flushSync } from "react-dom";
import { MotionConfig } from "framer-motion";
import { THEME_STORAGE_KEY } from "@/constants/storage";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: ResolvedTheme;
  toggleTheme: (event?: React.MouseEvent) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
  return stored && ["light", "dark", "system"].includes(stored) ? stored : "system";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme);
  // Seeded to "light" on both server and the first client render so this
  // state never mismatches during hydration. The blocking script in
  // layout.tsx already applied the correct light/dark class to
  // documentElement before paint, so the page never visibly flashes —
  // only JS-driven consumers (icons, logo swaps) pick up the real value
  // one tick after mount, via the effect below.
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");
  const isFirstRender = useRef(true);

  // Read the class the blocking script already applied instead of
  // recomputing it, so a manually-set "light"/"dark" theme (not "system")
  // doesn't get silently overridden by the current system preference.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      const applied = document.documentElement.classList.contains("dark") ? "dark" : "light";
      setResolvedTheme(applied);
      return;
    }
    const root = document.documentElement;
    const resolved: ResolvedTheme = theme === "system" ? getSystemTheme() : theme;
    setResolvedTheme(resolved);
    root.classList.remove("light", "dark");
    root.classList.add(resolved);
  }, [theme]);

  // Handle system theme changes
  useEffect(() => {
    if (theme !== "system") return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const resolved = getSystemTheme();
      setResolvedTheme(resolved);
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(resolved);
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  }, []);

  const toggleTheme = useCallback((event?: React.MouseEvent) => {
    const nextTheme: Theme = resolvedTheme === "dark" ? "light" : "dark";

    // Fallback if View Transitions API is not supported
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doc = document as any;

    if (!doc.startViewTransition) {
      setTheme(nextTheme);
      return;
    }

    // Get coordinates - default to top-right corner if no event (since toggle is there)
    const x = event?.clientX ?? window.innerWidth;
    const y = event?.clientY ?? 0;

    // Calculate distance to the farthest corner
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = doc.startViewTransition(() => {
      // Use flushSync to ensure React updates the DOM immediately
      flushSync(() => {
        setTheme(nextTheme);
      });
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 600,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
  }, [resolvedTheme, setTheme]);

  // Provider MUST always be rendered to avoid context errors
  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme, toggleTheme }}>
      <MotionConfig reducedMotion="user">
        {children}
      </MotionConfig>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}