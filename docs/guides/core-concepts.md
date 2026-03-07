# Core Concepts

> Deep dive into how OFFER-HUB Orchestrator works under the hood. Read this before building to avoid surprises.

---

## Table of Contents

- [What the Orchestrator Is (and Is Not)](#what-the-orchestrator-is-and-is-not)
- [System Architecture](#system-architecture)
- [Balance Model](#balance-model)
- [Order Lifecycle](#order-lifecycle)
- [Escrow Mechanics](#escrow-mechanics)
- [Payment Providers](#payment-providers)
- [Invisible Wallets](#invisible-wallets)
- [Authentication & API Keys](#authentication--api-keys)
- [Idempotency](#idempotency)
- [Events & Real-Time](#events--real-time)

---

## What the Orchestrator Is (and Is Not)

### What it IS

The OFFER-HUB Orchestrator is a **self-hosted, server-to-server backend** that your marketplace backend calls via REST API. It manages:

- **User balances** — Track how much each user has available and reserved
- **Escrow contracts** — Lock funds in non-custodial smart contracts on Stellar via Trustless Work
- **Payments** — Move USDC between users (via Stellar) or fiat (via AirTM)
- **Dispute resolution** — Freeze funds and distribute them based on an arbitration decision
- **Audit trail** — Every operation is logged with full traceability

### What it IS NOT

- **NOT a UI** — It has no frontend. You build the UI for your users.
- **NOT a user auth system** — It doesn't log in your users. You pass user IDs to it.
- **NOT a KYC provider** — For crypto: no KYC needed (blockchain-native). For AirTM: KYC is AirTM's responsibility.
- **NOT a SaaS** — Each marketplace self-hosts their own instance. There is no shared cloud.

### Who is it for?

Any marketplace where:
- A buyer pays for a service and the seller delivers it
- The payment should be held in escrow until work is approved
- Disputes need a resolution mechanism
- Funds move in USDC on Stellar (crypto path) or USD via AirTM (fiat path)

Examples: freelance platforms, service marketplaces, NFT royalty distribution, peer-to-peer commerce.

---

## System Architecture

### The Five Layers

```
┌─────────────────────────────────────────────────────────────┐
│  [5] Marketplace UI (third-party)                           │
│      - Your frontend (web, mobile, etc.)                    │
│      - Never calls the Orchestrator directly                │
├─────────────────────────────────────────────────────────────┤
│  [4] Your Marketplace Backend                               │
│      - Calls the Orchestrator via SDK or REST               │
│      - Holds the API key (never exposes it to frontend)     │
├─────────────────────────────────────────────────────────────┤
│  [3] OFFER-HUB Orchestrator (self-hosted, port 4000)        │
│      - State machine, idempotency, audit, balance logic     │
│      - Integrates Trustless Work + Stellar                  │
├─────────────────────────────────────────────────────────────┤
│  [2] Trustless Work                                         │
│      - Non-custodial escrow on Stellar (Soroban contracts)  │
│      - Release / Refund / Dispute resolution                │
├─────────────────────────────────────────────────────────────┤
│  [1] Stellar Network                                        │
│      - Settlement layer (USDC)                              │
│      - Source of truth for on-chain balances                │
└─────────────────────────────────────────────────────────────┘
```

### Internal Components

| Component | Role |
|-----------|------|
| **API Server (NestJS, port 4000)** | Handles REST requests, validates input, runs business logic, emits events |
| **Background Workers (BullMQ)** | Reconciliation jobs, webhook retries, async processing |
| **PostgreSQL** | Persistent state: users, orders, balances, escrow, audit logs |
| **Redis** | Idempotency cache, BullMQ job queues, SSE event buffer (last 1000 events) |
| **BlockchainMonitorService** | SSE stream from Stellar Horizon — detects incoming USDC deposits in real-time |

### Self-Hosting Model

Every marketplace runs its own isolated Orchestrator instance. There is no shared database or shared API. This gives you:
- Complete data sovereignty
- Independent scaling
- Your own compliance posture
- No noisy-neighbor problems

---

## Balance Model

Every user has a single balance record with two fields:

```typescript
interface Balance {
  available: string;  // "100.00" — Can be spent or withdrawn
  reserved:  string;  // "80.00"  — Locked in an active order
}
```

The `total` is always `available + reserved`.

### Balance States Through a Transaction

```
User starts with: available=100.00, reserved=0.00

1. Reserve $80 for an order:
   available=20.00, reserved=80.00

2. Fund escrow (sends USDC on-chain):
   available=20.00, reserved=0.00
   (reserved goes to 0 because funds are now on-chain)

3a. Release (seller wins):
   Buyer:  available=20.00  (unchanged)
   Seller: available=80.00  (credited)

3b. Refund (buyer wins):
   Buyer:  available=100.00  (restored)
   Seller: available=0.00    (unchanged)

3c. SPLIT ($50 to seller, $30 to buyer):
   Buyer:  available=50.00   (20 + 30 refunded)
   Seller: available=50.00   (credited)
```

### Balance Operations (Internal Reference)

| Operation | `available` | `reserved` | On-chain |
|-----------|-------------|------------|---------|
| Deposit USDC | +amount | — | — |
| Reserve (order) | -amount | +amount | — |
| Cancel order | +amount | -amount | — |
| Fund escrow | — | -amount | +amount |
| Release to seller | — | — | -amount (to seller wallet) |
| Seller balance credited | +amount | — | — |
| Refund to buyer | — | — | -amount (to buyer wallet) |
| Buyer balance credited | +amount | — | — |
| Withdrawal created | -amount | — | — |
| Withdrawal failed | +amount | — | — |

### Golden Rule: Never Touch Balance Directly

Always use `BalanceService` methods. Never update the `Balance` table directly via Prisma. The service enforces atomicity, minimum checks, event emission, and audit logging.

---

## Order Lifecycle

An order goes through a series of states from creation to closure.

### State Machine

```
ORDER_CREATED
    │
    ├─ cancel → CLOSED
    │
    ▼
FUNDS_RESERVED
    │
    ├─ cancel → CLOSED
    │
    ▼
ESCROW_CREATING
    │
    ▼
ESCROW_FUNDING
    │
    ▼
ESCROW_FUNDED
    │
    ▼
IN_PROGRESS
    │
    ├─ release  → RELEASE_REQUESTED → RELEASED → CLOSED
    ├─ refund   → REFUND_REQUESTED  → REFUNDED  → CLOSED
    └─ dispute  → DISPUTED ─────────────────────→ CLOSED
                              (FULL_RELEASE / FULL_REFUND / SPLIT)
```

### State Descriptions

| State | Trigger | What happens |
|-------|---------|-------------|
| `ORDER_CREATED` | `POST /orders` | Order record created. No funds moved. |
| `FUNDS_RESERVED` | `POST /orders/:id/reserve` | Buyer's `available -= amount`, `reserved += amount`. Logical hold. |
| `ESCROW_CREATING` | `POST /orders/:id/escrow` | Orchestrator calls Trustless Work to deploy Soroban contract on Stellar. |
| `ESCROW_FUNDING` | `POST /orders/:id/escrow/fund` | Buyer's invisible wallet sends USDC to the smart contract. `reserved -= amount`. |
| `ESCROW_FUNDED` / `IN_PROGRESS` | Automatic after funding | Funds locked on-chain. Work can begin. |
| `RELEASE_REQUESTED` | `POST /orders/:id/resolution/release` | 3 on-chain transactions execute. Seller credited. |
| `REFUND_REQUESTED` | `POST /orders/:id/resolution/refund` | 2 on-chain transactions execute. Buyer credited. |
| `DISPUTED` | `POST /orders/:id/resolution/dispute` | All automated flows frozen. Support assigns and resolves. |
| `CLOSED` | After release/refund/dispute resolution | Terminal state. |

### Business Rules

1. **Cancel only pre-escrow**: Orders can only be cancelled at `ORDER_CREATED` or `FUNDS_RESERVED`. Once on-chain, use refund.
2. **One dispute per order**: You cannot open a second dispute if one is active.
3. **Release/Refund are exclusive**: Once a release is requested, you cannot switch to refund.
4. **INVALID_STATE_TRANSITION (409)**: Any attempt to skip states throws this error.

---

## Escrow Mechanics

> For someone with no blockchain background.

### What is an Escrow?

An escrow is a neutral third party that holds funds until both sides agree the conditions are met. In traditional finance, this is a bank or law firm. Here, it's a **smart contract on the Stellar blockchain** managed by Trustless Work.

### Why Stellar?

Stellar is a fast, low-cost blockchain designed for financial transactions. Transactions settle in ~5 seconds for fractions of a cent. USDC on Stellar is the same dollar-pegged stablecoin as on Ethereum or Solana, but with much lower fees.

### How the Escrow Works (Step by Step)

**1. Create the contract**

When you call `POST /orders/:id/escrow`, the Orchestrator:
- Calls Trustless Work API to deploy a new Soroban smart contract on Stellar
- The contract is pre-configured with: amount, buyer address, seller address, platform (dispute resolver) address, milestone configuration
- The Orchestrator's platform wallet signs the deploy transaction

**2. Fund the contract**

When you call `POST /orders/:id/escrow/fund`, the Orchestrator:
- Gets an unsigned XDR transaction from Trustless Work
- Decrypts the buyer's private key from the database
- Signs the XDR with the buyer's wallet
- Sends the signed transaction to Stellar
- USDC moves from buyer's wallet → smart contract

At this point, **no one can touch the funds except through the contract's defined rules**.

**3. Release (happy path)**

When you call `POST /orders/:id/resolution/release`:

```
Transaction 1: changeMilestoneStatus
  → Signed by: SELLER (serviceProvider role)
  → Marks work as complete

Transaction 2: approveMilestone
  → Signed by: BUYER (approver role)
  → Buyer acknowledges completion

Transaction 3: releaseFunds
  → Signed by: BUYER (releaseSigner role)
  → USDC moves from contract → seller's wallet
```

All three happen automatically in sequence. The Orchestrator signs each one using the respective user's decrypted private key.

**4. Refund (no dispute)**

When you call `POST /orders/:id/resolution/refund`:

Trustless Work has no direct "refund" endpoint. The Orchestrator uses a 2-step workaround:

```
Transaction 1: dispute-escrow
  → Signed by: BUYER (approver role)
  → Opens a dispute on the contract

Transaction 2: resolve-dispute (100% to buyer)
  → Signed by: PLATFORM wallet (disputeResolver role)
  → USDC moves from contract → buyer's wallet
```

The **platform wallet** (`PLATFORM_USER_ID` in `.env`) serves as the dispute resolver. It MUST be a different address than the buyer (this is enforced by the Trustless Work contract).

**5. SPLIT Resolution**

Same 2-step process as refund, but with a custom distribution:

```
Transaction 2: resolve-dispute (X% to seller, Y% to buyer)
  → distributions: [{ address: sellerWallet, amount: "80.00" }, { address: buyerWallet, amount: "20.00" }]
```

### Escrow States

| State | Description |
|-------|-------------|
| `CREATING` | Deploy transaction sent to Stellar |
| `CREATED` | Contract deployed, not yet funded |
| `FUNDING` | Fund transaction sent |
| `FUNDED` | USDC locked in contract — **work can begin** |
| `RELEASING` / `RELEASED` | Release transactions executed |
| `REFUNDING` / `REFUNDED` | Refund transactions executed |
| `DISPUTED` | Dispute opened on-chain |

### Key Facts

- **Non-custodial**: The Orchestrator never "has" the funds. They're in a smart contract.
- **Trustless Work is the custodian**: They deployed the contract logic.
- **All amounts are in USDC**, never in the blockchain's native currency (XLM).
- XLM fees (~0.001 XLM per transaction) are handled automatically by user wallets.

---

## Payment Providers

Set `PAYMENT_PROVIDER` in `.env` to choose:

### Crypto-Native (`PAYMENT_PROVIDER=crypto`)

| Aspect | Details |
|--------|---------|
| Deposit | User sends USDC to their Stellar address → auto-detected by `BlockchainMonitorService` |
| Withdrawal | Direct on-chain USDC transfer (synchronous, single API call) |
| Settlement | USDC on Stellar |
| KYC | None required |
| Webhook | Not needed — synchronous operations |
| Target | Crypto-native markets, LATAM, global |

### AirTM (`PAYMENT_PROVIDER=airtm`)

| Aspect | Details |
|--------|---------|
| Deposit | `POST /topups` → redirect user to AirTM confirmation page → webhook confirms |
| Withdrawal | Async two-step: create → commit → AirTM webhook confirms |
| Settlement | USD (fiat) |
| KYC | Required (AirTM handles KYC) |
| Webhook | Required for deposit/withdrawal confirmation |
| Target | Fiat-first markets, no crypto experience required |

### Switching Providers

Change `PAYMENT_PROVIDER=crypto` to `PAYMENT_PROVIDER=airtm` in your `.env` and restart. The Orchestrator will automatically use the appropriate provider for all deposit/withdrawal operations. Escrow mechanics (Trustless Work on Stellar) are the same for both providers.

### Comparison

| Feature | Crypto-Native | AirTM |
|---------|--------------|-------|
| Deposit speed | Seconds (on-chain confirmation) | Minutes (redirect + AirTM processing) |
| Withdrawal speed | Seconds (synchronous) | Minutes to hours (async + KYC checks) |
| Withdrawal rollback | Automatic if Stellar tx fails | Manual intervention needed |
| User experience | No redirect, no KYC | Redirect to AirTM UI |
| Regulatory | User controls their own wallet | AirTM compliant |

---

## Invisible Wallets

When `PAYMENT_PROVIDER=crypto`, every user gets an **invisible Stellar wallet**.

### What is an invisible wallet?

A Stellar keypair (public key + private key) created and stored **entirely server-side** by the Orchestrator. The user never sees or interacts with the wallet — it's completely transparent to them. From the user's perspective, they have a "balance" and a "deposit address". The blockchain is an implementation detail.

### How it works

```
User is created
    ↓
Orchestrator generates a Stellar keypair (Ed25519)
    ↓
Public key → stored in DB (plain text, safe to expose)
Private key → AES-256-GCM encrypted with WALLET_ENCRYPTION_KEY → stored in DB
    ↓
Orchestrator funds the wallet with minimum XLM (for Stellar account activation)
Orchestrator sets up the USDC trustline (authorization to hold USDC)
    ↓
User's deposit address = their wallet's public key
    ↓
User sends USDC to that address from any Stellar wallet/exchange
BlockchainMonitorService detects it → credits available balance
```

### Security

| Measure | Description |
|---------|-------------|
| AES-256-GCM | Industry-standard encryption for private keys at rest |
| `WALLET_ENCRYPTION_KEY` | 32-byte hex key, stored only in `.env`, never in DB |
| Key never in memory longer than needed | Decrypted only during transaction signing |
| Key never in logs | Logging is filtered to exclude sensitive fields |

### Custodial responsibility

Invisible wallets ARE custodial — the Orchestrator holds the private keys. This means:
- **You are responsible** for securing `WALLET_ENCRYPTION_KEY`
- If you lose `WALLET_ENCRYPTION_KEY`, all private keys become unrecoverable
- Back up this key in a secure secrets manager (AWS Secrets Manager, HashiCorp Vault, etc.)
- Consider insurance for large balances in production

### Why not Freighter (browser wallet)?

Freighter requires the user's browser to be open and actively approving each transaction. This breaks the automated escrow flow — releases, refunds, and dispute resolutions happen server-side without user interaction. Invisible wallets are the only option that supports full automation. See [wallet-strategy.md](../crypto-native/wallet-strategy.md) for the full decision rationale.

---

## Authentication & API Keys

### How it works

The Orchestrator uses API keys (not user JWTs). Your marketplace backend uses a single API key to represent itself — this is server-to-server authentication.

```
Browser → Your Backend (has API key) → Orchestrator API
```

**Never expose the API key to the browser or mobile app.**

### Getting an API key

**Option 1: Via the Master Key** (initial setup)

```bash
curl -X POST http://localhost:4000/api/v1/auth/api-keys \
  -H "Authorization: Bearer YOUR_OFFERHUB_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "Production Marketplace", "scopes": ["read", "write"]}'
```

**Option 2: Via the CLI**

```bash
offerhub keys create \
  --user-id usr_admin \
  --scopes read,write \
  --name "Production Key"
```

### Scopes

| Scope | What it allows |
|-------|---------------|
| `read` | All `GET` endpoints |
| `write` | `POST` endpoints that create/modify resources |
| `support` | Resolve disputes, assign cases |
| `*` | All operations (master/admin key) |

### Using the API key

Every request must include:
```http
Authorization: Bearer ohk_live_xxxxxxxxxxxxxxxxxxxxxxxx
```

### Generating short-lived tokens

For scenarios where you want to limit token lifetime:

```bash
# Generate a token valid for 1 hour from a key
offerhub keys token key_abc123 --ttl 3600
```

---

## Idempotency

All `POST` endpoints that create or modify state accept an `Idempotency-Key` header.

```http
POST /api/v1/orders
Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json
```

### Why it matters

If your network request times out and you retry, you might accidentally create a duplicate order or double-charge a user. Idempotency keys prevent this — if you retry with the same key, you get the same response without the operation running twice.

### Rules

- Use a **UUID v4** per request
- The key must be **unique per operation** — don't reuse the same key for different operations
- Keys are cached for **24 hours**
- If you retry with the same key but a **different body**, you get `409 IDEMPOTENCY_KEY_REUSED`

### When to use it

Use idempotency keys on all mutating `POST` calls, especially:
- `POST /orders` — create order
- `POST /orders/:id/reserve` — reserve funds
- `POST /orders/:id/escrow` — create escrow
- `POST /orders/:id/escrow/fund` — fund escrow
- `POST /orders/:id/resolution/release` — release
- `POST /orders/:id/resolution/refund` — refund
- `POST /withdrawals` — withdrawal

---

## Events & Real-Time

The Orchestrator emits domain events for every state change. You can subscribe to them in real-time via SSE (Server-Sent Events).

### Why events?

Instead of polling endpoints to check if an order changed state, you subscribe to the event stream and react immediately. This is essential for:
- Updating your UI when a payment is confirmed
- Triggering notifications when an escrow is funded
- Logging all state changes for audit

### Event format

Every event follows this structure:

```json
{
  "eventId": "evt_n_8yumeOFwqPnSbhvemqJ",
  "eventType": "order.escrow_funded",
  "occurredAt": "2026-02-18T17:37:12.000Z",
  "aggregateId": "ord_VxaMOdTTsNKjDEhfagkI0",
  "aggregateType": "Order",
  "payload": {
    "orderId": "ord_VxaMOdTTsNKjDEhfagkI0",
    "escrowId": "esc_...",
    "fundedAt": "2026-02-18T17:37:12.000Z"
  },
  "metadata": {
    "correlationId": "...",
    "userId": "usr_..."
  }
}
```

### Subscribe to events

```bash
# Subscribe to all events
curl -N \
  -H "Authorization: Bearer ohk_live_..." \
  "http://localhost:4000/api/v1/events"

# Subscribe only to order events
curl -N \
  -H "Authorization: Bearer ohk_live_..." \
  "http://localhost:4000/api/v1/events?resourceTypes=Order"

# Replay missed events after reconnect
curl -N \
  -H "Authorization: Bearer ohk_live_..." \
  -H "Last-Event-ID: 2026-02-18T10:00:00Z" \
  "http://localhost:4000/api/v1/events"
```

The SSE service keeps the last **1,000 events** in Redis for **1 hour**, enabling reconnect + replay.

### TypeScript example

```typescript
import EventSource from 'eventsource';

const es = new EventSource(
  'http://localhost:4000/api/v1/events?resourceTypes=Order,Balance',
  { headers: { Authorization: 'Bearer ohk_live_...' } }
);

es.onmessage = (event) => {
  const data = JSON.parse(event.data);

  switch (data.eventType) {
    case 'order.escrow_funded':
      console.log(`Order ${data.aggregateId} is funded — work can begin`);
      break;
    case 'balance.credited':
      console.log(`User ${data.payload.userId} balance: ${data.payload.newBalance} USDC`);
      break;
    case 'dispute.opened':
      console.log(`Dispute opened for order ${data.payload.orderId}`);
      break;
  }
};

es.onerror = (error) => {
  console.error('SSE connection error — will auto-reconnect');
};
```

For the complete event catalog, see [events-reference.md](./events-reference.md).

---

## Related Guides

- [Marketplace Integration Guide](./marketplace-integration.md) — Quick start + all flow guides
- [Events Reference](./events-reference.md) — Complete event catalog
- [Errors & Troubleshooting](./errors-troubleshooting.md) — Error codes + debug guide
- [Scaling & Customization](./scaling-customization.md) — How to scale and extend
- [Deployment Guide](./deployment.md) — Self-hosting + production setup
