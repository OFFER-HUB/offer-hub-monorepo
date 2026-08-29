import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ShieldCheck } from "lucide-react";
import { EscrowFlowDiagram, type EscrowStep } from "../EscrowFlowDiagram";
import { axe } from "@/test/axe";

const steps: EscrowStep[] = [
  {
    stepNumber: 1,
    label: "Proposal Accepted",
    status: "CREATED",
    icon: ShieldCheck,
    apiMethod: "POST /proposals/:id/accept",
    apiSnippet: "client.proposals.accept(proposalId)",
    description: "The freelancer accepts the proposal terms.",
    isOnChain: false,
  },
  {
    stepNumber: 2,
    label: "Funding Deposited",
    status: "FUNDED",
    icon: ShieldCheck,
    apiMethod: "POST /escrows/:id/fund",
    apiSnippet: "client.escrows.fund(escrowId)",
    description: "The client deposits funds into escrow.",
    isOnChain: true,
  },
];

describe("EscrowFlowDiagram accessibility", () => {
  it("has no axe violations", async () => {
    const { container } = render(<EscrowFlowDiagram steps={steps} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
