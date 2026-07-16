import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import LoadingBar from "@/components/ui/LoadingBar";

import SectionNav from "@/components/shared/SectionNav";
import {
  BLUEPRINT_SECTIONS,
  BLUEPRINT_SCROLL_MARGIN_PX,
} from "@/lib/blueprint-nav";
import BlueprintHero from "@/components/blueprint/BlueprintHero";
import OrchestratorShowcase from "@/components/blueprint/OrchestratorShowcase";
import MarketplaceTemplate from "@/components/blueprint/MarketplaceTemplate";
import EvolutionTimeline from "@/components/blueprint/EvolutionTimeline";

export const metadata: Metadata = {
  title: "Blueprint",
  description:
    "Explore the OFFER-HUB technical blueprint: orchestrator architecture, marketplace templates, and the evolution roadmap for trustless payment infrastructure.",
  keywords: [
    "blueprint",
    "architecture",
    "orchestrator",
    "marketplace",
    "roadmap",
    "OFFER-HUB",
    "payment infrastructure",
  ],
};

export default function BlueprintPage() {
  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <LoadingBar />
      <Navbar />

      <main className="flex-grow">
        <BlueprintHero />
        <SectionNav
          sections={BLUEPRINT_SECTIONS}
          layoutId="blueprintNavActivePill"
          scrollMarginPx={BLUEPRINT_SCROLL_MARGIN_PX}
          ariaLabel="Blueprint sections"
        />
        <OrchestratorShowcase />
        <MarketplaceTemplate />
        <EvolutionTimeline />
      </main>

      <Footer />
    </div>
  );
}
