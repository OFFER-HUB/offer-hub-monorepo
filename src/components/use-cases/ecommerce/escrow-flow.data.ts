import { ShoppingCart, ShieldCheck, Truck, CheckCircle } from "lucide-react";
import type { EscrowStep } from "../shared/EscrowFlowDiagram";

export const ESCROW_STEPS: EscrowStep[] = [
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
    apiSnippet: "oh.escrows.fund(orderId, { walletId: 'wallet_01HKXYZ...' })",
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
];
