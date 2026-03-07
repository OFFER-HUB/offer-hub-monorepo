# Wallets Guide

> How OFFER-HUB manages Stellar wallets: invisible keypairs, deposits, signing, and security.

---

## Table of Contents

- [What Are Invisible Wallets?](#what-are-invisible-wallets)
- [Why Server-Side Wallets?](#why-server-side-wallets)
- [How It Works](#how-it-works)
- [Wallet Lifecycle](#wallet-lifecycle)
- [Getting a Deposit Address](#getting-a-deposit-address)
- [Security Model](#security-model)
- [Custodial Responsibility](#custodial-responsibility)
- [Key Management](#key-management)
- [The Platform Wallet](#the-platform-wallet)
- [Future: Non-Custodial Option](#future-non-custodial-option)

---

## What Are Invisible Wallets?

In crypto-native mode (`PAYMENT_PROVIDER=crypto`), every user registered in the Orchestrator automatically gets a **Stellar keypair** — a public key and a private key.

From the user's perspective, there are no wallets, no seed phrases, no browser extensions. They see a familiar Web2 interface: "Your balance: $50.00 USDC." Under the hood, their USDC lives on the Stellar blockchain.

This design is called **invisible wallets** (also: server-side wallets or custodial wallets).

---

## Why Server-Side Wallets?

The Orchestrator must sign blockchain transactions **automatically** — without waiting for user interaction:

| Scenario | Why automatic signing is required |
|----------|-----------------------------------|
| Funding an escrow contract | Buyer's wallet must sign the funding transaction |
| Releasing escrow to seller | Seller's wallet signs `changeMilestoneStatus` |
| Approving + releasing funds | Buyer's wallet signs `approveMilestone` and `releaseFunds` |
| Refunding via dispute | Buyer's wallet disputes; platform wallet resolves |
| Webhook-triggered releases | No user is online to approve |

Browser wallets (like Freighter) require the user to manually approve every transaction. This breaks automated flows.

---

## How It Works

```
1. User registered via POST /users
       ↓
2. Orchestrator generates Stellar Keypair
   - publicKey:  G... (stored in DB in plaintext)
   - secretKey:  S... (encrypted with AES-256-GCM, stored in DB)
       ↓
3. User receives no wallet info — just their user ID
       ↓
4. To deposit: User calls GET /wallet/deposit-address
   - Orchestrator returns publicKey as deposit address
   - User sends USDC to that address from any Stellar wallet/exchange
       ↓
5. BlockchainMonitorService detects the payment via Horizon SSE stream
   - Automatically credits user's internal balance
       ↓
6. For escrow/release/refund:
   - Orchestrator decrypts secretKey (in memory, never persisted decrypted)
   - Signs the Stellar transaction
   - Submits to Stellar network via Trustless Work
   - Decrypted key is garbage-collected immediately
```

---

## Wallet Lifecycle

| Step | Trigger | What Happens |
|------|---------|--------------|
| Creation | `POST /users` | Stellar keypair generated, secret encrypted, stored in DB |
| First use | `GET /wallet/deposit-address` | Returns publicKey as deposit address |
| Deposit detection | Stellar payment arrives on-chain | `BlockchainMonitorService` credits balance |
| Escrow signing | Any escrow operation | Secret decrypted in memory, used to sign, cleared |
| Withdrawal | `POST /withdrawals` | Orchestrator signs outgoing Stellar payment |

---

## Getting a Deposit Address

```bash
GET /api/v1/wallet/deposit-address
Authorization: Bearer ohk_live_...
```

Response:
```json
{
  "success": true,
  "data": {
    "address": "GBXF...STELLAR...PUBLIC...KEY",
    "network": "stellar",
    "asset": "USDC",
    "memo": null,
    "instructions": "Send USDC (Stellar) to this address. Deposits are credited automatically within 30 seconds."
  }
}
```

**Important:** The address is permanent — it never changes for a given user. You can cache it.

### Testnet Funding

On testnet, users can receive test USDC from Stellar's Friendbot or from any testnet faucet. On mainnet, they must send real USDC from an exchange or another Stellar wallet.

---

## Security Model

Private keys are protected by multiple layers:

### 1. AES-256-GCM Encryption at Rest

Every Stellar secret key is encrypted before being stored in the database:

```
secretKey (plaintext)
    + WALLET_ENCRYPTION_KEY (env var, 32 bytes hex)
    + random IV (96-bit nonce, generated per encryption)
    → AES-256-GCM ciphertext + auth tag
    → stored in DB as: iv:ciphertext:tag
```

The `WALLET_ENCRYPTION_KEY` is **never stored in the database**. It lives only in the environment variable.

### 2. Key Never Leaves Server Memory

The decryption process only happens in memory, during transaction signing:

```typescript
// Pseudocode — simplified
async signTransaction(userId: string, xdr: string): Promise<string> {
  const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
  const secretKey = decrypt(wallet.encryptedSecretKey, process.env.WALLET_ENCRYPTION_KEY);
  const keypair = Keypair.fromSecret(secretKey);
  const signedXdr = sign(xdr, keypair);
  // secretKey and keypair are now eligible for GC
  return signedXdr;
}
```

The decrypted key is never logged, never returned in API responses, and never written to disk.

### 3. Encryption Key Separation

| What | Where |
|------|-------|
| Encrypted private keys | PostgreSQL DB |
| `WALLET_ENCRYPTION_KEY` | Environment variable (`.env`) |
| Public keys | PostgreSQL DB (plaintext — safe) |

An attacker who only has DB access cannot decrypt private keys without the encryption key. An attacker who only has the encryption key has nothing to decrypt.

---

## Custodial Responsibility

Invisible wallets make the Orchestrator operator a **custodian**:

| Responsibility | Description |
|---------------|-------------|
| Key security | You protect `WALLET_ENCRYPTION_KEY` — loss = loss of all wallets |
| Backup | Back up both the DB (encrypted keys) and the encryption key separately |
| Disaster recovery | Have a documented procedure for key recovery |
| Insurance | Consider insurance for large USDC amounts |
| Legal | Custodial status has regulatory implications — consult legal counsel |

### WALLET_ENCRYPTION_KEY Recovery

If `WALLET_ENCRYPTION_KEY` is lost:
- All encrypted private keys in the DB become unrecoverable
- Users lose access to their Stellar wallets permanently
- Funds in escrow contracts cannot be released or refunded

**Treat this key like your most critical secret.** Use a secrets manager (AWS Secrets Manager, HashiCorp Vault, Railway Variables) with automatic backup.

---

## Key Management

### Generating the Encryption Key

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Output: 64-character hex string (32 bytes)
```

Store in `.env`:
```env
WALLET_ENCRYPTION_KEY=a1b2c3d4e5f6...64hexchars...
```

### Production Checklist

- [ ] `WALLET_ENCRYPTION_KEY` is a fresh 32-byte random value
- [ ] Key is backed up in at least 2 secure locations (not the DB)
- [ ] DB backup procedure includes encrypted wallet columns
- [ ] Access to `WALLET_ENCRYPTION_KEY` is limited to minimum staff
- [ ] Monitoring alerts on any unauthorized access to the `Wallet` table
- [ ] Rotation plan documented (requires decrypting + re-encrypting all keys)

---

## The Platform Wallet

In addition to user wallets, the Orchestrator uses one special **platform wallet**. This wallet serves as:

| Role | Purpose |
|------|---------|
| `platformAddress` | Receives a copy of the escrow contract reference |
| `disputeResolver` | The only signer who can resolve on-chain disputes |

The platform wallet is identified by `PLATFORM_USER_ID` in your environment:

```env
PLATFORM_USER_ID=usr_abc123  # User whose wallet acts as platform wallet
```

This user must be created first via `POST /users`, and their wallet is managed the same way as any other user wallet.

### Why a Separate Platform Wallet?

Trustless Work's dispute resolution requires the `disputeResolver` to be a different party from the disputer. When a buyer disputes, they sign the `dispute-escrow` transaction. The platform wallet then signs `resolve-dispute` — this separation ensures neither party can unilaterally steal funds.

---

## Future: Non-Custodial Option

A future phase will add support for users bringing their own Stellar wallet (e.g., Freighter). In that mode:

- Users hold their own private keys
- The Orchestrator uses their public key for contract setup
- Transactions are presented for user approval via the browser
- The Orchestrator does NOT hold their secret key

This is an additive feature — it won't replace invisible wallets, just provide an optional advanced mode for users who prefer self-custody.

---

## Related Guides

- [Deposits](./deposits.md) — How USDC deposits work
- [Withdrawals](./withdrawals.md) — How USDC withdrawals work
- [Escrow](./escrow.md) — How signing relates to escrow operations
- [Deployment](./deployment.md) — Production security checklist
- [Core Concepts](./core-concepts.md) — Balance model overview
