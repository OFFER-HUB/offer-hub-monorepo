import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TopProgressBar } from "@/components/ui/TopProgressBar";

import { SectionNav } from "@/components/shared/SectionNav";
import {
  ARCHITECTURE_SECTIONS,
  ARCHITECTURE_SCROLL_MARGIN_PX,
} from "@/lib/architecture-nav";
import { ArchitectureHero } from "@/components/architecture/ArchitectureHero";
import { SystemArchitectureDiagram } from "@/components/architecture/SystemArchitectureDiagram";
import { PaymentFlowDiagram } from "@/components/architecture/PaymentFlowDiagram";
import { IntegrationsMap } from "@/components/architecture/IntegrationsMap";
import { SCFTrancheRoadmap } from "@/components/architecture/SCFTrancheRoadmap";
import { WhyStellarSection } from "@/components/architecture/WhyStellarSection";
import { TractionSection } from "@/components/architecture/TractionSection";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Technical Architecture",
  description:
    "Complete technical architecture of OFFER-HUB: non-custodial escrow on Stellar, Stellar Wallets Kit integration, BlindPay off-ramp corridors across 7 LATAM markets. SCF Build Award #44.",
  keywords: [
    "architecture",
    "stellar",
    "soroban",
    "escrow",
    "TrustlessWork",
    "BlindPay",
    "SCF",
    "OFFER-HUB",
    "USDC",
    "LATAM",
  ],
  path: "/architecture",
  ogImageAlt:
    "OFFER-HUB Technical Architecture — non-custodial escrow on Stellar",
});

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <TopProgressBar mode="scroll-progress" />
      <Navbar />

      <main className="flex-grow">
        <ArchitectureHero />
        <SectionNav
          sections={ARCHITECTURE_SECTIONS}
          layoutId="architectureNavActivePill"
          scrollMarginPx={ARCHITECTURE_SCROLL_MARGIN_PX}
          ariaLabel="Architecture sections"
        />
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
