"use client";

import { useState } from 'react';
import { BULK_ACTION_OPTIONS, USER_ROLE_OPTIONS } from '@/types/user-management.types';
import { 
  XIcon, 
  UserCheckIcon, 
  UserXIcon, 
  TrashIcon, 
  ShieldIcon,
  CheckCircleIcon,
  XCircleIcon
} from 'lucide-react';

interface BulkActionsProps {
  selectedCount: number;
  onBulkAction: (action: string, data?: any) => void;
  onClearSelection: () => void;
}

export function BulkActions({ selectedCount, onBulkAction, onClearSelection }: BulkActionsProps) {
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [roleData, setRoleData] = useState({ role: '', reason: '' });
  const [suspendData, setSuspendData] = useState({ reason: '' });

  const handleActionSelect = (action: string) => {
    setSelectedAction(action);
    setShowActionMenu(false);

    switch (action) {
      case 'change_role':
        setShowRoleDialog(true);
        break;
      case 'suspend':
        setShowSuspendDialog(true);
        break;
      case 'activate':
      case 'delete':
      case 'verify':
      case 'unverify':
        if (confirm(`Are you sure you want to ${action} ${selectedCount} users?`)) {
          onBulkAction(action);
        }
        break;
    }
  };

  const handleRoleSubmit = () => {
    if (!roleData.role) {
      alert('Please select a role');
      return;
    }
    onBulkAction('change_role', roleData);
    setShowRoleDialog(false);
    setRoleData({ role: '', reason: '' });
  };

  const handleSuspendSubmit = () => {
    onBulkAction('suspend', suspendData);
    setShowSuspendDialog(false);
    setSuspendData({ reason: '' });
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
      default:
        return null;
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
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200 hover:bg-gray-100';
    }
  };

  return (
    <>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">{selectedCount}</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-900">
                {selectedCount} user{selectedCount !== 1 ? 's' : ''} selected
              </p>
              <p className="text-sm text-blue-700">
                Choose an action to perform on selected users
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <button
                onClick={() => setShowActionMenu(!showActionMenu)}
                className="inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100"
              >
                Bulk Actions
                <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showActionMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                  <div className="py-1">
                    {BULK_ACTION_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleActionSelect(option.value)}
                        className={`w-full text-left px-4 py-2 text-sm flex items-center ${getActionColor(option.value)}`}
                      >
                        {getActionIcon(option.value)}
                        <span className="ml-2">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={onClearSelection}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Role Change Dialog */}
      {showRoleDialog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Change Role for {selectedCount} Users
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Role
                </label>
                <select
                  value={roleData.role}
                  onChange={(e) => setRoleData({ ...roleData, role: e.target.value })}
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
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason (Optional)
                </label>
                <textarea
                  value={roleData.reason}
                  onChange={(e) => setRoleData({ ...roleData, reason: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter reason for role change..."
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowRoleDialog(false)}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRoleSubmit}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Change Role
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Dialog */}
      {showSuspendDialog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Suspend {selectedCount} Users
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Suspension
                </label>
                <textarea
                  value={suspendData.reason}
                  onChange={(e) => setSuspendData({ ...suspendData, reason: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter reason for suspension..."
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowSuspendDialog(false)}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSuspendSubmit}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  Suspend Users
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
