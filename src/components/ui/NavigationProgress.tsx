"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    setProgress(0);

    // Animate progress: quick start, then slow down
    const steps = [
      { value: 30, delay: 0 },
      { value: 50, delay: 100 },
      { value: 70, delay: 300 },
      { value: 85, delay: 600 },
    ];

    steps.forEach(({ value, delay }) => {
      setTimeout(() => {
        setProgress((prev) => (prev < value ? value : prev));
      }, delay);
    });
  }, []);

  const completeLoading = useCallback(() => {
    setProgress(100);
    setTimeout(() => {
      setIsLoading(false);
      setProgress(0);
    }, 200);
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
    <div
      className="fixed top-0 left-0 right-0 h-[3px] z-[9999] pointer-events-none"
      style={{ opacity: isLoading ? 1 : 0, transition: "opacity 0.2s" }}
    >
      <div
        className="h-full bg-gradient-to-r from-[#149A9B] to-[#22e0e2]"
        style={{
          width: `${progress}%`,
          transition: progress === 100 ? "width 0.1s ease-out" : "width 0.4s ease",
        }}
      />
      {/* Glow effect at the end */}
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
