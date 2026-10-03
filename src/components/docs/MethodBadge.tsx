import type { HttpMethod } from "@/data/api-schema";
import { cn } from "@/lib/cn";

const METHOD_STYLES: Record<
  HttpMethod,
  {
    background: string;
    color: string;
  }
> = {
  GET: {
    background: "color-mix(in srgb, var(--color-success) 14%, transparent)",
    color: "var(--color-success)",
  },
  POST: {
    background: "color-mix(in srgb, var(--color-primary) 14%, transparent)",
    color: "var(--color-primary)",
  },
  PUT: {
    background: "color-mix(in srgb, var(--color-warning) 16%, transparent)",
    color: "var(--color-warning)",
  },
  PATCH: {
    background: "color-mix(in srgb, var(--color-primary) 18%, transparent)",
    color: "var(--color-primary)",
  },
  DELETE: {
    background: "color-mix(in srgb, var(--color-error) 16%, transparent)",
    color: "var(--color-error)",
  },
};

interface MethodBadgeProps {
  method: HttpMethod;
  className?: string;
}

export function MethodBadge({ method, className }: MethodBadgeProps) {
  const style = METHOD_STYLES[method];

  return (
    <span
      aria-label={`HTTP method ${method}`}
      className={cn(
        "inline-flex items-center justify-center rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] font-mono leading-none shadow-neu-raised-sm",
        className
      )}
      style={{ background: style.background, color: style.color }}
    >
      {method}
    </span>
  );
}
