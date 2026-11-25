"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, ExternalLink } from "lucide-react";

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
import { BentoCard, CardEyebrow, InsetCard } from "./shared/CardPrimitives";
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
      className="overflow-x-auto rounded-2xl bg-bg-sunken p-2 shadow-neu-sunken-subtle"
    >
      <div
        role="tablist"
        aria-label="Use case verticals"
        className="mx-auto flex w-max gap-2"
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
                "flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-bold text-content-primary",
                "transition-shadow duration-200 ease-out",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-sunken",
                isActive
                  ? "bg-bg-base shadow-neu-sunken"
                  : "hover:bg-bg-base hover:shadow-neu-sunken-subtle",
              )}
            >
              <Icon size={16} className="shrink-0" aria-hidden="true" />
              {useCase.label}
            </Link>
          );
        })}
      </div>
    </nav>
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
            <InsetCard key={feature.title} as="li" className="flex gap-3">
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
            </InsetCard>
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
    <BentoCard id="escrow-flow" className={className}>
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
      <CardEyebrow>Sourced metrics</CardEyebrow>
      <h2 className="mt-4 text-2xl font-bold leading-tight text-content-primary">
        Network facts, with citations
      </h2>

      <div className="mt-6 grid gap-3">
        {metrics.map((metric) => (
          <InsetCard key={metric.id} as="article">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-content-primary">
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
          </InsetCard>
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
      <CardEyebrow>Developer quickstart</CardEyebrow>
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
          <InsetCard key={card.method} as="li">
            <code className="block break-words font-mono text-xs font-semibold text-content-primary">
              {card.method}
            </code>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-content-primary">
              {card.label}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-content-primary">
              {card.detail}
            </p>
          </InsetCard>
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

      <main className="mx-auto flex w-full max-w-7xl min-w-0 flex-col gap-6 px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <VerticalTabs activeId={vertical} />

        <div
          id="use-case-panel"
          role="tabpanel"
          aria-labelledby={`use-case-tab-${vertical}`}
          className="flex min-w-0 flex-col gap-6"
        >
          <UseCaseHero {...data.hero} />

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
      </main>

      <Footer />
    </div>
  );
}
