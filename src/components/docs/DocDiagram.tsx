"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import { ImageOff, Maximize2, Minus, Plus, RotateCcw, X } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { cn } from "@/lib/cn";

export type DocDiagramProps = {
  /** Diagram id; resolves to `/diagrams/<name>-light.svg` and `<name>-dark.svg`. */
  name: string;
  caption?: string;
  alt?: string;
  className?: string;
  /** Frame aspect ratio (width / height) reserving space so swaps never shift layout. */
  aspectRatio?: number;
};

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const SCALE_STEP = 0.25;
const PAN_STEP = 32;
const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Resolves a diagram name to its theme variant. Rejects traversal/empty names. */
function diagramSrc(name: string, theme: "light" | "dark"): string | null {
  const normalized = name.trim().replace(/^\/+/, "");
  if (!normalized || normalized.includes("..")) return null;
  return `/diagrams/${normalized}-${theme}.svg`;
}

function clampOffset(
  x: number,
  y: number,
  scale: number,
  canvas: HTMLElement | null,
): { x: number; y: number } {
  if (scale <= MIN_SCALE || !canvas) return { x: 0, y: 0 };
  const rect = canvas.getBoundingClientRect();
  const maxX = ((scale - 1) * rect.width) / 2;
  const maxY = ((scale - 1) * rect.height) / 2;
  return {
    x: Math.min(maxX, Math.max(-maxX, x)),
    y: Math.min(maxY, Math.max(-maxY, y)),
  };
}

function trapFocus(event: ReactKeyboardEvent<HTMLElement>, container: HTMLElement | null) {
  if (!container) return;
  const focusable = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
  if (focusable.length === 0) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function DiagramFallback({ name }: { name: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
      <span
        aria-hidden="true"
        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-bg-base text-content-muted shadow-neu-raised-sm"
      >
        <ImageOff size={20} />
      </span>
      <p className="text-sm font-semibold text-content-primary">Diagram unavailable</p>
      <p className="max-w-sm text-xs leading-relaxed text-content-secondary">
        No generated SVG exists for{" "}
        <code className="rounded-md bg-bg-base px-1.5 py-0.5 font-mono text-[0.9em] text-content-primary">
          {name}
        </code>{" "}
        yet. The diagram pipeline publishes a light and a dark variant here.
      </p>
    </div>
  );
}

type LightboxProps = {
  name: string;
  label: string;
  caption?: string;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
};

function DocDiagramLightbox({ name, label, caption, returnFocusRef, onClose }: LightboxProps) {
  useBodyScrollLock(true);

  const { resolvedTheme } = useTheme();
  const dialogRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [hasError, setHasError] = useState(false);

  const src = diagramSrc(name, resolvedTheme);

  const zoomBy = useCallback((delta: number) => {
    setScale((current) => {
      const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, Number((current + delta).toFixed(2))));
      if (next <= MIN_SCALE) setOffset({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  const panBy = useCallback((dx: number, dy: number) => {
    setOffset((current) => clampOffset(current.x + dx, current.y + dy, scale, canvasRef.current));
  }, [scale]);

  // Focus the close affordance on open and hand focus back to the trigger on close.
  useEffect(() => {
    const previous = returnFocusRef.current;
    closeButtonRef.current?.focus();
    return () => {
      previous?.focus();
    };
  }, [returnFocusRef]);

  // Escape always closes, even if focus somehow left the dialog.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // Wheel zoom has to be non-passive to stop the page scrolling behind the modal.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      zoomBy(event.deltaY < 0 ? SCALE_STEP : -SCALE_STEP);
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", onWheel);
  }, [zoomBy]);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Tab") {
      trapFocus(event, dialogRef.current);
      return;
    }
    if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      zoomBy(SCALE_STEP);
      return;
    }
    if (event.key === "-" || event.key === "_") {
      event.preventDefault();
      zoomBy(-SCALE_STEP);
      return;
    }
    if (event.key === "0") {
      event.preventDefault();
      reset();
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      panBy(-PAN_STEP, 0);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      panBy(PAN_STEP, 0);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      panBy(0, -PAN_STEP);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      panBy(0, PAN_STEP);
    }
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (scale <= MIN_SCALE) return;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: offset.x,
      originY: offset.y,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    setOffset(
      clampOffset(
        drag.originX + (event.clientX - drag.startX),
        drag.originY + (event.clientY - drag.startY),
        scale,
        canvasRef.current,
      ),
    );
  };

  const handlePointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  };

  const controlClass =
    "flex h-10 w-10 items-center justify-center rounded-xl bg-bg-base text-content-secondary shadow-neu-raised-sm transition-[color,box-shadow] duration-200 hover:text-content-primary hover:shadow-neu-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-bg-base/90 p-3 backdrop-blur-sm md:p-8"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${label} — enlarged diagram`}
        onKeyDown={handleKeyDown}
        className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[2.5rem] bg-bg-elevated p-4 shadow-neu-raised-l2 md:p-6"
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <span className="min-w-0 truncate text-xs font-bold uppercase tracking-[0.2em] text-content-muted">
            {caption || name}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => zoomBy(-SCALE_STEP)}
              disabled={scale <= MIN_SCALE}
              aria-label="Zoom out"
              className={controlClass}
            >
              <Minus size={16} aria-hidden="true" />
            </button>
            <span
              className="min-w-12 text-center font-mono text-xs text-content-secondary"
              aria-live="polite"
            >
              {Math.round(scale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => zoomBy(SCALE_STEP)}
              disabled={scale >= MAX_SCALE}
              aria-label="Zoom in"
              className={controlClass}
            >
              <Plus size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset zoom"
              className={controlClass}
            >
              <RotateCcw size={16} aria-hidden="true" />
            </button>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close enlarged diagram"
              className={controlClass}
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div
          ref={canvasRef}
          className={cn(
            "relative min-h-[45vh] flex-1 overflow-hidden rounded-[2rem] bg-bg-base shadow-neu-sunken",
            scale > MIN_SCALE ? "cursor-grab touch-none active:cursor-grabbing" : "",
          )}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
        >
          {hasError || !src ? (
            <DiagramFallback name={name} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- generated SVG variants are served as static assets
            <img
              src={src}
              alt={label}
              draggable={false}
              onError={() => setHasError(true)}
              className="absolute inset-0 m-auto max-h-full max-w-full select-none object-contain p-6 transition-transform duration-150"
              style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})` }}
            />
          )}
        </div>

        {caption && (
          <p className="mt-3 text-center text-sm font-medium text-content-secondary">{caption}</p>
        )}
        <p className="mt-1 text-center text-[11px] text-content-muted">
          Drag to pan · scroll or +/− to zoom · Esc to close
        </p>
      </div>
    </div>
  );
}

/**
 * Renders a pre-generated diagram with light/dark SVG variants.
 *
 * The frame reserves an aspect ratio, so switching themes never shifts the page.
 * The diagram opens a keyboard-accessible zoom/pan modal, and a missing asset
 * falls back to a labelled empty state instead of a broken image.
 */
export function DocDiagram({
  name,
  caption,
  alt,
  className,
  aspectRatio = 16 / 9,
}: DocDiagramProps) {
  const { resolvedTheme } = useTheme();
  const [hasError, setHasError] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const label = alt?.trim() || caption?.trim() || name;
  const src = diagramSrc(name, resolvedTheme);

  // A new name or theme gets a fresh chance to load.
  useEffect(() => {
    setHasError(false);
  }, [src]);

  // Warm the opposite variant so the swap is instant once the theme changes.
  useEffect(() => {
    const other = diagramSrc(name, resolvedTheme === "dark" ? "light" : "dark");
    if (!other) return;
    const preload = new window.Image();
    preload.src = other;
  }, [name, resolvedTheme]);

  return (
    <figure className={cn("my-8", className)}>
      <div className="rounded-3xl bg-bg-elevated p-3 shadow-neu-raised">
        <div
          className="relative w-full overflow-hidden rounded-2xl bg-bg-sunken shadow-neu-sunken"
          style={{ aspectRatio: String(aspectRatio) }}
        >
          {hasError || !src ? (
            <DiagramFallback name={name} />
          ) : (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- generated SVG variants are served as static assets */}
              <img
                src={src}
                alt={label}
                role="img"
                loading="lazy"
                decoding="async"
                onError={() => setHasError(true)}
                className="absolute inset-0 h-full w-full object-contain p-4"
              />
              <button
                ref={triggerRef}
                type="button"
                onClick={() => setIsZoomOpen(true)}
                aria-label={`Open larger view of ${label}`}
                className="group absolute inset-0 flex items-end justify-end rounded-2xl p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none flex h-10 w-10 items-center justify-center rounded-xl bg-bg-base text-content-secondary shadow-neu-raised-sm transition-[color,box-shadow] duration-200 group-hover:text-content-primary group-hover:shadow-neu-sunken"
                >
                  <Maximize2 size={16} />
                </span>
              </button>
            </>
          )}
        </div>
      </div>

      {caption && (
        <figcaption className="mt-3 text-center text-sm font-medium text-content-secondary">
          {caption}
        </figcaption>
      )}

      {isZoomOpen && !hasError && (
        <DocDiagramLightbox
          name={name}
          label={label}
          caption={caption}
          returnFocusRef={triggerRef}
          onClose={() => setIsZoomOpen(false)}
        />
      )}
    </figure>
  );
}
