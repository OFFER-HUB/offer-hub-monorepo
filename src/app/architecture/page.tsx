import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import LoadingBar from "@/components/ui/LoadingBar";

import ArchitectureHero from "@/components/architecture/ArchitectureHero";
import ArchitectureSectionNav from "@/components/architecture/ArchitectureSectionNav";
import SystemArchitectureDiagram from "@/components/architecture/SystemArchitectureDiagram";
import PaymentFlowDiagram from "@/components/architecture/PaymentFlowDiagram";
import IntegrationsMap from "@/components/architecture/IntegrationsMap";
import SCFTrancheRoadmap from "@/components/architecture/SCFTrancheRoadmap";
import WhyStellarSection from "@/components/architecture/WhyStellarSection";
import TractionSection from "@/components/architecture/TractionSection";

export const metadata: Metadata = {
  title: "Technical Architecture",
  description:
    "Complete technical architecture of OFFER-HUB: non-custodial escrow on Stellar, Stellar Wallets Kit integration, BlindPay and Abroad off-ramp corridors across 7 LATAM markets. SCF Build Award #44.",
  keywords: [
    "architecture",
    "stellar",
    "soroban",
    "escrow",
    "TrustlessWork",
    "BlindPay",
    "Abroad",
    "SCF",
    "OFFER-HUB",
    "USDC",
    "LATAM",
  ],
};

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <LoadingBar />
      <Navbar />

      <main className="flex-grow">
        <ArchitectureHero />
        <ArchitectureSectionNav />
        <SystemArchitectureDiagram />
        <PaymentFlowDiagram />
        <IntegrationsMap />
        <SCFTrancheRoadmap />
        <WhyStellarSection />
        <TractionSection />
      </main>

      <Footer />
    </div>
  );
}
