import type { ReactNode } from "react";

import FreelanceHero from "./FreelanceHero";
import FreelanceEscrowFlowDiagram from "./EscrowFlowDiagram";
import FreelanceStellarImpactCards from "./StellarImpactCards";
import FreelanceCodeIntegrationShowcase from "./CodeIntegrationShowcase";
import { featureCards } from "./data";

import {
  FeaturesGrid,
  MetricsSection,
  ArchitectureSection,
  SdkSection,
} from "../shared/SectionLayout";

/**
 * Full vertical content for the Freelance use case. Owns its own page-section
 * wrappers (#features / #metrics / #architecture / #sdk); only one use-case
 * section is mounted at a time, so the ids never collide.
 *
 * `stickyNav` is injected by the orchestrator and rendered between the hero
 * and the rest, matching the original page layout.
 */
export default function FreelanceSection({
  stickyNav,
}: {
  stickyNav?: ReactNode;
}) {
  return (
    <>
      <FreelanceHero />

      {stickyNav}

      <FeaturesGrid features={featureCards} />

      <MetricsSection>
        <FreelanceStellarImpactCards />
      </MetricsSection>

      <ArchitectureSection>
        <FreelanceEscrowFlowDiagram />
      </ArchitectureSection>

      <SdkSection>
        <FreelanceCodeIntegrationShowcase />
      </SdkSection>
    </>
  );
}
