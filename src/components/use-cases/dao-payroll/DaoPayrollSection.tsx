import type { ReactNode } from "react";

import DaoPayrollHero from "./DaoPayrollHero";
import DaoPayrollEscrowFlowDiagram from "./EscrowFlowDiagram";
import DaoPayrollCodeIntegrationShowcase from "./CodeIntegrationShowcase";
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
 * Full vertical content for the DAO Payroll use case. Owns its own page-section
 * wrappers (#features / #metrics / #architecture / #sdk); only one use-case
 * section is mounted at a time, so the ids never collide.
 */
export default function DaoPayrollSection({
  stickyNav,
}: {
  stickyNav?: ReactNode;
}) {
  return (
    <>
      <DaoPayrollHero />

      {stickyNav}

      <FeaturesGrid features={featureCards} />

      <MetricsSection>
        <StellarImpactCards
          variant="detailed"
          cards={stellarImpactCardsData}
          toggleId="dao-payroll"
          summaryContent={{ offerhub: stellarImpactSummary }}
        />
      </MetricsSection>

      <ArchitectureSection>
        <DaoPayrollEscrowFlowDiagram />
      </ArchitectureSection>

      <SdkSection>
        <DaoPayrollCodeIntegrationShowcase />
      </SdkSection>
    </>
  );
}
