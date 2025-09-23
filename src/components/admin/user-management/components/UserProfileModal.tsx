"use client";

import { useState } from 'react';
import { UserManagementUser, USER_ROLE_OPTIONS, USER_STATUS_OPTIONS, VERIFICATION_STATUS_OPTIONS } from '@/types/user-management.types';
import { 
  XIcon, 
  UserIcon, 
  MailIcon, 
  CalendarIcon, 
  ShieldIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EditIcon,
  SaveIcon,
  UserCheckIcon,
  UserXIcon,
  TrashIcon
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserManagementUser;
  onUpdate: (id: string, updates: Partial<UserManagementUser>) => void;
  onUserAction: (action: string, userId: string, data?: any) => void;
}

export function UserProfileModal({ isOpen, onClose, user, onUpdate, onUserAction }: UserProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<UserManagementUser>(user);
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'verification' | 'notes'>('overview');

  const handleInputChange = (field: keyof UserManagementUser, value: any) => {
    setEditedUser(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await onUpdate(user.id, editedUser);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">User Profile</h3>
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  <SaveIcon className="h-4 w-4 mr-1" />
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <EditIcon className="h-4 w-4 mr-1" />
                Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Info Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="text-center">
                <div className="mx-auto h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center mb-4">
                  <span className="text-2xl font-medium text-gray-700">
                    {editedUser.name?.charAt(0) || editedUser.username.charAt(0)}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {editedUser.name || editedUser.username}
                </h2>
                <p className="text-gray-600 mb-4">
                  {editedUser.email || editedUser.username}
                </p>
                
                <div className="space-y-2">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-${getStatusColor(editedUser.status)}-100 text-${getStatusColor(editedUser.status)}-800`}>
                    {editedUser.status}
                  </span>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-${getRoleColor(editedUser.role)}-100 text-${getRoleColor(editedUser.role)}-800`}>
                    {editedUser.role}
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-6 space-y-2">
                {editedUser.status === 'active' ? (
                  <button
                    onClick={() => onUserAction('suspend', user.id)}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100"
                  >
                    <UserXIcon className="h-4 w-4 mr-2" />
                    Suspend User
                  </button>
                ) : (
                  <button
                    onClick={() => onUserAction('activate', user.id)}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100"
                  >
                    <UserCheckIcon className="h-4 w-4 mr-2" />
                    Activate User
                  </button>
                )}
                
                <button
                  onClick={() => onUserAction('change_role', user.id)}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-purple-300 text-sm font-medium rounded-md text-purple-700 bg-purple-50 hover:bg-purple-100"
                >
                  <ShieldIcon className="h-4 w-4 mr-2" />
                  Change Role
                </button>
                
                <button
                  onClick={() => onUserAction('delete', user.id)}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Delete User
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'activity', label: 'Activity' },
                  { id: 'verification', label: 'Verification' },
                  { id: 'notes', label: 'Notes' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <UserIcon className="inline h-4 w-4 mr-1" />
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedUser.name || ''}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{editedUser.name || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MailIcon className="inline h-4 w-4 mr-1" />
                      Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editedUser.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{editedUser.email || 'Not provided'}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editedUser.bio || ''}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{editedUser.bio || 'No bio provided'}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trust Score
                    </label>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${editedUser.trust_score}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{editedUser.trust_score}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profile Completion
                    </label>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${editedUser.profile_completion}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{editedUser.profile_completion}%</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Login Count
                    </label>
                    <p className="text-gray-900">{editedUser.login_count}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <CalendarIcon className="inline h-4 w-4 mr-1" />
                      Last Login
                    </label>
                    <p className="text-gray-900">{formatLastLogin(editedUser.last_login)}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <CalendarIcon className="inline h-4 w-4 mr-1" />
                      Created At
                    </label>
                    <p className="text-gray-900">{formatDate(editedUser.created_at)}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'verification' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Status
                  </label>
                  {isEditing ? (
                    <select
                      value={editedUser.verification_status}
                      onChange={(e) => handleInputChange('verification_status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {VERIFICATION_STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex items-center">
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-${getVerificationColor(editedUser.verification_status)}-100 text-${getVerificationColor(editedUser.verification_status)}-800`}>
                        {editedUser.verification_status}
                      </span>
                      {editedUser.verification_status === 'verified' && (
                        <CheckCircleIcon className="ml-2 h-5 w-5 text-green-500" />
                      )}
                      {editedUser.verification_status === 'pending' && (
                        <ClockIcon className="ml-2 h-5 w-5 text-yellow-500" />
                      )}
                      {editedUser.verification_status === 'rejected' && (
                        <XCircleIcon className="ml-2 h-5 w-5 text-red-500" />
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User Type
                  </label>
                  <p className="text-gray-900">
                    {editedUser.is_freelancer ? 'Freelancer' : 'Client'}
                  </p>
                </div>

                {editedUser.suspension_reason && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Suspension Reason
                    </label>
                    <p className="text-gray-900">{editedUser.suspension_reason}</p>
                  </div>
                )}

                {editedUser.suspension_date && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Suspension Date
                    </label>
                    <p className="text-gray-900">{formatDate(editedUser.suspension_date)}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'notes' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notes
                </label>
                {isEditing ? (
                  <textarea
                    value={editedUser.notes || ''}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter admin notes about this user..."
                  />
                ) : (
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {editedUser.notes || 'No notes available'}
                  </p>
                )}
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="text-center py-8">
                <p className="text-gray-500">Activity logs will be displayed here</p>
                <p className="text-sm text-gray-400 mt-2">
                  This feature will show user login history and platform activity
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
