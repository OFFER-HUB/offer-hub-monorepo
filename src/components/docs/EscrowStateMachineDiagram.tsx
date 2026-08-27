import { MermaidDiagram } from "@/components/shared/MermaidDiagram";

/**
 * Canonical internal Escrow state machine diagram.
 *
 * Source of truth: `docs/architecture/state-machines.md` (Escrow States
 * (internal)) in the OFFER-HUB orchestrator repository. Kept verbatim.
 *
 * Rendered through the shared MermaidDiagram pipeline so the diagram inherits
 * the docs theme (brand color tokens, light/dark mode) automatically.
 */
const ESCROW_STATE_MACHINE_CHART = `stateDiagram-v2
    [*] --> CREATING: Call TW API

    CREATING --> CREATED: TW confirms creation
    CREATED --> FUNDING: Starting funding

    FUNDING --> FUNDED: TW confirms funds

    FUNDED --> RELEASING: Release requested
    FUNDED --> REFUNDING: Refund requested
    FUNDED --> DISPUTED: Dispute opened

    RELEASING --> RELEASED: TW confirms
    REFUNDING --> REFUNDED: TW confirms

    DISPUTED --> RELEASED: Release resolution
    DISPUTED --> REFUNDED: Refund resolution

    RELEASED --> [*]
    REFUNDED --> [*]`;

export function EscrowStateMachineDiagram() {
  return <MermaidDiagram chart={ESCROW_STATE_MACHINE_CHART} variant="framed" />;
}

export default EscrowStateMachineDiagram;
