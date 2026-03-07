# AirTM Integration Guide

> How the AirTM fiat payment provider works in OFFER-HUB — deposits (top-ups), withdrawals, and webhooks.

> **Status (Phase 1 — Current):** Setting `PAYMENT_PROVIDER=airtm` throws a `ConfigurationError` at startup with the message: _"Set PAYMENT_PROVIDER=crypto to use Stellar USDC wallets. AirTM support is planned for a future release."_ Use `PAYMENT_PROVIDER=crypto` for production deployments.
>
> **Status (Phase 2 — Planned):** Full `AirtmProvider` implementation is a future milestone. When available, it will require an Enterprise AirTM account. Contact [enterprise.airtm.com](https://enterprise.airtm.com) to request API access in advance.

---

## Table of Contents

- [Overview](#overview)
- [When to Use AirTM vs Crypto](#when-to-use-airtm-vs-crypto)
- [Prerequisites](#prerequisites)
- [Configuration](#configuration)
- [Top-Up Flow (Deposits)](#top-up-flow-deposits)
- [Withdrawal Flow](#withdrawal-flow)
- [Linking AirTM Accounts](#linking-airtm-accounts)
- [Webhooks](#webhooks)
- [Top-Up States](#top-up-states)
- [Withdrawal States](#withdrawal-states)
- [AirTM Sandbox vs Production](#airtm-sandbox-vs-production)
- [Escrow with AirTM](#escrow-with-airtm)

---

## Overview

AirTM is a LATAM-focused digital payments platform that allows users to deposit and withdraw using local payment methods (bank transfers, mobile money, cash points, etc.). When `PAYMENT_PROVIDER=airtm`, the Orchestrator uses AirTM as the payment rail instead of direct Stellar USDC transfers.

The escrow mechanism (Trustless Work smart contracts on Stellar) remains identical — only the deposit/withdrawal method changes.

---

## When to Use AirTM vs Crypto

| Scenario | Recommendation |
|----------|---------------|
| Users are crypto-native, have Stellar wallets | Use `PAYMENT_PROVIDER=crypto` |
| Users are in LATAM and prefer local payment methods | Use `PAYMENT_PROVIDER=airtm` |
| You need fiat on-ramp (cash/bank → USDC) | Use `PAYMENT_PROVIDER=airtm` |
| You need instant deposits | Use `PAYMENT_PROVIDER=crypto` (Stellar is fast) |
| Users don't have crypto wallets | Use `PAYMENT_PROVIDER=airtm` |
| You want no KYC requirements | Use `PAYMENT_PROVIDER=crypto` |

Both modes use identical escrow flows. The difference is only in how users add and withdraw funds.

---

## Prerequisites

1. **Enterprise AirTM Account** — Standard AirTM accounts don't have API access. Request Enterprise access at [enterprise.airtm.com](https://enterprise.airtm.com).

2. **AirTM API Credentials** — Obtained from the AirTM Enterprise dashboard:
   - `AIRTM_API_KEY`
   - `AIRTM_API_SECRET`
   - `AIRTM_WEBHOOK_SECRET`

3. **Public URL** — The Orchestrator must be accessible from the internet for AirTM webhooks:
   - `PUBLIC_BASE_URL=https://your-orchestrator.com`

4. **AirTM Sandbox** — Test with `AIRTM_ENV=sandbox` before going to production.

---

## Configuration

```env
PAYMENT_PROVIDER=airtm

AIRTM_ENV=sandbox          # sandbox or prod
AIRTM_API_KEY=ak_xxx
AIRTM_API_SECRET=as_xxx
AIRTM_WEBHOOK_SECRET=whs_xxx

PUBLIC_BASE_URL=https://your-orchestrator.com
```

---

## Top-Up Flow (Deposits)

AirTM deposits are called "top-ups." The flow is asynchronous — users are redirected to AirTM to complete the payment.

### Full Flow

```
1. User requests to add $100 to their balance
         ↓
2. POST /api/v1/topups
   { userId, amount: "100.00", currency: "USD" }
         ↓
3. Orchestrator calls AirTM API: createPayin()
         ↓
4. AirTM returns: { confirmationUri, airtmPayinId }
         ↓
5. Orchestrator stores topup: TOPUP_AWAITING_USER_CONFIRMATION
   Response: { topupId, confirmationUri }
         ↓
6. Your backend redirects user to confirmationUri
         ↓
7. User completes payment in AirTM (bank transfer, mobile money, etc.)
         ↓
8. AirTM calls your webhook: POST /api/v1/webhooks/airtm
   { event: "payin.succeeded", payinId: "airtm_xxx" }
         ↓
9. Orchestrator credits user balance
   Event emitted: topup.succeeded + balance.credited
         ↓
10. Your SSE subscriber notified: balance.credited
    Update UI, allow user to proceed with order
```

### API Calls

```bash
# Create top-up
POST /api/v1/topups
Authorization: Bearer ohk_live_...
Content-Type: application/json
Idempotency-Key: <uuid-v4>

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
    "confirmationUri": "https://app.airtm.com/p/confirm/xxx"
  }
}
```

Redirect the user to `confirmationUri`. On mobile, you can open this in a WebView or external browser.

### Get Top-Up Status

```bash
GET /api/v1/topups/tp_xyz789
Authorization: Bearer ohk_live_...
```

```json
{
  "success": true,
  "data": {
    "id": "tp_xyz789",
    "status": "TOPUP_SUCCEEDED",
    "amount": "100.00",
    "userId": "usr_abc123",
    "airtmPayinId": "airtm_payin_123",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

## Withdrawal Flow

AirTM withdrawals are a two-step process (create → commit) to allow your backend to review before committing the balance deduction.

### Full Flow

```
1. User requests to withdraw $80 to their AirTM account
         ↓
2. POST /api/v1/withdrawals
   { userId, amount: "80.00", destinationType: "airtm", destination: "user@email.com" }
         ↓
3. Orchestrator creates withdrawal record: WITHDRAWAL_CREATED
   Balance NOT yet debited
         ↓
4. POST /api/v1/withdrawals/:id/commit
         ↓
5. Orchestrator debits balance: available -= 80.00
   Calls AirTM API: createPayout()
         ↓
6. AirTM processes payout (async)
         ↓
7. AirTM calls webhook: payout.completed (or payout.failed)
         ↓
8. Orchestrator updates status: WITHDRAWAL_COMPLETED
   (or restores balance on failure: WITHDRAWAL_FAILED)
         ↓
9. Event emitted: withdrawal.completed + balance.debited
```

### API Calls

```bash
# Step 1: Create
POST /api/v1/withdrawals
{
  "userId": "usr_abc123",
  "amount": "80.00",
  "destinationType": "airtm",
  "destination": "user@airtm.com"
}

# Step 2: Commit (balance deducted here)
POST /api/v1/withdrawals/wd_xyz789/commit
```

The two-step approach gives your backend a review window. You can add custom approval logic (e.g., fraud checks) between create and commit.

---

## Linking AirTM Accounts

Before a user can use AirTM for top-ups or withdrawals, their AirTM account must be linked:

```bash
POST /api/v1/users/usr_abc123/airtm-link
Authorization: Bearer ohk_live_...
Content-Type: application/json

{
  "airtmUserId": "airtm_user_xxx"
}
```

The `airtmUserId` is provided by AirTM when the user logs into AirTM on your platform. Coordinate with AirTM's OAuth flow or account linking API to obtain this.

Without a linked AirTM account, top-up requests will return `422 AIRTM_USER_NOT_LINKED`.

---

## Webhooks

AirTM uses webhooks to notify the Orchestrator of async payment events. The Orchestrator exposes a webhook endpoint:

```
POST /api/v1/webhooks/airtm
```

AirTM will call this URL when:
- `payin.succeeded` — top-up payment confirmed
- `payin.failed` — top-up payment failed
- `payout.completed` — withdrawal processed
- `payout.failed` — withdrawal failed
- `payout.pending_user_action` — user needs to complete additional steps

### Webhook Security

Configure `AIRTM_WEBHOOK_SECRET` to enable HMAC signature verification. The Orchestrator validates every incoming webhook against this secret and rejects unsigned or invalid payloads.

### Webhook URL Configuration

Configure your AirTM app to call:
```
POST https://your-orchestrator.com/api/v1/webhooks/airtm
```

This is derived from `PUBLIC_BASE_URL`. Ensure this URL is:
- Accessible from the internet (not behind a local firewall)
- HTTPS in production
- Running when AirTM retries webhooks

---

## Top-Up States

```
TOPUP_CREATED
    ↓ AirTM returns URI
TOPUP_AWAITING_USER_CONFIRMATION
    ↓ User confirms in AirTM
TOPUP_PROCESSING
    ↓ AirTM confirms
TOPUP_SUCCEEDED  ← balance credited
TOPUP_FAILED     ← balance not changed
TOPUP_CANCELED   ← user canceled or timeout
```

| State | Description |
|-------|-------------|
| `TOPUP_CREATED` | Top-up initiated |
| `TOPUP_AWAITING_USER_CONFIRMATION` | Waiting for user to complete payment in AirTM |
| `TOPUP_PROCESSING` | User confirmed, AirTM verifying |
| `TOPUP_SUCCEEDED` | Payment confirmed, balance credited |
| `TOPUP_FAILED` | Payment rejected by AirTM |
| `TOPUP_CANCELED` | User or system canceled |

---

## Withdrawal States

```
WITHDRAWAL_CREATED
    ↓ POST /commit
WITHDRAWAL_COMMITTED (balance debited)
    ↓ AirTM processing
WITHDRAWAL_PENDING
    ↓ (if user action needed)
WITHDRAWAL_PENDING_USER_ACTION
    ↓ (user completes) / (timeout)
WITHDRAWAL_COMPLETED  ← funds delivered
WITHDRAWAL_FAILED     ← balance restored
WITHDRAWAL_CANCELED   ← balance restored
```

---

## AirTM Sandbox vs Production

| Setting | Sandbox | Production |
|---------|---------|-----------|
| `AIRTM_ENV` | `sandbox` | `prod` |
| API URL | `https://sandbox-enterprise.airtm.io/api/v2` | `https://enterprise.airtm.io/api/v2` |
| Real money | No | Yes |
| Top-up confirmation | Instant (auto-confirm) | Real payment required |

**Always test with sandbox before production.** Sandbox top-ups auto-succeed without a real payment.

---

## Escrow with AirTM

Regardless of payment provider, the escrow flow is identical:

1. Balance credited via AirTM top-up
2. `POST /orders` → `POST /reserve` → `POST /escrow` → `POST /escrow/fund`
3. USDC locked in Trustless Work Soroban contract
4. Release/Refund/Dispute — same as crypto mode

The only AirTM-specific behavior is in steps 1 (top-up) and the optional withdrawal (sending payout to AirTM). The escrow smart contracts are on Stellar regardless.

---

## Related Guides

- [Deposits](./deposits.md) — Deposit flows (both providers)
- [Withdrawals](./withdrawals.md) — Withdrawal flows (both providers)
- [Orders](./orders.md) — Order lifecycle (same for both providers)
- [Architecture](./architecture.md) — Payment Provider Strategy Pattern
- [Deployment](./deployment.md) — AirTM environment variables
