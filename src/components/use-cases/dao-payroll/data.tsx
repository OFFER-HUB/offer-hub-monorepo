import { Eye, Zap, DollarSign, ShieldCheck, Coins, Globe } from "lucide-react";
import type { DetailedMetricCard } from "../shared/StellarImpactCards";
import type { FeatureCard } from "../shared/SectionLayout";

// ── Features grid content (rendered in the #features section) ──
export const featureCards: FeatureCard[] = [
  {
    icon: Coins,
    title: "Governance-Gated Releases",
    body: "DAO votes directly trigger payroll disbursements. No multisig delays — a passed proposal automatically releases contributor funds from the vault.",
  },
  {
    icon: ShieldCheck,
    title: "Contributor Trust",
    body: "Budget is locked on-chain at the start of each epoch. Contributors can start work knowing their payment is already secured in escrow.",
  },
  {
    icon: Globe,
    title: "Multi-Currency Payouts",
    body: "Pay contributors globally in USDC, XLM, or any Stellar-issued asset. No bank accounts required. Settlement completes in under 5 seconds.",
  },
];

export const stellarImpactCardsData: DetailedMetricCard[] = [
  {
    id: "transparency",
    label: "Payroll Transparency",
    icon: Eye,
    offerHub: {
      value: "100",
      unit: "%",
      sublabel: "On-chain audit trail",
    },
    traditional: {
      value: "0",
      unit: "%",
      sublabel: "Internal ledger, opaque",
    },
    savingsLabel: "Auditability",
    savingsValue: "Full",
    isGrowth: false,
    description:
      "Every budget allocation, contributor verification, and distribution event is recorded on Stellar — immutably auditable by any DAO member or token holder at any time.",
  },
  {
    id: "speed",
    label: "Distribution Speed",
    icon: Zap,
    offerHub: {
      value: "3.2",
      unit: "sec",
      sublabel: "Stellar average finality",
    },
    traditional: {
      value: "2–7",
      unit: "days",
      sublabel: "SWIFT / ACH / Wire",
    },
    savingsLabel: "Speed increase",
    savingsValue: "185,000×",
    isGrowth: true,
    description:
      "DAO contributors are paid in real time after milestone approval. Stellar's finality under 5 seconds eliminates bank processing delays for global contributor payouts.",
  },
  {
    id: "fee",
    label: "Transaction Fee",
    icon: DollarSign,
    offerHub: {
      value: "0.0001",
      unit: "XLM",
      sublabel: "≈ $0.01 per contributor",
    },
    traditional: {
      value: "3–5",
      unit: "%",
      sublabel: "PayPal / Wise / Payoneer",
    },
    savingsLabel: "Cost reduction",
    savingsValue: "99.8%",
    isGrowth: true,
    description:
      "Stellar's fixed 0.0001 XLM base fee applies regardless of payout size. Whether distributing $10 or $10,000 to a contributor, the cost is near-zero.",
  },
];

export const stellarImpactSummary = {
  icon: ShieldCheck,
  text: (
    <>
      OFFER-HUB saves DAOs up to{" "}
      <span className="text-theme-primary">99.8% in payroll fees</span> and
      distributes{" "}
      <span className="text-theme-primary">185,000× faster</span> than
      traditional wire transfers.
    </>
  ),
};
