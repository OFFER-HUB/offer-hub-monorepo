"use client";

import { useEffect, useRef, type RefObject } from "react";

export interface UseFocusTrapOptions {
  /** Container whose focusable descendants form the trap. */
  containerRef: RefObject<HTMLElement | null>;
  /** Whether the trap is currently engaged (e.g. the menu/drawer is open). */
  isActive: boolean;
  /** Called when Escape is pressed while the trap is active. */
  onEscape?: () => void;
  /**
   * Element to return focus to once the trap deactivates. Omit if the
   * consumer doesn't restore focus on close (matches DocsLayoutShell's
   * drawer, which doesn't restore focus, vs Navbar's mobile menu, which
   * returns focus to its toggle button).
   */
  restoreFocusRef?: RefObject<HTMLElement | null>;
}

const FOCUSABLE_SELECTORS =
  'a[href], button:not([disabled]), [tabIndex]:not([tabIndex="-1"])';

/**
 * Traps Tab/Shift+Tab focus cycling within `containerRef` while `isActive`
 * is true, focuses the first focusable element on activation, and calls
 * `onEscape` on Escape. Optionally restores focus to `restoreFocusRef` on
 * deactivation. Matches the pattern duplicated between Navbar's mobile
 * menu and DocsLayoutShell's mobile drawer.
 */
export function useFocusTrap({
  containerRef,
  isActive,
  onEscape,
  restoreFocusRef,
}: UseFocusTrapOptions) {
  const wasActive = useRef(false);

  useEffect(() => {
    if (isActive) {
      wasActive.current = true;
      const containerEl = containerRef.current;
      if (!containerEl) return;

      const focusableElements = Array.from(
        containerEl.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
      );

      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onEscape?.();
          return;
        }

        if (e.key === "Tab") {
          const firstEl = focusableElements[0];
          const lastEl = focusableElements[focusableElements.length - 1];
          if (!firstEl || !lastEl) return;

          if (e.shiftKey) {
            if (document.activeElement === firstEl) {
              lastEl.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastEl) {
              firstEl.focus();
              e.preventDefault();
            }
          }
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    } else if (wasActive.current) {
      restoreFocusRef?.current?.focus();
      wasActive.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);
}
