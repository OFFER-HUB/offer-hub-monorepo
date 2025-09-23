import { 
  UserManagementUser, 
  AdminUserFilters, 
  UserAnalytics, 
  BulkUserOperation,
  UserStatusChange,
  UserRoleChange,
  UserVerification,
  AdminCreateUserDTO,
  UserActivityLog,
  UserCommunication,
  UserExportOptions,
  UserImportResult,
  ApiResponse,
  PaginatedResponse
} from '@/types/user-management.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

class UserManagementService {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}/admin/users${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      // Add authentication headers here
      // 'Authorization': `Bearer ${token}`,
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // User CRUD operations
  async getAllUsers(filters: AdminUserFilters): Promise<PaginatedResponse<UserManagementUser[]>> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    const endpoint = queryString ? `?${queryString}` : '';

    return this.request<PaginatedResponse<UserManagementUser[]>>(endpoint);
  }

  async getUserById(id: string): Promise<ApiResponse<UserManagementUser>> {
    return this.request<ApiResponse<UserManagementUser>>(`/${id}`);
  }

  async createUser(userData: AdminCreateUserDTO): Promise<ApiResponse<UserManagementUser>> {
    return this.request<ApiResponse<UserManagementUser>>('', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, updates: Partial<UserManagementUser>): Promise<ApiResponse<UserManagementUser>> {
    return this.request<ApiResponse<UserManagementUser>>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteUser(id: string): Promise<ApiResponse<null>> {
    return this.request<ApiResponse<null>>(`/${id}`, {
      method: 'DELETE',
    });
  }

  // Status management
  async suspendUser(id: string, reason?: string, notes?: string): Promise<ApiResponse<UserManagementUser>> {
    return this.request<ApiResponse<UserManagementUser>>(`/${id}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ reason, notes }),
    });
  }

  async activateUser(id: string): Promise<ApiResponse<UserManagementUser>> {
    return this.request<ApiResponse<UserManagementUser>>(`/${id}/activate`, {
      method: 'POST',
    });
  }

  // Role management
  async changeUserRole(id: string, role: string, reason?: string): Promise<ApiResponse<UserManagementUser>> {
    return this.request<ApiResponse<UserManagementUser>>(`/${id}/role`, {
      method: 'POST',
      body: JSON.stringify({ role, reason }),
    });
  }

  // Verification management
  async verifyUser(
    id: string, 
    verification_status: string, 
    verification_type: string = 'identity', 
    notes?: string
  ): Promise<ApiResponse<UserManagementUser>> {
    return this.request<ApiResponse<UserManagementUser>>(`/${id}/verify`, {
      method: 'POST',
      body: JSON.stringify({ verification_status, verification_type, notes }),
    });
  }

  // Bulk operations
  async bulkOperation(operation: BulkUserOperation): Promise<ApiResponse<{ success_count: number; failed_count: number; errors: string[] }>> {
    return this.request<ApiResponse<{ success_count: number; failed_count: number; errors: string[] }>>('/bulk', {
      method: 'POST',
      body: JSON.stringify(operation),
    });
  }

  // Analytics
  async getUserAnalytics(): Promise<ApiResponse<UserAnalytics>> {
    return this.request<ApiResponse<UserAnalytics>>('/analytics');
  }

  // Activity logs
  async getUserActivityLogs(userId: string, limit: number = 50): Promise<ApiResponse<UserActivityLog[]>> {
    return this.request<ApiResponse<UserActivityLog[]>>(`/${userId}/activity?limit=${limit}`);
  }

  // Communication
  async sendUserMessage(communication: Omit<UserCommunication, 'id' | 'created_at'>): Promise<ApiResponse<UserCommunication>> {
    return this.request<ApiResponse<UserCommunication>>('/messages', {
      method: 'POST',
      body: JSON.stringify(communication),
    });
  }

  async getUserMessages(userId: string, limit: number = 50): Promise<ApiResponse<UserCommunication[]>> {
    return this.request<ApiResponse<UserCommunication[]>>(`/${userId}/messages?limit=${limit}`);
  }

  // Data export/import
  async exportUsers(options: UserExportOptions): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/admin/users/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add authentication headers here
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    return response.text();
  }

  async importUsers(file: File): Promise<UserImportResult> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/admin/users/import`, {
      method: 'POST',
      headers: {
        // Add authentication headers here
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Import failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Search and filtering utilities
  async searchUsers(query: string, filters?: Partial<AdminUserFilters>): Promise<UserManagementUser[]> {
    const searchFilters: AdminUserFilters = {
      search: query,
      ...filters
    };
    
    const result = await this.getAllUsers(searchFilters);
    return result.data;
  }

  // Advanced analytics
  async getUserGrowthAnalytics(days: number = 30): Promise<{ date: string; count: number }[]> {
    return this.request<{ date: string; count: number }[]>(`/analytics/growth?days=${days}`);
  }

  async getUserEngagementMetrics(): Promise<{
    avg_login_frequency: number;
    avg_profile_completion: number;
    avg_trust_score: number;
    most_active_users: UserManagementUser[];
  }> {
    return this.request<{
      avg_login_frequency: number;
      avg_profile_completion: number;
      avg_trust_score: number;
      most_active_users: UserManagementUser[];
    }>('/analytics/engagement');
  }

  // Utility methods
  async downloadUserData(userId: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/download`, {
      headers: {
        // Add authentication headers here
      },
    });

    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }

    return response.blob();
  }

  async getUserStats(): Promise<{
    total_users: number;
    active_users: number;
    suspended_users: number;
    new_users_today: number;
    new_users_this_week: number;
    new_users_this_month: number;
  }> {
    return this.request<{
      total_users: number;
      active_users: number;
      suspended_users: number;
      new_users_today: number;
      new_users_this_week: number;
      new_users_this_month: number;
    }>('/stats');
  }
}

export const userManagementService = new UserManagementService();
