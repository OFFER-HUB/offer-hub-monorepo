use soroban_sdk::{contracttype, symbol_short, Address, Env, String, Symbol};
use crate::types::Error;

pub const ESCROW_DATA: Symbol = symbol_short!("ESCROW");
pub const INITIALIZED: Symbol = symbol_short!("INIT");

// Rate limit storage keys
pub const RATE_LIMITS: Symbol = symbol_short!("RLIM");
pub const RATE_BYPASS: Symbol = symbol_short!("RLBYP");

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct RateLimitEntry {
	pub current_calls: u32,
	pub window_start: u64,
}

fn rl_key(user: &Address, kind: &String) -> (Symbol, Address, String) { (RATE_LIMITS, user.clone(), kind.clone()) }
fn bypass_key(user: &Address) -> (Symbol, Address) { (RATE_BYPASS, user.clone()) }

pub fn has_rate_limit_bypass(env: &Env, user: &Address) -> bool {
	env.storage().persistent().get(&bypass_key(user)).unwrap_or(false)
}

pub fn set_rate_limit_bypass_flag(env: &Env, user: &Address, bypass: bool) {
	env.storage().persistent().set(&bypass_key(user), &bypass);
}

pub fn check_rate_limit(env: &Env, user: &Address, kind: &String, max_calls: u32, window_secs: u64) -> Result<(), Error> {
	if has_rate_limit_bypass(env, user) { return Ok(()); }
	let now = env.ledger().timestamp();
	let mut entry = env.storage().persistent().get(&rl_key(user, kind))
		.unwrap_or(RateLimitEntry { current_calls: 0, window_start: now });
	if now.saturating_sub(entry.window_start) > window_secs {
		entry.current_calls = 0;
		entry.window_start = now;
	}
	if entry.current_calls >= max_calls {
		return Err(Error::RateLimitExceeded);
	}
	entry.current_calls += 1;
	env.storage().persistent().set(&rl_key(user, kind), &entry);
	// Emit basic rate limit event
	env.events().publish((Symbol::new(env, "rate_limit"), user.clone()), (kind.clone(), entry.current_calls, entry.window_start));
	Ok(())
}

pub fn reset_rate_limit(env: &Env, user: &Address, kind: &String) {
	let entry = RateLimitEntry { current_calls: 0, window_start: env.ledger().timestamp() };
	env.storage().persistent().set(&rl_key(user, kind), &entry);
}
