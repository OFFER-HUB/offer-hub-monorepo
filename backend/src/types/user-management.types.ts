import { User } from "./user.types";

// Enhanced user interface for admin management
export interface UserManagementUser extends User {
  // Extended fields for admin management
  status: 'active' | 'suspended' | 'pending' | 'banned';
  role: 'admin' | 'moderator' | 'user' | 'freelancer' | 'client';
  verification_status: 'verified' | 'pending' | 'rejected' | 'unverified';
  last_login?: string;
  login_count: number;
  profile_completion: number;
  trust_score: number;
  created_by?: string;
  updated_by?: string;
  suspension_reason?: string;
  suspension_date?: string;
  notes?: string;
}

// User analytics interface
export interface UserAnalytics {
  total_users: number;
  active_users: number;
  new_registrations: number;
  user_growth: number;
  verification_rate: number;
  activity_metrics: {
    daily_active_users: number;
    weekly_active_users: number;
    monthly_active_users: number;
  };
  demographics: {
    freelancers: number;
    clients: number;
    verified_users: number;
  };
}

// Enhanced user filters for admin management
export interface AdminUserFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'suspended' | 'pending' | 'banned';
  role?: 'admin' | 'moderator' | 'user' | 'freelancer' | 'client';
  verification_status?: 'verified' | 'pending' | 'rejected' | 'unverified';
  is_freelancer?: boolean;
  date_from?: string;
  date_to?: string;
  sort_by?: 'created_at' | 'last_login' | 'name' | 'email' | 'trust_score';
  sort_order?: 'asc' | 'desc';
}

// Bulk operation types
export interface BulkUserOperation {
  action: 'suspend' | 'activate' | 'delete' | 'verify' | 'unverify' | 'change_role';
  user_ids: string[];
  reason?: string;
  new_role?: string;
}

// User status change request
export interface UserStatusChange {
  user_id: string;
  status: 'active' | 'suspended' | 'pending' | 'banned';
  reason?: string;
  notes?: string;
}

// User role change request
export interface UserRoleChange {
  user_id: string;
  role: 'admin' | 'moderator' | 'user' | 'freelancer' | 'client';
  reason?: string;
}

// User verification request
export interface UserVerification {
  user_id: string;
  verification_status: 'verified' | 'pending' | 'rejected' | 'unverified';
  verification_type: 'identity' | 'skill' | 'trust';
  notes?: string;
}

// Admin user creation (extended from CreateUserDTO)
export interface AdminCreateUserDTO {
  wallet_address: string;
  username: string;
  name?: string;
  bio?: string;
  email?: string;
  is_freelancer?: boolean;
  role?: 'admin' | 'moderator' | 'user' | 'freelancer' | 'client';
  status?: 'active' | 'suspended' | 'pending' | 'banned';
  verification_status?: 'verified' | 'pending' | 'rejected' | 'unverified';
  notes?: string;
}

// User activity log
export interface UserActivityLog {
  id: string;
  user_id: string;
  action: string;
  details?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  created_by?: string;
}

// User communication
export interface UserCommunication {
  id: string;
  user_id: string;
  admin_id: string;
  subject: string;
  message: string;
  type: 'email' | 'notification' | 'system';
  status: 'sent' | 'delivered' | 'failed' | 'pending';
  created_at: string;
}

// Export/Import types
export interface UserExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  fields: string[];
  filters?: AdminUserFilters;
}

export interface UserImportResult {
  total_rows: number;
  successful_imports: number;
  failed_imports: number;
  errors: string[];
}
