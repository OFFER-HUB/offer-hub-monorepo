import { describe, it, expect, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useBodyScrollLock } from "../useBodyScrollLock";

describe("useBodyScrollLock", () => {
  beforeEach(() => {
    document.body.style.overflow = "";
  });

  it("hides body overflow while locked", () => {
    renderHook(() => useBodyScrollLock(true));

    expect(document.body.style.overflow).toBe("hidden");
  });

  it("leaves body overflow untouched when not locked", () => {
    renderHook(() => useBodyScrollLock(false));

    expect(document.body.style.overflow).toBe("");
  });

  it("restores overflow when the lock is released", () => {
    const { rerender } = renderHook(
      ({ locked }) => useBodyScrollLock(locked),
      { initialProps: { locked: true } },
    );
    expect(document.body.style.overflow).toBe("hidden");

    rerender({ locked: false });

    expect(document.body.style.overflow).toBe("");
  });

  it("restores overflow on unmount so a closing modal cannot strand the page", () => {
    const { unmount } = renderHook(() => useBodyScrollLock(true));
    expect(document.body.style.overflow).toBe("hidden");

    unmount();

    expect(document.body.style.overflow).toBe("");
  });

  it("stays locked across re-renders that keep the flag true", () => {
    const { rerender } = renderHook(
      ({ locked }) => useBodyScrollLock(locked),
      { initialProps: { locked: true } },
    );

    rerender({ locked: true });

    expect(document.body.style.overflow).toBe("hidden");
  });
});
