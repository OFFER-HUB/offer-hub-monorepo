import type { ReactNode } from "react";

import DaoPayrollHero from "./DaoPayrollHero";
import DaoPayrollEscrowFlowDiagram from "./EscrowFlowDiagram";
import DaoPayrollStellarImpactCards from "./StellarImpactCards";
import DaoPayrollCodeIntegrationShowcase from "./CodeIntegrationShowcase";
import { featureCards } from "./data";

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
        <DaoPayrollStellarImpactCards />
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
