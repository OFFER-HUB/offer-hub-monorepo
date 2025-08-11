#![no_std]

mod contract;
mod storage;
mod test;
mod types;

use crate::types::{DisputeData, DisputeOutcome, Error};
use soroban_sdk::{contract, contractimpl, Address, Env, String};

#[contract]
pub struct DisputeResolutionContract;

#[contractimpl]
impl DisputeResolutionContract {
    pub fn initialize(env: Env, arbitrator: Address) -> Result<(), Error> {
        contract::initialize(&env, arbitrator);
        Ok(())
    }

    pub fn open_dispute(
        env: Env,
        job_id: u32,
        initiator: Address,
        reason: String,
        fee_manager: Address,
        dispute_amount: i128,
    ) -> Result<(), Error> {
        contract::open_dispute(&env, job_id, initiator, reason, fee_manager, dispute_amount);
        Ok(())
    }

    pub fn get_dispute(env: Env, job_id: u32) -> Result<DisputeData, Error> {
        Ok(contract::get_dispute(&env, job_id))
    }

    pub fn resolve_dispute(env: Env, job_id: u32, decision: DisputeOutcome) -> Result<(), Error> {
        contract::resolve_dispute(&env, job_id, decision);
        Ok(())
    }
}
