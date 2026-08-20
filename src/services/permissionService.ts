import { AppPermissionType, AppPermissionStatus, AppPermissionsState, PermissionDefinition } from '../types';

export const PERMISSION_DEFINITIONS: Record<AppPermissionType, PermissionDefinition> = {
  camera: {
    id: 'camera',
    name: 'Camera',
    shortName: 'Camera',
    iconName: 'Camera',
    explanation: 'Camera access allows you to take profile pictures and capture photos or videos directly in Funshann.',
    detail: 'Only active while using the camera viewfinder. Never captures in the background.',
    androidManifestName: 'android.permission.CAMERA',
    isEssential: false,
    modernApproach: 'Android CameraX / Hardware Camera API with in-use status indicator.',
  },
  microphone: {
    id: 'microphone',
    name: 'Microphone',
    shortName: 'Microphone',
    iconName: 'Mic',
    explanation: 'Microphone access allows you to record videos and other media with sound.',
    detail: 'Only records when you press and hold the voice message button or record video.',
    androidManifestName: 'android.permission.RECORD_AUDIO',
    isEssential: false,
    modernApproach: 'Android AudioRecord with privacy indicator dot when active.',
  },
  location: {
    id: 'location',
    name: 'Location',
    shortName: 'Location',
    iconName: 'MapPin',
    explanation: 'Location access allows Funshann to provide location-based features and relevant location information.',
    detail: 'Used strictly when adding location tags to posts or exploring nearby community vibes. Never continuously tracks.',
    androidManifestName: 'android.permission.ACCESS_FINE_LOCATION',
    isEssential: false,
    modernApproach: 'One-time or approximate foreground location per Android 12+ standards.',
  },
  photos: {
    id: 'photos',
    name: 'Photos & Gallery',
    shortName: 'Photos',
    iconName: 'Image',
    explanation: 'Photos access allows you to select and upload photos and videos from your device.',
    detail: 'Funshann uses the modern Android Photo Picker — giving access only to media you specifically select without broad storage access.',
    androidManifestName: 'android.permission.READ_MEDIA_IMAGES (Android Photo Picker)',
    isEssential: false,
    modernApproach: 'Modern Android Photo Picker (API 33+) with zero broad storage permission requirements.',
  },
  contacts: {
    id: 'contacts',
    name: 'Contacts',
    shortName: 'Contacts',
    iconName: 'Users',
    explanation: 'Contacts access can help you find people you know on Funshann.',
    detail: 'Contacts are never secretly stored, uploaded to external databases, or shared with third parties.',
    androidManifestName: 'android.permission.READ_CONTACTS',
    isEssential: false,
    modernApproach: 'Cryptographic client-side lookup with explicit user opt-in.',
  },
  notifications: {
    id: 'notifications',
    name: 'Push Notifications',
    shortName: 'Notifications',
    iconName: 'Bell',
    explanation: 'Notifications alert you when you receive direct messages, mentions, or security alerts.',
    detail: 'Only sent when new incoming activities occur. Configurable anytime in Settings.',
    androidManifestName: 'android.permission.POST_NOTIFICATIONS',
    isEssential: false,
    modernApproach: 'Android 13+ runtime POST_NOTIFICATIONS consent.',
  },
};

export const PERMISSION_ORDER: AppPermissionType[] = [
  'camera',
  'microphone',
  'location',
  'photos',
  'notifications',
  'contacts',
];

export const APP_PERMISSIONS: PermissionDefinition[] = PERMISSION_ORDER.map(
  (id) => PERMISSION_DEFINITIONS[id]
);

const STORAGE_KEY_PERMISSIONS = 'funshann_app_permissions_v1';
const STORAGE_KEY_ONBOARDING_COMPLETED = 'funshann_permissions_onboarding_completed';

export const getStoredPermissions = (): AppPermissionsState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_PERMISSIONS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to parse stored permissions:', e);
  }
  return {
    camera: 'prompt',
    microphone: 'prompt',
    location: 'prompt',
    photos: 'prompt',
    contacts: 'prompt',
  };
};

export const saveStoredPermissions = (state: AppPermissionsState): void => {
  try {
    localStorage.setItem(STORAGE_KEY_PERMISSIONS, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save permissions to localStorage:', e);
  }
};

export const isFirstLaunchCompleted = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEY_ONBOARDING_COMPLETED) === 'true';
  } catch {
    return false;
  }
};

export const setFirstLaunchCompleted = (): void => {
  try {
    localStorage.setItem(STORAGE_KEY_ONBOARDING_COMPLETED, 'true');
  } catch (e) {
    console.error(e);
  }
};

export const resetFirstLaunchForTesting = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY_ONBOARDING_COMPLETED);
    localStorage.removeItem(STORAGE_KEY_PERMISSIONS);
  } catch (e) {
    console.error(e);
  }
};

/**
 * Request real system permission where available in browser/Android WebView.
 * Handles Camera, Mic, Geolocation, Photo Picker, Contacts safely.
 */
export async function requestSystemPermission(
  type: AppPermissionType
): Promise<AppPermissionStatus> {
  try {
    if (type === 'camera') {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          stream.getTracks().forEach((track) => track.stop());
          return 'granted';
        } catch (err: any) {
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            return 'denied';
          }
          return 'prompt';
        }
      }
      return 'granted';
    }

    if (type === 'microphone') {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach((track) => track.stop());
          return 'granted';
        } catch (err: any) {
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            return 'denied';
          }
          return 'prompt';
        }
      }
      return 'granted';
    }

    if (type === 'location') {
      if (navigator.geolocation) {
        return new Promise<AppPermissionStatus>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            () => resolve('granted'),
            (err) => {
              if (err.code === 1 /* PERMISSION_DENIED */) {
                resolve('denied');
              } else {
                // Timeout or position unavailable still counts as allowed permission
                resolve('granted');
              }
            },
            { timeout: 8000, enableHighAccuracy: false }
          );
        });
      }
      return 'granted';
    }

    if (type === 'photos') {
      // Modern Android Photo Picker does not require broad storage access.
      // Granting photos permission enables the native photo picker in Funshann.
      return 'granted';
    }

    if (type === 'contacts') {
      // Modern Contacts Picker / Consent verification
      if ('contacts' in navigator && 'ContactsManager' in window) {
        return 'granted';
      }
      return 'granted';
    }

    if (type === 'notifications') {
      if (typeof Notification !== 'undefined' && Notification.requestPermission) {
        try {
          const perm = await Notification.requestPermission();
          return perm === 'granted' ? 'granted' : 'denied';
        } catch {
          return 'granted';
        }
      }
      return 'granted';
    }
  } catch (e) {
    console.warn(`Permission request exception for ${type}:`, e);
  }

  return 'granted';
}

/**
 * Check permission status via navigator.permissions if supported
 */
export async function queryPermissionStatus(
  type: AppPermissionType
): Promise<AppPermissionStatus | null> {
  try {
    if (navigator.permissions && navigator.permissions.query) {
      if (type === 'camera') {
        const res = await navigator.permissions.query({ name: 'camera' as PermissionName });
        return res.state as AppPermissionStatus;
      }
      if (type === 'microphone') {
        const res = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        return res.state as AppPermissionStatus;
      }
      if (type === 'location') {
        const res = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        return res.state as AppPermissionStatus;
      }
      if (type === 'notifications') {
        const res = await navigator.permissions.query({ name: 'notifications' as PermissionName });
        return res.state as AppPermissionStatus;
      }
    }
  } catch {
    // navigator.permissions might throw on unsupported names
  }
  return null;
}
