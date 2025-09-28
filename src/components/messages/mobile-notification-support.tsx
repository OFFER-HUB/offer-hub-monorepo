'use client';

import React, { useState, useEffect, useCallback } from 'react';

// Battery API types
interface BatteryManager {
  level: number;
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  addEventListener: (type: string, listener: () => void) => void;
  removeEventListener: (type: string, listener: () => void) => void;
}
import { Smartphone, Bell, Wifi, WifiOff, AlertTriangle, CheckCircle, Settings } from 'lucide-react';
import { 
  requestNotificationPermission, 
  showBrowserNotification, 
  isMobileDevice, 
  shouldUseMobileOptimizations,
  playNotificationSound
} from '../../utils/notification-helpers';

interface MobileNotificationSupportProps {
  userId: string;
  onPermissionGranted?: () => void;
  onPermissionDenied?: () => void;
  className?: string;
}

// interface MobileStatusProps {
//   isOnline: boolean;
//   hasPermission: boolean;
//   isSupported: boolean;
//   batteryLevel?: number;
// }

const MobileNotificationSupport: React.FC<MobileNotificationSupportProps> = ({
  userId: _userId,
  onPermissionGranted,
  onPermissionDenied,
  className = ''
}) => {
  // Use userId for future features like user-specific notification settings
  console.log('Mobile notification support initialized for user:', _userId);
  
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [isOnline, setIsOnline] = useState(true);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [, setIsSupported] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);

  // Check if browser supports notifications
  useEffect(() => {
    setIsSupported('Notification' in window);
  }, []);

  // Check if device is mobile
  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);

  // Check if app is installed (PWA)
  useEffect(() => {
    const checkInstallation = () => {
      const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                         (window.navigator as Navigator & { standalone?: boolean }).standalone ||
                         document.referrer.includes('android-app://');
      setIsInstalled(isInstalled);
    };

    checkInstallation();
    
    // Listen for PWA installation events
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', () => {});
      window.removeEventListener('appinstalled', () => {});
    };
  }, []);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Monitor battery level (if supported)
  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as Navigator & { getBattery: () => Promise<BatteryManager> }).getBattery().then((battery: BatteryManager) => {
        setBatteryLevel(Math.round(battery.level * 100));
        
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
      });
    }
  }, []);

  // Check notification permission status
  useEffect(() => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  // Request notification permission
  const handleRequestPermission = useCallback(async () => {
    try {
      const permission = await requestNotificationPermission();
      setPermissionStatus(permission);
      
      if (permission === 'granted') {
        onPermissionGranted?.();
        
        // Test notification
        showBrowserNotification('Notifications Enabled', {
          body: 'You will now receive push notifications from OfferHub',
          icon: '/favicon.ico',
          badge: '/favicon.ico'
        });
      } else {
        onPermissionDenied?.();
      }
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      onPermissionDenied?.();
    }
  }, [onPermissionGranted, onPermissionDenied]);

  // Install PWA
  const handleInstallPWA = useCallback(async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA installed successfully');
    }
    
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  // Test notification
  const handleTestNotification = useCallback(() => {
    if (permissionStatus === 'granted') {
      showBrowserNotification('Test Notification', {
        body: 'This is a test notification from OfferHub',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'test-notification'
      });
      
      // Play test sound
      playNotificationSound('new_message');
    }
  }, [permissionStatus]);

  const getStatusColor = (status: NotificationPermission) => {
    switch (status) {
      case 'granted': return 'text-green-600';
      case 'denied': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  const getStatusIcon = (status: NotificationPermission) => {
    switch (status) {
      case 'granted': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'denied': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default: return <Bell className="w-5 h-5 text-yellow-600" />;
    }
  };

  if (!isMobile && !shouldUseMobileOptimizations()) {
    return null; // Don't show mobile-specific features on desktop
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Smartphone className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Mobile Notifications</h2>
            <p className="text-sm text-gray-600">Optimize your mobile notification experience</p>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Notification Permission</span>
              {getStatusIcon(permissionStatus)}
            </div>
            <p className={`text-sm ${getStatusColor(permissionStatus)}`}>
              {permissionStatus === 'granted' ? 'Enabled' : 
               permissionStatus === 'denied' ? 'Disabled' : 'Not requested'}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Connection Status</span>
              {isOnline ? <Wifi className="w-5 h-5 text-green-600" /> : <WifiOff className="w-5 h-5 text-red-600" />}
            </div>
            <p className={`text-sm ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>

        {/* Permission Request */}
        {permissionStatus !== 'granted' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Bell className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-blue-900 mb-1">
                  Enable Push Notifications
                </h3>
                <p className="text-sm text-blue-700 mb-3">
                  Get instant notifications for new messages, payments, and important updates even when the app is closed.
                </p>
                <button
                  onClick={handleRequestPermission}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Enable Notifications
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PWA Installation */}
        {!isInstalled && deferredPrompt && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Settings className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-green-900 mb-1">
                  Install OfferHub App
                </h3>
                <p className="text-sm text-green-700 mb-3">
                  Install the OfferHub app for a better mobile experience with native notifications and offline support.
                </p>
                <button
                  onClick={handleInstallPWA}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  Install App
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Optimizations */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900">Mobile Optimizations</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Push Notifications</p>
                  <p className="text-xs text-gray-600">Receive notifications when app is closed</p>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                permissionStatus === 'granted' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {permissionStatus === 'granted' ? 'Enabled' : 'Disabled'}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Wifi className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Offline Support</p>
                  <p className="text-xs text-gray-600">Notifications cached when offline</p>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                isInstalled 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {isInstalled ? 'Available' : 'Install App'}
              </div>
            </div>

            {batteryLevel !== null && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-5 h-5 ${batteryLevel > 20 ? 'text-green-600' : 'text-red-600'}`}>
                    <div className="w-full h-full border-2 border-current rounded-sm">
                      <div 
                        className="h-full bg-current"
                        style={{ width: `${batteryLevel}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Battery Level</p>
                    <p className="text-xs text-gray-600">Notifications optimized for battery life</p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  batteryLevel > 50 
                    ? 'bg-green-100 text-green-800'
                    : batteryLevel > 20 
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {batteryLevel}%
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Test Section */}
        {permissionStatus === 'granted' && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Test Notifications</h3>
            <button
              onClick={handleTestNotification}
              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Send Test Notification
            </button>
          </div>
        )}

        {/* Tips */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-900 mb-1">Mobile Notification Tips</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Keep OfferHub in your phone&apos;s background apps for best performance</li>
                <li>• Enable &quot;Do Not Disturb&quot; exceptions for important notifications</li>
                <li>• Install the PWA app for native notification support</li>
                <li>• Check your browser&apos;s notification settings if notifications stop working</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileNotificationSupport;
