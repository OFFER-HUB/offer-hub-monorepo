/** Mermaid chart sources for PaymentFlowDiagram (extracted). */
export const PAYMENT_SEQUENCE_CHART = `
sequenceDiagram
    participant Client as Client (buyer)
    participant SWK as SWK
    participant NestJS as NestJS (OfferHub API)
    participant TW as TrustlessWork (escrow)
    participant Offramp as BlindPay

    Client->>NestJS: POST /orders (USDC reserved)
    NestJS->>TW: deployEscrow(buyer, seller, amount)
    TW-->>NestJS: escrowId + contractAddress
    NestJS-->>Client: { escrowId, contractAddress }
    
    Client->>SWK: signTransaction(fund_escrow)
    SWK->>TW: fund_escrow (USDC on-chain)
    
    Note over TW: State: ESCROW_FUNDED → IN_PROGRESS
    
    Client->>SWK: signTransaction(release_escrow)
    SWK->>TW: release_escrow
    TW-->>NestJS: webhook: escrow_released
    NestJS->>Offramp: POST /payout (USDC → fiat)
    Offramp-->>Client: fiat settled (SPEI / Pix / PSE...)
  `;

export const PAYMENT_STATE_CHART = `
stateDiagram-v2
    [*] --> CREATED
    CREATED --> RESERVED
    RESERVED --> ESCROW_FUNDED
    ESCROW_FUNDED --> IN_PROGRESS
    IN_PROGRESS --> COMPLETED
    IN_PROGRESS --> DISPUTED
    DISPUTED --> RESOLVED
    COMPLETED --> [*]
    RESOLVED --> [*]
  `;
