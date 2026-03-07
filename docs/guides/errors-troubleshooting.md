# Errors & Troubleshooting

> Complete error code reference, HTTP status codes, retry strategies, and debugging guidance.

---

## Table of Contents

- [Error Response Format](#error-response-format)
- [HTTP Status Codes](#http-status-codes)
- [Error Code Reference](#error-code-reference)
  - [Authentication Errors](#authentication-errors)
  - [Validation Errors](#validation-errors)
  - [User Errors](#user-errors)
  - [Balance / Funds Errors](#balance--funds-errors)
  - [Order / State Machine Errors](#order--state-machine-errors)
  - [Idempotency Errors](#idempotency-errors)
  - [Provider Errors](#provider-errors)
  - [Withdrawal Errors](#withdrawal-errors)
  - [Rate Limiting](#rate-limiting)
- [Retry Strategies](#retry-strategies)
- [Debugging Guide](#debugging-guide)
  - [Balance Discrepancies](#balance-discrepancies)
  - [Order Stuck in a State](#order-stuck-in-a-state)
  - [Deposit Not Credited](#deposit-not-credited)
  - [Withdrawal Not Completing](#withdrawal-not-completing)
  - [Events Not Arriving](#events-not-arriving)
- [SDK Error Handling](#sdk-error-handling)

---

## Error Response Format

All errors follow a consistent structure:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable description",
    "details": {}
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `code` | string | Machine-readable code — use this for programmatic handling |
| `message` | string | Human-readable description — do NOT use for logic, can change |
| `details` | object | Additional context (available, requested amount, current state, etc.) |

---

## HTTP Status Codes

| Status | Meaning | Common Cause |
|--------|---------|--------------|
| `200` | Success | |
| `201` | Resource created | |
| `400` | Bad request | Invalid input, missing fields, wrong format |
| `401` | Unauthenticated | Missing or invalid API key |
| `403` | Forbidden | Insufficient scope for this operation |
| `404` | Not found | Resource doesn't exist |
| `409` | Conflict | Invalid state transition, duplicate, idempotency conflict |
| `422` | Unprocessable | Business rule violation (insufficient funds, etc.) |
| `429` | Too many requests | Rate limit exceeded |
| `500` | Internal error | Bug — report with request ID |
| `502` | Provider error | Trustless Work or AirTM returned an error |
| `503` | Maintenance | Orchestrator offline |
| `504` | Provider timeout | Trustless Work or AirTM timed out |

---

## Error Code Reference

### Authentication Errors

| Code | HTTP | Description | Fix |
|------|------|-------------|-----|
| `UNAUTHORIZED` | 401 | No `Authorization` header provided | Add `Authorization: Bearer ohk_live_...` |
| `INVALID_API_KEY` | 401 | API key is invalid or expired | Verify key or generate a new one |
| `INSUFFICIENT_SCOPE` | 403 | Operation requires a scope your key doesn't have | Use a key with `write`, `support`, or `admin` scope |

**Example:**
```json
{
  "error": {
    "code": "INSUFFICIENT_SCOPE",
    "message": "This operation requires 'support' scope",
    "details": {
      "required_scope": "support",
      "current_scopes": ["read", "write"]
    }
  }
}
```

---

### Validation Errors

| Code | HTTP | Description | Fix |
|------|------|-------------|-----|
| `VALIDATION_ERROR` | 400 | One or more fields failed validation | Check `details.fields` for specific issues |
| `INVALID_AMOUNT_FORMAT` | 400 | Amount must be `"0.00"` format | Use decimal string with 2 decimal places |
| `INVALID_CURRENCY` | 400 | Unsupported currency | Use `USDC` |
| `MISSING_REQUIRED_FIELD` | 400 | Required field not provided | Check request body |

**Example:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": {
      "fields": [
        { "field": "amount", "message": "Must be a string with 2 decimals (e.g., \"50.00\")" },
        { "field": "buyerId", "message": "Required" }
      ]
    }
  }
}
```

**Amount format rules:**
```
✅ "100.00"   — correct
✅ "0.50"     — correct
❌ 100        — must be string, not number
❌ "100"      — must have 2 decimal places
❌ "100.5"    — must have exactly 2 decimal places
❌ "$100.00"  — no currency symbols
```

---

### User Errors

| Code | HTTP | Description | Fix |
|------|------|-------------|-----|
| `USER_NOT_FOUND` | 404 | User ID doesn't exist | Verify `userId` is correct |
| `AIRTM_USER_NOT_LINKED` | 422 | User needs AirTM account linked | Call `POST /users/:id/airtm-link` first |
| `AIRTM_USER_INVALID` | 422 | Invalid AirTM user ID | Verify AirTM account exists |

---

### Balance / Funds Errors

| Code | HTTP | Description | Fix |
|------|------|-------------|-----|
| `INSUFFICIENT_FUNDS` | 422 | Available balance < requested amount | Add funds or use smaller amount |
| `FUNDS_ALREADY_RESERVED` | 409 | Funds already reserved for this order | Do not call reserve twice |
| `RESERVE_NOT_FOUND` | 404 | No active reservation found | Check order status |
| `RESERVE_MISMATCH_AMOUNT` | 422 | Reserve amount doesn't match order amount | Use the exact order amount |

**Example:**
```json
{
  "error": {
    "code": "INSUFFICIENT_FUNDS",
    "message": "Available balance is less than requested amount",
    "details": {
      "available": "30.00",
      "requested": "80.00",
      "currency": "USDC"
    }
  }
}
```

---

### Order / State Machine Errors

| Code | HTTP | Description | Fix |
|------|------|-------------|-----|
| `ORDER_NOT_FOUND` | 404 | Order doesn't exist | Verify `orderId` |
| `INVALID_STATE` | 409 | Invalid state transition for this operation | Check current order state |
| `ESCROW_ALREADY_EXISTS` | 409 | Escrow already created for this order | Don't call POST /escrow twice |
| `ESCROW_NOT_READY` | 409 | Escrow not in correct state for this operation | Wait for ESCROW_FUNDED before release |
| `DISPUTE_ALREADY_OPEN` | 409 | A dispute is already active | Resolve existing dispute first |

**Example:**
```json
{
  "error": {
    "code": "INVALID_STATE",
    "message": "Cannot reserve funds: order is not in ORDER_CREATED state",
    "details": {
      "orderId": "ord_xyz789",
      "currentState": "FUNDS_RESERVED",
      "allowedStates": ["ORDER_CREATED"]
    }
  }
}
```

**Common state errors and causes:**

| Error | Likely Cause |
|-------|--------------|
| `INVALID_STATE` on reserve | Already reserved — check if `FUNDS_RESERVED` |
| `INVALID_STATE` on escrow | Not yet reserved — call reserve first |
| `INVALID_STATE` on release | Order not `IN_PROGRESS` yet |
| `INVALID_STATE` on dispute | Order already in terminal state |
| `DISPUTE_ALREADY_OPEN` | Dispute opened but not yet resolved |

---

### Idempotency Errors

| Code | HTTP | Description | Fix |
|------|------|-------------|-----|
| `IDEMPOTENCY_KEY_REUSED` | 409 | Key used with a different request body | Use a new UUID |
| `IDEMPOTENCY_KEY_IN_PROGRESS` | 409 | Original request is still processing | Poll the resource status and retry |

**Example:**
```json
{
  "error": {
    "code": "IDEMPOTENCY_KEY_IN_PROGRESS",
    "message": "This request is still being processed",
    "details": {
      "idempotencyKey": "550e8400-e29b-41d4-a716-446655440000"
    }
  }
}
```

**Pattern for handling in-progress:**
```typescript
async function createOrderWithRetry(payload, key) {
  try {
    return await sdk.orders.create(payload, { idempotencyKey: key });
  } catch (err) {
    if (err.code === 'IDEMPOTENCY_KEY_IN_PROGRESS') {
      // Wait and check current status
      await sleep(2000);
      return await sdk.orders.get(existingOrderId);
    }
    throw err;
  }
}
```

---

### Provider Errors

| Code | HTTP | Description | Fix |
|------|------|-------------|-----|
| `PROVIDER_ERROR` | 502 | Trustless Work or AirTM returned an error | Retry with exponential backoff |
| `PROVIDER_TIMEOUT` | 504 | Provider didn't respond in time | Retry — Stellar txn may have succeeded |
| `PROVIDER_RATE_LIMITED` | 502 | Provider rate limited the Orchestrator | Retry after delay |
| `WEBHOOK_SIGNATURE_INVALID` | 400 | Webhook HMAC validation failed | Check `TRUSTLESS_WEBHOOK_SECRET` or `AIRTM_WEBHOOK_SECRET` |
| `WEBHOOK_DUPLICATE_IGNORED` | 200 | Webhook already processed (OK) | No action needed |

**Example:**
```json
{
  "error": {
    "code": "PROVIDER_TIMEOUT",
    "message": "Trustless Work did not respond in time",
    "details": {
      "provider": "trustless_work",
      "timeoutMs": 60000,
      "retryRecommended": true
    }
  }
}
```

> **Important for `PROVIDER_TIMEOUT`:** On Stellar, a transaction may have been submitted but the confirmation timed out. Query the order/escrow status before retrying to avoid double-submission.

---

### Withdrawal Errors

| Code | HTTP | Description | Fix |
|------|------|-------------|-----|
| `WITHDRAWAL_NOT_FOUND` | 404 | Withdrawal doesn't exist | Verify `withdrawalId` |
| `WITHDRAWAL_NOT_COMMITTABLE` | 409 | Already committed or in wrong state | Check current withdrawal status |
| `WITHDRAWAL_DESTINATION_INVALID` | 422 | Invalid Stellar address or AirTM destination | Verify destination format |

---

### Rate Limiting

| Code | HTTP | Description |
|------|------|-------------|
| `RATE_LIMITED` | 429 | Too many requests in the time window |

**Example:**
```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests, please retry after 60 seconds",
    "details": {
      "retryAfter": 60,
      "limit": 100,
      "window": "1m"
    }
  }
}
```

Wait `details.retryAfter` seconds before retrying.

---

## Retry Strategies

| Error Code | Retry? | Strategy |
|-----------|--------|----------|
| `PROVIDER_TIMEOUT` | ✅ Yes | Exponential backoff: 1s, 2s, 4s, 8s... |
| `PROVIDER_ERROR` | ✅ Yes | Exponential backoff |
| `RATE_LIMITED` | ✅ Yes | Wait exactly `details.retryAfter` seconds |
| `IDEMPOTENCY_KEY_IN_PROGRESS` | ✅ Yes | Wait 2s, poll status endpoint |
| `PROVIDER_RATE_LIMITED` | ✅ Yes | Exponential backoff with jitter |
| `INSUFFICIENT_FUNDS` | ❌ No | Requires user to add funds |
| `INVALID_STATE` | ❌ No | Check current state, may need different action |
| `VALIDATION_ERROR` | ❌ No | Fix the request body |
| `UNAUTHORIZED` | ❌ No | Fix the API key |

**Exponential Backoff Implementation:**

```typescript
async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 5): Promise<T> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const retryable = ['PROVIDER_TIMEOUT', 'PROVIDER_ERROR', 'PROVIDER_RATE_LIMITED'];
      if (!retryable.includes(err.code) || attempt === maxAttempts - 1) throw err;

      const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
      await new Promise(r => setTimeout(r, delay + Math.random() * 1000));
    }
  }
}
```

---

## Debugging Guide

### Balance Discrepancies

**Symptom:** User's balance doesn't match expected value.

**Steps:**
1. Check `GET /api/v1/balances/:userId` for current available + reserved
2. Query balance event history via SSE or audit log
3. Compare each `balance.credited` and `balance.debited` event
4. Check for reserved amounts — if order in `FUNDS_RESERVED`, amount is in `reserved`, not `available`

**Common causes:**
- Funds reserved for active order (not lost, just locked)
- Failed withdrawal auto-restored (check for `balance.credited` with `source: withdrawal_failed`)
- Deposit not yet detected (check BlockchainMonitorService status)

---

### Order Stuck in a State

**Symptom:** Order remains in a transitional state (e.g., `ESCROW_CREATING`) for more than a few minutes.

**Steps:**
1. Query order status: `GET /api/v1/orders/:orderId`
2. Check escrow status if applicable
3. Look for `PROVIDER_TIMEOUT` or `PROVIDER_ERROR` events in logs
4. For `ESCROW_CREATING`: Trustless Work may be slow — check their status page
5. For blockchain operations: query Stellar Explorer with the transaction hash

**Recovery:**
- Most transitional states auto-recover via the reconciliation worker
- If stuck for > 30 minutes, contact Trustless Work support with the escrow ID

---

### Deposit Not Credited

**Symptom:** User sent USDC on Stellar but balance wasn't updated.

**Checklist:**
1. Verify the transaction is on Stellar (not Ethereum) — check Stellar Explorer
2. Verify the asset is USDC (`GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN`)
3. Verify destination address matches exactly `GET /wallet/deposit-address`
4. Check if Orchestrator was running when payment arrived (`.cursor('now')` behavior)
5. Wait 30–60 seconds — Horizon SSE can have delays
6. Check BlockchainMonitorService logs for errors

**If Orchestrator was offline when payment arrived:**
The reconciliation worker will catch it. If urgent, trigger a manual sweep or contact support.

---

### Withdrawal Not Completing

**Symptom:** Withdrawal stuck in `WITHDRAWAL_PENDING` or `WITHDRAWAL_COMMITTED`.

**For crypto withdrawals:**
1. Check if transaction was submitted: `GET /api/v1/withdrawals/:id` — look for `transactionHash`
2. Verify on Stellar Explorer — if confirmed, funds were sent
3. If no hash: Stellar submission likely failed — retry

**For AirTM withdrawals:**
1. AirTM payouts can take 1–3 business days for bank transfers
2. Check for `withdrawal.pending_user_action` event — user may need to complete KYC
3. Verify `PUBLIC_BASE_URL` is reachable by AirTM for webhooks
4. Check `AIRTM_WEBHOOK_SECRET` is correctly configured

---

### Events Not Arriving

**Symptom:** Subscribed to SSE but not receiving expected events.

**Checklist:**
1. Verify `Accept: text/event-stream` header is set
2. Verify API key has `read` scope
3. Check if using `types` filter — event type might not match
4. Try without filters: `GET /api/v1/events` (no query params)
5. Test connection: `curl -N -H "Authorization: Bearer ..." http://localhost:4000/api/v1/events`
6. Check Redis is running (events are buffered in Redis)

**Missed events after reconnect:**
Use `Last-Event-ID` header with the timestamp of the last received event:
```bash
curl -N \
  -H "Authorization: Bearer ..." \
  -H "Last-Event-ID: 2026-02-18T10:00:00Z" \
  "http://localhost:4000/api/v1/events"
```

---

## SDK Error Handling

```typescript
import { OfferHubError, InsufficientFundsError, InvalidStateError } from '@offerhub/sdk';

try {
  await sdk.orders.reserve(orderId, { amount: '100.00' });
} catch (error) {
  if (error instanceof InsufficientFundsError) {
    const { available, requested } = error.details;
    // Show user: "Need to deposit ${requested - available} more USDC"
  } else if (error instanceof InvalidStateError) {
    const { currentState } = error.details;
    // Handle state mismatch — possibly already reserved
    if (currentState === 'FUNDS_RESERVED') {
      // Already reserved — proceed to escrow creation
    }
  } else if (error instanceof OfferHubError) {
    console.error(`API Error: ${error.code} — ${error.message}`);
  }
}
```

---

## Related Guides

- [Standards](./standards.md) — API response format and conventions
- [Orders](./orders.md) — State machine and valid transitions
- [Events Reference](./events-reference.md) — Event catalog for debugging
- [Architecture](./architecture.md) — Component overview
