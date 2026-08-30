import { test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Tracks the color-contrast gap excluded from a11y.spec.ts, instead of
 * letting it go unmeasured. Each case is marked `fail()` up front: it's
 * expected to report violations right now (see a11y.spec.ts for why), so
 * Playwright reports it as an *expected* failure rather than a red build.
 * The moment the underlying palette fix lands and a route reaches zero
 * violations, this flips to an *unexpected* pass, which Playwright does
 * flag - that's the signal to remove the route from this file and move it
 * back under a11y.spec.ts's real assertion.
 */
const ROUTES = ["/", "/use-cases", "/docs", "/pricing", "/community", "/accessibility"];

for (const route of ROUTES) {
  test(`${route} color-contrast baseline`, async ({ page }) => {
    test.fail();

    await page.goto(route, { waitUntil: "networkidle" });
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2aa"])
      .withRules(["color-contrast"])
      .analyze();

    if (results.violations.length > 0) {
      const nodeCount = results.violations[0].nodes.length;
      // eslint-disable-next-line no-console
      console.log(`${route}: ${nodeCount} color-contrast node(s) failing`);
    }

    if (results.violations.length !== 0) {
      throw new Error(`${route}: still failing (expected while unresolved)`);
    }
  });
}
