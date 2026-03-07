import { cn } from "@/lib/cn";

type BadgeVariant = "default" | "primary" | "success" | "warning" | "danger";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const STYLES: Record<BadgeVariant, { color: string; bg: string }> = {
  default: { color: "#6D758F", bg: "rgba(109,117,143,0.1)" },
  primary: { color: "#149A9B", bg: "rgba(20,154,155,0.1)" },
  success: { color: "#16a34a", bg: "rgba(22,163,74,0.1)" },
  warning: { color: "#d97706", bg: "rgba(217,119,6,0.1)" },
  danger: { color: "#dc2626", bg: "rgba(220,38,38,0.1)" },
};

export function Badge({ variant = "default", children, className }: BadgeProps) {
  const style = STYLES[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold shadow-raised-sm",
        className
      )}
      style={{ color: style.color, background: style.bg }}
    >
      {children}
    </span>
  );
}
