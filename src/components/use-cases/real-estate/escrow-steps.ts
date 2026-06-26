import { FileText, Lock, Search, Key } from "lucide-react";
import type { EscrowStep } from "@/components/use-cases/shared/EscrowFlowDiagram";

export const REAL_ESTATE_ESCROW_STEPS: EscrowStep[] = [
  {
    stepNumber: 1,
    label: "Lease Agreement",
    status: "CREATED",
    icon: FileText,
    apiMethod: "POST /escrow/init",
    apiSnippet: "oh.escrows.init({ tenant, landlord, deposit, leaseTerms })",
    description:
      "Both parties sign the lease and agree on deposit conditions. The escrow contract is initialized with the agreed terms off-chain, referencing both wallets.",
    isOnChain: false,
  },
  {
    stepNumber: 2,
    label: "Deposit Lock",
    status: "FUNDED",
    icon: Lock,
    apiMethod: "POST /escrow/:id/fund",
    apiSnippet: "oh.escrows.fund(depositId, { amount, asset: 'USDC' })",
    description:
      "The tenant’s security deposit is locked into the on-chain escrow vault, removing the landlord’s unilateral control over funds entirely.",
    isOnChain: true,
  },
  {
    stepNumber: 3,
    label: "Property Inspection",
    status: "AWAITING_RELEASE",
    icon: Search,
    apiMethod: "POST /inspection/:id/verify",
    apiSnippet: "oh.inspection.verify(propertyId, { reportId })",
    description:
      "At lease end, the property is inspected against the agreed condition report. The verified outcome determines how the deposit is released or disputed.",
    isOnChain: false,
  },
  {
    stepNumber: 4,
    label: "Deposit Settlement",
    status: "SUCCEEDED",
    icon: Key,
    apiMethod: "POST /escrow/:id/release",
    apiSnippet: "oh.escrows.release(depositId)",
    description:
      "The deposit is atomically settled based on the inspection outcome: full return to tenant, partial deduction, or on-chain dispute — all recorded on Stellar.",
    isOnChain: true,
  },
];
