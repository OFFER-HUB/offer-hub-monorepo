import { cn } from "@/lib/cn";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

const METHOD_CLASSES: Record<HttpMethod, string> = {
  GET: "text-theme-success bg-theme-success/10",
  POST: "text-theme-primary bg-theme-primary/10",
  PUT: "text-theme-warning bg-theme-warning/10",
  PATCH: "text-theme-primary bg-theme-primary/20",
  DELETE: "text-theme-error bg-theme-error/10",
};

interface MethodBadgeProps {
  method: string;
  className?: string;
}

export function MethodBadge({ method, className }: MethodBadgeProps) {
  const normalized = method.toUpperCase() as HttpMethod;
  const classes = METHOD_CLASSES[normalized] ?? "text-content-secondary bg-content-muted/10";

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
