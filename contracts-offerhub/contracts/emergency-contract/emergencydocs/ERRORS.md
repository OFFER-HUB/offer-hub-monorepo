# Error Codes & Meanings

Map contract enum to monitoring codes:

1001 — ContractPaused (operation forbidden due to pause)
1002 — UnauthorizedAccess (caller not admin)
1003 — InvalidEmergencyAction (invalid action attempted)
1004 — RecoveryRequestNotFound (bad request id)
1005 — InsufficientEmergencyFunds (not enough emergency fund)
1006 — CircuitBreakerTriggered (circuit open, operations blocked)

Tests and monitoring should map Rust enum values to these codes for consistent triage.
