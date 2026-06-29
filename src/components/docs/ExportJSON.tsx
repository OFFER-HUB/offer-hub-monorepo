"use client";

import { useCallback, useMemo } from "react";
import { FileJson } from "lucide-react";

interface ExportJSONProps {
  /**
   * The documentation slug of the current page.
   *
   * This is used both in the exported payload and as the base
   * for the downloaded filename (e.g. "getting-started.json").
   */
  slug: string;

  /**
   * The human-readable title of the current doc page.
   */
  title: string;
}

/**
 * JSON structure produced by the `ExportJSON` component.
 *
 * This is intentionally simple and stable so it can be consumed
 * by AI tools, external integrations, or an MCP server.
 *
 * ```jsonc
 * {
 *   "title": "Getting Started",
 *   "slug": "getting-started",
 *   "sections": [
 *     {
 *       "heading": "Introduction",
 *       "level": 2,
 *       "content": "Normalized plain-text content for this section…",
 *       "codeBlocks": [
 *         {
 *           "language": "ts",
 *           "code": "npm install offer-hub"
 *         }
 *       ]
 *     }
 *   ]
 * }
 * ```
 */
export interface ExportedDocJSON {
  title: string;
  slug: string;
  sections: ExportedSectionJSON[];
}

export interface ExportedSectionJSON {
  /**
   * Raw heading text as rendered on the page.
   */
  heading: string;

  /**
   * Heading level (2 for h2, 3 for h3, etc.).
   */
  level: number;

  /**
   * Normalized plain-text content for this section, with
   * whitespace collapsed and code blocks removed.
   */
  content: string;

  /**
   * All fenced code blocks found inside this section.
   */
  codeBlocks: ExportedCodeBlockJSON[];
}

export interface ExportedCodeBlockJSON {
  /**
   * Language inferred from the code block className (e.g. "ts", "bash").
   * May be null if no language could be detected.
   */
  language: string | null;

  /**
   * Raw code contents from the <code> element.
   */
  code: string;
}

function downloadBlob(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function getSectionNodes(allNodes: Element[], startIndex: number): Element[] {
  const sectionNodes: Element[] = [];

  for (let i = startIndex + 1; i < allNodes.length; i++) {
    const node = allNodes[i];
    if (!node.tagName) continue;

    const tag = node.tagName.toLowerCase();
    if (tag === "h2" || tag === "h3") {
      break;
    }

    sectionNodes.push(node);
  }

  return sectionNodes;
}

function extractSectionContent(nodes: Element[]): { content: string; codeBlocks: ExportedCodeBlockJSON[] } {
  if (nodes.length === 0) {
    return { content: "", codeBlocks: [] };
  }

  const container = document.createElement("div");
  nodes.forEach((node) => {
    container.appendChild(node.cloneNode(true));
  });

  const codeBlocks: ExportedCodeBlockJSON[] = [];

  container.querySelectorAll("pre").forEach((pre) => {
    const codeEl = pre.querySelector("code");
    const rawClassName = codeEl?.className ?? "";
    const match = rawClassName.match(/language-([a-z0-9]+)/i);
    const language = match ? match[1] : null;

    codeBlocks.push({
      language,
      code: codeEl?.textContent ?? "",
    });

    pre.remove();
  });

  const content = container.textContent?.replace(/\s+/g, " ").trim() ?? "";

  return { content, codeBlocks };
}

export function ExportJSON({ slug, title }: ExportJSONProps) {
  const filename = useMemo(() => `${slug.replace(/\//g, "-")}.json`, [slug]);

  const handleClick = useCallback(() => {
    const root = document.getElementById("doc-page-export-content");
    if (!root) return;

    const headingNodes = Array.from(root.querySelectorAll<HTMLElement>("h2[id], h3[id]"));
    const flatChildren = Array.from(root.children) as Element[];

    const sections: ExportedSectionJSON[] = headingNodes.map((heading) => {
      const level = heading.tagName.toLowerCase() === "h2" ? 2 : 3;
      const headingText = heading.textContent?.trim() ?? "";

      const indexInRoot = flatChildren.indexOf(heading);
      const sectionNodes = indexInRoot >= 0 ? getSectionNodes(flatChildren, indexInRoot) : [];

      const { content, codeBlocks } = extractSectionContent(sectionNodes);

      return {
        heading: headingText,
        level,
        content,
        codeBlocks,
      };
    });

    const payload: ExportedDocJSON = {
      title,
      slug,
      sections,
    };

    downloadBlob(filename, JSON.stringify(payload, null, 2), "application/json;charset=utf-8");
  }, [filename, slug, title]);

  return (
    <button
      type="button"
      onClick={handleClick}
      title="Export JSON"
      aria-label="Export JSON"
      className="neu-circle w-10 h-10 flex items-center justify-center text-content-secondary hover:text-[#149A9B]"
    >
      <FileJson size={18} aria-hidden="true" />
    </button>
  );
}

