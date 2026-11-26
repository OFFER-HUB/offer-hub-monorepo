import type { ReactNode } from "react";
import { MethodBadge, type HttpMethod } from "@/components/api-explorer/MethodBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface EndpointProps {
  method: HttpMethod;
  path: string;
  scope?: string;
  idempotent?: boolean;
  title?: ReactNode;
  children?: ReactNode;
}

export function Endpoint({
  method,
  path,
  scope,
  idempotent = false,
  title,
  children,
}: EndpointProps) {
  return (
    <div className="my-8 rounded-2xl bg-bg-elevated p-5 shadow-neu-raised md:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <MethodBadge method={method} />
        <code className="rounded-xl bg-bg-sunken px-2.5 py-1.5 font-mono text-sm font-bold text-content-primary shadow-neu-sunken-subtle">
          {path}
        </code>
        {scope && (
          <StatusBadge>Scope: {scope}</StatusBadge>
        )}
        {idempotent && (
          <StatusBadge variant="primary">Idempotent</StatusBadge>
        )}
      </div>

      {(title || children) && (
        <div className="mt-4 space-y-3 text-content-secondary">
          {title && <div className="text-base font-bold text-content-primary">{title}</div>}
          {children && <div className="leading-relaxed">{children}</div>}
        </div>
      )}
    </div>
  );
}
