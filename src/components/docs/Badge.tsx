import { cn } from "@/lib/cn";
import { statusColors, type StatusSeverity } from "@/lib/statusColors";

export type BadgeVariant = "default" | "primary" | "success" | "warning" | "danger";

const VARIANT_SEVERITY: Record<BadgeVariant, StatusSeverity> = {
  default: "neutral",
  primary: "primary",
  success: "success",
  warning: "warning",
  danger: "error",
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "default", children, className }: BadgeProps) {
  const { badge } = statusColors[VARIANT_SEVERITY[variant]];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold shadow-neu-raised-sm",
        badge,
        className,
      )}
    >
      {children}
    </span>
  );
}
