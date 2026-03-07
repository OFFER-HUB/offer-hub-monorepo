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
            <div
              className="px-5 py-2 rounded-full text-xs font-bold uppercase tracking-[0.2em] mb-8 shadow-[inset_2px_2px_5px_rgba(255,255,255,0.8),inset_-2px_-2px_5px_rgba(0,0,0,0.05),4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]"
              style={{ color: "#149A9B", background: "#F1F3F7" }}
            >
              Pricing
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-8" style={{ color: "#19213D" }}>
              Open by default. <br className="hidden md:block" /> Scalable by design.
            </h1>
            <p className="text-lg md:text-xl font-medium leading-relaxed" style={{ color: "#6D758F" }}>
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
                  : "btn-neumorphic-secondary text-[#149A9B]";

              return (
                <article
                  key={tier.name}
                  className="rounded-[2.5rem] p-10 bg-[#F1F3F7] shadow-raised hover:shadow-raised-hover transition-all duration-[400ms] ease-out flex flex-col group"
                >
                  <div className="w-16 h-16 rounded-2xl shadow-sunken-subtle bg-[#F1F3F7] flex items-center justify-center mb-2 group-hover:shadow-sunken transition-all duration-300">
                    <Icon className="w-7 h-7 text-[#149A9B]" />
                  </div>

                  <h2 className="mt-5 text-2xl font-bold text-[#19213D]">{tier.name}</h2>
                  <p className="mt-2 text-sm font-semibold uppercase tracking-[0.22em] text-[#149A9B]">
                    {tier.priceLabel}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-[#6D758F]">{tier.description}</p>

                  <ul className="mt-6 space-y-3 flex-grow">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-[#19213D]">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#149A9B] shrink-0" />
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

          <p className="mt-10 text-center text-sm text-[#6D758F]">
            Need help choosing the right setup? Reach us through our
            {" "}
            <Link href="/contact" className="text-[#149A9B] font-semibold hover:underline">
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
