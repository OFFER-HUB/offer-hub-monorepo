import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useScrollProgress } from "../useScrollProgress";

/** Runs rAF callbacks synchronously so the throttle is observable in a test. */
function installSyncRaf() {
  const raf = vi.fn((cb: FrameRequestCallback) => {
    cb(0);
    return 1;
  });
  vi.stubGlobal("requestAnimationFrame", raf);
  return raf;
}

function scrollTo(y: number) {
  Object.defineProperty(window, "scrollY", {
    value: y,
    configurable: true,
    writable: true,
  });
  act(() => {
    window.dispatchEvent(new Event("scroll"));
  });
}

describe("useScrollProgress", () => {
  beforeEach(() => {
    Object.defineProperty(window, "scrollY", {
      value: 0,
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("starts at 0", () => {
    installSyncRaf();

    const { result } = renderHook(() => useScrollProgress());

    expect(result.current).toBe(0);
  });

  it("seeds itself from the current scroll position on mount", () => {
    installSyncRaf();
    Object.defineProperty(window, "scrollY", { value: 420, configurable: true });

    const { result } = renderHook(() => useScrollProgress());

    expect(result.current).toBe(420);
  });

  it("tracks subsequent scroll events", () => {
    installSyncRaf();
    const { result } = renderHook(() => useScrollProgress());

    scrollTo(150);
    expect(result.current).toBe(150);

    scrollTo(900);
    expect(result.current).toBe(900);
  });

  it("subscribes passively so it cannot block scrolling", () => {
    installSyncRaf();
    const addEventListener = vi.spyOn(window, "addEventListener");

    renderHook(() => useScrollProgress());

    expect(addEventListener).toHaveBeenCalledWith(
      "scroll",
      expect.any(Function),
      { passive: true },
    );
  });

  it("coalesces bursts of scroll events into one frame", () => {
    // Defer the frame so several scroll events land inside the same tick.
    const pending: FrameRequestCallback[] = [];
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn((cb: FrameRequestCallback) => pending.push(cb)),
    );

    const { result } = renderHook(() => useScrollProgress());

    // Flush the frame the mount-time read schedules, so the burst below
    // starts from an un-ticked state.
    const flush = () =>
      act(() => {
        pending.splice(0).forEach((cb) => cb(0));
      });
    flush();

    for (const y of [10, 20, 30]) {
      Object.defineProperty(window, "scrollY", { value: y, configurable: true });
      act(() => {
        window.dispatchEvent(new Event("scroll"));
      });
    }

    // Three events, one frame — the `ticking` guard swallowed the other two.
    expect(pending).toHaveLength(1);

    flush();
    expect(result.current).toBe(30);
  });

  it("attaches no listener when disabled", () => {
    installSyncRaf();
    const addEventListener = vi.spyOn(window, "addEventListener");

    const { result } = renderHook(() => useScrollProgress(false));
    scrollTo(500);

    expect(addEventListener).not.toHaveBeenCalledWith(
      "scroll",
      expect.any(Function),
      { passive: true },
    );
    expect(result.current).toBe(0);
  });

  it("keeps the last known value when it is switched off", () => {
    installSyncRaf();
    const { result, rerender } = renderHook(
      ({ enabled }) => useScrollProgress(enabled),
      { initialProps: { enabled: true } },
    );

    scrollTo(300);
    expect(result.current).toBe(300);

    rerender({ enabled: false });
    scrollTo(800);

    expect(result.current).toBe(300);
  });

  it("starts tracking once it is enabled later", () => {
    installSyncRaf();
    const { result, rerender } = renderHook(
      ({ enabled }) => useScrollProgress(enabled),
      { initialProps: { enabled: false } },
    );

    Object.defineProperty(window, "scrollY", { value: 250, configurable: true });
    rerender({ enabled: true });

    expect(result.current).toBe(250);
  });

  it("removes its listener on unmount", () => {
    installSyncRaf();
    const removeEventListener = vi.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() => useScrollProgress());
    unmount();

    expect(removeEventListener).toHaveBeenCalledWith(
      "scroll",
      expect.any(Function),
    );
  });
});
