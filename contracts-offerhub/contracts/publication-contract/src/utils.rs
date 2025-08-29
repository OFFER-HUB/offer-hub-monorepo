use soroban_sdk::{Env, String, Symbol};

/// Shared validation helpers for common checks across Stellar contracts
pub struct ValidationHelpers;

impl ValidationHelpers {
    /// Validates that amount is greater than zero
    pub fn validate_amount(amount: i128) -> bool {
        amount > 0
    }

    /// Validates amount is within a specific range
    pub fn validate_amount_range(amount: i128, min: i128, max: i128) -> bool {
        amount >= min && amount <= max
    }

    /// Validates string length is within specified bounds
    pub fn validate_string_length(text: &String, min: u32, max: u32) -> bool {
        let len = text.len() as u32;
        len >= min && len <= max
    }



    /// Validates publication type is valid
    pub fn validate_publication_type(env: &Env, publication_type: &Symbol) -> bool {
        publication_type == &Symbol::new(env, "service") || publication_type == &Symbol::new(env, "project")
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
    pub fn compress_string(_env: &Env, input: &String) -> String {
        // For now, just return the input as-is since Soroban String has limited methods
        // In a real implementation, you'd implement custom compression logic
        input.clone()
    }
}