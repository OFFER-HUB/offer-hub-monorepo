import { cn } from "@/lib/cn";

type BadgeVariant = "default" | "primary" | "success" | "warning" | "danger";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const STYLES: Record<BadgeVariant, string> = {
  default:
    "bg-[rgba(109,117,143,0.10)] text-[#6D758F] " +
    "dark:bg-[rgba(184,191,208,0.14)] dark:text-[#b8bfd0]",
  primary:
    "bg-[rgba(20,154,155,0.10)] text-[#149A9B] " +
    "dark:bg-[rgba(45,212,191,0.16)] dark:text-[#5eead4]",
  success:
    "bg-[rgba(22,163,74,0.10)] text-[#16a34a] " +
    "dark:bg-[rgba(134,239,172,0.16)] dark:text-[#86efac]",
  warning:
    "bg-[rgba(217,119,6,0.10)] text-[#d97706] " +
    "dark:bg-[rgba(251,191,36,0.16)] dark:text-[#fbbf24]",
  danger:
    "bg-[rgba(220,38,38,0.10)] text-[#dc2626] " +
    "dark:bg-[rgba(252,165,165,0.16)] dark:text-[#fca5a5]",
};

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold shadow-raised-sm",
        STYLES[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
