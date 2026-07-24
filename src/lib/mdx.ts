import path from "path";
import fs from "fs";

import {
  collectMdxFiles,
  fileToSlug,
  parseDocFile,
  extractHeadings as sharedExtractHeadings,
  getSidebarNav as sharedGetSidebarNav,
} from "@/lib/docs-indexing";
import type {
  DocFrontmatter,
  DocPage,
  SidebarLink,
  SidebarSection,
  Heading,
} from "@/lib/docs-indexing";

// Re-export shared types so existing imports keep working.
export type { DocFrontmatter, DocPage, SidebarLink, SidebarSection, Heading };

const DOCS_DIR = path.join(process.cwd(), "content/docs");

/** Return all doc slugs (used by generateStaticParams) */
export function getAllDocSlugs(): string[] {
  if (!fs.existsSync(DOCS_DIR)) return [];
  return collectMdxFiles(DOCS_DIR).map(fileToSlug);
}

/** Load and parse a single doc by slug. Returns null if not found. */
export function getDocBySlug(slug: string): DocPage | null {
  const filePath = path.join(DOCS_DIR, `${slug}.mdx`);
  const parsed = parseDocFile(filePath);
  if (!parsed) return null;
  return { ...parsed, slug };
}

/** Build sidebar navigation grouped by section, sorted by order within each section. */
export function getSidebarNav(): SidebarSection[] {
  return sharedGetSidebarNav(DOCS_DIR);
}

/** Read a static MDX file's raw content by path relative to the project root */
export function getStaticMdxContent(relativePath: string): string {
  return fs.readFileSync(path.join(process.cwd(), relativePath), "utf-8");
}

/** Extract h2 and h3 headings from raw MDX content for Table of Contents */
export function extractHeadings(content: string): Heading[] {
  return sharedExtractHeadings(content);
}
