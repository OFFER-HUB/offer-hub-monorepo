"use client";

import StellarImpactCards from "../shared/StellarImpactCards";
import { stellarImpactCardsData, stellarImpactSummary } from "./data";

export default function DaoPayrollStellarImpactCards() {
  return (
    <StellarImpactCards
      variant="detailed"
      cards={stellarImpactCardsData}
      toggleId="dao-payroll"
      summaryContent={{ offerhub: stellarImpactSummary }}
    />
  );
}
