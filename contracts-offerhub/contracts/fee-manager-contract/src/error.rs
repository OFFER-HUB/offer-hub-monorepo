use soroban_sdk::{contracterror, Env, Symbol};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    Unauthorized = 3,
    InvalidAmount = 4,
    InvalidFeePercentage = 5,
    InsufficientBalance = 6,
    PremiumUserAlreadyExists = 7,
    PremiumUserNotFound = 8,
    InvalidFeeType = 9,
    FeeCalculationError = 10,
    WithdrawalFailed = 11,
}

pub fn handle_error(env: &Env, error: Error) -> ! {
    env.panic_with_error(error);
} 