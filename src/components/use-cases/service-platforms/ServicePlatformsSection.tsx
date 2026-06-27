import type { ReactNode } from "react";

import ServicePlatformsHero from "./ServicePlatformsHero";
import ServicePlatformsEscrowFlowDiagram from "./EscrowFlowDiagram";
import ServicePlatformsStellarImpactCards from "./StellarImpactCards";
import ServicePlatformsCodeIntegrationShowcase from "./CodeIntegrationShowcase";
import { featureCards } from "./data";

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
        <ServicePlatformsStellarImpactCards />
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
