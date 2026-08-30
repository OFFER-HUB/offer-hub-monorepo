/**
 * Shared filename helpers for the docs page-export menu items
 * (Export Markdown / Export JSON / Export PDF), so all three exports
 * name their downloads consistently.
 */

/** Today's date as `YYYY-MM-DD`, for stamping export filenames. */
export function docExportDateStamp(date: Date = new Date()): string {
  return date.toISOString().split("T")[0];
}

/** Turn a nested doc slug (e.g. "api-reference/webhooks") into a flat, filename-safe base. */
export function docExportBaseName(slug: string): string {
  return slug.replace(/\//g, "-");
}
