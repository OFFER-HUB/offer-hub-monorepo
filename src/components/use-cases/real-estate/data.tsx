import { ShieldCheck, Clock, Eye, Building2, Zap, Home } from "lucide-react";
import type { UseCaseHeroProps } from "../shared/UseCaseHero";
import type { DetailedMetricCard } from "../shared/StellarImpactCards";
import type { FeatureCard } from "../shared/SectionLayout";

// ── Hero content (rendered in the #overview section) ──
export const heroData: UseCaseHeroProps = {
  gradientId: "real-estate-network-line",
  badgeLabel: "CASE STUDY: LVL-4 REAL WORLD",
  headline: "Securing Deposits, Removing Counterparty Risk",
  subheadline:
    "The real estate escrow blueprint: non-custodial deposit locking, condition-based release against inspection reports, and on-chain dispute settlement — for rental and purchase transactions, globally.",
  docsUrl:
    "https://github.com/OFFER-HUB/offer-hub-monorepo/blob/main/docs/business/use-cases.md",
  footerIcon: Home,
  footerLabel: "Non-custodial real estate escrow",
  stats: [
    {
      label: "Target",
      value: "Residential / Commercial",
      accent: "Property Scope",
    },
    { label: "Provider", value: "Stellar (USDC)", accent: "Settlement Layer" },
    {
      label: "Features",
      value: "Deposit Lock, Inspection Gate, Dispute Settlement",
      accent: "Release Logic",
    },
  ],
  nodes: [
    { id: "tenant", x: 16, y: 44, size: 12, delay: 0 },
    { id: "north", x: 34, y: 22, size: 8, delay: 0.3 },
    { id: "core", x: 50, y: 38, size: 14, delay: 0.6 },
    { id: "east", x: 72, y: 26, size: 9, delay: 0.9 },
    { id: "south", x: 64, y: 66, size: 11, delay: 1.2 },
    { id: "landlord", x: 86, y: 50, size: 10, delay: 1.5 },
  ],
  links: [
    ["tenant", "north"],
    ["tenant", "core"],
    ["north", "core"],
    ["core", "east"],
    ["core", "south"],
    ["east", "landlord"],
    ["south", "landlord"],
  ],
};

// ── Features grid content (rendered in the #features section) ──
export const featureCards: FeatureCard[] = [
  {
    icon: Building2,
    title: "Tokenised Escrow",
    body: "Earnest money and closing funds are held in programmable on-chain escrow, eliminating the need for a third-party title company for each step.",
  },
  {
    icon: ShieldCheck,
    title: "Condition-Based Releases",
    body: "Funds only release when contingencies are met: inspection approval, title clearance, mortgage funding. Automated and auditable at every stage.",
  },
  {
    icon: Zap,
    title: "Instant Cross-Border Closing",
    body: "International buyers settle in USDC with no wire delays or correspondent bank fees. Foreign national transactions close in the same time as domestic ones.",
  },
];

export const stellarImpactCardsData: DetailedMetricCard[] = [
  {
    id: "counterparty",
    label: "Counterparty Risk",
    icon: ShieldCheck,
    offerHub: {
      value: "0",
      unit: "%",
      sublabel: "Non-custodial protection",
    },
    traditional: {
      value: "100",
      unit: "%",
      sublabel: "Unilateral landlord control",
    },
    savingsLabel: "Risk eliminated",
    savingsValue: "100%",
    isGrowth: true,
    description:
      "Traditional deposits are held in landlord or agent bank accounts with no tenant protection. OFFER-HUB escrow removes this risk entirely — neither party controls the funds unilaterally.",
  },
  {
    id: "settlement",
    label: "Settlement Speed",
    icon: Clock,
    offerHub: {
      value: "3.2",
      unit: "sec",
      sublabel: "Stellar average finality",
    },
    traditional: {
      value: "30–90",
      unit: "days",
      sublabel: "Bank wire / escrow agent",
    },
    savingsLabel: "Speed increase",
    savingsValue: ">1,000,000×",
    isGrowth: true,
    description:
      "Deposit returns, partial deductions, and dispute resolutions settle in under 5 seconds on Stellar — versus weeks of back-and-forth with traditional escrow agents and banks.",
  },
  {
    id: "transparency",
    label: "Dispute Transparency",
    icon: Eye,
    offerHub: {
      value: "100",
      unit: "%",
      sublabel: "On-chain audit trail",
    },
    traditional: {
      value: "0",
      unit: "%",
      sublabel: "No auditable process",
    },
    savingsLabel: "Auditability",
    savingsValue: "Full",
    isGrowth: false,
    description:
      "Every deposit event — creation, lock, inspection verification, release — is recorded on Stellar and visible to all parties. No black boxes, no disputed outcomes without on-chain evidence.",
  },
];

export const stellarImpactSummary = {
  icon: ShieldCheck,
  text: (
    <>
      OFFER-HUB eliminates counterparty risk{" "}
      <span className="text-theme-primary">entirely</span> and settles deposits{" "}
      <span className="text-theme-primary">1,000,000× faster</span> than
      traditional escrow agents.
    </>
  ),
};
