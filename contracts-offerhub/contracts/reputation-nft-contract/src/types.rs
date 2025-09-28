use soroban_sdk::{contracterror, contracttype, Address, Env, String, Symbol, symbol_short};
use crate::error::Error;
pub type TokenId = u64;

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct Metadata {
    pub name: String,
    pub description: String,
    pub uri: String,
    pub achievement_type: AchievementType,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq, Copy)]
pub enum AchievementType {
    Standard,          // Regular NFT, can be transferred
    Reputation,        // Reputation-based achievements, non-transferable
    ProjectMilestone,  // Project-based milestones, non-transferable
    RatingMilestone,   // Rating-based milestones, non-transferable
    CustomAchievement, // Custom achievements, transferable with restrictions
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub enum RarityLevel {
    Common,
    Uncommon,
    Rare,
    Epic,
    Legendary,
}

pub const TOKEN_OWNER: &[u8] = &[0];
pub const TOKEN_METADATA: &[u8] = &[1];
pub const ADMIN: &[u8] = &[2];
pub const MINTER: &[u8] = &[3];
pub const USER_ACHIEVEMENTS: &[u8] = &[5];
pub const ACHIEVEMENT_STATS: &[u8] = &[6];
pub const ACHIEVEMENT_LEADERBOARD: &[u8] = &[7];
pub const USER_REPUTATION: &[u8] = &[8];
pub const ACHIEVEMENT_PREREQUISITES: &[u8] = &[9];
pub const PAUSED: Symbol = symbol_short!("PAUSED");

pub fn require_auth(_env: &Env, address: &Address) -> Result<(), Error> {
    address.require_auth();
    Ok(())
}
