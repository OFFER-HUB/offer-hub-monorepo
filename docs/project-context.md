# OFFER-HUB Orchestrator — System Context

## 1. Overview

OFFER-HUB Orchestrator is a **self-hosted payments orchestrator** for marketplaces. It provides a Web2-style experience (balance, top-ups, checkout, withdrawals) while delegating funds to external rails: **Stellar + Trustless Work** (crypto-native), with bank payouts through **BlindPay**. Each marketplace runs its own instance; there is no centralized SaaS.

**Purpose:** Let marketplaces offer escrow-protected payments and user balances without building payment infrastructure. The Orchestrator coordinates users, orders, balances, escrow on Stellar (Trustless Work), and bank payouts through BlindPay.

**Problem it solves:** Marketplaces need non-custodial escrow, per-user balances, and optional fiat rails without holding funds centrally or integrating each provider directly.

---

## 2. Design Philosophy

- **Self-host only:** Each marketplace deploys its own Orchestrator; no shared multi-tenant service.
- **Per-user funds (not pooled):** Balances are attributed to users via Stellar invisible wallets, not to the marketplace pool.
- **Non-custodial escrow:** Funds are locked in Trustless Work smart contracts on Stellar; the Orchestrator orchestrates but does not hold escrow funds.
- **Required idempotency:** All state-mutating POSTs accept `Idempotency-Key` for safe retries and deduplication.
- **Correlation:** Order ↔ escrow, topup ↔ provider ref, withdrawal ↔ provider ref, and request IDs are traceable.
- **Server-side secrets:** Provider keys (Trustless Work, BlindPay, wallet encryption) live only in Orchestrator `.env`, never in frontend or responses.
- **Provider abstraction:** A `PaymentProvider` interface (Strategy Pattern) keeps business logic provider-agnostic across the crypto-native rail and bank payouts.

---

## 3. Core Concepts

- **Ledger (balance):** Per-user accounting of `available` and `reserved` amounts. The source of truth is on-chain; the Orchestrator mirrors it and tracks local reserves.
- **Providers:** External systems the Orchestrator calls: **Trustless Work** (escrow on Stellar), **BlindPay** (bank payouts), **Stellar Horizon** (crypto balance/deposits). Abstracted behind interfaces where applicable.
- **Escrow:** Non-custodial lock of funds in a Trustless Work Soroban contract on Stellar (USDC). Created per order; funded by buyer; released to seller or refunded to buyer (or split via dispute resolution).
- **Balances:** `available` (usable) and `reserved` (locked for orders). Updated on reserve, fund escrow, release, refund, top-up, withdrawal.
- **Orchestration:** The API and workers coordinate state machines (order, top-up, withdrawal), call providers, persist state, and emit events. No direct custody of escrow funds.
- **Flows:** Top-up/deposit → reserve → create/fund escrow → work → release/refund/dispute → withdrawal. Documented as state machines and flow-of-funds.

---

## 4. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Marketplace UI  →  @offerhub/sdk  →  OFFER-HUB Orchestrator    │
│       (third-party)      (NPM)              (self-hosted)        │
└─────────────────────────────────────────────┬───────────────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    ▼                         ▼                         ▼
              ┌──────────┐              ┌──────────┐              ┌──────────────┐
              │ Postgres │              │  Redis   │              │  Providers   │
              │ (state,  │              │ BullMQ,  │              │ Trustless W. │
              │  audit)  │              │ idem, SSE│              │ BlindPay,    │
              └──────────┘              └──────────┘              │ Stellar      │
                    ▲                         ▲                    └──────────────┘
                    │                         │
                    └─────────────────────────┴─────────────────────────┘
                                    API + Worker (single process)
```

- **Clients:** Marketplaces use `@offerhub/sdk` (or direct REST) against the Orchestrator API.
- **API:** NestJS; REST; auth via API key (Bearer); idempotency, rate limiting, audit, events.
- **Worker:** BullMQ in same process; webhooks, retries, reconciliation.
- **Core domain:** Users, orders, escrows, balances, top-ups, withdrawals, disputes. State machines enforce valid transitions.
- **Ledger:** Persisted in Postgres (balances, reserves); in crypto mode synced from Stellar.
- **Providers:** Trustless Work (escrow), BlindPay (bank payouts), Stellar Horizon (crypto deposits/balance).

---

## 5. Modules

- **Auth:** API keys (create/list/revoke via master key), scopes (read, write, support), optional short-lived tokens.
- **Users:** Create/get/list users; wallet auto-created on registration.
- **Balance:** Get/sync per-user balance (available + reserved); reserve/release for orders; credit/debit on top-up, release, refund, withdrawal.
- **Orders:** Create, get, list; reserve funds; cancel (pre-escrow); drive escrow create/fund and resolution.
- **Escrow:** Create contract (Trustless Work), fund (buyer signs), release/refund/dispute resolution (on-chain steps).
- **Resolution:** Release (3 tx: milestone status, approve, release); refund (2 tx: dispute + resolve 100% to buyer); dispute + SPLIT resolve.
- **Top-ups:** Create top-up, confirmation URI, webhook-driven state updates, balance credit.
- **Withdrawals:** Create/commit/refresh; bank payouts through BlindPay or send USDC to an external address.
- **Disputes:** Open, list, resolve (release/refund/SPLIT), comments; support scope.
- **Events:** Internal event bus; SSE stream (`GET /events`); filters by type/resource; optional replay via `Last-Event-ID`.
- **Wallet (crypto):** Invisible Stellar wallets (create, encrypt secret, deposit address, balance, sign tx, send payment); BlockchainMonitor for incoming USDC.
- **Audit:** Log actions (actor, resource, result, before/after); support scope; redacted secrets.
- **Webhooks:** Ingress for BlindPay and Trustless Work; signature verification; deduplication by event id.

---

## 6. Payment Flow Lifecycle

- **Crypto (default):** Deposit USDC to user's Stellar address → detected by BlockchainMonitor → balance credited. Order: create → reserve (available → reserved) → create escrow (deploy contract, platform signs) → fund escrow (buyer signs, reserved → on-chain) → IN_PROGRESS. Resolution: release (3 tx: seller milestone, buyer approve, buyer release) → seller balance credited; or refund (dispute + resolve 100% to buyer); or dispute → SPLIT resolve. Withdrawal: send USDC to external address.
- **Crypto-native:** USDC deposit to a Stellar wallet → detected → balance credited. Order reserve/escrow uses Trustless Work. Withdrawal: USDC send or BlindPay bank payout.
- Money does not sit in Orchestrator-owned accounts for escrow; it is in user wallets or in Trustless Work contracts. Orchestrator balance is a mirror of on-chain state.

---

## 7. Provider Interface

- **PaymentProvider** (Strategy): `initializeUser`, `isUserReady`, `getBalance`, `getDepositInfo`, `signEscrowTransaction`, `sendPayment`. Implementations: **CryptoNativeProvider** (wallets + Stellar + TW).
- Selection: `PAYMENT_PROVIDER=crypto` (default); injected at bootstrap so domain code stays provider-agnostic.
- **Trustless Work:** Escrow deploy, fund, change-milestone-status, approve-milestone, release-funds, dispute-escrow, resolve-dispute. Orchestrator signs with platform, buyer, or seller key as required by TW roles (approver, serviceProvider, releaseSigner, disputeResolver).

---

## 8. Data Model Concepts

- **Users:** Identity, type (buyer/seller/both), linked to Wallet.
- **Wallets (crypto):** Per-user Stellar keypair; public key stored; secret encrypted (AES-256-GCM) with `WALLET_ENCRYPTION_KEY`.
- **Balances:** available, reserved; one logical balance per user.
- **Orders:** buyer, seller, amount, currency, status (state machine), optional milestones, client_order_ref; 1:1 escrow when created.
- **Escrows:** Link to order, Trustless Work contract id, status (CREATING → CREATED → FUNDED → RELEASED/REFUNDED).
- **Top-ups / Withdrawals:** Provider refs, status, amount; drive balance changes.
- **Disputes:** Attached to order; OPEN → UNDER_REVIEW → RESOLVED; resolution (release/refund/SPLIT).
- **Audit logs:** Action, actor, resource, result, before/after, correlation; no secrets.
- **Idempotency keys:** Key, request hash, status, response; TTL by resource type (e.g. orders 7 days).

---

## 9. External Integrations

- **Trustless Work:** Escrow API (deploy, fund, milestone, release, dispute, resolve). Required. Webhook optional; Orchestrator can rely on synchronous API responses.
- **Stellar Horizon:** Balance and payment streaming (crypto mode). Deposit detection for invisible wallets.
- **BlindPay:** Bank payouts and currency conversion. Crypto-native deposits and withdrawals remain the default rail.

---

## 10. Key Flows

- **Top-up:** POST /topups → confirmation URI → user pays → webhook → balance credited.
- **Deposit (crypto):** User sends USDC to wallet address → BlockchainMonitor → balance credited.
- **Checkout (order):** POST /orders → POST reserve → POST escrow → POST escrow/fund → (work) → POST resolution/release or /refund or open dispute.
- **Release:** Three Stellar txs (changeMilestoneStatus seller, approveMilestone buyer, releaseFunds buyer); then seller balance credited.
- **Refund:** Two Stellar txs (dispute-escrow buyer, resolve-dispute 100% buyer, platform signs as disputeResolver); then buyer balance credited.
- **Dispute SPLIT:** Dispute → resolve with release_amount + refund_amount; two on-chain steps; both parties credited.
- **Withdrawal:** POST /withdrawals (and commit if required); bank payout through BlindPay or send USDC to a destination address.

---

## 11. Security Considerations

- **Auth:** API key (Bearer); scopes read/write/support; master key for creating keys; keys hashed in DB.
- **Secrets:** Provider and wallet keys only in env; not logged or returned.
- **Idempotency:** Prevents duplicate charges; key reuse with different body returns 409.
- **Webhooks:** HMAC verification (BlindPay, Trustless Work); deduplication by event id.
- **Wallet keys:** AES-256-GCM; key from env; rotation requires re-encryption migration (documented procedure).
- **Audit:** All mutations logged; sensitive fields redacted.
- **Rate limiting:** Per API key (e.g. 100/min); stricter for top-ups/withdrawals and SSE.
- **CORS, TLS, DB/Redis SSL:** Recommended in deployment/security docs.

---

## 12. Terminology Glossary

- **Available balance:** Amount user can spend or reserve.
- **Reserved balance:** Amount locked for orders (not yet in escrow).
- **Escrow (TW):** Soroban contract on Stellar holding USDC until release/refund/resolve.
- **Invisible wallet:** Server-side Stellar keypair; user does not sign in browser; Orchestrator signs for escrow/withdrawal.
- **Idempotency-Key:** Client-supplied key (e.g. UUID) for deduplicating mutable POSTs.
- **PaymentProvider:** Strategy abstraction for the crypto-native rail (balance, deposit, sign, send).
- **Trustless Work (TW):** External service for non-custodial escrow on Stellar.
- **State machine:** Defined transitions for Order, TopUp, Withdrawal, Escrow, Dispute (documents list valid states and transitions).

---

## 13. What This System Is NOT

- **Not a centralized payment SaaS:** Each marketplace runs its own instance.
- **Not a generic wallet app:** It is an orchestrator for marketplace flows (orders, escrow, balance).
- **Not a blockchain node:** It uses Horizon and Trustless Work APIs; it does not run Stellar core.
- **Not a replacement for Trustless Work or BlindPay:** It integrates them; provider credentials and capabilities are external.
- **Not specified as a full banking or regulated payment institution:** Docs mention compliance considerations for custodial wallets but do not define legal status.

---

## 14. Mental Model Summary

Think of the Orchestrator as the **single backend** a marketplace talks to for "payments and escrow." It keeps **per-user balances** and **order/escrow state**, and **calls out** to Trustless Work and BlindPay to move money. It never holds escrow funds itself; in crypto mode it holds encrypted keys to sign on behalf of users. **State machines** govern what can happen next (e.g. reserve only from ORDER_CREATED, release only from IN_PROGRESS). **Idempotency** and **correlation IDs** make retries and debugging safe. **Events and SSE** allow the marketplace to react in real time. The **crypto-native rail** and **bank payouts** share the same API surface.
