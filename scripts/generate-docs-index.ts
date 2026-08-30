import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { collectFilesByExtension } from "../src/lib/docs/collect-files";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOCS_DIR = path.resolve(__dirname, "../content/docs");
const OUTPUT_FILE = path.resolve(__dirname, "../src/data/docs-index.json");

interface DocsIndexEntry {
  id: string;
  title: string;
  section: string;
  content: string;
  link: string;
}

// Ensure output directory exists
const outputDir = path.dirname(OUTPUT_FILE);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

if (!fs.existsSync(DOCS_DIR)) {
  console.error(`Error: Documentation directory not found at ${DOCS_DIR}`);
  process.exit(1);
}

const files = collectFilesByExtension(DOCS_DIR, ".mdx");
const index: DocsIndexEntry[] = [];

files.forEach((relativePath) => {
  const content = fs.readFileSync(path.join(DOCS_DIR, relativePath), "utf8");
  const slug = relativePath.replace(".mdx", "").toLowerCase().replace(/_/g, "-");

  // Attempt to extract title from markdown or frontmatter
  let docTitle = slug.split("/").pop() as string;
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

  sections.forEach((section, idx) => {
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
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // remove markdown links
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

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(index, null, 2));
console.log(`Generated search index with ${index.length} entries from ${DOCS_DIR}.`);
