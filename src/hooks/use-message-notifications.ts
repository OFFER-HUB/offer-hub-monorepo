'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { notificationService } from '../services/notification-service';
import type {
  Notification,
  NotificationPreferences,
  NotificationFilter,
  NotificationStats,
  NotificationEngagement,
  CreateNotificationDTO,
  UpdateNotificationPreferencesDTO,
  NotificationEvent,
  NotificationChannel,
  NotificationType,
  NotificationPriority,
  NotificationResponse
} from '../types/message-notifications.types';

interface UseNotificationsOptions {
  userId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableRealTime?: boolean;
  initialFilter?: NotificationFilter;
}

interface UseNotificationsReturn {
  // State
  notifications: Notification[];
  preferences: NotificationPreferences[];
  stats: NotificationStats | null;
  engagement: NotificationEngagement | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  dismissNotification: (notificationId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  updatePreferences: (preferences: UpdateNotificationPreferencesDTO[]) => Promise<void>;
  createNotification: (data: CreateNotificationDTO) => Promise<void>;
  
  // Filters and pagination
  setFilter: (filter: NotificationFilter) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  
  // Real-time
  subscribeToRealTime: () => void;
  unsubscribeFromRealTime: () => void;
  
  // Push notifications
  requestPermission: () => Promise<NotificationPermission>;
  subscribeToPush: (subscription: PushSubscription) => Promise<void>;
  unsubscribeFromPush: () => Promise<void>;
  
  // Analytics
  trackEvent: (notificationId: string, eventType: 'opened' | 'clicked' | 'dismissed', metadata?: Record<string, any>) => Promise<void>;
  
  // Utility
  getUnreadCount: () => number;
  getNotificationsByType: (type: NotificationType) => Notification[];
  getNotificationsByChannel: (channel: NotificationChannel) => Notification[];
}

export function useMessageNotifications(options: UseNotificationsOptions): UseNotificationsReturn {
  const {
    userId,
    autoRefresh = true,
    refreshInterval = 30000,
    enableRealTime = true,
    initialFilter = {}
  } = options;

  // State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [engagement, setEngagement] = useState<NotificationEngagement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilterState] = useState<NotificationFilter>(initialFilter);
  const [page, setPageState] = useState(1);
  const [limit, setLimitState] = useState(20);

  // Refs
  const subscriptionIdRef = useRef<string | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load notifications
  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await notificationService.getNotifications(userId, filter, page, limit);
      
      if (response.success && response.data) {
        const notificationsData = Array.isArray(response.data) ? response.data : [];
        setNotifications(notificationsData);
      } else {
        setError(response.error || 'Failed to load notifications');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [userId, filter, page, limit]);

  // Load preferences
  const loadPreferences = useCallback(async () => {
    try {
      const response = await notificationService.getNotificationPreferences(userId);
      
      if (response.success && response.data) {
        const preferencesData = Array.isArray(response.data) ? response.data : [];
        setPreferences(preferencesData as unknown as NotificationPreferences[]);
      }
    } catch (err) {
      console.error('Failed to load preferences:', err);
    }
  }, [userId]);

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const response = await notificationService.getNotificationStats(userId);
      
      if (response.success && response.data) {
        setStats(response.data as NotificationStats);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, [userId]);

  // Load engagement metrics
  const loadEngagement = useCallback(async () => {
    try {
      const response = await notificationService.getEngagementMetrics(userId);
      
      if (response.success && response.data) {
        setEngagement(response.data as NotificationEngagement);
      }
    } catch (err) {
      console.error('Failed to load engagement metrics:', err);
    }
  }, [userId]);

  // Actions
  const refreshNotifications = useCallback(async () => {
    await Promise.all([
      loadNotifications(),
      loadPreferences(),
      loadStats(),
      loadEngagement()
    ]);
  }, [loadNotifications, loadPreferences, loadStats, loadEngagement]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await notificationService.markAsRead(notificationId, userId);
      
      if (response.success) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, is_read: true, read_at: new Date().toISOString() }
              : notification
          )
        );
        
        // Track the event
        await notificationService.trackNotificationEvent(notificationId, 'opened');
      } else {
        setError(response.error || 'Failed to mark notification as read');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [userId]);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await notificationService.markAllAsRead(userId);
      
      if (response.success) {
        setNotifications(prev => 
          prev.map(notification => ({ 
            ...notification, 
            is_read: true, 
            read_at: new Date().toISOString() 
          }))
        );
      } else {
        setError(response.error || 'Failed to mark all notifications as read');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [userId]);

  const dismissNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await notificationService.dismissNotification(notificationId, userId);
      
      if (response.success) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, is_dismissed: true, dismissed_at: new Date().toISOString() }
              : notification
          )
        );
        
        // Track the event
        await notificationService.trackNotificationEvent(notificationId, 'dismissed');
      } else {
        setError(response.error || 'Failed to dismiss notification');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [userId]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await notificationService.deleteNotification(notificationId);
      
      if (response.success) {
        setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
      } else {
        setError(response.error || 'Failed to delete notification');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  const updatePreferences = useCallback(async (newPreferences: UpdateNotificationPreferencesDTO[]) => {
    try {
      const response = await notificationService.updateNotificationPreferences(userId, newPreferences);
      
      if (response.success) {
        await loadPreferences();
      } else {
        setError(response.error || 'Failed to update preferences');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [userId, loadPreferences]);

  const createNotification = useCallback(async (data: CreateNotificationDTO) => {
    try {
      const response = await notificationService.createNotification(data);
      
      if (!response.success) {
        setError(response.error || 'Failed to create notification');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  // Filter and pagination
  const setFilter = useCallback((newFilter: NotificationFilter) => {
    setFilterState(newFilter);
    setPageState(1); // Reset to first page when filter changes
  }, []);

  const setPage = useCallback((newPage: number) => {
    setPageState(newPage);
  }, []);

  const setLimit = useCallback((newLimit: number) => {
    setLimitState(newLimit);
    setPageState(1); // Reset to first page when limit changes
  }, []);

  // Real-time subscriptions
  const subscribeToRealTime = useCallback(() => {
    if (!enableRealTime || subscriptionIdRef.current) return;

    const subscriptionId = notificationService.subscribeToNotifications(userId, (event: NotificationEvent) => {
      switch (event.type) {
        case 'new_notification':
          if (event.notification) {
            setNotifications(prev => [event.notification!, ...prev]);
          }
          break;
        case 'notification_read':
          if (event.notification) {
            setNotifications(prev => 
              prev.map(notification => 
                notification.id === event.notification!.id 
                  ? { ...notification, is_read: true, read_at: new Date().toISOString() }
                  : notification
              )
            );
          }
          break;
        case 'notification_dismissed':
          if (event.notification) {
            setNotifications(prev => 
              prev.map(notification => 
                notification.id === event.notification!.id 
                  ? { ...notification, is_dismissed: true, dismissed_at: new Date().toISOString() }
                  : notification
              )
            );
          }
          break;
        case 'notification_preferences_updated':
          if (event.preferences) {
            setPreferences(prev => 
              prev.map(pref => 
                pref.type === event.preferences!.type && pref.channel === event.preferences!.channel
                  ? event.preferences!
                  : pref
              )
            );
          }
          break;
      }
    });

    subscriptionIdRef.current = subscriptionId;
  }, [userId, enableRealTime]);

  const unsubscribeFromRealTime = useCallback(() => {
    if (subscriptionIdRef.current) {
      notificationService.unsubscribeFromNotifications(subscriptionIdRef.current);
      subscriptionIdRef.current = null;
    }
  }, []);

  // Push notifications
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    try {
      return await notificationService.requestNotificationPermission();
    } catch (err) {
      console.error('Failed to request notification permission:', err);
      return 'denied';
    }
  }, []);

  const subscribeToPush = useCallback(async (subscription: PushSubscription) => {
    try {
      const response = await notificationService.subscribeToPushNotifications(subscription, userId);
      
      if (!response.success) {
        setError(response.error || 'Failed to subscribe to push notifications');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [userId]);

  const unsubscribeFromPush = useCallback(async () => {
    try {
      const response = await notificationService.unsubscribeFromPushNotifications(userId);
      
      if (!response.success) {
        setError(response.error || 'Failed to unsubscribe from push notifications');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [userId]);

  // Analytics
  const trackEvent = useCallback(async (
    notificationId: string, 
    eventType: 'opened' | 'clicked' | 'dismissed', 
    metadata?: Record<string, any>
  ) => {
    try {
      await notificationService.trackNotificationEvent(notificationId, eventType, metadata);
    } catch (err) {
      console.error('Failed to track notification event:', err);
    }
  }, []);

  // Utility functions
  const getUnreadCount = useCallback(() => {
    return notifications.filter(notification => !notification.is_read && !notification.is_dismissed).length;
  }, [notifications]);

  const getNotificationsByType = useCallback((type: NotificationType) => {
    return notifications.filter(notification => notification.type === type);
  }, [notifications]);

  const getNotificationsByChannel = useCallback((channel: NotificationChannel) => {
    return notifications.filter(notification => notification.channel === channel);
  }, [notifications]);

  // Effects
  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  useEffect(() => {
    if (enableRealTime) {
      subscribeToRealTime();
    }

    return () => {
      unsubscribeFromRealTime();
    };
  }, [enableRealTime, subscribeToRealTime, unsubscribeFromRealTime]);

  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(refreshNotifications, refreshInterval);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, refreshNotifications]);

  return {
    // State
    notifications,
    preferences,
    stats,
    engagement,
    loading,
    error,
    
    // Actions
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    deleteNotification,
    updatePreferences,
    createNotification,
    
    // Filters and pagination
    setFilter,
    setPage,
    setLimit,
    
    // Real-time
    subscribeToRealTime,
    unsubscribeFromRealTime,
    
    // Push notifications
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    
    // Analytics
    trackEvent,
    
    // Utility
    getUnreadCount,
    getNotificationsByType,
    getNotificationsByChannel,
  };
}

// Hook for managing notification preferences
export function useNotificationPreferences(userId: string) {
  const [preferences, setPreferences] = useState<NotificationPreferences[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPreferences = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await notificationService.getNotificationPreferences(userId);
      
      if (response.success && response.data) {
        const preferencesData = Array.isArray(response.data) ? response.data : [];
        // Convert Notification[] to NotificationPreferences[] safely
        const convertedPreferences = preferencesData.map((item: any) => ({
          id: item.id || '',
          user_id: item.user_id || '',
          type: item.type || 'new_message',
          channel: item.channel || 'in_app',
          enabled: item.enabled !== undefined ? item.enabled : true,
          frequency: item.frequency || 'immediate',
          timezone: item.timezone || 'UTC',
          quiet_hours_start: item.quiet_hours_start || null,
          quiet_hours_end: item.quiet_hours_end || null,
          channel_preferences: item.channel_preferences || {},
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || new Date().toISOString()
        }));
        setPreferences(convertedPreferences);
      } else {
        setError(response.error || 'Failed to load preferences');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const updatePreferences = useCallback(async (newPreferences: UpdateNotificationPreferencesDTO[]) => {
    try {
      const response = await notificationService.updateNotificationPreferences(userId, newPreferences);
      
      if (response.success) {
        await loadPreferences();
      } else {
        setError(response.error || 'Failed to update preferences');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [userId, loadPreferences]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    refreshPreferences: loadPreferences,
  };
}

// Hook for notification analytics
export function useNotificationAnalytics(userId: string) {
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [engagement, setEngagement] = useState<NotificationEngagement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsResponse, engagementResponse] = await Promise.all([
        notificationService.getNotificationStats(userId),
        notificationService.getEngagementMetrics(userId)
      ]);

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data as NotificationStats);
      }

      if (engagementResponse.success && engagementResponse.data) {
        setEngagement(engagementResponse.data as NotificationEngagement);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  return {
    stats,
    engagement,
    loading,
    error,
    refreshAnalytics: loadAnalytics,
  };
}
