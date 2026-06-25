import { ShieldCheck, Zap, PackageCheck } from "lucide-react";
import type { DetailedMetricCard } from "../shared/StellarImpactCards";

export const stellarImpactCardsData: DetailedMetricCard[] = [
  {
    id: "chargeback",
    label: "Chargeback Risk",
    icon: ShieldCheck,
    offerHub: {
      value: "0",
      unit: "%",
      sublabel: "No chargebacks ever",
    },
    traditional: {
      value: "1.5",
      unit: "%",
      sublabel: "Average e-commerce rate",
    },
    savingsLabel: "Risk eliminated",
    savingsValue: "100%",
    isGrowth: true,
    description:
      "Escrow-based payments eliminate chargebacks entirely. Funds are locked before the transaction begins, making post-purchase fraud claims irrelevant.",
  },
  {
    id: "settlement",
    label: "Seller Settlement",
    icon: Zap,
    offerHub: {
      value: "3.2",
      unit: "sec",
      sublabel: "Stellar average finality",
    },
    traditional: {
      value: "1–3",
      unit: "days",
      sublabel: "Standard payment rails",
    },
    savingsLabel: "Speed increase",
    savingsValue: "50,000×",
    isGrowth: true,
    description:
      "Seller funds are released and settled in under 5 seconds via Stellar. No payout batches, no waiting on payment processors to remit.",
  },
  {
    id: "buyer-protection",
    label: "Buyer Protection",
    icon: PackageCheck,
    offerHub: {
      value: "100",
      unit: "%",
      sublabel: "Escrow-backed guarantee",
    },
    traditional: {
      value: "0",
      unit: "%",
      sublabel: "Merchant-dependent only",
    },
    savingsLabel: "Protection level",
    savingsValue: "Full",
    isGrowth: false,
    description:
      "Every transaction is backed by non-custodial escrow. Buyers are guaranteed a refund path for non-delivery or disputes; sellers are guaranteed payment on confirmed delivery.",
  },
];

export const stellarImpactSummary = {
  icon: ShieldCheck,
  text: (
    <>
      OFFER-HUB eliminates chargebacks,{" "}
      <span className="text-theme-primary">100% buyer protection</span>, and
      settles sellers{" "}
      <span className="text-theme-primary">50,000× faster</span> than
      standard payment rails.
    </>
  ),
};
