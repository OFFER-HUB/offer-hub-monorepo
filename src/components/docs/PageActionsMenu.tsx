"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Bot,
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  FileCode2,
  FileJson,
  FileText,
  Github,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { logger } from "@/utils/logger";
import { SITE_URL_FALLBACK } from "@/constants/site";
import { DOCS_EDIT_BASE } from "@/constants/github";
import { exportDocMarkdown } from "@/lib/docs/export-doc-markdown";
import { exportDocJson } from "@/lib/docs/export-doc-json";
import { exportDocPdf } from "@/lib/docs/export-doc-pdf";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || SITE_URL_FALLBACK;

const MENU_ITEM_CLASS =
  "w-full flex items-center gap-2 px-4 py-2 text-sm text-content-primary " +
  "hover:text-theme-primary hover:bg-theme-primary/5 text-left " +
  "focus-visible:outline-2 focus-visible:outline-theme-primary focus-visible:outline-offset-[-2px]";

interface PageActionsMenuProps {
  slug: string;
  title: string;
  description?: string;
  markdownContent: string;
}

/**
 * Groups menu items for divider placement. "connect" is reserved for
 * follow-up issues (Connect with MCP / VSCode / Claude Code / Codex) —
 * appending items with that group inserts a divider before them
 * automatically, with no changes needed elsewhere in this component.
 */
type MenuItemGroup = "copy" | "export" | "connect";

interface MenuItemBase {
  id: string;
  label: string;
  icon: LucideIcon;
  group: MenuItemGroup;
}

interface ButtonMenuItem extends MenuItemBase {
  kind: "button";
  onSelect: () => void;
  busy?: boolean;
}

interface LinkMenuItem extends MenuItemBase {
  kind: "link";
  href: string;
}

type DocPageMenuItem = ButtonMenuItem | LinkMenuItem;

export function PageActionsMenu({ slug, title, description, markdownContent }: PageActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | HTMLAnchorElement | null>>([]);

  const rawMarkdownUrl = `/docs/${slug}/raw`;
  const absoluteRawMarkdownUrl = `${SITE_URL}${rawMarkdownUrl}`;
  const aiPrompt = `Read ${title} at ${absoluteRawMarkdownUrl} and help me understand it.`;
  const chatGptUrl = `https://chatgpt.com/?q=${encodeURIComponent(aiPrompt)}`;
  const claudeUrl = `https://claude.ai/new?q=${encodeURIComponent(aiPrompt)}`;
  const githubEditUrl = `${DOCS_EDIT_BASE}/content/docs/${slug}.mdx`;

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

  function handleExternalLinkClick() {
    closeMenu();
  }

  function handleExportMarkdown() {
    exportDocMarkdown(slug, markdownContent);
    closeMenu();
  }

  function handleExportJson() {
    exportDocJson(slug, title);
    closeMenu();
  }

  async function handleExportPdf() {
    if (isExportingPdf) return;

    setIsExportingPdf(true);
    try {
      await exportDocPdf({ slug, title, description });
    } catch (error) {
      logger.error("PDF export failed", error);
    } finally {
      setIsExportingPdf(false);
      closeMenu();
    }
  }

  const items: DocPageMenuItem[] = [
    {
      id: "copy-page",
      kind: "button",
      group: "copy",
      icon: copied ? Check : Copy,
      label: copied ? "Copied!" : "Copy page",
      onSelect: handleCopyPage,
    },
    {
      id: "view-markdown",
      kind: "link",
      group: "copy",
      icon: ExternalLink,
      label: "View as Markdown",
      href: rawMarkdownUrl,
    },
    {
      id: "open-chatgpt",
      kind: "link",
      group: "copy",
      icon: MessageSquare,
      label: "Open in ChatGPT",
      href: chatGptUrl,
    },
    {
      id: "open-claude",
      kind: "link",
      group: "copy",
      icon: Bot,
      label: "Open in Claude",
      href: claudeUrl,
    },
    {
      id: "export-markdown",
      kind: "button",
      group: "export",
      icon: FileCode2,
      label: "Export Markdown",
      onSelect: handleExportMarkdown,
    },
    {
      id: "export-json",
      kind: "button",
      group: "export",
      icon: FileJson,
      label: "Export JSON",
      onSelect: handleExportJson,
    },
    {
      id: "export-pdf",
      kind: "button",
      group: "export",
      icon: isExportingPdf ? Loader2 : FileText,
      label: isExportingPdf ? "Exporting PDF…" : "Export PDF",
      onSelect: handleExportPdf,
      busy: isExportingPdf,
    },
    {
      id: "edit-github",
      kind: "link",
      group: "export",
      icon: Github,
      label: "Edit on GitHub",
      href: githubEditUrl,
    },
  ];

  return (
    <div className="relative" ref={containerRef} data-pdf-exclude="true">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls="page-actions-menu"
        className="neu-circle h-10 flex items-center gap-2 px-4 text-sm font-medium text-content-secondary hover:text-theme-primary focus-visible:outline-2 focus-visible:outline-theme-primary focus-visible:outline-offset-2 focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-sunken"
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
          className="absolute right-0 top-full mt-2 w-64 rounded-xl z-[100] bg-bg-elevated border border-theme-border/40 shadow-2xl shadow-black/10 py-2 animate-dropdownIn"
        >
          {items.map((item, index) => {
            const Icon = item.icon;
            const showsDivider = index > 0 && items[index - 1].group !== item.group;

            return (
              <Fragment key={item.id}>
                {showsDivider && <div role="separator" className="my-1 h-px bg-theme-border/40" />}
                {item.kind === "button" ? (
                  <button
                    ref={(el) => {
                      itemRefs.current[index] = el;
                    }}
                    type="button"
                    role="menuitem"
                    aria-busy={item.busy || undefined}
                    onClick={item.onSelect}
                    className={MENU_ITEM_CLASS}
                  >
                    <Icon size={16} className={item.busy ? "animate-spin" : undefined} />
                    <span>{item.label}</span>
                  </button>
                ) : (
                  <a
                    ref={(el) => {
                      itemRefs.current[index] = el;
                    }}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    role="menuitem"
                    onClick={handleExternalLinkClick}
                    className={MENU_ITEM_CLASS}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </a>
                )}
              </Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
}
