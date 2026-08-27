import type { ReactNode } from "react";

import { EscrowFlowDiagram } from "../shared/EscrowFlowDiagram";
import { ESCROW_STEPS } from "./escrow-flow.data";
import {
  heroData,
  featureCards,
  stellarImpactCardsData,
  stellarImpactSummary,
} from "./data";
import { description, sdkCards, tabs } from "./code-tabs";

import { UseCaseHero } from "../shared/UseCaseHero";
import { StellarImpactCards } from "../shared/StellarImpactCards";
import { CodeIntegrationShowcase } from "../shared/CodeIntegrationShowcase";
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
export function RealEstateSection({
  stickyNav,
}: {
  stickyNav?: ReactNode;
}) {
  return (
    <>
      <UseCaseHero {...heroData} />

      {stickyNav}

      <FeaturesGrid features={featureCards} />

      <MetricsSection>
        <StellarImpactCards
          variant="detailed"
          cards={stellarImpactCardsData}
          toggleId="real-estate"
          summaryContent={{ offerhub: stellarImpactSummary }}
        />
      </MetricsSection>

      <ArchitectureSection>
        <EscrowFlowDiagram steps={ESCROW_STEPS} />
      </ArchitectureSection>

      <SdkSection>
        <CodeIntegrationShowcase
          description={description}
          tabs={tabs}
          sdkCards={sdkCards}
        />
      </SdkSection>
    </>
  );
}
