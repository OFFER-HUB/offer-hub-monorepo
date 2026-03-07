# Data Model

This document defines the core data entities, relationships, and state machines in the OFFER-HUB system.

## Entity Relationship Overview

```
┌─────────┐       ┌─────────┐       ┌─────────┐
│  User   │──────▶│ Wallet  │──────▶│ Balance │
└────┬────┘       └─────────┘       └─────────┘
     │
     │ buyer/seller
     │
     ▼
┌─────────┐       ┌─────────┐       ┌──────────┐
│  Order  │──────▶│ Escrow  │──────▶│ Dispute  │
└────┬────┘       └─────────┘       └──────────┘
     │
     ├──────▶ TopUp
     └──────▶ Withdrawal
```

---

## Core Entities

### User

**Purpose:** Represents a marketplace participant (buyer, seller, or both).

**Fields:**
```typescript
interface User {
  id: string;                    // usr_xxxxx
  email: string;
  name: string;
  type: 'buyer' | 'seller' | 'both';
  airtmUserId?: string;          // For Airtm mode
  walletId?: string;             // For crypto mode
  createdAt: Date;
  updatedAt: Date;
}
```

**Relationships:**
- Has one `Wallet` (crypto mode)
- Has one `Balance`
- Has many `Orders` (as buyer or seller)
- Has many `TopUps`
- Has many `Withdrawals`

---

### Wallet (Crypto Mode)

**Purpose:** Invisible Stellar wallet for crypto-native payments.

**Fields:**
```typescript
interface Wallet {
  id: string;                    // wal_xxxxx
  userId: string;
  publicKey: string;             // Stellar public key
  encryptedSecret: string;       // AES-256-GCM encrypted
  depositAddress: string;        // Same as publicKey
  createdAt: Date;
  updatedAt: Date;
}
```

**Security:**
- Secret key encrypted with `WALLET_ENCRYPTION_KEY`
- Never returned in API responses
- Decrypted only for transaction signing

---

### Balance

**Purpose:** Per-user accounting of available and reserved funds.

**Fields:**
```typescript
interface Balance {
  id: string;                    // bal_xxxxx
  userId: string;
  available: number;             // Usable balance
  reserved: number;              // Locked for orders
  currency: 'USD' | 'USDC';
  lastSyncedAt: Date;            // For crypto mode
  createdAt: Date;
  updatedAt: Date;
}
```

**Computed:**
```typescript
total = available + reserved
```

**Operations:**
- `credit(amount)`: Increase available
- `debit(amount)`: Decrease available
- `reserve(amount)`: Move available → reserved
- `release(amount)`: Move reserved → available

---

### Order

**Purpose:** Represents a marketplace transaction with escrow.

**Fields:**
```typescript
interface Order {
  id: string;                    // ord_xxxxx
  buyerId: string;
  sellerId: string;
  amount: number;
  currency: 'USD' | 'USDC';
  status: OrderStatus;
  description?: string;
  milestones?: Milestone[];
  clientOrderRef?: string;       // Marketplace's order ID
  escrowId?: string;
  createdAt: Date;
  updatedAt: Date;
}

enum OrderStatus {
  CREATED = 'CREATED',           // Order created, funds not reserved
  RESERVED = 'RESERVED',         // Funds reserved, escrow not created
  ESCROW_CREATING = 'ESCROW_CREATING',
  ESCROW_CREATED = 'ESCROW_CREATED',
  ESCROW_FUNDED = 'ESCROW_FUNDED',
  IN_PROGRESS = 'IN_PROGRESS',   // Work in progress
  COMPLETED = 'COMPLETED',       // Funds released to seller
  REFUNDED = 'REFUNDED',         // Funds returned to buyer
  DISPUTED = 'DISPUTED',         // Dispute opened
  CANCELLED = 'CANCELLED',       // Cancelled before escrow funded
}
```

**State Machine:** See [Payment Flows](./payment-flows.md)

---

### Escrow

**Purpose:** Links to Trustless Work smart contract on Stellar.

**Fields:**
```typescript
interface Escrow {
  id: string;                    // esc_xxxxx
  orderId: string;
  contractId: string;            // Trustless Work contract ID
  status: EscrowStatus;
  amount: number;
  currency: 'USDC';
  createdAt: Date;
  fundedAt?: Date;
  releasedAt?: Date;
  refundedAt?: Date;
}

enum EscrowStatus {
  CREATING = 'CREATING',
  CREATED = 'CREATED',
  FUNDED = 'FUNDED',
  RELEASED = 'RELEASED',
  REFUNDED = 'REFUNDED',
  DISPUTED = 'DISPUTED',
}
```

---

### TopUp (Airtm Mode)

**Purpose:** Fiat on-ramp via Airtm.

**Fields:**
```typescript
interface TopUp {
  id: string;                    // top_xxxxx
  userId: string;
  amount: number;
  currency: 'USD';
  status: TopUpStatus;
  providerRef?: string;          // Airtm transaction ID
  confirmationUrl?: string;
  createdAt: Date;
  completedAt?: Date;
}

enum TopUpStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}
```

---

### Withdrawal

**Purpose:** Fiat off-ramp (Airtm) or crypto send (Stellar).

**Fields:**
```typescript
interface Withdrawal {
  id: string;                    // wth_xxxxx
  userId: string;
  amount: number;
  currency: 'USD' | 'USDC';
  status: WithdrawalStatus;
  destination: string;           // Airtm email or Stellar address
  providerRef?: string;
  createdAt: Date;
  completedAt?: Date;
}

enum WithdrawalStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}
```

---

### Dispute

**Purpose:** Dispute resolution for orders.

**Fields:**
```typescript
interface Dispute {
  id: string;                    // dsp_xxxxx
  orderId: string;
  openedBy: string;              // User ID
  reason: string;
  status: DisputeStatus;
  resolution?: DisputeResolution;
  comments: DisputeComment[];
  createdAt: Date;
  resolvedAt?: Date;
}

enum DisputeStatus {
  OPEN = 'OPEN',
  UNDER_REVIEW = 'UNDER_REVIEW',
  RESOLVED = 'RESOLVED',
}

interface DisputeResolution {
  type: 'release' | 'refund' | 'split';
  releaseAmount?: number;        // For split
  refundAmount?: number;         // For split
  resolvedBy: string;            // User ID (support)
  notes?: string;
}
```

---

### Audit Log

**Purpose:** Immutable record of all state-changing actions.

**Fields:**
```typescript
interface AuditLog {
  id: string;                    // aud_xxxxx
  action: string;                // e.g., 'order.create', 'balance.credit'
  actor: string;                 // User ID or 'system'
  resourceType: string;          // e.g., 'order', 'balance'
  resourceId: string;
  result: 'success' | 'failure';
  before?: Record<string, any>;  // State before action
  after?: Record<string, any>;   // State after action
  correlationId?: string;        // Request ID
  createdAt: Date;
}
```

**Security:**
- Secrets are redacted
- Immutable (no updates or deletes)
- Indexed by resourceType, resourceId, actor

---

### Idempotency Key

**Purpose:** Prevent duplicate mutations.

**Fields:**
```typescript
interface IdempotencyKey {
  key: string;                   // UUID from client
  requestHash: string;           // Hash of request body
  status: 'processing' | 'completed' | 'failed';
  response?: ApiResponse<any>;   // Cached response
  resourceType: string;          // e.g., 'order', 'topup'
  resourceId?: string;
  expiresAt: Date;
  createdAt: Date;
}
```

**TTL:**
- Orders: 7 days
- TopUps: 24 hours
- Withdrawals: 7 days

---

## State Machines

### Order State Machine

```
CREATED
  ↓ (reserve funds)
RESERVED
  ↓ (create escrow)
ESCROW_CREATING
  ↓ (escrow created)
ESCROW_CREATED
  ↓ (fund escrow)
ESCROW_FUNDED / IN_PROGRESS
  ↓ (work complete)
  ├─→ COMPLETED (release)
  ├─→ REFUNDED (refund)
  ├─→ DISPUTED (open dispute)
  │     ↓ (resolve)
  │     ├─→ COMPLETED
  │     └─→ REFUNDED
  └─→ CANCELLED (before funded)
```

**Valid Transitions:**
- `CREATED → RESERVED`
- `RESERVED → ESCROW_CREATING`
- `ESCROW_CREATING → ESCROW_CREATED`
- `ESCROW_CREATED → ESCROW_FUNDED`
- `ESCROW_FUNDED → IN_PROGRESS`
- `IN_PROGRESS → COMPLETED | REFUNDED | DISPUTED`
- `DISPUTED → COMPLETED | REFUNDED`
- `CREATED | RESERVED → CANCELLED`

---

### TopUp State Machine

```
PENDING
  ↓ (user pays)
CONFIRMED
  ↓ (webhook received)
COMPLETED
```

**Alternative:**
```
PENDING → FAILED
PENDING → CANCELLED
```

---

### Withdrawal State Machine

```
PENDING
  ↓ (commit)
PROCESSING
  ↓ (provider confirms)
COMPLETED
```

**Alternative:**
```
PENDING → CANCELLED
PROCESSING → FAILED
```

---

## Database Schema (PostgreSQL)

### Users Table

```sql
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  airtm_user_id VARCHAR(255),
  wallet_id VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Wallets Table

```sql
CREATE TABLE wallets (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id),
  public_key VARCHAR(255) UNIQUE NOT NULL,
  encrypted_secret TEXT NOT NULL,
  deposit_address VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Balances Table

```sql
CREATE TABLE balances (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) UNIQUE NOT NULL REFERENCES users(id),
  available DECIMAL(20, 8) NOT NULL DEFAULT 0,
  reserved DECIMAL(20, 8) NOT NULL DEFAULT 0,
  currency VARCHAR(10) NOT NULL,
  last_synced_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CHECK (available >= 0),
  CHECK (reserved >= 0)
);
```

### Orders Table

```sql
CREATE TABLE orders (
  id VARCHAR(255) PRIMARY KEY,
  buyer_id VARCHAR(255) NOT NULL REFERENCES users(id),
  seller_id VARCHAR(255) NOT NULL REFERENCES users(id),
  amount DECIMAL(20, 8) NOT NULL,
  currency VARCHAR(10) NOT NULL,
  status VARCHAR(50) NOT NULL,
  description TEXT,
  milestones JSONB,
  client_order_ref VARCHAR(255),
  escrow_id VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CHECK (amount > 0)
);

CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_seller ON orders(seller_id);
CREATE INDEX idx_orders_status ON orders(status);
```

---

## Relationships Summary

| Entity | Related To | Relationship |
|:-------|:-----------|:-------------|
| User | Wallet | One-to-One |
| User | Balance | One-to-One |
| User | Order | One-to-Many (as buyer/seller) |
| Order | Escrow | One-to-One |
| Order | Dispute | One-to-One (optional) |
| User | TopUp | One-to-Many |
| User | Withdrawal | One-to-Many |

---

**Next Steps:**
- Review [Payment Flows](./payment-flows.md) for state machine details
- See [Provider Integration](./provider-integration.md) for external services
- Check [Backend Modules](../backend/modules.md) for implementation
