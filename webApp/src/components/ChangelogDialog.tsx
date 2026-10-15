// ============================================================================
// ChangelogDialog - 「ヘルプ > 更新情報」。src/data/changelog.json を新しい順に表示する
// 開いた時点で最新の日付を「見た」として覚え、リボンの「新」の印を消す
// ============================================================================

import { useEffect } from 'react';
import changelogData from '../data/changelog.json';
import { sortEntries, CHANGELOG_SEEN_KEY, type ChangelogEntry } from '../utils/changelog';

const entries = sortEntries(changelogData as ChangelogEntry[]);

const KIND_COLOR: Record<string, string> = { 新機能: '#1a7f37', 改善: '#0969da', 修正: '#9a6700' };

export function ChangelogDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open || !entries[0]) return;
    try {
      localStorage.setItem(CHANGELOG_SEEN_KEY, entries[0].date);
    } catch {
      // localStorage が使えない環境（プライベートモード等）では印が消えないだけ
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: 640 }}>
        <div className="modal-header">
          <h3>更新情報</h3>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto', lineHeight: 1.6 }}>
          {entries.map((e) => (
            <section key={e.date} style={{ marginBottom: 16 }}>
              <h4 style={{ margin: '0 0 6px', borderBottom: '1px solid #ddd' }}>{e.date}</h4>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {e.items.map((it, i) => (
                  <li key={i} style={{ marginBottom: 4 }}>
                    <span style={{ color: KIND_COLOR[it.kind], fontWeight: 600, marginRight: 6 }}>{it.kind}</span>
                    <strong>{it.title}</strong>
                    {it.detail && <div style={{ fontSize: '0.92em', color: '#444' }}>{it.detail}</div>}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <div className="modal-footer">
          <button onClick={onClose}>閉じる</button>
        </div>
      </div>
    </div>
  );
}
