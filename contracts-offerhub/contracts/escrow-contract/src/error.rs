use soroban_sdk::{contracterror, panic_with_error, Env};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    Unauthorized = 3,
    InvalidAmount = 4,
    InsufficientFunds = 5,
    InvalidStatus = 6,
    DisputeNotOpen = 7,
    InvalidDisputeResult = 8,
    MilestoneNotFound = 9,
    RateLimitExceeded = 10,
    UnexpectedError = 11,
    InvalidTimestamp = 12,
    TimestampTooOld = 13,
    AlreadyPaused = 14,
    NotPaused = 15,
    ContractPaused = 16,
    
}

pub fn handle_error(env: &Env, error: Error) -> ! {
    panic_with_error!(env, error);
}
