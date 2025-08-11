use soroban_sdk::{contracterror, contracttype, Address};

#[contracttype]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum DisputeOutcome {
    None,
    FavorFreelancer,
    FavorClient,
    Split,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct DisputeData {
    pub initiator: Address,
    pub reason: soroban_sdk::String,
    pub timestamp: u64,
    pub resolved: bool,
    pub outcome: DisputeOutcome,
    pub fee_manager: Address, // Fee manager contract address
    pub dispute_amount: i128, // Amount in dispute
    pub fee_collected: i128,  // Fee collected for dispute resolution
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    Unauthorized = 3,
    DisputeAlreadyExists = 4,
    DisputeNotFound = 5,
    DisputeAlreadyResolved = 6,
}
