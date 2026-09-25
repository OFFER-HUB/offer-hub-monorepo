"use client";

import {
  Children,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { Check, Copy } from "lucide-react";

import { cn } from "@/lib/cn";
import { CODE_TAB_STORAGE_KEY } from "@/constants/storage";
import { logger } from "@/utils/logger";
import { CodeBlock } from "./CodeBlock";

/**
 * CodeTabs / CodeTab — multi-language sample tabs for docs MDX (Issue #1576).
 *
 * Registered in `src/components/docs/mdx-components.tsx`.
 *
 * Behaviour:
 * - WAI-ARIA tabs pattern: `tablist` / `tab` / `tabpanel` roles, roving
 *   `tabindex`, arrow-key (+ Home/End) panel selection, `aria-controls` /
 *   `aria-labelledby` wiring.
 * - Every panel renders its own headerless CodeBlock, and the toolbar holds a
 *   Copy button that always copies the code of the *selected* panel.
 * - The selected tab label is persisted in `localStorage`
 *   (`CODE_TAB_STORAGE_KEY`) so the reader's language choice is remembered
 *   across the site. Same-window instances stay in sync through a custom
 *   event; other browser windows sync through the native `storage` event.
 *
 * Styling: design tokens only (no hardcoded colors, no colored borders) so
 * light/dark mode and the neumorphic look come from the existing system.
 */

/** Broadcast used to keep every <CodeTabs> instance on the page in sync. */
const CODE_TAB_SYNC_EVENT = "offer-hub-code-tab-change";

interface CodeTabContextValue {
  isActive: boolean;
  tabId: string;
  panelId: string;
}

const CodeTabContext = createContext<CodeTabContextValue | null>(null);

interface CodePanelSource {
  code: string;
  language?: string;
}

export interface CodeTabProps {
  /** Tab label shown in the tab list; also the value persisted in localStorage. */
  label: string;
  /** Fallback language for panels whose content has no `language-*` class. */
  language?: string;
  children?: ReactNode;
}

export interface CodeTabsProps {
  /** Accessible name for the tab list. */
  label?: string;
  children?: ReactNode;
}

function detectCodePanel(children: ReactNode, fallbackLanguage?: string): CodePanelSource | null {
  // Whitespace-only text (blank lines inside the JSX block) is not content.
  if (typeof children === "string") {
    return children.trim() ? { code: children, language: fallbackLanguage } : null;
  }

  if (Array.isArray(children)) {
    // Ignore whitespace-only text (blank lines inside the JSX block), but bail
    // out if any real sibling is not code — the panel then renders as-is.
    const meaningful = children.filter(
      (child) => !(typeof child === "string" && !child.trim()),
    );
    if (meaningful.length === 0) return null;

    const parts = meaningful.map((child) => detectCodePanel(child, fallbackLanguage));
    if (parts.some((part) => part === null)) return null;

    const sources = parts as CodePanelSource[];
    return {
      code: sources.map((part) => part.code.trim()).join("\n\n"),
      language: sources.find((part) => part.language)?.language ?? fallbackLanguage,
    };
  }

  if (!isValidElement(children)) return null;
  const props = children.props as Record<string, unknown>;

  // Explicit <CodeBlock code="..." language="..." /> usage in MDX.
  if (typeof props.code === "string") {
    return {
      code: props.code,
      language: typeof props.language === "string" ? props.language : fallbackLanguage,
    };
  }

  // Fenced block → the docs `pre` override passes the <code className="language-x">
  // element as children; inspect its props (it is never actually rendered here).
  const inner = props.children;
  if (isValidElement(inner)) {
    const innerProps = inner.props as Record<string, unknown>;
    const className = typeof innerProps.className === "string" ? innerProps.className : "";
    if (className.startsWith("language-") && typeof innerProps.children === "string") {
      return { code: innerProps.children, language: className.replace("language-", "") };
    }
  }

  // <CodeBlock>{rawString}</CodeBlock> passed directly as a child — or the
  // already-resolved CodeBlock the RSC children boundary hands to client
  // components (the pre-override runs server-side, so at runtime the child is
  // a CodeBlock element whose decoded reference no longer keeps identity).
  // Match on the props shape: a `language` string alongside string children.
  if (typeof props.language === "string" && typeof props.children === "string") {
    return { code: props.children, language: props.language || fallbackLanguage };
  }

  return null;
}

export function CodeTabs({ label = "Code samples", children }: CodeTabsProps) {
  const baseId = useId().replace(/:/g, "");
  const tabsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isCopied, setIsCopied] = useState(false);

  const tabs = useMemo(
    () =>
      Children.toArray(children).filter(
        (child): child is ReactElement<CodeTabProps> =>
          isValidElement(child) &&
          typeof (child as ReactElement<CodeTabProps>).props.label === "string",
      ),
    [children],
  );

  // Re-apply the persisted selection once the component is on the client.
  // Never read localStorage during the first render — the server output would
  // not match the client's first paint (hydration mismatch).
  useEffect(() => {
    let storedLabel: string | null = null;
    try {
      storedLabel = window.localStorage.getItem(CODE_TAB_STORAGE_KEY);
    } catch {
      storedLabel = null; // Storage unavailable (private mode) — fall back to first tab.
    }
    if (!storedLabel) return;
    const storedIndex = tabs.findIndex((tab) => tab.props.label === storedLabel);
    if (storedIndex >= 0) setActiveIndex(storedIndex);
  }, [tabs]);

  // Keep every CodeTabs instance on the site pointing at the same label:
  // same-window instances use a custom event, other windows the `storage` event.
  useEffect(() => {
    const applyLabel = (nextLabel: string | null | undefined) => {
      if (!nextLabel) return;
      const nextIndex = tabs.findIndex((tab) => tab.props.label === nextLabel);
      if (nextIndex >= 0) {
        setActiveIndex((prev) => (prev === nextIndex ? prev : nextIndex));
      }
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
  }, [tabs]);

  // A tab list that shrank (edited doc) must not leave a stale index active.
  useEffect(() => {
    if (tabs.length > 0 && activeIndex >= tabs.length) setActiveIndex(0);
  }, [tabs.length, activeIndex]);

  // The copy confirmation belongs to a specific panel — reset it on switch.
  useEffect(() => {
    setIsCopied(false);
  }, [activeIndex]);

  const selectTab = useCallback(
    (index: number) => {
      if (index < 0 || index >= tabs.length) return;
      setActiveIndex(index);

      const nextLabel = tabs[index]?.props.label;
      if (!nextLabel) return;
      try {
        window.localStorage.setItem(CODE_TAB_STORAGE_KEY, nextLabel);
      } catch {
        // Storage unavailable — the selection simply won't persist.
      }
      window.dispatchEvent(new CustomEvent(CODE_TAB_SYNC_EVENT, { detail: nextLabel }));
    },
    [tabs],
  );

  function handleTabListKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const count = tabs.length;
    if (count === 0) return;

    let nextIndex: number;
    switch (event.key) {
      case "ArrowRight":
        nextIndex = (activeIndex + 1) % count;
        break;
      case "ArrowLeft":
        nextIndex = (activeIndex - 1 + count) % count;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = count - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    selectTab(nextIndex);
    tabsRef.current[nextIndex]?.focus();
  }

  if (tabs.length === 0) {
    // Nothing tab-shaped — render the authored content untouched.
    return <>{children}</>;
  }

  const activeTab = tabs[activeIndex];
  const activeSource = activeTab
    ? detectCodePanel(activeTab.props.children, activeTab.props.language)
    : null;

  async function handleCopyActive() {
    if (!activeSource) return;
    try {
      await navigator.clipboard.writeText(activeSource.code.trim());
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      logger.error("Failed to copy!", err);
    }
  }

  return (
    <div className="my-10 rounded-3xl bg-bg-elevated shadow-neu-raised overflow-hidden">
      {/* Toolbar — sunken, token-driven (no colored borders) */}
      <div className="flex items-center justify-between gap-3 px-3 py-2.5 bg-bg-sunken shadow-neu-sunken-subtle">
        <div
          role="tablist"
          aria-label={label}
          aria-orientation="horizontal"
          onKeyDown={handleTabListKeyDown}
          className="flex items-center gap-2 min-w-0 overflow-x-auto no-scrollbar"
        >
          {tabs.map((tab, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={`${baseId}-tab-${index}`}
                ref={(element) => {
                  tabsRef.current[index] = element;
                }}
                type="button"
                role="tab"
                id={`${baseId}-tab-${index}`}
                aria-controls={`${baseId}-panel-${index}`}
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                onClick={() => selectTab(index)}
                className={cn(
                  "shrink-0 whitespace-nowrap rounded-xl px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] transition-[color,background-color,transform] duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary",
                  isActive
                    ? "bg-bg-elevated shadow-neu-raised-sm text-content-primary"
                    : "text-content-secondary hover:text-content-primary hover:bg-theme-primary/10 active:scale-95",
                )}
              >
                {tab.props.label}
              </button>
            );
          })}
        </div>

        {/* Copy button for the selected panel */}
        {activeSource && (
          <button
            type="button"
            onClick={handleCopyActive}
            aria-label={
              isCopied
                ? "Copied"
                : `Copy ${activeTab.props.label} code`
            }
            className={cn(
              "flex shrink-0 items-center gap-2 px-3.5 py-2 rounded-xl text-[10.5px] font-black uppercase tracking-widest transition-[color,background-color,transform] duration-300",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary",
              isCopied
                ? "text-white bg-theme-primary shadow-lg shadow-theme-primary/25"
                : "text-content-secondary bg-bg-base shadow-neu-raised-sm hover:text-content-primary hover:bg-theme-primary/10 active:scale-95",
            )}
          >
            {isCopied ? <Check size={14} className="stroke-[3.5]" /> : <Copy size={14} className="stroke-[2.5]" />}
            <span>{isCopied ? "Copied" : "Copy"}</span>
          </button>
        )}
      </div>

      {/* Panels */}
      {tabs.map((tab, index) => {
        const tabId = `${baseId}-tab-${index}`;
        const panelId = `${baseId}-panel-${index}`;
        return (
          <CodeTabContext.Provider
            key={panelId}
            value={{ isActive: index === activeIndex, tabId, panelId }}
          >
            {tab}
          </CodeTabContext.Provider>
        );
      })}
    </div>
  );
}

export function CodeTab({ label, language, children }: CodeTabProps) {
  const context = useContext(CodeTabContext);
  const source = detectCodePanel(children, language);

  if (!context) {
    // Rendered outside <CodeTabs> — fall back to plain content so the doc still renders.
    return <>{children}</>;
  }

  return (
    <div
      role="tabpanel"
      id={context.panelId}
      aria-labelledby={context.tabId}
      data-label={label}
      tabIndex={0}
      hidden={!context.isActive}
      className={
        source
          ? // Flatten the inner CodeBlock into the tab shell so the toolbar
            // reads as one integrated card (tokens only, no borders).
            "[&>div]:my-0 [&>div]:rounded-none [&>div]:shadow-none"
          : "p-6"
      }
    >
      {source ? (
        <CodeBlock code={source.code} language={source.language} isHeaderHidden />
      ) : (
        children
      )}
    </div>
  );
}

export default CodeTabs;
