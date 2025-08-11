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

// Import types from contracts
use userregistry_contract::types::{VerificationLevel, UserStatus, UserProfile};
use dispute_contract::types::{DisputeData, DisputeOutcome};
use fee_manager_contract::types::{FeeConfig, FeeCalculation, FeeRecord, FeeStats, PremiumUser};

/// Test environment setup containing all contract instances
struct TestSetup {
    env: Env,
    admin: Address,
    user_registry: UserRegistryContract,
    publication: PublicationContract,
    escrow: EscrowContract,
    dispute: DisputeResolutionContract,
    reputation_nft: ReputationNFTContract,
    fee_manager: FeeManagerContract,
    fee_manager_id: Address,
}

/// Setup a complete test environment with all contracts deployed and initialized
fn setup_test_environment(env: &Env) -> TestSetup {
    // Generate admin address
    let admin = Address::generate(env);
    
    // Deploy all contracts
    let user_registry_id = env.register_contract(None, UserRegistryContract);
    let publication_id = env.register_contract(None, PublicationContract);
    let escrow_id = env.register_contract(None, EscrowContract);
    let dispute_id = env.register_contract(None, DisputeResolutionContract);
    let reputation_nft_id = env.register_contract(None, ReputationNFTContract);
    let fee_manager_id = env.register_contract(None, FeeManagerContract);
    
    // Create contract clients
    let user_registry = UserRegistryContract::new(env, &user_registry_id);
    let publication = PublicationContract::new(env, &publication_id);
    let escrow = EscrowContract::new(env, &escrow_id);
    let dispute = DisputeResolutionContract::new(env, &dispute_id);
    let reputation_nft = ReputationNFTContract::new(env, &reputation_nft_id);
    let fee_manager = FeeManagerContract::new(env, &fee_manager_id);
    
    // Initialize contracts
    env.set_invoker(admin.clone());
    
    // Initialize user registry
    user_registry.initialize_admin(&admin);
    
    // Initialize fee manager
    let platform_wallet = Address::generate(env);
    fee_manager.initialize(&admin, &platform_wallet);
    
    // Set default fee rates
    fee_manager.set_fee_rates(&3_i128, &5_i128, &10_i128); // 3%, 5%, 10%
    
    // Initialize reputation NFT contract
    reputation_nft.init(&admin);
    
    // Initialize dispute contract
    let arbitrator = Address::generate(env);
    dispute.initialize(&arbitrator);
    
    TestSetup {
        env: env.clone(),
        admin,
        user_registry,
        publication,
        escrow,
        dispute,
        reputation_nft,
        fee_manager,
        fee_manager_id,
    }
}

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

/// Quick smoke test to verify basic functionality
#[test]
fn smoke_test() {
    println!("🚬 Running Smoke Test");
    println!("=====================");
    
    let env = Env::default();
    let test_setup = setup_test_environment(&env);
    
    // Test basic user registration
    let user = Address::generate(&env);
    env.set_invoker(test_setup.admin.clone());
    test_setup.user_registry.verify_user(
        &test_setup.admin,
        &user,
        &VerificationLevel::Basic,
        &(env.ledger().timestamp() + 365 * 24 * 60 * 60),
        &String::from_str(&env, "Smoke test user"),
    );
    
    // Test basic publication
    env.set_invoker(user.clone());
    let publication_id = test_setup.publication.publish(
        &user,
        &Symbol::new(&env, "service"),
        &String::from_str(&env, "Smoke test project"),
        &String::from_str(&env, "Technology"),
        &1000_i128,
        &env.ledger().timestamp(),
    );
    assert!(publication_id > 0);
    
    // Test basic escrow
    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    env.set_invoker(test_setup.admin.clone());
    test_setup.user_registry.verify_user(
        &test_setup.admin,
        &client,
        &VerificationLevel::Basic,
        &(env.ledger().timestamp() + 365 * 24 * 60 * 60),
        &String::from_str(&env, "Smoke test client"),
    );
    test_setup.user_registry.verify_user(
        &test_setup.admin,
        &freelancer,
        &VerificationLevel::Basic,
        &(env.ledger().timestamp() + 365 * 24 * 60 * 60),
        &String::from_str(&env, "Smoke test freelancer"),
    );
    
    env.set_invoker(client.clone());
    test_setup.escrow.init_contract(
        &client,
        &freelancer,
        &500_i128,
        &test_setup.fee_manager_id,
    );
    
    // Test basic fee calculation
    let fee_calc = test_setup.fee_manager.calculate_escrow_fee(&500_i128, &client);
    assert!(fee_calc.fee_amount >= 0);
    
    // Test basic NFT minting
    env.set_invoker(test_setup.admin.clone());
    test_setup.reputation_nft.mint(
        &test_setup.admin,
        &user,
        &1_u32,
        &String::from_str(&env, "Smoke test NFT"),
        &String::from_str(&env, "Smoke test description"),
        &String::from_str(&env, "https://smoke.test"),
    );
    
    let nft_owner = test_setup.reputation_nft.get_owner(&1_u32);
    assert_eq!(nft_owner, user);
    
    println!("✅ Smoke test passed! Basic functionality is working.");
} 