#![no_std]

mod access;
mod contract;
mod events;
mod storage;
mod types;
mod test;
mod basic_test;
mod validation;

use crate::contract::UserRegistryContract;
use crate::types::{Error, UserProfile, UserStatus, VerificationLevel};
use soroban_sdk::{contract, contractimpl, Address, Env, String, Vec};

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
    // ==================== INITIALIZATION ====================
    
    /// Initialize the contract with an admin
    pub fn initialize_admin(env: Env, admin: Address) -> Result<(), Error> {
        UserRegistryContract::initialize_admin(env, admin)
    }

    // ==================== LEGACY FUNCTIONS (for backward compatibility) ====================
    
    /// Legacy function for registering a verified user
    pub fn register_verified_user(env: Env, user: Address) -> Result<(), Error> {
        UserRegistryContract::register_verified_user(env, user)
    }

    /// Legacy function to check if user is verified
    pub fn is_verified(env: Env, user: Address) -> bool {
        UserRegistryContract::is_verified(env, user)
    }

    // ==================== ENHANCED USER VERIFICATION ====================
    
    /// Verify a user with a specific level and optional expiration
    pub fn verify_user(
        env: Env,
        admin: Address,
        user: Address,
        level: VerificationLevel,
        expires_at: u64,
        metadata: String,
    ) -> Result<(), Error> {
        UserRegistryContract::verify_user(env, admin, user, level, expires_at, metadata)
    }

    /// Unverify a user
    pub fn unverify_user(env: Env, admin: Address, user: Address) -> Result<(), Error> {
        UserRegistryContract::unverify_user(env, admin, user)
    }

    /// Update verification level
    pub fn update_verification_level(
        env: Env,
        admin: Address,
        user: Address,
        new_level: VerificationLevel,
    ) -> Result<(), Error> {
        UserRegistryContract::update_verification_level(env, admin, user, new_level)
    }

    /// Renew verification (extend expiration)
    pub fn renew_verification(
        env: Env,
        admin: Address,
        user: Address,
        new_expires_at: u64,
    ) -> Result<(), Error> {
        UserRegistryContract::renew_verification(env, admin, user, new_expires_at)
    }

    // ==================== BLACKLIST FUNCTIONALITY ====================
    
    /// Add user to blacklist
    pub fn blacklist_user(env: Env, admin: Address, user: Address) -> Result<(), Error> {
        UserRegistryContract::blacklist_user(env, admin, user)
    }

    /// Remove user from blacklist
    pub fn unblacklist_user(env: Env, admin: Address, user: Address) -> Result<(), Error> {
        UserRegistryContract::unblacklist_user(env, admin, user)
    }

    /// Check if user is blacklisted
    pub fn is_user_blacklisted(env: Env, user: Address) -> bool {
        UserRegistryContract::is_user_blacklisted(env, user)
    }

    // ==================== BULK OPERATIONS ====================
    
    /// Bulk verify users
    pub fn bulk_verify_users(
        env: Env,
        admin: Address,
        users: Vec<Address>,
        level: VerificationLevel,
        expires_at: u64,
        metadata: String,
    ) -> Result<(), Error> {
        UserRegistryContract::bulk_verify_users(env, admin, users, level, expires_at, metadata)
    }

    // ==================== USER PROFILE METADATA ====================
    
    /// Update user metadata
    pub fn update_user_metadata(
        env: Env,
        caller: Address,
        user: Address,
        metadata: String,
    ) -> Result<(), Error> {
        UserRegistryContract::update_user_metadata(env, caller, user, metadata)
    }

    // ==================== STATUS CHECKING ====================
    
    /// Get comprehensive user status
    pub fn get_user_status(env: Env, user: Address) -> UserStatus {
        UserRegistryContract::get_user_status(env, user)
    }

    /// Get user profile
    pub fn get_user_profile(env: Env, user: Address) -> Option<UserProfile> {
        UserRegistryContract::get_user_profile_data(env, user)
    }

    /// Check verification level
    pub fn get_verification_level(env: Env, user: Address) -> Option<VerificationLevel> {
        UserRegistryContract::get_verification_level(env, user)
    }

    // ==================== ACCESS CONTROL ====================
    
    /// Add moderator
    pub fn add_moderator(env: Env, admin: Address, moderator: Address) -> Result<(), Error> {
        UserRegistryContract::add_moderator(env, admin, moderator)
    }

    /// Remove moderator
    pub fn remove_moderator(env: Env, admin: Address, moderator: Address) -> Result<(), Error> {
        UserRegistryContract::remove_moderator(env, admin, moderator)
    }

    /// Transfer admin role
    pub fn transfer_admin(env: Env, current_admin: Address, new_admin: Address) -> Result<(), Error> {
        UserRegistryContract::transfer_admin(env, current_admin, new_admin)
    }

    /// Get current admin
    pub fn get_admin(env: Env) -> Option<Address> {
        UserRegistryContract::get_admin(env)
    }

    /// Get all moderators
    pub fn get_moderators(env: Env) -> Vec<Address> {
        UserRegistryContract::get_moderators(env)
    }

    // ===== Rate limiting admin helpers =====
    pub fn set_rate_limit_bypass(env: Env, admin: Address, user: Address, bypass: bool) -> Result<(), Error> {
        UserRegistryContract::set_rate_limit_bypass(env, admin, user, bypass)
    }

    pub fn reset_rate_limit(env: Env, admin: Address, user: Address, limit_type: String) -> Result<(), Error> {
        UserRegistryContract::reset_rate_limit(env, admin, user, limit_type)
    }
} 