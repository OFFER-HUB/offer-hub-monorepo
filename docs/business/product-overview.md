# Product Overview

## Vision

OFFER-HUB empowers marketplaces to provide secure, non-custodial escrow payments without the complexity of building payment infrastructure from scratch.

## Problem Statement

Marketplaces face significant challenges when implementing payment systems:

1. **Complex Integration:** Integrating multiple payment providers (crypto, fiat, escrow) is time-consuming
2. **Custodial Risk:** Holding user funds creates regulatory and security burdens
3. **Escrow Complexity:** Building secure escrow logic requires blockchain expertise
4. **Multi-Provider Management:** Managing Stellar, Trustless Work, and Airtm separately is complex

## Solution

OFFER-HUB provides a **self-hosted payments orchestrator** that:

- **Orchestrates** user balances, orders, and escrow workflows
- **Integrates** with Trustless Work (escrow), Stellar (crypto), and Airtm (fiat)
- **Abstracts** provider complexity behind a simple REST API
- **Ensures** non-custodial security (funds in smart contracts, not the orchestrator)

## Key Features

### 1. Self-Hosted Architecture
Each marketplace runs its own Orchestrator instance—no centralized SaaS, full control over data and infrastructure.

### 2. Non-Custodial Escrow
Funds are locked in Trustless Work smart contracts on Stellar. The Orchestrator coordinates but never holds escrow funds.

### 3. Per-User Balances
Each user has their own balance (Stellar wallet or Airtm account), not pooled marketplace funds.

### 4. Provider Abstraction
Switch between crypto-native (Stellar + USDC) and fiat (Airtm) via configuration, without changing business logic.

### 5. Complete Payment Lifecycle
- **Deposits:** USDC to Stellar wallet or fiat via Airtm
- **Orders:** Create, reserve funds, escrow
- **Escrow:** Fund, release, refund, dispute resolution
- **Withdrawals:** USDC to external address or fiat via Airtm

### 6. Idempotency & Reliability
All mutations require `Idempotency-Key` for safe retries. Webhooks, retries, and reconciliation ensure reliability.

### 7. Real-Time Events
Server-Sent Events (SSE) stream for real-time updates on orders, balances, and escrow.

### 8. Audit Trail
Immutable audit logs for all state-changing actions, with correlation IDs for traceability.

## Target Users

### Primary: Marketplace Operators
- Freelance platforms (Upwork, Fiverr alternatives)
- E-commerce marketplaces (Etsy, eBay alternatives)
- Service marketplaces (TaskRabbit, Thumbtack alternatives)
- Gig economy platforms

### Secondary: Developers
- Backend developers integrating payment systems
- Blockchain developers building marketplace dApps
- Product teams evaluating payment solutions

## Value Proposition

| Traditional Approach | OFFER-HUB |
|:---------------------|:----------|
| Build payment infrastructure from scratch | Integrate via REST API in days |
| Hold user funds (custodial) | Non-custodial (funds in smart contracts) |
| Manage multiple providers separately | Single API for all payment operations |
| Custom escrow logic | Proven Trustless Work integration |
| Regulatory burden of holding funds | Reduced burden (non-custodial) |
| Months of development | Days to integrate |

## Use Cases

See [Use Cases](./use-cases.md) for detailed scenarios.

## Competitive Advantages

1. **Self-Hosted:** Full control, no vendor lock-in
2. **Non-Custodial:** Reduced regulatory burden, increased trust
3. **Provider-Agnostic:** Switch between crypto and fiat seamlessly
4. **Open Source:** Transparent, auditable, customizable
5. **Battle-Tested:** Built on proven technologies (Stellar, Trustless Work)

## Roadmap

### Phase 1: Crypto-Native (Current)
- ✅ Stellar wallet management
- ✅ Trustless Work escrow integration
- ✅ Order lifecycle and state machines
- ✅ Balance tracking and reconciliation
- ✅ Dispute resolution

### Phase 2: Airtm Integration (Future)
- ⏳ Airtm top-ups (fiat on-ramp)
- ⏳ Airtm withdrawals (fiat off-ramp)
- ⏳ Hybrid mode (crypto + fiat)

### Phase 3: Advanced Features (Future)
- ⏳ Multi-currency support (EUR, GBP, etc.)
- ⏳ Recurring payments
- ⏳ Subscription management
- ⏳ Advanced analytics dashboard

## Getting Started

1. **Deploy Orchestrator:** Self-host on your infrastructure
2. **Configure Providers:** Set up Trustless Work and Stellar credentials
3. **Integrate SDK:** Use `@offerhub/sdk` or direct REST API
4. **Test:** Use testnet for development and testing
5. **Go Live:** Switch to mainnet for production

## Support

- **Documentation:** [docs/](../README.md)
- **GitHub:** [github.com/offerhub/orchestrator](https://github.com)
- **Community:** [Discord/Slack]
- **Email:** support@offerhub.com

---

**Next Steps:**
- Review [Use Cases](./use-cases.md) for detailed scenarios
- See [Glossary](./glossary.md) for terminology
- Check [Architecture Overview](../architecture/overview.md) for technical details
