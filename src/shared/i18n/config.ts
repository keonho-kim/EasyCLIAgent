/**
 * i18n Configuration
 * 다국어 지원 설정
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 번역 리소스 임포트
import enTranslation from './locales/en/translation.json';
import koTranslation from './locales/ko/translation.json';
import jaTranslation from './locales/ja/translation.json';

export const resources = {
  en: {
    translation: enTranslation,
  },
  ko: {
    translation: koTranslation,
  },
  ja: {
    translation: jaTranslation,
  },
} as const;

// 지원 언어 목록
export const supportedLanguages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
] as const;

// 기본 언어
export const defaultLanguage = 'en';

// i18n 초기화
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: defaultLanguage,
    debug: false,
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    
    interpolation: {
      escapeValue: false, // React는 기본적으로 XSS 보호
    },
    
    react: {
      useSuspense: false, // Suspense 비활성화
    },
  });

export default i18n;