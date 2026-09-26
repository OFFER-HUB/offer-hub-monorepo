/**
 * Semantic severity levels shared across every badge/severity primitive in the
 * product (HTTP method badges, issue priority, changelog release badges, the
 * Blueprint timeline, docs callouts, etc.).
 *
 * Every consumer used to hard-code its own color tokens — hard-coded hex /
 * rgba in `MethodBadge`, literal hex in the changelog badge, and duplicated
 * entries in `evolution-timeline/config.ts`. That drift produced inconsistent
 * dark-mode handling: e.g. `MethodBadge` painted a light-mode `rgba(...)`
 * background that never adapted to dark mode, while the docs `Badge` used
 * theme-aware classes.
 *
 * Centralising the palette here means a badge colour is defined *once* and is
 * authored entirely in terms of theme CSS variables, so every badge responds to
 * light/dark mode identically by construction.
 */
export type StatusSeverity = "success" | "warning" | "error" | "primary" | "neutral";

export interface StatusColor {
  /** Human-readable label, for `aria-label` / debugging. */
  label: string;
  /** Tailwind text colour class (theme-aware). */
  text: string;
  /** Tailwind background class with opacity (theme-aware). */
  bg: string;
  /** Tailwind border class with opacity (theme-aware). */
  border: string;
  /** Solid (full-opacity) Tailwind background class for dots / icons. */
  solidBg: string;
  /** Pre-built `${bg} ${text}` class string for pill badges. */
  badge: string;
  /** Raw CSS colour (a `var(--color-*)`) for inline styles / icon colours. */
  color: string;
}

export const statusColors: Record<StatusSeverity, StatusColor> = {
  success: {
    label: "Success",
    text: "text-theme-success",
    bg: "bg-theme-success/10",
    border: "border-theme-success/30",
    solidBg: "bg-theme-success",
    badge: "bg-theme-success/10 text-theme-success",
    color: "var(--color-success)",
  },
  warning: {
    label: "Warning",
    text: "text-theme-warning",
    bg: "bg-theme-warning/10",
    border: "border-theme-warning/30",
    solidBg: "bg-theme-warning",
    badge: "bg-theme-warning/10 text-theme-warning",
    color: "var(--color-warning)",
  },
  error: {
    label: "Error",
    text: "text-theme-error",
    bg: "bg-theme-error/10",
    border: "border-theme-error/30",
    solidBg: "bg-theme-error",
    badge: "bg-theme-error/10 text-theme-error",
    color: "var(--color-error)",
  },
  primary: {
    label: "Primary",
    text: "text-theme-primary",
    bg: "bg-theme-primary/10",
    border: "border-theme-primary/40",
    solidBg: "bg-theme-primary",
    badge: "bg-theme-primary/10 text-theme-primary",
    color: "var(--color-primary)",
  },
  neutral: {
    label: "Neutral",
    text: "text-content-muted",
    bg: "bg-content-muted/10",
    border: "border-content-muted/20",
    solidBg: "bg-content-muted",
    badge: "bg-content-muted/10 text-content-muted",
    color: "var(--color-text-muted)",
  },
};
