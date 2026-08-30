# Security Best Practices for Platform Integrators

> Concrete guidance for developers integrating OFFER-HUB into their own marketplaces — covering API key management, webhook validation, wallet security, escrow verification, and blockchain-specific attack mitigations.

> **Looking for the public API guide?** This is the internal engineering reference (Orchestrator implementation detail). For the external API/SDK guide aimed at integrators, see [`content/docs/guide/security.mdx`](../../content/docs/guide/security.mdx).

---

## Table of Contents

- [API Key Management](#api-key-management)
- [Webhook Signature Validation](#webhook-signature-validation)
- [Wallet Private Key Management](#wallet-private-key-management)
- [Escrow Integration Security](#escrow-integration-security)
- [Security Headers and CSP](#security-headers-and-csp)
- [Blockchain-Specific Attack Vectors](#blockchain-specific-attack-vectors)

---

## API Key Management

OFFER-HUB API keys follow the format `ohk_live_xxx` (production) and `ohk_test_xxx` (sandbox). A leaked live key gives full control over all payment operations, including releasing escrow funds and initiating withdrawals.

### Storage

✅ **DO:**

```bash
# Store keys in environment variables — never hardcoded
OFFER_HUB_API_KEY=ohk_live_abc123...
```

```typescript
// Read from the environment at runtime
const apiKey = process.env.OFFER_HUB_API_KEY;
if (!apiKey) throw new Error('OFFER_HUB_API_KEY is not set');
```

❌ **DON'T:**

```typescript
// Never hardcode keys in source code
const apiKey = 'ohk_live_abc123...'; // ❌ Will end up in git history

// Never embed keys in client-side bundles
const response = await fetch('/api/orders', {
  headers: { Authorization: `Bearer ohk_live_abc123...` }, // ❌
});
```

```json
// Never commit keys to version control
// .env.example — show structure only, no real values
{
  "OFFER_HUB_API_KEY": "ohk_live_REPLACE_ME"
}
```

### Key Rotation

API keys should be rotated:

- Immediately if any team member with access leaves
- Immediately if you suspect a key has been exposed (logs, error messages, public repos)
- Every 90 days as a routine practice in production

**Rotation procedure:**

1. Generate a new key in the Orchestrator admin
2. Deploy the new key to all services using secret manager tooling (e.g., AWS Secrets Manager, HashiCorp Vault)
3. Verify all services are using the new key
4. Revoke the old key

### Scopes

Use the minimum scope necessary for each integration point:

| Service | Required Scope |
|---------|----------------|
| Read-only dashboard | `read` |
| Order creation service | `write` |
| Dispute resolution admin | `support` |

Never use a `write` or `support` scoped key from a context that only needs `read`.

### API Key Transport

API keys must **only** travel server-to-server. Your marketplace backend calls OFFER-HUB; your frontend never does.

```
❌ Browser → OFFER-HUB API (exposes key to any user with DevTools)
✅ Browser → Your Backend → OFFER-HUB API
```

---

## Webhook Signature Validation

OFFER-HUB signs every webhook payload with an HMAC-SHA256 signature using a secret you configure. **Always validate this signature.** Without validation, any actor who knows your webhook URL can send spoofed events — such as a fake `escrow.released` event — and trick your system into delivering services without payment.

### How Signatures Work

Each webhook request includes the header:

```
X-OfferHub-Signature: sha256=<hex_digest>
```

The digest is computed as:

```
HMAC-SHA256(secret, raw_request_body)
```

### Validation Implementation

```typescript
import { createHmac, timingSafeEqual } from 'crypto';

function verifyWebhookSignature(
  rawBody: Buffer,
  signatureHeader: string,
  secret: string,
): boolean {
  const expected = createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  const expectedHeader = `sha256=${expected}`;

  // Use timingSafeEqual to prevent timing attacks
  try {
    return timingSafeEqual(
      Buffer.from(signatureHeader),
      Buffer.from(expectedHeader),
    );
  } catch {
    // Buffers of different lengths throw — treat as invalid
    return false;
  }
}

// Express middleware example
app.post('/webhooks/offerhub', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-offerhub-signature'] as string;

  if (!verifyWebhookSignature(req.body, signature, process.env.WEBHOOK_SECRET!)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const event = JSON.parse(req.body.toString());
  // Safe to process
});
```

### Critical Rules

✅ **DO:**

- Parse the raw body **before** JSON.parse — the signature is over the raw bytes
- Use `timingSafeEqual` — standard `===` is vulnerable to timing attacks
- Return `401` immediately on invalid signatures — do not log the payload
- Rotate the webhook secret if it may have been exposed

❌ **DON'T:**

```typescript
// Don't validate the parsed JSON body — the signature is over raw bytes
const parsedBody = JSON.parse(req.body); // ❌ Sign the raw body, not this
```

```typescript
// Don't trust the event type without validating the signature first
if (event.type === 'escrow.released') {
  releaseOrder(event.data.orderId); // ❌ Validate signature first
}
```

```typescript
// Don't use string equality — vulnerable to timing attacks
if (signature === expected) { ... } // ❌ Use timingSafeEqual
```

### Replay Attack Prevention

A valid signature doesn't mean the event is fresh. Add a timestamp check:

```typescript
const FIVE_MINUTES_MS = 5 * 60 * 1000;

function isTimestampFresh(event: any): boolean {
  const eventTime = new Date(event.timestamp).getTime();
  return Math.abs(Date.now() - eventTime) < FIVE_MINUTES_MS;
}
```

Track processed event IDs in Redis to prevent duplicate processing:

```typescript
const alreadyProcessed = await redis.exists(`webhook:processed:${event.id}`);
if (alreadyProcessed) return res.status(200).json({ status: 'duplicate' });

await redis.setex(`webhook:processed:${event.id}`, 3600, '1');
```

---

## Wallet Private Key Management

OFFER-HUB manages Stellar invisible wallets for your users. Private keys are encrypted at rest with AES-256-GCM. As a platform integrator, you interact with the Orchestrator's API — you should **never** handle raw private keys directly.

### What the Orchestrator Handles

- Generating Stellar keypairs for each user
- Encrypting and storing private keys (never in plaintext)
- Decrypting keys **in memory only** during transaction signing
- Immediately zeroing the in-memory key after signing

### What You Must Never Do

❌ **Never log private keys or mnemonic phrases:**

```typescript
// ❌ Never do this — private keys in logs are catastrophic
console.log('User wallet:', { secretKey: user.stellarSecretKey });
logger.info({ user }); // ❌ If user object contains key fields, strip them first
```

❌ **Never transmit private keys:**

```typescript
// ❌ Never send private keys to clients, even over HTTPS
res.json({ wallet: { address: wallet.publicKey, secretKey: wallet.secretKey } });
```

❌ **Never store unencrypted keys:**

```typescript
// ❌ Never store raw secret keys in your database
await db.users.update({ stellarSecretKey: rawKey }); // Must be encrypted
```

### If You Deploy Your Own Orchestrator Instance

If you self-host OFFER-HUB, you are responsible for the encryption key used to protect wallet private keys:

```bash
# Must be a high-entropy random value — never a human-readable string
WALLET_ENCRYPTION_KEY=$(openssl rand -hex 32)
```

- Store this key in a hardware security module (HSM) or secrets manager — never in your codebase or version control
- Rotating the encryption key requires re-encrypting all stored wallets — plan migrations carefully
- Back up the key securely — if lost, all user wallets are permanently inaccessible

### Hardware Wallet Recommendations

For the Orchestrator's platform wallet (used to sign dispute resolutions), consider using a hardware wallet integration:

- The platform wallet signs dispute resolution transactions — it is the most sensitive key in the system
- Use a hardware security module (HSM) like AWS CloudHSM or Azure Dedicated HSM for production
- At minimum, store the platform private key in a managed secrets service with audit logging

---

## Escrow Integration Security

The escrow flow is the highest-risk operation in OFFER-HUB. A bug here can result in funds being released to the wrong party or funds being permanently locked.

### Verify State Before Acting

Always verify the escrow and order state via the API before triggering a resolution. Never rely solely on a webhook event to determine whether a release is safe.

```typescript
// ✅ Always double-check state before releasing
async function releaseEscrow(orderId: string, requestedBy: string) {
  const order = await offerHubClient.orders.get(orderId);

  // Verify the order is in a releasable state
  if (order.status !== 'IN_PROGRESS') {
    throw new Error(`Cannot release order in state: ${order.status}`);
  }

  // Verify the requester is the buyer
  if (order.buyerId !== requestedBy) {
    throw new Error('Only the buyer can release escrow funds');
  }

  // Verify escrow is funded on-chain before releasing
  if (!order.escrow || order.escrow.status !== 'FUNDED') {
    throw new Error('Escrow is not in FUNDED state');
  }

  return offerHubClient.orders.release(orderId, 'Buyer approved release');
}
```

### What to Verify Before Releasing Funds

Before calling `POST /orders/:id/resolution/release`, confirm:

| Check | Why |
|-------|-----|
| Order status is `IN_PROGRESS` | Prevents releasing an already-released or refunded order |
| Requester is the buyer | Only the buyer can approve work delivery |
| Escrow status is `FUNDED` | Prevents releasing unfunded escrow (would fail on-chain anyway) |
| Delivery evidence exists | Application-level check: ensure work was actually submitted |
| No open dispute exists | Prevents releasing while a dispute is active |

### Idempotency Keys

All state-changing operations must use idempotency keys to prevent double-releases caused by network retries:

```typescript
const idempotentClient = offerHubClient.withIdempotencyKey(`release-${orderId}-${requestedBy}`);
await idempotentClient.orders.release(orderId, 'Buyer approved release');
```

Store the idempotency key and its result so retries return the cached response rather than executing twice.

### Cross-Checking with the Stellar Ledger

For high-value orders, cross-check the escrow contract state directly on the Stellar blockchain before releasing:

```typescript
import { Horizon } from '@stellar/stellar-sdk';

const server = new Horizon.Server('https://horizon.stellar.org');

// Verify the contract holds the expected amount before releasing
async function verifyEscrowOnChain(contractId: string, expectedAmount: string) {
  // Query the Trustless Work contract state
  // Compare against OFFER-HUB's reported escrow amount
  // Alert if there is a mismatch — indicates possible data inconsistency
}
```

---

## Security Headers and CSP

If you are building a web frontend on top of OFFER-HUB, configure security headers to protect your users.

### Recommended HTTP Security Headers

```typescript
// Next.js — next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};
```

### Content Security Policy

A strict CSP prevents XSS attacks from injecting malicious scripts that could steal API keys from localStorage or intercept payment flows.

```typescript
const cspHeader = `
  default-src 'self';
  script-src 'self' 'nonce-{NONCE}';
  style-src 'self' 'nonce-{NONCE}';
  img-src 'self' data: https:;
  connect-src 'self' https://your-orchestrator.example.com;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim();
```

✅ **DO:**

- Use nonces instead of `'unsafe-inline'` for inline scripts
- Restrict `connect-src` to only your Orchestrator's domain — not `*`
- Set `frame-ancestors 'none'` to prevent clickjacking on payment flows
- Enable `upgrade-insecure-requests` to force HTTPS

❌ **DON'T:**

```
// Never use these in production
Content-Security-Policy: script-src 'unsafe-inline' 'unsafe-eval' *
```

### CORS on Your Proxy Backend

Your marketplace backend proxies calls to OFFER-HUB. Configure CORS restrictively:

```typescript
// Only allow requests from your own frontend domain
app.use(cors({
  origin: ['https://your-marketplace.com'],
  methods: ['GET', 'POST', 'PUT'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
```

---

## Blockchain-Specific Attack Vectors

OFFER-HUB operates on the Stellar blockchain and uses Soroban smart contracts for escrow. Understand these attack vectors specific to blockchain payment orchestration.

### Replay Attacks

**What it is:** A signed Stellar transaction is intercepted and resubmitted to process the same payment twice.

**How OFFER-HUB mitigates it:** Stellar transactions include a sequence number tied to the source account. A transaction can only be processed once — replaying it will fail with `tx_bad_seq`.

**What you must do:** Use idempotency keys on all OFFER-HUB API calls. If a release call succeeds but your network connection drops before you receive the response, retrying with the same idempotency key returns the original result instead of triggering a second release.

```typescript
// Idempotency key must be deterministic per operation — not random per retry
const key = `release:${orderId}:${buyerId}`;
```

### Front-Running

**What it is:** An attacker monitors a pending transaction and submits a competing transaction with a higher fee to be processed first.

**Relevance to OFFER-HUB:** Stellar uses a FIFO queue within each ledger cycle, not a fee-priority auction like Ethereum. Front-running in the Ethereum sense is not applicable.

**Residual risk:** A malicious actor with Orchestrator database access could attempt to trigger a release before the buyer approves. Mitigation: enforce strict role-based access control on your Orchestrator deployment and enable database audit logging.

### Reentrancy (Soroban Contracts)

**What it is:** A contract function calls an external contract, which calls back into the original function before it finishes — leading to double-spending.

**Relevance to OFFER-HUB:** Trustless Work's Soroban contracts are designed to prevent reentrancy. The Orchestrator never calls back into itself during a transaction signing sequence.

**What you must do:** Do not build custom Soroban contract logic that interacts with the OFFER-HUB escrow contracts unless you have conducted a formal security audit of the reentrancy surface.

### Balance Desynchronization

**What it is:** OFFER-HUB's off-chain balance (PostgreSQL) diverges from the on-chain USDC balance (Stellar ledger). This can happen if a blockchain transaction is submitted but the database update fails, or vice versa.

**How to detect it:**

```typescript
// Periodically reconcile your critical accounts
async function reconcileBalance(userId: string) {
  const offChainBalance = await offerHubClient.balances.get(userId);
  const onChainBalance = await stellarHorizon.loadAccount(wallet.publicKey);

  const usdc = onChainBalance.balances.find(b => b.asset_code === 'USDC');

  if (Math.abs(parseFloat(usdc?.balance ?? '0') - parseFloat(offChainBalance.available)) > 0.001) {
    // Alert: balance mismatch — investigate before processing further transactions
    alertOpsTeam({ userId, offChain: offChainBalance.available, onChain: usdc?.balance });
  }
}
```

### Phishing via Fake Deposit Addresses

**What it is:** An attacker substitutes a legitimate deposit address with their own Stellar address, redirecting user deposits to themselves.

**Mitigation:** Always fetch the deposit address fresh from the Orchestrator API. Never cache it in a place users can influence.

```typescript
// ✅ Always fetch from the API — never from user-supplied input
const { data } = await offerHubClient.wallet.getDepositAddress(userId);
showToUser(data.address);
```

```typescript
// ❌ Never trust a deposit address from the request body
const depositAddress = req.body.depositAddress; // ❌ Attacker-controlled
```

---

## Related Documentation

- [API Contract](../standards/api-contract.md) — API response structure and error codes
- [Escrow Guide](./escrow.md) — Smart contract escrow mechanics
- [Wallets Guide](./wallets.md) — Invisible Stellar wallet system
- [Events Reference](./events-reference.md) — Webhook events and SSE
- [Errors & Troubleshooting](./errors-troubleshooting.md) — Error codes and debugging
