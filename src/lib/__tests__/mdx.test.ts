import { describe, it, expect, vi, beforeEach } from "vitest";
import path from "node:path";

/**
 * `mdx.ts` reads the filesystem directly, so these tests drive it against a
 * small in-memory tree instead of the real `content/docs` (whose contents
 * change with every docs PR and would make the assertions churn).
 */
const vfs = vi.hoisted(() => ({
  dirs: new Set<string>(),
  files: new Map<string, string>(),
}));

const norm = (p: string) => p.replace(/\\/g, "/").replace(/\/+$/, "");

vi.mock("fs", () => {
  const existsSync = (p: string) =>
    vfs.dirs.has(norm(p)) || vfs.files.has(norm(p));

  const readdirSync = (dir: string) => {
    const base = norm(dir);
    const names = new Set<string>();
    const entries: { name: string; isDirectory(): boolean; isFile(): boolean }[] = [];

    const add = (name: string, isDir: boolean) => {
      if (names.has(name)) return;
      names.add(name);
      entries.push({
        name,
        isDirectory: () => isDir,
        isFile: () => !isDir,
      });
    };

    for (const d of vfs.dirs) {
      if (d.startsWith(base + "/")) {
        const rest = d.slice(base.length + 1);
        if (!rest.includes("/")) add(rest, true);
      }
    }
    for (const f of vfs.files.keys()) {
      if (f.startsWith(base + "/")) {
        const rest = f.slice(base.length + 1);
        if (!rest.includes("/")) add(rest, false);
      }
    }
    return entries;
  };

  const readFileSync = (p: string) => {
    const content = vfs.files.get(norm(p));
    if (content === undefined) {
      throw Object.assign(new Error("ENOENT: " + p), { code: "ENOENT" });
    }
    return content;
  };

  const api = { existsSync, readdirSync, readFileSync };
  return { default: api, ...api };
});

import {
  getAllDocSlugs,
  getDocBySlug,
  getSidebarNav,
  getStaticMdxContent,
  extractHeadings,
} from "../mdx";

const DOCS_DIR = norm(path.join(process.cwd(), "content/docs"));

function writeDoc(relPath: string, frontmatter: string, body = "Body copy.") {
  const full = DOCS_DIR + "/" + relPath;
  let dir = norm(path.dirname(full));
  while (dir.length >= DOCS_DIR.length) {
    vfs.dirs.add(dir);
    const parent = norm(path.dirname(dir));
    if (parent === dir) break;
    dir = parent;
  }
  vfs.files.set(full, "---\n" + frontmatter + "\n---\n\n" + body);
}

beforeEach(() => {
  vfs.dirs.clear();
  vfs.files.clear();
});

describe("getAllDocSlugs", () => {
  it("returns an empty list when the docs directory does not exist", () => {
    expect(getAllDocSlugs()).toEqual([]);
  });

  it("collects nested .mdx files as slash-separated slugs without the extension", () => {
    writeDoc("intro.mdx", "title: Intro");
    writeDoc("api-reference/webhooks.mdx", "title: Webhooks");
    writeDoc("guide/escrow/deposits.mdx", "title: Deposits");

    expect(getAllDocSlugs().sort()).toEqual([
      "api-reference/webhooks",
      "guide/escrow/deposits",
      "intro",
    ]);
  });

  it("ignores files that are not .mdx", () => {
    writeDoc("intro.mdx", "title: Intro");
    vfs.files.set(DOCS_DIR + "/README.md", "# not a doc");
    vfs.files.set(DOCS_DIR + "/diagram.png", "binary");

    expect(getAllDocSlugs()).toEqual(["intro"]);
  });
});

describe("getDocBySlug", () => {
  it("returns null for a slug with no matching file", () => {
    vfs.dirs.add(DOCS_DIR);

    expect(getDocBySlug("does-not-exist")).toBeNull();
  });

  it("parses frontmatter and body, echoing the slug back", () => {
    writeDoc(
      "guide/quick-start.mdx",
      "title: Quick Start\ndescription: Get going fast\norder: 2\nsection: Guides",
      "## Step one\n\nDo the thing.",
    );

    expect(getDocBySlug("guide/quick-start")).toEqual({
      slug: "guide/quick-start",
      frontmatter: {
        title: "Quick Start",
        description: "Get going fast",
        order: 2,
        section: "Guides",
      },
      content: expect.stringContaining("## Step one"),
    });
  });

  it("does not leak frontmatter into the returned content", () => {
    writeDoc("intro.mdx", "title: Intro", "Just the body.");

    expect(getDocBySlug("intro")!.content).not.toContain("title: Intro");
  });
});

describe("getSidebarNav", () => {
  it("returns an empty list when the docs directory does not exist", () => {
    expect(getSidebarNav()).toEqual([]);
  });

  it("groups links by section and sorts them by order within each section", () => {
    writeDoc("b.mdx", "title: B\nsection: Guides\norder: 2");
    writeDoc("a.mdx", "title: A\nsection: Guides\norder: 1");

    const nav = getSidebarNav();

    expect(nav).toHaveLength(1);
    expect(nav[0].section).toBe("Guides");
    expect(nav[0].links.map((l) => l.title)).toEqual(["A", "B"]);
  });

  it("orders sections by the lowest order of their first link", () => {
    writeDoc("advanced.mdx", "title: Advanced\nsection: Advanced\norder: 10");
    writeDoc("intro.mdx", "title: Intro\nsection: Getting Started\norder: 1");

    expect(getSidebarNav().map((s) => s.section)).toEqual([
      "Getting Started",
      "Advanced",
    ]);
  });

  it("falls back to the General section and order 99 when frontmatter omits them", () => {
    writeDoc("orphan.mdx", "title: Orphan");

    expect(getSidebarNav()).toEqual([
      {
        section: "General",
        links: [{ title: "Orphan", slug: "orphan", order: 99 }],
      },
    ]);
  });

  it("falls back to the slug when a doc has no title", () => {
    writeDoc("api-reference/webhooks.mdx", "section: API\norder: 1");

    expect(getSidebarNav()[0].links[0].title).toBe("api-reference/webhooks");
  });
});

describe("getStaticMdxContent", () => {
  it("reads a path relative to the project root", () => {
    const target = norm(path.join(process.cwd(), "src/content/privacy.mdx"));
    vfs.files.set(target, "# Privacy");

    expect(getStaticMdxContent("src/content/privacy.mdx")).toBe("# Privacy");
  });

  it("propagates the read error for a missing file rather than returning empty", () => {
    expect(() => getStaticMdxContent("src/content/nope.mdx")).toThrow(/ENOENT/);
  });
});

describe("extractHeadings", () => {
  it("collects h2 and h3 headings with slugified ids", () => {
    const headings = extractHeadings(
      "# Title\n\n## Getting Started\n\ntext\n\n### Install the SDK\n",
    );

    expect(headings).toEqual([
      { level: 2, text: "Getting Started", id: "getting-started" },
      { level: 3, text: "Install the SDK", id: "install-the-sdk" },
    ]);
  });

  it("ignores h1 and h4+ headings", () => {
    const headings = extractHeadings("# One\n#### Four\n##### Five\n## Two\n");

    expect(headings.map((h) => h.text)).toEqual(["Two"]);
  });

  it("strips punctuation and collapses whitespace when building the id", () => {
    const headings = extractHeadings("## What's new in v2.0 (beta)?\n");

    expect(headings[0].id).toBe("whats-new-in-v20-beta");
  });

  it("returns an empty list for content with no headings", () => {
    expect(extractHeadings("Just a paragraph.\n")).toEqual([]);
  });

  it("does not treat a hash inside a fenced code block line as a heading anchor", () => {
    const headings = extractHeadings("## Real\n\ntext ## not-a-heading\n");

    expect(headings.map((h) => h.text)).toEqual(["Real"]);
  });
});
