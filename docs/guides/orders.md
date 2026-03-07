# Orders Guide

> Complete lifecycle of a buy/sell order: creation, escrow, release, refund, and cancellation.

---

## Table of Contents

- [What Is an Order?](#what-is-an-order)
- [Order Lifecycle Overview](#order-lifecycle-overview)
- [Order States](#order-states)
- [Step-by-Step: Standard Purchase](#step-by-step-standard-purchase)
  - [1. Create Order](#1-create-order)
  - [2. Reserve Funds](#2-reserve-funds)
  - [3. Create Escrow](#3-create-escrow)
  - [4. Fund Escrow](#4-fund-escrow)
  - [5. Release Funds (Buyer Approves)](#5-release-funds-buyer-approves)
- [Cancel an Order](#cancel-an-order)
- [Request a Refund](#request-a-refund)
- [Open a Dispute](#open-a-dispute)
- [State Transition Rules](#state-transition-rules)
- [Idempotency](#idempotency)
- [Order Events](#order-events)

---

## What Is an Order?

An order represents a commercial transaction between a buyer and seller on your marketplace. The Orchestrator does not understand what is being sold — it only manages the **payment lifecycle**:

1. Buyer funds are reserved
2. Funds are locked in a smart contract escrow
3. Work proceeds
4. Funds are released to the seller (or refunded to the buyer)

Your marketplace frontend handles product listings, communication, and delivery. The Orchestrator handles money.

---

## Order Lifecycle Overview

```
POST /orders          → ORDER_CREATED
POST /reserve         → FUNDS_RESERVED      (buyer balance locked)
POST /escrow          → ESCROW_CREATING
                      → ESCROW_FUNDING
POST /escrow/fund     → ESCROW_FUNDED       (funds locked on-chain)
                      → IN_PROGRESS         (work begins)

Happy path:
POST /resolution/release → RELEASE_REQUESTED
                         → RELEASED
                         → CLOSED

Refund path:
POST /resolution/refund  → REFUND_REQUESTED
                         → REFUNDED
                         → CLOSED

Dispute path:
POST /resolution/dispute → DISPUTED
POST /disputes/:id/resolve → RELEASED or REFUNDED → CLOSED

Cancel path (pre-escrow only):
POST /cancel           → CLOSED             (funds returned)
```

---

## Order States

| State | Description | Balance Effect |
|-------|-------------|----------------|
| `ORDER_CREATED` | Order created, no funds touched | None |
| `FUNDS_RESERVED` | Buyer's balance reserved (logical hold) | `available -= amount`, `reserved += amount` |
| `ESCROW_CREATING` | Smart contract being deployed on Stellar | None |
| `ESCROW_FUNDING` | Funds being sent to smart contract | None |
| `ESCROW_FUNDED` | USDC locked in Soroban contract on-chain | `reserved -= amount` (now on-chain) |
| `IN_PROGRESS` | Work in progress | None |
| `RELEASE_REQUESTED` | Release being processed (3 Stellar txns) | None |
| `RELEASED` | Funds released to seller | Seller: `available += amount` |
| `REFUND_REQUESTED` | Refund being processed | None |
| `REFUNDED` | Funds returned to buyer | Buyer: `available += amount` |
| `DISPUTED` | Dispute open, flow frozen | None |
| `CLOSED` | Terminal state | None |

---

## Step-by-Step: Standard Purchase

### 1. Create Order

```bash
POST /api/v1/orders
Authorization: Bearer ohk_live_...
Content-Type: application/json
Idempotency-Key: <uuid-v4>

{
  "buyerId": "usr_buyer123",
  "sellerId": "usr_seller456",
  "amount": "80.00",
  "title": "Logo design",
  "description": "Design a logo for my startup"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ord_VxaM...",
    "status": "ORDER_CREATED",
    "buyerId": "usr_buyer123",
    "sellerId": "usr_seller456",
    "amount": "80.00",
    "title": "Logo design",
    "createdAt": "2026-02-18T10:00:00.000Z"
  }
}
```

No money moves yet. The order is a record in the database.

---

### 2. Reserve Funds

Lock the buyer's balance so it can't be used for other orders:

```bash
POST /api/v1/orders/ord_VxaM.../reserve
Authorization: Bearer ohk_live_...
Content-Type: application/json
Idempotency-Key: <uuid-v4>

{
  "amount": "80.00"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ord_VxaM...",
    "status": "FUNDS_RESERVED",
    "reservedAt": "2026-02-18T10:01:00.000Z"
  }
}
```

Buyer's balance: `available -= 80.00`, `reserved += 80.00`

**Fails with `INSUFFICIENT_FUNDS`** if buyer's available balance is less than the order amount.

---

### 3. Create Escrow

Deploy a Soroban smart contract on Stellar via Trustless Work:

```bash
POST /api/v1/orders/ord_VxaM.../escrow
Authorization: Bearer ohk_live_...
Content-Type: application/json
Idempotency-Key: <uuid-v4>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ord_VxaM...",
    "status": "ESCROW_CREATING",
    "escrow": {
      "id": "esc_abc123",
      "trustlessContractId": "C...",
      "status": "CREATING"
    }
  }
}
```

The Orchestrator deploys the smart contract using the platform wallet's signing key. This may take a few seconds.

---

### 4. Fund Escrow

Send the buyer's reserved USDC to the smart contract on-chain:

```bash
POST /api/v1/orders/ord_VxaM.../escrow/fund
Authorization: Bearer ohk_live_...
Content-Type: application/json
Idempotency-Key: <uuid-v4>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ord_VxaM...",
    "status": "IN_PROGRESS",
    "escrow": {
      "id": "esc_abc123",
      "status": "FUNDED",
      "fundedAt": "2026-02-18T10:05:00.000Z"
    }
  }
}
```

The Orchestrator uses the buyer's invisible wallet to sign the funding transaction. USDC is now locked in the Soroban contract. `reserved -= 80.00` (funds are on-chain, no longer in Orchestrator's balance tracking).

Order moves to `IN_PROGRESS` — work can now begin.

---

### 5. Release Funds (Buyer Approves)

When the buyer approves the delivered work:

```bash
POST /api/v1/orders/ord_VxaM.../resolution/release
Authorization: Bearer ohk_live_...
Content-Type: application/json
Idempotency-Key: <uuid-v4>

{
  "requestedBy": "BUYER"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ord_VxaM...",
    "status": "CLOSED",
    "finalStatus": "RELEASED",
    "closedAt": "2026-02-18T11:00:00.000Z"
  }
}
```

**Under the hood — 3 Stellar transactions:**

| # | Transaction | Signer |
|---|-------------|--------|
| 1 | `changeMilestoneStatus` | Seller's wallet |
| 2 | `approveMilestone` | Buyer's wallet |
| 3 | `releaseFunds` | Buyer's wallet |

After `releaseFunds`:
- USDC sent to seller's Stellar wallet on-chain
- Seller's Orchestrator balance: `available += 80.00`
- Order transitions to `RELEASED` → `CLOSED`

---

## Cancel an Order

Cancellation is only allowed **before escrow is funded** (states: `ORDER_CREATED`, `FUNDS_RESERVED`):

```bash
POST /api/v1/orders/ord_VxaM.../cancel
Authorization: Bearer ohk_live_...
Content-Type: application/json
Idempotency-Key: <uuid-v4>

{
  "canceledBy": "BUYER",
  "reason": "Changed my mind"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ord_VxaM...",
    "status": "CLOSED",
    "finalStatus": "CANCELED"
  }
}
```

If funds were reserved, they are returned: `reserved -= amount`, `available += amount`.

**Cannot cancel after `ESCROW_FUNDING`** — funds are on-chain and require the dispute/refund process.

---

## Request a Refund

When the order is `IN_PROGRESS` and the buyer wants funds back:

```bash
POST /api/v1/orders/ord_VxaM.../resolution/refund
Authorization: Bearer ohk_live_...
Content-Type: application/json
Idempotency-Key: <uuid-v4>

{
  "requestedBy": "BUYER"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ord_VxaM...",
    "status": "CLOSED",
    "finalStatus": "REFUNDED",
    "closedAt": "2026-02-18T11:00:00.000Z"
  }
}
```

**Under the hood — 2 Stellar transactions:**

| # | Transaction | Signer |
|---|-------------|--------|
| 1 | `dispute-escrow` | Buyer's wallet (disputer role) |
| 2 | `resolve-dispute` (100% to buyer) | Platform wallet (disputeResolver role) |

After resolution:
- USDC returned to buyer's Stellar wallet on-chain
- Buyer's Orchestrator balance: `available += 80.00`

> This uses the dispute+resolve mechanism internally (Trustless Work has no direct refund endpoint).

---

## Open a Dispute

When parties cannot agree and support needs to intervene:

```bash
POST /api/v1/orders/ord_VxaM.../resolution/dispute
Authorization: Bearer ohk_live_...
Content-Type: application/json
Idempotency-Key: <uuid-v4>

{
  "openedBy": "BUYER",
  "reason": "QUALITY_ISSUE"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ord_VxaM...",
    "status": "DISPUTED",
    "dispute": {
      "id": "dsp_abc123",
      "status": "OPEN",
      "openedBy": "BUYER",
      "reason": "QUALITY_ISSUE"
    }
  }
}
```

Valid `reason` values: `NOT_DELIVERED`, `QUALITY_ISSUE`, `OTHER`

Valid `openedBy` values: `BUYER`, `SELLER`

The order is frozen in `DISPUTED` state until support resolves it.

**See [Disputes Guide](./disputes.md) for the full resolution flow.**

---

## State Transition Rules

These transitions are enforced by the Orchestrator — invalid transitions return `409 INVALID_STATE`:

```typescript
ORDER_CREATED      → FUNDS_RESERVED | CLOSED (cancel)
FUNDS_RESERVED     → ESCROW_CREATING | CLOSED (cancel)
ESCROW_CREATING    → ESCROW_FUNDING
ESCROW_FUNDING     → ESCROW_FUNDED
ESCROW_FUNDED      → IN_PROGRESS
IN_PROGRESS        → RELEASE_REQUESTED | REFUND_REQUESTED | DISPUTED
RELEASE_REQUESTED  → RELEASED
REFUND_REQUESTED   → REFUNDED
DISPUTED           → RELEASED | REFUNDED (via dispute resolution)
RELEASED           → CLOSED
REFUNDED           → CLOSED
CLOSED             → (terminal — no transitions)
```

**Key business rules:**
- Cancel only works pre-escrow (`ORDER_CREATED`, `FUNDS_RESERVED`)
- Only one dispute per order at a time
- Release and refund are mutually exclusive — once started, can't switch

---

## Idempotency

All state-changing order endpoints accept an `Idempotency-Key` header:

```bash
Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000
```

If you repeat a request with the same key and body, you'll get the same response. If the first request is still processing, you'll get `409 IDEMPOTENCY_KEY_IN_PROGRESS` — poll the order status and retry.

Rules:
- Use a new UUID per unique operation
- The same key with a different body returns `409 IDEMPOTENCY_KEY_REUSED`
- Keys expire after 24 hours

---

## Order Events

| Event | When |
|-------|------|
| `order.created` | `POST /orders` |
| `order.funds_reserved` | `POST /reserve` |
| `order.escrow_creating` | `POST /escrow` initiated |
| `order.escrow_funding` | `POST /escrow/fund` initiated |
| `order.escrow_funded` | Escrow confirmed on-chain |
| `order.in_progress` | Order moves to IN_PROGRESS |
| `order.release_requested` | Release initiated |
| `order.released` | Funds released to seller |
| `order.refund_requested` | Refund initiated |
| `order.refunded` | Funds returned to buyer |
| `order.disputed` | Dispute opened |
| `order.canceled` | Order canceled pre-escrow |
| `order.closed` | Terminal state reached |

Subscribe to `order.*` to receive all order events.

---

## Related Guides

- [Escrow](./escrow.md) — On-chain escrow mechanics deep dive
- [Disputes](./disputes.md) — Dispute resolution flows
- [Deposits](./deposits.md) — Adding balance for buyers
- [Events Reference](./events-reference.md) — Order events catalog
- [Errors & Troubleshooting](./errors-troubleshooting.md) — INVALID_STATE, INSUFFICIENT_FUNDS, etc.
