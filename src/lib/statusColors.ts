/**
 * Shared status/severity colour tokens.
 *
 * All values use CSS-variable-backed Tailwind classes so they automatically
 * adapt to light and dark mode — no hardcoded hex values here.
 *
 * Use these wherever a coloured badge, dot, or label needs a semantic colour:
 * difficulty levels, HTTP methods, release types, phase statuses, etc.
 */

export interface StatusColorSet {
  /** Tailwind text-color class */
  text: string;
  /** Tailwind background-color class (with transparency) */
  bg: string;
  /** Tailwind border-color class (with transparency) — optional */
  border?: string;
}

// ─── Semantic severity ──────────────────────────────────────────────────────

export const statusColors = {
  // difficulty / test results
  easy:    { text: "text-theme-success",   bg: "bg-theme-success/10"  } satisfies StatusColorSet,
  medium:  { text: "text-theme-warning",   bg: "bg-theme-warning/10"  } satisfies StatusColorSet,
  hard:    { text: "text-theme-error",     bg: "bg-theme-error/10"    } satisfies StatusColorSet,

  // generic semantic states
  success: { text: "text-theme-success",   bg: "bg-theme-success/10"  } satisfies StatusColorSet,
  warning: { text: "text-theme-warning",   bg: "bg-theme-warning/10"  } satisfies StatusColorSet,
  error:   { text: "text-theme-error",     bg: "bg-theme-error/10"    } satisfies StatusColorSet,
  info:    { text: "text-theme-primary",   bg: "bg-theme-primary/10"  } satisfies StatusColorSet,
  muted:   { text: "text-content-secondary", bg: "bg-content-muted/10" } satisfies StatusColorSet,

  // badge-specific extra variants
  breaking: {
    text:   "text-theme-error",
    bg:     "bg-theme-error/15",
    border: "border border-theme-error/20",
  } satisfies StatusColorSet,

  // HTTP methods
  get:    { text: "text-theme-success",   bg: "bg-theme-success/10"  } satisfies StatusColorSet,
  post:   { text: "text-theme-primary",   bg: "bg-theme-primary/10"  } satisfies StatusColorSet,
  put:    { text: "text-theme-warning",   bg: "bg-theme-warning/10"  } satisfies StatusColorSet,
  delete: { text: "text-theme-error",     bg: "bg-theme-error/10"    } satisfies StatusColorSet,

  // release types
  release:    { text: "text-theme-success",    bg: "bg-theme-success/10"   } satisfies StatusColorSet,
  prerelease: { text: "text-theme-warning",    bg: "bg-theme-warning/10"   } satisfies StatusColorSet,
  draft:      { text: "text-content-secondary", bg: "bg-content-secondary/10" } satisfies StatusColorSet,

  // phase statuses (for evolution-timeline)
  completed:   { text: "text-theme-success",    bg: "bg-theme-success/10",  border: "border-theme-success/30"  } satisfies StatusColorSet,
  "in-progress": { text: "text-theme-primary",  bg: "bg-theme-primary/10",  border: "border-theme-primary/40"  } satisfies StatusColorSet,
  planned:     { text: "text-content-secondary", bg: "bg-content-muted/10", border: "border-content-muted/20"  } satisfies StatusColorSet,
} as const;

export type StatusColorKey = keyof typeof statusColors;
