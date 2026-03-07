# Overview

> What is OFFER-HUB Orchestrator, what problems it solves, and who it's for.

---

## Table of Contents

- [What Is OFFER-HUB Orchestrator?](#what-is-offer-hub-orchestrator)
- [What Problems It Solves](#what-problems-it-solves)
- [Who It's For](#who-its-for)
- [What You Can Build](#what-you-can-build)
- [How It Works (30-Second Summary)](#how-it-works-30-second-summary)
- [Key Features](#key-features)
- [Payment Providers](#payment-providers)
- [What the Orchestrator Does NOT Do](#what-the-orchestrator-does-not-do)
- [Getting Started](#getting-started)

---

## What Is OFFER-HUB Orchestrator?

OFFER-HUB Orchestrator is a **self-hosted payments middleware** for service marketplaces. It handles the financial plumbing — escrow, balance management, dispute resolution, USDC transactions on Stellar — so you can focus on your marketplace product.

It is NOT a SaaS. You deploy it on your own infrastructure and call its REST API from your marketplace backend.

```
Your Marketplace Frontend
         ↓
Your Marketplace Backend
         ↓
  OFFER-HUB Orchestrator  ← You deploy this
         ↓              ↓
   Stellar + USDC    Trustless Work
   (blockchain)      (smart contracts)
```

---

## What Problems It Solves

Building a marketplace with escrow payments from scratch requires:

| Challenge | Orchestrator Solution |
|-----------|----------------------|
| Holding buyer funds securely | Non-custodial escrow via Trustless Work smart contracts |
| Preventing double-spending | Atomic balance operations + idempotency keys |
| Handling "seller didn't deliver" | Built-in dispute workflow with SPLIT resolution |
| Managing crypto wallets for non-crypto users | Invisible Stellar wallets (Web2 UX) |
| Tracking payment state across distributed systems | State machine with full audit log |
| Real-time payment notifications | SSE event stream |
| Preventing blockchain transaction failures from losing money | Atomic rollback patterns |
| Supporting LATAM users without bank accounts | Stellar USDC (no bank needed) |

Without the Orchestrator, building all of this could take 6–12 months. The Orchestrator compresses that to a few days of integration.

---

## Who It's For

### Primary Audience: Marketplace Developers

You're building a platform where:
- Buyers purchase services or products from sellers
- You need to hold funds in escrow until work is delivered
- You want USDC/crypto payments without forcing users to understand blockchain

**Examples:**
- Freelance platform (design, development, writing)
- Gig economy marketplace (tasks, services)
- Digital goods marketplace (templates, assets)
- LATAM service marketplace where bank transfers are slow

### Secondary Audience: Fintech Teams in LATAM

You need programmable USDC payments for:
- Cross-border payments between LATAM users
- On-ramp/off-ramp via AirTM (fiat ↔ USDC)
- Automated payment disbursement

---

## What You Can Build

With the Orchestrator you can build the complete payment lifecycle for:

**Standard marketplace flow:**
```
Buyer deposits USDC → Creates order → Funds escrow → Work delivered → Releases to seller → Seller withdraws
```

**With dispute handling:**
```
... → Work disputed → Support reviews → FULL_RELEASE | FULL_REFUND | SPLIT → Order closed
```

**With AirTM (fiat support):**
```
Buyer tops up via AirTM (bank/card) → Same escrow flow → Seller withdraws to bank via AirTM
```

---

## How It Works (30-Second Summary)

1. **Deploy the Orchestrator** on your server with your DB, Redis, and API keys
2. **Register users** via `POST /users` — each user automatically gets a Stellar wallet
3. **Buyer deposits USDC** to their wallet address — balance auto-credited
4. **Buyer creates an order** — funds reserved from their balance
5. **Order goes on-chain** — USDC locked in a Soroban smart contract via Trustless Work
6. **Work happens** — your marketplace manages communication, files, etc.
7. **Buyer approves** — 3 on-chain transactions release USDC to seller
8. **Seller withdraws** — sends USDC to any Stellar address

At every step, the Orchestrator emits events to your SSE subscriber so you can update your UI in real-time.

---

## Key Features

### Invisible Wallets
Users never see Stellar addresses, seed phrases, or private keys. They see a Web2 balance interface. The Orchestrator manages Stellar keypairs server-side, encrypted with AES-256-GCM.

### Non-Custodial Escrow
Funds in escrow are held in Soroban smart contracts on Stellar, not in the Orchestrator's database. The Orchestrator signs transactions but cannot unilaterally move funds — the contracts enforce the rules.

### State Machine Enforcement
Every order follows a strict state machine. Invalid transitions (e.g., releasing before escrow is funded) are rejected. This prevents double-charges, double-releases, and race conditions.

### Idempotent Operations
Every state-changing operation accepts an `Idempotency-Key`. Retrying a failed request with the same key returns the cached response — preventing duplicate orders, escrows, or payments.

### Real-Time Events
Every state change emits a domain event streamed via SSE. Your backend subscribes once and receives real-time updates: "order funded," "funds released," "dispute resolved."

### Full Audit Log
Every balance change, state transition, and blockchain interaction is recorded in PostgreSQL with timestamps. Complete traceability for compliance and debugging.

### Payment Provider Abstraction
Switch between crypto (Stellar USDC, default) and AirTM (fiat) via a single environment variable: `PAYMENT_PROVIDER=crypto|airtm`. The escrow mechanics are identical either way.

---

## Payment Providers

| Feature | Crypto-Native (default) | AirTM (optional) |
|---------|------------------------|-----------------|
| Deposit method | Send USDC to Stellar address | Fiat payin via AirTM redirect |
| Withdrawal method | Direct USDC to Stellar address | Payout to bank/mobile money |
| Settlement currency | USDC (Stellar) | USD |
| KYC required | No | AirTM KYC |
| Webhook required | No (Horizon SSE) | Yes (AirTM webhooks) |
| Speed | Seconds | Minutes to days |
| LATAM coverage | Global | LATAM-focused |

For most new deployments, **crypto mode is recommended**. AirTM is available for teams that need fiat on/off-ramp via AirTM's network.

---

## What the Orchestrator Does NOT Do

| NOT included | Why |
|-------------|-----|
| User authentication | Your marketplace handles auth |
| Product listings | Your marketplace handles this |
| Seller reputation/reviews | Your marketplace handles this |
| Communication (chat, files) | Your marketplace handles this |
| Tax calculation | Your marketplace or accounting tool |
| KYC/AML (crypto mode) | On Stellar, no KYC required for wallet creation |
| Browser wallet integration | Invisible wallets only (Freighter support planned) |
| Multiple currencies | USDC only |

The Orchestrator is intentionally narrow: it handles payments, escrow, and balances. Everything else is your marketplace's responsibility.

---

## Getting Started

1. **Read [Core Concepts](./core-concepts.md)** — Understand balance model, escrow, and event system
2. **Follow [Marketplace Integration](./marketplace-integration.md)** — Step-by-step from zero to first order
3. **[Deploy](./deployment.md)** — Set up your instance in production
4. **Subscribe to [Events](./events-reference.md)** — Real-time updates for your backend

### Quick API Test

```bash
# 1. Create a user
curl -X POST http://localhost:4000/api/v1/users \
  -H "Authorization: Bearer ohk_live_..." \
  -H "Content-Type: application/json" \
  -d '{"externalUserId": "user-001", "email": "buyer@example.com"}'

# 2. Get their deposit address
curl http://localhost:4000/api/v1/wallet/deposit-address \
  -H "Authorization: Bearer ohk_live_..."

# 3. Check their balance
curl http://localhost:4000/api/v1/balances/usr_abc123 \
  -H "Authorization: Bearer ohk_live_..."
```

---

## Documentation Map

| Guide | What It Covers |
|-------|---------------|
| [Overview](./overview.md) | This page |
| [Core Concepts](./core-concepts.md) | Balance model, state machines, escrow mechanics |
| [Architecture](./architecture.md) | System design and components |
| [Marketplace Integration](./marketplace-integration.md) | Quick start and all flows |
| [Wallets](./wallets.md) | Invisible Stellar wallets |
| [Deposits](./deposits.md) | Adding USDC balance |
| [Withdrawals](./withdrawals.md) | Sending USDC out |
| [Orders](./orders.md) | Order lifecycle |
| [Escrow](./escrow.md) | Smart contract mechanics |
| [Disputes](./disputes.md) | Dispute resolution |
| [Events Reference](./events-reference.md) | SSE events catalog |
| [Standards](./standards.md) | API conventions and formats |
| [Errors & Troubleshooting](./errors-troubleshooting.md) | Error codes and debugging |
| [Deployment](./deployment.md) | Production deployment |
| [Scaling & Customization](./scaling-customization.md) | Horizontal scaling |
| [AirTM Integration](./airtm.md) | AirTM fiat payment provider |
