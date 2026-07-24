// Shared doc-indexing and frontmatter parsing utilities.
// Uses only Node.js core modules and gray-matter — safe for scripts, MCP, and Next.js server code.

import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface DocFrontmatter {
  title: string;
  description: string;
  order: number;
  section: string;
}

export interface DocPage {
  frontmatter: DocFrontmatter;
  content: string;
  slug: string;
}

export interface SidebarLink {
  title: string;
  slug: string;
  order: number;
}

export interface SidebarSection {
  section: string;
  links: SidebarLink[];
}

export interface Heading {
  level: 2 | 3;
  text: string;
  id: string;
}

// Recursively collect all file paths under a directory matching a given extension.
export function collectMdxFiles(dir: string, base = "", extension = ".mdx"): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const results: string[] = [];

  for (const entry of entries) {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      results.push(...collectMdxFiles(path.join(dir, entry.name), rel, extension));
    } else if (entry.isFile() && entry.name.endsWith(extension)) {
      results.push(rel);
    }
  }

  return results;
}

// Convert a file path like "api-reference/webhooks.mdx" to a slug "api-reference/webhooks".
export function fileToSlug(filePath: string): string {
  return filePath.replace(/\.(mdx?|md)$/, "").replace(/\\/g, "/");
}

// Parse frontmatter and content from a doc file at the given absolute path. Returns null if the file doesn't exist.
export function parseDocFile(filePath: string): { frontmatter: DocFrontmatter; content: string } | null {
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return { frontmatter: data as DocFrontmatter, content };
}

// Return all doc slugs from the standard docs directory.
export function getAllDocSlugs(docsDir: string): string[] {
  if (!fs.existsSync(docsDir)) return [];
  return collectMdxFiles(docsDir).map(fileToSlug);
}

// Load and parse a single doc by slug from the given docs directory. Returns null if not found.
export function getDocBySlug(slug: string, docsDir: string): DocPage | null {
  const filePath = path.join(docsDir, `${slug}.mdx`);
  const parsed = parseDocFile(filePath);
  if (!parsed) return null;
  return { ...parsed, slug };
}

// Build sidebar navigation grouped by section, sorted by order within each section.
export function getSidebarNav(docsDir: string): SidebarSection[] {
  if (!fs.existsSync(docsDir)) return [];

  const files = collectMdxFiles(docsDir);
  const sectionMap = new Map<string, SidebarLink[]>();

  for (const file of files) {
    const slug = fileToSlug(file);
    const filePath = path.join(docsDir, file);
    const parsed = parseDocFile(filePath);
    if (!parsed) continue;

    const fm = parsed.frontmatter;
    const section = fm.section || "General";

    if (!sectionMap.has(section)) {
      sectionMap.set(section, []);
    }

    sectionMap.get(section)!.push({
      title: fm.title || slug,
      slug,
      order: fm.order ?? 99,
    });
  }

  // Sort links within each section by order
  const sections: SidebarSection[] = [];
  sectionMap.forEach((links, section) => {
    sections.push({
      section,
      links: links.sort((a, b) => a.order - b.order),
    });
  });

  // Sort sections by the lowest order of their first link
  return sections.sort((a, b) => (a.links[0]?.order ?? 99) - (b.links[0]?.order ?? 99));
}

// Extract h2 and h3 headings from raw MDX content for Table of Contents.
export function extractHeadings(content: string): Heading[] {
  const headings: Heading[] = [];
  const regex = /^(#{2,3})\s+(.+)$/gm;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    const level = match[1].length as 2 | 3;
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

    headings.push({ level, text, id });
  }

  return headings;
}
