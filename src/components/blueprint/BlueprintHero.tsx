"use client";

import { Layers } from "lucide-react";
import PageHero from "@/components/shared/PageHero";
import { BLUEPRINT_SCROLL_MARGIN_PX } from "@/lib/blueprint-nav";

export default function BlueprintHero() {
  return (
    <PageHero
      id="vision"
      scrollMarginPx={BLUEPRINT_SCROLL_MARGIN_PX}
      eyebrowIcon={<Layers size={14} className="shrink-0 opacity-90" aria-hidden />}
      eyebrowText="Strategic roadmap"
      heading="The Blueprint of Global Orchestration"
      paragraph="Mapping the technical evolution of the OFFER-HUB ecosystem, from core engine to global marketplace templates."
      illustrationClassName="w-full max-w-3xl"
    >
      {/* Single raised surface — same vocabulary as Use Cases feature cards */}
      <div className="rounded-[2rem] bg-bg-elevated p-8 md:p-10 shadow-neu-raised transition-shadow duration-300 hover:shadow-neu-raised-hover">
        <div className="grid grid-cols-3 gap-4 md:gap-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-full aspect-[4/3] rounded-2xl bg-bg-base shadow-neu-sunken-subtle" />
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-content-muted">
              Core
            </span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-full aspect-[4/3] rounded-2xl bg-bg-base shadow-neu-raised-sm" />
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-content-muted">
              Engine
            </span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-full aspect-[4/3] rounded-2xl bg-bg-base shadow-neu-sunken-subtle" />
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-content-muted">
              Templates
            </span>
          </div>
        </div>
        <p className="mt-8 text-xs font-medium uppercase tracking-[0.2em] text-content-secondary">
          Ecosystem structure
        </p>
      </div>
    </PageHero>
  );
}
