import {
  Zap,
  ShieldCheck,
  Briefcase,
  Globe,
  FileCheck,
  Layers,
} from "lucide-react";

import { DOCS_REPO_BLOB_BASE } from "@/constants/github";
import {
  STELLAR_FEES_SOURCE,
  STELLAR_LEDGERS_SOURCE,
} from "../metrics-sources";
import type { UseCaseData } from "../types";

export const useCaseData: UseCaseData = {
  id: "service-platforms",
  label: "Service Platforms",
  icon: Briefcase,
  seo: {
    title: "Service Platform Escrow",
    description:
      "Milestone-locked escrow for professional services: SOW-based contracts, milestone-gated releases, and instant settlement on Stellar.",
    keywords: [
      "service platform escrow",
      "professional services",
      "milestone payments",
      "Stellar USDC",
      "OFFER-HUB",
    ],
  },
  hero: {
    badgeLabel: "CASE STUDY: LVL-5 ENTERPRISE",
    headline: "Milestone-Locked Escrow for Professional Services",
    subheadline:
      "The professional services platform blueprint: SOW-based escrow, milestone-gated releases, structured dispute resolution, and instant settlement — for legal, consulting, design, and managed services.",
    docsUrl:
      "https://github.com/OFFER-HUB/offer-hub-monorepo/blob/main/docs/business/use-cases.md#use-case-3-service-marketplace",
    stats: [
      {
        label: "Target",
        value: "B2B / Service Marketplace",
        accent: "Platform Scope",
      },
      { label: "Provider", value: "Stellar (USDC)", accent: "Settlement Layer" },
      {
        label: "Features",
        value: "SOW Escrow, Milestone Gates, On-chain Disputes",
        accent: "Release Logic",
      },
    ],
  },
  summary: {
    eyebrow: "Why service platforms use it",
    title: "Every milestone funded before work starts",
    body: "The full project budget is locked when the statement of work is signed. Providers get paid as deliverables are approved, and clients keep a clear, auditable path if scope or quality is disputed.",
  },
  features: [
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
  ],
  flow: [
    {
      stepNumber: 1,
      label: "Scope & SOW",
      status: "CREATED",
      icon: FileCheck,
      apiMethod: "POST /contracts/init",
      apiSnippet: "oh.contracts.create({ client, provider, scope, milestones })",
      description:
        "Client and provider agree on scope, milestones, and payment terms. The contract is initialized with a statement of work off-chain before any funds are committed.",
      isOnChain: false,
    },
    {
      stepNumber: 2,
      label: "Client Funding",
      status: "FUNDED",
      icon: ShieldCheck,
      apiMethod: "POST /escrow/:id/fund",
      apiSnippet: "oh.escrows.fund(contractId, { walletId })",
      description:
        "The client's full project budget is locked into the on-chain escrow vault, guaranteeing payment for all agreed milestones before work begins.",
      isOnChain: true,
    },
    {
      stepNumber: 3,
      label: "Milestone Delivery",
      status: "AWAITING_RELEASE",
      icon: Layers,
      apiMethod: "POST /milestones/:id/submit",
      apiSnippet: "oh.milestones.submit(milestoneId, { deliverables })",
      description:
        "The provider submits work for each milestone. The client reviews deliverables against the SOW criteria and approves or opens a structured dispute.",
      isOnChain: false,
    },
    {
      stepNumber: 4,
      label: "Release or Dispute",
      status: "SUCCEEDED",
      icon: Zap,
      apiMethod: "POST /resolution/release",
      apiSnippet: "oh.milestones.approve(contractId, milestoneId)",
      description:
        "Approved milestones release funds instantly. Disputed work enters on-chain structured resolution — with release, refund, or split outcomes, all recorded on Stellar.",
      isOnChain: true,
    },
  ],
  metrics: [
    {
      id: "base-fee",
      label: "Network base fee",
      value: "0.00001",
      unit: "XLM",
      description:
        "Stellar's minimum base fee is 100 stroops (0.00001 XLM) per operation.",
      source: STELLAR_FEES_SOURCE,
    },
    {
      id: "ledger-close",
      label: "Ledger close time",
      value: "a few",
      unit: "seconds",
      description:
        "Stellar constrains ledger close time to a few seconds, so approved milestones settle without long confirmation waits.",
      source: STELLAR_LEDGERS_SOURCE,
    },
  ],
  code: {
    heading: "Integrate in minutes, not weeks",
    description:
      "The @offerhub/sdk turns a scope of work into a milestone-based contract — creation, budget funding, and per-milestone release in three explicit calls.",
    tabs: [
      {
        id: "server",
        label: "server.ts",
        language: "typescript",
        description:
          "Service contract creation and budget funding on the server side.",
        docHref: `${DOCS_REPO_BLOB_BASE}/docs/api/overview.md`,
        docLabel: "API Reference",
        code: `import { OfferHub } from "@offerhub/sdk";

const oh = new OfferHub({ apiKey: process.env.OFFERHUB_API_KEY! });

// Create a milestone-based service contract
const contract = await oh.contracts.create({
  client: "GCLIENT_WALLET_ADDRESS",
  provider: "GPROVIDER_WALLET_ADDRESS",
  amount: 8000,
  asset: "USDC",
  currency: "USD",
  milestones: [
    { title: "UX Research & Wireframes", percentage: 30 },
    { title: "Design & Prototyping",     percentage: 40 },
    { title: "Final Delivery & QA",      percentage: 30 },
  ],
});

// Client funds the full contract up-front
const escrow = await oh.escrows.fund(contract.id, {
  walletId: "GCLIENT_WALLET_ADDRESS",
});

console.log("Contract funded:", escrow.status);
// Output: Contract funded: ACTIVE`,
      },
      {
        id: "client",
        label: "client.js",
        language: "javascript",
        description:
          "Milestone approval from the client side — releases the matching payment.",
        docHref: `${DOCS_REPO_BLOB_BASE}/docs/sdk/integration-guide.md`,
        docLabel: "SDK Guide",
        code: `import { OfferHub } from "@offerhub/sdk";

const oh = new OfferHub({ apiKey: process.env.OFFERHUB_API_KEY });

// Provider completes milestone 1 — client approves
const approval = await oh.milestones.approve(
  contract.id,
  "milestone_01_id"
);

// Funds for that milestone are released immediately on Stellar
console.log("Milestone released:", approval.released);
// Output: Milestone released: 2400.00 USDC`,
      },
    ],
    sdkCards: [
      {
        method: "oh.contracts.create()",
        label: "Contract Creation",
        detail: "Initialize a milestone-based service contract with SOW terms.",
      },
      {
        method: "oh.escrows.fund()",
        label: "Budget Lock",
        detail: "Lock the full project budget on-chain before work begins.",
      },
      {
        method: "oh.milestones.approve()",
        label: "Milestone Approval",
        detail:
          "Approve a milestone and instantly release the corresponding payment.",
      },
    ],
  },
};

export const heroData = useCaseData.hero;
export const featureCards = useCaseData.features;
export const ESCROW_STEPS = useCaseData.flow;
