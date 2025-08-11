#![no_std]

mod contract;
mod error;
mod event;
mod storage;
mod utils;
#[cfg(test)]
mod test;
#[cfg(test)]
mod test_optimization;

use crate::contract::PublicationContract;
use crate::error::ContractError;
use crate::storage::PublicationData;
use soroban_sdk::{contract, contractimpl, Address, Env, String, Symbol};

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
    /// Publishes a new service or project on-chain.
    pub fn publish(
        env: Env,
        user: Address,
        publication_type: Symbol,
        title: String,
        category: String,
        amount: i128,
        timestamp: u64,
    ) -> Result<u32, ContractError> {
        PublicationContract::publish(
            env,
            user,
            publication_type,
            title,
            category,
            amount,
            timestamp,
        )
    }

    /// Retrieves a specific publication for a user.
    pub fn get_publication(env: Env, user: Address, id: u32) -> Option<PublicationData> {
        PublicationContract::get_publication(env, user, id)
    }
}

