use soroban_sdk::{Address, Env, String};
use crate::types::Error;

// Validation constants
const MAX_AMOUNT: i128 = 1_000_000_000_000; // 1 trillion stroops
const MIN_TIMEOUT_SECONDS: u64 = 3600; // 1 hour
const MAX_TIMEOUT_SECONDS: u64 = 31_536_000; // 1 year
const MIN_MILESTONE_DESCRIPTION_LENGTH: u32 = 5;
const MAX_MILESTONE_DESCRIPTION_LENGTH: u32 = 200;

/// Validate amount is positive and within limits
pub fn validate_amount(amount: i128) -> Result<(), Error> {
    if amount <= 0 {
        return Err(Error::InvalidAmount);
    }
    if amount > MAX_AMOUNT {
        return Err(Error::InvalidAmount);
    }
    Ok(())
}

/// Validate timeout duration
pub fn validate_timeout(timeout_secs: u64) -> Result<(), Error> {
    if timeout_secs < MIN_TIMEOUT_SECONDS {
        return Err(Error::InvalidStatus);
    }
    if timeout_secs > MAX_TIMEOUT_SECONDS {
        return Err(Error::InvalidStatus);
    }
    Ok(())
}

/// Validate milestone description
pub fn validate_milestone_description(description: &String) -> Result<(), Error> {
    let len = description.len();
    if len < MIN_MILESTONE_DESCRIPTION_LENGTH {
        return Err(Error::InvalidStatus);
    }
    if len > MAX_MILESTONE_DESCRIPTION_LENGTH {
        return Err(Error::InvalidStatus);
    }
    Ok(())
}

/// Validate milestone ID
pub fn validate_milestone_id(milestone_id: u32) -> Result<(), Error> {
    if milestone_id == 0 {
        return Err(Error::MilestoneNotFound);
    }
    Ok(())
}

/// Validate address is not zero/invalid
pub fn validate_address(address: &Address) -> Result<(), Error> {
    // Basic address validation - in production you might want more checks
    Ok(())
}

/// Validate addresses are different
pub fn validate_different_addresses(addr1: &Address, addr2: &Address) -> Result<(), Error> {
    if addr1 == addr2 {
        return Err(Error::Unauthorized);
    }
    Ok(())
}

/// Comprehensive validation for contract initialization
pub fn validate_init_contract(
    _env: &Env,
    client: &Address,
    freelancer: &Address,
    amount: i128,
    fee_manager: &Address,
) -> Result<(), Error> {
    validate_address(client)?;
    validate_address(freelancer)?;
    validate_address(fee_manager)?;
    validate_different_addresses(client, freelancer)?;
    validate_amount(amount)?;
    Ok(())
}

/// Comprehensive validation for full contract initialization
pub fn validate_init_contract_full(
    _env: &Env,
    client: &Address,
    freelancer: &Address,
    arbitrator: &Address,
    token: &Address,
    amount: i128,
    timeout_secs: u64,
) -> Result<(), Error> {
    validate_address(client)?;
    validate_address(freelancer)?;
    validate_address(arbitrator)?;
    validate_address(token)?;
    validate_different_addresses(client, freelancer)?;
    validate_different_addresses(client, arbitrator)?;
    validate_different_addresses(freelancer, arbitrator)?;
    validate_amount(amount)?;
    validate_timeout(timeout_secs)?;
    Ok(())
}

/// Comprehensive validation for adding milestone
pub fn validate_add_milestone(
    _env: &Env,
    client: &Address,
    description: &String,
    amount: i128,
) -> Result<(), Error> {
    validate_address(client)?;
    validate_milestone_description(description)?;
    validate_amount(amount)?;
    Ok(())
}