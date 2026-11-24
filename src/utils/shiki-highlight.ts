/**
 * Shared state for Shiki-based syntax highlighting used by both the docs
 * `CodeBlock` and the use-case `CodeIntegrationShowcase`.
 *
 * `highlightCache` is a module-level `Map`, so it persists across renders,
 * component instances, and — since both consumers key their cache entries
 * with the theme and language baked in — across the two components as well.
 * Highlighting the same snippet in two places only costs Shiki once.
 */
export const highlightCache = new Map<string, string>();

/**
 * Escapes text for safe interpolation into a raw HTML string. Used as the
 * fallback renderer (`<pre><code>...</code></pre>`) when Shiki fails to
 * highlight a snippet.
 */
export function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/**
 * Parses line highlight ranges like "{1,3-5}", "1, 3-5, 8", or "{4}"
 * into a Set of 1-based line numbers.
 */
export function parseLineHighlightRange(rangeStr?: string): Set<number> {
  const lines = new Set<number>();
  if (!rangeStr) {
    return lines;
  }

  // Strip wrapping curly braces and whitespace
  const cleaned = rangeStr.trim().replace(/^\{|\}$/g, "").trim();
  if (!cleaned) {
    return lines;
  }

  const parts = cleaned.split(",");
  for (const part of parts) {
    const item = part.trim();
    if (!item) continue;

    if (item.includes("-")) {
      const [startStr, endStr] = item.split("-");
      const start = parseInt(startStr?.trim() ?? "", 10);
      const end = parseInt(endStr?.trim() ?? "", 10);
      if (!isNaN(start) && !isNaN(end) && start > 0 && end >= start) {
        for (let i = start; i <= end; i++) {
          lines.add(i);
        }
      }
    } else {
      const num = parseInt(item, 10);
      if (!isNaN(num) && num > 0) {
        lines.add(num);
      }
    }
  }

  return lines;
}

