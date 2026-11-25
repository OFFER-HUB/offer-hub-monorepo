import { StatusBadge } from "@/components/ui/StatusBadge";
import type { StatusTone } from "@/components/ui/status-colors";
import { cn } from "@/lib/cn";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

const METHOD_TONES: Record<HttpMethod, StatusTone> = {
  GET: "success",
  POST: "primary",
  PUT: "warning",
  PATCH: "primary",
  DELETE: "danger",
};

interface MethodBadgeProps {
  method: string;
  className?: string;
}

export function MethodBadge({ method, className }: MethodBadgeProps) {
  const normalized = method.toUpperCase() as HttpMethod;
  const tone = METHOD_TONES[normalized] ?? "default";

  return (
    <StatusBadge variant={tone} className={cn("font-mono", className)}>
      {normalized}
    </StatusBadge>
  );
}
