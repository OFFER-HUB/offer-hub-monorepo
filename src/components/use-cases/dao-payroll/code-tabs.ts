import { Server, Monitor } from "lucide-react";
import type {
  CodeIntegrationShowcaseProps,
  CodeTab,
  SdkCard,
} from "@/components/use-cases/shared/CodeIntegrationShowcase";

export const description: CodeIntegrationShowcaseProps["description"] =
  "handles DAO payroll creation, treasury funding, and atomic contributor distribution in three explicit calls — no manual payroll management required.";

export const tabs: CodeTab[] = [
  {
    id: "server",
    label: "server.ts",
    lang: "typescript",
    icon: Server,
    description:
      "Payroll epoch creation and treasury escrow funding on the server side.",
    docHref:
      "https://github.com/OFFER-HUB/offer-hub-monorepo/blob/main/docs/api/overview.md",
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
    lang: "javascript",
    icon: Monitor,
    description:
      "Milestone verification and payroll distribution — triggers on-chain settlement.",
    docHref:
      "https://github.com/OFFER-HUB/offer-hub-monorepo/blob/main/docs/sdk/integration-guide.md",
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
];

export const sdkCards: SdkCard[] = [
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
    detail:
      "Releases payroll to all verified contributors in one call.",
  },
];
