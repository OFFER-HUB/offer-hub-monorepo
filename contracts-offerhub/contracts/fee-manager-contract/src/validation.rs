use soroban_sdk::{Address, Env};
use crate::error::Error;

// Validation constants
const MIN_FEE_PERCENTAGE: i128 = 0; // 0%
const MAX_FEE_PERCENTAGE: i128 = 1000; // 10% (1000 basis points)
const MIN_AMOUNT: i128 = 1;
const MAX_AMOUNT: i128 = 1_000_000_000_000; // 1 trillion stroops

/// Validate fee percentage (in basis points: 100 = 1%)
pub fn validate_fee_percentage(percentage: i128) -> Result<(), Error> {
    if percentage < MIN_FEE_PERCENTAGE {
        return Err(Error::InvalidFeePercentage);
    }
    if percentage > MAX_FEE_PERCENTAGE {
        return Err(Error::InvalidFeePercentage);
    }
    Ok(())
}

/// Validate amount is positive and within limits
pub fn validate_amount(amount: i128) -> Result<(), Error> {
    if amount < MIN_AMOUNT {
        return Err(Error::InvalidAmount);
    }
    if amount > MAX_AMOUNT {
        return Err(Error::InvalidAmount);
    }
    Ok(())
}

/// Validate withdrawal amount against balance
pub fn validate_withdrawal_amount(amount: i128, balance: i128) -> Result<(), Error> {
    if amount <= 0 {
        return Err(Error::InvalidAmount);
    }
    if amount > balance {
        return Err(Error::InsufficientBalance);
    }
    Ok(())
}

/// Validate fee type
pub fn validate_fee_type(fee_type: u32) -> Result<(), Error> {
    match fee_type {
        1 | 2 => Ok(()), // FEE_TYPE_ESCROW = 1, FEE_TYPE_DISPUTE = 2
        _ => Err(Error::InvalidFeeType),
    }
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

/// Comprehensive validation for initialization
pub fn validate_initialization(
    _env: &Env,
    admin: &Address,
    platform_wallet: &Address,
) -> Result<(), Error> {
    validate_address(admin)?;
    validate_address(platform_wallet)?;
    validate_different_addresses(admin, platform_wallet)?;
    Ok(())
}

/// Comprehensive validation for setting fee rates
pub fn validate_fee_rates(
    escrow_fee_percentage: i128,
    dispute_fee_percentage: i128,
    arbitrator_fee_percentage: i128,
) -> Result<(), Error> {
    validate_fee_percentage(escrow_fee_percentage)?;
    validate_fee_percentage(dispute_fee_percentage)?;
    validate_fee_percentage(arbitrator_fee_percentage)?;
    
    // Additional business logic: total fees shouldn't exceed reasonable limits
    let total_fees = escrow_fee_percentage + dispute_fee_percentage + arbitrator_fee_percentage;
    if total_fees > 1500 { // 15% total maximum
        return Err(Error::InvalidFeePercentage);
    }
    
    Ok(())
}

/// Comprehensive validation for fee calculation
pub fn validate_fee_calculation(
    amount: i128,
    user: &Address,
) -> Result<(), Error> {
    validate_amount(amount)?;
    validate_address(user)?;
    Ok(())
}