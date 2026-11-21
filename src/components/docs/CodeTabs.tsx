"use client";

import { useEffect, useMemo, useState } from "react";
import { CODE_TAB_STORAGE_KEY } from "@/constants/storage";
import { CodeBlock } from "./CodeBlock";

export type CodeTabItem = {
  /** Optional stable id; falls back to the tab index. */
  id?: string;
  /** Tab button label, e.g. `cURL` or `TypeScript SDK`. */
  label: string;
  /** Code language used for syntax highlighting, e.g. `bash`, `typescript`. */
  language: string;
  /** Raw code sample. */
  code: string;
};

export type CodeTabsProps = {
  tabs: CodeTabItem[];
  /** Accessible name for the tab list, e.g. "Request examples". */
  label?: string;
  className?: string;
};

const CODE_TAB_SYNC_EVENT = "offer-hub-code-tab-change";

/**
 * Thin wrapper that remembers the selected language across docs pages. The
 * tab list, panels, copy button and highlighting all live in `CodeBlock`.
 */
export function CodeTabs({ tabs, label = "Code examples", className }: CodeTabsProps) {
  const items = useMemo(() => (Array.isArray(tabs) ? tabs : []), [tabs]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    try {
      const savedLabel = window.localStorage.getItem(CODE_TAB_STORAGE_KEY);
      const savedIndex = items.findIndex((tab) => tab.label === savedLabel);
      if (savedIndex >= 0) setActiveIndex(savedIndex);
    } catch {
      // Storage may be unavailable; the first tab remains selected.
    }
  }, [items]);

  useEffect(() => {
    const applyLabel = (selectedLabel: string | null | undefined) => {
      if (!selectedLabel) return;
      const nextIndex = items.findIndex((tab) => tab.label === selectedLabel);
      if (nextIndex >= 0) setActiveIndex(nextIndex);
    };

    const handleSync = (event: Event) => {
      applyLabel((event as CustomEvent<string>).detail);
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === CODE_TAB_STORAGE_KEY) applyLabel(event.newValue);
    };

    window.addEventListener(CODE_TAB_SYNC_EVENT, handleSync);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(CODE_TAB_SYNC_EVENT, handleSync);
      window.removeEventListener("storage", handleStorage);
    };
  }, [items]);

  function selectTab(index: number) {
    setActiveIndex(index);
    const selectedLabel = items[index]?.label;
    if (!selectedLabel) return;
    try {
      window.localStorage.setItem(CODE_TAB_STORAGE_KEY, selectedLabel);
    } catch {
      // The selection still works when storage is unavailable.
    }
    window.dispatchEvent(
      new CustomEvent(CODE_TAB_SYNC_EVENT, { detail: selectedLabel }),
    );
  }

  if (items.length === 0) return null;

  return (
    <CodeBlock
      tabs={items}
      activeIndex={activeIndex}
      onTabChange={selectTab}
      label={label}
      className={className}
    />
  );
}
