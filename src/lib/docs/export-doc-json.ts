import { downloadBlob } from "@/utils/downloadBlob";
import { docExportBaseName } from "@/lib/docs/export-filenames";

/**
 * JSON structure produced for a doc page export.
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

/**
 * Walks the exported content root's h2/h3 headings and builds the
 * exported JSON payload. Takes the root element as a parameter (rather
 * than looking it up itself) so it stays a pure, directly-testable
 * function independent of the live DOM/page.
 */
export function buildDocExportJson(root: HTMLElement, slug: string, title: string): ExportedDocJSON {
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

  return { title, slug, sections };
}

/** Reads the doc content from the DOM and downloads it as a `.json` file. */
export function exportDocJson(slug: string, title: string): void {
  const root = document.getElementById("doc-page-export-content");
  if (!root) return;

  const payload = buildDocExportJson(root, slug, title);
  downloadBlob(`${docExportBaseName(slug)}.json`, JSON.stringify(payload, null, 2), "application/json;charset=utf-8");
}
