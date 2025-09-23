import { supabase } from "@/lib/supabase/supabase";
import { BadRequestError, InternalServerError, NotFoundError } from "@/utils/AppError";
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
    UserCommunication,
    UserExportOptions,
    UserImportResult
} from "@/types/user-management.types";
import { userService } from "./user.service";

class UserManagementService {
    // User CRUD operations
    async createUser(data: AdminCreateUserDTO, adminId: string): Promise<UserManagementUser> {
        return await userService.createUserAsAdmin(data, adminId);
    }

    async getAllUsers(filters: AdminUserFilters): Promise<{ users: UserManagementUser[]; total: number }> {
        return await userService.getAllUsersForAdmin(filters);
    }

    async getUserById(id: string): Promise<UserManagementUser> {
        const { data, error } = await supabase
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
            `)
            .eq("id", id)
            .single();

        if (error) throw new NotFoundError("User not found");
        return data;
    }

    async updateUser(id: string, updates: Partial<UserManagementUser>, adminId: string): Promise<UserManagementUser> {
        const updateData: Record<string, unknown> = {
            ...updates,
            updated_by: adminId
        };

        const { data, error } = await supabase
            .from("users")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

        if (error) throw new InternalServerError("Error_updating_user");
        
        // Log the activity
        await userService.logUserActivity(id, "User profile updated", JSON.stringify(updates), adminId);
        
        return data;
    }

    async deleteUser(id: string, adminId: string): Promise<void> {
        await userService.deleteUser(id, adminId);
    }

    // Status management
    async suspendUser(statusChange: UserStatusChange, adminId: string): Promise<UserManagementUser> {
        return await userService.updateUserStatus(statusChange, adminId);
    }

    async activateUser(userId: string, adminId: string): Promise<UserManagementUser> {
        return await userService.updateUserStatus({ user_id: userId, status: 'active' }, adminId);
    }

    // Role management
    async changeUserRole(roleChange: UserRoleChange, adminId: string): Promise<UserManagementUser> {
        return await userService.updateUserRole(roleChange, adminId);
    }

    // Verification management
    async verifyUser(verification: UserVerification, adminId: string): Promise<UserManagementUser> {
        return await userService.updateUserVerification(verification, adminId);
    }

    // Bulk operations
    async bulkOperation(operation: BulkUserOperation, adminId: string): Promise<{ success_count: number; failed_count: number; errors: string[] }> {
        return await userService.bulkUserOperation(operation, adminId);
    }

    // Analytics
    async getUserAnalytics(): Promise<UserAnalytics> {
        return await userService.getUserAnalytics();
    }

    // Activity tracking
    async getUserActivityLogs(userId: string, limit: number = 50): Promise<UserActivityLog[]> {
        return await userService.getUserActivityLogs(userId, limit);
    }

    // Communication
    async sendUserMessage(communication: Omit<UserCommunication, 'id' | 'created_at'>): Promise<UserCommunication> {
        const { data, error } = await supabase
            .from("user_communications")
            .insert([{
                ...communication,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) throw new InternalServerError("Error_sending_message");
        
        return data;
    }

    async getUserMessages(userId: string, limit: number = 50): Promise<UserCommunication[]> {
        const { data, error } = await supabase
            .from("user_communications")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(limit);

        if (error) throw new InternalServerError("Error_fetching_messages");
        
        return data || [];
    }

    // Data export/import
    async exportUsers(options: UserExportOptions): Promise<string> {
        const { format, fields, filters } = options;
        
        // Get users based on filters
        const result = await this.getAllUsers(filters || {});
        const users = result.users;

        if (format === 'json') {
            return JSON.stringify(users, null, 2);
        } else if (format === 'csv') {
            return this.convertToCSV(users, fields);
        } else if (format === 'xlsx') {
            // For XLSX, we'd need a library like xlsx
            // For now, return CSV format
            return this.convertToCSV(users, fields);
        }

        throw new BadRequestError("Unsupported export format");
    }

    private convertToCSV(users: UserManagementUser[], fields: string[]): string {
        if (users.length === 0) return '';

        const headers = fields.join(',');
        const rows = users.map(user => 
            fields.map(field => {
                const value = (user as unknown as Record<string, unknown>)[field];
                // Escape CSV values
                if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value || '';
            }).join(',')
        );

        return [headers, ...rows].join('\n');
    }

    async importUsers(csvData: string, adminId: string): Promise<UserImportResult> {
        const lines = csvData.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
            throw new BadRequestError("CSV must have at least a header row and one data row");
        }

        const headers = lines[0].split(',').map(h => h.trim());
        const dataRows = lines.slice(1);
        
        let successful_imports = 0;
        let failed_imports = 0;
        const errors: string[] = [];

        for (let i = 0; i < dataRows.length; i++) {
            try {
                const values = dataRows[i].split(',').map(v => v.trim());
                const userData: Record<string, string> = {};

                headers.forEach((header, index) => {
                    userData[header] = values[index] || '';
                });

                // Validate required fields
                if (!userData.wallet_address || !userData.username) {
                    throw new Error("Missing required fields: wallet_address and username");
                }

                await this.createUser(userData as unknown as AdminCreateUserDTO, adminId);
                successful_imports++;
            } catch (error: unknown) {
                failed_imports++;
                errors.push(`Row ${i + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }

        return {
            total_rows: dataRows.length,
            successful_imports,
            failed_imports,
            errors
        };
    }

    // Search and filtering utilities
    async searchUsers(query: string, filters?: Partial<AdminUserFilters>): Promise<UserManagementUser[]> {
        const searchFilters: AdminUserFilters = {
            search: query,
            ...filters
        };
        
        const result = await this.getAllUsers(searchFilters);
        return result.users;
    }

    // Advanced analytics
    async getUserGrowthAnalytics(days: number = 30): Promise<{ date: string; count: number }[]> {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { data, error } = await supabase
            .from("users")
            .select("created_at")
            .gte("created_at", startDate.toISOString())
            .lte("created_at", endDate.toISOString())
            .order("created_at", { ascending: true });

        if (error) throw new InternalServerError("Error_fetching_growth_analytics");

        // Group by date
        const dailyCounts: { [key: string]: number } = {};
        data?.forEach(user => {
            const date = new Date(user.created_at).toISOString().split('T')[0];
            dailyCounts[date] = (dailyCounts[date] || 0) + 1;
        });

        return Object.entries(dailyCounts).map(([date, count]) => ({ date, count }));
    }

    async getUserEngagementMetrics(): Promise<{
        avg_login_frequency: number;
        avg_profile_completion: number;
        avg_trust_score: number;
        most_active_users: UserManagementUser[];
    }> {
        const { data: users, error } = await supabase
            .from("users")
            .select("login_count, profile_completion, trust_score, name, email")
            .eq("status", "active");

        if (error) throw new InternalServerError("Error_fetching_engagement_metrics");

        const totalUsers = users?.length || 0;
        const avg_login_frequency = totalUsers > 0 
            ? users!.reduce((sum, user) => sum + (user.login_count || 0), 0) / totalUsers 
            : 0;
        
        const avg_profile_completion = totalUsers > 0 
            ? users!.reduce((sum, user) => sum + (user.profile_completion || 0), 0) / totalUsers 
            : 0;
        
        const avg_trust_score = totalUsers > 0 
            ? users!.reduce((sum, user) => sum + (user.trust_score || 0), 0) / totalUsers 
            : 0;

        // Get most active users (top 10 by login count)
        const most_active_users = users
            ?.sort((a, b) => (b.login_count || 0) - (a.login_count || 0))
            .slice(0, 10) || [];

        return {
            avg_login_frequency,
            avg_profile_completion,
            avg_trust_score,
            most_active_users: most_active_users as UserManagementUser[]
        };
    }
}

export const userManagementService = new UserManagementService();
