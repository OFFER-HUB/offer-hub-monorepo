// Enhanced user interface for admin management
export interface UserManagementUser {
  id: string;
  wallet_address: string;
  username: string;
  name?: string;
  bio?: string;
  email?: string;
  is_freelancer?: boolean;
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
  created_at?: string;
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

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    per_page: number;
  };
}

// Component props types
export interface UserListProps {
  users: UserManagementUser[];
  loading?: boolean;
  onUserSelect?: (user: UserManagementUser) => void;
  onBulkAction?: (action: string, userIds: string[]) => void;
  onUserAction?: (action: string, userId: string) => void;
}

export interface UserProfileProps {
  user: UserManagementUser;
  onUpdate?: (user: UserManagementUser) => void;
  onStatusChange?: (status: string, reason?: string) => void;
  onRoleChange?: (role: string, reason?: string) => void;
  onVerificationChange?: (status: string, type: string, notes?: string) => void;
}

export interface UserAnalyticsProps {
  analytics: UserAnalytics;
  loading?: boolean;
  onExport?: (format: string) => void;
}

export interface UserFiltersProps {
  filters: AdminUserFilters;
  onFiltersChange: (filters: AdminUserFilters) => void;
  onExport?: () => void;
  onImport?: (file: File) => void;
}

// Hook return types
export interface UseUserManagementReturn {
  users: UserManagementUser[];
  loading: boolean;
  error: string | null;
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    per_page: number;
  };
  filters: AdminUserFilters;
  setFilters: (filters: AdminUserFilters) => void;
  refreshUsers: () => Promise<void>;
  createUser: (userData: AdminCreateUserDTO) => Promise<void>;
  updateUser: (id: string, updates: Partial<UserManagementUser>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  suspendUser: (id: string, reason?: string) => Promise<void>;
  activateUser: (id: string) => Promise<void>;
  changeUserRole: (id: string, role: string, reason?: string) => Promise<void>;
  verifyUser: (id: string, status: string, type: string, notes?: string) => Promise<void>;
  bulkOperation: (operation: BulkUserOperation) => Promise<{ success_count: number; failed_count: number; errors: string[] }>;
  exportUsers: (options: UserExportOptions) => Promise<string>;
  importUsers: (file: File) => Promise<UserImportResult>;
}

// Status and role options
export const USER_STATUS_OPTIONS = [
  { value: 'active', label: 'Active', color: 'green' },
  { value: 'suspended', label: 'Suspended', color: 'red' },
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'banned', label: 'Banned', color: 'red' },
] as const;

export const USER_ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin', color: 'purple' },
  { value: 'moderator', label: 'Moderator', color: 'blue' },
  { value: 'user', label: 'User', color: 'gray' },
  { value: 'freelancer', label: 'Freelancer', color: 'green' },
  { value: 'client', label: 'Client', color: 'blue' },
] as const;

export const VERIFICATION_STATUS_OPTIONS = [
  { value: 'verified', label: 'Verified', color: 'green' },
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'rejected', label: 'Rejected', color: 'red' },
  { value: 'unverified', label: 'Unverified', color: 'gray' },
] as const;

export const BULK_ACTION_OPTIONS = [
  { value: 'suspend', label: 'Suspend Users', color: 'red' },
  { value: 'activate', label: 'Activate Users', color: 'green' },
  { value: 'delete', label: 'Delete Users', color: 'red' },
  { value: 'verify', label: 'Verify Users', color: 'green' },
  { value: 'unverify', label: 'Unverify Users', color: 'yellow' },
  { value: 'change_role', label: 'Change Role', color: 'blue' },
] as const;
