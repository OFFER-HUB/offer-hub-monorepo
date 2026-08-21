import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useScrollSpy } from "../useScrollSpy";

interface Instance {
  callback: IntersectionObserverCallback;
  options?: IntersectionObserverInit;
  observed: Element[];
  disconnect: ReturnType<typeof vi.fn>;
}

let instances: Instance[] = [];

function installObserver() {
  instances = [];
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observed: Element[] = [];
      disconnect = vi.fn();

      constructor(
        public callback: IntersectionObserverCallback,
        public options?: IntersectionObserverInit,
      ) {
        instances.push(this as unknown as Instance);
      }

      observe(el: Element) {
        this.observed.push(el);
      }

      unobserve() {}

      takeRecords() {
        return [];
      }
    },
  );
}

const current = () => instances[instances.length - 1];

/** Builds the minimum of an entry that defaultPickActiveId reads. */
function entry(id: string, ratio: number, isIntersecting = ratio > 0) {
  return {
    target: { id } as Element,
    intersectionRatio: ratio,
    isIntersecting,
  } as IntersectionObserverEntry;
}

function fire(...entries: IntersectionObserverEntry[]) {
  act(() => {
    current().callback(entries, null as unknown as IntersectionObserver);
  });
}

function mountSections(ids: string[]) {
  ids.forEach((id) => {
    const el = document.createElement("section");
    el.id = id;
    document.body.appendChild(el);
  });
}

const IDS = ["overview", "payments", "security"];

describe("useScrollSpy", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    installObserver();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("starts with an empty active id by default", () => {
    mountSections(IDS);

    const { result } = renderHook(() => useScrollSpy({ ids: IDS }));

    expect(result.current).toBe("");
  });

  it("honours an explicit initialId so the first item can highlight on mount", () => {
    mountSections(IDS);

    const { result } = renderHook(() =>
      useScrollSpy({ ids: IDS, initialId: "overview" }),
    );

    expect(result.current).toBe("overview");
  });

  it("observes every id that exists in the DOM", () => {
    mountSections(IDS);

    renderHook(() => useScrollSpy({ ids: IDS }));

    expect(current().observed.map((el) => el.id)).toEqual(IDS);
  });

  it("skips ids with no matching element instead of throwing", () => {
    mountSections(["overview"]);

    expect(() =>
      renderHook(() => useScrollSpy({ ids: [...IDS, "ghost"] })),
    ).not.toThrow();
    expect(current().observed).toHaveLength(1);
  });

  it("forwards rootMargin and threshold to the observer", () => {
    mountSections(IDS);

    renderHook(() =>
      useScrollSpy({ ids: IDS, rootMargin: "-100px 0px", threshold: [0, 0.5] }),
    );

    expect(current().options).toEqual({
      rootMargin: "-100px 0px",
      threshold: [0, 0.5],
    });
  });

  it("activates the intersecting entry with the highest ratio", () => {
    mountSections(IDS);
    const { result } = renderHook(() => useScrollSpy({ ids: IDS }));

    fire(entry("overview", 0.2), entry("payments", 0.9), entry("security", 0.1));

    expect(result.current).toBe("payments");
  });

  it("leaves the active id alone when the winning entry is not intersecting", () => {
    mountSections(IDS);
    const { result } = renderHook(() =>
      useScrollSpy({ ids: IDS, initialId: "overview" }),
    );

    fire(entry("payments", 0.4, false));

    expect(result.current).toBe("overview");
  });

  it("uses a custom pickActiveId when one is supplied", () => {
    mountSections(IDS);
    const pickActiveId = vi.fn(() => "security");
    const { result } = renderHook(() =>
      useScrollSpy({ ids: IDS, pickActiveId }),
    );

    fire(entry("overview", 0.9));

    expect(pickActiveId).toHaveBeenCalled();
    expect(result.current).toBe("security");
  });

  it("keeps the current id when pickActiveId returns undefined", () => {
    mountSections(IDS);
    const { result } = renderHook(() =>
      useScrollSpy({
        ids: IDS,
        initialId: "overview",
        pickActiveId: () => undefined,
      }),
    );

    fire(entry("payments", 1));

    expect(result.current).toBe("overview");
  });

  it("tears down and rebuilds the observer when resetKey changes", () => {
    mountSections(IDS);
    const { result, rerender } = renderHook(
      ({ resetKey }) =>
        useScrollSpy({ ids: IDS, initialId: "overview", resetKey }),
      { initialProps: { resetKey: "tab-a" } },
    );

    fire(entry("security", 1));
    expect(result.current).toBe("security");

    const before = instances.length;
    rerender({ resetKey: "tab-b" });

    expect(instances.length).toBe(before + 1);
    expect(result.current).toBe("overview");
  });

  it("rebuilds the observer when the id list changes", () => {
    mountSections(IDS);
    const { rerender } = renderHook(({ ids }) => useScrollSpy({ ids }), {
      initialProps: { ids: IDS },
    });
    const before = instances.length;

    rerender({ ids: ["overview", "payments"] });

    expect(instances.length).toBe(before + 1);
  });

  it("does not rebuild when an equal id list is passed as a new array", () => {
    mountSections(IDS);
    const { rerender } = renderHook(({ ids }) => useScrollSpy({ ids }), {
      initialProps: { ids: IDS },
    });
    const before = instances.length;

    rerender({ ids: [...IDS] });

    expect(instances.length).toBe(before);
  });

  it("disconnects the observer on unmount", () => {
    mountSections(IDS);
    const { unmount } = renderHook(() => useScrollSpy({ ids: IDS }));
    const observer = current();

    unmount();

    expect(observer.disconnect).toHaveBeenCalled();
  });
});

describe("useScrollSpy with waitForElements", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    installObserver();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("defers the observer until every id has mounted", () => {
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn((cb: FrameRequestCallback) => {
        frames.push(cb);
        return frames.length;
      }),
    );
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    mountSections(["overview"]);

    renderHook(() => useScrollSpy({ ids: IDS, waitForElements: true }));

    expect(instances).toHaveLength(0);

    // Lazily-loaded sections arrive, then the next frame attaches.
    mountSections(["payments", "security"]);
    act(() => {
      frames.splice(0).forEach((cb) => cb(0));
    });

    expect(instances).toHaveLength(1);
    expect(current().observed).toHaveLength(3);
  });

  it("attaches immediately when every element is already present", () => {
    mountSections(IDS);

    renderHook(() => useScrollSpy({ ids: IDS, waitForElements: true }));

    expect(instances).toHaveLength(1);
  });
});

describe("useScrollSpy with stickyLastOnBottom", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    installObserver();
    vi.useFakeTimers();
    Object.defineProperty(document.documentElement, "scrollHeight", {
      value: 3000,
      configurable: true,
    });
    Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  const scrollTo = (y: number) => {
    Object.defineProperty(window, "scrollY", { value: y, configurable: true });
    act(() => {
      window.dispatchEvent(new Event("scroll"));
      vi.advanceTimersByTime(150);
    });
  };

  it("forces the last id active once the page bottom is reached", () => {
    mountSections(IDS);
    const { result } = renderHook(() =>
      useScrollSpy({
        ids: IDS,
        initialId: "overview",
        stickyLastOnBottom: true,
      }),
    );

    scrollTo(3000 - window.innerHeight);

    expect(result.current).toBe("security");
  });

  it("leaves the active id alone partway down the page", () => {
    mountSections(IDS);
    const { result } = renderHook(() =>
      useScrollSpy({
        ids: IDS,
        initialId: "overview",
        stickyLastOnBottom: true,
      }),
    );

    scrollTo(400);

    expect(result.current).toBe("overview");
  });

  it("debounces the bottom check", () => {
    mountSections(IDS);
    const { result } = renderHook(() =>
      useScrollSpy({
        ids: IDS,
        initialId: "overview",
        stickyLastOnBottom: true,
      }),
    );

    Object.defineProperty(window, "scrollY", {
      value: 3000,
      configurable: true,
    });
    act(() => {
      window.dispatchEvent(new Event("scroll"));
      vi.advanceTimersByTime(50);
    });
    expect(result.current).toBe("overview");

    act(() => {
      vi.advanceTimersByTime(60);
    });
    expect(result.current).toBe("security");
  });

  it("attaches no scroll listener when the fallback is off", () => {
    mountSections(IDS);
    const addEventListener = vi.spyOn(window, "addEventListener");

    renderHook(() => useScrollSpy({ ids: IDS }));

    expect(addEventListener).not.toHaveBeenCalledWith(
      "scroll",
      expect.any(Function),
      { passive: true },
    );
    addEventListener.mockRestore();
  });

  it("removes the scroll listener on unmount", () => {
    mountSections(IDS);
    const removeEventListener = vi.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() =>
      useScrollSpy({ ids: IDS, stickyLastOnBottom: true }),
    );
    unmount();

    expect(removeEventListener).toHaveBeenCalledWith(
      "scroll",
      expect.any(Function),
    );
    removeEventListener.mockRestore();
  });
});
