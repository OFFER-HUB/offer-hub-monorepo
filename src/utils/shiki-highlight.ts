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
