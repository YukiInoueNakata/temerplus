// ============================================================================
// CrashScreen - アプリ全体が描画エラーで止まったときの画面
// - 止まった瞬間に作業中の図を自動バックアップ（IndexedDB）へ退避する。
//   自動バックアップは 30 秒ごと・変更時のみなので、それだけでは直前の作業が残らないことがある
//   （2026-10-14 利用者の報告: エラー後に再読み込みすると作業中の内容がすべて消えた）
// - 作業中の図を .tem として保存できる（復元してもまた止まる場合の逃げ道）
// - エラーの詳細（どの部品で起きたか）をコピーして開発者に送れる
// ============================================================================

import { useEffect, useState, type ErrorInfo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTEMStore } from '../store/store';
import { saveAutoBackup } from '../utils/fileIO';

const stamp = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
};

export function CrashScreen({ error, info }: { error: Error; info?: ErrorInfo | null }) {
  const [backup, setBackup] = useState<'saving' | 'saved' | 'failed'>('saving');
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation('crashScreen');

  useEffect(() => {
    // 描画が止まってもストアの中身は残っているので、そのまま退避する
    const doc = useTEMStore.getState().doc;
    saveAutoBackup(doc).then(() => setBackup('saved')).catch(() => setBackup('failed'));
  }, []);

  const details = [
    t('report.title', { time: new Date().toISOString() }),
    t('report.message', { message: error.message }),
    t('report.browser', { ua: navigator.userAgent }),
    `URL: ${location.href}`,
    '',
    t('report.componentStack'),
    info?.componentStack?.trim() ?? t('report.none'),
    '',
    t('report.stack'),
    error.stack ?? t('report.none'),
  ].join('\n');

  const saveTem = () => {
    const doc = useTEMStore.getState().doc;
    const title = (doc.metadata?.title || t('file.defaultTitle')).replace(/[/\\:*?"<>|]/g, '_');
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}_${t('file.suffix')}_${stamp()}.tem`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(details);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const btn = { padding: '6px 14px', fontSize: 14, cursor: 'pointer', marginRight: 8, marginBottom: 8 } as const;

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 760, margin: '40px auto', lineHeight: 1.6 }}>
      <h2 style={{ color: '#c00' }}>{t('heading')}</h2>
      <p style={{ fontSize: 14 }}>
        {t('intro')}
      </p>
      <ol style={{ fontSize: 14 }}>
        <li>
          {backup === 'saving' && t('backup.saving')}
          {backup === 'saved' && t('backup.saved')}
          {backup === 'failed' && t('backup.failed')}
        </li>
        <li>
          {t('advice')}
        </li>
      </ol>
      <div style={{ margin: '12px 0' }}>
        <button style={btn} onClick={saveTem}>{t('saveTem')}</button>
        <button style={btn} onClick={copy}>{copied ? t('copied') : t('copyDetails')}</button>
        <button style={btn} onClick={() => window.location.reload()}>{t('reload')}</button>
      </div>
      <details>
        <summary style={{ cursor: 'pointer', fontSize: 13 }}>{t('details')}</summary>
        <pre style={{ background: '#f8f8f8', padding: 12, fontSize: 12, whiteSpace: 'pre-wrap', borderRadius: 4 }}>
          {details}
        </pre>
      </details>
    </div>
  );
}
