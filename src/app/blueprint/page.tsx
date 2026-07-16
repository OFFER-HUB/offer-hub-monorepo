import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import LoadingBar from "@/components/ui/LoadingBar";

import BlueprintHero from "@/components/blueprint/BlueprintHero";
import BlueprintSectionNav from "@/components/blueprint/BlueprintSectionNav";
import OrchestratorShowcase from "@/components/blueprint/OrchestratorShowcase";
import MarketplaceTemplate from "@/components/blueprint/MarketplaceTemplate";
import EvolutionTimeline from "@/components/blueprint/EvolutionTimeline";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
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
  path: "/blueprint",
  ogImageAlt:
    "OFFER-HUB Blueprint — orchestrator architecture and marketplace templates",
});

export default function BlueprintPage() {
  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <LoadingBar />
      <Navbar />

      <main className="flex-grow">
        <BlueprintHero />
        <BlueprintSectionNav />
        <OrchestratorShowcase />
        <MarketplaceTemplate />
        <EvolutionTimeline />
      </main>

      <Footer />
    </div>
  );
}
