// 画面の言語（利用者の好み）。ブラウザに保存し、図のファイルの settings.locale とは分ける（2026-11-08）
export type UILanguage = 'ja' | 'en';
export const UI_LANGUAGE_KEY = 'temer.uiLanguage';

/** 保存した好み → ブラウザの言語（日本語なら ja、それ以外は en）の順で決める */
export function initialUILanguage(
  stored: string | null = safeGet(),
  browserLang: string = typeof navigator !== 'undefined' ? navigator.language || '' : '',
): UILanguage {
  if (stored === 'ja' || stored === 'en') return stored;
  return browserLang.toLowerCase().startsWith('ja') || browserLang === '' ? 'ja' : 'en';
}

export function saveUILanguage(lang: UILanguage): void {
  try { localStorage.setItem(UI_LANGUAGE_KEY, lang); } catch { /* 保存できない環境では今回だけ切り替える */ }
}

function safeGet(): string | null {
  try { return typeof localStorage !== 'undefined' ? localStorage.getItem(UI_LANGUAGE_KEY) : null; } catch { return null; }
}
