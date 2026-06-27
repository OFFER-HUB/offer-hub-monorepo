import type { ReactNode } from "react";

import RealEstateHero from "./RealEstateHero";
import RealEstateEscrowFlowDiagram from "./EscrowFlowDiagram";
import RealEstateStellarImpactCards from "./StellarImpactCards";
import RealEstateCodeIntegrationShowcase from "./CodeIntegrationShowcase";
import { featureCards } from "./data";

import {
  FeaturesGrid,
  MetricsSection,
  ArchitectureSection,
  SdkSection,
} from "../shared/SectionLayout";

/**
 * Full vertical content for the Real Estate use case. Owns its own page-section
 * wrappers (#features / #metrics / #architecture / #sdk); only one use-case
 * section is mounted at a time, so the ids never collide.
 */
export default function RealEstateSection({
  stickyNav,
}: {
  stickyNav?: ReactNode;
}) {
  return (
    <>
      <RealEstateHero />

      {stickyNav}

      <FeaturesGrid features={featureCards} />

      <MetricsSection>
        <RealEstateStellarImpactCards />
      </MetricsSection>

      <ArchitectureSection>
        <RealEstateEscrowFlowDiagram />
      </ArchitectureSection>

      <SdkSection>
        <RealEstateCodeIntegrationShowcase />
      </SdkSection>
    </>
  );
}
