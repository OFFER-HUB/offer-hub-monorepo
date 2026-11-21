"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  Terminal,
  Mail,
  FileText,
  ArrowRight,
  SearchX,
} from "lucide-react";
import Fuse from "fuse.js";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DocsSearchBar } from "@/components/docs/DocsSearchBar";
import rawDocsIndex from "@/data/docs-index.json";

interface DocsIndexEntry {
  id: string;
  title: string;
  section: string;
  content: string;
  link: string;
}

interface SuggestedDoc {
  title: string;
  section: string;
  link: string;
  description: string;
}

const DEFAULT_SUGGESTIONS: SuggestedDoc[] = [
  {
    title: "Getting Started",
    section: "Overview",
    link: "/docs/getting-started",
    description: "Set up OFFER-HUB and make your first integration call.",
  },
  {
    title: "SDK Quick Start",
    section: "TypeScript SDK",
    link: "/docs/sdk/quick-start",
    description: "TypeScript SDK installation, client setup, and usage examples.",
  },
  {
    title: "API Reference",
    section: "Overview",
    link: "/docs/api-reference/overview",
    description: "Review endpoints, authentication, webhooks, and response schemas.",
  },
];

const destinationLinks = [
  {
    href: "/",
    title: "Home",
    description: "Return to the overview",
    icon: Home,
  },
  {
    href: "/docs",
    title: "Documentation",
    description: "Guides and tutorials",
    icon: BookOpen,
  },
  {
    href: "/docs/sdk/quick-start",
    title: "SDK quick start",
    description: "Integrate TypeScript SDK",
    icon: Terminal,
  },
  {
    href: "/contact",
    title: "Contact",
    description: "Get enterprise support",
    icon: Mail,
  },
];

export default function NotFound() {
  const pathname = usePathname();
  const isDocsMiss = Boolean(pathname && pathname.startsWith("/docs"));

  useEffect(() => {
    document.title = "Page not found | OFFER-HUB";
  }, []);

  const suggestedDocs = useMemo<SuggestedDoc[]>(() => {
    if (!isDocsMiss) return [];

    const indexEntries = Array.isArray(rawDocsIndex)
      ? (rawDocsIndex as DocsIndexEntry[])
      : [];

    if (indexEntries.length === 0) {
      return DEFAULT_SUGGESTIONS;
    }

    const queryTerm = (pathname || "")
      .replace(/^\/docs\/?/, "")
      .split("/")
      .map((s) => s.replace(/[-_]/g, " "))
      .join(" ")
      .trim();

    if (!queryTerm) {
      return DEFAULT_SUGGESTIONS;
    }

    const fuse = new Fuse(indexEntries, {
      keys: ["title", "section", "content", "link"],
      threshold: 0.5,
      minMatchCharLength: 2,
    });

    const results = fuse.search(queryTerm);
    if (results.length === 0) {
      return DEFAULT_SUGGESTIONS;
    }

    const seenLinks = new Set<string>();
    const suggestions: SuggestedDoc[] = [];

    for (const r of results) {
      const baseLink = r.item.link.split("#")[0];
      if (seenLinks.has(baseLink)) continue;
      seenLinks.add(baseLink);

      const snippet =
        r.item.content.length > 120
          ? `${r.item.content.slice(0, 120)}...`
          : r.item.content;

      suggestions.push({
        title: r.item.title,
        section: r.item.section,
        link: baseLink,
        description: snippet,
      });

      if (suggestions.length === 3) break;
    }

    for (const def of DEFAULT_SUGGESTIONS) {
      if (suggestions.length >= 3) break;
      if (!seenLinks.has(def.link)) {
        seenLinks.add(def.link);
        suggestions.push(def);
      }
    }

    return suggestions.slice(0, 3);
  }, [isDocsMiss, pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-bg-base">
      <title>Page not found | OFFER-HUB</title>
      <Navbar />

      <main id="main-content" className="flex-grow pt-32 pb-20 px-6 lg:px-8">
        <section className="max-w-4xl mx-auto text-center">
          {/* Sunken 404 Icon badge */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-bg-sunken shadow-neu-sunken-subtle flex items-center justify-center text-theme-primary">
            <SearchX size={36} strokeWidth={1.75} />
          </div>

          <p className="text-xs font-semibold uppercase tracking-wider text-theme-primary mb-3">
            404 Error
          </p>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-content-primary mb-3">
            Page not found
          </h1>

          <p className="text-base text-content-secondary max-w-lg mx-auto mb-8 leading-relaxed">
            The page you are looking for doesn&apos;t exist, has been moved, or
            is temporarily unavailable.
          </p>

          {/* Search field */}
          <div className="max-w-xl mx-auto mb-10">
            <DocsSearchBar />
          </div>

          {/* Destination links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-3xl mx-auto mb-12">
            {destinationLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="p-4 rounded-2xl bg-bg-elevated shadow-neu-raised-sm hover:shadow-neu-raised-hover hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-3.5 text-left group min-h-11"
              >
                <div className="w-10 h-10 rounded-xl bg-bg-sunken shadow-neu-sunken-subtle flex items-center justify-center text-theme-primary shrink-0">
                  <item.icon size={18} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-content-primary group-hover:text-theme-primary transition-colors">
                    {item.title}
                  </div>
                  <div className="text-xs text-content-secondary">
                    {item.description}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Suggested docs for /docs miss */}
          {isDocsMiss && suggestedDocs.length > 0 && (
            <div className="max-w-3xl mx-auto mt-6 pt-8 border-t border-theme-border/20">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-theme-primary mb-4 text-center">
                Suggested Documentation
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {suggestedDocs.map((doc) => (
                  <Link
                    key={doc.link}
                    href={doc.link}
                    className="group p-5 rounded-2xl bg-bg-elevated shadow-neu-raised-sm hover:shadow-neu-raised-hover hover:-translate-y-0.5 transition-all duration-200 text-left flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-9 h-9 rounded-xl bg-bg-sunken shadow-neu-sunken-subtle flex items-center justify-center text-theme-primary mb-3">
                        <FileText size={18} />
                      </div>
                      <h3 className="text-base font-bold text-content-primary group-hover:text-theme-primary transition-colors mb-1">
                        {doc.title}
                      </h3>
                      <p className="text-xs text-content-secondary line-clamp-2 leading-relaxed">
                        {doc.description}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-theme-primary">
                      <span>Open</span>
                      <ArrowRight
                        size={14}
                        className="group-hover:translate-x-0.5 transition-transform"
                      />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
