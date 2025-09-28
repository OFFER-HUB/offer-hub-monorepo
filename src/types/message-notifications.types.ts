export type NotificationChannel = 'push' | 'email' | 'in_app' | 'sms';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';
export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | 'dismissed';
export type NotificationType = 
  | 'new_message' 
  | 'message_read' 
  | 'project_update' 
  | 'payment_received' 
  | 'payment_sent' 
  | 'milestone_approved' 
  | 'milestone_rejected' 
  | 'dispute_opened' 
  | 'dispute_resolved' 
  | 'contract_signed' 
  | 'deadline_reminder' 
  | 'security_alert' 
  | 'system_maintenance' 
  | 'feature_announcement';

export interface NotificationTemplate {
  id: string;
  type: NotificationType;
  channel: NotificationChannel;
  subject?: string;
  title: string;
  body: string;
  action_url?: string;
  action_text?: string;
  icon?: string;
  sound?: string;
  badge_count?: number;
  priority: NotificationPriority;
  expires_at?: string;
  metadata?: Record<string, any>;
}

export interface Notification {
  id: string;
  user_id: string;
  template_id: string;
  type: NotificationType;
  channel: NotificationChannel;
  status: NotificationStatus;
  title: string;
  content: string;
  action_url?: string;
  action_text?: string;
  icon?: string;
  priority: NotificationPriority;
  is_read: boolean;
  is_dismissed: boolean;
  metadata?: Record<string, any>;
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  dismissed_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  type: NotificationType;
  channel: NotificationChannel;
  enabled: boolean;
  frequency: 'instant' | 'daily' | 'weekly' | 'never';
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationBatch {
  id: string;
  notifications: Notification[];
  total_count: number;
  processed_count: number;
  failed_count: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  processed_at?: string;
}

export interface NotificationAnalytics {
  notification_id: string;
  user_id: string;
  event_type: 'sent' | 'delivered' | 'opened' | 'clicked' | 'dismissed';
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface NotificationEngagement {
  user_id: string;
  total_notifications: number;
  read_notifications: number;
  clicked_notifications: number;
  dismissed_notifications: number;
  engagement_rate: number;
  avg_response_time: number;
  preferred_channels: NotificationChannel[];
  preferred_times: string[];
  created_at: string;
  updated_at: string;
}

export interface NotificationDeliveryStatus {
  notification_id: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  error_message?: string;
  retry_count: number;
  max_retries: number;
  next_retry_at?: string;
  delivered_at?: string;
}

export interface NotificationFilter {
  types?: NotificationType[];
  channels?: NotificationChannel[];
  status?: NotificationStatus[];
  priority?: NotificationPriority[];
  date_from?: string;
  date_to?: string;
  is_read?: boolean;
  is_dismissed?: boolean;
  search?: string;
}

export interface NotificationStats {
  total_notifications: number;
  unread_notifications: number;
  notifications_by_type: Record<NotificationType, number>;
  notifications_by_channel: Record<NotificationChannel, number>;
  notifications_by_status: Record<NotificationStatus, number>;
  engagement_metrics: {
    open_rate: number;
    click_rate: number;
    dismissal_rate: number;
    avg_response_time: number;
  };
  delivery_metrics: {
    delivery_rate: number;
    failure_rate: number;
    avg_delivery_time: number;
  };
}

export interface CreateNotificationDTO {
  user_id: string;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  content: string;
  action_url?: string;
  action_text?: string;
  icon?: string;
  priority?: NotificationPriority;
  metadata?: Record<string, any>;
  expires_at?: string;
}

export interface UpdateNotificationPreferencesDTO {
  type: NotificationType;
  channel: NotificationChannel;
  enabled: boolean;
  frequency?: 'instant' | 'daily' | 'weekly' | 'never';
  quiet_hours_start?: string;
  quiet_hours_end?: string;
}

export interface NotificationServiceConfig {
  push_notifications: {
    vapid_public_key: string;
    vapid_private_key: string;
    endpoint: string;
  };
  email_service: {
    provider: 'sendgrid' | 'ses' | 'mailgun';
    api_key: string;
    from_email: string;
    from_name: string;
  };
  sms_service: {
    provider: 'twilio' | 'aws_sns';
    api_key: string;
    from_number: string;
  };
  batch_processing: {
    batch_size: number;
    processing_interval: number;
    max_retries: number;
    retry_delay: number;
  };
  analytics: {
    tracking_enabled: boolean;
    retention_days: number;
  };
}

export interface NotificationWebhookPayload {
  event_type: 'notification_sent' | 'notification_delivered' | 'notification_opened' | 'notification_clicked' | 'notification_dismissed';
  notification_id: string;
  user_id: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface NotificationResponse {
  success: boolean;
  message: string;
  data?: Notification | Notification[] | NotificationStats | NotificationEngagement;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// Real-time notification events for WebSocket
export interface NotificationEvent {
  type: 'new_notification' | 'notification_read' | 'notification_dismissed' | 'notification_preferences_updated';
  user_id: string;
  notification?: Notification;
  preferences?: NotificationPreferences;
  timestamp: string;
}
