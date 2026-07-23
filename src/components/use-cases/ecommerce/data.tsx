import { ShieldCheck, Zap, PackageCheck, Globe, ShoppingCart } from "lucide-react";
import type { UseCaseHeroProps } from "../shared/UseCaseHero";
import type { DetailedMetricCard } from "../shared/StellarImpactCards";
import type { FeatureCard } from "../shared/SectionLayout";

// ── Hero content (rendered in the #overview section) ──
export const heroData: UseCaseHeroProps = {
  gradientId: "ecommerce-network-line",
  badgeLabel: "CASE STUDY: LVL-2 COMMERCE",
  headline: "Protecting Every Transaction, Buyer to Seller",
  subheadline:
    "A deep dive into escrow-secured e-commerce: automatic delivery escrow, buyer-protection windows, dispute handling, and instant seller payouts on Stellar — without custodial risk.",
  docsUrl:
    "https://github.com/OFFER-HUB/offer-hub-monorepo/blob/main/docs/business/use-cases.md#use-case-2-e-commerce-marketplace",
  footerIcon: ShoppingCart,
  footerLabel: "Trustless commerce infrastructure",
  stats: [
    { label: "Target", value: "B2C / eCommerce", accent: "Marketplace Scope" },
    { label: "Provider", value: "Stellar (USDC)", accent: "Settlement Layer" },
    {
      label: "Features",
      value: "Delivery Escrow, Auto-Release, Dispute Refunds",
      accent: "Release Logic",
    },
  ],
  nodes: [
    { id: "buyer", x: 16, y: 44, size: 12, delay: 0 },
    { id: "north", x: 34, y: 22, size: 8, delay: 0.3 },
    { id: "core", x: 50, y: 38, size: 14, delay: 0.6 },
    { id: "east", x: 72, y: 26, size: 9, delay: 0.9 },
    { id: "south", x: 64, y: 66, size: 11, delay: 1.2 },
    { id: "seller", x: 86, y: 50, size: 10, delay: 1.5 },
  ],
  links: [
    ["buyer", "north"],
    ["buyer", "core"],
    ["north", "core"],
    ["core", "east"],
    ["core", "south"],
    ["east", "seller"],
    ["south", "seller"],
  ],
};

// ── Features grid content (rendered in the #features section) ──
export const featureCards: FeatureCard[] = [
  {
    icon: ShieldCheck,
    title: "Buyer & Seller Protection",
    body: "Buyer funds are locked on-chain before the seller ships. Neither party can be defrauded — the escrow is the source of truth for every order.",
  },
  {
    icon: Zap,
    title: "Automatic Release on Delivery",
    body: "Funds release the moment delivery is confirmed — by tracking API, signature scan, or a buyer click — removing payout batch delays entirely.",
  },
  {
    icon: Globe,
    title: "On-Chain Dispute Resolution",
    body: "If an order is missing or misrepresented, the buyer opens a structured on-chain dispute. The outcome — release, refund, or split — is transparent and final.",
  },
];

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
