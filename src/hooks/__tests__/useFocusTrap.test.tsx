import { describe, it, expect, vi } from "vitest";
import { useRef } from "react";
import { render, fireEvent, act } from "@testing-library/react";
import { useFocusTrap } from "../useFocusTrap";

interface HarnessProps {
  isActive: boolean;
  onEscape?: () => void;
  withRestoreTarget?: boolean;
  empty?: boolean;
  withoutContainer?: boolean;
}

/**
 * Mirrors the two real consumers: Navbar's mobile menu (restores focus to its
 * toggle) and DocsLayoutShell's drawer (does not).
 */
function Harness({
  isActive,
  onEscape,
  withRestoreTarget = false,
  empty = false,
  withoutContainer = false,
}: HarnessProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useFocusTrap({
    containerRef,
    isActive,
    onEscape,
    restoreFocusRef: withRestoreTarget ? toggleRef : undefined,
  });

  return (
    <>
      <button ref={toggleRef} data-testid="toggle">
        Menu
      </button>
      <button data-testid="outside">Outside</button>
      {!withoutContainer && (
        <div ref={containerRef} data-testid="container">
          {!empty && (
            <>
              <a href="#docs" data-testid="first">
                Docs
              </a>
              <button data-testid="middle">Middle</button>
              <button disabled data-testid="disabled">
                Disabled
              </button>
              <span tabIndex={-1} data-testid="skipped">
                Not focusable
              </span>
              <span tabIndex={0} data-testid="last">
                Last
              </span>
            </>
          )}
        </div>
      )}
    </>
  );
}

const tab = (init: KeyboardEventInit = {}) =>
  fireEvent.keyDown(document, { key: "Tab", ...init });

describe("useFocusTrap", () => {
  it("focuses the first focusable element when it activates", () => {
    const { getByTestId, rerender } = render(<Harness isActive={false} />);

    act(() => {
      getByTestId("outside").focus();
    });
    expect(document.activeElement).toBe(getByTestId("outside"));

    rerender(<Harness isActive />);

    expect(document.activeElement).toBe(getByTestId("first"));
  });

  it("skips disabled buttons and tabIndex=-1 nodes when picking the boundaries", () => {
    const { getByTestId } = render(<Harness isActive />);

    // First focusable is the link, not the disabled button.
    expect(document.activeElement).toBe(getByTestId("first"));

    act(() => {
      getByTestId("last").focus();
    });
    tab();

    // Wrapping from the last focusable lands back on the link.
    expect(document.activeElement).toBe(getByTestId("first"));
  });

  it("wraps Tab from the last element back to the first and prevents the default", () => {
    const { getByTestId } = render(<Harness isActive />);
    act(() => {
      getByTestId("last").focus();
    });

    const prevented = !fireEvent.keyDown(document, { key: "Tab" });

    expect(prevented).toBe(true);
    expect(document.activeElement).toBe(getByTestId("first"));
  });

  it("wraps Shift+Tab from the first element to the last", () => {
    const { getByTestId } = render(<Harness isActive />);
    expect(document.activeElement).toBe(getByTestId("first"));

    const prevented = !fireEvent.keyDown(document, {
      key: "Tab",
      shiftKey: true,
    });

    expect(prevented).toBe(true);
    expect(document.activeElement).toBe(getByTestId("last"));
  });

  it("lets Tab through untouched in the middle of the trap", () => {
    const { getByTestId } = render(<Harness isActive />);
    act(() => {
      getByTestId("middle").focus();
    });

    const notPrevented = fireEvent.keyDown(document, { key: "Tab" });

    expect(notPrevented).toBe(true);
    expect(document.activeElement).toBe(getByTestId("middle"));
  });

  it("ignores keys other than Tab and Escape", () => {
    const onEscape = vi.fn();
    const { getByTestId } = render(<Harness isActive onEscape={onEscape} />);

    fireEvent.keyDown(document, { key: "ArrowDown" });

    expect(onEscape).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(getByTestId("first"));
  });

  it("calls onEscape when Escape is pressed while active", () => {
    const onEscape = vi.fn();
    render(<Harness isActive onEscape={onEscape} />);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it("does nothing on Escape when inactive", () => {
    const onEscape = vi.fn();
    render(<Harness isActive={false} onEscape={onEscape} />);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onEscape).not.toHaveBeenCalled();
  });

  it("stops listening once it deactivates", () => {
    const onEscape = vi.fn();
    const { rerender } = render(<Harness isActive onEscape={onEscape} />);

    rerender(<Harness isActive={false} onEscape={onEscape} />);
    fireEvent.keyDown(document, { key: "Escape" });

    expect(onEscape).not.toHaveBeenCalled();
  });

  it("returns focus to restoreFocusRef when it deactivates", () => {
    const { getByTestId, rerender } = render(<Harness isActive withRestoreTarget />);
    expect(document.activeElement).toBe(getByTestId("first"));

    rerender(<Harness isActive={false} withRestoreTarget />);

    expect(document.activeElement).toBe(getByTestId("toggle"));
  });

  it("leaves focus alone on deactivation when no restore target is given", () => {
    const { getByTestId, rerender } = render(<Harness isActive />);
    act(() => {
      getByTestId("outside").focus();
    });

    rerender(<Harness isActive={false} />);

    expect(document.activeElement).toBe(getByTestId("outside"));
  });

  it("does not steal focus on the initial inactive render", () => {
    const { getByTestId } = render(<Harness isActive={false} withRestoreTarget />);

    act(() => {
      getByTestId("outside").focus();
    });

    expect(document.activeElement).toBe(getByTestId("outside"));
  });

  it("does not throw when the container holds no focusable elements", () => {
    const onEscape = vi.fn();

    expect(() => render(<Harness isActive empty onEscape={onEscape} />)).not.toThrow();

    fireEvent.keyDown(document, { key: "Tab" });
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it("bails out without listening when the container ref is empty", () => {
    const onEscape = vi.fn();
    render(<Harness isActive withoutContainer onEscape={onEscape} />);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onEscape).not.toHaveBeenCalled();
  });
});
