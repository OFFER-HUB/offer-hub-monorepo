use soroban_sdk::{panic_with_error, Env};

use crate::types::Error;

pub fn handle_error(env: &Env, error: Error) -> ! {
    panic_with_error!(env, error);
}
