"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Copy, ExternalLink } from "lucide-react";
import { logger } from "@/utils/logger";

interface PageActionsMenuProps {
  slug: string;
  markdownContent: string;
}

export function PageActionsMenu({ slug, markdownContent }: PageActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | HTMLAnchorElement | null>>([]);

  const rawMarkdownUrl = `/docs/${slug}/raw`;

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      itemRefs.current[0]?.focus();
    }
  }, [isOpen]);

  function closeMenu() {
    setIsOpen(false);
    triggerRef.current?.focus();
  }

  function handleMenuKeyDown(event: React.KeyboardEvent) {
    const items = itemRefs.current.filter((item): item is HTMLButtonElement | HTMLAnchorElement => item !== null);
    const currentIndex = items.findIndex((item) => item === document.activeElement);

    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      const next = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      items[next]?.focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      const prev = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      items[prev]?.focus();
    }
  }

  async function handleCopyPage() {
    try {
      await navigator.clipboard.writeText(markdownContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      logger.error("Failed to copy page markdown", error);
    } finally {
      closeMenu();
    }
  }

  function handleViewAsMarkdown() {
    closeMenu();
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls="page-actions-menu"
        className="neu-circle h-10 flex items-center gap-2 px-4 text-sm font-medium text-content-secondary hover:text-[#149A9B] focus-visible:outline-2 focus-visible:outline-theme-primary focus-visible:outline-offset-2 focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-sunken"
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
        <span>{copied ? "Copied!" : "Copy page"}</span>
        <ChevronDown size={14} className={isOpen ? "rotate-180 transition-transform" : "transition-transform"} />
      </button>

      {isOpen && (
        <div
          id="page-actions-menu"
          role="menu"
          aria-label="Page actions"
          onKeyDown={handleMenuKeyDown}
          className="absolute right-0 top-full mt-2 w-56 rounded-xl z-[100] bg-bg-elevated border border-theme-border/40 shadow-2xl shadow-black/10 py-2"
        >
          <button
            ref={(el) => {
              itemRefs.current[0] = el;
            }}
            type="button"
            role="menuitem"
            onClick={handleCopyPage}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-content-primary hover:text-[#149A9B] hover:bg-theme-primary/5 text-left focus-visible:outline-2 focus-visible:outline-theme-primary focus-visible:outline-offset-[-2px]"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? "Copied!" : "Copy page"}</span>
          </button>

          <a
            ref={(el) => {
              itemRefs.current[1] = el;
            }}
            href={rawMarkdownUrl}
            target="_blank"
            rel="noopener noreferrer"
            role="menuitem"
            onClick={handleViewAsMarkdown}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-content-primary hover:text-[#149A9B] hover:bg-theme-primary/5 focus-visible:outline-2 focus-visible:outline-theme-primary focus-visible:outline-offset-[-2px]"
          >
            <ExternalLink size={16} />
            <span>View as Markdown</span>
          </a>
        </div>
      )}
    </div>
  );
}
