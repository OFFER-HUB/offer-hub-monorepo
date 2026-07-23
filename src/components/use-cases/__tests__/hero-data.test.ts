import { describe, it, expect } from "vitest";
import type { UseCaseHeroProps } from "../shared/UseCaseHero";

import { heroData as freelance } from "../freelance/data";
import { heroData as ecommerce } from "../ecommerce/data";
import { heroData as daoPayroll } from "../dao-payroll/data";
import { heroData as realEstate } from "../real-estate/data";
import { heroData as servicePlatforms } from "../service-platforms/data";

/**
 * Structural guardrails for every use case's `heroData`. These lock the shape
 * and internal consistency of the per-use-case content that feeds the shared
 * `UseCaseHero`, catching the highest-risk regressions after the refactor:
 * dangling node/link references, missing fields, or malformed gradient ids.
 */
const CASES: Array<[string, UseCaseHeroProps]> = [
  ["freelance", freelance],
  ["ecommerce", ecommerce],
  ["dao-payroll", daoPayroll],
  ["real-estate", realEstate],
  ["service-platforms", servicePlatforms],
];

describe.each(CASES)("heroData: %s", (slug, data) => {
  it("has the required non-empty copy", () => {
    expect(data.headline.length).toBeGreaterThan(0);
    expect(data.subheadline.length).toBeGreaterThan(0);
    expect(data.footerLabel.length).toBeGreaterThan(0);
    expect(data.badgeLabel).toMatch(/^CASE STUDY:/);
    // lucide icons are forwardRef components (objects), not plain functions.
    expect(data.footerIcon).toBeTruthy();
    expect(["function", "object"]).toContain(typeof data.footerIcon);
  });

  it("uses the slug-scoped gradient id", () => {
    expect(data.gradientId).toBe(`${slug}-network-line`);
  });

  it("links to the use-cases doc over https", () => {
    expect(data.docsUrl).toMatch(
      /^https:\/\/.*\/docs\/business\/use-cases\.md/,
    );
  });

  it("exposes exactly three At-a-glance stats", () => {
    expect(data.stats).toHaveLength(3);
    for (const stat of data.stats) {
      expect(stat.label.length).toBeGreaterThan(0);
      expect(stat.value.length).toBeGreaterThan(0);
      expect(stat.accent.length).toBeGreaterThan(0);
    }
  });

  it("wires every link to an existing node (no dangling references)", () => {
    const ids = new Set(data.nodes.map((n) => n.id));
    expect(ids.size).toBe(data.nodes.length); // node ids are unique

    for (const [from, to] of data.links) {
      expect(ids.has(from)).toBe(true);
      expect(ids.has(to)).toBe(true);
    }
  });
});
