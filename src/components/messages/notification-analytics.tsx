'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Bell, 
  Eye, 
  MousePointer, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Calendar,
  Filter,
  PieChart,
  Activity
} from 'lucide-react';
import { useNotificationAnalytics } from '../../hooks/use-message-notifications';
import type { 
  NotificationStats, 
  NotificationEngagement,
  NotificationType,
  NotificationChannel,
  NotificationStatus
} from '../../types/message-notifications.types';

interface NotificationAnalyticsProps {
  userId: string;
  className?: string;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: React.ReactNode;
  description?: string;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string[];
  }[];
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  description
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'increase': return 'text-green-600';
      case 'decrease': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'increase': return <TrendingUp className="w-4 h-4" />;
      case 'decrease': return <TrendingDown className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <div className="flex flex-col items-end">
          <div className="p-3 bg-blue-50 rounded-lg">
            {icon}
          </div>
          {change !== undefined && (
            <div className={`flex items-center mt-2 text-sm ${getChangeColor()}`}>
              {getChangeIcon()}
              <span className="ml-1">{Math.abs(change)}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SimpleChart: React.FC<{ data: ChartData; title: string }> = ({ data, title }) => {
  const maxValue = Math.max(...data.datasets[0].data);
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {data.labels.map((label, index) => {
          const value = data.datasets[0].data[index];
          const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
          
          return (
            <div key={label} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">{label}</span>
                <span className="font-medium text-gray-900">{value}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const NotificationAnalytics: React.FC<NotificationAnalyticsProps> = ({
  userId,
  className = ''
}) => {
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });
  const [selectedMetric, setSelectedMetric] = useState<'all' | 'engagement' | 'delivery'>('all');

  const {
    stats,
    engagement,
    loading,
    error,
    refreshAnalytics
  } = useNotificationAnalytics(userId);

  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  // Calculate trends (mock data for now)
  const calculateTrends = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  // Mock trend data (in real implementation, this would come from historical data)
  const mockTrends = {
    total: 15,
    openRate: -5,
    clickRate: 12,
    responseTime: -8
  };

  const getTrendType = (change: number): 'increase' | 'decrease' | 'neutral' => {
    if (change > 0) return 'increase';
    if (change < 0) return 'decrease';
    return 'neutral';
  };

  // Prepare chart data
  const notificationTypesData: ChartData = {
    labels: stats ? Object.keys(stats.notifications_by_type) : [],
    datasets: [{
      label: 'Notifications',
      data: stats ? Object.values(stats.notifications_by_type) : [],
      backgroundColor: [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
        '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
      ]
    }]
  };

  const channelsData: ChartData = {
    labels: stats ? Object.keys(stats.notifications_by_channel) : [],
    datasets: [{
      label: 'Channels',
      data: stats ? Object.values(stats.notifications_by_channel) : [],
      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']
    }]
  };

  const statusData: ChartData = {
    labels: stats ? Object.keys(stats.notifications_by_status) : [],
    datasets: [{
      label: 'Status',
      data: stats ? Object.values(stats.notifications_by_status) : [],
      backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#6B7280']
    }]
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2].map(i => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
        <div className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Analytics</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => refreshAnalytics()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
        <div className="p-6 text-center">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
          <p className="text-gray-600">Analytics data will appear here once you start receiving notifications</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Notification Analytics</h2>
              <p className="text-sm text-gray-600">Track notification performance and engagement</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={() => refreshAnalytics()}
              className="p-2 text-gray-600 hover:text-gray-800"
              title="Refresh analytics"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Notifications"
            value={stats.total_notifications}
            change={mockTrends.total}
            changeType={getTrendType(mockTrends.total)}
            icon={<Bell className="w-6 h-6 text-blue-600" />}
            description="All time"
          />
          
          <MetricCard
            title="Unread Notifications"
            value={stats.unread_notifications}
            icon={<Eye className="w-6 h-6 text-orange-600" />}
            description="Need attention"
          />
          
          <MetricCard
            title="Open Rate"
            value={formatPercentage(stats.engagement_metrics.open_rate)}
            change={mockTrends.openRate}
            changeType={getTrendType(mockTrends.openRate)}
            icon={<Activity className="w-6 h-6 text-green-600" />}
            description="Notifications opened"
          />
          
          <MetricCard
            title="Avg Response Time"
            value={engagement ? formatDuration(engagement.avg_response_time) : 'N/A'}
            change={mockTrends.responseTime}
            changeType={getTrendType(mockTrends.responseTime)}
            icon={<Clock className="w-6 h-6 text-purple-600" />}
            description="Time to open"
          />
        </div>

        {/* Engagement Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="Click Rate"
            value={formatPercentage(stats.engagement_metrics.click_rate)}
            change={mockTrends.clickRate}
            changeType={getTrendType(mockTrends.clickRate)}
            icon={<MousePointer className="w-6 h-6 text-blue-600" />}
            description="Notifications clicked"
          />
          
          <MetricCard
            title="Dismissal Rate"
            value={formatPercentage(stats.engagement_metrics.dismissal_rate)}
            icon={<XCircle className="w-6 h-6 text-red-600" />}
            description="Notifications dismissed"
          />
          
          <MetricCard
            title="Delivery Rate"
            value={formatPercentage(stats.delivery_metrics.delivery_rate)}
            icon={<CheckCircle className="w-6 h-6 text-green-600" />}
            description="Successfully delivered"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <SimpleChart 
            data={notificationTypesData} 
            title="Notifications by Type" 
          />
          <SimpleChart 
            data={channelsData} 
            title="Notifications by Channel" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SimpleChart 
            data={statusData} 
            title="Notifications by Status" 
          />
          
          {/* Engagement Details */}
          {engagement && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Engagement Details</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Notifications</span>
                  <span className="font-medium">{engagement.total_notifications}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Read Notifications</span>
                  <span className="font-medium">{engagement.read_notifications}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Clicked Notifications</span>
                  <span className="font-medium">{engagement.clicked_notifications}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Dismissed Notifications</span>
                  <span className="font-medium">{engagement.dismissed_notifications}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm font-medium text-gray-900">Engagement Rate</span>
                  <span className="font-medium text-green-600">
                    {formatPercentage(engagement.engagement_rate)}
                  </span>
                </div>
              </div>
              
              {engagement.preferred_channels.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Preferred Channels</h4>
                  <div className="flex flex-wrap gap-2">
                    {engagement.preferred_channels.map((channel, index) => (
                      <span
                        key={channel}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {channel}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Insights */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <BarChart3 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-2">Analytics Insights</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Your open rate is {stats.engagement_metrics.open_rate > 0.7 ? 'excellent' : stats.engagement_metrics.open_rate > 0.5 ? 'good' : 'below average'}</li>
                <li>• Most notifications are delivered via {Object.keys(stats.notifications_by_channel).reduce((a, b) => stats.notifications_by_channel[a as keyof typeof stats.notifications_by_channel] > stats.notifications_by_channel[b as keyof typeof stats.notifications_by_channel] ? a : b)}</li>
                <li>• {stats.unread_notifications > 0 ? `You have ${stats.unread_notifications} unread notifications` : 'All notifications have been read'}</li>
                {engagement && engagement.avg_response_time < 5 * 60 * 1000 && (
                  <li>• You respond quickly to notifications (avg {formatDuration(engagement.avg_response_time)})</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationAnalytics;
