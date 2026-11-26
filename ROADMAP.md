# OFFER-HUB Roadmap

This roadmap lists what the OFFER-HUB Orchestrator does today and what is still being worked on. It replaces the earlier phase-by-phase plan that described the original orchestrator design.

Everything under **Shipped** is available in the current product. Items under **Coming soon** are in progress and have no committed date. If you need a capability that is not listed here, open an issue and describe your use case.

## Shipped

### Payments and balances

- [x] Non-custodial escrow on Stellar, in USDC, through Trustless Work Soroban contracts.
- [x] Mainnet deployment, plus a public testnet sandbox for development.
- [x] Stellar RPC connectivity with operator-selectable network.
- [x] Internal available/reserved balance ledger with atomic updates.
- [x] Prefixed resource IDs and structured response envelopes.

### Orders and escrow

- [x] Full order state machine: `ORDER_CREATED`, `FUNDS_RESERVED`, `ESCROW_CREATING`, `ESCROW_FUNDING`, `ESCROW_FUNDED`, `IN_PROGRESS`, `DELIVERED`, `RELEASE_REQUESTED`, `RELEASED`, `REFUND_REQUESTED`, `REFUNDED`, `DISPUTED`, `CLOSED`.
- [x] Milestones on a single order, sharing one escrow.
- [x] Client-side transaction signing: the Orchestrator prepares unsigned transactions, the user's wallet signs and submits them.
- [x] Idempotency keys on order creation, escrow submission and payout submission.

### Disputes and resolution

- [x] Buyer- or seller-opened disputes.
- [x] Reasons: not delivered, quality issue, other.
- [x] Review lifecycle from open to resolved.
- [x] Outcomes: full release, full refund, split.

### Withdrawals and off-ramp

- [x] Withdrawals to an external Stellar address.
- [x] BlindPay off-ramp to Brazil, Mexico, Argentina and Colombia.
- [x] Bank-account and KYC resources for payout onboarding.

### Authentication and security

- [x] Marketplace API keys with `read`, `write` and `support` scopes.
- [x] One-hour scoped tokens exchanged from an API key for browser use.
- [x] User sessions from either wallet sign-in or email/password, sharing one JWT.
- [x] Master-key bootstrap for the operator's first API key.
- [x] Audit log and request correlation IDs.

### Developer experience

- [x] `@offerhub/sdk` TypeScript client.
- [x] `@offerhub/cli` for API-key and maintenance operations.
- [x] `create-offer-hub-orchestrator` interactive installer.
- [x] Self-hosting documentation and the public starter-shell repository.
- [x] Authenticated SSE event stream and inbound provider webhooks.

## Coming soon
- [x] **Issue 3.1: Payment Provider Abstraction**
    - [x] 3.1.1: `PaymentProvider` interface (Strategy Pattern)
    - [x] 3.1.2: Crypto-native provider (Stellar wallets, USDC)

These items are in progress. No dates are committed and nothing here should be treated as available yet.

- [ ] Publishing `@offerhub/sdk` 3.0.0 to npm. The registry currently serves 1.0.0; the documentation targets the 3.0.0 surface.
- [ ] Invisible Stellar wallets and the 90-day "Claim your wallet" flow outside the testnet sandbox.
- [ ] Broader operator tooling around reconciliation and incident review.

## Not planned

- Custodial user wallets or server-side signing for users on mainnet.
- A fiat on-ramp inside the Orchestrator.
- Marketplace features beyond payments: listings, messaging, accounts and reviews belong to your product.

## Following along

- Product documentation: [offer-hub.tech/docs](https://offer-hub.tech/docs)
- Issues and feature requests: [GitHub Issues](https://github.com/OFFER-HUB/offer-hub-monorepo/issues)
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
**Approach:** Strategy Pattern -- abstracting payment rails with the `PaymentProvider` interface
**Documentation:** See [docs/crypto-native/](./docs/crypto-native/) for full plan and architecture.

### Context
- **Problem:** The legacy fiat provider required Enterprise API access that was not viable.
- **Decision:** Build the crypto-native provider as the default payment rail.
- **Wallet Strategy:** Invisible wallets (server-side Stellar keypairs, AES-256-GCM encrypted)
- **Impact:** New provider + interface + wallet module added alongside existing code.

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
1. Launch crypto-native MVP -- Deploy on testnet, onboard first users

---

## Related Documentation

- [Architecture Overview](./docs/architecture/overview.md)
- [API Documentation](./docs/api/overview.md)
- [Deployment Guide](./docs/deployment/README.md)
- [SDK Documentation](./docs/sdk/integration-guide.md)
- [CLI Documentation](./docs/cli/quick-reference.md)
- [Crypto-Native Plan](./docs/crypto-native/) -- Strategy, architecture, implementation plan
