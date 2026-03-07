# API Standards

> Conventions, response formats, naming rules, validation constraints, and integration standards for the OFFER-HUB Orchestrator API.

---

## Table of Contents

- [Base URL & Versioning](#base-url--versioning)
- [Authentication](#authentication)
- [Request Format](#request-format)
- [Response Format](#response-format)
- [Pagination](#pagination)
- [Resource ID Format](#resource-id-format)
- [Amount Format](#amount-format)
- [Date & Time Format](#date--time-format)
- [Enum Values](#enum-values)
- [Idempotency](#idempotency)
- [Rate Limiting](#rate-limiting)
- [CORS](#cors)
- [HTTP Methods and Status Codes](#http-methods-and-status-codes)
- [Naming Conventions](#naming-conventions)

---

## Base URL & Versioning

```
http(s)://your-orchestrator-domain.com/api/v1/
```

All endpoints are prefixed with `/api/v1`. The version is part of the URL path. When breaking changes are introduced, a new version (`/api/v2`) will be added while the old version remains available.

**Examples:**
```
POST   https://api.example.com/api/v1/users
GET    https://api.example.com/api/v1/orders/ord_abc123
POST   https://api.example.com/api/v1/orders/ord_abc123/reserve
GET    https://api.example.com/api/v1/events
```

---

## Authentication

All endpoints require an API key in the `Authorization` header:

```
Authorization: Bearer ohk_live_...
```

API keys have prefixes by type:
- `ohk_live_` — production key
- `ohk_test_` — test/sandbox key

Create API keys via the master key bootstrap endpoint:
```bash
POST /api/v1/auth/api-keys
Authorization: Bearer $OFFERHUB_MASTER_KEY
```

### API Key Scopes

| Scope | Access |
|-------|--------|
| `read` | All GET endpoints + SSE subscription |
| `write` | All POST/PATCH endpoints (users, orders, withdrawals, etc.) |
| `support` | Dispute assignment and resolution |
| `admin` | Everything including API key management |
| `*` | Wildcard — all permissions |

A key can have multiple scopes: `["read", "write", "support"]`.

---

## Request Format

### Content-Type

All POST/PATCH requests must include:
```
Content-Type: application/json
```

### Body Encoding

Request bodies must be valid JSON. Nested objects and arrays are supported.

### Required Headers

| Header | When | Example |
|--------|------|---------|
| `Authorization` | Always | `Bearer ohk_live_...` |
| `Content-Type` | POST/PATCH | `application/json` |
| `Idempotency-Key` | All state-mutating POSTs | `550e8400-e29b-41d4-a716-446655440000` |
| `Accept` | SSE subscriptions | `text/event-stream` |
| `Last-Event-ID` | SSE reconnect | `2026-02-18T10:00:00Z` |

---

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... }
}
```

All successful responses wrap data in `{ success: true, data: ... }`. Never read the raw HTTP response body without unwrapping.

### Error Response

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": { ... }
  }
}
```

### List Response (Paginated)

```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "total": 42,
    "page": 1,
    "pageSize": 20
  }
}
```

---

## Pagination

List endpoints support cursor-based or offset pagination:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | `1` | Page number (1-indexed) |
| `pageSize` | number | `20` | Items per page (max: 100) |

```bash
GET /api/v1/orders?page=2&pageSize=50
```

---

## Resource ID Format

All resource IDs follow the pattern `<prefix>_<nanoid>`:

| Resource | Prefix | Example |
|----------|--------|---------|
| User | `usr_` | `usr_Tzl8Rnlx6Lgz1VLtKTryiZrvfeug3oce` |
| Order | `ord_` | `ord_VxaM1234abcd` |
| Escrow | `esc_` | `esc_Qr7nXyz` |
| Dispute | `dsp_` | `dsp_Ab9cDef` |
| Withdrawal | `wd_` | `wd_NYgT3NLfg` |
| TopUp | `tp_` | `tp_XkLm789` |
| API Key | `key_` | `key_Mn3Op4q` |
| Event | `evt_` | `evt_n_8yumeOFwqPnSbhvemqJ` |

IDs are **case-sensitive** and **URL-safe**. Store them as strings in your database.

---

## Amount Format

All monetary amounts are **decimal strings** with exactly 2 decimal places:

```
✅ "100.00"   — valid
✅ "0.50"     — valid
✅ "1000.00"  — valid
❌ 100        — wrong type (number, not string)
❌ "100"      — missing decimal places
❌ "100.5"    — must have exactly 2 decimal places
❌ "$100.00"  — no currency symbols
❌ "100,00"   — no comma separators
```

The currency is always **USDC** (Stellar) unless specified otherwise.

Why strings?
- JavaScript's floating-point arithmetic loses precision with large numbers
- `0.1 + 0.2 = 0.30000000000000004` in JS — unacceptable for finance
- String representation preserves exact decimal precision
- Prisma stores `Decimal` type in PostgreSQL which is exact

---

## Date & Time Format

All timestamps are **ISO 8601** strings in UTC:

```
2026-02-18T17:37:12.000Z
```

```typescript
// Parsing in TypeScript
const date = new Date(order.createdAt); // Works directly

// Generating for requests
const now = new Date().toISOString(); // "2026-02-18T17:37:12.000Z"
```

Timestamps appear in:
- Resource `createdAt`, `updatedAt`, `completedAt`, etc.
- SSE event `occurredAt` field
- `Last-Event-ID` header for SSE reconnect

---

## Enum Values

All enum values in request bodies must be **UPPERCASE**:

| Field | Valid Values |
|-------|-------------|
| `openedBy` (dispute) | `"BUYER"` \| `"SELLER"` |
| `reason` (dispute) | `"NOT_DELIVERED"` \| `"QUALITY_ISSUE"` \| `"OTHER"` |
| `requestedBy` (release/refund) | `"BUYER"` \| `"SELLER"` |
| `canceledBy` (cancel) | `"BUYER"` \| `"SELLER"` \| `"ADMIN"` |
| `decision` (resolve dispute) | `"FULL_RELEASE"` \| `"FULL_REFUND"` \| `"SPLIT"` |
| `destinationType` (withdrawal) | `"stellar"` \| `"airtm"` |

Sending lowercase enum values returns `400 VALIDATION_ERROR`.

---

## Idempotency

All state-mutating `POST` endpoints (orders, reserves, escrows, releases, refunds, disputes, withdrawals) must include:

```
Idempotency-Key: <uuid-v4>
```

### Rules

1. Use a **UUID v4** as the idempotency key
2. Generate a **new UUID per unique operation** — don't reuse across different operations
3. If you retry an operation, use the **same key** — you'll get the cached response
4. If you retry with the same key but a different body: `409 IDEMPOTENCY_KEY_REUSED`
5. If the original request is still in-flight: `409 IDEMPOTENCY_KEY_IN_PROGRESS`
6. Keys expire after **24 hours**

### Example

```typescript
import { v4 as uuidv4 } from 'uuid';

// Create order — new UUID
const createKey = uuidv4();
const order = await sdk.orders.create(payload, { idempotencyKey: createKey });

// Reserve funds — NEW UUID for different operation
const reserveKey = uuidv4();
await sdk.orders.reserve(order.id, { amount: '80.00' }, { idempotencyKey: reserveKey });

// If reserve fails and you retry — SAME reserveKey
await sdk.orders.reserve(order.id, { amount: '80.00' }, { idempotencyKey: reserveKey });
```

---

## Rate Limiting

The API is rate-limited per API key using a sliding window:

| Default Limit | Window |
|--------------|--------|
| 100 requests | 1 minute |

**Headers returned on every response:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1708278000
```

When exceeded:
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

Wait exactly `details.retryAfter` seconds before retrying.

---

## CORS

CORS is configured server-side. By default, all origins are allowed. For production, restrict to your marketplace domain:

```env
ALLOWED_ORIGINS=https://yourmarketplace.com,https://admin.yourmarketplace.com
```

---

## HTTP Methods and Status Codes

| Method | Usage | Success Code |
|--------|-------|-------------|
| `GET` | Read resource or list | `200` |
| `POST` | Create resource or trigger action | `201` (new resource) or `200` (action) |
| `PATCH` | Partial update | `200` |
| `DELETE` | Delete resource | `200` |

**State-changing endpoints use POST, not PATCH:**

```
POST /orders/:id/reserve          → 200
POST /orders/:id/escrow           → 200
POST /orders/:id/escrow/fund      → 200
POST /orders/:id/resolution/release  → 200
POST /disputes/:id/resolve        → 200
```

This is intentional — these are **actions**, not updates. Actions are idempotent by design (with `Idempotency-Key`).

---

## Naming Conventions

### URL Structure

```
/api/v1/{resource}                  → list or create
/api/v1/{resource}/{id}             → get by ID
/api/v1/{resource}/{id}/{action}    → trigger action
/api/v1/{resource}/{id}/{sub-resource} → sub-resource
```

**Examples:**
```
GET    /api/v1/orders                          → list orders
POST   /api/v1/orders                          → create order
GET    /api/v1/orders/ord_abc123               → get order
POST   /api/v1/orders/ord_abc123/reserve       → trigger reserve action
POST   /api/v1/orders/ord_abc123/resolution/dispute → create sub-resource
```

### Field Naming

All JSON fields use **camelCase**:

```json
{
  "orderId": "ord_abc123",
  "buyerId": "usr_buyer123",
  "sellerId": "usr_seller456",
  "createdAt": "2026-02-18T10:00:00.000Z",
  "releaseAmount": "60.00",
  "refundAmount": "20.00"
}
```

---

## Related Guides

- [Errors & Troubleshooting](./errors-troubleshooting.md) — Error codes and format
- [Events Reference](./events-reference.md) — SSE protocol and event format
- [Marketplace Integration](./marketplace-integration.md) — Quick start guide
