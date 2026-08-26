export type AutoDeleteDuration = 'seen' | '48h' | '1week' | 'none';
export type MuteDuration = 'off' | '1h' | '8h' | '24h' | 'permanent';

export interface UserChatSettings {
  autoDelete: AutoDeleteDuration;
  isMuted: boolean;
  muteDuration?: MuteDuration;
  muteUntil?: number | null;
  soundEnabled: boolean;
}

const STORAGE_KEY = 'funshann_user_chat_settings_map';

export const getIndividualChatSettings = (userId: string): UserChatSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const map = JSON.parse(raw);
      if (map && map[userId]) {
        const item = map[userId];
        let isMuted = !!item.isMuted;
        let muteDuration = item.muteDuration || (isMuted ? 'permanent' : 'off');
        let muteUntil = item.muteUntil || null;

        // Check if timed mute has expired
        if (isMuted && muteUntil && Date.now() >= muteUntil) {
          isMuted = false;
          muteDuration = 'off';
          muteUntil = null;
          map[userId] = { ...item, isMuted: false, muteDuration: 'off', muteUntil: null };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
        }

        return {
          autoDelete: item.autoDelete || 'none',
          isMuted,
          muteDuration,
          muteUntil,
          soundEnabled: item.soundEnabled !== undefined ? item.soundEnabled : true,
        };
      }
    }
  } catch (e) {
    console.error('Error reading chat settings', e);
  }
  return {
    autoDelete: 'none',
    isMuted: false,
    muteDuration: 'off',
    muteUntil: null,
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
      muteDuration: 'off',
      muteUntil: null,
      soundEnabled: true,
    };

    let isMuted = settings.isMuted !== undefined ? settings.isMuted : current.isMuted;
    let muteDuration = settings.muteDuration !== undefined ? settings.muteDuration : current.muteDuration;
    let muteUntil = settings.muteUntil !== undefined ? settings.muteUntil : current.muteUntil;

    if (settings.muteDuration !== undefined) {
      muteDuration = settings.muteDuration;
      if (settings.muteDuration === 'off') {
        isMuted = false;
        muteUntil = null;
      } else if (settings.muteDuration === '1h') {
        isMuted = true;
        muteUntil = Date.now() + 3600 * 1000;
      } else if (settings.muteDuration === '8h') {
        isMuted = true;
        muteUntil = Date.now() + 8 * 3600 * 1000;
      } else if (settings.muteDuration === '24h') {
        isMuted = true;
        muteUntil = Date.now() + 24 * 3600 * 1000;
      } else if (settings.muteDuration === 'permanent') {
        isMuted = true;
        muteUntil = null;
      }
    } else if (settings.isMuted !== undefined) {
      isMuted = settings.isMuted;
      if (!settings.isMuted) {
        muteDuration = 'off';
        muteUntil = null;
      } else if (muteDuration === 'off') {
        muteDuration = 'permanent';
        muteUntil = null;
      }
    }

    const updated: UserChatSettings = {
      ...current,
      ...settings,
      isMuted,
      muteDuration,
      muteUntil,
    };
    map[userId] = updated;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    return updated;
  } catch (e) {
    console.error('Error saving chat settings', e);
    return {
      autoDelete: settings.autoDelete || 'none',
      isMuted: settings.isMuted || false,
      muteDuration: settings.muteDuration || 'off',
      muteUntil: settings.muteUntil || null,
      soundEnabled: settings.soundEnabled ?? true,
    };
  }
};
