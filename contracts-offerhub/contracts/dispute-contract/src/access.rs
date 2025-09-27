use soroban_sdk::{panic_with_error, Address, Env, Map, String, Vec};

use crate::{
    storage::{ARBITRATORS, MEDIATORS, PAUSED},
    types::{ArbitratorData},
    error::{ Error},
};

pub fn add_arbitrator(
    env: &Env,
    admin: Address,
    arbitrator: Address,
    name: String,
) -> Result<(), Error> {
    admin.require_auth();

    if env.storage().instance().get(&PAUSED).unwrap_or(false) {
        return Err(Error::ContractPaused);
    }

    let mut arbitrators: Map<Address, ArbitratorData> = env
        .storage()
        .instance()
        .get(&ARBITRATORS)
        .unwrap_or_else(|| Map::new(env));

    if arbitrators.contains_key(arbitrator.clone()) {
        panic_with_error!(env, Error::InvalidArbitrator);
    }

    let arbitrator_data = ArbitratorData {
        address: arbitrator.clone(),
        name,
        is_active: true,
        total_cases: 0,
        successful_resolutions: 0,
        added_at: env.ledger().timestamp(),
    };

    arbitrators.set(arbitrator.clone(), arbitrator_data);
    env.storage().instance().set(&ARBITRATORS, &arbitrators);

    env.events().publish(
        (String::from_str(env, "arbitrator_added"), arbitrator),
        env.ledger().timestamp(),
    );

    Ok(())
}

pub fn remove_arbitrator(env: &Env, admin: Address, arbitrator: Address) -> Result<(), Error> {
    admin.require_auth();

    if env.storage().instance().get(&PAUSED).unwrap_or(false) {
        return Err(Error::ContractPaused);
    }

    let mut arbitrators: Map<Address, ArbitratorData> = env
        .storage()
        .instance()
        .get(&ARBITRATORS)
        .unwrap_or_else(|| Map::new(env));

    if !arbitrators.contains_key(arbitrator.clone()) {
        panic_with_error!(env, Error::InvalidArbitrator);
    }

    let mut arbitrator_data = arbitrators.get(arbitrator.clone()).unwrap();
    arbitrator_data.is_active = false;
    arbitrators.set(arbitrator.clone(), arbitrator_data);
    env.storage().instance().set(&ARBITRATORS, &arbitrators);

    env.events().publish(
        (String::from_str(env, "arbitrator_removed"), arbitrator),
        env.ledger().timestamp(),
    );

    Ok(())
}

pub fn is_valid_arbitrator(env: &Env, arbitrator: &Address) -> bool {
    let arbitrators: Map<Address, ArbitratorData> = env
        .storage()
        .instance()
        .get(&ARBITRATORS)
        .unwrap_or_else(|| Map::new(env));

    if let Some(arbitrator_data) = arbitrators.get(arbitrator.clone()) {
        arbitrator_data.is_active
    } else {
        false
    }
}

pub fn add_mediator(env: &Env, admin: Address, mediator: Address) -> Result<(), Error> {
    admin.require_auth();

    if env.storage().instance().get(&PAUSED).unwrap_or(false) {
        return Err(Error::ContractPaused);
    }

    let mut mediators: Vec<Address> = env
        .storage()
        .instance()
        .get(&MEDIATORS)
        .unwrap_or_else(|| Vec::new(env));

    if mediators.contains(mediator.clone()) {
        panic_with_error!(env, Error::InvalidArbitrator);
    }

    mediators.push_back(mediator.clone());
    env.storage().instance().set(&MEDIATORS, &mediators);

    env.events().publish(
        (String::from_str(env, "mediator_added"), mediator),
        env.ledger().timestamp(),
    );

    Ok(())
}

pub fn remove_mediator(env: &Env, admin: Address, mediator: Address) -> Result<(), Error> {
    admin.require_auth();

    if env.storage().instance().get(&PAUSED).unwrap_or(false) {
        return Err(Error::ContractPaused);
    }

    let mediators: Vec<Address> = env
        .storage()
        .instance()
        .get(&MEDIATORS)
        .unwrap_or_else(|| Vec::new(env));

    let mut found = false;
    let mut new_mediators = Vec::new(env);

    for i in 0..mediators.len() {
        let current_mediator = mediators.get(i).unwrap();
        if current_mediator == mediator {
            found = true;
        } else {
            new_mediators.push_back(current_mediator);
        }
    }

    if !found {
        panic_with_error!(env, Error::InvalidArbitrator);
    }

    env.storage().instance().set(&MEDIATORS, &new_mediators);

    env.events().publish(
        (String::from_str(env, "mediator_removed"), mediator),
        env.ledger().timestamp(),
    );

    Ok(())
}

pub fn is_valid_mediator(env: &Env, mediator: &Address) -> bool {
    let mediators: Vec<Address> = env
        .storage()
        .instance()
        .get(&MEDIATORS)
        .unwrap_or_else(|| Vec::new(env));

    mediators.contains(mediator.clone())
}

pub fn get_arbitrators(env: &Env) -> Vec<ArbitratorData> {
    let _arbitrators: Map<Address, ArbitratorData> = env
        .storage()
        .instance()
        .get(&ARBITRATORS)
        .unwrap_or_else(|| Map::new(env));

    let result = Vec::new(env);
    // Note: Soroban Map doesn't have get_by_index, so we return empty for now
    // In a real implementation, you might want to store arbitrators in a Vec as well
    result
}

pub fn get_mediators(env: &Env) -> Vec<Address> {
    env.storage()
        .instance()
        .get(&MEDIATORS)
        .unwrap_or_else(|| Vec::new(env))
}
