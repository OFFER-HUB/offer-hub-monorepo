import axios, { AxiosError } from 'axios';
import type {
  Notification,
  NotificationTemplate,
  NotificationPreferences,
  NotificationBatch,
  NotificationAnalytics,
  NotificationEngagement,
  NotificationDeliveryStatus,
  NotificationFilter,
  NotificationStats,
  CreateNotificationDTO,
  UpdateNotificationPreferencesDTO,
  NotificationServiceConfig,
  NotificationWebhookPayload,
  NotificationResponse,
  NotificationEvent,
  NotificationChannel,
  NotificationType,
  NotificationStatus,
  NotificationPriority
} from '../types/message-notifications.types';

const API_BASE = '/api/notifications';

class NotificationService {
  private config: NotificationServiceConfig;
  private eventListeners: Map<string, (event: NotificationEvent) => void> = new Map();

  constructor(config?: Partial<NotificationServiceConfig>) {
    this.config = {
      push_notifications: {
        vapid_public_key: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
        vapid_private_key: process.env.VAPID_PRIVATE_KEY || '',
        endpoint: process.env.NEXT_PUBLIC_PUSH_ENDPOINT || '',
      },
      email_service: {
        provider: 'sendgrid',
        api_key: process.env.SENDGRID_API_KEY || '',
        from_email: process.env.FROM_EMAIL || 'noreply@offerhub.com',
        from_name: 'OfferHub',
      },
      sms_service: {
        provider: 'twilio',
        api_key: process.env.TWILIO_API_KEY || '',
        from_number: process.env.TWILIO_FROM_NUMBER || '',
      },
      batch_processing: {
        batch_size: 100,
        processing_interval: 5000,
        max_retries: 3,
        retry_delay: 1000,
      },
      analytics: {
        tracking_enabled: true,
        retention_days: 90,
      },
      ...config,
    };
  }

  // Notification CRUD Operations
  async createNotification(data: CreateNotificationDTO): Promise<NotificationResponse> {
    try {
      const response = await axios.post<NotificationResponse>(`${API_BASE}`, data);
      return response.data;
    } catch (error) {
      return this.handleError(error, 'Failed to create notification');
    }
  }

  async getNotifications(
    userId: string,
    filter?: NotificationFilter,
    page: number = 1,
    limit: number = 20
  ): Promise<NotificationResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filter && { filter: JSON.stringify(filter) }),
      });
      
      const response = await axios.get<NotificationResponse>(`${API_BASE}/user/${userId}?${params}`);
      return response.data;
    } catch (error) {
      return this.handleError(error, 'Failed to fetch notifications');
    }
  }

  async getNotificationById(notificationId: string): Promise<NotificationResponse> {
    try {
      const response = await axios.get<NotificationResponse>(`${API_BASE}/${notificationId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error, 'Failed to fetch notification');
    }
  }

  async markAsRead(notificationId: string, userId: string): Promise<NotificationResponse> {
    try {
      const response = await axios.patch<NotificationResponse>(`${API_BASE}/${notificationId}/read`, {
        user_id: userId,
      });
      return response.data;
    } catch (error) {
      return this.handleError(error, 'Failed to mark notification as read');
    }
  }

  async markAllAsRead(userId: string): Promise<NotificationResponse> {
    try {
      const response = await axios.patch<NotificationResponse>(`${API_BASE}/user/${userId}/read-all`);
      return response.data;
    } catch (error) {
      return this.handleError(error, 'Failed to mark all notifications as read');
    }
  }

  async dismissNotification(notificationId: string, userId: string): Promise<NotificationResponse> {
    try {
      const response = await axios.patch<NotificationResponse>(`${API_BASE}/${notificationId}/dismiss`, {
        user_id: userId,
      });
      return response.data;
    } catch (error) {
      return this.handleError(error, 'Failed to dismiss notification');
    }
  }

  async deleteNotification(notificationId: string): Promise<NotificationResponse> {
    try {
      const response = await axios.delete<NotificationResponse>(`${API_BASE}/${notificationId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error, 'Failed to delete notification');
    }
  }

  // Notification Preferences
  async getNotificationPreferences(userId: string): Promise<NotificationResponse> {
    try {
      const response = await axios.get<NotificationResponse>(`${API_BASE}/preferences/${userId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error, 'Failed to fetch notification preferences');
    }
  }

  async updateNotificationPreferences(
    userId: string,
    preferences: UpdateNotificationPreferencesDTO[]
  ): Promise<NotificationResponse> {
    try {
      const response = await axios.put<NotificationResponse>(`${API_BASE}/preferences/${userId}`, {
        preferences,
      });
      return response.data;
    } catch (error) {
      return this.handleError(error, 'Failed to update notification preferences');
    }
  }

  // Batch Operations
  async createNotificationBatch(notifications: CreateNotificationDTO[]): Promise<NotificationResponse> {
    try {
      const response = await axios.post<NotificationResponse>(`${API_BASE}/batch`, {
        notifications,
      });
      return response.data;
    } catch (error) {
      return this.handleError(error, 'Failed to create notification batch');
    }
  }

  async getBatchStatus(batchId: string): Promise<NotificationResponse> {
    try {
      const response = await axios.get<NotificationResponse>(`${API_BASE}/batch/${batchId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error, 'Failed to fetch batch status');
    }
  }

  // Analytics and Engagement
  async getNotificationStats(userId?: string): Promise<NotificationResponse> {
    try {
      const url = userId ? `${API_BASE}/stats/${userId}` : `${API_BASE}/stats`;
      const response = await axios.get<NotificationResponse>(url);
      return response.data;
    } catch (error) {
      return this.handleError(error, 'Failed to fetch notification stats');
    }
  }

  async getEngagementMetrics(userId: string): Promise<NotificationResponse> {
    try {
      const response = await axios.get<NotificationResponse>(`${API_BASE}/engagement/${userId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error, 'Failed to fetch engagement metrics');
    }
  }

  async trackNotificationEvent(
    notificationId: string,
    eventType: 'opened' | 'clicked' | 'dismissed',
    metadata?: Record<string, unknown>
  ): Promise<NotificationResponse> {
    try {
      const response = await axios.post<NotificationResponse>(`${API_BASE}/track`, {
        notification_id: notificationId,
        event_type: eventType,
        metadata,
      });
      return response.data;
    } catch (error) {
      return this.handleError(error, 'Failed to track notification event');
    }
  }

  // Push Notification Support
  async subscribeToPushNotifications(subscription: PushSubscription, userId: string): Promise<NotificationResponse> {
    try {
      const response = await axios.post<NotificationResponse>(`${API_BASE}/push/subscribe`, {
        subscription: subscription.toJSON(),
        user_id: userId,
      });
      return response.data;
    } catch (error) {
      return this.handleError(error, 'Failed to subscribe to push notifications');
    }
  }

  async unsubscribeFromPushNotifications(userId: string): Promise<NotificationResponse> {
    try {
      const response = await axios.delete<NotificationResponse>(`${API_BASE}/push/subscribe/${userId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error, 'Failed to unsubscribe from push notifications');
    }
  }

  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications');
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  // Template Management
  async getNotificationTemplates(): Promise<NotificationResponse> {
    try {
      const response = await axios.get<NotificationResponse>(`${API_BASE}/templates`);
      return response.data;
    } catch (error) {
      return this.handleError(error, 'Failed to fetch notification templates');
    }
  }

  async createNotificationTemplate(template: Omit<NotificationTemplate, 'id'>): Promise<NotificationResponse> {
    try {
      const response = await axios.post<NotificationResponse>(`${API_BASE}/templates`, template);
      return response.data;
    } catch (error) {
      return this.handleError(error, 'Failed to create notification template');
    }
  }

  // Real-time Events
  subscribeToNotifications(userId: string, callback: (event: NotificationEvent) => void): string {
    const subscriptionId = `notification_${userId}_${Date.now()}`;
    this.eventListeners.set(subscriptionId, callback);

    // In a real implementation, you would establish a WebSocket connection here
    // For now, we'll simulate with polling
    this.startNotificationPolling(userId, subscriptionId);

    return subscriptionId;
  }

  unsubscribeFromNotifications(subscriptionId: string): void {
    this.eventListeners.delete(subscriptionId);
  }

  private startNotificationPolling(userId: string, subscriptionId: string): void {
    const pollInterval = setInterval(async () => {
      if (!this.eventListeners.has(subscriptionId)) {
        clearInterval(pollInterval);
        return;
      }

      try {
        const response = await this.getNotifications(userId, { is_read: false }, 1, 10);
        if (response.success && response.data && Array.isArray(response.data)) {
          const unreadNotifications = response.data.filter(n => !n.is_read);
          if (unreadNotifications.length > 0) {
            const callback = this.eventListeners.get(subscriptionId);
            if (callback) {
              unreadNotifications.forEach(notification => {
                callback({
                  type: 'new_notification',
                  user_id: userId,
                  notification,
                  timestamp: new Date().toISOString(),
                });
              });
            }
          }
        }
      } catch (error) {
        console.error('Error polling notifications:', error);
      }
    }, 5000); // Poll every 5 seconds
  }

  // Utility Methods
  private handleError(error: unknown, defaultMessage: string): NotificationResponse {
    let errorMessage = defaultMessage;
    
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.data && typeof axiosError.response.data === 'object') {
        const errorData = axiosError.response.data as Record<string, unknown>;
        errorMessage = errorData.message || errorMessage;
      } else if (axiosError.message) {
        errorMessage = axiosError.message;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      success: false,
      message: errorMessage,
      error: errorMessage,
    };
  }

  // Smart Notification Routing
  async routeNotification(
    userId: string,
    type: NotificationType,
    content: string,
    priority: NotificationPriority = 'normal'
  ): Promise<NotificationResponse> {
    try {
      // Get user preferences
      const preferencesResponse = await this.getNotificationPreferences(userId);
      if (!preferencesResponse.success || !preferencesResponse.data) {
        throw new Error('Failed to get user preferences');
      }

      const preferences = Array.isArray(preferencesResponse.data) 
        ? preferencesResponse.data as unknown as NotificationPreferences[]
        : [];

      // Determine best channel based on preferences and priority
      const enabledChannels = preferences
        .filter(p => p.enabled && p.type === type)
        .map(p => p.channel);

      if (enabledChannels.length === 0) {
        // Default to in-app notification
        enabledChannels.push('in_app');
      }

      // Create notifications for each enabled channel
      const notifications: CreateNotificationDTO[] = enabledChannels.map(channel => ({
        user_id: userId,
        type,
        channel,
        title: this.generateNotificationTitle(type),
        content,
        priority,
      }));

      return await this.createNotificationBatch(notifications);
    } catch (error) {
      return this.handleError(error, 'Failed to route notification');
    }
  }

  private generateNotificationTitle(type: NotificationType): string {
    const titles: Record<NotificationType, string> = {
      new_message: 'New Message',
      message_read: 'Message Read',
      project_update: 'Project Update',
      payment_received: 'Payment Received',
      payment_sent: 'Payment Sent',
      milestone_approved: 'Milestone Approved',
      milestone_rejected: 'Milestone Rejected',
      dispute_opened: 'Dispute Opened',
      dispute_resolved: 'Dispute Resolved',
      contract_signed: 'Contract Signed',
      deadline_reminder: 'Deadline Reminder',
      security_alert: 'Security Alert',
      system_maintenance: 'System Maintenance',
      feature_announcement: 'New Feature',
    };

    return titles[type] || 'Notification';
  }

  // Performance Optimization
  async optimizeNotificationDelivery(): Promise<NotificationResponse> {
    try {
      const response = await axios.post<NotificationResponse>(`${API_BASE}/optimize`);
      return response.data;
    } catch (error) {
      return this.handleError(error, 'Failed to optimize notification delivery');
    }
  }

  // Cleanup and Maintenance
  async cleanupExpiredNotifications(): Promise<NotificationResponse> {
    try {
      const response = await axios.delete<NotificationResponse>(`${API_BASE}/cleanup`);
      return response.data;
    } catch (error) {
      return this.handleError(error, 'Failed to cleanup expired notifications');
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

// Export class for custom configurations
export default NotificationService;
