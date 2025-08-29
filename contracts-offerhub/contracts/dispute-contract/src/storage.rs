use soroban_sdk::{contracttype, symbol_short, Symbol, Address, Env, String};
use crate::types::Error;

pub const DISPUTES: Symbol = symbol_short!("DISPUTES");
pub const ARBITRATOR: Symbol = symbol_short!("ARBITRTR");
pub const ARBITRATORS: Symbol = symbol_short!("ARBITRS");
pub const MEDIATORS: Symbol = symbol_short!("MEDIATORS");
pub const DISPUTE_TIMEOUT: Symbol = symbol_short!("TIMEOUT");
pub const ESCROW_CONTRACT: Symbol = symbol_short!("ESCROW");
pub const FEE_MANAGER: Symbol = symbol_short!("FEEMGR");
pub const RATE_LIMITS: Symbol = symbol_short!("RLIM");
pub const RATE_BYPASS: Symbol = symbol_short!("RLBYP");

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct RateLimitEntry { pub current_calls: u32, pub window_start: u64 }

fn rl_key(user: &Address, kind: &String) -> (Symbol, Address, String) { (RATE_LIMITS, user.clone(), kind.clone()) }
fn bypass_key(user: &Address) -> (Symbol, Address) { (RATE_BYPASS, user.clone()) }

pub fn has_bypass(env: &Env, user: &Address) -> bool { env.storage().persistent().get(&bypass_key(user)).unwrap_or(false) }
pub fn set_bypass(env: &Env, admin: &Address, user: &Address, bypass: bool) -> Result<(), Error> {
	// Read arbitrator/admin from instance storage via symbol key
	let stored_admin: Option<Address> = env.storage().instance().get(&ARBITRATOR);
	if stored_admin.as_ref() != Some(admin) { return Err(Error::Unauthorized); }
	env.storage().persistent().set(&bypass_key(user), &bypass);
	Ok(())
}
pub fn check_rate_limit(env: &Env, user: &Address, kind: &String, max_calls: u32, window: u64) -> Result<(), Error> {
	if has_bypass(env, user) { return Ok(()); }
	let now = env.ledger().timestamp();
	let mut entry = env.storage().persistent().get(&rl_key(user, kind)).unwrap_or(RateLimitEntry{current_calls:0, window_start: now});
	if now.saturating_sub(entry.window_start) > window { entry.current_calls = 0; entry.window_start = now; }
	if entry.current_calls >= max_calls { return Err(Error::RateLimitExceeded); }
	entry.current_calls += 1; env.storage().persistent().set(&rl_key(user, kind), &entry); Ok(())
}

pub fn reset_rate_limit(env: &Env, user: &Address, kind: &String) {
	let entry = RateLimitEntry { current_calls: 0, window_start: env.ledger().timestamp() };
	env.storage().persistent().set(&rl_key(user, kind), &entry);
}
