"use client";

import { useEffect, useState } from "react";

/**
 * Tracks `window.scrollY`, throttled to one update per animation frame via
 * the standard `ticking` ref pattern. Centralizes the RAF-throttled scroll
 * listener that was previously re-implemented in several components
 * (LoadingBar, BackToTopButton, SectionNav, Navbar, UseCasesClient).
 *
 * Consumers derive whatever they need from the returned value (a progress
 * ratio, a threshold boolean, a pinned/sticky check against a ref, etc.).
 *
 * @param enabled When false, no listener is attached and the last known
 *   value is returned. Useful for components that only want to track scroll
 *   after some other condition is met (e.g. LoadingBar waits until its
 *   intro animation finishes before it starts tracking scroll).
 */
export function useScrollProgress(enabled: boolean = true): number {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [enabled]);

  return scrollY;
}