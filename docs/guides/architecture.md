# Architecture Guide

> System design, components, actors, and technical principles of the OFFER-HUB Orchestrator.

---

## Table of Contents

- [What Is the Orchestrator?](#what-is-the-orchestrator)
- [System Layers](#system-layers)
- [Self-Hosted Model](#self-hosted-model)
- [Internal Components](#internal-components)
  - [API Server (NestJS)](#api-server-nestjs)
  - [Worker (BullMQ)](#worker-bullmq)
  - [PostgreSQL](#postgresql)
  - [Redis](#redis)
  - [BlockchainMonitorService](#blockchainmonitorservice)
- [External Integrations](#external-integrations)
  - [Trustless Work](#trustless-work)
  - [Stellar / Horizon](#stellar--horizon)
  - [AirTM (Optional)](#airtm-optional)
- [System Actors](#system-actors)
- [Payment Provider Strategy Pattern](#payment-provider-strategy-pattern)
- [Non-Negotiable Technical Principles](#non-negotiable-technical-principles)
- [Horizontal Scaling](#horizontal-scaling)
- [Request Flow](#request-flow)

---

## What Is the Orchestrator?

The OFFER-HUB Orchestrator is a **self-hosted payments middleware** for marketplaces. It sits between your marketplace backend and the payment/blockchain infrastructure, abstracting away:

- Stellar wallet management (invisible keypairs, signing)
- Escrow smart contract deployment and management via Trustless Work
- USDC on-chain balance tracking
- Dispute resolution workflows
- Event streaming for real-time updates

Your marketplace backend never directly touches Stellar or Trustless Work — it calls the Orchestrator's REST API.

### What It Is NOT

| NOT | Is |
|-----|----|
| A SaaS product | A self-hosted service |
| A blockchain node | A blockchain client (uses Horizon API) |
| A crypto exchange | A payments middleware |
| A user-facing app | A backend service called by your backend |
| An AirTM replacement | An abstraction layer that can use AirTM or crypto |

---

## System Layers

```
┌────────────────────────────────────────────────────────────┐
│  Layer 5: Marketplace UI (yours)                           │
│  - Web/mobile frontend                                     │
│  - Calls your own backend                                  │
├────────────────────────────────────────────────────────────┤
│  Layer 4: @offerhub/sdk (NPM package)                      │
│  - TypeScript client for the Orchestrator API              │
│  - Type-safe wrappers around REST calls                    │
├────────────────────────────────────────────────────────────┤
│  Layer 3: OFFER-HUB Orchestrator (this project)            │
│  - REST API + BullMQ workers                               │
│  - State machine, idempotency, audit log                   │
│  - Abstracts payment providers                             │
├────────────────────────────────────────────────────────────┤
│  Layer 2: AirTM (optional, legacy)                         │
│  - Fiat deposits and withdrawals                           │
│  - Requires Enterprise AirTM account                       │
├────────────────────────────────────────────────────────────┤
│  Layer 1: Trustless Work + Stellar                         │
│  - Non-custodial escrow (Soroban smart contracts)          │
│  - USDC settlement on Stellar blockchain                   │
└────────────────────────────────────────────────────────────┘
```

---

## Self-Hosted Model

Each marketplace runs its **own Orchestrator instance**. There is no shared SaaS infrastructure.

```
Marketplace A:
  Frontend A → Backend A → Orchestrator A → DB A
                                         → Redis A
                                         → Stellar
                                         → Trustless Work

Marketplace B:
  Frontend B → Backend B → Orchestrator B → DB B
                                         → Redis B
                                         → Stellar
                                         → Trustless Work
```

**Benefits:**
- Complete data isolation per marketplace
- Independent compliance and regulation
- Scale independently per demand
- Instance-specific configuration (payment provider, network)
- Deploy close to your users

---

## Internal Components

### API Server (NestJS)

The main HTTP server. Handles:
- REST API endpoints (`/api/v1/*`)
- Request authentication and authorization
- Input validation (class-validator DTOs)
- Business logic and state machine enforcement
- Domain event emission
- SSE (Server-Sent Events) streaming

**Technology:** NestJS (Node.js), TypeScript, Prisma ORM

**Port:** 4000 (default)

### Worker (BullMQ)

Background job processor. Handles:
- AirTM webhook processing
- Trustless Work webhook processing
- Periodic reconciliation (verify on-chain vs DB state)
- Retry logic for failed operations
- Deferred jobs

**Technology:** BullMQ (Redis-backed queue), Node.js

Workers can be scaled horizontally — multiple worker instances process jobs from the same Redis queue safely.

### PostgreSQL

Relational database. Stores:
- All entity state (users, orders, escrows, disputes, balances, wallets)
- Audit log (all state transitions with timestamps)
- Idempotency keys (24-hour TTL)
- Domain event history
- Encrypted Stellar wallet keypairs

**Recommended:** Supabase (managed PostgreSQL with connection pooling)

**Important:** Use `DIRECT_URL` (port 5432) for Prisma migrations, not the pooler (port 6543).

### Redis

In-memory store. Used for:
- BullMQ job queues
- Idempotency key caching (fast lookup)
- Rate limiting (API throttle)
- SSE event buffer (last 1,000 events, 1-hour TTL)
- Pub/sub for real-time event distribution to SSE clients

**Recommended:** Upstash Redis (serverless, no infra to manage)

### BlockchainMonitorService

A background service that monitors all user wallets for incoming Stellar payments:

- Opens an SSE stream to Horizon API with `.cursor('now')`
- Listens for `payment` operations where `to` is any known user wallet
- Deduplicates by `transactionHash`
- Calls `BalanceService.credit(userId, amount, 'stellar_deposit')`
- Emits `balance.credited` event

**Critical:** Only one instance should run this service. In multi-instance deployments, disable on other instances via:
```env
DISABLE_BLOCKCHAIN_MONITOR=true
```

---

## External Integrations

### Trustless Work

Trustless Work provides the smart contract infrastructure for escrow:

- **Deploys Soroban contracts** on Stellar
- **Manages escrow state** (creating, funded, released, refunded, disputed)
- **Returns unsigned XDR transactions** — the Orchestrator signs and submits them
- **API base:** `https://api.trustlesswork.com`

The Orchestrator uses `TRUSTLESS_API_KEY` to authenticate.

### Stellar / Horizon

Stellar is the blockchain where USDC lives and escrow contracts run:

- **Horizon API** — Stellar's REST API for submitting transactions and querying state
- **USDC asset** — `GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN`
- **Networks:** `testnet` (development) and `mainnet` (production)
- **Block time:** ~5 seconds

The Orchestrator interacts with Stellar via Horizon for:
- Submitting signed transactions (escrow operations, payments)
- Streaming real-time payments (deposit detection)
- Querying balances (reconciliation)

### AirTM (Optional)

AirTM is the fiat payment provider (used when `PAYMENT_PROVIDER=airtm`):

- Handles fiat-to-crypto conversion (top-ups)
- Manages user payouts (withdrawals to bank accounts)
- Requires Enterprise API credentials
- Uses webhooks for async payment confirmation

When using crypto mode, AirTM is not required.

---

## System Actors

### End Users

| Actor | Role |
|-------|------|
| **Buyer** | Creates orders, funds escrow, approves/disputes work |
| **Seller** | Receives payments, requests release, withdraws funds |

### Operators

| Actor | Role |
|-------|------|
| **Marketplace Admin** | Configures the Orchestrator instance, manages API keys |
| **Support Agent** | Assigns and resolves disputes |

### API Keys and Scopes

| Scope | Permissions |
|-------|-------------|
| `read` | GET endpoints, SSE stream subscription |
| `write` | POST/PATCH endpoints (create users, orders, etc.) |
| `support` | Assign and resolve disputes |
| `admin` | Everything including API key management |
| `*` | All permissions (wildcard) |

---

## Payment Provider Strategy Pattern

The Orchestrator uses the Strategy Pattern to abstract payment operations:

```typescript
interface PaymentProvider {
  initializeUser(userId: string): Promise<PaymentUserInfo>;
  isUserReady(userId: string): Promise<boolean>;
  getBalance(userId: string): Promise<string>;
  getDepositInfo(userId: string): Promise<DepositInfo>;
  signEscrowTransaction(userId: string, xdr: string): Promise<string>;
  sendPayment(userId: string, destination: string, amount: string): Promise<PaymentResult>;
}
```

Two implementations:
- `CryptoNativeProvider` — Stellar invisible wallets (default)
- `AirTMProvider` — AirTM fiat payments (legacy)

Switch via `PAYMENT_PROVIDER=crypto` or `PAYMENT_PROVIDER=airtm`.

Both providers use the same Trustless Work integration for escrow — the provider only affects deposit/withdrawal mechanics.

---

## Non-Negotiable Technical Principles

### 1. Required Self-Hosting

There is no centralized SaaS. Each marketplace deploys its own instance. This ensures data sovereignty and independent compliance.

### 2. Per-User Funds (Not Pooled)

In crypto mode, each user has their own Stellar wallet. Funds are never pooled in a shared wallet. In AirTM mode, funds are in the user's AirTM account, not the marketplace's.

### 3. Non-Custodial Escrow

Once funds are in a Trustless Work smart contract, neither the buyer nor the seller can access them unilaterally. Only the designated signers (using specific roles) can trigger state changes. The Orchestrator signs on behalf of users using invisible wallets, but the contracts enforce the rules.

### 4. Required Idempotency

All state-mutating `POST` endpoints accept an `Idempotency-Key` header. Duplicate requests with the same key return the cached response. This prevents double-charges, double-releases, etc. Keys expire after 24 hours.

### 5. Required Correlation

Every resource is traceable:
- `orderId` ↔ `escrowId` ↔ `trustlessContractId`
- `topupId` ↔ `airtmPayinId`
- `withdrawalId` ↔ `airtmPayoutId` or `stellarTransactionHash`
- Every API response includes resource IDs for debugging

### 6. Server-Side Secrets Only

Provider API keys, wallet encryption keys, and Stellar secret keys never appear in API responses, frontend code, or logs. All sensitive operations happen in the Orchestrator's backend.

### 7. Atomic Balance Operations

Balances are never modified directly via Prisma. All changes go through `BalanceService` which enforces:
- Atomicity (DB transaction)
- Minimum balance checks
- Audit log entry
- Domain event emission

---

## Horizontal Scaling

| Component | Scale | Notes |
|-----------|-------|-------|
| NestJS API | Horizontal | Stateless — all state in DB + Redis |
| BullMQ workers | Horizontal | Redis queue handles distribution |
| PostgreSQL | Read replicas | Use pooler for API, direct for migrations |
| Redis | Cluster | Supported |
| `BlockchainMonitorService` | Singleton | One instance only — use `DISABLE_BLOCKCHAIN_MONITOR=true` |

---

## Request Flow

Typical API request lifecycle:

```
Client Request
    ↓
ApiKeyGuard (auth + scope check)
    ↓
Controller (route handling, DTO validation)
    ↓
Service (business logic, state machine check)
    ↓
Prisma (DB read/write, audit log)
    ↓
EventBusService (emit domain event)
    ↓
Redis (cache event, publish to SSE subscribers)
    ↓
HTTP Response to client
    ↓
SSE stream delivers event to subscribed backends (async)
```

For operations involving blockchain:
```
Service
    ↓
EscrowClient / WalletService
    ↓
Trustless Work API (returns unsigned XDR)
    ↓
WalletService (decrypt key, sign XDR)
    ↓
Horizon API (submit signed transaction)
    ↓
Confirmation
    ↓
BalanceService + EventBusService
```

---

## Related Guides

- [Core Concepts](./core-concepts.md) — Balance model, state machines
- [Wallets](./wallets.md) — Invisible wallet implementation
- [Escrow](./escrow.md) — Smart contract mechanics
- [Deployment](./deployment.md) — Running in production
- [Scaling & Customization](./scaling-customization.md) — Infrastructure guidance
