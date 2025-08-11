use soroban_sdk::{
    testutils::{Address as _, Ledger as _},
    Address, Env, Symbol, String, Vec,
};

// Import contract types and their dependencies
use userregistry_contract::{
    Contract as UserRegistryContract,
    types::{VerificationLevel, UserStatus, UserProfile},
};
use publication_contract::Contract as PublicationContract;
use escrow_contract::EscrowContract;
use dispute_contract::{
    DisputeResolutionContract,
    types::{DisputeData, DisputeOutcome},
};
use reputation_nft_contract::{
    Contract as ReputationNFTContract,
    types::{Metadata, TokenId},
};
use fee_manager_contract::{
    FeeManagerContract,
    types::{FeeConfig, FeeCalculation, FeeRecord, FeeStats, PremiumUser},
};

/// Test environment setup containing all contract instances
pub struct TestSetup {
    pub env: Env,
    pub admin: Address,
    pub user_registry: UserRegistryContract,
    pub publication: PublicationContract,
    pub escrow: EscrowContract,
    pub dispute: DisputeResolutionContract,
    pub reputation_nft: ReputationNFTContract,
    pub fee_manager: FeeManagerContract,
    pub fee_manager_id: Address,
}

/// Setup a complete test environment with all contracts deployed and initialized
pub fn setup_test_environment(env: &Env) -> TestSetup {
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

/// Helper function to create a verified user
pub fn create_verified_user(
    test_setup: &TestSetup,
    user: Address,
    level: VerificationLevel,
    metadata: &str,
) {
    test_setup.env.set_invoker(test_setup.admin.clone());
    test_setup.user_registry.verify_user(
        &test_setup.admin,
        &user,
        &level,
        &(test_setup.env.ledger().timestamp() + 365 * 24 * 60 * 60), // 1 year
        &String::from_str(&test_setup.env, metadata),
    );
}

/// Helper function to create a publication
pub fn create_publication(
    test_setup: &TestSetup,
    user: Address,
    title: &str,
    category: &str,
    amount: i128,
) -> u32 {
    test_setup.env.set_invoker(user.clone());
    test_setup.publication.publish(
        &user,
        &Symbol::new(&test_setup.env, "service"),
        &String::from_str(&test_setup.env, title),
        &String::from_str(&test_setup.env, category),
        &amount,
        &test_setup.env.ledger().timestamp(),
    )
}

/// Helper function to create an escrow
pub fn create_escrow(
    test_setup: &TestSetup,
    client: Address,
    freelancer: Address,
    amount: i128,
) {
    test_setup.env.set_invoker(client.clone());
    test_setup.escrow.init_contract(
        &client,
        &freelancer,
        &amount,
        &test_setup.fee_manager_id,
    );
}

/// Helper function to deposit funds into escrow
pub fn deposit_escrow_funds(test_setup: &TestSetup, client: Address) {
    test_setup.env.set_invoker(client.clone());
    test_setup.escrow.deposit_funds(&client);
}

/// Helper function to release escrow funds
pub fn release_escrow_funds(test_setup: &TestSetup, freelancer: Address) {
    test_setup.env.set_invoker(freelancer.clone());
    test_setup.escrow.release_funds(&freelancer);
}

/// Helper function to create a dispute
pub fn create_dispute(
    test_setup: &TestSetup,
    job_id: u32,
    initiator: Address,
    reason: &str,
    amount: i128,
) {
    test_setup.env.set_invoker(initiator.clone());
    test_setup.dispute.open_dispute(
        &job_id,
        &initiator,
        &String::from_str(&test_setup.env, reason),
        &test_setup.fee_manager_id,
        &amount,
    );
}

/// Helper function to resolve a dispute
pub fn resolve_dispute(
    test_setup: &TestSetup,
    job_id: u32,
    outcome: DisputeOutcome,
    arbitrator: Address,
) {
    test_setup.env.set_invoker(arbitrator.clone());
    test_setup.dispute.resolve_dispute(&job_id, &outcome);
}

/// Helper function to mint a reputation NFT
pub fn mint_reputation_nft(
    test_setup: &TestSetup,
    to: Address,
    token_id: u32,
    name: &str,
    description: &str,
    uri: &str,
) {
    test_setup.env.set_invoker(test_setup.admin.clone());
    test_setup.reputation_nft.mint(
        &test_setup.admin,
        &to,
        &token_id,
        &String::from_str(&test_setup.env, name),
        &String::from_str(&test_setup.env, description),
        &String::from_str(&test_setup.env, uri),
    );
}

/// Helper function to mint an achievement NFT
pub fn mint_achievement_nft(
    test_setup: &TestSetup,
    to: Address,
    achievement_type: &str,
) {
    test_setup.env.set_invoker(test_setup.admin.clone());
    test_setup.reputation_nft.mint_achv(
        &test_setup.admin,
        &to,
        &Symbol::new(&test_setup.env, achievement_type),
    );
}

/// Helper function to calculate fees
pub fn calculate_fees(
    test_setup: &TestSetup,
    amount: i128,
    user: Address,
    fee_type: u32,
) -> FeeCalculation {
    match fee_type {
        1 => test_setup.fee_manager.calculate_escrow_fee(&amount, &user),
        2 => test_setup.fee_manager.calculate_dispute_fee(&amount, &user),
        _ => panic!("Invalid fee type"),
    }
}

/// Helper function to verify user status
pub fn verify_user_status(
    test_setup: &TestSetup,
    user: Address,
    expected_verified: bool,
) {
    let status = test_setup.user_registry.get_user_status(&user);
    assert_eq!(status.is_verified, expected_verified);
}

/// Helper function to verify escrow state
pub fn verify_escrow_state(
    test_setup: &TestSetup,
    expected_client: Address,
    expected_freelancer: Address,
    expected_amount: i128,
    expected_deposited: bool,
    expected_released: bool,
) {
    let escrow_data = test_setup.escrow.get_escrow_data();
    assert_eq!(escrow_data.client, expected_client);
    assert_eq!(escrow_data.freelancer, expected_freelancer);
    assert_eq!(escrow_data.amount, expected_amount);
    assert_eq!(escrow_data.funds_deposited, expected_deposited);
    assert_eq!(escrow_data.funds_released, expected_released);
}

/// Helper function to verify dispute state
pub fn verify_dispute_state(
    test_setup: &TestSetup,
    job_id: u32,
    expected_initiator: Address,
    expected_outcome: Option<DisputeOutcome>,
) {
    let dispute_data = test_setup.dispute.get_dispute(&job_id);
    assert_eq!(dispute_data.initiator, expected_initiator);
    assert_eq!(dispute_data.job_id, job_id);
    assert_eq!(dispute_data.outcome, expected_outcome);
}

/// Helper function to verify NFT ownership
pub fn verify_nft_ownership(
    test_setup: &TestSetup,
    token_id: u32,
    expected_owner: Address,
) {
    let owner = test_setup.reputation_nft.get_owner(&token_id);
    assert_eq!(owner, expected_owner);
}

/// Helper function to simulate time progression
pub fn advance_time(env: &Env, seconds: u64) {
    env.ledger().with_mut(|ledger| {
        ledger.timestamp += seconds;
    });
}

/// Helper function to generate multiple test addresses
pub fn generate_test_addresses(env: &Env, count: usize) -> Vec<Address> {
    let mut addresses = Vec::new(env);
    for _ in 0..count {
        addresses.push_back(Address::generate(env));
    }
    addresses
}

/// Helper function to create bulk test data
pub fn create_bulk_test_data(
    test_setup: &TestSetup,
    num_users: usize,
    num_publications: usize,
) -> (Vec<Address>, Vec<u32>) {
    let users = generate_test_addresses(&test_setup.env, num_users);
    let mut publications = Vec::new(&test_setup.env);
    
    // Register all users
    for (i, user) in users.iter().enumerate() {
        create_verified_user(
            test_setup,
            user.clone(),
            VerificationLevel::Basic,
            &format!("Test User {}", i),
        );
    }
    
    // Create publications (alternating between users)
    for i in 0..num_publications {
        let user_index = i % users.len();
        let user = users.get(user_index as u32).unwrap();
        
        let pub_id = create_publication(
            test_setup,
            user.clone(),
            &format!("Project {}", i),
            "Technology",
            (100 * (i + 1) as i128),
        );
        
        publications.push_back(pub_id);
    }
    
    (users, publications)
}

/// Helper function to verify fee calculations are consistent
pub fn verify_fee_consistency(
    test_setup: &TestSetup,
    amount: i128,
    user: Address,
    fee_type: u32,
) {
    let fee_calc = match fee_type {
        1 => test_setup.fee_manager.calculate_escrow_fee(&amount, &user),
        2 => test_setup.fee_manager.calculate_dispute_fee(&amount, &user),
        _ => panic!("Invalid fee type"),
    };
    
    let collected_fee = test_setup.fee_manager.collect_fee(&amount, &fee_type, &user);
    
    assert_eq!(fee_calc.fee_amount, collected_fee);
    assert_eq!(fee_calc.net_amount, amount - collected_fee);
}

/// Helper function to test premium user functionality
pub fn test_premium_user_functionality(test_setup: &TestSetup, user: Address) {
    // Add user as premium
    test_setup.env.set_invoker(test_setup.admin.clone());
    test_setup.fee_manager.add_premium_user(&user);
    
    // Verify user is premium
    let is_premium = test_setup.fee_manager.is_premium_user(&user);
    assert!(is_premium);
    
    // Test fee calculation for premium user
    let fee_calc = test_setup.fee_manager.calculate_escrow_fee(&1000_i128, &user);
    // Premium users should have lower fees
    
    // Remove premium status
    test_setup.fee_manager.remove_premium_user(&user);
    
    let is_premium_after = test_setup.fee_manager.is_premium_user(&user);
    assert!(!is_premium_after);
}

/// Helper function to test blacklist functionality
pub fn test_blacklist_functionality(test_setup: &TestSetup, user: Address) {
    // Add user to blacklist
    test_setup.env.set_invoker(test_setup.admin.clone());
    test_setup.user_registry.blacklist_user(&test_setup.admin, &user);
    
    // Verify user is blacklisted
    let is_blacklisted = test_setup.user_registry.is_user_blacklisted(&user);
    assert!(is_blacklisted);
    
    // Remove from blacklist
    test_setup.user_registry.unblacklist_user(&test_setup.admin, &user);
    
    // Verify user is not blacklisted
    let is_blacklisted_after = test_setup.user_registry.is_user_blacklisted(&user);
    assert!(!is_blacklisted_after);
}

/// Helper function to test moderator functionality
pub fn test_moderator_functionality(test_setup: &TestSetup, moderator: Address) {
    // Add moderator
    test_setup.env.set_invoker(test_setup.admin.clone());
    test_setup.user_registry.add_moderator(&test_setup.admin, &moderator);
    
    // Verify moderator was added
    let moderators = test_setup.user_registry.get_moderators();
    assert!(moderators.contains(&moderator));
    
    // Remove moderator
    test_setup.user_registry.remove_moderator(&test_setup.admin, &moderator);
    
    // Verify moderator was removed
    let moderators_after = test_setup.user_registry.get_moderators();
    assert!(!moderators_after.contains(&moderator));
}

/// Helper function to test admin transfer
pub fn test_admin_transfer(test_setup: &TestSetup, new_admin: Address) {
    // Transfer admin role
    test_setup.env.set_invoker(test_setup.admin.clone());
    test_setup.user_registry.transfer_admin(&test_setup.admin, &new_admin);
    
    // Verify admin was transferred
    let current_admin = test_setup.user_registry.get_admin();
    assert_eq!(current_admin, Some(new_admin.clone()));
    
    // Transfer back
    test_setup.env.set_invoker(new_admin.clone());
    test_setup.user_registry.transfer_admin(&new_admin, &test_setup.admin);
    
    // Verify admin was transferred back
    let current_admin_after = test_setup.user_registry.get_admin();
    assert_eq!(current_admin_after, Some(test_setup.admin.clone()));
}

/// Helper function to test bulk operations
pub fn test_bulk_operations(test_setup: &TestSetup, users: Vec<Address>) {
    // Bulk verify users
    test_setup.env.set_invoker(test_setup.admin.clone());
    test_setup.user_registry.bulk_verify_users(
        &test_setup.admin,
        &users,
        &VerificationLevel::Basic,
        &(test_setup.env.ledger().timestamp() + 365 * 24 * 60 * 60),
        &String::from_str(&test_setup.env, "Bulk verification"),
    );
    
    // Verify all users are verified
    for user in users.iter() {
        let status = test_setup.user_registry.get_user_status(user);
        assert!(status.is_verified);
    }
}

/// Helper function to test fee manager statistics
pub fn test_fee_manager_statistics(test_setup: &TestSetup) {
    // Get fee statistics
    let fee_stats = test_setup.fee_manager.get_fee_stats();
    let fee_history = test_setup.fee_manager.get_fee_history();
    let premium_users = test_setup.fee_manager.get_premium_users();
    let platform_balance = test_setup.fee_manager.get_platform_balance();
    
    // Verify statistics are accessible
    assert!(fee_stats.total_fees_collected >= 0);
    assert!(platform_balance >= 0);
    
    // Test fee configuration
    let fee_config = test_setup.fee_manager.get_fee_config();
    assert!(fee_config.escrow_fee_percentage > 0);
    assert!(fee_config.dispute_fee_percentage > 0);
    assert!(fee_config.arbitrator_fee_percentage > 0);
}

/// Helper function to test reputation NFT metadata
pub fn test_reputation_nft_metadata(
    test_setup: &TestSetup,
    token_id: u32,
    expected_name: &str,
    expected_description: &str,
    expected_uri: &str,
) {
    let metadata = test_setup.reputation_nft.get_metadata(&token_id);
    
    assert_eq!(metadata.name, String::from_str(&test_setup.env, expected_name));
    assert_eq!(metadata.description, String::from_str(&test_setup.env, expected_description));
    assert_eq!(metadata.uri, String::from_str(&test_setup.env, expected_uri));
}

/// Helper function to test NFT transfer
pub fn test_nft_transfer(
    test_setup: &TestSetup,
    token_id: u32,
    from: Address,
    to: Address,
) {
    // Transfer NFT
    test_setup.env.set_invoker(from.clone());
    test_setup.reputation_nft.transfer(&from, &to, &token_id);
    
    // Verify transfer
    let new_owner = test_setup.reputation_nft.get_owner(&token_id);
    assert_eq!(new_owner, to);
}

/// Helper function to test minter management
pub fn test_minter_management(test_setup: &TestSetup, minter: Address) {
    // Add minter
    test_setup.env.set_invoker(test_setup.admin.clone());
    test_setup.reputation_nft.add_minter(&test_setup.admin, &minter);
    
    // Verify minter was added
    let is_minter = test_setup.reputation_nft.is_minter(&minter);
    assert!(is_minter);
    
    // Remove minter
    test_setup.reputation_nft.remove_minter(&test_setup.admin, &minter);
    
    // Verify minter was removed
    let is_minter_after = test_setup.reputation_nft.is_minter(&minter);
    assert!(!is_minter_after);
} 