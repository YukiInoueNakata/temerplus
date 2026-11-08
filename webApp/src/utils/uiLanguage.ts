// 画面の言語（利用者の好み）。ブラウザに保存し、図のファイルの settings.locale とは分ける（2026-11-08）
export type UILanguage = 'ja' | 'en';
export const UI_LANGUAGE_KEY = 'temer.uiLanguage';

/**
 * 保存した好み → 今までの利用者なら日本語 → ブラウザの言語（日本語なら ja、それ以外は en）の順で決める。
 * 今までの利用者（英語化より前から使っている人）は、ブラウザが英語でも日本語のまま始める
 * （更新した日に画面と新しい図が急に英語になるのを避ける。2026-11-08 レビューの指摘）
 */
export function initialUILanguage(
  stored: string | null = safeGet(),
  browserLang: string = typeof navigator !== 'undefined' ? navigator.language || '' : '',
  usedBefore: boolean = safeUsedBefore(),
): UILanguage {
  if (stored === 'ja' || stored === 'en') return stored;
  if (usedBefore) return 'ja';
  return browserLang.toLowerCase().startsWith('ja') || browserLang === '' ? 'ja' : 'en';
}

export function saveUILanguage(lang: UILanguage): void {
  try { localStorage.setItem(UI_LANGUAGE_KEY, lang); } catch { /* 保存できない環境では今回だけ切り替える */ }
}

function safeGet(): string | null {
  try { return typeof localStorage !== 'undefined' ? localStorage.getItem(UI_LANGUAGE_KEY) : null; } catch { return null; }
}

/** このアプリの値（temer: か temer. で始まるキー。言語の好みを除く）がブラウザに残っていれば、今までの利用者とみなす */
export function hasPriorUse(keys: string[]): boolean {
  return keys.some((k) => (k.startsWith('temer:') || k.startsWith('temer.')) && k !== UI_LANGUAGE_KEY);
}

function safeUsedBefore(): boolean {
  try {
    if (typeof localStorage === 'undefined') return false;
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k) keys.push(k);
    }
    return hasPriorUse(keys);
  } catch { return false; }
}
