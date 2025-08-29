use crate::storage::{get_platform_stat, get_user_rating_stats};
use crate::types::{Error, UserRatingData};
use soroban_sdk::{Address, Env, String, Vec};

pub fn calculate_rating_trend(env: &Env, user: &Address) -> i32 {
    // In production, this would analyze recent ratings vs older ratings
    // For now, return a mock calculation
    if let Ok(stats) = get_user_rating_stats(env, user) {
        if stats.average_rating >= 400 {
            1 // Positive trend
        } else if stats.average_rating <= 250 {
            -1 // Negative trend
        } else {
            0 // Neutral trend
        }
    } else {
        0
    }
}

pub fn get_achievement_eligibility(env: &Env, user: &Address) -> Vec<String> {
    let mut achievements = Vec::new(env);
    
    if let Ok(stats) = get_user_rating_stats(env, user) {
        // Check for various achievements
        if stats.total_ratings >= 10 && stats.average_rating >= 400 {
            achievements.push_back(String::from_str(env, "reliable_freelancer"));
        }
        
        if stats.five_star_count >= 5 {
            achievements.push_back(String::from_str(env, "five_star_specialist"));
        }
        
        if stats.total_ratings >= 50 && stats.average_rating >= 450 {
            achievements.push_back(String::from_str(env, "veteran_contractor"));
        }
        
        if stats.average_rating >= 480 && stats.total_ratings >= 20 {
            achievements.push_back(String::from_str(env, "top_rated_professional"));
        }
        
        if stats.total_ratings >= 100 {
            achievements.push_back(String::from_str(env, "century_milestone"));
        }
    }
    
    achievements
}

pub fn calculate_user_restriction_status(env: &Env, user: &Address) -> String {
    if let Ok(stats) = get_user_rating_stats(env, user) {
        if stats.total_ratings >= 5 {
            if stats.average_rating < 250 {
                String::from_str(env, "restricted")
            } else if stats.average_rating < 300 {
                String::from_str(env, "warning")
            } else {
                String::from_str(env, "none")
            }
        } else {
            String::from_str(env, "none") // New users get benefit of doubt
        }
    } else {
        String::from_str(env, "none")
    }
}

pub fn get_platform_analytics(env: &Env) -> Vec<(String, String)> {
    let mut analytics = Vec::new(env);
    
    // Total ratings
    let _total_ratings = get_platform_stat(env, &String::from_str(env, "total_ratings"));
    analytics.push_back((
        String::from_str(env, "total_ratings"),
        String::from_str(env, "0") // Simplified without to_string()
    ));
    
    // Total feedback
    let _total_feedback = get_platform_stat(env, &String::from_str(env, "total_feedback"));
    analytics.push_back((
        String::from_str(env, "total_feedback"),
        String::from_str(env, "0")
    ));
    
    // Total reports
    let _total_reports = get_platform_stat(env, &String::from_str(env, "total_reports"));
    analytics.push_back((
        String::from_str(env, "total_reports"),
        String::from_str(env, "0")
    ));
    
    // Total restricted users
    let _restricted_users = get_platform_stat(env, &String::from_str(env, "restricted_users"));
    analytics.push_back((
        String::from_str(env, "restricted_users"),
        String::from_str(env, "0")
    ));
    
    // Average platform rating (would need more complex calculation in production)
    analytics.push_back((
        String::from_str(env, "platform_avg_rating"),
        String::from_str(env, "4.2") // Mock value
    ));
    
    analytics
}

pub fn generate_user_rating_data(env: &Env, user: &Address) -> Result<UserRatingData, Error> {
    let stats = get_user_rating_stats(env, user)?;
    let recent_ratings = Vec::new(env); // Would fetch recent ratings in production
    let rating_trend = calculate_rating_trend(env, user);
    let achievement_eligible = get_achievement_eligibility(env, user);
    let restriction_status = calculate_user_restriction_status(env, user);
    
    Ok(UserRatingData {
        stats,
        recent_ratings,
        rating_trend,
        achievement_eligible,
        restriction_status,
    })
}


