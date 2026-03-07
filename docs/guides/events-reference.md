# Events Reference

> Complete guide to the OFFER-HUB Orchestrator event system: how events work, how to subscribe, and the full catalog of every event emitted.

---

## Table of Contents

- [Overview](#overview)
- [Event Format](#event-format)
- [Subscribing via SSE](#subscribing-via-sse)
- [Filtering Events](#filtering-events)
- [Reconnect & Replay](#reconnect--replay)
- [TypeScript Integration](#typescript-integration)
- [Complete Event Catalog](#complete-event-catalog)
- [Wildcard Subscriptions](#wildcard-subscriptions)
- [How Your Backend Should React](#how-your-backend-should-react)

---

## Overview

The Orchestrator uses an internal event bus. Every state change — an order being funded, a balance being credited, a dispute being opened — emits a **domain event**. These events are:

1. **Persisted** in the audit log (PostgreSQL)
2. **Buffered** in Redis (last 1,000 events, 1 hour TTL)
3. **Streamed** to subscribers via SSE (Server-Sent Events)

Your marketplace backend subscribes to the event stream and reacts to events in real-time — no polling required.

---

## Event Format

Every event follows the same `DomainEvent` structure:

```typescript
interface DomainEvent<T = Record<string, unknown>> {
  eventId: string;       // "evt_n_8yumeOFwqPnSbhvemqJ" — unique ID
  eventType: string;     // "order.escrow_funded" — from the catalog below
  occurredAt: string;    // ISO 8601 timestamp
  aggregateId: string;   // ID of the resource (e.g., "ord_abc123")
  aggregateType: string; // Resource type (e.g., "Order", "User", "Balance")
  payload: T;            // Event-specific data (see catalog)
  metadata: {
    correlationId?: string;   // Request ID that triggered the event
    causationId?: string;     // ID of the event that caused this one
    userId?: string;          // User who triggered the action
    marketplaceId?: string;
  };
}
```

### SSE Wire Format

On the SSE stream, each event is delivered as:

```
id: 2026-02-18T17:37:12.000Z
event: order.escrow_funded
data: {"eventId":"evt_abc...","eventType":"order.escrow_funded","occurredAt":"2026-02-18T17:37:12.000Z","aggregateId":"ord_VxaM...","aggregateType":"Order","payload":{"orderId":"ord_VxaM...","escrowId":"esc_...","fundedAt":"2026-02-18T17:37:12.000Z"},"metadata":{}}
```

The `id` field is the event timestamp, used for reconnect/replay with `Last-Event-ID`.

---

## Subscribing via SSE

### Endpoint

```
GET /api/v1/events
Authorization: Bearer ohk_live_...
Accept: text/event-stream
```

### Required Scopes

- `read` — for subscribing to events
- `*` — admin scope (receives all events)

### cURL example

```bash
# Subscribe to all events (keep connection open with -N)
curl -N \
  -H "Authorization: Bearer ohk_live_..." \
  -H "Accept: text/event-stream" \
  "http://localhost:4000/api/v1/events"
```

---

## Filtering Events

Use query parameters to filter the stream:

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `types` | string (comma-separated) | Filter by event type | `order.created,order.closed` |
| `resourceTypes` | string (comma-separated) | Filter by aggregate type | `Order,Balance` |

```bash
# Only order events
curl -N -H "Authorization: Bearer ohk_live_..." \
  "http://localhost:4000/api/v1/events?resourceTypes=Order"

# Only deposit and withdrawal completion events
curl -N -H "Authorization: Bearer ohk_live_..." \
  "http://localhost:4000/api/v1/events?types=balance.credited,withdrawal.completed"

# Multiple resource types
curl -N -H "Authorization: Bearer ohk_live_..." \
  "http://localhost:4000/api/v1/events?resourceTypes=Order,Dispute,Balance"
```

---

## Reconnect & Replay

The SSE service stores the last **1,000 events** in Redis for **1 hour**. If your connection drops, reconnect and pass the `Last-Event-ID` header to receive all events you missed.

```bash
# Reconnect and replay events since a specific timestamp
curl -N \
  -H "Authorization: Bearer ohk_live_..." \
  -H "Last-Event-ID: 2026-02-18T10:00:00Z" \
  "http://localhost:4000/api/v1/events"
```

The `Last-Event-ID` value is the `id` field from the last SSE event you received (which is the event's timestamp in ISO 8601 format).

---

## TypeScript Integration

### Node.js backend (recommended)

```typescript
import EventSource from 'eventsource'; // npm install eventsource
import type { DomainEvent } from '@offerhub/sdk';

class OrchestratorEventListener {
  private es: EventSource;

  constructor(private readonly apiUrl: string, private readonly apiKey: string) {}

  connect(lastEventId?: string) {
    const url = `${this.apiUrl}/api/v1/events`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
    };
    if (lastEventId) {
      headers['Last-Event-ID'] = lastEventId;
    }

    this.es = new EventSource(url, { headers });

    this.es.onmessage = (event) => {
      const data: DomainEvent = JSON.parse(event.data);
      this.handleEvent(data);
    };

    this.es.onerror = (error) => {
      console.error('SSE connection error — reconnecting...');
      // EventSource auto-reconnects by default
    };
  }

  private handleEvent(event: DomainEvent) {
    switch (event.eventType) {
      case 'balance.credited':
        // Notify your user that their balance increased
        break;

      case 'order.escrow_funded':
        // The order is now IN_PROGRESS — work can begin
        // Notify the seller to start working
        break;

      case 'order.closed':
        // Order completed — update your marketplace UI
        break;

      case 'dispute.opened':
        // Alert your support team
        break;

      case 'withdrawal.completed':
        // Confirm to the user their funds are on the way
        break;
    }
  }

  disconnect() {
    this.es?.close();
  }
}

// Usage
const listener = new OrchestratorEventListener(
  process.env.OFFERHUB_API_URL!,
  process.env.OFFERHUB_API_KEY!
);
listener.connect();
```

### Next.js API Route (webhook-like handler)

If you prefer a simpler polling approach per operation (e.g., checking if an escrow was funded), use the individual status endpoints:

```typescript
// Poll order status until IN_PROGRESS
async function waitForEscrowFunded(orderId: string, maxAttempts = 30): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    const { data: order } = await sdk.orders.get(orderId);
    if (order.status === 'IN_PROGRESS') return;
    if (['CLOSED', 'REFUNDED', 'RELEASED'].includes(order.status)) {
      throw new Error(`Order ${orderId} ended in unexpected state: ${order.status}`);
    }
    await new Promise((r) => setTimeout(r, 2000)); // wait 2s
  }
  throw new Error(`Order ${orderId} did not reach IN_PROGRESS after ${maxAttempts} attempts`);
}
```

---

## Complete Event Catalog

### User Events

| Event | `aggregateType` | When | Payload |
|-------|----------------|------|---------|
| `user.created` | `User` | User account created via `POST /users` | `{ userId, externalUserId, email, status }` |
| `user.airtm_linked` | `User` | User linked their AirTM account | `{ userId, airtmUserId, linkedAt }` |
| `user.stellar_linked` | `User` | User linked a Stellar address | `{ userId, stellarAddress, linkedAt }` |

### Wallet Events

| Event | `aggregateType` | When | Payload |
|-------|----------------|------|---------|
| `wallet.created` | `Wallet` | Invisible wallet created for new user (crypto mode) | `{ userId, publicKey, provider, funded, trustlineReady }` |

### Balance Events

| Event | `aggregateType` | When | Payload |
|-------|----------------|------|---------|
| `balance.credited` | `Balance` | Balance increased (deposit, refund, escrow release, or SPLIT) | `{ userId, amount, source, newBalance, transactionHash? }` |
| `balance.debited` | `Balance` | Balance decreased (withdrawal, order reservation) | `{ userId, amount, destination, newBalance }` |
| `balance.reserved` | `Balance` | Funds reserved for an order | `{ userId, amount, orderId, reservedBalance }` |
| `balance.released` | `Balance` | Reserved funds released (cancel or refund path) | `{ userId, amount, orderId, reason }` |

**`balance.credited` source values:**

| Source | Trigger |
|--------|---------|
| `stellar_deposit` | USDC sent on-chain to user's wallet |
| `escrow_release` | Escrow released to seller |
| `escrow_refund` | Escrow refunded to buyer |
| `dispute_resolution` | Funds distributed after dispute |
| `withdrawal_failed` | Failed withdrawal rolled back |
| `manual_credit` | Admin credit |

### Top-up Events (AirTM path)

| Event | `aggregateType` | When | Payload |
|-------|----------------|------|---------|
| `topup.created` | `TopUp` | Top-up initiated | `{ userId, amount, currency }` |
| `topup.confirmation_required` | `TopUp` | AirTM returned confirmation URI | `{ topupId, confirmationUri }` |
| `topup.processing` | `TopUp` | User confirmed in AirTM | `{ topupId, airtmPayinId }` |
| `topup.succeeded` | `TopUp` | AirTM confirmed payment, balance credited | `{ topupId, userId, amount, newBalance }` |
| `topup.failed` | `TopUp` | AirTM rejected payment | `{ topupId, reason, errorCode }` |
| `topup.canceled` | `TopUp` | User or system canceled | `{ topupId, canceledBy }` |

### Order Events

| Event | `aggregateType` | When | Payload |
|-------|----------------|------|---------|
| `order.created` | `Order` | `POST /orders` | `{ orderId, buyerId, sellerId, amount, title }` |
| `order.funds_reserved` | `Order` | `POST /orders/:id/reserve` | `{ orderId, amount, buyerId, reservedBalance }` |
| `order.escrow_creating` | `Order` | `POST /orders/:id/escrow` (initiated) | `{ orderId, escrowId }` |
| `order.escrow_funding` | `Order` | `POST /orders/:id/escrow/fund` (initiated) | `{ orderId, escrowId, trustlessContractId }` |
| `order.escrow_funded` | `Order` | Escrow successfully funded on-chain | `{ orderId, escrowId, fundedAt }` |
| `order.in_progress` | `Order` | Order moves to IN_PROGRESS | `{ orderId }` |
| `order.release_requested` | `Order` | Release started | `{ orderId, requestedBy }` |
| `order.released` | `Order` | Funds released to seller | `{ orderId, sellerId, amount, releasedAt }` |
| `order.refund_requested` | `Order` | Refund started | `{ orderId, requestedBy }` |
| `order.refunded` | `Order` | Funds refunded to buyer | `{ orderId, buyerId, amount, refundedAt }` |
| `order.disputed` | `Order` | Dispute opened | `{ orderId, disputeId, openedBy, reason }` |
| `order.canceled` | `Order` | Order canceled pre-escrow | `{ orderId, canceledBy, reason }` |
| `order.closed` | `Order` | Order reached terminal state | `{ orderId, finalStatus, closedAt }` |

### Escrow Events

| Event | `aggregateType` | When | Payload |
|-------|----------------|------|---------|
| `escrow.created` | `Escrow` | Soroban contract deployed on Stellar | `{ escrowId, orderId, amount }` |
| `escrow.funding_started` | `Escrow` | Fund transaction submitted | `{ escrowId, trustlessContractId }` |
| `escrow.funded` | `Escrow` | USDC confirmed locked on-chain | `{ escrowId, fundedAt, amount }` |
| `escrow.milestone_completed` | `Escrow` | Milestone marked complete | `{ escrowId, milestoneRef, completedAt }` |
| `escrow.released` | `Escrow` | USDC released to seller | `{ escrowId, releasedAt, amount }` |
| `escrow.refunded` | `Escrow` | USDC returned to buyer | `{ escrowId, refundedAt, amount }` |

### Dispute Events

| Event | `aggregateType` | When | Payload |
|-------|----------------|------|---------|
| `dispute.opened` | `Dispute` | `POST /orders/:id/resolution/dispute` | `{ disputeId, orderId, openedBy, reason }` |
| `dispute.under_review` | `Dispute` | Dispute assigned to support | `{ disputeId, reviewedBy }` |
| `dispute.resolved` | `Dispute` | `POST /disputes/:id/resolve` | `{ disputeId, decision, resolvedBy, resolvedAt }` |

### Withdrawal Events

| Event | `aggregateType` | When | Payload |
|-------|----------------|------|---------|
| `withdrawal.created` | `Withdrawal` | `POST /withdrawals` | `{ withdrawalId, userId, amount, destinationType }` |
| `withdrawal.committed` | `Withdrawal` | Balance debited (commit step) | `{ withdrawalId, userId, amount, committedBalance }` |
| `withdrawal.pending` | `Withdrawal` | AirTM processing (AirTM path) | `{ withdrawalId, airtmPayoutId }` |
| `withdrawal.pending_user_action` | `Withdrawal` | User action needed in AirTM | `{ withdrawalId, actionRequired }` |
| `withdrawal.completed` | `Withdrawal` | Funds delivered to destination | `{ withdrawalId, userId, amount, completedAt }` |
| `withdrawal.failed` | `Withdrawal` | Withdrawal failed, balance restored | `{ withdrawalId, reason, errorCode }` |
| `withdrawal.canceled` | `Withdrawal` | Withdrawal canceled | `{ withdrawalId, canceledBy, refundedToBalance }` |

---

## Wildcard Subscriptions

The event bus supports prefix matching:

| Pattern | Matches |
|---------|---------|
| `order.*` | All order events |
| `balance.*` | All balance events |
| `topup.*` | All top-up events |
| `withdrawal.*` | All withdrawal events |
| `dispute.*` | All dispute events |
| `escrow.*` | All escrow events |
| `*` | Every event (admin use) |

---

## How Your Backend Should React

### Recommended event handlers

| Event | Recommended action |
|-------|-------------------|
| `balance.credited` (source: `stellar_deposit`) | Notify buyer that their deposit arrived |
| `order.escrow_funded` | Notify seller that funds are locked and work can begin |
| `order.closed` | Mark order complete in your DB, send receipt |
| `order.canceled` | Refund UI state, notify both parties |
| `order.disputed` | Alert your support team, freeze UI actions |
| `dispute.resolved` | Notify both parties of the decision |
| `withdrawal.completed` | Confirm to user their funds are sent |
| `withdrawal.failed` | Notify user, show updated balance |
| `topup.succeeded` | Show updated balance, allow purchase to proceed |
| `topup.failed` | Show error to user, offer retry |

### Avoiding duplicate processing

Events can theoretically be delivered more than once if your SSE consumer reconnects. Use the `eventId` field to deduplicate:

```typescript
const processedEventIds = new Set<string>();

es.onmessage = (event) => {
  const data: DomainEvent = JSON.parse(event.data);
  if (processedEventIds.has(data.eventId)) return; // already handled
  processedEventIds.add(data.eventId);
  handleEvent(data);
};
```

In production, persist processed event IDs to your database or Redis rather than an in-memory Set.

---

## Related Guides

- [Core Concepts](./core-concepts.md) — Event system architecture overview
- [API Reference](./api-reference.md) — REST endpoints
- [Errors & Troubleshooting](./errors-troubleshooting.md) — What to do when things go wrong
