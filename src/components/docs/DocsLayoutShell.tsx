"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu, X, ChevronRight, Home
} from "lucide-react";

import { cn } from "@/lib/cn";
import type { Heading, SidebarSection } from "@/lib/mdx";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { TableOfContents } from "@/components/docs/TableOfContents";
import { Navbar } from "@/components/layout/Navbar";
import { EditOnGitHub } from "@/components/docs/EditOnGitHub";
import { ExportMarkdown } from "@/components/docs/ExportMarkdown";

// Use production URL for AI assistant links
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://offer-hub.tech";

interface DocsLayoutShellProps {
  nav: SidebarSection[];
  children: React.ReactNode;
}

function formatSegment(segment: string) {
  return decodeURIComponent(segment)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
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

  const pathSegments = useMemo(() => {
    const [, docs, ...rest] = pathname.split("/");
    if (docs !== "docs") return [];
    return rest.filter(Boolean);
  }, [pathname]);

  useEffect(() => {
    setIsDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
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
  }, [pathname]);

  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />

      <div className="pt-40 pb-10">

        {/* SECTION 1: DOCS HEADER (Width matches Navbar) */}
        <div className="max-w-6xl xl:max-w-7xl mx-auto px-6 lg:px-8 mb-16">
          <div className="relative z-40 flex flex-col md:flex-row md:items-center justify-between gap-6">

            {/* Breadcrumb - Differentiated colors, no bold */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 overflow-hidden flex-1">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="lg:hidden inline-flex items-center justify-center p-2 rounded-lg text-[#6D758F] hover:bg-[#149A9B]/5 hover:text-[#149A9B] transition-all"
                aria-label="Open docs navigation"
              >
                <Menu size={20} />
              </button>

              <div className="flex items-center gap-2 text-[14px] whitespace-nowrap overflow-x-auto no-scrollbar py-1">
                <Link href="/docs" className="text-[#149A9B] hover:text-[#149A9B]/80 transition-colors font-medium flex items-center gap-1.5">
                  <Home size={15} />
                  Docs
                </Link>
                {pathSegments.map((segment, index) => {
                  const href = `/docs/${pathSegments.slice(0, index + 1).join("/")}`;
                  const isLast = index === pathSegments.length - 1;
                  return (
                    <span key={`${segment}-${index}`} className="flex items-center gap-2">
                      <ChevronRight size={14} className="text-[#6D758F]/30" />
                      {isLast ? (
                        <span className="text-[#19213D]/90 font-medium">
                          {formatSegment(segment)}
                        </span>
                      ) : (
                        <Link href={href} className="text-[#19213D]/50 hover:text-[#19213D] transition-colors font-medium">
                          {formatSegment(segment)}
                        </Link>
                      )}
                    </span>
                  );
                })}
              </div>
            </nav>

            {/* "Copy" Component - Compact, Neumorphic, Aligned */}
            <div className="flex items-center justify-start md:justify-end gap-x-6">
              <div className="hidden sm:flex items-center gap-x-6 mr-2">
                <EditOnGitHub filePath={`content/docs/${pathname.replace("/docs/", "")}.mdx`} />
                <ExportMarkdown slug={pathname.replace("/docs/", "")} />
              </div>
              <DocActionsMenu slug={pathname.replace("/docs/", "")} />
            </div>
          </div>
        </div>

        {/* SECTION 2: DOCS CONTENT GRID (Wider width as before) */}
        <div className="max-w-[1800px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)_280px] gap-12 lg:gap-20 min-h-[calc(100vh-8rem)]">
            <aside className="hidden lg:block">
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
                  <div className="xl:hidden mt-20 pt-10 border-t border-[#D1D5DB]/20">
                    <TableOfContents headings={headings} />
                  </div>
                )}
              </div>
            </main>

            <aside className="hidden xl:block">
              {headings.length > 0 && (
                <div className="sticky top-40 max-h-[calc(100vh-12rem)] overflow-y-auto scrollbar-thin">
                  <TableOfContents headings={headings} />
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>

      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            aria-label="Close docs navigation overlay"
            onClick={() => setIsDrawerOpen(false)}
          />
          <aside
            className="relative h-full w-80 max-w-[85vw] p-8 bg-[#F1F3F7]"
            style={{ borderTopRightRadius: "30px", borderBottomRightRadius: "30px" }}
          >
            <div className="mb-8 flex items-center justify-between pb-4 border-b border-[#D1D5DB]/30">
              <p className="text-sm font-bold uppercase tracking-widest text-[#149A9B]">
                Navigation
              </p>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-[#6D758F] hover:bg-[#149A9B]/5 hover:text-[#19213D] transition-all"
                aria-label="Close docs navigation"
              >
                <X size={20} />
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

function DocActionsMenu({ slug }: { slug: string }) {
  const [isOpen, setIsOpen] = useState(false);
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

  const handleViewPlainText = () => {
    const { markdown, title } = getPageContent();
    const fullContent = `# ${title}\n\nSource: ${SITE_URL}/docs/${slug}\n\n${markdown}`;

    // Create a new window with proper styling
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${title} - Plain Text</title>
          <style>
            body {
              font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
              padding: 2rem;
              max-width: 800px;
              margin: 0 auto;
              line-height: 1.6;
              background: #f8f9fa;
              color: #1a1a1a;
            }
            pre {
              white-space: pre-wrap;
              word-wrap: break-word;
              background: white;
              padding: 1.5rem;
              border-radius: 8px;
              border: 1px solid #e1e4e8;
            }
          </style>
        </head>
        <body>
          <pre>${fullContent.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
        </body>
        </html>
      `);
      win.document.close();
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

  const actions = [
    {
      label: copyStatus || "Copy as Markdown",
      sublabel: copyStatus ? "Ready to paste!" : "Best for sharing with Claude/ChatGPT",
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
          {copyStatus ? (
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          ) : (
            <>
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            </>
          )}
        </svg>
      ),
      onClick: handleCopyMarkdown
    },
    {
      label: "View Plain Text",
      sublabel: "See raw documentation content",
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
          <path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4" />
          <polyline points="14 2 14 8 20 8" />
          <path d="m3 15 2 2 4-4" />
        </svg>
      ),
      onClick: handleViewPlainText
    },
    {
      type: "divider"
    },
    {
      label: "Ask ChatGPT",
      sublabel: "Discuss this page with OpenAI",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#10A37F]">
          <path d="M22.28 9.82a5.39 5.39 0 0 0-1.07-3.79 5.48 5.48 0 0 0-3.92-2.22 5.41 5.41 0 0 0-4.39-.46 5.39 5.39 0 0 0-3.34-1.79 5.48 5.48 0 0 0-4.48 1.26 5.41 5.41 0 0 0-2.43 3.73 5.39 5.39 0 0 0-1.63 3.52 5.48 5.48 0 0 0 .54 4.54 5.41 5.41 0 0 0 3.73 2.43 5.39 5.39 0 0 0 1.79 3.34 5.48 5.48 0 0 0 4.54.54 5.41 5.41 0 0 0 2.43-3.73 5.39 5.39 0 0 0 3.52-1.63 5.48 5.48 0 0 0 1.26-4.48 5.41 5.41 0 0 0 3.19-4.28zm-10.43 8.33a3.3 3.3 0 0 1-2.1-.73 3.35 3.35 0 0 1-1.24-2.1c-.04-.26-.06-.52-.06-.79l-.01-5l2.25 1.3a.75.75 0 0 0 1.13-.65v-2.6L14 7.03l2.25 1.3c.2.11.43.17.66.17a1.32 1.32 0 0 0 .66-.17l2.25-1.3a3.3 3.3 0 0 1 .73 2.1 3.35 3.35 0 0 1-1.24 2.1l-2.25 1.3v2.6a.75.75 0 0 0 1.12.65l2.25-1.3c.1-.06.21-.11.31-.17a3.3 3.3 0 0 1-.73 2.1l-2.25 1.3a3.35 3.35 0 0 1-2.1 1.24 3.3 3.3 0 0 1-2.1-.01zm-5.75-5.07a3.3 3.3 0 0 1-.73-2.1l.01-2.6a.75.75 0 0 0-1.13-.65l-2.25 1.3a1.32 1.32 0 0 0-.31.17 3.35 3.35 0 0 1 .73-2.1 3.3 3.3 0 0 1 2.1-1.24 3.35 3.35 0 0 1 2.1.01 3.3 3.3 0 0 1 2.1.73l2.25 1.3v2.6a.75.75 0 0 0-1.12.65l-2.25-1.3-2.25-1.3a1.32 1.32 0 0 0-.66-.17c-.23 0-.46.06-.66.17l-2.25 1.3a3.35 3.35 0 0 1 1.24 2.1zm-1.83-9.1a3.3 3.3 0 0 1 2.1-.73l2.25 1.3v2.6a.75.75 0 0 0 1.12.65l2.25-1.3 2.25-1.3a1.32 1.32 0 0 0 .66-.17c.23 0 .46.06.66.17l2.25 1.3a3.35 3.35 0 0 1-1.24 2.1 3.3 3.3 0 0 1-2.1.73 3.35 3.35 0 0 1-2.1-.01l-2.25-1.3v-2.6a.75.75 0 0 0-1.13-.65l-2.25 1.3a3.3 3.3 0 0 1-.73-2.1zm12.33 3.42a3.35 3.35 0 0 1 .73 2.1v2.6a.75.75 0 0 0 1.12.65l2.25-1.3a1.32 1.32 0 0 0 .31-.17 3.35 3.35 0 0 1-.73 2.1 3.3 3.3 0 0 1-2.1 1.24 3.35 3.35 0 0 1-2.1-.01 3.3 3.3 0 0 1-2.1-.73l-2.25-1.3v-2.6a.75.75 0 0 0 1.13-.65l2.25 1.3 2.25 1.3a1.32 1.32 0 0 0 .66.17c.23 0 .46-.06.66-.17l2.25-1.3a3.35 3.35 0 0 1-1.24-2.1zm1.83 5.48a3.3 3.3 0 0 1-2.1.73l-2.25-1.3v-2.6a.75.75 0 0 0-1.12-.65l-2.25 1.3-2.25 1.3a1.32 1.32 0 0 0-.66.17c-.23 0-.46-.06-.66-.17l-2.25-1.3a3.35 3.35 0 0 1 1.24-2.1 3.3 3.3 0 0 1 2.1-.73 3.35 3.35 0 0 1 2.1.01l2.25 1.3v2.6a.75.75 0 0 0 1.13.65l2.25-1.3a3.3 3.3 0 0 1 .73 2.1z" />
        </svg>
      ),
      external: true,
      onClick: () => window.open(`https://chatgpt.com/?q=${encodeURIComponent("Please help me with this documentation page: " + SITE_URL + "/docs/" + slug)}`, "_blank")
    },
    {
      label: "Ask Claude",
      sublabel: "Discuss this page with Anthropic",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#D97706]">
          <path d="M11.63 21.01a.34.34 0 0 1-.36-.08.33.33 0 0 1-.08-.36l4.08-11.41a.36.36 0 0 1 .33-.24h2.18c.24 0 .42.24.34.46l-4.08 11.4a.34.34 0 0 1-.3.23h-2.11zm-5.79 0a.34.34 0 0 1-.33-.24l-4.08-11.4a.34.34 0 0 1 .08-.34.33.33 0 0 1 .34-.08l2.11.23a.35.35 0 0 1 .23.36l4.08 11.4c.08.23-.08.47-.32.47H5.84zm6.65-17.15c.16 0 .31.1.37.26l1.3 3.65a.39.39 0 0 1-.37.52H1.38c-.24 0-.42-.25-.34-.47l1.3-3.65a.39.39 0 0 1 .37-.3h9.78z" />
        </svg>
      ),
      external: true,
      onClick: () => window.open(`https://claude.ai/new?q=${encodeURIComponent("Please help me with this documentation page: " + SITE_URL + "/docs/" + slug)}`, "_blank")
    },
    {
      type: "divider"
    },
    {
      label: "Copy MCP URL",
      sublabel: "For Cursor, VSCode, or Windsurf",
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-[#19213D]">
          <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
          <rect x="9" y="9" width="6" height="6" />
          <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3" />
        </svg>
      ),
      onClick: () => navigator.clipboard.writeText(`${SITE_URL}/api/mcp`)
    },
    {
      label: "Export PDF",
      sublabel: isExportingPdf ? "Generating..." : "Download for offline reading",
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-[#EF4444]">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <path d="M12 18v-6M9 15l3 3 3-3" />
        </svg>
      ),
      onClick: handleExportPdf
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-6 py-2 transition-all duration-300 ease-out rounded-full text-[13px] font-medium tracking-tight",
          "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] bg-[#F1F3F7] text-[#6D758F] hover:text-[#149A9B] hover:shadow-[inset_2px_2px_5px_#d1d5db,inset_-2px_-2px_5px_#ffffff]"
        )}
      >
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
          <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
        </svg>
        {isExportingPdf ? "Exporting..." : "Copy"}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] p-2 z-50 border border-[#D1D5DB]/30 animate-fadeInScale origin-top-right overflow-hidden">
            <div className="px-4 py-2 mb-2 text-[10px] font-bold uppercase tracking-widest text-[#6D758F]/40 border-b border-[#D1D5DB]/10">
              Page Actions
            </div>
            {actions.map((action, i) => {
              if (action.type === "divider") {
                return <div key={i} className="my-1.5 border-t border-[#D1D5DB]/10 mx-3" />;
              }
              return (
                <button
                  key={i}
                  disabled={isExportingPdf}
                  onClick={() => {
                    action.onClick?.();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-start gap-4 p-3 rounded-xl hover:bg-[#149A9B]/5 text-left group transition-all disabled:opacity-50"
                >
                  <div className="mt-0.5 shrink-0 text-[#6D758F]/60 group-hover:text-[#149A9B] transition-colors">
                    {action.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[#19213D] text-[13.5px] font-semibold group-hover:text-[#149A9B] transition-colors">{action.label}</span>
                      {action.external && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-[#D1D5DB] group-hover:text-[#149A9B]/40">
                          <path d="M7 7h10v10M7 17L17 7" />
                        </svg>
                      )}
                    </div>
                    {action.sublabel && (
                      <p className="text-[#6D758F]/70 text-[11px] leading-tight mt-1 font-medium group-hover:text-[#6D758F]">{action.sublabel}</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
