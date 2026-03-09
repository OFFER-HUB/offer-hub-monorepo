import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Building2, Cloud, Code2 } from "lucide-react";
import type { ComponentType } from "react";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "Pricing | OFFER-HUB",
  description:
    "OFFER-HUB pricing: open source core for free, free self-hosting, and enterprise support available on request.",
};

type PricingTier = {
  name: string;
  priceLabel: string;
  description: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  ctaStyle: "primary" | "secondary";
  external?: boolean;
  icon: ComponentType<{ className?: string }>;
};

const tiers: PricingTier[] = [
  {
    name: "Open Source",
    priceLabel: "Free forever",
    description:
      "Build with the full OFFER-HUB core codebase under an open-source model designed for developer trust and transparency.",
    features: [
      "Core platform access at no cost",
      "Community-driven development and feedback",
      "Public issue tracking and roadmap visibility",
      "Ideal for prototypes, pilots, and technical evaluation",
    ],
    ctaLabel: "View on GitHub",
    ctaHref: "https://github.com/OFFER-HUB/offer-hub-monorepo",
    ctaStyle: "secondary",
    external: true,
    icon: Code2,
  },
  {
    name: "Self-Hosted",
    priceLabel: "Free",
    description:
      "Deploy OFFER-HUB on your own infrastructure and keep full control of runtime, data boundaries, and security operations.",
    features: [
      "No platform licensing cost",
      "Run in your cloud or on-prem environment",
      "Own your deployment architecture and update cadence",
      "Best for teams with DevOps and compliance requirements",
    ],
    ctaLabel: "Start Self-Hosting",
    ctaHref: "/docs/getting-started",
    ctaStyle: "primary",
    icon: Cloud,
  },
  {
    name: "Enterprise",
    priceLabel: "Contact us",
    description:
      "For businesses that need prioritized guidance, strategic architecture support, and coordinated rollout assistance.",
    features: [
      "Implementation advisory and onboarding support",
      "Architecture and integration consultations",
      "Priority troubleshooting and escalation channel",
      "Custom support scope based on your business needs",
    ],
    ctaLabel: "Talk to Sales",
    ctaHref: "/contact",
    ctaStyle: "secondary",
    icon: Building2,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <Navbar />

      <main className="flex-grow pt-28 pb-20">
        <section className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto flex flex-col items-center">
            <div className="px-5 py-2 rounded-full text-xs font-bold uppercase tracking-[0.2em] mb-8 bg-bg-base shadow-neu-raised text-theme-primary">
              Pricing
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-8 text-content-primary">
              Open by default. <br className="hidden md:block" /> Scalable by design.
            </h1>
            <p className="text-lg md:text-xl font-medium leading-relaxed text-content-secondary">
              OFFER-HUB keeps core access free for builders and lets teams self-host without
              licensing fees. If you need enterprise-level support, our team can tailor a
              support model around your rollout.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tiers.map((tier) => {
              const Icon = tier.icon;
              const ctaClassName =
                tier.ctaStyle === "primary"
                  ? "btn-neumorphic-primary"
                  : "bg-bg-base shadow-neu-raised text-theme-primary";

              return (
                <article
                  key={tier.name}
                  className="bg-bg-elevated shadow-neu-raised rounded-[2.5rem] p-10 hover:shadow-neu-raised-hover transition-all duration-[400ms] ease-out flex flex-col group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-bg-base shadow-neu-sunken-subtle flex items-center justify-center mb-2 group-hover:shadow-neu-sunken transition-all duration-300">
                    <Icon className="w-7 h-7 text-theme-primary" />
                  </div>

                  <h2 className="mt-5 text-2xl font-bold text-content-primary">{tier.name}</h2>
                  <p className="mt-2 text-sm font-semibold uppercase tracking-[0.22em] text-theme-primary">
                    {tier.priceLabel}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-content-secondary">{tier.description}</p>

                  <ul className="mt-6 space-y-3 flex-grow">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-content-primary">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-theme-primary shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={tier.ctaHref}
                    target={tier.external ? "_blank" : undefined}
                    rel={tier.external ? "noopener noreferrer" : undefined}
                    className={`mt-8 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold ${ctaClassName}`}
                  >
                    <span>{tier.ctaLabel}</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </article>
              );
            })}
          </div>

          <p className="mt-10 text-center text-sm text-content-secondary">
            Need help choosing the right setup? Reach us through our
            {" "}
            <Link href="/contact" className="text-theme-primary font-semibold hover:underline">
              contact channel
            </Link>
            {" "}
            and we can recommend a path based on your business stage.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
