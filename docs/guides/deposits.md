# Deposits Guide

> How users add USDC to their Orchestrator balance — crypto-native (Stellar) and AirTM flows.

---

## Table of Contents

- [Overview](#overview)
- [Crypto-Native Deposits (Stellar USDC)](#crypto-native-deposits-stellar-usdc)
  - [Step 1: Get Deposit Address](#step-1-get-deposit-address)
  - [Step 2: User Sends USDC On-Chain](#step-2-user-sends-usdc-on-chain)
  - [Step 3: Auto-Credit via BlockchainMonitorService](#step-3-auto-credit-via-blockchainmonitorservice)
  - [Step 4: Listen for the Event](#step-4-listen-for-the-event)
- [AirTM Top-Up Flow](#airtm-top-up-flow)
- [Checking the Balance](#checking-the-balance)
- [Deposit Considerations](#deposit-considerations)
- [Troubleshooting](#troubleshooting)

---

## Overview

"Deposit" is how a user adds funds to their Orchestrator balance. The method depends on the configured payment provider:

| Provider | Deposit Method | Currency |
|----------|---------------|---------|
| `crypto` (default) | Send USDC to a Stellar address | USDC on Stellar |
| `airtm` | Top-up via AirTM redirect (fiat) | USD via AirTM |

Once deposited, funds appear as `available` balance and can be used to fund escrow orders.

---

## Crypto-Native Deposits (Stellar USDC)

### Step 1: Get Deposit Address

Each user has a unique, permanent Stellar deposit address:

```bash
GET /api/v1/wallet/deposit-address
Authorization: Bearer ohk_live_...
```

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "GBXF4A7CKUVNLXYZ1234...",
    "network": "stellar",
    "asset": "USDC",
    "memo": null,
    "instructions": "Send USDC (Stellar) to this address. Deposits are credited automatically within 30 seconds."
  }
}
```

You can cache this address — it never changes for a given user.

**In your marketplace UI:**
- Display the address as a QR code and text
- Show "Send USDC on Stellar network" with network disclaimer
- On testnet, link to a USDC faucet for testing

---

### Step 2: User Sends USDC On-Chain

The user sends USDC from any Stellar-compatible source:

| Source | Notes |
|--------|-------|
| Stellar wallet (Lobstr, Solar) | Standard Stellar payment |
| Crypto exchange (Coinbase, Kraken) | Use Stellar network, not Ethereum |
| Another Orchestrator user | Via withdrawal to this address |
| Testnet faucet | For development only |

**Important:** The payment must be:
- On the Stellar network (not Ethereum ERC-20 USDC)
- The USDC asset: `USDC:GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN`
- Sent directly to the user's deposit address

---

### Step 3: Auto-Credit via BlockchainMonitorService

The `BlockchainMonitorService` runs on the Orchestrator and monitors all user wallets in real-time via Stellar Horizon's SSE (Server-Sent Events) stream.

**What happens automatically:**

```
Stellar network processes the payment
    ↓
Horizon SSE stream delivers the transaction to BlockchainMonitorService
    ↓ (usually < 10 seconds after on-chain confirmation)
Orchestrator identifies the destination wallet → user
    ↓
Deduplication check (prevents double-crediting)
    ↓
BalanceService.credit(userId, amount, 'stellar_deposit')
    ↓
User's available balance increases
    ↓
Domain event emitted: balance.credited
```

**No action required from your backend.** This is fully automatic.

### BlockchainMonitorService Behavior

| Behavior | Detail |
|----------|--------|
| Start monitoring | On server startup via `onModuleInit` |
| Stream cursor | `.cursor('now')` — only detects payments **after** server start |
| Deduplication | Uses `processedTxHashes` Set (in-memory + DB check) |
| Multi-instance safety | Run only ONE instance with `DISABLE_BLOCKCHAIN_MONITOR=true` on others |
| Restart behavior | Payments during downtime are NOT auto-detected — use reconciliation job |

> **Warning:** If the Orchestrator was restarted and a payment arrived during downtime, it won't be auto-credited. The reconciliation worker handles this automatically — see below.

---

### Reconciliation Worker (Missed Deposits)

Because `BlockchainMonitorService` uses `.cursor('now')`, any payment made while the server was down (deploys, restarts, SSE drops) would be silently missed. To handle this, a BullMQ background job runs every 5 minutes and catches up:

**How it works:**
1. Fetches all active user wallets from the DB
2. Queries Horizon for payments in the last 24 hours (`order=desc&limit=50`)
3. Filters for incoming USDC payments only
4. For each payment, checks the `ProcessedTransaction` table — if the `transactionHash` is already there, skip
5. If not processed: credits the balance, writes to `ProcessedTransaction`, emits `balance.credited`

**Deduplication:** Both the real-time monitor and the reconciliation worker write to the same `ProcessedTransaction` table in the same DB transaction as the balance credit. This makes double-crediting impossible even in race conditions.

**Event source field:** Reconciled deposits use `source: 'stellar_deposit_reconciled'` instead of `stellar_deposit`. Your webhook handler should treat both the same:

```typescript
es.addEventListener('balance.credited', (event) => {
  const { source, userId, amount } = JSON.parse(event.data).payload;
  if (source === 'stellar_deposit' || source === 'stellar_deposit_reconciled') {
    notifyUser(userId, `Deposit of ${amount} USDC confirmed`);
  }
});
```

**Configuration:**
```env
# Disable the reconciliation worker (not recommended for production)
RECONCILIATION_ENABLED=false
```

---

### Step 4: Listen for the Event

Subscribe to the `balance.credited` event to notify users:

```typescript
es.addEventListener('balance.credited', (event) => {
  const data = JSON.parse(event.data);
  if (data.payload.source === 'stellar_deposit') {
    const { userId, amount, newBalance } = data.payload;
    // Update UI, send notification
    notifyUser(userId, `Deposit of ${amount} USDC confirmed. New balance: ${newBalance}`);
  }
});
```

Event payload:
```json
{
  "eventType": "balance.credited",
  "aggregateId": "usr_abc123",
  "payload": {
    "userId": "usr_abc123",
    "amount": "10.00",
    "source": "stellar_deposit",
    "newBalance": "60.00",
    "transactionHash": "abc123...stellar...tx...hash"
  }
}
```

---

## AirTM Top-Up Flow

When `PAYMENT_PROVIDER=airtm`, deposits are called "top-ups" and go through the AirTM fiat payment flow.

> AirTM integration requires an Enterprise AirTM account. Contact AirTM for access.

### Top-Up Flow Overview

```
1. Buyer requests top-up via your marketplace
       ↓
2. POST /api/v1/topups
   { userId: "usr_...", amount: "100.00", currency: "USD" }
       ↓
3. Orchestrator calls AirTM API → creates payin
   Response: { topupId, confirmationUri, status: "TOPUP_AWAITING_USER_CONFIRMATION" }
       ↓
4. Redirect user to confirmationUri (AirTM hosted page)
       ↓
5. User completes payment in AirTM (connects bank, card, etc.)
       ↓
6. AirTM webhook → Orchestrator: payin.succeeded
       ↓
7. Orchestrator credits balance
   Event emitted: topup.succeeded + balance.credited
```

### API

```bash
# Create top-up
POST /api/v1/topups
Authorization: Bearer ohk_live_...
Content-Type: application/json
Idempotency-Key: uuid-v4

{
  "userId": "usr_abc123",
  "amount": "100.00",
  "currency": "USD"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "topupId": "tp_xyz789",
    "status": "TOPUP_AWAITING_USER_CONFIRMATION",
    "confirmationUri": "https://app.airtm.com/confirm/..."
  }
}
```

### Top-Up States

| State | Description |
|-------|-------------|
| `TOPUP_CREATED` | Top-up initiated |
| `TOPUP_AWAITING_USER_CONFIRMATION` | Confirmation URI generated, waiting for user |
| `TOPUP_PROCESSING` | User confirmed, AirTM processing payment |
| `TOPUP_SUCCEEDED` | Payment confirmed, balance credited |
| `TOPUP_FAILED` | Payment rejected by AirTM |
| `TOPUP_CANCELED` | User or system canceled |

### Events to Listen

| Event | When |
|-------|------|
| `topup.confirmation_required` | URI ready, redirect user |
| `topup.processing` | User confirmed in AirTM |
| `topup.succeeded` | Balance credited — notify user |
| `topup.failed` | Show error, offer retry |
| `topup.canceled` | Show cancellation message |

### AirTM User Prerequisites

Before a user can top up via AirTM:
1. User must have an AirTM account
2. User must link their AirTM account: `POST /users/:id/airtm-link`
3. AirTM KYC must be completed

---

## Checking the Balance

After a deposit, verify the updated balance:

```bash
GET /api/v1/balances/:userId
Authorization: Bearer ohk_live_...
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "usr_abc123",
    "available": "60.00",
    "reserved": "0.00",
    "currency": "USDC"
  }
}
```

| Field | Description |
|-------|-------------|
| `available` | Funds free to use for new orders or withdrawals |
| `reserved` | Funds held for an active order (not yet on-chain) |

---

## Deposit Considerations

### Minimum Deposit

There is no minimum enforced by the Orchestrator. However:
- Stellar network requires destination accounts to have a minimum XLM balance (0.5 XLM base reserve)
- New Stellar accounts need a "trustline" for USDC — the Orchestrator creates this automatically on wallet creation

### Deposit Confirmation Time

| Network | Typical Confirmation |
|---------|---------------------|
| Stellar testnet | 3–10 seconds |
| Stellar mainnet | 3–10 seconds |
| Credit to balance | < 30 seconds after confirmation |

Stellar has 5-second block times, so deposits are very fast.

### Multiple Deposits

Each deposit is detected independently. A user can make multiple deposits and each will be credited separately. There is no concept of "one deposit per session."

### Deposits During Downtime

If the Orchestrator was offline when a payment arrived:
- The deposit is NOT automatically detected after restart (`.cursor('now')` behavior)
- The background reconciliation worker periodically checks for missed payments
- In production, monitor for gaps and consider a manual sweep endpoint

---

## Troubleshooting

### Balance Not Updated After Sending USDC

1. Verify the transaction was sent on **Stellar network** (not Ethereum)
2. Verify the asset is **USDC** (`GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN`)
3. Verify the destination is exactly the address from `GET /wallet/deposit-address`
4. Check if the Orchestrator was running when the payment arrived (`.cursor('now')`)
5. Check server logs for `BlockchainMonitorService` errors
6. Wait 30–60 seconds — Horizon streaming can have short delays

### "Wallet not found" Error

The user must be registered via `POST /users` before requesting their deposit address. The wallet is created automatically on user creation.

### Duplicate Deposits

The `BlockchainMonitorService` deduplicates by `transactionHash`. The same on-chain payment will never be credited twice.

### AirTM Top-Up Stuck in PROCESSING

AirTM top-ups are asynchronous. If stuck:
1. Check AirTM webhook logs for delivery failures
2. Verify `PUBLIC_BASE_URL` is correct and reachable by AirTM
3. Check `AIRTM_WEBHOOK_SECRET` is configured
4. AirTM will retry webhooks — wait up to 24 hours before escalating

---

## Related Guides

- [Wallets](./wallets.md) — How invisible wallets work
- [Withdrawals](./withdrawals.md) — Sending USDC out
- [Orders](./orders.md) — Using balance to fund orders
- [Events Reference](./events-reference.md) — balance.credited event details
- [Errors & Troubleshooting](./errors-troubleshooting.md) — Common errors
