# Fund Recovery Process (Offer‑Hub Emergency Contract)

This canvas documents the step-by-step recovery workflow derived from `emergency-contract/src/emergency.rs`.

## Actors

- **Operator**: calls `create_recovery_request`
- **Approvers**: call `approve_recovery_request` (on-chain unique approvals)
- **Executor**: calls `emergency_fund_withdrawal` to move emergency funds to a safe recipient

## Steps

1. **Lock the system** (optional): call `emergency_pause()` or rely on `trigger_circuit_breaker()` to stop non-essential flows.
2. **Submit**: operator calls `create_recovery_request(user_address, amount, reason)` which returns `request_id`.
3. **Approve**: approvers call `approve_recovery_request(request_id)`; contract enforces unique approvals.
4. **Execute**: when approvals meet policy, `emergency_fund_withdrawal(amount, recipient)` is executed by authorized entity.
5. **Audit**: logs and `REQUESTS` storage provide an audit trail.

## Checks before withdrawal

- `request_id` exists & status appropriate
- `emergency_fund >= amount`
- caller authorized (admin/multisig)
- no double execution

---

Keep `maxRecoveryAmount` and `recoveryTimelock` in governance-controlled config to limit attacker blast radius.
