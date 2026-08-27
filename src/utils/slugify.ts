/**
 * Converts heading text into a lowercase, hyphenated id safe for use as an
 * HTML `id` / URL fragment (e.g. for scroll-to-heading table-of-contents
 * links). Strips everything but letters, digits, spaces, and hyphens, then
 * collapses whitespace into single hyphens.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}
