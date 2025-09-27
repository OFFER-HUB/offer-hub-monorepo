use soroban_sdk::{contracterror};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum Error {
     /// Contract has already been initialized
    AlreadyInitialized = 1,
    /// Contract has not been initialized
    NotInitialized = 2,
    /// Caller is not authorized to perform this action
    Unauthorized = 3,
    /// User is already registered in the system
    AlreadyRegistered = 4,
    /// User account not found
    UserNotFound = 5,
    /// User is already on the blacklist
    AlreadyBlacklisted = 6,
    /// User is not on the blacklist
    NotBlacklisted = 7,
    /// Invalid verification level provided
    InvalidVerificationLevel = 8,
    /// User verification has expired
    VerificationExpired = 9,
    /// Cannot blacklist admin accounts
    CannotBlacklistAdmin = 10,
    /// Cannot blacklist moderator accounts
    CannotBlacklistModerator = 11,
    /// User profile is not published
    ProfileNotPublished = 12,
    /// Rate limit exceeded for this operation
    RateLimitExceeded = 13,
    /// User profile is already published
    ProfileAlreadyPublished = 14,
    /// Validation check failed
    ValidationFailed = 15,
    /// Invalid data provided for validation
    InvalidValidationData = 16,
    /// An unexpected error occurred
    UnexpectedError = 17,
    AlreadyPaused = 18,
    NotPaused = 19,
    ContractPaused = 20,
}