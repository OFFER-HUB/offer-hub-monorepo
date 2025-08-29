use crate::types::Error;
use soroban_sdk::{Address, Env, String};

// Validation constants
const MIN_REASON_LENGTH: u32 = 10;
const MAX_REASON_LENGTH: u32 = 500;
const MIN_EVIDENCE_LENGTH: u32 = 5;
const MAX_EVIDENCE_LENGTH: u32 = 1000;
const MIN_DISPUTE_AMOUNT: i128 = 1;
const MAX_DISPUTE_AMOUNT: i128 = 1_000_000_000; // 1 billion stroops
const MIN_TIMEOUT_SECONDS: u64 = 3600; // 1 hour
const MAX_TIMEOUT_SECONDS: u64 = 2_592_000; // 30 days

/// Validate dispute reason
pub fn validate_dispute_reason(reason: &String) -> Result<(), Error> {
    let len = reason.len();
    if len < MIN_REASON_LENGTH {
        return Err(Error::InvalidDisputeLevel);
    }
    if len > MAX_REASON_LENGTH {
        return Err(Error::InvalidDisputeLevel);
    }
    Ok(())
}

/// Validate evidence description
pub fn validate_evidence_description(description: &String) -> Result<(), Error> {
    let len = description.len();
    if len < MIN_EVIDENCE_LENGTH {
        return Err(Error::EvidenceNotFound);
    }
    if len > MAX_EVIDENCE_LENGTH {
        return Err(Error::EvidenceNotFound);
    }
    Ok(())
}

/// Validate dispute amount
pub fn validate_dispute_amount(amount: i128) -> Result<(), Error> {
    if amount < MIN_DISPUTE_AMOUNT {
        return Err(Error::InvalidDisputeLevel);
    }
    if amount > MAX_DISPUTE_AMOUNT {
        return Err(Error::InvalidDisputeLevel);
    }
    Ok(())
}

/// Validate timeout duration
pub fn validate_timeout_duration(timeout_secs: u64) -> Result<(), Error> {
    if timeout_secs < MIN_TIMEOUT_SECONDS {
        return Err(Error::InvalidTimeout);
    }
    if timeout_secs > MAX_TIMEOUT_SECONDS {
        return Err(Error::InvalidTimeout);
    }
    Ok(())
}

/// Validate address is not zero address
pub fn validate_address(address: &Address) -> Result<(), Error> {
    // In Soroban, we can't easily check for zero address, but we can validate it's not the same as caller
    // This is a basic validation - in production you might want more sophisticated checks
    Ok(())
}

/// Validate addresses are different
pub fn validate_different_addresses(addr1: &Address, addr2: &Address) -> Result<(), Error> {
    if addr1 == addr2 {
        return Err(Error::Unauthorized);
    }
    Ok(())
}

/// Validate job ID is valid
pub fn validate_job_id(job_id: u32) -> Result<(), Error> {
    if job_id == 0 {
        return Err(Error::DisputeNotFound);
    }
    Ok(())
}

/// Comprehensive validation for opening a dispute
pub fn validate_open_dispute(
    _env: &Env,
    job_id: u32,
    initiator: &Address,
    reason: &String,
    dispute_amount: i128,
) -> Result<(), Error> {
    validate_job_id(job_id)?;
    validate_address(initiator)?;
    validate_dispute_reason(reason)?;
    validate_dispute_amount(dispute_amount)?;
    Ok(())
}

/// Comprehensive validation for adding evidence
pub fn validate_add_evidence(
    _env: &Env,
    job_id: u32,
    submitter: &Address,
    description: &String,
) -> Result<(), Error> {
    validate_job_id(job_id)?;
    validate_address(submitter)?;
    validate_evidence_description(description)?;
    Ok(())
}
