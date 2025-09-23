"use client";

import { useUserAnalytics } from '@/hooks/use-user-management';
import { UserAnalytics } from '@/types/user-management.types';
import { 
  UsersIcon, 
  UserCheckIcon, 
  UserXIcon, 
  TrendingUpIcon,
  DownloadIcon,
  RefreshCwIcon,
  ActivityIcon,
  ShieldCheckIcon,
  CalendarIcon
} from 'lucide-react';

interface UserAnalyticsProps {
  onExport?: (format: string) => void;
}

export default function UserAnalytics({ onExport }: UserAnalyticsProps) {
  const { analytics, loading, error, refreshAnalytics } = useUserAnalytics();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">User Analytics</h1>
          <button
            disabled
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg opacity-50 cursor-not-allowed"
          >
            <RefreshCwIcon className="w-4 h-4 mr-2 animate-spin" />
            Loading...
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-300 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">User Analytics</h1>
          <button
            onClick={refreshAnalytics}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCwIcon className="w-4 h-4 mr-2" />
            Retry
          </button>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">User Analytics</h1>
          <button
            onClick={refreshAnalytics}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCwIcon className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
        
        <div className="text-center py-12">
          <p className="text-gray-500">No analytics data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Analytics</h1>
          <p className="text-gray-600">Comprehensive insights into user behavior and platform metrics</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {onExport && (
            <button
              onClick={() => onExport('csv')}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <DownloadIcon className="w-4 h-4 mr-2" />
              Export Report
            </button>
          )}
          
          <button
            onClick={refreshAnalytics}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCwIcon className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <UsersIcon className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.total_users.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <UserCheckIcon className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.active_users.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <TrendingUpIcon className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">New Registrations</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.new_registrations.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <ShieldCheckIcon className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Verification Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.verification_rate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ActivityIcon className="w-5 h-5 mr-2 text-blue-600" />
            Activity Metrics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Daily Active Users</span>
              <span className="text-lg font-semibold text-gray-900">
                {analytics.activity_metrics.daily_active_users.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Weekly Active Users</span>
              <span className="text-lg font-semibold text-gray-900">
                {analytics.activity_metrics.weekly_active_users.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Monthly Active Users</span>
              <span className="text-lg font-semibold text-gray-900">
                {analytics.activity_metrics.monthly_active_users.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <UsersIcon className="w-5 h-5 mr-2 text-green-600" />
            User Demographics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Freelancers</span>
              <span className="text-lg font-semibold text-gray-900">
                {analytics.demographics.freelancers.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Clients</span>
              <span className="text-lg font-semibold text-gray-900">
                {analytics.demographics.clients.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Verified Users</span>
              <span className="text-lg font-semibold text-gray-900">
                {analytics.demographics.verified_users.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Growth Metrics */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUpIcon className="w-5 h-5 mr-2 text-purple-600" />
          Growth Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {analytics.user_growth > 0 ? '+' : ''}{analytics.user_growth.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">User Growth Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {analytics.new_registrations.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">New Users (30 days)</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {analytics.verification_rate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Verification Rate</div>
          </div>
        </div>
      </div>

      {/* User Status Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Status Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Account Status</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active</span>
                <span className="text-sm font-semibold text-green-600">
                  {analytics.active_users.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Inactive</span>
                <span className="text-sm font-semibold text-gray-600">
                  {(analytics.total_users - analytics.active_users).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">User Types</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Freelancers</span>
                <span className="text-sm font-semibold text-blue-600">
                  {analytics.demographics.freelancers.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Clients</span>
                <span className="text-sm font-semibold text-purple-600">
                  {analytics.demographics.clients.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Health Indicators */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Health Indicators</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {((analytics.active_users / analytics.total_users) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-green-700">Active Rate</div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {analytics.verification_rate.toFixed(1)}%
            </div>
            <div className="text-sm text-blue-700">Verification Rate</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {analytics.user_growth > 0 ? '+' : ''}{analytics.user_growth.toFixed(1)}%
            </div>
            <div className="text-sm text-purple-700">Growth Rate</div>
          </div>
          
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600 mb-1">
              {analytics.new_registrations.toLocaleString()}
            </div>
            <div className="text-sm text-yellow-700">New Users (30d)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
