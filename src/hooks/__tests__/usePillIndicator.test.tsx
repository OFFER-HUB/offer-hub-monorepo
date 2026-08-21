import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, act } from "@testing-library/react";
import { usePillIndicator, type PillStyle } from "../usePillIndicator";

const ITEMS = ["freelance", "ecommerce", "real-estate"];

/** Each item is 100px wide, laid out left to right inside a container at x=20. */
const RECTS: Record<string, { left: number; width: number }> = {
  container: { left: 20, width: 300 },
  freelance: { left: 20, width: 100 },
  ecommerce: { left: 120, width: 120 },
  "real-estate": { left: 240, width: 80 },
};

function stubRect(el: HTMLElement, key: string) {
  el.getBoundingClientRect = () =>
    ({ ...RECTS[key], right: 0, top: 0, bottom: 0, height: 40, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect;
}

let latest: {
  pillStyle: PillStyle | null;
  setItemRef: (id: string, el: HTMLElement | null) => void;
};

function Harness({ activeId, items = ITEMS }: { activeId: string; items?: string[] }) {
  const { containerRef, setItemRef, pillStyle } = usePillIndicator(activeId);
  latest = { pillStyle, setItemRef };

  return (
    <div
      ref={(el) => {
        if (el) stubRect(el, "container");
        containerRef.current = el;
      }}
    >
      {items.map((id) => (
        <button
          key={id}
          ref={(el) => {
            if (el) stubRect(el, id);
            setItemRef(id, el);
          }}
        >
          {id}
        </button>
      ))}
    </div>
  );
}

describe("usePillIndicator", () => {
  beforeEach(() => {
    latest = undefined as never;
  });

  it("positions the pill relative to the container, not the viewport", () => {
    render(<Harness activeId="ecommerce" />);

    // 120 (item left) - 20 (container left) = 100
    expect(latest.pillStyle).toEqual({ left: 100, width: 120 });
  });

  it("puts the pill at left 0 for the first item", () => {
    render(<Harness activeId="freelance" />);

    expect(latest.pillStyle).toEqual({ left: 0, width: 100 });
  });

  it("recomputes when the active id changes", () => {
    const { rerender } = render(<Harness activeId="freelance" />);
    expect(latest.pillStyle).toEqual({ left: 0, width: 100 });

    rerender(<Harness activeId="real-estate" />);

    expect(latest.pillStyle).toEqual({ left: 220, width: 80 });
  });

  it("stays null when the active id has no registered element", () => {
    render(<Harness activeId="does-not-exist" />);

    expect(latest.pillStyle).toBeNull();
  });

  it("keeps the previous position when the active id becomes unknown", () => {
    const { rerender } = render(<Harness activeId="freelance" />);
    const before = latest.pillStyle;

    rerender(<Harness activeId="unmounted-tab" />);

    expect(latest.pillStyle).toEqual(before);
  });

  it("recomputes on window resize", () => {
    render(<Harness activeId="freelance" />);

    // Simulate the container shifting after a layout change.
    RECTS.freelance = { left: 60, width: 140 };
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });

    expect(latest.pillStyle).toEqual({ left: 40, width: 140 });
    RECTS.freelance = { left: 20, width: 100 };
  });

  it("subscribes to resize passively", () => {
    const addEventListener = vi.spyOn(window, "addEventListener");

    render(<Harness activeId="freelance" />);

    expect(addEventListener).toHaveBeenCalledWith(
      "resize",
      expect.any(Function),
      { passive: true },
    );
    addEventListener.mockRestore();
  });

  it("removes its resize listener on unmount", () => {
    const removeEventListener = vi.spyOn(window, "removeEventListener");

    const { unmount } = render(<Harness activeId="freelance" />);
    unmount();

    expect(removeEventListener).toHaveBeenCalledWith(
      "resize",
      expect.any(Function),
    );
    removeEventListener.mockRestore();
  });

  it("drops an item from the registry when its ref is nulled out", () => {
    const { rerender } = render(<Harness activeId="real-estate" />);
    expect(latest.pillStyle).toEqual({ left: 220, width: 80 });

    // React calls setItemRef(id, null) for the removed button.
    rerender(<Harness activeId="real-estate" items={["freelance", "ecommerce"]} />);
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });

    // The stale position is kept rather than recomputed against a dead node.
    expect(latest.pillStyle).toEqual({ left: 220, width: 80 });
  });
});
