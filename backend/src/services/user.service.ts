/**
 * @fileoverview User service providing user data management and database operations
 * @author Offer Hub Team
 */

import { supabase } from "@/lib/supabase/supabase";
import {
  AppError,
  BadRequestError,
  ConflictError,
  InternalServerError,
  NotFoundError,
} from "@/utils/AppError";
import { CreateUserDTO, User, UserFilters } from "@/types/user.types";
import bcrypt from "bcryptjs";

class UserService {
  async createUser(data: CreateUserDTO) {
    // Verify unique wallet_address
    const { data: walletUser } = await supabase
      .from("users")
      .select("id")
      .eq("wallet_address", data.wallet_address)
      .single();

    if (walletUser)
      throw new ConflictError("Wallet_address_already_registered");

    // Verify unique username
    const { data: usernameUser } = await supabase
      .from("users")
      .select("id")
      .eq("username", data.username)
      .single();

    if (usernameUser) throw new ConflictError("Username_already_taken");

    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert([
        {
          wallet_address: data.wallet_address,
          username: data.username,
          name: data.name,
          bio: data.bio,
          email: data.email,
          is_freelancer: data.is_freelancer ?? false,
        },
      ])
      .select()
      .single();

    if (insertError) throw new InternalServerError("Error_creating_user");

    return newUser;
  }

  async getUserById(id: string) {
    const { data, error } = await supabase
      .from("users")
      .select(
        "id, wallet_address, username, name, bio, email, avatar_url, is_freelancer, created_at, updated_at",
      )
      .eq("id", id)
      .single();

    if (error) return null;

    return data;
  }

  async updateUser(id: string, updates: Partial<CreateUserDTO>) {
    // Do not allow changes to wallet_address or is_freelancer
    if ("wallet_address" in updates || "is_freelancer" in updates) {
      throw new BadRequestError("Cannot_update_restricted_fields");
    }

    // Validate unique username
    if (updates.username) {
      const { data: existing } = await supabase
        .from("users")
        .select("id")
        .eq("username", updates.username)
        .neq("id", id)
        .single();

      if (existing) throw new ConflictError("Username_already_taken");
    }

    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new InternalServerError("Error_updating_user");
    return data;
  }

  async getAllUsers(
    filters: UserFilters,
  ): Promise<{ users: User[]; total: number }> {
    const { page = 1, limit = 20, search, is_freelancer } = filters;

    let query = supabase.from("users").select(
      `
                id,
                wallet_address,
                username,
                name,
                bio,
                email,
                is_freelancer,
                created_at
                `,
      { count: "exact" },
    );

    // Apply search filter
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,email.ilike.%${search}%,username.ilike.%${search}%`,
      );
    }

    // Apply role filter
    if (is_freelancer !== undefined) {
      query = query.eq("is_freelancer", is_freelancer);
    }

    // Add pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    // Order by creation date (newest first)
    query = query.order("created_at", { ascending: false });

    const { data: users, error, count } = await query;

    if (error) {
      throw new InternalServerError(`Failed to fetch users: ${error.message}`);
    }

    return {
      users: users || [],
      total: count || 0,
    };
  }

  async updateAvatar(userId: string, avatarUrl: string | null) {
    // First verify the user exists
    const existingUser = await this.getUserById(userId);
    if (!existingUser) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    // Update only the avatar_url field and updated_at timestamp
    const { data, error } = await supabase
      .from("users")
      .update({
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select(
        "id, wallet_address, username, name, bio, email, avatar_url, is_freelancer, created_at, updated_at",
      )
      .single();

    if (error) {
      throw new InternalServerError("Error updating user avatar");
    }

    return data;
  }

  async updateProfile(
    userId: string,
    updates: { username?: string; avatar_url?: string },
  ) {
    const existingUser = await this.getUserById(userId);
    if (!existingUser) {
      throw new NotFoundError("User not found", "USER_NOT_FOUND");
    }
    if (updates.username && updates.username !== existingUser.username) {
      const { data: duplicateUser } = await supabase
        .from("users")
        .select("id")
        .ilike("username", updates.username)
        .neq("id", userId)
        .single();

      if (duplicateUser) {
        throw new ConflictError("Username_already_taken","USERNAME_TAKEN");
      }
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (updates.username !== undefined) {
      updateData.username = updates.username;
    }

    if (updates.avatar_url !== undefined) {
      updateData.avatar_url = updates.avatar_url;
    }

    // Update user with new data
    const { data, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", userId)
      .select(
        "id, wallet_address, username, name, bio, email, avatar_url, is_freelancer, created_at, updated_at",
      )
      .single();

    if (error) {
      throw new InternalServerError("Error updating user profile");
    }

    return data;
  }

  /**
   * Soft-delete user's own account with password verification
   * - Verifies password for security
   * - Requires explicit "DELETE" confirmation string
   * - Anonymizes personal data (email, username)
   * - Revokes all refresh tokens
   * - Sends confirmation email before anonymizing
   * @param userId - ID of the user to delete
   * @param password - Current password for verification
   * @param confirmation - Must be exactly "DELETE"
   */
  async deleteOwnAccount(
    userId: string,
    password: string,
    confirmation: string,
  ): Promise<void> {
    // Validate confirmation string
    if (confirmation !== "DELETE") {
      throw new BadRequestError(
        "Confirmation must be exactly 'DELETE'",
        "INVALID_CONFIRMATION",
      );
    }

    // Fetch user with password_hash and email
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("id, email, password_hash, is_active")
      .eq("id", userId)
      .single();

    if (fetchError || !user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    // Check if account is already deleted
    if (!user.is_active) {
      throw new BadRequestError(
        "Account is already deleted",
        "ACCOUNT_ALREADY_DELETED",
      );
    }

    // Verify user has password authentication
    if (!user.password_hash) {
      throw new BadRequestError(
        "Password authentication not enabled. Please contact support to delete your account.",
        "NO_PASSWORD_AUTH",
      );
    }

    // Verify password using bcrypt (constant-time comparison)
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new BadRequestError("Incorrect password", "INVALID_PASSWORD");
    }

    // Store original email for confirmation email (must be done before anonymization)
    const originalEmail = user.email;

    // Generate anonymized values using user ID for uniqueness
    const anonymizedEmail = `deleted_${userId}@deleted.local`;
    const anonymizedUsername = `deleted_${userId}`;

    // Step 1: Revoke ALL refresh tokens for this user
    const { error: revokeError } = await supabase
      .from("refresh_tokens")
      .update({
        is_revoked: true,
        revoked_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("is_revoked", false);

    if (revokeError) {
      console.error("Failed to revoke refresh tokens:", revokeError);
      throw new InternalServerError("Failed to revoke sessions");
    }

    // Step 2: Send confirmation email BEFORE anonymizing (use original email)
    if (originalEmail) {
      try {
        const { sendAccountDeletionEmail } = await import("./email.service");
        await sendAccountDeletionEmail(originalEmail);
      } catch (emailError) {
        // Log but don't fail the deletion - email is not critical
        console.error("Failed to send account deletion email:", emailError);
      }
    }

    // Step 3: Soft-delete user - set is_active=false and anonymize PII
    const { error: updateError } = await supabase
      .from("users")
      .update({
        is_active: false,
        email: anonymizedEmail,
        username: anonymizedUsername,
        name: null,
        bio: null,
        avatar_url: null,
        wallet_address: null,
        nonce: null,
        password_hash: null, // Clear password hash for security
        password_reset_token: null,
        password_reset_expires_at: null,
        email_verification_token: null,
        email_verification_expires_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Failed to delete user account:", updateError);
      throw new InternalServerError("Failed to delete account");
    }
  }
}

export const userService = new UserService();
