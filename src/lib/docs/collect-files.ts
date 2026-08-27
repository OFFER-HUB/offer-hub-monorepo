import fs from "fs";
import path from "path";

/**
 * Recursively collects files under `dir` whose name ends with `extension`,
 * returning paths relative to `dir` with forward slashes (e.g.
 * `"api-reference/webhooks.mdx"`).
 *
 * This is the traversal shared by every doc-indexing entry point in the
 * monorepo: the Next.js docs pipeline (`src/lib/mdx.ts`), the search-index
 * generator (`scripts/generate-docs-index.ts`), and the standalone MCP
 * server (`mcp/src/docs-loader.ts`, via a synced copy — the `mcp/` package
 * builds independently of the root `tsconfig`, so it can't import this file
 * directly; see `mcp/scripts/sync-shared.mjs`).
 *
 * What's deliberately *not* unified here is frontmatter/title/section
 * derivation — each caller reads different fields with different fallback
 * rules, so consolidating that would risk changing what each one outputs.
 * Only this traversal was byte-for-byte identical across all three.
 */
export function collectFilesByExtension(dir: string, extension: string, base = ""): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const results: string[] = [];

  for (const entry of entries) {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      results.push(...collectFilesByExtension(path.join(dir, entry.name), extension, rel));
    } else if (entry.isFile() && entry.name.endsWith(extension)) {
      results.push(rel);
    }
  }

  return results;
}
