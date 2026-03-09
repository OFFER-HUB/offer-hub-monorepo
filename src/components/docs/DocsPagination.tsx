import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface PageLink {
  title: string;
  href: string;
}

interface DocsPaginationProps {
  prev?: PageLink | null;
  next?: PageLink | null;
}

export function DocsPagination({ prev, next }: DocsPaginationProps) {
  return (
    <nav
      className="border-t border-theme-border/50 mt-12 pt-6 flex justify-between gap-4"
      aria-label="Documentation pagination"
    >
      {prev ? (
        <Link
          href={prev.href}
          className="flex items-start gap-3 group max-w-[45%] rounded-2xl bg-bg-base shadow-neu-raised px-4 py-3 transition-all duration-200 hover:shadow-neu-raised-hover active:shadow-neu-sunken-subtle"
        >
          <ArrowLeft
            size={20}
            className="mt-0.5 flex-shrink-0 transition-transform group-hover:-translate-x-1 text-theme-primary"
          />
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-widest text-content-secondary">
              Previous
            </span>
            <span className="text-sm font-semibold transition-colors text-content-primary group-hover:text-theme-primary">
              {prev.title}
            </span>
          </div>
        </Link>
      ) : (
        <div />
      )}

      {next ? (
        <Link
          href={next.href}
          className="flex items-start gap-3 group max-w-[45%] ml-auto text-right rounded-2xl bg-bg-base shadow-neu-raised px-4 py-3 transition-all duration-200 hover:shadow-neu-raised-hover active:shadow-neu-sunken-subtle"
        >
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-widest text-content-secondary">
              Next
            </span>
            <span className="text-sm font-semibold transition-colors text-content-primary group-hover:text-theme-primary">
              {next.title}
            </span>
          </div>
          <ArrowRight
            size={20}
            className="mt-0.5 flex-shrink-0 transition-transform group-hover:translate-x-1 text-theme-primary"
          />
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}
