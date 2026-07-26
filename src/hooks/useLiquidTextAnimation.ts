"use client";

import { useEffect, type RefObject } from "react";

export interface LiquidHighlightColors {
  highlight: string;
  brightest: string;
}

/**
 * Drives the "liquid text" effect: multiple radial-gradient blobs orbiting
 * inside an element via requestAnimationFrame, visible through
 * `background-clip: text`. Respects `prefers-reduced-motion` (falling back
 * to a static gradient) and pauses while the tab is hidden.
 *
 * Extracted from HeroSection as-is. There is currently only one consumer —
 * this is not deduplicating existing copies, just isolating a large,
 * highly bespoke effect out of the component per the hooks-layer issue.
 */
export function useLiquidTextAnimation(
  elementRef: RefObject<HTMLElement | null>,
  colors: LiquidHighlightColors
) {
  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let shouldReduceMotion = mediaQuery.matches;

    const staticGradient = `linear-gradient(135deg, ${colors.highlight} 0%, var(--color-primary) 100%)`;

    const handleMediaChange = (e: MediaQueryListEvent) => {
      shouldReduceMotion = e.matches;
      if (shouldReduceMotion) {
        cancelAnimationFrame(frame);
        el.style.backgroundImage = staticGradient;
      } else {
        frame = requestAnimationFrame(animate);
      }
    };

    mediaQuery.addEventListener("change", handleMediaChange);

    let frame: number;
    let t = 0;
    let paused = false;

    const animate = () => {
      if (paused || shouldReduceMotion) return;
      t += 0.022;

      const b1x = 50 + 28 * Math.sin(t * 0.7);
      const b1y = 50 + 22 * Math.cos(t * 0.5);
      const b2x = 50 + 22 * Math.sin(t * 0.4 + 2.0);
      const b2y = 50 + 28 * Math.cos(t * 0.6 + 1.2);
      const b3x = 50 + 32 * Math.sin(t * 0.85 + 4.2);
      const b3y = 50 + 18 * Math.cos(t * 0.75 + 3.0);
      const b4x = 50 + 18 * Math.sin(t * 1.1 + 1.0);
      const b4y = 50 + 30 * Math.cos(t * 0.95 + 5.1);
      const b5x = 50 + 38 * Math.sin(t * 0.55 + 5.5);
      const b5y = 50 + 24 * Math.cos(t * 0.42 + 4.0);
      const b6x = 50 + 14 * Math.sin(t * 1.3 + 3.0);
      const b6y = 50 + 14 * Math.cos(t * 1.15 + 2.0);

      el.style.backgroundImage = [
        `radial-gradient(ellipse 48% 55% at ${b1x}% ${b1y}%, ${colors.highlight} 0%, var(--color-primary) 45%, color-mix(in srgb, var(--color-primary) 0%, transparent) 82%)`,
        `radial-gradient(ellipse 38% 46% at ${b2x}% ${b2y}%, ${colors.brightest} 0%, ${colors.highlight} 40%, color-mix(in srgb, ${colors.highlight} 0%, transparent) 80%)`,
        `radial-gradient(ellipse 32% 42% at ${b3x}% ${b3y}%, var(--color-accent) 0%, color-mix(in srgb, var(--color-accent) 0%, transparent) 78%)`,
        `radial-gradient(ellipse 28% 38% at ${b4x}% ${b4y}%, var(--color-primary-hover) 0%, color-mix(in srgb, var(--color-primary-hover) 0%, transparent) 78%)`,
        `radial-gradient(ellipse 44% 52% at ${b5x}% ${b5y}%, var(--color-primary) 0%, color-mix(in srgb, var(--color-primary) 0%, transparent) 82%)`,
        `radial-gradient(ellipse 20% 26% at ${b6x}% ${b6y}%, ${colors.brightest} 0%, color-mix(in srgb, ${colors.brightest} 0%, transparent) 72%)`,
        `radial-gradient(ellipse 62% 72% at ${b3x}% ${b2y}%, color-mix(in srgb, var(--color-bg-base) 90%, transparent) 0%, color-mix(in srgb, var(--color-bg-base) 50%, transparent) 40%, color-mix(in srgb, var(--color-bg-base) 0%, transparent) 78%)`,
        `radial-gradient(ellipse 52% 62% at ${b5x}% ${b4y}%, color-mix(in srgb, var(--color-bg-base) 80%, transparent) 0%, color-mix(in srgb, var(--color-bg-base) 38%, transparent) 38%, color-mix(in srgb, var(--color-bg-base) 0%, transparent) 72%)`,
        `radial-gradient(ellipse 42% 50% at ${b1x}% ${b6y}%, color-mix(in srgb, var(--color-bg-base) 65%, transparent) 0%, color-mix(in srgb, var(--color-bg-base) 20%, transparent) 45%, color-mix(in srgb, var(--color-bg-base) 0%, transparent) 70%)`,
      ].join(", ");

      frame = requestAnimationFrame(animate);
    };

    const onVisibility = () => {
      if (document.hidden) {
        paused = true;
        cancelAnimationFrame(frame);
      } else {
        paused = false;
        if (!shouldReduceMotion) {
          frame = requestAnimationFrame(animate);
        }
      }
    };

    document.addEventListener("visibilitychange", onVisibility);

    if (shouldReduceMotion) {
      el.style.backgroundImage = staticGradient;
    } else {
      frame = requestAnimationFrame(animate);
    }

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", onVisibility);
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elementRef, colors.highlight, colors.brightest]);
}
