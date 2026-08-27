import Link from "next/link";
import { ArrowRight, BookOpen, FileText, Home, SearchX } from "lucide-react";
import { DocsSearchBar } from "@/components/docs/DocsSearchBar";

const recommendedDocs = [
  {
    title: "Getting Started",
    description: "Set up OFFER-HUB and make your first integration call.",
    href: "/docs/getting-started",
  },
  {
    title: "Quick Start",
    description: "Create users, orders, and escrow transactions step by step.",
    href: "/docs/guide/quick-start",
  },
  {
    title: "API Reference",
    description: "Review authentication, endpoints, real-time events, and response shapes.",
    href: "/docs/api-reference/overview",
  },
];

export default function DocsNotFound() {
  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-10 py-6 md:py-12">
      <div className="rounded-3xl bg-bg-base p-8 text-center shadow-neu-raised md:p-12">
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-bg-sunken text-theme-primary shadow-neu-sunken-subtle">
          <SearchX size={42} strokeWidth={1.7} />
        </div>

        <p className="mb-4 text-xs font-black uppercase tracking-[0.28em] text-theme-primary">
          Documentation 404
        </p>
        <h1 className="mx-auto mb-4 max-w-2xl text-3xl font-black leading-tight text-content-primary md:text-5xl">
          This documentation page was not found.
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed text-content-secondary">
          The docs path may have moved, been renamed, or never existed. Search the
          documentation or return to the docs index to continue.
        </p>

        <div className="mx-auto mb-8 max-w-xl">
          <DocsSearchBar />
        </div>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/docs"
            className="btn-neumorphic-primary inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold"
          >
            <Home size={17} />
            Back to Docs
          </Link>
          <Link
            href="/"
            className="btn-neumorphic-secondary inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-content-primary"
          >
            <BookOpen size={17} />
            Home
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {recommendedDocs.map((doc) => (
          <Link
            key={doc.href}
            href={doc.href}
            className="group rounded-2xl bg-bg-base p-5 shadow-neu-raised-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-neu-raised-hover"
          >
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-bg-sunken text-theme-primary shadow-neu-sunken-subtle">
              <FileText size={20} />
            </div>
            <h2 className="mb-2 text-lg font-black leading-tight text-content-primary transition-colors group-hover:text-theme-primary">
              {doc.title}
            </h2>
            <p className="mb-5 text-sm leading-relaxed text-content-secondary">
              {doc.description}
            </p>
            <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-theme-primary">
              Open
              <ArrowRight size={14} />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
