import { TranslationDictionary, LanguageMeta } from './types';
import { enLocale } from './locales/en';
import { esLocale } from './locales/es';
import { arLocale } from './locales/ar';
import { hiLocale } from './locales/hi';
import { paLocale } from './locales/pa';
import { urLocale } from './locales/ur';

export const RTL_LANGUAGES = ['ar', 'ur', 'he', 'fa', 'ps', 'ks'];

export const ALL_LANGUAGES: LanguageMeta[] = [
  { code: 'en-US', name: 'English (US)', nativeName: 'English (US)', isRTL: false },
  { code: 'en-GB', name: 'English (UK)', nativeName: 'English (UK)', isRTL: false },
  { code: 'es', name: 'Spanish', nativeName: 'Español', isRTL: false },
  { code: 'es-MX', name: 'Spanish (Mexico)', nativeName: 'Español (México)', isRTL: false },
  { code: 'es-ES', name: 'Spanish (Spain)', nativeName: 'Español (España)', isRTL: false },
  { code: 'es-AR', name: 'Spanish (Argentina)', nativeName: 'Español (Argentina)', isRTL: false },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', isRTL: false },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', isRTL: false },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', isRTL: true },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', isRTL: true },
  { code: 'fr', name: 'French', nativeName: 'Français', isRTL: false },
  { code: 'de', name: 'German', nativeName: 'Deutsch', isRTL: false },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', isRTL: false },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)', isRTL: false },
  { code: 'pt-PT', name: 'Portuguese (Portugal)', nativeName: 'Português (Portugal)', isRTL: false },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', isRTL: false },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', isRTL: false },
  { code: 'ko', name: 'Korean', nativeName: '한국어', isRTL: false },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', isRTL: false },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', isRTL: false },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', isRTL: false },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', isRTL: false },
  { code: 'th', name: 'Thai', nativeName: 'ภาษาไทย', isRTL: false },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', isRTL: false },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', isRTL: false },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', isRTL: false },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', isRTL: false },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', isRTL: false },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', isRTL: false },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', isRTL: false },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', isRTL: false },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', isRTL: false },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', isRTL: false },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', isRTL: false },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', isRTL: false },
  { code: 'bn-BD', name: 'Bengali (Bangladesh)', nativeName: 'বাংলা (বাংলাদেশ)', isRTL: false },
  { code: 'bn-IN', name: 'Bengali (India)', nativeName: 'বাংলা (ভারত)', isRTL: false },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', isRTL: false },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', isRTL: false },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', isRTL: false },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', isRTL: false },
  { code: 'fil', name: 'Filipino', nativeName: 'Filipino', isRTL: false },
];

export const TRANSLATION_REGISTRY: Record<string, TranslationDictionary> = {
  'en-US': enLocale,
  'en-GB': enLocale,
  'es': esLocale,
  'es-MX': esLocale,
  'es-ES': esLocale,
  'es-AR': esLocale,
  'ar': arLocale,
  'hi': hiLocale,
  'pa': paLocale,
  'ur': urLocale,
};

export const isRtlLanguage = (code: string): boolean => {
  if (!code) return false;
  return RTL_LANGUAGES.some((rtl) => code.toLowerCase().startsWith(rtl));
};

export const translateString = (
  key: string,
  params?: Record<string, string | number>,
  langCode: string = 'en-US'
): string => {
  // 1. Normalize code (handle regional variations fallback, e.g. es-MX -> es -> en-US)
  const normalizedPrimary = langCode;
  const baseLanguageCode = langCode.split('-')[0];

  const primaryDict = TRANSLATION_REGISTRY[normalizedPrimary] || TRANSLATION_REGISTRY[baseLanguageCode];
  const fallbackDict = TRANSLATION_REGISTRY['en-US'] || enLocale;

  let rawString = primaryDict?.[key] || fallbackDict?.[key] || key;

  // 2. Interpolate dynamic placeholder params if provided (e.g. {count}, {name})
  if (params && typeof rawString === 'string') {
    Object.entries(params).forEach(([paramKey, paramVal]) => {
      rawString = rawString.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
    });
  }

  return rawString;
};
