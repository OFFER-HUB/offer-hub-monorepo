use crate::storage::{has_rated_contract, get_user_restriction};
use crate::types::{Error, MIN_RATING, MAX_RATING, MAX_FEEDBACK_LENGTH};
use soroban_sdk::{Address, Env, String};

// Additional validation constants
const MIN_FEEDBACK_LENGTH: u32 = 1;
const MIN_CONTRACT_ID_LENGTH: u32 = 1;
const MAX_CONTRACT_ID_LENGTH: u32 = 100;
const MIN_WORK_CATEGORY_LENGTH: u32 = 2;
const MAX_WORK_CATEGORY_LENGTH: u32 = 50;
const MIN_REPORT_REASON_LENGTH: u32 = 10;
const MAX_REPORT_REASON_LENGTH: u32 = 200;

/// Validate rating value (1-5)
pub fn validate_rating(rating: u32) -> Result<(), Error> {
    if rating < MIN_RATING || rating > MAX_RATING {
        return Err(Error::InvalidRating);
    }
    Ok(())
}

/// Validate feedback content
pub fn validate_feedback(feedback: &String) -> Result<(), Error> {
    let len = feedback.len();
    if len < MIN_FEEDBACK_LENGTH {
        return Err(Error::InvalidRating);
    }
    if len > MAX_FEEDBACK_LENGTH {
        return Err(Error::InvalidRating);
    }
    Ok(())
}

/// Validate contract ID
pub fn validate_contract_id(contract_id: &String) -> Result<(), Error> {
    let len = contract_id.len();
    if len < MIN_CONTRACT_ID_LENGTH {
        return Err(Error::InvalidRating);
    }
    if len > MAX_CONTRACT_ID_LENGTH {
        return Err(Error::InvalidRating);
    }
    Ok(())
}

/// Validate work category
pub fn validate_work_category(work_category: &String) -> Result<(), Error> {
    let len = work_category.len();
    if len < MIN_WORK_CATEGORY_LENGTH {
        return Err(Error::InvalidRating);
    }
    if len > MAX_WORK_CATEGORY_LENGTH {
        return Err(Error::InvalidRating);
    }
    Ok(())
}

/// Validate report reason
pub fn validate_report_reason(reason: &String) -> Result<(), Error> {
    let len = reason.len();
    if len < MIN_REPORT_REASON_LENGTH {
        return Err(Error::InvalidModerationAction);
    }
    if len > MAX_REPORT_REASON_LENGTH {
        return Err(Error::InvalidModerationAction);
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
        return Err(Error::InvalidRating);
    }
    Ok(())
}

/// Validate rating eligibility
pub fn validate_rating_eligibility(
    env: &Env,
    rater: &Address,
    rated_user: &Address,
    contract_id: &String,
) -> Result<(), Error> {
    // Check if rater has already rated this contract
    if has_rated_contract(env, rater, contract_id) {
        return Err(Error::AlreadyRated);
    }
    
    // Check if rater is trying to rate themselves
    validate_different_addresses(rater, rated_user)?;
    
    // Check if rater has restrictions
    let restriction = get_user_restriction(env, rater);
    if restriction == String::from_str(env, "restricted") {
        return Err(Error::RatingRestricted);
    }
    
    Ok(())
}

/// Validate moderation action
pub fn validate_moderation_action(action: &String) -> Result<(), Error> {
    // Simplified validation for Soroban compatibility
    if action == &String::from_str(&soroban_sdk::Env::default(), "approve") ||
       action == &String::from_str(&soroban_sdk::Env::default(), "remove") ||
       action == &String::from_str(&soroban_sdk::Env::default(), "flag") {
        Ok(())
    } else {
        Err(Error::InvalidModerationAction)
    }
}

/// Check spam prevention
pub fn check_spam_prevention(env: &Env, rater: &Address) -> Result<(), Error> {
    // Check if user is making too many ratings in a short time
    // This would need timestamp-based logic in production
    // For now, just check basic restrictions
    let restriction = get_user_restriction(env, rater);
    if restriction == String::from_str(env, "spam_restricted") {
        return Err(Error::RatingRestricted);
    }
    Ok(())
}

/// Comprehensive validation for submitting a rating
pub fn validate_submit_rating(
    env: &Env,
    caller: &Address,
    rated_user: &Address,
    contract_id: &String,
    rating: u32,
    feedback: &String,
    work_category: &String,
) -> Result<(), Error> {
    validate_address(caller)?;
    validate_address(rated_user)?;
    validate_different_addresses(caller, rated_user)?;
    validate_contract_id(contract_id)?;
    validate_rating(rating)?;
    validate_feedback(feedback)?;
    validate_work_category(work_category)?;
    validate_rating_eligibility(env, caller, rated_user, contract_id)?;
    check_spam_prevention(env, caller)?;
    Ok(())
}

/// Comprehensive validation for reporting feedback
pub fn validate_report_feedback(
    _env: &Env,
    caller: &Address,
    feedback_id: &String,
    reason: &String,
) -> Result<(), Error> {
    validate_address(caller)?;
    validate_contract_id(feedback_id)?; // Reuse contract_id validation for feedback_id
    validate_report_reason(reason)?;
    Ok(())
}


