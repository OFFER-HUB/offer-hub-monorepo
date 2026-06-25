"use client";

import StellarImpactCards from "../shared/StellarImpactCards";
import { stellarImpactCardsData, stellarImpactSummary } from "./data";

export default function FreelanceStellarImpactCards() {
  return (
    <StellarImpactCards
      variant="detailed"
      cards={stellarImpactCardsData}
      toggleId="freelance"
      summaryContent={{ offerhub: stellarImpactSummary }}
    />
  );
}
