use soroban_sdk::{contract, contractimpl, Address, Env, String, Symbol};

use crate::error::ContractError;
use crate::event;
use crate::storage::{DataKey, PublicationData};
use crate::utils::{ValidationHelpers, StorageOptimizer};

#[contract]
pub struct PublicationContract;

#[contractimpl]
impl PublicationContract {
    /// Publishes a new service or project on-chain.
    /// This function must be called before the data is stored in any off-chain database.
    pub fn publish(
        env: Env,
        user: Address,
        publication_type: Symbol,
        title: String,
        category: String,
        amount: i128,
        timestamp: u64,
    ) -> Result<u32, ContractError> {
       
        user.require_auth();

        // Validate input data using optimized validation helpers.
        if !ValidationHelpers::validate_publication_type(&env, &publication_type) {
            return Err(ContractError::InvalidPublicationType);
        }
        if !ValidationHelpers::validate_title(&title) {
            return Err(ContractError::TitleTooShort);
        }
        if !ValidationHelpers::validate_amount(amount) {
            return Err(ContractError::InvalidAmount);
        }
        if !ValidationHelpers::validate_category(&category) {
            return Err(ContractError::ValidationError);
        }

        // Get the next publication ID for this specific user.
        let user_post_count_key = DataKey::UserPostCount(user.clone());
        let new_id = env
            .storage()
            .instance()
            .get::<_, u32>(&user_post_count_key)
            .unwrap_or(0)
            + 1;

        // Create the publication data struct with optimized storage.
        let compressed_title = StorageOptimizer::compress_string(&env, &title);
        let compressed_category = StorageOptimizer::compress_string(&env, &category);
        
        let publication_data = PublicationData {
            publication_type: publication_type.clone(),
            title: compressed_title,
            category: compressed_category,
            amount,
            timestamp,
        };

        // Store the publication data on-chain, keyed by user and their unique ID.
        let publication_key = DataKey::Publication(user.clone(), new_id);
        env.storage().instance().set(&publication_key, &publication_data);

        // Update the user's post count.
        env.storage().instance().set(&user_post_count_key, &new_id);

        // Emit an event to notify off-chain services that a new publication has been created.
        event::publication_created(&env, user, new_id, publication_type);
        Ok(new_id)
    }

    /// Retrieves a specific publication for a user.
    /// This is a helper function primarily for verification and testing.
    pub fn get_publication(
        env: Env,
        user: Address,
        id: u32,
    ) -> Option<PublicationData> {
        let key = DataKey::Publication(user, id);
        env.storage().instance().get(&key)
    }
}