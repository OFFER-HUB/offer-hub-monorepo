import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { OrderStateMachineDiagram } from "../OrderStateMachineDiagram";
import { EscrowStateMachineDiagram } from "../EscrowStateMachineDiagram";

vi.mock("@/components/shared/MermaidDiagram", () => ({
  MermaidDiagram: ({ chart, variant }: { chart?: string; variant?: string }) => (
    <div data-testid="mermaid" data-chart={chart} data-variant={variant} />
  ),
}));

describe("state machine diagrams", () => {
  it("renders the canonical Order state machine through MermaidDiagram", () => {
    render(<OrderStateMachineDiagram />);
    const diagram = screen.getByTestId("mermaid");
    const chart = diagram.getAttribute("data-chart") ?? "";

    expect(diagram.getAttribute("data-variant")).toBe("framed");

    // Canonical states from docs/architecture/state-machines.md (Order States)
    for (const state of [
      "ORDER_CREATED",
      "FUNDS_RESERVED",
      "ESCROW_CREATING",
      "ESCROW_FUNDING",
      "ESCROW_FUNDED",
      "IN_PROGRESS",
      "RELEASE_REQUESTED",
      "RELEASED",
      "REFUND_REQUESTED",
      "REFUNDED",
      "DISPUTED",
      "CLOSED",
    ]) {
      expect(chart).toContain(state);
    }

    // Canonical transitions
    for (const transition of [
      "[*] --> ORDER_CREATED",
      "ORDER_CREATED --> FUNDS_RESERVED",
      "ORDER_CREATED --> CLOSED",
      "FUNDS_RESERVED --> ESCROW_CREATING",
      "ESCROW_CREATING --> ESCROW_FUNDING",
      "ESCROW_FUNDING --> ESCROW_FUNDED",
      "ESCROW_FUNDED --> IN_PROGRESS",
      "IN_PROGRESS --> RELEASE_REQUESTED",
      "IN_PROGRESS --> REFUND_REQUESTED",
      "IN_PROGRESS --> DISPUTED",
      "RELEASE_REQUESTED --> RELEASED",
      "REFUND_REQUESTED --> REFUNDED",
      "DISPUTED --> RELEASED",
      "DISPUTED --> REFUNDED",
      "RELEASED --> CLOSED",
      "REFUNDED --> CLOSED",
      "CLOSED --> [*]",
    ]) {
      expect(chart).toContain(transition);
    }

    // No states that don't exist in the canonical machine
    for (const bogus of ["ESCROW_CREATED", "DISPUTING", "RESOLVED", "SPLIT"]) {
      expect(chart).not.toContain(bogus);
    }
  });

  it("renders the canonical internal Escrow state machine through MermaidDiagram", () => {
    render(<EscrowStateMachineDiagram />);
    const diagram = screen.getByTestId("mermaid");
    const chart = diagram.getAttribute("data-chart") ?? "";

    expect(diagram.getAttribute("data-variant")).toBe("framed");

    // Canonical states from docs/architecture/state-machines.md (Escrow States (internal))
    for (const state of [
      "CREATING",
      "CREATED",
      "FUNDING",
      "FUNDED",
      "RELEASING",
      "RELEASED",
      "REFUNDING",
      "REFUNDED",
      "DISPUTED",
    ]) {
      expect(chart).toContain(state);
    }

    // Canonical transitions
    for (const transition of [
      "[*] --> CREATING",
      "CREATING --> CREATED",
      "CREATED --> FUNDING",
      "FUNDING --> FUNDED",
      "FUNDED --> RELEASING",
      "FUNDED --> REFUNDING",
      "FUNDED --> DISPUTED",
      "RELEASING --> RELEASED",
      "REFUNDING --> REFUNDED",
      "DISPUTED --> RELEASED",
      "DISPUTED --> REFUNDED",
      "RELEASED --> [*]",
      "REFUNDED --> [*]",
    ]) {
      expect(chart).toContain(transition);
    }

    // The internal escrow machine must not drift into order-level states
    for (const bogus of [
      "IN_PROGRESS",
      "CLOSED",
      "ORDER_CREATED",
      "ESCROW_CREATING",
      "RELEASE_REQUESTED",
    ]) {
      expect(chart).not.toContain(bogus);
    }
  });
});
