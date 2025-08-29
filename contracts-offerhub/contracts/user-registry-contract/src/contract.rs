use crate::access::AccessControl;
use crate::events::*;
use crate::storage::*;
use crate::types::{require_auth, Error, PublicationStatus, UserProfile, UserStatus, VerificationLevel};
use crate::validation::{validate_user_verification, validate_bulk_verification, validate_metadata_update};
use soroban_sdk::{Address, Env, String, Vec};

pub struct UserRegistryContract;

impl UserRegistryContract {
    // ==================== INITIALIZATION ====================
    
    /// Initialize the contract with an admin
    pub fn initialize_admin(env: Env, admin: Address) -> Result<(), Error> {
        let result = AccessControl::initialize_admin(&env, admin.clone())?;
        emit_admin_initialized(&env, &admin);
        Ok(result)
    }

    // ==================== LEGACY FUNCTIONS (for backward compatibility) ====================
    
    /// Legacy function for registering a verified user (basic level)
    pub fn register_verified_user(env: Env, user: Address) -> Result<(), Error> {
        require_auth(&env, &user)?;
    // Rate limit: max 3 registrations per 24h per caller
    let limit_type = String::from_str(&env, "register_user");
    check_rate_limit(&env, &user, &limit_type, 3, 24*3600)?;
        
        // Check if user is blacklisted
        if is_blacklisted(&env, &user) {
            return Err(Error::AlreadyBlacklisted);
        }

        let mut users = get_verified_users(&env);
        if users.contains_key(user.clone()) {
            return Err(Error::AlreadyRegistered);
        }
        
        // Add to legacy storage
        users.set(user.clone(), true);
        set_verified_users(&env, &users);
        
        // Add to new profile storage with basic verification
        let profile = create_default_profile(&env, VerificationLevel::Basic, 0); // No expiration
        set_user_profile(&env, &user, &profile);
        
        emit_user_registered(&env, &user);
        emit_user_verified(&env, &user, &VerificationLevel::Basic, 0);
        Ok(())
    }

    /// Legacy function to check if user is verified
    pub fn is_verified(env: Env, user: Address) -> bool {
        // Check new profile system first
        if let Some(profile) = get_user_profile(&env, &user) {
            return !profile.is_blacklisted && Self::is_verification_valid(&env, &profile);
        }
        
        // Fall back to legacy system
        let users = get_verified_users(&env);
        users.get(user.clone()).unwrap_or(false) && !is_blacklisted(&env, &user)
    }

    // ==================== ENHANCED USER VERIFICATION ====================
    
    /// Verify a user with a specific level and optional expiration (admin/moderator only)
    pub fn verify_user(
        env: Env,
        admin: Address,
        user: Address,
        level: VerificationLevel,
        expires_at: u64, // 0 means no expiration
        metadata: String,
    ) -> Result<(), Error> {
        AccessControl::require_admin_or_moderator(&env, &admin)?;
        
        // Input validation
        validate_user_verification(&env, &admin, &user, &level, expires_at, &metadata)?;
        
        // Check if user is blacklisted
        if is_blacklisted(&env, &user) {
            return Err(Error::AlreadyBlacklisted);
        }

        let profile = UserProfile {
            verification_level: level.clone(),
            verified_at: env.ledger().timestamp(),
            expires_at,
            metadata,
            is_blacklisted: false,
            publication_status: PublicationStatus::Private,
            validations: Vec::new(&env),
        };

        set_user_profile(&env, &user, &profile);
        
        // Update legacy storage for backward compatibility
        let mut users = get_verified_users(&env);
        users.set(user.clone(), true);
        set_verified_users(&env, &users);

        emit_user_verified(&env, &user, &level, expires_at);
        Ok(())
    }

    /// Unverify a user (admin/moderator only)
    pub fn unverify_user(env: Env, admin: Address, user: Address) -> Result<(), Error> {
        AccessControl::require_admin_or_moderator(&env, &admin)?;
        
        let _profile = get_user_profile(&env, &user).ok_or(Error::UserNotFound)?;
        
        remove_user_profile(&env, &user);
        
        // Update legacy storage
        let mut users = get_verified_users(&env);
        users.remove(user.clone());
        set_verified_users(&env, &users);

        emit_user_unverified(&env, &user);
        Ok(())
    }

    /// Update verification level (admin/moderator only)
    pub fn update_verification_level(
        env: Env,
        admin: Address,
        user: Address,
        new_level: VerificationLevel,
    ) -> Result<(), Error> {
        AccessControl::require_admin_or_moderator(&env, &admin)?;
        
        let mut profile = get_user_profile(&env, &user).ok_or(Error::UserNotFound)?;
        let old_level = profile.verification_level.clone();
        
        profile.verification_level = new_level.clone();
        set_user_profile(&env, &user, &profile);

        emit_verification_level_updated(&env, &user, &old_level, &new_level);
        Ok(())
    }

    /// Renew verification (extend expiration) (admin/moderator only)
    pub fn renew_verification(
        env: Env,
        admin: Address,
        user: Address,
        new_expires_at: u64,
    ) -> Result<(), Error> {
        AccessControl::require_admin_or_moderator(&env, &admin)?;
        
        let mut profile = get_user_profile(&env, &user).ok_or(Error::UserNotFound)?;
        profile.expires_at = new_expires_at;
        set_user_profile(&env, &user, &profile);

        emit_verification_renewed(&env, &user, new_expires_at);
        Ok(())
    }

    // ==================== BLACKLIST FUNCTIONALITY ====================
    
    /// Add user to blacklist (admin/moderator only)
    pub fn blacklist_user(env: Env, admin: Address, user: Address) -> Result<(), Error> {
        AccessControl::require_admin_or_moderator(&env, &admin)?;
        
        // Prevent blacklisting admin or moderators
        if let Some(current_admin) = AccessControl::get_current_admin(&env) {
            if current_admin == user {
                return Err(Error::CannotBlacklistAdmin);
            }
        }
        
        let moderators = AccessControl::get_all_moderators(&env);
        if moderators.contains(&user) {
            return Err(Error::CannotBlacklistModerator);
        }

        if is_blacklisted(&env, &user) {
            return Err(Error::AlreadyBlacklisted);
        }

        add_to_blacklist(&env, &user);
        
        // Update user profile if exists
        if let Some(mut profile) = get_user_profile(&env, &user) {
            profile.is_blacklisted = true;
            set_user_profile(&env, &user, &profile);
        }

        emit_user_blacklisted(&env, &user, &admin);
        Ok(())
    }

    /// Remove user from blacklist (admin/moderator only)
    pub fn unblacklist_user(env: Env, admin: Address, user: Address) -> Result<(), Error> {
        AccessControl::require_admin_or_moderator(&env, &admin)?;
        
        if !is_blacklisted(&env, &user) {
            return Err(Error::NotBlacklisted);
        }

        remove_from_blacklist(&env, &user);
        
        // Update user profile if exists
        if let Some(mut profile) = get_user_profile(&env, &user) {
            profile.is_blacklisted = false;
            set_user_profile(&env, &user, &profile);
        }

        emit_user_unblacklisted(&env, &user, &admin);
        Ok(())
    }

    /// Check if user is blacklisted
    pub fn is_user_blacklisted(env: Env, user: Address) -> bool {
        is_blacklisted(&env, &user)
    }

    // ==================== BULK OPERATIONS ====================
    
    /// Bulk verify users (admin only)
    pub fn bulk_verify_users(
        env: Env,
        admin: Address,
        users: Vec<Address>,
        level: VerificationLevel,
        expires_at: u64,
        metadata: String,
    ) -> Result<(), Error> {
        AccessControl::require_admin(&env, &admin)?;
        
        // Input validation
        validate_bulk_verification(&env, &admin, &users, &level, expires_at, &metadata)?;
        
        let mut verified_count = 0u32;
        
        for i in 0..users.len() {
            let user = users.get(i).unwrap();
            
            // Skip blacklisted users
            if is_blacklisted(&env, &user) {
                continue;
            }

            let profile = UserProfile {
                verification_level: level.clone(),
                verified_at: env.ledger().timestamp(),
                expires_at,
                metadata: metadata.clone(),
                is_blacklisted: false,
                publication_status: PublicationStatus::Private,
                validations: Vec::new(&env),
            };

            set_user_profile(&env, &user, &profile);
            
            // Update legacy storage
            let mut legacy_users = get_verified_users(&env);
            legacy_users.set(user.clone(), true);
            set_verified_users(&env, &legacy_users);

            emit_user_verified(&env, &user, &level, expires_at);
            verified_count += 1;
        }

        emit_bulk_verification_completed(&env, verified_count);
        Ok(())
    }

    // ==================== USER PROFILE METADATA ====================
    
    /// Update user metadata (user themselves or admin/moderator)
    pub fn update_user_metadata(
        env: Env,
        caller: Address,
        user: Address,
        metadata: String,
    ) -> Result<(), Error> {
        // Input validation
        validate_metadata_update(&env, &caller, &user, &metadata)?;
        
        // User can update their own metadata, or admin/moderator can update any user's metadata
        if caller != user {
            AccessControl::require_admin_or_moderator(&env, &caller)?;
        } else {
            require_auth(&env, &caller)?;
        }
        
        let mut profile = get_user_profile(&env, &user).ok_or(Error::UserNotFound)?;
        profile.metadata = metadata;
        set_user_profile(&env, &user, &profile);

        emit_metadata_updated(&env, &user);
        Ok(())
    }

    // ==================== STATUS CHECKING ====================
    
    /// Get comprehensive user status
    pub fn get_user_status(env: Env, user: Address) -> UserStatus {
        if let Some(profile) = get_user_profile(&env, &user) {
            let is_expired = Self::is_verification_expired(&env, &profile);
            UserStatus {
                is_verified: !profile.is_blacklisted && !is_expired,
                verification_level: profile.verification_level,
                is_blacklisted: profile.is_blacklisted,
                verification_expires_at: profile.expires_at,
                is_expired,
                publication_status: profile.publication_status.clone(),
                validation_count: profile.validations.len() as u32,
            }
        } else {
            // Check legacy system
            let users = get_verified_users(&env);
            let is_verified_legacy = users.get(user.clone()).unwrap_or(false);
            let is_blacklisted_current = is_blacklisted(&env, &user);
            
            UserStatus {
                is_verified: is_verified_legacy && !is_blacklisted_current,
                verification_level: if is_verified_legacy { VerificationLevel::Basic } else { VerificationLevel::Basic },
                is_blacklisted: is_blacklisted_current,
                verification_expires_at: 0, // Legacy users don't have expiration
                is_expired: false,
                publication_status: PublicationStatus::Private,
                validation_count: 0,
            }
        }
    }

    /// Get user profile
    pub fn get_user_profile_data(env: Env, user: Address) -> Option<UserProfile> {
        get_user_profile(&env, &user)
    }

    /// Check verification level
    pub fn get_verification_level(env: Env, user: Address) -> Option<VerificationLevel> {
        get_user_profile(&env, &user).map(|p| p.verification_level)
    }

    // ==================== ACCESS CONTROL ====================
    
    /// Add moderator (admin only)
    pub fn add_moderator(env: Env, admin: Address, moderator: Address) -> Result<(), Error> {
        AccessControl::add_moderator(&env, admin.clone(), moderator.clone())?;
        emit_moderator_added(&env, &moderator, &admin);
        Ok(())
    }

    /// Remove moderator (admin only)
    pub fn remove_moderator(env: Env, admin: Address, moderator: Address) -> Result<(), Error> {
        AccessControl::remove_moderator(&env, admin.clone(), moderator.clone())?;
        emit_moderator_removed(&env, &moderator, &admin);
        Ok(())
    }

    /// Transfer admin role (current admin only)
    pub fn transfer_admin(env: Env, current_admin: Address, new_admin: Address) -> Result<(), Error> {
        AccessControl::transfer_admin(&env, current_admin.clone(), new_admin.clone())?;
        emit_admin_transferred(&env, &current_admin, &new_admin);
        Ok(())
    }

    /// Get current admin
    pub fn get_admin(env: Env) -> Option<Address> {
        AccessControl::get_current_admin(&env)
    }

    /// Get all moderators
    pub fn get_moderators(env: Env) -> Vec<Address> {
        AccessControl::get_all_moderators(&env)
    }

    // ===== Rate limiting admin helpers =====
    pub fn set_rate_limit_bypass(env: Env, admin: Address, user: Address, bypass: bool) -> Result<(), Error> {
        set_rate_limit_bypass(&env, &admin, &user, bypass)
    }

    pub fn reset_rate_limit(env: Env, admin: Address, user: Address, limit_type: String) -> Result<(), Error> {
        // Only admin
        AccessControl::require_admin(&env, &admin)?;
        reset_rate_limit(&env, &user, &limit_type);
        Ok(())
    }

    // ==================== HELPER FUNCTIONS ====================
    
    fn is_verification_expired(env: &Env, profile: &UserProfile) -> bool {
        if profile.expires_at == 0 {
            return false; // No expiration
        }
        env.ledger().timestamp() > profile.expires_at
    }

    fn is_verification_valid(env: &Env, profile: &UserProfile) -> bool {
        !Self::is_verification_expired(env, profile)
    }


} 