import { Shield, Cpu, Workflow } from "lucide-react";
import { FlowNode, DetailCard } from "./OrchestratorShowcase.types";

export const flowNodes: FlowNode[] = [
  { id: "input", label: "Input", sublabel: "Fiat / Crypto", x: 120, y: 168 },
  { id: "orchestrator", label: "Orchestrator", sublabel: "Escrow / Vault", x: 360, y: 168 },
  { id: "output", label: "Output", sublabel: "Seller Settlement", x: 600, y: 168 },
];

export const detailCards: DetailCard[] = [
  {
    key: "security",
    title: "Security Layer",
    eyebrow: "Trust boundary",
    icon: Shield,
    summary:
      "Every transfer is wrapped in encrypted instructions and isolated account contexts before funds ever reach the settlement path.",
    bullets: [
      "AES-256 protects payload metadata and settlement instructions while signatures preserve replay safety.",
      "Stellar account isolation keeps buyer escrow, bridge vault, and seller balances compartmentalized by role.",
      "prepare() validates participants and seeds the escrow envelope before authorization can continue.",
    ],
    callout: "The first gate guarantees the orchestrator never mixes custody states across counterparties.",
    method: "prepare()",
    docHref:
      "https://github.com/OFFER-HUB/offer-hub-monorepo/blob/main/docs/architecture/overview.md",
    docLabel: "Architecture overview",
  },
  {
    key: "liquidity",
    title: "Liquidity Engine",
    eyebrow: "Bridge + settlement rail",
    icon: Cpu,
    summary:
      "Trustlines and vault balances let OFFER-HUB route value from fiat on-ramp or crypto deposit into a stable USDC settlement layer.",
    bullets: [
      "USDC on Stellar acts as the neutral settlement asset for payouts and cross-rail accounting.",
      "Bridge liquidity is staged in vault accounts so conversion and seller release stay deterministic.",
      "authorize() locks approved liquidity paths and confirms the exact release conditions for the seller.",
    ],
    callout: "Liquidity is reserved before release, so the visible seller payout is backed by an available trustline path.",
    method: "authorize()",
    docHref:
      "https://github.com/OFFER-HUB/offer-hub-monorepo/blob/main/docs/architecture/payment-flows.md",
    docLabel: "Payment flows",
  },
  {
    key: "logic",
    title: "Logic Gate",
    eyebrow: "State machine control",
    icon: Workflow,
    summary:
      "A granular SDK state machine coordinates escrow creation, approval, dispute handling, and release with explicit transitions.",
    bullets: [
      "The SDK models each payment as a sequence of auditable states instead of a single opaque transaction.",
      "Granular transitions reduce ambiguity for refunds, partial completion, and dispute-triggered holds.",
      "finalize() commits the release, updates balances, and emits the terminal state for downstream reporting.",
    ],
    callout: "The SDK turns complex backend choreography into a small set of explicit method calls and irreversible checkpoints.",
    method: "finalize()",
    docHref:
      "https://github.com/OFFER-HUB/offer-hub-monorepo/blob/main/docs/architecture/data-model.md",
    docLabel: "Data model",
  },
];
