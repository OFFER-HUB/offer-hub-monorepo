# Developer Guide

Complete guide for developers working with OFFER-HUB.

## Overview

OFFER-HUB is a self-hosted payment and escrow system for marketplaces. It consists of two main components:

1. **Orchestrator (Backend)** - RESTful API on port **4000** (NestJS)
   - Handles user balances, USDC escrow on Stellar (via Trustless Work), and withdrawals
   - Server-to-server: your backend calls it with an API key

2. **Monorepo (Frontend)** - Next.js web application
   - Marketing site, documentation, and user dashboard
   - Modern neumorphic design system

Components:
- **API** - RESTful API on port **4000** (NestJS)
- **SDK** - TypeScript SDK for easy integration (`@offerhub/sdk`)
- **Worker** - Background jobs integrated into the API (BullMQ + Redis)
- **Database** - PostgreSQL with Prisma ORM (Supabase recommended)
- **Frontend** - Next.js 15+ with App Router

---

## Documentation Structure

### For Marketplace Developers (Start Here)

1. **[Marketplace Integration Guide](./guides/marketplace-integration.md)** - Complete guide: prerequisites, quick start, all flow guides with curl + SDK examples
2. **[SDK Integration Guide](./sdk/integration-guide.md)** - Detailed SDK usage
3. **[API Documentation](./api/overview.md)** - REST API endpoints and reference
4. **[Error Handling](./api/errors.md)** - Understanding and handling errors

### For Operators & Admins

1. **[CLI Quick Reference](./cli/quick-reference.md)** - Command-line tool usage
2. **[Deployment Guide](./deployment/README.md)** - Production deployment
3. **[Environment Variables](./deployment/env-variables.md)** - Configuration reference

### For Contributors

1. **[Architecture Overview](./architecture/overview.md)** - System architecture
2. **[State Machines](./architecture/state-machines.md)** - Order and payment flows
3. **[Contributing Guide](./CONTRIBUTING.md)** - How to contribute
4. **[AI Context](./ai-context.md)** - Development with AI assistance

---

## Quick Start

### 1. Development Setup

```bash
# Clone repository
git clone https://github.com/OFFER-HUB/offer-hub-monorepo.git
cd offer-hub-monorepo

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Start development server
npm run dev
```

### 2. Using the SDK

```typescript
import { OfferHubSDK } from '@offerhub/sdk';

const sdk = new OfferHubSDK({
  apiUrl: 'http://localhost:4000',
  apiKey: process.env.OFFERHUB_API_KEY
});

// Create a user
const user = await sdk.users.create({
  externalUserId: 'user_123',
  email: 'user@example.com',
  type: 'BUYER'
});

// Create an order
const order = await sdk.orders.create({
  buyer_id: user.id,
  seller_id: 'usr_seller',
  amount: '100.00',
  title: 'Logo Design'
});
```

### 3. Using the CLI

```bash
# Configure CLI
offerhub config set

# Create API key
offerhub keys create --user-id usr_admin --scopes read,write

# Enable maintenance mode
offerhub maintenance enable --message "Upgrading database"
```

---

## Architecture

### System Components

```
+---------------------------------------------------------+
|                    Marketplace App                       |
|              (Your Frontend Application)                 |
+--------------------+------------------------------------+
                     |
                     | Uses SDK
                     v
+---------------------------------------------------------+
|                  @offerhub/sdk                           |
|            (TypeScript SDK Package)                      |
+--------------------+------------------------------------+
                     |
                     | HTTP/REST
                     v
+---------------------------------------------------------+
|                   OfferHub API                           |
|         (NestJS REST API + Background Jobs)              |
+---------------------------------------------------------+
|  - Auth & Security                                       |
|  - Order Management                                      |
|  - Balance Operations                                    |
|  - Escrow Contracts                                      |
|  - Dispute Resolution                                    |
|  - Background Jobs (BullMQ)                              |
+----+-------------+----------------+---------------------+
     |             |                |
     v             v                v
+---------+  +-------------+  +-----------------------+
|PostgreSQL|  |    Redis    |  |  External Providers   |
| (Prisma)|  |   (Cache +  |  |  - Trustless Work     |
|         |  |    Queue)   |  |    (Blockchain)       |
|         |  |             |  |  - Stellar Network    |
+---------+  +-------------+  +-----------------------+
```

### Order Flow

```
1. Create Order        -> ORDER_CREATED
2. Reserve Funds       -> FUNDS_RESERVED
3. Create Escrow       -> ESCROW_CREATED
4. Fund Escrow         -> ESCROW_FUNDED
5. Complete Milestones -> IN_PROGRESS
6. Release/Refund      -> COMPLETED/RELEASED/REFUNDED
```

See [State Machines](./architecture/state-machines.md) for detailed flows.

---

## Development Workflow

### Making Changes

1. **Create a Branch**
   ```bash
   git checkout -b feat/your-feature
   ```

2. **Make Changes**
   - Follow [AI Context](./ai-context.md) standards
   - Write tests for new features
   - Update documentation

3. **Build & Test**
   ```bash
   npm run build
   npm run lint
   ```

4. **Commit**
   ```bash
   git add .
   git commit -m "feat(api): add new feature"
   ```

5. **Push & Create PR**
   ```bash
   git push -u origin feat/your-feature
   gh pr create
   ```

### Project Structure

```
offer-hub-monorepo/
├── src/
│   ├── app/           # Next.js App Router pages
│   ├── components/    # React components
│   ├── lib/           # Utilities and helpers
│   ├── data/          # Mock data and static content
│   └── types/         # TypeScript types
├── content/docs/      # MDX documentation for web
├── docs/              # Technical documentation
├── public/            # Static assets
└── backend/           # Backend utilities (if any)
```

---

## Publishing

### SDK to NPM

See [Publishing Guide](./sdk/publishing-guide.md) for detailed instructions.

Quick version:
```bash
cd packages/sdk
npm version patch  # or minor, major
npm publish --access public
```

---

## Testing

### Unit Tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

### Build Verification

```bash
npm run build
```

---

## Debugging

### API Debugging

```bash
# Enable debug logs
DEBUG=offerhub:* npm run dev

# Or in your .env
LOG_LEVEL=debug
```

### SDK Debugging

The SDK automatically retries failed requests. To debug:

```typescript
const sdk = new OfferHubSDK({
  apiUrl: 'http://localhost:4000',
  apiKey: process.env.OFFERHUB_API_KEY,
  timeout: 60000,        // Increase timeout
  retryAttempts: 0,      // Disable retries for debugging
});
```

---

## Security

### API Keys

- Never commit API keys to git
- Use environment variables
- Rotate keys regularly
- Use scoped keys (read/write/support)

### Best Practices

1. **Always use HTTPS** in production
2. **Validate user input** on the server
3. **Implement rate limiting** (built-in)
4. **Monitor for suspicious activity**
5. **Keep dependencies updated**

---

## Monitoring

### Health Checks

```bash
# API health
curl http://localhost:4000/health

# CLI check
offerhub maintenance status
```

### Logging

All operations are logged with structured JSON:

```json
{
  "level": "info",
  "timestamp": "2026-02-05T12:00:00.000Z",
  "message": "Order created",
  "orderId": "ord_abc123",
  "userId": "usr_buyer123"
}
```

---

## Support

### Documentation

- [Full Documentation](./README.md)
- [API Reference](./api/overview.md)
- [SDK Guide](./sdk/integration-guide.md)
- [CLI Guide](./cli/quick-reference.md)

### Community

- [GitHub Issues](https://github.com/OFFER-HUB/offer-hub-monorepo/issues)
- [GitHub Discussions](https://github.com/OFFER-HUB/offer-hub-monorepo/discussions)

---

## License

MIT License - see [LICENSE](../LICENSE) for details.

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Areas for Contribution

- Bug fixes
- New features
- Documentation improvements
- Test coverage
- Translations
- UI/UX improvements

---

## Roadmap

See [ROADMAP.md](../ROADMAP.md) for planned features and progress.

### Completed

- Phase 0-8: Core functionality
- SDK implementation
- CLI tool
- Crypto-native provider

### In Progress

- Phase 9: Final polish & QA
- Production deployment guide
- Installer script
