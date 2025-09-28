use crate::error::Error;
use soroban_sdk::{contracttype, symbol_short, Address, Env, String, Symbol, Vec, log};

pub const ESCROW_DATA: Symbol = symbol_short!("ESCROW");
pub const INITIALIZED: Symbol = symbol_short!("INIT");
pub const CONTRACT_CONFIG: Symbol = symbol_short!("CONFIG");

pub const PAUSED: Symbol = symbol_short!("PAUSED");


// Rate limit storage keys
pub const RATE_LIMITS: Symbol = symbol_short!("RLIM");
pub const RATE_BYPASS: Symbol = symbol_short!("RLBYP");

// Logging storage keys
pub const CALL_LOGS: Symbol = symbol_short!("LOGS");
pub const LOG_COUNT: Symbol = symbol_short!("LCOUNT");
pub const MAX_LOGS: u32 = 100;


// Default configuration values
pub const DEFAULT_MIN_ESCROW_AMOUNT: i128 = 1000;       // Minimum 1000 units
pub const DEFAULT_MAX_ESCROW_AMOUNT: i128 = 1000000000; // Maximum 1 billion units
pub const DEFAULT_TIMEOUT_DAYS: u32 = 30;               // 30 days
pub const DEFAULT_MAX_MILESTONES: u32 = 20;              // Maximum 20 milestones
pub const DEFAULT_FEE_PERCENTAGE: i128 = 250;           // 2.5% fee
pub const DEFAULT_RATE_LIMIT_CALLS: u32 = 10;           // 10 calls per window
pub const DEFAULT_RATE_LIMIT_WINDOW_HOURS: u32 = 1;     // 1 hour window

pub const TOTAL_ESCROW_COUNT: Symbol = symbol_short!("ESCCOUNT");


#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct RateLimitEntry {
    pub current_calls: u32,
    pub window_start: u64,
}

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct CallLog {
    pub function_name: String,
    pub caller: Address,
    pub timestamp: u64,
    pub success: bool,
    pub gas_used: u64,
    pub transaction_hash: String,
}

fn rl_key(user: &Address, kind: &String) -> (Symbol, Address, String) {
    (RATE_LIMITS, user.clone(), kind.clone())
}
fn bypass_key(user: &Address) -> (Symbol, Address) {
    (RATE_BYPASS, user.clone())
}

pub fn has_rate_limit_bypass(env: &Env, user: &Address) -> bool {
    env.storage()
        .persistent()
        .get(&bypass_key(user))
        .unwrap_or(false)
}

pub fn set_rate_limit_bypass_flag(env: &Env, user: &Address, bypass: bool) {
    env.storage().persistent().set(&bypass_key(user), &bypass);
}

pub fn check_rate_limit(
    env: &Env,
    user: &Address,
    kind: &String,
    max_calls: u32,
    window_secs: u64,
) -> Result<(), Error> {
    if has_rate_limit_bypass(env, user) {
        return Ok(());
    }
    let now = env.ledger().timestamp();
    let mut entry = env
        .storage()
        .persistent()
        .get(&rl_key(user, kind))
        .unwrap_or(RateLimitEntry {
            current_calls: 0,
            window_start: now,
        });
    if now.saturating_sub(entry.window_start) > window_secs {
        entry.current_calls = 0;
        entry.window_start = now;
    }
    if entry.current_calls >= max_calls {
        return Err(Error::RateLimitExceeded);
    }
    entry.current_calls += 1;
    env.storage().persistent().set(&rl_key(user, kind), &entry);
    // Emit basic rate limit event
    env.events().publish(
        (Symbol::new(env, "rate_limit"), user.clone()),
        (kind.clone(), entry.current_calls, entry.window_start),
    );
    Ok(())
}

pub fn reset_rate_limit(env: &Env, user: &Address, kind: &String) {
    let entry = RateLimitEntry {
        current_calls: 0,
        window_start: env.ledger().timestamp(),
    };
    env.storage().persistent().set(&rl_key(user, kind), &entry);
}

// Logging functions
pub fn add_call_log(env: &Env, log: &CallLog) {
    let mut count = env.storage().instance().get(&LOG_COUNT).unwrap_or(0);

    // Rotate logs if we exceed MAX_LOGS
    if count >= MAX_LOGS {
        // Remove oldest log (index 0) and shift all logs down
        for i in 0..count - 1 {
            if let Some(next_log) = env
                .storage()
                .instance()
                .get::<(Symbol, u32), CallLog>(&(CALL_LOGS, i + 1))
            {
                env.storage().instance().set(&(CALL_LOGS, i), &next_log);
            }
        }
        count = MAX_LOGS - 1;
    }

    // Add new log
    env.storage().instance().set(&(CALL_LOGS, count), log);
    env.storage().instance().set(&LOG_COUNT, &(count + 1));
}

pub fn get_call_logs(env: &Env) -> Vec<CallLog> {
    let count = env.storage().instance().get(&LOG_COUNT).unwrap_or(0);
    let mut logs = Vec::new(env);

    for i in 0..count {
        if let Some(log) = env
            .storage()
            .instance()
            .get::<(Symbol, u32), CallLog>(&(CALL_LOGS, i))
        {
            logs.push_back(log);
        }
    }

    logs
}

pub fn clear_call_logs(env: &Env) {
    let count = env.storage().instance().get(&LOG_COUNT).unwrap_or(0);

    for i in 0..count {
        env.storage().instance().remove(&(CALL_LOGS, i));
    }

    env.storage().instance().set(&LOG_COUNT, &0);
}

pub fn get_total_transactions(env: &Env) -> u64 {
    env.storage()
        .instance()
        .get(&TOTAL_ESCROW_COUNT)
        .unwrap_or(0)
}

pub fn set_escrow_transaction_count(env: &Env, count: u64) {
    env.storage().instance().set(&TOTAL_ESCROW_COUNT, &count);
}

pub fn increment_escrow_transaction_count(env: &Env) -> u64 {
    let current_count = get_total_transactions(env);
    let new_escrow_count = current_count + 1;
    set_escrow_transaction_count(env, new_escrow_count);
    new_escrow_count
}

// --- Escrow state handling ---
use crate::types::{EscrowData, EscrowState};
use crate::error::handle_error;

// pub fn set_escrow_state(env: &Env, new_state: EscrowState) {
//     let mut data: EscrowData = env.storage().instance().get(&ESCROW_DATA).unwrap();


//     if !data.state.can_transition_to(&new_state) {
//         handle_error(env, Error::InvalidStatus)
//     }

//     data.state = new_state.clone();
//     env.storage().instance().set(&ESCROW_DATA, &data);

//     log!(env, "Escrow state changed to {:?}", new_state);
// }

pub fn set_escrow_state(env: &Env, new_state: EscrowState) {
        let mut data: EscrowData = crate::storage::get_escrow_data(env);
        // Guard initialization and load
    
        if !data.state.can_transition_to(&new_state) {
            handle_error(env, Error::InvalidStatus)
        }
    
        let prev = data.state;
        let now = env.ledger().timestamp();
    
        // Maintain audit timestamps tied to states
        match new_state {
            EscrowState::Funded => data.funded_at = Some(now),
            EscrowState::Released => {
                data.released_at = Some(now);
                data.resolved_at = data.resolved_at.or(Some(now));
            }
            EscrowState::Refunded => {
                data.resolved_at = Some(now);
            }
            EscrowState::Disputed => data.disputed_at = Some(now),
            EscrowState::Created => {}
        }
    
        data.state = new_state;
        env.storage().instance().set(&ESCROW_DATA, &data);
    
        // Emit event + keep debug log
        env.events().publish(
            (Symbol::new(env, "escrow_state_changed"), env.current_contract_address()),
            (&prev, &data.state, now),
        );

        log!(env, "Escrow state changed from {:?} to {:?}", prev, data.state);
    }

pub fn get_escrow_state(env: &Env) -> EscrowState {
    get_escrow_data(env).state
}

pub fn get_escrow_data(env: &Env) -> EscrowData {
    if !env.storage().instance().has(&INITIALIZED) {
        handle_error(env, Error::NotInitialized);
    }
    
    env.storage().instance().get(&ESCROW_DATA).unwrap()
}

pub fn is_escrow_funded(env: &Env) -> bool {
    get_escrow_state(env) == EscrowState::Funded
}