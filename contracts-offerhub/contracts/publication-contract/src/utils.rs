use soroban_sdk::{Address, Env, String, Symbol};

/// Shared validation helpers for common checks across Stellar contracts
pub struct ValidationHelpers;

impl ValidationHelpers {
    /// Validates that amount is greater than zero
    pub fn validate_amount(amount: i128) -> bool {
        amount > 0
    }

    /// Validates that amount is within specified range
    pub fn validate_amount_range(amount: i128, min: i128, max: i128) -> bool {
        amount >= min && amount <= max
    }

    /// Validates string length is within bounds
    pub fn validate_string_length(text: &String, min_length: u32, max_length: u32) -> bool {
        let len = text.len();
        len >= min_length && len <= max_length
    }

    /// Validates publication type is valid
    pub fn validate_publication_type(env: &Env, publication_type: &Symbol) -> bool {
        publication_type == &Symbol::new(env, "service") || publication_type == &Symbol::new(env, "project")
    }

    /// Validates address is not null (simplified for Soroban)
    pub fn validate_address(_address: &Address) -> bool {
        true // Address validation is handled by Soroban SDK
    }

    /// Validates timestamp is reasonable (not too far in past or future)
    pub fn validate_timestamp(timestamp: u64, current_time: u64) -> bool {
        let max_future_time = current_time + 365 * 24 * 60 * 60; // 1 year in future
        let min_past_time = current_time - 10 * 365 * 24 * 60 * 60; // 10 years in past
        
        timestamp <= max_future_time && timestamp >= min_past_time
    }

    /// Validates category is not empty and within reasonable length
    pub fn validate_category(category: &String) -> bool {
        !category.is_empty() && category.len() <= 100
    }

    /// Validates title meets minimum requirements
    pub fn validate_title(title: &String) -> bool {
        title.len() >= 3 && title.len() <= 50
    }
}

/// Storage optimization utilities for efficient data management
pub struct StorageOptimizer;

impl StorageOptimizer {
    /// Compresses data by removing unnecessary whitespace and normalizing
    pub fn compress_string(env: &Env, input: &String) -> String {
        // For now, just return the input as-is since Soroban String has limited methods
        // In a real implementation, you'd implement custom compression logic
        input.clone()
    }
}