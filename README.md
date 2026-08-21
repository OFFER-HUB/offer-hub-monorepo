# OFFER-HUB Orchestrator

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-20.x-green?style=for-the-badge&logo=node.js" alt="Node.js 20" />
  <img src="https://img.shields.io/badge/TypeScript-5.4-blue?style=for-the-badge&logo=typescript" alt="TS 5.4" />
  <img src="https://img.shields.io/badge/NestJS-10.x-red?style=for-the-badge&logo=nestjs" alt="NestJS 10" />
  <img src="https://img.shields.io/badge/Prisma-5.x-teal?style=for-the-badge&logo=prisma" alt="Prisma 5" />
  <img src="https://img.shields.io/badge/Stellar-Wallet-black?style=for-the-badge&logo=stellar" alt="Stellar" />
</p>

```
 ██████╗ ███████╗███████╗███████╗██████╗       ██╗  ██╗██╗   ██╗██████╗
██╔═══██╗██╔════╝██╔════╝██╔════╝██╔══██╗      ██║  ██║██║   ██║██╔══██╗
██║   ██║█████╗  █████╗  █████╗  ██████╔╝█████╗███████║██║   ██║██████╔╝
██║   ██║██╔══╝  ██╔══╝  ██╔══╝  ██╔══██╗╚════╝██╔══██║██║   ██║██╔══██╗
╚██████╔╝██║     ██║     ███████╗██║  ██║      ██║  ██║╚██████╔╝██████╔╝
 ╚═════╝ ╚═╝     ╚═╝     ╚══════╝╚═╝  ╚═╝      ╚═╝  ╚═╝ ╚═════╝ ╚═════╝ 

--------------- Marketplaces Orchestrator & Freelance Platform ---------------
```

**OFFER-HUB Orchestrator** is a self-hosted payments orchestration system designed for Marketplaces. It manages a Web2-like experience (balances, top-ups, payments with escrow, and withdrawals) using **Airtm** for fund management and **Trustless Work** for non-custodial escrows on the Stellar network.

##  Features

- 💰 **User Balances**: Internal management of available and reserved balances.
- ⚡ **Top-ups**: Fast reloads via Airtm.
- 🤝 **Smart Escrow**: Secure checkout with non-custodial escrow via TW.
- 💸 **Withdrawals**: Direct withdrawals to Airtm accounts.
- 🔐 **Secure & Audited**: Native idempotency, audit logs, and modular architecture.

## 🛠️ Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) (API Server)
- **Runtime**: Node.js 20 LTS
- **Database**: PostgreSQL (via Prisma ORM)
- **Cache & Queues**: Redis + [BullMQ](https://docs.bullmq.io/)
- **Monorepo**: npm Workspaces

## 🏁 Quick Start

1. **Clone and Prepare**:
   ```bash
   git clone https://github.com/your-org/OFFER-HUB-Orchestrator.git
   cd OFFER-HUB-Orchestrator
   cp .env.example .env
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Generate Database Client**:
   ```bash
   npm run prisma:generate
   ```

4. **Start Infrastructure (Optional)**:
   If you don't have local Postgres/Redis, use Docker:
   ```bash
   docker compose up -d
   ```

5. **Run in Development**:
   You can start both the API and the Worker concurrently:
   ```bash
   npm run dev
   ```
   *Note: This starts the API on port 4000 and the Worker in the same terminal.*

## 🏗️ Project Structure

```
offer-hub-monorepo/
├── src/              # Next.js frontend (this app: marketing site + docs website)
├── backend/          # Standalone Express backend (own package.json, installed separately)
├── mcp/              # Standalone MCP server exposing docs/ + content/docs/ to AI assistants
│                     # (own package.json; not an npm workspace — run `npm install` inside mcp/)
├── content/docs/     # Public docs website content (MDX, rendered at offer-hub.tech/docs)
├── docs/             # Internal engineering documentation (Markdown, read on GitHub)
├── config/           # Shared app-level config (e.g. security headers)
├── scripts/          # Build/codegen scripts (OpenAPI, docs search index)
└── supabase/         # Supabase schema/config
```

The root `package.json` has no `workspaces` field, so `npm install` at the
repo root only installs the frontend's dependencies. `backend/` and `mcp/`
are independent packages — each has its own `package.json` and needs its
own `npm install` (see [`mcp/README.md`](./mcp/README.md) for the MCP
server's setup and usage).

## 📚 Documentation

Comprehensive documentation is available in the [`/docs`](./docs/) folder:

### Quick Start
- 🧠 **[AI Context](./docs/ai-context.md)** - Development guide for AI assistants (Read first!)
- 📖 **[Main Documentation](./docs/README.md)** - Complete documentation index

### Core Documentation
- 📐 [Architecture Overview](./docs/architecture/overview.md) - System architecture
- 📋 [Product Overview](./docs/business/product-overview.md) - Vision, goals, and value proposition
- 📚 [Use Cases](./docs/business/use-cases.md) - Common marketplace scenarios

### Development
- 💻 [Naming Conventions](./docs/standards/naming-conventions.md) - File, variable, and function naming rules
- 🔌 [API Design](./docs/backend/api-design.md) - Backend API patterns
- 🤝 [Contributing Guide](./docs/CONTRIBUTING.md) - How to contribute

## 🎯 Use Cases

### Freelance Marketplace (Primary)
Connect freelancers with clients using escrow protection:
1. Client tops up balance via Airtm
2. Client pays for project → funds go to escrow (Trustless Work)
3. Freelancer completes work
4. Client approves → funds released instantly to freelancer
5. Freelancer withdraws to Airtm

### Other Marketplaces
- **E-commerce**: Buyer/seller escrow with delivery confirmation
- **Service Marketplaces**: Service booking with payment protection
- **Digital Goods**: Instant or escrow-based delivery
- **Gig Economy**: Worker/client escrow with job completion

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for detailed guidelines.

### Quick Contribution Guide

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### 🧪 Tests

The frontend suite runs on Vitest. A plain `npm ci` is enough — no `.env` file,
no credentials, and no network access are required.

```bash
npm run test          # run the suite once
npm run test:watch    # re-run affected tests as you edit
npm run test:coverage # run the suite and enforce coverage thresholds
```

Tests live in `__tests__/` folders beside the code they cover. CI runs
`npm run lint`, `npm run build` and `npm run test:coverage`, and fails when
coverage drops below the thresholds in `vitest.config.ts`. See the
[Testing section of the contribution guide](./docs/CONTRIBUTING.md#testing)
for conventions and what is expected of a PR.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🆘 Support

- **Documentation**: [/docs](./docs/)
- **Issues**: [GitHub Issues](https://github.com/your-org/OFFER-HUB-Orchestrator/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/OFFER-HUB-Orchestrator/discussions)

## 👥 Maintainers

- [@Josue19-08](https://github.com/Josue19-08) - Project Lead & Full-Stack Developer
- [@KevinMB0220](https://github.com/KevinMB0220) - Core Contributor & Developer

## 🙏 Acknowledgments

Built with ❤️ for the decentralized marketplace future.

- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [BullMQ](https://docs.bullmq.io/) - Premium message queue
- [Airtm](https://www.airtm.com/) - Payment infrastructure
- [Trustless Work](https://trustlesswork.com/) - Non-custodial escrow on Stellar

---

<p align="center">
  <i>🚀 Empowering marketplaces with trustless payments 🚀</i>
</p>

---
