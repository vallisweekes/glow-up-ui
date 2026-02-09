'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types/routine';

interface NotificationTime {
  hour: number;
  minute: number;
  enabled: boolean;
}

interface NotificationPreferences {
  morningReminder: NotificationTime;
  eveningReminder: NotificationTime;
  waterReminder: NotificationTime;
}

interface NotificationSettingsProps {
  user: User;
}

export default function NotificationSettings({ user }: NotificationSettingsProps) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    morningReminder: { hour: 8, minute: 0, enabled: true },
    eveningReminder: { hour: 20, minute: 0, enabled: true },
    waterReminder: { hour: 12, minute: 0, enabled: false }
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [scheduledTimers, setScheduledTimers] = useState<number[]>([]);

  useEffect(() => {
    // Check notification permission
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    // Load saved preferences
    const saved = localStorage.getItem(`notification-prefs-${user}`);
    if (saved) {
      setPreferences(JSON.parse(saved));
    }

    // Register service worker
    registerServiceWorker();
  }, [user]);

  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  };

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support notifications');
      return;
    }

    setIsRegistering(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        // Schedule notifications
        scheduleNotifications();
        // Show confirmation
        new Notification('Notifications Enabled! 🎉', {
          body: 'You\'ll receive reminders for your glow-up routine',
          icon: '/icon-192.png'
        });
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
    } finally {
      setIsRegistering(false);
    }
  };

  const scheduleNotifications = () => {
    // Clear existing timers
    scheduledTimers.forEach(timer => clearTimeout(timer));
    
    // Save preferences
    localStorage.setItem(`notification-prefs-${user}`, JSON.stringify(preferences));
    
    const newTimers: number[] = [];
    
    // Set up daily reminders using local scheduling
    if (preferences.morningReminder.enabled) {
      const timer = scheduleNotification('morning', preferences.morningReminder);
      if (timer) newTimers.push(timer);
    }
    if (preferences.eveningReminder.enabled) {
      const timer = scheduleNotification('evening', preferences.eveningReminder);
      if (timer) newTimers.push(timer);
    }
    if (preferences.waterReminder.enabled) {
      const timer = scheduleNotification('water', preferences.waterReminder);
      if (timer) newTimers.push(timer);
    }
    
    setScheduledTimers(newTimers);
    
    // Show success message
    setSaveMessage('✅ Reminders scheduled successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const scheduleNotification = (type: string, time: NotificationTime): number | null => {
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(time.hour, time.minute, 0, 0);
    
    // If time has passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }
    
    const delay = scheduledTime.getTime() - now.getTime();
    
    const messages = {
      morning: {
        title: '🌅 Good Morning!',
        body: 'Time to start your morning routine and set the tone for the day!'
      },
      evening: {
        title: '🌙 Evening Check-In',
        body: 'How did today go? Log your mood and complete your evening routine!'
      },
      water: {
        title: '💧 Hydration Reminder',
        body: 'Remember to drink water and stay hydrated!'
      }
    };
    
    const timer = setTimeout(() => {
      if (Notification.permission === 'granted') {
        new Notification(messages[type as keyof typeof messages].title, {
          body: messages[type as keyof typeof messages].body,
          icon: '/icon-192.png',
          tag: `${type}-reminder`,
          requireInteraction: false
        });
      }
      // Reschedule for next day
      scheduleNotification(type, time);
    }, delay);
    
    return timer as unknown as number;
  };

  const sendTestNotification = () => {
    if (Notification.permission === 'granted') {
      new Notification('🎉 Test Notification', {
        body: 'Notifications are working perfectly!',
        icon: '/icon-192.png',
        tag: 'test-notification'
      });
      setSaveMessage('✅ Test notification sent!');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const updatePreference = (
    key: keyof NotificationPreferences,
    field: keyof NotificationTime,
    value: number | boolean
  ) => {
    const updated = {
      ...preferences,
      [key]: {
        ...preferences[key],
        [field]: value
      }
    };
    setPreferences(updated);
    
    if (permission === 'granted') {
      localStorage.setItem(`notification-prefs-${user}`, JSON.stringify(updated));
    }
  };

  const userColor = user === 'Vallis' ? '#8b5cf6' : '#ec4899';

  return (
    <div className="rounded-xl border shadow-sm p-4" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderColor: '#334155' }}>
      <h3 className="text-lg font-bold mb-3" style={{ color: '#f9fafb' }}>🔔 Smart Reminders</h3>
      
      {permission === 'default' && (
        <div className="mb-3 p-3 rounded-lg" style={{ backgroundColor: '#0f172a', border: '1px solid #334155' }}>
          <p className="text-xs text-gray-300 mb-2">
            Enable notifications to get timely reminders for your daily routines!
          </p>
          <button
            onClick={requestPermission}
            disabled={isRegistering}
            className="w-full py-1.5 text-sm rounded-lg font-semibold transition-all cursor-pointer"
            style={{
              background: `linear-gradient(135deg, ${userColor} 0%, ${userColor}dd 100%)`,
              color: '#fff',
              opacity: isRegistering ? 0.6 : 1
            }}
          >
            {isRegistering ? 'Enabling...' : 'Enable Notifications'}
          </button>
        </div>
      )}

      {permission === 'denied' && (
        <div className="mb-3 p-3 rounded-lg" style={{ backgroundColor: '#7f1d1d', border: '1px solid #991b1b' }}>
          <p className="text-xs text-red-200">
            ❌ Notifications are blocked. Please enable them in your browser settings.
          </p>
        </div>
      )}

      {permission === 'granted' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2 p-2 rounded-lg" style={{ backgroundColor: '#14532d', border: '1px solid #166534' }}>
            <span className="text-green-200 text-xs">✅ Notifications enabled!</span>
          </div>

          {/* Morning Reminder */}
          <div className="p-2 rounded-lg" style={{ backgroundColor: '#0f172a', border: '1px solid #334155' }}>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-white">🌅 Morning</label>
              <input
                type="checkbox"
                checked={preferences.morningReminder.enabled}
                onChange={(e) => updatePreference('morningReminder', 'enabled', e.target.checked)}
                className="w-4 h-4 cursor-pointer"
              />
            </div>
            {preferences.morningReminder.enabled && (
              <div className="flex gap-1">
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={preferences.morningReminder.hour}
                  onChange={(e) => updatePreference('morningReminder', 'hour', parseInt(e.target.value))}
                  className="w-14 px-2 py-1 text-sm rounded"
                  style={{ backgroundColor: '#1e293b', color: '#f9fafb', border: '1px solid #334155' }}
                />
                <span className="text-gray-400 self-center text-sm">:</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={preferences.morningReminder.minute}
                  onChange={(e) => updatePreference('morningReminder', 'minute', parseInt(e.target.value))}
                  className="w-14 px-2 py-1 text-sm rounded"
                  style={{ backgroundColor: '#1e293b', color: '#f9fafb', border: '1px solid #334155' }}
                />
              </div>
            )}
          </div>

          {/* Evening Reminder */}
          <div className="p-2 rounded-lg" style={{ backgroundColor: '#0f172a', border: '1px solid #334155' }}>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-white">🌙 Evening</label>
              <input
                type="checkbox"
                checked={preferences.eveningReminder.enabled}
                onChange={(e) => updatePreference('eveningReminder', 'enabled', e.target.checked)}
                className="w-4 h-4 cursor-pointer"
              />
            </div>
            {preferences.eveningReminder.enabled && (
              <div className="flex gap-1">
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={preferences.eveningReminder.hour}
                  onChange={(e) => updatePreference('eveningReminder', 'hour', parseInt(e.target.value))}
                  className="w-14 px-2 py-1 text-sm rounded"
                  style={{ backgroundColor: '#1e293b', color: '#f9fafb', border: '1px solid #334155' }}
                />
                <span className="text-gray-400 self-center text-sm">:</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={preferences.eveningReminder.minute}
                  onChange={(e) => updatePreference('eveningReminder', 'minute', parseInt(e.target.value))}
                  className="w-14 px-2 py-1 text-sm rounded"
                  style={{ backgroundColor: '#1e293b', color: '#f9fafb', border: '1px solid #334155' }}
                />
              </div>
            )}
          </div>

          {/* Water Reminder */}
          <div className="p-2 rounded-lg" style={{ backgroundColor: '#0f172a', border: '1px solid #334155' }}>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-white">💧 Hydration</label>
              <input
                type="checkbox"
                checked={preferences.waterReminder.enabled}
                onChange={(e) => updatePreference('waterReminder', 'enabled', e.target.checked)}
                className="w-4 h-4 cursor-pointer"
              />
            </div>
            {preferences.waterReminder.enabled && (
              <div className="flex gap-1">
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={preferences.waterReminder.hour}
                  onChange={(e) => updatePreference('waterReminder', 'hour', parseInt(e.target.value))}
                  className="w-14 px-2 py-1 text-sm rounded"
                  style={{ backgroundColor: '#1e293b', color: '#f9fafb', border: '1px solid #334155' }}
                />
                <span className="text-gray-400 self-center text-sm">:</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={preferences.waterReminder.minute}
                  onChange={(e) => updatePreference('waterReminder', 'minute', parseInt(e.target.value))}
                  className="w-14 px-2 py-1 text-sm rounded"
                  style={{ backgroundColor: '#1e293b', color: '#f9fafb', border: '1px solid #334155' }}
                />
              </div>
            )}
          </div>

          <button
            onClick={scheduleNotifications}
            className="w-full py-1.5 text-sm rounded-lg font-semibold transition-all cursor-pointer mt-2"
            style={{
              background: `linear-gradient(135deg, ${userColor} 0%, ${userColor}dd 100%)`,
              color: '#fff'
            }}
          >
            Save Schedule
          </button>

          {saveMessage && (
            <div className="mt-2 p-2 rounded-lg text-center" style={{ backgroundColor: '#14532d', border: '1px solid #166534' }}>
              <span className="text-green-200 text-xs">{saveMessage}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
