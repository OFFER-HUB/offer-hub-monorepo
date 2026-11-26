import Link from "next/link";
import { ArrowRight, BookOpen, FileText, Home, SearchX } from "lucide-react";
import { DocsSearchBar } from "@/components/docs/DocsSearchBar";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/shared/PageHeader";

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

        <PageHeader
          align="center"
          size="docs"
          className="mb-8"
          eyebrow="Documentation 404"
          title="This documentation page was not found."
          lead="The docs path may have moved, been renamed, or never existed. Search the documentation or return to the docs index to continue."
        />

        <div className="mx-auto mb-8 max-w-xl">
          <DocsSearchBar />
        </div>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button href="/docs">
            <Home size={17} />
            Back to Docs
          </Button>
          <Button href="/" variant="secondary">
            <BookOpen size={17} />
            Home
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {recommendedDocs.map((doc) => (
          <Link
            key={doc.href}
            href={doc.href}
            className="group rounded-2xl bg-bg-base p-5 shadow-neu-raised-sm transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-neu-raised-hover"
          >
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-bg-sunken text-theme-primary shadow-neu-sunken-subtle">
              <FileText size={20} />
            </div>
            <h2 className="mb-2 text-lg font-bold leading-tight text-content-primary transition-colors group-hover:text-theme-primary">
              {doc.title}
            </h2>
            <p className="mb-5 text-sm leading-relaxed text-content-secondary">
              {doc.description}
            </p>
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-theme-primary">
              Open
              <ArrowRight size={14} />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
