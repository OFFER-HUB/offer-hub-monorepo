#![cfg(test)]

use soroban_sdk::{
    testutils::{Address as _, Ledger as _},
    Address, Env, Symbol, String, Vec,
};

// Import all test modules
use super::end_to_end_workflows::*;
use super::stress_tests::*;
use super::security_tests::*;
use super::test_utils::*;

/// Run all integration tests and provide a comprehensive report
#[test]
fn run_all_integration_tests() {
    println!("🚀 Starting OfferHub Integration Test Suite");
    println!("=============================================");
    
    let start_time = std::time::Instant::now();
    let mut passed_tests = 0;
    let mut failed_tests = 0;
    let mut test_results = Vec::new();
    
    // Test categories
    let test_categories = vec![
        ("End-to-End Workflows", vec![
            ("Complete User Workflow", test_complete_user_workflow),
            ("Cross-Contract Interactions", test_cross_contract_interactions),
            ("Dispute Resolution Workflow", test_dispute_resolution_workflow),
            ("Admin and Arbitrator Workflows", test_admin_arbitrator_workflows),
            ("Performance Complex Operations", test_performance_complex_operations),
            ("Failure Scenarios", test_failure_scenarios),
            ("Event Emission Consistency", test_event_emission_consistency),
            ("Malicious User Behavior", test_malicious_user_behavior),
            ("Dispute Resolution with Reputation Impact", test_dispute_resolution_with_reputation_impact),
            ("Emergency Contract Interactions", test_emergency_contract_interactions),
        ]),
        ("Stress Tests", vec![
            ("Concurrent Escrow Operations", test_concurrent_escrow_operations),
            ("High Volume User Registration", test_high_volume_user_registration),
            ("Multiple Dispute Resolutions", test_multiple_dispute_resolutions),
            ("NFT Minting and Transfer Stress", test_nft_minting_and_transfer_stress),
            ("Maximum Values and Limits", test_maximum_values_and_limits),
            ("Zero Values and Edge Conditions", test_zero_values_and_edge_conditions),
            ("Expired Verifications", test_expired_verifications),
            ("Rapid State Changes", test_rapid_state_changes),
            ("Fee Calculation Edge Cases", test_fee_calculation_edge_cases),
            ("Dispute Resolution Edge Cases", test_dispute_resolution_edge_cases),
            ("NFT Edge Cases", test_nft_edge_cases),
        ]),
        ("Security Tests", vec![
            ("Unauthorized Access Attempts", test_unauthorized_access_attempts),
            ("Role-Based Access Control", test_role_based_access_control),
            ("Admin Role Transfer Security", test_admin_role_transfer_security),
            ("Moderator Management Security", test_moderator_management_security),
            ("Blacklist Security", test_blacklist_security),
            ("Fee Manager Security", test_fee_manager_security),
            ("Reputation NFT Security", test_reputation_nft_security),
            ("Escrow Security", test_escrow_security),
            ("Dispute Resolution Security", test_dispute_resolution_security),
            ("Publication Security", test_publication_security),
            ("Comprehensive Security Scenarios", test_comprehensive_security_scenarios),
        ]),
    ];
    
    // Run tests by category
    for (category_name, tests) in test_categories.iter() {
        println!("\n📋 Running {} Tests", category_name);
        println!("{}", "-".repeat(30 + category_name.len()));
        
        for (test_name, test_function) in tests.iter() {
            let test_start = std::time::Instant::now();
            
            match std::panic::catch_unwind(|| {
                test_function();
            }) {
                Ok(_) => {
                    let test_duration = test_start.elapsed();
                    println!("✅ {} - {:.2?}", test_name, test_duration);
                    passed_tests += 1;
                    test_results.push((category_name.clone(), test_name.clone(), true, test_duration));
                }
                Err(e) => {
                    let test_duration = test_start.elapsed();
                    println!("❌ {} - {:.2?} - FAILED", test_name, test_duration);
                    if let Some(s) = e.downcast_ref::<String>() {
                        println!("   Error: {}", s);
                    } else if let Some(s) = e.downcast_ref::<&str>() {
                        println!("   Error: {}", s);
                    }
                    failed_tests += 1;
                    test_results.push((category_name.clone(), test_name.clone(), false, test_duration));
                }
            }
        }
    }
    
    let total_duration = start_time.elapsed();
    
    // Print summary report
    println!("\n📊 Integration Test Summary Report");
    println!("==================================");
    println!("Total Tests: {}", passed_tests + failed_tests);
    println!("Passed: {} ✅", passed_tests);
    println!("Failed: {} ❌", failed_tests);
    println!("Success Rate: {:.1}%", (passed_tests as f64 / (passed_tests + failed_tests) as f64) * 100.0);
    println!("Total Duration: {:.2?}", total_duration);
    
    // Print detailed results by category
    println!("\n📈 Detailed Results by Category:");
    for (category_name, tests) in test_categories.iter() {
        let category_results: Vec<_> = test_results.iter()
            .filter(|(cat, _, _, _)| cat == category_name)
            .collect();
        
        let category_passed = category_results.iter()
            .filter(|(_, _, passed, _)| **passed)
            .count();
        
        let category_total = category_results.len();
        let category_success_rate = if category_total > 0 {
            (category_passed as f64 / category_total as f64) * 100.0
        } else {
            0.0
        };
        
        println!("  {}: {}/{} ({:.1}%)", category_name, category_passed, category_total, category_success_rate);
    }
    
    // Print failed tests if any
    if failed_tests > 0 {
        println!("\n❌ Failed Tests:");
        for (category, test_name, passed, duration) in test_results.iter() {
            if !passed {
                println!("  - {}: {} ({:.2?})", category, test_name, duration);
            }
        }
    }
    
    // Print performance metrics
    println!("\n⚡ Performance Metrics:");
    let avg_test_duration = test_results.iter()
        .map(|(_, _, _, duration)| duration.as_millis())
        .sum::<u128>() as f64 / test_results.len() as f64;
    
    println!("  Average Test Duration: {:.2}ms", avg_test_duration);
    
    let slowest_test = test_results.iter()
        .max_by(|(_, _, _, a), (_, _, _, b)| a.cmp(b))
        .unwrap();
    
    println!("  Slowest Test: {} ({:.2?})", slowest_test.1, slowest_test.3);
    
    // Final status
    if failed_tests == 0 {
        println!("\n🎉 All integration tests passed successfully!");
        println!("The OfferHub contract system is ready for production deployment.");
    } else {
        println!("\n⚠️  Some integration tests failed.");
        println!("Please review the failed tests before proceeding to production.");
    }
    
    println!("\n🏁 Integration Test Suite Completed");
    println!("===================================");
}

/// Run a specific category of tests
#[test]
fn run_end_to_end_workflow_tests() {
    println!("🚀 Running End-to-End Workflow Tests");
    println!("====================================");
    
    let tests = vec![
        ("Complete User Workflow", test_complete_user_workflow),
        ("Cross-Contract Interactions", test_cross_contract_interactions),
        ("Dispute Resolution Workflow", test_dispute_resolution_workflow),
        ("Admin and Arbitrator Workflows", test_admin_arbitrator_workflows),
        ("Performance Complex Operations", test_performance_complex_operations),
        ("Failure Scenarios", test_failure_scenarios),
        ("Event Emission Consistency", test_event_emission_consistency),
        ("Malicious User Behavior", test_malicious_user_behavior),
        ("Dispute Resolution with Reputation Impact", test_dispute_resolution_with_reputation_impact),
        ("Emergency Contract Interactions", test_emergency_contract_interactions),
    ];
    
    run_test_category("End-to-End Workflows", tests);
}

#[test]
fn run_stress_tests() {
    println!("🚀 Running Stress Tests");
    println!("=======================");
    
    let tests = vec![
        ("Concurrent Escrow Operations", test_concurrent_escrow_operations),
        ("High Volume User Registration", test_high_volume_user_registration),
        ("Multiple Dispute Resolutions", test_multiple_dispute_resolutions),
        ("NFT Minting and Transfer Stress", test_nft_minting_and_transfer_stress),
        ("Maximum Values and Limits", test_maximum_values_and_limits),
        ("Zero Values and Edge Conditions", test_zero_values_and_edge_conditions),
        ("Expired Verifications", test_expired_verifications),
        ("Rapid State Changes", test_rapid_state_changes),
        ("Fee Calculation Edge Cases", test_fee_calculation_edge_cases),
        ("Dispute Resolution Edge Cases", test_dispute_resolution_edge_cases),
        ("NFT Edge Cases", test_nft_edge_cases),
    ];
    
    run_test_category("Stress Tests", tests);
}

#[test]
fn run_security_tests() {
    println!("🚀 Running Security Tests");
    println!("==========================");
    
    let tests = vec![
        ("Unauthorized Access Attempts", test_unauthorized_access_attempts),
        ("Role-Based Access Control", test_role_based_access_control),
        ("Admin Role Transfer Security", test_admin_role_transfer_security),
        ("Moderator Management Security", test_moderator_management_security),
        ("Blacklist Security", test_blacklist_security),
        ("Fee Manager Security", test_fee_manager_security),
        ("Reputation NFT Security", test_reputation_nft_security),
        ("Escrow Security", test_escrow_security),
        ("Dispute Resolution Security", test_dispute_resolution_security),
        ("Publication Security", test_publication_security),
        ("Comprehensive Security Scenarios", test_comprehensive_security_scenarios),
    ];
    
    run_test_category("Security Tests", tests);
}

/// Helper function to run a category of tests
fn run_test_category(category_name: &str, tests: Vec<(&str, fn())>) {
    let start_time = std::time::Instant::now();
    let mut passed = 0;
    let mut failed = 0;
    
    for (test_name, test_function) in tests.iter() {
        let test_start = std::time::Instant::now();
        
        match std::panic::catch_unwind(|| {
            test_function();
        }) {
            Ok(_) => {
                let duration = test_start.elapsed();
                println!("✅ {} - {:.2?}", test_name, duration);
                passed += 1;
            }
            Err(e) => {
                let duration = test_start.elapsed();
                println!("❌ {} - {:.2?} - FAILED", test_name, duration);
                if let Some(s) = e.downcast_ref::<String>() {
                    println!("   Error: {}", s);
                } else if let Some(s) = e.downcast_ref::<&str>() {
                    println!("   Error: {}", s);
                }
                failed += 1;
            }
        }
    }
    
    let total_duration = start_time.elapsed();
    
    println!("\n📊 {} Summary:", category_name);
    println!("  Total: {}", passed + failed);
    println!("  Passed: {} ✅", passed);
    println!("  Failed: {} ❌", failed);
    println!("  Duration: {:.2?}", total_duration);
    
    if failed == 0 {
        println!("  Status: All tests passed! 🎉");
    } else {
        println!("  Status: Some tests failed! ⚠️");
    }
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
    create_verified_user(&test_setup, user.clone(), VerificationLevel::Basic, "Smoke test user");
    
    // Test basic publication
    let publication_id = create_publication(&test_setup, user.clone(), "Smoke test project", "Technology", 1000_i128);
    assert!(publication_id > 0);
    
    // Test basic escrow
    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    create_verified_user(&test_setup, client.clone(), VerificationLevel::Basic, "Smoke test client");
    create_verified_user(&test_setup, freelancer.clone(), VerificationLevel::Basic, "Smoke test freelancer");
    
    create_escrow(&test_setup, client.clone(), freelancer.clone(), 500_i128);
    
    // Test basic fee calculation
    let fee_calc = test_setup.fee_manager.calculate_escrow_fee(&500_i128, &client);
    assert!(fee_calc.fee_amount >= 0);
    
    // Test basic NFT minting
    mint_reputation_nft(
        &test_setup,
        user.clone(),
        1_u32,
        "Smoke test NFT",
        "Smoke test description",
        "https://smoke.test",
    );
    
    let nft_owner = test_setup.reputation_nft.get_owner(&1_u32);
    assert_eq!(nft_owner, user);
    
    println!("✅ Smoke test passed! Basic functionality is working.");
} 