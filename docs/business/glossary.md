# Glossary

This document defines key terminology used throughout the OFFER-HUB project.

## Core Concepts

### Available Balance
The amount of funds a user can spend or reserve for orders. This is the portion of the balance not locked in active orders.

**Example:** If a user has $100 available and $50 reserved, they can create new orders up to $100.

---

### Reserved Balance
The amount of funds locked for active orders but not yet transferred to escrow. Once an order is funded, these funds move from "reserved" to the escrow contract.

**Example:** When an order is created, $50 moves from available to reserved until the escrow is funded.

---

### Escrow
A non-custodial lock of funds in a Trustless Work smart contract on the Stellar blockchain. Funds are held in escrow until released to the seller, refunded to the buyer, or split via dispute resolution.

**Key Point:** The Orchestrator does not hold escrow funds; they are locked in a smart contract.

---

### Invisible Wallet
A server-side Stellar keypair managed by the Orchestrator. Users don't sign transactions in their browser; the Orchestrator signs on their behalf using encrypted private keys.

**Security:** Private keys are encrypted with AES-256-GCM and never exposed in API responses.

---

### Idempotency Key
A client-supplied unique identifier (typically a UUID) used to deduplicate state-mutating requests. If the same key is used twice with the same request body, the second request returns the cached response from the first.

**Format:** UUID v4 (e.g., `550e8400-e29b-41d4-a716-446655440000`)

**Header:** `Idempotency-Key: <uuid>`

---

### Payment Provider
A strategy abstraction that allows switching between crypto-native (Stellar + Trustless Work) and fiat (Airtm) payment rails. The business logic remains provider-agnostic.

**Implementations:**
- `CryptoNativeProvider` (default)
- `AirtmProvider` (future)

---

### Trustless Work (TW)
An external service that provides non-custodial escrow smart contracts on the Stellar blockchain. The Orchestrator integrates with TW to deploy, fund, and resolve escrow contracts.

**Website:** [trustlesswork.com](https://trustlesswork.com)

---

### State Machine
A defined set of states and valid transitions for entities like orders, escrows, and disputes. State machines enforce business rules and prevent invalid state changes.

**Example:** An order cannot go from `CREATED` directly to `COMPLETED`; it must pass through `RESERVED`, `ESCROW_CREATED`, `ESCROW_FUNDED`, and `IN_PROGRESS`.

---

## Payment Terms

### Top-Up
The process of adding funds to a user's balance. In Airtm mode, this is a fiat deposit via redirect. In crypto mode, users send USDC to their Stellar deposit address.

**Airtm Flow:** Create top-up → redirect to Airtm → user pays → webhook → balance credited

**Crypto Flow:** User sends USDC → BlockchainMonitor detects → balance credited

---

### Withdrawal
The process of removing funds from a user's balance. In Airtm mode, this is a fiat payout. In crypto mode, USDC is sent to an external Stellar address.

**Airtm Flow:** Create withdrawal → Airtm payout → webhook → balance debited

**Crypto Flow:** Create withdrawal → send USDC transaction → balance debited

---

### Milestone
A checkpoint in an order's lifecycle. Orders can have multiple milestones (e.g., "Design complete", "Development complete"). Each milestone can be approved by the buyer before final release.

**Trustless Work:** Milestones are tracked on-chain in the escrow contract.

---

### Release
The action of transferring escrowed funds to the seller upon successful completion of work. Requires three Stellar transactions: change milestone status, approve milestone, release funds.

**Who Signs:**
1. Seller (change milestone status)
2. Buyer (approve milestone)
3. Buyer (release funds)

---

### Refund
The action of returning escrowed funds to the buyer. Requires two Stellar transactions: dispute escrow, resolve dispute with 100% to buyer.

**Who Signs:**
1. Buyer (dispute escrow)
2. Platform (resolve dispute as `disputeResolver`)

---

### Dispute
A formal challenge to an order's outcome. Either party can open a dispute, which freezes the escrow and requires support intervention.

**Resolution Types:**
- **Release:** 100% to seller
- **Refund:** 100% to buyer
- **Split:** Custom amounts to both parties

---

## Technical Terms

### Orchestrator
The OFFER-HUB backend service that coordinates users, orders, balances, escrow, and provider integrations. It orchestrates state machines and calls external services but does not hold escrow funds.

---

### Correlation ID
A unique identifier that traces a request through the entire system, including logs, audit trails, and provider calls. Useful for debugging and support.

**Format:** UUID v4

**Header:** `X-Correlation-ID: <uuid>`

---

### API Key
A Bearer token used to authenticate API requests. API keys have scopes (read, write, support) and are hashed in the database.

**Header:** `Authorization: Bearer <api_key>`

---

### Scope
A permission level for API keys. Determines which endpoints and actions are allowed.

**Scopes:**
- `read`: Read-only access (GET requests)
- `write`: Create and update resources (POST, PUT, PATCH)
- `support`: Access to disputes, audit logs, and support tools

---

### Master Key
A special API key with elevated permissions used to create, list, and revoke other API keys. Only one master key should exist per deployment.

**Security:** Store securely; never commit to version control.

---

### Webhook
An HTTP callback from an external service (Airtm, Trustless Work) to the Orchestrator. Webhooks notify the Orchestrator of events like payment confirmations or escrow state changes.

**Security:** HMAC signature verification to prevent spoofing.

---

### SSE (Server-Sent Events)
A real-time event stream from the Orchestrator to clients. Allows marketplaces to receive live updates on orders, balances, and other resources.

**Endpoint:** `GET /events`

**Filters:** `?type=order.created&resourceId=ord_123`

---

### BullMQ
A Redis-based job queue used for asynchronous tasks like webhook processing, retries, and reconciliation.

**Queues:**
- `webhooks`: Process incoming webhooks
- `reconciliation`: Sync balances and escrow states
- `notifications`: Send notifications (future)

---

## Blockchain Terms

### Stellar
A blockchain network optimized for payments and asset transfers. OFFER-HUB uses Stellar for USDC transactions and escrow contracts.

**Network:** Mainnet (production) or Testnet (development)

---

### Horizon
The Stellar HTTP API used to query blockchain data and submit transactions. The Orchestrator uses Horizon to check balances, stream payments, and broadcast transactions.

**Endpoint:** `https://horizon.stellar.org` (mainnet)

---

### USDC
A stablecoin pegged 1:1 to the US Dollar. OFFER-HUB uses USDC on Stellar for crypto-native payments.

**Issuer:** Circle (on Stellar)

---

### Soroban
Stellar's smart contract platform. Trustless Work escrow contracts are deployed as Soroban contracts.

---

### Public Key
A Stellar account address (e.g., `GXXXXXX...`). Used as the deposit address for receiving USDC.

**Format:** 56-character string starting with `G`

---

### Secret Key
The private key for a Stellar account (e.g., `SXXXXXX...`). Used to sign transactions. Must be kept secret.

**Format:** 56-character string starting with `S`

**Security:** Encrypted with AES-256-GCM in the Orchestrator.

---

## Business Terms

### Marketplace
A third-party platform that integrates OFFER-HUB to provide escrow-protected payments to its users. Each marketplace runs its own Orchestrator instance.

**Examples:** Freelance platforms, e-commerce sites, service marketplaces

---

### Self-Hosted
Each marketplace deploys and operates its own Orchestrator instance. There is no centralized SaaS; every deployment is independent.

**Benefit:** Full control over data, infrastructure, and provider credentials.

---

### Non-Custodial
The Orchestrator does not hold user funds in escrow. Funds are locked in Trustless Work smart contracts on Stellar, ensuring the Orchestrator cannot access or freeze escrowed funds.

**Benefit:** Reduced regulatory burden and increased user trust.

---

### Per-User Funds
Balances are attributed to individual users, not pooled in a marketplace account. In crypto mode, each user has their own Stellar wallet. In Airtm mode, each user has their own Airtm sub-account.

**Benefit:** Clear fund ownership and easier accounting.

---

## Acronyms

| Acronym | Full Term | Definition |
|:--------|:----------|:-----------|
| **TW** | Trustless Work | Escrow service provider |
| **SSE** | Server-Sent Events | Real-time event stream |
| **HMAC** | Hash-based Message Authentication Code | Webhook signature verification |
| **UUID** | Universally Unique Identifier | Random unique ID |
| **USDC** | USD Coin | Stablecoin on Stellar |
| **API** | Application Programming Interface | REST endpoints |
| **SDK** | Software Development Kit | Client library (`@offerhub/sdk`) |
| **TTL** | Time To Live | Expiration time for cached data |
| **AES** | Advanced Encryption Standard | Encryption algorithm |
| **GCM** | Galois/Counter Mode | Encryption mode |

---

## Common Abbreviations

| Abbreviation | Meaning |
|:-------------|:--------|
| `ord_` | Order ID prefix |
| `usr_` | User ID prefix |
| `esc_` | Escrow ID prefix |
| `wal_` | Wallet ID prefix |
| `bal_` | Balance ID prefix |
| `top_` | Top-up ID prefix |
| `wth_` | Withdrawal ID prefix |
| `dsp_` | Dispute ID prefix |
| `aud_` | Audit log ID prefix |

---

**Next Steps:**
- Review [Project Context](../project-context.md) for system overview
- See [Architecture Overview](../architecture/overview.md) for technical details
- Check [API Contract](../standards/api-contract.md) for API terminology
