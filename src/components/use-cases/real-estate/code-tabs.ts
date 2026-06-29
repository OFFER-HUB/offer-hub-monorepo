import { Server, Monitor } from "lucide-react";
import type {
  CodeIntegrationShowcaseProps,
  CodeTab,
  SdkCard,
} from "@/components/use-cases/shared/CodeIntegrationShowcase";

export const description: CodeIntegrationShowcaseProps["description"] =
  "handles deposit initialization, vault funding, and inspection-gated release in three explicit calls — no escrow agent required.";

export const tabs: CodeTab[] = [
  {
    id: "server",
    label: "server.ts",
    lang: "typescript",
    icon: Server,
    description:
      "Deposit escrow initialization and vault funding on the server side.",
    docHref:
      "https://github.com/OFFER-HUB/offer-hub-monorepo/blob/main/docs/api/overview.md",
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
    lang: "javascript",
    icon: Monitor,
    description:
      "Inspection verification and deposit settlement at lease end.",
    docHref:
      "https://github.com/OFFER-HUB/offer-hub-monorepo/blob/main/docs/sdk/integration-guide.md",
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
];

export const sdkCards: SdkCard[] = [
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
];
