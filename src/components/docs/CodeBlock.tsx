"use client";

import { useState, useEffect, useRef } from "react";
import { Copy, Check, Code2 } from "lucide-react";
import { cn } from "@/lib/cn";

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

export function CodeBlock({
  code: codeProp,
  children,
  language = "typescript",
  className
}: CodeBlockProps) {
  const normalizedLang = LANGUAGE_ALIASES[language] || language;
  const [copied, setCopied] = useState(false);
  const [highlightedCode, setHighlightedCode] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);

  const rawCode = (codeProp || children || "").trim();
  const cacheKey = `${normalizedLang}:${rawCode}`;

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
            codeToHtml(rawCode, { lang: normalizedLang, theme: "github-light" })
              .then((html) => {
                highlightCache.set(cacheKey, html);
                if (isMounted) setHighlightedCode(html);
              })
              .catch(() => {
                const fallback = `<pre><code>${rawCode}</code></pre>`;
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
  }, [cacheKey, rawCode, normalizedLang]);

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
        "relative rounded-3xl overflow-hidden my-10 border border-[#D1D5DB]/30 shadow-[0_15px_40px_rgba(0,0,0,0.02)] bg-white group transition-all duration-300 hover:shadow-xl hover:border-[#D1D5DB]/50",
        className
      )}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#F9FAFB] border-b border-[#D1D5DB]/30">
        <div className="flex items-center gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-[#D1D5DB]/40 shadow-sm transition-all duration-300 group-hover:bg-[#149A9B]/5 group-hover:border-[#149A9B]/30">
            <Code2 size={16} className="text-[#6D758F] group-hover:text-[#149A9B]" />
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-[0.18em] font-mono text-[#6D758F]/50">
              {language}
            </span>
            <div className="h-0.5 w-4 bg-[#149A9B]/40 rounded-full mt-0.5" />
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? "Copied" : "Copy code"}
          className={cn(
            "relative flex items-center gap-2.5 px-4 py-2 rounded-xl text-[10.5px] font-black uppercase tracking-widest transition-all duration-300",
            copied
              ? "text-white bg-[#149A9B] shadow-lg shadow-[#149A9B]/20"
              : "text-[#6D758F] bg-white border border-[#D1D5DB]/50 shadow-sm hover:text-[#19213D] hover:border-[#D1D5DB]/80 hover:shadow-md active:scale-95"
          )}
        >
          <span className="flex items-center gap-2">
            {copied ? <Check size={14} className="stroke-[3.5]" /> : <Copy size={14} className="stroke-[2.5]" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </span>
        </button>
      </div>

      {/* Code Area */}
      <div className="p-8 overflow-x-auto text-[14px] leading-[1.8] min-h-[5rem] scrollbar-thin scrollbar-thumb-[#D1D5DB] scrollbar-track-transparent selection:bg-[#149A9B]/10 selection:text-[#149A9B]">
        {highlightedCode ? (
          <div
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
            className="shiki-container [&>pre]:!bg-transparent [&>pre]:!p-0 [&>pre]:!m-0 [&>pre]:!outline-none"
          />
        ) : (
          <pre className="text-[#6D758F]/40 font-mono font-medium">
            <code>{rawCode}</code>
          </pre>
        )}
      </div>

      <style jsx global>{`
        .shiki-container pre {
          color: #19213D;
        }
        .scrollbar-thin::-webkit-scrollbar {
          height: 8px;
          width: 8px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #E5E7EB;
          border-radius: 20px;
          border: 2px solid white;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #D1D5DB;
        }
      `}</style>
    </div>
  );
}
