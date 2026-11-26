/**
 * Unit tests for the opacity-suffixed theme token class guard in
 * scripts/check-undefined-utility-classes.js
 *
 * Guards against classes like `bg-theme-primary/10` that Tailwind 3 cannot
 * emit CSS for when the color is a CSS variable. The fix is to use
 * color-mix() arbitrary-value syntax instead.
 */

import { describe, it, expect } from "vitest";
import path from "node:path";

// The script uses CommonJS exports — `require` works fine in a vitest jsdom env.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  findOpacityTokenErrors,
  buildOpacityTokenPattern,
  TOKEN_CSS_VAR_MAP,
} = require("../check-undefined-utility-classes.js") as {
  findOpacityTokenErrors: (
    content: string,
    filePath: string
  ) => { line: number; col: number; fullMatch: string; suggestion: string; file: string }[];
  buildOpacityTokenPattern: () => RegExp;
  TOKEN_CSS_VAR_MAP: Record<string, string>;
};

// ─── Token map sanity ────────────────────────────────────────────────────────

describe("TOKEN_CSS_VAR_MAP", () => {
  it("maps every theme-* token to a --color-* variable", () => {
    expect(TOKEN_CSS_VAR_MAP["theme-primary"]).toBe("--color-primary");
    expect(TOKEN_CSS_VAR_MAP["theme-success"]).toBe("--color-success");
    expect(TOKEN_CSS_VAR_MAP["theme-warning"]).toBe("--color-warning");
    expect(TOKEN_CSS_VAR_MAP["theme-error"]).toBe("--color-error");
    expect(TOKEN_CSS_VAR_MAP["theme-border"]).toBe("--color-border");
  });

  it("maps bg-* surface tokens", () => {
    expect(TOKEN_CSS_VAR_MAP["bg-base"]).toBe("--color-bg-base");
    expect(TOKEN_CSS_VAR_MAP["bg-elevated"]).toBe("--color-bg-elevated");
    expect(TOKEN_CSS_VAR_MAP["bg-sunken"]).toBe("--color-bg-sunken");
  });

  it("maps content-* text tokens", () => {
    expect(TOKEN_CSS_VAR_MAP["content-primary"]).toBe("--color-text-primary");
    expect(TOKEN_CSS_VAR_MAP["content-secondary"]).toBe("--color-text-secondary");
    expect(TOKEN_CSS_VAR_MAP["content-muted"]).toBe("--color-text-muted");
  });
});

// ─── findOpacityTokenErrors ──────────────────────────────────────────────────

describe("findOpacityTokenErrors", () => {
  it("flags bg-theme-primary/10", () => {
    const errors = findOpacityTokenErrors(
      `<div className="bg-theme-primary/10 text-theme-primary" />`,
      "Example.tsx"
    );
    expect(errors).toHaveLength(1);
    expect(errors[0].fullMatch).toBe("bg-theme-primary/10");
    expect(errors[0].suggestion).toBe(
      "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]"
    );
  });

  it("flags border-theme-border/40", () => {
    const errors = findOpacityTokenErrors(
      `<div className="border border-theme-border/40" />`,
      "Example.tsx"
    );
    expect(errors).toHaveLength(1);
    expect(errors[0].fullMatch).toBe("border-theme-border/40");
    expect(errors[0].suggestion).toBe(
      "border-[color-mix(in_srgb,var(--color-border)_40%,transparent)]"
    );
  });

  it("flags text-content-secondary/70", () => {
    const errors = findOpacityTokenErrors(
      `className="text-content-secondary/70"`,
      "Example.tsx"
    );
    expect(errors).toHaveLength(1);
    expect(errors[0].fullMatch).toBe("text-content-secondary/70");
    expect(errors[0].suggestion).toBe(
      "text-[color-mix(in_srgb,var(--color-text-secondary)_70%,transparent)]"
    );
  });

  it("flags every supported prefix", () => {
    const prefixes = ["bg", "text", "border", "ring", "from", "to", "via", "divide", "outline", "fill", "stroke"];
    for (const prefix of prefixes) {
      const errors = findOpacityTokenErrors(
        `${prefix}-theme-primary/15`,
        "Test.tsx"
      );
      expect(errors).toHaveLength(1);
      expect(errors[0].fullMatch).toBe(`${prefix}-theme-primary/15`);
    }
  });

  it("preserves Tailwind variant prefixes in the suggestion", () => {
    const errors = findOpacityTokenErrors(
      `hover:bg-theme-primary/10`,
      "Example.tsx"
    );
    expect(errors).toHaveLength(1);
    expect(errors[0].fullMatch).toBe("hover:bg-theme-primary/10");
    expect(errors[0].suggestion).toBe(
      "hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]"
    );
  });

  it("preserves multi-segment variant prefixes (md:focus:)", () => {
    const errors = findOpacityTokenErrors(
      `md:focus:border-theme-border/20`,
      "Example.tsx"
    );
    expect(errors).toHaveLength(1);
    expect(errors[0].fullMatch).toBe("md:focus:border-theme-border/20");
    expect(errors[0].suggestion).toBe(
      "md:focus:border-[color-mix(in_srgb,var(--color-border)_20%,transparent)]"
    );
  });

  it("does NOT flag the color-mix replacement itself", () => {
    const errors = findOpacityTokenErrors(
      `bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]`,
      "Example.tsx"
    );
    expect(errors).toHaveLength(0);
  });

  it("does NOT flag non-token Tailwind palette colors (bg-red-500/10)", () => {
    const errors = findOpacityTokenErrors(
      `bg-red-500/10 text-blue-400/80 border-gray-200/50`,
      "Example.tsx"
    );
    expect(errors).toHaveLength(0);
  });

  it("does NOT flag plain token classes without an opacity modifier", () => {
    const errors = findOpacityTokenErrors(
      `bg-theme-primary text-theme-success border-theme-border`,
      "Example.tsx"
    );
    expect(errors).toHaveLength(0);
  });

  it("reports correct line and column numbers", () => {
    const content = [
      `<div className="text-content-primary" />`,
      `<span className="bg-theme-primary/10" />`,
    ].join("\n");
    const errors = findOpacityTokenErrors(content, "Example.tsx");
    expect(errors).toHaveLength(1);
    expect(errors[0].line).toBe(2);
  });

  it("flags multiple errors in the same file", () => {
    const content = `
      bg-theme-primary/10
      border-theme-border/20
      text-content-secondary/70
    `;
    const errors = findOpacityTokenErrors(content, "Example.tsx");
    expect(errors).toHaveLength(3);
  });

  it("maps bg-theme-success/10 to --color-success", () => {
    const errors = findOpacityTokenErrors(`bg-theme-success/10`, "Test.tsx");
    expect(errors[0].suggestion).toBe(
      "bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)]"
    );
  });

  it("maps bg-theme-warning/12 to --color-warning", () => {
    const errors = findOpacityTokenErrors(`bg-theme-warning/12`, "Test.tsx");
    expect(errors[0].suggestion).toBe(
      "bg-[color-mix(in_srgb,var(--color-warning)_12%,transparent)]"
    );
  });

  it("maps bg-content-muted/12 to --color-text-muted", () => {
    const errors = findOpacityTokenErrors(`bg-content-muted/12`, "Test.tsx");
    expect(errors[0].suggestion).toBe(
      "bg-[color-mix(in_srgb,var(--color-text-muted)_12%,transparent)]"
    );
  });

  it("includes the file path in the error object", () => {
    const errors = findOpacityTokenErrors(`bg-theme-error/10`, "src/Foo.tsx");
    expect(errors[0].file).toBe("src/Foo.tsx");
  });
});
