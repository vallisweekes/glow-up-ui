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
    <div className="rounded-xl border shadow-sm p-6" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderColor: '#334155' }}>
      <h3 className="text-xl font-bold mb-4" style={{ color: '#f9fafb' }}>🔔 Smart Reminders</h3>
      
      {permission === 'default' && (
        <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#0f172a', border: '1px solid #334155' }}>
          <p className="text-sm text-gray-300 mb-3">
            Enable notifications to get timely reminders for your daily routines!
          </p>
          <button
            onClick={requestPermission}
            disabled={isRegistering}
            className="w-full py-2 rounded-lg font-semibold transition-all cursor-pointer"
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
        <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: '#7f1d1d', border: '1px solid #991b1b' }}>
          <p className="text-sm text-red-200">
            ❌ Notifications are blocked. Please enable them in your browser settings.
          </p>
        </div>
      )}

      {permission === 'granted' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4 p-3 rounded-lg" style={{ backgroundColor: '#14532d', border: '1px solid #166534' }}>
            <span className="text-green-200 text-sm">✅ Notifications enabled!</span>
          </div>

          {/* Morning Reminder */}
          <div className="p-4 rounded-lg" style={{ backgroundColor: '#0f172a', border: '1px solid #334155' }}>
            <div className="flex items-center justify-between mb-3">
              <label className="font-semibold text-white">🌅 Morning Reminder</label>
              <input
                type="checkbox"
                checked={preferences.morningReminder.enabled}
                onChange={(e) => updatePreference('morningReminder', 'enabled', e.target.checked)}
                className="w-5 h-5 cursor-pointer"
              />
            </div>
            {preferences.morningReminder.enabled && (
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={preferences.morningReminder.hour}
                  onChange={(e) => updatePreference('morningReminder', 'hour', parseInt(e.target.value))}
                  className="w-20 px-3 py-2 rounded-lg"
                  style={{ backgroundColor: '#1e293b', color: '#f9fafb', border: '1px solid #334155' }}
                />
                <span className="text-gray-400 self-center">:</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={preferences.morningReminder.minute}
                  onChange={(e) => updatePreference('morningReminder', 'minute', parseInt(e.target.value))}
                  className="w-20 px-3 py-2 rounded-lg"
                  style={{ backgroundColor: '#1e293b', color: '#f9fafb', border: '1px solid #334155' }}
                />
              </div>
            )}
          </div>

          {/* Evening Reminder */}
          <div className="p-4 rounded-lg" style={{ backgroundColor: '#0f172a', border: '1px solid #334155' }}>
            <div className="flex items-center justify-between mb-3">
              <label className="font-semibold text-white">🌙 Evening Check-In</label>
              <input
                type="checkbox"
                checked={preferences.eveningReminder.enabled}
                onChange={(e) => updatePreference('eveningReminder', 'enabled', e.target.checked)}
                className="w-5 h-5 cursor-pointer"
              />
            </div>
            {preferences.eveningReminder.enabled && (
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={preferences.eveningReminder.hour}
                  onChange={(e) => updatePreference('eveningReminder', 'hour', parseInt(e.target.value))}
                  className="w-20 px-3 py-2 rounded-lg"
                  style={{ backgroundColor: '#1e293b', color: '#f9fafb', border: '1px solid #334155' }}
                />
                <span className="text-gray-400 self-center">:</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={preferences.eveningReminder.minute}
                  onChange={(e) => updatePreference('eveningReminder', 'minute', parseInt(e.target.value))}
                  className="w-20 px-3 py-2 rounded-lg"
                  style={{ backgroundColor: '#1e293b', color: '#f9fafb', border: '1px solid #334155' }}
                />
              </div>
            )}
          </div>

          {/* Water Reminder */}
          <div className="p-4 rounded-lg" style={{ backgroundColor: '#0f172a', border: '1px solid #334155' }}>
            <div className="flex items-center justify-between mb-3">
              <label className="font-semibold text-white">💧 Hydration Reminder</label>
              <input
                type="checkbox"
                checked={preferences.waterReminder.enabled}
                onChange={(e) => updatePreference('waterReminder', 'enabled', e.target.checked)}
                className="w-5 h-5 cursor-pointer"
              />
            </div>
            {preferences.waterReminder.enabled && (
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={preferences.waterReminder.hour}
                  onChange={(e) => updatePreference('waterReminder', 'hour', parseInt(e.target.value))}
                  className="w-20 px-3 py-2 rounded-lg"
                  style={{ backgroundColor: '#1e293b', color: '#f9fafb', border: '1px solid #334155' }}
                />
                <span className="text-gray-400 self-center">:</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={preferences.waterReminder.minute}
                  onChange={(e) => updatePreference('waterReminder', 'minute', parseInt(e.target.value))}
                  className="w-20 px-3 py-2 rounded-lg"
                  style={{ backgroundColor: '#1e293b', color: '#f9fafb', border: '1px solid #334155' }}
                />

          <button
            onClick={sendTestNotification}
            className="w-full py-2 rounded-lg font-semibold transition-all cursor-pointer mt-2"
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              border: '1px solid #334155',
              color: '#f9fafb'
            }}
          >
            Send Test Notification
          </button>

          {saveMessage && (
            <div className="mt-3 p-3 rounded-lg text-center" style={{ backgroundColor: '#14532d', border: '1px solid #166534' }}>
              <span className="text-green-200 text-sm">{saveMessage}</span>
            </div>
          )}

          <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}>
            <p className="text-xs text-gray-400">
              💡 <span className="font-semibold text-gray-300">Note:</span> Notifications are scheduled while the app is running. For best results, keep the app open in a tab or install it as a PWA.
            </p>
          </div>
              </div>
            )}
          </div>

          <button
            onClick={scheduleNotifications}
            className="w-full py-2 rounded-lg font-semibold transition-all cursor-pointer mt-4"
            style={{
              background: `linear-gradient(135deg, ${userColor} 0%, ${userColor}dd 100%)`,
              color: '#fff'
            }}
          >
            Save Reminder Schedule
          </button>
        </div>
      )}
    </div>
  );
}
