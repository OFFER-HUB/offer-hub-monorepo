export type StatusTone = "default" | "muted" | "primary" | "success" | "warning" | "danger";

export interface StatusColor {
  text: string;
  bg: string;
  border: string;
  /** CSS variable backing the tone, for inline styles that cannot use classes. */
  cssVar: string;
  dotBg: string;
}

/**
 * Single palette for status, severity and HTTP-method indicators. Every value
 * resolves to a theme token, so light and dark mode follow the CSS variables.
 * Lives under components/ so Tailwind's content scan sees the class names.
 * Tints use color-mix because Tailwind 3 emits nothing for opacity-suffixed
 * token classes (e.g. bg-theme-success at 10%) on CSS-variable colors; class names must stay literal for the scanner.
 */
export const statusColors: Record<StatusTone, StatusColor> = {
  default: {
    text: "text-content-secondary",
    bg: "bg-[color-mix(in_srgb,var(--color-text-muted)_12%,transparent)]",
    border: "border-[color-mix(in_srgb,var(--color-text-muted)_20%,transparent)]",
    cssVar: "var(--color-text-secondary)",
    dotBg: "bg-content-secondary",
  },
  muted: {
    text: "text-content-muted",
    bg: "bg-[color-mix(in_srgb,var(--color-text-muted)_12%,transparent)]",
    border: "border-[color-mix(in_srgb,var(--color-text-muted)_20%,transparent)]",
    cssVar: "var(--color-text-muted)",
    dotBg: "bg-content-muted",
  },
  primary: {
    text: "text-theme-primary",
    bg: "bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]",
    border: "border-[color-mix(in_srgb,var(--color-primary)_40%,transparent)]",
    cssVar: "var(--color-primary)",
    dotBg: "bg-theme-primary",
  },
  success: {
    text: "text-theme-success",
    bg: "bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)]",
    border: "border-[color-mix(in_srgb,var(--color-success)_30%,transparent)]",
    cssVar: "var(--color-success)",
    dotBg: "bg-theme-success",
  },
  warning: {
    text: "text-theme-warning",
    bg: "bg-[color-mix(in_srgb,var(--color-warning)_12%,transparent)]",
    border: "border-[color-mix(in_srgb,var(--color-warning)_30%,transparent)]",
    cssVar: "var(--color-warning)",
    dotBg: "bg-theme-warning",
  },
  danger: {
    text: "text-theme-error",
    bg: "bg-[color-mix(in_srgb,var(--color-error)_12%,transparent)]",
    border: "border-[color-mix(in_srgb,var(--color-error)_30%,transparent)]",
    cssVar: "var(--color-error)",
    dotBg: "bg-theme-error",
  },
};
