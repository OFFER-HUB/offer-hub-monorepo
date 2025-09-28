'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Mail, 
  Smartphone, 
  Monitor, 
  MessageSquare, 
  Save, 
  RotateCcw,
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle,
  Info,
  Settings,
} from 'lucide-react';
import { useNotificationPreferences } from '../../hooks/use-message-notifications';
import type { 
  NotificationPreferences, 
  NotificationType, 
  NotificationChannel,
  UpdateNotificationPreferencesDTO 
} from '../../types/message-notifications.types';

interface NotificationPreferencesProps {
  userId: string;
  className?: string;
}

interface PreferenceToggleProps {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  icon: React.ReactNode;
  disabled?: boolean;
}

const PreferenceToggle: React.FC<PreferenceToggleProps> = ({
  label,
  description,
  enabled,
  onChange,
  icon,
  disabled = false
}) => {
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-start space-x-3 flex-1">
        <div className="flex-shrink-0 mt-1">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900">{label}</h3>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
      </div>
      
      <div className="flex-shrink-0">
        <button
          onClick={() => onChange(!enabled)}
          disabled={disabled}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            enabled ? 'bg-blue-600' : 'bg-gray-200'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );
};

interface ChannelSelectorProps {
  channels: NotificationChannel[];
  selectedChannels: NotificationChannel[];
  onChange: (channels: NotificationChannel[]) => void;
  disabled?: boolean;
}

const ChannelSelector: React.FC<ChannelSelectorProps> = ({
  channels,
  selectedChannels,
  onChange,
  disabled = false
}) => {
  const getChannelIcon = (channel: NotificationChannel) => {
    switch (channel) {
      case 'push': return <Bell className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'sms': return <Smartphone className="w-4 h-4" />;
      case 'in_app': return <Monitor className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getChannelLabel = (channel: NotificationChannel) => {
    switch (channel) {
      case 'push': return 'Push Notifications';
      case 'email': return 'Email';
      case 'sms': return 'SMS';
      case 'in_app': return 'In-App';
      default: return channel;
    }
  };

  const toggleChannel = (channel: NotificationChannel) => {
    if (disabled) return;
    
    const newChannels = selectedChannels.includes(channel)
      ? selectedChannels.filter(c => c !== channel)
      : [...selectedChannels, channel];
    
    onChange(newChannels);
  };

  return (
    <div className="space-y-2">
      {channels.map((channel) => (
        <label
          key={channel}
          className={`flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer transition-colors ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
          } ${selectedChannels.includes(channel) ? 'bg-blue-50 border-blue-200' : ''}`}
        >
          <input
            type="checkbox"
            checked={selectedChannels.includes(channel)}
            onChange={() => toggleChannel(channel)}
            disabled={disabled}
            className="sr-only"
          />
          <div className={`flex-shrink-0 ${selectedChannels.includes(channel) ? 'text-blue-600' : 'text-gray-400'}`}>
            {getChannelIcon(channel)}
          </div>
          <span className={`text-sm font-medium ${selectedChannels.includes(channel) ? 'text-blue-900' : 'text-gray-700'}`}>
            {getChannelLabel(channel)}
          </span>
        </label>
      ))}
    </div>
  );
};

const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({
  userId,
  className = ''
}) => {
  const [preferences, setPreferencesState] = useState<NotificationPreferences[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [quietHours, setQuietHours] = useState({
    enabled: false,
    start: '22:00',
    end: '08:00'
  });
  const [timezone, setTimezone] = useState('UTC');

  const {
    preferences: serverPreferences,
    loading,
    error,
    updatePreferences: updateServerPreferences
  } = useNotificationPreferences(userId);

  // Initialize preferences from server
  useEffect(() => {
    if (serverPreferences && serverPreferences.length > 0) {
      setPreferencesState([...serverPreferences]);
      
      // Set quiet hours from first preference (assuming they're consistent)
      const firstPref = serverPreferences[0];
      if (firstPref.quiet_hours_start && firstPref.quiet_hours_end) {
        setQuietHours({
          enabled: true,
          start: firstPref.quiet_hours_start,
          end: firstPref.quiet_hours_end
        });
      }
      
      setTimezone(firstPref.timezone || 'UTC');
    }
  }, [serverPreferences]);

  const notificationTypes: Array<{
    type: NotificationType;
    label: string;
    description: string;
    icon: React.ReactNode;
    channels: NotificationChannel[];
    defaultEnabled: boolean;
  }> = [
    {
      type: 'new_message',
      label: 'New Messages',
      description: 'Get notified when you receive new messages',
      icon: <MessageSquare className="w-5 h-5 text-blue-600" />,
      channels: ['push', 'email', 'in_app'],
      defaultEnabled: true
    },
    {
      type: 'payment_received',
      label: 'Payment Received',
      description: 'Notifications when payments are credited to your account',
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      channels: ['push', 'email', 'sms', 'in_app'],
      defaultEnabled: true
    },
    {
      type: 'payment_sent',
      label: 'Payment Sent',
      description: 'Confirmations when you send payments',
      icon: <CheckCircle className="w-5 h-5 text-blue-600" />,
      channels: ['push', 'email', 'in_app'],
      defaultEnabled: true
    },
    {
      type: 'milestone_approved',
      label: 'Milestone Approved',
      description: 'When your work milestones are approved by clients',
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      channels: ['push', 'email', 'in_app'],
      defaultEnabled: true
    },
    {
      type: 'milestone_rejected',
      label: 'Milestone Rejected',
      description: 'When milestones are rejected and need revision',
      icon: <AlertTriangle className="w-5 h-5 text-orange-600" />,
      channels: ['push', 'email', 'in_app'],
      defaultEnabled: true
    },
    {
      type: 'dispute_opened',
      label: 'Dispute Opened',
      description: 'Immediate alerts when disputes are initiated',
      icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
      channels: ['push', 'email', 'sms', 'in_app'],
      defaultEnabled: true
    },
    {
      type: 'dispute_resolved',
      label: 'Dispute Resolved',
      description: 'Updates when disputes are resolved',
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      channels: ['push', 'email', 'in_app'],
      defaultEnabled: true
    },
    {
      type: 'deadline_reminder',
      label: 'Deadline Reminders',
      description: 'Reminders for upcoming project deadlines',
      icon: <Clock className="w-5 h-5 text-orange-600" />,
      channels: ['push', 'email', 'in_app'],
      defaultEnabled: true
    },
    {
      type: 'security_alert',
      label: 'Security Alerts',
      description: 'Important security notifications and login alerts',
      icon: <Shield className="w-5 h-5 text-red-600" />,
      channels: ['push', 'email', 'sms', 'in_app'],
      defaultEnabled: true
    },
    {
      type: 'feature_announcement',
      label: 'Feature Announcements',
      description: 'Updates about new platform features and improvements',
      icon: <Info className="w-5 h-5 text-purple-600" />,
      channels: ['email', 'in_app'],
      defaultEnabled: false
    }
  ];

  // const getPreferenceForType = (type: NotificationType, channel: NotificationChannel): NotificationPreferences | undefined => {
  //   return preferences.find(p => p.type === type && p.channel === channel);
  // };

  const isTypeEnabled = (type: NotificationType): boolean => {
    const typePreferences = preferences.filter(p => p.type === type);
    return typePreferences.some(p => p.enabled);
  };

  const getEnabledChannelsForType = (type: NotificationType): NotificationChannel[] => {
    return preferences
      .filter(p => p.type === type && p.enabled)
      .map(p => p.channel);
  };

  const updateTypePreference = (type: NotificationType, enabled: boolean) => {
    const typeConfig = notificationTypes.find(t => t.type === type);
    if (!typeConfig) return;

    const newPreferences = [...preferences];
    
    // Update or create preferences for each channel
    typeConfig.channels.forEach(channel => {
      const existingIndex = newPreferences.findIndex(p => p.type === type && p.channel === channel);
      const preference: NotificationPreferences = {
        id: existingIndex >= 0 ? newPreferences[existingIndex].id : `temp_${Date.now()}_${Math.random()}`,
        user_id: userId,
        type,
        channel,
        enabled,
        frequency: 'instant',
        timezone,
        created_at: existingIndex >= 0 ? newPreferences[existingIndex].created_at : new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...(quietHours.enabled && {
          quiet_hours_start: quietHours.start,
          quiet_hours_end: quietHours.end
        })
      };

      if (existingIndex >= 0) {
        newPreferences[existingIndex] = preference;
      } else {
        newPreferences.push(preference);
      }
    });

    setPreferencesState(newPreferences);
    setHasChanges(true);
  };

  // const updateChannelPreference = (type: NotificationType, channel: NotificationChannel, enabled: boolean) => {
  //   const newPreferences = [...preferences];
  //   const existingIndex = newPreferences.findIndex(p => p.type === type && p.channel === channel);
    
  //   const preference: NotificationPreferences = {
  //     id: existingIndex >= 0 ? newPreferences[existingIndex].id : `temp_${Date.now()}_${Math.random()}`,
  //     user_id: userId,
  //     type,
  //     channel,
  //     enabled,
  //     frequency: 'instant',
  //     timezone,
  //     created_at: existingIndex >= 0 ? newPreferences[existingIndex].created_at : new Date().toISOString(),
  //     updated_at: new Date().toISOString(),
  //     ...(quietHours.enabled && {
  //       quiet_hours_start: quietHours.start,
  //       quiet_hours_end: quietHours.end
  //     })
  //   };

  //   if (existingIndex >= 0) {
  //     newPreferences[existingIndex] = preference;
  //   } else {
  //     newPreferences.push(preference);
  //   }

  //   setPreferencesState(newPreferences);
  //   setHasChanges(true);
  // };

  const updateChannelSelection = (type: NotificationType, channels: NotificationChannel[]) => {
    const typeConfig = notificationTypes.find(t => t.type === type);
    if (!typeConfig) return;

    const newPreferences = [...preferences];
    
    // Update preferences for all channels of this type
    typeConfig.channels.forEach(channel => {
      const existingIndex = newPreferences.findIndex(p => p.type === type && p.channel === channel);
      const enabled = channels.includes(channel);
      
      const preference: NotificationPreferences = {
        id: existingIndex >= 0 ? newPreferences[existingIndex].id : `temp_${Date.now()}_${Math.random()}`,
        user_id: userId,
        type,
        channel,
        enabled,
        frequency: 'instant',
        timezone,
        created_at: existingIndex >= 0 ? newPreferences[existingIndex].created_at : new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...(quietHours.enabled && {
          quiet_hours_start: quietHours.start,
          quiet_hours_end: quietHours.end
        })
      };

      if (existingIndex >= 0) {
        newPreferences[existingIndex] = preference;
      } else {
        newPreferences.push(preference);
      }
    });

    setPreferencesState(newPreferences);
    setHasChanges(true);
  };

  const updateQuietHours = (enabled: boolean, start?: string, end?: string) => {
    const newQuietHours = {
      enabled,
      start: start || quietHours.start,
      end: end || quietHours.end
    };
    
    setQuietHours(newQuietHours);
    
    // Update all preferences with new quiet hours
    const updatedPreferences = preferences.map(pref => ({
      ...pref,
      ...(enabled && {
        quiet_hours_start: newQuietHours.start,
        quiet_hours_end: newQuietHours.end
      }),
      updated_at: new Date().toISOString()
    }));
    
    setPreferencesState(updatedPreferences);
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updateData: UpdateNotificationPreferencesDTO[] = preferences.map(pref => ({
        type: pref.type,
        channel: pref.channel,
        enabled: pref.enabled,
        frequency: pref.frequency,
        ...(quietHours.enabled && {
          quiet_hours_start: quietHours.start,
          quiet_hours_end: quietHours.end
        })
      }));

      await updateServerPreferences(updateData);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (serverPreferences) {
      setPreferencesState([...serverPreferences]);
      setHasChanges(false);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Preferences</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
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
            <Settings className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Notification Preferences</h2>
              <p className="text-sm text-gray-600">Manage how and when you receive notifications</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {hasChanges && (
              <button
                onClick={handleReset}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 flex items-center space-x-1"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                hasChanges && !saving
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Global Settings */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Global Settings</h3>
          
          {/* Timezone */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Paris</option>
              <option value="Asia/Tokyo">Tokyo</option>
              <option value="Asia/Shanghai">Shanghai</option>
              <option value="Australia/Sydney">Sydney</option>
            </select>
          </div>

          {/* Quiet Hours */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Quiet Hours</h4>
                <p className="text-sm text-gray-600">Pause notifications during specified hours</p>
              </div>
              <button
                onClick={() => updateQuietHours(!quietHours.enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  quietHours.enabled ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    quietHours.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            {quietHours.enabled && (
              <div className="flex items-center space-x-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">From</label>
                  <input
                    type="time"
                    value={quietHours.start}
                    onChange={(e) => updateQuietHours(true, e.target.value, undefined)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">To</label>
                  <input
                    type="time"
                    value={quietHours.end}
                    onChange={(e) => updateQuietHours(true, undefined, e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notification Types */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Types</h3>
          
          <div className="space-y-6">
            {notificationTypes.map((typeConfig) => {
              const typeEnabled = isTypeEnabled(typeConfig.type);
              const enabledChannels = getEnabledChannelsForType(typeConfig.type);
              
              return (
                <div key={typeConfig.type} className="border border-gray-200 rounded-lg p-4">
                  <div className="mb-4">
                    <PreferenceToggle
                      label={typeConfig.label}
                      description={typeConfig.description}
                      enabled={typeEnabled}
                      onChange={(enabled) => updateTypePreference(typeConfig.type, enabled)}
                      icon={typeConfig.icon}
                    />
                  </div>
                  
                  {typeEnabled && (
                    <div className="pl-8">
                      <h5 className="text-sm font-medium text-gray-700 mb-3">Delivery Methods</h5>
                      <ChannelSelector
                        channels={typeConfig.channels}
                        selectedChannels={enabledChannels}
                        onChange={(channels) => updateChannelSelection(typeConfig.type, channels)}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">How notifications work</h4>
              <p className="text-sm text-blue-700 mt-1">
                Push notifications require browser permission and work best when OfferHub is open in a background tab. 
                Email notifications are sent to your registered email address. SMS notifications may incur charges from your carrier.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferences;
