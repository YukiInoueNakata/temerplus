// ============================================================================
// i18n 初期化
// - react-i18next で UI 文言を ja / en 切替
// - store の `settings.locale` と `i18next.changeLanguage` を同期する
//   ブリッジは store/store.ts の `setLocale` action 内で呼ぶ
// - 翻訳リソースは `locales/{ja,en}.json` に集約
// ============================================================================

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ja from './locales/ja.json';
import en from './locales/en.json';

export const SUPPORTED_LOCALES = ['ja', 'en'] as const;
export type SupportedLocale = typeof SUPPORTED_LOCALES[number];

void i18n
  .use(initReactI18next)
  .init({
    resources: {
      ja: { translation: ja },
      en: { translation: en },
    },
    lng: 'ja',
    fallbackLng: 'ja',
    supportedLngs: SUPPORTED_LOCALES,
    interpolation: { escapeValue: false }, // React は XSS 対策済
    returnNull: false,
  });

export default i18n;
