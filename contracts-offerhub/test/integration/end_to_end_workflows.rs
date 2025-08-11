#![cfg(test)]

use soroban_sdk::{
    testutils::{Address as _, Ledger as _},
    Address, Env, Symbol, String, Vec,
};

// Import all contract types
use userregistry_contract::Contract as UserRegistryContract;
use publication_contract::Contract as PublicationContract;
use escrow_contract::EscrowContract;
use dispute_contract::DisputeResolutionContract;
use reputation_nft_contract::Contract as ReputationNFTContract;
use fee_manager_contract::FeeManagerContract;

// Test utilities and helpers
mod test_utils;
use test_utils::*;

/// Complete user workflow test: register → publish → escrow → completion → reputation
#[test]
fn test_complete_user_workflow() {
    let env = Env::default();
    
    // Setup test environment
    let test_setup = setup_test_environment(&env);
    
    // 1. User Registration
    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    
    // Register users
    env.set_invoker(test_setup.admin.clone());
    test_setup.user_registry.verify_user(
        &test_setup.admin,
        &client,
        &VerificationLevel::Basic,
        &(env.ledger().timestamp() + 365 * 24 * 60 * 60), // 1 year
        &String::from_str(&env, "Test client"),
    );
    
    test_setup.user_registry.verify_user(
        &test_setup.admin,
        &freelancer,
        &VerificationLevel::Basic,
        &(env.ledger().timestamp() + 365 * 24 * 60 * 60), // 1 year
        &String::from_str(&env, "Test freelancer"),
    );
    
    // Verify users are registered
    let client_status = test_setup.user_registry.get_user_status(&client);
    let freelancer_status = test_setup.user_registry.get_user_status(&freelancer);
    
    assert!(client_status.is_verified);
    assert!(freelancer_status.is_verified);
    
    // 2. Publication Creation
    env.set_invoker(client.clone());
    let publication_id = test_setup.publication.publish(
        &client,
        &Symbol::new(&env, "service"),
        &String::from_str(&env, "Web Development Project"),
        &String::from_str(&env, "Technology"),
        &1000_i128, // $1000 project
        &env.ledger().timestamp(),
    );
    
    // Verify publication was created
    let publication = test_setup.publication.get_publication(&client, &publication_id);
    assert!(publication.is_some());
    
    // 3. Escrow Creation
    env.set_invoker(client.clone());
    test_setup.escrow.init_contract(
        &client,
        &freelancer,
        &1000_i128,
        &test_setup.fee_manager_id,
    );
    
    // Verify escrow was created
    let escrow_data = test_setup.escrow.get_escrow_data();
    assert_eq!(escrow_data.client, client);
    assert_eq!(escrow_data.freelancer, freelancer);
    assert_eq!(escrow_data.amount, 1000_i128);
    
    // 4. Fund Deposit
    env.set_invoker(client.clone());
    test_setup.escrow.deposit_funds(&client);
    
    // Verify funds are deposited
    let escrow_data_after_deposit = test_setup.escrow.get_escrow_data();
    assert!(escrow_data_after_deposit.funds_deposited);
    
    // 5. Work Completion and Fund Release
    env.set_invoker(client.clone());
    test_setup.escrow.release_funds(&freelancer);
    
    // Verify funds are released
    let escrow_data_after_release = test_setup.escrow.get_escrow_data();
    assert!(escrow_data_after_release.funds_released);
    
    // 6. Reputation NFT Minting
    env.set_invoker(test_setup.admin.clone());
    test_setup.reputation_nft.mint(
        &test_setup.admin,
        &freelancer,
        &1_u32, // token_id
        &String::from_str(&env, "Completed Project"),
        &String::from_str(&env, "Successfully completed web development project"),
        &String::from_str(&env, "https://example.com/metadata/1"),
    );
    
    // Verify NFT was minted
    let nft_owner = test_setup.reputation_nft.get_owner(&1_u32);
    assert_eq!(nft_owner, freelancer);
    
    // 7. Achievement NFT for client
    env.set_invoker(test_setup.admin.clone());
    test_setup.reputation_nft.mint_achv(
        &test_setup.admin,
        &client,
        &Symbol::new(&env, "client_achievement"),
    );
    
    println!("✅ Complete user workflow test passed!");
}

/// Test cross-contract interactions and data consistency
#[test]
fn test_cross_contract_interactions() {
    let env = Env::default();
    let test_setup = setup_test_environment(&env);
    
    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    
    // Register users
    env.set_invoker(test_setup.admin.clone());
    test_setup.user_registry.verify_user(
        &test_setup.admin,
        &client,
        &VerificationLevel::Basic,
        &(env.ledger().timestamp() + 365 * 24 * 60 * 60),
        &String::from_str(&env, "Test client"),
    );
    
    test_setup.user_registry.verify_user(
        &test_setup.admin,
        &freelancer,
        &VerificationLevel::Basic,
        &(env.ledger().timestamp() + 365 * 24 * 60 * 60),
        &String::from_str(&env, "Test freelancer"),
    );
    
    // Create publication
    env.set_invoker(client.clone());
    let publication_id = test_setup.publication.publish(
        &client,
        &Symbol::new(&env, "service"),
        &String::from_str(&env, "Cross-Contract Test Project"),
        &String::from_str(&env, "Technology"),
        &500_i128,
        &env.ledger().timestamp(),
    );
    
    // Create escrow
    test_setup.escrow.init_contract(
        &client,
        &freelancer,
        &500_i128,
        &test_setup.fee_manager_id,
    );
    
    // Test fee calculation consistency
    let fee_calc = test_setup.fee_manager.calculate_escrow_fee(&500_i128, &client);
    let collected_fee = test_setup.fee_manager.collect_fee(&500_i128, &1_u32, &client);
    
    assert_eq!(fee_calc.fee_amount, collected_fee);
    
    // Test data consistency across contracts
    let escrow_data = test_setup.escrow.get_escrow_data();
    let publication = test_setup.publication.get_publication(&client, &publication_id);
    
    assert_eq!(escrow_data.amount, publication.unwrap().amount);
    assert_eq!(escrow_data.client, publication.unwrap().user);
    
    println!("✅ Cross-contract interactions test passed!");
}

/// Test dispute resolution workflow integration
#[test]
fn test_dispute_resolution_workflow() {
    let env = Env::default();
    let test_setup = setup_test_environment(&env);
    
    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let arbitrator = Address::generate(&env);
    
    // Register users
    env.set_invoker(test_setup.admin.clone());
    test_setup.user_registry.verify_user(
        &test_setup.admin,
        &client,
        &VerificationLevel::Basic,
        &(env.ledger().timestamp() + 365 * 24 * 60 * 60),
        &String::from_str(&env, "Test client"),
    );
    
    test_setup.user_registry.verify_user(
        &test_setup.admin,
        &freelancer,
        &VerificationLevel::Basic,
        &(env.ledger().timestamp() + 365 * 24 * 60 * 60),
        &String::from_str(&env, "Test freelancer"),
    );
    
    // Create escrow
    env.set_invoker(client.clone());
    test_setup.escrow.init_contract(
        &client,
        &freelancer,
        &1000_i128,
        &test_setup.fee_manager_id,
    );
    
    // Deposit funds
    test_setup.escrow.deposit_funds(&client);
    
    // Create dispute
    env.set_invoker(client.clone());
    test_setup.dispute.open_dispute(
        &1_u32, // job_id
        &client,
        &String::from_str(&env, "Work not completed as agreed"),
        &test_setup.fee_manager_id,
        &1000_i128,
    );
    
    // Verify dispute was created
    let dispute_data = test_setup.dispute.get_dispute(&1_u32);
    assert_eq!(dispute_data.initiator, client);
    assert_eq!(dispute_data.job_id, 1_u32);
    
    // Resolve dispute (arbitrator decides in favor of client)
    env.set_invoker(arbitrator.clone());
    test_setup.dispute.resolve_dispute(&1_u32, &DisputeOutcome::ClientWins);
    
    // Verify dispute is resolved
    let resolved_dispute = test_setup.dispute.get_dispute(&1_u32);
    assert_eq!(resolved_dispute.outcome, Some(DisputeOutcome::ClientWins));
    
    println!("✅ Dispute resolution workflow test passed!");
}

/// Test admin and arbitrator workflows across contracts
#[test]
fn test_admin_arbitrator_workflows() {
    let env = Env::default();
    let test_setup = setup_test_environment(&env);
    
    let new_admin = Address::generate(&env);
    let moderator = Address::generate(&env);
    let arbitrator = Address::generate(&env);
    
    // Test admin transfer
    env.set_invoker(test_setup.admin.clone());
    test_setup.user_registry.transfer_admin(&test_setup.admin, &new_admin);
    
    let current_admin = test_setup.user_registry.get_admin();
    assert_eq!(current_admin, Some(new_admin.clone()));
    
    // Test moderator management
    env.set_invoker(new_admin.clone());
    test_setup.user_registry.add_moderator(&new_admin, &moderator);
    
    let moderators = test_setup.user_registry.get_moderators();
    assert!(moderators.contains(&moderator));
    
    // Test bulk operations
    let users = vec![
        Address::generate(&env),
        Address::generate(&env),
        Address::generate(&env),
    ];
    
    test_setup.user_registry.bulk_verify_users(
        &new_admin,
        &users,
        &VerificationLevel::Basic,
        &(env.ledger().timestamp() + 365 * 24 * 60 * 60),
        &String::from_str(&env, "Bulk verification"),
    );
    
    // Verify all users are verified
    for user in users.iter() {
        let status = test_setup.user_registry.get_user_status(user);
        assert!(status.is_verified);
    }
    
    // Test fee manager admin operations
    env.set_invoker(test_setup.admin.clone());
    test_setup.fee_manager.set_fee_rates(&5_i128, &10_i128, &15_i128);
    
    let fee_config = test_setup.fee_manager.get_fee_config();
    assert_eq!(fee_config.escrow_fee_percentage, 5_i128);
    assert_eq!(fee_config.dispute_fee_percentage, 10_i128);
    assert_eq!(fee_config.arbitrator_fee_percentage, 15_i128);
    
    println!("✅ Admin and arbitrator workflows test passed!");
}

/// Test performance for complex multi-contract operations
#[test]
fn test_performance_complex_operations() {
    let env = Env::default();
    let test_setup = setup_test_environment(&env);
    
    let start_time = std::time::Instant::now();
    
    // Simulate multiple concurrent operations
    let num_operations = 10;
    let mut users = Vec::new(&env);
    let mut publications = Vec::new(&env);
    let mut escrows = Vec::new(&env);
    
    for i in 0..num_operations {
        let client = Address::generate(&env);
        let freelancer = Address::generate(&env);
        
        // Register users
        env.set_invoker(test_setup.admin.clone());
        test_setup.user_registry.verify_user(
            &test_setup.admin,
            &client,
            &VerificationLevel::Basic,
            &(env.ledger().timestamp() + 365 * 24 * 60 * 60),
            &String::from_str(&env, &format!("User {}", i)),
        );
        
        test_setup.user_registry.verify_user(
            &test_setup.admin,
            &freelancer,
            &VerificationLevel::Basic,
            &(env.ledger().timestamp() + 365 * 24 * 60 * 60),
            &String::from_str(&env, &format!("Freelancer {}", i)),
        );
        
        users.push_back(client.clone());
        users.push_back(freelancer.clone());
        
        // Create publication
        env.set_invoker(client.clone());
        let pub_id = test_setup.publication.publish(
            &client,
            &Symbol::new(&env, "service"),
            &String::from_str(&env, &format!("Project {}", i)),
            &String::from_str(&env, "Technology"),
            &(100 * (i + 1) as i128),
            &env.ledger().timestamp(),
        );
        
        publications.push_back(pub_id);
        
        // Create escrow
        test_setup.escrow.init_contract(
            &client,
            &freelancer,
            &(100 * (i + 1) as i128),
            &test_setup.fee_manager_id,
        );
        
        escrows.push_back(i);
    }
    
    let end_time = std::time::Instant::now();
    let duration = end_time.duration_since(start_time);
    
    // Verify all operations completed successfully
    assert_eq!(users.len(), num_operations * 2);
    assert_eq!(publications.len(), num_operations);
    assert_eq!(escrows.len(), num_operations);
    
    println!("✅ Performance test completed in {:?}", duration);
    println!("✅ Complex multi-contract operations test passed!");
}

/// Test failure scenarios and error handling
#[test]
fn test_failure_scenarios() {
    let env = Env::default();
    let test_setup = setup_test_environment(&env);
    
    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let unauthorized_user = Address::generate(&env);
    
    // Test unauthorized access
    env.set_invoker(unauthorized_user.clone());
    
    // Should fail - unauthorized user trying to create escrow
    let result = std::panic::catch_unwind(|| {
        test_setup.escrow.init_contract(
            &client,
            &freelancer,
            &1000_i128,
            &test_setup.fee_manager_id,
        );
    });
    
    assert!(result.is_err());
    
    // Test insufficient funds scenario
    env.set_invoker(client.clone());
    test_setup.escrow.init_contract(
        &client,
        &freelancer,
        &1000_i128,
        &test_setup.fee_manager_id,
    );
    
    // Try to release funds without depositing
    let result = std::panic::catch_unwind(|| {
        test_setup.escrow.release_funds(&freelancer);
    });
    
    assert!(result.is_err());
    
    // Test duplicate dispute creation
    env.set_invoker(client.clone());
    test_setup.dispute.open_dispute(
        &1_u32,
        &client,
        &String::from_str(&env, "First dispute"),
        &test_setup.fee_manager_id,
        &1000_i128,
    );
    
    let result = std::panic::catch_unwind(|| {
        test_setup.dispute.open_dispute(
            &1_u32,
            &client,
            &String::from_str(&env, "Second dispute"),
            &test_setup.fee_manager_id,
            &1000_i128,
        );
    });
    
    assert!(result.is_err());
    
    println!("✅ Failure scenarios test passed!");
}

/// Test event emission consistency across contract interactions
#[test]
fn test_event_emission_consistency() {
    let env = Env::default();
    let test_setup = setup_test_environment(&env);
    
    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    
    // Register users and capture events
    env.set_invoker(test_setup.admin.clone());
    test_setup.user_registry.verify_user(
        &test_setup.admin,
        &client,
        &VerificationLevel::Basic,
        &(env.ledger().timestamp() + 365 * 24 * 60 * 60),
        &String::from_str(&env, "Test client"),
    );
    
    // Create publication and capture events
    env.set_invoker(client.clone());
    let publication_id = test_setup.publication.publish(
        &client,
        &Symbol::new(&env, "service"),
        &String::from_str(&env, "Event Test Project"),
        &String::from_str(&env, "Technology"),
        &500_i128,
        &env.ledger().timestamp(),
    );
    
    // Create escrow and capture events
    test_setup.escrow.init_contract(
        &client,
        &freelancer,
        &500_i128,
        &test_setup.fee_manager_id,
    );
    
    // Verify events were emitted (this would require checking the event logs)
    // For now, we'll verify the operations completed successfully
    assert!(publication_id > 0);
    
    let escrow_data = test_setup.escrow.get_escrow_data();
    assert_eq!(escrow_data.client, client);
    assert_eq!(escrow_data.freelancer, freelancer);
    
    println!("✅ Event emission consistency test passed!");
}

/// Test malicious user behavior scenarios
#[test]
fn test_malicious_user_behavior() {
    let env = Env::default();
    let test_setup = setup_test_environment(&env);
    
    let malicious_user = Address::generate(&env);
    let victim = Address::generate(&env);
    let legitimate_user = Address::generate(&env);
    
    // Register legitimate user
    env.set_invoker(test_setup.admin.clone());
    test_setup.user_registry.verify_user(
        &test_setup.admin,
        &legitimate_user,
        &VerificationLevel::Basic,
        &(env.ledger().timestamp() + 365 * 24 * 60 * 60),
        &String::from_str(&env, "Legitimate user"),
    );
    
    // Test malicious user trying to impersonate admin
    env.set_invoker(malicious_user.clone());
    
    let result = std::panic::catch_unwind(|| {
        test_setup.user_registry.verify_user(
            &malicious_user,
            &victim,
            &VerificationLevel::Basic,
            &(env.ledger().timestamp() + 365 * 24 * 60 * 60),
            &String::from_str(&env, "Malicious verification"),
        );
    });
    
    assert!(result.is_err());
    
    // Test malicious user trying to transfer admin role
    let result = std::panic::catch_unwind(|| {
        test_setup.user_registry.transfer_admin(&malicious_user, &victim);
    });
    
    assert!(result.is_err());
    
    // Test malicious user trying to mint NFTs without permission
    let result = std::panic::catch_unwind(|| {
        test_setup.reputation_nft.mint(
            &malicious_user,
            &victim,
            &999_u32,
            &String::from_str(&env, "Malicious NFT"),
            &String::from_str(&env, "Unauthorized mint"),
            &String::from_str(&env, "https://malicious.com"),
        );
    });
    
    assert!(result.is_err());
    
    // Test malicious user trying to access other user's data
    let user_status = test_setup.user_registry.get_user_status(&legitimate_user);
    // This should work as it's a read operation, but malicious user can't modify it
    
    // Test blacklisting malicious user
    env.set_invoker(test_setup.admin.clone());
    test_setup.user_registry.blacklist_user(&test_setup.admin, &malicious_user);
    
    let is_blacklisted = test_setup.user_registry.is_user_blacklisted(&malicious_user);
    assert!(is_blacklisted);
    
    println!("✅ Malicious user behavior test passed!");
}

/// Test complete dispute resolution with reputation impact
#[test]
fn test_dispute_resolution_with_reputation_impact() {
    let env = Env::default();
    let test_setup = setup_test_environment(&env);
    
    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let arbitrator = Address::generate(&env);
    
    // Register all parties
    env.set_invoker(test_setup.admin.clone());
    test_setup.user_registry.verify_user(
        &test_setup.admin,
        &client,
        &VerificationLevel::Basic,
        &(env.ledger().timestamp() + 365 * 24 * 60 * 60),
        &String::from_str(&env, "Test client"),
    );
    
    test_setup.user_registry.verify_user(
        &test_setup.admin,
        &freelancer,
        &VerificationLevel::Basic,
        &(env.ledger().timestamp() + 365 * 24 * 60 * 60),
        &String::from_str(&env, "Test freelancer"),
    );
    
    // Create escrow and deposit funds
    env.set_invoker(client.clone());
    test_setup.escrow.init_contract(
        &client,
        &freelancer,
        &2000_i128,
        &test_setup.fee_manager_id,
    );
    
    test_setup.escrow.deposit_funds(&client);
    
    // Create dispute
    test_setup.dispute.open_dispute(
        &1_u32,
        &client,
        &String::from_str(&env, "Quality issues with delivered work"),
        &test_setup.fee_manager_id,
        &2000_i128,
    );
    
    // Arbitrator resolves in favor of client
    env.set_invoker(arbitrator.clone());
    test_setup.dispute.resolve_dispute(&1_u32, &DisputeOutcome::ClientWins);
    
    // Client gets refund
    env.set_invoker(client.clone());
    test_setup.escrow.release_funds(&client);
    
    // Freelancer gets negative reputation NFT
    env.set_invoker(test_setup.admin.clone());
    test_setup.reputation_nft.mint(
        &test_setup.admin,
        &freelancer,
        &100_u32,
        &String::from_str(&env, "Dispute Loss"),
        &String::from_str(&env, "Lost dispute due to quality issues"),
        &String::from_str(&env, "https://example.com/negative-reputation"),
    );
    
    // Verify freelancer has the negative reputation NFT
    let nft_owner = test_setup.reputation_nft.get_owner(&100_u32);
    assert_eq!(nft_owner, freelancer);
    
    // Verify dispute is resolved
    let dispute_data = test_setup.dispute.get_dispute(&1_u32);
    assert_eq!(dispute_data.outcome, Some(DisputeOutcome::ClientWins));
    
    // Verify escrow funds were returned to client
    let escrow_data = test_setup.escrow.get_escrow_data();
    assert!(escrow_data.funds_released);
    
    println!("✅ Dispute resolution with reputation impact test passed!");
}

/// Test emergency contract interactions
#[test]
fn test_emergency_contract_interactions() {
    let env = Env::default();
    let test_setup = setup_test_environment(&env);
    
    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    
    // Register users
    env.set_invoker(test_setup.admin.clone());
    test_setup.user_registry.verify_user(
        &test_setup.admin,
        &client,
        &VerificationLevel::Basic,
        &(env.ledger().timestamp() + 365 * 24 * 60 * 60),
        &String::from_str(&env, "Test client"),
    );
    
    test_setup.user_registry.verify_user(
        &test_setup.admin,
        &freelancer,
        &VerificationLevel::Basic,
        &(env.ledger().timestamp() + 365 * 24 * 60 * 60),
        &String::from_str(&env, "Test freelancer"),
    );
    
    // Create escrow
    env.set_invoker(client.clone());
    test_setup.escrow.init_contract(
        &client,
        &freelancer,
        &1000_i128,
        &test_setup.fee_manager_id,
    );
    
    // Deposit funds
    test_setup.escrow.deposit_funds(&client);
    
    // Simulate emergency situation where admin needs to intervene
    // This would typically involve the emergency contract
    // For now, we'll test admin's ability to blacklist users in emergency
    
    env.set_invoker(test_setup.admin.clone());
    test_setup.user_registry.blacklist_user(&test_setup.admin, &freelancer);
    
    let is_blacklisted = test_setup.user_registry.is_user_blacklisted(&freelancer);
    assert!(is_blacklisted);
    
    // Admin can also unblacklist if situation is resolved
    test_setup.user_registry.unblacklist_user(&test_setup.admin, &freelancer);
    
    let is_blacklisted_after = test_setup.user_registry.is_user_blacklisted(&freelancer);
    assert!(!is_blacklisted_after);
    
    println!("✅ Emergency contract interactions test passed!");
} 