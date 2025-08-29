#![cfg(test)]

use crate::{Contract, types::{Error, VerificationLevel}};
use soroban_sdk::{testutils::Address as _, Address, Env, String};

#[test]
fn test_basic_legacy_functionality() {
    let env = Env::default();
    let contract_id = env.register(Contract, ());
    let user = Address::generate(&env);

    env.as_contract(&contract_id, || {
        // Test unregistered user is not verified
        let is_verified = Contract::is_verified(env.clone(), user.clone());
        assert!(!is_verified);
        
        // Test get_user_status for unregistered user
        let status = Contract::get_user_status(env.clone(), user.clone());
        assert!(!status.is_verified);
        assert!(!status.is_blacklisted);
        assert_eq!(status.verification_expires_at, 0);
        assert!(!status.is_expired);
    });
}

#[test]
fn test_verification_levels() {
    let env = Env::default();
    let contract_id = env.register(Contract, ());

    env.as_contract(&contract_id, || {
        // Test verification level enum values
        assert_eq!(VerificationLevel::Basic as u32, 1);
        assert_eq!(VerificationLevel::Premium as u32, 2);
        assert_eq!(VerificationLevel::Enterprise as u32, 3);
    });
}

#[test]
fn test_get_admin_when_not_initialized() {
    let env = Env::default();
    let contract_id = env.register(Contract, ());

    env.as_contract(&contract_id, || {
        // Admin should be None when not initialized
        let admin = Contract::get_admin(env.clone());
        assert_eq!(admin, None);
    });
}

#[test]
fn test_get_moderators_when_empty() {
    let env = Env::default();
    let contract_id = env.register(Contract, ());

    env.as_contract(&contract_id, || {
        // Moderators list should be empty initially
        let moderators = Contract::get_moderators(env.clone());
        assert_eq!(moderators.len(), 0);
    });
}

#[test]
fn test_blacklist_check_for_non_blacklisted_user() {
    let env = Env::default();
    let contract_id = env.register(Contract, ());
    let user = Address::generate(&env);

    env.as_contract(&contract_id, || {
        // User should not be blacklisted initially
        let is_blacklisted = Contract::is_user_blacklisted(env.clone(), user.clone());
        assert!(!is_blacklisted);
    });
}

#[test]
fn test_get_user_profile_for_nonexistent_user() {
    let env = Env::default();
    let contract_id = env.register(Contract, ());
    let user = Address::generate(&env);

    env.as_contract(&contract_id, || {
        // User profile should be None for non-existent user
        let profile = Contract::get_user_profile(env.clone(), user.clone());
        assert!(profile.is_none());
    });
}

#[test]
fn test_get_verification_level_for_nonexistent_user() {
    let env = Env::default();
    let contract_id = env.register(Contract, ());
    let user = Address::generate(&env);

    env.as_contract(&contract_id, || {
        // Verification level should be None for non-existent user
        let level = Contract::get_verification_level(env.clone(), user.clone());
        assert!(level.is_none());
    });
}

// Basic functionality tests that don't require authentication
#[test]
fn test_error_types() {
    // Test that error types are properly defined
    assert_eq!(Error::Unauthorized as u32, 1);
    assert_eq!(Error::AlreadyRegistered as u32, 2);
    assert_eq!(Error::UserNotFound as u32, 3);
    assert_eq!(Error::AlreadyBlacklisted as u32, 4);
    assert_eq!(Error::NotBlacklisted as u32, 5);
    assert_eq!(Error::InvalidVerificationLevel as u32, 6);
    assert_eq!(Error::VerificationExpired as u32, 7);
    assert_eq!(Error::NotInitialized as u32, 8);
    assert_eq!(Error::AlreadyInitialized as u32, 9);
    assert_eq!(Error::CannotBlacklistAdmin as u32, 10);
    assert_eq!(Error::CannotBlacklistModerator as u32, 11);
}

#[test]
fn test_user_status_structure() {
    let env = Env::default();
    let contract_id = env.register(Contract, ());
    let user = Address::generate(&env);

    env.as_contract(&contract_id, || {
        let status = Contract::get_user_status(env.clone(), user.clone());
        
        // Verify UserStatus has all expected fields
        assert!(!status.is_verified);
        assert_eq!(status.verification_level, VerificationLevel::Basic); // Default for non-verified
        assert!(!status.is_blacklisted);
        assert_eq!(status.verification_expires_at, 0);
        assert!(!status.is_expired);
    });
}

#[test]
fn test_string_creation() {
    let env = Env::default();
    let contract_id = env.register(Contract, ());

    env.as_contract(&contract_id, || {
        // Test that we can create strings (needed for metadata)
        let test_string = String::from_str(&env, "Test metadata");
        assert_eq!(test_string.len(), 13);
    });
}
