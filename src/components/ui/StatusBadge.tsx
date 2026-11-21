import { cn } from "@/lib/cn";
import { statusColors, type StatusTone } from "./status-colors";

interface StatusBadgeProps {
  variant?: StatusTone;
  children: React.ReactNode;
  className?: string;
}

export function StatusBadge({ variant = "default", children, className }: StatusBadgeProps) {
  const colors = statusColors[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold shadow-neu-raised-sm",
        colors.bg,
        colors.text,
        className
      )}
    >
      {children}
    </span>
  );
}
