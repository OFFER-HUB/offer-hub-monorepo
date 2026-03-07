# Backend Modules Overview

This document provides an overview of the core modules in the OFFER-HUB Orchestrator backend.

## Architecture

The backend is built with **NestJS** and follows a modular architecture. Each module encapsulates a specific domain with its own controllers, services, entities, and DTOs.

```
src/
├── auth/           # API key management
├── users/          # User management
├── balance/        # Balance tracking
├── orders/         # Order lifecycle
├── escrow/         # Escrow integration
├── resolution/     # Release/refund/dispute
├── topups/         # Top-up management (Airtm)
├── withdrawals/    # Withdrawal management
├── disputes/       # Dispute resolution
├── events/         # Event bus & SSE
├── wallet/         # Crypto wallet management
├── audit/          # Audit logging
├── webhooks/       # Webhook ingress
└── common/         # Shared utilities
```

---

## Core Modules

### Auth Module

**Purpose:** API key creation, validation, and scope enforcement.

**Key Components:**
- `AuthService`: Create/list/revoke API keys
- `ApiKeyGuard`: Validate Bearer tokens
- `ScopeGuard`: Enforce read/write/support scopes
- `AuthController`: API key endpoints

**Endpoints:**
- `POST /auth/api-keys` - Create API key (master key required)
- `GET /auth/api-keys` - List API keys
- `DELETE /auth/api-keys/:id` - Revoke API key

**Security:**
- API keys are hashed (bcrypt) before storage
- Master key required for key management
- Scopes: `read`, `write`, `support`

---

### Users Module

**Purpose:** User registration, retrieval, and management.

**Key Components:**
- `UsersService`: CRUD operations for users
- `UsersController`: User endpoints
- `User` entity: User data model

**Endpoints:**
- `POST /users` - Create user
- `GET /users/:id` - Get user by ID
- `GET /users` - List users (paginated)

**Integration:**
- Auto-creates wallet in crypto mode
- Links Airtm account in airtm mode

---

### Balance Module

**Purpose:** Per-user balance tracking (available + reserved).

**Key Components:**
- `BalanceService`: Get/sync/credit/debit/reserve/release
- `BalanceController`: Balance endpoints
- `Balance` entity: Balance data model

**Endpoints:**
- `GET /balance/:userId` - Get user balance
- `POST /balance/:userId/sync` - Sync balance (crypto mode)

**Operations:**
- `credit(amount)`: Increase available balance
- `debit(amount)`: Decrease available balance
- `reserve(amount)`: Move available → reserved
- `release(amount)`: Move reserved → available

---

### Orders Module

**Purpose:** Order lifecycle management and state machine.

**Key Components:**
- `OrdersService`: Create/get/list/cancel orders
- `OrdersController`: Order endpoints
- `Order` entity: Order data model

**Endpoints:**
- `POST /orders` - Create order
- `GET /orders/:id` - Get order by ID
- `GET /orders` - List orders (paginated)
- `POST /orders/:id/reserve` - Reserve funds
- `POST /orders/:id/cancel` - Cancel order

**State Machine:**
```
CREATED → RESERVED → ESCROW_CREATING → ESCROW_CREATED 
→ ESCROW_FUNDED → IN_PROGRESS → COMPLETED/REFUNDED/DISPUTED
```

---

### Escrow Module

**Purpose:** Integration with Trustless Work for escrow contracts.

**Key Components:**
- `EscrowService`: Create/fund/get escrow
- `EscrowController`: Escrow endpoints
- `Escrow` entity: Escrow data model
- `TrustlessWorkClient`: API client for TW

**Endpoints:**
- `POST /escrow` - Create escrow contract
- `POST /escrow/:id/fund` - Fund escrow
- `GET /escrow/:id` - Get escrow details

**Trustless Work Integration:**
- Deploy escrow contract (Soroban)
- Fund escrow (buyer signs)
- Track escrow status

---

### Resolution Module

**Purpose:** Release, refund, and dispute resolution.

**Key Components:**
- `ResolutionService`: Release/refund/resolve
- `ResolutionController`: Resolution endpoints

**Endpoints:**
- `POST /resolution/release` - Release funds to seller (3 txs)
- `POST /resolution/refund` - Refund to buyer (2 txs)
- `POST /resolution/resolve` - Resolve dispute (split)

**Release Flow (3 Stellar Transactions):**
1. Seller: Change milestone status to "completed"
2. Buyer: Approve milestone
3. Buyer: Release funds

**Refund Flow (2 Stellar Transactions):**
1. Buyer: Dispute escrow
2. Platform: Resolve dispute (100% to buyer)

---

### TopUps Module (Airtm Mode)

**Purpose:** Fiat on-ramp via Airtm.

**Key Components:**
- `TopUpsService`: Create/get/list top-ups
- `TopUpsController`: Top-up endpoints
- `TopUp` entity: Top-up data model

**Endpoints:**
- `POST /topups` - Create top-up (returns confirmation URL)
- `GET /topups/:id` - Get top-up details
- `GET /topups` - List top-ups

**Flow:**
1. Create top-up → get confirmation URL
2. Redirect user to Airtm
3. User pays in Airtm
4. Webhook received → balance credited

---

### Withdrawals Module

**Purpose:** Fiat off-ramp (Airtm) or crypto send (Stellar).

**Key Components:**
- `WithdrawalsService`: Create/commit/get withdrawals
- `WithdrawalsController`: Withdrawal endpoints
- `Withdrawal` entity: Withdrawal data model

**Endpoints:**
- `POST /withdrawals` - Create withdrawal
- `POST /withdrawals/:id/commit` - Commit withdrawal
- `GET /withdrawals/:id` - Get withdrawal details

**Modes:**
- **Airtm:** Payout to user's Airtm account
- **Crypto:** Send USDC to external Stellar address

---

### Disputes Module

**Purpose:** Dispute management and resolution.

**Key Components:**
- `DisputesService`: Open/get/resolve disputes
- `DisputesController`: Dispute endpoints
- `Dispute` entity: Dispute data model

**Endpoints:**
- `POST /disputes` - Open dispute
- `GET /disputes/:id` - Get dispute details
- `POST /disputes/:id/resolve` - Resolve dispute (support scope)
- `POST /disputes/:id/comments` - Add comment

**Resolution Types:**
- **Release:** 100% to seller
- **Refund:** 100% to buyer
- **Split:** Custom amounts to both parties

---

### Events Module

**Purpose:** Internal event bus and SSE streaming.

**Key Components:**
- `EventsService`: Publish/subscribe to events
- `EventsController`: SSE endpoint
- `EventBusService`: Internal event emitter

**Endpoints:**
- `GET /events` - SSE stream (real-time events)

**Event Types:**
- `order.created`, `order.updated`, `order.completed`
- `balance.credited`, `balance.debited`
- `escrow.created`, `escrow.funded`, `escrow.released`
- `dispute.opened`, `dispute.resolved`

**Filters:**
- `?type=order.created` - Filter by event type
- `?resourceId=ord_123` - Filter by resource ID

---

### Wallet Module (Crypto Mode)

**Purpose:** Invisible Stellar wallet management.

**Key Components:**
- `WalletService`: Create/get/sign/send
- `Wallet` entity: Wallet data model
- `BlockchainMonitor`: Detect incoming payments

**Operations:**
- `createWallet(userId)`: Generate keypair, encrypt secret
- `getDepositAddress(userId)`: Return public key
- `signTransaction(userId, tx)`: Sign with user's key
- `sendPayment(userId, destination, amount)`: Send USDC

**Security:**
- Secret keys encrypted with AES-256-GCM
- Encryption key from `WALLET_ENCRYPTION_KEY` env var
- Never return secret in API responses

---

### Audit Module

**Purpose:** Immutable logging of all state-changing actions.

**Key Components:**
- `AuditService`: Log actions
- `AuditController`: Query audit logs (support scope)
- `AuditLog` entity: Audit log data model

**Endpoints:**
- `GET /audit` - List audit logs (support scope)
- `GET /audit/:id` - Get audit log details

**Logged Data:**
- Action (e.g., `order.create`, `balance.credit`)
- Actor (user ID or `system`)
- Resource type and ID
- Result (success/failure)
- Before/after state
- Correlation ID

**Security:**
- Secrets are redacted
- Immutable (no updates or deletes)

---

### Webhooks Module

**Purpose:** Ingress for Airtm and Trustless Work webhooks.

**Key Components:**
- `WebhooksController`: Webhook endpoints
- `WebhooksService`: Process webhooks
- `AirtmWebhookHandler`: Handle Airtm events
- `TrustlessWorkWebhookHandler`: Handle TW events

**Endpoints:**
- `POST /webhooks/airtm` - Airtm webhook
- `POST /webhooks/trustless-work` - Trustless Work webhook

**Security:**
- HMAC signature verification
- Deduplication by event ID
- Async processing via BullMQ

---

## Shared Modules

### Common Module

**Purpose:** Shared utilities, guards, interceptors, and filters.

**Components:**
- `IdempotencyInterceptor`: Enforce idempotency
- `CorrelationIdMiddleware`: Add correlation IDs
- `HttpExceptionFilter`: Normalize errors to `ApiResponse<T>`
- `ValidationPipe`: Validate DTOs

---

### Database Module

**Purpose:** TypeORM configuration and connection.

**Entities:**
- User, Wallet, Balance, Order, Escrow, TopUp, Withdrawal, Dispute, AuditLog, IdempotencyKey

**Migrations:**
- Located in `src/database/migrations/`
- Run with `npm run migration:run`

---

### Redis Module

**Purpose:** Redis connection for BullMQ, idempotency, and SSE.

**Usage:**
- BullMQ queues (webhooks, reconciliation)
- Idempotency key storage
- SSE event broadcasting

---

## Module Dependencies

```
Auth ──────────────────────────┐
  │                             │
  ├─→ Users ─→ Wallet ─→ Balance
  │      │
  │      └─→ Orders ─→ Escrow ─→ Resolution
  │            │
  │            ├─→ TopUps
  │            ├─→ Withdrawals
  │            └─→ Disputes
  │
  └─→ Audit ←─── All Modules
       Events ←─── All Modules
```

---

## Configuration

**Environment Variables:**
```bash
# Database
DATABASE_URL=postgresql://...

# Redis
REDIS_URL=redis://...

# Payment Provider
PAYMENT_PROVIDER=crypto  # or 'airtm'

# Crypto Mode
WALLET_ENCRYPTION_KEY=...
STELLAR_NETWORK=testnet  # or 'mainnet'

# Airtm Mode
AIRTM_API_KEY=...
AIRTM_SECRET=...

# Trustless Work
TRUSTLESS_WORK_API_KEY=...
TRUSTLESS_WORK_PLATFORM_SECRET=...

# Auth
MASTER_API_KEY=...
```

---

**Next Steps:**
- Review [API Design](./api-design.md) for endpoint specifications
- See [Authentication](./authentication.md) for auth details
- Check [Security](./security.md) for security best practices
- Read [Deployment](./deployment.md) for deployment guide
