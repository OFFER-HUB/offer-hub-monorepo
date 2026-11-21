"use client";

import { useState, useEffect, useRef } from "react";
import { Copy, Check, Code2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { useTheme } from "@/components/providers/ThemeProvider";
import { logger } from "@/utils/logger";
import { highlightCache, escapeHtml, parseLineHighlightRange } from "@/utils/shiki-highlight";

interface CodeBlockProps {
  code?: string;
  children?: string;
  language?: string;
  className?: string;
  /**
   * Hide the header bar (language label + copy button). Used when an outer
   * component — e.g. CodeTabs — provides its own toolbar so the panel does
   * not render a second, redundant header.
   */
  isHeaderHidden?: boolean;
  /**
   * Optional title or filename displayed in the header bar.
   */
  title?: string;
  /**
   * Alias for title.
   */
  filename?: string;
  /**
   * Line highlighting range expression, e.g. "{1,3-5}" or "1, 3-5".
   */
  highlight?: string;
  /**
   * Alias for highlight.
   */
  highlightLines?: string;
  /**
   * Whether to display line numbers.
   */
  lineNumbers?: boolean;
  /**
   * Alias for lineNumbers.
   */
  showLineNumbers?: boolean;
}

const LANGUAGE_ALIASES: Record<string, string> = {
  env: "bash",
  dotenv: "bash",
  sh: "bash",
  zsh: "bash",
  conf: "ini",
  config: "ini",
};

export function CodeBlock({
  code: codeProp,
  children,
  language = "typescript",
  className,
  isHeaderHidden = false,
  title,
  filename,
  highlight,
  highlightLines,
  lineNumbers,
  showLineNumbers,
}: CodeBlockProps) {
  const { resolvedTheme } = useTheme();
  const normalizedLang = LANGUAGE_ALIASES[language] || language;
  const shikiTheme = resolvedTheme === "dark" ? "github-dark" : "github-light";
  const [copied, setCopied] = useState(false);
  const [copyStatus, setCopyStatus] = useState<string>("");
  const [highlightedCode, setHighlightedCode] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);

  const displayTitle = title ?? filename;
  const highlightRange = highlight ?? highlightLines ?? "";
  const hasLineNumbers = Boolean(lineNumbers ?? showLineNumbers);
  const highlightedSet = parseLineHighlightRange(highlightRange);

  const rawCode = (codeProp || children || "").trim();
  const cacheKey = `${shikiTheme}:${normalizedLang}:${hasLineNumbers ? "ln" : "noln"}:${highlightRange}:${rawCode}`;

  useEffect(() => {
    // Return cached result immediately — no Shiki load needed
    const cached = highlightCache.get(cacheKey);
    if (cached) {
      setHighlightedCode(cached);
      return;
    }

    let isMounted = true;

    // Lazy-load Shiki only when code block is near the viewport
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          observer.disconnect();
          import("shiki").then(({ codeToHtml }) => {
            codeToHtml(rawCode, {
              lang: normalizedLang,
              theme: shikiTheme,
              transformers: [
                {
                  line(node, lineIndex) {
                    node.properties = node.properties || {};
                    node.properties["data-line"] = lineIndex;
                    if (highlightedSet.has(lineIndex)) {
                      this.addClassToHast(node, "highlighted-line");
                    }
                  },
                },
              ],
            })
              .then((html) => {
                highlightCache.set(cacheKey, html);
                if (isMounted) setHighlightedCode(html);
              })
              .catch(() => {
                const fallback = `<pre><code>${escapeHtml(rawCode)}</code></pre>`;
                highlightCache.set(cacheKey, fallback);
                if (isMounted) setHighlightedCode(fallback);
              });
          });
        }
      },
      { rootMargin: "200px" },
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      isMounted = false;
      observer.disconnect();
    };
  }, [cacheKey, rawCode, normalizedLang, shikiTheme, highlightedSet]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(rawCode);
      setCopied(true);
      setCopyStatus("Code copied to clipboard");
      setTimeout(() => {
        setCopied(false);
        setCopyStatus("");
      }, 2000);
    } catch (err) {
      logger.error("Failed to copy!", err);
      setCopied(false);
      setCopyStatus("Failed to copy code to clipboard");
      setTimeout(() => setCopyStatus(""), 2000);
    }
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative rounded-3xl overflow-hidden my-10 bg-bg-elevated shadow-neu-raised group transition-colors duration-300",
        className,
      )}
    >
      {/* Hidden aria-live live region announcing copy feedback */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {copyStatus}
      </div>

      {/* Header bar — sunken, clean edges (no border). Hidden when an outer
          toolbar (e.g. CodeTabs) already owns the copy/language controls. */}
      <div
        className={cn(
          "items-center justify-between px-6 py-4 rounded-t-3xl bg-bg-sunken shadow-neu-sunken-subtle",
          isHeaderHidden ? "hidden" : "flex",
        )}
      >
        <div className="flex items-center gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-bg-base shadow-neu-raised-sm transition-colors duration-300 group-hover:bg-theme-primary/10">
            <Code2 size={16} className="text-content-secondary group-hover:text-theme-primary" />
          </div>
          <div className="flex items-center gap-2.5">
            {displayTitle && (
              <span className="text-xs font-bold text-content-primary font-mono tracking-tight">
                {displayTitle}
              </span>
            )}
            <span
              className={cn(
                "text-xs font-black uppercase tracking-[0.18em] font-mono",
                displayTitle ? "text-content-secondary/60 text-[11px]" : "text-content-secondary/70",
              )}
            >
              {language}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? "Copied" : "Copy code"}
          className={cn(
            "relative flex items-center gap-2.5 px-4 py-2 min-h-11 rounded-xl text-xs font-black uppercase tracking-widest transition-[color,background-color,transform] duration-300",
            copied
              ? "text-white bg-theme-primary shadow-neu-raised-sm"
              : "text-content-secondary bg-bg-base shadow-neu-raised-sm hover:text-content-primary hover:bg-theme-primary/10 active:scale-95",
          )}
        >
          <span className="flex items-center gap-2">
            {copied ? <Check size={14} className="stroke-[3.5]" /> : <Copy size={14} className="stroke-[2.5]" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </span>
        </button>
      </div>

      {/* Code Area */}
      <div
        tabIndex={0}
        role="region"
        aria-label={`${displayTitle ? `${displayTitle} (${language})` : `${language}`} code sample, scrollable horizontally`}
        className="p-8 overflow-x-auto text-[14px] leading-[1.8] min-h-[5rem] text-content-primary scrollbar-thin scrollbar-track-transparent selection:bg-theme-primary/20 selection:text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary/50"
      >
        {highlightedCode ? (
          <div
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
            className={cn(
              "shiki-container [&>pre]:!bg-transparent [&>pre]:!p-0 [&>pre]:!m-0 [&>pre]:!outline-none [&_.line-number]:text-content-muted",
              hasLineNumbers && "with-line-numbers",
            )}
          />
        ) : (
          <pre className="text-content-secondary/70 font-mono font-medium">
            <code>
              {rawCode.split("\n").map((lineText, idx) => {
                const lineNum = idx + 1;
                const isHighlighted = highlightedSet.has(lineNum);
                return (
                  <span
                    key={idx}
                    data-line={hasLineNumbers ? lineNum : undefined}
                    className={cn(
                      "block min-h-[1.5rem] px-4 -mx-4 transition-colors",
                      isHighlighted && "bg-bg-sunken shadow-neu-sunken-subtle rounded-md",
                      hasLineNumbers &&
                        "before:inline-block before:w-9 before:text-right before:mr-5 before:text-content-muted/60 before:select-none before:tabular-nums before:content-[attr(data-line)]",
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

      <style jsx global>{`
        .shiki-container pre {
          color: inherit;
          background-color: transparent !important;
        }
        .shiki-container code {
          background-color: transparent !important;
        }
        .shiki-container .line {
          display: inline-block;
          width: 100%;
          min-height: 1.5rem;
          padding: 0 1rem;
          margin: 0 -1rem;
          background-color: transparent !important;
          transition: background-color 0.2s ease, box-shadow 0.2s ease;
        }
        .shiki-container .line.highlighted-line {
          background-color: var(--color-bg-sunken) !important;
          box-shadow: inset 1px 1px 2px var(--neu-shadow-dark, rgba(0, 0, 0, 0.08)), inset -1px -1px 2px var(--neu-shadow-light, rgba(255, 255, 255, 0.04));
          border-radius: 6px;
        }
        .shiki-container.with-line-numbers [data-line]::before {
          content: attr(data-line);
          display: inline-block;
          width: 2.25rem;
          text-align: right;
          margin-right: 1.25rem;
          color: var(--color-text-muted);
          opacity: 0.6;
          user-select: none;
          font-variant-numeric: tabular-nums;
        }
        .scrollbar-thin::-webkit-scrollbar {
          height: 8px;
          width: 8px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: var(--color-border);
          border-radius: 20px;
          border: 2px solid var(--color-bg-elevated);
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: var(--color-text-muted);
        }
      `}</style>
    </div>
  );
}