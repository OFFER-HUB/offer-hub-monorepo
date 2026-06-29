"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import type { Heading, SidebarSection } from "@/lib/mdx";
import { BackToTopButton } from "@/components/docs/BackToTopButton";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { TableOfContents } from "@/components/docs/TableOfContents";
import { Navbar } from "@/components/layout/Navbar";
import { Breadcrumb } from "@/components/docs/Breadcrumb";
import { FileCode2, FileText, Github } from "lucide-react";

// Use production URL for AI assistant links
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://offer-hub.tech";

interface DocsLayoutShellProps {
  nav: SidebarSection[];
  children: React.ReactNode;
}

function collectHeadingsFromPage(): Heading[] {
  const root = document.getElementById("doc-page-export-content");
  if (!root) return [];

  const nodes = Array.from(root.querySelectorAll("h2[id], h3[id]"));
  return nodes.map((node) => {
    const level = node.tagName.toLowerCase() === "h2" ? 2 : 3;
    return {
      level,
      id: node.id,
      text: node.textContent?.trim() || "",
    } as Heading;
  });
}

export function DocsLayoutShell({ nav, children }: DocsLayoutShellProps) {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [headings, setHeadings] = useState<Heading[]>([]);

  const isHub = pathname === "/docs" || pathname === "/docs/";

  const pathSegments = useMemo(() => {
    const [, docs, ...rest] = pathname.split("/");
    if (docs !== "docs") return [];
    return rest.filter(Boolean);
  }, [pathname]);

  const currentDocSlug = pathSegments.join("/");

  const isKnownDocPage = useMemo(() => {
    if (!currentDocSlug) return false;

    return nav.some((section) =>
      section.links.some((link) => link.slug === currentDocSlug)
    );
  }, [currentDocSlug, nav]);

  useEffect(() => {
    setIsDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isHub) return;
    // Collect headings immediately
    setHeadings(collectHeadingsFromPage());

    // Watch for content changes (e.g. lazy-loaded MDX)
    const root = document.getElementById("doc-page-export-content");
    if (!root) return;

    const observer = new MutationObserver(() => {
      setHeadings(collectHeadingsFromPage());
    });
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [pathname, isHub]);

  // No early return for isHub to allow sidebar on the hub page

  return (
    <div className="min-h-screen bg-bg-base">
      <Navbar />

      <div className="pt-40 pb-10">

        {/* SECTION 1: DOCS HEADER (Width matches Navbar) */}
        <div className="max-w-6xl xl:max-w-7xl mx-auto px-6 lg:px-8 mb-16">
          <div className="relative z-40 flex flex-col md:flex-row md:items-center justify-between gap-6">

            {/* Breadcrumb navigation */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 overflow-hidden flex-1">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="lg:hidden inline-flex items-center justify-center p-2 rounded-lg text-content-secondary hover:bg-[#149A9B]/5 hover:text-[#149A9B] transition-all"
                aria-label="Open docs navigation"
              >
                <Menu size={20} aria-hidden="true" />
              </button>

              {isHub ? (
                <span className="text-content-primary font-bold tracking-tight opacity-40 italic text-[14px]">Documentation Index</span>
              ) : (
                <Breadcrumb />
              )}
            </nav>


            {/* Actions toolbar */}
            {!isHub && isKnownDocPage && (
              <div className="flex items-center justify-start md:justify-end print:hidden">
                <DocActionsMenu slug={currentDocSlug} />
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: DOCS CONTENT GRID (Wider width as before) */}
        <div className="max-w-[1800px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)_280px] gap-12 lg:gap-20 min-h-[calc(100vh-8rem)]">
            <aside className="hidden lg:block print:hidden">
              <div className="sticky top-40 max-h-[calc(100vh-12rem)] flex flex-col">
                <DocsSidebar nav={nav} className="overflow-y-auto" />
              </div>
            </aside>

            <main className="min-w-0">
              <div className="px-1 md:px-4">
                <div id="doc-page-export-content">
                  {children}
                </div>

                {headings.length > 0 && (
                  <div className="xl:hidden mt-20 pt-10 border-t border-[#D1D5DB]/20 print:hidden">
                    <TableOfContents headings={headings} />
                  </div>
                )}
              </div>
            </main>

            <aside className="hidden xl:block print:hidden">
              {headings.length > 0 && (
                <div className="sticky top-40 max-h-[calc(100vh-12rem)] overflow-y-auto scrollbar-thin">
                  <TableOfContents headings={headings} />
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>

      <BackToTopButton />

      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden print:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm print:hidden"
            aria-label="Close docs navigation overlay"
            onClick={() => setIsDrawerOpen(false)}
          />
          <aside
            className="relative h-full w-80 max-w-[85vw] p-8 bg-bg-base shadow-neu-raised rounded-r-[30px] print:hidden"
          >
            <div className="mb-8 flex items-center justify-between pb-4 border-b border-theme-border/40">
              <p className="text-sm font-bold uppercase tracking-widest text-[#149A9B]">
                Navigation
              </p>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-content-secondary hover:bg-bg-elevated hover:text-content-primary transition-all"
                aria-label="Close docs navigation"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <div className="h-[calc(100%-6rem)] overflow-y-auto pr-2 no-scrollbar">
              <DocsSidebar nav={nav} />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

import { ExportJSON } from "@/components/docs/ExportJSON";

function DocActionsMenu({ slug }: { slug: string }) {
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const getDocData = () => {
    const el = document.getElementById("doc-metadata-for-actions");
    if (!el) return null;
    return {
      slug: el.getAttribute("data-slug"),
      title: el.getAttribute("data-title"),
      markdown: el.getAttribute("data-markdown"),
    };
  };

  const getPageContent = () => {
    const data = getDocData();
    // Try to get markdown from data attribute first
    if (data?.markdown && data.markdown.length > 0) {
      return { markdown: data.markdown, title: data.title };
    }
    // Fallback to extracting text from the page content
    const contentEl = document.getElementById("doc-page-export-content");
    if (contentEl) {
      return {
        markdown: contentEl.innerText || "",
        title: data?.title || document.title
      };
    }
    return { markdown: "", title: "" };
  };

  const handleCopyMarkdown = async () => {
    try {
      const { markdown, title } = getPageContent();
      const fullContent = `# ${title}\n\nSource: ${SITE_URL}/docs/${slug}\n\n${markdown}`;
      await navigator.clipboard.writeText(fullContent);
      setCopyStatus("Copied!");
      setTimeout(() => setCopyStatus(null), 2000);
    } catch (err) {
      console.error("Copy failed", err);
      setCopyStatus("Failed to copy");
      setTimeout(() => setCopyStatus(null), 2000);
    }
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      const html2pdfModule = await import("html2pdf.js");
      const html2pdf = html2pdfModule.default;
      const source = document.getElementById("doc-page-export-content");
      if (!source) {
        throw new Error("Content not found");
      }

      // Clone the content to avoid modifying the original
      const clone = source.cloneNode(true) as HTMLElement;

      // Remove any elements that might cause issues
      clone.querySelectorAll("button, iframe, video").forEach(el => el.remove());

      const opt = {
        margin: [15, 15, 15, 15],
        filename: `${slug.replace(/\//g, "-")}-offerhub-docs.pdf`,
        image: { type: "jpeg" as const, quality: 0.95 },
        html2canvas: {
          scale: 1.5,
          useCORS: true,
          logging: false,
          letterRendering: true
        },
        jsPDF: {
          unit: "mm" as const,
          format: "a4" as const,
          orientation: "portrait" as const
        },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] as ("avoid-all" | "css" | "legacy")[] }
      };

      await html2pdf().set(opt).from(clone).save();
    } catch (err) {
      console.error("PDF Export failed", err);
      alert("PDF export failed. The document might be too large. Try copying as markdown instead.");
    } finally {
      setIsExportingPdf(false);
    }
  };

  /* ─── Inline helpers ─── */
  async function handleExportMarkdown() {
    const el = document.getElementById("doc-metadata-for-actions");
    const markdown = el?.getAttribute("data-markdown") || "";
    const filename = `${slug.replace(/\//g, "-")}.md`;
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), { href: url, download: filename });
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  const DOCS_REPO_BASE = "https://github.com/OFFER-HUB/offer-hub-monorepo/blob/main/content/docs";

  const NEU_ICON_BTN = "neu-circle w-10 h-10 flex items-center justify-center text-content-secondary hover:text-[#149A9B] transition-colors";
  const NEU_PILL = "flex items-center gap-2 px-5 py-2 rounded-full text-[13px] font-medium tracking-tight transition-all duration-300 ease-out text-content-secondary hover:text-[#149A9B]" +
    " shadow-[4px_4px_8px_var(--shadow-dark),-4px_-4px_8px_var(--shadow-light)] bg-[var(--color-bg-base)]" +
    " hover:shadow-[inset_2px_2px_5px_var(--shadow-dark),inset_-2px_-2px_5px_var(--shadow-light)]";

  return (
    <div className="flex items-center gap-3">
      {/* ── Export as ── */}
      <span className="text-[11px] font-bold uppercase tracking-widest text-content-secondary/60 mr-1">Export as</span>

      <button type="button" title="Download Markdown" aria-label="Download Markdown" onClick={handleExportMarkdown} className={NEU_ICON_BTN}>
        <FileCode2 size={17} aria-hidden="true" />
      </button>

      <ExportJSON slug={slug} title={slug} />

      <button
        type="button" title="Export PDF" aria-label="Export PDF"
        disabled={isExportingPdf}
        onClick={handleExportPdf}
        className={NEU_ICON_BTN + " disabled:opacity-50"}
      >
        <FileText size={17} aria-hidden="true" />
      </button>

      {/* ── Divider ── */}
      <span className="w-px h-5 bg-[var(--color-border)]/40" />

      {/* ── GitHub ── */}
      <a
        href={`${DOCS_REPO_BASE}/${slug}.mdx`}
        target="_blank" rel="noopener noreferrer"
        title="Edit on GitHub"
        aria-label="Edit on GitHub"
        className={NEU_ICON_BTN}
      >
        <Github size={17} aria-hidden="true" />
      </a>

      {/* ── Divider ── */}
      <span className="w-px h-5 bg-[var(--color-border)]/40" />

      {/* ── Copy pill ── */}
      <button
        type="button"
        title={copyStatus ? "Copied!" : "Copy page as Markdown"}
        onClick={handleCopyMarkdown}
        className={NEU_PILL}
      >
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4" aria-hidden="true">
          {copyStatus ? (
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          ) : (
            <>
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            </>
          )}
        </svg>
        {copyStatus ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
