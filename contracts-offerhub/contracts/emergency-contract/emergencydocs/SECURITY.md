# Security Considerations

Principles:

- Least privilege: restrict who can call trigger/reset/payout functions
- Use multisig/governance for reset and execute operations
- Require quorum & timelock for recoveries (configurable)
- Keep event logs auditable and immutable

Incident playbook (brief):

1. Pause or trigger circuit.
2. Notify multisig and initiate recovery request.
3. Approvers sign on-chain.
4. After timelock/quorum, execute withdrawal to cold multisig.

Testing:

- Fuzz suspicious-activity counter, simulate spamming triggers.
- Test approval uniqueness and prevention of double execution.
