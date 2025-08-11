#![cfg(test)]

use soroban_sdk::{
    testutils::{Address as _, Ledger as _},
    Address, Env, Symbol, String, Vec,
};

// Import contract types
use userregistry_contract::Contract as UserRegistryContract;
use publication_contract::Contract as PublicationContract;
use escrow_contract::EscrowContract;
use dispute_contract::DisputeResolutionContract;
use reputation_nft_contract::Contract as ReputationNFTContract;
use fee_manager_contract::FeeManagerContract;

// Test utilities
use super::test_utils::*;

/// Test unauthorized access attempts
#[test]
fn test_unauthorized_access_attempts() {
    let env = Env::default();
    let test_setup = setup_test_environment(&env);
    
    let unauthorized_user = Address::generate(&env);
    let victim = Address::generate(&env);
    
    // Test unauthorized user trying to verify another user
    env.set_invoker(unauthorized_user.clone());
    
    let result = std::panic::catch_unwind(|| {
        test_setup.user_registry.verify_user(
            &unauthorized_user,
            &victim,
            &VerificationLevel::Basic,
            &(env.ledger().timestamp() + 365 * 24 * 60 * 60),
            &String::from_str(&env, "Unauthorized verification"),
        );
    });
    
    assert!(result.is_err());
    
    // Test unauthorized user trying to transfer admin role
    let result = std::panic::catch_unwind(|| {
        test_setup.user_registry.transfer_admin(&unauthorized_user, &victim);
    });
    
    assert!(result.is_err());
    
    // Test unauthorized user trying to set fee rates
    let result = std::panic::catch_unwind(|| {
        test_setup.fee_manager.set_fee_rates(&5_i128, &10_i128, &15_i128);
    });
    
    assert!(result.is_err());
    
    // Test unauthorized user trying to mint NFTs
    let result = std::panic::catch_unwind(|| {
        test_setup.reputation_nft.mint(
            &unauthorized_user,
            &victim,
            &1_u32,
            &String::from_str(&env, "Unauthorized NFT"),
            &String::from_str(&env, "Unauthorized mint"),
            &String::from_str(&env, "https://malicious.com"),
        );
    });
    
    assert!(result.is_err());
    
    println!("✅ Unauthorized access attempts test passed!");
}

/// Test role-based access control
#[test]
fn test_role_based_access_control() {
    let env = Env::default();
    let test_setup = setup_test_environment(&env);
    
    let admin = test_setup.admin.clone();
    let moderator = Address::generate(&env);
    let regular_user = Address::generate(&env);
    let target_user = Address::generate(&env);
    
    // Test admin can perform all operations
    env.set_invoker(admin.clone());
    
    // Admin can verify users
    test_setup.user_registry.verify_user(
        &admin,
        &target_user,
        &VerificationLevel::Basic,
        &(env.ledger().timestamp() + 365 * 24 * 60 * 60),
        &String::from_str(&env, "Admin verification"),
    );
    
    // Admin can add moderators
    test_setup.user_registry.add_moderator(&admin, &moderator);
    
    // Admin can set fee rates
    test_setup.fee_manager.set_fee_rates(&5_i128, &10_i128, &15_i128);
    
    // Admin can mint NFTs
    test_setup.reputation_nft.mint(
        &admin,
        &target_user,
        &1_u32,
        &String::from_str(&env, "Admin NFT"),
        &String::from_str(&env, "Admin minted"),
        &String::from_str(&env, "https://admin.com"),
    );
    
    // Test moderator permissions
    env.set_invoker(moderator.clone());
    
    // Moderator should not be able to set fee rates
    let result = std::panic::catch_unwind(|| {
        test_setup.fee_manager.set_fee_rates(&1_i128, &2_i128, &3_i128);
    });
    
    assert!(result.is_err());
    
    // Moderator should not be able to mint NFTs
    let result = std::panic::catch_unwind(|| {
        test_setup.reputation_nft.mint(
            &moderator,
            &target_user,
            &2_u32,
            &String::from_str(&env, "Moderator NFT"),
            &String::from_str(&env, "Moderator minted"),
            &String::from_str(&env, "https://moderator.com"),
        );
    });
    
    assert!(result.is_err());
    
    // Test regular user permissions
    env.set_invoker(regular_user.clone());
    
    // Regular user should not be able to verify others
    let result = std::panic::catch_unwind(|| {
        test_setup.user_registry.verify_user(
            &regular_user,
            &target_user,
            &VerificationLevel::Basic,
            &(env.ledger().timestamp() + 365 * 24 * 60 * 60),
            &String::from_str(&env, "User verification"),
        );
    });
    
    assert!(result.is_err());
    
    // Regular user should not be able to add moderators
    let result = std::panic::catch_unwind(|| {
        test_setup.user_registry.add_moderator(&regular_user, &target_user);
    });
    
    assert!(result.is_err());
    
    println!("✅ Role-based access control test passed!");
}

/// Test admin role transfer security
#[test]
fn test_admin_role_transfer_security() {
    let env = Env::default();
    let test_setup = setup_test_environment(&env);
    
    let current_admin = test_setup.admin.clone();
    let new_admin = Address::generate(&env);
    let malicious_user = Address::generate(&env);
    
    // Test only current admin can transfer admin role
    env.set_invoker(malicious_user.clone());
    
    let result = std::panic::catch_unwind(|| {
        test_setup.user_registry.transfer_admin(&malicious_user, &new_admin);
    });
    
    assert!(result.is_err());
    
    // Test successful admin transfer
    env.set_invoker(current_admin.clone());
    test_setup.user_registry.transfer_admin(&current_admin, &new_admin);
    
    // Verify admin was transferred
    let admin_after_transfer = test_setup.user_registry.get_admin();
    assert_eq!(admin_after_transfer, Some(new_admin.clone()));
    
    // Test old admin can no longer perform admin operations
    env.set_invoker(current_admin.clone());
    
    let result = std::panic::catch_unwind(|| {
        test_setup.user_registry.verify_user(
            &current_admin,
            &malicious_user,
            &VerificationLevel::Basic,
            &(env.ledger().timestamp() + 365 * 24 * 60 * 60),
            &String::from_str(&env, "Old admin attempt"),
        );
    });
    
    assert!(result.is_err());
    
    // Test new admin can perform admin operations
    env.set_invoker(new_admin.clone());
    
    test_setup.user_registry.verify_user(
        &new_admin,
        &malicious_user,
        &VerificationLevel::Basic,
        &(env.ledger().timestamp() + 365 * 24 * 60 * 60),
        &String::from_str(&env, "New admin verification"),
    );
    
    // Transfer admin role back
    test_setup.user_registry.transfer_admin(&new_admin, &current_admin);
    
    println!("✅ Admin role transfer security test passed!");
}

/// Test moderator management security
#[test]
fn test_moderator_management_security() {
    let env = Env::default();
    let test_setup = setup_test_environment(&env);
    
    let admin = test_setup.admin.clone();
    let moderator = Address::generate(&env);
    let regular_user = Address::generate(&env);
    
    // Test only admin can add moderators
    env.set_invoker(regular_user.clone());
    
    let result = std::panic::catch_unwind(|| {
        test_setup.user_registry.add_moderator(&regular_user, &moderator);
    });
    
    assert!(result.is_err());
    
    // Test admin can add moderator
    env.set_invoker(admin.clone());
    test_setup.user_registry.add_moderator(&admin, &moderator);
    
    // Verify moderator was added
    let moderators = test_setup.user_registry.get_moderators();
    assert!(moderators.contains(&moderator));
    
    // Test only admin can remove moderators
    env.set_invoker(moderator.clone());
    
    let result = std::panic::catch_unwind(|| {
        test_setup.user_registry.remove_moderator(&moderator, &moderator);
    });
    
    assert!(result.is_err());
    
    // Test admin can remove moderator
    env.set_invoker(admin.clone());
    test_setup.user_registry.remove_moderator(&admin, &moderator);
    
    // Verify moderator was removed
    let moderators_after = test_setup.user_registry.get_moderators();
    assert!(!moderators_after.contains(&moderator));
    
    println!("✅ Moderator management security test passed!");
}

/// Test blacklist security
#[test]
fn test_blacklist_security() {
    let env = Env::default();
    let test_setup = setup_test_environment(&env);
    
    let admin = test_setup.admin.clone();
    let user = Address::generate(&env);
    let malicious_user = Address::generate(&env);
    
    // Test only admin can blacklist users
    env.set_invoker(malicious_user.clone());
    
    let result = std::panic::catch_unwind(|| {
        test_setup.user_registry.blacklist_user(&malicious_user, &user);
    });
    
    assert!(result.is_err());
    
    // Test admin can blacklist user
    env.set_invoker(admin.clone());
    test_setup.user_registry.blacklist_user(&admin, &user);
    
    // Verify user is blacklisted
    let is_blacklisted = test_setup.user_registry.is_user_blacklisted(&user);
    assert!(is_blacklisted);
    
    // Test only admin can unblacklist users
    env.set_invoker(malicious_user.clone());
    
    let result = std::panic::catch_unwind(|| {
        test_setup.user_registry.unblacklist_user(&malicious_user, &user);
    });
    
    assert!(result.is_err());
    
    // Test admin can unblacklist user
    env.set_invoker(admin.clone());
    test_setup.user_registry.unblacklist_user(&admin, &user);
    
    // Verify user is not blacklisted
    let is_blacklisted_after = test_setup.user_registry.is_user_blacklisted(&user);
    assert!(!is_blacklisted_after);
    
    println!("✅ Blacklist security test passed!");
}

/// Test fee manager security
#[test]
fn test_fee_manager_security() {
    let env = Env::default();
    let test_setup = setup_test_environment(&env);
    
    let admin = test_setup.admin.clone();
    let malicious_user = Address::generate(&env);
    let user = Address::generate(&env);
    
    // Test only admin can set fee rates
    env.set_invoker(malicious_user.clone());
    
    let result = std::panic::catch_unwind(|| {
        test_setup.fee_manager.set_fee_rates(&100_i128, &200_i128, &300_i128);
    });
    
    assert!(result.is_err());
    
    // Test admin can set fee rates
    env.set_invoker(admin.clone());
    test_setup.fee_manager.set_fee_rates(&5_i128, &10_i128, &15_i128);
    
    // Verify fee rates were set
    let fee_config = test_setup.fee_manager.get_fee_config();
    assert_eq!(fee_config.escrow_fee_percentage, 5_i128);
    assert_eq!(fee_config.dispute_fee_percentage, 10_i128);
    assert_eq!(fee_config.arbitrator_fee_percentage, 15_i128);
    
    // Test only admin can add premium users
    env.set_invoker(malicious_user.clone());
    
    let result = std::panic::catch_unwind(|| {
        test_setup.fee_manager.add_premium_user(&user);
    });
    
    assert!(result.is_err());
    
    // Test admin can add premium user
    env.set_invoker(admin.clone());
    test_setup.fee_manager.add_premium_user(&user);
    
    // Verify user is premium
    let is_premium = test_setup.fee_manager.is_premium_user(&user);
    assert!(is_premium);
    
    // Test only admin can remove premium users
    env.set_invoker(malicious_user.clone());
    
    let result = std::panic::catch_unwind(|| {
        test_setup.fee_manager.remove_premium_user(&user);
    });
    
    assert!(result.is_err());
    
    // Test admin can remove premium user
    env.set_invoker(admin.clone());
    test_setup.fee_manager.remove_premium_user(&user);
    
    // Verify user is not premium
    let is_premium_after = test_setup.fee_manager.is_premium_user(&user);
    assert!(!is_premium_after);
    
    println!("✅ Fee manager security test passed!");
}

/// Test reputation NFT security
#[test]
fn test_reputation_nft_security() {
    let env = Env::default();
    let test_setup = setup_test_environment(&env);
    
    let admin = test_setup.admin.clone();
    let malicious_user = Address::generate(&env);
    let user = Address::generate(&env);
    let target_user = Address::generate(&env);
    
    // Test only admin can mint NFTs
    env.set_invoker(malicious_user.clone());
    
    let result = std::panic::catch_unwind(|| {
        test_setup.reputation_nft.mint(
            &malicious_user,
            &target_user,
            &1_u32,
            &String::from_str(&env, "Malicious NFT"),
            &String::from_str(&env, "Unauthorized mint"),
            &String::from_str(&env, "https://malicious.com"),
        );
    });
    
    assert!(result.is_err());
    
    // Test admin can mint NFT
    env.set_invoker(admin.clone());
    test_setup.reputation_nft.mint(
        &admin,
        &target_user,
        &1_u32,
        &String::from_str(&env, "Legitimate NFT"),
        &String::from_str(&env, "Admin minted"),
        &String::from_str(&env, "https://legitimate.com"),
    );
    
    // Verify NFT was minted
    let nft_owner = test_setup.reputation_nft.get_owner(&1_u32);
    assert_eq!(nft_owner, target_user);
    
    // Test only admin can add minters
    env.set_invoker(malicious_user.clone());
    
    let result = std::panic::catch_unwind(|| {
        test_setup.reputation_nft.add_minter(&malicious_user, &user);
    });
    
    assert!(result.is_err());
    
    // Test admin can add minter
    env.set_invoker(admin.clone());
    test_setup.reputation_nft.add_minter(&admin, &user);
    
    // Verify minter was added
    let is_minter = test_setup.reputation_nft.is_minter(&user);
    assert!(is_minter);
    
    // Test minter can mint NFTs
    env.set_invoker(user.clone());
    test_setup.reputation_nft.mint(
        &user,
        &target_user,
        &2_u32,
        &String::from_str(&env, "Minter NFT"),
        &String::from_str(&env, "Minter minted"),
        &String::from_str(&env, "https://minter.com"),
    );
    
    // Verify minter NFT was minted
    let minter_nft_owner = test_setup.reputation_nft.get_owner(&2_u32);
    assert_eq!(minter_nft_owner, target_user);
    
    // Test only admin can remove minters
    env.set_invoker(malicious_user.clone());
    
    let result = std::panic::catch_unwind(|| {
        test_setup.reputation_nft.remove_minter(&malicious_user, &user);
    });
    
    assert!(result.is_err());
    
    // Test admin can remove minter
    env.set_invoker(admin.clone());
    test_setup.reputation_nft.remove_minter(&admin, &user);
    
    // Verify minter was removed
    let is_minter_after = test_setup.reputation_nft.is_minter(&user);
    assert!(!is_minter_after);
    
    // Test removed minter can no longer mint
    env.set_invoker(user.clone());
    
    let result = std::panic::catch_unwind(|| {
        test_setup.reputation_nft.mint(
            &user,
            &target_user,
            &3_u32,
            &String::from_str(&env, "Removed minter NFT"),
            &String::from_str(&env, "Should fail"),
            &String::from_str(&env, "https://shouldfail.com"),
        );
    });
    
    assert!(result.is_err());
    
    println!("✅ Reputation NFT security test passed!");
}

/// Test escrow security
#[test]
fn test_escrow_security() {
    let env = Env::default();
    let test_setup = setup_test_environment(&env);
    
    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let malicious_user = Address::generate(&env);
    
    create_verified_user(&test_setup, client.clone(), VerificationLevel::Basic, "Test client");
    create_verified_user(&test_setup, freelancer.clone(), VerificationLevel::Basic, "Test freelancer");
    
    // Create escrow
    create_escrow(&test_setup, client.clone(), freelancer.clone(), 1000_i128);
    deposit_escrow_funds(&test_setup, client.clone());
    
    // Test only client can deposit funds
    env.set_invoker(malicious_user.clone());
    
    let result = std::panic::catch_unwind(|| {
        test_setup.escrow.deposit_funds(&malicious_user);
    });
    
    assert!(result.is_err());
    
    // Test only freelancer can release funds
    env.set_invoker(malicious_user.clone());
    
    let result = std::panic::catch_unwind(|| {
        test_setup.escrow.release_funds(&malicious_user);
    });
    
    assert!(result.is_err());
    
    // Test freelancer can release funds
    env.set_invoker(freelancer.clone());
    test_setup.escrow.release_funds(&freelancer);
    
    // Verify funds were released
    let escrow_data = test_setup.escrow.get_escrow_data();
    assert!(escrow_data.funds_released);
    
    println!("✅ Escrow security test passed!");
}

/// Test dispute resolution security
#[test]
fn test_dispute_resolution_security() {
    let env = Env::default();
    let test_setup = setup_test_environment(&env);
    
    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let arbitrator = Address::generate(&env);
    let malicious_user = Address::generate(&env);
    
    create_verified_user(&test_setup, client.clone(), VerificationLevel::Basic, "Test client");
    create_verified_user(&test_setup, freelancer.clone(), VerificationLevel::Basic, "Test freelancer");
    
    // Create escrow and deposit funds
    create_escrow(&test_setup, client.clone(), freelancer.clone(), 1000_i128);
    deposit_escrow_funds(&test_setup, client.clone());
    
    // Create dispute
    create_dispute(&test_setup, 1_u32, client.clone(), "Test dispute", 1000_i128);
    
    // Test only arbitrator can resolve disputes
    env.set_invoker(malicious_user.clone());
    
    let result = std::panic::catch_unwind(|| {
        test_setup.dispute.resolve_dispute(&1_u32, &DisputeOutcome::ClientWins);
    });
    
    assert!(result.is_err());
    
    // Test arbitrator can resolve dispute
    env.set_invoker(arbitrator.clone());
    test_setup.dispute.resolve_dispute(&1_u32, &DisputeOutcome::ClientWins);
    
    // Verify dispute was resolved
    let dispute_data = test_setup.dispute.get_dispute(&1_u32);
    assert_eq!(dispute_data.outcome, Some(DisputeOutcome::ClientWins));
    
    println!("✅ Dispute resolution security test passed!");
}

/// Test publication security
#[test]
fn test_publication_security() {
    let env = Env::default();
    let test_setup = setup_test_environment(&env);
    
    let user = Address::generate(&env);
    let malicious_user = Address::generate(&env);
    
    create_verified_user(&test_setup, user.clone(), VerificationLevel::Basic, "Test user");
    
    // Test only the user can create publications for themselves
    env.set_invoker(malicious_user.clone());
    
    let result = std::panic::catch_unwind(|| {
        test_setup.publication.publish(
            &user, // Trying to publish for another user
            &Symbol::new(&env, "service"),
            &String::from_str(&env, "Malicious publication"),
            &String::from_str(&env, "Technology"),
            &1000_i128,
            &env.ledger().timestamp(),
        );
    });
    
    assert!(result.is_err());
    
    // Test user can create publication for themselves
    env.set_invoker(user.clone());
    let publication_id = test_setup.publication.publish(
        &user,
        &Symbol::new(&env, "service"),
        &String::from_str(&env, "Legitimate publication"),
        &String::from_str(&env, "Technology"),
        &1000_i128,
        &env.ledger().timestamp(),
    );
    
    // Verify publication was created
    let publication = test_setup.publication.get_publication(&user, &publication_id);
    assert!(publication.is_some());
    
    println!("✅ Publication security test passed!");
}

/// Test comprehensive security scenarios
#[test]
fn test_comprehensive_security_scenarios() {
    let env = Env::default();
    let test_setup = setup_test_environment(&env);
    
    let admin = test_setup.admin.clone();
    let user = Address::generate(&env);
    let malicious_user = Address::generate(&env);
    
    create_verified_user(&test_setup, user.clone(), VerificationLevel::Basic, "Test user");
    
    // Test multiple security violations
    env.set_invoker(malicious_user.clone());
    
    // 1. Try to impersonate admin
    let result = std::panic::catch_unwind(|| {
        test_setup.user_registry.verify_user(
            &malicious_user,
            &user,
            &VerificationLevel::Basic,
            &(env.ledger().timestamp() + 365 * 24 * 60 * 60),
            &String::from_str(&env, "Impersonation attempt"),
        );
    });
    assert!(result.is_err());
    
    // 2. Try to access admin functions
    let result = std::panic::catch_unwind(|| {
        test_setup.fee_manager.set_fee_rates(&100_i128, &200_i128, &300_i128);
    });
    assert!(result.is_err());
    
    // 3. Try to mint NFTs without permission
    let result = std::panic::catch_unwind(|| {
        test_setup.reputation_nft.mint(
            &malicious_user,
            &user,
            &999_u32,
            &String::from_str(&env, "Unauthorized NFT"),
            &String::from_str(&env, "Should fail"),
            &String::from_str(&env, "https://malicious.com"),
        );
    });
    assert!(result.is_err());
    
    // 4. Try to transfer admin role
    let result = std::panic::catch_unwind(|| {
        test_setup.user_registry.transfer_admin(&malicious_user, &user);
    });
    assert!(result.is_err());
    
    // 5. Try to add moderators
    let result = std::panic::catch_unwind(|| {
        test_setup.user_registry.add_moderator(&malicious_user, &user);
    });
    assert!(result.is_err());
    
    // Verify admin can still perform all operations
    env.set_invoker(admin.clone());
    
    // Admin operations should still work
    test_setup.user_registry.verify_user(
        &admin,
        &user,
        &VerificationLevel::Enhanced,
        &(env.ledger().timestamp() + 365 * 24 * 60 * 60),
        &String::from_str(&env, "Admin verification"),
    );
    
    test_setup.fee_manager.set_fee_rates(&5_i128, &10_i128, &15_i128);
    
    test_setup.reputation_nft.mint(
        &admin,
        &user,
        &1_u32,
        &String::from_str(&env, "Admin NFT"),
        &String::from_str(&env, "Admin minted"),
        &String::from_str(&env, "https://admin.com"),
    );
    
    println!("✅ Comprehensive security scenarios test passed!");
} 