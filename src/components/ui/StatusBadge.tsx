import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { statusColors, type StatusTone } from "./status-colors";

interface StatusBadgeProps {
  variant?: StatusTone;
  children: ReactNode;
  /** Replaces the tone dot, e.g. a status icon. It is decorative (aria-hidden). */
  icon?: ReactNode;
  className?: string;
}

/**
 * The shared Badge: a flat pill (rounded-full, no shadow) tinted with the
 * tone's color-mix background from status-colors.ts.
 *
 * The label always uses text-content-primary: tone-colored text on its own
 * 12% tint falls below 4.5:1 in light mode for most tones, so the tone is
 * carried by the tint and the leading dot instead.
 */
export function StatusBadge({ variant = "default", children, icon, className }: StatusBadgeProps) {
  const colors = statusColors[variant];

  return (
    <span
      data-tone={variant}
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold text-content-primary",
        colors.bg,
        className,
      )}
    >
      {icon ? (
        <span aria-hidden="true" className={cn("inline-flex shrink-0", colors.text)}>
          {icon}
        </span>
      ) : (
        <span aria-hidden="true" className={cn("h-1.5 w-1.5 shrink-0 rounded-full", colors.dotBg)} />
      )}
      {children}
    </span>
  );
}
