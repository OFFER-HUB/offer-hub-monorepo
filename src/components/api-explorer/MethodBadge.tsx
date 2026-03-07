import { cn } from "@/lib/cn";
import type { HttpMethod } from "@/data/api-schema";

const METHOD_STYLES: Record<HttpMethod, { color: string; bg: string }> = {
  GET: { color: "#16a34a", bg: "rgba(22,163,74,0.12)" },
  POST: { color: "#149A9B", bg: "rgba(20,154,155,0.12)" },
  PUT: { color: "#d97706", bg: "rgba(217,119,6,0.12)" },
  DELETE: { color: "#dc2626", bg: "rgba(220,38,38,0.12)" },
};

interface MethodBadgeProps {
  method: HttpMethod;
  className?: string;
}

export function MethodBadge({ method, className }: MethodBadgeProps) {
  const style = METHOD_STYLES[method];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono",
        className
      )}
      style={{ color: style.color, background: style.bg }}
    >
      {method}
    </span>
  );
}
