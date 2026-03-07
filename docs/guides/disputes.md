# Disputes Guide

> How to handle disagreements between buyers and sellers: opening disputes, assigning them to support, and resolving them with FULL_RELEASE, FULL_REFUND, or SPLIT decisions.

---

## Table of Contents

- [Overview](#overview)
- [When to Open a Dispute](#when-to-open-a-dispute)
- [Dispute States](#dispute-states)
- [Opening a Dispute](#opening-a-dispute)
- [Assigning to Support](#assigning-to-support)
- [Resolving a Dispute](#resolving-a-dispute)
  - [FULL_RELEASE — All to Seller](#full_release--all-to-seller)
  - [FULL_REFUND — All to Buyer](#full_refund--all-to-buyer)
  - [SPLIT — Partial to Each Party](#split--partial-to-each-party)
- [What Happens On-Chain](#what-happens-on-chain)
- [Getting Dispute Details](#getting-dispute-details)
- [Balance Effects by Decision](#balance-effects-by-decision)
- [Dispute Events](#dispute-events)
- [Integrating with Your Support System](#integrating-with-your-support-system)
- [Common Mistakes](#common-mistakes)

---

## Overview

A dispute is opened when a buyer or seller cannot reach an agreement and requests human arbitration. The Orchestrator supports a 3-step dispute flow:

```
1. Party opens dispute   → Order frozen, DISPUTED state
2. Support reviews       → Assigned to support agent
3. Support resolves      → Funds distributed on-chain, CLOSED
```

The Orchestrator is **payment-agnostic** — it executes the resolution decision on-chain but does not make the decision itself. Your marketplace or support team decides who gets what.

---

## When to Open a Dispute

Only orders in `IN_PROGRESS` state can have a dispute opened:

| Scenario | Action |
|----------|--------|
| Buyer claims work not delivered | `openedBy: "BUYER"`, `reason: "NOT_DELIVERED"` |
| Buyer claims poor quality | `openedBy: "BUYER"`, `reason: "QUALITY_ISSUE"` |
| Seller claims buyer refusing to approve | `openedBy: "SELLER"`, `reason: "OTHER"` |
| Any other disagreement | `reason: "OTHER"` |

**Important:** Opening a dispute **freezes** the order. No releases, refunds, or new disputes can be initiated until the current dispute is resolved.

---

## Dispute States

```
OPEN          ← Dispute opened, awaiting review
  ↓
UNDER_REVIEW  ← Assigned to a support agent
  ↓
RESOLVED      ← Decision executed on-chain
```

| State | Description |
|-------|-------------|
| `OPEN` | Dispute created, no support agent assigned yet |
| `UNDER_REVIEW` | Support agent reviewing the case |
| `RESOLVED` | Decision made and executed — order is now CLOSED |

---

## Opening a Dispute

**Endpoint:** `POST /api/v1/orders/:orderId/resolution/dispute`

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

**Valid `openedBy` values:** `BUYER` | `SELLER`

**Valid `reason` values:** `NOT_DELIVERED` | `QUALITY_ISSUE` | `OTHER`

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
      "reason": "QUALITY_ISSUE",
      "createdAt": "2026-02-18T10:00:00.000Z"
    }
  }
}
```

**Possible errors:**

| Error Code | Meaning |
|-----------|---------|
| `ORDER_NOT_FOUND` | Order doesn't exist |
| `INVALID_STATE` | Order not in IN_PROGRESS (must be IN_PROGRESS to dispute) |
| `DISPUTE_ALREADY_OPEN` | A dispute already exists for this order |

---

## Assigning to Support

Before resolving, a dispute should be assigned to a support agent:

**Endpoint:** `POST /api/v1/disputes/:disputeId/assign`

```bash
POST /api/v1/disputes/dsp_abc123/assign
Authorization: Bearer ohk_live_...
Content-Type: application/json

{
  "agentId": "agent_support01",
  "notes": "Customer claims seller missed agreed deadline"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "dsp_abc123",
    "status": "UNDER_REVIEW",
    "assignedTo": "agent_support01",
    "notes": "Customer claims seller missed agreed deadline"
  }
}
```

This step emits the `dispute.under_review` event. Assigning is optional but recommended for tracking.

---

## Resolving a Dispute

**Endpoint:** `POST /api/v1/disputes/:disputeId/resolve`

This endpoint executes the decision on-chain — funds are distributed immediately. This action is **irreversible**.

### FULL_RELEASE — All to Seller

All funds go to the seller. Use when the seller delivered as agreed.

```bash
POST /api/v1/disputes/dsp_abc123/resolve
Authorization: Bearer ohk_live_...
Content-Type: application/json

{
  "decision": "FULL_RELEASE",
  "note": "Seller provided evidence of delivery. Buyer's claim rejected."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "dsp_abc123",
    "status": "RESOLVED",
    "decision": "FULL_RELEASE",
    "resolvedAt": "2026-02-18T12:00:00.000Z",
    "order": {
      "id": "ord_VxaM...",
      "status": "CLOSED",
      "finalStatus": "RELEASED"
    }
  }
}
```

### FULL_REFUND — All to Buyer

All funds returned to the buyer. Use when the seller failed to deliver.

```bash
POST /api/v1/disputes/dsp_abc123/resolve
Authorization: Bearer ohk_live_...
Content-Type: application/json

{
  "decision": "FULL_REFUND",
  "note": "Seller did not deliver by deadline. Full refund issued."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "dsp_abc123",
    "status": "RESOLVED",
    "decision": "FULL_REFUND",
    "resolvedAt": "2026-02-18T12:00:00.000Z",
    "order": {
      "id": "ord_VxaM...",
      "status": "CLOSED",
      "finalStatus": "REFUNDED"
    }
  }
}
```

### SPLIT — Partial to Each Party

Funds distributed between buyer and seller. Use for partial delivery or shared fault.

```bash
POST /api/v1/disputes/dsp_abc123/resolve
Authorization: Bearer ohk_live_...
Content-Type: application/json

{
  "decision": "SPLIT",
  "releaseAmount": "60.00",
  "refundAmount": "20.00",
  "note": "Seller delivered partial work. Split 75/25."
}
```

**Important constraints for SPLIT:**
- `releaseAmount` must be provided (funds to seller)
- `refundAmount` must be provided (funds to buyer)
- `releaseAmount + refundAmount` must equal the original order amount
- Both values must be decimal strings with exactly 2 decimal places (e.g., `"60.00"`)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "dsp_abc123",
    "status": "RESOLVED",
    "decision": "SPLIT",
    "releaseAmount": "60.00",
    "refundAmount": "20.00",
    "resolvedAt": "2026-02-18T12:00:00.000Z",
    "order": {
      "id": "ord_VxaM...",
      "status": "CLOSED",
      "finalStatus": "RELEASED"
    }
  }
}
```

---

## What Happens On-Chain

Every resolution (including FULL_RELEASE and FULL_REFUND) executes **2 Stellar transactions**:

| Step | Transaction | Signer | Details |
|------|-------------|--------|---------|
| 1 | `dispute-escrow` | Buyer's wallet | Opens the on-chain dispute flag |
| 2 | `resolve-dispute` | **Platform wallet** | Distributes USDC per the decision |

The `resolve-dispute` payload includes a `distributions` array:

```json
// FULL_RELEASE
{ "distributions": [{ "address": "seller_stellar_address", "amount": "80.00" }] }

// FULL_REFUND
{ "distributions": [{ "address": "buyer_stellar_address", "amount": "80.00" }] }

// SPLIT
{ "distributions": [
    { "address": "seller_stellar_address", "amount": "60.00" },
    { "address": "buyer_stellar_address", "amount": "20.00" }
  ]
}
```

The platform wallet is the sole `disputeResolver` — this ensures neutral arbitration. Neither the buyer nor the seller can trigger the on-chain resolution.

---

## Getting Dispute Details

```bash
GET /api/v1/disputes/dsp_abc123
Authorization: Bearer ohk_live_...
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "dsp_abc123",
    "status": "UNDER_REVIEW",
    "openedBy": "BUYER",
    "reason": "QUALITY_ISSUE",
    "assignedTo": "agent_support01",
    "notes": "Customer claims seller missed agreed deadline",
    "createdAt": "2026-02-18T10:00:00.000Z",
    "order": {
      "id": "ord_VxaM...",
      "amount": "80.00",
      "buyerId": "usr_buyer123",
      "sellerId": "usr_seller456"
    }
  }
}
```

---

## Balance Effects by Decision

| Decision | Buyer Balance | Seller Balance |
|----------|--------------|----------------|
| `FULL_RELEASE` | No change | `+80.00` (full amount) |
| `FULL_REFUND` | `+80.00` (full amount) | No change |
| `SPLIT` ($60/$20) | `+20.00` (refundAmount) | `+60.00` (releaseAmount) |

In all cases, the escrow contract is closed and the USDC is distributed on-chain before the Orchestrator updates internal balances.

---

## Dispute Events

| Event | When | Key Payload Fields |
|-------|------|--------------------|
| `dispute.opened` | Dispute created | `disputeId`, `orderId`, `openedBy`, `reason` |
| `dispute.under_review` | Assigned to support | `disputeId`, `reviewedBy` |
| `dispute.resolved` | Decision executed | `disputeId`, `decision`, `resolvedBy`, `resolvedAt` |

Additionally, on resolution:
- `order.released` or `order.refunded` (depending on decision)
- `order.closed`
- `balance.credited` for seller and/or buyer (depending on decision)

---

## Integrating with Your Support System

### Recommended Integration Pattern

1. **Listen for `dispute.opened` events** → Create a support ticket in your system
2. **Assign ticket to an agent** → Call `POST /disputes/:id/assign`
3. **Agent reviews evidence** → In your marketplace (chat, files, etc.)
4. **Agent submits decision** → Your backend calls `POST /disputes/:id/resolve`
5. **Listen for `dispute.resolved`** → Notify both parties

```typescript
// Example: Auto-assign on open
es.addEventListener('dispute.opened', async (event) => {
  const data = JSON.parse(event.data);
  const { disputeId, orderId, openedBy, reason } = data.payload;

  // Create internal ticket
  const ticket = await yourTicketSystem.create({
    title: `Dispute: ${reason} on order ${orderId}`,
    priority: reason === 'NOT_DELIVERED' ? 'HIGH' : 'NORMAL',
  });

  // Assign to least-busy agent
  const agent = await yourAgentSystem.getLeastBusy();
  await orchestratorSdk.disputes.assign(disputeId, {
    agentId: agent.id,
    notes: `Internal ticket: ${ticket.id}`,
  });
});
```

### Webhook Alternative

If your support system is a third-party tool (Zendesk, Freshdesk, etc.), expose a webhook endpoint on your backend that:
1. Receives the `dispute.opened` SSE event or calls `GET /disputes/:id` to poll
2. Creates a ticket in your support tool
3. When the agent resolves, calls `POST /disputes/:id/resolve` from your backend

---

## Common Mistakes

### Wrong `openedBy` Format

`openedBy` must be uppercase: `"BUYER"` or `"SELLER"` (not `"buyer"` or `"seller"`).

```json
// ❌ Wrong
{ "openedBy": "buyer", "reason": "quality_issue" }

// ✅ Correct
{ "openedBy": "BUYER", "reason": "QUALITY_ISSUE" }
```

### Wrong Endpoint

The dispute endpoint is on the **order**, not a standalone `/disputes` endpoint:

```
❌ POST /api/v1/disputes
✅ POST /api/v1/orders/:orderId/resolution/dispute
```

### SPLIT Amounts Don't Add Up

For SPLIT decisions, `releaseAmount + refundAmount` must equal the order amount exactly:

```json
// Order amount: 80.00
// ❌ Wrong (70.00 + 20.00 = 90.00 ≠ 80.00)
{ "decision": "SPLIT", "releaseAmount": "70.00", "refundAmount": "20.00" }

// ✅ Correct (60.00 + 20.00 = 80.00)
{ "decision": "SPLIT", "releaseAmount": "60.00", "refundAmount": "20.00" }
```

### Resolving Already-Resolved Dispute

Once `RESOLVED`, a dispute cannot be reopened. Order is in terminal `CLOSED` state.

---

## Related Guides

- [Orders](./orders.md) — Order lifecycle and state transitions
- [Escrow](./escrow.md) — On-chain dispute/resolve mechanics
- [Events Reference](./events-reference.md) — Dispute events catalog
- [Errors & Troubleshooting](./errors-troubleshooting.md) — DISPUTE_ALREADY_OPEN, INVALID_STATE
