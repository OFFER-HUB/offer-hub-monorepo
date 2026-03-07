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
      className="border-t mt-12 pt-6 flex justify-between"
      style={{ borderColor: "#e5e7eb" }}
      aria-label="Documentation pagination"
    >
      {prev ? (
        <Link
          href={prev.href}
          className="flex items-start gap-3 group max-w-[45%]"
        >
          <ArrowLeft
            size={20}
            className="mt-0.5 flex-shrink-0 transition-transform group-hover:-translate-x-1"
            style={{ color: "#149A9B" }}
          />
          <div className="flex flex-col gap-1">
            <span
              className="text-xs uppercase tracking-widest"
              style={{ color: "#6D758F" }}
            >
              Previous
            </span>
            <span
              className="text-sm font-semibold transition-colors"
              style={{ color: "#19213D" }}
            >
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
          className="flex items-start gap-3 group max-w-[45%] ml-auto text-right"
        >
          <div className="flex flex-col gap-1">
            <span
              className="text-xs uppercase tracking-widest"
              style={{ color: "#6D758F" }}
            >
              Next
            </span>
            <span
              className="text-sm font-semibold transition-colors group-hover:text-[#149A9B]"
              style={{ color: "#19213D" }}
            >
              {next.title}
            </span>
          </div>
          <ArrowRight
            size={20}
            className="mt-0.5 flex-shrink-0 transition-transform group-hover:translate-x-1"
            style={{ color: "#149A9B" }}
          />
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}
