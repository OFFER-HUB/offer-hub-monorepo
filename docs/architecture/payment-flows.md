# Payment Flows

This document details the complete payment lifecycle flows in OFFER-HUB, including state transitions and transaction sequences.

## Overview

OFFER-HUB supports two payment modes:
1. **Crypto-Native (Default):** USDC on Stellar with Trustless Work escrow
2. **Airtm Mode:** Fiat on/off-ramp via Airtm

---

## Crypto-Native Flow (Default)

### 1. Deposit Flow

**User deposits USDC to their Stellar wallet address**

```
User sends USDC to deposit address
  ↓
BlockchainMonitor detects incoming payment
  ↓
Balance credited (available += amount)
  ↓
Event emitted: balance.credited
```

**Implementation:**
- Each user has a unique Stellar wallet (invisible, server-managed)
- BlockchainMonitor streams payments from Horizon
- Balance updated in database
- Real-time notification via SSE

---

### 2. Order Creation & Escrow Flow

**Complete flow from order creation to escrow funding**

```
1. POST /orders (create order)
   ↓ Status: CREATED
   
2. POST /orders/:id/reserve (reserve funds)
   ↓ Balance: available → reserved
   ↓ Status: RESERVED
   
3. POST /escrow (create escrow contract)
   ↓ Deploy Soroban contract on Stellar
   ↓ Platform signs as approver
   ↓ Status: ESCROW_CREATING → ESCROW_CREATED
   
4. POST /escrow/:id/fund (fund escrow)
   ↓ Buyer signs transaction
   ↓ USDC transferred to escrow contract
   ↓ Balance: reserved → 0 (on-chain)
   ↓ Status: ESCROW_FUNDED → IN_PROGRESS
```

**State Transitions:**
```
CREATED → RESERVED → ESCROW_CREATING → ESCROW_CREATED → ESCROW_FUNDED → IN_PROGRESS
```

---

### 3. Release Flow (Happy Path)

**Seller completes work, buyer approves, funds released**

```
1. POST /resolution/release (seller: change milestone status)
   ↓ Seller signs: changeMilestoneStatus(milestoneId, "completed")
   ↓ Milestone marked as complete on-chain
   
2. POST /resolution/release (buyer: approve milestone)
   ↓ Buyer signs: approveMilestone(milestoneId)
   ↓ Milestone approved on-chain
   
3. POST /resolution/release (buyer: release funds)
   ↓ Buyer signs: releaseFunds()
   ↓ USDC transferred from escrow to seller's wallet
   ↓ Seller balance credited (available += amount)
   ↓ Order status: COMPLETED
   ↓ Event emitted: order.completed, balance.credited
```

**Total Transactions:** 3 Stellar transactions  
**Signers:** Seller (1x), Buyer (2x)

---

### 4. Refund Flow

**Buyer requests refund, platform resolves**

```
1. POST /resolution/refund (buyer: dispute escrow)
   ↓ Buyer signs: disputeEscrow()
   ↓ Escrow marked as disputed on-chain
   ↓ Order status: DISPUTED
   
2. POST /resolution/refund (platform: resolve dispute)
   ↓ Platform signs as disputeResolver: resolveDispute(100% to buyer)
   ↓ USDC transferred from escrow to buyer's wallet
   ↓ Buyer balance credited (available += amount)
   ↓ Order status: REFUNDED
   ↓ Event emitted: order.refunded, balance.credited
```

**Total Transactions:** 2 Stellar transactions  
**Signers:** Buyer (1x), Platform (1x)

---

### 5. Dispute Resolution (Split)

**Support resolves dispute with custom split**

```
1. POST /disputes (open dispute)
   ↓ Dispute record created
   ↓ Order status: DISPUTED
   
2. POST /disputes/:id/resolve (support: resolve with split)
   ↓ Support specifies: releaseAmount, refundAmount
   ↓ Platform signs: resolveDispute(releaseAmount, refundAmount)
   ↓ USDC split between seller and buyer
   ↓ Both balances credited
   ↓ Order status: COMPLETED (or REFUNDED, depending on majority)
   ↓ Dispute status: RESOLVED
```

**Example:**
- Order amount: $100
- Resolution: $60 to seller, $40 to buyer
- Both parties receive their portion

---

### 6. Withdrawal Flow

**User withdraws USDC to external Stellar address**

```
1. POST /withdrawals (create withdrawal)
   ↓ Validate: available balance >= amount
   ↓ Balance: available → reserved (temporarily)
   ↓ Withdrawal status: PENDING
   
2. POST /withdrawals/:id/commit (commit withdrawal)
   ↓ Orchestrator signs: sendPayment(destination, amount)
   ↓ USDC sent to external address
   ↓ Balance: reserved → 0
   ↓ Withdrawal status: COMPLETED
   ↓ Event emitted: balance.debited
```

---

## Airtm Mode Flow

### 1. Top-Up Flow

**User adds fiat funds via Airtm**

```
1. POST /topups (create top-up)
   ↓ Airtm API: create payin
   ↓ Response: confirmation URL
   ↓ TopUp status: PENDING
   
2. User redirected to Airtm
   ↓ User completes payment in Airtm
   
3. Airtm webhook received
   ↓ Verify HMAC signature
   ↓ TopUp status: CONFIRMED → COMPLETED
   ↓ Balance credited (available += amount)
   ↓ Event emitted: balance.credited
```

---

### 2. Withdrawal Flow (Airtm)

**User withdraws fiat via Airtm**

```
1. POST /withdrawals (create withdrawal)
   ↓ Validate: available balance >= amount
   ↓ Balance: available → reserved
   ↓ Withdrawal status: PENDING
   
2. POST /withdrawals/:id/commit (commit withdrawal)
   ↓ Airtm API: create payout
   ↓ Withdrawal status: PROCESSING
   
3. Airtm webhook received
   ↓ Payout confirmed
   ↓ Balance: reserved → 0
   ↓ Withdrawal status: COMPLETED
   ↓ Event emitted: balance.debited
```

---

## State Machine Diagrams

### Order State Machine

```
┌─────────┐
│ CREATED │
└────┬────┘
     │ reserve funds
     ▼
┌──────────┐
│ RESERVED │
└────┬─────┘
     │ create escrow
     ▼
┌─────────────────┐
│ ESCROW_CREATING │
└────┬────────────┘
     │ escrow created
     ▼
┌────────────────┐
│ ESCROW_CREATED │
└────┬───────────┘
     │ fund escrow
     ▼
┌───────────────┐      ┌───────────┐
│ ESCROW_FUNDED │─────▶│ CANCELLED │
└────┬──────────┘      └───────────┘
     │
     ▼
┌─────────────┐
│ IN_PROGRESS │
└──────┬──────┘
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌───────────┐      ┌──────────┐
│ COMPLETED │      │ REFUNDED │
└───────────┘      └──────────┘
       ▲                 ▲
       │                 │
       └────┬────────────┘
            │
       ┌────────────┐
       │  DISPUTED  │
       └────────────┘
```

---

### Balance Operations

```
┌──────────────┐
│   DEPOSIT    │ (crypto: blockchain, airtm: webhook)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  AVAILABLE   │ ←─────────────┐
└──────┬───────┘                │
       │                        │
       │ reserve                │ release
       ▼                        │
┌──────────────┐                │
│   RESERVED   │ ───────────────┘
└──────┬───────┘
       │
       │ fund escrow
       ▼
┌──────────────┐
│   ON-CHAIN   │ (in escrow contract)
└──────┬───────┘
       │
       │ release/refund
       ▼
┌──────────────┐
│  AVAILABLE   │ (seller or buyer)
└──────────────┘
```

---

## Transaction Sequences

### Release (3 Transactions)

```
Tx 1: changeMilestoneStatus
  Signer: Seller
  Action: Mark milestone as "completed"
  
Tx 2: approveMilestone
  Signer: Buyer
  Action: Approve milestone completion
  
Tx 3: releaseFunds
  Signer: Buyer
  Action: Transfer USDC from escrow to seller
```

### Refund (2 Transactions)

```
Tx 1: disputeEscrow
  Signer: Buyer
  Action: Open dispute on escrow
  
Tx 2: resolveDispute (100% to buyer)
  Signer: Platform (as disputeResolver)
  Action: Transfer USDC from escrow to buyer
```

### Dispute Split (2 Transactions)

```
Tx 1: disputeEscrow
  Signer: Buyer or Seller
  Action: Open dispute on escrow
  
Tx 2: resolveDispute (custom split)
  Signer: Platform (as disputeResolver)
  Action: Split USDC between seller and buyer
```

---

## Error Handling

### Insufficient Balance

```
POST /orders (amount > available balance)
  ↓
Response: 400 Bad Request
{
  "ok": false,
  "code": 4001,
  "message": "Insufficient balance. You have $50 available but need $100."
}
```

### Failed Escrow Funding

```
POST /escrow/:id/fund (transaction fails)
  ↓
Escrow status: ESCROW_CREATED (unchanged)
Balance: reserved (unchanged)
  ↓
User can retry or cancel order
```

### Webhook Failure

```
Airtm webhook received but processing fails
  ↓
Webhook queued in BullMQ for retry
  ↓
Retry with exponential backoff (3 attempts)
  ↓
If all retries fail: manual reconciliation required
```

---

## Idempotency

All state-mutating operations require `Idempotency-Key`:

```
POST /orders
Headers:
  Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000
  
First request: Order created, response cached
Second request (same key): Cached response returned
```

**TTL:**
- Orders: 7 days
- Top-ups: 24 hours
- Withdrawals: 7 days

---

**Next Steps:**
- Review [Data Model](./data-model.md) for entity details
- See [Provider Integration](./provider-integration.md) for external services
- Check [Backend Modules](../backend/modules.md) for implementation
