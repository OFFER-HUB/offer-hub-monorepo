import type {
  Notification,
  NotificationType,
  NotificationChannel,
  NotificationPriority,
  NotificationFilter,
  CreateNotificationDTO,
  NotificationStats
} from '../types/message-notifications.types';

// Notification Content Generation
export const generateNotificationContent = (
  type: NotificationType,
  data: Record<string, unknown>
): { title: string; content: string; actionText?: string; actionUrl?: string } => {
  const templates = {
    new_message: {
      title: 'New Message',
      content: `You have a new message from ${data.senderName || 'a user'}`,
      actionText: 'View Message',
      actionUrl: `/messages/${data.conversationId}`
    },
    payment_received: {
      title: 'Payment Received',
      content: `${data.amount || 'Payment'} has been credited to your account for ${data.projectName || 'project'}`,
      actionText: 'View Transaction',
      actionUrl: `/wallet/transactions/${data.transactionId}`
    },
    payment_sent: {
      title: 'Payment Sent',
      content: `Payment of ${data.amount || 'amount'} sent successfully to ${data.recipientName || 'recipient'}`,
      actionText: 'View Transaction',
      actionUrl: `/wallet/transactions/${data.transactionId}`
    },
    milestone_approved: {
      title: 'Milestone Approved',
      content: `Milestone "${data.milestoneName || 'milestone'}" has been approved by ${data.clientName || 'client'}`,
      actionText: 'View Project',
      actionUrl: `/projects/${data.projectId}`
    },
    milestone_rejected: {
      title: 'Milestone Rejected',
      content: `Milestone "${data.milestoneName || 'milestone'}" needs revision. ${data.feedback || 'Please review the feedback.'}`,
      actionText: 'View Feedback',
      actionUrl: `/projects/${data.projectId}/milestones/${data.milestoneId}`
    },
    dispute_opened: {
      title: 'Dispute Opened',
      content: `A dispute has been opened for project "${data.projectName || 'project'}" by ${data.disputantName || 'a party'}`,
      actionText: 'View Dispute',
      actionUrl: `/disputes/${data.disputeId}`
    },
    dispute_resolved: {
      title: 'Dispute Resolved',
      content: `Dispute for "${data.projectName || 'project'}" has been resolved in favor of ${data.winnerName || 'one party'}`,
      actionText: 'View Resolution',
      actionUrl: `/disputes/${data.disputeId}`
    },
    deadline_reminder: {
      title: 'Deadline Reminder',
      content: `Reminder: ${data.projectName || 'Project'} deadline is approaching (${data.daysLeft || 'X'} days left)`,
      actionText: 'View Project',
      actionUrl: `/projects/${data.projectId}`
    },
    security_alert: {
      title: 'Security Alert',
      content: `Security alert: ${data.alertType || 'Suspicious activity'} detected from ${data.location || 'unknown location'}`,
      actionText: 'Secure Account',
      actionUrl: '/security'
    },
    feature_announcement: {
      title: 'New Feature Available',
      content: `${data.featureName || 'A new feature'} is now available on OfferHub`,
      actionText: 'Learn More',
      actionUrl: data.featureUrl || '/features'
    }
  };

  return templates[type as keyof typeof templates] || {
    title: 'Notification',
    content: 'You have a new notification',
    actionText: 'View',
    actionUrl: '/notifications'
  };
};

// Priority Calculation
export const calculateNotificationPriority = (
  type: NotificationType,
  context: Record<string, unknown>
): NotificationPriority => {
  // High priority notifications
  if (['dispute_opened', 'security_alert', 'payment_received'].includes(type)) {
    return 'high';
  }

  // Urgent notifications
  if (type === 'security_alert' && context.severity === 'critical') {
    return 'urgent';
  }

  if (type === 'deadline_reminder' && context.daysLeft <= 1) {
    return 'high';
  }

  // Normal priority for most notifications
  if (['new_message', 'milestone_approved', 'milestone_rejected', 'dispute_resolved'].includes(type)) {
    return 'normal';
  }

  // Low priority for informational notifications
  if (['feature_announcement', 'payment_sent'].includes(type)) {
    return 'low';
  }

  return 'normal';
};

// Channel Selection Logic
export const selectOptimalChannels = (
  type: NotificationType,
  userPreferences: NotificationPreferences[],
  urgency: NotificationPriority
): NotificationChannel[] => {
  // const availableChannels: NotificationChannel[] = ['push', 'email', 'sms', 'in_app'];
  
  // Get user preferences for this notification type
  const preferences = userPreferences.filter(p => p.type === type && p.enabled);
  
  if (preferences.length === 0) {
    // Default to in-app if no preferences set
    return ['in_app'];
  }

  // For urgent notifications, try to use multiple channels
  if (urgency === 'urgent') {
    const urgentChannels = preferences
      .filter(p => ['push', 'sms', 'in_app'].includes(p.channel))
      .map(p => p.channel);
    
    return urgentChannels.length > 0 ? urgentChannels : ['in_app'];
  }

  // For high priority, prefer push and email
  if (urgency === 'high') {
    const highPriorityChannels = preferences
      .filter(p => ['push', 'email', 'in_app'].includes(p.channel))
      .map(p => p.channel);
    
    return highPriorityChannels.length > 0 ? highPriorityChannels : ['in_app'];
  }

  // For normal and low priority, use user's preferred channels
  return preferences.map(p => p.channel);
};

// Time-based Filtering
export const shouldSendNotification = (
  notification: CreateNotificationDTO,
  preferences: NotificationPreferences[]
): boolean => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinute;

  // Check if notification type is enabled
  const typePreferences = preferences.filter(p => p.type === notification.type);
  if (typePreferences.length === 0 || !typePreferences.some(p => p.enabled)) {
    return false;
  }

  // Check quiet hours
  const relevantPreference = typePreferences.find(p => p.channel === notification.channel);
  if (relevantPreference && relevantPreference.quiet_hours_start && relevantPreference.quiet_hours_end) {
    const startTime = parseTime(relevantPreference.quiet_hours_start);
    const endTime = parseTime(relevantPreference.quiet_hours_end);
    
    if (isWithinQuietHours(currentTime, startTime, endTime)) {
      return false;
    }
  }

  return true;
};

// Frequency Control
export const shouldThrottleNotification = (
  userId: string,
  type: NotificationType,
  channel: NotificationChannel,
  recentNotifications: Notification[],
  maxPerHour: number = 5
): boolean => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  const recentCount = recentNotifications.filter(n => 
    n.user_id === userId &&
    n.type === type &&
    n.channel === channel &&
    new Date(n.created_at) > oneHourAgo
  ).length;

  return recentCount >= maxPerHour;
};

// Batch Processing
export const batchNotifications = (
  notifications: CreateNotificationDTO[],
  batchSize: number = 100
): CreateNotificationDTO[][] => {
  const batches: CreateNotificationDTO[][] = [];
  
  for (let i = 0; i < notifications.length; i += batchSize) {
    batches.push(notifications.slice(i, i + batchSize));
  }
  
  return batches;
};

// Smart Batching by User
export const batchNotificationsByUser = (
  notifications: CreateNotificationDTO[]
): Record<string, CreateNotificationDTO[]> => {
  const userBatches: Record<string, CreateNotificationDTO[]> = {};
  
  notifications.forEach(notification => {
    if (!userBatches[notification.user_id]) {
      userBatches[notification.user_id] = [];
    }
    userBatches[notification.user_id].push(notification);
  });
  
  return userBatches;
};

// Notification Deduplication
export const deduplicateNotifications = (
  notifications: CreateNotificationDTO[]
): CreateNotificationDTO[] => {
  const seen = new Set<string>();
  
  return notifications.filter(notification => {
    const key = `${notification.user_id}-${notification.type}-${notification.content}`;
    
    if (seen.has(key)) {
      return false;
    }
    
    seen.add(key);
    return true;
  });
};

// Content Optimization
export const optimizeNotificationContent = (
  content: string,
  maxLength: number = 160
): string => {
  if (content.length <= maxLength) {
    return content;
  }
  
  // Try to truncate at word boundary
  const truncated = content.substring(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
};

// Analytics Helpers
export const calculateEngagementRate = (
  notifications: Notification[]
): number => {
  if (notifications.length === 0) return 0;
  
  const engaged = notifications.filter(n => n.is_read || n.dismissed_at).length;
  return engaged / notifications.length;
};

export const calculateResponseTime = (
  notifications: Notification[]
): number => {
  const readNotifications = notifications.filter(n => n.read_at);
  
  if (readNotifications.length === 0) return 0;
  
  const totalTime = readNotifications.reduce((sum, n) => {
    const created = new Date(n.created_at).getTime();
    const read = new Date(n.read_at!).getTime();
    return sum + (read - created);
  }, 0);
  
  return totalTime / readNotifications.length;
};

export const generateNotificationStats = (
  notifications: Notification[]
): NotificationStats => {
  const total = notifications.length;
  const unread = notifications.filter(n => !n.is_read && !n.is_dismissed).length;
  
  const byType = notifications.reduce((acc, n) => {
    acc[n.type] = (acc[n.type] || 0) + 1;
    return acc;
  }, {} as Record<NotificationType, number>);
  
  const byChannel = notifications.reduce((acc, n) => {
    acc[n.channel] = (acc[n.channel] || 0) + 1;
    return acc;
  }, {} as Record<NotificationChannel, number>);
  
  const byStatus = notifications.reduce((acc, n) => {
    acc[n.status] = (acc[n.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const engagementRate = calculateEngagementRate(notifications);
  const responseTime = calculateResponseTime(notifications);
  
  return {
    total_notifications: total,
    unread_notifications: unread,
    notifications_by_type: byType,
    notifications_by_channel: byChannel,
    notifications_by_status: byStatus,
    engagement_metrics: {
      open_rate: engagementRate,
      click_rate: 0, // Would need click tracking data
      dismissal_rate: notifications.filter(n => n.is_dismissed).length / total,
      avg_response_time: responseTime
    },
    delivery_metrics: {
      delivery_rate: notifications.filter(n => n.status === 'delivered' || n.status === 'read').length / total,
      failure_rate: notifications.filter(n => n.status === 'failed').length / total,
      avg_delivery_time: 0 // Would need delivery timestamp data
    }
  };
};

// Filter Helpers
export const applyNotificationFilter = (
  notifications: Notification[],
  filter: NotificationFilter
): Notification[] => {
  return notifications.filter(notification => {
    // Type filter
    if (filter.types && filter.types.length > 0 && !filter.types.includes(notification.type)) {
      return false;
    }
    
    // Channel filter
    if (filter.channels && filter.channels.length > 0 && !filter.channels.includes(notification.channel)) {
      return false;
    }
    
    // Status filter
    if (filter.status && filter.status.length > 0 && !filter.status.includes(notification.status)) {
      return false;
    }
    
    // Priority filter
    if (filter.priority && filter.priority.length > 0 && !filter.priority.includes(notification.priority)) {
      return false;
    }
    
    // Date range filter
    if (filter.date_from) {
      const fromDate = new Date(filter.date_from);
      const notificationDate = new Date(notification.created_at);
      if (notificationDate < fromDate) return false;
    }
    
    if (filter.date_to) {
      const toDate = new Date(filter.date_to);
      const notificationDate = new Date(notification.created_at);
      if (notificationDate > toDate) return false;
    }
    
    // Read status filter
    if (filter.is_read !== undefined && notification.is_read !== filter.is_read) {
      return false;
    }
    
    // Dismissed status filter
    if (filter.is_dismissed !== undefined && notification.is_dismissed !== filter.is_dismissed) {
      return false;
    }
    
    // Search filter
    if (filter.search) {
      const searchTerm = filter.search.toLowerCase();
      const matches = (
        notification.title.toLowerCase().includes(searchTerm) ||
        notification.content.toLowerCase().includes(searchTerm) ||
        notification.type.toLowerCase().includes(searchTerm)
      );
      if (!matches) return false;
    }
    
    return true;
  });
};

// Utility Functions
const parseTime = (timeString: string): number => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

const isWithinQuietHours = (currentTime: number, startTime: number, endTime: number): boolean => {
  // Handle overnight quiet hours (e.g., 22:00 to 08:00)
  if (startTime > endTime) {
    return currentTime >= startTime || currentTime <= endTime;
  }
  
  // Handle same-day quiet hours (e.g., 22:00 to 23:00)
  return currentTime >= startTime && currentTime <= endTime;
};

// Export/Import Helpers
export const exportNotificationsToCSV = (notifications: Notification[]): string => {
  const headers = [
    'ID',
    'Type',
    'Channel',
    'Title',
    'Content',
    'Priority',
    'Status',
    'Created At',
    'Read At',
    'Dismissed At',
    'Action URL'
  ];
  
  const rows = notifications.map(n => [
    n.id,
    n.type,
    n.channel,
    n.title,
    n.content.replace(/\n/g, ' '),
    n.priority,
    n.status,
    n.created_at,
    n.read_at || '',
    n.dismissed_at || '',
    n.action_url || ''
  ]);
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
  
  return csvContent;
};

export const exportNotificationsToJSON = (notifications: Notification[]): string => {
  return JSON.stringify(notifications, null, 2);
};

// Validation Helpers
export const validateNotificationData = (data: CreateNotificationDTO): string[] => {
  const errors: string[] = [];
  
  if (!data.user_id || data.user_id.trim() === '') {
    errors.push('User ID is required');
  }
  
  if (!data.type) {
    errors.push('Notification type is required');
  }
  
  if (!data.channel) {
    errors.push('Notification channel is required');
  }
  
  if (!data.title || data.title.trim() === '') {
    errors.push('Title is required');
  }
  
  if (!data.content || data.content.trim() === '') {
    errors.push('Content is required');
  }
  
  if (data.title && data.title.length > 200) {
    errors.push('Title must be less than 200 characters');
  }
  
  if (data.content && data.content.length > 1000) {
    errors.push('Content must be less than 1000 characters');
  }
  
  return errors;
};

// Performance Helpers
export const optimizeNotificationDelivery = (
  notifications: CreateNotificationDTO[]
): CreateNotificationDTO[] => {
  // Remove duplicates
  const deduplicated = deduplicateNotifications(notifications);
  
  // Sort by priority (urgent first)
  const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
  const sorted = deduplicated.sort((a, b) => {
    const priorityA = priorityOrder[a.priority || 'normal'];
    const priorityB = priorityOrder[b.priority || 'normal'];
    return priorityA - priorityB;
  });
  
  // Optimize content length
  return sorted.map(n => ({
    ...n,
    title: optimizeNotificationContent(n.title, 100),
    content: optimizeNotificationContent(n.content, 160)
  }));
};

// Mobile-specific Helpers
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

export const shouldUseMobileOptimizations = (): boolean => {
  return isMobileDevice() || window.innerWidth < 768;
};

// Notification Sound Helpers
export const playNotificationSound = (type: NotificationType): void => {
  if (typeof window === 'undefined') return;
  
  const audio = new Audio();
  
  // Different sounds for different notification types
  const soundMap = {
    new_message: '/sounds/message.mp3',
    payment_received: '/sounds/payment.mp3',
    dispute_opened: '/sounds/alert.mp3',
    security_alert: '/sounds/security.mp3'
  };
  
  audio.src = soundMap[type as keyof typeof soundMap] || '/sounds/default.mp3';
  audio.volume = 0.5;
  
  try {
    audio.play().catch(() => {
      // Ignore errors (user might not have interacted with page)
    });
  } catch {
    // Ignore audio play errors
  }
};

// Browser Notification Helpers
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    return 'denied';
  }
  
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  
  if (Notification.permission === 'denied') {
    return 'denied';
  }
  
  return await Notification.requestPermission();
};

export const showBrowserNotification = (
  title: string,
  options: NotificationOptions = {}
): void => {
  if (Notification.permission !== 'granted') return;
  
  const notification = new Notification(title, {
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    ...options
  });
  
  // Auto-close after 5 seconds
  setTimeout(() => {
    notification.close();
  }, 5000);
  
  // Handle click
  notification.onclick = () => {
    window.focus();
    notification.close();
  };
};
