use crate::storage::{get_admin, set_admin, get_moderators, set_moderators};
use crate::types::Error;
use soroban_sdk::{Address, Env, Vec};

pub struct AccessControl;

impl AccessControl {
    /// Initialize the contract with an admin
    pub fn initialize_admin(env: &Env, admin: Address) -> Result<(), Error> {
        // Check if admin is already set
        if get_admin(env).is_some() {
            return Err(Error::AlreadyInitialized);
        }
        
        admin.require_auth();
        set_admin(env, &admin);
        Ok(())
    }

    /// Check if the caller is an admin
    pub fn require_admin(env: &Env, caller: &Address) -> Result<(), Error> {
        caller.require_auth();
        
        let admin = get_admin(env).ok_or(Error::NotInitialized)?;
        if admin != *caller {
            return Err(Error::Unauthorized);
        }
        Ok(())
    }

    /// Check if the caller is an admin or moderator
    pub fn require_admin_or_moderator(env: &Env, caller: &Address) -> Result<(), Error> {
        caller.require_auth();
        
        // Check if caller is admin
        if let Some(admin) = get_admin(env) {
            if admin == *caller {
                return Ok(());
            }
        } else {
            return Err(Error::NotInitialized);
        }

        // Check if caller is moderator
        let moderators = get_moderators(env);
        if moderators.contains(caller) {
            return Ok(());
        }

        Err(Error::Unauthorized)
    }

    /// Add a moderator (admin only)
    pub fn add_moderator(env: &Env, admin: Address, moderator: Address) -> Result<(), Error> {
        Self::require_admin(env, &admin)?;
        
        let mut moderators = get_moderators(env);
        if !moderators.contains(&moderator) {
            moderators.push_back(moderator);
            set_moderators(env, &moderators);
        }
        Ok(())
    }

    /// Remove a moderator (admin only)
    pub fn remove_moderator(env: &Env, admin: Address, moderator: Address) -> Result<(), Error> {
        Self::require_admin(env, &admin)?;
        
        let moderators = get_moderators(env);
        let mut new_moderators = Vec::new(env);
        
        for i in 0..moderators.len() {
            let addr = moderators.get(i).unwrap();
            if addr != moderator {
                new_moderators.push_back(addr);
            }
        }
        
        set_moderators(env, &new_moderators);
        Ok(())
    }

    /// Get the current admin
    pub fn get_current_admin(env: &Env) -> Option<Address> {
        get_admin(env)
    }

    /// Get all moderators
    pub fn get_all_moderators(env: &Env) -> Vec<Address> {
        get_moderators(env)
    }

    /// Transfer admin role (current admin only)
    pub fn transfer_admin(env: &Env, current_admin: Address, new_admin: Address) -> Result<(), Error> {
        Self::require_admin(env, &current_admin)?;
        new_admin.require_auth();
        set_admin(env, &new_admin);
        Ok(())
    }
}
