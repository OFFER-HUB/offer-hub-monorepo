"use client";

import { useState, useEffect, useRef } from "react";
import { Copy, Check, Code2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { useTheme } from "@/components/providers/ThemeProvider";
import { logger } from "@/utils/logger";
import { highlightCache, escapeHtml } from "@/utils/shiki-highlight";

interface CodeBlockProps {
  code?: string;
  children?: string;
  language?: string;
  title?: string;
  filename?: string;
  highlightLines?: string;
  showLineNumbers?: boolean;
  className?: string;
  /**
   * Hide the header bar (language label + copy button). Used when an outer
   * component — e.g. CodeTabs — provides its own toolbar so the panel does
   * not render a second, redundant header.
   */
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

/** Parse Shiki-style line ranges such as "{1,3-5}" into line numbers. */
function parseHighlightedLines(value?: string): Set<number> {
  if (!value) return new Set();

  return new Set(
    value
      .replace(/[{}]/g, "")
      .split(",")
      .flatMap((part) => {
        const [start, end] = part.split("-").map(Number);
        if (!Number.isInteger(start)) return [];
        if (!Number.isInteger(end)) return [start];
        const lines: number[] = [];
        for (let line = Math.min(start, end); line <= Math.max(start, end); line += 1) {
          lines.push(line);
        }
        return lines;
      })
      .filter((line) => line > 0)
  );
}

export function CodeBlock({
  code: codeProp,
  children,
  language = "typescript",
  title,
  filename,
  highlightLines,
  showLineNumbers = false,
  className,
  isHeaderHidden = false,
}: CodeBlockProps) {
  const { resolvedTheme } = useTheme();
  const normalizedLang = LANGUAGE_ALIASES[language] || language;
  const shikiTheme = resolvedTheme === "dark" ? "github-dark" : "github-light";
  const [copied, setCopied] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const [highlightedCode, setHighlightedCode] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);

  const rawCode = (codeProp || children || "").trim();
  const cacheKey = `${shikiTheme}:${normalizedLang}:${rawCode}`;
  const highlightedLineNumbers = parseHighlightedLines(highlightLines);
  const hasLinePresentation = showLineNumbers || highlightedLineNumbers.size > 0;

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
            codeToHtml(rawCode, { lang: normalizedLang, theme: shikiTheme })
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
      { rootMargin: "200px" }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      isMounted = false;
      observer.disconnect();
    };
  }, [cacheKey, rawCode, normalizedLang, shikiTheme]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(rawCode);
      setCopied(true);
      setCopyStatus("Code copied to clipboard.");
      setTimeout(() => setCopied(false), 2000);
      setTimeout(() => setCopyStatus(""), 2500);
    } catch (err) {
      logger.error("Failed to copy!", err);
      setCopyStatus("Unable to copy code. Please select it and copy manually.");
    }
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative rounded-3xl overflow-hidden my-10 bg-bg-elevated shadow-neu-raised group transition-colors duration-300",
        className
      )}
    >
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
          <div>
            <span className="text-xs font-black uppercase tracking-[0.18em] font-mono text-content-secondary/70">
              {filename || title || language}
            </span>
            {(filename || title) && (
              <span className="block text-[10px] font-mono text-content-muted mt-0.5">
                {language}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? "Copied" : "Copy code"}
          className={cn(
            "relative flex items-center gap-2.5 px-4 py-2 min-h-11 rounded-xl text-xs font-black uppercase tracking-widest transition-[color,background-color,transform] duration-300",
            copied
              ? "text-white bg-theme-primary shadow-lg shadow-theme-primary/25"
              : "text-content-secondary bg-bg-base shadow-neu-raised-sm hover:text-content-primary hover:bg-theme-primary/10 active:scale-95"
          )}
        >
          <span className="flex items-center gap-2">
            {copied ? <Check size={14} className="stroke-[3.5]" /> : <Copy size={14} className="stroke-[2.5]" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </span>
        </button>
        <span role="status" aria-live="polite" className="sr-only">
          {copyStatus}
        </span>
      </div>

      {/* Code Area */}
      <div
        tabIndex={0}
        role="region"
        aria-label={`${language} code sample, scrollable horizontally`}
        className="p-8 overflow-x-auto text-[14px] leading-[1.8] min-h-[5rem] text-content-primary scrollbar-thin scrollbar-track-transparent selection:bg-theme-primary/20 selection:text-content-primary"
      >
        {hasLinePresentation ? (
          <pre className="text-content-secondary/70 font-mono font-medium">
            <code>
              {rawCode.split("\n").map((line, index) => {
                const lineNumber = index + 1;
                const highlighted = highlightedLineNumbers.has(lineNumber);
                return (
                  <span
                    key={lineNumber}
                    data-line={lineNumber}
                    className={cn(
                      "block min-w-max rounded-lg px-2 -mx-2",
                      highlighted && "bg-theme-primary/10 shadow-neu-sunken-subtle"
                    )}
                  >
                    {showLineNumbers && (
                      <span aria-hidden="true" className="inline-block w-10 select-none pr-4 text-right text-content-muted">
                        {lineNumber}
                      </span>
                    )}
                    {line || " "}
                  </span>
                );
              })}
            </code>
          </pre>
        ) : highlightedCode ? (
          <div
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
            className="shiki-container [&>pre]:!bg-transparent [&>pre]:!p-0 [&>pre]:!m-0 [&>pre]:!outline-none [&_.line-number]:text-content-muted"
          />
        ) : (
          <pre className="text-content-secondary/70 font-mono font-medium">
            <code>{rawCode}</code>
          </pre>
        )}
      </div>

      <style jsx global>{`
        .shiki-container pre {
          color: var(--color-text-primary);
        }
        .shiki-container .line {
          color: inherit;
        }
        .shiki-container .line-number,
        .shiki-container [data-line]::before {
          color: var(--color-text-muted);
          opacity: 0.85;
        }
        [data-line] {
          scroll-margin-inline: 1rem;
        }
        .shiki-container [data-line]::before {
          margin-right: 1rem;
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
