import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { LoadingBar } from "@/components/ui/LoadingBar";
import { buildPageMetadata } from "@/lib/seo";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  COMPARISON_FEATURES,
  PRICING_FAQS,
  PRICING_TIERS,
} from "./pricing.data";

export const metadata: Metadata = buildPageMetadata({
  title: "Pricing",
  description:
    "OFFER-HUB pricing: free open-source core for self-hosting, and enterprise support for custom architecture and deployment needs.",
  keywords: [
    "pricing",
    "open source",
    "self-hosting",
    "enterprise",
    "escrow pricing",
    "OFFER-HUB",
  ],
  path: "/pricing",
  ogImageAlt: "OFFER-HUB Pricing — open source core and enterprise support",
});

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <LoadingBar />
      <Navbar />

      <main className="flex-grow pt-28 pb-20">
        <section className="max-w-7xl mx-auto px-6 lg:px-8">
          <PageHeader
            align="center"
            className="mx-auto max-w-3xl"
            eyebrow="Pricing"
            title={<>Open by default. <br className="hidden md:block" /> Scalable by design.</>}
            lead="OFFER-HUB keeps core access free for builders and lets teams self-host without licensing fees. If you need enterprise-level support, our team can tailor a support model around your rollout."
          />

          {/* Two Tiers Grid (Stack on mobile, side-by-side on desktop/tablet, never orphan) */}
          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {PRICING_TIERS.map((tier) => {
              const Icon = tier.icon;

              return (
                <article
                  key={tier.id}
                  className="bg-bg-elevated shadow-neu-raised rounded-3xl p-8 md:p-10 hover:shadow-neu-raised-hover transition-shadow duration-200 flex flex-col group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-bg-base shadow-neu-sunken-subtle flex items-center justify-center mb-6 group-hover:shadow-neu-sunken transition-shadow duration-200">
                    <Icon className="w-7 h-7 text-theme-primary" aria-hidden="true" />
                  </div>

                  <h2 className="mt-5 text-2xl font-bold text-content-primary">{tier.name}</h2>
                  <p className="mt-2 text-sm font-semibold uppercase tracking-[0.12em] text-theme-primary">
                    {tier.priceLabel}
                  </p>
                  <p className="mt-4 text-sm md:text-base leading-relaxed text-content-secondary">
                    {tier.description}
                  </p>

                  <ul className="mt-6 space-y-3 flex-grow">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm text-content-primary">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-theme-primary shrink-0" aria-hidden="true" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 flex flex-col sm:flex-row gap-3">
                    <Button
                      href={tier.primaryCta.href}
                      target={tier.primaryCta.external ? "_blank" : undefined}
                      rel={tier.primaryCta.external ? "noopener noreferrer" : undefined}
                      variant={tier.primaryCta.variant}
                      className="flex-1"
                    >
                      <span>{tier.primaryCta.label}</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </Button>
                    {tier.secondaryCta && (
                      <Button
                        href={tier.secondaryCta.href}
                        target={tier.secondaryCta.external ? "_blank" : undefined}
                        rel={tier.secondaryCta.external ? "noopener noreferrer" : undefined}
                        variant={tier.secondaryCta.variant}
                        className="flex-1"
                      >
                        <span>{tier.secondaryCta.label}</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          {/* Plan Comparison Table */}
          <section className="mt-20 max-w-5xl mx-auto" aria-labelledby="comparison-heading">
            <div className="text-center mb-8">
              <h2 id="comparison-heading" className="text-2xl md:text-3xl font-bold tracking-tight text-content-primary">
                Plan Comparison
              </h2>
              <p className="mt-3 text-sm md:text-base text-content-secondary max-w-2xl mx-auto">
                Compare core features, deployment control, and support options across our tiers.
              </p>
            </div>

            <div className="rounded-2xl bg-bg-base p-1 md:p-2 shadow-neu-raised overflow-hidden">
              <div
                tabIndex={0}
                role="region"
                aria-label="Plan comparison table, scrollable horizontally"
                className="overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary rounded-xl"
              >
                <table className="w-full border-collapse text-left text-sm min-w-[600px]">
                  <thead className="bg-bg-sunken text-theme-primary shadow-neu-sunken-subtle">
                    <tr>
                      <th scope="col" className="py-4 px-6 font-bold text-xs uppercase tracking-[0.12em]">
                        Feature
                      </th>
                      <th scope="col" className="py-4 px-6 font-bold text-xs uppercase tracking-[0.12em]">
                        Open Source & Self-Hosted
                      </th>
                      <th scope="col" className="py-4 px-6 font-bold text-xs uppercase tracking-[0.12em]">
                        Enterprise Support
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)] bg-bg-base">
                    {COMPARISON_FEATURES.map((feature) => (
                      <tr
                        key={feature.name}
                        className="hover:bg-[color-mix(in_srgb,var(--color-bg-elevated)_40%,transparent)] transition-colors duration-150"
                      >
                        <th scope="row" className="py-4 px-6 font-semibold text-content-primary whitespace-nowrap">
                          {feature.name}
                        </th>
                        <td className="py-4 px-6 text-content-secondary">
                          {feature.openSource}
                        </td>
                        <td className="py-4 px-6 text-content-secondary">
                          {feature.enterprise}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* FAQ Cards */}
          <section className="mt-20 max-w-5xl mx-auto" aria-labelledby="faq-heading">
            <div className="text-center mb-8">
              <h2 id="faq-heading" className="text-2xl md:text-3xl font-bold tracking-tight text-content-primary">
                Frequently Asked Questions
              </h2>
              <p className="mt-3 text-sm md:text-base text-content-secondary max-w-2xl mx-auto">
                Essential questions about non-custodial escrow, network fees, and platform architecture.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {PRICING_FAQS.map((faq) => (
                <article
                  key={faq.question}
                  className="bg-bg-elevated shadow-neu-raised rounded-3xl p-6 md:p-8 flex flex-col hover:shadow-neu-raised-hover transition-shadow duration-200"
                >
                  <h3 className="text-lg font-bold text-content-primary mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-sm md:text-base text-content-secondary leading-relaxed">
                    {faq.answer}
                  </p>
                </article>
              ))}
            </div>
          </section>

          {/* Bottom Contact Channel Link (target ≥ 44px) */}
          <div className="mt-14 text-center">
            <p className="text-sm md:text-base text-content-secondary">
              Need help choosing the right setup? Reach us through our{" "}
              <Link
                href="/contact"
                className="inline-flex items-center justify-center min-h-[44px] px-3 py-2 rounded-xl text-theme-primary font-semibold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary"
              >
                contact channel
              </Link>{" "}
              and we can recommend a path based on your business stage.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
