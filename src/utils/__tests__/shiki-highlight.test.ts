import { describe, it, expect, beforeEach } from "vitest";
import { highlightCache, escapeHtml } from "../shiki-highlight";

describe("escapeHtml", () => {
  it("escapes the five reserved HTML characters", () => {
    expect(escapeHtml(`<a href="x">O'Brien & Co</a>`)).toBe(
      "&lt;a href=&quot;x&quot;&gt;O&#039;Brien &amp; Co&lt;/a&gt;",
    );
  });

  it("leaves plain text untouched", () => {
    expect(escapeHtml("const x = 1;")).toBe("const x = 1;");
  });
});

describe("highlightCache", () => {
  beforeEach(() => {
    highlightCache.clear();
  });

  it("is a shared Map that persists entries across callers", () => {
    highlightCache.set("github-dark:ts:const x = 1;", "<pre>...</pre>");

    expect(highlightCache.get("github-dark:ts:const x = 1;")).toBe("<pre>...</pre>");
    expect(highlightCache.size).toBe(1);
  });
});
