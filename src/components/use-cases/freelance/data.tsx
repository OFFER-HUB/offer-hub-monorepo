import { DollarSign, Clock, ShieldCheck, Zap, Globe, Orbit } from "lucide-react";
import type { DetailedMetricCard } from "../shared/StellarImpactCards";
import type { FeatureCard } from "../shared/SectionLayout";
import type { UseCaseHeroProps } from "../shared/UseCaseHero";

// ── Hero content (rendered in the #overview section) ──
export const heroData: UseCaseHeroProps = {
  gradientId: "freelance-network-line",
  badgeLabel: "CASE STUDY: LVL-1 REAL-WORLD",
  headline: "Orchestrating the Global Talent Economy",
  subheadline:
    "The flagship OFFER-HUB deployment story, designed as a live study of escrow-backed freelance infrastructure: mapped payment flows, milestone controls, and global USDC settlement without custodial risk.",
  docsUrl:
    "https://github.com/OFFER-HUB/offer-hub-monorepo/blob/main/docs/business/use-cases.md#use-case-1-freelance-platform",
  footerIcon: Orbit,
  footerLabel: "Deployment-grade architecture",
  stats: [
    { label: "Target", value: "B2B / Freelance", accent: "Marketplace Scope" },
    { label: "Provider", value: "Stellar (USDC)", accent: "Settlement Layer" },
    {
      label: "Features",
      value: "Milestones, Escrow, Global Settlement",
      accent: "Release Logic",
    },
  ],
  nodes: [
    { id: "origin", x: 16, y: 44, size: 12, delay: 0 },
    { id: "north", x: 34, y: 22, size: 8, delay: 0.3 },
    { id: "core", x: 50, y: 38, size: 14, delay: 0.6 },
    { id: "east", x: 72, y: 26, size: 9, delay: 0.9 },
    { id: "south", x: 64, y: 66, size: 11, delay: 1.2 },
    { id: "settlement", x: 86, y: 50, size: 10, delay: 1.5 },
  ],
  links: [
    ["origin", "north"],
    ["origin", "core"],
    ["north", "core"],
    ["core", "east"],
    ["core", "south"],
    ["east", "settlement"],
    ["south", "settlement"],
  ],
};

// ── Features grid content (rendered in the #features section) ──
export const featureCards: FeatureCard[] = [
  {
    icon: ShieldCheck,
    title: "Trustless Escrow",
    body: "Lock client funds into secure smart contracts at project kick-off. Funds are guaranteed to exist, protecting both the freelancer and the client.",
  },
  {
    icon: Zap,
    title: "Milestone Automation",
    body: "Trigger partial or full payments automatically when APIs dictate completion of deliverables, removing manual invoice friction.",
  },
  {
    icon: Globe,
    title: "Global Payouts",
    body: "Settle funds instantly in USDC or fiat-backed stablecoins directly to the freelancer's wallet, bypassing multi-day bank transfer delays and high FX fees.",
  },
];

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
