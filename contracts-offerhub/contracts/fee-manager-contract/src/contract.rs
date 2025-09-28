use soroban_sdk::{log, Address, Env, String, Symbol, Vec};

use crate::{
    error::{handle_error, Error},
    storage::{
        DEFAULT_ARBITRATOR_FEE_PERCENTAGE, DEFAULT_DISPUTE_FEE_PERCENTAGE,
        DEFAULT_ESCROW_FEE_PERCENTAGE, FEE_CONFIG, FEE_HISTORY, FEE_STATS, PLATFORM_BALANCE, PREMIUM_USERS,
        CONTRACT_CONFIG, DEFAULT_PLATFORM_FEE_PERCENTAGE, DEFAULT_ESCROW_TIMEOUT_DAYS, DEFAULT_MAX_RATING_PER_DAY,
        DEFAULT_MIN_ESCROW_AMOUNT, DEFAULT_MAX_ESCROW_AMOUNT, DEFAULT_DISPUTE_TIMEOUT_HOURS,
        DEFAULT_RATE_LIMIT_WINDOW_HOURS, DEFAULT_MAX_RATE_LIMIT_CALLS, TOTAL_FESS_COLLECTED, PAUSED
    },
    types::{FeeCalculation, FeeConfig, FeeRecord, FeeStats, PremiumUser, FEE_TYPE_ESCROW, FEE_TYPE_DISPUTE, PlatformStats, ContractConfig},
    validation::{validate_initialization, validate_fee_rates, validate_fee_calculation, validate_withdrawal_amount, validate_fee_type, validate_address},
};

pub fn initialize(env: &Env, admin: Address, platform_wallet: Address) {
    if env.storage().instance().has(&FEE_CONFIG) {
        handle_error(env, Error::AlreadyInitialized);
    }

    // Input validation
    if let Err(e) = validate_initialization(env, &admin, &platform_wallet) {
        handle_error(env, e);
    }

    let fee_config = FeeConfig {
        escrow_fee_percentage: DEFAULT_ESCROW_FEE_PERCENTAGE,
        dispute_fee_percentage: DEFAULT_DISPUTE_FEE_PERCENTAGE,
        arbitrator_fee_percentage: DEFAULT_ARBITRATOR_FEE_PERCENTAGE,
        admin: admin.clone(),
        platform_wallet: platform_wallet.clone(),
        initialized: true,
    };

    let fee_stats = FeeStats {
        total_fees_collected: 0,
        total_escrow_fees: 0,
        total_dispute_fees: 0,
        total_premium_exemptions: 0,
        total_transactions: 0,
    };

    let contract_config = ContractConfig {
        platform_fee_percentage: DEFAULT_PLATFORM_FEE_PERCENTAGE,
        escrow_timeout_days: DEFAULT_ESCROW_TIMEOUT_DAYS,
        max_rating_per_day: DEFAULT_MAX_RATING_PER_DAY,
        min_escrow_amount: DEFAULT_MIN_ESCROW_AMOUNT,
        max_escrow_amount: DEFAULT_MAX_ESCROW_AMOUNT,
        dispute_timeout_hours: DEFAULT_DISPUTE_TIMEOUT_HOURS,
        rate_limit_window_hours: DEFAULT_RATE_LIMIT_WINDOW_HOURS,
        max_rate_limit_calls: DEFAULT_MAX_RATE_LIMIT_CALLS,
    };

    env.storage().instance().set(&FEE_CONFIG, &fee_config);
    env.storage().instance().set(&PLATFORM_BALANCE, &0i128);
    env.storage().instance().set(&FEE_STATS, &fee_stats);
    env.storage().instance().set(&FEE_HISTORY, &Vec::<FeeRecord>::new(env));
    env.storage().instance().set(&PREMIUM_USERS, &Vec::<PremiumUser>::new(env));
    env.storage().instance().set(&CONTRACT_CONFIG, &contract_config);
    env.storage()
        .instance()
        .set(&FEE_HISTORY, &Vec::<FeeRecord>::new(env));
    env.storage()
        .instance()
        .set(&PREMIUM_USERS, &Vec::<PremiumUser>::new(env));
    env.storage().instance().set(&TOTAL_FESS_COLLECTED, &0i128);
    env.storage().instance().set(&PAUSED, &false);

    env.events().publish(
        (Symbol::new(env, "fee_manager_initialized"), admin.clone()),
        (platform_wallet.clone(), env.ledger().timestamp()),
    );
}

pub fn is_paused(env: &Env) -> bool {
    env.storage().instance().get(&PAUSED).unwrap_or(false)
}

pub fn pause(env: &Env, admin: Address) -> Result<(), Error> {
    admin.require_auth();
    let fee_config: FeeConfig = env.storage().instance().get(&FEE_CONFIG).unwrap_or_else(|| handle_error(env, Error::NotInitialized));
    if fee_config.admin != admin {
        return Err(Error::Unauthorized);
    }
    
    if is_paused(env) {
        return Err(Error::AlreadyPaused);
    }
    
    env.storage().instance().set(&PAUSED, &true);
    
    env.events().publish(
        (Symbol::new(env, "contract_paused"), admin),
        env.ledger().timestamp(),
    );
    
    Ok(())
}

pub fn unpause(env: &Env, admin: Address) -> Result<(), Error> {
    admin.require_auth();
    let fee_config: FeeConfig = env.storage().instance().get(&FEE_CONFIG).unwrap_or_else(|| handle_error(env, Error::NotInitialized));
    if fee_config.admin != admin {
        return Err(Error::Unauthorized);
    }
    
    if !is_paused(env) {
        return Err(Error::NotPaused);
    }
    
    env.storage().instance().set(&PAUSED, &false);
    
    env.events().publish(
        (Symbol::new(env, "contract_unpaused"), admin),
        env.ledger().timestamp(),
    );
    
    Ok(())
}


pub fn set_fee_rates(
    env: &Env,
    escrow_fee_percentage: i128,
    dispute_fee_percentage: i128,
    arbitrator_fee_percentage: i128,
) {
    if is_paused(env) {
        handle_error(env, Error::ContractPaused);
    }

    let mut fee_config: FeeConfig = env.storage().instance().get(&FEE_CONFIG).unwrap();

    // Only admin can set fee rates
    fee_config.admin.require_auth();

    // Input validation
    if let Err(e) = validate_fee_rates(
        escrow_fee_percentage,
        dispute_fee_percentage,
        arbitrator_fee_percentage,
    ) {
        handle_error(env, e);
    }

    fee_config.escrow_fee_percentage = escrow_fee_percentage;
    fee_config.dispute_fee_percentage = dispute_fee_percentage;
    fee_config.arbitrator_fee_percentage = arbitrator_fee_percentage;

    env.storage().instance().set(&FEE_CONFIG, &fee_config);

    env.events().publish(
        (
            Symbol::new(env, "fee_rates_updated"),
            fee_config.admin.clone(),
        ),
        (
            escrow_fee_percentage,
            dispute_fee_percentage,
            arbitrator_fee_percentage,
        ),
    );
}

pub fn add_premium_user(env: &Env, user: Address) {
    if is_paused(env) {
        handle_error(env, Error::ContractPaused);
    }
    let fee_config: FeeConfig = env.storage().instance().get(&FEE_CONFIG).unwrap();
    fee_config.admin.require_auth();

    // Input validation
    if let Err(_) = validate_address(&user) {
        handle_error(env, Error::Unauthorized);
    }

    let mut premium_users: Vec<PremiumUser> = env.storage().instance().get(&PREMIUM_USERS).unwrap();

    // Check if user is already premium
    for premium_user in premium_users.iter() {
        if premium_user.address == user {
            handle_error(env, Error::PremiumUserAlreadyExists);
        }
    }

    let new_premium_user = PremiumUser {
        address: user.clone(),
        added_at: env.ledger().timestamp(),
        added_by: fee_config.admin.clone(),
    };

    premium_users.push_back(new_premium_user);
    env.storage().instance().set(&PREMIUM_USERS, &premium_users);

    env.events().publish(
        (
            Symbol::new(env, "premium_user_added"),
            fee_config.admin.clone(),
        ),
        (user, env.ledger().timestamp()),
    );
}

pub fn remove_premium_user(env: &Env, user: Address) {
    if is_paused(env) {
        handle_error(env, Error::ContractPaused);
    }
    let fee_config: FeeConfig = env.storage().instance().get(&FEE_CONFIG).unwrap();
    fee_config.admin.require_auth();

    let mut premium_users: Vec<PremiumUser> = env.storage().instance().get(&PREMIUM_USERS).unwrap();
    let mut found = false;

    for i in 0..premium_users.len() {
        if premium_users.get(i).unwrap().address == user {
            premium_users.remove(i);
            found = true;
            break;
        }
    }

    if !found {
        handle_error(env, Error::PremiumUserNotFound);
    }

    env.storage().instance().set(&PREMIUM_USERS, &premium_users);

    env.events().publish(
        (
            Symbol::new(env, "premium_user_removed"),
            fee_config.admin.clone(),
        ),
        (user, env.ledger().timestamp()),
    );
}

pub fn calculate_escrow_fee(env: &Env, amount: i128, user: Address) -> FeeCalculation {
    if is_paused(env) {
        handle_error(env, Error::ContractPaused);
    }
    // Input validation
    if let Err(e) = validate_fee_calculation(amount, &user) {
        handle_error(env, e);
    }

    let fee_config: FeeConfig = env.storage().instance().get(&FEE_CONFIG).unwrap();
    let is_premium = is_premium_user(env, user);

    let fee_percentage = if is_premium {
        0
    } else {
        fee_config.escrow_fee_percentage
    };
    let fee_amount = calculate_fee_amount(amount, fee_percentage);
    let net_amount = amount - fee_amount;

    FeeCalculation {
        original_amount: amount,
        fee_amount,
        net_amount,
        fee_percentage,
        is_premium,
    }
}

pub fn calculate_dispute_fee(env: &Env, amount: i128, user: Address) -> FeeCalculation {
    if is_paused(env) {
        handle_error(env, Error::ContractPaused);
    }
    // Input validation
    if let Err(e) = validate_fee_calculation(amount, &user) {
        handle_error(env, e);
    }

    let fee_config: FeeConfig = env.storage().instance().get(&FEE_CONFIG).unwrap();
    let is_premium = is_premium_user(env, user);

    let fee_percentage = if is_premium {
        0
    } else {
        fee_config.dispute_fee_percentage
    };
    let fee_amount = calculate_fee_amount(amount, fee_percentage);
    let net_amount = amount - fee_amount;

    FeeCalculation {
        original_amount: amount,
        fee_amount,
        net_amount,
        fee_percentage,
        is_premium,
    }
}

pub fn collect_fee(env: &Env, amount: i128, fee_type: u32, user: Address) -> i128 {
    if is_paused(env) {
        handle_error(env, Error::ContractPaused);
    }
    // Input validation
    if let Err(e) = validate_fee_calculation(amount, &user) {
        handle_error(env, e);
    }
    if let Err(e) = validate_fee_type(fee_type) {
        handle_error(env, e);
    }

    let fee_config: FeeConfig = env.storage().instance().get(&FEE_CONFIG).unwrap();
    let is_premium = is_premium_user(env, user.clone());
    let fee_percentage = match fee_type {
        FEE_TYPE_ESCROW => {
            if is_premium {
                0
            } else {
                fee_config.escrow_fee_percentage
            }
        }
        FEE_TYPE_DISPUTE => {
            if is_premium {
                0
            } else {
                fee_config.dispute_fee_percentage
            }
        }
        _ => 0,
    };

    let fee_amount = calculate_fee_amount(amount, fee_percentage);

    let net_amount = amount - fee_amount;

    // Update platform balance
    let mut platform_balance: i128 = env.storage().instance().get(&PLATFORM_BALANCE).unwrap();

    platform_balance += fee_amount;
    env.storage()
        .instance()
        .set(&PLATFORM_BALANCE, &platform_balance);

    // Update total fees collected
    let mut total_fees: i128 = env
        .storage()
        .instance()
        .get(&TOTAL_FESS_COLLECTED)
        .unwrap_or(0);
    total_fees += fee_amount;
    env.storage()
        .instance()
        .set(&TOTAL_FESS_COLLECTED, &total_fees);

    // Update fee stats
    let mut fee_stats: FeeStats = env.storage().instance().get(&FEE_STATS).unwrap();
    fee_stats.total_fees_collected += fee_amount;
    fee_stats.total_transactions += 1;

    match fee_type {
        FEE_TYPE_ESCROW => fee_stats.total_escrow_fees += fee_amount,
        FEE_TYPE_DISPUTE => fee_stats.total_dispute_fees += fee_amount,
        _ => {}
    }

    if is_premium {
        fee_stats.total_premium_exemptions += fee_amount;
    }

    env.storage().instance().set(&FEE_STATS, &fee_stats);

    // Record fee transaction
    let mut fee_history: Vec<FeeRecord> = env.storage().instance().get(&FEE_HISTORY).unwrap();
    let user_clone = user.clone();

    let fee_record = FeeRecord {
        timestamp: env.ledger().timestamp(),
        fee_type: fee_type,
        amount: fee_amount,
        user: user_clone,
        transaction_id: String::from_str(env, "tx"),
    };
    fee_history.push_back(fee_record);
    env.storage().instance().set(&FEE_HISTORY, &fee_history);

    env.events().publish(
        (Symbol::new(env, "fee_collected"), user),
        (fee_amount, net_amount, env.ledger().timestamp(), total_fees),
    );

    net_amount
}

pub fn withdraw_platform_fees(env: &Env, amount: i128) {
    if is_paused(env) {
        handle_error(env, Error::ContractPaused);
    }
    let fee_config: FeeConfig = env.storage().instance().get(&FEE_CONFIG).unwrap();
    fee_config.admin.require_auth();

    let mut platform_balance: i128 = env.storage().instance().get(&PLATFORM_BALANCE).unwrap();

    // Input validation
    if let Err(e) = validate_withdrawal_amount(amount, platform_balance) {
        handle_error(env, e);
    }

    platform_balance -= amount;
    env.storage()
        .instance()
        .set(&PLATFORM_BALANCE, &platform_balance);

    env.events().publish(
        (
            Symbol::new(env, "platform_fees_withdrawn"),
            fee_config.admin.clone(),
        ),
        (amount, platform_balance, env.ledger().timestamp()),
    );
}

pub fn get_fee_config(env: &Env) -> FeeConfig {
    if !env.storage().instance().has(&FEE_CONFIG) {
        handle_error(env, Error::NotInitialized);
    }
    env.storage().instance().get(&FEE_CONFIG).unwrap()
}

pub fn is_premium_user(env: &Env, user: Address) -> bool {
    let premium_users: Vec<PremiumUser> = env.storage().instance().get(&PREMIUM_USERS).unwrap();

    for premium_user in premium_users.iter() {
        if premium_user.address == user {
            return true;
        }
    }
    false
}

pub fn get_platform_balance(env: &Env) -> i128 {
    if env.storage().instance().has(&PLATFORM_BALANCE) {
        env.storage().instance().get(&PLATFORM_BALANCE).unwrap()
    } else {
        0
    }
}

pub fn get_fee_history(env: &Env) -> Vec<FeeRecord> {
    if env.storage().instance().has(&FEE_HISTORY) {
        env.storage().instance().get(&FEE_HISTORY).unwrap()
    } else {
        Vec::new(env)
    }
}

pub fn get_fee_stats(env: &Env) -> FeeStats {
    if env.storage().instance().has(&FEE_STATS) {
        env.storage().instance().get(&FEE_STATS).unwrap()
    } else {
        FeeStats {
            total_fees_collected: 0,
            total_escrow_fees: 0,
            total_dispute_fees: 0,
            total_premium_exemptions: 0,
            total_transactions: 0,
        }
    }
}

pub fn get_premium_users(env: &Env) -> Vec<PremiumUser> {
    if env.storage().instance().has(&PREMIUM_USERS) {
        env.storage().instance().get(&PREMIUM_USERS).unwrap()
    } else {
        Vec::new(env)
    }
}

pub fn get_total_fees(env: &Env) -> i128 {
    env.storage().instance().get(&TOTAL_FESS_COLLECTED).unwrap()
}

pub fn reset_total_fees_collected(env: &Env, admin: Address) -> Result<(), Error> {
    admin.require_auth();
    if is_paused(env) {
        handle_error(env, Error::ContractPaused);
    }

    let fee_config: FeeConfig = env.storage().instance().get(&FEE_CONFIG).unwrap();
    if fee_config.admin != admin {
        return Err(Error::Unauthorized);
    }

    env.storage().instance().set(&TOTAL_FESS_COLLECTED, &0i128);

    env.events().publish(
        (
            Symbol::new(env, "total_fees_collected_reset"),
            fee_config.admin.clone(),
        ),
        env.ledger().timestamp(),
    );
    Ok(())
}

pub fn get_platform_stats(env: &Env) -> Result<PlatformStats, Error> {
    if !env.storage().instance().has(&FEE_CONFIG) {
        handle_error(env, Error::NotInitialized);
    }

    // Fetch fee stats
    let fee_stats = env.storage().instance().get(&FEE_STATS).unwrap_or(FeeStats {
        total_fees_collected: 0,
        total_escrow_fees: 0,
        total_dispute_fees: 0,
        total_premium_exemptions: 0,
        total_transactions: 0,
    });

    // Fetch platform balance
    let platform_balance = env.storage().instance().get(&PLATFORM_BALANCE).unwrap_or(0);

    // Fetch premium user count
    let premium_users: Vec<PremiumUser> = env.storage().instance().get(&PREMIUM_USERS).unwrap_or(Vec::new(env));
    let premium_user_count = premium_users.len();

    // Fetch fee configuration
    let fee_config: FeeConfig = env.storage().instance().get(&FEE_CONFIG).unwrap();

    // Construct PlatformStats
    let stats = PlatformStats {
        total_fees_collected: fee_stats.total_fees_collected,
        total_escrow_fees: fee_stats.total_escrow_fees,
        total_dispute_fees: fee_stats.total_dispute_fees,
        total_premium_exemptions: fee_stats.total_premium_exemptions,
        total_transactions: fee_stats.total_transactions,
        platform_balance,
        premium_user_count,
        escrow_fee_percentage: fee_config.escrow_fee_percentage,
        dispute_fee_percentage: fee_config.dispute_fee_percentage,
        arbitrator_fee_percentage: fee_config.arbitrator_fee_percentage,
        timestamp: env.ledger().timestamp(),
    };
    Ok(stats)
}

// Helper function to calculate fee amount with precision
fn calculate_fee_amount(amount: i128, fee_percentage: i128) -> i128 {
    if fee_percentage == 0 {
        return 0;
    }

    // Calculate fee: (amount * fee_percentage) / 10000
    // This ensures precision and handles basis points correctly (100 = 1%)
    let fee_amount = (amount * fee_percentage) / 10000;

    // Ensure fee doesn't exceed the original amount
    if fee_amount > amount {
        amount
    } else {
        fee_amount
    }
}


pub fn set_config(env: &Env, caller: Address, config: ContractConfig) {
    if is_paused(env) {
        handle_error(env, Error::ContractPaused);
    }
    let fee_config: FeeConfig = env.storage().instance().get(&FEE_CONFIG).unwrap();
    
    // Only admin can set config
    fee_config.admin.require_auth();
    
    if fee_config.admin != caller {
        handle_error(env, Error::Unauthorized);
    }
    
    // Validate config parameters
    if let Err(e) = validate_config(&config) {
        handle_error(env, e);
    }
    
    env.storage().instance().set(&CONTRACT_CONFIG, &config);
    
    env.events().publish(
        (Symbol::new(env, "cfg_upd"), caller),
        (config.platform_fee_percentage, config.escrow_timeout_days, config.max_rating_per_day),
    );
}

pub fn get_config(env: &Env) -> ContractConfig {
    if !env.storage().instance().has(&CONTRACT_CONFIG) {
        handle_error(env, Error::NotInitialized);
    }
    env.storage().instance().get(&CONTRACT_CONFIG).unwrap()
}

// Helper function to validate config parameters
fn validate_config(config: &ContractConfig) -> Result<(), Error> {
    // Validate platform fee percentage (0-10%)
    if config.platform_fee_percentage > 10 {
        return Err(Error::InvalidAmount);
    }
    
    // Validate escrow timeout (1-365 days)
    if config.escrow_timeout_days < 1 || config.escrow_timeout_days > 365 {
        return Err(Error::InvalidAmount);
    }
    
    // Validate max rating per day (1-100)
    if config.max_rating_per_day < 1 || config.max_rating_per_day > 100 {
        return Err(Error::InvalidAmount);
    }
    
    // Validate escrow amounts
    if config.min_escrow_amount >= config.max_escrow_amount {
        return Err(Error::InvalidAmount);
    }
    
    if config.min_escrow_amount < 1 {
        return Err(Error::InvalidAmount);
    }
    
    // Validate dispute timeout (1-720 hours = 30 days)
    if config.dispute_timeout_hours < 1 || config.dispute_timeout_hours > 720 {
        return Err(Error::InvalidAmount);
    }
    
    // Validate rate limit parameters
    if config.rate_limit_window_hours < 1 || config.rate_limit_window_hours > 168 {
        return Err(Error::InvalidAmount);
    }
    
    if config.max_rate_limit_calls < 1 || config.max_rate_limit_calls > 1000 {
        return Err(Error::InvalidAmount);
    }
    
    Ok(())
}

 

