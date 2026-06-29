"use client";

import StellarImpactCards from "../shared/StellarImpactCards";
import { stellarImpactCardsData, stellarImpactSummary } from "./data";

export default function RealEstateStellarImpactCards() {
  return (
    <StellarImpactCards
      variant="detailed"
      cards={stellarImpactCardsData}
      toggleId="real-estate"
      summaryContent={{ offerhub: stellarImpactSummary }}
    />
  );
}
