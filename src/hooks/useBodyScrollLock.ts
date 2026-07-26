"use client";

import { useEffect } from "react";

/**
 * Locks `document.body` scroll (via `overflow: hidden`) while `isLocked`
 * is true, restoring it on unlock/unmount. Matches the pattern duplicated
 * between Navbar's mobile menu and DiagramZoomModal.
 */
export function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    document.body.style.overflow = isLocked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isLocked]);
}
