// Shared Shiki highlighting utilities.
// The cache is a module-level singleton shared across all consumers.

export const highlightCache = new Map<string, string>();

export function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
