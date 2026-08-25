import { expect, test } from "@playwright/test";

import {
  MIN_TARGET_PX,
  OVERFLOW_TOLERANCE_PX,
  ROUTES,
  VIEWPORT_WIDTHS,
  allViewportCases,
  assertMinTouchTargets,
  assertNoHorizontalOverflow,
  describeCase,
  findUndersizedControls,
  measureOverflow,
  preparePage,
} from "./helpers/responsive-invariants";

/**
 * Viewport regression harness.
 *
 * Matrix: 5 public routes × 4 mobile/tablet widths = 20 cases.
 * Each case asserts:
 *   a) document.documentElement.scrollWidth <= clientWidth + 1
 *   b) zero visible interactive controls smaller than 24×24 CSS px
 *      (WCAG 2.2 SC 2.5.8 Target Size Minimum)
 *
 * Skip-link / sr-only / display:none / opacity:0 / pointer-events:none
 * controls are excluded so visually hidden chrome does not false-fail.
 */
test.describe("Responsive regression harness", () => {
  test.describe("catalog", () => {
    test("covers the five public routes required by the issue", () => {
      expect(ROUTES).toEqual(["/", "/use-cases", "/community", "/pricing", "/docs"]);
    });

    test("covers the four required viewport widths", () => {
      expect(VIEWPORT_WIDTHS).toEqual([320, 375, 412, 768]);
    });

    test("expands into a 5×4 case matrix", () => {
      const cases = allViewportCases();
      expect(cases).toHaveLength(ROUTES.length * VIEWPORT_WIDTHS.length);
      expect(cases[0]).toEqual({ route: "/", width: 320 });
      expect(cases[cases.length - 1]).toEqual({ route: "/docs", width: 768 });
    });

    test("encodes WCAG 2.2 SC 2.5.8 as a 24px floor with 1px overflow slack", () => {
      expect(MIN_TARGET_PX).toBe(24);
      expect(OVERFLOW_TOLERANCE_PX).toBe(1);
    });
  });

  test.describe("invariants per route × viewport", () => {
    for (const viewportCase of allViewportCases()) {
      const label = describeCase(viewportCase);

      test(`${label} — document does not overflow horizontally`, async ({ page }) => {
        await preparePage(page, viewportCase.route, viewportCase.width);
        const snapshot = await assertNoHorizontalOverflow(page, label);
        expect(snapshot.clientWidth).toBe(viewportCase.width);
        expect(snapshot.overflowPx).toBeLessThanOrEqual(OVERFLOW_TOLERANCE_PX);
      });

      test(`${label} — no interactive control is smaller than 24×24 CSS px`, async ({
        page,
      }) => {
        await preparePage(page, viewportCase.route, viewportCase.width);
        await assertMinTouchTargets(page, label);
      });
    }
  });

  test.describe("invariant helpers are strict about failures", () => {
    test("overflow snapshot reports a non-negative overflowPx", async ({ page }) => {
      await preparePage(page, "/", 375);
      const snapshot = await measureOverflow(page);
      expect(snapshot.overflowPx).toBeGreaterThanOrEqual(0);
      expect(snapshot.scrollWidth).toBeGreaterThan(0);
      expect(snapshot.clientWidth).toBe(375);
    });

    test("undersized-control scanner returns a typed array (never null)", async ({
      page,
    }) => {
      await preparePage(page, "/docs", 320);
      const undersized = await findUndersizedControls(page);
      expect(Array.isArray(undersized)).toBe(true);
      for (const control of undersized) {
        expect(control.tagName.length).toBeGreaterThan(0);
        expect(control.width).toBeGreaterThan(0);
        expect(control.height).toBeGreaterThan(0);
        expect(control.width < MIN_TARGET_PX || control.height < MIN_TARGET_PX).toBe(
          true,
        );
      }
    });
  });
});
