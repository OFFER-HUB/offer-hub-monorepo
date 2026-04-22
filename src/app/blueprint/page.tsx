import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import LoadingBar from "@/components/ui/LoadingBar";

export const metadata: Metadata = {
  title: "Blueprint",
  description:
    "Explore the OFFER-HUB architectural blueprint — orchestrator design, marketplace templates, and platform evolution timeline.",
  openGraph: {
    title: "Blueprint | OFFER-HUB",
    description:
      "Explore the OFFER-HUB architectural blueprint and platform evolution.",
  },
};

import BlueprintHero from "@/components/blueprint/BlueprintHero";
import BlueprintSectionNav from "@/components/blueprint/BlueprintSectionNav";
import OrchestratorShowcase from "@/components/blueprint/OrchestratorShowcase";
import MarketplaceTemplate from "@/components/blueprint/MarketplaceTemplate";
import EvolutionTimeline from "@/components/blueprint/EvolutionTimeline";

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
