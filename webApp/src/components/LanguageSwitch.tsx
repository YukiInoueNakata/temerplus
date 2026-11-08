// ============================================================================
// LanguageSwitch - 画面の言語の切り替え（利用者の好み。ブラウザに保存し、図のファイルは変えない）
// - variant="toggle": リボンの右上のボタン（押すたびに日本語と英語が入れ替わる）
// - variant="segmented": 起動時の案内（TEMer へようこそ）の「日本語｜English」（2026-11-08 ユーザー要望）
// - recreatePristineDoc: 手を付けていない空の図なら、新しい言語で作り直す（案内で言語を選んでから
//   「空ファイルから作成」を選んだときに、前の言語の図のまま始まらないように）
// 言語の名前は両方の言語で書く（訳さない）
// ============================================================================
import { useTranslation } from 'react-i18next';
import { saveUILanguage, type UILanguage } from '../utils/uiLanguage';
import { useTEMStore } from '../store/store';
import type { TEMDocument } from '../types';

/** 手を付けていない空の図か（シート 1 枚で何も置いていない・協力者も無い・未変更） */
export function isPristineEmptyDoc(doc: TEMDocument, dirty: boolean): boolean {
  if (dirty || doc.sheets.length !== 1 || doc.participants.length > 0) return false;
  const s = doc.sheets[0];
  return s.boxes.length === 0 && s.lines.length === 0 && s.sdsg.length === 0
    && s.notes.length === 0 && s.comments.length === 0 && s.periodLabels.length === 0;
}

export function LanguageSwitch({
  variant = 'toggle',
  recreatePristineDoc = false,
  className,
}: {
  variant?: 'toggle' | 'segmented';
  recreatePristineDoc?: boolean;
  className?: string;
}) {
  const { i18n } = useTranslation();
  const lang: UILanguage = i18n.language === 'en' ? 'en' : 'ja';

  const switchTo = async (next: UILanguage) => {
    if (next === lang) return;
    const st = useTEMStore.getState();
    const pristine = recreatePristineDoc && isPristineEmptyDoc(st.doc, st.dirty);
    saveUILanguage(next);
    await i18n.changeLanguage(next);
    if (pristine) useTEMStore.getState().resetDocument();
  };

  const title = 'Language / 言語'; // i18n-ok
  const JA_NAME = '日本語'; // i18n-ok 言語の名前は訳さない

  if (variant === 'segmented') {
    const btn = (value: UILanguage, label: string) => (
      <button
        type="button"
        onClick={() => void switchTo(value)}
        aria-pressed={lang === value}
        style={{
          padding: '3px 12px',
          fontSize: 12,
          border: '1px solid #888',
          background: lang === value ? '#2b5797' : '#fff',
          color: lang === value ? '#fff' : '#333',
          cursor: lang === value ? 'default' : 'pointer',
          fontWeight: lang === value ? 600 : 400,
        }}
      >
        {label}
      </button>
    );
    return (
      <div role="group" aria-label={title} title={title} className={className} style={{ display: 'inline-flex', gap: 0 }}>
        {btn('ja', JA_NAME)}
        {btn('en', 'English')}
      </div>
    );
  }

  const label = lang === 'ja' ? '日本語 / English' : 'English / 日本語'; // i18n-ok
  return (
    <button className={className ?? 'ribbon-btn-small'} onClick={() => void switchTo(lang === 'ja' ? 'en' : 'ja')} title={title}>
      {label}
    </button>
  );
}
