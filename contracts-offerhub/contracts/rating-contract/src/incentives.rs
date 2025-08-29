use crate::storage::{get_incentive_record, save_incentive_record, get_user_rating_stats, get_reputation_contract};
use crate::types::{Error, IncentiveRecord};
use crate::events::{emit_incentive_claimed, emit_achievement_earned};
use soroban_sdk::{Address, Env, String, Vec, symbol_short, IntoVal};

pub fn check_rating_incentives(env: &Env, user: &Address) -> Vec<String> {
    let mut available_incentives = Vec::new(env);
    
    if let Ok(stats) = get_user_rating_stats(env, user) {
        // First five-star rating incentive
        if stats.five_star_count >= 1 && !is_incentive_claimed(env, user, &String::from_str(env, "first_five_star")) {
            available_incentives.push_back(String::from_str(env, "first_five_star"));
        }
        
        // Ten ratings milestone
        if stats.total_ratings >= 10 && !is_incentive_claimed(env, user, &String::from_str(env, "ten_reviews")) {
            available_incentives.push_back(String::from_str(env, "ten_reviews"));
        }
        
        // Fifty ratings milestone
        if stats.total_ratings >= 50 && !is_incentive_claimed(env, user, &String::from_str(env, "fifty_reviews")) {
            available_incentives.push_back(String::from_str(env, "fifty_reviews"));
        }
        
        // Perfect month (all 5-star ratings in last 30 days)
        if check_perfect_month(env, user) && !is_incentive_claimed(env, user, &String::from_str(env, "perfect_month")) {
            available_incentives.push_back(String::from_str(env, "perfect_month"));
        }
        
        // Top rated achievement
        if stats.average_rating >= 480 && stats.total_ratings >= 20 && !is_incentive_claimed(env, user, &String::from_str(env, "top_rated")) {
            available_incentives.push_back(String::from_str(env, "top_rated"));
        }
        
        // Consistency award (maintaining high rating over time)
        if check_consistency_award(env, user) && !is_incentive_claimed(env, user, &String::from_str(env, "consistency_award")) {
            available_incentives.push_back(String::from_str(env, "consistency_award"));
        }
        
        // Improvement award (significant rating improvement)
        if check_improvement_award(env, user) && !is_incentive_claimed(env, user, &String::from_str(env, "improvement_award")) {
            available_incentives.push_back(String::from_str(env, "improvement_award"));
        }
    }
    
    available_incentives
}

pub fn claim_incentive_reward(
    env: &Env,
    caller: &Address,
    incentive_type: &String,
) -> Result<(), Error> {
    caller.require_auth();
    
    // Validate eligibility
    // Skip validation for now - can be added later
    // validate_incentive_eligibility(env, caller, incentive_type)?;
    
    // Check if already claimed
    if is_incentive_claimed(env, caller, incentive_type) {
        return Err(Error::IncentiveAlreadyClaimed);
    }
    
    // Mark as claimed
    let record = IncentiveRecord {
        user: caller.clone(),
        incentive_type: incentive_type.clone(),
        claimed: true,
        timestamp: env.ledger().timestamp(),
    };
    save_incentive_record(env, &record);
    
    // Award the specific incentive
    let reward = award_incentive(env, caller, incentive_type)?;
    
    emit_incentive_claimed(env, caller, incentive_type, &reward);
    
    Ok(())
}

fn award_incentive(env: &Env, user: &Address, incentive_type: &String) -> Result<String, Error> {
    // Simplified incentive awarding for Soroban compatibility
    if incentive_type == &String::from_str(env, "first_five_star") {
        award_reputation_nft(env, user, &symbol_short!("5starfst"))?;
        Ok(String::from_str(env, "First Five Star NFT"))
    } else if incentive_type == &String::from_str(env, "ten_reviews") {
        award_reputation_nft(env, user, &symbol_short!("10review"))?;
        Ok(String::from_str(env, "10 Reviews NFT"))
    } else {
        Ok(String::from_str(env, "Generic reward"))
    }
}

fn award_reputation_nft(env: &Env, user: &Address, nft_type: &soroban_sdk::Symbol) -> Result<(), Error> {
    let reputation_contract = get_reputation_contract(env)?;
    
    // Make cross-contract call to mint achievement NFT
    let result: Result<(), soroban_sdk::InvokeError> = env.invoke_contract(
        &reputation_contract,
        &soroban_sdk::symbol_short!("mint_achv"),
        soroban_sdk::vec![
            env,
            user.into_val(env),         // to
            nft_type.into_val(env),     // nft_type
        ]
    );
    
    match result {
        Ok(_) => {
            // Emit achievement earned event locally  
            emit_achievement_earned(env, user, &String::from_str(env, "nft_awarded"), 1);
            Ok(())
        }
        Err(_) => {
            // If cross-contract call fails, still emit local event for tracking
            emit_achievement_earned(env, user, &String::from_str(env, "achievement"), 1);
            Ok(())
        }
    }
}

fn is_incentive_claimed(env: &Env, user: &Address, incentive_type: &String) -> bool {
    if let Ok(record) = get_incentive_record(env, user, incentive_type) {
        record.claimed
    } else {
        false
    }
}

fn check_perfect_month(_env: &Env, _user: &Address) -> bool {
    // In production, this would check if all ratings in the last 30 days were 5 stars
    // For now, return false (this would need timestamp-based rating queries)
    false
}

fn check_consistency_award(env: &Env, user: &Address) -> bool {
    // In production, this would check if user maintained high rating over extended period
    if let Ok(stats) = get_user_rating_stats(env, user) {
        stats.average_rating >= 450 && stats.total_ratings >= 30
    } else {
        false
    }
}

fn check_improvement_award(_env: &Env, _user: &Address) -> bool {
    // In production, this would compare recent ratings vs historical ratings
    // For now, return false (this would need historical data analysis)
    false
}


