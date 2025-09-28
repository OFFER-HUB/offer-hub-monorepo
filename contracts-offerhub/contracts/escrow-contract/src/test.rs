#![cfg(test)]

use crate::types::EscrowState;
use crate::{EscrowContract, EscrowContractClient};
use soroban_sdk::testutils::{Address as _, Ledger, LedgerInfo};
use soroban_sdk::{contract, contractimpl, log, Address, Env, String, Symbol};

#[contract]
pub struct MockTokenContract;

#[contractimpl]
impl MockTokenContract {
    pub fn balance(_env: Env, _addr: Address) -> i128 {
        1000
    }
    pub fn transfer(_env: Env, _from: Address, _to: Address, _amount: i128) {}
}

fn setup_token(env: &Env) -> Address {
    env.register(MockTokenContract, ())
}

fn setup_env() -> Env {
    let env = Env::default();
    env.ledger().with_mut(|l| l.timestamp = 1000);
    env
}

#[test]
fn test_deposit_and_release_token() {
    let env = setup_env();
    env.mock_all_auths();

    let contract_id = env.register(EscrowContract, ());
    let contract = EscrowContractClient::new(&env, &contract_id);

    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let arbitrator = Address::generate(&env);
    let token = setup_token(&env);
    let amount = 500;
    let timeout = 3600; // 1 hour (minimum allowed)

    contract.init_contract_full(&client, &freelancer, &arbitrator, &token, &amount, &timeout);
    contract.deposit_funds(&client);
    let data = env.as_contract(&contract_id, || crate::contract::get_escrow_data(&env));
    assert_eq!(data.state, EscrowState::Funded);

    contract.release_funds(&freelancer);
    let data = env.as_contract(&contract_id, || crate::contract::get_escrow_data(&env));
    assert_eq!(data.state, EscrowState::Released);
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #5)")]
fn test_insufficient_fund() {
    let env = setup_env();
    env.mock_all_auths();

    let contract_id = env.register(EscrowContract, ());
    let contract = EscrowContractClient::new(&env, &contract_id);

    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let arbitrator = Address::generate(&env);
    let token = setup_token(&env);
    let amount = 10000;
    let timeout = 3600; // 1 hour (minimum allowed)

    contract.init_contract_full(&client, &freelancer, &arbitrator, &token, &amount, &timeout);
    contract.deposit_funds(&client);
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #1)")]
fn test_already_initilaized() {
    let env = setup_env();
    env.mock_all_auths();

    let contract_id = env.register(EscrowContract, ());
    let contract = EscrowContractClient::new(&env, &contract_id);

    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let arbitrator = Address::generate(&env);
    let token = setup_token(&env);
    let amount = 500_000_000;
    let timeout = 3600; // 1 hour (minimum allowed)

    contract.init_contract_full(&client, &freelancer, &arbitrator, &token, &amount, &timeout);
    contract.init_contract_full(&client, &freelancer, &arbitrator, &token, &amount, &timeout);

}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #5)")]
fn test_deposit_insufficient_balance() {
    let env = setup_env();
    env.mock_all_auths();

    let contract_id = env.register(EscrowContract, ());
    let contract = EscrowContractClient::new(&env, &contract_id);

    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let arbitrator = Address::generate(&env);
    let token = setup_token(&env);
    let amount = 500_000_000;
    let timeout = 3600; // 1 hour (minimum allowed)

    contract.init_contract_full(&client, &freelancer, &arbitrator, &token, &amount, &timeout);
    contract.deposit_funds(&client);
}


#[test]
#[should_panic(expected = "HostError: Error(Contract, #2)")]
fn test_not_initialized() {
    let env = setup_env();
    env.mock_all_auths();

    let contract_id = env.register(EscrowContract, ());
    let contract = EscrowContractClient::new(&env, &contract_id);

    let client = Address::generate(&env);
    contract.deposit_funds(&client);
}

#[test]
fn test_resolve_dispute_arbitrator() {
    let env = setup_env();
    env.mock_all_auths();

    let contract_id = env.register(EscrowContract, ());
    let contract = EscrowContractClient::new(&env, &contract_id);

    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let arbitrator = Address::generate(&env);
    let token = setup_token(&env);
    let amount = 500;
    let timeout = 3600; // 1 hour (minimum allowed)

    contract.init_contract_full(&client, &freelancer, &arbitrator, &token, &amount, &timeout);
    contract.deposit_funds(&client);

    contract.dispute(&client);
    let data = contract.get_escrow_data();
    assert_eq!(data.state, EscrowState::Disputed);

    contract.resolve_dispute(&arbitrator, &Symbol::new(&env, "client_wins"));
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #3)")]
fn test_resolve_dispute_panics_for_non_arbitrator() {
    let env = setup_env();
    env.mock_all_auths();

    let contract_id = env.register(EscrowContract, ());
    let contract = EscrowContractClient::new(&env, &contract_id);

    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let arbitrator = Address::generate(&env);
    let token = setup_token(&env);
    let amount = 500;
    let timeout = 3600; // 1 hour (minimum allowed)

    contract.init_contract_full(&client, &freelancer, &arbitrator, &token, &amount, &timeout);
    contract.deposit_funds(&client);
    contract.dispute(&client);

    contract.resolve_dispute(&client, &Symbol::new(&env, "client_wins"));
}


#[test]
#[should_panic(expected = "HostError: Error(Contract, #7)")]
fn test_dispute_not_opened() {
    let env = setup_env();
    env.mock_all_auths();

    let contract_id = env.register(EscrowContract, ());
    let contract = EscrowContractClient::new(&env, &contract_id);

    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let arbitrator = Address::generate(&env);
    let token = setup_token(&env);
    let amount = 500;
    let timeout = 3600; // 1 hour (minimum allowed)

    contract.init_contract_full(&client, &freelancer, &arbitrator, &token, &amount, &timeout);
    contract.deposit_funds(&client);

    contract.resolve_dispute(&client, &Symbol::new(&env, "client_wins"));
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #8)")]
fn test_invalid_dsipute_result() {
    let env = setup_env();
    env.mock_all_auths();

    let contract_id = env.register(EscrowContract, ());
    let contract = EscrowContractClient::new(&env, &contract_id);

    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let arbitrator = Address::generate(&env);
    let token = setup_token(&env);
    let amount = 500;
    let timeout = 3600; // 1 hour (minimum allowed)

    contract.init_contract_full(&client, &freelancer, &arbitrator, &token, &amount, &timeout);
    contract.deposit_funds(&client);

    contract.dispute(&client);
    let data = contract.get_escrow_data();
    assert_eq!(data.state, EscrowState::Disputed);
    contract.resolve_dispute(&arbitrator, &Symbol::new(&env, "none"));
}


#[test]
#[should_panic(expected = "HostError: Error(Contract, #3)")]
fn test_resolve_dispute_unauthorized() {
    let env = setup_env();
    env.mock_all_auths();

    let contract_id = env.register(EscrowContract, ());
    let contract = EscrowContractClient::new(&env, &contract_id);

    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let arbitrator = Address::generate(&env);
    let token = setup_token(&env);
    let amount = 500;
    let timeout = 3600; // 1 hour (minimum allowed)

    contract.init_contract_full(&client, &freelancer, &arbitrator, &token, &amount, &timeout);
    contract.deposit_funds(&client);

    contract.dispute(&client);

    contract.resolve_dispute(&freelancer, &Symbol::new(&env, "client_wins"));
}

#[test]
fn test_auto_release_after_timeout() {
    let env = setup_env();
    env.mock_all_auths();

    let contract_id = env.register(EscrowContract, ());
    let contract = EscrowContractClient::new(&env, &contract_id);

    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let arbitrator = Address::generate(&env);
    let token = setup_token(&env);
    let amount = 500;
    let timeout = 3600; // 1 hour (minimum allowed)

    contract.init_contract_full(&client, &freelancer, &arbitrator, &token, &amount, &timeout);
    contract.deposit_funds(&client);

    env.ledger().with_mut(|l| l.timestamp += timeout + 1);

    contract.auto_release();
    let data = env.as_contract(&contract_id, || crate::contract::get_escrow_data(&env));
    assert_eq!(data.state, EscrowState::Released);
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #6)")]
fn test_auto_release_panics_if_not_timed_out() {
    let env = setup_env();
    env.mock_all_auths();

    let contract_id = env.register(EscrowContract, ());
    let contract = EscrowContractClient::new(&env, &contract_id);

    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let arbitrator = Address::generate(&env);
    let token = setup_token(&env);
    let amount = 500;
    let timeout = 3600; // 1 hour (minimum allowed)

    contract.init_contract_full(&client, &freelancer, &arbitrator, &token, &amount, &timeout);
    contract.deposit_funds(&client);

    contract.auto_release();
}

#[test]
fn test_init_contract_compatibility() {
    let env = setup_env();
    env.mock_all_auths();

    let contract_id = env.register(EscrowContract, ());
    let contract = EscrowContractClient::new(&env, &contract_id);

    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let fee_manager = Address::generate(&env);

    contract.init_contract(&client, &freelancer, &1000, &fee_manager);
    let data = env.as_contract(&contract_id, || crate::contract::get_escrow_data(&env));
    assert_eq!(data.client, client);
    assert_eq!(data.freelancer, freelancer);
    assert_eq!(data.amount, 1000);
    assert_eq!(data.fee_manager, fee_manager);
}

#[test]
fn test_milestone_lifecycle() {
    let env = setup_env();
    env.mock_all_auths();

    let contract_id = env.register(EscrowContract, ());
    let contract = EscrowContractClient::new(&env, &contract_id);

    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let fee_manager = Address::generate(&env);
    let amount = 1000;

    // Usar init_contract en lugar de init_contract_full
    contract.init_contract(&client, &freelancer, &amount, &fee_manager);
    contract.deposit_funds(&client);

    // Usar valores más simples para los milestones
    let milestone_desc = String::from_str(&env, "Frontend");
    let milestone_amount = 500;
    let milestone_id = contract.add_milestone(&client, &milestone_desc, &milestone_amount);

    let milestones = contract.get_milestones();
    assert_eq!(milestones.len(), 1);

    contract.approve_milestone(&client, &milestone_id);
    contract.release_milestone(&freelancer, &milestone_id);

    let final_milestones = contract.get_milestones();
    let released_milestone = final_milestones.get(0).unwrap();
    assert!(released_milestone.approved);
    assert!(released_milestone.released);
}

#[test]
fn test_dispute_resolution() {
    let env = setup_env();
    env.mock_all_auths();

    let contract_id = env.register(EscrowContract, ());
    let contract = EscrowContractClient::new(&env, &contract_id);

    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let arbitrator = Address::generate(&env);
    let token = setup_token(&env);
    let amount = 1000;
    let timeout = 3600; // 1 hour (minimum allowed)

    contract.init_contract_full(&client, &freelancer, &arbitrator, &token, &amount, &timeout);
    contract.deposit_funds(&client);

    contract.dispute(&client);
    let data = env.as_contract(&contract_id, || crate::contract::get_escrow_data(&env));
    assert_eq!(data.state, EscrowState::Disputed);

    // Usar símbolo más simple
    let resolution = Symbol::new(&env, "freelancer");
    contract.resolve_dispute(&arbitrator, &resolution);

    let resolved_data = env.as_contract(&contract_id, || crate::contract::get_escrow_data(&env));
    assert_eq!(resolved_data.state, EscrowState::Released);
}

#[test]
fn test_basic_authorization() {
    let env = setup_env();
    env.mock_all_auths();

    let contract_id = env.register(EscrowContract, ());
    let contract = EscrowContractClient::new(&env, &contract_id);

    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let fee_manager = Address::generate(&env);
    let amount = 1000;

    contract.init_contract(&client, &freelancer, &amount, &fee_manager);
    contract.deposit_funds(&client);

    let milestone_desc = String::from_str(&env, "Task Description");
    let milestone_id = contract.add_milestone(&client, &milestone_desc, &500);

    let milestones = contract.get_milestones();
    assert_eq!(milestones.len(), 1);

    contract.approve_milestone(&client, &milestone_id);
    let updated_milestones = contract.get_milestones();
    let milestone = updated_milestones.get(0).unwrap();
    assert!(milestone.approved);
}

#[test]
fn test_timeout_functionality() {
    let env = setup_env();
    env.mock_all_auths();

    let contract_id = env.register(EscrowContract, ());
    let contract = EscrowContractClient::new(&env, &contract_id);

    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let arbitrator = Address::generate(&env);
    let token = setup_token(&env);
    let amount = 1000;
    let timeout = 3600; // 1 hour (minimum allowed)

    contract.init_contract_full(&client, &freelancer, &arbitrator, &token, &amount, &timeout);
    contract.deposit_funds(&client);

    env.ledger().with_mut(|l| l.timestamp = 5000); // After timeout (1000 + 3600 = 4600)

    contract.auto_release();
    let data = env.as_contract(&contract_id, || crate::contract::get_escrow_data(&env));
    assert_eq!(data.state, EscrowState::Released);
}

#[test]
fn test_multiple_milestones() {
    let env = setup_env();
    env.mock_all_auths();

    let contract_id = env.register(EscrowContract, ());
    let contract = EscrowContractClient::new(&env, &contract_id);

    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let fee_manager = Address::generate(&env);
    let amount = 1000;

    contract.init_contract(&client, &freelancer, &amount, &fee_manager);
    contract.deposit_funds(&client);

    let milestone1_id = contract.add_milestone(&client, &String::from_str(&env, "Frontend"), &300);
    let milestone2_id = contract.add_milestone(&client, &String::from_str(&env, "Backend"), &400);
    let milestone3_id = contract.add_milestone(&client, &String::from_str(&env, "Testing"), &300);

    let milestones = contract.get_milestones();
    assert_eq!(milestones.len(), 3);

    // Aprobar y liberar en secuencia
    contract.approve_milestone(&client, &milestone1_id);
    contract.release_milestone(&freelancer, &milestone1_id);

    contract.approve_milestone(&client, &milestone2_id);
    contract.release_milestone(&freelancer, &milestone2_id);

    contract.approve_milestone(&client, &milestone3_id);
    contract.release_milestone(&freelancer, &milestone3_id);

    let final_milestones = contract.get_milestones();
    for i in 0..final_milestones.len() {
        let milestone = final_milestones.get(i).unwrap();
        assert!(milestone.approved);
        assert!(milestone.released);
    }
}

#[test]
fn test_successful_escrow_flow() {
    let env = setup_env();
    env.mock_all_auths();

    let contract_id = env.register(EscrowContract, ());
    let contract = EscrowContractClient::new(&env, &contract_id);

    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let fee_manager = Address::generate(&env);
    let amount = 1000;

    contract.init_contract(&client, &freelancer, &amount, &fee_manager);
    let initial_data = env.as_contract(&contract_id, || crate::contract::get_escrow_data(&env));
    assert_eq!(initial_data.state, EscrowState::Created);

    contract.deposit_funds(&client);
    let funded_data = env.as_contract(&contract_id, || crate::contract::get_escrow_data(&env));
    assert_eq!(funded_data.state, EscrowState::Funded);

    let milestone_desc = String::from_str(&env, "Task Description");
    let milestone_id = contract.add_milestone(&client, &milestone_desc, &500);
    let milestones = contract.get_milestones();
    assert_eq!(milestones.len(), 1);

    contract.approve_milestone(&client, &milestone_id);
    contract.release_milestone(&freelancer, &milestone_id);

    let final_milestones = contract.get_milestones();
    let milestone = final_milestones.get(0).unwrap();
    assert!(milestone.approved);
    assert!(milestone.released);
}

#[test]
fn test_escrow_data_integrity() {
    let env = setup_env();
    env.mock_all_auths();

    let contract_id = env.register(EscrowContract, ());
    let contract = EscrowContractClient::new(&env, &contract_id);

    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let fee_manager = Address::generate(&env);
    let amount = 1000;

    contract.init_contract(&client, &freelancer, &amount, &fee_manager);
    let initial_data = env.as_contract(&contract_id, || crate::contract::get_escrow_data(&env));

    assert_eq!(initial_data.client, client);
    assert_eq!(initial_data.freelancer, freelancer);
    assert_eq!(initial_data.amount, amount);
    assert_eq!(initial_data.state, EscrowState::Created);
    assert_eq!(initial_data.released_amount, 0);

    contract.deposit_funds(&client);
    let funded_data = env.as_contract(&contract_id, || crate::contract::get_escrow_data(&env));
    assert_eq!(funded_data.state, EscrowState::Funded);

    contract.release_funds(&freelancer);
    let released_data = env.as_contract(&contract_id, || crate::contract::get_escrow_data(&env));

    assert_eq!(released_data.state, EscrowState::Released);
}


#[test]
fn test_increment_transaction_count() {

    let env = setup_env();
    env.mock_all_auths();

    let contract_id = env.register(EscrowContract, ());
    let contract = EscrowContractClient::new(&env, &contract_id);


    let admin = Address::generate(&env);

    contract.initialize_contract(&admin);

    let config = env.as_contract(&contract_id, || crate::contract::get_config(&env));
    assert_eq!(config.min_escrow_amount, 1000); // DEFAULT_MIN_ESCROW_AMOUNT
    assert_eq!(config.max_escrow_amount, 1000000000); // DEFAULT_MAX_ESCROW_AMOUNT
    assert_eq!(config.default_timeout_days, 30); // DEFAULT_TIMEOUT_DAYS
    assert_eq!(config.max_milestones, 20); // DEFAULT_MAX_MILESTONES
    assert_eq!(config.fee_percentage, 250); // DEFAULT_FEE_PERCENTAGE
    assert_eq!(config.rate_limit_calls, 10); // DEFAULT_RATE_LIMIT_CALLS
    assert_eq!(config.rate_limit_window_hours, 1); // DEFAULT_RATE_LIMIT_WINDOW_HOURS
}

#[test]
fn test_set_config() {
    let env = setup_env();
    env.mock_all_auths();

    let contract_id = env.register(EscrowContract, ());
    let contract = EscrowContractClient::new(&env, &contract_id);

    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let arbitrator = Address::generate(&env);
    let token = setup_token(&env);
    let amount = 500;
    let timeout = 3600;

    // Check initial transaction count
    let initial_count = contract.get_total_transactions();
    assert_eq!(initial_count, 0);

    // Initialize contract (no transaction count increment)
    contract.init_contract_full(&client, &freelancer, &arbitrator, &token, &amount, &timeout);

    // Deposit funds (should increment count)
    contract.deposit_funds(&client);
    let count_after_deposit = contract.get_total_transactions();
    assert_eq!(count_after_deposit, 1);

    // Add milestone (should increment count)
    contract.add_milestone(&client, &String::from_str(&env, "Test milestone"), &200);
    let count_after_milestone = contract.get_total_transactions();
    assert_eq!(count_after_milestone, 2);

    // Approve milestone (should increment count)
    contract.approve_milestone(&client, &1);
    let count_after_approve = contract.get_total_transactions();
    assert_eq!(count_after_approve, 3);

    // Release milestone (should increment count)
    contract.release_milestone(&freelancer, &1);
    let count_after_release_milestone = contract.get_total_transactions();
    assert_eq!(count_after_release_milestone, 4);

    // Release funds (should increment count)
    contract.release_funds(&freelancer);
    let final_count = contract.get_total_transactions();
    assert_eq!(final_count, 5);
}

#[test]
fn test_reset_transaction_count() {
    let env = setup_env();
    env.mock_all_auths();

    let contract_id = env.register(EscrowContract, ());
    let contract = EscrowContractClient::new(&env, &contract_id);


    let admin = Address::generate(&env);
    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let fee_manager = Address::generate(&env);

    // Initialize contract first
    contract.initialize_contract(&admin);
    
    // Initialize escrow data so client can set config
    contract.init_contract(&client, &freelancer, &500, &fee_manager);

    // Create new config
    let new_config = crate::types::ContractConfig {
        min_escrow_amount: 2000,
        max_escrow_amount: 2000000000,
        default_timeout_days: 45,
        max_milestones: 30,
        fee_percentage: 300,
        rate_limit_calls: 15,
        rate_limit_window_hours: 2,
    };

    contract.set_config(&client, &new_config);

    let config = env.as_contract(&contract_id, || crate::contract::get_config(&env));
    assert_eq!(config.min_escrow_amount, 2000);
    assert_eq!(config.max_escrow_amount, 2000000000);
    assert_eq!(config.default_timeout_days, 45);
    assert_eq!(config.max_milestones, 30);
    assert_eq!(config.fee_percentage, 300);
    assert_eq!(config.rate_limit_calls, 15);
    assert_eq!(config.rate_limit_window_hours, 2);
}

#[test]
#[should_panic(expected = "Error(Contract, #3)")]
fn test_set_config_unauthorized() {
    let env = setup_env();
    env.mock_all_auths();

    let contract_id = env.register(EscrowContract, ());
    let contract = EscrowContractClient::new(&env, &contract_id);

    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let arbitrator = Address::generate(&env);
    let token = setup_token(&env);
    let amount = 500;
    let timeout = 3600;

    // Check initial transaction count
    let initial_count = contract.get_total_transactions();
    assert_eq!(initial_count, 0);

    // Initialize contract (no transaction count increment)
    contract.init_contract_full(&client, &freelancer, &arbitrator, &token, &amount, &timeout);

    // Deposit funds (should increment count)
    contract.deposit_funds(&client);
    let count_after_deposit = contract.get_total_transactions();
    assert_eq!(count_after_deposit, 1);

    // Add milestone (should increment count)
    contract.add_milestone(&client, &String::from_str(&env, "Test milestone"), &200);
    let count_after_milestone = contract.get_total_transactions();
    assert_eq!(count_after_milestone, 2);

    // Approve milestone (should increment count)
    contract.approve_milestone(&client, &1);
    let count_after_approve = contract.get_total_transactions();
    assert_eq!(count_after_approve, 3);

    // Release milestone (should increment count)
    contract.release_milestone(&freelancer, &1);
    let count_after_release_milestone = contract.get_total_transactions();
    assert_eq!(count_after_release_milestone, 4);

    // Release funds (should increment count)
    contract.release_funds(&freelancer);
    let final_count = contract.get_total_transactions();
    assert_eq!(final_count, 5);

    contract.reset_transaction_count(&freelancer);
    let reset_transaction_count = contract.get_total_transactions();
    assert_eq!(reset_transaction_count, 0);
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #3)")]
fn test_reset_transaction_count_failed() {
    let env = setup_env();
    env.mock_all_auths();

    let contract_id = env.register(EscrowContract, ());
    let contract = EscrowContractClient::new(&env, &contract_id);


    let admin = Address::generate(&env);
    let unauthorized_user = Address::generate(&env);

    // Initialize contract
    contract.initialize_contract(&admin);

    // Initialize escrow data for the test
    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let fee_manager = Address::generate(&env);
    contract.init_contract(&client, &freelancer, &500, &fee_manager);

    let new_config = crate::types::ContractConfig {
        min_escrow_amount: 2000,
        max_escrow_amount: 2000000000,
        default_timeout_days: 45,
        max_milestones: 30,
        fee_percentage: 300,
        rate_limit_calls: 15,
        rate_limit_window_hours: 2,
    };

    // This should fail because unauthorized_user is not the client
    contract.set_config(&unauthorized_user, &new_config);

    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let arbitrator = Address::generate(&env);
    let token = setup_token(&env);
    let amount = 500;
    let timeout = 3600;

    // Check initial transaction count
    let initial_count = contract.get_total_transactions();
    assert_eq!(initial_count, 0);

    // Initialize contract (no transaction count increment)
    contract.init_contract_full(&client, &freelancer, &arbitrator, &token, &amount, &timeout);

    // Deposit funds (should increment count)
    contract.deposit_funds(&client);
    let count_after_deposit = contract.get_total_transactions();
    assert_eq!(count_after_deposit, 1);

    // Add milestone (should increment count)
    contract.add_milestone(&client, &String::from_str(&env, "Test milestone"), &200);
    let count_after_milestone = contract.get_total_transactions();
    assert_eq!(count_after_milestone, 2);

    // Approve milestone (should increment count)
    contract.approve_milestone(&client, &1);
    let count_after_approve = contract.get_total_transactions();
    assert_eq!(count_after_approve, 3);

    // Release milestone (should increment count)
    contract.release_milestone(&freelancer, &1);
    let count_after_release_milestone = contract.get_total_transactions();
    assert_eq!(count_after_release_milestone, 4);

    // Release funds (should increment count)
    contract.release_funds(&freelancer);
    let final_count = contract.get_total_transactions();
    assert_eq!(final_count, 5);

    contract.reset_transaction_count(&freelancer);
}


#[test]
fn test_get_contract_status() {
     let env = setup_env();
    env.mock_all_auths();

    let contract_id = env.register(EscrowContract, ());
    let contract = EscrowContractClient::new(&env, &contract_id);

    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let arbitrator = Address::generate(&env);
    let token = setup_token(&env);
    let amount = 500;
    let timeout = 3600; // 1 hour (minimum allowed)

    
    let timestamp = 3000;
    env.ledger().set(LedgerInfo {
        timestamp: timestamp,
        protocol_version: 23,
        sequence_number: env.ledger().sequence(),
        network_id: Default::default(),
        base_reserve: 0,
        min_temp_entry_ttl: 0,
        min_persistent_entry_ttl: 0,
        max_entry_ttl: 0,
    });
    contract.init_contract_full(&client, &freelancer, &arbitrator, &token, &amount, &timeout);
    contract.deposit_funds(&client);

    let data = env.as_contract(&contract_id, || crate::contract::get_escrow_data(&env));
    let summary = contract.get_contract_status(&contract_id.clone());
    assert_eq!(summary.client, client);
    assert_eq!(summary.freelancer, freelancer);
    assert_eq!(summary.amount, amount);
    assert_eq!(summary.status, String::from_str(&env, "Funded")); 
    assert_eq!(summary.created_at, 3000);
    assert_eq!(summary.milestone_count, 0);

    contract.release_funds(&freelancer);
    let data = env.as_contract(&contract_id, || crate::contract::get_escrow_data(&env));
    let summary = contract.get_contract_status(&contract_id.clone());
    // // Verify the EscrowSummary
    assert_eq!(summary.client, client);
    assert_eq!(summary.freelancer, freelancer);
    assert_eq!(summary.amount, amount);
    assert_eq!(summary.status, String::from_str(&env, "Released")); 
    assert_eq!(summary.created_at, 3000);
    assert_eq!(summary.milestone_count, 0);

}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #12)")]
fn test_init_contract_full_fails() {
    let env = setup_env();
    env.ledger().with_mut(|l| l.timestamp = 1_000_000);
    env.mock_all_auths();
    
    let contract_id = env.register(EscrowContract, ());
    let contract = EscrowContractClient::new(&env, &contract_id);
    
    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let arbitrator = Address::generate(&env);
    let token = setup_token(&env);
    let amount = 500_000_000;
    let timeout = 32_000_000; // Too far: 1_000_000 + 32_000_000 > 1_000_000 + 31_536_000
    
    // Fails with Error::InvalidTimestamp
    contract.init_contract_full(&client, &freelancer, &arbitrator, &token, &amount, &timeout);
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #13)")]
fn test_deposit_funds_fails() {
    let env = setup_env();
    env.ledger().with_mut(|l| l.timestamp = 33_000_000); // Far in future
    env.mock_all_auths();
    
    let contract_id = env.register(EscrowContract, ());
    let contract = EscrowContractClient::new(&env, &contract_id);
    
    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let arbitrator = Address::generate(&env);
    let token = setup_token(&env);
    let amount = 500;
    let timeout = 3600;
    
    contract.init_contract_full(&client, &freelancer, &arbitrator, &token, &amount, &timeout);
    let mut data = env.as_contract(&contract_id, || crate::contract::get_escrow_data(&env));
    data.created_at = 1_000_000;
    let _ = env.as_contract(&contract_id, || crate::contract::set_escrow_data(&env, &data));
    
    // Fails with Error::TimestampTooOld
    contract.deposit_funds(&client);
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #13)")]
fn test_release_funds_fails() {
    let env = setup_env();
    env.ledger().with_mut(|l| l.timestamp = 33_000_000);
    env.mock_all_auths();
    
    let contract_id = env.register(EscrowContract, ());
    let contract = EscrowContractClient::new(&env, &contract_id);
    
    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let arbitrator = Address::generate(&env);
    let token = setup_token(&env);
    let amount = 500;
    let timeout = 3600;
    
    contract.init_contract_full(&client, &freelancer, &arbitrator, &token, &amount, &timeout);
    contract.deposit_funds(&client);

    let mut data = env.as_contract(&contract_id, || crate::contract::get_escrow_data(&env));
    data.created_at = 1_000_000;
    let _ = env.as_contract(&contract_id, || crate::contract::set_escrow_data(&env, &data));
    
    // Fails with Error::TimestampTooOld
    contract.release_funds(&freelancer);
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #13)")]
fn test_auto_release_fails() {
    let env = setup_env();
    env.ledger().with_mut(|l| l.timestamp = 33_000_000);
    env.mock_all_auths();
    
    let contract_id = env.register(EscrowContract, ());
    let contract = EscrowContractClient::new(&env, &contract_id);
    
    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let arbitrator = Address::generate(&env);
    let token = setup_token(&env);
    let amount = 500;
    let timeout = 3600;
    
    contract.init_contract_full(&client, &freelancer, &arbitrator, &token, &amount, &timeout);
    contract.deposit_funds(&client);

    let mut data = env.as_contract(&contract_id, || crate::contract::get_escrow_data(&env));
    data.funded_at = Some(1_000_000);
    let _ = env.as_contract(&contract_id, || crate::contract::set_escrow_data(&env, &data));

    // Fails with Error::TimestampTooOld
    contract.auto_release();
}

#[test]
fn test_pause_unpause() {
    let env = setup_env();
    env.mock_all_auths();

    
   let contract_id = env.register(EscrowContract, ());
    let contract = EscrowContractClient::new(&env, &contract_id);

    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let arbitrator = Address::generate(&env);
    let token = setup_token(&env);
    let amount = 500;
    let timeout = 3600; // 1 hour (minimum allowed)

    contract.init_contract_full(&client, &freelancer, &arbitrator, &token, &amount, &timeout);
    
    // Test pause
    contract.pause(&client.clone());
    assert_eq!(contract.is_paused(), true);

    // Test unpause
    contract.unpause(&client.clone());
    assert_eq!(contract.is_paused(), false);
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #3)")]
fn test_pause_unpause_unauthorized() {
    let env = setup_env();
    env.mock_all_auths();

     let contract_id = env.register(EscrowContract, ());
    let contract = EscrowContractClient::new(&env, &contract_id);

    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let arbitrator = Address::generate(&env);
    let token = setup_token(&env);
    let amount = 500;
    let timeout = 3600; // 1 hour (minimum allowed)

    contract.init_contract_full(&client, &freelancer, &arbitrator, &token, &amount, &timeout);;
    
    let unauthorized = Address::generate(&env);
    
    // Test pause
    contract.pause(&unauthorized.clone());
    assert_eq!(contract.is_paused(), true);
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #16)")]
fn test_deposit_and_release_token_panic() {
    let env = setup_env();
    env.mock_all_auths();

    let contract_id = env.register(EscrowContract, ());
    let contract = EscrowContractClient::new(&env, &contract_id);

    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let arbitrator = Address::generate(&env);
    let token = setup_token(&env);
    let amount = 500;
    let timeout = 3600; // 1 hour (minimum allowed)

    contract.init_contract_full(&client, &freelancer, &arbitrator, &token, &amount, &timeout);

    contract.pause(&client);
    contract.deposit_funds(&client);
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #15)")]
fn test_emergency_withdraw_panic() {
    let env = setup_env();
    env.mock_all_auths();

    let contract_id = env.register(EscrowContract, ());
    let contract = EscrowContractClient::new(&env, &contract_id);

    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let arbitrator = Address::generate(&env);
    let token = setup_token(&env);
    let amount = 500;
    let timeout = 3600; // 1 hour (minimum allowed)

    contract.init_contract_full(&client, &freelancer, &arbitrator, &token, &amount, &timeout);
    contract.emergency_withdraw(&client);
}

#[test]
fn test_emergency_withdraw() {
    let env = setup_env();
    env.mock_all_auths();

    let contract_id = env.register(EscrowContract, ());
    let contract = EscrowContractClient::new(&env, &contract_id);

    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let arbitrator = Address::generate(&env);
    let token = setup_token(&env);
    let amount = 500;
    let timeout = 3600; 
    
    contract.init_contract_full(&client, &freelancer, &arbitrator, &token, &amount, &timeout);
    contract.pause(&client);
    contract.emergency_withdraw(&client);
    let data = contract.get_escrow_data();
    log!(&env, "ESCROW: {}", data);
    assert_eq!(data.state, EscrowState::Released);
    assert_eq!(data.dispute_result, 3);
}