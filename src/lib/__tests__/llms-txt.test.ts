// @vitest-environment node
import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/mdx", () => ({
  getSidebarNav: vi.fn(() => [
    {
      section: "Getting Started",
      links: [{ title: "Getting Started", slug: "getting-started", order: 1 }],
    },
    {
      section: "Guides",
      links: [
        { title: "Escrow", slug: "guide/escrow", order: 1 },
        { title: "No Description", slug: "guide/no-description", order: 2 },
        { title: "Missing", slug: "guide/missing", order: 3 },
      ],
    },
  ]),
  getDocBySlug: vi.fn((slug: string) => {
    if (slug === "guide/missing") return null;
    if (slug === "guide/no-description") {
      return {
        slug,
        frontmatter: { title: "No Description", order: 2, section: "Guides" },
        content: "Body.",
      };
    }
    return {
      slug,
      frontmatter: { title: `Title for ${slug}`, description: `Description for ${slug}`, order: 1, section: "Section" },
      content: `Content for ${slug}.`,
    };
  }),
}));

vi.mock("@/constants/site", () => ({
  SITE_URL_FALLBACK: "https://offer-hub.tech",
  SITE_NAME: "OFFER-HUB",
}));

import { buildLlmsIndex, buildLlmsFull } from "../llms-txt";

describe("buildLlmsIndex", () => {
  it("starts with an H1 of the site name and a blockquote summary", () => {
    const body = buildLlmsIndex();
    const lines = body.split("\n");

    expect(lines[0]).toBe("# OFFER-HUB");
    expect(lines[2]).toMatch(/^>/);
  });

  it("renders a ## heading per sidebar section, in order", () => {
    const body = buildLlmsIndex();

    expect(body.indexOf("## Getting Started")).toBeGreaterThan(-1);
    expect(body.indexOf("## Getting Started")).toBeLessThan(body.indexOf("## Guides"));
  });

  it("renders each link as a markdown list item with an absolute URL and description", () => {
    const body = buildLlmsIndex();

    expect(body).toContain(
      "- [Escrow](https://offer-hub.tech/docs/guide/escrow): Description for guide/escrow",
    );
  });

  it("omits the trailing colon when a page has no description", () => {
    const body = buildLlmsIndex();

    expect(body).toContain("- [No Description](https://offer-hub.tech/docs/guide/no-description)");
    expect(body).not.toContain("No Description](https://offer-hub.tech/docs/guide/no-description):");
  });
});

describe("buildLlmsFull", () => {
  it("prefixes each page with an H1 of its title", () => {
    const body = buildLlmsFull();

    expect(body).toContain("# Title for getting-started");
    expect(body).toContain("# Title for guide/escrow");
  });

  it("includes each page's full content", () => {
    const body = buildLlmsFull();

    expect(body).toContain("Content for getting-started.");
    expect(body).toContain("Content for guide/escrow.");
  });

  it("separates pages with a horizontal rule, in sidebar order", () => {
    const body = buildLlmsFull();
    const parts = body.trimEnd().split("\n\n---\n\n");

    expect(parts).toHaveLength(3);
    expect(parts[0]).toContain("getting-started");
    expect(parts[1]).toContain("guide/escrow");
  });

  it("skips slugs that no longer resolve to a doc", () => {
    const body = buildLlmsFull();

    expect(body).not.toContain("guide/missing");
  });
});
