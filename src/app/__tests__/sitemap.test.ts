import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/data/docs-index.json", () => ({
  default: [
    { link: "/docs/getting-started#intro" },
    { link: "/docs/sdk/quick-start" },
  ],
}));

import sitemap from "../sitemap";

describe("sitemap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("excludes /changelog when there are zero GitHub releases", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => [],
      })),
    );

    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toContain("https://offer-hub.tech");
    expect(urls).toContain("https://offer-hub.tech/docs");
    expect(urls).toContain("https://offer-hub.tech/docs/getting-started");
    expect(urls).not.toContain("https://offer-hub.tech/changelog");
  });

  it("excludes /changelog when the GitHub releases API fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        json: async () => ({}),
      })),
    );

    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).not.toContain("https://offer-hub.tech/changelog");
  });

  it("includes /changelog when at least one GitHub release exists", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => [{ tag_name: "v1.0.0" }],
      })),
    );

    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toContain("https://offer-hub.tech/changelog");
  });
});
