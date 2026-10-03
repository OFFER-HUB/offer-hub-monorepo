import type { ReactNode } from "react";
import type { HttpMethod } from "@/data/api-schema";
import { MethodBadge } from "./MethodBadge";

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
    <div className="my-8 rounded-[1.5rem] bg-bg-elevated p-5 shadow-neu-raised md:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <MethodBadge method={method} />
        <code className="rounded-lg bg-bg-sunken px-2.5 py-1.5 font-mono text-sm font-bold text-content-primary shadow-neu-sunken-subtle">
          {path}
        </code>
        {scope && (
          <span className="rounded-full bg-bg-sunken px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-content-secondary shadow-neu-sunken-subtle">
            Scope: {scope}
          </span>
        )}
        {idempotent && (
          <span className="rounded-full bg-theme-primary/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-theme-primary shadow-neu-sunken-subtle">
            Idempotent
          </span>
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
