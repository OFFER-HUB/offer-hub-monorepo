use soroban_sdk::{Address, Env, String, Symbol, Vec, IntoVal};

use crate::{
    error::handle_error,
    storage::{ESCROW_DATA, INITIALIZED},
    types::{DisputeResult, Error, EscrowData, EscrowStatus, Milestone, MilestoneHistory},
};

pub fn init_contract(env: &Env, client: Address, freelancer: Address, amount: i128, fee_manager: Address) {
    if env.storage().instance().has(&INITIALIZED) {
        handle_error(env, Error::AlreadyInitialized);
    }

    if amount <= 0 {
        handle_error(env, Error::InvalidAmount);
    }

    let escrow_data = EscrowData {
        client,
        freelancer,
        amount,
        status: EscrowStatus::Initialized,
        dispute_result: 0, // 0 = None
        created_at: env.ledger().timestamp(),
        funded_at: None,
        released_at: None,
        disputed_at: None,
        resolved_at: None,
        milestones: Vec::new(env),
        milestone_history: Vec::new(env),
        released_amount: 0,
        fee_manager,
        fee_collected: 0,
        net_amount: amount,
    };

    env.storage().instance().set(&ESCROW_DATA, &escrow_data);
    env.storage().instance().set(&INITIALIZED, &true);
}

pub fn deposit_funds(env: &Env, client: Address) {
    client.require_auth();

    if !env.storage().instance().has(&INITIALIZED) {
        handle_error(env, Error::NotInitialized);
    }

    let mut escrow_data: EscrowData = env.storage().instance().get(&ESCROW_DATA).unwrap();

    if escrow_data.client != client {
        handle_error(env, Error::Unauthorized);
    }

    if escrow_data.status != EscrowStatus::Initialized {
        handle_error(env, Error::InvalidStatus);
    }

    escrow_data.status = EscrowStatus::Funded;
    escrow_data.funded_at = Some(env.ledger().timestamp());

    env.storage().instance().set(&ESCROW_DATA, &escrow_data);

    env.events().publish(
        (Symbol::new(env, "deposited_fund"), client.clone()),
        (escrow_data.amount, env.ledger().timestamp()),
    );
}

pub fn release_funds(env: &Env, freelancer: Address) {
    freelancer.require_auth();

    if !env.storage().instance().has(&INITIALIZED) {
        handle_error(env, Error::NotInitialized);
    }

    let mut escrow_data: EscrowData = env.storage().instance().get(&ESCROW_DATA).unwrap();

    if escrow_data.freelancer != freelancer {
        handle_error(env, Error::Unauthorized);
    }

    if escrow_data.status != EscrowStatus::Funded {
        handle_error(env, Error::InvalidStatus);
    }

    // Calculate and collect fees
    // Note: In a real deployment, this would call the fee manager
    // For testing purposes, we'll simulate the fee collection
    let fee_percentage = 250; // 2.5% fee
    let fee_amount = (escrow_data.amount * fee_percentage) / 10000;
    let net_amount = escrow_data.amount - fee_amount;

    escrow_data.status = EscrowStatus::Released;
    escrow_data.released_at = Some(env.ledger().timestamp());
    escrow_data.fee_collected = fee_amount;
    escrow_data.net_amount = net_amount;

    env.storage().instance().set(&ESCROW_DATA, &escrow_data);

    env.events().publish(
        (Symbol::new(env, "released_fund"), freelancer.clone()),
        (
            escrow_data.amount,
            escrow_data.net_amount,
            escrow_data.fee_collected,
            escrow_data.client,
            env.ledger().timestamp(),
        ),
    );
}

pub fn dispute(env: &Env, caller: Address) {
    caller.require_auth();

    if !env.storage().instance().has(&INITIALIZED) {
        handle_error(env, Error::NotInitialized);
    }

    let mut escrow_data: EscrowData = env.storage().instance().get(&ESCROW_DATA).unwrap();

    if escrow_data.client != caller && escrow_data.freelancer != caller {
        handle_error(env, Error::Unauthorized);
    }

    if escrow_data.status != EscrowStatus::Funded {
        handle_error(env, Error::InvalidStatus);
    }

    escrow_data.status = EscrowStatus::Disputed;
    escrow_data.disputed_at = Some(env.ledger().timestamp());

    env.storage().instance().set(&ESCROW_DATA, &escrow_data);

    env.events().publish(
        (Symbol::new(env, "escrow_disputed"), caller.clone()),
        env.ledger().timestamp(),
    );
}

pub fn resolve_dispute(env: &Env, result: Symbol) {
    if !env.storage().instance().has(&INITIALIZED) {
        handle_error(env, Error::NotInitialized);
    }

    let mut escrow_data: EscrowData = env.storage().instance().get(&ESCROW_DATA).unwrap();

    if escrow_data.status != EscrowStatus::Disputed {
        handle_error(env, Error::DisputeNotOpen);
    }

    let dispute_result = if result == Symbol::new(env, "client_wins") {
        DisputeResult::ClientWins
    } else if result == Symbol::new(env, "freelancer_wins") {
        DisputeResult::FreelancerWins
    } else if result == Symbol::new(env, "split") {
        DisputeResult::Split
    } else {
        handle_error(env, Error::InvalidDisputeResult);
    };

    escrow_data.status = EscrowStatus::Resolved;
    escrow_data.dispute_result = match dispute_result {
        DisputeResult::ClientWins => 1,
        DisputeResult::FreelancerWins => 2,
        DisputeResult::Split => 3,
    };
    escrow_data.resolved_at = Some(env.ledger().timestamp());

    env.storage().instance().set(&ESCROW_DATA, &escrow_data);

    env.events().publish(
        (Symbol::new(env, "escrow_resolved"), result.clone()),
        env.ledger().timestamp(),
    );
}

/// @ryzen-xp
/// Add a milestone (client only)
pub fn add_milestone(env: &Env, client: Address, desc: String, amount: i128) -> u32 {
    client.require_auth();
    let mut escrow: EscrowData = env.storage().instance().get(&ESCROW_DATA).unwrap();

    if escrow.client != client {
        handle_error(env, Error::Unauthorized);
    }
    if amount <= 0 {
        handle_error(env, Error::InvalidAmount);
    }

    let m_id = (escrow.milestones.len() as u32) + 1;
    let ts = env.ledger().timestamp();

    let milestone = Milestone {
        id: m_id,
        description: desc.clone(),
        amount,
        approved: false,
        released: false,
        created_at: ts,
        approved_at: None,
        released_at: None,
    };

    escrow.milestones.push_back(milestone.clone());
    escrow.milestone_history.push_back(MilestoneHistory {
        milestone: milestone,
        action: String::from_str(env, "added"),
        timestamp: ts,
    });

    env.storage().instance().set(&ESCROW_DATA, &escrow);

    env.events().publish(
        (Symbol::new(env, "escrow_milestone_added"), client.clone()),
        (m_id, desc.clone(), amount, env.ledger().timestamp()),
    );
    m_id
}

/// @ryzen-xp
/// approve a milestone (client only)
pub fn approve_milestone(env: &Env, client: Address, milestone_id: u32) {
    client.require_auth();
    let mut escrow: EscrowData = env.storage().instance().get(&ESCROW_DATA).unwrap();
    let ts = env.ledger().timestamp();

    let mut milestone = escrow
        .milestones
        .get(milestone_id)
        .unwrap_or_else(|| handle_error(env, Error::MilestoneNotFound));

    if escrow.client != client {
        handle_error(env, Error::Unauthorized);
    }
    if milestone.approved {
        handle_error(env, Error::InvalidStatus);
    }

    milestone.approved = true;
    milestone.approved_at = Some(ts);
    escrow.milestone_history.push_back(MilestoneHistory {
        milestone: milestone.clone(),
        action: String::from_str(env, "approved"),
        timestamp: ts,
    });
    env.storage().instance().set(&ESCROW_DATA, &escrow);

    env.events().publish(
        (
            Symbol::new(env, "escrow_milestone_approved"),
            client.clone(),
        ),
        (milestone_id, env.ledger().timestamp()),
    );
}

/// @ryzen-xp
/// release a milestone (freelancer only, after approval)
pub fn release_milestone(env: &Env, freelancer: Address, milestone_id: u32) {
    freelancer.require_auth();
    let mut escrow: EscrowData = env.storage().instance().get(&ESCROW_DATA).unwrap();
    let ts = env.ledger().timestamp();

    let mut milestone = escrow
        .milestones
        .get(milestone_id)
        .unwrap_or_else(|| handle_error(env, Error::MilestoneNotFound));

    if !milestone.approved || milestone.released {
        handle_error(env, Error::InvalidStatus);
    }
    if escrow.freelancer != freelancer {
        handle_error(env, Error::Unauthorized);
    }

    milestone.released = true;
    milestone.released_at = Some(ts);
    escrow.released_amount += milestone.amount;
    escrow.milestone_history.push_back(MilestoneHistory {
        milestone: milestone.clone(),
        action: String::from_str(env, "released"),
        timestamp: ts,
    });
    env.storage().instance().set(&ESCROW_DATA, &escrow);

    env.events().publish(
        (
            Symbol::new(env, "escrow_milestone_released"),
            freelancer.clone(),
        ),
        (milestone_id, milestone.amount, ts),
    );
}

pub fn get_escrow_data(env: &Env) -> EscrowData {
    if !env.storage().instance().has(&INITIALIZED) {
        handle_error(env, Error::NotInitialized);
    }

    env.storage().instance().get(&ESCROW_DATA).unwrap()
}

/// @ryzen-xp
/// returns all milestones (status and details)
pub fn get_milestones(env: &Env) -> Vec<Milestone> {
    let escrow: EscrowData = env.storage().instance().get(&ESCROW_DATA).unwrap();
    escrow.milestones.clone()
}

/// @ryzen-xp
/// returns history of actions performed on milestones
pub fn get_milestone_history(env: &Env) -> Vec<MilestoneHistory> {
    let escrow: EscrowData = env.storage().instance().get(&ESCROW_DATA).unwrap();
    escrow.milestone_history.clone()
}
