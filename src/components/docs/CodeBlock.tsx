"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Check, Copy } from "lucide-react";
import type { ThemeRegistration } from "shiki";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { logger } from "@/utils/logger";
import {
  escapeHtml,
  highlightCache,
  parseLineHighlightRange,
} from "@/utils/shiki-highlight";

export type CodeBlockTab = {
  /** Stable id used for tab/panel wiring; falls back to the tab index. */
  id?: string;
  /** Visible tab label. Icons should be marked `aria-hidden`. */
  label: ReactNode;
  /** Raw code sample shown in the panel and copied by the header button. */
  code: string;
  /** Highlighting language for this tab. Falls back to the block language. */
  language?: string;
  /** Optional accessible label for the tab's code region. */
  title?: string;
};

interface CodeBlockProps {
  code?: string;
  children?: string;
  language?: string;
  className?: string;
  title?: string;
  filename?: string;
  highlight?: string;
  highlightLines?: string;
  lineNumbers?: boolean;
  showLineNumbers?: boolean;
  /** Optional tabs rendered in the same header as the copy button. */
  tabs?: CodeBlockTab[];
  /** Controlled selection for `tabs`. Defaults to the first tab. */
  activeIndex?: number;
  onTabChange?: (index: number) => void;
  /** Accessible name for the tab list. */
  label?: string;
  /** Renders a command prompt and labels the block as a terminal. */
  terminal?: boolean;
  promptSymbol?: string;
  /** Overrides the copied value (terminal mode omits the prompt). */
  copyText?: string;
  /** Accessible name for the copy button when the block has a specific target. */
  copyLabel?: string;
  /** Extra header content, e.g. a link to the full SDK reference. */
  accessory?: ReactNode;
  /** Tighter padding and a bounded height for embedded panels. */
  dense?: boolean;
  /** Kept for callers that provide their own toolbar. */
  isHeaderHidden?: boolean;
}

const LANGUAGE_ALIASES: Record<string, string> = {
  env: "bash",
  dotenv: "bash",
  sh: "bash",
  zsh: "bash",
  conf: "ini",
  config: "ini",
};

/**
 * One Shiki theme for both color schemes: every foreground is a CSS custom
 * property, so the browser resolves the palette token for the active theme.
 */
const PALETTE_THEME: ThemeRegistration = {
  name: "offer-hub-palette",
  type: "light",
  colors: {
    "editor.background": "var(--color-bg-sunken)",
    "editor.foreground": "var(--color-text-primary)",
  },
  settings: [
    { settings: { foreground: "var(--color-text-primary)" } },
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: "var(--color-text-muted)", fontStyle: "italic" },
    },
    {
      scope: [
        "keyword",
        "keyword.control",
        "storage",
        "entity.name.tag",
        "support.type.property-name",
      ],
      settings: { foreground: "var(--color-primary-hover)" },
    },
    {
      scope: ["string", "constant.character", "markup.underline.link"],
      settings: { foreground: "var(--color-success)" },
    },
    {
      scope: ["constant.numeric", "constant.language", "support.constant"],
      settings: { foreground: "var(--color-warning)" },
    },
    {
      scope: ["entity.name.function", "support.function", "meta.function-call"],
      settings: { foreground: "var(--color-primary)" },
    },
    {
      scope: ["entity.name.type", "support.type", "support.class"],
      settings: { foreground: "var(--color-error)" },
    },
    {
      scope: ["variable", "variable.other", "meta.definition.variable"],
      settings: { foreground: "var(--color-text-secondary)" },
    },
    {
      scope: ["punctuation", "meta.brace"],
      settings: { foreground: "var(--color-text-muted)" },
    },
  ],
};

const SURFACE_CLASSES = cn(
  "min-w-0 overflow-x-auto p-4 text-sm leading-relaxed text-content-primary sm:p-6",
  "scrollbar-thin scrollbar-track-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary",
  "[&_pre]:!m-0 [&_pre]:!bg-transparent [&_pre]:!p-0",
  "[&_.line]:-mx-3 [&_.line]:block [&_.line]:min-h-6 [&_.line]:px-3",
  "[&_.highlighted-line]:rounded-xl [&_.highlighted-line]:bg-bg-sunken [&_.highlighted-line]:shadow-neu-sunken-subtle",
  "[&.with-line-numbers_[data-line]]:before:mr-4 [&.with-line-numbers_[data-line]]:before:inline-block [&.with-line-numbers_[data-line]]:before:w-8 [&.with-line-numbers_[data-line]]:before:text-right [&.with-line-numbers_[data-line]]:before:text-content-muted [&.with-line-numbers_[data-line]]:before:content-[attr(data-line)]",
);

interface CodeSurfaceProps {
  code: string;
  language: string;
  label: string;
  highlightRange: string;
  highlightedSet: Set<number>;
  hasLineNumbers: boolean;
  terminal: boolean;
  promptSymbol: string;
  dense: boolean;
}

function CodeSurface({
  code,
  language,
  label,
  highlightRange,
  highlightedSet,
  hasLineNumbers,
  terminal,
  promptSymbol,
  dense,
}: CodeSurfaceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [highlightedCode, setHighlightedCode] = useState("");
  const normalizedLang = LANGUAGE_ALIASES[language] || language;
  const displayedCode = terminal ? `${promptSymbol} ${code}` : code;
  const cacheKey = [
    "palette",
    normalizedLang,
    hasLineNumbers ? "ln" : "noln",
    highlightRange,
    displayedCode,
  ].join(":");

  useEffect(() => {
    const cached = highlightCache.get(cacheKey);
    if (cached) {
      setHighlightedCode(cached);
      return;
    }

    let isMounted = true;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        observer.disconnect();
        import("shiki")
          .then(({ codeToHtml }) =>
            codeToHtml(displayedCode, {
              lang: normalizedLang,
              theme: PALETTE_THEME,
              transformers: [
                {
                  line(node, lineIndex) {
                    node.properties = {
                      ...node.properties,
                      "data-line": lineIndex + 1,
                    };
                    if (highlightedSet.has(lineIndex + 1)) {
                      this.addClassToHast(node, "highlighted-line");
                    }
                  },
                },
              ],
            }),
          )
          .then((html) => {
            highlightCache.set(cacheKey, html);
            if (isMounted) setHighlightedCode(html);
          })
          .catch(() => {
            const fallback = `<pre><code>${escapeHtml(displayedCode)}</code></pre>`;
            highlightCache.set(cacheKey, fallback);
            if (isMounted) setHighlightedCode(fallback);
          });
      },
      { rootMargin: "200px" },
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => {
      isMounted = false;
      observer.disconnect();
    };
  }, [cacheKey, displayedCode, highlightedSet, normalizedLang]);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="region"
      aria-label={`${label} code sample, scrollable horizontally`}
      className={cn(
        SURFACE_CLASSES,
        dense && "max-h-[34rem] overflow-auto p-4 text-xs",
        hasLineNumbers && "with-line-numbers",
      )}
    >
      {highlightedCode ? (
        <div dangerouslySetInnerHTML={{ __html: highlightedCode }} />
      ) : (
        <pre className="font-mono">
          <code>
            {displayedCode.split("\n").map((lineText, index) => {
              const lineNumber = index + 1;
              return (
                <span
                  key={index}
                  data-line={hasLineNumbers ? lineNumber : undefined}
                  className={cn(
                    "block min-h-6 px-3 -mx-3 transition-colors",
                    highlightedSet.has(lineNumber) &&
                      "rounded-xl bg-bg-sunken shadow-neu-sunken-subtle",
                  )}
                >
                  {lineText || " "}
                </span>
              );
            })}
          </code>
        </pre>
      )}
    </div>
  );
}

/**
 * The single code surface used across docs, the API explorer, dialogs and
 * marketing pages. It owns the header, tab list, copy feedback and highlighting.
 */
export function CodeBlock({
  code: codeProp,
  children,
  terminal = false,
  language = terminal ? "bash" : "typescript",
  className,
  title,
  filename,
  highlight,
  highlightLines,
  lineNumbers,
  showLineNumbers,
  tabs,
  activeIndex,
  onTabChange,
  label = "Code examples",
  promptSymbol = "$",
  copyText,
  copyLabel = "Copy code",
  accessory,
  dense = false,
  isHeaderHidden = false,
}: CodeBlockProps) {
  const items = useMemo(() => (Array.isArray(tabs) ? tabs : []), [tabs]);
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [internalIndex, setInternalIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const copyTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedIndex =
    activeIndex !== undefined
      ? Math.min(Math.max(activeIndex, 0), Math.max(items.length - 1, 0))
      : internalIndex;
  const activeTab = items[selectedIndex];
  const rawCode = (codeProp || children || "").trim();
  const code = activeTab ? activeTab.code.trim() : rawCode;
  const codeLanguage = activeTab?.language ?? language;
  const displayTitle = title ?? filename ?? (terminal ? "Terminal" : undefined);
  const highlightRange = highlight ?? highlightLines ?? "";
  const highlightedSet = useMemo(
    () => parseLineHighlightRange(highlightRange),
    [highlightRange],
  );
  const hasLineNumbers = Boolean(lineNumbers ?? showLineNumbers);

  useEffect(
    () => () => {
      if (copyTimeout.current) clearTimeout(copyTimeout.current);
    },
    [],
  );

  function selectTab(index: number) {
    if (index < 0 || index >= items.length) return;
    setInternalIndex(index);
    onTabChange?.(index);
    tabRefs.current[index]?.focus();
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = items.length - 1;
    const next =
      event.key === "ArrowRight"
        ? index === last
          ? 0
          : index + 1
        : event.key === "ArrowLeft"
          ? index === 0
            ? last
            : index - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;

    if (next === null) return;
    event.preventDefault();
    selectTab(next);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(copyText ?? code);
      setCopied(true);
      setCopyStatus("Code copied to clipboard");
    } catch (error) {
      logger.error("Failed to copy code", error);
      setCopied(false);
      setCopyStatus("Failed to copy code to clipboard");
    }

    if (copyTimeout.current) clearTimeout(copyTimeout.current);
    copyTimeout.current = setTimeout(() => {
      setCopied(false);
      setCopyStatus("");
    }, 2000);
  }

  const tabId = (index: number) => `${baseId}-tab-${items[index]?.id ?? index}`;
  const panelId = (index: number) => `${baseId}-panel-${items[index]?.id ?? index}`;
  const regionLabel = displayTitle ? `${displayTitle} (${codeLanguage})` : codeLanguage;
  const surfaceProps = {
    highlightRange,
    highlightedSet,
    hasLineNumbers,
    terminal,
    promptSymbol,
    dense,
    label: regionLabel,
  };

  return (
    <div
      className={cn(
        "my-10 w-full min-w-0 overflow-hidden rounded-2xl bg-bg-sunken shadow-neu-sunken",
        className,
      )}
    >
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {copyStatus}
      </span>

      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-3 rounded-t-2xl bg-bg-sunken px-4 py-3 shadow-neu-sunken-subtle",
          isHeaderHidden && "hidden",
        )}
      >
        {items.length > 0 ? (
          <div
            role="tablist"
            aria-label={label}
            aria-orientation="horizontal"
            className="flex min-w-0 flex-wrap items-center gap-1"
          >
            {items.map((tab, index) => {
              const isActive = index === selectedIndex;
              return (
                <button
                  key={tab.id ?? index}
                  ref={(node) => {
                    tabRefs.current[index] = node;
                  }}
                  type="button"
                  id={tabId(index)}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={panelId(index)}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => selectTab(index)}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                  className={cn(
                    "inline-flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 font-mono text-xs font-semibold uppercase tracking-widest",
                    "transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary",
                    isActive
                      ? "bg-bg-base text-theme-primary shadow-neu-raised-sm"
                      : "text-content-secondary hover:text-content-primary",
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        ) : (
          <span className="min-w-0 font-mono text-xs font-semibold uppercase tracking-widest text-content-secondary">
            {displayTitle ?? codeLanguage}
          </span>
        )}

        <div className="flex items-center gap-2">
          {accessory}
          <Button
            onClick={handleCopy}
            aria-label={copied ? "Copied" : copyLabel}
            variant={copied ? "primary" : "secondary"}
            size="sm"
            leadingIcon={copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
            className="font-mono text-xs uppercase tracking-widest"
          >
            <span>{copied ? "Copied" : "Copy"}</span>
          </Button>
        </div>
      </div>

      {items.length > 0 ? (
        items.map((tab, index) => (
          <div
            key={tab.id ?? index}
            id={panelId(index)}
            role="tabpanel"
            aria-labelledby={tabId(index)}
            hidden={index !== selectedIndex}
            className="min-w-0"
          >
            <CodeSurface
              {...surfaceProps}
              code={tab.code}
              language={tab.language ?? codeLanguage}
              label={
                tab.title ??
                (typeof tab.label === "string" ? tab.label : regionLabel)
              }
            />
          </div>
        ))
      ) : (
        <CodeSurface {...surfaceProps} code={rawCode} language={codeLanguage} />
      )}
    </div>
  );
}
