import { cn } from "@/lib/cn";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

const METHOD_CLASSES: Record<HttpMethod, string> = {
  GET: "text-theme-success bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)]",
  POST: "text-theme-primary bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]",
  PUT: "text-theme-warning bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)]",
  PATCH: "text-theme-primary bg-[color-mix(in_srgb,var(--color-primary)_20%,transparent)]",
  DELETE: "text-theme-error bg-[color-mix(in_srgb,var(--color-error)_10%,transparent)]",
};

interface MethodBadgeProps {
  method: string;
  className?: string;
}

export function MethodBadge({ method, className }: MethodBadgeProps) {
  const normalized = method.toUpperCase() as HttpMethod;
  const classes = METHOD_CLASSES[normalized] ?? "text-content-secondary bg-[color-mix(in_srgb,var(--color-text-muted)_10%,transparent)]";

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono",
        classes,
        className,
      )}
    >
      {normalized}
    </span>
  );
}
