# Use Cases

This document outlines common marketplace scenarios and how OFFER-HUB handles them.

## Use Case 1: Freelance Platform

**Scenario:** A freelance marketplace connects clients with designers, developers, and writers.

### Requirements
- Clients deposit funds before hiring
- Funds held in escrow during project
- Milestone-based payments
- Dispute resolution for disagreements
- Freelancers withdraw earnings

### OFFER-HUB Implementation

**1. Client Deposits Funds**
```
Client sends USDC to their Stellar deposit address
→ BlockchainMonitor detects payment
→ Balance credited (available += $500)
```

**2. Client Creates Project Order**
```
POST /orders
{
  "buyerId": "client_123",
  "sellerId": "freelancer_456",
  "amount": 500,
  "milestones": [
    { "id": "m1", "description": "Design mockups", "amount": 200 },
    { "id": "m2", "description": "Final implementation", "amount": 300 }
  ]
}
→ Order created (status: CREATED)
```

**3. Reserve Funds**
```
POST /orders/{orderId}/reserve
→ Balance: available ($500) → reserved ($500)
→ Order status: RESERVED
```

**4. Create & Fund Escrow**
```
POST /escrow (create contract)
→ Trustless Work contract deployed
→ Order status: ESCROW_CREATED

POST /escrow/{escrowId}/fund (client signs)
→ $500 USDC transferred to escrow contract
→ Order status: IN_PROGRESS
```

**5. Freelancer Completes Milestone 1**
```
POST /resolution/release (freelancer: change milestone status)
→ Milestone m1 marked "completed"

POST /resolution/release (client: approve milestone)
→ Milestone m1 approved

POST /resolution/release (client: release funds)
→ $200 transferred to freelancer's balance
→ Freelancer balance: available += $200
```

**6. Freelancer Withdraws Earnings**
```
POST /withdrawals
{
  "userId": "freelancer_456",
  "amount": 200,
  "destination": "GXXXXX..." (external Stellar address)
}
→ USDC sent to freelancer's external wallet
```

---

## Use Case 2: E-Commerce Marketplace

**Scenario:** An e-commerce platform connects buyers with sellers of physical goods.

### Requirements
- Buyer pays upfront
- Funds held until delivery confirmed
- Automatic release after delivery window
- Refunds for non-delivery or defects

### OFFER-HUB Implementation

**1. Buyer Purchases Item**
```
POST /orders
{
  "buyerId": "buyer_789",
  "sellerId": "seller_012",
  "amount": 100,
  "description": "Handmade ceramic vase"
}
→ Reserve funds → Create escrow → Fund escrow
→ Order status: IN_PROGRESS
```

**2. Seller Ships Item**
```
Seller marks order as "shipped" in marketplace UI
→ Marketplace records tracking number
→ Delivery window: 7 days
```

**3a. Happy Path: Buyer Confirms Delivery**
```
Buyer confirms receipt in marketplace UI
→ Marketplace calls: POST /resolution/release
→ Funds released to seller
→ Order status: COMPLETED
```

**3b. Alternative: Automatic Release**
```
7 days pass without dispute
→ Marketplace automatically calls: POST /resolution/release
→ Funds released to seller
→ Order status: COMPLETED
```

**3c. Alternative: Buyer Opens Dispute**
```
Buyer reports item damaged
→ POST /disputes
→ Order status: DISPUTED
→ Support reviews evidence
→ POST /disputes/{disputeId}/resolve (refund to buyer)
→ Order status: REFUNDED
```

---

## Use Case 3: Service Marketplace

**Scenario:** A platform for booking local services (plumbing, cleaning, tutoring).

### Requirements
- Customer pays before service
- Service provider completes work
- Customer approves completion
- Dispute resolution for quality issues

### OFFER-HUB Implementation

**1. Customer Books Service**
```
POST /orders
{
  "buyerId": "customer_345",
  "sellerId": "plumber_678",
  "amount": 150,
  "description": "Fix kitchen sink leak"
}
→ Escrow funded
→ Order status: IN_PROGRESS
```

**2. Service Provider Completes Work**
```
POST /resolution/release (provider: change milestone status)
→ Milestone marked "completed"
```

**3a. Customer Approves**
```
POST /resolution/release (customer: approve + release)
→ $150 released to service provider
→ Order status: COMPLETED
```

**3b. Customer Disputes Quality**
```
POST /disputes
{
  "orderId": "ord_xxxxx",
  "reason": "Leak not fixed, still dripping"
}
→ Order status: DISPUTED
→ Support investigates
→ POST /disputes/{disputeId}/resolve (split: $75 to provider, $75 to customer)
→ Order status: COMPLETED
```

---

## Use Case 4: Gig Economy Platform

**Scenario:** A platform for quick tasks (delivery, errands, assembly).

### Requirements
- Fast payments (same-day)
- Low transaction fees
- High volume of small transactions
- Instant withdrawals

### OFFER-HUB Implementation

**1. Customer Posts Task**
```
POST /orders
{
  "buyerId": "customer_901",
  "sellerId": "tasker_234",
  "amount": 25,
  "description": "Deliver groceries"
}
→ Escrow funded
→ Order status: IN_PROGRESS
```

**2. Tasker Completes Task**
```
Tasker uploads photo proof
→ POST /resolution/release (tasker: change milestone status)
→ Customer auto-approves (or 1-hour window)
→ POST /resolution/release (customer: approve + release)
→ $25 released to tasker
```

**3. Tasker Withdraws Immediately**
```
POST /withdrawals
{
  "userId": "tasker_234",
  "amount": 25,
  "destination": "GXXXXX..."
}
→ USDC sent instantly to tasker's wallet
```

---

## Use Case 5: Subscription Platform

**Scenario:** A platform for recurring services (coaching, consulting, SaaS).

### Requirements
- Monthly recurring payments
- Escrow per billing cycle
- Cancel anytime
- Prorated refunds

### OFFER-HUB Implementation

**1. Customer Subscribes**
```
POST /orders (first month)
{
  "buyerId": "customer_567",
  "sellerId": "coach_890",
  "amount": 100,
  "description": "Monthly coaching - February 2026"
}
→ Escrow funded
→ Order status: IN_PROGRESS
```

**2. Month Completes**
```
POST /resolution/release
→ $100 released to coach
→ Order status: COMPLETED
```

**3. Next Month Auto-Renews**
```
Marketplace creates new order for March
→ POST /orders (amount: 100)
→ Escrow funded
```

**4. Customer Cancels Mid-Month**
```
Customer cancels on March 15 (50% through month)
→ POST /disputes/{disputeId}/resolve (split: $50 to coach, $50 to customer)
→ Subscription cancelled
```

---

## Use Case 6: Crowdfunding Platform

**Scenario:** A platform for funding creative projects.

### Requirements
- Collect funds from multiple backers
- Hold funds until project goal met
- Release to creator if successful
- Refund backers if goal not met

### OFFER-HUB Implementation

**1. Backers Pledge Funds**
```
Each backer creates an order:
POST /orders
{
  "buyerId": "backer_123",
  "sellerId": "creator_456",
  "amount": 50,
  "description": "Pledge for Project X"
}
→ Funds escrowed per backer
```

**2a. Goal Met: Release to Creator**
```
For each backer's order:
POST /resolution/release
→ Funds released to creator
→ Creator receives total pledges
```

**2b. Goal Not Met: Refund Backers**
```
For each backer's order:
POST /resolution/refund
→ Funds returned to backer
```

---

## Common Patterns

### Pattern 1: Milestone-Based Release
```
1. Create order with multiple milestones
2. For each milestone:
   - Seller completes work
   - Buyer approves
   - Funds released incrementally
```

### Pattern 2: Automatic Release
```
1. Create order with delivery window
2. If no dispute within window:
   - Automatically release funds
```

### Pattern 3: Dispute Resolution
```
1. Either party opens dispute
2. Support reviews evidence
3. Resolve with release, refund, or split
```

### Pattern 4: Instant Withdrawal
```
1. Funds released to seller
2. Seller immediately withdraws to external wallet
```

---

## Integration Examples

### SDK Usage

```typescript
import { OfferHubClient } from '@offerhub/sdk';

const client = new OfferHubClient({
  apiKey: process.env.OFFERHUB_API_KEY,
  baseUrl: 'https://orchestrator.marketplace.com',
});

// Create order
const order = await client.orders.create({
  buyerId: 'usr_123',
  sellerId: 'usr_456',
  amount: 100,
  description: 'Web design project',
});

// Reserve funds
await client.orders.reserve(order.id);

// Create and fund escrow
const escrow = await client.escrow.create({ orderId: order.id });
await client.escrow.fund(escrow.id);

// Release funds
await client.resolution.release({
  orderId: order.id,
  milestoneId: 'm1',
});
```

---

**Next Steps:**
- Review [Product Overview](./product-overview.md) for features
- See [Glossary](./glossary.md) for terminology
- Check [API Design](../backend/api-design.md) for endpoint details
