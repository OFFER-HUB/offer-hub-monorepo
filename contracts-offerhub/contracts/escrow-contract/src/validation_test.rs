#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, Env, String};
    use crate::types::Error;

    #[test]
    fn test_validate_amount() {
        // Valid amounts
        assert!(validate_amount(1).is_ok());
        assert!(validate_amount(1000).is_ok());
        assert!(validate_amount(999_999_999_999).is_ok());

        // Invalid amounts
        assert_eq!(validate_amount(0), Err(Error::InvalidAmount));
        assert_eq!(validate_amount(-100), Err(Error::InvalidAmount));
        assert_eq!(validate_amount(1_000_000_000_001), Err(Error::InvalidAmount));
    }

    #[test]
    fn test_validate_timeout() {
        // Valid timeouts
        assert!(validate_timeout(3600).is_ok()); // 1 hour
        assert!(validate_timeout(86400).is_ok()); // 1 day
        assert!(validate_timeout(31_536_000).is_ok()); // 1 year

        // Invalid timeouts
        assert_eq!(validate_timeout(1800), Err(Error::InvalidStatus)); // 30 minutes
        assert_eq!(validate_timeout(31_536_001), Err(Error::InvalidStatus)); // > 1 year
    }

    #[test]
    fn test_validate_milestone_description() {
        let env = Env::default();
        
        // Valid descriptions
        let valid_desc = String::from_str(&env, "Valid milestone description");
        assert!(validate_milestone_description(&valid_desc).is_ok());

        // Too short
        let short_desc = String::from_str(&env, "Hi");
        assert_eq!(validate_milestone_description(&short_desc), Err(Error::InvalidStatus));

        // Too long
        let long_desc = String::from_str(&env, &"a".repeat(201));
        assert_eq!(validate_milestone_description(&long_desc), Err(Error::InvalidStatus));
    }

    #[test]
    fn test_validate_milestone_id() {
        // Valid milestone ID
        assert!(validate_milestone_id(1).is_ok());
        assert!(validate_milestone_id(100).is_ok());

        // Invalid milestone ID
        assert_eq!(validate_milestone_id(0), Err(Error::MilestoneNotFound));
    }

    #[test]
    fn test_validate_different_addresses() {
        let env = Env::default();
        let addr1 = Address::generate(&env);
        let addr2 = Address::generate(&env);

        // Different addresses
        assert!(validate_different_addresses(&addr1, &addr2).is_ok());

        // Same addresses
        assert_eq!(validate_different_addresses(&addr1, &addr1), Err(Error::Unauthorized));
    }

    #[test]
    fn test_validate_init_contract() {
        let env = Env::default();
        let client = Address::generate(&env);
        let freelancer = Address::generate(&env);
        let fee_manager = Address::generate(&env);

        // Valid initialization
        assert!(validate_init_contract(&env, &client, &freelancer, 1000, &fee_manager).is_ok());

        // Same client and freelancer
        assert_eq!(
            validate_init_contract(&env, &client, &client, 1000, &fee_manager),
            Err(Error::Unauthorized)
        );

        // Invalid amount
        assert_eq!(
            validate_init_contract(&env, &client, &freelancer, 0, &fee_manager),
            Err(Error::InvalidAmount)
        );
    }

    #[test]
    fn test_validate_init_contract_full() {
        let env = Env::default();
        let client = Address::generate(&env);
        let freelancer = Address::generate(&env);
        let arbitrator = Address::generate(&env);
        let token = Address::generate(&env);

        // Valid initialization
        assert!(validate_init_contract_full(
            &env, &client, &freelancer, &arbitrator, &token, 1000, 86400
        ).is_ok());

        // Same client and freelancer
        assert_eq!(
            validate_init_contract_full(&env, &client, &client, &arbitrator, &token, 1000, 86400),
            Err(Error::Unauthorized)
        );

        // Invalid amount
        assert_eq!(
            validate_init_contract_full(&env, &client, &freelancer, &arbitrator, &token, 0, 86400),
            Err(Error::InvalidAmount)
        );

        // Invalid timeout
        assert_eq!(
            validate_init_contract_full(&env, &client, &freelancer, &arbitrator, &token, 1000, 1800),
            Err(Error::InvalidStatus)
        );
    }

    #[test]
    fn test_validate_add_milestone() {
        let env = Env::default();
        let client = Address::generate(&env);
        let valid_desc = String::from_str(&env, "Valid milestone description");

        // Valid milestone
        assert!(validate_add_milestone(&env, &client, &valid_desc, 1000).is_ok());

        // Invalid description
        let short_desc = String::from_str(&env, "Hi");
        assert_eq!(
            validate_add_milestone(&env, &client, &short_desc, 1000),
            Err(Error::InvalidStatus)
        );

        // Invalid amount
        assert_eq!(
            validate_add_milestone(&env, &client, &valid_desc, 0),
            Err(Error::InvalidAmount)
        );
    }
}