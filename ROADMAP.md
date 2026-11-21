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
