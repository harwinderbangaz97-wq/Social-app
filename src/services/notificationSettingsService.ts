export interface NotificationPreferences {
  story: boolean;
  message: boolean;
  updates: boolean;
  following: boolean;
  followers: boolean;
}

const STORAGE_KEY_NOTIFICATIONS = 'funshann_notification_preferences_v1';

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  story: true,
  message: true,
  updates: true,
  following: true,
  followers: true,
};

export const getNotificationPreferences = (): NotificationPreferences => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
    if (saved) {
      return { ...DEFAULT_NOTIFICATION_PREFERENCES, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to get notification preferences', e);
  }
  return { ...DEFAULT_NOTIFICATION_PREFERENCES };
};

export const saveNotificationPreferences = (prefs: NotificationPreferences): void => {
  try {
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(prefs));
  } catch (e) {
    console.error('Failed to save notification preferences', e);
  }
};
