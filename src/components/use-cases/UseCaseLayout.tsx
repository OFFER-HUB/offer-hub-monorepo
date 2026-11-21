"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  ExternalLink,
  Sparkles,
} from "lucide-react";

import { CodeTabs } from "@/components/docs/CodeTabs";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { cn } from "@/lib/cn";

import {
  USE_CASES,
  USE_CASE_DATA,
  getSourcedMetrics,
  isUseCaseId,
} from "./data";
import { EscrowFlowDiagram } from "./shared/EscrowFlowDiagram";
import { UseCaseHero } from "./shared/UseCaseHero";
import type {
  UseCaseData,
  UseCaseId,
  UseCaseMetric,
} from "./types";

function VerticalTabs({ activeId }: { activeId: UseCaseId }) {
  return (
    <nav
      aria-label="Use case verticals"
      className="mx-auto w-full max-w-7xl min-w-0 px-4 pt-28 sm:px-6 lg:px-8"
    >
      <div className="rounded-2xl bg-bg-sunken p-2 shadow-neu-sunken-subtle">
        <div
          role="tablist"
          aria-label="Use case verticals"
          className="flex flex-wrap justify-center gap-2"
        >
          {USE_CASES.map((useCase) => {
            const isActive = useCase.id === activeId;
            const Icon = useCase.icon;

            return (
              <Link
                key={useCase.id}
                id={`use-case-tab-${useCase.id}`}
                href={`/use-cases/${useCase.id}`}
                role="tab"
                aria-selected={isActive}
                aria-controls="use-case-panel"
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex min-w-0 min-h-11 items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-content-primary",
                  "transition-shadow duration-200 ease-out",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-sunken",
                  isActive
                    ? "bg-bg-base shadow-neu-sunken"
                    : "hover:bg-bg-base hover:shadow-neu-sunken-subtle",
                )}
              >
                <Icon size={16} className="shrink-0" />
                <span className="break-words">{useCase.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

function BentoCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "min-w-0 rounded-3xl bg-bg-elevated p-6 shadow-neu-raised sm:p-8",
        className,
      )}
    >
      {children}
    </section>
  );
}

function CardEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-content-secondary">
      <Sparkles size={14} className="shrink-0 text-theme-primary" />
      {children}
    </p>
  );
}

function SummaryCard({
  data,
  className,
}: {
  data: UseCaseData;
  className?: string;
}) {
  return (
    <BentoCard className={className}>
      <CardEyebrow>{data.summary.eyebrow}</CardEyebrow>
      <h2 className="mt-4 text-2xl font-bold leading-tight text-content-primary">
        {data.summary.title}
      </h2>
      <p className="mt-3 text-base leading-relaxed text-content-secondary">
        {data.summary.body}
      </p>

      <ul className="mt-6 space-y-3">
        {data.features.map((feature) => {
          const Icon = feature.icon;
          return (
            <li
              key={feature.title}
              className="flex min-w-0 gap-3 rounded-2xl bg-bg-base p-4 shadow-neu-sunken-subtle"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bg-elevated text-content-primary shadow-neu-raised-sm">
                <Icon size={18} />
              </span>
              <span className="min-w-0">
                <span className="block break-words text-sm font-bold text-content-primary">
                  {feature.title}
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-content-primary">
                  {feature.body}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </BentoCard>
  );
}

function FlowCard({
  data,
  className,
}: {
  data: UseCaseData;
  className?: string;
}) {
  return (
    <BentoCard className={className}>
      <CardEyebrow>Escrow flow</CardEyebrow>
      <h2 className="mt-4 text-2xl font-bold leading-tight text-content-primary">
        From agreement to release
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-content-secondary">
        Hover or focus a step to see the API call behind it.
      </p>

      <div className="mt-6">
        <EscrowFlowDiagram steps={data.flow} />
      </div>
    </BentoCard>
  );
}

function MetricsCard({
  metrics,
  className,
}: {
  metrics: UseCaseMetric[];
  className?: string;
}) {
  return (
    <BentoCard className={className}>
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-content-secondary">
        <BarChart3 size={14} className="shrink-0 text-theme-primary" />
        Sourced metrics
      </p>
      <h2 className="mt-4 text-2xl font-bold leading-tight text-content-primary">
        Network facts, with citations
      </h2>

      <div className="mt-6 grid gap-3">
        {metrics.map((metric) => (
          <article
            key={metric.id}
            className="min-w-0 rounded-2xl bg-bg-base p-4 shadow-neu-sunken-subtle"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-content-primary">
              {metric.label}
            </p>
            <p className="mt-2 break-words text-3xl font-bold leading-none text-content-primary">
              {metric.value}
              {metric.unit && (
                <span className="ml-1.5 text-sm font-semibold text-content-primary">
                  {metric.unit}
                </span>
              )}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-content-primary">
              {metric.description}
            </p>

            {metric.source && (
              <a
                href={metric.source.url}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-xs font-semibold text-content-primary underline underline-offset-4 transition-colors duration-200 hover:text-theme-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base"
              >
                <ExternalLink size={12} className="shrink-0" />
                Source: {metric.source.label}
              </a>
            )}
          </article>
        ))}
      </div>
    </BentoCard>
  );
}

function CodeCard({
  data,
  className,
}: {
  data: UseCaseData;
  className?: string;
}) {
  const primaryDoc = data.code.tabs[0];

  return (
    <BentoCard className={className}>
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-content-secondary">
        <CheckCircle2 size={14} className="shrink-0 text-theme-primary" />
        Developer quickstart
      </p>
      <h2 className="mt-4 text-2xl font-bold leading-tight text-content-primary">
        {data.code.heading}
      </h2>
      <p className="mt-3 max-w-3xl text-base leading-relaxed text-content-secondary">
        {data.code.description}
      </p>

      {primaryDoc && (
        <a
          href={primaryDoc.docHref}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex min-h-11 items-center gap-1.5 text-xs font-semibold text-content-primary underline underline-offset-4 transition-colors duration-200 hover:text-theme-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-elevated"
        >
          <ArrowUpRight size={12} className="shrink-0" />
          Read the {primaryDoc.docLabel}
        </a>
      )}

      <CodeTabs
        label={`${data.label} SDK examples`}
        tabs={data.code.tabs.map((tab) => ({
          id: tab.id,
          label: tab.label,
          language: tab.language,
          code: tab.code,
        }))}
        className="my-6"
      />

      <ul className="grid gap-3 sm:grid-cols-3">
        {data.code.sdkCards.map((card) => (
          <li
            key={card.method}
            className="min-w-0 rounded-2xl bg-bg-base p-4 shadow-neu-sunken-subtle"
          >
            <code className="block break-words font-mono text-xs font-semibold text-content-primary">
              {card.method}
            </code>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-content-secondary">
              {card.label}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-content-primary">
              {card.detail}
            </p>
          </li>
        ))}
      </ul>
    </BentoCard>
  );
}

export function UseCaseLayout({ vertical }: { vertical: UseCaseId }) {
  const router = useRouter();
  const data = USE_CASE_DATA[vertical];
  const sourcedMetrics = getSourcedMetrics(data.metrics);

  // Upgrade legacy `/use-cases?vertical=dao-payroll` links to the shareable
  // path URL without a server round-trip.
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get(
      "vertical",
    );

    if (isUseCaseId(requested) && requested !== vertical) {
      router.replace(`/use-cases/${requested}${window.location.hash}`);
    }
  }, [router, vertical]);

  return (
    <div className="min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-transparent">
      <Navbar />

      <VerticalTabs activeId={vertical} />

      <main className="pb-20">
        <div
          id="use-case-panel"
          role="tabpanel"
          aria-labelledby={`use-case-tab-${vertical}`}
        >
          <UseCaseHero {...data.hero} />

          <div className="mx-auto mt-10 w-full max-w-7xl min-w-0 px-4 sm:px-6 lg:px-8">
            <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-6">
              <SummaryCard data={data} className="lg:col-span-4" />
              <FlowCard data={data} className="lg:col-span-2" />
              {sourcedMetrics && (
                <MetricsCard
                  metrics={sourcedMetrics}
                  className="lg:col-span-2"
                />
              )}
              <CodeCard
                data={data}
                className={sourcedMetrics ? "lg:col-span-4" : "lg:col-span-6"}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
