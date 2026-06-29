import type { ReactNode } from "react";

import EcommerceHero from "./EcommerceHero";
import EcommerceEscrowFlowDiagram from "./EscrowFlowDiagram";
import EcommerceStellarImpactCards from "./StellarImpactCards";
import EcommerceCodeIntegrationShowcase from "./CodeIntegrationShowcase";
import { featureCards } from "./data";

import {
  FeaturesGrid,
  MetricsSection,
  ArchitectureSection,
  SdkSection,
} from "../shared/SectionLayout";

/**
 * Full vertical content for the eCommerce use case. Owns its own page-section
 * wrappers (#features / #metrics / #architecture / #sdk); only one use-case
 * section is mounted at a time, so the ids never collide.
 */
export default function EcommerceSection({
  stickyNav,
}: {
  stickyNav?: ReactNode;
}) {
  return (
    <>
      <EcommerceHero />

      {stickyNav}

      <FeaturesGrid features={featureCards} />

      <MetricsSection>
        <EcommerceStellarImpactCards />
      </MetricsSection>

      <ArchitectureSection>
        <EcommerceEscrowFlowDiagram />
      </ArchitectureSection>

      <SdkSection>
        <EcommerceCodeIntegrationShowcase />
      </SdkSection>
    </>
  );
}
