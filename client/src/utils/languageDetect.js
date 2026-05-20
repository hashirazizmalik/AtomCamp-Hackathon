// src/utils/languageDetect.js
// Maps ISO 639-1 language codes to BCP-47 tags for SpeechSynthesis
export const LANG_TO_BCP47 = {
  en: 'en-US',
  ur: 'ur-PK',
  ar: 'ar-SA',
  hi: 'hi-IN',
  fr: 'fr-FR',
  es: 'es-ES',
  de: 'de-DE',
  zh: 'zh-CN',
  pt: 'pt-BR',
  ru: 'ru-RU',
  ja: 'ja-JP',
  ko: 'ko-KR',
};

export const toBCP47 = (lang = 'en') => LANG_TO_BCP47[lang] || 'en-US';

export const LANG_NAMES = {
  en: 'English', ur: 'Urdu', ar: 'Arabic', hi: 'Hindi',
  fr: 'French', es: 'Spanish', de: 'German', zh: 'Chinese',
  pt: 'Portuguese', ru: 'Russian', ja: 'Japanese', ko: 'Korean',
};
