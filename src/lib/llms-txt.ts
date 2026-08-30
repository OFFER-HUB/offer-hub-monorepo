import { getSidebarNav, getDocBySlug } from "@/lib/mdx";
import { SITE_URL_FALLBACK, SITE_NAME } from "@/constants/site";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || SITE_URL_FALLBACK;

/** Build the llms.txt index per the https://llmstxt.org/ convention. */
export function buildLlmsIndex(): string {
  const sections = getSidebarNav();

  const lines = [
    `# ${SITE_NAME}`,
    "",
    "> Self-hosted payments orchestrator for marketplaces, providing escrow-protected payments and user balances via Trustless Work on Stellar.",
    "",
  ];

  for (const { section, links } of sections) {
    lines.push(`## ${section}`, "");

    for (const link of links) {
      const doc = getDocBySlug(link.slug);
      const description = doc?.frontmatter.description;
      const url = `${SITE_URL}/docs/${link.slug}`;
      lines.push(
        description ? `- [${link.title}](${url}): ${description}` : `- [${link.title}](${url})`,
      );
    }

    lines.push("");
  }

  return lines.join("\n").trimEnd() + "\n";
}

/** Concatenate every doc's full Markdown content, ordered the same way the sidebar is. */
export function buildLlmsFull(): string {
  const sections = getSidebarNav();
  const pages: string[] = [];

  for (const { links } of sections) {
    for (const link of links) {
      const doc = getDocBySlug(link.slug);
      if (!doc) continue;
      pages.push(`# ${doc.frontmatter.title || link.title}\n\n${doc.content.trim()}`);
    }
  }

  return pages.join("\n\n---\n\n") + "\n";
}
