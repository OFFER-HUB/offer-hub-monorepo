import type { CSSProperties } from "react";

interface TopProgressBarProps {
  /** Fill amount from 0 to 1. */
  progress: number;
  transition?: string;
  /** Fades the whole bar; used by route-change progress to hide when idle. */
  opacity?: number;
  glow?: boolean;
  className?: string;
}

const GLOW_COLOR = "#22e0e2";

/**
 * The fixed 3px gradient bar shared by LoadingBar (page-load and scroll
 * progress) and NavigationProgress (route-change progress), so both render
 * the same track, gradient and stacking.
 */
export function TopProgressBar({
  progress,
  transition,
  opacity,
  glow = false,
  className = "",
}: TopProgressBarProps) {
  const containerStyle: CSSProperties | undefined =
    opacity === undefined ? undefined : { opacity, transition: "opacity 0.2s" };

  return (
    <div
      className={`fixed top-0 left-0 right-0 h-[3px] z-[9999] ${className}`}
      style={containerStyle}
    >
      <div
        className="h-full origin-left bg-gradient-to-r from-theme-primary to-[#22e0e2]"
        style={{ transform: `scaleX(${progress})`, transition }}
      />
      {glow && (
        <div
          className="absolute top-0 right-0 h-full w-24 opacity-50"
          style={{
            background: `linear-gradient(to right, transparent, ${GLOW_COLOR})`,
            transform: `translateX(${progress < 1 ? 0 : 100}%)`,
          }}
        />
      )}
    </div>
  );
}
