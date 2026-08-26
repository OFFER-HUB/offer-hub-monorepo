import { FileText, Wallet, CheckSquare, Zap } from "lucide-react";
import type { EscrowStep } from "../shared/EscrowFlowDiagram";

export const ESCROW_STEPS: EscrowStep[] = [
  {
    stepNumber: 1,
    label: "Budget Proposal",
    status: "CREATED",
    icon: FileText,
    apiMethod: "POST /payroll/init",
    apiSnippet: "oh.payroll.create({ dao, contributors, budget, period })",
    description:
      "The DAO treasury proposal is submitted and approved via governance vote. A payroll escrow is initialized off-chain referencing all contributors and allocations.",
    isOnChain: false,
  },
  {
    stepNumber: 2,
    label: "Fund Allocation",
    status: "FUNDED",
    icon: Wallet,
    apiMethod: "POST /escrow/:id/fund",
    apiSnippet: "oh.escrows.fund(payrollId, { amount, asset: 'USDC' })",
    description:
      "The DAO treasury allocates the approved budget into the on-chain escrow vault. Funds are locked and verifiable on Stellar for all members.",
    isOnChain: true,
  },
  {
    stepNumber: 3,
    label: "Work Verification",
    status: "AWAITING_RELEASE",
    icon: CheckSquare,
    apiMethod: "POST /milestones/:id/verify",
    apiSnippet: "oh.milestones.verify(milestoneId)",
    description:
      "Contributor work is reviewed against the agreed deliverables. Governance or a designated reviewer verifies completion off-chain before releasing funds.",
    isOnChain: false,
  },
  {
    stepNumber: 4,
    label: "Payroll Distribution",
    status: "SUCCEEDED",
    icon: Zap,
    apiMethod: "POST /payroll/:id/distribute",
    apiSnippet: "oh.payroll.distribute(payrollId)",
    description:
      "Verified contributors receive their allocation atomically. Stellar settles each transfer in under 5 seconds — no batch delays, no custodial risk.",
    isOnChain: true,
  },
];
