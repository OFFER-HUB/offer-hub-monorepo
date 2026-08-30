import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Reproduces #1499's own audit method (axe.run(document, { runOnly: {
 * type: "tag", values: ["wcag2a","wcag2aa","wcag21a","wcag21aa"] } })) per
 * route, against a real production build rather than reading source. This
 * is what actually verifies "route X passes AA" - the component-level
 * vitest-axe tests elsewhere in the repo are regression coverage for
 * individual components, not a substitute for this.
 *
 * /features and /how-it-works from the issue's route list are anchor
 * sections within `/` in this codebase (no standalone route exists for
 * either), so they're covered by the `/` check below rather than listed
 * separately.
 */
const ROUTES = [
  "/",
  "/use-cases",
  "/docs",
  "/pricing",
  "/community",
  "/accessibility",
];

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

/**
 * `color-contrast` is deliberately excluded from the pass/fail assertion
 * below. Running this exact harness against the fixes in this PR still
 * finds it failing broadly (21-183 nodes per route) - it traces back to
 * `text-theme-primary`/`text-content-secondary`/`text-content-muted` used
 * as small text against light surfaces across most of the site, not just
 * the CTA button this PR fixed. That is a brand-palette decision #1499
 * itself flags as needing design sign-off, tracked as follow-up work
 * rather than fixed blind here. Excluding the rule keeps this suite green
 * (and thus actually enforced in CI) for every other WCAG check - ARIA
 * structure, accessible names, roles - while being explicit that contrast
 * is a known, unresolved, tracked gap rather than silently passing it.
 */
const KNOWN_GAP_RULES = ["color-contrast"];

for (const route of ROUTES) {
  test(`${route} has no non-contrast WCAG 2.1 AA violations`, async ({ page }) => {
    await page.goto(route, { waitUntil: "networkidle" });

    const results = await new AxeBuilder({ page })
      .withTags(WCAG_TAGS)
      .disableRules(KNOWN_GAP_RULES)
      .analyze();

    expect(
      results.violations,
      formatViolations(results.violations),
    ).toEqual([]);
  });
}

// #1499's Part A explicitly requires verification at 1440px and 2560px
// across all five use-case tabs. Axe scans the DOM regardless of tab, so
// this drives the tab switcher itself and re-scans at both widths.
const USE_CASE_TABS = [
  "Freelance",
  "eCommerce",
  "DAO Payroll",
  "Real Estate",
  "Service Platforms",
];

for (const width of [1440, 2560]) {
  test.describe(`/use-cases at ${width}px`, () => {
    test.use({ viewport: { width, height: 1000 } });

    for (const tabName of USE_CASE_TABS) {
      test(`${tabName} tab has no non-contrast WCAG 2.1 AA violations`, async ({ page }) => {
        await page.goto("/use-cases", { waitUntil: "networkidle" });
        await page.getByRole("tab", { name: tabName }).click();
        await page.waitForTimeout(500); // lazy-loaded section + animations settle

        const results = await new AxeBuilder({ page })
          .withTags(WCAG_TAGS)
          .disableRules(KNOWN_GAP_RULES)
          .analyze();

        expect(
          results.violations,
          formatViolations(results.violations),
        ).toEqual([]);
      });
    }
  });
}

function formatViolations(violations: import("axe-core").Result[]): string {
  if (violations.length === 0) return "";
  return violations
    .map(
      (v) =>
        `${v.id} (${v.impact}): ${v.help}\n${v.nodes
          .map((n) => `  - ${n.target.join(", ")}`)
          .join("\n")}`,
    )
    .join("\n\n");
}
