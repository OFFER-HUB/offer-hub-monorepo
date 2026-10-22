"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { TopProgressBar } from "./TopProgressBar";

/** Route-change progress, mounted once in the root layout. See LoadingBar for per-page load and scroll progress. */
export function NavigationProgress() {
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
    if (completeTimerRef.current !== null) {
      clearTimeout(completeTimerRef.current);
    }
    setProgress(100);
    completeTimerRef.current = setTimeout(() => {
      setIsLoading(false);
      setProgress(0);
      completeTimerRef.current = null;
    }, 200);
  }, []);

  useEffect(() => {
    return () => {
      stepTimerRefs.current.forEach(clearTimeout);
      if (completeTimerRef.current !== null) clearTimeout(completeTimerRef.current);
    };
  }, []);

  // Listen for route changes
  useEffect(() => {
    completeLoading();
  }, [pathname, searchParams, completeLoading]);

  // Listen for click events on links
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");

      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Check if it's an internal navigation link
      const isInternal =
        href.startsWith("/") ||
        href.startsWith(window.location.origin);
      const isSamePageAnchor = href.startsWith("#");
      const isNewTab =
        anchor.target === "_blank" ||
        e.metaKey ||
        e.ctrlKey;

      if (isInternal && !isSamePageAnchor && !isNewTab) {
        // Check if navigating to a different page
        const url = new URL(href, window.location.origin);
        if (url.pathname !== pathname) {
          startLoading();
        }
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [pathname, startLoading]);

  if (!isLoading && progress === 0) {
    return null;
  }

  return (
    <TopProgressBar
      className="pointer-events-none"
      progress={progress / 100}
      opacity={isLoading ? 1 : 0}
      transition={progress === 100 ? "transform 0.1s ease-out" : "transform 0.4s ease"}
      glow
    />
  );
}
