/**
 * The token tables in docs/design/color-palette.md and
 * content/docs/guide/style-guide.mdx are generated from the code by
 * `scripts/generate-token-docs.ts` (npm run docs:tokens). These tests fail
 * when the committed tables drift from a fresh generation, so the docs can
 * never silently go stale again (issue #1741).
 */
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  generateColorPaletteBlock,
  generateStyleGuideBlock,
  readTokenValues,
} from "../generate-token-docs";

const ROOT = path.resolve(__dirname, "../..");

function betweenMarkers(content: string, begin: string, end: string): string {
  const start = content.indexOf(begin);
  const stop = content.indexOf(end);
  expect(start).toBeGreaterThanOrEqual(0);
  expect(stop).toBeGreaterThan(start);
  return content.slice(start + begin.length, stop).trim();
}

describe("generate-token-docs", () => {
  it("is deterministic: generating twice produces identical output", () => {
    const first = readTokenValues();
    const second = readTokenValues();
    expect(generateColorPaletteBlock(second)).toBe(generateColorPaletteBlock(first));
    expect(generateStyleGuideBlock(second)).toBe(generateStyleGuideBlock(first));
  });

  it("docs/design/color-palette.md token tables match the code", () => {
    const values = readTokenValues();
    const content = fs.readFileSync(
      path.join(ROOT, "docs/design/color-palette.md"),
      "utf8",
    );
    expect(
      betweenMarkers(
        content,
        "<!-- BEGIN GENERATED TOKEN TABLES -->",
        "<!-- END GENERATED TOKEN TABLES -->",
      ),
    ).toBe(generateColorPaletteBlock(values));
  });

  it("content/docs/guide/style-guide.mdx token tables match the code", () => {
    const values = readTokenValues();
    const content = fs.readFileSync(
      path.join(ROOT, "content/docs/guide/style-guide.mdx"),
      "utf8",
    );
    expect(
      betweenMarkers(
        content,
        "{/* BEGIN GENERATED TOKEN TABLES */}",
        "{/* END GENERATED TOKEN TABLES */}",
      ),
    ).toBe(generateStyleGuideBlock(values));
  });
});
