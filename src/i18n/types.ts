export type SupportedLanguageCode =
  | 'en-US'
  | 'en-GB'
  | 'es'
  | 'es-MX'
  | 'es-ES'
  | 'es-AR'
  | 'fr'
  | 'de'
  | 'hi'
  | 'pa'
  | 'ar'
  | 'ur'
  | 'zh-CN'
  | 'zh-TW'
  | 'ja'
  | 'ko'
  | 'it'
  | 'pt-BR'
  | 'pt-PT'
  | 'ru'
  | 'tr'
  | 'vi'
  | 'th'
  | 'id'
  | 'ms'
  | 'nl'
  | 'da'
  | 'sv'
  | 'no'
  | 'fi'
  | 'pl'
  | 'el'
  | 'ro'
  | 'gu'
  | 'mr'
  | 'bn-BD'
  | 'bn-IN'
  | 'ta'
  | 'te'
  | 'kn'
  | 'ml'
  | 'fil';

export interface TranslationDictionary {
  [key: string]: string;
}

export interface LanguageMeta {
  code: string;
  name: string;
  nativeName: string;
  isRTL?: boolean;
}
