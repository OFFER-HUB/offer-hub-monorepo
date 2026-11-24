import {
  Zap,
  ShieldCheck,
  Coins,
  Globe,
  FileText,
  Wallet,
  CheckSquare,
} from "lucide-react";

import { DOCS_REPO_BLOB_BASE } from "@/constants/github";
import {
  STELLAR_FEES_SOURCE,
  STELLAR_LEDGERS_SOURCE,
} from "../metrics-sources";
import type { UseCaseData } from "../types";

export const useCaseData: UseCaseData = {
  id: "dao-payroll",
  label: "DAO Payroll",
  icon: Coins,
  seo: {
    title: "DAO Payroll",
    description:
      "Trustless payroll for DAOs: on-chain budget allocation, contributor milestone verification, and atomic USDC distribution on Stellar.",
    keywords: [
      "DAO payroll",
      "contributor payments",
      "on-chain treasury",
      "Stellar USDC",
      "OFFER-HUB",
    ],
  },
  hero: {
    badgeLabel: "CASE STUDY: LVL-3 GOVERNANCE",
    headline: "Trustless Payroll for Decentralized Organizations",
    subheadline:
      "The DAO payroll blueprint: on-chain budget allocation, contributor milestone verification, and atomic USDC distribution — with full governance auditability and zero custodial risk.",
    docsUrl:
      "https://github.com/OFFER-HUB/offer-hub-monorepo/blob/main/docs/business/use-cases.md",
    stats: [
      {
        label: "Target",
        value: "DAO / Web3 Organization",
        accent: "Payroll Scope",
      },
      { label: "Provider", value: "Stellar (USDC)", accent: "Settlement Layer" },
      {
        label: "Features",
        value: "Budget Escrow, Milestone Payroll, Transparent Distribution",
        accent: "Release Logic",
      },
    ],
  },
  summary: {
    eyebrow: "Why DAOs use it",
    title: "Payroll the treasury can prove",
    body: "Approved budgets are locked in escrow at the start of each epoch. Contributors see the funds are secured, and every allocation, approval, and payout is recorded on Stellar for members to audit.",
  },
  features: [
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
  ],
  flow: [
    {
      stepNumber: 1,
      label: "Budget Proposal",
      status: "CREATED",
      icon: FileText,
      apiMethod: "POST /payroll/init",
      apiSnippet: "oh.payroll.create({ dao, contributors, budget, period })",
      description:
        "The DAO treasury proposal is submitted and approved via governance vote. A payroll escrow is initialized off-chain referencing all contributors and allocations.",
      isOnChain: false,
    },
    {
      stepNumber: 2,
      label: "Fund Allocation",
      status: "FUNDED",
      icon: Wallet,
      apiMethod: "POST /escrow/:id/fund",
      apiSnippet: "oh.escrows.fund(payrollId, { amount, asset: 'USDC' })",
      description:
        "The DAO treasury allocates the approved budget into the on-chain escrow vault. Funds are locked and verifiable on Stellar for all members.",
      isOnChain: true,
    },
    {
      stepNumber: 3,
      label: "Work Verification",
      status: "AWAITING_RELEASE",
      icon: CheckSquare,
      apiMethod: "POST /milestones/:id/verify",
      apiSnippet: "oh.milestones.verify(milestoneId)",
      description:
        "Contributor work is reviewed against the agreed deliverables. Governance or a designated reviewer verifies completion off-chain before releasing funds.",
      isOnChain: false,
    },
    {
      stepNumber: 4,
      label: "Payroll Distribution",
      status: "SUCCEEDED",
      icon: Zap,
      apiMethod: "POST /payroll/:id/distribute",
      apiSnippet: "oh.payroll.distribute(payrollId)",
      description:
        "Verified contributors receive their allocation atomically. Stellar settles each transfer in under 5 seconds — no batch delays, no custodial risk.",
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
        "Stellar constrains ledger close time to a few seconds, so contributor payouts settle without long confirmation waits.",
      source: STELLAR_LEDGERS_SOURCE,
    },
  ],
  code: {
    heading: "Integrate in minutes, not weeks",
    description:
      "The @offerhub/sdk handles DAO payroll creation, treasury funding, and atomic contributor distribution in three explicit calls — no manual payroll management required.",
    tabs: [
      {
        id: "server",
        label: "server.ts",
        language: "typescript",
        description:
          "Payroll epoch creation and treasury escrow funding on the server side.",
        docHref: `${DOCS_REPO_BLOB_BASE}/docs/api/overview.md`,
        docLabel: "API Reference",
        code: `import { OfferHub } from "@offerhub/sdk";

// Initialize SDK — The Orchestrator mirrors your DAO's backend state
const oh = new OfferHub({ apiKey: process.env.OFFERHUB_API_KEY! });

// Payroll Epoch: initialize a payroll period for the DAO
const payroll = await oh.payroll.create({
  dao:    "did:stellar:GDAO...",
  period: "2026-Q1",
  budget: 12000,
  asset:  "USDC",
  contributors: [
    { id: "did:stellar:GCONTRIB1...", allocation: 5000 },
    { id: "did:stellar:GCONTRIB2...", allocation: 7000 },
  ],
});

// Fund the on-chain escrow vault — DAO treasury wallet is debited
await oh.escrows.fund(payroll.id, {
  walletId: "wallet_dao_treasury...",
});`,
      },
      {
        id: "client",
        label: "client.js",
        language: "javascript",
        description:
          "Milestone verification and payroll distribution — triggers on-chain settlement.",
        docHref: `${DOCS_REPO_BLOB_BASE}/docs/sdk/integration-guide.md`,
        docLabel: "SDK Guide",
        code: `import { OfferHub } from "@offerhub/sdk";

// Governance dashboard SDK use a public/restricted key
const oh = new OfferHub({
  apiKey: "oh_demo_xxxxxxxxxxxx",
});

// After governance vote passes, verify contributor milestone
// and distribute the approved payroll atomically.
// Stellar settles each contributor transfer in under 5 seconds.
await oh.milestones.verify(milestoneId);

await oh.payroll.distribute(
  payroll.id,   // payrollId — references the escrow envelope
);`,
      },
    ],
    sdkCards: [
      {
        method: "oh.payroll.create()",
        label: "Payroll Initialization",
        detail:
          "Bootstraps a DAO payroll epoch with contributor allocations and treasury reference.",
      },
      {
        method: "oh.escrows.fund()",
        label: "Budget Lock",
        detail:
          "Locks treasury funds on-chain per epoch. Atomic and fully auditable.",
      },
      {
        method: "oh.payroll.distribute()",
        label: "Atomic Distribution",
        detail: "Releases payroll to all verified contributors in one call.",
      },
    ],
  },
};

export const heroData = useCaseData.hero;
export const featureCards = useCaseData.features;
export const ESCROW_STEPS = useCaseData.flow;
