# Emergency Contract — Public API (Offer-Hub)

This document lists the public functions found in emergency-contract/src/emergency.rs
and shows short usage examples (Soroban CLI + JS).

Public functions (exact names):

1. initialize(env, admin: Address)
   - Purpose: initialize contract state and set emergency_admin.
   - Soroban CLI (after deploy):
     soroban contract invoke --wasm <WASM> --id <CONTRACT_ID> -- --initialize <ADMIN_ADDRESS>
   - Example (JS / pseudo):
     await client.invokeContract(contractId, 'initialize', [adminAddress], {source: adminAddress});

2. emergency_pause(env)
   - Purpose: set paused = true (admin only).
   - CLI:
     soroban contract invoke --wasm <WASM> --id <CONTRACT_ID> -- --emergency_pause
     (use --source-account or equivalent to sign as admin)
   - JS:
     await client.invokeContract(contractId, 'emergency_pause', [], {source: adminAddress});

3. emergency_unpause(env)
   - Purpose: clear paused (admin only).
   - CLI:
     soroban contract invoke --wasm <WASM> --id <CONTRACT_ID> -- --emergency_unpause

4. is_paused(env) -> bool
   - Purpose: view helper
   - CLI (view):
     soroban contract invoke --wasm <WASM> --id <CONTRACT_ID> -- --is_paused

5. trigger_circuit_breaker(env)
   - Purpose: increment suspicious_activity_count and trigger pause/circuit on threshold
   - CLI:
     soroban contract invoke --wasm <WASM> --id <CONTRACT_ID> -- --trigger_circuit_breaker

6. reset_circuit_breaker(env)
   - Purpose: reset counters and clear circuit; governance/multisig only
   - CLI:
     soroban contract invoke --wasm <WASM> --id <CONTRACT_ID> -- --reset_circuit_breaker

7. create_recovery_request(env, user_address: Address, amount: u128, reason: Symbol) -> u32
   - Purpose: create a RecoveryRequest, return request_id
   - CLI:
     soroban contract invoke --wasm <WASM> --id <CONTRACT_ID> -- --create_recovery_request <USER_ADDR> <AMOUNT> <REASON>

8. approve_recovery_request(env, request_id: u32)
   - Purpose: record approver; ensure uniqueness
   - CLI:
     soroban contract invoke --wasm <WASM> --id <CONTRACT_ID> -- --approve_recovery_request <REQUEST_ID>

9. emergency_fund_withdrawal(env, amount: u128, recipient: Address)
   - Purpose: execute emergency funds transfer (authorized executor / multisig)
   - CLI:
     soroban contract invoke --wasm <WASM> --id <CONTRACT_ID> -- --emergency_fund_withdrawal <AMOUNT> <RECIPIENT>

10. add_emergency_contact(env, contact: Address)
    - Purpose: register an emergency contact address
    - CLI:
      soroban contract invoke --wasm <WASM> --id <CONTRACT_ID> -- --add_emergency_contact <CONTACT_ADDR>

11. get_emergency_state(env) -> EmergencyState
    - Purpose: read full EmergencyState snapshot
    - CLI:
      soroban contract invoke --wasm <WASM> --id <CONTRACT_ID> -- --get_emergency_state

Events / logs:

- log_emergency_action(action_symbol, admin, timestamp) — used internally for PAUSE/CIRCUIT/etc.
- The contract also emits logs for recovery requests (create/approve/execute) — scan logs for audit.

Notes:

- CLI invocation arguments after `--` map to function names and positional args.
- Some commands require a signer (`--source-account` or equivalent) depending on your soroban-cli version.
