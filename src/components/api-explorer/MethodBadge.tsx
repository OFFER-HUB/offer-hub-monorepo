import { cn } from "@/lib/cn";
import type { HttpMethod } from "@/data/api-schema";

const METHOD_CLASSES: Record<HttpMethod, string> = {
  GET: "text-theme-success bg-theme-success/10",
  POST: "text-theme-primary bg-theme-primary/10",
  PUT: "text-theme-warning bg-theme-warning/10",
  PATCH: "text-theme-warning bg-theme-warning/10",
  DELETE: "text-theme-error bg-theme-error/10",
};

interface MethodBadgeProps {
  method: HttpMethod;
  className?: string;
}

export function MethodBadge({ method, className }: MethodBadgeProps) {
  const badgeClass = METHOD_CLASSES[method] || "text-content-secondary bg-content-muted/10";

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono shadow-neu-sunken-subtle",
        badgeClass,
        className
      )}
    >
      {method}
    </span>
  );
}
