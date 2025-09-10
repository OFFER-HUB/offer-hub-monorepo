# Circuit Breaker Flow Diagram

```mermaid
flowchart TD
  A[ACTIVE] -->|emergency_pause()| B[PAUSED]
  B -->|emergency_unpause()| A
  A -->|trigger_circuit_breaker()| C[CIRCUIT_OPEN]
  B -->|trigger_circuit_breaker()| C
  C -->|reset_circuit_breaker()| A
  C -->|create_recovery_request()| D[RECOVERING]
  D -->|approve_recovery_request()| D
  D -->|emergency_fund_withdrawal()| A
  D -->|fail| C
```
