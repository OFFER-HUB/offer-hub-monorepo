# Dispute Resolution Contract

A comprehensive smart contract for handling disputes in the OfferHub platform, featuring multi-level resolution, evidence management, and escrow integration.

## Features

### ✅ Completed Features

1. **Arbitrator Authorization Validation**
   - Secure arbitrator management with validation
   - Admin-controlled arbitrator addition/removal
   - Mediator access management

2. **Dispute Timeout Mechanism**
   - Automatic resolution after configurable timeout
   - Default split outcome on timeout
   - Configurable timeout duration

3. **Arbitrator Management Functions**
   - Add/remove arbitrators with admin control
   - Arbitrator data tracking (name, cases, success rate)
   - Active/inactive arbitrator status

4. **Escalation Levels**
   - Mediation → Arbitration escalation
   - Level-based authorization checks
   - Proper status transitions

5. **Evidence Attachment Support**
   - Evidence submission with descriptions
   - IPFS hash support for attachments
   - Timestamped evidence tracking

6. **Comprehensive Event Emission**
   - All major actions emit events
   - Detailed event data for tracking
   - Audit trail support

7. **Unit Tests**
   - Complete test coverage for all functions
   - Edge case testing
   - Authorization testing

### 🔧 Implementation Details

#### Direct Escrow Integration

The contract integrates directly with the escrow contract for fund release:

```rust
// Escrow integration constants
const ESCROW_RESOLVE_DISPUTE: &str = "resolve_dispute";
const ESCROW_CLIENT_WINS: &str = "client_wins";
const ESCROW_FREELANCER_WINS: &str = "freelancer_wins";
const ESCROW_SPLIT: &str = "split";
```

When a dispute is resolved, the contract automatically calls the escrow contract to release funds based on the decision.

#### Backward Compatibility

The contract maintains backward compatibility with existing interfaces while providing enhanced functionality:

- Original `resolve_dispute` function preserved
- New `resolve_dispute_with_auth` function for production use
- All existing function signatures maintained

## Contract Functions

### Core Functions

#### `initialize(admin, default_timeout, escrow_contract, fee_manager)`

Initializes the dispute resolution contract.

#### `open_dispute(job_id, initiator, reason, escrow_contract, dispute_amount)`

Opens a new dispute for a job.

#### `resolve_dispute(job_id, decision)`

Resolves a dispute (backward compatible version).

#### `resolve_dispute_with_auth(job_id, decision, caller)`

Resolves a dispute with explicit caller authorization (production version).

### Mediation Functions

#### `assign_mediator(job_id, admin, mediator)`

Assigns a mediator to a dispute.

#### `escalate_to_arbitration(job_id, mediator, arbitrator)`

Escalates a dispute from mediation to arbitration.

### Evidence Management

#### `add_evidence(job_id, submitter, description, attachment_hash)`

Adds evidence to a dispute.

#### `get_dispute_evidence(job_id)`

Retrieves all evidence for a dispute.

### Arbitrator Management

#### `add_arbitrator(admin, arbitrator, name)`

Adds a new arbitrator to the system.

#### `remove_arbitrator(admin, arbitrator)`

Removes an arbitrator from the system.

#### `add_mediator_access(admin, mediator)`

Grants mediator access to an address.

#### `remove_mediator_access(admin, mediator)`

Revokes mediator access from an address.

### Utility Functions

#### `get_dispute(job_id)`

Retrieves dispute data.

#### `check_timeout(job_id)`

Checks if a dispute has timed out.

#### `set_dispute_timeout(admin, timeout_seconds)`

Sets the default dispute timeout.

## Data Structures

### DisputeData

```rust
pub struct DisputeData {
    pub initiator: Address,
    pub reason: String,
    pub timestamp: u64,
    pub resolved: bool,
    pub outcome: DisputeOutcome,
    pub status: DisputeStatus,
    pub level: DisputeLevel,
    pub fee_manager: Address,
    pub dispute_amount: i128,
    pub fee_collected: i128,
    pub escrow_contract: Option<Address>,
    pub timeout_timestamp: Option<u64>,
    pub evidence: Vec<Evidence>,
    pub mediator: Option<Address>,
    pub arbitrator: Option<Address>,
    pub resolution_timestamp: Option<u64>,
}
```

### DisputeOutcome

```rust
pub enum DisputeOutcome {
    None,
    FavorFreelancer,
    FavorClient,
    Split,
}
```

### DisputeStatus

```rust
pub enum DisputeStatus {
    Open,
    UnderMediation,
    UnderArbitration,
    Resolved,
    Timeout,
}
```

## Usage Examples

### Opening a Dispute

```rust
// Open a dispute
client.open_dispute(
    &job_id,
    &initiator,
    &reason,
    &Some(escrow_contract),
    &dispute_amount
);
```

### Assigning a Mediator

```rust
// Add mediator to system
client.add_mediator_access(&admin, &mediator);

// Assign mediator to dispute
client.assign_mediator(&job_id, &admin, &mediator);
```

### Escalating to Arbitration

```rust
// Add arbitrator to system
client.add_arbitrator(&admin, &arbitrator, &name);

// Escalate dispute
client.escalate_to_arbitration(&job_id, &mediator, &arbitrator);
```

### Resolving a Dispute

```rust
// Resolve dispute (backward compatible)
client.resolve_dispute(&job_id, &DisputeOutcome::FavorClient);

// Resolve dispute with auth (production)
client.resolve_dispute_with_auth(&job_id, &DisputeOutcome::FavorClient, &arbitrator);
```

## Testing

Run the test suite:

```bash
cargo test --package dispute-contract
```

The test suite includes:

- Basic functionality tests
- Authorization tests
- Edge case tests
- Timeout mechanism tests

## Security Considerations

1. **Authorization**: All critical functions require proper authorization
2. **Timeout Protection**: Automatic resolution prevents indefinite disputes
3. **Escrow Integration**: Secure fund release through escrow contract
4. **Evidence Tracking**: Immutable evidence trail for audit purposes
5. **Admin Controls**: Restricted arbitrator/mediator management

## Future Enhancements

1. **Multi-signature Resolution**: Require multiple arbitrators for high-value disputes
2. **Reputation System**: Track arbitrator performance and success rates
3. **Automated Evidence Validation**: IPFS integration for evidence verification
4. **Dispute Categories**: Specialized handling for different dispute types
5. **Integration with External Oracles**: Real-world data integration for complex disputes

## License

This contract is part of the OfferHub platform and is subject to the project's licensing terms.
