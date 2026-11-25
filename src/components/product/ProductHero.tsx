"use client";

import { Layers, Cpu, Workflow, Package, Milestone } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { PRODUCT_SCROLL_MARGIN_PX } from "@/lib/product-nav";

export function ProductHero() {
  const pillars = [
    {
      icon: Cpu,
      title: "Architecture",
      desc: "Non-custodial Soroban escrow & LATAM fiat corridors",
    },
    {
      icon: Workflow,
      title: "Orchestrator",
      desc: "State machine & multi-rail payment engine",
    },
    {
      icon: Package,
      title: "Templates",
      desc: "Pre-configured frontend boilerplate & SDK",
    },
    {
      icon: Milestone,
      title: "Roadmap",
      desc: "Testnet execution & SCF Build #44 delivery",
    },
  ];

  return (
    <PageHero
      id="product-overview"
      scrollMarginPx={PRODUCT_SCROLL_MARGIN_PX}
      eyebrowIcon={<Layers size={14} className="shrink-0 opacity-90" aria-hidden />}
      eyebrowText="Technical Overview"
      heading="Global Payment Orchestration"
      paragraph="Complete system design, NestJS payment orchestration, ready-to-ship marketplace templates, and unified engineering roadmap on Stellar."
      illustrationClassName="w-full max-w-4xl"
    >
      <div className="rounded-3xl bg-bg-elevated p-6 sm:p-8 shadow-neu-raised transition-shadow duration-300 hover:shadow-neu-raised-hover">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="flex flex-col items-center text-center gap-2.5 rounded-2xl bg-bg-base p-4 shadow-neu-sunken-subtle"
              >
                <div className="rounded-xl p-2 bg-bg-elevated shadow-neu-raised-sm">
                  <Icon size={18} className="text-theme-primary" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-content-primary">
                  {p.title}
                </span>
                <p className="text-xs text-content-secondary leading-snug">
                  {p.desc}
                </p>
              </div>
            );
          })}
        </div>
        <p className="mt-6 text-xs font-medium uppercase tracking-[0.12em] text-content-secondary text-center">
          Non-custodial · On-chain · LATAM-native
        </p>
      </div>
    </PageHero>
  );
}
