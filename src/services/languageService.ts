import { ALL_LANGUAGES, translateString } from '../i18n/translations';
import { LanguageMeta } from '../i18n/types';

export type LanguageItem = LanguageMeta;

export const LANGUAGES_LIST: LanguageItem[] = ALL_LANGUAGES;

const STORAGE_KEY_LANGUAGE = 'funshann_selected_language_v1';

export const getSavedLanguage = (): string => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_LANGUAGE);
    if (saved && LANGUAGES_LIST.some((l) => l.code === saved)) {
      return saved;
    }
  } catch (e) {
    console.error('Failed to get saved language', e);
  }
  return 'en-US';
};

export const saveSelectedLanguage = (code: string): void => {
  try {
    localStorage.setItem(STORAGE_KEY_LANGUAGE, code);
  } catch (e) {
    console.error('Failed to save selected language', e);
  }
};

export const getTranslation = (langCode: string, key: string, params?: Record<string, string | number>): string => {
  return translateString(key, params, langCode);
};
