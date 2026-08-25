/**
 * Shared invariants for the mobile/responsive regression harness.
 *
 * The suite asserts two properties on every public marketing route:
 *   1. The document does not grow a horizontal scrollbar
 *      (`scrollWidth <= clientWidth + OVERFLOW_TOLERANCE_PX`).
 *   2. Every visible, pointer-interactive control meets WCAG 2.2
 *      Success Criterion 2.5.8 Target Size (Minimum): 24×24 CSS pixels.
 */

import { expect, type Page } from "@playwright/test";

export const ROUTES = [
  "/",
  "/use-cases",
  "/community",
  "/pricing",
  "/docs",
] as const;

export const VIEWPORT_WIDTHS = [320, 375, 412, 768] as const;

export const VIEWPORT_HEIGHT = 800;

/** WCAG 2.2 SC 2.5.8 minimum target size, in CSS pixels. */
export const MIN_TARGET_PX = 24;

/**
 * Sub-pixel rounding on some engines reports `scrollWidth` 1px larger than
 * `clientWidth` even when nothing visually overflows. One CSS pixel of slack
 * is the agreed invariant for this harness.
 */
export const OVERFLOW_TOLERANCE_PX = 1;

/**
 * Controls whose bounding box is smaller than this are treated as not laid
 * out (sr-only, collapsed, or display:none leftovers) rather than as failing
 * targets. Visible 16×16 icon buttons are still reported as violations.
 */
export const LAID_OUT_MIN_PX = 2;

export const INTERACTIVE_SELECTOR = "a, button, [role=button], input, select";

export type RoutePath = (typeof ROUTES)[number];
export type ViewportWidth = (typeof VIEWPORT_WIDTHS)[number];

export interface OverflowSnapshot {
  readonly scrollWidth: number;
  readonly clientWidth: number;
  readonly overflowPx: number;
}

export interface UndersizedControl {
  readonly tagName: string;
  readonly role: string | null;
  readonly href: string | null;
  readonly name: string;
  readonly width: number;
  readonly height: number;
  readonly x: number;
  readonly y: number;
}

export interface ViewportCase {
  readonly route: RoutePath;
  readonly width: ViewportWidth;
}

export function allViewportCases(): readonly ViewportCase[] {
  const cases: ViewportCase[] = [];
  for (const route of ROUTES) {
    for (const width of VIEWPORT_WIDTHS) {
      cases.push({ route, width });
    }
  }
  return cases;
}

export function describeCase(viewportCase: ViewportCase): string {
  return `${viewportCase.route} @ ${viewportCase.width}px`;
}

function roundCssPx(value: number): number {
  return Math.round(value * 100) / 100;
}

export async function waitForDocumentFonts(page: Page): Promise<void> {
  await page.evaluate(async () => {
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
  });
}

export async function preparePage(
  page: Page,
  route: RoutePath,
  width: ViewportWidth,
): Promise<void> {
  await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
  await page.goto(route, { waitUntil: "domcontentloaded" });
  await waitForDocumentFonts(page);
  await expect(page.locator("body")).toBeVisible();
}

export async function measureOverflow(page: Page): Promise<OverflowSnapshot> {
  return page.evaluate(() => {
    const root = document.documentElement;
    const scrollWidth = root.scrollWidth;
    const clientWidth = root.clientWidth;
    return {
      scrollWidth,
      clientWidth,
      overflowPx: Math.max(0, scrollWidth - clientWidth),
    };
  });
}

export async function findUndersizedControls(
  page: Page,
  minSize: number = MIN_TARGET_PX,
): Promise<UndersizedControl[]> {
  return page.evaluate(
    ({ selector, minSize: minimum, laidOutMin }: { selector: string; minSize: number; laidOutMin: number }) => {
      const round = (value: number): number => Math.round(value * 100) / 100;

      const isExcluded = (element: HTMLElement, style: CSSStyleDeclaration): boolean => {
        if (element.hasAttribute("hidden")) return true;
        if (element.getAttribute("aria-hidden") === "true") return true;
        if (element.classList.contains("sr-only")) return true;
        if (style.display === "none" || style.visibility === "hidden") return true;
        if (style.pointerEvents === "none") return true;
        if (Number.parseFloat(style.opacity) === 0) return true;
        return false;
      };

      const accessibleName = (element: HTMLElement): string => {
        const labelledBy = element.getAttribute("aria-labelledby");
        if (labelledBy) {
          const parts = labelledBy
            .split(/\s+/)
            .map((id) => document.getElementById(id)?.textContent ?? "")
            .join(" ");
          if (parts.trim()) return parts;
        }

        return (
          element.getAttribute("aria-label") ??
          element.getAttribute("title") ??
          element.getAttribute("placeholder") ??
          element.textContent ??
          ""
        );
      };

      const nodes = Array.from(document.querySelectorAll(selector));
      const undersized: UndersizedControl[] = [];

      for (const node of nodes) {
        if (!(node instanceof HTMLElement)) continue;

        const style = window.getComputedStyle(node);
        if (isExcluded(node, style)) continue;

        const rect = node.getBoundingClientRect();
        if (rect.width < laidOutMin || rect.height < laidOutMin) continue;

        if (rect.width < minimum || rect.height < minimum) {
          undersized.push({
            tagName: node.tagName.toLowerCase(),
            role: node.getAttribute("role"),
            href: node.getAttribute("href"),
            name: accessibleName(node).replace(/\s+/g, " ").trim().slice(0, 80),
            width: round(rect.width),
            height: round(rect.height),
            x: round(rect.x),
            y: round(rect.y),
          });
        }
      }

      return undersized;
    },
    {
      selector: INTERACTIVE_SELECTOR,
      minSize,
      laidOutMin: LAID_OUT_MIN_PX,
    },
  );
}

export function formatOverflowFailure(
  label: string,
  snapshot: OverflowSnapshot,
): string {
  return [
    `Horizontal overflow on ${label}`,
    `scrollWidth=${snapshot.scrollWidth}`,
    `clientWidth=${snapshot.clientWidth}`,
    `overflowPx=${snapshot.overflowPx}`,
  ].join(" | ");
}

export function formatUndersizedFailure(
  label: string,
  controls: readonly UndersizedControl[],
): string {
  if (controls.length === 0) {
    return `${label}: no undersized controls`;
  }

  const rows = controls.map((control) => {
    const href = control.href ? ` href=${control.href}` : "";
    const role = control.role ? ` role=${control.role}` : "";
    return `<${control.tagName}${role}${href}> "${control.name}" ${control.width}x${control.height} at (${control.x},${control.y})`;
  });

  return `${label}: ${controls.length} interactive control(s) below ${MIN_TARGET_PX}x${MIN_TARGET_PX} CSS px\n${rows.join("\n")}`;
}

export async function assertNoHorizontalOverflow(
  page: Page,
  label: string,
): Promise<OverflowSnapshot> {
  const snapshot = await measureOverflow(page);
  expect(
    snapshot.scrollWidth,
    formatOverflowFailure(label, snapshot),
  ).toBeLessThanOrEqual(snapshot.clientWidth + OVERFLOW_TOLERANCE_PX);
  return snapshot;
}

export async function assertMinTouchTargets(
  page: Page,
  label: string,
): Promise<readonly UndersizedControl[]> {
  const undersized = await findUndersizedControls(page);
  expect(undersized, formatUndersizedFailure(label, undersized)).toEqual([]);
  return undersized;
}

export { roundCssPx };
