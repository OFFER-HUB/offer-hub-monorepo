# Deployment & Initial Configuration

Deployment guidance for the Soroban/Rust Emergency Contract in Offer‑Hub.

## Pre-deploy checklist

- Choose `governance` multisig address
- Set initial `emergency_admin` (multisig recommended)
- Determine `circuit_breaker_threshold` and `initial emergency_fund`

## Example deploy (soroban CLI / pseudo)

```bash
# build and deploy
soroban build
soroban deploy --wasm target/wasm32-unknown-unknown/release/emergency_contract.wasm
# call initialize with admin address
soroban invoke --wasm emergency_contract.wasm --func initialize --arg <admin_address>
```

## Post-deploy configuration

- Add emergency contacts using `add_emergency_contact`.
- Wire emergency contract id into dependent services if they require a reference.

## Testing & Staging

- Deploy to a testnet or local Soroban sandbox and run the full test suite in `emergency-contract/test_snapshots/`.

## Notes

- Use multisig for any privileged admin change. Keep emergency config under governance control.
