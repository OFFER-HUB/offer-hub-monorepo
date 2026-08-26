import { MermaidDiagram } from "@/components/shared/MermaidDiagram";

/**
 * Canonical Order state machine diagram.
 *
 * Source of truth: `docs/architecture/state-machines.md` (Order States) in the
 * OFFER-HUB orchestrator repository. States and transitions are kept verbatim;
 * the two dispute-resolution edge labels are reworded ("Resolve to release" /
 * "Resolve to refund") because the original "Resolution: release" labels
 * contain a colon that mermaid's state-diagram parser rejects.
 *
 * Rendered through the shared MermaidDiagram pipeline so the diagram inherits
 * the docs theme (brand color tokens, light/dark mode) automatically.
 */
const ORDER_STATE_MACHINE_CHART = `stateDiagram-v2
    [*] --> ORDER_CREATED: POST /orders

    ORDER_CREATED --> FUNDS_RESERVED: POST /orders/{id}/reserve
    ORDER_CREATED --> CLOSED: POST /orders/{id}/cancel

    FUNDS_RESERVED --> ESCROW_CREATING: POST /orders/{id}/escrow
    FUNDS_RESERVED --> CLOSED: POST /orders/{id}/cancel

    ESCROW_CREATING --> ESCROW_FUNDING: Escrow created in TW
    ESCROW_FUNDING --> ESCROW_FUNDED: POST /orders/{id}/escrow/fund

    ESCROW_FUNDED --> IN_PROGRESS: Work starts

    IN_PROGRESS --> RELEASE_REQUESTED: POST /orders/{id}/release
    IN_PROGRESS --> REFUND_REQUESTED: POST /orders/{id}/refund
    IN_PROGRESS --> DISPUTED: POST /orders/{id}/disputes

    RELEASE_REQUESTED --> RELEASED: TW confirms release
    REFUND_REQUESTED --> REFUNDED: TW confirms refund

    DISPUTED --> RELEASED: Resolve to release
    DISPUTED --> REFUNDED: Resolve to refund

    RELEASED --> CLOSED: Cleanup
    REFUNDED --> CLOSED: Cleanup

    CLOSED --> [*]`;

export function OrderStateMachineDiagram() {
  return <MermaidDiagram chart={ORDER_STATE_MACHINE_CHART} variant="framed" />;
}

export default OrderStateMachineDiagram;
