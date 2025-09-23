"use client";

import { UserManagementUser, USER_STATUS_OPTIONS, USER_ROLE_OPTIONS, VERIFICATION_STATUS_OPTIONS } from '@/types/user-management.types';
import { 
  EyeIcon, 
  EditIcon, 
  UserCheckIcon, 
  UserXIcon, 
  TrashIcon,
  ShieldIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MailIcon,
  CalendarIcon
} from 'lucide-react';

interface UserCardsProps {
  users: UserManagementUser[];
  loading?: boolean;
  selectedUsers?: string[];
  onUserSelect?: (user: UserManagementUser) => void;
  onUserAction?: (action: string, userId: string, data?: any) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
}

export function UserCards({ 
  users, 
  loading = false, 
  selectedUsers = [], 
  onUserSelect, 
  onUserAction, 
  onSelectionChange 
}: UserCardsProps) {
  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange?.([...selectedUsers, userId]);
    } else {
      onSelectionChange?.(selectedUsers.filter(id => id !== userId));
    }
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="rounded-full bg-gray-300 h-12 w-12"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {users.map((user) => (
        <div 
          key={user.id} 
          className={`bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow ${
            selectedUsers.includes(user.id) ? 'ring-2 ring-blue-500' : ''
          }`}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={selectedUsers.includes(user.id)}
                onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-shrink-0 h-12 w-12">
                <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-lg font-medium text-gray-700">
                    {user.name?.charAt(0) || user.username.charAt(0)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-1">
              <button
                onClick={() => onUserSelect?.(user)}
                className="p-1 text-gray-400 hover:text-blue-600"
                title="View Details"
              >
                <EyeIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => onUserAction?.('edit', user.id)}
                className="p-1 text-gray-400 hover:text-green-600"
                title="Edit User"
              >
                <EditIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* User Info */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {user.name || user.username}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              {user.email || user.username}
            </p>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-${getStatusColor(user.status)}-100 text-${getStatusColor(user.status)}-800`}>
                {user.status}
              </span>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-${getRoleColor(user.role)}-100 text-${getRoleColor(user.role)}-800`}>
                {user.role}
              </span>
            </div>
          </div>

          {/* Verification Status */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Verification</span>
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
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500">Trust Score</p>
              <div className="flex items-center">
                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${user.trust_score}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{user.trust_score}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500">Profile</p>
              <div className="flex items-center">
                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${user.profile_completion}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{user.profile_completion}%</span>
              </div>
            </div>
          </div>

          {/* Last Activity */}
          <div className="mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <CalendarIcon className="h-4 w-4 mr-2" />
              <span>Last login: {formatLastLogin(user.last_login)}</span>
            </div>
            {user.email && (
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <MailIcon className="h-4 w-4 mr-2" />
                <span>{user.email}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {user.status === 'active' ? (
              <button
                onClick={() => onUserAction?.('suspend', user.id)}
                className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100"
              >
                <UserXIcon className="h-4 w-4 mr-1" />
                Suspend
              </button>
            ) : (
              <button
                onClick={() => onUserAction?.('activate', user.id)}
                className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100"
              >
                <UserCheckIcon className="h-4 w-4 mr-1" />
                Activate
              </button>
            )}
            
            <button
              onClick={() => onUserAction?.('change_role', user.id)}
              className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-purple-300 text-sm font-medium rounded-md text-purple-700 bg-purple-50 hover:bg-purple-100"
            >
              <ShieldIcon className="h-4 w-4 mr-1" />
              Role
            </button>
            
            <button
              onClick={() => onUserAction?.('delete', user.id)}
              className="px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}

      {users.length === 0 && (
        <div className="col-span-full text-center py-12">
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
