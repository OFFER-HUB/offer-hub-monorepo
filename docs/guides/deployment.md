# Deployment Guide

> How to self-host the OFFER-HUB Orchestrator: infrastructure, environment variables, migrations, and production security.

---

## Table of Contents

- [Requirements](#requirements)
- [Infrastructure Setup](#infrastructure-setup)
  - [Database (PostgreSQL)](#database-postgresql)
  - [Redis](#redis)
  - [Node.js Host](#nodejs-host)
- [Step-by-Step Deployment](#step-by-step-deployment)
- [Environment Variables](#environment-variables)
- [Running Database Migrations](#running-database-migrations)
- [Creating the First API Key](#creating-the-first-api-key)
- [Health Check](#health-check)
- [Production Security Checklist](#production-security-checklist)
- [Multi-Instance Deployment](#multi-instance-deployment)
- [Environment-Specific Configuration](#environment-specific-configuration)
- [Monitoring & Observability](#monitoring--observability)
- [Updates & Maintenance](#updates--maintenance)

---

## Requirements

| Dependency | Minimum Version | Recommended |
|-----------|----------------|-------------|
| Node.js | 18.x | 20.x LTS |
| PostgreSQL | 14 | Supabase (managed) |
| Redis | 6.x | Upstash (serverless) |
| npm | 8.x | 10.x |

---

## Infrastructure Setup

### Database (PostgreSQL)

**Recommended: Supabase**

1. Create a project at [supabase.com](https://supabase.com)
2. Go to Project Settings → Database
3. Copy the **Connection String** (Prisma format):
   - Direct connection (port 5432): for migrations and Prisma client
   - Pooler connection (port 6543): for high-concurrency API usage

```env
# Use direct for migrations
DIRECT_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres

# Use pooler for API (high concurrency)
DATABASE_URL=postgresql://postgres:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

> **Important:** Prisma migrations MUST use the direct connection (port 5432), not the pooler.

**Alternative providers:** Railway, Neon, PlanetScale (PostgreSQL-compatible), or self-hosted.

---

### Redis

**Recommended: Upstash**

1. Create a database at [upstash.com](https://upstash.com) (free tier available)
2. Copy the Redis URL from the dashboard

```env
REDIS_URL=redis://default:xxx@us1-xxx.upstash.io:6379
```

**With TLS (production recommended):**
```env
REDIS_URL=rediss://default:xxx@us1-xxx.upstash.io:6379
```

**Alternative providers:** Railway Redis, Redis Cloud, AWS ElastiCache, or self-hosted.

---

### Node.js Host

| Option | Notes |
|--------|-------|
| Railway | Simple deploy from git, env vars UI, PostgreSQL + Redis available |
| Render | Free tier available, auto-deploy from GitHub |
| Fly.io | Global edge deployment, requires Dockerfile |
| DigitalOcean App Platform | Managed Node.js |
| AWS EC2 / GCP Compute | Manual setup, full control |
| VPS (Hetzner, Vultr) | Cheapest, requires manual setup |

Minimum specs: 1 vCPU, 512 MB RAM (development); 2 vCPU, 2 GB RAM (production).

---

## Step-by-Step Deployment

### 1. Clone the repository

```bash
git clone https://github.com/OFFER-HUB/OFFER-HUB.git
cd OFFER-HUB
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example:
```bash
cp .env.example .env
```

Edit `.env` with your values (see [Environment Variables](#environment-variables) below).

Quick reference for `PAYMENT_PROVIDER=crypto` (default):

| Variable | Description |
|---|---|
| `DATABASE_URL` | Postgres pooler URL (port 6543 for Supabase) |
| `DIRECT_URL` | Postgres direct URL (port 5432 — for migrations) |
| `REDIS_URL` | Redis connection URL |
| `WALLET_ENCRYPTION_KEY` | 32-byte hex key for AES-256-GCM |
| `OFFERHUB_MASTER_KEY` | Master API key for bootstrapping marketplace keys |
| `TRUSTLESS_API_KEY` | Trustless Work API key |
| `TRUSTLESS_WEBHOOK_SECRET` | Webhook secret from Trustless Work dashboard |
| `PUBLIC_BASE_URL` | Public HTTPS URL of this instance |

### 4. Run database migrations

```bash
npm run prisma:migrate
```

> This must use DIRECT_URL (port 5432). See [Running Database Migrations](#running-database-migrations).

### 5. Bootstrap the platform user

The Orchestrator requires a dedicated platform user whose Stellar wallet serves as `disputeResolver` and `platformAddress` in all escrow contracts.

Run once after migrations (idempotent — safe to run again):

```bash
npm run bootstrap
```

Expected output:

```
🚀 OFFER-HUB Orchestrator Bootstrap

Creating platform user...
  ✓ Platform user created: usr_xxxxxxxxxxxx
Generating Stellar wallet...
  ✓ Wallet created: GXXXXXXXXXXXXXXXX
Setting up testnet funding + USDC trustline...
  ✓ Testnet account funded
  ✓ USDC trustline established

✅ Bootstrap complete!

─────────────────────────────────────────────
PLATFORM_USER_ID=usr_xxxxxxxxxxxx
─────────────────────────────────────────────
```

Copy the `PLATFORM_USER_ID=...` line into your `.env` file.

> **Idempotent**: Running `npm run bootstrap` again will detect the existing platform user and print its ID without creating a duplicate.

### 6. Build

```bash
npm run build
```

### 7. Start

```bash
# Direct
node apps/api/dist/main.js

# With pm2 (recommended for production)
pm2 start apps/api/dist/main.js --name offerhub-api

# Development (hot-reload)
npm run dev
```

Startup logs confirm readiness:

```
[Bootstrap] Platform user validated: usr_xxx (wallet: GXXX...)
[BlockchainMonitor] Starting monitor for N wallets
[Shutdown] Graceful shutdown handler registered
API listening on port 4000
```

### 8. Create the first API key

```bash
curl -X POST http://your-domain/api/v1/auth/api-keys \
  -H "Authorization: Bearer $OFFERHUB_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Production Key",
    "scopes": ["read", "write", "support"]
  }'
```

---

## Environment Variables

### Required for All Modes

```env
# Server
NODE_ENV=production
PORT=4000
LOG_LEVEL=warn

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require

# Redis
REDIS_URL=rediss://:password@host:6379

# Auth
OFFERHUB_MASTER_KEY=<long-random-secret>

# Payment Provider (crypto or airtm)
PAYMENT_PROVIDER=crypto

# Trustless Work
TRUSTLESS_API_KEY=<your-tw-api-key>
TRUSTLESS_WEBHOOK_SECRET=<your-tw-webhook-secret>

# Platform Identity
PLATFORM_USER_ID=  # Run: npm run bootstrap → outputs the value to paste here

# Public URL (for callbacks)
PUBLIC_BASE_URL=https://your-orchestrator-domain.com
```

### Required for Crypto Mode (`PAYMENT_PROVIDER=crypto`)

```env
WALLET_ENCRYPTION_KEY=<64-hex-chars>  # 32 random bytes as hex
STELLAR_NETWORK=mainnet               # or testnet for development
```

Generate encryption key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Required for AirTM Mode (`PAYMENT_PROVIDER=airtm`)

```env
AIRTM_ENV=prod              # sandbox or prod
AIRTM_API_KEY=<ak_xxx>
AIRTM_API_SECRET=<as_xxx>
AIRTM_WEBHOOK_SECRET=<whs_xxx>
```

---

## Running Database Migrations

```bash
# Development (auto-migrate with shadow DB)
npm run prisma:migrate

# Production (apply pending migrations)
npx prisma migrate deploy

# Check migration status
npx prisma migrate status
```

**Always use DIRECT_URL (port 5432) for migrations**, never the pooler:

```bash
# Explicit for CI/CD
DATABASE_URL="postgresql://postgres:pass@db.xxx.supabase.co:5432/postgres" \
DIRECT_URL="postgresql://postgres:pass@db.xxx.supabase.co:5432/postgres" \
npx prisma migrate deploy
```

---

## Creating the First API Key

The `OFFERHUB_MASTER_KEY` is a bootstrap key only — use it once to create a proper API key:

```bash
# Create admin key
curl -X POST https://your-orchestrator.com/api/v1/auth/api-keys \
  -H "Authorization: Bearer $OFFERHUB_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Backend Service Key",
    "scopes": ["read", "write", "support"]
  }'

# Response:
# { "success": true, "data": { "key": "ohk_live_...", "id": "key_..." } }
```

**Save the key securely** — it's only shown once. Store it in your marketplace backend's environment variables.

After creating the key, the `OFFERHUB_MASTER_KEY` should be rotated periodically.

---

## Health Check

```bash
GET /api/v1/health
```

**Response:**
```json
{
  "status": "ok",
  "version": "1.0.0",
  "database": "connected",
  "redis": "connected"
}
```

Use this endpoint for load balancer health checks and uptime monitoring.

---

## Production Security Checklist

### Secrets

- [ ] `OFFERHUB_MASTER_KEY` is a long random secret (not a memorable password)
- [ ] `WALLET_ENCRYPTION_KEY` is a fresh 32-byte random hex value
- [ ] `WALLET_ENCRYPTION_KEY` is backed up in at least 2 secure locations (not the DB)
- [ ] `TRUSTLESS_WEBHOOK_SECRET` and `AIRTM_WEBHOOK_SECRET` are set
- [ ] No `.env` file committed to git
- [ ] Secrets stored in platform secrets manager (Railway Variables, Render Env, AWS Secrets Manager)

### Network

- [ ] API is behind HTTPS (TLS termination at load balancer or reverse proxy)
- [ ] `DATABASE_URL` uses `?sslmode=require`
- [ ] Redis uses TLS (`rediss://` protocol)
- [ ] Firewall only exposes port 4000 (or load balancer port) publicly
- [ ] `PUBLIC_BASE_URL` is HTTPS only

### Operations

- [ ] `NODE_ENV=production` is set
- [ ] `LOG_LEVEL=warn` or `error` (don't log debug in production)
- [ ] `STELLAR_NETWORK=mainnet` is set for production
- [ ] Rate limiting is configured (built-in NestJS Throttler)
- [ ] API key is rotated if any team member leaves
- [ ] `BlockchainMonitorService` singleton guard is in place for multi-instance

### Mainnet

- [ ] `STELLAR_NETWORK=mainnet`
- [ ] `STELLAR_HORIZON_URL=https://horizon.stellar.org`
- [ ] `STELLAR_USDC_ISSUER` set to Circle mainnet issuer
- [ ] `TRUSTLESS_API_URL=https://api.trustlesswork.com`
- [ ] Platform wallet manually funded with XLM + USDC trustline

### Backup

- [ ] PostgreSQL backups enabled (Supabase includes this)
- [ ] Encryption key backed up separately from DB
- [ ] Disaster recovery plan documented

---

## Multi-Instance Deployment

When running multiple API instances behind a load balancer:

1. **API instances** — run as many as needed (stateless)
2. **BullMQ workers** — run as many as needed (Redis-backed)
3. **BlockchainMonitorService** — run on EXACTLY ONE instance

Configure all instances except one:
```env
DISABLE_BLOCKCHAIN_MONITOR=true
```

Designate one "monitor instance" without this flag. Use a separate process or dedicated instance for reliability.

**Example docker-compose for multi-instance:**
```yaml
services:
  api-1:
    image: offerhub-api
    environment:
      - DISABLE_BLOCKCHAIN_MONITOR=true

  api-2:
    image: offerhub-api
    environment:
      - DISABLE_BLOCKCHAIN_MONITOR=true

  api-monitor:
    image: offerhub-api
    # No DISABLE_BLOCKCHAIN_MONITOR — this one runs the monitor
```

---

## Environment-Specific Configuration

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| `NODE_ENV` | `development` | `staging` | `production` |
| `STELLAR_NETWORK` | `testnet` | `testnet` | `mainnet` |
| `LOG_LEVEL` | `debug` | `info` | `warn` |
| `DATABASE_URL` | Supabase free/local | Supabase Pro | Supabase Pro/Enterprise |
| `PAYMENT_PROVIDER` | `crypto` | `crypto` | `crypto` or `airtm` |
| `PUBLIC_BASE_URL` | `http://localhost:4000` | `https://staging.yourapp.com` | `https://api.yourapp.com` |

---

## Monitoring & Observability

### Logs

The Orchestrator uses structured JSON logging. Pipe to your log aggregator (Datadog, Logtail, Papertrail):

```bash
# pm2 with log rotation
pm2 start apps/api/dist/main.js --name offerhub-api --log-date-format "YYYY-MM-DD HH:mm:ss"

# Pipe to aggregator
node apps/api/dist/main.js 2>&1 | your-log-aggregator
```

### Key Metrics to Monitor

| Metric | Alert Threshold |
|--------|----------------|
| API response time P99 | > 3s |
| Error rate (5xx) | > 1% |
| BullMQ queue depth | > 100 jobs |
| Redis memory usage | > 80% |
| DB connection pool | > 80% |
| `BlockchainMonitorService` running | = 0 instances |

### Events for Ops Monitoring

Subscribe to these events for operational awareness:
- `withdrawal.failed` — investigate Stellar/AirTM issue
- `provider_error` — check Trustless Work status
- Any pattern of `INVALID_STATE` errors — possible integration bug

---

## Updates & Maintenance

### Updating the Orchestrator

```bash
git pull origin main
npm install
npm run build
npx prisma migrate deploy  # Apply new migrations
pm2 restart offerhub-api   # Zero-downtime restart (use rolling update with load balancer)
```

### Database Maintenance

```bash
# Check pending migrations
npx prisma migrate status

# View current schema
npx prisma studio  # Opens visual DB browser
```

---

## Related Guides

- [Environment Variables](../deployment/env-variables.md) — Complete variable reference
- [Wallets](./wallets.md) — WALLET_ENCRYPTION_KEY importance
- [Architecture](./architecture.md) — Component overview
- [Scaling & Customization](./scaling-customization.md) — Horizontal scaling guide
