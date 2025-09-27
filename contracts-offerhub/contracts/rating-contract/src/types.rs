use soroban_sdk::{contracterror, contracttype, symbol_short, Address, String, Symbol, Vec};
use crate::error::Error;

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct Rating {
    pub id: String,
    pub rater: Address,
    pub rated_user: Address,
    pub contract_id: String,
    pub rating: u32, // Changed from u8 to u32 for Soroban compatibility
    pub timestamp: u64,
    pub work_category: String,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct Feedback {
    pub id: String,
    pub rating_id: String,
    pub rater: Address,
    pub rated_user: Address,
    pub contract_id: String,
    pub feedback: String,
    pub timestamp: u64,
    pub is_flagged: bool,
    pub moderation_status: String, // "pending", "approved", "removed"
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct RatingStats {
    pub user: Address,
    pub total_ratings: u32,
    pub average_rating: u32, // Multiplied by 100 for precision (e.g., 450 = 4.50)
    pub five_star_count: u32,
    pub four_star_count: u32,
    pub three_star_count: u32,
    pub two_star_count: u32,
    pub one_star_count: u32,
    pub last_updated: u64,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct UserRatingSummary {
    pub user: Address,
    pub total_ratings: u32,
    pub average_rating: u32, // Multiplied by 100 for precision (e.g., 450 = 4.50)
    pub five_star_count: u32,
    pub four_star_count: u32,
    pub three_star_count: u32,
    pub two_star_count: u32,
    pub one_star_count: u32,
    pub last_updated: u64,
    pub recent_ratings:  Vec<(String, Address, Address, String, u32, u64, String)>,
    pub rating_trend: i32, // Positive for improving, negative for declining
    pub achievement_eligible: Vec<String>,
    pub restriction_status: String, // "none", "warning", "restricted"
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct UserRatingData {
    pub stats: RatingStats,
    pub recent_ratings: Vec<Rating>,
    pub rating_trend: i32, // Positive for improving, negative for declining
    pub achievement_eligible: Vec<String>,
    pub restriction_status: String, // "none", "warning", "restricted"
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct FeedbackReport {
    pub id: String,
    pub feedback_id: String,
    pub reporter: Address,
    pub reason: String,
    pub timestamp: u64,
    pub status: String, // "pending", "resolved", "dismissed"
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct RatingThreshold {
    pub threshold_type: String,
    pub value: u32,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct IncentiveRecord {
    pub user: Address,
    pub incentive_type: String,
    pub claimed: bool,
    pub timestamp: u64,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct HealthStatus {
    pub is_healthy: bool,
    pub issues: Vec<String>,
    pub last_check: u64,
    pub gas_used: u64,
    pub contract_version: String,
    pub admin_set: bool,
    pub storage_accessible: bool,
    pub critical_params_valid: bool,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct HealthCheckResult {
    pub status: HealthStatus,
    pub details: Vec<String>,
    pub recommendations: Vec<String>,
}

// Storage keys
pub const ADMIN: &[u8] = &[0];
pub const MODERATOR: &[u8] = &[1];
pub const RATING: &[u8] = &[2];
pub const FEEDBACK: &[u8] = &[3];
pub const USER_RATING_STATS: &[u8] = &[4];

pub const FEEDBACK_REPORTS: &[u8] = &[7];
pub const RATING_THRESHOLDS: &[u8] = &[8];
pub const INCENTIVE_RECORDS: &[u8] = &[9];
pub const REPUTATION_CONTRACT: &[u8] = &[10];
pub const PLATFORM_STATS: &[u8] = &[11];
pub const USER_RESTRICTIONS: &[u8] = &[12];
pub const RATE_LIMITS: &[u8] = &[13];
pub const RATE_LIMIT_BYPASS: &[u8] = &[14];
pub const CONTRACT_CONFIG: &[u8] = &[15];

// Default configuration values
pub const DEFAULT_MAX_RATING_PER_DAY: u32 = 10;          // 10 ratings per day
pub const DEFAULT_MAX_FEEDBACK_LENGTH: u32 = 1000;      // 1000 characters
pub const DEFAULT_MIN_RATING: u32 = 1;                  // Minimum rating 1
pub const DEFAULT_MAX_RATING: u32 = 5;                  // Maximum rating 5
pub const DEFAULT_RATE_LIMIT_CALLS: u32 = 5;           // 5 calls per window
pub const DEFAULT_RATE_LIMIT_WINDOW_HOURS: u32 = 1;    // 1 hour window
pub const DEFAULT_AUTO_MODERATION_ENABLED: bool = true; // Auto-moderation enabled

// Rating validation constants
pub const MIN_RATING: u32 = 1;
pub const MAX_RATING: u32 = 5;
pub const MAX_FEEDBACK_LENGTH: u32 = 1000;

// Default thresholds
pub const DEFAULT_RESTRICTION_THRESHOLD: u32 = 250; // 2.50 average rating
pub const DEFAULT_WARNING_THRESHOLD: u32 = 300; // 3.00 average rating
pub const DEFAULT_TOP_RATED_THRESHOLD: u32 = 480; // 4.80 average rating

pub const TOTAL_RATING_COUNT: Symbol = symbol_short!("TOTALRATE");

pub const MAX_RATING_AGE: u64 = 30 * 24 * 60 * 60; // 30 days in seconds
pub const PAUSED: Symbol = symbol_short!("PAUSED");

pub fn require_auth(address: &Address) -> Result<(), Error> {
    address.require_auth();
    Ok(())
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct RateLimitEntry {
    pub current_calls: u32,
    pub window_start: u64,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct ContractConfig {
    pub max_rating_per_day: u32,           // Maximum ratings per day per user
    pub max_feedback_length: u32,         // Maximum feedback character length
    pub min_rating: u32,                  // Minimum rating value
    pub max_rating: u32,                  // Maximum rating value
    pub rate_limit_calls: u32,            // Rate limit calls per window
    pub rate_limit_window_hours: u32,     // Rate limit window in hours
    pub auto_moderation_enabled: bool,    // Whether auto-moderation is enabled
    pub restriction_threshold: u32,       // Rating threshold for restrictions
    pub warning_threshold: u32,           // Rating threshold for warnings
    pub top_rated_threshold: u32,         // Rating threshold for top-rated status
}

pub struct RatingDataExport {
    pub user_address: Address,
    pub stats: RatingStats,
    pub ratings: Vec<Rating>,
    pub feedback: Vec<Feedback>,
    pub export_timestamp: u64,
    pub export_version: String,
    pub data_size_limit_reached: bool,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct AllRatingDataExport {
    pub total_ratings: u64,
    pub platform_stats: Vec<(String, String)>,
    pub export_timestamp: u64,
    pub export_version: String,
    pub data_size_limit_reached: bool,
}

