import {
  ShieldCheck,
  Zap,
  Globe,
  ShoppingCart,
  Truck,
  CheckCircle,
} from "lucide-react";

import { DOCS_REPO_BLOB_BASE } from "@/constants/github";
import {
  STELLAR_FEES_SOURCE,
  STELLAR_LEDGERS_SOURCE,
} from "../metrics-sources";
import type { UseCaseData } from "../types";

export const useCaseData: UseCaseData = {
  id: "ecommerce",
  label: "eCommerce",
  icon: ShoppingCart,
  seo: {
    title: "eCommerce Escrow",
    description:
      "Buyer and seller protection for eCommerce: delivery escrow, automatic release, and on-chain dispute resolution on Stellar.",
    keywords: [
      "ecommerce escrow",
      "buyer protection",
      "delivery escrow",
      "Stellar USDC",
      "OFFER-HUB",
    ],
  },
  hero: {
    badgeLabel: "CASE STUDY: LVL-2 COMMERCE",
    headline: "Protecting Every Transaction, Buyer to Seller",
    subheadline:
      "A deep dive into escrow-secured e-commerce: automatic delivery escrow, buyer-protection windows, dispute handling, and instant seller payouts on Stellar — without custodial risk.",
    docsUrl:
      "https://github.com/OFFER-HUB/offer-hub-monorepo/blob/main/docs/business/use-cases.md#use-case-2-e-commerce-marketplace",
    stats: [
      { label: "Target", value: "B2C / eCommerce", accent: "Marketplace Scope" },
      { label: "Provider", value: "Stellar (USDC)", accent: "Settlement Layer" },
      {
        label: "Features",
        value: "Delivery Escrow, Auto-Release, Dispute Refunds",
        accent: "Release Logic",
      },
    ],
  },
  summary: {
    eyebrow: "Why commerce teams use it",
    title: "Funds move only when delivery is confirmed",
    body: "Buyer payment is locked before the seller ships. Delivery confirmation releases the funds automatically, and a structured dispute path keeps refunds transparent when something goes wrong.",
  },
  features: [
    {
      icon: ShieldCheck,
      title: "Buyer & Seller Protection",
      body: "Buyer funds are locked on-chain before the seller ships. Neither party can be defrauded — the escrow is the source of truth for every order.",
    },
    {
      icon: Zap,
      title: "Automatic Release on Delivery",
      body: "Funds release the moment delivery is confirmed — by tracking API, signature scan, or a buyer click — removing payout batch delays entirely.",
    },
    {
      icon: Globe,
      title: "On-Chain Dispute Resolution",
      body: "If an order is missing or misrepresented, the buyer opens a structured on-chain dispute. The outcome — release, refund, or split — is transparent and final.",
    },
  ],
  flow: [
    {
      stepNumber: 1,
      label: "Order Placement",
      status: "CREATED",
      icon: ShoppingCart,
      apiMethod: "POST /orders",
      apiSnippet:
        "oh.orders.create({ buyer, seller, amount, deliveryWindow: 7 })",
      description:
        "The buyer initiates a purchase. An escrow-safe payment intent is created off-chain, referencing both buyer and seller wallets.",
      isOnChain: false,
    },
    {
      stepNumber: 2,
      label: "Escrow Funding",
      status: "FUNDED",
      icon: ShieldCheck,
      apiMethod: "POST /escrow/:id/fund",
      apiSnippet:
        "oh.escrows.fund(orderId, { walletId: 'wallet_01HKXYZ...' })",
      description:
        "The buyer's payment is locked into the on-chain escrow vault, guaranteeing funds are available for the seller upon confirmed delivery.",
      isOnChain: true,
    },
    {
      stepNumber: 3,
      label: "Delivery Window",
      status: "AWAITING_RELEASE",
      icon: Truck,
      apiMethod: "POST /orders/:id/confirm",
      apiSnippet: "oh.orders.trackDelivery(orderId)",
      description:
        "The delivery window opens. The seller ships the item; the buyer has 7 days to confirm receipt or open a dispute before automatic release.",
      isOnChain: false,
    },
    {
      stepNumber: 4,
      label: "Release or Refund",
      status: "SUCCEEDED",
      icon: CheckCircle,
      apiMethod: "POST /resolution/release",
      apiSnippet: "oh.orders.confirmDelivery(orderId)",
      description:
        "Buyer confirms delivery (or the window expires). Funds are atomically released to the seller — or refunded on a successful dispute.",
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
        "Stellar constrains ledger close time to a few seconds, so order releases settle without long confirmation waits.",
      source: STELLAR_LEDGERS_SOURCE,
    },
  ],
  code: {
    heading: "Integrate in minutes, not weeks",
    description:
      "The @offerhub/sdk handles order creation, escrow funding, and delivery confirmation in three explicit calls — no manual fund management required.",
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
        language: "javascript",
        description:
          "Delivery confirmation from the buyer — triggers on-chain fund release.",
        docHref: `${DOCS_REPO_BLOB_BASE}/docs/sdk/integration-guide.md`,
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
    ],
    sdkCards: [
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
    ],
  },
};

export const heroData = useCaseData.hero;
export const featureCards = useCaseData.features;
export const ESCROW_STEPS = useCaseData.flow;
