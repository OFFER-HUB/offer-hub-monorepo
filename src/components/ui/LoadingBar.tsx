"use client";

import { useEffect, useState } from "react";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { ProgressBar } from "@/components/ui/ProgressBar";

/**
 * Scroll progress indicator rendered at the top of the heavy pages.
 *
 * It plays a brief intro animation on mount, then — once the intro finishes —
 * tracks `window.scrollY` and reflects how far down the document the user has
 * scrolled. The shared `ProgressBar` primitive supplies the fixed, full-width
 * gradient bar it shares with `NavigationProgress` (route-change progress).
 */
export function LoadingBar() {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const scrollY = useScrollProgress(!isLoading);

  useEffect(() => {
    setProgress(0.3);
    const timer = setTimeout(() => {
      setProgress(1);
      setTimeout(() => setIsLoading(false), 500);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    setProgress(docHeight > 0 ? scrollY / docHeight : 0);
  }, [isLoading, scrollY]);

  return (
    <ProgressBar
      progress={progress}
      style={{ transition: isLoading ? "transform 0.4s ease" : "none" }}
    />
  );
}
