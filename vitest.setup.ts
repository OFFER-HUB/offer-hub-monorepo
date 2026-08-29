import "@testing-library/jest-dom/vitest";
import { expect } from "vitest";
import { toHaveNoViolations } from "vitest-axe/dist/matchers";

expect.extend({ toHaveNoViolations });

/**
 * Browser APIs jsdom does not implement, installed once for every suite.
 *
 * These are assigned directly rather than through `vi.stubGlobal` on purpose:
 * a suite that stubs one of them itself (and then calls
 * `vi.unstubAllGlobals()`) should fall back to the stub below, not to
 * `undefined`.
 *
 * The API-route suites run under the `node` environment, where none of this
 * exists and none of it is needed.
 */
const isBrowserEnv = typeof window !== "undefined";

/**
 * Inert observers: they record the callback so a test can drive it manually,
 * and do nothing on their own.
 */
class MockIntersectionObserver {
  readonly root: Element | Document | null;
  readonly rootMargin: string;
  readonly thresholds: ReadonlyArray<number>;

  constructor(
    public callback: IntersectionObserverCallback,
    public options?: IntersectionObserverInit,
  ) {
    this.root = (options?.root as Element | null) ?? null;
    this.rootMargin = options?.rootMargin ?? "";
    this.thresholds = Array.isArray(options?.threshold)
      ? options.threshold
      : [options?.threshold ?? 0];
  }

  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

class MockResizeObserver {
  constructor(public callback: ResizeObserverCallback) {}
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (isBrowserEnv) {
  globalThis.IntersectionObserver =
    MockIntersectionObserver as unknown as typeof IntersectionObserver;
  globalThis.ResizeObserver =
    MockResizeObserver as unknown as typeof ResizeObserver;

  // jsdom has no matchMedia. Components read `.matches` and subscribe to
  // "change", so the default has to be a usable object; suites that care
  // about a specific query install their own.
  if (!window.matchMedia) {
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;
  }

  // jsdom ships no FontFaceSet. Footer awaits `document.fonts.ready` before
  // measuring its wordmark, so without this every page rendering the footer
  // throws on mount.
  if (!("fonts" in document)) {
    Object.defineProperty(document, "fonts", {
      configurable: true,
      value: {
        ready: Promise.resolve(),
        addEventListener: () => {},
        removeEventListener: () => {},
        check: () => true,
        load: async () => [],
      },
    });
  }

  // jsdom throws "not implemented" on these rather than no-op'ing.
  window.scrollTo = (() => {}) as unknown as typeof window.scrollTo;
  Element.prototype.scrollIntoView = () => {};
}
