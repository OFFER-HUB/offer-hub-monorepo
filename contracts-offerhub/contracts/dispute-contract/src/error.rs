use soroban_sdk::{contracterror, panic_with_error, Env};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,         // Contract has already been initialized
    NotInitialized = 2,             // Contract must be initialized before use
    Unauthorized = 3,               // Caller lacks permission for this operation
    DisputeAlreadyExists = 4,       // A dispute already exists for this transaction
    DisputeNotFound = 5,            // No dispute found with the given ID
    DisputeAlreadyResolved = 6,    // Cannot modify a resolved dispute
    InvalidArbitrator = 7,          // Provided arbitrator address is invalid
    DisputeTimeout = 8,             // Dispute resolution period has expired
    InvalidDisputeLevel = 9,        // Invalid escalation level (must be mediation or arbitration)
    EvidenceNotFound = 10,          // No evidence found for the specified dispute
    InvalidTimeout = 11,            // Timeout value must be within allowed range
    EscrowIntegrationFailed = 12,   // Failed to interact with escrow contract
    RateLimitExceeded = 13,         // Too many dispute actions in short period
    MediationRequired = 14,         // Must attempt mediation before arbitration
    ArbitrationRequired = 15,       // Dispute requires arbitration to proceed
    InvalidAddress = 16,            // InvalidAddress
    InvalidMediator = 17,           // InvalidMediator
    InvalidOutcome = 18,            // InvalidOutcome
    AlreadyPaused = 19,
    NotPaused = 20,
    ContractPaused = 21,
}

pub fn handle_error(env: &Env, error: Error) -> ! {
    panic_with_error!(env, error);
}
