import { DollarSign, Clock, ShieldCheck } from "lucide-react";
import type { DetailedMetricCard } from "../shared/StellarImpactCards";

export const stellarImpactCardsData: DetailedMetricCard[] = [
  {
    id: "fee",
    label: "Transaction Fee",
    icon: DollarSign,
    offerHub: {
      value: "0.0001",
      unit: "XLM",
      sublabel: "≈ $0.01 per transaction",
    },
    traditional: {
      value: "3–5",
      unit: "%",
      sublabel: "Stripe / PayPal / Escrow.com",
    },
    savingsLabel: "Cost reduction",
    savingsValue: "99.8%",
    isGrowth: true,
    description:
      "Stellar's base fee is a fixed 0.0001 XLM regardless of transaction size, making micro-payments and large transfers equally affordable.",
  },
  {
    id: "settlement",
    label: "Settlement Time",
    icon: Clock,
    offerHub: {
      value: "3.2",
      unit: "sec",
      sublabel: "Stellar average finality",
    },
    traditional: {
      value: "3–7",
      unit: "days",
      sublabel: "SWIFT / ACH / Wire",
    },
    savingsLabel: "Speed increase",
    savingsValue: "185,000×",
    isGrowth: true,
    description:
      "Stellar achieves finality in under 5 seconds via its Federated Byzantine Agreement protocol — no mining, no waiting.",
  },
  {
    id: "transparency",
    label: "Operational Transparency",
    icon: ShieldCheck,
    offerHub: {
      value: "100",
      unit: "%",
      sublabel: "On-chain audit trail",
    },
    traditional: {
      value: "0",
      unit: "%",
      sublabel: "Opaque internal ledgers",
    },
    savingsLabel: "Auditability",
    savingsValue: "Full",
    isGrowth: false,
    description:
      "Every escrow event — creation, funding, milestone approval, release — is recorded immutably on the Stellar ledger and publicly verifiable.",
  },
];

export const stellarImpactSummary = {
  icon: ShieldCheck,
  text: (
    <>
      OFFER-HUB saves businesses up to{" "}
      <span className="text-theme-primary">99.8% in transaction fees</span>{" "}
      and settles{" "}
      <span className="text-theme-primary">185,000× faster</span> than SWIFT.
    </>
  ),
};
