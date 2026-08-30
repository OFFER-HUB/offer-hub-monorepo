"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import type { Heading, SidebarSection } from "@/lib/mdx";
import { BackToTopButton } from "@/components/docs/BackToTopButton";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { TableOfContents } from "@/components/docs/TableOfContents";
import { Navbar } from "@/components/layout/Navbar";
import { Breadcrumb } from "@/components/docs/Breadcrumb";
import { useFocusTrap } from "@/hooks/useFocusTrap";

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
  const drawerRef = useRef<HTMLElement>(null);

  const isHub = pathname === "/docs" || pathname === "/docs/";

  useEffect(() => {
    setIsDrawerOpen(false);
  }, [pathname]);

  useFocusTrap({
    containerRef: drawerRef,
    isActive: isDrawerOpen,
    onEscape: () => setIsDrawerOpen(false),
  });

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
                className="lg:hidden inline-flex items-center justify-center min-w-11 min-h-11 p-2 rounded-lg text-content-secondary hover:bg-theme-primary/5 hover:text-theme-primary transition-colors"
                aria-label="Open docs navigation"
              >
                <Menu size={20} aria-hidden="true" />
              </button>

              {isHub ? (
                <span className="text-content-primary font-bold tracking-tight opacity-70 italic text-[14px]">Documentation Index</span>
              ) : (
                <Breadcrumb />
              )}
            </nav>
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
                  <div className="xl:hidden mt-20 pt-10 border-t border-theme-border/20 print:hidden">
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
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Documentation navigation"
            className="relative h-full w-80 max-w-[85vw] p-8 bg-bg-base shadow-neu-raised rounded-r-[30px] print:hidden"
          >
            <div className="mb-8 flex items-center justify-between pb-4 border-b border-theme-border/40">
              <p className="text-sm font-bold uppercase tracking-widest text-theme-primary">
                Navigation
              </p>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="inline-flex items-center justify-center min-w-11 min-h-11 p-2 rounded-lg text-content-secondary hover:bg-bg-elevated hover:text-content-primary transition-colors"
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