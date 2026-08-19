export type AutoDeleteDuration = 'seen' | '48h' | '1week' | 'none';

export interface UserChatSettings {
  autoDelete: AutoDeleteDuration;
  isMuted: boolean;
  soundEnabled: boolean;
}

const STORAGE_KEY = 'funshann_user_chat_settings_map';

export const getIndividualChatSettings = (userId: string): UserChatSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const map = JSON.parse(raw);
      if (map && map[userId]) {
        return {
          autoDelete: map[userId].autoDelete || 'none',
          isMuted: !!map[userId].isMuted,
          soundEnabled: map[userId].soundEnabled !== undefined ? map[userId].soundEnabled : true,
        };
      }
    }
  } catch (e) {
    console.error('Error reading chat settings', e);
  }
  return {
    autoDelete: 'none',
    isMuted: false,
    soundEnabled: true,
  };
};

export const saveIndividualChatSettings = (
  userId: string,
  settings: Partial<UserChatSettings>
): UserChatSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const map = raw ? JSON.parse(raw) : {};
    const current = map[userId] || {
      autoDelete: 'none',
      isMuted: false,
      soundEnabled: true,
    };
    const updated: UserChatSettings = {
      ...current,
      ...settings,
    };
    map[userId] = updated;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    return updated;
  } catch (e) {
    console.error('Error saving chat settings', e);
    return {
      autoDelete: settings.autoDelete || 'none',
      isMuted: settings.isMuted || false,
      soundEnabled: settings.soundEnabled ?? true,
    };
  }
};
