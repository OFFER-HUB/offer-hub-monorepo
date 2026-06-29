import { Zap, ShieldCheck, Eye, Briefcase, Globe } from "lucide-react";
import type { SimpleMetricCard } from "../shared/StellarImpactCards";
import type { FeatureCard } from "../shared/SectionLayout";

// ── Features grid content (rendered in the #features section) ──
export const featureCards: FeatureCard[] = [
  {
    icon: Briefcase,
    title: "SOW-Backed Contracts",
    body: "Every engagement starts with a statement of work locked on-chain. Scope, milestones, and payment terms are immutable once both parties sign.",
  },
  {
    icon: ShieldCheck,
    title: "Milestone-Gated Payments",
    body: "Providers receive each tranche only after the corresponding deliverable is approved, eliminating late or non-payment risk for service professionals.",
  },
  {
    icon: Globe,
    title: "Structured Dispute Resolution",
    body: "Built-in on-chain arbitration ensures every dispute has a clear, auditable outcome — release, refund, or split — visible to all stakeholders.",
  },
];

export const stellarImpactCardsData: SimpleMetricCard[] = [
  {
    label: "Invoice Settlement",
    offerhub: "3.2s",
    traditional: "30–45 days",
    icon: Zap,
    savingsLabel: "Faster",
    savingsValue: "1,000,000×",
    description:
      "Funds released on Stellar the moment a milestone is approved.",
    higherIsBetter: false,
  },
  {
    label: "Provider Risk",
    offerhub: "0%",
    traditional: "23%",
    icon: ShieldCheck,
    savingsLabel: "Risk eliminated",
    savingsValue: "↓ 100%",
    description:
      "Client budget is locked on-chain before work starts — providers can't be ghosted.",
    higherIsBetter: false,
  },
  {
    label: "Scope Transparency",
    offerhub: "100%",
    traditional: "0%",
    icon: Eye,
    savingsLabel: "Auditability",
    savingsValue: "On-chain",
    description:
      "Every milestone, approval, and resolution is permanently recorded on-chain.",
    higherIsBetter: true,
  },
];

export const stellarImpactSummary = {
  offerhub: {
    text: (
      <>
        Offer Hub{" "}
        <span className="text-content-primary font-bold">
          eliminates unpaid invoice risk entirely
        </span>{" "}
        and settles{" "}
        <span className="text-theme-primary font-bold">
          1,000,000× faster
        </span>{" "}
        than Net-30 terms — with every decision permanently on-chain.
      </>
    ),
  },
  traditional: {
    text: (
      <>
        Traditional service billing relies on trust,{" "}
        <span className="text-content-primary font-bold">
          invoicing delays of 30–45 days
        </span>
        , and{" "}
        <span className="text-theme-warning font-bold">
          23% non-payment risk
        </span>{" "}
        — with no on-chain accountability.
      </>
    ),
  },
};
