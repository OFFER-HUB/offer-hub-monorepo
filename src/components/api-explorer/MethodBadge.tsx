import { cn } from "@/lib/cn";
import { StatusBadge } from "@/components/ui/Badge";
import type { HttpMethod } from "@/data/api-schema";

interface MethodBadgeProps {
  method: HttpMethod;
  className?: string;
}

/**
 * Renders an HTTP-method pill (GET, POST, PUT, DELETE).
 * Delegates colour logic to StatusBadge / statusColors — no hardcoded hex.
 */
export function MethodBadge({ method, className }: MethodBadgeProps) {
  return (
    <StatusBadge
      variant={method.toLowerCase() as "get" | "post" | "put" | "delete"}
      label={method}
      className={cn("font-semibold font-mono", className)}
    />
  );
}
