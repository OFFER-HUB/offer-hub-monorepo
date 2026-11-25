# Withdrawals Guide

> How users send USDC out of the Orchestrator on Stellar.

> **Looking for the public API guide?** This is the internal engineering reference (Orchestrator implementation detail). For the external API/SDK guide aimed at integrators, see [`content/docs/guide/withdrawals.mdx`](../../content/docs/guide/withdrawals.mdx).

---

## Table of Contents

- [Overview](#overview)
- [Crypto-Native Withdrawals (Stellar USDC)](#crypto-native-withdrawals-stellar-usdc)
  - [Step 1: Create Withdrawal](#step-1-create-withdrawal)
  - [Step 2: Automatic Execution](#step-2-automatic-execution)
  - [Step 3: Listen for Completion](#step-3-listen-for-completion)
- [Withdrawal States](#withdrawal-states)
- [Checking Withdrawal Status](#checking-withdrawal-status)
- [Failure & Rollback](#failure--rollback)
- [Troubleshooting](#troubleshooting)

---

## Overview

Withdrawals allow users to send funds from their Orchestrator balance to an external Stellar address.

| Provider | Method | Destination | Speed |
|----------|--------|------------|-------|
| `crypto` | Direct Stellar transfer | Any Stellar address | 3–30 seconds |

**Prerequisite:** The user must have sufficient `available` balance. Reserved funds cannot be withdrawn.

---

## Crypto-Native Withdrawals (Stellar USDC)

In crypto mode, a withdrawal is a direct on-chain Stellar payment from the user's invisible wallet to an external Stellar address.

### Step 1: Create Withdrawal

```bash
POST /api/v1/withdrawals
Authorization: Bearer ohk_live_...
Content-Type: application/json
Idempotency-Key: <uuid-v4>

{
  "userId": "usr_abc123",
  "amount": "50.00",
  "destinationType": "stellar",
  "destination": "GBXF...RECIPIENT...STELLAR...ADDRESS"
}
```

**Response (immediate — crypto mode is synchronous):**
```json
{
  "success": true,
  "data": {
    "withdrawalId": "wd_xyz789",
    "status": "WITHDRAWAL_COMPLETED",
    "amount": "50.00",
    "destination": "GBXF...RECIPIENT...",
    "transactionHash": "abc123...stellar...tx...",
    "completedAt": "2026-02-18T17:37:12.000Z"
  }
}
```

> **Note:** Crypto withdrawals complete synchronously. The API call blocks until the Stellar transaction is confirmed. The response contains `WITHDRAWAL_COMPLETED` immediately.

### Step 2: Automatic Execution

When a crypto withdrawal is created:

```
1. Orchestrator validates: sufficient available balance
2. BalanceService.debit(userId, amount) — available balance decreases
3. WalletService decrypts user's Stellar secret key (in memory)
4. Orchestrator signs a Stellar payment transaction
5. Transaction submitted to Stellar network
6. Horizon confirms the transaction
7. Withdrawal record updated to COMPLETED
8. Events emitted: withdrawal.committed, withdrawal.completed
```

The user's Stellar secret key is decrypted in memory only for the duration of this operation.

### Step 3: Listen for Completion

```typescript
es.addEventListener('withdrawal.completed', (event) => {
  const data = JSON.parse(event.data);
  const { withdrawalId, userId, amount, completedAt } = data.payload;
  // Notify user: "Your withdrawal of X USDC has been sent"
});

es.addEventListener('withdrawal.failed', (event) => {
  const data = JSON.parse(event.data);
  const { withdrawalId, reason } = data.payload;
  // Notify user, show updated balance (auto-restored)
});
```

---

## Withdrawal States

### Crypto-Native States

```
WITHDRAWAL_CREATED
    ↓ (immediate)
WITHDRAWAL_COMMITTED
    ↓ (Stellar tx confirmed)
WITHDRAWAL_COMPLETED
```

Crypto withdrawals skip the async states — they complete in the same API call.

### Terminal States

| State | Balance |
|-------|---------|
| `WITHDRAWAL_COMPLETED` | Debited (funds sent) |
| `WITHDRAWAL_FAILED` | Restored (funds returned) |
| `WITHDRAWAL_CANCELED` | Restored (funds returned) |

---

## Checking Withdrawal Status

```bash
GET /api/v1/withdrawals/:withdrawalId
Authorization: Bearer ohk_live_...
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "wd_xyz789",
    "userId": "usr_abc123",
    "amount": "50.00",
    "destination": "GBXF...",
    "destinationType": "stellar",
    "status": "WITHDRAWAL_COMPLETED",
    "transactionHash": "abc123...",
    "createdAt": "2026-02-18T17:30:00.000Z",
    "completedAt": "2026-02-18T17:30:15.000Z"
  }
}
```

---

## Failure & Rollback

If a withdrawal fails (network error or Stellar rejection), the Orchestrator automatically restores the user's balance:

```
Withdrawal FAILED
    ↓
BalanceService.credit(userId, amount, 'withdrawal_failed')
    ↓
available balance restored
    ↓
Event emitted: balance.credited (source: "withdrawal_failed")
                withdrawal.failed
```

**No manual intervention required.** The rollback is automatic and atomic.

### What Can Cause Failures

| Cause | Details |
|-------|---------|
| Invalid Stellar address | Destination doesn't exist or has no USDC trustline |
| Insufficient XLM | User wallet needs XLM to pay transaction fees |
| Stellar network error | Retry usually succeeds |

---

## Troubleshooting

### "INSUFFICIENT_FUNDS" Error

The user's `available` balance is less than the withdrawal amount. Check:
```bash
GET /api/v1/balances/:userId
```
Note: `reserved` funds cannot be withdrawn — they are locked for active orders.

### Crypto Withdrawal: Transaction Not Found

If `status = WITHDRAWAL_COMPLETED` but user doesn't see funds:
1. Check `transactionHash` on Stellar Explorer
2. Verify recipient address had USDC trustline
3. Stellar is very reliable — if hash exists, funds were sent

### Balance Not Restored After Failure

If you believe a balance rollback was missed:
1. Check audit logs for the withdrawal ID
2. Look for `balance.credited` event with `source: "withdrawal_failed"`
3. Contact support with the `withdrawalId` and event timestamps

---

## Related Guides

- [Deposits](./deposits.md) — Adding funds
- [Wallets](./wallets.md) — How invisible wallets work
- [Orders](./orders.md) — Escrow order flows
- [Events Reference](./events-reference.md) — Withdrawal events
- [Errors & Troubleshooting](./errors-troubleshooting.md) — Error codes
