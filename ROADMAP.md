# Master Roadmap: OFFER-HUB (100% Granular)

This roadmap is the definitive guide to building OFFER-HUB. It maps 100% of the requirements from `/docs` into atomic, testable units of work.

---

## Phase 0: Project Foundation (COMPLETED)
- [x] Initial monorepo scaffolding (Apps, Packages).
- [x] Professional Documentation & English Translation.
- [x] Workflow improvements (Concurrent execution, Docker, Scripts).
- [x] Root configuration (.gitignore, tsconfig.json, docker-compose.yml).
- [x] AI Development Standards (`ai-context.md`).

---

## Phase 1: Shared Domain & Types (COMPLETED)
*Goal: Define the schema and common logic used by both API and Worker.*

- [x] **Issue 1.1: Database Schema (Prisma)**
    - [x] 1.1.1: Core Identity: `User`, `ApiKey`, `Balance`.
    - [x] 1.1.2: Financials: `TopUp`, `Order`, `Escrow`, `Withdrawal`.
    - [x] 1.1.3: Details: `Milestone`, `Dispute`, `AuditLog`, `IdempotencyKey`.
    - [x] 1.1.4: Infrastructure: `WebhookEvent` (deduplication).
    - [x] 1.1.5: Performance: Add composite indexes for `user_id`, `status`, `external_id`.

- [x] **Issue 1.2: Domain Constants & Enums**
    - [x] 1.2.1: Enums: Implement all status enums from `docs/architecture/state-machines.md`.
    - [x] 1.2.2: ID Prefixes: Implement `usr_`, `ord_`, `topup_`, `esc_`, `dsp_`, `wd_`, `evt_`, `aud_`.
    - [x] 1.2.3: Error Codes: Implement full catalog from `docs/api/errors.md` with HTTP mappings.

- [x] **Issue 1.4: Logic Helpers**
    - [x] 1.4.1: Prefixed NanoID generator.
    - [x] 1.4.2: Financial arithmetic library integration (`Big.js` or `Decimal.js`).
    - [x] 1.4.3: Amount validator (`^\d+\.\d{2}$`).
    - [x] 1.4.4: State machine validator engine (enforcing `ORDER_TRANSITIONS`).

---

## Phase 2: Security & Infrastructure (COMPLETED)
*Goal: Build the protective shell and the core request handlers.*

- [x] **Issue 2.1: Auth System**
    - [x] 2.1.1: API Key hashing logic (SHA-256 + salt).
    - [x] 2.1.2: `ApiKeyGuard` (Authenticates `ohk_` keys).
    - [x] 2.1.3: `ScopeGuard` (Enforces `read`, `write`, `support`).
    - [x] 2.1.4: Short-lived token logic (`ohk_tok_`) for frontend use.

- [x] **Issue 2.2: Idempotency System (Redis)**
    - [x] 2.2.1: `IdempotencyGuard`: Intercepts `Idempotency-Key` headers.
    - [x] 2.2.2: In-progress locking: Prevents concurrent requests with the same key.
    - [x] 2.2.3: Comparison logic: Ensures request hash matches the stored key body.
    - [x] 2.2.4: TTL Logic: 24h for payouts/topups, 7 days for orders, indefinite for disputes.

- [x] **Issue 2.3: Request/Response Pipeline**
    - [x] 2.3.1: Global Error Filter: Transform all exceptions to `docs/api/errors.md` format.
    - [x] 2.3.2: Standard Response Interceptor: Wrap all success responses.
    - [x] 2.3.3: Correlation ID Middleware: Handle `X-Request-ID` headers.
    - [x] 2.3.4: Global Rate Limiter: Implement Redis-based rate limiting (100 req/min general).

---

## Phase 3: External Providers (COMPLETED)
*Goal: Implement the "Dialects" to talk to external services.*

- [x] **Issue 3.1: Payment Provider Abstraction**
    - [x] 3.1.1: `PaymentProvider` interface (Strategy Pattern)
    - [x] 3.1.2: Crypto-native provider (Stellar wallets, USDC)
    - [x] 3.1.3: Airtm provider (optional, for fiat on/off ramp)

- [x] **Issue 3.2: Trustless Work Integration**
    - [x] 3.2.1: Stellar wallet logic (Balance projection).
    - [x] 3.2.2: Escrow contract creation client.
    - [x] 3.2.3: Partial Release / Partial Refund logic.
    - [x] 3.2.4: HMAC Signature verification logic for TW webhooks.

---

## Phase 4: Core Services (Business Logic) (COMPLETED)
*Goal: The heart of the Orchestrator - State & Money management.*

- [x] **Issue 4.1: Balance Orchestrator**
    - [x] 4.1.1: Implement atomic `available` vs `reserved` updates (Prisma Transactions).
    - [x] 4.1.2: Implement `MIRROR` logic: ensuring local balance reflects provider state.

- [x] **Issue 4.2: Top-Up Orchestrator**
    - [x] 4.2.1: Flow orchestration: `CREATED` -> `AWAITING_CONFIRMATION` -> `PROCESSING` -> `SUCCEEDED`.
    - [x] 4.2.2: Success/Cancel URL redirection and state logic.

- [x] **Issue 4.3: Order & Escrow Orchestrator**
    - [x] 4.3.1: Funds reservation logic (`available` -= amount, `reserved` += amount).
    - [x] 4.3.2: Escrow Bridge: Triggering move to Stellar wallet when funding escrow.
    - [x] 4.3.3: Milestones flow: handling partial completions.

- [x] **Issue 4.4: Resolution Orchestrator**
    - [x] 4.4.1: Release flow: Funds to seller `available` balance.
    - [x] 4.4.2: Refund flow: Funds back to buyer `available` balance.
    - [x] 4.4.3: Dispute Split flow: Fractional distribution of escrow.

---

## Phase 5: API Endpoints (COMPLETED)
*Goal: Implement every endpoint documented in /docs/api/endpoints.*

- [x] **Issue 5.1: Auth & Config Endpoints**
- [x] **Issue 5.2: Users & Balances**
- [x] **Issue 5.3: Top-Ups Endpoints**
- [x] **Issue 5.4: Orders & Escrow Endpoints**
- [x] **Issue 5.5: Settlement Endpoints**
- [x] **Issue 5.6: Withdrawals Endpoints**

---

## Phase 6: Observability (COMPLETED)
*Goal: Implement 100% traceability for events and audit.*

- [x] **Issue 6.1: Internal Event System**
- [x] **Issue 6.2: Real-time SSE**
- [x] **Issue 6.3: Audit System**

---

## Phase 7: Background Worker (BullMQ) (COMPLETED)
*Goal: Handle asynchronicity, retries, and scheduled health.*

- [x] **Issue 7.1: Infrastructure**
- [x] **Issue 7.2: Webhook Processing**
- [x] **Issue 7.3: Scheduled Jobs (Reconciliation & Monitoring)**

---

## Phase 8: SDK & Developer Experience (COMPLETED)
*Goal: Provide the "Magic" for marketplace developers.*

- [x] **Issue 8.1: NPM Package `@offerhub/sdk`**
    - [x] 8.1.1: Base Ky-powered client with retry logic.
    - [x] 8.1.2: Resource mapping (Users, Orders, TopUps, Balance, Disputes, etc.).
    - [x] 8.1.3: Error typing (Proper instance checking for `InsufficientFundsError`, etc.).
    - [x] 8.1.4: Idempotency support via `withIdempotencyKey()`.
    - [x] 8.1.5: Full TypeScript types and comprehensive documentation.
    - [x] 8.1.6: Publishing guide for NPM release.

- [x] **Issue 8.2: Tooling**
    - [x] 8.2.1: CLI tool for API Key management (`offerhub keys create/list/revoke`).
    - [x] 8.2.2: Maintenance mode toggle commands (`offerhub maintenance enable/disable/status`).
    - [x] 8.2.3: Health check command (`offerhub health`).
    - [x] 8.2.4: Interactive configuration setup.

---

## Phase 9: Final Polish & QA (IN PROGRESS)
- [x] 9.1: Comprehensive E2E test suite (API -> DB -> Worker).
- [x] 9.2: Rate limiting implementation (Redis-based, configurable).
- [ ] 9.3: Production deployment guide (updated for crypto-native).
- [ ] 9.4: Installer script `npm create offer-hub-orchestrator@latest`.
- [x] 9.5: Production deployment guide finalized (`docs/deployment/`).

---

## Phase 10: Crypto-Native Provider (COMPLETED)
*Goal: Add crypto-native payment provider using invisible Stellar wallets.*

**Status:** Complete (2026-02-16)
**Approach:** Strategy Pattern -- NOT deleting AirTM, abstracting with `PaymentProvider` interface
**Documentation:** See [docs/crypto-native/](./docs/crypto-native/) for full plan and architecture.

### Context
- **Problem:** AirTM API requires Enterprise status (5k+ txns/month, $30k+/month) -- not viable
- **Decision:** Build crypto-native provider as default, keep AirTM as switchable alternative
- **Wallet Strategy:** Invisible wallets (server-side Stellar keypairs, AES-256-GCM encrypted)
- **Impact:** No code deletion. New provider + interface + wallet module added alongside existing code.

### Phase 10.1: Foundation
- [x] Create `PaymentProvider` interface (Strategy Pattern)
- [x] Create `CryptoNativeProvider` implementing the interface
- [x] Implement AES-256-GCM crypto utilities
- [x] Database migration: new `Wallet` table
- [x] Add env vars: `PAYMENT_PROVIDER`, `WALLET_ENCRYPTION_KEY`

### Phase 10.2: Wallet Module
- [x] Implement `WalletService`
- [x] Implement `WalletController`
- [x] Implement `BlockchainMonitorService`
- [x] Implement USDC trustline setup for new accounts

### Phase 10.3: Service Integration
- [x] Update `UsersService` -- auto-create wallet on registration
- [x] Update `BalanceService` -- sync from blockchain
- [x] Update `OrdersService` -- escrow funding via wallet
- [x] Update `ResolutionService` -- crediting on release/refund
- [x] Update reconciliation jobs

### Phase 10.4: SDK, Docs & Testing
- [x] Add `wallet` resource to SDK
- [x] Update SDK types
- [x] Update CLI installer
- [x] Update deployment docs
- [x] Unit tests and integration tests
- [x] Testnet E2E verification

---

## Progress Summary

| Phase | Status | Completion |
|-------|--------|------------|
| Phase 0: Foundation | Complete | 100% |
| Phase 1: Domain & Types | Complete | 100% |
| Phase 2: Security & Infrastructure | Complete | 100% |
| Phase 3: External Providers | Complete | 100% |
| Phase 4: Core Services | Complete | 100% |
| Phase 5: API Endpoints | Complete | 100% |
| Phase 6: Observability | Complete | 100% |
| Phase 7: Background Worker | Complete | 100% |
| Phase 8: SDK & Developer Experience | Complete | 100% |
| Phase 9: Final Polish & QA | In Progress | 60% |
| Phase 10: Crypto-Native Provider | Complete | 100% |

**Overall Project Status:** ~96% Complete (Phase 9 remaining: deployment guide + installer script)

---

## Next Steps

### Immediate (Active)
1. Production Deployment Guide (updated for crypto-native)
2. Installer Script `npm create offer-hub-orchestrator@latest`
3. Rate Limit Load Testing (k6/Artillery)

### After Phase 9
1. AirTM adapter -- When Enterprise access is available
2. Launch crypto-native MVP -- Deploy on testnet, onboard first users

---

## Related Documentation

- [Architecture Overview](./docs/architecture/overview.md)
- [API Documentation](./docs/api/overview.md)
- [Deployment Guide](./docs/deployment/README.md)
- [SDK Documentation](./docs/sdk/integration-guide.md)
- [CLI Documentation](./docs/cli/quick-reference.md)
- [Crypto-Native Plan](./docs/crypto-native/) -- Strategy, architecture, implementation plan
