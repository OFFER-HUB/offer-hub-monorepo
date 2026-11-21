// @vitest-environment node
import { describe, it, expect } from "vitest";
import {
  findOpacityTokenErrors,
  OPACITY_TOKEN_RE,
} from "../check-undefined-utility-classes";

describe("findOpacityTokenErrors", () => {
  it("flags every opacity-suffixed theme token utility and suggests the color-mix replacement", () => {
    const line =
      '<div className="bg-theme-primary/10 border-theme-border/40 text-content-secondary/70 ring-theme-primary/50">';
    const errors = findOpacityTokenErrors(line, "src/app/sample.tsx", 42);

    expect(errors).toHaveLength(4);
    expect(errors[0]).toContain('src/app/sample.tsx:42');
    expect(errors[0]).toContain('"bg-theme-primary/10"');
    expect(errors[0]).toContain("bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]");
    expect(errors[1]).toContain('"border-theme-border/40"');
    expect(errors[1]).toContain("border-[color-mix(in_srgb,var(--color-border)_40%,transparent)]");
    expect(errors[2]).toContain('"text-content-secondary/70"');
    expect(errors[2]).toContain(
      "text-[color-mix(in_srgb,var(--color-text-secondary)_70%,transparent)]",
    );
    expect(errors[3]).toContain('"ring-theme-primary/50"');
    expect(errors[3]).toContain("ring-[color-mix(in_srgb,var(--color-primary)_50%,transparent)]");
  });

  it("detects gradient, divide, outline, fill and stroke utilities too", () => {
    const line =
      'from-theme-primary/10 to-theme-primary/5 divide-theme-border/20 outline-theme-primary/30 fill-theme-primary/20 stroke-theme-primary/40';
    const errors = findOpacityTokenErrors(line, "src/x.tsx", 1);

    expect(errors).toHaveLength(6);
    expect(errors.some((e) => e.includes("from-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]"))).toBe(true);
    expect(errors.some((e) => e.includes("to-[color-mix(in_srgb,var(--color-primary)_5%,transparent)]"))).toBe(true);
    expect(errors.some((e) => e.includes("divide-[color-mix(in_srgb,var(--color-border)_20%,transparent)]"))).toBe(true);
    expect(errors.some((e) => e.includes("outline-[color-mix(in_srgb,var(--color-primary)_30%,transparent)]"))).toBe(true);
    expect(errors.some((e) => e.includes("fill-[color-mix(in_srgb,var(--color-primary)_20%,transparent)]"))).toBe(true);
    expect(errors.some((e) => e.includes("stroke-[color-mix(in_srgb,var(--color-primary)_40%,transparent)]"))).toBe(true);
  });

  it("preserves Tailwind variant prefixes (hover:, md:, focus:, dark:) in the suggestion", () => {
    const line = 'hover:bg-theme-primary/10 focus:ring-theme-primary/50 md:text-content-muted/40';
    const errors = findOpacityTokenErrors(line, "src/x.tsx", 9);

    expect(errors).toHaveLength(3);
    // The matched span excludes the variant, so the suggestion replaces only
    // the utility portion — the variant prefix stays in the className string.
    expect(errors[0]).toContain('"bg-theme-primary/10"');
    expect(errors[1]).toContain('"ring-theme-primary/50"');
    expect(errors[2]).toContain('"text-content-muted/40"');
  });

  it("does not flag the color-mix replacement itself", () => {
    const line =
      '<div className="bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] border-[color-mix(in_srgb,var(--color-border)_40%,transparent)]">';
    const errors = findOpacityTokenErrors(line, "src/x.tsx", 1);
    expect(errors).toHaveLength(0);
  });

  it("does not flag non-token palette colors or token classes without an opacity suffix", () => {
    const line =
      '<div className="bg-theme-primary text-content-secondary border-theme-border bg-blue-500/10 hover:bg-theme-primary">';
    const errors = findOpacityTokenErrors(line, "src/x.tsx", 1);
    expect(errors).toHaveLength(0);
  });

  it("maps every theme token to the correct CSS variable", () => {
    const cases: Array<[string, string]> = [
      ["bg-theme-primary/10", "var(--color-primary)"],
      ["bg-theme-primary-hover/10", "var(--color-primary-hover)"],
      ["bg-theme-secondary/10", "var(--color-secondary)"],
      ["bg-theme-accent/10", "var(--color-accent)"],
      ["bg-bg-base/50", "var(--color-bg-base)"],
      ["bg-bg-elevated/80", "var(--color-bg-elevated)"],
      ["bg-bg-sunken/60", "var(--color-bg-sunken)"],
      ["text-content-primary/80", "var(--color-text-primary)"],
      ["text-content-muted/40", "var(--color-text-muted)"],
      ["bg-theme-success/10", "var(--color-success)"],
      ["bg-theme-warning/10", "var(--color-warning)"],
      ["bg-theme-error/10", "var(--color-error)"],
    ];
    for (const [cls, cssVar] of cases) {
      const errors = findOpacityTokenErrors(`<div className="${cls}">`, "f.tsx", 1);
      expect(errors, `expected an error for ${cls}`).toHaveLength(1);
      expect(errors[0]).toContain(cssVar);
    }
  });

  it("OPACITY_TOKEN_RE is a consistent global regex", () => {
    expect(OPACITY_TOKEN_RE.global).toBe(true);
    expect(OPACITY_TOKEN_RE.test("bg-theme-primary/10")).toBe(true);
  });
});
