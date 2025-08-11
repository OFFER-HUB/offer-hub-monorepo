use soroban_sdk::{panic_with_error, Address, Env, Map, String, Symbol, Vec, IntoVal};

use crate::{
    storage::{ARBITRATOR, DISPUTES},
    types::{DisputeData, DisputeOutcome, Error},
};

pub fn initialize(env: &Env, arbitrator: Address) {
    if env.storage().instance().has(&ARBITRATOR) {
        panic_with_error!(env, Error::AlreadyInitialized)
    }
    env.storage().instance().set(&ARBITRATOR, &arbitrator);
    env.storage()
        .instance()
        .set(&DISPUTES, &Map::<u32, DisputeData>::new(env));
}

pub fn open_dispute(env: &Env, job_id: u32, initiator: Address, reason: String, fee_manager: Address, dispute_amount: i128) {
    initiator.require_auth();

    if !env.storage().instance().has(&ARBITRATOR) {
        panic_with_error!(env, Error::NotInitialized);
    }

    let mut disputes: Map<u32, DisputeData> = env.storage().instance().get(&DISPUTES).unwrap();

    if disputes.contains_key(job_id) {
        panic_with_error!(env, Error::DisputeAlreadyExists);
    }

    let dispute_data = DisputeData {
        initiator,
        reason,
        timestamp: env.ledger().timestamp(),
        resolved: false,
        outcome: DisputeOutcome::None,
        fee_manager,
        dispute_amount,
        fee_collected: 0,
    };

    disputes.set(job_id, dispute_data);
    env.storage().instance().set(&DISPUTES, &disputes);
}

pub fn get_dispute(env: &Env, job_id: u32) -> DisputeData {
    if !env.storage().instance().has(&ARBITRATOR) {
        panic_with_error!(env, Error::NotInitialized);
    }
    let disputes: Map<u32, DisputeData> = env.storage().instance().get(&DISPUTES).unwrap();
    disputes
        .get(job_id)
        .unwrap_or_else(|| panic_with_error!(env, Error::DisputeNotFound))
}

pub fn resolve_dispute(env: &Env, job_id: u32, decision: DisputeOutcome) {
    if !env.storage().instance().has(&ARBITRATOR) {
        panic_with_error!(env, Error::NotInitialized);
    }

    let arbitrator: Address = env.storage().instance().get(&ARBITRATOR).unwrap();
    arbitrator.require_auth();

    let mut disputes: Map<u32, DisputeData> = env.storage().instance().get(&DISPUTES).unwrap();

    let mut dispute = disputes
        .get(job_id)
        .unwrap_or_else(|| panic_with_error!(env, Error::DisputeNotFound));

    if dispute.resolved {
        panic_with_error!(env, Error::DisputeAlreadyResolved)
    }

    if decision == DisputeOutcome::None {
        panic!("cannot resolve with None outcome");
    }

    // Collect dispute resolution fee
    // Note: In a real deployment, this would call the fee manager
    // For testing purposes, we'll simulate the fee collection
    let fee_percentage = 500; // 5% fee
    let fee_amount = (dispute.dispute_amount * fee_percentage) / 10000;
    let net_amount = dispute.dispute_amount - fee_amount;

    dispute.resolved = true;
    dispute.outcome = decision;
    dispute.fee_collected = fee_amount;

    disputes.set(job_id, dispute);
    env.storage().instance().set(&DISPUTES, &disputes);
}
