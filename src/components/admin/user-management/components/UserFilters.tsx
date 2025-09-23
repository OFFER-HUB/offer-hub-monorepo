"use client";

import { useState } from 'react';
import { AdminUserFilters, USER_STATUS_OPTIONS, USER_ROLE_OPTIONS, VERIFICATION_STATUS_OPTIONS } from '@/types/user-management.types';
import { SearchIcon, FilterIcon, CalendarIcon, DownloadIcon, UploadIcon } from 'lucide-react';

interface UserFiltersProps {
  filters: AdminUserFilters;
  onFiltersChange: (filters: AdminUserFilters) => void;
  onExport?: () => void;
  onImport?: () => void;
}

export function UserFilters({ filters, onFiltersChange, onExport, onImport }: UserFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = (key: keyof AdminUserFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
      page: 1, // Reset to first page when filters change
    });
  };

  const handleSearchChange = (value: string) => {
    handleFilterChange('search', value || undefined);
  };

  const handleStatusChange = (value: string) => {
    handleFilterChange('status', value || undefined);
  };

  const handleRoleChange = (value: string) => {
    handleFilterChange('role', value || undefined);
  };

  const handleVerificationChange = (value: string) => {
    handleFilterChange('verification_status', value || undefined);
  };

  const handleFreelancerChange = (value: string) => {
    handleFilterChange('is_freelancer', value === 'all' ? undefined : value === 'true');
  };

  const handleSortChange = (value: string) => {
    const [sort_by, sort_order] = value.split('_');
    handleFilterChange('sort_by', sort_by);
    handleFilterChange('sort_order', sort_order);
  };

  const handleDateChange = (field: 'date_from' | 'date_to', value: string) => {
    handleFilterChange(field, value || undefined);
  };

  const clearFilters = () => {
    onFiltersChange({
      page: 1,
      limit: 20,
      sort_by: 'created_at',
      sort_order: 'desc',
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users by name, email, or username..."
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <select
            value={filters.status || ''}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            {USER_STATUS_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={filters.role || ''}
            onChange={(e) => handleRoleChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Roles</option>
            {USER_ROLE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={filters.verification_status || ''}
            onChange={(e) => handleVerificationChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Verification</option>
            {VERIFICATION_STATUS_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={filters.is_freelancer === undefined ? 'all' : filters.is_freelancer.toString()}
            onChange={(e) => handleFreelancerChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="true">Freelancers</option>
            <option value="false">Clients</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            <FilterIcon className="w-4 h-4 mr-2" />
            Advanced
          </button>

          {onExport && (
            <button
              onClick={onExport}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <DownloadIcon className="w-4 h-4 mr-2" />
              Export
            </button>
          )}

          {onImport && (
            <button
              onClick={onImport}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <UploadIcon className="w-4 h-4 mr-2" />
              Import
            </button>
          )}

          <button
            onClick={clearFilters}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="date"
                  value={filters.date_from || ''}
                  onChange={(e) => handleDateChange('date_from', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="date"
                  value={filters.date_to || ''}
                  onChange={(e) => handleDateChange('date_to', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={`${filters.sort_by}_${filters.sort_order}`}
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="created_at_desc">Newest First</option>
                <option value="created_at_asc">Oldest First</option>
                <option value="name_asc">Name A-Z</option>
                <option value="name_desc">Name Z-A</option>
                <option value="email_asc">Email A-Z</option>
                <option value="email_desc">Email Z-A</option>
                <option value="last_login_desc">Last Login (Recent)</option>
                <option value="last_login_asc">Last Login (Oldest)</option>
                <option value="trust_score_desc">Trust Score (High)</option>
                <option value="trust_score_asc">Trust Score (Low)</option>
              </select>
            </div>

            {/* Results Per Page */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Per Page
              </label>
              <select
                value={filters.limit || 20}
                onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
