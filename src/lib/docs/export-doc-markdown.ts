import { downloadBlob } from "@/utils/downloadBlob";
import { docExportBaseName, docExportDateStamp } from "@/lib/docs/export-filenames";

/** Downloads the current doc's raw Markdown/MDX body as a `.md` file. */
export function exportDocMarkdown(slug: string, markdownContent: string): void {
  const filename = `${docExportBaseName(slug)}-${docExportDateStamp()}.md`;
  downloadBlob(filename, markdownContent, "text/markdown;charset=utf-8");
}
