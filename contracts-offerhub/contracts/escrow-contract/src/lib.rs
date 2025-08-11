#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, Symbol};

mod contract;
mod error;
mod storage;
mod types;

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    pub fn init_contract(env: Env, client: Address, freelancer: Address, amount: i128, fee_manager: Address) {
        contract::init_contract(&env, client, freelancer, amount, fee_manager);
    }

    pub fn deposit_funds(env: Env, client: Address) {
        contract::deposit_funds(&env, client);
    }

    pub fn release_funds(env: Env, freelancer: Address) {
        contract::release_funds(&env, freelancer);
    }

    pub fn dispute(env: Env, caller: Address) {
        contract::dispute(&env, caller);
    }

    pub fn resolve_dispute(env: Env, result: Symbol) {
        contract::resolve_dispute(&env, result);
    }

    pub fn get_escrow_data(env: Env) -> types::EscrowData {
        contract::get_escrow_data(&env)
    }
}
