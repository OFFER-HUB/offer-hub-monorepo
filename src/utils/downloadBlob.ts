/**
 * Triggers a browser download of `content` as a file named `filename`.
 *
 * Builds a `Blob`, mounts a throwaway `<a download>` link, and clicks it —
 * the standard client-side download pattern for content generated in memory
 * (exported JSON, Markdown, etc.) rather than fetched from a URL.
 */
export function downloadBlob(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
