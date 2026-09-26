"use client";

import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

/**
 * Brand accent that terminates the top progress bars' gradient.
 *
 * Both `LoadingBar` (scroll progress, rendered on the heavy pages) and
 * `NavigationProgress` (route-change progress, rendered once in the root
 * layout) paint an identical fixed bar at the top of the viewport with the same
 * `from-theme-primary to-[#22e0e2]` gradient. To stop those two primitives from
 * drifting apart, the gradient and the fixed positioning are declared exactly
 * once here and shared by both.
 */
export const PROGRESS_BAR_GRADIENT = "bg-gradient-to-r from-theme-primary to-[#22e0e2]";
export const PROGRESS_BAR_ACCENT = "#22e0e2";
export const PROGRESS_BAR_ROOT = "fixed top-0 left-0 right-0 h-[3px] z-[9999] origin-left";

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  /** Progress ratio, `0` (empty) → `1` (full). */
  progress: number;
}

/**
 * Shared visual primitive for the top-of-viewport progress indicator.
 *
 * `LoadingBar` drives it with scroll position (after an intro animation) while
 * `NavigationProgress` drives it from route-change progress; both share this
 * single rendering of the fixed, full-width, gradient bar so their styling can
 * never diverge.
 */
export function ProgressBar({ progress, className, style, ...props }: ProgressBarProps) {
  return (
    <div
      className={cn(PROGRESS_BAR_ROOT, PROGRESS_BAR_GRADIENT, className)}
      style={{ transform: `scaleX(${progress})`, ...style }}
      {...props}
    />
  );
}
