// ============================================================================
// StartupWizardDialog
//
// アプリ起動時に表示する 4 択ウィザード。
//   1. ファイルから新規作成 (→ サブメニュー: 原文取り込み / 切片CSV)
//   2. プロジェクトを開く (.tem)
//   3. 空ファイルから作成
//   4. デモファイルを開く（日本語 / 英語）
//
// 「次回から表示しない」localStorage キーは temer:hide-startup-wizard。
// popout window では表示しない (App 側で抑止)。
// ============================================================================

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { shortcutLabel } from '../utils/platform';
import { LanguageSwitch } from './LanguageSwitch';

export type StartupWizardChoice =
  | { kind: 'open-tem' }                  // 既存 .tem を開く
  | { kind: 'create-empty' }              // 空ファイルから始める (現状の空 doc のまま)
  | { kind: 'open-demo' }                 // デモ .tem を開く (神崎・鈴木 2021)
  | { kind: 'open-demo-en' }              // 英語版デモ .tem を開く (国際集会向け)
  | { kind: 'open-transcript-demo' }      // 原文連動デモ .tem を開く (Phase 4)
  | { kind: 'new-from-transcript' }       // 原文 1 ファイルから取り込み
  | { kind: 'new-from-transcripts-bulk' } // 原文を複数ファイル/フォルダから一括取り込み
  | { kind: 'new-from-csv-boxes' };       // 切片CSV/Excel から Box を作成

export function StartupWizardDialog({
  open,
  onChoose,
  onDismiss,
}: {
  open: boolean;
  onChoose: (choice: StartupWizardChoice) => void;
  onDismiss: () => void;
}) {
  const [step, setStep] = useState<'main' | 'new-from-file'>('main');
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const { t } = useTranslation('startupWizardDialog');

  if (!open) return null;

  const dismiss = () => {
    if (dontShowAgain) {
      try { localStorage.setItem('temer:hide-startup-wizard', '1'); } catch { /* ignore */ }
    }
    onDismiss();
  };

  const choose = (c: StartupWizardChoice) => {
    if (dontShowAgain) {
      try { localStorage.setItem('temer:hide-startup-wizard', '1'); } catch { /* ignore */ }
    }
    onChoose(c);
  };

  return (
    <div className="modal-backdrop" onClick={dismiss} style={{ zIndex: 1300 }}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: 820, maxWidth: '94vw' }}>
        <div className="modal-header">
          <h3>{t('title')}</h3>
          {/* 言語の切り替え（2026-11-08 ユーザー要望）。手を付けていない空の図は新しい言語で作り直す */}
          <LanguageSwitch variant="segmented" recreatePristineDoc className="startup-language-switch" />
          <button onClick={dismiss} className="modal-close" title={t('close.title')}>×</button>
        </div>
        <div className="modal-body" style={{ minHeight: 360 }}>
          {step === 'main' ? (
            <>
              <p className="hint" style={{ marginTop: 0 }}>
                {t('main.hint')}
              </p>
              <div style={cardGrid}>
                <Card
                  emoji="📥"
                  title={t('newFromFile.title')}
                  desc={t('newFromFile.desc')}
                  onClick={() => setStep('new-from-file')}
                />
                <Card
                  emoji="📂"
                  title={t('openProject.title')}
                  desc={t('openProject.desc', { key: shortcutLabel('Ctrl+O') })}
                  onClick={() => choose({ kind: 'open-tem' })}
                />
                <Card
                  emoji="📄"
                  title={t('empty.title')}
                  desc={t('empty.desc')}
                  onClick={() => choose({ kind: 'create-empty' })}
                />
                <Card
                  emoji="🎓"
                  title={t('demo.title')}
                  desc={t('demo.desc')}
                  onClick={() => choose({ kind: 'open-demo' })}
                />
                <Card
                  emoji="🌐"
                  title="Open English demo"
                  desc="Fictional example 'Returning to the piano' in English (12 boxes / 12 paths / 4 SD-SG / 3 periods)"
                  onClick={() => choose({ kind: 'open-demo-en' })}
                />
                <Card
                  emoji="🔗"
                  title={t('transcriptDemo.title')}
                  desc={t('transcriptDemo.desc')}
                  onClick={() => choose({ kind: 'open-transcript-demo' })}
                />
              </div>
            </>
          ) : (
            <>
              <p className="hint" style={{ marginTop: 0 }}>
                {t('fromFile.hint')}
              </p>
              <div style={cardGrid}>
                <Card
                  emoji="📖"
                  title={t('transcript.title')}
                  desc={t('transcript.desc')}
                  onClick={() => choose({ kind: 'new-from-transcript' })}
                />
                <Card
                  emoji="📦"
                  title={t('transcriptsBulk.title')}
                  desc={t('transcriptsBulk.desc')}
                  onClick={() => choose({ kind: 'new-from-transcripts-bulk' })}
                />
                <Card
                  emoji="📊"
                  title={t('csvBoxes.title')}
                  desc={t('csvBoxes.desc')}
                  onClick={() => choose({ kind: 'new-from-csv-boxes' })}
                />
              </div>
              <div style={{ marginTop: 16 }}>
                <button className="ribbon-btn-small" onClick={() => setStep('main')}>{t('back')}</button>
              </div>
            </>
          )}
        </div>
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
            />
            {t('dontShowAgain')}
          </label>
          <button className="ribbon-btn-small" onClick={dismiss}>
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
}

function Card({
  emoji,
  title,
  desc,
  onClick,
}: {
  emoji: string;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: 'left',
        padding: 16,
        background: '#fafafa',
        border: '1px solid #ddd',
        borderRadius: 8,
        cursor: 'pointer',
        transition: 'background 0.15s, border-color 0.15s',
        fontFamily: 'inherit',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = '#e8f0fe';
        (e.currentTarget as HTMLElement).style.borderColor = '#4a90e2';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = '#fafafa';
        (e.currentTarget as HTMLElement).style.borderColor = '#ddd';
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 6 }}>{emoji}</div>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 12, color: '#555', lineHeight: 1.5 }}>{desc}</div>
    </button>
  );
}

const cardGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 12,
};
