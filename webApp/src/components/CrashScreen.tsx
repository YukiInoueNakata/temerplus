// ============================================================================
// CrashScreen - アプリ全体が描画エラーで止まったときの画面
// - 止まった瞬間に作業中の図を自動バックアップ（IndexedDB）へ退避する。
//   自動バックアップは 30 秒ごと・変更時のみなので、それだけでは直前の作業が残らないことがある
//   （2026-10-14 利用者の報告: エラー後に再読み込みすると作業中の内容がすべて消えた）
// - 作業中の図を .tem として保存できる（復元してもまた止まる場合の逃げ道）
// - エラーの詳細（どの部品で起きたか）をコピーして開発者に送れる
// ============================================================================

import { useEffect, useState, type ErrorInfo } from 'react';
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

  useEffect(() => {
    // 描画が止まってもストアの中身は残っているので、そのまま退避する
    const doc = useTEMStore.getState().doc;
    saveAutoBackup(doc).then(() => setBackup('saved')).catch(() => setBackup('failed'));
  }, []);

  const details = [
    `TEMer エラー報告 ${new Date().toISOString()}`,
    `メッセージ: ${error.message}`,
    `ブラウザ: ${navigator.userAgent}`,
    `URL: ${location.href}`,
    '',
    '部品の位置（componentStack）:',
    info?.componentStack?.trim() ?? '（なし）',
    '',
    'スタック:',
    error.stack ?? '（なし）',
  ].join('\n');

  const saveTem = () => {
    const doc = useTEMStore.getState().doc;
    const title = (doc.metadata?.title || 'TEM図').replace(/[/\\:*?"<>|]/g, '_');
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}_エラー時の退避_${stamp()}.tem`;
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
      <h2 style={{ color: '#c00' }}>予期しないエラーが発生しました</h2>
      <p style={{ fontSize: 14 }}>
        アプリの描画中にエラーが発生しました。作業中の図は次の方法で取り戻せます。
      </p>
      <ol style={{ fontSize: 14 }}>
        <li>
          {backup === 'saving' && '作業中の図を自動保存に退避しています…'}
          {backup === 'saved' && '作業中の図を自動保存に退避しました。下の「再読み込み」を押し、表示される確認で「OK（復元する）」を選んでください。「キャンセル」を選ぶと退避した内容は消えます。'}
          {backup === 'failed' && '自動保存への退避に失敗しました。下の「作業中の図を .tem として保存」で保存してから再読み込みしてください。'}
        </li>
        <li>
          復元してもまたエラーになる場合は、「作業中の図を .tem として保存」でファイルに保存しておき、
          そのファイルと下の「エラーの詳細」を開発者に送ってください。
        </li>
      </ol>
      <div style={{ margin: '12px 0' }}>
        <button style={btn} onClick={saveTem}>作業中の図を .tem として保存</button>
        <button style={btn} onClick={copy}>{copied ? 'コピーしました' : 'エラーの詳細をコピー'}</button>
        <button style={btn} onClick={() => window.location.reload()}>再読み込み</button>
      </div>
      <details>
        <summary style={{ cursor: 'pointer', fontSize: 13 }}>エラーの詳細</summary>
        <pre style={{ background: '#f8f8f8', padding: 12, fontSize: 12, whiteSpace: 'pre-wrap', borderRadius: 4 }}>
          {details}
        </pre>
      </details>
    </div>
  );
}
