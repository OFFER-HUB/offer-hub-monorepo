"use client";

import { useState } from 'react';
import { UserManagementUser, USER_STATUS_OPTIONS, USER_ROLE_OPTIONS, VERIFICATION_STATUS_OPTIONS } from '@/types/user-management.types';
import { 
  MoreHorizontalIcon, 
  EyeIcon, 
  EditIcon, 
  UserCheckIcon, 
  UserXIcon, 
  TrashIcon,
  ShieldIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from 'lucide-react';

interface UserTableProps {
  users: UserManagementUser[];
  loading?: boolean;
  selectedUsers?: string[];
  onUserSelect?: (user: UserManagementUser) => void;
  onUserAction?: (action: string, userId: string, data?: any) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
}

export function UserTable({ 
  users, 
  loading = false, 
  selectedUsers = [], 
  onUserSelect, 
  onUserAction, 
  onSelectionChange 
}: UserTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange?.(users.map(user => user.id));
    } else {
      onSelectionChange?.([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange?.([...selectedUsers, userId]);
    } else {
      onSelectionChange?.(selectedUsers.filter(id => id !== userId));
    }
  };

  const toggleRowExpansion = (userId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedRows(newExpanded);
  };

  const getStatusColor = (status: string) => {
    const option = USER_STATUS_OPTIONS.find(opt => opt.value === status);
    return option?.color || 'gray';
  };

  const getRoleColor = (role: string) => {
    const option = USER_ROLE_OPTIONS.find(opt => opt.value === role);
    return option?.color || 'gray';
  };

  const getVerificationColor = (status: string) => {
    const option = VERIFICATION_STATUS_OPTIONS.find(opt => opt.value === status);
    return option?.color || 'gray';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const formatLastLogin = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === users.length && users.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Verification
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Login
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trust Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {user.name?.charAt(0) || user.username.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name || user.username}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.email || user.username}
                      </div>
                      <div className="text-xs text-gray-400">
                        {user.is_freelancer ? 'Freelancer' : 'Client'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-${getStatusColor(user.status)}-100 text-${getStatusColor(user.status)}-800`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-${getRoleColor(user.role)}-100 text-${getRoleColor(user.role)}-800`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-${getVerificationColor(user.verification_status)}-100 text-${getVerificationColor(user.verification_status)}-800`}>
                      {user.verification_status}
                    </span>
                    {user.verification_status === 'verified' && (
                      <CheckCircleIcon className="ml-1 h-4 w-4 text-green-500" />
                    )}
                    {user.verification_status === 'pending' && (
                      <ClockIcon className="ml-1 h-4 w-4 text-yellow-500" />
                    )}
                    {user.verification_status === 'rejected' && (
                      <XCircleIcon className="ml-1 h-4 w-4 text-red-500" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {formatLastLogin(user.last_login)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${user.trust_score}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm text-gray-600">{user.trust_score}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onUserSelect?.(user)}
                      className="text-gray-400 hover:text-blue-600"
                      title="View Details"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onUserAction?.('edit', user.id)}
                      className="text-gray-400 hover:text-green-600"
                      title="Edit User"
                    >
                      <EditIcon className="h-4 w-4" />
                    </button>
                    {user.status === 'active' ? (
                      <button
                        onClick={() => onUserAction?.('suspend', user.id)}
                        className="text-gray-400 hover:text-red-600"
                        title="Suspend User"
                      >
                        <UserXIcon className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onUserAction?.('activate', user.id)}
                        className="text-gray-400 hover:text-green-600"
                        title="Activate User"
                      >
                        <UserCheckIcon className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onUserAction?.('change_role', user.id)}
                      className="text-gray-400 hover:text-purple-600"
                      title="Change Role"
                    >
                      <ShieldIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onUserAction?.('delete', user.id)}
                      className="text-gray-400 hover:text-red-600"
                      title="Delete User"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
}
