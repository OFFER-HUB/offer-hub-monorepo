import { ArrowUpRight, FileText, Sparkles } from "lucide-react";

import type { UseCaseHeroData } from "../types";

export type UseCaseHeroProps = UseCaseHeroData;

/**
 * Calm, solid-surface hero shared by every use-case vertical.
 *
 * The copy sits on `bg-bg-elevated` (no animated shapes, gradients, or
 * network blobs behind it) so the text/background pairs stay at or above the
 * WCAG AA 4.5:1 contrast target in both themes.
 */
export function UseCaseHero({
  badgeLabel,
  headline,
  subheadline,
  docsUrl,
  ctaLabel = "Technical Doc",
  footerIcon: FooterIcon,
  footerLabel,
  stats,
}: UseCaseHeroProps) {
  return (
    <section
      id="overview"
      className="scroll-mt-32 px-4 pt-10 sm:px-6 lg:px-8"
    >
      <div className="mx-auto w-full max-w-7xl min-w-0 overflow-hidden rounded-3xl bg-bg-elevated p-6 shadow-neu-raised sm:p-8 md:p-12">
        <div className="grid min-w-0 gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-center">
          <div className="min-w-0">
            <div className="inline-flex max-w-full flex-wrap items-center gap-2.5 rounded-full bg-bg-base px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-content-primary shadow-neu-sunken-subtle">
              <span
                className="h-2.5 w-2.5 rounded-full bg-theme-primary"
                aria-hidden="true"
              />
              <span className="min-w-0 break-words">{badgeLabel}</span>
            </div>

            <h1 className="mt-6 max-w-full break-words text-4xl font-bold leading-tight tracking-tight text-content-primary md:text-[2.5rem]">
              {headline}
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-content-secondary">
              {subheadline}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href={docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold btn-neumorphic-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-elevated"
              >
                <FileText size={16} />
                {ctaLabel}
                <ArrowUpRight size={15} />
              </a>

              <div className="inline-flex min-h-11 max-w-full min-w-0 flex-wrap items-center gap-2 rounded-xl bg-bg-base px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-content-primary shadow-neu-sunken-subtle">
                <FooterIcon size={14} className="shrink-0 text-theme-primary" />
                <span className="min-w-0 break-words">{footerLabel}</span>
              </div>
            </div>
          </div>

          <div className="grid min-w-0 gap-3">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-content-secondary">
              <Sparkles size={14} className="text-theme-primary" />
              At a glance
            </p>

            {stats.map((stat) => (
              <article
                key={stat.label}
                className="min-w-0 rounded-2xl bg-bg-base p-4 shadow-neu-sunken-subtle"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-content-primary">
                  {stat.label}
                </p>
                <p className="mt-1 break-words text-base font-bold leading-snug text-content-primary">
                  {stat.value}
                </p>
                <p className="mt-1 break-words text-xs font-medium text-content-primary">
                  {stat.accent}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
