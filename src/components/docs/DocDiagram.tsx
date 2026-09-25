"use client";

import { useState, useEffect, useRef } from "react";
import { Maximize2, X, ImageOff } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/cn";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

export interface DocDiagramProps {
  /** SVG path used in light mode, e.g. "/diagrams/payment-flow-light.svg" */
  lightSrc: string;
  /** SVG path used in dark mode. Falls back to lightSrc if omitted. */
  darkSrc?: string;
  /** Accessible label — required for role="img" */
  alt: string;
  /** Optional visible caption rendered under the diagram */
  caption?: string;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Inner: zoom/pan modal (reuses the established DiagramZoomModal pattern)
// ─────────────────────────────────────────────────────────────────────────────

interface ZoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  alt: string;
  caption?: string;
}

function DiagramZoomPanel({ isOpen, onClose, src, alt, caption }: ZoomModalProps) {
  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-bg-base/90 backdrop-blur-sm p-4 md:p-8"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={caption ?? alt}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.22 }}
            className="relative w-full max-w-6xl max-h-[90vh] overflow-auto rounded-[2.5rem] bg-bg-elevated shadow-neu-raised-l2 flex flex-col p-6 md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between mb-6 shrink-0">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-content-muted">
                {caption ?? alt}
              </span>
              <button
                onClick={onClose}
                className="rounded-2xl bg-bg-base shadow-neu-raised-sm p-2.5 hover:shadow-neu-sunken transition-[color,box-shadow] text-content-secondary hover:text-content-primary"
                aria-label="Close diagram"
              >
                <X size={16} />
              </button>
            </div>

            {/* Diagram — full size, pan via overflow */}
            <div className="flex-1 w-full rounded-[2rem] bg-bg-base shadow-neu-sunken p-6 overflow-auto flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={alt}
                className="max-w-none w-full h-auto"
                draggable={false}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main: DocDiagram
// ─────────────────────────────────────────────────────────────────────────────

export function DocDiagram({
  lightSrc,
  darkSrc,
  alt,
  caption,
  className,
}: DocDiagramProps) {
  const { resolvedTheme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Swap source based on resolved theme; fall back to lightSrc for dark if not provided
  const src = resolvedTheme === "dark" && darkSrc ? darkSrc : lightSrc;

  // Lazy load: only start loading when container enters the viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Reset error state when the source changes (e.g. theme toggle → different file path)
  useEffect(() => {
    setHasError(false);
  }, [src]);

  const activeSrc = isVisible ? src : undefined;

  return (
    <>
      <figure className={cn("my-10", className)}>
        {/* ── Neumorphic frame ── */}
        <div
          ref={containerRef}
          className="rounded-3xl overflow-hidden bg-bg-elevated shadow-neu-raised relative group"
        >
          {/* Header bar — sunken, matches CodeBlock / MermaidDiagram chrome */}
          <div className="flex items-center justify-between px-6 py-4 rounded-t-3xl bg-bg-sunken shadow-neu-sunken-subtle">
            <div className="flex items-center gap-3.5">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-theme-primary/50" />
                <span className="w-2.5 h-2.5 rounded-full bg-theme-primary/30" />
                <span className="w-2.5 h-2.5 rounded-full bg-theme-primary/20" />
              </div>
              {caption && (
                <span className="text-[11px] font-black uppercase tracking-[0.18em] font-mono text-content-secondary/80 truncate max-w-[240px]">
                  {caption}
                </span>
              )}
            </div>

            {/* Zoom trigger — hidden when errored */}
            {!hasError && (
              <button
                type="button"
                onClick={() => setIsZoomOpen(true)}
                aria-label={`Expand diagram: ${alt}`}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10.5px] font-black uppercase tracking-widest text-content-secondary bg-bg-base shadow-neu-raised-sm hover:text-content-primary hover:bg-theme-primary/10 active:scale-95 transition-[color,background-color,transform] duration-300"
              >
                <Maximize2 size={13} aria-hidden="true" />
                <span className="hidden sm:inline">Expand</span>
              </button>
            )}
          </div>

          {/* Diagram area */}
          <div className="p-8 flex items-center justify-center min-h-[200px] bg-bg-elevated overflow-x-auto">
            {/* Loading skeleton */}
            {!isVisible && (
              <div
                className="w-full animate-pulse rounded-2xl bg-bg-sunken shadow-neu-sunken"
                style={{ minHeight: 200 }}
                aria-hidden="true"
              />
            )}

            {/* Error fallback */}
            {isVisible && hasError && (
              <div
                role="img"
                aria-label={alt}
                className="flex flex-col items-center gap-3 py-10 text-content-muted"
              >
                <ImageOff size={32} aria-hidden="true" className="text-theme-primary/40" />
                <p className="text-sm font-medium">Diagram unavailable</p>
                <p className="text-xs text-content-muted/60">{alt}</p>
              </div>
            )}

            {/* The SVG image — theme swap without layout shift */}
            {isVisible && !hasError && activeSrc && (
              /*
               * role="img" + aria-label satisfy SC 1.1.1 (Non-text Content).
               * We use a plain <img> instead of next/image because these are
               * developer-authored SVG assets whose dimensions are unknown at
               * build time, and next/image's required width/height would add
               * layout-shift risk for arbitrary SVG viewBoxes.
               */
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={src} // force re-render on theme change so the correct file loads
                src={activeSrc}
                alt={alt}
                role="img"
                className="max-w-full h-auto transition-opacity duration-300"
                onError={() => setHasError(true)}
                draggable={false}
                loading="lazy"
              />
            )}
          </div>
        </div>

        {/* Caption */}
        {caption && (
          <figcaption className="mt-3 text-center text-sm font-medium text-content-secondary">
            {caption}
          </figcaption>
        )}
      </figure>

      {/* Zoom modal */}
      {!hasError && activeSrc && (
        <DiagramZoomPanel
          isOpen={isZoomOpen}
          onClose={() => setIsZoomOpen(false)}
          src={activeSrc}
          alt={alt}
          caption={caption}
        />
      )}
    </>
  );
}
