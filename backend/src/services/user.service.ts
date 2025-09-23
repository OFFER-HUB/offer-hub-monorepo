/**
 * @fileoverview User service providing user data management and database operations
 * @author Offer Hub Team
 */

import { supabase } from "@/lib/supabase/supabase";
import { AppError, BadRequestError, ConflictError, InternalServerError } from "@/utils/AppError";
import { CreateUserDTO, User, UserFilters } from "@/types/user.types";
import { 
    AdminUserFilters, 
    UserManagementUser, 
    UserAnalytics, 
    BulkUserOperation,
    UserStatusChange,
    UserRoleChange,
    UserVerification,
    AdminCreateUserDTO,
    UserActivityLog,
    UserCommunication
} from "@/types/user-management.types";

class UserService {
    async createUser(data: CreateUserDTO) {
    // Verify unique wallet_address
    const { data: walletUser } = await supabase
        .from("users")
        .select("id")
        .eq("wallet_address", data.wallet_address)
        .single();

    if (walletUser) throw new ConflictError("Wallet_address_already_registered");

    // Verify unique username
    const { data: usernameUser } = await supabase
        .from("users")
        .select("id")
        .eq("username", data.username)
        .single();

    if (usernameUser) throw new ConflictError("Username_already_taken");

    const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert([{
        wallet_address: data.wallet_address,
        username: data.username,
        name: data.name,
        bio: data.bio,
        email: data.email,
        is_freelancer: data.is_freelancer ?? false,
        }])
        .select()
        .single();

        if (insertError) throw new InternalServerError("Error_creating_user");
        
        return newUser;
    }

    async getUserById(id: string) {
        const { data, error } = await supabase
            .from("users")
            .select("id, wallet_address, username, name, bio, email, is_freelancer, created_at")
            .eq("id", id)
            .single();

        if (error) return null;

        return data;
    }

    async updateUser(id: string, updates: Partial<CreateUserDTO>) {
        // Do not allow changes to wallet_address or is_freelancer
        if ('wallet_address' in updates || 'is_freelancer' in updates) {
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

    async getAllUsers(filters: UserFilters): Promise<{ users: User[]; total: number }> {
        const {
            page = 1,
            limit = 20,
            search,
            is_freelancer
        } = filters;

        let query = supabase
            .from("users")
            .select(
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
                { count: "exact" }
            );

        // Apply search filter
        if (search) {
            query = query.or(
                `name.ilike.%${search}%,email.ilike.%${search}%,username.ilike.%${search}%`
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
            total: count || 0
        };
    }

    // Admin-specific methods
    async createUserAsAdmin(data: AdminCreateUserDTO, adminId: string): Promise<UserManagementUser> {
        // Verify unique wallet_address
        const { data: walletUser } = await supabase
            .from("users")
            .select("id")
            .eq("wallet_address", data.wallet_address)
            .single();

        if (walletUser) throw new ConflictError("Wallet_address_already_registered");

        // Verify unique username
        const { data: usernameUser } = await supabase
            .from("users")
            .select("id")
            .eq("username", data.username)
            .single();

        if (usernameUser) throw new ConflictError("Username_already_taken");

        const { data: newUser, error: insertError } = await supabase
            .from("users")
            .insert([{
                wallet_address: data.wallet_address,
                username: data.username,
                name: data.name,
                bio: data.bio,
                email: data.email,
                is_freelancer: data.is_freelancer ?? false,
                status: data.status || 'active',
                role: data.role || 'user',
                verification_status: data.verification_status || 'unverified',
                login_count: 0,
                profile_completion: 0,
                trust_score: 0,
                created_by: adminId,
                notes: data.notes
            }])
            .select()
            .single();

        if (insertError) throw new InternalServerError("Error_creating_user");
        
        return newUser;
    }

    async getAllUsersForAdmin(filters: AdminUserFilters): Promise<{ users: UserManagementUser[]; total: number }> {
        const {
            page = 1,
            limit = 20,
            search,
            status,
            role,
            verification_status,
            is_freelancer,
            date_from,
            date_to,
            sort_by = 'created_at',
            sort_order = 'desc'
        } = filters;

        let query = supabase
            .from("users")
            .select(`
                id,
                wallet_address,
                username,
                name,
                bio,
                email,
                is_freelancer,
                status,
                role,
                verification_status,
                last_login,
                login_count,
                profile_completion,
                trust_score,
                created_by,
                updated_by,
                suspension_reason,
                suspension_date,
                notes,
                created_at
            `, { count: "exact" });

        // Apply search filter
        if (search) {
            query = query.or(
                `name.ilike.%${search}%,email.ilike.%${search}%,username.ilike.%${search}%`
            );
        }

        // Apply status filter
        if (status) {
            query = query.eq("status", status);
        }

        // Apply role filter
        if (role) {
            query = query.eq("role", role);
        }

        // Apply verification status filter
        if (verification_status) {
            query = query.eq("verification_status", verification_status);
        }

        // Apply freelancer filter
        if (is_freelancer !== undefined) {
            query = query.eq("is_freelancer", is_freelancer);
        }

        // Apply date filters
        if (date_from) {
            query = query.gte("created_at", date_from);
        }
        if (date_to) {
            query = query.lte("created_at", date_to);
        }

        // Add pagination
        const offset = (page - 1) * limit;
        query = query.range(offset, offset + limit - 1);

        // Apply sorting
        query = query.order(sort_by, { ascending: sort_order === 'asc' });

        const { data: users, error, count } = await query;

        if (error) {
            throw new InternalServerError(`Failed to fetch users: ${error.message}`);
        }

        return {
            users: users || [],
            total: count || 0
        };
    }

    async updateUserStatus(statusChange: UserStatusChange, adminId: string): Promise<UserManagementUser> {
        const { user_id, status, reason, notes } = statusChange;

        const updateData: any = {
            status,
            updated_by: adminId
        };

        if (status === 'suspended') {
            updateData.suspension_reason = reason;
            updateData.suspension_date = new Date().toISOString();
        }

        if (notes) {
            updateData.notes = notes;
        }

        const { data, error } = await supabase
            .from("users")
            .update(updateData)
            .eq("id", user_id)
            .select()
            .single();

        if (error) throw new InternalServerError("Error_updating_user_status");
        
        // Log the activity
        await this.logUserActivity(user_id, `Status changed to ${status}`, reason, adminId);
        
        return data;
    }

    async updateUserRole(roleChange: UserRoleChange, adminId: string): Promise<UserManagementUser> {
        const { user_id, role, reason } = roleChange;

        const { data, error } = await supabase
            .from("users")
            .update({
                role,
                updated_by: adminId
            })
            .eq("id", user_id)
            .select()
            .single();

        if (error) throw new InternalServerError("Error_updating_user_role");
        
        // Log the activity
        await this.logUserActivity(user_id, `Role changed to ${role}`, reason, adminId);
        
        return data;
    }

    async updateUserVerification(verification: UserVerification, adminId: string): Promise<UserManagementUser> {
        const { user_id, verification_status, verification_type, notes } = verification;

        const { data, error } = await supabase
            .from("users")
            .update({
                verification_status,
                updated_by: adminId
            })
            .eq("id", user_id)
            .select()
            .single();

        if (error) throw new InternalServerError("Error_updating_user_verification");
        
        // Log the activity
        await this.logUserActivity(user_id, `${verification_type} verification ${verification_status}`, notes, adminId);
        
        return data;
    }

    async bulkUserOperation(operation: BulkUserOperation, adminId: string): Promise<{ success_count: number; failed_count: number; errors: string[] }> {
        const { action, user_ids, reason, new_role } = operation;
        let success_count = 0;
        let failed_count = 0;
        const errors: string[] = [];

        for (const user_id of user_ids) {
            try {
                switch (action) {
                    case 'suspend':
                        await this.updateUserStatus({ user_id, status: 'suspended', reason }, adminId);
                        break;
                    case 'activate':
                        await this.updateUserStatus({ user_id, status: 'active' }, adminId);
                        break;
                    case 'delete':
                        await this.deleteUser(user_id, adminId);
                        break;
                    case 'verify':
                        await this.updateUserVerification({ user_id, verification_status: 'verified', verification_type: 'identity' }, adminId);
                        break;
                    case 'unverify':
                        await this.updateUserVerification({ user_id, verification_status: 'unverified', verification_type: 'identity' }, adminId);
                        break;
                    case 'change_role':
                        if (!new_role) throw new BadRequestError("New role is required for role change");
                        await this.updateUserRole({ user_id, role: new_role as any, reason }, adminId);
                        break;
                }
                success_count++;
            } catch (error: any) {
                failed_count++;
                errors.push(`User ${user_id}: ${error.message}`);
            }
        }

        return { success_count, failed_count, errors };
    }

    async deleteUser(userId: string, adminId: string): Promise<void> {
        // Log the activity before deletion
        await this.logUserActivity(userId, "User deleted", "User account deleted by admin", adminId);

        const { error } = await supabase
            .from("users")
            .delete()
            .eq("id", userId);

        if (error) throw new InternalServerError("Error_deleting_user");
    }

    async getUserAnalytics(): Promise<UserAnalytics> {
        // Get total users
        const { count: total_users } = await supabase
            .from("users")
            .select("*", { count: "exact", head: true });

        // Get active users
        const { count: active_users } = await supabase
            .from("users")
            .select("*", { count: "exact", head: true })
            .eq("status", "active");

        // Get new registrations (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { count: new_registrations } = await supabase
            .from("users")
            .select("*", { count: "exact", head: true })
            .gte("created_at", thirtyDaysAgo.toISOString());

        // Get verified users
        const { count: verified_users } = await supabase
            .from("users")
            .select("*", { count: "exact", head: true })
            .eq("verification_status", "verified");

        // Get freelancers vs clients
        const { count: freelancers } = await supabase
            .from("users")
            .select("*", { count: "exact", head: true })
            .eq("is_freelancer", true);

        const clients = (total_users || 0) - (freelancers || 0);

        return {
            total_users: total_users || 0,
            active_users: active_users || 0,
            new_registrations: new_registrations || 0,
            user_growth: 0, // Calculate based on previous period
            verification_rate: total_users ? ((verified_users || 0) / total_users) * 100 : 0,
            activity_metrics: {
                daily_active_users: 0, // Implement based on login tracking
                weekly_active_users: 0,
                monthly_active_users: 0
            },
            demographics: {
                freelancers: freelancers || 0,
                clients,
                verified_users: verified_users || 0
            }
        };
    }

    async logUserActivity(userId: string, action: string, details?: string, adminId?: string): Promise<void> {
        const { error } = await supabase
            .from("user_activity_logs")
            .insert([{
                user_id: userId,
                action,
                details,
                created_by: adminId
            }]);

        if (error) {
            console.error("Failed to log user activity:", error);
        }
    }

    async getUserActivityLogs(userId: string, limit: number = 50): Promise<UserActivityLog[]> {
        const { data, error } = await supabase
            .from("user_activity_logs")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(limit);

        if (error) throw new InternalServerError("Error_fetching_activity_logs");
        
        return data || [];
    }
}

export const userService = new UserService();