import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { getDocBySlug, getSidebarNav } from "../mdx";
import { collectFilesByExtension } from "@/lib/docs/collect-files";

const DOCS_DIR = path.join(process.cwd(), "content/docs");

/**
 * Guards the #1580 sidebar-order requirements against the real docs tree:
 * every page must declare frontmatter that actually parses (at least one page
 * previously had stray code fences before the `---` block, so gray-matter
 * silently dropped its `section`/`order` and it fell into "General"), and
 * every page must have a unique order within its own section so the sort is
 * deterministic instead of depending on filesystem traversal order.
 */
describe("docs frontmatter + sidebar order", () => {
  const files = collectFilesByExtension(DOCS_DIR, ".mdx");

  it("has at least one docs page to check", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it("starts every page with a frontmatter block", () => {
    const offenders = files.filter((file) => {
      const raw = fs.readFileSync(path.join(DOCS_DIR, file), "utf-8");
      return raw.replace(/^\uFEFF/, "").split(/\r?\n/, 1)[0].trim() !== "---";
    });

    expect(offenders, `pages whose first line is not "---": ${offenders.join(", ")}`).toEqual([]);
  });

  it("parses title, section and order for every page", () => {
    const offenders: string[] = [];

    for (const file of files) {
      const slug = file.replace(/\.mdx$/, "");
      const doc = getDocBySlug(slug);
      if (
        !doc ||
        typeof doc.frontmatter.title !== "string" ||
        typeof doc.frontmatter.section !== "string" ||
        typeof doc.frontmatter.order !== "number"
      ) {
        offenders.push(slug);
      }
    }

    expect(offenders, `pages missing frontmatter fields: ${offenders.join(", ")}`).toEqual([]);
  });

  it("gives every page a unique order within its section", () => {
    for (const section of getSidebarNav()) {
      const orders = section.links.map((link) => link.order);
      const duplicates = orders.filter((order, index) => orders.indexOf(order) !== index);
      expect(
        [...new Set(duplicates)],
        `duplicate order values in "${section.section}": ${section.links
          .filter((link) => duplicates.includes(link.order))
          .map((link) => `${link.slug}=${link.order}`)
          .join(", ")}`,
      ).toEqual([]);
    }
  });

  it("orders the sidebar sections intentionally", () => {
    expect(getSidebarNav().map((section) => section.section)).toEqual([
      "Getting Started",
      "Guides",
      "SDK",
      "API Reference",
      "Internal",
    ]);
  });

  it("keeps the architecture page resolvable with its frontmatter intact", () => {
    const doc = getDocBySlug("guide/architecture");
    expect(doc).not.toBeNull();
    expect(doc!.frontmatter.title).toBe("Architecture");
    expect(doc!.frontmatter.section).toBe("Guides");
    expect(typeof doc!.frontmatter.order).toBe("number");
    expect(doc!.content.trimStart().startsWith("```")).toBe(false);
  });
});
