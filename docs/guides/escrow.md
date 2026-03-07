# Escrow Guide

> How OFFER-HUB uses Trustless Work smart contracts on Stellar to hold funds non-custodially.

---

## Table of Contents

- [What Is an Escrow?](#what-is-an-escrow)
- [Technology Stack](#technology-stack)
- [Escrow States](#escrow-states)
- [Creating an Escrow](#creating-an-escrow)
- [Funding an Escrow](#funding-an-escrow)
- [Releasing Funds (3 Transactions)](#releasing-funds-3-transactions)
- [Refunding Funds (2 Transactions)](#refunding-funds-2-transactions)
- [Dispute Resolution](#dispute-resolution)
  - [Full Release (FULL_RELEASE)](#full-release)
  - [Full Refund (FULL_REFUND)](#full-refund)
  - [Split (SPLIT)](#split)
- [Transaction Signers Summary](#transaction-signers-summary)
- [The Platform Wallet Role](#the-platform-wallet-role)
- [On-Chain vs Off-Chain Balance](#on-chain-vs-off-chain-balance)
- [Milestones](#milestones)

---

## What Is an Escrow?

An escrow holds USDC on the Stellar blockchain in a smart contract. Neither buyer nor seller can unilaterally access those funds — release requires a specific set of signatures.

**Key properties:**
- **Non-custodial:** Funds are locked in a Soroban smart contract, not in the Orchestrator's database
- **Transparent:** Anyone can verify the contract on the Stellar Explorer
- **Tamper-proof:** Only the designated signers (buyer, seller, platform) can trigger state changes
- **Automatic:** The Orchestrator handles all signing server-side — no user interaction required

---

## Technology Stack

| Component | Role |
|-----------|------|
| **Stellar blockchain** | Distributed ledger for USDC transactions |
| **Soroban** | Stellar's smart contract platform |
| **USDC (Stellar)** | The settlement asset (`GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN`) |
| **Trustless Work** | Smart contract abstraction layer — deploys and manages Soroban escrow contracts |
| **Horizon API** | Stellar's REST/SSE API for transaction submission and monitoring |
| **Invisible Wallets** | Server-side Stellar keypairs for signing (buyer, seller, platform) |

---

## Escrow States

| State | Description |
|-------|-------------|
| `CREATING` | Smart contract being deployed via Trustless Work API |
| `CREATED` | Contract deployed on-chain, not yet funded |
| `FUNDING` | Fund transaction being submitted |
| `FUNDED` | USDC confirmed locked in contract |
| `RELEASING` | Release transaction sequence in progress |
| `RELEASED` | USDC sent to seller's Stellar wallet |
| `REFUNDING` | Refund dispute+resolve process in progress |
| `REFUNDED` | USDC returned to buyer's Stellar wallet |
| `DISPUTED` | Active dispute — awaiting resolution |

---

## Creating an Escrow

When you call `POST /orders/:id/escrow`, the Orchestrator:

1. Calls Trustless Work API to deploy a Soroban smart contract
2. The contract is configured with:
   - `buyer` — buyer's Stellar public key (invisible wallet)
   - `seller` — seller's Stellar public key (invisible wallet)
   - `platformAddress` — platform wallet public key
   - `disputeResolver` — platform wallet public key
   - `amount` — the order amount in USDC
3. Trustless Work returns an unsigned XDR transaction
4. Orchestrator signs with the **platform wallet** (deploy authority)
5. Signed transaction submitted to Stellar
6. Contract ID (`trustlessContractId`) stored in DB

The escrow is now deployed but empty — no USDC yet.

---

## Funding an Escrow

When you call `POST /orders/:id/escrow/fund`, the Orchestrator:

1. Calls Trustless Work API: "fund this contract with X USDC"
2. Trustless Work returns an unsigned XDR transaction
3. Orchestrator decrypts **buyer's secret key** in memory
4. Signs the transaction with buyer's keypair
5. Signed transaction submitted to Stellar
6. USDC moves from buyer's Stellar wallet to the smart contract

**Balance tracking update:**
- `reserved -= amount` (funds are now on-chain, not in Orchestrator's balance)
- Order state: `ESCROW_FUNDED` → `IN_PROGRESS`

> At this point, the USDC is fully on-chain. The Orchestrator's internal balance is a mirror — the on-chain contract is the source of truth.

---

## Releasing Funds (3 Transactions)

When the buyer approves work (`POST /orders/:id/resolution/release`), the Orchestrator executes **3 sequential Stellar transactions**:

### Transaction 1: changeMilestoneStatus

- **Purpose:** Mark the milestone as completed (seller acknowledges delivery)
- **Signer:** Seller's invisible wallet (`serviceProvider` role in Trustless Work)
- **Effect:** Milestone status updates to "completed" in the contract

### Transaction 2: approveMilestone

- **Purpose:** Buyer approves the milestone
- **Signer:** Buyer's invisible wallet (`approver` role in Trustless Work)
- **Effect:** Milestone marked as approved in the contract

### Transaction 3: releaseFunds

- **Purpose:** Trigger the actual fund release
- **Signer:** Buyer's invisible wallet (`releaseSigner` role in Trustless Work)
- **Effect:** USDC transferred from contract to seller's Stellar wallet

**After releaseFunds:**
- Seller's Orchestrator balance: `available += amount`
- Escrow status → `RELEASED`
- Order status → `RELEASED` → `CLOSED`
- Events: `escrow.released`, `order.released`, `balance.credited` (seller), `order.closed`

---

## Refunding Funds (2 Transactions)

Trustless Work has **no direct refund endpoint**. Refunds use a 2-step dispute+resolve mechanism.

When you call `POST /orders/:id/resolution/refund`, the Orchestrator:

### Transaction 1: dispute-escrow

- **Purpose:** Open a dispute on the contract (prerequisite for resolve)
- **Signer:** Buyer's invisible wallet (`approver` role — the disputer)
- **Effect:** Contract enters disputed state

### Transaction 2: resolve-dispute (100% to buyer)

- **Purpose:** Resolve the dispute, sending all funds to the buyer
- **Signer:** Platform wallet (`disputeResolver` role)
- **Payload:** `{ distributions: [{ address: buyerAddress, amount: "80.00" }] }`
- **Effect:** USDC transferred from contract to buyer's Stellar wallet

**After resolution:**
- Buyer's Orchestrator balance: `available += amount`
- Escrow status → `REFUNDED`
- Order status → `REFUNDED` → `CLOSED`

> **Key constraint:** The `disputeResolver` must be a **different party** from the disputer. The buyer opens the dispute; the platform wallet resolves it. This prevents either party from stealing funds.

---

## Dispute Resolution

When a manual dispute is opened (via `POST /orders/:id/resolution/dispute`), support staff resolves it via `POST /disputes/:id/resolve` with one of three decisions:

### Full Release

All funds go to the seller:

```json
{
  "decision": "FULL_RELEASE"
}
```

**On-chain:** Same 2-step dispute+resolve as refund, but `distributions = [{ seller, 100% }]`

### Full Refund

All funds go to the buyer:

```json
{
  "decision": "FULL_REFUND"
}
```

**On-chain:** 2-step dispute+resolve with `distributions = [{ buyer, 100% }]`

### Split

Funds distributed between both parties:

```json
{
  "decision": "SPLIT",
  "releaseAmount": "60.00",
  "refundAmount": "20.00"
}
```

> `releaseAmount + refundAmount` must equal the original order amount.

**On-chain:** 2-step dispute+resolve with `distributions = [{ seller, "60.00" }, { buyer, "20.00" }]`

**After SPLIT:**
- Seller's balance: `available += 60.00`
- Buyer's balance: `available += 20.00`
- Both credited separately, both credited via `balance.credited` events

---

## Transaction Signers Summary

| Operation | TX # | Signer | Role in Contract |
|-----------|------|--------|-----------------|
| Deploy contract | 1 | Platform wallet | Authority |
| Fund escrow | 1 | Buyer wallet | Funder |
| Release: changeMilestoneStatus | 1 | Seller wallet | `serviceProvider` |
| Release: approveMilestone | 2 | Buyer wallet | `approver` |
| Release: releaseFunds | 3 | Buyer wallet | `releaseSigner` |
| Refund/Dispute: dispute-escrow | 1 | Buyer wallet | `approver` (disputer) |
| Refund/Dispute: resolve-dispute | 2 | Platform wallet | `disputeResolver` |

---

## The Platform Wallet Role

The platform wallet is a special user (`PLATFORM_USER_ID`) whose Stellar wallet serves two roles:

1. **`platformAddress`** — Set during contract deployment; receives a copy of contract events
2. **`disputeResolver`** — The only signer who can call `resolve-dispute`

This design ensures:
- Neither buyer nor seller can unilaterally access funds after escrow is funded
- Only the platform (acting as neutral arbitrator) can resolve disputes on-chain
- Even the Orchestrator itself cannot access funds without proper authorization

---

## On-Chain vs Off-Chain Balance

Understanding where USDC actually lives at each stage:

| Stage | Buyer Available | Buyer Reserved | On-Chain (Contract) | Seller Available |
|-------|----------------|----------------|---------------------|-----------------|
| After deposit | `+100.00` | `0` | `0` | `0` |
| After reserve | `+20.00` | `+80.00` | `0` | `0` |
| After escrow fund | `+20.00` | `0` | `+80.00` | `0` |
| After release | `+20.00` | `0` | `0` | `+80.00` |
| After refund | `+100.00` | `0` | `0` | `0` |
| After SPLIT | `+40.00` | `0` | `0` | `+60.00` |

**The Orchestrator's balance is a mirror.** The source of truth for on-chain funds is the Stellar blockchain. The Orchestrator tracks what happened, but the smart contract enforces it.

---

## Milestones

Trustless Work supports milestone-based escrow. The Orchestrator currently uses a single-milestone model (the entire order is one milestone), but the schema supports multiple milestones for future use:

```
Order has 1 Escrow
Escrow has 1+ Milestones
Each Milestone has: amount, status, completedAt
```

In the current implementation, releasing or refunding affects the entire escrow amount. Multi-milestone partial releases are planned for a future phase.

---

## Related Guides

- [Orders](./orders.md) — Order lifecycle and state machine
- [Disputes](./disputes.md) — Manual dispute resolution flows
- [Wallets](./wallets.md) — How invisible wallets sign transactions
- [Flow of Funds](../architecture/flow-of-funds.md) — Full sequence diagrams
- [Events Reference](./events-reference.md) — Escrow events
