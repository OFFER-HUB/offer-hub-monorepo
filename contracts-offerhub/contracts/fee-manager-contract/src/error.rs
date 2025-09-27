use soroban_sdk::{contracterror, Env};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,        // Contract has already been initialized
    NotInitialized = 2,            // Contract has not been initialized yet
    Unauthorized = 3,             // Caller is not authorized to perform this action
    InvalidAmount = 4,            // Amount provided is invalid (e.g., zero or negative)
    InvalidFeePercentage = 5,     // Fee percentage is outside valid range
    InsufficientBalance = 6,      // Account has insufficient balance for operation
    PremiumUserAlreadyExists = 7, // Premium user already registered
    PremiumUserNotFound = 8,      // Premium user not found in registry
    InvalidFeeType = 9,           // Fee type provided is not supported
    FeeCalculationError = 10,     // Error occurred during fee calculation
    WithdrawalFailed = 11,        // Withdrawal operation failed
    AlreadyPaused = 12,
    NotPaused = 13,
    ContractPaused = 14,
}

pub fn handle_error(env: &Env, error: Error) -> ! {
    env.panic_with_error(error);
}
