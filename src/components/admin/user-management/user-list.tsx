"use client";

import { useState } from 'react';
import { useUserManagement } from '@/hooks/use-user-management';
import { UserManagementUser, AdminUserFilters } from '@/types/user-management.types';
import { UserFilters } from './components/UserFilters';
import { UserTable } from './components/UserTable';
import { UserCards } from './components/UserCards';
import { BulkActions } from './components/BulkActions';
import { CreateUserModal } from './components/CreateUserModal';
import { UserProfileModal } from './components/UserProfileModal';
import { ExportModal } from './components/ExportModal';
import { ImportModal } from './components/ImportModal';
import { 
  PlusIcon, 
  DownloadIcon, 
  UploadIcon,
  RefreshCwIcon,
  UsersIcon,
  UserCheckIcon,
  UserXIcon,
  AlertTriangleIcon
} from 'lucide-react';

interface UserListProps {
  onUserSelect?: (user: UserManagementUser) => void;
}

export default function UserList({ onUserSelect }: UserListProps) {
  const {
    users,
    loading,
    error,
    pagination,
    filters,
    setFilters,
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
  } = useUserManagement();

  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserManagementUser | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Handle user selection
  const handleUserSelect = (user: UserManagementUser) => {
    setSelectedUser(user);
    setShowProfileModal(true);
    onUserSelect?.(user);
  };

  // Handle user actions
  const handleUserAction = async (action: string, userId: string, data?: any) => {
    try {
      switch (action) {
        case 'view':
          const user = users.find(u => u.id === userId);
          if (user) handleUserSelect(user);
          break;
        case 'edit':
          const editUser = users.find(u => u.id === userId);
          if (editUser) {
            setSelectedUser(editUser);
            setShowProfileModal(true);
          }
          break;
        case 'suspend':
          await suspendUser(userId, data?.reason);
          break;
        case 'activate':
          await activateUser(userId);
          break;
        case 'delete':
          if (confirm('Are you sure you want to delete this user?')) {
            await deleteUser(userId);
          }
          break;
        case 'change_role':
          await changeUserRole(userId, data?.role, data?.reason);
          break;
        case 'verify':
          await verifyUser(userId, data?.status, data?.type, data?.notes);
          break;
        default:
          console.warn('Unknown action:', action);
      }
    } catch (error) {
      console.error('Error performing user action:', error);
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action: string, data?: any) => {
    if (selectedUsers.length === 0) {
      alert('Please select users first');
      return;
    }

    try {
      const operation = {
        action: action as any,
        user_ids: selectedUsers,
        reason: data?.reason,
        new_role: data?.new_role,
      };

      const result = await bulkOperation(operation);
      
      if (result.success_count > 0) {
        alert(`Successfully processed ${result.success_count} users`);
      }
      
      if (result.failed_count > 0) {
        alert(`Failed to process ${result.failed_count} users. Check console for details.`);
        console.error('Bulk operation errors:', result.errors);
      }

      setSelectedUsers([]);
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  // Handle user creation
  const handleCreateUser = async (userData: any) => {
    try {
      await createUser(userData);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  // Handle export
  const handleExport = async (options: any) => {
    try {
      const data = await exportUsers(options);
      
      // Create and download file
      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      setShowExportModal(false);
    } catch (error) {
      console.error('Error exporting users:', error);
    }
  };

  // Handle import
  const handleImport = async (file: File) => {
    try {
      const result = await importUsers(file);
      
      if (result.successful_imports > 0) {
        alert(`Successfully imported ${result.successful_imports} users`);
      }
      
      if (result.failed_imports > 0) {
        alert(`Failed to import ${result.failed_imports} users. Check console for details.`);
        console.error('Import errors:', result.errors);
      }
      
      setShowImportModal(false);
    } catch (error) {
      console.error('Error importing users:', error);
    }
  };

  // Get user statistics
  const getUserStats = () => {
    const total = users.length;
    const active = users.filter(u => u.status === 'active').length;
    const suspended = users.filter(u => u.status === 'suspended').length;
    const verified = users.filter(u => u.verification_status === 'verified').length;
    
    return { total, active, suspended, verified };
  };

  const stats = getUserStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage platform users and their accounts</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add User
          </button>
          
          <button
            onClick={() => setShowExportModal(true)}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <DownloadIcon className="w-4 h-4 mr-2" />
            Export
          </button>
          
          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <UploadIcon className="w-4 h-4 mr-2" />
            Import
          </button>
          
          <button
            onClick={refreshUsers}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCwIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <UsersIcon className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <UserCheckIcon className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <UserXIcon className="w-8 h-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Suspended</p>
              <p className="text-2xl font-bold text-gray-900">{stats.suspended}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <AlertTriangleIcon className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Verified</p>
              <p className="text-2xl font-bold text-gray-900">{stats.verified}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <UserFilters
        filters={filters}
        onFiltersChange={setFilters}
        onExport={() => setShowExportModal(true)}
        onImport={() => setShowImportModal(true)}
      />

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <BulkActions
          selectedCount={selectedUsers.length}
          onBulkAction={handleBulkAction}
          onClearSelection={() => setSelectedUsers([])}
        />
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* View Toggle */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${
              viewMode === 'table' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Table View
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${
              viewMode === 'cards' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Card View
          </button>
        </div>
        
        <p className="text-sm text-gray-600">
          Showing {users.length} of {pagination.total_items} users
        </p>
      </div>

      {/* User List */}
      {viewMode === 'table' ? (
        <UserTable
          users={users}
          loading={loading}
          selectedUsers={selectedUsers}
          onUserSelect={handleUserSelect}
          onUserAction={handleUserAction}
          onSelectionChange={setSelectedUsers}
        />
      ) : (
        <UserCards
          users={users}
          loading={loading}
          selectedUsers={selectedUsers}
          onUserSelect={handleUserSelect}
          onUserAction={handleUserAction}
          onSelectionChange={setSelectedUsers}
        />
      )}

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
            disabled={filters.page === 1}
            className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <span className="px-4 py-2 text-sm text-gray-600">
            Page {pagination.current_page} of {pagination.total_pages}
          </span>
          
          <button
            onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
            disabled={filters.page === pagination.total_pages}
            className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateUserModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateUser}
        />
      )}

      {showProfileModal && selectedUser && (
        <UserProfileModal
          isOpen={showProfileModal}
          onClose={() => {
            setShowProfileModal(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onUpdate={updateUser}
          onUserAction={handleUserAction}
        />
      )}

      {showExportModal && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          onExport={handleExport}
        />
      )}

      {showImportModal && (
        <ImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImport={handleImport}
        />
      )}
    </div>
  );
}
