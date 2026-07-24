"use client";

import { useCallback } from "react";
import { ChevronUp } from "lucide-react";
import { useScrollProgress } from "@/hooks/useScrollProgress";

const SCROLL_THRESHOLD = 400;

export function BackToTopButton() {
  const scrollY = useScrollProgress();
  const isVisible = scrollY > SCROLL_THRESHOLD;

  const scrollToTop = useCallback(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "instant" : "smooth",
    });
  }, []);

  if (!isVisible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      className="fixed z-40 bottom-20 right-6 md:bottom-52 md:right-6 flex h-11 w-11 items-center justify-center rounded-full bg-bg-base text-[#149A9B] shadow-neu-raised transition-shadow hover:shadow-neu-raised-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-[#149A9B]/50 print:hidden"
    >
      <ChevronUp size={22} aria-hidden />
    </button>
  );
}
