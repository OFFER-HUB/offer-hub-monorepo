import { Server, Monitor } from "lucide-react";
import type {
  CodeIntegrationShowcaseProps,
  CodeTab,
  SdkCard,
} from "@/components/use-cases/shared/CodeIntegrationShowcase";

export const description: CodeIntegrationShowcaseProps["description"] =
  "handles order creation, escrow funding, and delivery confirmation in three explicit calls — no manual fund management required.";

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

// Order Creation: creates an escrow-safe purchase with a delivery window
const order = await oh.orders.create({
  buyer:          "did:stellar:GBUYER...",
  seller:         "did:stellar:GSELLER...",
  amount:         100,
  asset:          "USDC",
  deliveryWindow: 7,        // days buyer has to confirm delivery
});

// Escrow Funding: lock buyer funds on-chain — vault is debited atomically
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
      "Delivery confirmation from the buyer — triggers on-chain fund release.",
    docHref:
      "https://github.com/OFFER-HUB/offer-hub-monorepo/blob/main/docs/sdk/integration-guide.md",
    docLabel: "SDK Guide",
    code: `import { OfferHub } from "@offerhub/sdk";

// Client-side SDK use a public/restricted key.
const oh = new OfferHub({
  apiKey: "oh_demo_xxxxxxxxxxxx",
});

// Buyer confirms delivery — triggers automatic fund release to the seller.
// If the delivery window expires with no action, release is automatic.
// For disputes, call oh.disputes.open() instead.
await oh.orders.confirmDelivery(
  order.id,    // orderId — references the escrow envelope
);`,
  },
];

export const sdkCards: SdkCard[] = [
  {
    method: "oh.orders.create()",
    label: "Order Creation",
    detail:
      "Creates an escrow-safe purchase with a delivery window and atomic refund path.",
  },
  {
    method: "oh.escrows.fund()",
    label: "Escrow Funding",
    detail: "Locks buyer funds on-chain atomically before shipment begins.",
  },
  {
    method: "oh.orders.confirmDelivery()",
    label: "Delivery Confirmation",
    detail: "Releases funds to seller on confirmation or window expiry.",
  },
];
