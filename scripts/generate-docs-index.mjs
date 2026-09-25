/**
 * Plain-ESM version of generate-docs-index.ts — consumed by vitest.globalSetup.ts
 * when src/data/docs-index.json doesn't yet exist (fresh clone / clean CI run).
 * The TypeScript original (generate-docs-index.ts) remains the authoritative
 * prebuild script run by `npm run build` via tsx; this file is a Node-runnable
 * mirror that vitest can import() without requiring tsx.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOCS_DIR = path.resolve(__dirname, "../content/docs");
const OUTPUT_FILE = path.resolve(__dirname, "../src/data/docs-index.json");

/** Recursively collect all .mdx files under dir, returning paths relative to dir. */
function collectMdx(dir, base = "", out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      collectMdx(path.join(dir, entry.name), rel, out);
    } else if (entry.name.endsWith(".mdx")) {
      out.push(rel);
    }
  }
  return out;
}

// Ensure output directory exists
const outputDir = path.dirname(OUTPUT_FILE);
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

if (!fs.existsSync(DOCS_DIR)) {
  console.error(`Error: Documentation directory not found at ${DOCS_DIR}`);
  process.exit(1);
}

const files = collectMdx(DOCS_DIR);
const index = [];

files.forEach((relativePath) => {
  const content = fs.readFileSync(path.join(DOCS_DIR, relativePath), "utf8");
  const slug = relativePath.replace(".mdx", "").toLowerCase().replace(/_/g, "-");

  let docTitle = /** @type {string} */ (slug.split("/").pop());
  const titleMatch = content.match(/^#\s+(.+)$/m);
  if (titleMatch) {
    docTitle = titleMatch[1].trim();
  } else {
    const fmTitleMatch = content.match(/title:\s*["']?([^"'\n]+)["']?/);
    if (fmTitleMatch) docTitle = fmTitleMatch[1].trim();
  }

  const sections = content.split(/\n(?=##?#? )/);

  sections.forEach((section, idx) => {
    const lines = section.trim().split("\n");
    if (!lines.length) return;

    const headerLine = lines[0];
    const isSectionHeader =
      headerLine.startsWith("## ") || headerLine.startsWith("### ");

    let sectionTitle = docTitle;
    let sectionId = "";

    if (isSectionHeader) {
      sectionTitle = headerLine.replace(/^##?#? /, "").trim();
      sectionId =
        "#" +
        sectionTitle
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-")
          .replace(/-+/g, "-");
    }

    const sectionContent = lines
      .slice(1)
      .join(" ")
      .replace(/<[^>]*>?/gm, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[`*#]/g, "")
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
console.log(
  `Generated search index with ${index.length} entries from ${DOCS_DIR}.`,
);
