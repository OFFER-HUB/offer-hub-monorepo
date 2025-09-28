import type {
  Notification,
  CreateNotificationDTO,
  NotificationPreferences,
  NotificationBatch,
  NotificationType,
  NotificationChannel,
  NotificationPriority
} from '../types/message-notifications.types';

// Performance Configuration
interface PerformanceConfig {
  batchSize: number;
  maxConcurrentBatches: number;
  retryAttempts: number;
  retryDelay: number;
  rateLimitPerMinute: number;
  queueMaxSize: number;
  priorityThresholds: {
    urgent: number;
    high: number;
    normal: number;
    low: number;
  };
}

const DEFAULT_CONFIG: PerformanceConfig = {
  batchSize: 100,
  maxConcurrentBatches: 5,
  retryAttempts: 3,
  retryDelay: 1000,
  rateLimitPerMinute: 1000,
  queueMaxSize: 10000,
  priorityThresholds: {
    urgent: 0,
    high: 100,
    normal: 500,
    low: 1000
  }
};

// Notification Queue Management
class NotificationQueue {
  private queue: CreateNotificationDTO[] = [];
  private processing: boolean = false;
  private config: PerformanceConfig;
  private rateLimiter: Map<string, number> = new Map();

  constructor(config: PerformanceConfig = DEFAULT_CONFIG) {
    this.config = config;
  }

  // Add notifications to queue with priority
  enqueue(notifications: CreateNotificationDTO[]): void {
    // Sort by priority
    const sorted = notifications.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
      const aPriority = priorityOrder[a.priority || 'normal'];
      const bPriority = priorityOrder[b.priority || 'normal'];
      return aPriority - bPriority;
    });

    // Add to queue
    this.queue.push(...sorted);

    // Trim queue if it exceeds max size
    if (this.queue.length > this.config.queueMaxSize) {
      this.queue = this.queue.slice(0, this.config.queueMaxSize);
    }

    // Start processing if not already running
    if (!this.processing) {
      this.process();
    }
  }

  // Process queue with rate limiting
  private async process(): Promise<void> {
    this.processing = true;

    while (this.queue.length > 0) {
      // Check rate limit
      if (this.isRateLimited()) {
        await this.delay(this.config.retryDelay);
        continue;
      }

      // Get batch
      const batch = this.queue.splice(0, this.config.batchSize);
      if (batch.length === 0) break;

      // Process batch asynchronously
      this.processBatch(batch).catch(error => {
        console.error('Batch processing failed:', error);
        // Re-queue failed notifications (up to retry limit)
        batch.forEach(notification => {
          if (this.getRetryCount(notification) < this.config.retryAttempts) {
            this.queue.unshift(notification);
          }
        });
      });

      // Rate limiting delay
      await this.delay(1000 / (this.config.rateLimitPerMinute / 60));
    }

    this.processing = false;
  }

  // Process a single batch
  private async processBatch(batch: CreateNotificationDTO[]): Promise<void> {
    const batches = this.groupByChannel(batch);
    
    // Process each channel batch concurrently
    const promises = Object.entries(batches).map(([channel, notifications]) =>
      this.processChannelBatch(channel as NotificationChannel, notifications)
    );

    await Promise.allSettled(promises);
  }

  // Process notifications for a specific channel
  private async processChannelBatch(
    channel: NotificationChannel,
    notifications: CreateNotificationDTO[]
  ): Promise<void> {
    switch (channel) {
      case 'push':
        await this.processPushNotifications(notifications);
        break;
      case 'email':
        await this.processEmailNotifications(notifications);
        break;
      case 'sms':
        await this.processSMSNotifications(notifications);
        break;
      case 'in_app':
        await this.processInAppNotifications(notifications);
        break;
    }
  }

  // Channel-specific processing methods
  private async processPushNotifications(notifications: CreateNotificationDTO[]): Promise<void> {
    // Group by user for batch processing
    const userBatches = this.groupByUser(notifications);
    
    for (const [userId, userNotifications] of Object.entries(userBatches)) {
      await this.sendPushBatch(userId, userNotifications);
    }
  }

  private async processEmailNotifications(notifications: CreateNotificationDTO[]): Promise<void> {
    // Group by template for batch processing
    const templateBatches = this.groupByTemplate(notifications);
    
    for (const [template, templateNotifications] of Object.entries(templateBatches)) {
      await this.sendEmailBatch(template, templateNotifications);
    }
  }

  private async processSMSNotifications(notifications: CreateNotificationDTO[]): Promise<void> {
    // SMS has stricter rate limits, process individually
    for (const notification of notifications) {
      await this.sendSMS(notification);
      await this.delay(100); // SMS rate limiting
    }
  }

  private async processInAppNotifications(notifications: CreateNotificationDTO[]): Promise<void> {
    // In-app notifications can be processed in large batches
    await this.sendInAppBatch(notifications);
  }

  // Utility methods
  private groupByChannel(notifications: CreateNotificationDTO[]): Record<NotificationChannel, CreateNotificationDTO[]> {
    return notifications.reduce((groups, notification) => {
      const channel = notification.channel;
      if (!groups[channel]) groups[channel] = [];
      groups[channel].push(notification);
      return groups;
    }, {} as Record<NotificationChannel, CreateNotificationDTO[]>);
  }

  private groupByUser(notifications: CreateNotificationDTO[]): Record<string, CreateNotificationDTO[]> {
    return notifications.reduce((groups, notification) => {
      const userId = notification.user_id;
      if (!groups[userId]) groups[userId] = [];
      groups[userId].push(notification);
      return groups;
    }, {} as Record<string, CreateNotificationDTO[]>);
  }

  private groupByTemplate(notifications: CreateNotificationDTO[]): Record<string, CreateNotificationDTO[]> {
    return notifications.reduce((groups, notification) => {
      const template = notification.type;
      if (!groups[template]) groups[template] = [];
      groups[template].push(notification);
      return groups;
    }, {} as Record<string, CreateNotificationDTO[]>);
  }

  private isRateLimited(): boolean {
    const now = Date.now();
    const minuteAgo = now - 60000;
    
    // Clean old entries
    for (const [timestamp, count] of this.rateLimiter.entries()) {
      if (parseInt(timestamp) < minuteAgo) {
        this.rateLimiter.delete(timestamp);
      }
    }

    // Count current minute
    const currentMinute = Math.floor(now / 60000);
    const currentCount = this.rateLimiter.get(currentMinute.toString()) || 0;
    
    return currentCount >= this.config.rateLimitPerMinute;
  }

  private updateRateLimit(): void {
    const currentMinute = Math.floor(Date.now() / 60000);
    const currentCount = this.rateLimiter.get(currentMinute.toString()) || 0;
    this.rateLimiter.set(currentMinute.toString(), currentCount + 1);
  }

  private getRetryCount(notification: CreateNotificationDTO): number {
    return (notification as any).__retryCount || 0;
  }

  private incrementRetryCount(notification: CreateNotificationDTO): void {
    (notification as any).__retryCount = this.getRetryCount(notification) + 1;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Placeholder methods for actual notification sending
  private async sendPushBatch(userId: string, notifications: CreateNotificationDTO[]): Promise<void> {
    this.updateRateLimit();
    // Implementation would call push notification service
    console.log(`Sending ${notifications.length} push notifications to user ${userId}`);
  }

  private async sendEmailBatch(template: string, notifications: CreateNotificationDTO[]): Promise<void> {
    this.updateRateLimit();
    // Implementation would call email service
    console.log(`Sending ${notifications.length} email notifications with template ${template}`);
  }

  private async sendSMS(notification: CreateNotificationDTO): Promise<void> {
    this.updateRateLimit();
    // Implementation would call SMS service
    console.log(`Sending SMS notification to user ${notification.user_id}`);
  }

  private async sendInAppBatch(notifications: CreateNotificationDTO[]): Promise<void> {
    // In-app notifications don't count against rate limit
    console.log(`Sending ${notifications.length} in-app notifications`);
  }
}

// Notification Caching
class NotificationCache {
  private cache: Map<string, Notification> = new Map();
  private ttl: Map<string, number> = new Map();
  private defaultTTL: number = 5 * 60 * 1000; // 5 minutes

  set(key: string, notification: Notification, ttl?: number): void {
    this.cache.set(key, notification);
    this.ttl.set(key, Date.now() + (ttl || this.defaultTTL));
  }

  get(key: string): Notification | undefined {
    const expiry = this.ttl.get(key);
    if (expiry && Date.now() > expiry) {
      this.cache.delete(key);
      this.ttl.delete(key);
      return undefined;
    }
    return this.cache.get(key);
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: string): void {
    this.cache.delete(key);
    this.ttl.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.ttl.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // Clean expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, expiry] of this.ttl.entries()) {
      if (now > expiry) {
        this.cache.delete(key);
        this.ttl.delete(key);
      }
    }
  }
}

// Performance Monitoring
class NotificationPerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  private alerts: Array<(message: string) => void> = [];

  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const values = this.metrics.get(name)!;
    values.push(value);
    
    // Keep only last 1000 values
    if (values.length > 1000) {
      values.shift();
    }

    // Check for alerts
    this.checkAlerts(name, value);
  }

  getMetric(name: string): { avg: number; min: number; max: number; count: number } {
    const values = this.metrics.get(name) || [];
    
    if (values.length === 0) {
      return { avg: 0, min: 0, max: 0, count: 0 };
    }

    const sum = values.reduce((a, b) => a + b, 0);
    return {
      avg: sum / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length
    };
  }

  addAlert(callback: (message: string) => void): void {
    this.alerts.push(callback);
  }

  private checkAlerts(name: string, value: number): void {
    const metric = this.getMetric(name);
    
    // Example alert conditions
    if (name === 'processing_time' && value > 5000) {
      this.triggerAlert(`High processing time detected: ${value}ms`);
    }
    
    if (name === 'queue_size' && value > 5000) {
      this.triggerAlert(`Large queue size detected: ${value} notifications`);
    }
    
    if (name === 'error_rate' && value > 0.1) {
      this.triggerAlert(`High error rate detected: ${(value * 100).toFixed(2)}%`);
    }
  }

  private triggerAlert(message: string): void {
    this.alerts.forEach(alert => alert(message));
  }
}

// Smart Batching Algorithm
export const createOptimalBatches = (
  notifications: CreateNotificationDTO[],
  preferences: NotificationPreferences[],
  config: PerformanceConfig = DEFAULT_CONFIG
): NotificationBatch[] => {
  const batches: NotificationBatch[] = [];
  
  // Group by user and channel
  const userChannelGroups = notifications.reduce((groups, notification) => {
    const key = `${notification.user_id}-${notification.channel}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(notification);
    return groups;
  }, {} as Record<string, CreateNotificationDTO[]>);

  // Create batches respecting user preferences and limits
  Object.entries(userChannelGroups).forEach(([key, notifications]) => {
    const [userId, channel] = key.split('-');
    
    // Check user preferences
    const userPrefs = preferences.filter(p => 
      p.user_id === userId && 
      p.channel === channel && 
      p.enabled
    );
    
    if (userPrefs.length === 0) return; // Skip if user doesn't want this channel

    // Create batches for this user/channel combination
    for (let i = 0; i < notifications.length; i += config.batchSize) {
      const batch = notifications.slice(i, i + config.batchSize);
      
      batches.push({
        id: `batch-${Date.now()}-${Math.random()}`,
        notifications: batch as unknown as Notification[],
        total_count: batch.length,
        processed_count: 0,
        failed_count: 0,
        status: 'pending',
        created_at: new Date().toISOString()
      });
    }
  });

  return batches;
};

// Load Balancing
export const distributeNotifications = (
  notifications: CreateNotificationDTO[],
  workers: string[]
): Record<string, CreateNotificationDTO[]> => {
  const distribution: Record<string, CreateNotificationDTO[]> = {};
  
  // Initialize worker arrays
  workers.forEach(worker => {
    distribution[worker] = [];
  });

  // Distribute notifications using round-robin
  notifications.forEach((notification, index) => {
    const worker = workers[index % workers.length];
    distribution[worker].push(notification);
  });

  return distribution;
};

// Circuit Breaker Pattern
class CircuitBreaker {
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private threshold: number;
  private timeout: number;

  constructor(threshold: number = 5, timeout: number = 60000) {
    this.threshold = threshold;
    this.timeout = timeout;
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.threshold) {
      this.state = 'open';
    }
  }

  getState(): 'closed' | 'open' | 'half-open' {
    return this.state;
  }
}

// Export instances
export const notificationQueue = new NotificationQueue();
export const notificationCache = new NotificationCache();
export const performanceMonitor = new NotificationPerformanceMonitor();

// Export classes for custom configurations
export { NotificationQueue, NotificationCache, NotificationPerformanceMonitor, CircuitBreaker };

// Performance optimization utilities
export const optimizeNotificationDelivery = (
  notifications: CreateNotificationDTO[],
  preferences: NotificationPreferences[]
): CreateNotificationDTO[] => {
  // Remove duplicates
  const deduplicated = notifications.filter((notification, index, self) =>
    index === self.findIndex(n => 
      n.user_id === notification.user_id &&
      n.type === notification.type &&
      n.content === notification.content &&
      (n as any).created_at === (notification as any).created_at
    )
  );

  // Filter by user preferences
  const filtered = deduplicated.filter(notification => {
    const userPrefs = preferences.filter(p => 
      p.user_id === notification.user_id &&
      p.type === notification.type &&
      p.channel === notification.channel
    );
    
    return userPrefs.length > 0 && userPrefs.some(p => p.enabled);
  });

  // Sort by priority
  const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
  return filtered.sort((a, b) => {
    const aPriority = priorityOrder[a.priority || 'normal'];
    const bPriority = priorityOrder[b.priority || 'normal'];
    return aPriority - bPriority;
  });
};

// Memory optimization
export const compressNotificationData = (notifications: CreateNotificationDTO[]): string => {
  // Remove unnecessary fields and compress
  const compressed = notifications.map(n => ({
    u: n.user_id,
    t: n.type,
    c: n.channel,
    ti: n.title,
    co: n.content,
    p: n.priority,
    au: n.action_url,
    at: n.action_text
  }));
  
  return JSON.stringify(compressed);
};

export const decompressNotificationData = (compressed: string): CreateNotificationDTO[] => {
  const data = JSON.parse(compressed);
  
  return data.map((n: CreateNotificationDTO) => ({
    user_id: n.u,
    type: n.t,
    channel: n.c,
    title: n.ti,
    content: n.co,
    priority: n.p,
    action_url: n.au,
    action_text: n.at
  }));
};
