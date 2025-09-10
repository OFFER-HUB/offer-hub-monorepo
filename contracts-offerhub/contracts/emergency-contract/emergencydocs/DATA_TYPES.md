# Data Types

EmergencyState (fields exact from contract):

- is_paused: bool
- emergency_admin: Address
- circuit_breaker_threshold: u32
- suspicious_activity_count: u32
- emergency_fund: u128
- emergency_contacts: Vec<Address>
- last_emergency_check: u64

EmergencyAction (logging struct):

- action_type: Symbol (PAUSE/UNPAUSE/CIRCUIT)
- timestamp: u64
- admin_address: Address

RecoveryRequest (on-chain struct):

- request_id: u32
- user_address: Address
- amount: u128
- reason: Symbol
- status: Symbol {PENDING, APPROVED, REJECTED, EXECUTED}
- timestamp: u64

EmergencyError enum (source variants):

- ContractPaused
- UnauthorizedAccess
- InvalidEmergencyAction
- RecoveryRequestNotFound
- InsufficientEmergencyFunds
- CircuitBreakerTriggered
