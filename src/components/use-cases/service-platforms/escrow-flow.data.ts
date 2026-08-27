import { Layers, ShieldCheck, FileCheck, Zap } from "lucide-react";
import type { EscrowStep } from "../shared/EscrowFlowDiagram";

export const ESCROW_STEPS: EscrowStep[] = [
  {
    stepNumber: 1,
    label: "Scope & SOW",
    status: "CREATED",
    icon: FileCheck,
    apiMethod: "POST /contracts/init",
    apiSnippet: "oh.contracts.create({ client, provider, scope, milestones })",
    description:
      "Client and provider agree on scope, milestones, and payment terms. The contract is initialized with a statement of work off-chain before any funds are committed.",
    isOnChain: false,
  },
  {
    stepNumber: 2,
    label: "Client Funding",
    status: "FUNDED",
    icon: ShieldCheck,
    apiMethod: "POST /escrow/:id/fund",
    apiSnippet: "oh.escrows.fund(contractId, { walletId })",
    description:
      "The client's full project budget is locked into the on-chain escrow vault, guaranteeing payment for all agreed milestones before work begins.",
    isOnChain: true,
  },
  {
    stepNumber: 3,
    label: "Milestone Delivery",
    status: "AWAITING_RELEASE",
    icon: Layers,
    apiMethod: "POST /milestones/:id/submit",
    apiSnippet: "oh.milestones.submit(milestoneId, { deliverables })",
    description:
      "The provider submits work for each milestone. The client reviews deliverables against the SOW criteria and approves or opens a structured dispute.",
    isOnChain: false,
  },
  {
    stepNumber: 4,
    label: "Release or Dispute",
    status: "SUCCEEDED",
    icon: Zap,
    apiMethod: "POST /resolution/release",
    apiSnippet: "oh.milestones.approve(contractId, milestoneId)",
    description:
      "Approved milestones release funds instantly. Disputed work enters on-chain structured resolution — with release, refund, or split outcomes, all recorded on Stellar.",
    isOnChain: true,
  },
];
