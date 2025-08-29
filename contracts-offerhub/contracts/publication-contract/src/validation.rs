use soroban_sdk::{Address, Env, String, Symbol};
use crate::error::ContractError;

// Validation constants
const MIN_TITLE_LENGTH: u32 = 3;
const MAX_TITLE_LENGTH: u32 = 100;
const MIN_CATEGORY_LENGTH: u32 = 2;
const MAX_CATEGORY_LENGTH: u32 = 50;
const MIN_AMOUNT: i128 = 0; // Allow 0 for free publications
const MAX_AMOUNT: i128 = 1_000_000_000_000; // 1 trillion stroops

/// Validate publication title
pub fn validate_title(title: &String) -> Result<(), ContractError> {
    let len = title.len();
    if len < MIN_TITLE_LENGTH {
        return Err(ContractError::TitleTooShort);
    }
    if len > MAX_TITLE_LENGTH {
        return Err(ContractError::ValidationError);
    }
    Ok(())
}

/// Validate category
pub fn validate_category(category: &String) -> Result<(), ContractError> {
    let len = category.len();
    if len < MIN_CATEGORY_LENGTH {
        return Err(ContractError::ValidationError);
    }
    if len > MAX_CATEGORY_LENGTH {
        return Err(ContractError::ValidationError);
    }
    Ok(())
}

/// Validate amount
pub fn validate_amount(amount: i128) -> Result<(), ContractError> {
    if amount < MIN_AMOUNT {
        return Err(ContractError::InvalidAmount);
    }
    if amount > MAX_AMOUNT {
        return Err(ContractError::InvalidAmount);
    }
    Ok(())
}

/// Validate publication type
pub fn validate_publication_type(env: &Env, publication_type: &Symbol) -> Result<(), ContractError> {
    // Define valid publication types
    let valid_types = [
        Symbol::new(env, "service"),
        Symbol::new(env, "project"),
        Symbol::new(env, "gig"),
        Symbol::new(env, "consultation"),
    ];
    
    for valid_type in valid_types.iter() {
        if publication_type == valid_type {
            return Ok(());
        }
    }
    
    Err(ContractError::InvalidPublicationType)
}

/// Validate timestamp is not in the future
pub fn validate_timestamp(env: &Env, timestamp: u64) -> Result<(), ContractError> {
    let current_time = env.ledger().timestamp();
    if timestamp > current_time {
        return Err(ContractError::ValidationError);
    }
    Ok(())
}

/// Validate address
pub fn validate_address(_address: &Address) -> Result<(), ContractError> {
    // Basic address validation
    Ok(())
}

/// Comprehensive validation for publication
pub fn validate_publication(
    env: &Env,
    user: &Address,
    publication_type: &Symbol,
    title: &String,
    category: &String,
    amount: i128,
    timestamp: u64,
) -> Result<(), ContractError> {
    validate_address(user)?;
    validate_publication_type(env, publication_type)?;
    validate_title(title)?;
    validate_category(category)?;
    validate_amount(amount)?;
    validate_timestamp(env, timestamp)?;
    Ok(())
}