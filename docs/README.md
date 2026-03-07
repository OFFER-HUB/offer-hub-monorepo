# OFFER-HUB Documentation

Welcome to the OFFER-HUB documentation. This comprehensive guide covers all aspects of the project, from the Orchestrator API to the frontend architecture.

## Documentation Overview

OFFER-HUB documentation is organized in two locations:

| Location | Purpose | Format |
|----------|---------|--------|
| `/docs/` | Internal developer documentation | Markdown |
| `/content/docs/` | Public web documentation | MDX (rendered at offer-hub.tech) |

## Quick Start

1. **New to the project?** Start with [Project Context](./project-context.md)
2. **Setting up development?** Check [Developer Guide](./DEVELOPER-GUIDE.md)
3. **Contributing?** Read [Contributing Guide](./CONTRIBUTING.md)
4. **AI Assistant?** Read [AI Context](./ai-context.md) first

## Core Documentation

### Getting Started
- [Project Context](./project-context.md) - Complete system overview and mental model
- [AI Context](./ai-context.md) - Essential context for AI assistants
- [Developer Guide](./DEVELOPER-GUIDE.md) - Setup and development workflow
- [Contributing Guide](./CONTRIBUTING.md) - How to contribute to the project

### Architecture
- [System Overview](./architecture/overview.md) - System architecture and design philosophy
- [Data Model](./architecture/data-model.md) - Database schema and entity relationships
- [Payment Flows](./architecture/payment-flows.md) - Payment lifecycle and state machines
- [Provider Integration](./architecture/provider-integration.md) - External service integrations

### Guides (Internal)
- [Overview](./guides/overview.md) - Introduction to OFFER-HUB capabilities
- [Core Concepts](./guides/core-concepts.md) - Key concepts and terminology
- [Architecture](./guides/architecture.md) - Technical architecture guide
- [Standards](./guides/standards.md) - Code and API standards
- [Orders](./guides/orders.md) - Order lifecycle management
- [Escrow](./guides/escrow.md) - Smart contract escrow
- [Disputes](./guides/disputes.md) - Dispute resolution
- [Wallets](./guides/wallets.md) - Invisible wallet system
- [Deposits](./guides/deposits.md) - Funding user accounts
- [Withdrawals](./guides/withdrawals.md) - Moving funds off-platform
- [Events Reference](./guides/events-reference.md) - SSE and webhook events
- [Errors & Troubleshooting](./guides/errors-troubleshooting.md) - Error codes and solutions
- [Marketplace Integration](./guides/marketplace-integration.md) - Integration patterns
- [Deployment](./guides/deployment.md) - Production deployment
- [Scaling & Customization](./guides/scaling-customization.md) - Advanced configuration
- [AirTM Integration](./guides/airtm.md) - AirTM payment provider
- [NPM Packages](./guides/npm-packages.md) - SDK publishing

### Design System
- [Visual DNA](./design/visual-dna.md) - Complete design language and aesthetic principles
- [Neumorphism Guide](./design/neumorphism.md) - Shadow physics and elevation system
- [Color Palette](./design/color-palette.md) - Chromatic blueprint and semantic colors
- [Motion & Animation](./design/motion.md) - Animation standards and keyframes

### Standards
- [Naming Conventions](./standards/naming-conventions.md) - File, variable, and function naming rules
- [API Contract](./standards/api-contract.md) - API response structure and error handling

### Backend
- [API Design](./backend/api-design.md) - REST API design and endpoints
- [Modules Overview](./backend/modules.md) - Core modules and responsibilities

### Frontend
- [Architecture](./frontend/architecture.md) - Frontend structure and patterns

### Brand
- [Brand Guidelines](./brand/guidelines.md) - Brand identity and usage

### Business
- [Product Overview](./business/product-overview.md) - Product vision and value proposition
- [Use Cases](./business/use-cases.md) - Common marketplace scenarios
- [Glossary](./business/glossary.md) - Terminology and definitions

## Web Documentation (MDX)

The public-facing documentation is available in `/content/docs/` and rendered at [offer-hub.tech/docs](https://offer-hub.tech/docs).

### Getting Started
- [Introduction](/content/docs/getting-started.mdx) - What is OFFER-HUB
- [Installation](/content/docs/installation.mdx) - Setup and installation
- [Configuration](/content/docs/configuration.mdx) - Environment variables

### Guides
- [Quick Start](/content/docs/guide/quick-start.mdx) - First API call in 5 minutes
- [Orders](/content/docs/guide/orders.mdx) - Order lifecycle
- [Escrow](/content/docs/guide/escrow.mdx) - Smart contract escrow
- [Disputes](/content/docs/guide/disputes.mdx) - Dispute resolution
- [Wallets](/content/docs/guide/wallets.mdx) - Invisible wallet system
- [Deposits](/content/docs/guide/deposits.mdx) - Adding funds
- [Withdrawals](/content/docs/guide/withdrawals.mdx) - Withdrawing funds
- [Self-Hosting](/content/docs/guide/self-hosting.mdx) - Docker deployment
- [Multi-Currency](/content/docs/guide/multi-currency.mdx) - Currency support

### API Reference
- [API Overview](/content/docs/api-reference/overview.mdx) - REST API basics
- [Webhooks](/content/docs/api-reference/webhooks.mdx) - Event notifications
- [Interactive API](/content/docs/api-reference/interactive.mdx) - Try the API

### SDK
- [SDK Quick Start](/content/docs/sdk/quick-start.mdx) - TypeScript SDK

## Tech Stack

### Orchestrator (Backend)
| Technology | Version | Purpose |
|------------|---------|---------|
| NestJS | 10.x | Backend framework |
| Prisma | 5.x | Database ORM |
| PostgreSQL | 15+ | Primary database |
| Redis | 7+ | Caching, queues, rate limiting |
| BullMQ | 5.x | Background job processing |
| Stellar SDK | 12.x | Blockchain integration |

### Monorepo (Frontend)
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15+ | React framework |
| React | 19+ | UI library |
| Tailwind CSS | 3.4+ | Styling |
| Radix UI | Latest | Accessible components |
| Framer Motion | 11.x | Animations |

## Key Concepts

### Payment Flow
```
User deposits USDC → Creates order → Funds reserved
                                        ↓
                                   Escrow funded (on-chain)
                                        ↓
                                   Work delivered
                                        ↓
                               Release or Dispute
                                        ↓
                                   Funds transferred
```

### Balance Model
- **Available**: Can be used for orders or withdrawn
- **Reserved**: Locked for pending orders (before escrow funding)

### Authentication
- **API Keys**: Format `ohk_live_xxx` or `ohk_test_xxx`
- **Scopes**: `read`, `write`, `support`
- **NOT JWT**: API keys are stateless, no refresh tokens

### ID Prefixes
| Entity | Prefix | Example |
|--------|--------|---------|
| User | `usr_` | `usr_abc123` |
| Order | `ord_` | `ord_xyz789` |
| Withdrawal | `wth_` | `wth_def456` |
| API Key | `key_` | `key_ghi012` |
| Dispute | `dsp_` | `dsp_jkl345` |

## For AI Assistants

If you're an AI assistant working on this project:

1. **Read [AI Context](./ai-context.md)** first - contains critical project information
2. **Understand the dual-repo structure** - Orchestrator (backend) + Monorepo (frontend)
3. **API uses API Keys, NOT JWT** - Important for authentication code
4. **Neumorphic design system** - Follow the visual DNA guidelines
5. **State machines are strict** - Orders/escrow follow specific state transitions

## Contributing

When updating documentation:
- Keep language clear and technical
- Use code examples where applicable
- Update this index when adding new documents
- Maintain consistent formatting
- All documentation must be in English
- Web docs (MDX) must include frontmatter with title, description, order, section

## External Resources

- [Trustless Work](https://trustlesswork.com) - Escrow smart contracts
- [Stellar Docs](https://developers.stellar.org) - Blockchain documentation
- [Circle USDC](https://www.circle.com/usdc) - Stablecoin information
