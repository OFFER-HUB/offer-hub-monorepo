"use client";

import { useState, useRef } from 'react';
import { XIcon, UploadIcon, FileTextIcon, AlertCircleIcon, CheckCircleIcon } from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File) => void;
}

export function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    // Validate file type
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.csv')) {
      alert('Please select a CSV or Excel file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      alert('Please select a file to import');
      return;
    }

    setIsUploading(true);
    try {
      await onImport(selectedFile);
      setSelectedFile(null);
      onClose();
    } catch (error) {
      console.error('Import error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Import Users</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center ${
              dragActive
                ? 'border-blue-400 bg-blue-50'
                : selectedFile
                ? 'border-green-400 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileInputChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            {selectedFile ? (
              <div className="space-y-2">
                <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {dragActive ? 'Drop the file here' : 'Drag and drop your file here'}
                  </p>
                  <p className="text-sm text-gray-500">or</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    browse files
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* File Requirements */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">File Requirements</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Supported formats: CSV, Excel (.xlsx, .xls)</li>
              <li>• Maximum file size: 10MB</li>
              <li>• Required columns: wallet_address, username</li>
              <li>• Optional columns: name, email, bio, role, status, verification_status</li>
            </ul>
          </div>

          {/* CSV Template */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">CSV Template</h4>
            <div className="text-sm text-gray-600 mb-2">
              Download a template to see the expected format:
            </div>
            <button
              type="button"
              onClick={() => {
                // Create and download CSV template
                const template = 'wallet_address,username,name,email,bio,role,status,verification_status\n' +
                  '0x123...,john_doe,John Doe,john@example.com,Software Developer,user,active,unverified';
                const blob = new Blob([template], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'user_import_template.csv';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
              }}
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <FileTextIcon className="h-4 w-4 mr-1" />
              Download Template
            </button>
          </div>

          {/* Import Warnings */}
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex">
              <AlertCircleIcon className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Important Notes</h4>
                <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                  <li>• Duplicate wallet addresses will be rejected</li>
                  <li>• Duplicate usernames will be rejected</li>
                  <li>• Invalid email formats will be skipped</li>
                  <li>• All imported users will be set to 'active' status by default</li>
                </ul>
              </div>
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
              disabled={!selectedFile || isUploading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Importing...
                </>
              ) : (
                <>
                  <UploadIcon className="h-4 w-4 mr-2" />
                  Import Users
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
