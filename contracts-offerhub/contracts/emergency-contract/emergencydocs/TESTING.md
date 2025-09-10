# Testing Guide & Examples (Offer‑Hub Emergency Contract)

Example tests tailored to `emergency-contract/src/emergency.rs` using Soroban test harness patterns. Adapt to your test runner.

## Unit tests

- **Initialization**: `initialize(env, admin)` sets `emergency_admin` and defaults.
- **Pause/unpause**: admin can pause/unpause; non-admins revert with `UnauthorizedAccess`.
- **Circuit**: calling `trigger_circuit_breaker` increments `suspicious_activity_count` and sets pause when threshold reached.
- **Recovery**: `create_recovery_request` creates a request; `approve_recovery_request` records approvals; `emergency_fund_withdrawal` reduces `emergency_fund`.

## Example (Rust / Soroban test snippet)

```rust
#[test]
fn test_emergency_pause_and_recovery() {
    let env = Env::default();
    let contract_id = env.register_contract(None, EmergencyContract);
    env.as_contract(&contract_id, || {
        EmergencyContract::initialize(&env, admin_addr.clone());
        EmergencyContract::emergency_pause(&env);
        assert!(EmergencyContract::is_paused(&env));
        let req_id = EmergencyContract::create_recovery_request(&env, requester, 1000u128, symbol_short!("THEFT"));
        EmergencyContract::approve_recovery_request(&env, req_id);
        EmergencyContract::emergency_fund_withdrawal(&env, 500u128, recipient);
    });
}
```

## Negative tests

- Unauthorized `emergency_pause` calls revert with `UnauthorizedAccess`.
- `emergency_fund_withdrawal` with amount > `emergency_fund` reverts with `InsufficientEmergencyFunds`.
- Approving non-existent `request_id` reverts with `RecoveryRequestNotFound`.

## Property tests

- approvals are unique
- total recovered <= tracked `emergency_fund` cap

---

If you want I can convert these into concrete test files in the repo format used (e.g., create `tests/` Rust files) — paste where you want them.
