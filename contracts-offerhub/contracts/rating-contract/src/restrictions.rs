use crate::storage::{get_user_rating_stats, save_user_restriction, get_user_restriction};
use crate::types::{Error, DEFAULT_RESTRICTION_THRESHOLD, DEFAULT_WARNING_THRESHOLD, DEFAULT_TOP_RATED_THRESHOLD};
use crate::events::{emit_restriction_applied, emit_privilege_granted};
use soroban_sdk::{Address, Env, String, Vec};

pub fn check_and_apply_restrictions(env: &Env, user: &Address) -> Result<(), Error> {
    if let Ok(stats) = get_user_rating_stats(env, user) {
        if stats.total_ratings >= 5 {
            if stats.average_rating < DEFAULT_RESTRICTION_THRESHOLD {
                // Apply restriction
                let restriction = String::from_str(env, "restricted");
                save_user_restriction(env, user, &restriction);
                emit_restriction_applied(
                    env,
                    user,
                    &restriction,
                    &String::from_str(env, "Low average rating")
                );
            } else if stats.average_rating < DEFAULT_WARNING_THRESHOLD {
                // Apply warning
                let restriction = String::from_str(env, "warning");
                save_user_restriction(env, user, &restriction);
                emit_restriction_applied(
                    env,
                    user,
                    &restriction,
                    &String::from_str(env, "Below average rating")
                );
            } else {
                // Remove any existing restrictions
                let restriction = String::from_str(env, "none");
                save_user_restriction(env, user, &restriction);
            }
        }
    }
    Ok(())
}

pub fn get_user_privileges(env: &Env, user: &Address) -> Vec<String> {
    let mut privileges = Vec::new(env);
    
    if let Ok(stats) = get_user_rating_stats(env, user) {
        // Basic privilege for all users with some ratings
        if stats.total_ratings >= 1 {
            privileges.push_back(String::from_str(env, "basic_access"));
        }
        
        // Enhanced privileges based on rating performance
        if stats.average_rating >= 350 && stats.total_ratings >= 5 {
            privileges.push_back(String::from_str(env, "priority_support"));
        }
        
        if stats.average_rating >= 400 && stats.total_ratings >= 10 {
            privileges.push_back(String::from_str(env, "featured_listing"));
            privileges.push_back(String::from_str(env, "badge_display"));
        }
        
        if stats.average_rating >= DEFAULT_TOP_RATED_THRESHOLD && stats.total_ratings >= 20 {
            privileges.push_back(String::from_str(env, "top_rated_badge"));
            privileges.push_back(String::from_str(env, "premium_visibility"));
            privileges.push_back(String::from_str(env, "lower_fees"));
            
            emit_privilege_granted(env, user, &String::from_str(env, "top_rated_status"));
        }
        
        // Volume-based privileges
        if stats.total_ratings >= 50 {
            privileges.push_back(String::from_str(env, "veteran_status"));
        }
        
        if stats.total_ratings >= 100 {
            privileges.push_back(String::from_str(env, "master_contractor"));
        }
    }
    
    privileges
}

pub fn check_restriction_status(env: &Env, user: &Address) -> bool {
    let restriction = get_user_restriction(env, user);
    restriction == String::from_str(env, "restricted")
}


