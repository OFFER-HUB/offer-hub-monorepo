import { useState, useCallback } from 'react';
import {
  AdminUser,
  AdminUsersResponse,
  AdminUserResponse,
  UserFilters,
  UpdateUserRequest,
  mapBackendUserToAdmin,
  ApiResult,
  isApiError,
  ApiError
} from '@/types/admin.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const useAdminUsersApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthToken = useCallback((): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('adminToken');
  }, []);

  const setAuthToken = useCallback((token: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('adminToken', token);
  }, []);

  const apiRequest = async <T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResult<T>> => {
    try {
      const authToken = getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (options.headers) {
        if (options.headers instanceof Headers) {
          options.headers.forEach((value, key) => {
            headers[key] = value;
          });
        } else if (Array.isArray(options.headers)) {
          options.headers.forEach(([key, value]) => {
            headers[key] = value;
          });
        } else {
          Object.assign(headers, options.headers);
        }
      }

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch(`${API_BASE_URL}${url}`, {
        headers,
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || `HTTP error! status: ${response.status}`,
          status: response.status,
        } as ApiError;
      }

      return data;
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Network error occurred',
      } as ApiError;
    }
  };

  const fetchUsers = useCallback(async (filters: UserFilters = {}): Promise<AdminUsersResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.is_freelancer !== undefined) {
        queryParams.append('is_freelancer', filters.is_freelancer.toString());
      }

      const url = `/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const result = await apiRequest<AdminUsersResponse>(url);

      if (isApiError(result)) {
        setError(result.message);
        return null;
      }

      const mappedData = {
        ...result,
        data: result.data.map(mapBackendUserToAdmin),
      };

      return mappedData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch a single user by ID
  const fetchUserById = useCallback(async (userId: string): Promise<AdminUser | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiRequest<AdminUserResponse>(`/users/${userId}`);

      if (isApiError(result)) {
        setError(result.message);
        return null;
      }

      return mapBackendUserToAdmin(result.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a user
  const updateUser = useCallback(async (
    userId: string,
    updates: UpdateUserRequest
  ): Promise<AdminUser | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiRequest<AdminUserResponse>(`/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });

      if (isApiError(result)) {
        setError(result.message);
        return null;
      }

      return mapBackendUserToAdmin(result.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const searchUsers = useCallback(async (
    searchTerm: string,
    filters: Omit<UserFilters, 'search'> = {}
  ): Promise<AdminUsersResponse | null> => {
    return fetchUsers({ ...filters, search: searchTerm });
  }, [fetchUsers]);

  const filterUsersByRole = useCallback(async (
    isFreelancer: boolean,
    filters: Omit<UserFilters, 'is_freelancer'> = {}
  ): Promise<AdminUsersResponse | null> => {
    return fetchUsers({ ...filters, is_freelancer: isFreelancer });
  }, [fetchUsers]);

  const createAdminUser = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet_address: '0xadmin123456789abcdef123456789abcdef123456',
          username: 'admin_user',
          name: 'Admin User',
          email: 'admin@offerhub.com',
          is_freelancer: false,
        }),
      });

      const registerData = await registerResponse.json();

      if (!registerResponse.ok) {
        setError(registerData.message || 'Failed to create admin user');
        return false;
      }

      if (registerData.tokens?.accessToken) {
        setAuthToken(registerData.tokens.accessToken);
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create admin user';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [setAuthToken]);

  return {
    loading,
    error,
    fetchUsers,
    fetchUserById,
    updateUser,
    searchUsers,
    filterUsersByRole,
    createAdminUser,
    clearError: () => setError(null),
    setAuthToken,
    getAuthToken,
  };
};
