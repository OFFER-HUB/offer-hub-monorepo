# Scaling & Customization Guide

> How to scale the Orchestrator horizontally, extend it with new features, and modify existing flows — including what NOT to touch.

---

## Scaling

### What Scales Horizontally

The Orchestrator is designed for horizontal scaling. You can run multiple API instances behind a load balancer:

| Component | Scales horizontally? | Notes |
|-----------|---------------------|-------|
| `apps/api` (NestJS) | ✅ Yes | Stateless — all state in DB + Redis |
| BullMQ workers | ✅ Yes | Redis-backed queue, safe to run multiple |
| `BlockchainMonitorService` | ⚠️ Careful | Each instance opens SSE streams for all wallets; run only one instance |
| PostgreSQL (Supabase) | ✅ Yes | Use read replicas for heavy reads |
| Redis | ✅ Yes | Cluster mode supported |

### Recommended Infrastructure by Load

**Small marketplace (< 1k orders/day):**
- 1 API instance (2 vCPU, 2 GB RAM)
- Supabase Free/Pro
- Upstash Redis

**Medium marketplace (1k–50k orders/day):**
- 2–4 API instances behind a load balancer
- Supabase Pro with connection pooling (use `DATABASE_URL` pooler for API, `DIRECT_URL` direct for migrations)
- Redis with persistence enabled
- Separate `BlockchainMonitorService` instance (env `DISABLE_BLOCKCHAIN_MONITOR=true` on other instances)

**Large marketplace (50k+ orders/day):**
- 8+ API instances
- Supabase Enterprise or self-hosted PostgreSQL with PgBouncer
- Redis Cluster
- Dedicated worker process for BullMQ jobs

### Keeping BlockchainMonitorService as a Singleton

When running multiple API instances, only one should run `BlockchainMonitorService` to avoid duplicate payments being processed.

#### Why Only One Monitor Instance?

`BlockchainMonitorService` opens a persistent Horizon SSE stream per wallet. If two instances both monitor the same wallet:

- Each instance emits its own `balance.credited` event for the same deposit.
- Even with in-memory deduplication (`processedTxHashes`), the set is per-process — a tx hash seen by instance A is not known to instance B.
- This causes double-crediting user balances.

The `ProcessedTransaction` table provides persistent DB-level deduplication as a safety net, but the recommended practice is still to run the monitor on exactly one instance.

#### Setup

Add this env var to all instances except one:

```env
DISABLE_BLOCKCHAIN_MONITOR=true
```

| Instance Role | `DISABLE_BLOCKCHAIN_MONITOR` | Description |
|---|---|---|
| **Monitor instance** (1 only) | not set / `false` | Runs the Horizon SSE streams |
| **API instances** (N) | `true` | Handle HTTP requests only |

Then guard it in [blockchain-monitor.service.ts](../../apps/api/src/modules/wallet/blockchain-monitor.service.ts):

```typescript
async onModuleInit() {
  if (process.env.DISABLE_BLOCKCHAIN_MONITOR === 'true') return;
  await this.startMonitoringAllWallets();
}
```

When the monitor is disabled, startup logs will show:

```
[BlockchainMonitor] Monitoring DISABLED via env var
```

### Graceful Shutdown

The Orchestrator registers `SIGTERM` and `SIGINT` handlers on startup. When the process receives a signal (e.g., from Kubernetes during a rolling deploy or Railway restart):

1. **HTTP server stops** accepting new requests.
2. **In-flight requests** are given time to complete (NestJS `app.close()`).
3. **BullMQ workers** finish their current job before stopping.
4. **Horizon SSE streams** are closed via `BlockchainMonitorService.onModuleDestroy()`.
5. Process exits cleanly with code `0`.

If shutdown takes longer than **30 seconds**, the process force-exits with code `1` to prevent indefinite hangs.

Startup confirms registration with:

```
[Shutdown] Graceful shutdown handler registered
```

#### Kubernetes Example

```yaml
spec:
  terminationGracePeriodSeconds: 35  # > 30s app timeout
  containers:
    - name: orchestrator-api
      lifecycle:
        preStop:
          exec:
            command: ["/bin/sh", "-c", "sleep 2"]  # Allow LB to drain
```

### Redis / BullMQ

All instances share the same Redis instance. BullMQ workers process jobs from shared queues — this is safe for horizontal scaling because BullMQ uses atomic job locking. No additional configuration is needed.

### Database Connections

Use **PgBouncer** (pooler URL port 6543) for HTTP instances to avoid exhausting Postgres connection limits. The monitor instance can also use the pooler — it only makes periodic `findMany` calls on startup.

For Prisma migrations, always use the direct URL (port 5432):

```bash
DIRECT_URL=postgres://USER:PASSWORD@HOST:5432/postgres
```

---

## Extending the Project

### Adding a New Endpoint

1. Create a DTO in `apps/api/src/modules/<domain>/dto/`
2. Add the handler in the controller
3. Add business logic in the service
4. Emit a domain event via `EventBusService`
5. Add the route to the module's `controllers` array
6. Document it in `docs/api/endpoints/<domain>.md`

Pattern example from the codebase:
```typescript
// Controller
@Post('my-action')
@HttpCode(HttpStatus.OK)
async myAction(@Param('id') id: string, @Body() dto: MyDto) {
  const result = await this.myService.myAction(id, dto);
  return { success: true, data: result };
}

// Service
async myAction(id: string, dto: MyDto): Promise<MyEntity> {
  // business logic
  this.eventBus.emit({ eventType: EVENT_CATALOG.MY_EVENT, ... });
  return result;
}
```

### Adding a New Event Type

1. Add the event name to `apps/api/src/modules/events/event-catalog.ts`
2. Emit it via `EventBusService.emit()`
3. Add it to `docs/events/catalog.md`

### Adding a New Payment Provider

The `PaymentProvider` interface is in [apps/api/src/providers/payment/payment-provider.interface.ts](../../apps/api/src/providers/payment/payment-provider.interface.ts).

Implement all methods:

```typescript
export interface PaymentProvider {
  initializeUser(userId: string): Promise<PaymentUserInfo>;
  isUserReady(userId: string): Promise<boolean>;
  getBalance(userId: string): Promise<string>;
  getDepositInfo(userId: string): Promise<DepositInfo>;
  signEscrowTransaction(userId: string, xdr: string): Promise<string>;
  sendPayment(userId: string, destination: string, amount: string): Promise<PaymentResult>;
}
```

Steps:
1. Create `apps/api/src/providers/payment/my-provider.provider.ts` implementing `PaymentProvider`
2. Register it in `apps/api/src/providers/payment/payment-provider.module.ts` using the existing factory pattern
3. Add `my-provider` as a valid value for `PAYMENT_PROVIDER` in the factory switch
4. Add the required env vars to `docs/deployment/env-variables.md`
5. Document the new deposit/withdrawal flows in `docs/api/endpoints/`

Reference implementation: [CryptoNativeProvider](../../apps/api/src/providers/payment/crypto-native.provider.ts)

### Modifying Order States

The order state machine is enforced in [apps/api/src/modules/orders/orders.service.ts](../../apps/api/src/modules/orders/orders.service.ts).

When adding a new state:
1. Add it to the `OrderStatus` enum in `packages/database/prisma/schema.prisma`
2. Run `npm run prisma:migrate`
3. Add the transition guard in `orders.service.ts`
4. Update the state diagram in `docs/architecture/state-machines.md`
5. Add the corresponding event to `event-catalog.ts`

### Modifying Dispute Resolution

The resolution flow lives in `apps/api/src/modules/resolution/resolution.service.ts`. The key methods are `resolveDispute()`, `requestRelease()`, and `requestRefund()`.

All three call Trustless Work on-chain APIs (`EscrowClient`). When modifying:
- Always test on testnet first (`STELLAR_NETWORK=testnet`)
- Transaction failures must trigger balance rollback — follow the existing try/catch + rollback pattern
- Never modify `ResolutionDecision` enum values without a DB migration

---

## What NOT to Modify

These parts of the codebase are critical. Change them only after fully understanding the implications:

| File/Module | Risk | Why |
|-------------|------|-----|
| `apps/api/src/utils/crypto.ts` | 🔴 Critical | AES-256-GCM encrypt/decrypt for wallet private keys. Any change could make all existing wallets unrecoverable. |
| `packages/database/prisma/schema.prisma` (balance fields) | 🔴 Critical | `available`, `reserved` — any direct modification bypasses business rules. Always use `BalanceService` methods. |
| `apps/api/src/modules/resolution/resolution.service.ts` (balance ops) | 🔴 Critical | Balance debit/credit must be atomic with state transitions. Never update balance separately. |
| `apps/api/src/providers/trustless-work/` | 🟡 High | Direct Stellar blockchain integration. Test thoroughly on testnet before mainnet. |
| `apps/api/src/modules/wallet/wallet.service.ts` (key management) | 🔴 Critical | Handles encrypted private key storage/retrieval. Bugs = lost funds. |
| `apps/api/src/guards/api-key.guard.ts` | 🟡 High | Auth guard. Weakening it exposes all endpoints. |

### The Balance Golden Rule

**Never update balances directly via Prisma.** Always call `BalanceService` methods:

```typescript
// ❌ Never do this
await prisma.balance.update({ where: { userId }, data: { available: newValue } });

// ✅ Always do this
await this.balanceService.credit(userId, amount, 'reason');
await this.balanceService.debit(userId, amount, 'reason');
await this.balanceService.reserve(userId, amount);
await this.balanceService.release(userId, amount);
```

`BalanceService` enforces: atomicity, minimum balance checks, event emission, and audit logging.

---

## Related Docs

- [Deployment Guide](./deployment.md)
- [Environment Variables](../deployment/env-variables.md)
- [Crypto-Native Setup](../deployment/crypto-native-setup.md)
- [Security Hardening](../deployment/security-hardening.md)
- [Payment Provider Interface](../crypto-native/provider-interface.md)
- [Marketplace Integration Guide](./marketplace-integration.md)
