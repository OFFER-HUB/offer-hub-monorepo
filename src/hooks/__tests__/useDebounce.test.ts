import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "../useDebounce";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the initial value synchronously on first render", () => {
    const { result } = renderHook(() => useDebounce("hello", 300));

    expect(result.current).toBe("hello");
  });

  it("keeps returning the old value until the delay elapses", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "a" } },
    );

    rerender({ value: "ab" });
    expect(result.current).toBe("a");

    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe("a");

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe("ab");
  });

  it("only emits the final value when changes arrive faster than the delay", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "a" } },
    );

    for (const value of ["ab", "abc", "abcd"]) {
      rerender({ value });
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(result.current).toBe("a");
    }

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe("abcd");
  });

  it("restarts the timer when the delay itself changes", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "a", delay: 300 } },
    );

    rerender({ value: "b", delay: 300 });
    act(() => {
      vi.advanceTimersByTime(250);
    });

    rerender({ value: "b", delay: 1000 });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe("a");

    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(result.current).toBe("b");
  });

  it("emits on the next tick with a zero delay", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 0),
      { initialProps: { value: "a" } },
    );

    rerender({ value: "b" });
    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(result.current).toBe("b");
  });

  it("clears its pending timer on unmount", () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");
    const { unmount } = renderHook(() => useDebounce("a", 300));

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it("works with non-string values", () => {
    const first = { id: 1 };
    const second = { id: 2 };
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 100),
      { initialProps: { value: first } },
    );

    rerender({ value: second });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current).toBe(second);
  });
});
