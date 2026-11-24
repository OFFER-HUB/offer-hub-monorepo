import {
  ShieldCheck,
  Zap,
  Globe,
  Users,
  Lock,
  Layers,
} from "lucide-react";

import { DOCS_REPO_BLOB_BASE } from "@/constants/github";
import {
  STELLAR_FEES_SOURCE,
  STELLAR_LEDGERS_SOURCE,
} from "../metrics-sources";
import type { UseCaseData } from "../types";

export const useCaseData: UseCaseData = {
  id: "freelance",
  label: "Freelance",
  icon: Users,
  seo: {
    title: "Freelance Escrow",
    description:
      "Milestone escrow for freelance marketplaces: lock client funds, release on approved deliverables, and settle in USDC on Stellar.",
    keywords: [
      "freelance escrow",
      "milestone payments",
      "Stellar USDC",
      "OFFER-HUB",
    ],
  },
  hero: {
    badgeLabel: "CASE STUDY: LVL-1 REAL-WORLD",
    headline: "Orchestrating the Global Talent Economy",
    subheadline:
      "A live blueprint for escrow-backed freelance infrastructure: mapped payment flows, milestone controls, and global USDC settlement without custodial risk.",
    docsUrl:
      "https://github.com/OFFER-HUB/offer-hub-monorepo/blob/main/docs/business/use-cases.md#use-case-1-freelance-platform",
    stats: [
      { label: "Target", value: "B2B / Freelance", accent: "Marketplace Scope" },
      { label: "Provider", value: "Stellar (USDC)", accent: "Settlement Layer" },
      {
        label: "Features",
        value: "Milestones, Escrow, Global Settlement",
        accent: "Release Logic",
      },
    ],
  },
  summary: {
    eyebrow: "Why freelance teams use it",
    title: "Escrow that keeps both sides honest",
    body: "Client funds sit in a non-custodial Stellar escrow until each deliverable is approved. Pay is released milestone by milestone, with a permanent on-chain record both sides can verify.",
  },
  features: [
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
  ],
  flow: [
    {
      stepNumber: 1,
      label: "Proposal & Signing",
      status: "CREATED",
      icon: Lock,
      apiMethod: "POST /escrow/init",
      apiSnippet: "client.escrows.init({ buyer, seller, milestones })",
      description:
        "Both parties agree on milestones, deliverables, and payment terms. The escrow contract is initialized off-chain.",
      isOnChain: false,
    },
    {
      stepNumber: 2,
      label: "Funding the Vault",
      status: "FUNDED",
      icon: ShieldCheck,
      apiMethod: "POST /escrow/:id/fund",
      apiSnippet: "client.escrows.fund(escrowId, { amount, asset: 'USDC' })",
      description:
        "The buyer deposits funds into the on-chain escrow vault. Assets are locked and verifiable on Stellar.",
      isOnChain: true,
    },
    {
      stepNumber: 3,
      label: "Milestone Validation",
      status: "AWAITING_RELEASE",
      icon: Layers,
      apiMethod: "POST /resolution/release",
      apiSnippet: "client.milestones.approve(milestoneId)",
      description:
        "Work is submitted and verified against the agreed criteria. The platform validates completion off-chain.",
      isOnChain: false,
    },
    {
      stepNumber: 4,
      label: "Atomic Release",
      status: "SUCCEEDED",
      icon: Zap,
      apiMethod: "POST /resolution/release",
      apiSnippet: "client.escrows.release(escrowId)",
      description:
        "Funds are atomically released to the freelancer on-chain. Settlement is instant and irreversible.",
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
        "Stellar constrains ledger close time to a few seconds, so escrow events settle without long confirmation waits.",
      source: STELLAR_LEDGERS_SOURCE,
    },
  ],
  code: {
    heading: "Integrate in minutes, not weeks",
    description:
      "The @offerhub/sdk mirrors your orchestrator state with a small set of explicit method calls — escrow creation, vault funding, and milestone release in three lines.",
    tabs: [
      {
        id: "server",
        label: "server.ts",
        language: "typescript",
        description: "Order creation and escrow funding on the server side.",
        docHref: `${DOCS_REPO_BLOB_BASE}/docs/api/overview.md`,
        docLabel: "API Reference",
        code: `import { OfferHub } from "@offerhub/sdk";

// Initialize SDK — The Orchestrator mirrors your backend state
const oh = new OfferHub({ apiKey: process.env.OFFERHUB_API_KEY! });

// Order Creation: single call creates an escrow-safe payment intent
const order = await oh.orders.create({
  buyer:  "did:stellar:GCLIENT...",
  seller: "did:stellar:GFREELANCER...",
  amount: 1500,
  asset: "USDC",
  milestones: [
    { title: "Initial Delivery", percentage: 50 },
    { title: "Final Review",     percentage: 50 },
  ],
});

// Escrow Funding: lock funds on-chain — buyer wallet is debited
await oh.escrows.fund(order.id, {
  walletId: "wallet_01HKXYZ...",
});`,
      },
      {
        id: "client",
        label: "client.js",
        language: "javascript",
        description:
          "Milestone approval from the client side — triggers on-chain settlement.",
        docHref: `${DOCS_REPO_BLOB_BASE}/docs/sdk/integration-guide.md`,
        docLabel: "SDK Guide",
        code: `import { OfferHub } from "@offerhub/sdk";

// Client-side SDK use a public/restricted key.
const oh = new OfferHub({
  apiKey: "oh_demo_xxxxxxxxxxxx",
});

// Milestone Approval: release partial funds to the freelancer.
// The Orchestrator validates completion and triggers on-chain
// settlement — mirroring the state machine from the server side.
await oh.orders.approveMilestone(
  order.id,      // orderId    — references the escrow envelope
  milestoneId,   // milestoneId — specific deliverable checkpoint
);`,
      },
    ],
    sdkCards: [
      {
        method: "oh.orders.create()",
        label: "Order Creation",
        detail:
          "Creates an escrow-safe payment intent with milestone breakdown.",
      },
      {
        method: "oh.escrows.fund()",
        label: "Escrow Funding",
        detail: "Locks buyer funds on-chain. Vault is debited atomically.",
      },
      {
        method: "oh.orders.approveMilestone()",
        label: "Milestone Approval",
        detail:
          "Releases partial settlement to seller on milestone confirmation.",
      },
    ],
  },
};

export const heroData = useCaseData.hero;
export const featureCards = useCaseData.features;
export const ESCROW_STEPS = useCaseData.flow;
