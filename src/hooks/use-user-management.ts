import { useState, useEffect, useCallback } from 'react';
import { userManagementService } from '@/services/user-management.service';
import { 
  UserManagementUser, 
  AdminUserFilters, 
  UserAnalytics, 
  BulkUserOperation,
  AdminCreateUserDTO,
  UserExportOptions,
  UserImportResult,
  UseUserManagementReturn
} from '@/types/user-management.types';

export const useUserManagement = (initialFilters?: AdminUserFilters): UseUserManagementReturn => {
  const [users, setUsers] = useState<UserManagementUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    per_page: 20,
  });
  const [filters, setFilters] = useState<AdminUserFilters>({
    page: 1,
    limit: 20,
    sort_by: 'created_at',
    sort_order: 'desc',
    ...initialFilters,
  });

  // Load users based on current filters
  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await userManagementService.getAllUsers(filters);
      setUsers(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Refresh users
  const refreshUsers = useCallback(async () => {
    await loadUsers();
  }, [loadUsers]);

  // Update filters and reload
  const updateFilters = useCallback((newFilters: AdminUserFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Create user
  const createUser = useCallback(async (userData: AdminCreateUserDTO) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await userManagementService.createUser(userData);
      // Add the new user to the list
      setUsers(prev => [response.data, ...prev]);
      setPagination(prev => ({
        ...prev,
        total_items: prev.total_items + 1,
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update user
  const updateUser = useCallback(async (id: string, updates: Partial<UserManagementUser>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await userManagementService.updateUser(id, updates);
      // Update the user in the list
      setUsers(prev => prev.map(user => 
        user.id === id ? response.data : user
      ));
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete user
  const deleteUser = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await userManagementService.deleteUser(id);
      // Remove the user from the list
      setUsers(prev => prev.filter(user => user.id !== id));
      setPagination(prev => ({
        ...prev,
        total_items: prev.total_items - 1,
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Suspend user
  const suspendUser = useCallback(async (id: string, reason?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await userManagementService.suspendUser(id, reason);
      // Update the user in the list
      setUsers(prev => prev.map(user => 
        user.id === id ? response.data : user
      ));
    } catch (err: any) {
      setError(err.message || 'Failed to suspend user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Activate user
  const activateUser = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await userManagementService.activateUser(id);
      // Update the user in the list
      setUsers(prev => prev.map(user => 
        user.id === id ? response.data : user
      ));
    } catch (err: any) {
      setError(err.message || 'Failed to activate user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Change user role
  const changeUserRole = useCallback(async (id: string, role: string, reason?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await userManagementService.changeUserRole(id, role, reason);
      // Update the user in the list
      setUsers(prev => prev.map(user => 
        user.id === id ? response.data : user
      ));
    } catch (err: any) {
      setError(err.message || 'Failed to change user role');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Verify user
  const verifyUser = useCallback(async (id: string, status: string, type: string, notes?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await userManagementService.verifyUser(id, status, type, notes);
      // Update the user in the list
      setUsers(prev => prev.map(user => 
        user.id === id ? response.data : user
      ));
    } catch (err: any) {
      setError(err.message || 'Failed to verify user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Bulk operation
  const bulkOperation = useCallback(async (operation: BulkUserOperation) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await userManagementService.bulkOperation(operation);
      
      // Refresh the user list to reflect changes
      await loadUsers();
      
      return result.data;
    } catch (err: any) {
      setError(err.message || 'Failed to perform bulk operation');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadUsers]);

  // Export users
  const exportUsers = useCallback(async (options: UserExportOptions): Promise<string> => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await userManagementService.exportUsers(options);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to export users');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Import users
  const importUsers = useCallback(async (file: File): Promise<UserImportResult> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await userManagementService.importUsers(file);
      
      // Refresh the user list to show imported users
      await loadUsers();
      
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to import users');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadUsers]);

  // Load users when filters change
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return {
    users,
    loading,
    error,
    pagination,
    filters,
    setFilters: updateFilters,
    refreshUsers,
    createUser,
    updateUser,
    deleteUser,
    suspendUser,
    activateUser,
    changeUserRole,
    verifyUser,
    bulkOperation,
    exportUsers,
    importUsers,
  };
};

// Hook for user analytics
export const useUserAnalytics = () => {
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await userManagementService.getUserAnalytics();
      setAnalytics(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics');
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  return {
    analytics,
    loading,
    error,
    refreshAnalytics: loadAnalytics,
  };
};

// Hook for user activity logs
export const useUserActivityLogs = (userId: string) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLogs = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await userManagementService.getUserActivityLogs(userId);
      setLogs(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load activity logs');
      console.error('Error loading activity logs:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  return {
    logs,
    loading,
    error,
    refreshLogs: loadLogs,
  };
};
