# OfferHub Integration Test Suite

This directory contains comprehensive end-to-end integration tests for the OfferHub smart contract system. These tests verify complete user workflows across multiple contracts and ensure the entire system works together seamlessly.

## 📋 Overview

The integration test suite covers:

- **Complete user workflows** from registration to reputation earning
- **Cross-contract interactions** and data consistency
- **Dispute resolution workflows** with reputation impact
- **Admin and arbitrator workflows** across contracts
- **Performance tests** for complex multi-contract operations
- **Failure scenario tests** for network issues and partial failures
- **Security tests** for access control and malicious behavior
- **Stress tests** for high-load scenarios and edge cases

## 🏗️ Test Structure

```
test/integration/
├── mod.rs                          # Main module file
├── README.md                       # This documentation
├── end_to_end_workflows.rs         # Complete user workflow tests
├── test_utils.rs                   # Test utilities and helpers
├── stress_tests.rs                 # Performance and edge case tests
├── security_tests.rs               # Security and access control tests
└── run_integration_tests.rs        # Test runner and reporting
```

## 🚀 Running Tests

### Run All Integration Tests

```bash
cd contracts-offerhub
cargo test --test integration -- --nocapture
```

### Run Specific Test Categories

```bash
# Run only end-to-end workflow tests
cargo test run_end_to_end_workflow_tests --test integration -- --nocapture

# Run only stress tests
cargo test run_stress_tests --test integration -- --nocapture

# Run only security tests
cargo test run_security_tests --test integration -- --nocapture
```

### Run Individual Tests

```bash
# Run a specific test
cargo test test_complete_user_workflow --test integration -- --nocapture

# Run smoke test for quick verification
cargo test smoke_test --test integration -- --nocapture
```

## 📊 Test Categories

### 1. End-to-End Workflows (`end_to_end_workflows.rs`)

Tests complete user journeys through the entire system:

- **Complete User Workflow**: register → publish → escrow → completion → reputation
- **Cross-Contract Interactions**: Verify data consistency across contracts
- **Dispute Resolution Workflow**: Complete dispute lifecycle
- **Admin and Arbitrator Workflows**: Administrative operations
- **Performance Complex Operations**: Multi-contract operations
- **Failure Scenarios**: Error handling and edge cases
- **Event Emission Consistency**: Verify events across interactions
- **Malicious User Behavior**: Security against bad actors
- **Dispute Resolution with Reputation Impact**: Reputation system integration
- **Emergency Contract Interactions**: Emergency procedures

### 2. Stress Tests (`stress_tests.rs`)

Tests system behavior under high load and edge conditions:

- **Concurrent Escrow Operations**: Multiple simultaneous escrows
- **High Volume User Registration**: Bulk user operations
- **Multiple Dispute Resolutions**: Concurrent dispute handling
- **NFT Minting and Transfer Stress**: High-volume NFT operations
- **Maximum Values and Limits**: System limits testing
- **Zero Values and Edge Conditions**: Boundary condition testing
- **Expired Verifications**: Time-based verification testing
- **Rapid State Changes**: Fast state transitions
- **Fee Calculation Edge Cases**: Fee system edge cases
- **Dispute Resolution Edge Cases**: Dispute system edge cases
- **NFT Edge Cases**: NFT system edge cases

### 3. Security Tests (`security_tests.rs`)

Tests access control and security measures:

- **Unauthorized Access Attempts**: Verify access restrictions
- **Role-Based Access Control**: Admin, moderator, user permissions
- **Admin Role Transfer Security**: Admin role management
- **Moderator Management Security**: Moderator role management
- **Blacklist Security**: User blacklisting functionality
- **Fee Manager Security**: Fee system access control
- **Reputation NFT Security**: NFT minting permissions
- **Escrow Security**: Escrow access control
- **Dispute Resolution Security**: Dispute resolution permissions
- **Publication Security**: Publication access control
- **Comprehensive Security Scenarios**: Multi-vector security testing

## 🛠️ Test Utilities (`test_utils.rs`)

The test utilities module provides:

### Setup Functions
- `setup_test_environment()`: Deploy and initialize all contracts
- `create_verified_user()`: Register a verified user
- `create_publication()`: Create a publication
- `create_escrow()`: Create an escrow contract
- `create_dispute()`: Create a dispute
- `mint_reputation_nft()`: Mint reputation NFTs

### Verification Functions
- `verify_user_status()`: Check user verification status
- `verify_escrow_state()`: Verify escrow contract state
- `verify_dispute_state()`: Verify dispute state
- `verify_nft_ownership()`: Verify NFT ownership
- `verify_fee_consistency()`: Verify fee calculations

### Helper Functions
- `advance_time()`: Simulate time progression
- `generate_test_addresses()`: Generate test addresses
- `create_bulk_test_data()`: Create bulk test data
- `test_premium_user_functionality()`: Test premium features
- `test_blacklist_functionality()`: Test blacklist features

## 📈 Test Reporting

The test runner provides comprehensive reporting:

### Summary Report
- Total tests executed
- Pass/fail counts
- Success rate percentage
- Total execution time

### Category Breakdown
- Results by test category
- Success rates per category
- Performance metrics

### Performance Metrics
- Average test duration
- Slowest test identification
- Performance trends

### Failed Test Details
- List of failed tests
- Error messages
- Execution times

## 🔧 Test Configuration

### Environment Setup
Each test creates a fresh test environment with:
- All contracts deployed
- Admin roles configured
- Default fee rates set
- Test users generated

### Test Isolation
- Each test runs in isolation
- No shared state between tests
- Fresh contract instances per test
- Clean environment for each test

### Error Handling
- Comprehensive error catching
- Detailed error reporting
- Graceful failure handling
- Test continuation on failures

## 🎯 Test Coverage

The integration test suite covers:

### Contract Interactions
- User Registry ↔ Publication Contract
- Publication Contract ↔ Escrow Contract
- Escrow Contract ↔ Fee Manager
- Dispute Contract ↔ Escrow Contract
- Reputation NFT ↔ User Registry
- All contracts ↔ Fee Manager

### User Scenarios
- Client workflows (publish → escrow → completion)
- Freelancer workflows (accept → work → payment)
- Admin workflows (verification → moderation → management)
- Arbitrator workflows (dispute resolution)
- Malicious user scenarios (security testing)

### System Features
- User verification and management
- Publication creation and management
- Escrow creation, funding, and release
- Dispute creation and resolution
- Reputation NFT minting and transfer
- Fee calculation and collection
- Access control and security

## 🚨 Important Notes

### Prerequisites
- All individual contracts must be implemented and tested
- Contract interfaces must be stable
- Dependencies must be properly configured

### Test Execution
- Tests may take several minutes to complete
- Some stress tests use significant resources
- Performance tests measure actual execution times
- Security tests verify access control mechanisms

### Maintenance
- Update tests when contract interfaces change
- Add new tests for new features
- Review and update security tests regularly
- Monitor performance test results for regressions

## 📝 Adding New Tests

### Test Structure
```rust
#[test]
fn test_new_feature() {
    let env = Env::default();
    let test_setup = setup_test_environment(&env);
    
    // Test implementation
    // Use helper functions from test_utils
    
    println!("✅ New feature test passed!");
}
```

### Test Categories
- Add to appropriate category file
- Update test runner if needed
- Document new test in README
- Ensure proper error handling

### Test Utilities
- Add new helper functions to `test_utils.rs`
- Follow existing naming conventions
- Add documentation comments
- Include error handling

## 🔍 Troubleshooting

### Common Issues
1. **Contract not found**: Ensure all contracts are properly implemented
2. **Import errors**: Check contract module paths
3. **Test failures**: Review contract implementations
4. **Performance issues**: Check test environment setup

### Debug Mode
Run tests with debug output:
```bash
RUST_LOG=debug cargo test --test integration -- --nocapture
```

### Individual Test Debugging
```bash
# Run single test with output
cargo test test_name --test integration -- --nocapture --exact
```

## 📚 Related Documentation

- [Contract Documentation](../contracts/)
- [Unit Tests](../)
- [Deployment Guide](../../docs/)
- [API Documentation](../../docs/)

---

**Note**: This integration test suite is designed to provide confidence in the complete OfferHub system before production deployment. Regular execution of these tests ensures system reliability and helps catch integration issues early. 