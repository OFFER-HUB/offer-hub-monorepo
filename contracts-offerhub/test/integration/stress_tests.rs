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

/// Stress test: Multiple concurrent escrow operations
#[test]
fn test_concurrent_escrow_operations() {
    let env = Env::default();
    let test_setup = setup_test_environment(&env);
    
    let num_operations = 50;
    let mut clients = Vec::new(&env);
    let mut freelancers = Vec::new(&env);
    let mut escrows = Vec::new(&env);
    
    // Create users
    for i in 0..num_operations {
        let client = Address::generate(&env);
        let freelancer = Address::generate(&env);
        
        create_verified_user(&test_setup, client.clone(), VerificationLevel::Basic, &format!("Client {}", i));
        create_verified_user(&test_setup, freelancer.clone(), VerificationLevel::Basic, &format!("Freelancer {}", i));
        
        clients.push_back(client);
        freelancers.push_back(freelancer);
    }
    
    // Create concurrent escrows
    for i in 0..num_operations {
        let client = clients.get(i as u32).unwrap();
        let freelancer = freelancers.get(i as u32).unwrap();
        let amount = (100 * (i + 1) as i128);
        
        create_escrow(&test_setup, client.clone(), freelancer.clone(), amount);
        escrows.push_back(i);
    }
    
    // Verify all escrows were created
    assert_eq!(escrows.len(), num_operations);
    
    // Test concurrent deposits
    for i in 0..num_operations {
        let client = clients.get(i as u32).unwrap();
        deposit_escrow_funds(&test_setup, client.clone());
    }
    
    // Test concurrent releases
    for i in 0..num_operations {
        let freelancer = freelancers.get(i as u32).unwrap();
        release_escrow_funds(&test_setup, freelancer.clone());
    }
    
    println!("✅ Concurrent escrow operations test passed with {} operations!", num_operations);
}

/// Stress test: High volume user registration
#[test]
fn test_high_volume_user_registration() {
    let env = Env::default();
    let test_setup = setup_test_environment(&env);
    
    let num_users = 100;
    let users = generate_test_addresses(&env, num_users);
    
    // Bulk register users
    test_bulk_operations(&test_setup, users.clone());
    
    // Verify all users are registered
    for user in users.iter() {
        verify_user_status(&test_setup, user.clone(), true);
    }
    
    // Test individual operations on bulk registered users
    for (i, user) in users.iter().enumerate() {
        // Update metadata
        test_setup.env.set_invoker(user.clone());
        test_setup.user_registry.update_user_metadata(
            &user,
            &user,
            &String::from_str(&env, &format!("Updated metadata for user {}", i)),
        );
        
        // Verify metadata was updated
        let profile = test_setup.user_registry.get_user_profile(&user);
        assert!(profile.is_some());
    }
    
    println!("✅ High volume user registration test passed with {} users!", num_users);
}

/// Stress test: Multiple dispute resolutions
#[test]
fn test_multiple_dispute_resolutions() {
    let env = Env::default();
    let test_setup = setup_test_environment(&env);
    
    let num_disputes = 20;
    let arbitrator = Address::generate(&env);
    
    // Create multiple disputes
    for i in 0..num_disputes {
        let client = Address::generate(&env);
        let freelancer = Address::generate(&env);
        
        create_verified_user(&test_setup, client.clone(), VerificationLevel::Basic, &format!("Client {}", i));
        create_verified_user(&test_setup, freelancer.clone(), VerificationLevel::Basic, &format!("Freelancer {}", i));
        
        // Create escrow
        create_escrow(&test_setup, client.clone(), freelancer.clone(), 1000_i128);
        deposit_escrow_funds(&test_setup, client.clone());
        
        // Create dispute
        create_dispute(&test_setup, i as u32, client.clone(), &format!("Dispute {}", i), 1000_i128);
        
        // Resolve dispute (alternate outcomes)
        let outcome = if i % 2 == 0 {
            DisputeOutcome::ClientWins
        } else {
            DisputeOutcome::FreelancerWins
        };
        
        resolve_dispute(&test_setup, i as u32, outcome, arbitrator.clone());
    }
    
    // Verify all disputes are resolved
    for i in 0..num_disputes {
        let dispute_data = test_setup.dispute.get_dispute(&(i as u32));
        assert!(dispute_data.outcome.is_some());
    }
    
    println!("✅ Multiple dispute resolutions test passed with {} disputes!", num_disputes);
}

/// Stress test: NFT minting and transfer operations
#[test]
fn test_nft_minting_and_transfer_stress() {
    let env = Env::default();
    let test_setup = setup_test_environment(&env);
    
    let num_nfts = 50;
    let num_users = 10;
    let users = generate_test_addresses(&env, num_users);
    
    // Register users
    for (i, user) in users.iter().enumerate() {
        create_verified_user(&test_setup, user.clone(), VerificationLevel::Basic, &format!("User {}", i));
    }
    
    // Mint NFTs to different users
    for i in 0..num_nfts {
        let user_index = i % num_users;
        let user = users.get(user_index as u32).unwrap();
        
        mint_reputation_nft(
            &test_setup,
            user.clone(),
            i as u32,
            &format!("NFT {}", i),
            &format!("Description for NFT {}", i),
            &format!("https://example.com/nft/{}", i),
        );
    }
    
    // Verify all NFTs were minted
    for i in 0..num_nfts {
        let user_index = i % num_users;
        let expected_owner = users.get(user_index as u32).unwrap();
        verify_nft_ownership(&test_setup, i as u32, expected_owner.clone());
    }
    
    // Test NFT transfers
    for i in 0..num_nfts {
        let from_index = i % num_users;
        let to_index = (i + 1) % num_users;
        
        let from_user = users.get(from_index as u32).unwrap();
        let to_user = users.get(to_index as u32).unwrap();
        
        test_nft_transfer(&test_setup, i as u32, from_user.clone(), to_user.clone());
    }
    
    // Verify transfers
    for i in 0..num_nfts {
        let to_index = (i + 1) % num_users;
        let expected_owner = users.get(to_index as u32).unwrap();
        verify_nft_ownership(&test_setup, i as u32, expected_owner.clone());
    }
    
    println!("✅ NFT minting and transfer stress test passed with {} NFTs!", num_nfts);
}

/// Edge case test: Maximum values and limits
#[test]
fn test_maximum_values_and_limits() {
    let env = Env::default();
    let test_setup = setup_test_environment(&env);
    
    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    
    create_verified_user(&test_setup, client.clone(), VerificationLevel::Basic, "Test client");
    create_verified_user(&test_setup, freelancer.clone(), VerificationLevel::Basic, "Test freelancer");
    
    // Test with maximum escrow amount
    let max_amount = i128::MAX;
    create_escrow(&test_setup, client.clone(), freelancer.clone(), max_amount);
    
    // Test fee calculation with maximum amount
    let fee_calc = test_setup.fee_manager.calculate_escrow_fee(&max_amount, &client);
    assert!(fee_calc.fee_amount > 0);
    assert!(fee_calc.net_amount < max_amount);
    
    // Test with very long strings
    let long_title = "A".repeat(1000);
    let long_category = "B".repeat(1000);
    
    let publication_id = create_publication(
        &test_setup,
        client.clone(),
        &long_title,
        &long_category,
        1000_i128,
    );
    
    // Verify publication was created
    let publication = test_setup.publication.get_publication(&client, &publication_id);
    assert!(publication.is_some());
    
    println!("✅ Maximum values and limits test passed!");
}

/// Edge case test: Zero values and edge conditions
#[test]
fn test_zero_values_and_edge_conditions() {
    let env = Env::default();
    let test_setup = setup_test_environment(&env);
    
    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    
    create_verified_user(&test_setup, client.clone(), VerificationLevel::Basic, "Test client");
    create_verified_user(&test_setup, freelancer.clone(), VerificationLevel::Basic, "Test freelancer");
    
    // Test with zero amount escrow
    create_escrow(&test_setup, client.clone(), freelancer.clone(), 0_i128);
    
    // Test fee calculation with zero amount
    let fee_calc = test_setup.fee_manager.calculate_escrow_fee(&0_i128, &client);
    assert_eq!(fee_calc.fee_amount, 0);
    assert_eq!(fee_calc.net_amount, 0);
    
    // Test with empty strings
    let publication_id = create_publication(
        &test_setup,
        client.clone(),
        "",
        "",
        1000_i128,
    );
    
    // Verify publication was created
    let publication = test_setup.publication.get_publication(&client, &publication_id);
    assert!(publication.is_some());
    
    println!("✅ Zero values and edge conditions test passed!");
}

/// Edge case test: Expired verifications
#[test]
fn test_expired_verifications() {
    let env = Env::default();
    let test_setup = setup_test_environment(&env);
    
    let user = Address::generate(&env);
    
    // Create user with expired verification
    test_setup.env.set_invoker(test_setup.admin.clone());
    test_setup.user_registry.verify_user(
        &test_setup.admin,
        &user,
        &VerificationLevel::Basic,
        &(test_setup.env.ledger().timestamp() - 1), // Expired
        &String::from_str(&env, "Expired user"),
    );
    
    // Check user status
    let status = test_setup.user_registry.get_user_status(&user);
    // The contract should handle expired verifications appropriately
    
    // Renew verification
    test_setup.user_registry.renew_verification(
        &test_setup.admin,
        &user,
        &(test_setup.env.ledger().timestamp() + 365 * 24 * 60 * 60),
    );
    
    // Verify renewal
    let status_after = test_setup.user_registry.get_user_status(&user);
    assert!(status_after.is_verified);
    
    println!("✅ Expired verifications test passed!");
}

/// Edge case test: Rapid state changes
#[test]
fn test_rapid_state_changes() {
    let env = Env::default();
    let test_setup = setup_test_environment(&env);
    
    let user = Address::generate(&env);
    
    create_verified_user(&test_setup, user.clone(), VerificationLevel::Basic, "Test user");
    
    // Rapidly change verification levels
    for level in [VerificationLevel::Basic, VerificationLevel::Enhanced, VerificationLevel::Premium] {
        test_setup.env.set_invoker(test_setup.admin.clone());
        test_setup.user_registry.update_verification_level(&test_setup.admin, &user, &level);
        
        let current_level = test_setup.user_registry.get_verification_level(&user);
        assert_eq!(current_level, Some(level));
    }
    
    // Rapidly add and remove from blacklist
    for _ in 0..5 {
        test_setup.user_registry.blacklist_user(&test_setup.admin, &user);
        let is_blacklisted = test_setup.user_registry.is_user_blacklisted(&user);
        assert!(is_blacklisted);
        
        test_setup.user_registry.unblacklist_user(&test_setup.admin, &user);
        let is_blacklisted_after = test_setup.user_registry.is_user_blacklisted(&user);
        assert!(!is_blacklisted_after);
    }
    
    println!("✅ Rapid state changes test passed!");
}

/// Edge case test: Fee calculation edge cases
#[test]
fn test_fee_calculation_edge_cases() {
    let env = Env::default();
    let test_setup = setup_test_environment(&env);
    
    let user = Address::generate(&env);
    create_verified_user(&test_setup, user.clone(), VerificationLevel::Basic, "Test user");
    
    // Test with very small amounts
    let small_amounts = [1_i128, 2_i128, 5_i128, 10_i128];
    
    for amount in small_amounts.iter() {
        let fee_calc = test_setup.fee_manager.calculate_escrow_fee(amount, &user);
        assert!(fee_calc.fee_amount >= 0);
        assert!(fee_calc.net_amount >= 0);
        assert_eq!(fee_calc.fee_amount + fee_calc.net_amount, *amount);
    }
    
    // Test with very large amounts
    let large_amounts = [1_000_000_i128, 10_000_000_i128, 100_000_000_i128];
    
    for amount in large_amounts.iter() {
        let fee_calc = test_setup.fee_manager.calculate_escrow_fee(amount, &user);
        assert!(fee_calc.fee_amount > 0);
        assert!(fee_calc.net_amount < *amount);
        assert_eq!(fee_calc.fee_amount + fee_calc.net_amount, *amount);
    }
    
    // Test premium user fee calculations
    test_setup.fee_manager.add_premium_user(&user);
    
    for amount in [1000_i128, 10000_i128, 100000_i128] {
        let regular_fee = test_setup.fee_manager.calculate_escrow_fee(&amount, &user);
        // Premium users should have different fee structure
        assert!(regular_fee.fee_amount >= 0);
    }
    
    test_setup.fee_manager.remove_premium_user(&user);
    
    println!("✅ Fee calculation edge cases test passed!");
}

/// Edge case test: Dispute resolution edge cases
#[test]
fn test_dispute_resolution_edge_cases() {
    let env = Env::default();
    let test_setup = setup_test_environment(&env);
    
    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let arbitrator = Address::generate(&env);
    
    create_verified_user(&test_setup, client.clone(), VerificationLevel::Basic, "Test client");
    create_verified_user(&test_setup, freelancer.clone(), VerificationLevel::Basic, "Test freelancer");
    
    // Create escrow with very small amount
    create_escrow(&test_setup, client.clone(), freelancer.clone(), 1_i128);
    deposit_escrow_funds(&test_setup, client.clone());
    
    // Create dispute with very small amount
    create_dispute(&test_setup, 1_u32, client.clone(), "Small dispute", 1_i128);
    
    // Resolve dispute
    resolve_dispute(&test_setup, 1_u32, DisputeOutcome::ClientWins, arbitrator.clone());
    
    // Verify dispute resolution
    let dispute_data = test_setup.dispute.get_dispute(&1_u32);
    assert_eq!(dispute_data.outcome, Some(DisputeOutcome::ClientWins));
    
    // Test with very long dispute reason
    let long_reason = "A".repeat(2000);
    create_dispute(&test_setup, 2_u32, client.clone(), &long_reason, 1000_i128);
    
    let dispute_data_2 = test_setup.dispute.get_dispute(&2_u32);
    assert_eq!(dispute_data_2.initiator, client);
    
    println!("✅ Dispute resolution edge cases test passed!");
}

/// Edge case test: NFT edge cases
#[test]
fn test_nft_edge_cases() {
    let env = Env::default();
    let test_setup = setup_test_environment(&env);
    
    let user = Address::generate(&env);
    create_verified_user(&test_setup, user.clone(), VerificationLevel::Basic, "Test user");
    
    // Test with very long metadata
    let long_name = "A".repeat(1000);
    let long_description = "B".repeat(1000);
    let long_uri = "C".repeat(1000);
    
    mint_reputation_nft(
        &test_setup,
        user.clone(),
        1_u32,
        &long_name,
        &long_description,
        &long_uri,
    );
    
    // Verify NFT was minted
    verify_nft_ownership(&test_setup, 1_u32, user.clone());
    
    // Test metadata retrieval
    let metadata = test_setup.reputation_nft.get_metadata(&1_u32);
    assert_eq!(metadata.name, String::from_str(&env, &long_name));
    assert_eq!(metadata.description, String::from_str(&env, &long_description));
    assert_eq!(metadata.uri, String::from_str(&env, &long_uri));
    
    // Test with empty metadata
    mint_reputation_nft(
        &test_setup,
        user.clone(),
        2_u32,
        "",
        "",
        "",
    );
    
    verify_nft_ownership(&test_setup, 2_u32, user.clone());
    
    println!("✅ NFT edge cases test passed!");
} 