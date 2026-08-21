import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMediaQuery } from "../useMediaQuery";

type Listener = (event: MediaQueryListEvent) => void;

interface FakeMql {
  matches: boolean;
  media: string;
  listeners: Set<Listener>;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
}

const lists = new Map<string, FakeMql>();

/** One MediaQueryList per query string, reused across calls like the real API. */
function installMatchMedia(initial: Record<string, boolean> = {}) {
  lists.clear();
  const impl = vi.fn((media: string) => {
    let entry = lists.get(media);
    if (!entry) {
      const listeners = new Set<Listener>();
      entry = {
        matches: initial[media] ?? false,
        media,
        listeners,
        addEventListener: vi.fn((_type: string, listener: Listener) =>
          listeners.add(listener),
        ),
        removeEventListener: vi.fn((_type: string, listener: Listener) =>
          listeners.delete(listener),
        ),
      };
      lists.set(media, entry);
    }
    return entry;
  });
  vi.stubGlobal("matchMedia", impl);
  return impl;
}

function emit(media: string, matches: boolean) {
  const entry = lists.get(media)!;
  entry.matches = matches;
  act(() => {
    entry.listeners.forEach((listener) =>
      listener({ matches } as MediaQueryListEvent),
    );
  });
}

const MOBILE = "(max-width: 768px)";

describe("useMediaQuery", () => {
  beforeEach(() => {
    installMatchMedia();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the current match on the very first render, before any effect runs", () => {
    installMatchMedia({ [MOBILE]: true });

    const { result } = renderHook(() => useMediaQuery(MOBILE));

    expect(result.current).toBe(true);
  });

  it("returns false when the query does not match", () => {
    const { result } = renderHook(() => useMediaQuery(MOBILE));

    expect(result.current).toBe(false);
  });

  it("subscribes to change events for the query it was given", () => {
    renderHook(() => useMediaQuery(MOBILE));

    expect(lists.get(MOBILE)!.addEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );
  });

  it("updates when the media query starts matching", () => {
    const { result } = renderHook(() => useMediaQuery(MOBILE));
    expect(result.current).toBe(false);

    emit(MOBILE, true);

    expect(result.current).toBe(true);
  });

  it("updates again when the query stops matching", () => {
    installMatchMedia({ [MOBILE]: true });
    const { result } = renderHook(() => useMediaQuery(MOBILE));

    emit(MOBILE, false);

    expect(result.current).toBe(false);
  });

  it("re-reads matches in the effect, catching a change between render and mount", () => {
    const { result } = renderHook(() => useMediaQuery(MOBILE));

    // The effect calls matchMedia a second time and syncs from it.
    expect(lists.get(MOBILE)!.matches).toBe(false);
    expect(result.current).toBe(false);
  });

  it("resubscribes when the query prop changes", () => {
    const WIDE = "(min-width: 1280px)";
    const { rerender } = renderHook(({ query }) => useMediaQuery(query), {
      initialProps: { query: MOBILE },
    });

    rerender({ query: WIDE });

    expect(lists.get(MOBILE)!.removeEventListener).toHaveBeenCalled();
    expect(lists.get(WIDE)!.addEventListener).toHaveBeenCalled();
  });

  it("removes its listener on unmount", () => {
    const { unmount } = renderHook(() => useMediaQuery(MOBILE));

    unmount();

    expect(lists.get(MOBILE)!.removeEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );
  });

  it("stops responding to changes after unmount", () => {
    const { result, unmount } = renderHook(() => useMediaQuery(MOBILE));
    unmount();

    const entry = lists.get(MOBILE)!;
    expect(entry.listeners.size).toBe(0);
    expect(result.current).toBe(false);
  });
});
