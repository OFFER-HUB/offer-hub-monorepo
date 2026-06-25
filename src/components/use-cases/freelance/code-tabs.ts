import { Server, Monitor } from "lucide-react";
import type {
  CodeIntegrationShowcaseProps,
  CodeTab,
  SdkCard,
} from "@/components/use-cases/shared/CodeIntegrationShowcase";

export const description: CodeIntegrationShowcaseProps["description"] =
  "mirrors your orchestrator state with a small set of explicit method calls — escrow creation, vault funding, and milestone release in three lines.";

export const tabs: CodeTab[] = [
  {
    id: "server",
    label: "server.ts",
    lang: "typescript",
    icon: Server,
    description: "Order creation and escrow funding on the server side.",
    docHref:
      "https://github.com/OFFER-HUB/offer-hub-monorepo/blob/main/docs/api/overview.md",
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
    lang: "javascript",
    icon: Monitor,
    description:
      "Milestone approval from the client side — triggers on-chain settlement.",
    docHref:
      "https://github.com/OFFER-HUB/offer-hub-monorepo/blob/main/docs/sdk/integration-guide.md",
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
];

export const sdkCards: SdkCard[] = [
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
];
