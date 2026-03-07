# Marketplace Integration Guide

> **Audience:** You have your own frontend or marketplace and want to integrate OFFER-HUB Orchestrator to handle payments, escrow, and withdrawals.

---

## What is the Orchestrator?

OFFER-HUB Orchestrator is a **self-hosted payments and escrow backend** that your marketplace calls via REST API or TypeScript SDK. It handles user balances, USDC escrow on Stellar (via Trustless Work), and withdrawals. It does **not** provide a UI, marketplace logic, or user authentication — those are yours. The Orchestrator is server-to-server: your backend calls it with an API key.

---

## Prerequisites

Before your first API call you need:

| Requirement | Where to get it |
|-------------|-----------------|
| Node.js 20+ | [nodejs.org](https://nodejs.org) |
| PostgreSQL (Supabase recommended) | [supabase.com](https://supabase.com) |
| Redis | [Upstash](https://upstash.com) or any Redis provider |
| Stellar testnet account | Automatically created by the Orchestrator |
| Trustless Work API key | [trustlesswork.com](https://trustlesswork.com) |

---

## Environment Variables

Copy `.env.example` to `.env` and fill in these values:

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | Yes | `production` | Runtime environment |
| `PORT` | No | `4000` | API port (default: 4000) |
| `DATABASE_URL` | Yes | `postgresql://...` | Supabase direct URL (port **5432**, not 6543) |
| `DIRECT_URL` | Yes | `postgresql://...` | Same as DATABASE_URL for Prisma migrations |
| `REDIS_URL` | Yes | `redis://:pass@host:6379` | Redis connection |
| `OFFERHUB_MASTER_KEY` | Yes | `a-long-random-secret` | Bootstrap key for API key creation |
| `PAYMENT_PROVIDER` | Yes | `crypto` or `airtm` | Active payment provider |
| `WALLET_ENCRYPTION_KEY` | crypto only | 32-byte hex | AES-256-GCM key for wallet encryption |
| `TRUSTLESS_API_KEY` | Yes | `tw_live_...` | Trustless Work API key |
| `STELLAR_NETWORK` | Yes | `testnet` or `mainnet` | Stellar network |
| `STELLAR_HORIZON_URL` | No | `https://horizon-testnet.stellar.org` | Horizon server URL |
| `STELLAR_USDC_ASSET_CODE` | No | `USDC` | USDC asset code |
| `STELLAR_USDC_ISSUER` | Yes | `GBBD47...` | USDC issuer address |
| `PLATFORM_USER_ID` | Yes | `usr_platform_...` | Internal platform user ID for escrow operations |
| `PUBLIC_BASE_URL` | Yes | `https://api.yourapp.com` | Your Orchestrator's public URL |
| `AIRTM_API_KEY` | airtm only | `...` | AirTM API key |
| `AIRTM_API_SECRET` | airtm only | `...` | AirTM API secret |

> **Supabase note:** Always use the **direct connection URL** (port 5432) for both `DATABASE_URL` and `DIRECT_URL`. The pooler (port 6543) does not support Prisma migrations.

> **Wallet encryption key:** Generate with `openssl rand -hex 32`. Store securely — losing this key makes all wallet private keys unrecoverable.

---

## Quick Start (under 30 minutes)

### Step 1 — Clone and install

```bash
git clone https://github.com/OFFER-HUB/OFFER-HUB.git
cd OFFER-HUB
npm install
cp .env.example .env
# Fill in your .env values
```

### Step 2 — Run database migrations

```bash
npm run prisma:generate
npm run prisma:migrate
```

### Step 3 — Start the API

```bash
npm run dev
# API starts on http://localhost:4000
```

### Step 4 — Create your first API key

```bash
curl -X POST http://localhost:4000/api/v1/auth/api-keys \
  -H "Authorization: Bearer YOUR_OFFERHUB_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "My Marketplace", "scopes": ["read", "write"]}'
```

Response:
```json
{
  "data": {
    "id": "key_...",
    "key": "ohk_live_...",
    "name": "My Marketplace"
  }
}
```

Save `ohk_live_...` — this is your API key for all subsequent calls.

### Step 5 — Create a test user

```bash
curl -X POST http://localhost:4000/api/v1/users \
  -H "Authorization: Bearer ohk_live_..." \
  -H "Content-Type: application/json" \
  -d '{"externalUserId": "your-user-123", "email": "buyer@example.com"}'
```

Response:
```json
{
  "data": {
    "id": "usr_...",
    "externalUserId": "your-user-123"
  }
}
```

You're integrated. The `usr_...` ID is what you use in all subsequent calls.

---

## Connecting From Your Frontend

The Orchestrator is **server-to-server only**. Your marketplace backend calls the Orchestrator — never expose the API key to a browser.

```
Browser → Your Marketplace Backend → Orchestrator API
```

**With the TypeScript SDK (recommended):**

```typescript
import { OfferHubSDK } from '@offerhub/sdk';

const orchestrator = new OfferHubSDK({
  apiUrl: process.env.OFFERHUB_API_URL,  // http://localhost:4000 in dev
  apiKey: process.env.OFFERHUB_API_KEY,  // ohk_live_...
});

// All calls are server-side
const user = await orchestrator.users.create({
  externalUserId: 'your-user-123',
  email: 'buyer@example.com',
});
```

**With plain REST (curl/fetch):**

```http
POST /api/v1/users
Authorization: Bearer ohk_live_...
Content-Type: application/json

{"externalUserId": "your-user-123", "email": "buyer@example.com"}
```

All API responses follow this envelope:
```json
{ "data": { ... }, "meta": { "requestId": "...", "timestamp": "..." } }
```

---

## Core Concepts

### Balance Model

Each user has an internal balance with two components:

| Field | Description |
|-------|-------------|
| `available` | Funds the user can spend or withdraw |
| `reserved` | Funds locked in an active escrow (not spendable) |
| `total` | `available + reserved` |

When an order is funded, `available` decreases and `reserved` increases. When released, `reserved` decreases and the seller's `available` increases.

### Order Lifecycle

```
ORDER_CREATED
    ↓ (reserve funds)
FUNDS_RESERVED
    ↓ (create escrow on Stellar)
ESCROW_CREATED
    ↓ (fund the Stellar contract)
ESCROW_FUNDED
    ↓ (work in progress)
IN_PROGRESS
    ↓                   ↓                  ↓
RELEASE_REQUESTED   REFUND_REQUESTED   DISPUTED
    ↓                   ↓                  ↓
  CLOSED            REFUNDED           RESOLVED → CLOSED
```

See [State Machines](../architecture/state-machines.md) for the complete diagram.

### Payment Providers

Set `PAYMENT_PROVIDER` in your `.env` to switch:

| `PAYMENT_PROVIDER` | Deposits | Withdrawals | Wallets |
|-------------------|----------|-------------|---------|
| `crypto` | User sends USDC to Stellar address | Instant, on-chain | Invisible server-side Stellar keypairs |
| `airtm` | AirTM payin flow | Async, two-step | AirTM accounts |

### Invisible Wallets (crypto mode)

When `PAYMENT_PROVIDER=crypto`, every user gets a Stellar keypair created and managed server-side. The private key is AES-256-GCM encrypted in the database. Users never see or interact with the wallet — it's fully invisible to them.

---

## Flow Guides

### 1. Standard Purchase (Happy Path)

**Step 1 — Buyer deposits USDC**

See the [Deposit Flow](#deposit--add-funds) section below.

**Step 2 — Create an order**

```bash
curl -X POST http://localhost:4000/api/v1/orders \
  -H "Authorization: Bearer ohk_live_..." \
  -H "Content-Type: application/json" \
  -d '{
    "buyerId": "usr_buyer...",
    "sellerId": "usr_seller...",
    "amount": "100.00",
    "currency": "USD",
    "title": "Logo Design",
    "description": "Design a logo for my startup"
  }'
```

Response: `{ "data": { "id": "ord_...", "status": "ORDER_CREATED" } }`

**Step 3 — Reserve funds**

```bash
curl -X POST http://localhost:4000/api/v1/orders/ord_.../reserve \
  -H "Authorization: Bearer ohk_live_..."
```

Response: `{ "data": { "status": "FUNDS_RESERVED" } }`

**Step 4 — Create and fund escrow**

```bash
# Create escrow contract on Stellar
curl -X POST http://localhost:4000/api/v1/orders/ord_.../escrow \
  -H "Authorization: Bearer ohk_live_..."

# Fund the escrow (sends USDC on-chain)
curl -X POST http://localhost:4000/api/v1/orders/ord_.../escrow/fund \
  -H "Authorization: Bearer ohk_live_..."
```

**Step 5 — Release funds to seller**

After work is delivered:

```bash
curl -X POST http://localhost:4000/api/v1/orders/ord_.../resolution/release \
  -H "Authorization: Bearer ohk_live_..." \
  -H "Content-Type: application/json" \
  -d '{"requestedBy": "usr_buyer..."}'
```

Response: `{ "data": { "status": "CLOSED" } }` — seller's `available` balance credited.

---

### 2. Cancel Order

**From ORDER_CREATED or FUNDS_RESERVED:**

```bash
curl -X POST http://localhost:4000/api/v1/orders/ord_.../cancel \
  -H "Authorization: Bearer ohk_live_..."
```

Funds are unreserved immediately. Cannot cancel once escrow is funded (`ESCROW_FUNDED`).

---

### 3. Refund (Without Dispute)

Direct refund from an IN_PROGRESS order:

```bash
curl -X POST http://localhost:4000/api/v1/orders/ord_.../resolution/refund \
  -H "Authorization: Bearer ohk_live_..." \
  -H "Content-Type: application/json" \
  -d '{"reason": "Seller cancelled"}'
```

Internally executes 2 on-chain steps: dispute escrow + resolve 100% to buyer. Buyer's `available` is credited.

---

### 4. Dispute — Seller Wins (FULL_RELEASE)

**Step 1 — Open dispute**

```bash
curl -X POST http://localhost:4000/api/v1/orders/ord_.../resolution/dispute \
  -H "Authorization: Bearer ohk_live_..." \
  -H "Content-Type: application/json" \
  -d '{"openedBy": "BUYER", "reason": "QUALITY_ISSUE"}'
```

> `openedBy` must be `"BUYER"` or `"SELLER"` (uppercase). Not a user ID.

**Step 2 — Resolve in favor of seller**

```bash
curl -X POST http://localhost:4000/api/v1/disputes/dsp_.../resolve \
  -H "Authorization: Bearer ohk_live_..." \
  -H "Content-Type: application/json" \
  -d '{"decision": "FULL_RELEASE"}'
```

---

### 5. Dispute — Buyer Wins (FULL_REFUND)

```bash
curl -X POST http://localhost:4000/api/v1/disputes/dsp_.../resolve \
  -H "Authorization: Bearer ohk_live_..." \
  -H "Content-Type: application/json" \
  -d '{"decision": "FULL_REFUND"}'
```

---

### 6. Dispute — Split Resolution

```bash
curl -X POST http://localhost:4000/api/v1/disputes/dsp_.../resolve \
  -H "Authorization: Bearer ohk_live_..." \
  -H "Content-Type: application/json" \
  -d '{
    "decision": "SPLIT",
    "releaseAmount": "80.00",
    "refundAmount": "20.00",
    "note": "80% of work delivered"
  }'
```

`releaseAmount + refundAmount` must equal the escrow total.

---

### 7. Deposit — Add Funds

#### Crypto path (`PAYMENT_PROVIDER=crypto`)

**Step 1 — Get the user's deposit address**

```bash
curl http://localhost:4000/api/v1/users/usr_.../wallet/deposit \
  -H "Authorization: Bearer ohk_live_..."
```

Response:
```json
{
  "data": {
    "provider": "crypto",
    "method": "stellar_address",
    "address": "GCV24WNJYX...",
    "asset": { "code": "USDC", "issuer": "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5" },
    "network": "testnet",
    "instructions": "Send USDC to this Stellar address. Deposits are detected automatically within seconds."
  }
}
```

**Step 2 — Display address to user**

Show the `address` (and optionally a QR code) to the buyer. They send USDC from any Stellar wallet.

**Step 3 — Automatic credit**

`BlockchainMonitorService` streams Stellar Horizon for each monitored wallet. When USDC arrives on-chain, `available` is credited automatically and a `balance.credited` event is emitted. No webhook or polling needed from your side.

**Testnet USDC:** On testnet, USDC issuer is `GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5`. Use [Stellar Laboratory](https://laboratory.stellar.org/) to send test USDC.

#### AirTM path (`PAYMENT_PROVIDER=airtm`)

```bash
curl -X POST http://localhost:4000/api/v1/topups \
  -H "Authorization: Bearer ohk_live_..." \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: $(uuidgen)" \
  -d '{
    "user_id": "usr_...",
    "amount": "50.00",
    "currency": "USD",
    "return_url": "https://yourapp.com/wallet/success",
    "cancel_url": "https://yourapp.com/wallet/cancel"
  }'
```

Redirect the buyer to `confirmation_uri`. Listen to `topup.completed` SSE event or poll `GET /topups/:id`.

---

### 8. Withdrawal — Move Funds Out

#### Crypto path (`PAYMENT_PROVIDER=crypto`)

Single call, completes synchronously:

```bash
curl -X POST http://localhost:4000/api/v1/withdrawals \
  -H "Authorization: Bearer ohk_live_..." \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "usr_seller...",
    "amount": "50.00",
    "destinationType": "crypto",
    "destinationRef": "GDWXCM..."
  }'
```

Response: `{ "data": { "status": "WITHDRAWAL_COMPLETED" } }` — funds sent on-chain immediately. If the Stellar transaction fails, balance is rolled back automatically.

- `userId` goes in the **request body** (server-to-server, no user auth header)
- `destinationRef` is a Stellar public key (starts with `G`)
- No commit step, no webhook, no polling needed

#### AirTM path (`destinationType: "bank"` or `"airtm_balance"`)

Two-step process:

```bash
# Step 1: Create
curl -X POST http://localhost:4000/api/v1/withdrawals \
  -H "Authorization: Bearer ohk_live_..." \
  -H "Content-Type: application/json" \
  -d '{"userId": "usr_...", "amount": "80.00", "destinationType": "bank", "destinationRef": "bank_ref"}'
# → status: WITHDRAWAL_CREATED

# Step 2: Commit
curl -X POST "http://localhost:4000/api/v1/withdrawals/wd_.../commit?userId=usr_..." \
  -H "Authorization: Bearer ohk_live_..."
# → status: WITHDRAWAL_COMMITTED
```

Or pass `"commit": true` in the creation call to skip the separate commit step.

---

## API Reference

Full endpoint documentation:

| Domain | File |
|--------|------|
| Auth & API Keys | [auth.md](../api/endpoints/auth.md) |
| Users | [users.md](../api/endpoints/users.md) |
| Balance | [balance endpoints in users.md](../api/endpoints/users.md) |
| Orders | [orders.md](../api/endpoints/orders.md) |
| Escrow | [escrow.md](../api/endpoints/escrow.md) |
| Release / Refund | [release-refund.md](../api/endpoints/release-refund.md) |
| Disputes | [disputes.md](../api/endpoints/disputes.md) |
| Deposit (crypto) | [wallet.md](../api/endpoints/wallet.md) |
| Deposit (AirTM) | [topups.md](../api/endpoints/topups.md) |
| Withdrawals | [withdrawals.md](../api/endpoints/withdrawals.md) |
| Events (SSE) | [events.md](../api/endpoints/events.md) |

See also: [API Overview](../api/overview.md), [Error Codes](../api/errors.md), [Idempotency](../api/idempotency.md).

---

## Events & Real-time

The Orchestrator emits domain events you can subscribe to via SSE:

```typescript
const events = new EventSource(
  'http://localhost:4000/api/v1/events',
  { headers: { Authorization: 'Bearer ohk_live_...' } }
);

events.onmessage = (e) => {
  const event = JSON.parse(e.data);
  // event.eventType, event.aggregateId, event.payload
  if (event.eventType === 'balance.credited') {
    // update your UI
  }
};
```

Key events:

| Event | When | Payload |
|-------|------|---------|
| `balance.credited` | USDC deposit detected / escrow released | `userId`, `amount`, `newBalance` |
| `order.created` | Order created | `orderId`, `buyerId`, `sellerId` |
| `order.escrow_funded` | Funds locked on-chain | `orderId`, `contractId` |
| `order.closed` | Release or refund complete | `orderId` |
| `dispute.opened` | Dispute filed | `disputeId`, `openedBy` |
| `dispute.resolved` | Dispute resolved | `disputeId`, `decision` |
| `withdrawal.completed` | Withdrawal on-chain | `withdrawalId`, `amount` |

Full catalog: [events/catalog.md](../events/catalog.md)

---

## Error Handling

All errors follow:
```json
{
  "error": {
    "code": "INSUFFICIENT_FUNDS",
    "message": "User available balance is less than the requested amount",
    "statusCode": 422
  }
}
```

Common errors:

| Code | HTTP | Cause | Fix |
|------|------|-------|-----|
| `INSUFFICIENT_FUNDS` | 422 | Balance too low | Check `available` before calling |
| `INVALID_STATE_TRANSITION` | 409 | Wrong order state | Check current status first |
| `USER_NOT_FOUND` | 404 | Unknown `userId` | Create the user first |
| `VALIDATION_ERROR` | 400 | Bad request body | Check field types and formats |
| `IDEMPOTENCY_CONFLICT` | 409 | Same key, different body | Use a new `Idempotency-Key` |

Full error reference: [api/errors.md](../api/errors.md)

---

## Idempotency

All `POST` endpoints that create records accept `Idempotency-Key`:

```http
POST /api/v1/orders
Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000
```

If you retry with the same key, you get the same response without duplicating the operation. Use a UUID per request. See [idempotency.md](../api/idempotency.md).

---

## SDK Reference

Install:
```bash
npm install @offerhub/sdk
```

Initialize:
```typescript
import { OfferHubSDK } from '@offerhub/sdk';
const sdk = new OfferHubSDK({ apiUrl: '...', apiKey: '...' });
```

Available resources: `sdk.users`, `sdk.orders`, `sdk.balance`, `sdk.topups`, `sdk.withdrawals`, `sdk.wallet`, `sdk.disputes`.

Full SDK guide: [sdk/integration-guide.md](../sdk/integration-guide.md)

---

## Related Docs

- [Architecture Overview](../architecture/overview.md) — System design and component layers
- [State Machines](../architecture/state-machines.md) — All valid state transitions
- [Flow of Funds](../architecture/flow-of-funds.md) — How money moves through the system
- [Crypto-Native Setup](../deployment/crypto-native-setup.md) — Stellar testnet/mainnet configuration
- [Environment Variables](../deployment/env-variables.md) — Complete .env reference
- [Scaling & Customization](./scaling-customization.md) — How to scale and extend the Orchestrator
