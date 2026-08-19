import { AppPermissionType } from '../types';

export interface MediaPickerResult {
  url: string;
  file: File;
  isVideo: boolean;
  name: string;
  size: number;
  type: string;
  aspectRatio?: number;
}

export interface MediaPickerOptions {
  accept?: string;
  capture?: 'user' | 'environment';
  maxSizeBytes?: number;
  permissionType?: AppPermissionType;
}

/**
 * Triggers the device / Android system photo picker or file gallery using a hidden input element.
 * Reads the selected file into Data URL and returns full metadata without premature timeouts.
 */
export function openGalleryPicker(
  options: { accept?: string; maxSizeBytes?: number } = {}
): Promise<MediaPickerResult | null> {
  const { accept = 'image/*,video/*', maxSizeBytes = 100 * 1024 * 1024 } = options;

  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.style.position = 'fixed';
    input.style.top = '-9999px';
    input.style.left = '-9999px';
    input.style.opacity = '0';
    input.style.pointerEvents = 'none';
    document.body.appendChild(input);

    let isHandled = false;

    const cleanup = () => {
      if (input.parentNode) {
        input.parentNode.removeChild(input);
      }
    };

    const handleChange = (e: Event) => {
      if (isHandled) return;
      isHandled = true;

      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];

      if (!file) {
        cleanup();
        resolve(null);
        return;
      }

      if (maxSizeBytes && file.size > maxSizeBytes) {
        const sizeMb = Math.round(maxSizeBytes / (1024 * 1024));
        alert(`Selected file is too large. Maximum allowed size is ${sizeMb}MB.`);
        cleanup();
        resolve(null);
        return;
      }

      const isVideo =
        file.type.startsWith('video/') ||
        file.name.endsWith('.mp4') ||
        file.name.endsWith('.mov') ||
        file.name.endsWith('.webm') ||
        file.name.endsWith('.m4v');

      const reader = new FileReader();
      reader.onload = () => {
        cleanup();
        if (typeof reader.result === 'string') {
          resolve({
            url: reader.result,
            file,
            isVideo,
            name: file.name,
            size: file.size,
            type: file.type || (isVideo ? 'video/mp4' : 'image/jpeg'),
          });
        } else {
          resolve(null);
        }
      };

      reader.onerror = () => {
        cleanup();
        resolve(null);
      };

      reader.readAsDataURL(file);
    };

    input.addEventListener('change', handleChange);
    input.addEventListener('cancel', () => {
      setTimeout(() => {
        if (!isHandled && (!input.files || input.files.length === 0)) {
          isHandled = true;
          cleanup();
          resolve(null);
        }
      }, 500);
    });

    // Trigger click on input
    input.click();
  });
}

/**
 * Direct device camera file input fallback when live WebRTC is not requested or unavailable.
 */
export function triggerNativeCameraInput(
  options: { mode?: 'photo' | 'video'; facingMode?: 'user' | 'environment'; maxSizeBytes?: number } = {}
): Promise<MediaPickerResult | null> {
  const { mode = 'photo', facingMode = 'environment', maxSizeBytes = 100 * 1024 * 1024 } = options;
  const accept = mode === 'video' ? 'video/*' : 'image/*';

  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.capture = facingMode;
    input.style.position = 'fixed';
    input.style.top = '-9999px';
    input.style.left = '-9999px';
    input.style.opacity = '0';
    input.style.pointerEvents = 'none';
    document.body.appendChild(input);

    let isHandled = false;

    const cleanup = () => {
      if (input.parentNode) {
        input.parentNode.removeChild(input);
      }
    };

    const handleChange = (e: Event) => {
      if (isHandled) return;
      isHandled = true;

      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];

      if (!file) {
        cleanup();
        resolve(null);
        return;
      }

      if (maxSizeBytes && file.size > maxSizeBytes) {
        const sizeMb = Math.round(maxSizeBytes / (1024 * 1024));
        alert(`Captured file is too large. Maximum allowed size is ${sizeMb}MB.`);
        cleanup();
        resolve(null);
        return;
      }

      const isVideo =
        mode === 'video' ||
        file.type.startsWith('video/') ||
        file.name.endsWith('.mp4') ||
        file.name.endsWith('.mov') ||
        file.name.endsWith('.webm');

      const reader = new FileReader();
      reader.onload = () => {
        cleanup();
        if (typeof reader.result === 'string') {
          resolve({
            url: reader.result,
            file,
            isVideo,
            name: file.name,
            size: file.size,
            type: file.type || (isVideo ? 'video/mp4' : 'image/jpeg'),
          });
        } else {
          resolve(null);
        }
      };

      reader.onerror = () => {
        cleanup();
        resolve(null);
      };

      reader.readAsDataURL(file);
    };

    input.addEventListener('change', handleChange);
    input.addEventListener('cancel', () => {
      setTimeout(() => {
        if (!isHandled && (!input.files || input.files.length === 0)) {
          isHandled = true;
          cleanup();
          resolve(null);
        }
      }, 500);
    });

    input.click();
  });
}

/**
 * Universal System Media Picker wrapper (backward compatible with all call signatures)
 */
export function triggerSystemMediaPicker(
  options: MediaPickerOptions = {}
): Promise<MediaPickerResult | null> {
  if (options.capture) {
    const isVideo = options.accept?.includes('video') && !options.accept?.includes('image');
    return triggerNativeCameraInput({
      mode: isVideo ? 'video' : 'photo',
      facingMode: options.capture,
      maxSizeBytes: options.maxSizeBytes,
    });
  }

  return openGalleryPicker({
    accept: options.accept,
    maxSizeBytes: options.maxSizeBytes,
  });
}
