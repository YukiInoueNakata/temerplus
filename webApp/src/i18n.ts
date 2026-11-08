// ============================================================================
// i18n 初期化
// - react-i18next で画面の文言を切り替える
// - 画面の言語は利用者の好み（utils/uiLanguage.ts・ブラウザに保存）。図のファイルの settings.locale
//   （凡例など図の表記の言語）とは分ける（2026-11-08。以前は図の設定に結びつき、言語を変えると
//   図が「変更あり」になり、日本語の図を開くと画面も日本語に戻った）
// - 翻訳の正本は CSV の表: locales/<名前空間>.csv（列: key, ja, en, …, note）。2026-11-08 ユーザー提案
//   - 1 行 1 語。空欄があれば訳し忘れ（locales.test.ts が検出する）。表計算ソフトで開いて協力者が埋められる
//   - 列を足せば別の言語（例: zh）。note はその語が出る場所（翻訳の手がかり）
//   - 部品では useTranslation('<名前空間>') → t('<key>')。キーはそのまま（. で入れ子にしない）
//   - 新しい CSV を置けば自動で読み込む
// ============================================================================

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Papa from 'papaparse';
import { initialUILanguage } from './utils/uiLanguage';

export const SUPPORTED_LOCALES = ['ja', 'en'] as const;
export type SupportedLocale = typeof SUPPORTED_LOCALES[number];

/** 言語の列ではない列 */
const NON_LANG_COLUMNS = new Set(['key', 'note']);

type Resources = Record<string, Record<string, Record<string, string>>>;

/** 1 つの CSV（名前空間）を { 言語: { key: 文言 } } にする。BOM は除く */
export function parseLocaleCsv(text: string): { languages: string[]; rows: Record<string, string>[] } {
  const res = Papa.parse<Record<string, string>>(text.replace(/^﻿/, ''), { header: true, skipEmptyLines: true });
  const languages = (res.meta.fields ?? []).filter((f) => !NON_LANG_COLUMNS.has(f));
  return { languages, rows: res.data.filter((r) => (r.key ?? '').trim() !== '') };
}

/** locales/<名前空間>.csv の一式から i18next の resources を作る（空欄の訳は入れない＝既定の言語にフォールバック） */
export function buildResources(files: Record<string, string>): Resources {
  const out: Resources = {};
  for (const [path, text] of Object.entries(files)) {
    const m = path.match(/locales\/([^/]+)\.csv$/);
    if (!m) continue;
    const ns = m[1];
    const { languages, rows } = parseLocaleCsv(text);
    for (const lng of languages) {
      out[lng] ??= {};
      out[lng][ns] ??= {};
      for (const r of rows) {
        const v = r[lng];
        if (v != null && v !== '') out[lng][ns][r.key.trim()] = v;
      }
    }
  }
  return out;
}

const csvFiles = import.meta.glob<string>('./locales/*.csv', { eager: true, query: '?raw', import: 'default' });
export const resources = buildResources(csvFiles);
export const NAMESPACES = Object.keys(resources.ja ?? {});

// ここでは localStorage だけで仮に決める。自動保存（IndexedDB）も見た確定と保存は main.tsx の settleUILanguage（2026-11-08）
const IS_TEST = import.meta.env?.MODE === 'test';
const startLanguage = IS_TEST ? 'ja' : initialUILanguage();

void i18n
  .use(initReactI18next)
  .init({
    resources,
    // テスト（jsdom のブラウザの言語は en-US）は日本語で始める（既存のテストが日本語の文言を見ているため）
    lng: startLanguage,
    fallbackLng: 'ja',
    supportedLngs: SUPPORTED_LOCALES,
    ns: NAMESPACES,
    defaultNS: 'translation',
    keySeparator: false, // CSV のキーは平らなまま（'ribbon.tabs.file' を 1 つのキーとして引く）
    interpolation: { escapeValue: false }, // React は XSS 対策済
    returnNull: false,
  });

export default i18n;

// ページの題と <html lang> を画面の言語に合わせる（読み上げ・ブラウザの翻訳の判定・タブの名前のため）
function syncDocumentLanguage(lng: string): void {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = lng;
  document.title = i18n.t('translation:app.title', { lng });
}
i18n.on('languageChanged', syncDocumentLanguage);
if (i18n.isInitialized) syncDocumentLanguage(i18n.language);
else i18n.on('initialized', () => syncDocumentLanguage(i18n.language));
