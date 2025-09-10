export interface AdminUser {
  id: string;
  wallet_address: string;
  username: string;
  name?: string;
  bio?: string;
  email?: string;
  is_freelancer?: boolean;
  created_at?: string;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  is_freelancer?: boolean;
}

export interface PaginationInfo {
  current_page: number;
  total_pages: number;
  total_users: number;
  per_page: number;
}

export interface AdminUsersResponse {
  success: boolean;
  message: string;
  data: AdminUser[];
  pagination: PaginationInfo;
}

export interface AdminUserResponse {
  success: boolean;
  message: string;
  data: AdminUser;
}

export interface UpdateUserRequest {
  name?: string;
  bio?: string;
  email?: string;
  username?: string;
}

export interface BackendUser {
  id: string;
  wallet_address: string;
  username: string;
  name?: string;
  bio?: string;
  email?: string;
  is_freelancer?: boolean;
  created_at?: string;
}

export const mapBackendUserToAdmin = (backendUser: BackendUser): AdminUser => ({
  id: backendUser.id,
  wallet_address: backendUser.wallet_address,
  username: backendUser.username,
  name: backendUser.name,
  bio: backendUser.bio,
  email: backendUser.email,
  is_freelancer: backendUser.is_freelancer,
  created_at: backendUser.created_at,
});

export const getUserRole = (user: AdminUser): string => {
  if (user.is_freelancer === true) return "Freelancer";
  if (user.is_freelancer === false) return "Client";
  return "Unknown";
};

export const formatUserForDisplay = (user: AdminUser) => ({
  ...user,
  role: getUserRole(user),
  displayName: user.name || user.username,
  joinDate: user.created_at
    ? new Date(user.created_at).toLocaleDateString()
    : "Unknown",
});

// Error handling types
export interface ApiError {
  success: false;
  message: string;
  status?: number;
}

export type ApiResult<T> = T | ApiError;

export const isApiError = (result: unknown): result is ApiError => {
  return (
    typeof result === "object" &&
    result !== null &&
    "success" in result &&
    result.success === false
  );
};
