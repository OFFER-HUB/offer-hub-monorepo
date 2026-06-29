"use client";

import { useState, useEffect, useRef } from "react";
import type { LucideIcon } from "lucide-react";
import { Copy, Check, ExternalLink, Code2 } from "lucide-react";
import { cn } from "@/lib/cn";

export interface CodeTab {
  id: string;
  label: string;
  lang: string;
  icon: LucideIcon;
  description: string;
  docHref: string;
  docLabel: string;
  code: string;
}

export interface SdkCard {
  method: string;
  label: string;
  detail: string;
}

export interface CodeIntegrationShowcaseProps {
  /** Trailing copy that follows the inline `@offerhub/sdk` code chip in the section header. */
  description: string;
  tabs: CodeTab[];
  sdkCards: SdkCard[];
}

const highlightCache = new Map<string, string>();

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function DocTooltip({ href, label }: { href: string; label: string }) {
  return (
    <div className="group relative inline-flex">
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        aria-label={`See full ${label}`}
        className={cn(
          "flex items-center gap-1.5 rounded-xl px-3 py-1.5",
          "text-[10px] font-bold uppercase tracking-widest text-content-muted",
          "transition-all duration-200",
          "hover:text-theme-primary hover:bg-theme-primary/10"
        )}
      >
        <ExternalLink size={11} />
        <span>Docs</span>
      </a>
      <span
        className={cn(
          "pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2",
          "whitespace-nowrap rounded-xl px-3 py-1.5",
          "text-[10px] font-semibold text-white",
          "opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        )}
        style={{
          background: "rgba(20,154,155,0.95)",
          boxShadow: "0 4px 12px rgba(20,154,155,0.35)",
        }}
      >
        See Full {label}
        <span
          className="absolute left-1/2 top-full -translate-x-1/2"
          style={{
            width: 0,
            height: 0,
            borderLeft: "5px solid transparent",
            borderRight: "5px solid transparent",
            borderTop: "5px solid rgba(20,154,155,0.95)",
          }}
        />
      </span>
    </div>
  );
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Copied to clipboard" : "Copy code"}
      className={cn(
        "relative flex items-center gap-2 rounded-xl px-3 py-1.5",
        "text-[10px] font-black uppercase tracking-widest",
        "transition-all duration-300",
        copied
          ? "text-white shadow-lg"
          : "text-content-secondary hover:text-content-primary"
      )}
      style={
        copied
          ? { background: "var(--color-primary)", boxShadow: "0 4px 12px rgba(20,154,155,0.4)" }
          : { background: "rgba(255,255,255,0.06)", backdropFilter: "blur(4px)" }
      }
    >
      <span className="flex items-center gap-1.5">
        {copied ? <Check size={12} className="stroke-[3]" /> : <Copy size={12} className="stroke-[2.5]" />}
        <span>{copied ? "Copied!" : "Copy"}</span>
      </span>
    </button>
  );
}

function CodePanel({ tab }: { tab: CodeTab }) {
  const [highlightedHtml, setHighlightedHtml] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cacheKey = `github-dark:${tab.lang}:${tab.code}`;
    const cached = highlightCache.get(cacheKey);
    if (cached) {
      setHighlightedHtml(cached);
      return;
    }

    let isMounted = true;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        observer.disconnect();

        import("shiki")
          .then(({ codeToHtml }) =>
            codeToHtml(tab.code, { lang: tab.lang, theme: "github-dark" })
          )
          .then((html) => {
            highlightCache.set(cacheKey, html);
            if (isMounted) setHighlightedHtml(html);
          })
          .catch(() => {
            const fallback = `<pre><code>${escapeHtml(tab.code)}</code></pre>`;
            highlightCache.set(cacheKey, fallback);
            if (isMounted) setHighlightedHtml(fallback);
          });
      },
      { rootMargin: "200px" }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => {
      isMounted = false;
      observer.disconnect();
    };
  }, [tab.code, tab.lang]);

  return (
    <div
      ref={containerRef}
      className="overflow-x-auto scrollbar-thin scrollbar-track-transparent p-6 font-mono text-[13px] leading-[1.85] min-h-[18rem]"
      style={{
        background: "rgba(26, 26, 27, 0.96)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      {highlightedHtml ? (
        <div
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          className={cn(
            "sdk-shiki",
            "[&>pre]:!bg-transparent [&>pre]:!p-0 [&>pre]:!m-0",
            "[&>pre]:font-mono [&>pre]:text-[13px] [&>pre]:leading-[1.85]"
          )}
        />
      ) : (
        <pre className="text-[#8b949e] whitespace-pre-wrap break-words">
          <code className="font-mono">{tab.code}</code>
        </pre>
      )}
    </div>
  );
}

export default function CodeIntegrationShowcase({
  description,
  tabs,
  sdkCards,
}: CodeIntegrationShowcaseProps) {
  const [activeTabId, setActiveTabId] = useState<string>(tabs[0]!.id);
  const currentTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0]!;

  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-bg-base px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-theme-primary shadow-neu-sunken mb-6">
            <Code2 size={14} />
            Developer Hub
          </div>
          <h2 className="text-4xl font-semibold leading-tight text-content-primary md:text-5xl">
            Integrate in minutes,
            <br className="hidden md:block" /> not weeks.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-content-secondary">
            The{" "}
            <code className="rounded-md bg-bg-sunken px-1.5 py-0.5 font-mono text-[0.85em] text-theme-primary">
              @offerhub/sdk
            </code>{" "}
            {description}
          </p>
        </div>

        <div
          className="rounded-[2.5rem] bg-bg-elevated blueprint-layer"
          style={{
            boxShadow: "12px 12px 24px var(--shadow-dark), -12px -12px 24px var(--shadow-light)",
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-t-[2.5rem] bg-bg-sunken px-6 py-4 shadow-neu-sunken-subtle">
            <div className="flex items-center gap-1">
              {tabs.map((tab) => {
                const TabIcon = tab.icon;
                const isActive = tab.id === activeTabId;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTabId(tab.id)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-xl px-4 py-2",
                      "text-[11px] font-bold uppercase tracking-widest font-mono",
                      "transition-all duration-200 focus:outline-none",
                      isActive
                        ? "text-theme-primary"
                        : "text-content-muted hover:text-content-secondary"
                    )}
                    style={
                      isActive
                        ? {
                            background: "var(--color-bg-base)",
                            boxShadow: "4px 4px 8px var(--shadow-dark), -4px -4px 8px var(--shadow-light)",
                          }
                        : {}
                    }
                    role="tab"
                    aria-selected={isActive}
                  >
                    <TabIcon size={12} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <DocTooltip href={currentTab.docHref} label={currentTab.docLabel} />
              <CopyButton code={currentTab.code} />
            </div>
          </div>

          <div className="relative overflow-hidden rounded-b-[2.5rem]">
            <div
              className="flex items-center gap-3 border-b px-6 py-3"
              style={{
                background: "rgba(26, 26, 27, 0.80)",
                borderColor: "rgba(255,255,255,0.06)",
              }}
            >
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8b949e]">
                {currentTab.description}
              </span>
            </div>

            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={cn(
                  "transition-opacity duration-300",
                  tab.id === activeTabId ? "block opacity-100" : "hidden opacity-0"
                )}
              >
                <CodePanel tab={tab} />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {sdkCards.map((item) => (
            <div
              key={item.method}
              className="rounded-[1.5rem] bg-bg-elevated p-5 blueprint-layer overflow-visible"
              style={{
                boxShadow: "8px 8px 16px var(--shadow-dark), -8px -8px 16px var(--shadow-light)",
              }}
            >
              <div className="mb-3 inline-flex rounded-full bg-theme-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-theme-primary">
                SDK
              </div>
              <code className="block font-mono text-xs font-semibold text-theme-primary mb-2">
                {item.method}
              </code>
              <p className="text-xs font-semibold text-content-muted mb-1">{item.label}</p>
              <p className="text-xs leading-relaxed text-content-secondary">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        .sdk-shiki pre {
          font-family: var(--font-jetbrains-mono), "JetBrains Mono", "Fira Code", monospace !important;
          font-size: 13px !important;
        }
      `}</style>
    </section>
  );
}
