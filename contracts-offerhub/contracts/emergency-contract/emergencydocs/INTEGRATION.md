# Integration Examples

Treasury/escrow guard (Rust pseudo):
if EmergencyContract::is_paused(&env) {
env.panic_with_error(EmergencyError::ContractPaused);
}

Marketplace (prevent releases):
let state = EmergencyContract::get_emergency_state(&env);
if state.is_paused || state.suspicious_activity_count >= state.circuit_breaker_threshold {
env.panic_with_error(EmergencyError::CircuitBreakerTriggered);
}

Governance:

- Only governance/multisig should call reset_circuit_breaker() and emergency_fund_withdrawal()
- Wire `emergency_contract_id` into dependent contract storage for runtime checks

Off-chain monitoring:

- Subscribe to logs emitted by `log_emergency_action` and recovery events.
