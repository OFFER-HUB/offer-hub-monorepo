import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Import shared doc-indexing utilities.
import { collectMdxFiles } from "../src/lib/docs-indexing";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DOCS_DIR = resolve(__dirname, "../content/docs");
const OUTPUT_FILE = resolve(__dirname, "../src/data/docs-index.json");

// Ensure output directory exists
const outputDir = dirname(OUTPUT_FILE);
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

if (!existsSync(DOCS_DIR)) {
  console.error(`Error: Documentation directory not found at ${DOCS_DIR}`);
  process.exit(1);
}

const files = collectMdxFiles(DOCS_DIR);
const index: Array<{
  id: string;
  title: string;
  section: string;
  content: string;
  link: string;
}> = [];

files.forEach((relativePath: string) => {
  const content = readFileSync(resolve(DOCS_DIR, relativePath), "utf8");
  const slug = relativePath.replace(".mdx", "").toLowerCase().replace(/_/g, "-");

  // Attempt to extract title from markdown or frontmatter
  let docTitle = slug.split("/").pop() ?? "";
  const titleMatch = content.match(/^#\s+(.+)$/m);
  if (titleMatch) {
    docTitle = titleMatch[1].trim();
  } else {
    const fmTitleMatch = content.match(/title:\s*["']?([^"'\n]+)["']?/);
    if (fmTitleMatch) {
      docTitle = fmTitleMatch[1].trim();
    }
  }

  // Split by headers (h2, h3)
  const sections = content.split(/\n(?=##?#? )/);

  sections.forEach((section: string, idx: number) => {
    const lines = section.trim().split("\n");
    if (lines.length === 0) return;

    const headerLine = lines[0];
    const isSectionHeader = headerLine.startsWith("## ") || headerLine.startsWith("### ");

    let sectionTitle = docTitle;
    let sectionId = "";

    if (isSectionHeader) {
      sectionTitle = headerLine.replace(/^##?#? /, "").trim();
      sectionId = "#" + sectionTitle.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
    }

    const sectionContent = lines
      .slice(1)
      .join(" ")
      .replace(/<[^>]*>?/gm, "") // remove HTML tags (MDX)
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1") // remove markdown links
      .replace(/[`*#]/g, "") // remove markdown symbols
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 300);

    if (sectionContent.length > 20) {
      index.push({
        id: `${slug.replace(/\//g, "-")}-${idx}`,
        title: docTitle,
        section: sectionTitle,
        content: sectionContent,
        link: `/docs/${slug}${sectionId}`,
      });
    }
  });
});

writeFileSync(OUTPUT_FILE, JSON.stringify(index, null, 2));
console.log(`Generated search index with ${index.length} entries from ${DOCS_DIR}.`);
