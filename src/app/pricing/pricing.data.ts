import { Building2, Code2 } from "lucide-react";
import type { ComponentType } from "react";
import { GITHUB_REPO_URL } from "@/constants/github";

export type PricingCta = {
  label: string;
  href: string;
  variant: "primary" | "secondary";
  external?: boolean;
};

export type PricingTier = {
  id: string;
  name: string;
  priceLabel: string;
  description: string;
  features: string[];
  primaryCta: PricingCta;
  secondaryCta?: PricingCta;
  icon: ComponentType<{ className?: string }>;
};

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "open-source-self-hosted",
    name: "Open Source & Self-Hosted",
    priceLabel: "Free",
    description:
      "Deploy the full OFFER-HUB core on your own infrastructure with complete control over runtime, security boundaries, and data sovereignty.",
    features: [
      "Full core on your infrastructure",
      "Public issues and open roadmap visibility",
      "Community support via GitHub and Discord",
      "Non-custodial Soroban escrow smart contracts",
    ],
    primaryCta: {
      label: "Start self-hosting",
      href: "/docs/getting-started",
      variant: "primary",
    },
    secondaryCta: {
      label: "View on GitHub",
      href: GITHUB_REPO_URL,
      variant: "secondary",
      external: true,
    },
    icon: Code2,
  },
  {
    id: "enterprise-support",
    name: "Enterprise Support",
    priceLabel: "Custom",
    description:
      "For organizations that need a custom support scope tailored to their requirements.",
    features: [
      "Full open-source core",
      "Custom support scope agreed with the team",
      "Contact us to discuss your requirements",
    ],
    primaryCta: {
      label: "Talk to sales",
      href: "/contact",
      variant: "primary",
    },
    icon: Building2,
  },
];

export type ComparisonFeature = {
  name: string;
  openSource: string;
  enterprise: string;
};

export const COMPARISON_FEATURES: ComparisonFeature[] = [
  {
    name: "Core platform",
    openSource: "Full open-source core (contracts, API, client SDK)",
    enterprise: "Full open-source core",
  },
  {
    name: "Deployment & updates",
    openSource: "Self-managed on your infrastructure",
    enterprise: "Agreed per engagement",
  },
  {
    name: "Support level",
    openSource: "Community support (GitHub & public channels)",
    enterprise: "Agreed per engagement",
  },
  {
    name: "Architecture review",
    openSource: "Community documentation & reference guides",
    enterprise: "Agreed per engagement",
  },
];

export type FaqItem = {
  question: string;
  answer: string;
};

export const PRICING_FAQS: FaqItem[] = [
  {
    question: "Who holds the escrow funds?",
    answer:
      "OFFER-HUB is non-custodial. All escrow funds are locked directly in Soroban smart contracts on the Stellar blockchain. Neither OFFER-HUB nor any intermediary holds custody of deposits; funds are released only when cryptographically verified contract conditions are fulfilled.",
  },
  {
    question: "What network fees apply when transacting?",
    answer:
      "Transactions settle directly on the Stellar ledger and incur standard Stellar base network fees (fractions of a cent per operation, paid in stroops).",
  },
  {
    question: "Can I self-host OFFER-HUB for production?",
    answer:
      "Yes. The entire platform is open source and architected for self-hosting with Docker, Next.js, and NestJS. You maintain total control over your cloud or on-prem environment, database records, and compliance posture.",
  },
  {
    question: "What is included with Enterprise Support?",
    answer:
      "Enterprise support is scoped case by case. Contact us to discuss what your organization needs.",
  },
];

