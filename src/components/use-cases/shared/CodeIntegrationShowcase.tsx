"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { ExternalLink, Code2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { CodeBlock } from "@/components/docs/CodeBlock";

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

function DocTooltip({ href, label }: { href: string; label: string }) {
  return (
    <div className="group relative inline-flex">
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        aria-label={`See full ${label}`}
        className={cn(
          "inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 py-1.5",
          "text-xs font-semibold uppercase tracking-widest text-content-secondary",
          "transition-colors duration-200 hover:text-theme-primary hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary",
        )}
      >
        <ExternalLink size={12} aria-hidden="true" />
        <span>Docs</span>
      </a>
      <span
        className={cn(
          "pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2",
          "whitespace-nowrap rounded-xl px-3 py-1.5",
          "bg-bg-elevated text-xs font-semibold text-content-primary shadow-neu-raised-sm",
          "opacity-0 transition-opacity duration-200 group-hover:opacity-100",
        )}
      >
        See Full {label}
      </span>
    </div>
  );
}

/** Marketing showcase using the same CodeBlock as docs and the API explorer. */
export function CodeIntegrationShowcase({
  description,
  tabs,
  sdkCards,
}: CodeIntegrationShowcaseProps) {
  const [activeTabId, setActiveTabId] = useState<string>(tabs[0]?.id ?? "");
  const activeIndex = Math.max(
    tabs.findIndex((tab) => tab.id === activeTabId),
    0,
  );
  const currentTab = tabs[activeIndex];

  if (!currentTab) return null;

  return (
    <section className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-bg-base px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-theme-primary shadow-neu-sunken mb-6">
            <Code2 size={14} aria-hidden="true" />
            Developer Hub
          </div>
          <h2 className="text-2xl font-bold leading-tight text-content-primary md:text-3xl">
            Integrate in minutes,
            <br className="hidden md:block" /> not weeks.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-content-secondary">
            The{" "}
            <code className="rounded-xl bg-bg-sunken px-1.5 py-0.5 font-mono text-[0.85em] text-theme-primary">
              @offerhub/sdk
            </code>{" "}
            {description}
          </p>
        </div>

        <div className="rounded-3xl bg-bg-elevated p-4 shadow-neu-raised sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-content-secondary">
              {currentTab.description}
            </p>
            <DocTooltip href={currentTab.docHref} label={currentTab.docLabel} />
          </div>

          <CodeBlock
            tabs={tabs.map((tab) => {
              const TabIcon = tab.icon;
              return {
                id: tab.id,
                label: (
                  <>
                    <TabIcon size={12} aria-hidden="true" />
                    <span>{tab.label}</span>
                  </>
                ),
                code: tab.code,
                language: tab.lang,
                title: tab.description,
              };
            })}
            activeIndex={activeIndex}
            onTabChange={(index) => setActiveTabId(tabs[index]?.id ?? "")}
            label="SDK language"
            className="my-0"
          />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {sdkCards.map((item) => (
            <div
              key={item.method}
              className="rounded-2xl bg-bg-elevated p-5 shadow-neu-raised"
            >
              <div className="mb-3 inline-flex rounded-full bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-theme-primary">
                SDK
              </div>
              <code className="mb-2 block font-mono text-xs font-semibold text-theme-primary">
                {item.method}
              </code>
              <p className="mb-1 text-xs font-semibold text-content-muted">
                {item.label}
              </p>
              <p className="text-xs leading-relaxed text-content-secondary">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
