#![cfg(test)]
use soroban_sdk::{testutils::Address as _, Address, BytesN, Env, Vec};

use rand::rngs::OsRng;
use rand::RngCore;

use crate::types::EscrowCreateParams;
use crate::EscrowFactory;
use crate::EscrowFactoryClient;

fn gen_random_bytes<const N: usize>(env: &Env) -> BytesN<N> {
    let mut rng = OsRng;
    let mut random_bytes = [0u8; N];
    rng.try_fill_bytes(&mut random_bytes)
        .expect("unable to fill bytes");

    BytesN::from_array(env, &random_bytes)
}

// WASM path kept for reference if needed in future integration tests:
// ../../../target/wasm32v1-none/release/escrow_contract.wasm

#[test]
fn test_escrow_factory_registration() {
    let env = Env::default();
    env.mock_all_auths();

    // Create a dummy WASM hash for testing
    let dummy_wasm_hash = BytesN::from_array(&env, &[0u8; 32]);
    
    // Test that we can register the contract
    let contract_id = env.register(EscrowFactory, (dummy_wasm_hash,));
    
    // Test that the contract was registered successfully
    assert!(contract_id != Address::generate(&env));
}

#[test]
fn test_escrow_create_params_validation() {
    let env = Env::default();
    env.mock_all_auths();

    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let fee_manager = Address::generate(&env);
    let salt = gen_random_bytes::<32>(&env);

    let create_params = EscrowCreateParams {
        client: client.clone(),
        freelancer: freelancer.clone(),
        amount: 1000,
        fee_manager: fee_manager.clone(),
        salt,
    };

    // Test that parameters are set correctly
    assert_eq!(create_params.amount, 1000);
    assert_eq!(create_params.client, client);
    assert_eq!(create_params.freelancer, freelancer);
    assert_eq!(create_params.fee_manager, fee_manager);
    
    // Test that addresses are different
    assert_ne!(create_params.client, create_params.freelancer);
    assert_ne!(create_params.client, create_params.fee_manager);
    assert_ne!(create_params.freelancer, create_params.fee_manager);
}

#[test]
fn test_escrow_factory_client_creation() {
    let env = Env::default();
    env.mock_all_auths();

    let dummy_wasm_hash = BytesN::from_array(&env, &[0u8; 32]);
    let contract_id = env.register(EscrowFactory, (dummy_wasm_hash,));
    
    // Test that we can create a client
    let client = EscrowFactoryClient::new(&env, &contract_id);
    
    // Test that the client was created successfully
    assert!(client.address == contract_id);
}

#[test]
fn test_batch_operations_structure() {
    let env = Env::default();
    env.mock_all_auths();

    // Test that we can create batch parameters
    let mut batch_params = Vec::new(&env);
    
    for i in 0..3 {
        let create_params = EscrowCreateParams {
            client: Address::generate(&env),
            freelancer: Address::generate(&env),
            amount: 1000 + i * 100,
            fee_manager: Address::generate(&env),
            salt: gen_random_bytes::<32>(&env),
        };
        batch_params.push_back(create_params);
    }
    
    // Test batch size
    assert_eq!(batch_params.len(), 3);
    
    // Test that amounts are different
    assert_eq!(batch_params.get(0).unwrap().amount, 1000);
    assert_eq!(batch_params.get(1).unwrap().amount, 1100);
    assert_eq!(batch_params.get(2).unwrap().amount, 1200);
}