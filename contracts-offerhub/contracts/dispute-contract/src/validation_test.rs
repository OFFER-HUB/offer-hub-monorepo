#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, Env, String};
    use crate::types::Error;

    #[test]
    fn test_validate_dispute_reason() {
        // Valid reason
        let env = Env::default();
        let valid_reason = String::from_str(&env, "This is a valid dispute reason with sufficient length");
        assert!(validate_dispute_reason(&valid_reason).is_ok());

        // Too short
        let short_reason = String::from_str(&env, "Short");
        assert_eq!(validate_dispute_reason(&short_reason), Err(Error::InvalidDisputeLevel));

        // Too long (create a string longer than MAX_REASON_LENGTH)
        let long_reason = String::from_str(&env, &"a".repeat(501));
        assert_eq!(validate_dispute_reason(&long_reason), Err(Error::InvalidDisputeLevel));
    }

    #[test]
    fn test_validate_evidence_description() {
        let env = Env::default();
        
        // Valid description
        let valid_desc = String::from_str(&env, "Valid evidence description");
        assert!(validate_evidence_description(&valid_desc).is_ok());

        // Too short
        let short_desc = String::from_str(&env, "Hi");
        assert_eq!(validate_evidence_description(&short_desc), Err(Error::EvidenceNotFound));

        // Too long
        let long_desc = String::from_str(&env, &"a".repeat(1001));
        assert_eq!(validate_evidence_description(&long_desc), Err(Error::EvidenceNotFound));
    }

    #[test]
    fn test_validate_dispute_amount() {
        // Valid amount
        assert!(validate_dispute_amount(1000).is_ok());

        // Too small
        assert_eq!(validate_dispute_amount(0), Err(Error::InvalidDisputeLevel));

        // Too large
        assert_eq!(validate_dispute_amount(1_000_000_001), Err(Error::InvalidDisputeLevel));
    }

    #[test]
    fn test_validate_timeout_duration() {
        // Valid timeout
        assert!(validate_timeout_duration(7200).is_ok()); // 2 hours

        // Too short
        assert_eq!(validate_timeout_duration(1800), Err(Error::InvalidTimeout)); // 30 minutes

        // Too long
        assert_eq!(validate_timeout_duration(2_592_001), Err(Error::InvalidTimeout)); // > 30 days
    }

    #[test]
    fn test_validate_job_id() {
        // Valid job ID
        assert!(validate_job_id(123).is_ok());

        // Invalid job ID
        assert_eq!(validate_job_id(0), Err(Error::DisputeNotFound));
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
    fn test_validate_open_dispute() {
        let env = Env::default();
        let initiator = Address::generate(&env);
        let valid_reason = String::from_str(&env, "Valid dispute reason with sufficient length");

        // Valid dispute
        assert!(validate_open_dispute(&env, 123, &initiator, &valid_reason, 1000).is_ok());

        // Invalid job ID
        assert_eq!(
            validate_open_dispute(&env, 0, &initiator, &valid_reason, 1000),
            Err(Error::DisputeNotFound)
        );

        // Invalid reason
        let short_reason = String::from_str(&env, "Short");
        assert_eq!(
            validate_open_dispute(&env, 123, &initiator, &short_reason, 1000),
            Err(Error::InvalidDisputeLevel)
        );

        // Invalid amount
        assert_eq!(
            validate_open_dispute(&env, 123, &initiator, &valid_reason, 0),
            Err(Error::InvalidDisputeLevel)
        );
    }

    #[test]
    fn test_validate_add_evidence() {
        let env = Env::default();
        let submitter = Address::generate(&env);
        let valid_desc = String::from_str(&env, "Valid evidence description");

        // Valid evidence
        assert!(validate_add_evidence(&env, 123, &submitter, &valid_desc).is_ok());

        // Invalid job ID
        assert_eq!(
            validate_add_evidence(&env, 0, &submitter, &valid_desc),
            Err(Error::DisputeNotFound)
        );

        // Invalid description
        let short_desc = String::from_str(&env, "Hi");
        assert_eq!(
            validate_add_evidence(&env, 123, &submitter, &short_desc),
            Err(Error::EvidenceNotFound)
        );
    }
}