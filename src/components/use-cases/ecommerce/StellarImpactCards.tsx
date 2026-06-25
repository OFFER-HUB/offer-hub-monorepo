"use client";

import StellarImpactCards from "../shared/StellarImpactCards";
import { stellarImpactCardsData, stellarImpactSummary } from "./data";

export default function EcommerceStellarImpactCards() {
  return (
    <StellarImpactCards
      variant="detailed"
      cards={stellarImpactCardsData}
      toggleId="ecommerce"
      summaryContent={{ offerhub: stellarImpactSummary }}
    />
  );
}
