# AI Context for OFFER-HUB

This document provides essential context for AI assistants working on the OFFER-HUB project. Read this document FIRST before making any changes.

## Project Overview

OFFER-HUB is a **self-hosted payments orchestrator** for marketplaces that provides escrow-protected payments and user balances without requiring marketplaces to build payment infrastructure. It's a monorepo containing both backend (NestJS) and frontend (Next.js) applications.

**What it provides:**
- User Balance (Web2)
- Top-ups (deposits via crypto or Airtm)
- Checkout with escrow (via Trustless Work on Stellar)
- Withdrawals (payouts)

---

## Mandatory Documentation

Before contributing, you **MUST** read these documents:

| Priority | Document | Content |
|----------|----------|---------|
| 1 | [standards/naming-conventions.md](./standards/naming-conventions.md) | ID prefixes, formats, file naming |
| 2 | [api/errors.md](./api/errors.md) | Error codes, HTTP status, JSON format |
| 3 | [standards/validation-rules.md](./standards/validation-rules.md) | Validation rules, state guardrails |
| 4 | [api/overview.md](./api/overview.md) | Headers, pagination, rate limiting |
| 5 | [api/idempotency.md](./api/idempotency.md) | Idempotency rules |
| 6 | [architecture/state-machines.md](./architecture/state-machines.md) | TopUp, Order, Withdrawal states |
| 7 | [data/models.md](./data/models.md) | Entities and relationships |
| 8 | [design/visual-dna.md](./design/visual-dna.md) | Visual identity and design system |

---

## Critical Design Principles

### 1. Visual Identity: Modern Neumorphic Bento
- **Design System:** Soft depth with 2.5D surfaces shaped by light and shadow
- **Primary Color:** `#149A9B` (teal) - The brand pulse
- **Background:** `#F1F3F7` - Light canvas for neumorphic shadows
- **Shadow Physics:** Light source at 145° (top-left)
- **Border Radius:** 16px for containers, 12px for interactive elements

### 2. Architecture Philosophy
- **Self-hosted only:** No multi-tenant SaaS
- **Non-custodial:** Funds locked in Trustless Work smart contracts on Stellar
- **Provider abstraction:** Strategy pattern for crypto vs Airtm
- **Idempotency-first:** All mutations require `Idempotency-Key`
- **State machines:** Strict transitions for orders, escrows, disputes

### 3. Technology Stack

**Backend (Orchestrator):**
- NestJS 10.x (TypeScript)
- PostgreSQL 15+ (state, audit)
- Redis 7+ (BullMQ, idempotency, SSE)
- Prisma 5.x (ORM)
- Stellar blockchain integration
- Trustless Work escrow contracts

**Frontend (Monorepo):**
- Next.js 15+ (App Router)
- React 19+
- Tailwind CSS 3.4+ (with CSS variables)
- TypeScript 5.7+
- Modern neumorphic design system

---

## Project Structure

```
offer-hub-monorepo/              # Frontend & Documentation
├── src/
│   ├── app/                     # Next.js App Router pages
│   ├── components/              # React components
│   ├── lib/                     # Utilities and helpers
│   ├── data/                    # Mock data and static content
│   └── types/                   # TypeScript types
├── content/docs/                # MDX documentation for web
├── docs/                        # Technical documentation
├── public/                      # Static assets
└── backend/                     # Backend utilities

offer-hub-orchestrator/          # Backend API (separate repo)
├── apps/
│   ├── api/                     # NestJS API (main server)
│   │   └── src/
│   │       ├── modules/         # Domain-specific modules
│   │       ├── common/          # Guards, filters, interceptors
│   │       ├── config/          # Configuration
│   │       └── providers/       # External integrations
│   └── worker/                  # Background jobs (BullMQ)
├── packages/
│   ├── database/                # Prisma schema and client
│   ├── shared/                  # Shared DTOs, types, enums
│   ├── sdk/                     # @offerhub/sdk client
│   └── cli/                     # @offerhub/cli tool
└── docs/                        # Backend documentation
```

---

## Backend Standards

### Naming Conventions

| Element | Style | Example |
|---------|-------|---------|
| Files | kebab-case | `order.service.ts` |
| Classes | PascalCase | `OrderService` |
| Interfaces | PascalCase | `Order`, `CreateOrderDto` |
| Functions | camelCase | `createOrder()` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_ATTEMPTS` |
| Enums | PascalCase + UPPER_SNAKE | `OrderStatus.ORDER_CREATED` |
| Directories | kebab-case | `audit-logs/` |

### ID Prefixes

**ALWAYS** use these prefixes when generating IDs:

| Resource | Prefix | Example |
|----------|--------|---------|
| User | `usr_` | `usr_abc123def456` |
| Order | `ord_` | `ord_xyz789ghi012` |
| Top-up | `topup_` | `topup_jkl345mno678` |
| Escrow | `esc_` | `esc_pqr901stu234` |
| Dispute | `dsp_` | `dsp_vwx567yza890` |
| Withdrawal | `wd_` | `wd_bcd123efg456` |
| Event | `evt_` | `evt_hij789klm012` |
| Audit Log | `aud_` | `aud_nop345qrs678` |
| API Key | `key_` | `key_tuv901wxy234` |

Format: `{prefix}_{nanoid(21)}`

### Amount Format

```typescript
// CORRECT
amount: "100.00"
amount: "0.50"

// INCORRECT
amount: 100.00      // Number, not string
amount: "100"       // Missing decimals
amount: "100.0"     // Only 1 decimal
```

### Date Format

```typescript
// CORRECT - ISO 8601 UTC
created_at: "2026-01-12T14:30:00.000Z"

// INCORRECT
created_at: "2026-01-12"              // Missing time
created_at: "01/12/2026 14:30:00"     // Incorrect format
```

---

## Frontend Standards

### Files & Directories
- **Folders:** `kebab-case` (e.g., `auth-form/`, `user-dashboard/`)
- **React Components:** `PascalCase.tsx` (e.g., `OfferCard.tsx`)
- **Hooks:** `use-kebab-case.ts` (e.g., `use-client-auth.ts`)
- **Utilities:** `kebab-case.ts` (e.g., `sanitize-html.ts`)

### Code
- **Booleans:** `isLoading`, `hasError`, `canPerformAction`
- **Functions:** `camelCase` (`fetchUserDetails`, `handleSubmitForm`)
- **Event Handlers:** `handle[Subject][Action]` (e.g., `handleEmailChange`)
- **Props:** `on[Action]` (e.g., `onClose`, `onSubmit`)
- **Constants:** `UPPER_SNAKE_CASE` (`MAX_UPLOAD_SIZE`)
- **Types:** `PascalCase` (`ApiResponse`, `UserRole`)

---

## API Contract (MANDATORY)

### Backend Error Response Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable description",
    "details": {}
  }
}
```

### Frontend API Response Structure

All API responses MUST follow the `ApiResponse<T>` structure:

```typescript
{
  ok: boolean;           // Quick success check
  code: number;          // 1000: Success, 4001: Validation, 5000: Internal
  type: "success" | "error" | "warning";
  title: string;         // Short headline for UI
  message: string;       // Explicit feedback
  data: T | null;        // Actual payload
  errors: ValidationError[] | null;  // Field-level errors
}
```

### Common Error Codes

| Code | HTTP | When to use |
|------|------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid fields in request |
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `INSUFFICIENT_SCOPE` | 403 | Insufficient API key scope |
| `USER_NOT_FOUND` | 404 | User does not exist |
| `ORDER_NOT_FOUND` | 404 | Order does not exist |
| `INVALID_STATE` | 409 | Invalid state transition |
| `INSUFFICIENT_FUNDS` | 422 | Insufficient balance |
| `PROVIDER_TIMEOUT` | 504 | External provider timeout |

See full list in [api/errors.md](./api/errors.md)

---

## State Machines

### Order States

```
ORDER_CREATED -> FUNDS_RESERVED -> ESCROW_CREATING -> ESCROW_FUNDING -> ESCROW_FUNDED
-> IN_PROGRESS -> RELEASE_REQUESTED/REFUND_REQUESTED/DISPUTED -> RELEASED/REFUNDED -> CLOSED
```

### TopUp States

```
TOPUP_CREATED -> TOPUP_AWAITING_USER_CONFIRMATION -> TOPUP_PROCESSING -> TOPUP_SUCCEEDED/TOPUP_FAILED
```

### Withdrawal States

```
WITHDRAWAL_CREATED -> WITHDRAWAL_COMMITTED -> WITHDRAWAL_PENDING -> WITHDRAWAL_COMPLETED/WITHDRAWAL_FAILED
```

See full diagrams in [architecture/state-machines.md](./architecture/state-machines.md)

---

## Idempotency

**ALL state-mutating POSTs must:**
1. Accept `Idempotency-Key` header
2. Check if the key already exists
3. Return the original response if it's a duplicate
4. Return `409 IDEMPOTENCY_KEY_REUSED` if the body is different

TTL Rules:
- 24h for payouts/topups
- 7 days for orders
- Indefinite for disputes

See implementation in [api/idempotency.md](./api/idempotency.md)

---

## Design System Rules

### Neumorphic Shadows

**Elevated (Raised):**
```css
/* Light theme */
box-shadow: 6px 6px 12px #d1d5db, -6px -6px 12px #ffffff;

/* Hover state */
box-shadow: 2px 2px 4px #d1d5db, -2px -2px 4px #ffffff;
```

**Sunken (Inset):**
```css
box-shadow: inset 4px 4px 8px #d1d5db, inset -4px -4px 8px #ffffff;
```

### Color Usage
- **Primary (`#149A9B`):** Progress, primary buttons, active states
- **Secondary (`#002333`):** Navbar, sidebar, footer backgrounds
- **Accent (`#15949C`):** Gradients, status highlights
- **Text Primary (`#19213D`):** Headings, body content
- **Text Secondary (`#6D758F`):** Captions, placeholders

### Animation Standards
- **fadeInUp:** 400ms ease-out, translateY(20px -> 0)
- **scaleIn:** 300ms ease-out, scale(0.95 -> 1)
- **Staggered lists:** 100ms delay per item

---

## Backend Module Structure

- **Auth:** API keys, scopes (read/write/support)
- **Users:** Create/get/list, wallet auto-creation
- **Balance:** Available + reserved, credit/debit operations
- **Orders:** State machine, reserve funds, escrow coordination
- **Escrow:** Trustless Work integration, fund/release/refund
- **Disputes:** Open/resolve, support scope
- **Events:** Internal bus, SSE streaming
- **Audit:** All mutations logged, secrets redacted

---

## Payment Flow (Crypto Mode - Default)

1. **Deposit:** User sends USDC -> Stellar address -> BlockchainMonitor -> balance credited
2. **Order:** Create -> reserve (available -> reserved) -> create escrow -> fund escrow
3. **Work:** Order IN_PROGRESS
4. **Resolution:**
   - **Release:** 3 Stellar txs -> seller balance credited
   - **Refund:** 2 Stellar txs -> buyer balance credited
   - **Dispute SPLIT:** Resolve with custom amounts
5. **Withdrawal:** Send USDC to external address

---

## Database Models

### Main Models

- `users` - Users with wallet linkage
- `balances` - Per-user balance (available/reserved)
- `wallets` - Stellar wallets (encrypted private keys)
- `topups` - Deposit records
- `orders` - Marketplace orders
- `escrows` - Trustless Work records
- `disputes` - Dispute cases
- `withdrawals` - Payout records
- `audit_logs` - Audit trail
- `idempotency_keys` - Deduplication

See schema at `packages/database/prisma/schema.prisma`

---

## Security Requirements

- **API Keys:** Bearer token, hashed in DB
- **Secrets:** Never in responses or logs
- **Idempotency:** Prevent duplicate charges
- **Webhooks:** HMAC verification
- **Wallet Keys:** AES-256-GCM encrypted
- **Audit:** All mutations logged with redaction

---

## UI Standards

### Error Handling
- Component: `ErrorState`
- Colors: `text-error`, `RING_ERROR`
- Must provide `onRetry` button
- Message: Explain what happened and how to fix

### Success Handling
- Component: `Toast` or `StatusBadge`
- Colors: `text-success`, `bg-success/10`
- Icon: Check mark
- Message: Short, affirmative

### Loading States
- Use skeleton components
- Match exact dimensions of final component
- Prevent layout shift (CLS)

### Empty States
- Centered icon
- Encouraging message
- Primary CTA button

---

## Mock Data Strategy

Location: `src/data/`

Every domain must export:
- `[DOMAIN]_MOCK_SUCCESS`: Full response payload
- `[DOMAIN]_MOCK_EMPTY`: Empty data with `total: 0`
- `[DOMAIN]_MOCK_ERROR`: Error response with `ResponseCode`

Use static IDs (`usr_001`, `off_505`) for determinism.

---

## Checklist Before Every Change

Before making any change, verify:

- [ ] Am I using the correct naming convention?
- [ ] Do IDs have the correct prefix?
- [ ] Are amounts strings with 2 decimal places?
- [ ] Are dates ISO 8601 UTC?
- [ ] Do errors follow the standard format?
- [ ] Does the endpoint have idempotency if mutable?
- [ ] Am I respecting valid state transitions?
- [ ] Am I following neumorphic shadow physics?
- [ ] Do loading states prevent layout shift?

---

## What NOT to Do

- Use flat drop shadows (use neumorphic physics)
- Use spaces or PascalCase for directories
- Return raw errors (use standard format)
- Skip idempotency keys on mutations
- Log or return secrets
- Use generic colors (red, blue, green)
- Create layout shift with loading states
- Skip error retry buttons
- Use browser default fonts

## What TO Do

- Follow neumorphic shadow physics
- Use strict naming conventions
- Return standard response structure
- Require `Idempotency-Key` on mutations
- Redact secrets in logs and responses
- Use curated color palette
- Match skeleton dimensions to final components
- Provide retry mechanisms
- Use modern typography (Inter, Roboto, Outfit)
- Implement state machines for workflows
- Add staggered animations to lists

---

## Useful Commands

```bash
# Frontend Development
npm run dev           # Start Next.js dev server
npm run build         # Production build
npm run lint          # Run linter

# Backend Development (Orchestrator)
npm run dev           # Start in development mode
npm run build         # Production build
npm test              # Run tests

# Database
npm run prisma:generate   # Generate Prisma client
npm run prisma:migrate    # Run migrations

# Docker
docker compose up     # Start services
```

---

## Key Files to Reference

- **Design System:** `docs/design/visual-dna.md`
- **API Contract:** `docs/standards/api-contract.md`
- **Naming:** `docs/standards/naming-conventions.md`
- **Architecture:** `docs/architecture/overview.md`
- **Project Context:** `docs/project-context.md`
- **State Machines:** `docs/architecture/state-machines.md`
- **Error Catalog:** `docs/api/errors.md`

---

## Quick Reference

**Primary Brand Color:** `#149A9B`
**Background:** `#F1F3F7`
**Card Radius:** `16px`
**Button Radius:** `12px`
**Shadow Angle:** `145°` (top-left)
**Animation Duration:** `400ms`
**Stagger Delay:** `100ms`
**API Success Code:** `1000`
**Validation Error Code:** `4001`
**Internal Error Code:** `5000`

---

**Remember:** This project values visual excellence, strict conventions, and non-custodial security. Every component should feel premium, every API call should be idempotent, and every state transition should be validated.
