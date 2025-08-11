#![cfg(test)]

use crate::{
    types::{DisputeData, DisputeOutcome},
    DisputeResolutionContract, DisputeResolutionContractClient,
};
use soroban_sdk::{
    testutils::{Address as _, Ledger, MockAuth, MockAuthInvoke},
    vec, Address, Env, IntoVal, String,
};

fn create_contract(env: &Env) -> (DisputeResolutionContractClient, Address) {
    let contract_id = env.register(DisputeResolutionContract, ());
    let client = DisputeResolutionContractClient::new(env, &contract_id);
    let arbitrator = Address::generate(env);
    client.initialize(&arbitrator);
    (client, arbitrator)
}

#[test]
fn test_initialize() {
    let env = Env::default();
    let contract_id = env.register(DisputeResolutionContract, ());
    let client = DisputeResolutionContractClient::new(&env, &contract_id);
    let arbitrator = Address::generate(&env);
    client.initialize(&arbitrator);
}

#[test]
#[should_panic]
fn test_initialize_already_initialized() {
    let env = Env::default();
    let (client, _) = create_contract(&env);
    let arbitrator = Address::generate(&env);
    client.initialize(&arbitrator);
}

#[test]
fn test_open_dispute() {
    let env = Env::default();
    env.ledger().with_mut(|li| {
        li.timestamp = 12345;
    });
    let (client, _) = create_contract(&env);
    let initiator = Address::generate(&env);
    let fee_manager = Address::generate(&env);
    let job_id = 1;
    let reason = String::from_str(&env, "Job not completed");
    let dispute_amount = 1000000;
    
    client
        .mock_auths(&[MockAuth {
            address: &initiator,
            invoke: &MockAuthInvoke {
                contract: &client.address,
                fn_name: "open_dispute",
                args: vec![
                    &env,
                    job_id.into_val(&env),
                    initiator.clone().into_val(&env),
                    reason.clone().into_val(&env),
                    fee_manager.clone().into_val(&env),
                    dispute_amount.into_val(&env),
                ],
                sub_invokes: &[],
            },
        }])
        .open_dispute(&job_id, &initiator, &reason, &fee_manager, &dispute_amount);
    
    let dispute = client.get_dispute(&job_id);
    assert_eq!(
        dispute,
        DisputeData {
            initiator,
            reason,
            timestamp: 12345,
            resolved: false,
            outcome: DisputeOutcome::None,
            fee_manager,
            dispute_amount,
            fee_collected: 0,
        }
    );
}

#[test]
#[should_panic]
fn test_open_dispute_already_exists() {
    let env = Env::default();
    let (client, _) = create_contract(&env);
    let initiator = Address::generate(&env);
    let fee_manager = Address::generate(&env);
    let job_id = 1;
    let reason = String::from_str(&env, "reason 1");
    let dispute_amount = 1000000;
    
    client
        .mock_auths(&[MockAuth {
            address: &initiator,
            invoke: &MockAuthInvoke {
                contract: &client.address,
                fn_name: "open_dispute",
                args: vec![
                    &env,
                    job_id.into_val(&env),
                    initiator.clone().into_val(&env),
                    reason.clone().into_val(&env),
                    fee_manager.clone().into_val(&env),
                    dispute_amount.into_val(&env),
                ],
                sub_invokes: &[],
            },
        }])
        .open_dispute(&job_id, &initiator, &reason, &fee_manager, &dispute_amount);
    
    client
        .mock_auths(&[MockAuth {
            address: &initiator,
            invoke: &MockAuthInvoke {
                contract: &client.address,
                fn_name: "open_dispute",
                args: vec![
                    &env,
                    job_id.into_val(&env),
                    initiator.clone().into_val(&env),
                    String::from_str(&env, "reason 2").into_val(&env),
                    fee_manager.clone().into_val(&env),
                    dispute_amount.into_val(&env),
                ],
                sub_invokes: &[],
            },
        }])
        .open_dispute(&job_id, &initiator, &String::from_str(&env, "reason 2"), &fee_manager, &dispute_amount);
}

#[test]
fn test_resolve_dispute() {
    let env = Env::default();
    let (client, arbitrator) = create_contract(&env);
    let initiator = Address::generate(&env);
    let fee_manager = Address::generate(&env);
    let job_id = 1;
    let reason = String::from_str(&env, "reason 1");
    let dispute_amount = 1000000;
    
    client
        .mock_auths(&[MockAuth {
            address: &initiator,
            invoke: &MockAuthInvoke {
                contract: &client.address,
                fn_name: "open_dispute",
                args: vec![
                    &env,
                    job_id.into_val(&env),
                    initiator.clone().into_val(&env),
                    reason.clone().into_val(&env),
                    fee_manager.clone().into_val(&env),
                    dispute_amount.into_val(&env),
                ],
                sub_invokes: &[],
            },
        }])
        .open_dispute(&job_id, &initiator, &reason, &fee_manager, &dispute_amount);
    
    client
        .mock_auths(&[MockAuth {
            address: &arbitrator,
            invoke: &MockAuthInvoke {
                contract: &client.address,
                fn_name: "resolve_dispute",
                args: vec![
                    &env,
                    job_id.into_val(&env),
                    DisputeOutcome::FavorClient.into_val(&env),
                ],
                sub_invokes: &[],
            },
        }])
        .resolve_dispute(&job_id, &DisputeOutcome::FavorClient);
    
    let dispute = client.get_dispute(&job_id);
    assert_eq!(dispute.resolved, true);
    assert_eq!(dispute.outcome, DisputeOutcome::FavorClient);
}

#[test]
#[should_panic]
fn test_resolve_dispute_unauthorized() {
    let env = Env::default();
    let (client, _) = create_contract(&env);
    let initiator = Address::generate(&env);
    let fee_manager = Address::generate(&env);
    let job_id = 1;
    let reason = String::from_str(&env, "reason 1");
    let dispute_amount = 1000000;
    let random_user = Address::generate(&env);
    
    client
        .mock_auths(&[MockAuth {
            address: &initiator,
            invoke: &MockAuthInvoke {
                contract: &client.address,
                fn_name: "open_dispute",
                args: vec![
                    &env,
                    job_id.into_val(&env),
                    initiator.clone().into_val(&env),
                    reason.clone().into_val(&env),
                    fee_manager.clone().into_val(&env),
                    dispute_amount.into_val(&env),
                ],
                sub_invokes: &[],
            },
        }])
        .open_dispute(&job_id, &initiator, &reason, &fee_manager, &dispute_amount);
    
    client
        .mock_auths(&[MockAuth {
            address: &random_user,
            invoke: &MockAuthInvoke {
                contract: &client.address,
                fn_name: "resolve_dispute",
                args: vec![
                    &env,
                    job_id.into_val(&env),
                    DisputeOutcome::FavorClient.into_val(&env),
                ],
                sub_invokes: &[],
            },
        }])
        .resolve_dispute(&job_id, &DisputeOutcome::FavorClient);
}

#[test]
#[should_panic]
fn test_get_dispute_not_found() {
    let env = Env::default();
    let (client, _) = create_contract(&env);
    client.get_dispute(&1);
}

#[test]
#[should_panic]
fn test_resolve_dispute_already_resolved() {
    let env = Env::default();
    let (client, arbitrator) = create_contract(&env);
    let initiator = Address::generate(&env);
    let fee_manager = Address::generate(&env);
    let job_id = 1;
    let reason = String::from_str(&env, "reason 1");
    let dispute_amount = 1000000;
    
    client
        .mock_auths(&[MockAuth {
            address: &initiator,
            invoke: &MockAuthInvoke {
                contract: &client.address,
                fn_name: "open_dispute",
                args: vec![
                    &env,
                    job_id.into_val(&env),
                    initiator.clone().into_val(&env),
                    reason.clone().into_val(&env),
                    fee_manager.clone().into_val(&env),
                    dispute_amount.into_val(&env),
                ],
                sub_invokes: &[],
            },
        }])
        .open_dispute(&job_id, &initiator, &reason, &fee_manager, &dispute_amount);
    
    client
        .mock_auths(&[MockAuth {
            address: &arbitrator,
            invoke: &MockAuthInvoke {
                contract: &client.address,
                fn_name: "resolve_dispute",
                args: vec![
                    &env,
                    job_id.into_val(&env),
                    DisputeOutcome::FavorClient.into_val(&env),
                ],
                sub_invokes: &[],
            },
        }])
        .resolve_dispute(&job_id, &DisputeOutcome::FavorClient);
    
    client
        .mock_auths(&[MockAuth {
            address: &arbitrator,
            invoke: &MockAuthInvoke {
                contract: &client.address,
                fn_name: "resolve_dispute",
                args: vec![
                    &env,
                    job_id.into_val(&env),
                    DisputeOutcome::FavorFreelancer.into_val(&env),
                ],
                sub_invokes: &[],
            },
        }])
        .resolve_dispute(&job_id, &DisputeOutcome::FavorFreelancer);
}

#[test]
#[should_panic(expected = "cannot resolve with None outcome")]
fn test_resolve_dispute_with_none() {
    let env = Env::default();
    let (client, arbitrator) = create_contract(&env);
    let initiator = Address::generate(&env);
    let fee_manager = Address::generate(&env);
    let job_id = 1;
    let reason = String::from_str(&env, "reason 1");
    let dispute_amount = 1000000;
    
    client
        .mock_auths(&[MockAuth {
            address: &initiator,
            invoke: &MockAuthInvoke {
                contract: &client.address,
                fn_name: "open_dispute",
                args: vec![
                    &env,
                    job_id.into_val(&env),
                    initiator.clone().into_val(&env),
                    reason.clone().into_val(&env),
                    fee_manager.clone().into_val(&env),
                    dispute_amount.into_val(&env),
                ],
                sub_invokes: &[],
            },
        }])
        .open_dispute(&job_id, &initiator, &reason, &fee_manager, &dispute_amount);
    
    client
        .mock_auths(&[MockAuth {
            address: &arbitrator,
            invoke: &MockAuthInvoke {
                contract: &client.address,
                fn_name: "resolve_dispute",
                args: vec![
                    &env,
                    job_id.into_val(&env),
                    DisputeOutcome::None.into_val(&env),
                ],
                sub_invokes: &[],
            },
        }])
        .resolve_dispute(&job_id, &DisputeOutcome::None);
}
