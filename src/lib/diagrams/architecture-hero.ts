/**
 * Mermaid source for the compact overview embedded in the architecture hero.
 *
 * Kept next to the other `.charts.ts` sources but under `src/lib/diagrams/`
 * because it is shared by the hero and (later) the docs pages, rather than
 * owned by a single component.
 */
export const architectureHeroDiagram = `
flowchart LR
    %% Node Styling
    classDef layer fill:#149A9B,color:#fff,stroke:#0d7377,stroke-width:2px;
    classDef backend fill:#002333,color:#fff,stroke:#001522,stroke-width:2px;
    classDef chain fill:#F1F3F7,color:#19213D,stroke:#d1d5db,stroke-width:1px;

    Client["Client Layer<br/><small>Next.js 15 · React 19 · Zustand</small>"]:::layer
    Wallet["Wallet Layer<br/><small>Stellar Wallets Kit · Freighter · Lobstr</small>"]:::layer
    API["NestJS API<br/><small>Auth · Orders · Escrow · Payments</small>"]:::backend
    Stellar["Stellar<br/><small>Soroban Contracts · TrustlessWork · USDC</small>"]:::chain

    Client -->|HTTPS / REST| API
    Client -->|Client-side Soroban signing| Wallet
    API -->|Stellar RPC| Stellar
    Wallet -.->|Sign & Submit| Stellar
    Stellar -->|Webhook / on-chain event| API
  `;
