"use client";

import { useState } from 'react';
import { UserExportOptions } from '@/types/user-management.types';
import { XIcon, DownloadIcon, FileTextIcon, DatabaseIcon } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: UserExportOptions) => void;
}

export function ExportModal({ isOpen, onClose, onExport }: ExportModalProps) {
  const [exportOptions, setExportOptions] = useState<UserExportOptions>({
    format: 'csv',
    fields: [
      'id',
      'username',
      'name',
      'email',
      'status',
      'role',
      'verification_status',
      'created_at'
    ],
  });

  const availableFields = [
    { id: 'id', label: 'User ID', category: 'Basic' },
    { id: 'username', label: 'Username', category: 'Basic' },
    { id: 'name', label: 'Full Name', category: 'Basic' },
    { id: 'email', label: 'Email', category: 'Basic' },
    { id: 'wallet_address', label: 'Wallet Address', category: 'Basic' },
    { id: 'bio', label: 'Bio', category: 'Profile' },
    { id: 'status', label: 'Status', category: 'Account' },
    { id: 'role', label: 'Role', category: 'Account' },
    { id: 'verification_status', label: 'Verification Status', category: 'Account' },
    { id: 'is_freelancer', label: 'Is Freelancer', category: 'Account' },
    { id: 'last_login', label: 'Last Login', category: 'Activity' },
    { id: 'login_count', label: 'Login Count', category: 'Activity' },
    { id: 'profile_completion', label: 'Profile Completion', category: 'Activity' },
    { id: 'trust_score', label: 'Trust Score', category: 'Activity' },
    { id: 'created_at', label: 'Created At', category: 'System' },
    { id: 'created_by', label: 'Created By', category: 'System' },
    { id: 'updated_by', label: 'Updated By', category: 'System' },
    { id: 'suspension_reason', label: 'Suspension Reason', category: 'System' },
    { id: 'suspension_date', label: 'Suspension Date', category: 'System' },
    { id: 'notes', label: 'Admin Notes', category: 'System' },
  ];

  const handleFieldToggle = (fieldId: string) => {
    setExportOptions(prev => ({
      ...prev,
      fields: prev.fields.includes(fieldId)
        ? prev.fields.filter(f => f !== fieldId)
        : [...prev.fields, fieldId]
    }));
  };

  const handleSelectAll = (category: string) => {
    const categoryFields = availableFields
      .filter(field => field.category === category)
      .map(field => field.id);
    
    const allSelected = categoryFields.every(field => exportOptions.fields.includes(field));
    
    if (allSelected) {
      // Deselect all fields in this category
      setExportOptions(prev => ({
        ...prev,
        fields: prev.fields.filter(field => !categoryFields.includes(field))
      }));
    } else {
      // Select all fields in this category
      setExportOptions(prev => ({
        ...prev,
        fields: [...new Set([...prev.fields, ...categoryFields])]
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (exportOptions.fields.length === 0) {
      alert('Please select at least one field to export');
      return;
    }
    onExport(exportOptions);
  };

  const categories = [...new Set(availableFields.map(field => field.category))];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Export Users</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Export Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Export Format
            </label>
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: 'csv', label: 'CSV', icon: FileTextIcon, description: 'Comma-separated values' },
                { value: 'json', label: 'JSON', icon: DatabaseIcon, description: 'JavaScript Object Notation' },
                { value: 'xlsx', label: 'Excel', icon: DownloadIcon, description: 'Microsoft Excel format' },
              ].map((format) => (
                <label
                  key={format.value}
                  className={`relative flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer ${
                    exportOptions.format === format.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="format"
                    value={format.value}
                    checked={exportOptions.format === format.value}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as any }))}
                    className="sr-only"
                  />
                  <format.icon className="h-8 w-8 text-gray-600 mb-2" />
                  <span className="text-sm font-medium text-gray-900">{format.label}</span>
                  <span className="text-xs text-gray-500 text-center">{format.description}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Field Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Fields to Export
            </label>
            
            {categories.map((category) => (
              <div key={category} className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900">{category}</h4>
                  <button
                    type="button"
                    onClick={() => handleSelectAll(category)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Select All
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {availableFields
                    .filter(field => field.category === category)
                    .map((field) => (
                      <label
                        key={field.id}
                        className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={exportOptions.fields.includes(field.id)}
                          onChange={() => handleFieldToggle(field.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{field.label}</span>
                      </label>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* Export Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Export Summary</h4>
            <div className="text-sm text-gray-600">
              <p>Format: <span className="font-medium">{exportOptions.format.toUpperCase()}</span></p>
              <p>Fields: <span className="font-medium">{exportOptions.fields.length} selected</span></p>
              <p className="mt-1 text-xs text-gray-500">
                The export will include all users matching your current filter criteria.
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <DownloadIcon className="h-4 w-4 mr-2" />
              Export Users
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
