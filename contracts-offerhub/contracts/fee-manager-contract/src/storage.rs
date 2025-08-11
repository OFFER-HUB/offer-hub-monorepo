use soroban_sdk::{symbol_short, Address, Symbol, Vec};

// Storage keys for fee configuration
pub const FEE_CONFIG: Symbol = symbol_short!("FEE_CFG");
pub const PLATFORM_BALANCE: Symbol = symbol_short!("PLAT_BAL");
pub const FEE_HISTORY: Symbol = symbol_short!("FEE_HIST");
pub const FEE_STATS: Symbol = symbol_short!("FEE_STAT");

// Storage keys for premium users
pub const PREMIUM_USERS: Symbol = symbol_short!("PREM_USR");

// Fee type constants
pub const ESCROW_FEE: Symbol = symbol_short!("ESC_FEE");
pub const DISPUTE_FEE: Symbol = symbol_short!("DISP_FEE");

// Default fee percentages (in basis points: 100 = 1%)
pub const DEFAULT_ESCROW_FEE_PERCENTAGE: i128 = 250;    // 2.5%
pub const DEFAULT_DISPUTE_FEE_PERCENTAGE: i128 = 500;   // 5.0%
pub const DEFAULT_ARBITRATOR_FEE_PERCENTAGE: i128 = 300; // 3.0%

// Precision for fee calculations (6 decimal places)
pub const FEE_PRECISION: i128 = 1_000_000; 