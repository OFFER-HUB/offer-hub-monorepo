import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { ThemeProvider, useTheme } from "../ThemeProvider";
import { THEME_STORAGE_KEY } from "@/constants/storage";

function installMatchMedia(prefersDark: boolean) {
  const listeners = new Set<(e: MediaQueryListEvent) => void>();
  const mql = {
    matches: prefersDark,
    media: "(prefers-color-scheme: dark)",
    addEventListener: vi.fn((_type: string, listener: (e: MediaQueryListEvent) => void) => {
      listeners.add(listener);
    }),
    removeEventListener: vi.fn((_type: string, listener: (e: MediaQueryListEvent) => void) => {
      listeners.delete(listener);
    }),
  };
  vi.stubGlobal("matchMedia", vi.fn(() => mql));
  return { mql, listeners };
}

function Probe() {
  const { theme, resolvedTheme } = useTheme();
  return (
    <span data-theme={theme} data-resolved={resolvedTheme}>
      probe
    </span>
  );
}

describe("ThemeProvider resolution order", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("light", "dark");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.documentElement.classList.remove("light", "dark");
  });

  it("prefers a stored theme over the system preference", () => {
    installMatchMedia(true);
    localStorage.setItem(THEME_STORAGE_KEY, "light");

    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );

    expect(screen.getByText("probe")).toHaveAttribute("data-theme", "light");
  });

  it("falls back to the system preference when nothing is stored", () => {
    installMatchMedia(true);
    // In production the blocking script in layout.tsx already resolves the
    // system preference and applies the class before React ever mounts.
    document.documentElement.classList.add("dark");

    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );

    expect(screen.getByText("probe")).toHaveAttribute("data-theme", "system");
    expect(screen.getByText("probe")).toHaveAttribute("data-resolved", "dark");
  });

  it("falls back to the system preference for an invalid stored value", () => {
    installMatchMedia(false);
    localStorage.setItem(THEME_STORAGE_KEY, "not-a-real-theme");

    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );

    expect(screen.getByText("probe")).toHaveAttribute("data-theme", "system");
  });

  it("resolves the initial resolvedTheme from the DOM class already applied by the blocking script, not by recomputing it", () => {
    // Simulate the inline script in layout.tsx: it runs before React and adds
    // the class synchronously. matchMedia here reports light to prove the
    // provider trusts the existing DOM class instead of recomputing.
    installMatchMedia(false);
    document.documentElement.classList.add("dark");

    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );

    expect(screen.getByText("probe")).toHaveAttribute("data-resolved", "dark");
  });

  it("does not touch documentElement's class list on the initial mount", () => {
    installMatchMedia(false);
    document.documentElement.classList.add("dark");

    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );

    // Still exactly what the blocking script set — the provider must not
    // remove/re-add classes redundantly on first render.
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.classList.contains("light")).toBe(false);
  });

  it("syncs documentElement's class when the theme changes after mount", () => {
    installMatchMedia(false);
    document.documentElement.classList.add("light");

    function ToggleProbe() {
      const { setTheme, resolvedTheme } = useTheme();
      return (
        <div>
          <span data-resolved={resolvedTheme}>probe</span>
          <button onClick={() => setTheme("dark")}>go dark</button>
        </div>
      );
    }

    render(
      <ThemeProvider>
        <ToggleProbe />
      </ThemeProvider>,
    );

    act(() => {
      screen.getByText("go dark").click();
    });

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.classList.contains("light")).toBe(false);
    expect(screen.getByText("probe")).toHaveAttribute("data-resolved", "dark");
  });

  it("persists the chosen theme to localStorage", () => {
    installMatchMedia(false);

    function ToggleProbe() {
      const { setTheme } = useTheme();
      return <button onClick={() => setTheme("dark")}>go dark</button>;
    }

    render(
      <ThemeProvider>
        <ToggleProbe />
      </ThemeProvider>,
    );

    act(() => {
      screen.getByText("go dark").click();
    });

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });
});
