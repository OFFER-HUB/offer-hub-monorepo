use crate::types::VerificationLevel;
use soroban_sdk::{Address, Env, Symbol};

pub fn emit_user_registered(env: &Env, user: &Address) {
    let topic = Symbol::new(env, "USER_REGISTERED");
    env.events().publish((topic,), user.clone());
}

pub fn emit_user_verified(env: &Env, user: &Address, level: &VerificationLevel, expires_at: u64) {
    let topic = Symbol::new(env, "USER_VERIFIED");
    env.events().publish((topic,), (user.clone(), level.clone(), expires_at));
}

pub fn emit_user_unverified(env: &Env, user: &Address) {
    let topic = Symbol::new(env, "USER_UNVERIFIED");
    env.events().publish((topic,), user.clone());
}

pub fn emit_user_blacklisted(env: &Env, user: &Address, admin: &Address) {
    let topic = Symbol::new(env, "USER_BLACKLISTED");
    env.events().publish((topic,), (user.clone(), admin.clone()));
}

pub fn emit_user_unblacklisted(env: &Env, user: &Address, admin: &Address) {
    let topic = Symbol::new(env, "USER_UNBLACKLISTED");
    env.events().publish((topic,), (user.clone(), admin.clone()));
}

pub fn emit_verification_level_updated(env: &Env, user: &Address, old_level: &VerificationLevel, new_level: &VerificationLevel) {
    let topic = Symbol::new(env, "VERIFICATION_LEVEL_UPDATED");
    env.events().publish((topic,), (user.clone(), old_level.clone(), new_level.clone()));
}

pub fn emit_metadata_updated(env: &Env, user: &Address) {
    let topic = Symbol::new(env, "METADATA_UPDATED");
    env.events().publish((topic,), user.clone());
}

pub fn emit_verification_renewed(env: &Env, user: &Address, new_expiry: u64) {
    let topic = Symbol::new(env, "VERIFICATION_RENEWED");
    env.events().publish((topic,), (user.clone(), new_expiry));
}

pub fn emit_bulk_verification_completed(env: &Env, count: u32) {
    let topic = Symbol::new(env, "BULK_VERIFICATION_COMPLETED");
    env.events().publish((topic,), count);
}

pub fn emit_admin_initialized(env: &Env, admin: &Address) {
    let topic = Symbol::new(env, "ADMIN_INITIALIZED");
    env.events().publish((topic,), admin.clone());
}

pub fn emit_admin_transferred(env: &Env, old_admin: &Address, new_admin: &Address) {
    let topic = Symbol::new(env, "ADMIN_TRANSFERRED");
    env.events().publish((topic,), (old_admin.clone(), new_admin.clone()));
}

pub fn emit_moderator_added(env: &Env, moderator: &Address, admin: &Address) {
    let topic = Symbol::new(env, "MODERATOR_ADDED");
    env.events().publish((topic,), (moderator.clone(), admin.clone()));
}

pub fn emit_moderator_removed(env: &Env, moderator: &Address, admin: &Address) {
    let topic = Symbol::new(env, "MODERATOR_REMOVED");
    env.events().publish((topic,), (moderator.clone(), admin.clone()));
}

 