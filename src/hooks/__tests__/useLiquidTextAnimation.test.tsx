import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useRef } from "react";
import { render, act } from "@testing-library/react";
import { useLiquidTextAnimation } from "../useLiquidTextAnimation";

const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";

const COLORS = {
  highlight: "rgb(20, 154, 155)",
  brightest: "rgb(255, 255, 255)",
};

type Listener = (event: MediaQueryListEvent) => void;

let mediaListeners: Set<Listener>;
let mediaMatches: boolean;
let removeMediaListener: ReturnType<typeof vi.fn>;

function installMatchMedia(matches: boolean) {
  mediaMatches = matches;
  mediaListeners = new Set();
  removeMediaListener = vi.fn((_type: string, listener: Listener) =>
    mediaListeners.delete(listener),
  );
  vi.stubGlobal(
    "matchMedia",
    vi.fn((media: string) => ({
      get matches() {
        return mediaMatches;
      },
      media,
      addEventListener: vi.fn((_type: string, listener: Listener) =>
        mediaListeners.add(listener),
      ),
      removeEventListener: removeMediaListener,
    })),
  );
}

function emitMediaChange(matches: boolean) {
  mediaMatches = matches;
  act(() => {
    mediaListeners.forEach((listener) =>
      listener({ matches } as MediaQueryListEvent),
    );
  });
}

let frames: FrameRequestCallback[];
let cancelFrame: ReturnType<typeof vi.fn>;

function installRaf() {
  frames = [];
  cancelFrame = vi.fn();
  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn((cb: FrameRequestCallback) => {
      frames.push(cb);
      return frames.length;
    }),
  );
  vi.stubGlobal("cancelAnimationFrame", cancelFrame);
}

/** Runs exactly one queued frame, mimicking a single browser tick. */
function tick() {
  const next = frames.shift();
  if (!next) return false;
  act(() => {
    next(performance.now());
  });
  return true;
}

function Harness({ attach = true }: { attach?: boolean }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useLiquidTextAnimation(ref, COLORS);
  return attach ? <h1 ref={ref}>Trustless payments</h1> : <h1>No ref</h1>;
}

function heading() {
  return document.querySelector("h1") as HTMLHeadingElement;
}

describe("useLiquidTextAnimation", () => {
  beforeEach(() => {
    installRaf();
    installMatchMedia(false);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("does nothing when the ref is not attached to an element", () => {
    render(<Harness attach={false} />);

    expect(frames).toHaveLength(0);
    expect(heading().style.backgroundImage).toBe("");
  });

  it("starts an animation frame when motion is allowed", () => {
    render(<Harness />);

    expect(window.matchMedia).toHaveBeenCalledWith(REDUCE_QUERY);
    expect(frames).toHaveLength(1);
  });

  it("paints orbiting radial gradients on each frame", () => {
    render(<Harness />);
    tick();

    const image = heading().style.backgroundImage;
    expect(image).toContain("radial-gradient");
    expect(image).toContain(COLORS.highlight);
    expect(image).toContain(COLORS.brightest);
  });

  it("keeps animating, changing the painted gradient between frames", () => {
    render(<Harness />);

    tick();
    const first = heading().style.backgroundImage;
    tick();
    const second = heading().style.backgroundImage;

    expect(second).not.toBe(first);
    expect(frames.length).toBeGreaterThan(0);
  });

  it("paints a static gradient and schedules no frames under reduced motion", () => {
    installMatchMedia(true);

    render(<Harness />);

    expect(frames).toHaveLength(0);
    expect(heading().style.backgroundImage).toContain("linear-gradient");
    expect(heading().style.backgroundImage).not.toContain("radial-gradient");
  });

  it("falls back to the static gradient when the user turns reduced motion on", () => {
    render(<Harness />);
    tick();
    expect(heading().style.backgroundImage).toContain("radial-gradient");

    emitMediaChange(true);

    expect(cancelFrame).toHaveBeenCalled();
    expect(heading().style.backgroundImage).toContain("linear-gradient");
  });

  it("stops repainting once reduced motion is on, even if a frame is already queued", () => {
    render(<Harness />);
    emitMediaChange(true);
    const staticGradient = heading().style.backgroundImage;

    // Any frame still in flight must bail out rather than repaint.
    frames.splice(0).forEach((cb) => act(() => cb(0)));

    expect(heading().style.backgroundImage).toBe(staticGradient);
  });

  it("resumes animating when reduced motion is turned back off", () => {
    installMatchMedia(true);
    render(<Harness />);
    expect(frames).toHaveLength(0);

    emitMediaChange(false);

    expect(frames.length).toBeGreaterThan(0);
    tick();
    expect(heading().style.backgroundImage).toContain("radial-gradient");
  });

  it("pauses while the tab is hidden and resumes when it is shown again", () => {
    render(<Harness />);
    tick();
    frames.length = 0;

    Object.defineProperty(document, "hidden", {
      value: true,
      configurable: true,
    });
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(cancelFrame).toHaveBeenCalled();
    expect(frames).toHaveLength(0);

    Object.defineProperty(document, "hidden", {
      value: false,
      configurable: true,
    });
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(frames.length).toBeGreaterThan(0);
  });

  it("does not resume on tab focus while reduced motion is on", () => {
    installMatchMedia(true);
    render(<Harness />);

    Object.defineProperty(document, "hidden", {
      value: false,
      configurable: true,
    });
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(frames).toHaveLength(0);
  });

  it("cancels the frame and unsubscribes on unmount", () => {
    const removeDocListener = vi.spyOn(document, "removeEventListener");
    const { unmount } = render(<Harness />);

    unmount();

    expect(cancelFrame).toHaveBeenCalled();
    expect(removeDocListener).toHaveBeenCalledWith(
      "visibilitychange",
      expect.any(Function),
    );
    expect(removeMediaListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );
    removeDocListener.mockRestore();
  });
});
