"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useScrollProgress } from "@/hooks/useScrollProgress";

// ─── Shared visual constants ────────────────────────────────────────────────
// Both modes share the same height, z-index, and brand gradient so the bar
// looks identical regardless of which mode is active.
const BAR_CLASSES =
  "fixed top-0 left-0 right-0 h-[3px] z-[9999] pointer-events-none";
const GRADIENT = "bg-gradient-to-r from-[#149A9B] to-[#22e0e2]";

// ─── Route-change mode (ex-NavigationProgress) ──────────────────────────────

function RouteChangeBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const stepTimerRefs = useRef<ReturnType<typeof setTimeout>[]>([]);
  const completeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startLoading = useCallback(() => {
    stepTimerRefs.current.forEach(clearTimeout);
    stepTimerRefs.current = [];

    setIsLoading(true);
    setProgress(0);

    const steps = [
      { value: 30, delay: 0 },
      { value: 50, delay: 100 },
      { value: 70, delay: 300 },
      { value: 85, delay: 600 },
    ];

    steps.forEach(({ value, delay }) => {
      const id = setTimeout(() => {
        setProgress((prev) => (prev < value ? value : prev));
      }, delay);
      stepTimerRefs.current.push(id);
    });
  }, []);

  const completeLoading = useCallback(() => {
    if (completeTimerRef.current !== null) clearTimeout(completeTimerRef.current);
    setProgress(100);
    completeTimerRef.current = setTimeout(() => {
      setIsLoading(false);
      setProgress(0);
      completeTimerRef.current = null;
    }, 200);
  }, []);

  // Clean up all timers on unmount
  useEffect(() => {
    return () => {
      stepTimerRefs.current.forEach(clearTimeout);
      if (completeTimerRef.current !== null) clearTimeout(completeTimerRef.current);
    };
  }, []);

  // Complete whenever the route settles
  useEffect(() => {
    completeLoading();
  }, [pathname, searchParams, completeLoading]);

  // Detect clicks on internal links to start the bar early
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      const isInternal = href.startsWith("/") || href.startsWith(window.location.origin);
      const isSamePageAnchor = href.startsWith("#");
      const isNewTab = anchor.target === "_blank" || e.metaKey || e.ctrlKey;

      if (isInternal && !isSamePageAnchor && !isNewTab) {
        const url = new URL(href, window.location.origin);
        if (url.pathname !== pathname) startLoading();
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [pathname, startLoading]);

  if (!isLoading && progress === 0) return null;

  return (
    <div
      className={BAR_CLASSES}
      style={{ opacity: isLoading ? 1 : 0, transition: "opacity 0.2s" }}
    >
      <div
        className={`h-full ${GRADIENT}`}
        style={{
          width: `${progress}%`,
          transition:
            progress === 100 ? "width 0.1s ease-out" : "width 0.4s ease",
        }}
      />
      {/* Leading glow */}
      <div
        className="absolute top-0 right-0 h-full w-24 opacity-50"
        style={{
          background: "linear-gradient(to right, transparent, #22e0e2)",
          transform: `translateX(${progress < 100 ? 0 : 100}%)`,
        }}
      />
    </div>
  );
}

// ─── Scroll-progress mode (ex-LoadingBar) ───────────────────────────────────

function ScrollProgressBar() {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const scrollY = useScrollProgress(!isLoading);

  // Brief mount animation (0.3 → 1.0 over 800 ms) then switch to scroll tracking
  useEffect(() => {
    setProgress(0.3);
    const timer = setTimeout(() => {
      setProgress(1);
      setTimeout(() => setIsLoading(false), 500);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Once the mount animation is done, derive progress from scroll position
  useEffect(() => {
    if (isLoading) return;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    setProgress(docHeight > 0 ? scrollY / docHeight : 0);
  }, [isLoading, scrollY]);

  return (
    <div
      className={`${BAR_CLASSES} ${GRADIENT} origin-left`}
      style={{
        transform: `scaleX(${progress})`,
        transition: isLoading ? "transform 0.4s ease" : "none",
      }}
    />
  );
}

// ─── Public API ─────────────────────────────────────────────────────────────

export type TopProgressBarMode = "route-change" | "scroll-progress";

interface TopProgressBarProps {
  /**
   * - `"route-change"` — animates on client-side navigation (use once in the
   *   root layout, inside `<Suspense>`). Replaces NavigationProgress.
   * - `"scroll-progress"` — tracks page scroll position after a brief mount
   *   animation. Replaces LoadingBar.
   */
  mode: TopProgressBarMode;
}

/**
 * TopProgressBar — the single fixed-top progress indicator for the app.
 *
 * Both modes render an identical `h-[3px] z-[9999]` bar with the brand
 * teal→cyan gradient; only the progress-tracking logic differs.
 */
export function TopProgressBar({ mode }: TopProgressBarProps) {
  if (mode === "route-change") return <RouteChangeBar />;
  return <ScrollProgressBar />;
}
