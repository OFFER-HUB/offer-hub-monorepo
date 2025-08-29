use soroban_sdk::{Address, Env, String, Vec};
use crate::types::{Error, VerificationLevel};

// Validation constants
const MAX_METADATA_LENGTH: u32 = 500;
const MIN_EXPIRATION_DURATION: u64 = 86400; // 1 day
const MAX_EXPIRATION_DURATION: u64 = 31_536_000; // 1 year
const MAX_BULK_USERS: u32 = 100; // Maximum users in bulk operations

/// Validate metadata string
pub fn validate_metadata(metadata: &String) -> Result<(), Error> {
    let len = metadata.len();
    if len > MAX_METADATA_LENGTH {
        return Err(Error::ValidationFailed);
    }
    Ok(())
}

/// Validate verification level
pub fn validate_verification_level(level: &VerificationLevel) -> Result<(), Error> {
    match level {
        VerificationLevel::Basic | 
        VerificationLevel::Premium | 
        VerificationLevel::Enterprise => Ok(()),
        // Add any invalid cases if needed
    }
}

/// Validate expiration timestamp
pub fn validate_expiration(env: &Env, expires_at: u64) -> Result<(), Error> {
    if expires_at == 0 {
        return Ok(()); // 0 means no expiration
    }
    
    let current_time = env.ledger().timestamp();
    
    // Check if expiration is in the past
    if expires_at <= current_time {
        return Err(Error::ValidationFailed);
    }
    
    // Check if expiration is too far in the future
    let duration = expires_at - current_time;
    if duration > MAX_EXPIRATION_DURATION {
        return Err(Error::ValidationFailed);
    }
    
    // Check if expiration is too soon
    if duration < MIN_EXPIRATION_DURATION {
        return Err(Error::ValidationFailed);
    }
    
    Ok(())
}

/// Validate address
pub fn validate_address(_address: &Address) -> Result<(), Error> {
    // Basic address validation
    Ok(())
}

/// Validate addresses are different
pub fn validate_different_addresses(addr1: &Address, addr2: &Address) -> Result<(), Error> {
    if addr1 == addr2 {
        return Err(Error::Unauthorized);
    }
    Ok(())
}

/// Validate bulk operation size
pub fn validate_bulk_size(users: &Vec<Address>) -> Result<(), Error> {
    if users.len() == 0 {
        return Err(Error::ValidationFailed);
    }
    if users.len() > MAX_BULK_USERS {
        return Err(Error::ValidationFailed);
    }
    Ok(())
}

/// Check for duplicate addresses in bulk operations
pub fn validate_no_duplicates(users: &Vec<Address>) -> Result<(), Error> {
    for i in 0..users.len() {
        let user_i = users.get(i).unwrap();
        for j in (i + 1)..users.len() {
            let user_j = users.get(j).unwrap();
            if user_i == user_j {
                return Err(Error::ValidationFailed);
            }
        }
    }
    Ok(())
}

/// Comprehensive validation for user verification
pub fn validate_user_verification(
    env: &Env,
    admin: &Address,
    user: &Address,
    level: &VerificationLevel,
    expires_at: u64,
    metadata: &String,
) -> Result<(), Error> {
    validate_address(admin)?;
    validate_address(user)?;
    validate_different_addresses(admin, user)?;
    validate_verification_level(level)?;
    validate_expiration(env, expires_at)?;
    validate_metadata(metadata)?;
    Ok(())
}

/// Comprehensive validation for bulk verification
pub fn validate_bulk_verification(
    env: &Env,
    admin: &Address,
    users: &Vec<Address>,
    level: &VerificationLevel,
    expires_at: u64,
    metadata: &String,
) -> Result<(), Error> {
    validate_address(admin)?;
    validate_bulk_size(users)?;
    validate_no_duplicates(users)?;
    validate_verification_level(level)?;
    validate_expiration(env, expires_at)?;
    validate_metadata(metadata)?;
    
    // Validate each user address
    for i in 0..users.len() {
        let user = users.get(i).unwrap();
        validate_address(&user)?;
        validate_different_addresses(admin, &user)?;
    }
    
    Ok(())
}

/// Comprehensive validation for metadata update
pub fn validate_metadata_update(
    _env: &Env,
    caller: &Address,
    user: &Address,
    metadata: &String,
) -> Result<(), Error> {
    validate_address(caller)?;
    validate_address(user)?;
    validate_metadata(metadata)?;
    Ok(())
}