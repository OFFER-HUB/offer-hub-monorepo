use crate::types::{PublicationStatus, UserProfile, VerificationLevel, Error};
use soroban_sdk::{Address, Env, Map, Symbol, String, Vec, symbol_short, contracttype};

pub const VERIFIED_USERS: Symbol = symbol_short!("VERIFIED");
pub const USER_PROFILES: Symbol = symbol_short!("PROFILES");
pub const BLACKLISTED_USERS: Symbol = symbol_short!("BLACKLIST");
pub const ADMIN: Symbol = symbol_short!("ADMIN");
pub const MODERATORS: Symbol = symbol_short!("MODS");
pub const RATE_LIMITS: Symbol = symbol_short!("RLIM");
pub const RATE_BYPASS: Symbol = symbol_short!("RLBYP");

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct RateLimitEntry { pub current_calls: u32, pub window_start: u64 }

fn rl_key(user: &Address, kind: &String) -> (Symbol, Address, String) { (RATE_LIMITS, user.clone(), kind.clone()) }
fn bypass_key(user: &Address) -> (Symbol, Address) { (RATE_BYPASS, user.clone()) }

pub fn set_rate_limit_bypass(env: &Env, admin: &Address, user: &Address, bypass: bool) -> Result<(), Error> {
    // Only admin can toggle
    if get_admin(env).as_ref() != Some(admin) { return Err(Error::Unauthorized); }
    env.storage().persistent().set(&bypass_key(user), &bypass);
    Ok(())
}
pub fn has_rate_limit_bypass(env: &Env, user: &Address) -> bool { env.storage().persistent().get(&bypass_key(user)).unwrap_or(false) }
pub fn reset_rate_limit(env: &Env, user: &Address, kind: &String) {
    let entry = RateLimitEntry { current_calls: 0, window_start: env.ledger().timestamp() };
    env.storage().persistent().set(&rl_key(user, kind), &entry);
}
pub fn check_rate_limit(env: &Env, user: &Address, kind: &String, max_calls: u32, window: u64) -> Result<(), Error> {
    if has_rate_limit_bypass(env, user) { return Ok(()); }
    let now = env.ledger().timestamp();
    let mut entry = env.storage().persistent().get(&rl_key(user, kind)).unwrap_or(RateLimitEntry{current_calls:0, window_start: now});
    if now.saturating_sub(entry.window_start) > window { entry.current_calls = 0; entry.window_start = now; }
    if entry.current_calls >= max_calls { return Err(Error::RateLimitExceeded); }
    entry.current_calls += 1; env.storage().persistent().set(&rl_key(user, kind), &entry); Ok(())
}


// Legacy functions for backward compatibility
pub fn get_verified_users(env: &Env) -> Map<Address, bool> {
    env.storage()
        .instance()
        .get(&VERIFIED_USERS)
        .unwrap_or_else(|| Map::new(env))
}

pub fn set_verified_users(env: &Env, users: &Map<Address, bool>) {
    env.storage().instance().set(&VERIFIED_USERS, users);
}

// New enhanced storage functions
pub fn get_user_profiles(env: &Env) -> Map<Address, UserProfile> {
    env.storage()
        .instance()
        .get(&USER_PROFILES)
        .unwrap_or_else(|| Map::new(env))
}

pub fn set_user_profiles(env: &Env, profiles: &Map<Address, UserProfile>) {
    env.storage().instance().set(&USER_PROFILES, profiles);
}

pub fn get_user_profile(env: &Env, user: &Address) -> Option<UserProfile> {
    let profiles = get_user_profiles(env);
    profiles.get(user.clone())
}

pub fn set_user_profile(env: &Env, user: &Address, profile: &UserProfile) {
    let mut profiles = get_user_profiles(env);
    profiles.set(user.clone(), profile.clone());
    set_user_profiles(env, &profiles);
}

pub fn remove_user_profile(env: &Env, user: &Address) {
    let mut profiles = get_user_profiles(env);
    profiles.remove(user.clone());
    set_user_profiles(env, &profiles);
}

// Blacklist functions
pub fn get_blacklisted_users(env: &Env) -> Vec<Address> {
    env.storage()
        .instance()
        .get(&BLACKLISTED_USERS)
        .unwrap_or_else(|| Vec::new(env))
}

pub fn set_blacklisted_users(env: &Env, blacklist: &Vec<Address>) {
    env.storage().instance().set(&BLACKLISTED_USERS, blacklist);
}

pub fn add_to_blacklist(env: &Env, user: &Address) {
    let mut blacklist = get_blacklisted_users(env);
    if !blacklist.contains(user) {
        blacklist.push_back(user.clone());
        set_blacklisted_users(env, &blacklist);
    }
}

pub fn remove_from_blacklist(env: &Env, user: &Address) {
    let blacklist = get_blacklisted_users(env);
    let mut new_blacklist = Vec::new(env);
    
    for i in 0..blacklist.len() {
        let addr = blacklist.get(i).unwrap();
        if addr != *user {
            new_blacklist.push_back(addr);
        }
    }
    
    set_blacklisted_users(env, &new_blacklist);
}

pub fn is_blacklisted(env: &Env, user: &Address) -> bool {
    let blacklist = get_blacklisted_users(env);
    blacklist.contains(user)
}

// Admin and moderator functions
pub fn get_admin(env: &Env) -> Option<Address> {
    env.storage().instance().get(&ADMIN)
}

pub fn set_admin(env: &Env, admin: &Address) {
    env.storage().instance().set(&ADMIN, admin);
}

pub fn get_moderators(env: &Env) -> Vec<Address> {
    env.storage()
        .instance()
        .get(&MODERATORS)
        .unwrap_or_else(|| Vec::new(env))
}

pub fn set_moderators(env: &Env, moderators: &Vec<Address>) {
    env.storage().instance().set(&MODERATORS, moderators);
}

// Helper functions
pub fn create_default_profile(env: &Env, level: VerificationLevel, expires_at: u64) -> UserProfile {
    UserProfile {
        verification_level: level,
        verified_at: env.ledger().timestamp(),
        expires_at,
        metadata: String::from_str(env, ""),
        is_blacklisted: false,
        publication_status: PublicationStatus::Private,
        validations: Vec::new(env),
    }
}

 