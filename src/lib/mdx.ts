import fs from "fs";
import path from "path";
import matter from "gray-matter";

const DOCS_DIR = path.join(process.cwd(), "content/docs");

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

/** Recursively collect all .mdx file paths under a directory */
function collectMdxFiles(dir: string, base = ""): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const results: string[] = [];

  for (const entry of entries) {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      results.push(...collectMdxFiles(path.join(dir, entry.name), rel));
    } else if (entry.isFile() && entry.name.endsWith(".mdx")) {
      results.push(rel);
    }
  }

  return results;
}

/** Convert a file path like "api-reference/webhooks.mdx" to a slug "api-reference/webhooks" */
function fileToSlug(filePath: string): string {
  return filePath.replace(/\.mdx$/, "");
}

/** Return all doc slugs (used by generateStaticParams) */
export function getAllDocSlugs(): string[] {
  if (!fs.existsSync(DOCS_DIR)) return [];
  return collectMdxFiles(DOCS_DIR).map(fileToSlug);
}

/** Load and parse a single doc by slug. Returns null if not found. */
export function getDocBySlug(slug: string): DocPage | null {
  const filePath = path.join(DOCS_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return {
    frontmatter: data as DocFrontmatter,
    content,
    slug,
  };
}

/** Build sidebar navigation grouped by section, sorted by order within each section. */
export function getSidebarNav(): SidebarSection[] {
  if (!fs.existsSync(DOCS_DIR)) return [];

  const files = collectMdxFiles(DOCS_DIR);
  const sectionMap = new Map<string, SidebarLink[]>();

  for (const file of files) {
    const slug = fileToSlug(file);
    const filePath = path.join(DOCS_DIR, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(raw);
    const fm = data as DocFrontmatter;
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

/** Extract h2 and h3 headings from raw MDX content for Table of Contents */
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
