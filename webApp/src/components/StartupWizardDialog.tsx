// ============================================================================
// StartupWizardDialog
//
// アプリ起動時に表示する 4 択ウィザード。
//   1. ファイルから新規作成 (→ サブメニュー: 原文取り込み / 切片CSV)
//   2. プロジェクトを開く (.tem)
//   3. 空ファイルから作成
//   4. デモファイルを開く
//
// 「次回から表示しない」localStorage キーは temer:hide-startup-wizard。
// popout window では表示しない (App 側で抑止)。
// ============================================================================

import { useState } from 'react';

export type StartupWizardChoice =
  | { kind: 'open-tem' }                  // 既存 .tem を開く
  | { kind: 'create-empty' }              // 空ファイルから始める (現状の空 doc のまま)
  | { kind: 'open-demo' }                 // デモ .tem を開く
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
          <h3>TEMer へようこそ</h3>
          <button onClick={dismiss} className="modal-close" title="閉じて空のシートで始める">×</button>
        </div>
        <div className="modal-body" style={{ minHeight: 360 }}>
          {step === 'main' ? (
            <>
              <p className="hint" style={{ marginTop: 0 }}>
                何から始めますか？ 後からファイル / 原文ビューア / リボンメニューでも切り替えられます。
              </p>
              <div style={cardGrid}>
                <Card
                  emoji="📥"
                  title="ファイルから新規作成"
                  desc="原文 (インタビュー逐語録) や切片 CSV/Excel を元に TEM 図を作り始める"
                  onClick={() => setStep('new-from-file')}
                />
                <Card
                  emoji="📂"
                  title="プロジェクトを開く"
                  desc="保存済の .tem ファイルを開く (Ctrl+O 相当)"
                  onClick={() => choose({ kind: 'open-tem' })}
                />
                <Card
                  emoji="📄"
                  title="空ファイルから作成"
                  desc="空の TEM 図 (時期1 / 時期2) から始める"
                  onClick={() => choose({ kind: 'create-empty' })}
                />
                <Card
                  emoji="🎓"
                  title="デモファイルを開く"
                  desc="神崎・鈴木 (2021) Figure 1 を再現した作例 (32 Box / 34 Line / 4 SDSG / 4 期)"
                  onClick={() => choose({ kind: 'open-demo' })}
                />
              </div>
            </>
          ) : (
            <>
              <p className="hint" style={{ marginTop: 0 }}>
                何を元に Box を作成しますか？
              </p>
              <div style={cardGrid}>
                <Card
                  emoji="📖"
                  title="原文 (インタビュー) を 1 ファイル取り込み"
                  desc=".txt / .csv / .xlsx / .docx 形式の逐語録 1 つを取り込み、原文ビューアで段落を選んで Box を作成"
                  onClick={() => choose({ kind: 'new-from-transcript' })}
                />
                <Card
                  emoji="📦"
                  title="原文を複数ファイル/フォルダから一括取り込み"
                  desc="A_第1回.docx, A_第2回.docx, B_第1回.docx... をフォルダ選択でまとめて取り込み。ファイル名から協力者・回数を自動推測"
                  onClick={() => choose({ kind: 'new-from-transcripts-bulk' })}
                />
                <Card
                  emoji="📊"
                  title="切片 (Box) 情報の CSV/Excel から"
                  desc="ラベル・種別・配置などを記載した CSV / Excel / テキストから Box を一括作成"
                  onClick={() => choose({ kind: 'new-from-csv-boxes' })}
                />
              </div>
              <div style={{ marginTop: 16 }}>
                <button className="ribbon-btn-small" onClick={() => setStep('main')}>← 戻る</button>
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
            次回から表示しない
          </label>
          <button className="ribbon-btn-small" onClick={dismiss}>
            閉じる
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
