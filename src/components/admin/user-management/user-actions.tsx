"use client";

import { useState } from 'react';
import { UserManagementUser, BULK_ACTION_OPTIONS, USER_ROLE_OPTIONS } from '@/types/user-management.types';
import { 
  MoreHorizontalIcon, 
  UserCheckIcon, 
  UserXIcon, 
  TrashIcon,
  ShieldIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MessageSquareIcon,
  SettingsIcon
} from 'lucide-react';

interface UserActionsProps {
  user: UserManagementUser;
  onUserAction: (action: string, userId: string, data?: any) => void;
}

export default function UserActions({ user, onUserAction }: UserActionsProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [actionData, setActionData] = useState<any>({});

  const handleActionSelect = (action: string) => {
    setSelectedAction(action);
    setShowMenu(false);
    
    // Actions that don't need additional data
    const directActions = ['activate', 'delete'];
    
    if (directActions.includes(action)) {
      if (confirm(`Are you sure you want to ${action} this user?`)) {
        onUserAction(action, user.id);
      }
    } else {
      setShowActionDialog(true);
    }
  };

  const handleActionSubmit = () => {
    onUserAction(selectedAction, user.id, actionData);
    setShowActionDialog(false);
    setActionData({});
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'activate':
        return <UserCheckIcon className="h-4 w-4" />;
      case 'suspend':
        return <UserXIcon className="h-4 w-4" />;
      case 'delete':
        return <TrashIcon className="h-4 w-4" />;
      case 'verify':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'unverify':
        return <XCircleIcon className="h-4 w-4" />;
      case 'change_role':
        return <ShieldIcon className="h-4 w-4" />;
      case 'message':
        return <MessageSquareIcon className="h-4 w-4" />;
      default:
        return <SettingsIcon className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'activate':
      case 'verify':
        return 'text-green-700 bg-green-50 border-green-200 hover:bg-green-100';
      case 'suspend':
      case 'delete':
      case 'unverify':
        return 'text-red-700 bg-red-50 border-red-200 hover:bg-red-100';
      case 'change_role':
        return 'text-purple-700 bg-purple-50 border-purple-200 hover:bg-purple-100';
      case 'message':
        return 'text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200 hover:bg-gray-100';
    }
  };

  const getAvailableActions = () => {
    const actions = [];
    
    // Status-based actions
    if (user.status === 'active') {
      actions.push({ id: 'suspend', label: 'Suspend User' });
    } else {
      actions.push({ id: 'activate', label: 'Activate User' });
    }
    
    // Verification actions
    if (user.verification_status === 'verified') {
      actions.push({ id: 'unverify', label: 'Unverify User' });
    } else {
      actions.push({ id: 'verify', label: 'Verify User' });
    }
    
    // Role actions
    actions.push({ id: 'change_role', label: 'Change Role' });
    
    // Communication
    actions.push({ id: 'message', label: 'Send Message' });
    
    // Destructive actions
    actions.push({ id: 'delete', label: 'Delete User' });
    
    return actions;
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          <MoreHorizontalIcon className="h-4 w-4" />
        </button>
        
        {showMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
            <div className="py-1">
              {getAvailableActions().map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleActionSelect(action.id)}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center ${getActionColor(action.id)}`}
                >
                  {getActionIcon(action.id)}
                  <span className="ml-2">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Dialog */}
      {showActionDialog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedAction === 'suspend' && 'Suspend User'}
                {selectedAction === 'verify' && 'Verify User'}
                {selectedAction === 'unverify' && 'Unverify User'}
                {selectedAction === 'change_role' && 'Change User Role'}
                {selectedAction === 'message' && 'Send Message to User'}
              </h3>
              
              {selectedAction === 'suspend' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Suspension
                    </label>
                    <textarea
                      value={actionData.reason || ''}
                      onChange={(e) => setActionData({ ...actionData, reason: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter reason for suspension..."
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      value={actionData.notes || ''}
                      onChange={(e) => setActionData({ ...actionData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter any additional notes..."
                    />
                  </div>
                </div>
              )}

              {selectedAction === 'verify' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Verification Type
                    </label>
                    <select
                      value={actionData.type || 'identity'}
                      onChange={(e) => setActionData({ ...actionData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="identity">Identity Verification</option>
                      <option value="skill">Skill Verification</option>
                      <option value="trust">Trust Verification</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={actionData.notes || ''}
                      onChange={(e) => setActionData({ ...actionData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter verification notes..."
                    />
                  </div>
                </div>
              )}

              {selectedAction === 'unverify' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Unverification
                    </label>
                    <textarea
                      value={actionData.reason || ''}
                      onChange={(e) => setActionData({ ...actionData, reason: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter reason for unverification..."
                      required
                    />
                  </div>
                </div>
              )}

              {selectedAction === 'change_role' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Role
                    </label>
                    <select
                      value={actionData.role || ''}
                      onChange={(e) => setActionData({ ...actionData, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select a role</option>
                      {USER_ROLE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Role Change
                    </label>
                    <textarea
                      value={actionData.reason || ''}
                      onChange={(e) => setActionData({ ...actionData, reason: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter reason for role change..."
                    />
                  </div>
                </div>
              )}

              {selectedAction === 'message' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={actionData.subject || ''}
                      onChange={(e) => setActionData({ ...actionData, subject: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter message subject..."
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      value={actionData.message || ''}
                      onChange={(e) => setActionData({ ...actionData, message: e.target.value })}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your message..."
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message Type
                    </label>
                    <select
                      value={actionData.type || 'notification'}
                      onChange={(e) => setActionData({ ...actionData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="notification">Notification</option>
                      <option value="email">Email</option>
                      <option value="system">System Message</option>
                    </select>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowActionDialog(false)}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleActionSubmit}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  {selectedAction === 'suspend' && 'Suspend User'}
                  {selectedAction === 'verify' && 'Verify User'}
                  {selectedAction === 'unverify' && 'Unverify User'}
                  {selectedAction === 'change_role' && 'Change Role'}
                  {selectedAction === 'message' && 'Send Message'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
