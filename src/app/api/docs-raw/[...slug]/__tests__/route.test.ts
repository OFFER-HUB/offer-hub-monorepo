// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

const state = vi.hoisted(() => ({
  docs: new Map<string, { frontmatter: { title: string; description: string }; content: string; slug: string }>(),
}));

vi.mock("@/lib/mdx", () => ({
  getRawMarkdown: (slug: string) => {
    const doc = state.docs.get(slug);
    if (!doc) return null;

    const lines = [`title: "${doc.frontmatter.title}"`];
    if (doc.frontmatter.description) {
      lines.push(`description: "${doc.frontmatter.description}"`);
    }

    return `---\n${lines.join("\n")}\n---\n\n${doc.content}`;
  },
}));

import { GET } from "../route";

function request(slugParts: string[]) {
  return GET(new Request(`https://offer-hub.tech/docs/${slugParts.join("/")}/raw`), {
    params: Promise.resolve({ slug: slugParts }),
  });
}

beforeEach(() => {
  state.docs.clear();
});

describe("GET /docs/[...slug]/raw", () => {
  it("returns the frontmatter and markdown body with a text/markdown content type", async () => {
    state.docs.set("getting-started", {
      frontmatter: { title: "Getting Started", description: "How to get started." },
      content: "# Getting Started\n\nSome content here.",
      slug: "getting-started",
    });

    const res = await request(["getting-started"]);

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/markdown; charset=utf-8");

    const body = await res.text();
    expect(body).toContain('title: "Getting Started"');
    expect(body).toContain('description: "How to get started."');
    expect(body).toContain("# Getting Started");
    expect(body).toContain("Some content here.");
    expect(body.startsWith("---\n")).toBe(true);
  });

  it("joins nested slug segments before looking up the doc", async () => {
    state.docs.set("guide/cli", {
      frontmatter: { title: "CLI Guide", description: "" },
      content: "CLI docs.",
      slug: "guide/cli",
    });

    const res = await request(["guide", "cli"]);

    expect(res.status).toBe(200);
    expect(await res.text()).toContain("CLI docs.");
  });

  it("returns a 404 response when the doc does not exist", async () => {
    const res = await request(["does-not-exist"]);

    expect(res.status).toBe(404);
  });

  it("sets a caching header", async () => {
    state.docs.set("configuration", {
      frontmatter: { title: "Configuration", description: "" },
      content: "Config docs.",
      slug: "configuration",
    });

    const res = await request(["configuration"]);

    expect(res.headers.get("Cache-Control")).toBe("public, max-age=3600");
  });
});
