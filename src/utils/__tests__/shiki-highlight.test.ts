import { describe, it, expect, beforeEach } from "vitest";
import { highlightCache, escapeHtml, parseLineHighlightRange } from "../shiki-highlight";

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

describe("parseLineHighlightRange", () => {
  it("returns an empty set when input is empty or undefined", () => {
    expect(parseLineHighlightRange()).toEqual(new Set());
    expect(parseLineHighlightRange("")).toEqual(new Set());
    expect(parseLineHighlightRange("{}")).toEqual(new Set());
  });

  it("parses single numbers with and without braces", () => {
    expect(parseLineHighlightRange("3")).toEqual(new Set([3]));
    expect(parseLineHighlightRange("{5}")).toEqual(new Set([5]));
  });

  it("parses comma-separated lists and ranges like {1,3-5}", () => {
    expect(parseLineHighlightRange("{1,3-5}")).toEqual(new Set([1, 3, 4, 5]));
    expect(parseLineHighlightRange("1, 3-5, 8")).toEqual(new Set([1, 3, 4, 5, 8]));
  });

  it("handles whitespace and ignores invalid parts gracefully", () => {
    expect(parseLineHighlightRange("{ 2,  4-6 , invalid, -3, 8 }")).toEqual(
      new Set([2, 4, 5, 6, 8]),
    );
  });
});

