use soroban_sdk::{symbol_short, Symbol};

// Storage keys for fee configuration
pub const FEE_CONFIG: Symbol = symbol_short!("FEE_CFG");
pub const PLATFORM_BALANCE: Symbol = symbol_short!("PLAT_BAL");
pub const FEE_HISTORY: Symbol = symbol_short!("FEE_HIST");
pub const FEE_STATS: Symbol = symbol_short!("FEE_STAT");
pub const TOTAL_FESS_COLLECTED: Symbol = symbol_short!("FEE_TOTAL");

pub const PAUSED: Symbol = symbol_short!("PAUSED");

// Storage keys for premium users
pub const PREMIUM_USERS: Symbol = symbol_short!("PREM_USR");


// Storage key for contract configuration
pub const CONTRACT_CONFIG: Symbol = symbol_short!("CONFIG");

// Default fee percentages (in basis points: 100 = 1%)
pub const DEFAULT_ESCROW_FEE_PERCENTAGE: i128 = 250; // 2.5%
pub const DEFAULT_DISPUTE_FEE_PERCENTAGE: i128 = 500; // 5.0%
pub const DEFAULT_ARBITRATOR_FEE_PERCENTAGE: i128 = 300; // 3.0%


// Default contract configuration values
pub const DEFAULT_PLATFORM_FEE_PERCENTAGE: u32 = 2;      // 2%
pub const DEFAULT_ESCROW_TIMEOUT_DAYS: u32 = 30;        // 30 days
pub const DEFAULT_MAX_RATING_PER_DAY: u32 = 10;          // 10 ratings per day
pub const DEFAULT_MIN_ESCROW_AMOUNT: u128 = 1000;       // Minimum 1000 units
pub const DEFAULT_MAX_ESCROW_AMOUNT: u128 = 1000000000; // Maximum 1 billion units
pub const DEFAULT_DISPUTE_TIMEOUT_HOURS: u32 = 168;     // 7 days (168 hours)
pub const DEFAULT_RATE_LIMIT_WINDOW_HOURS: u32 = 24;    // 24 hours
pub const DEFAULT_MAX_RATE_LIMIT_CALLS: u32 = 100;      // 100 calls per window

