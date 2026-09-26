import { cn } from "@/lib/cn";
import { statusColors, type StatusSeverity } from "@/lib/statusColors";
import type { HttpMethod } from "@/data/api-schema";

/**
 * Maps each HTTP method to the semantic severity that colours its badge.
 * The palette itself lives in the shared `statusColors` module so the colour
 * tokens can never drift from the rest of the product.
 */
const METHOD_SEVERITY: Record<HttpMethod, StatusSeverity> = {
  GET: "success",
  POST: "primary",
  PUT: "warning",
  DELETE: "error",
};

interface MethodBadgeProps {
  method: HttpMethod;
  className?: string;
}

export function MethodBadge({ method, className }: MethodBadgeProps) {
  const { badge } = statusColors[METHOD_SEVERITY[method]];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono",
        badge,
        className,
      )}
    >
      {method}
    </span>
  );
}
