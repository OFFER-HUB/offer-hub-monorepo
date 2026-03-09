"use client";

import { useState, useEffect, useRef } from "react";
import { Copy, Check, Code2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { useTheme } from "@/components/providers/ThemeProvider";

interface CodeBlockProps {
  code?: string;
  children?: string;
  language?: string;
  className?: string;
}

const LANGUAGE_ALIASES: Record<string, string> = {
  env: "bash",
  dotenv: "bash",
  sh: "bash",
  zsh: "bash",
  conf: "ini",
  config: "ini",
};

// Global cache — persists across renders and component instances
const highlightCache = new Map<string, string>();

function escapeHtml(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function CodeBlock({
  code: codeProp,
  children,
  language = "typescript",
  className
}: CodeBlockProps) {
  const { resolvedTheme } = useTheme();
  const normalizedLang = LANGUAGE_ALIASES[language] || language;
  const shikiTheme = resolvedTheme === "dark" ? "github-dark" : "github-light";
  const [copied, setCopied] = useState(false);
  const [highlightedCode, setHighlightedCode] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);

  const rawCode = (codeProp || children || "").trim();
  const cacheKey = `${shikiTheme}:${normalizedLang}:${rawCode}`;

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
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative rounded-3xl overflow-hidden my-10 border border-theme-border/40 bg-bg-elevated shadow-neu-raised-sm group transition-all duration-300 hover:border-theme-primary/30 hover:shadow-neu-raised-hover",
        className
      )}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-bg-sunken/55 border-b border-theme-border/45">
        <div className="flex items-center gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-bg-elevated border border-theme-border/50 shadow-neu-raised-sm transition-all duration-300 group-hover:bg-theme-primary/10 group-hover:border-theme-primary/30">
            <Code2 size={16} className="text-content-secondary group-hover:text-theme-primary" />
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-[0.18em] font-mono text-content-secondary/70">
              {language}
            </span>
            <div className="h-0.5 w-4 bg-theme-primary/50 rounded-full mt-0.5" />
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? "Copied" : "Copy code"}
          className={cn(
            "relative flex items-center gap-2.5 px-4 py-2 rounded-xl text-[10.5px] font-black uppercase tracking-widest transition-all duration-300",
            copied
              ? "text-white bg-theme-primary shadow-lg shadow-theme-primary/25"
              : "text-content-secondary bg-bg-elevated border border-theme-border/70 shadow-neu-raised-sm hover:text-content-primary hover:border-theme-primary/40 hover:bg-bg-sunken/40 active:scale-95"
          )}
        >
          <span className="flex items-center gap-2">
            {copied ? <Check size={14} className="stroke-[3.5]" /> : <Copy size={14} className="stroke-[2.5]" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </span>
        </button>
      </div>

      {/* Code Area */}
      <div className="p-8 overflow-x-auto text-[14px] leading-[1.8] min-h-[5rem] text-content-primary scrollbar-thin scrollbar-track-transparent selection:bg-theme-primary/20 selection:text-content-primary">
        {highlightedCode ? (
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
