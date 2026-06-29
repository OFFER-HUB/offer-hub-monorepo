"use client";

import StellarImpactCards from "../shared/StellarImpactCards";
import { stellarImpactCardsData, stellarImpactSummary } from "./data";

export default function ServicePlatformsStellarImpactCards() {
  return (
    <StellarImpactCards
      variant="simple"
      cards={stellarImpactCardsData}
      toggleId="service-platforms"
      showHeader={false}
      summaryContent={stellarImpactSummary}
    />
  );
}
