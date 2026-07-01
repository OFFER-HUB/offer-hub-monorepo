import type { ReactNode } from "react";

import EcommerceHero from "./EcommerceHero";
import EcommerceStellarImpactCards from "./StellarImpactCards";
import EcommerceCodeIntegrationShowcase from "./CodeIntegrationShowcase";
import { featureCards } from "./data";
import EscrowFlowDiagram from "../shared/EscrowFlowDiagram";
import { ECOMMERCE_ESCROW_STEPS } from "./escrow-steps";

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
        <EscrowFlowDiagram steps={ECOMMERCE_ESCROW_STEPS} gradientId="ecommerce-pulse-grad" />
      </ArchitectureSection>

      <SdkSection>
        <EcommerceCodeIntegrationShowcase />
      </SdkSection>
    </>
  );
}
