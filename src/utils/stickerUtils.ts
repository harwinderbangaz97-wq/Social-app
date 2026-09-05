/**
 * Utility functions for managing the user's recently/most used stickers.
 */

const STORAGE_KEY = 'funshann_recent_stickers';
const DEFAULT_STICKERS = ['❤️', '🔥', '😂', '😮', '👏', '🎉', '👍'];

/**
 * Retrieves the 7 most recently/frequently used stickers.
 */
export const getRecentStickers = (): string[] => {
  if (typeof window === 'undefined') return DEFAULT_STICKERS;
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Filter out any empty/invalid values and slice to 7
        const clean = parsed.filter((s) => typeof s === 'string' && s.trim() !== '');
        if (clean.length > 0) {
          return clean.slice(0, 7);
        }
      }
    } catch (e) {
      console.error('Error parsing recent stickers:', e);
    }
  }
  return DEFAULT_STICKERS;
};

/**
 * Promotes a selected sticker to the top of the recently used list.
 */
export const addRecentSticker = (sticker: string): string[] => {
  if (typeof window === 'undefined' || !sticker) return DEFAULT_STICKERS;
  
  const current = getRecentStickers();
  // Filter out the selected sticker if it already exists, then prepend it to the start
  const updated = [sticker, ...current.filter((s) => s !== sticker)].slice(0, 7);
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};
