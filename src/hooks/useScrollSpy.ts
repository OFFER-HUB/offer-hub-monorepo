"use client";

import { useEffect, useState } from "react";

export interface UseScrollSpyOptions {
  /** Element ids to observe, in document order. */
  ids: string[];
  rootMargin?: string;
  threshold?: number | number[];
  /**
   * Given the batch of entries whose intersection state changed in this
   * IntersectionObserver callback, return the id that should become
   * active, or `undefined` to leave the current active id unchanged.
   *
   * Defaults to the entry with the highest `intersectionRatio` among the
   * changed entries (matches the original SectionNav behavior).
   */
  pickActiveId?: (entries: IntersectionObserverEntry[]) => string | undefined;
  /**
   * When true, adds a debounced `scroll` listener that forces the last id
   * in `ids` to become active once the user reaches the bottom of the
   * page — for cases where the final heading/section may never itself
   * reach `isIntersecting` (matches TableOfContents' fallback).
   */
  stickyLastOnBottom?: boolean;
  /** Distance from the bottom of the page, in px, to count as "at bottom". Default 50. */
  bottomOffsetPx?: number;
  /** Debounce delay, in ms, for the bottom-of-page scroll fallback. Default 100. */
  bottomCheckDebounceMs?: number;
  /**
   * Active id before the observer has fired once. Defaults to `""`
   * (nothing active on first paint). Pass `ids[0]` explicitly if the
   * consumer should highlight the first item immediately on mount.
   */
  initialId?: string;
}

const defaultPickActiveId = (
  entries: IntersectionObserverEntry[]
): string | undefined => {
  let best = entries[0];
  entries.forEach((entry) => {
    if (entry.intersectionRatio > best.intersectionRatio) best = entry;
  });
  return best?.isIntersecting && best.target.id ? best.target.id : undefined;
};

/**
 * Tracks which of `ids` is "active" based on IntersectionObserver state.
 * Centralizes the observer setup/teardown boilerplate duplicated across
 * SectionNav, TableOfContents, UseCasesClient, and Navbar, while leaving
 * each consumer's tie-breaking logic customizable via `pickActiveId`
 * since SectionNav and TableOfContents disagree on which visible section
 * should "win" when more than one is intersecting at once.
 */
export function useScrollSpy({
  ids,
  rootMargin = "0px",
  threshold = 0,
  pickActiveId = defaultPickActiveId,
  stickyLastOnBottom = false,
  bottomOffsetPx = 50,
  bottomCheckDebounceMs = 100,
  initialId = "",
}: UseScrollSpyOptions): string {
  const [activeId, setActiveId] = useState<string>(initialId);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const nextId = pickActiveId(entries);
        if (nextId) setActiveId(nextId);
      },
      { rootMargin, threshold }
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    let scrollTimeout: ReturnType<typeof setTimeout>;
    const handleScroll = () => {
      if (!stickyLastOnBottom) return;
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const isAtBottom =
          window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - bottomOffsetPx;
        const lastId = ids[ids.length - 1];
        if (isAtBottom && lastId) setActiveId(lastId);
      }, bottomCheckDebounceMs);
    };

    if (stickyLastOnBottom) {
      window.addEventListener("scroll", handleScroll, { passive: true });
    }

    return () => {
      observer.disconnect();
      clearTimeout(scrollTimeout);
      if (stickyLastOnBottom) {
        window.removeEventListener("scroll", handleScroll);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join(","), rootMargin, JSON.stringify(threshold), stickyLastOnBottom, bottomOffsetPx, bottomCheckDebounceMs]);

  return activeId;
}
