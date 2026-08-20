import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  ALL_LANGUAGES,
  translateString,
  isRtlLanguage,
} from '../i18n/translations';
import { LanguageMeta } from '../i18n/types';

const STORAGE_KEY_LANGUAGE = 'funshann_selected_language_v1';

interface LanguageContextValue {
  currentLanguage: string;
  languageObj: LanguageMeta;
  languagesList: LanguageMeta[];
  isRTL: boolean;
  dir: 'ltr' | 'rtl';
  setLanguage: (code: string) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguageState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LANGUAGE);
      if (saved && ALL_LANGUAGES.some((l) => l.code === saved)) {
        return saved;
      }
      // Check browser navigator language
      const browserLang = navigator?.language;
      const matched = ALL_LANGUAGES.find(
        (l) => l.code === browserLang || l.code === browserLang?.split('-')[0]
      );
      if (matched) return matched.code;
    } catch (e) {
      console.error('Failed to read language preference:', e);
    }
    return 'en-US';
  });

  const languageObj = useMemo(() => {
    return ALL_LANGUAGES.find((l) => l.code === currentLanguage) || ALL_LANGUAGES[0];
  }, [currentLanguage]);

  const isRTL = useMemo(() => isRtlLanguage(currentLanguage), [currentLanguage]);
  const dir: 'ltr' | 'rtl' = isRTL ? 'rtl' : 'ltr';

  useEffect(() => {
    try {
      document.documentElement.dir = dir;
      document.documentElement.lang = currentLanguage;
    } catch (e) {
      console.error('Failed to set html direction/lang attribute', e);
    }
  }, [dir, currentLanguage]);

  const setLanguage = (code: string) => {
    try {
      localStorage.setItem(STORAGE_KEY_LANGUAGE, code);
    } catch (e) {
      console.error('Failed to save language preference:', e);
    }
    setCurrentLanguageState(code);
  };

  const t = useMemo(() => {
    return (key: string, params?: Record<string, string | number>) => {
      return translateString(key, params, currentLanguage);
    };
  }, [currentLanguage]);

  const value = useMemo(
    () => ({
      currentLanguage,
      languageObj,
      languagesList: ALL_LANGUAGES,
      isRTL,
      dir,
      setLanguage,
      t,
    }),
    [currentLanguage, languageObj, isRTL, dir, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      <div dir={dir} className="w-full h-full flex flex-col">
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextValue => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const useTranslation = useLanguage;
