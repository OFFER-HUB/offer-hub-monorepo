# Provider Integration

This document details the integration with external payment providers: Trustless Work, Stellar, and Airtm.

## Provider Abstraction

OFFER-HUB uses the **Strategy Pattern** to abstract payment providers, allowing seamless switching between crypto-native and fiat rails.

### PaymentProvider Interface

```typescript
interface PaymentProvider {
  // User initialization
  initializeUser(userId: string): Promise<void>;
  isUserReady(userId: string): Promise<boolean>;
  
  // Balance operations
  getBalance(userId: string): Promise<number>;
  getDepositInfo(userId: string): Promise<DepositInfo>;
  
  // Transaction operations
  signEscrowTransaction(userId: string, tx: Transaction): Promise<SignedTransaction>;
  sendPayment(userId: string, destination: string, amount: number): Promise<string>;
}
```

### Implementations

1. **CryptoNativeProvider** (default): Stellar + Trustless Work
2. **AirtmProvider** (future): Airtm API

**Configuration:**
```bash
PAYMENT_PROVIDER=crypto  # or 'airtm'
```

---

## Trustless Work Integration

**Purpose:** Non-custodial escrow smart contracts on Stellar (Soroban).

**Website:** [trustlesswork.com](https://trustlesswork.com)

### API Endpoints

Base URL: `https://api.trustlesswork.com`

#### 1. Deploy Escrow Contract

```http
POST /escrow/deploy
Authorization: Bearer {TRUSTLESS_WORK_API_KEY}

Request:
{
  "amount": 100.00,
  "currency": "USDC",
  "buyer": "GXXXXX...",
  "seller": "GXXXXX...",
  "approver": "GXXXXX...",        // Platform
  "disputeResolver": "GXXXXX...", // Platform
  "milestones": [
    { "id": "m1", "description": "Design complete", "amount": 50 },
    { "id": "m2", "description": "Development complete", "amount": 50 }
  ]
}

Response:
{
  "contractId": "esc_tw_xxxxx",
  "address": "CXXXXX...",
  "status": "CREATED"
}
```

#### 2. Fund Escrow

```http
POST /escrow/{contractId}/fund
Authorization: Bearer {TRUSTLESS_WORK_API_KEY}

Request:
{
  "buyerSignature": "...",
  "transaction": "..."
}

Response:
{
  "status": "FUNDED",
  "txHash": "..."
}
```

#### 3. Change Milestone Status

```http
POST /escrow/{contractId}/milestone/{milestoneId}/status
Authorization: Bearer {TRUSTLESS_WORK_API_KEY}

Request:
{
  "status": "completed",
  "sellerSignature": "..."
}

Response:
{
  "milestoneId": "m1",
  "status": "completed"
}
```

#### 4. Approve Milestone

```http
POST /escrow/{contractId}/milestone/{milestoneId}/approve
Authorization: Bearer {TRUSTLESS_WORK_API_KEY}

Request:
{
  "buyerSignature": "..."
}

Response:
{
  "milestoneId": "m1",
  "approved": true
}
```

#### 5. Release Funds

```http
POST /escrow/{contractId}/release
Authorization: Bearer {TRUSTLESS_WORK_API_KEY}

Request:
{
  "buyerSignature": "..."
}

Response:
{
  "status": "RELEASED",
  "txHash": "...",
  "amount": 100.00
}
```

#### 6. Dispute Escrow

```http
POST /escrow/{contractId}/dispute
Authorization: Bearer {TRUSTLESS_WORK_API_KEY}

Request:
{
  "initiator": "buyer",  // or "seller"
  "reason": "Work not completed as agreed",
  "signature": "..."
}

Response:
{
  "status": "DISPUTED",
  "disputeId": "dsp_xxxxx"
}
```

#### 7. Resolve Dispute

```http
POST /escrow/{contractId}/resolve
Authorization: Bearer {TRUSTLESS_WORK_API_KEY}

Request:
{
  "releaseAmount": 60.00,  // To seller
  "refundAmount": 40.00,   // To buyer
  "disputeResolverSignature": "..."
}

Response:
{
  "status": "RESOLVED",
  "txHash": "...",
  "releaseAmount": 60.00,
  "refundAmount": 40.00
}
```

---

### Trustless Work Roles

| Role | Stellar Account | Permissions |
|:-----|:----------------|:------------|
| **Buyer** | User's wallet | Fund escrow, approve milestones, release funds, dispute |
| **Seller** | User's wallet | Change milestone status, dispute |
| **Approver** | Platform wallet | Approve escrow creation |
| **Dispute Resolver** | Platform wallet | Resolve disputes |
| **Release Signer** | Buyer's wallet | Sign release transactions |

---

### Webhook (Optional)

Trustless Work can send webhooks for escrow events:

```http
POST {ORCHESTRATOR_URL}/webhooks/trustless-work
X-TW-Signature: {HMAC_SHA256}

Payload:
{
  "event": "escrow.funded",
  "contractId": "esc_tw_xxxxx",
  "timestamp": "2026-02-17T19:40:00Z",
  "data": {
    "status": "FUNDED",
    "amount": 100.00,
    "txHash": "..."
  }
}
```

**Verification:**
```typescript
const signature = req.headers['x-tw-signature'];
const payload = JSON.stringify(req.body);
const expectedSignature = crypto
  .createHmac('sha256', TRUSTLESS_WORK_WEBHOOK_SECRET)
  .update(payload)
  .digest('hex');

if (signature !== expectedSignature) {
  throw new Error('Invalid signature');
}
```

---

## Stellar Integration

**Purpose:** Blockchain for USDC transactions and escrow contracts.

**Network:** Mainnet (production) or Testnet (development)

### Horizon API

Base URL: `https://horizon.stellar.org` (mainnet)

#### 1. Get Account Balance

```http
GET /accounts/{publicKey}

Response:
{
  "balances": [
    {
      "asset_code": "USDC",
      "asset_issuer": "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
      "balance": "100.0000000"
    }
  ]
}
```

#### 2. Stream Payments

```http
GET /accounts/{publicKey}/payments?cursor=now
Accept: text/event-stream

Event:
data: {
  "type": "payment",
  "asset_code": "USDC",
  "amount": "50.0000000",
  "from": "GXXXXX...",
  "to": "GXXXXX..."
}
```

**Implementation:**
```typescript
const server = new Horizon.Server('https://horizon.stellar.org');

server.payments()
  .forAccount(publicKey)
  .cursor('now')
  .stream({
    onmessage: (payment) => {
      if (payment.asset_code === 'USDC') {
        creditBalance(userId, parseFloat(payment.amount));
      }
    },
  });
```

---

### Stellar SDK

**Package:** `stellar-sdk`

#### Create Wallet

```typescript
import { Keypair } from 'stellar-sdk';

const keypair = Keypair.random();
const publicKey = keypair.publicKey();   // GXXXXX...
const secretKey = keypair.secret();      // SXXXXX...

// Encrypt secret before storing
const encrypted = encrypt(secretKey, WALLET_ENCRYPTION_KEY);
```

#### Sign Transaction

```typescript
import { Transaction } from 'stellar-sdk';

const tx = new Transaction(xdr, networkPassphrase);
const keypair = Keypair.fromSecret(decryptedSecret);
tx.sign(keypair);

const signedXdr = tx.toXDR();
```

#### Send Payment

```typescript
import { Server, TransactionBuilder, Operation, Asset } from 'stellar-sdk';

const server = new Server('https://horizon.stellar.org');
const account = await server.loadAccount(sourcePublicKey);

const transaction = new TransactionBuilder(account, {
  fee: '100',
  networkPassphrase: Networks.PUBLIC,
})
  .addOperation(Operation.payment({
    destination: destinationPublicKey,
    asset: new Asset('USDC', USDC_ISSUER),
    amount: '50.00',
  }))
  .setTimeout(30)
  .build();

transaction.sign(sourceKeypair);
const result = await server.submitTransaction(transaction);
```

---

## Airtm Integration (Future)

**Purpose:** Fiat on/off-ramp for USD.

**Website:** [airtm.com](https://airtm.com)

**Note:** Requires Airtm Enterprise account.

### API Endpoints

Base URL: `https://api.airtm.com`

#### 1. Create Payin (Top-Up)

```http
POST /payins
Authorization: Bearer {AIRTM_API_KEY}

Request:
{
  "userId": "usr_xxxxx",
  "amount": 100.00,
  "currency": "USD",
  "redirectUrl": "https://marketplace.com/topup/callback"
}

Response:
{
  "payinId": "payin_xxxxx",
  "confirmationUrl": "https://airtm.com/payin/xxxxx",
  "status": "PENDING"
}
```

#### 2. Create Payout (Withdrawal)

```http
POST /payouts
Authorization: Bearer {AIRTM_API_KEY}

Request:
{
  "userId": "usr_xxxxx",
  "amount": 50.00,
  "currency": "USD",
  "destination": "user@example.com"
}

Response:
{
  "payoutId": "payout_xxxxx",
  "status": "PROCESSING"
}
```

---

### Airtm Webhooks

```http
POST {ORCHESTRATOR_URL}/webhooks/airtm
X-Airtm-Signature: {HMAC_SHA256}

Payload:
{
  "event": "payin.completed",
  "payinId": "payin_xxxxx",
  "userId": "usr_xxxxx",
  "amount": 100.00,
  "currency": "USD",
  "timestamp": "2026-02-17T19:40:00Z"
}
```

**Verification:**
```typescript
const signature = req.headers['x-airtm-signature'];
const payload = JSON.stringify(req.body);
const expectedSignature = crypto
  .createHmac('sha256', AIRTM_WEBHOOK_SECRET)
  .update(payload)
  .digest('hex');

if (signature !== expectedSignature) {
  throw new Error('Invalid signature');
}
```

---

## Provider Configuration

### Environment Variables

```bash
# Payment Provider Selection
PAYMENT_PROVIDER=crypto  # or 'airtm'

# Trustless Work
TRUSTLESS_WORK_API_KEY=tw_xxxxx
TRUSTLESS_WORK_PLATFORM_SECRET=SXXXXX...
TRUSTLESS_WORK_WEBHOOK_SECRET=secret_xxxxx

# Stellar
STELLAR_NETWORK=testnet  # or 'mainnet'
WALLET_ENCRYPTION_KEY=32_byte_hex_key

# Airtm (if PAYMENT_PROVIDER=airtm)
AIRTM_API_KEY=airtm_xxxxx
AIRTM_SECRET=secret_xxxxx
AIRTM_WEBHOOK_SECRET=webhook_secret_xxxxx
```

---

## Error Handling

### Trustless Work Errors

```json
{
  "error": "INSUFFICIENT_FUNDS",
  "message": "Buyer does not have enough USDC to fund escrow",
  "code": 4000
}
```

**Orchestrator Response:**
```json
{
  "ok": false,
  "code": 4000,
  "type": "error",
  "title": "Insufficient funds",
  "message": "You don't have enough USDC to fund this escrow. Please top up your balance.",
  "data": null
}
```

### Stellar Errors

```json
{
  "type": "https://stellar.org/horizon-errors/transaction_failed",
  "title": "Transaction Failed",
  "status": 400,
  "extras": {
    "result_codes": {
      "transaction": "tx_insufficient_balance"
    }
  }
}
```

---

**Next Steps:**
- Review [Payment Flows](./payment-flows.md) for transaction sequences
- See [Data Model](./data-model.md) for entity relationships
- Check [Backend Modules](../backend/modules.md) for implementation details
