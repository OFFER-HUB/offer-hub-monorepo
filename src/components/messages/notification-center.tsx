'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Bell, BellRing, Search, Filter, MoreVertical, Trash2, Archive, X, Check, Clock, AlertCircle, CheckCircle, Info, Zap } from 'lucide-react';
import { useMessageNotifications } from '../../hooks/use-message-notifications';
import type { 
  Notification, 
  NotificationFilter, 
  NotificationType, 
  NotificationChannel, 
  NotificationPriority 
} from '../../types/message-notifications.types';

interface NotificationCenterProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDismiss: (id: string) => void;
  onDelete: (id: string) => void;
  onTrackEvent: (id: string, event: 'opened' | 'clicked' | 'dismissed') => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDismiss,
  onDelete,
  onTrackEvent
}) => {
  const [showActions, setShowActions] = useState(false);

  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      case 'normal': return 'border-l-blue-500 bg-blue-50';
      case 'low': return 'border-l-gray-500 bg-gray-50';
      default: return 'border-l-blue-500 bg-blue-50';
    }
  };

  const getChannelIcon = (channel: NotificationChannel) => {
    switch (channel) {
      case 'push': return <Bell className="w-4 h-4" />;
      case 'email': return <Info className="w-4 h-4" />;
      case 'sms': return <Zap className="w-4 h-4" />;
      case 'in_app': return <BellRing className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'payment_received':
      case 'payment_sent':
      case 'milestone_approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'dispute_opened':
      case 'security_alert':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'new_message':
        return <BellRing className="w-5 h-5 text-blue-600" />;
      case 'deadline_reminder':
        return <Clock className="w-5 h-5 text-orange-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
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

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkAsRead(notification.id);
    setShowActions(false);
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDismiss(notification.id);
    setShowActions(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(notification.id);
    setShowActions(false);
  };

  return (
    <div 
      className={`border-l-4 ${getPriorityColor(notification.priority)} border border-gray-200 rounded-lg p-4 mb-3 cursor-pointer hover:shadow-md transition-all duration-200 ${
        notification.is_read ? 'opacity-75' : 'shadow-sm'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="flex-shrink-0 mt-1">
            {getTypeIcon(notification.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className={`text-sm font-medium ${notification.is_read ? 'text-gray-600' : 'text-gray-900'}`}>
                {notification.title}
              </h3>
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                {getChannelIcon(notification.channel)}
                <span className="capitalize">{notification.channel.replace('_', ' ')}</span>
              </div>
            </div>
            
            <p className={`text-sm ${notification.is_read ? 'text-gray-500' : 'text-gray-700'} mb-2`}>
              {notification.content}
            </p>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {formatTimestamp(notification.created_at)}
              </span>
              
              {notification.action_text && (
                <span className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                  {notification.action_text} →
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          {!notification.is_read && (
            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
          )}
          
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
              }}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>
            
            {showActions && (
              <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                {!notification.is_read && (
                  <button
                    onClick={handleMarkAsRead}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Mark as read</span>
                  </button>
                )}
                <button
                  onClick={handleDismiss}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Archive className="w-4 h-4" />
                  <span>Dismiss</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  userId,
  isOpen,
  onClose,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<NotificationFilter>({});
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'archived'>('all');

  const {
    notifications,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    deleteNotification,
    setFilter,
    getUnreadCount,
    trackEvent
  } = useMessageNotifications({
    userId,
    autoRefresh: true,
    refreshInterval: 30000,
    enableRealTime: true,
    initialFilter: selectedFilter
  });

  const filteredNotifications = notifications.filter(notification => {
    // Tab filtering
    if (activeTab === 'unread' && notification.is_read) return false;
    if (activeTab === 'archived' && !notification.is_dismissed) return false;
    
    // Search filtering
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        notification.title.toLowerCase().includes(query) ||
        notification.content.toLowerCase().includes(query) ||
        notification.type.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  const handleMarkAllAsRead = useCallback(async () => {
    await markAllAsRead();
  }, [markAllAsRead]);

  const handleFilterChange = useCallback((newFilter: NotificationFilter) => {
    setSelectedFilter(newFilter);
    setFilter(newFilter);
  }, [setFilter]);

  const handleTrackEvent = useCallback((id: string, event: 'opened' | 'clicked' | 'dismissed') => {
    trackEvent(id, event);
  }, [trackEvent]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 overflow-hidden ${className}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-25 transition-opacity"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <BellRing className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
              {getUnreadCount() > 0 && (
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  {getUnreadCount()}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Filter notifications"
              >
                <Filter className="w-4 h-4 text-gray-500" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Close notifications"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Search and Actions */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex space-x-1">
                {(['all', 'unread', 'archived'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
              
              {activeTab !== 'archived' && getUnreadCount() > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="space-y-3">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={selectedFilter.priority?.[0] || ''}
                    onChange={(e) => handleFilterChange({
                      ...selectedFilter,
                      priority: e.target.value ? [e.target.value as NotificationPriority] : undefined
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All priorities</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="normal">Normal</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 mb-2">Failed to load notifications</p>
                <p className="text-sm text-gray-500">{error}</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  {searchQuery ? 'No notifications match your search' : 'No notifications yet'}
                </p>
                <p className="text-sm text-gray-500">
                  {searchQuery ? 'Try adjusting your search terms' : 'You\'ll see notifications here when you receive messages and updates'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onDismiss={dismissNotification}
                    onDelete={deleteNotification}
                    onTrackEvent={handleTrackEvent}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}</span>
              <button className="text-blue-600 hover:text-blue-800 font-medium">
                Notification Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
