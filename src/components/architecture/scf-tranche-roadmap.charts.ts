/** Mermaid chart sources for SCFTrancheRoadmap (extracted). */
export const SCF_GANTT_CHART = `
gantt
  title OfferHub SCF Build #44 — Delivery Roadmap
  dateFormat YYYY-MM-DD
  axisFormat %b %d

  section T1 — MVP: SWK Connection & Auth ($16K)
    SWK Wallet Connection + Balance Display    :t1a, 2026-07-01, 2026-09-01
    Wallet-Based Auth (hybrid)                 :t1b, 2026-08-01, 2026-09-01

  section T2 — Testnet: Core Integrations ($19.5K)
    Soroban Client-Side Signing (SWK)          :t2a, 2026-09-01, 2026-10-20
    BlindPay — 7 LATAM Corridors               :t2b, 2026-09-01, 2026-10-20
    Off-ramp Orchestration + Webhooks          :t2d, 2026-09-15, 2026-10-20
    E2E Integration Testing                    :t2e, 2026-10-01, 2026-10-20

  section T3 — Mainnet Launch & OS Adapters ($30.5K)
    Horizon → Stellar RPC Migration            :t3a, 2026-10-20, 2026-12-05
    Mainnet Launch + Monitoring                :t3b, 2026-10-20, 2026-12-05
    Open-Source Integration Adapters           :t3c, 2026-11-15, 2026-12-05
  `;
