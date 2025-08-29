#![cfg(test)]

use crate::types::EscrowStatus;
use crate::{EscrowContract, EscrowContractClient};
use soroban_sdk::testutils::{Address as _, Ledger};
use soroban_sdk::{contract, contractimpl, Address, Env, Symbol, String};

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
    assert_eq!(data.status, EscrowStatus::Funded);

    contract.release_funds(&freelancer);
    let data = env.as_contract(&contract_id, || crate::contract::get_escrow_data(&env));
    assert_eq!(data.status, EscrowStatus::Released);
}

#[test]
#[should_panic]
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
#[should_panic]
fn test_resolve_dispute_arbitrator_only_panics_for_non_arbitrator() {
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
    let data = crate::contract::get_escrow_data(&env);
    assert_eq!(data.status, EscrowStatus::Disputed);

    contract.resolve_dispute(&client, &Symbol::new(&env, "client_wins"));
}

#[test]
#[should_panic]
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
#[should_panic]
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
    let data = crate::contract::get_escrow_data(&env);
    assert_eq!(data.status, EscrowStatus::Disputed);

    contract.resolve_dispute(&client, &Symbol::new(&env, "client_wins"));
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
    assert_eq!(data.status, EscrowStatus::Released);
}

#[test]
#[should_panic]
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
    assert_eq!(data.status, EscrowStatus::Disputed);

    // Usar símbolo más simple
    let resolution = Symbol::new(&env, "freelancer");
    contract.resolve_dispute(&arbitrator, &resolution);
    
    let resolved_data = env.as_contract(&contract_id, || crate::contract::get_escrow_data(&env));
    assert_eq!(resolved_data.status, EscrowStatus::Released);
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
    assert_eq!(data.status, EscrowStatus::Released);
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
    assert_eq!(initial_data.status, EscrowStatus::Initialized);

    contract.deposit_funds(&client);
    let funded_data = env.as_contract(&contract_id, || crate::contract::get_escrow_data(&env));
    assert_eq!(funded_data.status, EscrowStatus::Funded);

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
    assert_eq!(initial_data.status, EscrowStatus::Initialized);
    assert_eq!(initial_data.released_amount, 0);

    contract.deposit_funds(&client);
    let funded_data = env.as_contract(&contract_id, || crate::contract::get_escrow_data(&env));
    assert_eq!(funded_data.status, EscrowStatus::Funded);

    contract.release_funds(&freelancer);
    let released_data = env.as_contract(&contract_id, || crate::contract::get_escrow_data(&env));
    assert_eq!(released_data.status, EscrowStatus::Released);
}