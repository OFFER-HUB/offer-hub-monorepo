import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join, relative, basename, dirname } from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Navigate from mcp/build/ to project root
const PROJECT_ROOT = join(__dirname, "..", "..");

interface DocPage {
  title: string;
  description: string;
  section: string;
  slug: string;
  content: string;
  source: "mdx" | "md";
  order?: number;
}

interface DocSection {
  name: string;
  slug: string;
  pages: Array<{
    title: string;
    slug: string;
    description: string;
  }>;
}

const docs: Map<string, DocPage> = new Map();

function findFiles(dir: string, extension: string): string[] {
  const files: string[] = [];

  if (!existsSync(dir)) {
    return files;
  }

  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...findFiles(fullPath, extension));
    } else if (entry.endsWith(extension)) {
      files.push(fullPath);
    }
  }

  return files;
}

function parseDocument(filePath: string, baseDir: string, source: "mdx" | "md"): DocPage | null {
  try {
    const fileContent = readFileSync(filePath, "utf-8");
    const { data: frontmatter, content } = matter(fileContent);

    // Generate slug from file path
    const relativePath = relative(baseDir, filePath);
    const slug = relativePath
      .replace(/\.(mdx?|md)$/, "")
      .replace(/\\/g, "/"); // Normalize Windows paths

    // Extract title from frontmatter or first heading or filename
    let title = frontmatter.title;
    if (!title) {
      const headingMatch = content.match(/^#\s+(.+)$/m);
      title = headingMatch ? headingMatch[1] : basename(filePath, source === "mdx" ? ".mdx" : ".md");
    }

    // Extract description from frontmatter or first paragraph
    let description = frontmatter.description || "";
    if (!description) {
      const paragraphMatch = content.match(/^(?!#)(?!>)(?!-)(?!\|)(.+)$/m);
      description = paragraphMatch ? paragraphMatch[1].slice(0, 200) : "";
    }

    // Determine section from frontmatter or directory structure
    let section = frontmatter.section || "";
    if (!section) {
      const parts = slug.split("/");
      if (parts.length > 1) {
        section = parts[0]
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      } else {
        section = source === "mdx" ? "Getting Started" : "Documentation";
      }
    }

    return {
      title,
      description,
      section,
      slug,
      content,
      source,
      order: frontmatter.order,
    };
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error);
    return null;
  }
}

export async function loadDocumentation(): Promise<void> {
  docs.clear();

  // Load MDX files from content/docs/
  const mdxDir = join(PROJECT_ROOT, "content", "docs");
  const mdxFiles = findFiles(mdxDir, ".mdx");

  for (const file of mdxFiles) {
    const doc = parseDocument(file, mdxDir, "mdx");
    if (doc) {
      docs.set(doc.slug, doc);
    }
  }

  // Load MD files from docs/
  const mdDir = join(PROJECT_ROOT, "docs");
  const mdFiles = findFiles(mdDir, ".md");

  for (const file of mdFiles) {
    const doc = parseDocument(file, mdDir, "md");
    if (doc) {
      // Prefix docs/ files with "docs/" to avoid slug conflicts
      const prefixedSlug = `docs/${doc.slug}`;
      doc.slug = prefixedSlug;
      docs.set(prefixedSlug, doc);
    }
  }

  console.error(`Loaded ${docs.size} documentation pages`);
}

export function listSections(): DocSection[] {
  const sectionsMap = new Map<string, DocSection>();

  for (const doc of docs.values()) {
    const sectionSlug = doc.section.toLowerCase().replace(/\s+/g, "-");

    if (!sectionsMap.has(sectionSlug)) {
      sectionsMap.set(sectionSlug, {
        name: doc.section,
        slug: sectionSlug,
        pages: [],
      });
    }

    sectionsMap.get(sectionSlug)!.pages.push({
      title: doc.title,
      slug: doc.slug,
      description: doc.description,
    });
  }

  // Sort sections and pages
  const sections = Array.from(sectionsMap.values());
  sections.sort((a, b) => a.name.localeCompare(b.name));

  for (const section of sections) {
    section.pages.sort((a, b) => a.title.localeCompare(b.title));
  }

  return sections;
}

export function searchDocs(
  query: string,
  maxResults: number = 10
): Array<{
  title: string;
  slug: string;
  description: string;
  section: string;
  snippet: string;
  score: number;
}> {
  const queryLower = query.toLowerCase();
  const queryTerms = queryLower.split(/\s+/).filter((term) => term.length > 0);

  const results: Array<{
    title: string;
    slug: string;
    description: string;
    section: string;
    snippet: string;
    score: number;
  }> = [];

  for (const doc of docs.values()) {
    let score = 0;
    const titleLower = doc.title.toLowerCase();
    const descLower = doc.description.toLowerCase();
    const contentLower = doc.content.toLowerCase();

    for (const term of queryTerms) {
      // Title matches (highest weight)
      if (titleLower.includes(term)) {
        score += 10;
        if (titleLower === term) score += 5; // Exact match bonus
      }

      // Description matches (medium weight)
      if (descLower.includes(term)) {
        score += 5;
      }

      // Content matches (lower weight, but count occurrences)
      const contentMatches = (contentLower.match(new RegExp(term, "g")) || []).length;
      score += Math.min(contentMatches, 5); // Cap at 5 to avoid bias
    }

    if (score > 0) {
      // Extract snippet around first match
      let snippet = "";
      const firstMatchIndex = contentLower.indexOf(queryTerms[0]);
      if (firstMatchIndex !== -1) {
        const start = Math.max(0, firstMatchIndex - 50);
        const end = Math.min(doc.content.length, firstMatchIndex + 150);
        snippet = doc.content.slice(start, end).replace(/\n+/g, " ").trim();
        if (start > 0) snippet = "..." + snippet;
        if (end < doc.content.length) snippet = snippet + "...";
      }

      results.push({
        title: doc.title,
        slug: doc.slug,
        description: doc.description,
        section: doc.section,
        snippet,
        score,
      });
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, maxResults);
}

export function getDocBySlug(slug: string): DocPage | null {
  // Try exact match first
  if (docs.has(slug)) {
    return docs.get(slug)!;
  }

  // Try with/without docs/ prefix
  if (slug.startsWith("docs/")) {
    const withoutPrefix = slug.slice(5);
    if (docs.has(withoutPrefix)) {
      return docs.get(withoutPrefix)!;
    }
  } else {
    const withPrefix = `docs/${slug}`;
    if (docs.has(withPrefix)) {
      return docs.get(withPrefix)!;
    }
  }

  // Try partial match (e.g., "overview" matches "guides/overview")
  for (const [key, doc] of docs) {
    if (key.endsWith(`/${slug}`) || key === slug) {
      return doc;
    }
  }

  return null;
}
