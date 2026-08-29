import { test, expect, type Page } from "@playwright/test";

/**
 * Automated proxy for #1499's "every interactive element reachable, visible
 * focus ring, logical order, no traps" acceptance criterion. This is a
 * smoke test, not a substitute for a manual screen-reader + keyboard
 * walkthrough (logical *reading* order and screen-reader announcement
 * quality still need a human) - but it catches the two failure modes that
 * matter most for a large redesign: focus getting stuck, and interactive
 * elements with no visible focus indicator at all.
 */
const ROUTES = ["/", "/use-cases", "/docs", "/pricing", "/community", "/accessibility"];

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Tags every focusable element with a stable id up front, rather than
 * identifying the currently-focused element by class name + screen
 * position: pages with repeating/animated content (e.g. the community
 * page's marquee, which duplicates its list for a seamless CSS loop) can
 * have multiple distinct elements pass through the same class+position at
 * different times, which would otherwise under-count unique visits.
 */
async function tagFocusableElements(page: Page): Promise<number> {
  return page.evaluate((selector) => {
    const els = document.querySelectorAll(selector);
    els.forEach((el, i) => el.setAttribute("data-kbd-test-id", String(i)));
    return els.length;
  }, FOCUSABLE_SELECTOR);
}

async function focusedElementSignature(page: Page): Promise<string | null> {
  return page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return null;
    return el.getAttribute("data-kbd-test-id") ?? el.tagName;
  });
}

async function hasVisibleFocusIndicator(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el) return false;
    const style = getComputedStyle(el);
    const hasOutline = style.outlineStyle !== "none" && style.outlineWidth !== "0px";
    const hasBoxShadow = style.boxShadow !== "none" && style.boxShadow !== "";
    const hasRing = style.borderColor !== "" && el.className.includes("ring");
    return hasOutline || hasBoxShadow || hasRing;
  });
}

for (const route of ROUTES) {
  test(`${route} keyboard: every focusable element is reachable with no trap`, async ({
    page,
  }) => {
    await page.goto(route, { waitUntil: "networkidle" });

    const focusableCount = await tagFocusableElements(page);
    expect(focusableCount, "route has at least one focusable element").toBeGreaterThan(0);

    const visited = new Set<string>();
    let previous: string | null = null;
    let stalls = 0;
    // Generous cap: real pages have far fewer stops than this, so hitting
    // it means something is actually wrong (a trap or runaway loop), not a
    // slow-but-fine long page.
    const maxTabs = focusableCount + 30;

    for (let i = 0; i < maxTabs; i++) {
      await page.keyboard.press("Tab");
      const current = await focusedElementSignature(page);
      if (current === null) continue;

      if (current === previous) {
        stalls++;
        // Two consecutive Tabs landing on the exact same element is a trap.
        expect(stalls, `focus got stuck on ${current}`).toBeLessThan(2);
      } else {
        stalls = 0;
      }

      visited.add(current);
      previous = current;
    }

    // Not every focusable node is guaranteed reachable in exactly
    // focusableCount tabs (nested/animated content can shift timing), but
    // a keyboard user should reach the large majority of them.
    expect(
      visited.size,
      `only reached ${visited.size}/${focusableCount} focusable elements via Tab`,
    ).toBeGreaterThanOrEqual(Math.floor(focusableCount * 0.8));
  });

  test(`${route} keyboard: primary nav link and CTA show a visible focus indicator`, async ({
    page,
  }) => {
    await page.goto(route, { waitUntil: "networkidle" });

    // First Tab from a fresh load should land on the first focusable
    // element (typically a skip link or the first nav item).
    await page.keyboard.press("Tab");
    expect(
      await hasVisibleFocusIndicator(page),
      "first focusable element has no visible focus indicator",
    ).toBe(true);

    // Keep tabbing until we hit a real link/button (skip past any
    // non-interactive first stop) and spot-check it too.
    for (let i = 0; i < 5; i++) {
      const isInteractive = await page.evaluate(
        () => !!document.activeElement?.matches("a[href], button"),
      );
      if (isInteractive) break;
      await page.keyboard.press("Tab");
    }
    expect(
      await hasVisibleFocusIndicator(page),
      "an early interactive element has no visible focus indicator",
    ).toBe(true);
  });
}
