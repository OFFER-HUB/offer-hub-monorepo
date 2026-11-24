import {
  ShieldCheck,
  Building2,
  Zap,
  FileText,
  Lock,
  Search,
  Key,
} from "lucide-react";

import { DOCS_REPO_BLOB_BASE } from "@/constants/github";
import {
  STELLAR_FEES_SOURCE,
  STELLAR_LEDGERS_SOURCE,
} from "../metrics-sources";
import type { UseCaseData } from "../types";

export const useCaseData: UseCaseData = {
  id: "real-estate",
  label: "Real Estate",
  icon: Building2,
  seo: {
    title: "Real Estate Escrow",
    description:
      "Non-custodial real estate escrow: deposit locking, condition-based release against inspection reports, and on-chain dispute settlement.",
    keywords: [
      "real estate escrow",
      "rental deposit",
      "property settlement",
      "Stellar USDC",
      "OFFER-HUB",
    ],
  },
  hero: {
    badgeLabel: "CASE STUDY: LVL-4 REAL WORLD",
    headline: "Securing Deposits, Removing Counterparty Risk",
    subheadline:
      "The real estate escrow blueprint: non-custodial deposit locking, condition-based release against inspection reports, and on-chain dispute settlement — for rental and purchase transactions, globally.",
    docsUrl:
      "https://github.com/OFFER-HUB/offer-hub-monorepo/blob/main/docs/business/use-cases.md",
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
  },
  summary: {
    eyebrow: "Why property teams use it",
    title: "Deposits neither side controls alone",
    body: "Tenant funds sit in escrow instead of a landlord or agent bank account. Inspection outcomes decide the release, and every step leaves an on-chain record if a dispute needs evidence.",
  },
  features: [
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
  ],
  flow: [
    {
      stepNumber: 1,
      label: "Lease Agreement",
      status: "CREATED",
      icon: FileText,
      apiMethod: "POST /escrow/init",
      apiSnippet: "oh.escrows.init({ tenant, landlord, deposit, leaseTerms })",
      description:
        "Both parties sign the lease and agree on deposit conditions. The escrow contract is initialized with the agreed terms off-chain, referencing both wallets.",
      isOnChain: false,
    },
    {
      stepNumber: 2,
      label: "Deposit Lock",
      status: "FUNDED",
      icon: Lock,
      apiMethod: "POST /escrow/:id/fund",
      apiSnippet: "oh.escrows.fund(depositId, { amount, asset: 'USDC' })",
      description:
        "The tenant's security deposit is locked into the on-chain escrow vault, removing the landlord's unilateral control over funds entirely.",
      isOnChain: true,
    },
    {
      stepNumber: 3,
      label: "Property Inspection",
      status: "AWAITING_RELEASE",
      icon: Search,
      apiMethod: "POST /inspection/:id/verify",
      apiSnippet: "oh.inspection.verify(propertyId, { reportId })",
      description:
        "At lease end, the property is inspected against the agreed condition report. The verified outcome determines how the deposit is released or disputed.",
      isOnChain: false,
    },
    {
      stepNumber: 4,
      label: "Deposit Settlement",
      status: "SUCCEEDED",
      icon: Key,
      apiMethod: "POST /escrow/:id/release",
      apiSnippet: "oh.escrows.release(depositId)",
      description:
        "The deposit is atomically settled based on the inspection outcome: full return to tenant, partial deduction, or on-chain dispute — all recorded on Stellar.",
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
        "Stellar constrains ledger close time to a few seconds, so deposit settlements do not wait on batch processing.",
      source: STELLAR_LEDGERS_SOURCE,
    },
  ],
  code: {
    heading: "Integrate in minutes, not weeks",
    description:
      "The @offerhub/sdk handles deposit initialization, vault funding, and inspection-gated release in three explicit calls — no escrow agent required.",
    tabs: [
      {
        id: "server",
        label: "server.ts",
        language: "typescript",
        description:
          "Deposit escrow initialization and vault funding on the server side.",
        docHref: `${DOCS_REPO_BLOB_BASE}/docs/api/overview.md`,
        docLabel: "API Reference",
        code: `import { OfferHub } from "@offerhub/sdk";

// Initialize SDK — The Orchestrator mirrors your property platform state
const oh = new OfferHub({ apiKey: process.env.OFFERHUB_API_KEY! });

// Deposit Escrow: initialize a non-custodial security deposit
const deposit = await oh.escrows.init({
  tenant:     "did:stellar:GTENANT...",
  landlord:   "did:stellar:GLANDLORD...",
  amount:     2000,
  asset:      "USDC",
  conditions: {
    inspectionRequired: true,
    releaseWindow:      30,   // days after lease ends
  },
});

// Fund the on-chain vault — tenant signs and funds the escrow
await oh.escrows.fund(deposit.id, {
  walletId: "wallet_01HTENANT...",
});`,
      },
      {
        id: "client",
        label: "client.js",
        language: "javascript",
        description:
          "Inspection verification and deposit settlement at lease end.",
        docHref: `${DOCS_REPO_BLOB_BASE}/docs/sdk/integration-guide.md`,
        docLabel: "SDK Guide",
        code: `import { OfferHub } from "@offerhub/sdk";

// Client-side SDK use a public/restricted key.
const oh = new OfferHub({
  apiKey: "oh_demo_xxxxxxxxxxxx",
});

// End-of-lease: verify inspection report and settle the deposit.
// Pass a reportId from your property inspection service.
// The Orchestrator determines full return, deduction, or split.
await oh.inspection.verify(
  deposit.propertyId,
  { reportId: "report_xlease_2026..." },
);

// Release settlement — full return, partial deduction, or split
await oh.escrows.release(deposit.id);`,
      },
    ],
    sdkCards: [
      {
        method: "oh.escrows.init()",
        label: "Escrow Initialization",
        detail:
          "Creates a deposit escrow with agreed conditions, inspection gates, and release window.",
      },
      {
        method: "oh.escrows.fund()",
        label: "Deposit Lock",
        detail:
          "Tenant funds the on-chain vault. Neither party can withdraw unilaterally.",
      },
      {
        method: "oh.escrows.release()",
        label: "Settlement",
        detail:
          "Releases deposit based on inspection outcome — full return, deduction, or split.",
      },
    ],
  },
};

export const heroData = useCaseData.hero;
export const featureCards = useCaseData.features;
export const ESCROW_STEPS = useCaseData.flow;
