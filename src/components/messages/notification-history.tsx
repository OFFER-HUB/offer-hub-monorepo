'use client';

import React, { useState, useMemo } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Bell, 
  Mail, 
  Smartphone, 
  Monitor,
  ChevronDown,
  ChevronUp,
  Eye,
  RefreshCw,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { useMessageNotifications, useNotificationAnalytics } from '../../hooks/use-message-notifications';
import type { 
  Notification, 
  NotificationFilter, 
  NotificationType, 
  NotificationChannel, 
  NotificationStatus,
  NotificationStats,
  NotificationEngagement
} from '../../types/message-notifications.types';

interface NotificationHistoryProps {
  userId: string;
  className?: string;
}

interface HistoryStatsProps {
  stats: NotificationStats;
  engagement: NotificationEngagement | null;
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onTrackEvent: (id: string, event: 'opened' | 'clicked' | 'dismissed') => void;
  showDetails?: boolean;
}

const HistoryStats: React.FC<HistoryStatsProps> = ({ stats, engagement }) => {
  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  const getTrendIcon = (value: number, isPositive: boolean) => {
    if (value > 0) return isPositive ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Notifications */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Notifications</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.total_notifications}</p>
          </div>
          <Bell className="w-8 h-8 text-blue-600" />
        </div>
        <div className="mt-2 flex items-center text-sm">
          {getTrendIcon(0, true)}
          <span className="text-gray-600 ml-1">All time</span>
        </div>
      </div>

      {/* Unread Notifications */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Unread</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.unread_notifications}</p>
          </div>
          <Eye className="w-8 h-8 text-orange-600" />
        </div>
        <div className="mt-2 flex items-center text-sm">
          {stats.unread_notifications > 0 ? (
            <>
              <AlertCircle className="w-4 h-4 text-orange-600" />
              <span className="text-orange-600 ml-1">Needs attention</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-green-600 ml-1">All caught up</span>
            </>
          )}
        </div>
      </div>

      {/* Open Rate */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Open Rate</p>
            <p className="text-2xl font-semibold text-gray-900">
              {formatPercentage(stats.engagement_metrics.open_rate)}
            </p>
          </div>
          <BarChart3 className="w-8 h-8 text-green-600" />
        </div>
        <div className="mt-2 flex items-center text-sm">
          {engagement && getTrendIcon(engagement.engagement_rate, true)}
          <span className="text-gray-600 ml-1">
            {engagement ? formatPercentage(engagement.engagement_rate) : '0%'} engagement
          </span>
        </div>
      </div>

      {/* Avg Response Time */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Avg Response</p>
            <p className="text-2xl font-semibold text-gray-900">
              {engagement ? formatDuration(engagement.avg_response_time) : 'N/A'}
            </p>
          </div>
          <Clock className="w-8 h-8 text-purple-600" />
        </div>
        <div className="mt-2 flex items-center text-sm">
          <span className="text-gray-600">Time to open</span>
        </div>
      </div>
    </div>
  );
};

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onTrackEvent,
  showDetails = false
}) => {
  const [expanded, setExpanded] = useState(false);

  const getStatusIcon = (status: NotificationStatus) => {
    switch (status) {
      case 'delivered':
      case 'read':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getChannelIcon = (channel: NotificationChannel) => {
    switch (channel) {
      case 'push': return <Bell className="w-4 h-4 text-blue-600" />;
      case 'email': return <Mail className="w-4 h-4 text-green-600" />;
      case 'sms': return <Smartphone className="w-4 h-4 text-purple-600" />;
      case 'in_app': return <Monitor className="w-4 h-4 text-orange-600" />;
      default: return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      case 'normal': return 'border-l-blue-500 bg-blue-50';
      case 'low': return 'border-l-gray-500 bg-gray-50';
      default: return 'border-l-blue-500 bg-blue-50';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
      relative: getRelativeTime(date)
    };
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString();
  };

  const handleClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
    onTrackEvent(notification.id, 'clicked');
    
    if (notification.action_url) {
      window.open(notification.action_url, '_blank');
    }
  };

  const timestamp = formatTimestamp(notification.created_at);

  return (
    <div className={`border-l-4 ${getPriorityColor(notification.priority)} border border-gray-200 rounded-lg mb-3 transition-all duration-200 hover:shadow-md`}>
      <div 
        className="p-4 cursor-pointer"
        onClick={handleClick}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="flex-shrink-0 mt-1">
              {getChannelIcon(notification.channel)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className={`text-sm font-medium ${notification.is_read ? 'text-gray-600' : 'text-gray-900'}`}>
                  {notification.title}
                </h3>
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full capitalize">
                  {notification.type.replace('_', ' ')}
                </span>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full capitalize">
                  {notification.priority}
                </span>
              </div>
              
              <p className={`text-sm ${notification.is_read ? 'text-gray-500' : 'text-gray-700'} mb-2`}>
                {notification.content}
              </p>
              
              <div className="flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{timestamp.date}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{timestamp.time}</span>
                  </span>
                  <span>{timestamp.relative}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getStatusIcon(notification.status)}
                  <span className="capitalize">{notification.status}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {!notification.is_read && (
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
            )}
            
            {showDetails && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(!expanded);
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                {expanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {expanded && showDetails && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <div className="mt-3 space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">ID:</span>
                <span className="text-gray-600 ml-2 font-mono text-xs">{notification.id}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Channel:</span>
                <span className="text-gray-600 ml-2 capitalize">{notification.channel}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Created:</span>
                <span className="text-gray-600 ml-2">{timestamp.date} {timestamp.time}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Status:</span>
                <span className="text-gray-600 ml-2 capitalize">{notification.status}</span>
              </div>
            </div>
            
            {notification.metadata && Object.keys(notification.metadata).length > 0 && (
              <div>
                <span className="font-medium text-gray-700 text-sm">Metadata:</span>
                <pre className="text-xs text-gray-600 mt-1 bg-gray-50 p-2 rounded border overflow-x-auto">
                  {JSON.stringify(notification.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const NotificationHistory: React.FC<NotificationHistoryProps> = ({
  userId,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<NotificationFilter>({});
  const [showFilters, setShowFilters] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const {
    notifications,
    loading,
    error,
    markAsRead,
    dismissNotification,
    deleteNotification,
    setFilter,
    trackEvent,
    refreshNotifications
  } = useMessageNotifications({
    userId,
    autoRefresh: false, // Manual refresh for history
    enableRealTime: false // No real-time updates for history
  });

  const {
    stats,
    engagement,
    loading
  } = useNotificationAnalytics(userId);

  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      // Search filtering
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matches = (
          notification.title.toLowerCase().includes(query) ||
          notification.content.toLowerCase().includes(query) ||
          notification.type.toLowerCase().includes(query) ||
          notification.channel.toLowerCase().includes(query)
        );
        if (!matches) return false;
      }
      
      // Date range filtering
      if (dateRange.from) {
        const fromDate = new Date(dateRange.from);
        const notificationDate = new Date(notification.created_at);
        if (notificationDate < fromDate) return false;
      }
      
      if (dateRange.to) {
        const toDate = new Date(dateRange.to);
        const notificationDate = new Date(notification.created_at);
        if (notificationDate > toDate) return false;
      }
      
      return true;
    });
  }, [notifications, searchQuery, dateRange]);

  const paginatedNotifications = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredNotifications.slice(startIndex, startIndex + pageSize);
  }, [filteredNotifications, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredNotifications.length / pageSize);

  const handleFilterChange = useCallback((newFilter: NotificationFilter) => {
    setSelectedFilter(newFilter);
    setFilter(newFilter);
    setCurrentPage(1);
  }, [setFilter]);

  const handleExport = useCallback(() => {
    const csvContent = [
      ['Title', 'Type', 'Channel', 'Status', 'Priority', 'Created At', 'Read At', 'Content'],
      ...filteredNotifications.map(n => [
        n.title,
        n.type,
        n.channel,
        n.status,
        n.priority,
        n.created_at,
        n.read_at || '',
        n.content.replace(/\n/g, ' ')
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notifications-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, [filteredNotifications]);

  // const handleBulkAction = useCallback(async (action: 'read' | 'delete' | 'archive') => {
  //   // Implementation for bulk actions
  //   console.log(`Bulk action: ${action}`);
  // }, []);

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <History className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Notification History</h2>
              <p className="text-sm text-gray-600">View and manage your notification history</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                showDetails 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
            <button
              onClick={handleExport}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 flex items-center space-x-1"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button
              onClick={() => refreshNotifications()}
              className="p-2 text-gray-600 hover:text-gray-800"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats */}
        {stats && (
          <HistoryStats stats={stats} engagement={engagement} />
        )}

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                showFilters 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={selectedFilter.types?.[0] || ''}
                    onChange={(e) => handleFilterChange({
                      ...selectedFilter,
                      types: e.target.value ? [e.target.value as NotificationType] : undefined
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All types</option>
                    <option value="new_message">New Message</option>
                    <option value="payment_received">Payment Received</option>
                    <option value="payment_sent">Payment Sent</option>
                    <option value="milestone_approved">Milestone Approved</option>
                    <option value="dispute_opened">Dispute Opened</option>
                    <option value="deadline_reminder">Deadline Reminder</option>
                    <option value="security_alert">Security Alert</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Channel</label>
                  <select
                    value={selectedFilter.channels?.[0] || ''}
                    onChange={(e) => handleFilterChange({
                      ...selectedFilter,
                      channels: e.target.value ? [e.target.value as NotificationChannel] : undefined
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All channels</option>
                    <option value="push">Push</option>
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="in_app">In-App</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={selectedFilter.status?.[0] || ''}
                    onChange={(e) => handleFilterChange({
                      ...selectedFilter,
                      status: e.target.value ? [e.target.value as NotificationStatus] : undefined
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All statuses</option>
                    <option value="pending">Pending</option>
                    <option value="sent">Sent</option>
                    <option value="delivered">Delivered</option>
                    <option value="read">Read</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                  <input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                  <input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-600">
            Showing {paginatedNotifications.length} of {filteredNotifications.length} notifications
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-2">Failed to load notification history</p>
            <p className="text-sm text-gray-500">{error}</p>
          </div>
        ) : paginatedNotifications.length === 0 ? (
          <div className="text-center py-12">
            <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No notifications found</p>
            <p className="text-sm text-gray-500">
              {searchQuery || Object.keys(selectedFilter).length > 0 
                ? 'Try adjusting your search or filter criteria' 
                : 'Your notification history will appear here'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {paginatedNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onDismiss={dismissNotification}
                onDelete={deleteNotification}
                onTrackEvent={trackEvent}
                showDetails={showDetails}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 text-sm border rounded-lg ${
                      currentPage === page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationHistory;
