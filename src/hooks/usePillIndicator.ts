"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface PillStyle {
  left: number;
  width: number;
}

/**
 * Tracks the position/width a "sliding pill" indicator should animate to,
 * based on which item id is currently active. Extracted out of
 * UseCasesClient's inline pill-indicator state (container ref, per-item
 * refs, and the resize/active-id effects that recompute the pill's
 * bounding box).
 */
export function usePillIndicator(activeId: string) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLElement>>(new Map());
  const [pillStyle, setPillStyle] = useState<PillStyle | null>(null);

  const setItemRef = useCallback((id: string, el: HTMLElement | null) => {
    if (el) itemRefs.current.set(id, el);
    else itemRefs.current.delete(id);
  }, []);

  const updatePillStyle = useCallback(() => {
    const container = containerRef.current;
    const activeEl = itemRefs.current.get(activeId);
    if (!container || !activeEl) return;

    const containerRect = container.getBoundingClientRect();
    const itemRect = activeEl.getBoundingClientRect();

    setPillStyle({
      left: itemRect.left - containerRect.left,
      width: itemRect.width,
    });
  }, [activeId]);

  useEffect(() => {
    updatePillStyle();
  }, [activeId, updatePillStyle]);

  useEffect(() => {
    const onResize = () => updatePillStyle();
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, [updatePillStyle]);

  return { containerRef, setItemRef, pillStyle };
}
