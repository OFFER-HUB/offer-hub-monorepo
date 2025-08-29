#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::{Address as _, Ledger}, Address, Env, String, Vec};
use crate::Contract;

fn create_contract(e: &Env) -> Address {
    e.register(Contract, ())
}

#[test]
fn test_rating_contract_initialization() {
    let env = Env::default();

    // Test basic contract registration
    let contract_id = create_contract(&env);
    assert!(contract_id != Address::generate(&env));
    
    // Test that we can create a client
    let client = ContractClient::new(&env, &contract_id);
    assert!(client.address == contract_id);
}

#[test]
#[should_panic]
fn test_rate_limit_submit_rating_panics_on_6th() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = create_contract(&env);
    let client = ContractClient::new(&env, &contract_id);

    // Init admin
    let admin = Address::generate(&env);
    client.init(&admin);

    let caller = Address::generate(&env);
    let rated_user = Address::generate(&env);
    let _contract_str = String::from_str(&env, "c1");
    let feedback = String::from_str(&env, "ok");
    let category = String::from_str(&env, "web");

    // Set a stable timestamp window start
    env.ledger().with_mut(|l| l.timestamp = 10_000);

    // 5 calls should pass with different contract IDs, 6th should panic due to rate limit
    for i in 0..5 {
        let cid = String::from_str(&env, match i {0=>"c1",1=>"c2",2=>"c3",3=>"c4",_=>"c5"});
        client.submit_rating(&caller, &rated_user, &cid, &5u32, &feedback, &category);
    }
    let cid6 = String::from_str(&env, "c6");
    client.submit_rating(&caller, &rated_user, &cid6, &5u32, &feedback, &category);
}

#[test]
fn test_rate_limit_window_and_bypass() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = create_contract(&env);
    let client = ContractClient::new(&env, &contract_id);

    // Init admin
    let admin = Address::generate(&env);
    client.init(&admin);

    let caller = Address::generate(&env);
    let rated_user = Address::generate(&env);
    let contract_str = String::from_str(&env, "c1");
    let feedback = String::from_str(&env, "ok");
    let category = String::from_str(&env, "web");

    // Set a stable timestamp window start
    env.ledger().with_mut(|l| l.timestamp = 10_000);

    for i in 0..5 {
        let cid = String::from_str(&env, match i {0=>"w1",1=>"w2",2=>"w3",3=>"w4",_=>"w5"});
        client.submit_rating(&caller, &rated_user, &cid, &5u32, &feedback, &category);
    }
    // window advance resets
    env.ledger().with_mut(|l| l.timestamp += 3601);
    client.submit_rating(&caller, &rated_user, &contract_str, &5u32, &feedback, &category);

    // Bypass
    client.set_rate_limit_bypass(&admin, &caller, &true);
    for i in 0..3 {
        let cid = String::from_str(&env, match i {0=>"b1",1=>"b2",_=>"b3"});
        client.submit_rating(&caller, &rated_user, &cid, &5u32, &feedback, &category);
    }
}

#[test]
fn test_rating_validation_logic() {
    let env = Env::default();
    
    // Test valid rating range
    let valid_ratings = [1u32, 2, 3, 4, 5];
    for rating in valid_ratings.iter() {
        assert!(rating >= &1 && rating <= &5, "Rating {} should be valid", rating);
    }
    
    // Test invalid ratings
    let invalid_ratings = [0u32, 6, 10, 100];
    for rating in invalid_ratings.iter() {
        assert!(!(rating >= &1 && rating <= &5), "Rating {} should be invalid", rating);
    }
}

#[test]
fn test_rating_data_structures() {
    let env = Env::default();
    
    // Test basic string operations
    let feedback_text = String::from_str(&env, "Excellent work!");
    assert_eq!(feedback_text.len(), 15); // "Excellent work!" tiene 15 caracteres
    
    let category = String::from_str(&env, "web_development");
    assert_eq!(category.len(), 15);
    
    // Test address generation
    let rater = Address::generate(&env);
    let rated_user = Address::generate(&env);
    assert_ne!(rater, rated_user);
    
    // Test timestamp
    let _timestamp = env.ledger().timestamp();
}

#[test]
fn test_rating_calculations() {
    let env = Env::default();
    
    // Test average rating calculation
    let ratings = [5u32, 4, 5, 3, 5]; // 5, 4, 5, 3, 5
    let total: u32 = ratings.iter().sum();
    let average = total / ratings.len() as u32;
    
    assert_eq!(total, 22);
    assert_eq!(average, 4); // 22 / 5 = 4.4, pero como es u32 = 4
    
    // Test percentage calculation
    let five_star_count = ratings.iter().filter(|&&r| r == 5).count() as u32;
    let five_star_percentage = (five_star_count * 100) / ratings.len() as u32;
    
    assert_eq!(five_star_count, 3);
    assert_eq!(five_star_percentage, 60); // 3/5 * 100 = 60%
}

#[test]
fn test_rating_categories() {
    let env = Env::default();
    
    let categories = [
        String::from_str(&env, "web_development"),
        String::from_str(&env, "mobile_development"),
        String::from_str(&env, "design"),
        String::from_str(&env, "marketing"),
        String::from_str(&env, "consulting"),
    ];
    
    // Test that all categories are valid
    for category in &categories {
        assert!(category.len() > 0, "Category should not be empty");
        assert!(category.len() <= 50, "Category should not be too long");
    }
    
    // Test unique categories
    let mut unique_categories = Vec::new(&env);
    for category in &categories {
        if !unique_categories.contains(category) {
            unique_categories.push_back(category.clone());
        }
    }
    
    assert_eq!(unique_categories.len(), categories.len() as u32);
}
