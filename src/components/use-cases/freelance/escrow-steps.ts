import { Lock, ShieldCheck, Layers, Zap } from "lucide-react";
import type { EscrowStep } from "@/components/use-cases/shared/EscrowFlowDiagram";

export const FREELANCE_ESCROW_STEPS: EscrowStep[] = [
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
];
