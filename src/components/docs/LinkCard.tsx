import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";

interface LinkCardProps {
  title: string;
  href: string;
  description?: ReactNode;
  eyebrow?: string;
  className?: string;
}

export function LinkCard({ title, href, description, eyebrow, className }: LinkCardProps) {
  const isExternal = /^https?:\/\//.test(href);

  return (
    <a
      href={href}
      className={cn(
        "group my-6 block rounded-[1.5rem] bg-bg-elevated p-5 shadow-neu-raised transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-neu-raised-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-primary md:p-6",
        className
      )}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
    >
      {eyebrow && (
        <span className="mb-3 block text-[10px] font-black uppercase tracking-[0.16em] text-theme-primary">
          {eyebrow}
        </span>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-lg font-black tracking-tight text-content-primary">{title}</h3>
          {description && <p className="mt-2 text-sm leading-relaxed text-content-secondary">{description}</p>}
        </div>

        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bg-base text-theme-primary shadow-neu-sunken-subtle transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
    </a>
  );
}
