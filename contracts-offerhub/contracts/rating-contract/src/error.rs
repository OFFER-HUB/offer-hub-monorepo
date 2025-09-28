use soroban_sdk::{contracterror, panic_with_error, Env};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    /// Caller is not authorized to perform this operation
    Unauthorized = 1,
    /// Rating value must be between 1 and 5
    InvalidRating = 2,
    /// User has already rated this contract
    AlreadyRated = 3,
    /// Contract being rated does not exist
    ContractNotFound = 4,
    /// Contract requires minimum number of ratings before aggregation
    InsufficientRatings = 5,
    /// User is restricted from rating due to low reputation
    RatingRestricted = 6,
    /// Feedback or rating entry not found
    FeedbackNotFound = 7,
    /// Invalid moderation action type provided
    InvalidModerationAction = 8,
    /// Rating threshold configuration not found
    ThresholdNotFound = 9,
    /// Incentive reward not found or not available
    IncentiveNotFound = 10,
    /// User has already claimed this incentive reward
    IncentiveAlreadyClaimed = 11,
    /// Reputation contract address not configured
    ReputationContractNotSet = 12,
    /// Address is already registered as a moderator
    AlreadyModerator = 13,
    /// Address is not a registered moderator
    NotModerator = 14,
    /// Rate limit exceeded, try again later
    RateLimitExceeded = 15,
    InvalidTimestamp = 16, 
    
    TimestampTooOld = 17, 
    NoRatingsFound = 18,
    AlreadyPaused = 19,
    NotPaused = 20,
    ContractPaused = 21,
}
