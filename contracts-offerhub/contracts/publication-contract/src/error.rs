use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum ContractError {
    InvalidPublicationType = 1,
    TitleTooShort = 2,
    InvalidAmount = 3,
    ValidationError = 4,
}
