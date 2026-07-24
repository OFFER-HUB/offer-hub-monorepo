/** Mermaid chart sources for SystemArchitectureDiagram (extracted). */
export const SYSTEM_ARCHITECTURE_CHART = `
flowchart TD
    %% Node Styling
    classDef highlight fill:#149A9B,color:#fff,stroke:#0d7377,stroke-width:2px;
    classDef backend fill:#002333,color:#fff,stroke:#001522,stroke-width:2px;
    classDef subtle fill:#F1F3F7,color:#19213D,stroke:#d1d5db,stroke-width:1px;

    Client["Client Layer<br/><small>Next.js 15 · React 19 · Zustand · NextAuth v5</small>"]:::highlight
    Wallet["Wallet Layer<br/><small>Stellar Wallets Kit · Freighter · Lobstr · xBull</small>"]:::highlight
    API["NestJS API<br/><small>Auth · Orders · Escrow · Payments · Webhooks · Off-ramp</small>"]:::backend
    Data["Data Layer<br/><small>PostgreSQL · Redis · BullMQ</small>"]:::subtle
    Stellar["Stellar<br/><small>Soroban Contracts · TrustlessWork · USDC</small>"]:::subtle
    Offramp["Off-ramp<br/><small>BlindPay (7 corridors)</small>"]:::highlight

    Client -->|HTTPS / REST| API
    Client -->|Client-side Soroban signing| Wallet
    API -->|Prisma ORM| Data
    API -->|Stellar RPC| Stellar
    Stellar -->|Webhook / on-chain event| API
    API -->|API / Webhooks| Offramp
    Wallet -.->|Sign & Submit| Stellar
  `;
