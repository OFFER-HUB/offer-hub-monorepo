import { ArrowUpRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";

import type { UseCaseHeroData } from "../types";
import { CardEyebrow, InsetCard } from "./CardPrimitives";

export type UseCaseHeroProps = UseCaseHeroData;

/**
 * Flat, solid-surface hero shared by every use-case vertical.
 *
 * Secondary text only sits on `bg-bg-elevated`; copy on the inset `bg-bg-base`
 * cards uses `text-content-primary`, keeping every pair at or above WCAG AA
 * 4.5:1 in both themes.
 */
export function UseCaseHero({
  badgeLabel,
  headline,
  subheadline,
  docsUrl,
  ctaLabel = "Technical Doc",
  stats,
}: UseCaseHeroProps) {
  return (
    <section id="overview" className="scroll-mt-32">
      <div className="grid min-w-0 gap-8 overflow-hidden rounded-3xl bg-bg-elevated p-6 shadow-neu-raised sm:p-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-center lg:gap-12 lg:p-12">
        <div className="flex min-w-0 flex-col gap-5">
          <p className="inline-flex max-w-full items-center gap-2.5 self-start rounded-full bg-bg-base px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-content-primary shadow-neu-sunken-subtle">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full bg-theme-primary"
              aria-hidden="true"
            />
            <span className="min-w-0 break-words">{badgeLabel}</span>
          </p>

          <h1 className="break-words text-3xl font-extrabold leading-tight tracking-tight text-content-primary sm:text-4xl lg:text-[2.75rem]">
            {headline}
          </h1>

          <p className="max-w-2xl text-lg leading-relaxed text-content-secondary">
            {subheadline}
          </p>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              href={docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              leadingIcon={<FileText size={16} aria-hidden="true" />}
              trailingIcon={<ArrowUpRight size={15} aria-hidden="true" />}
            >
              {ctaLabel}
            </Button>
            <Button
              href="#escrow-flow"
              variant="secondary"
            >
              See the escrow flow
            </Button>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          <CardEyebrow>At a glance</CardEyebrow>

          {stats.map((stat) => (
            <InsetCard key={stat.label} as="article">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-content-primary">
                {stat.label}
              </p>
              <p className="mt-1 break-words text-base font-bold leading-snug text-content-primary">
                {stat.value}
              </p>
              <p className="mt-1 break-words text-xs font-medium text-content-primary">
                {stat.accent}
              </p>
            </InsetCard>
          ))}
        </div>
      </div>
    </section>
  );
}
