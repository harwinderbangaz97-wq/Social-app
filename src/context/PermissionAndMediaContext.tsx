import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  AppPermissionType,
  AppPermissionStatus,
  AppPermissionsState,
} from '../types';
import {
  getStoredPermissions,
  saveStoredPermissions,
  requestSystemPermission,
} from '../services/permissionService';
import {
  MediaPickerOptions,
  MediaPickerResult,
  openGalleryPicker,
  triggerNativeCameraInput,
} from '../services/mediaPickerService';
import { getDeviceCurrentLocation } from '../services/locationService';
import { DeviceCameraModal } from '../components/DeviceCameraModal';
import { AndroidSystemSettingsModal } from '../components/AndroidSystemSettingsModal';

interface PendingCameraSession {
  mode: 'photo' | 'video';
  facingMode?: 'user' | 'environment';
  title?: string;
  resolve: (result: MediaPickerResult | null) => void;
}

interface PermissionAndMediaContextType {
  permissionsState: AppPermissionsState;
  updatePermission: (type: AppPermissionType, status: AppPermissionStatus) => void;
  setAllPermissions: (state: AppPermissionsState) => void;
  requestPermission: (
    type: AppPermissionType,
    featureName?: string
  ) => Promise<boolean>;
  chooseFromGallery: (
    options?: { accept?: string; featureName?: string }
  ) => Promise<MediaPickerResult | null>;
  takePhoto: (
    options?: { facingMode?: 'user' | 'environment'; title?: string; featureName?: string }
  ) => Promise<MediaPickerResult | null>;
  recordVideo: (
    options?: { facingMode?: 'user' | 'environment'; title?: string; featureName?: string }
  ) => Promise<MediaPickerResult | null>;
  pickMedia: (
    options?: MediaPickerOptions & { featureName?: string }
  ) => Promise<MediaPickerResult | null>;
  getLocation: (featureName?: string) => Promise<string | null>;
  openAndroidSettings: () => void;
  closeAndroidSettings: () => void;
  isAndroidSettingsOpen: boolean;
}

const PermissionAndMediaContext = createContext<PermissionAndMediaContextType | null>(null);

export const PermissionAndMediaProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [permissionsState, setPermissionsState] = useState<AppPermissionsState>(() =>
    getStoredPermissions()
  );
  const [isAndroidSettingsOpen, setIsAndroidSettingsOpen] = useState(false);
  const [pendingCameraSession, setPendingCameraSession] = useState<PendingCameraSession | null>(null);

  const updatePermission = useCallback(
    (type: AppPermissionType, status: AppPermissionStatus) => {
      setPermissionsState((prev) => {
        const next = { ...prev, [type]: status };
        saveStoredPermissions(next);
        return next;
      });
    },
    []
  );

  const setAllPermissions = useCallback((state: AppPermissionsState) => {
    setPermissionsState(state);
    saveStoredPermissions(state);
  }, []);

  const openAndroidSettings = useCallback(() => {
    setIsAndroidSettingsOpen(true);
  }, []);

  const closeAndroidSettings = useCallback(() => {
    setIsAndroidSettingsOpen(false);
  }, []);

  /**
   * Request system permission on-demand when a feature is used (no custom popups or switches).
   */
  const requestPermission = useCallback(
    async (type: AppPermissionType): Promise<boolean> => {
      try {
        const result = await requestSystemPermission(type);
        updatePermission(type, result);
        return result === 'granted';
      } catch (err) {
        console.error('System permission request error:', err);
        return false;
      }
    },
    [updatePermission]
  );

  /**
   * 1. CHOOSE FROM GALLERY (Android Photo Picker / Gallery)
   * Strictly opens the gallery picker. NEVER opens camera.
   */
  const chooseFromGallery = useCallback(
    async (
      options: { accept?: string; featureName?: string } = {}
    ): Promise<MediaPickerResult | null> => {
      updatePermission('photos', 'granted');
      return openGalleryPicker({
        accept: options.accept || 'image/*,video/*',
      });
    },
    [updatePermission]
  );

  /**
   * 2. TAKE PHOTO (Device Camera in photo mode)
   * Strictly opens device Camera in photo mode with live viewfinder. NEVER opens gallery.
   */
  const takePhoto = useCallback(
    (
      options: { facingMode?: 'user' | 'environment'; title?: string; featureName?: string } = {}
    ): Promise<MediaPickerResult | null> => {
      updatePermission('camera', 'granted');

      return new Promise<MediaPickerResult | null>((resolve) => {
        setPendingCameraSession({
          mode: 'photo',
          facingMode: options.facingMode || 'environment',
          title: options.title || options.featureName || 'Take Photo',
          resolve,
        });
      });
    },
    [updatePermission]
  );

  /**
   * 3. RECORD VIDEO (Device Camera in video-recording mode)
   * Strictly opens device Camera in video mode with live timer & recorder. NEVER opens gallery.
   */
  const recordVideo = useCallback(
    (
      options: { facingMode?: 'user' | 'environment'; title?: string; featureName?: string } = {}
    ): Promise<MediaPickerResult | null> => {
      updatePermission('camera', 'granted');
      updatePermission('microphone', 'granted');

      return new Promise<MediaPickerResult | null>((resolve) => {
        setPendingCameraSession({
          mode: 'video',
          facingMode: options.facingMode || 'environment',
          title: options.title || options.featureName || 'Record Video',
          resolve,
        });
      });
    },
    [updatePermission]
  );

  /**
   * Universal pickMedia adapter for backward compatibility:
   * Maps calls cleanly to chooseFromGallery, takePhoto, or recordVideo.
   */
  const pickMedia = useCallback(
    async (
      options: MediaPickerOptions & { featureName?: string } = {}
    ): Promise<MediaPickerResult | null> => {
      if (options.capture) {
        const isVideo =
          options.accept?.includes('video') && !options.accept?.includes('image');
        if (isVideo) {
          return recordVideo({
            facingMode: options.capture,
            featureName: options.featureName,
          });
        }
        return takePhoto({
          facingMode: options.capture,
          featureName: options.featureName,
        });
      }

      return chooseFromGallery({
        accept: options.accept,
        featureName: options.featureName,
      });
    },
    [chooseFromGallery, takePhoto, recordVideo]
  );

  /**
   * Unified Location Fetcher: Checks location permission on-demand and returns formatted location.
   */
  const getLocation = useCallback(
    async (): Promise<string | null> => {
      updatePermission('location', 'granted');
      const result = await getDeviceCurrentLocation();
      if (result) {
        return result.formatted;
      }
      return null;
    },
    [updatePermission]
  );

  const pendingCameraSessionRef = React.useRef<PendingCameraSession | null>(null);
  pendingCameraSessionRef.current = pendingCameraSession;

  const handleCameraCapture = useCallback((result: MediaPickerResult) => {
    const session = pendingCameraSessionRef.current;
    if (session) {
      session.resolve(result);
    }
    setPendingCameraSession(null);
  }, []);

  const handleCameraCancel = useCallback(() => {
    const session = pendingCameraSessionRef.current;
    if (session) {
      session.resolve(null);
    }
    setPendingCameraSession(null);
  }, []);

  return (
    <PermissionAndMediaContext.Provider
      value={{
        permissionsState,
        updatePermission,
        setAllPermissions,
        requestPermission,
        chooseFromGallery,
        takePhoto,
        recordVideo,
        pickMedia,
        getLocation,
        openAndroidSettings,
        closeAndroidSettings,
        isAndroidSettingsOpen,
      }}
    >
      {children}

      {/* Centralized Live Device Camera Viewfinder Modal */}
      {pendingCameraSession && (
        <DeviceCameraModal
          isOpen={Boolean(pendingCameraSession)}
          mode={pendingCameraSession.mode}
          facingMode={pendingCameraSession.facingMode}
          title={pendingCameraSession.title}
          onCapture={handleCameraCapture}
          onCancel={handleCameraCancel}
        />
      )}

      {/* In-App Android System Settings Modal (Only shown if opened via settings) */}
      <AndroidSystemSettingsModal
        isOpen={isAndroidSettingsOpen}
        onClose={closeAndroidSettings}
        permissionsState={permissionsState}
        onUpdatePermissions={setAllPermissions}
      />
    </PermissionAndMediaContext.Provider>
  );
};

export const usePermissionAndMedia = (): PermissionAndMediaContextType => {
  const context = useContext(PermissionAndMediaContext);
  if (!context) {
    throw new Error('usePermissionAndMedia must be used within a PermissionAndMediaProvider');
  }
  return context;
};
