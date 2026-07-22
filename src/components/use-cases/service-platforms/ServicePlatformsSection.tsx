import type { ReactNode } from "react";

import ServicePlatformsHero from "./ServicePlatformsHero";
import ServicePlatformsEscrowFlowDiagram from "./EscrowFlowDiagram";
import ServicePlatformsCodeIntegrationShowcase from "./CodeIntegrationShowcase";
import {
  featureCards,
  stellarImpactCardsData,
  stellarImpactSummary,
} from "./data";

import StellarImpactCards from "../shared/StellarImpactCards";
import {
  FeaturesGrid,
  MetricsSection,
  ArchitectureSection,
  SdkSection,
} from "../shared/SectionLayout";

/**
 * Full vertical content for the Service Platforms use case. Owns its own
 * page-section wrappers (#features / #metrics / #architecture / #sdk); only one
 * use-case section is mounted at a time, so the ids never collide.
 */
export default function ServicePlatformsSection({
  stickyNav,
}: {
  stickyNav?: ReactNode;
}) {
  return (
    <>
      <ServicePlatformsHero />

      {stickyNav}

      <FeaturesGrid features={featureCards} />

      <MetricsSection>
        <StellarImpactCards
          variant="simple"
          cards={stellarImpactCardsData}
          toggleId="service-platforms"
          showHeader={false}
          summaryContent={stellarImpactSummary}
        />
      </MetricsSection>

      <ArchitectureSection>
        <ServicePlatformsEscrowFlowDiagram />
      </ArchitectureSection>

      <SdkSection>
        <ServicePlatformsCodeIntegrationShowcase />
      </SdkSection>
    </>
  );
}
