use soroban_sdk::{Address, Env, String, Symbol, Vec};

use crate::{
    error::{handle_error, Error},
    storage::{
        DEFAULT_ARBITRATOR_FEE_PERCENTAGE, DEFAULT_DISPUTE_FEE_PERCENTAGE,
        DEFAULT_ESCROW_FEE_PERCENTAGE, DISPUTE_FEE, ESCROW_FEE, FEE_CONFIG, FEE_HISTORY,
        FEE_PRECISION, FEE_STATS, PLATFORM_BALANCE, PREMIUM_USERS,
    },
    types::{FeeCalculation, FeeConfig, FeeDistribution, FeeRecord, FeeStats, PremiumUser, FEE_TYPE_ESCROW, FEE_TYPE_DISPUTE},
};

pub fn initialize(env: &Env, admin: Address, platform_wallet: Address) {
    if env.storage().instance().has(&FEE_CONFIG) {
        handle_error(env, Error::AlreadyInitialized);
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

    env.storage().instance().set(&FEE_CONFIG, &fee_config);
    env.storage().instance().set(&PLATFORM_BALANCE, &0);
    env.storage().instance().set(&FEE_STATS, &fee_stats);
    env.storage().instance().set(&FEE_HISTORY, &Vec::<FeeRecord>::new(env));
    env.storage().instance().set(&PREMIUM_USERS, &Vec::<PremiumUser>::new(env));

    env.events().publish(
        (Symbol::new(env, "fee_manager_initialized"), admin.clone()),
        (platform_wallet.clone(), env.ledger().timestamp()),
    );
}

pub fn set_fee_rates(
    env: &Env,
    escrow_fee_percentage: i128,
    dispute_fee_percentage: i128,
    arbitrator_fee_percentage: i128,
) {
    let mut fee_config: FeeConfig = env.storage().instance().get(&FEE_CONFIG).unwrap();
    
    // Only admin can set fee rates
    fee_config.admin.require_auth();

    // Validate fee percentages (0-1000 basis points = 0-10%)
    if escrow_fee_percentage < 0 || escrow_fee_percentage > 1000 {
        handle_error(env, Error::InvalidFeePercentage);
    }
    if dispute_fee_percentage < 0 || dispute_fee_percentage > 1000 {
        handle_error(env, Error::InvalidFeePercentage);
    }
    if arbitrator_fee_percentage < 0 || arbitrator_fee_percentage > 1000 {
        handle_error(env, Error::InvalidFeePercentage);
    }

    fee_config.escrow_fee_percentage = escrow_fee_percentage;
    fee_config.dispute_fee_percentage = dispute_fee_percentage;
    fee_config.arbitrator_fee_percentage = arbitrator_fee_percentage;

    env.storage().instance().set(&FEE_CONFIG, &fee_config);

    env.events().publish(
        (Symbol::new(env, "fee_rates_updated"), fee_config.admin.clone()),
        (escrow_fee_percentage, dispute_fee_percentage, arbitrator_fee_percentage),
    );
}

pub fn add_premium_user(env: &Env, user: Address) {
    let fee_config: FeeConfig = env.storage().instance().get(&FEE_CONFIG).unwrap();
    fee_config.admin.require_auth();

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
        (Symbol::new(env, "premium_user_added"), fee_config.admin.clone()),
        (user, env.ledger().timestamp()),
    );
}

pub fn remove_premium_user(env: &Env, user: Address) {
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
        (Symbol::new(env, "premium_user_removed"), fee_config.admin.clone()),
        (user, env.ledger().timestamp()),
    );
}

pub fn calculate_escrow_fee(env: &Env, amount: i128, user: Address) -> FeeCalculation {
    if amount <= 0 {
        handle_error(env, Error::InvalidAmount);
    }

    let fee_config: FeeConfig = env.storage().instance().get(&FEE_CONFIG).unwrap();
    let is_premium = is_premium_user(env, user);

    let fee_percentage = if is_premium { 0 } else { fee_config.escrow_fee_percentage };
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
    if amount <= 0 {
        handle_error(env, Error::InvalidAmount);
    }

    let fee_config: FeeConfig = env.storage().instance().get(&FEE_CONFIG).unwrap();
    let is_premium = is_premium_user(env, user);

    let fee_percentage = if is_premium { 0 } else { fee_config.dispute_fee_percentage };
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
    if amount <= 0 {
        handle_error(env, Error::InvalidAmount);
    }

    let fee_config: FeeConfig = env.storage().instance().get(&FEE_CONFIG).unwrap();
    let is_premium = is_premium_user(env, user.clone());

    let fee_percentage = match fee_type {
        FEE_TYPE_ESCROW => if is_premium { 0 } else { fee_config.escrow_fee_percentage },
        FEE_TYPE_DISPUTE => if is_premium { 0 } else { fee_config.dispute_fee_percentage },
        _ => 0,
    };

    let fee_amount = calculate_fee_amount(amount, fee_percentage);
    let net_amount = amount - fee_amount;

    // Update platform balance
    let mut platform_balance: i128 = env.storage().instance().get(&PLATFORM_BALANCE).unwrap();
    platform_balance += fee_amount;
    env.storage().instance().set(&PLATFORM_BALANCE, &platform_balance);

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
        (fee_amount, net_amount, env.ledger().timestamp()),
    );

    net_amount
}

pub fn withdraw_platform_fees(env: &Env, amount: i128) {
    let fee_config: FeeConfig = env.storage().instance().get(&FEE_CONFIG).unwrap();
    fee_config.admin.require_auth();

    let mut platform_balance: i128 = env.storage().instance().get(&PLATFORM_BALANCE).unwrap();

    if amount <= 0 || amount > platform_balance {
        handle_error(env, Error::InvalidAmount);
    }

    platform_balance -= amount;
    env.storage().instance().set(&PLATFORM_BALANCE, &platform_balance);

    env.events().publish(
        (Symbol::new(env, "platform_fees_withdrawn"), fee_config.admin.clone()),
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

// Helper function to distribute fees between platform and arbitrator
pub fn distribute_dispute_fee(env: &Env, total_fee: i128) -> FeeDistribution {
    let fee_config: FeeConfig = env.storage().instance().get(&FEE_CONFIG).unwrap();
    
    let arbitrator_fee = calculate_fee_amount(total_fee, fee_config.arbitrator_fee_percentage);
    let platform_fee = total_fee - arbitrator_fee;

    FeeDistribution {
        platform_fee,
        arbitrator_fee,
        total_fee,
    }
} 