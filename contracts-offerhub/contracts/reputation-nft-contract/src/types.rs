use soroban_sdk::{contracterror, contracttype, Address, Env, String};

pub type TokenId = u64;

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct Metadata {
    pub name: String,
    pub description: String,
    pub uri: String,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub enum Error {
    Unauthorized = 1,
    TokenDoesNotExist = 2,
    TokenAlreadyExists = 3,
    AlreadyMinter = 4,
    NotMinter = 5,
}

pub const TOKEN_OWNER: &[u8] = &[0];
pub const TOKEN_METADATA: &[u8] = &[1];
pub const ADMIN: &[u8] = &[2];
pub const MINTER: &[u8] = &[3];
pub const USER_ACHIEVEMENTS: &[u8] = &[5];

pub fn require_auth(_env: &Env, address: &Address) -> Result<(), Error> {
    address.require_auth();
    Ok(())
}
