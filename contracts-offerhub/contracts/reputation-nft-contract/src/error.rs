use soroban_sdk::{contracterror, panic_with_error, Env};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum Error {
    /// Caller is not authorized to perform this operation
    Unauthorized = 1,
    
    /// The requested token does not exist
    TokenDoesNotExist = 2,
    
    /// Token with this ID already exists
    TokenAlreadyExists = 3,
    
    /// Address is already registered as a minter
    AlreadyMinter = 4,
    
    /// Address is not registered as a minter
    NotMinter = 5,

    AchievementPrerequisiteNotMet = 6,

    NonTransferableToken = 7,

    InvalidInput = 8,
    AlreadyPaused = 9,
    NotPaused = 10,
    ContractPaused = 11,
}