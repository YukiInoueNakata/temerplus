// ============================================================================
// AnonymizeExportDialog
// 現在のドキュメントを匿名化して別名 .tem として書き出す。
// - 既に取り込み時に anonymizationMap がある Transcript はそれを継承
// - 追加の匿名化対象 (コンマ区切り) をユーザに入力させ、新マップを併用
// ============================================================================

import { useMemo, useState } from 'react';
import { useTEMStore } from '../store/store';
import { anonymizeDocument, buildAnonymizationMap } from '../utils/anonymize';

export function AnonymizeExportDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const doc = useTEMStore((s) => s.doc);
  const [additionalNames, setAdditionalNames] = useState('');
  const [prefix, setPrefix] = useState('協力者');

  // 既存の anonymizationMap を集約 (Transcript ごと)
  const existingMaps = useMemo(() => {
    return doc.transcripts.map((t) => ({
      title: t.title,
      sessionNumber: t.sessionNumber,
      map: t.metadata?.anonymizationMap ?? {},
    }));
  }, [doc.transcripts]);

  const totalExistingEntries = existingMaps.reduce((acc, m) => acc + Object.keys(m.map).length, 0);

  const exportAnonymized = () => {
    // 既存マップを統合 (重複は後勝ち)
    const merged: Record<string, string> = {};
    for (const m of existingMaps) Object.assign(merged, m.map);
    // 追加対象を加える
    const addMap = additionalNames.trim()
      ? buildAnonymizationMap(additionalNames, prefix.trim() || '協力者')
      : {};
    Object.assign(merged, addMap);

    if (Object.keys(merged).length === 0) {
      alert('匿名化対象が 1 件もありません。\n取り込み時に匿名化していないか、追加の対象を入力してください。');
      return;
    }

    const anonDoc = anonymizeDocument(doc, merged);

    // ダウンロード
    const json = JSON.stringify(anonDoc, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const base = (doc.metadata.title || 'Untitled').replace(/[/\\:*?"<>|]/g, '_');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${base}_anonymized.tem`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: 640, maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header">
          <h3>匿名化エクスポート</h3>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        <div className="modal-body" style={{ flex: 1, overflow: 'auto' }}>
          <p className="hint" style={{ marginTop: 0 }}>
            原文に含まれる人名・組織名を仮名に置換した <strong>.tem</strong> を別ファイル名 (
            <code>{(doc.metadata.title || 'Untitled')}_anonymized.tem</code>
            ) で書き出します。元のドキュメントには影響しません。<br />
            置換対象: 段落本文・段落の話者欄・SourceRef.quoteText・Box / Line / SDSG の description。
            <br />
            置換しないもの: Box.label / Line.label / SDSG.label (解析者の概念名なので個別確認が必要)。
          </p>

          <section className="settings-section">
            <h4>既存の匿名化マップ ({totalExistingEntries} 件)</h4>
            {existingMaps.length === 0 ? (
              <p className="hint">原文が登録されていません。</p>
            ) : (
              <ul style={{ paddingLeft: 16, fontSize: 12 }}>
                {existingMaps.map((m, i) => (
                  <li key={i}>
                    {m.sessionNumber !== undefined && (
                      <span style={{ color: '#888', marginRight: 4 }}>第{m.sessionNumber}回</span>
                    )}
                    {m.title}: {Object.keys(m.map).length} 件
                    {Object.keys(m.map).length > 0 && (
                      <span style={{ color: '#666', marginLeft: 4 }}>
                        ({Object.entries(m.map).slice(0, 3).map(([k, v]) => `${k}→${v}`).join(', ')}
                        {Object.keys(m.map).length > 3 && '...'})
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="settings-section">
            <h4>追加の匿名化対象 (任意)</h4>
            <div className="setting-row" style={{ alignItems: 'flex-start' }}>
              <label>氏名・組織名</label>
              <textarea
                value={additionalNames}
                onChange={(e) => setAdditionalNames(e.target.value)}
                placeholder="コンマ区切り (例: 山田太郎, X 大学, 田中先生)"
                style={{ flex: 1, minHeight: 60, fontSize: 12, fontFamily: 'inherit', resize: 'vertical' }}
              />
            </div>
            <div className="setting-row">
              <label>仮名 prefix</label>
              <input
                type="text"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                style={{ width: 120 }}
              />
              <span style={{ fontSize: 11, color: '#666', marginLeft: 8 }}>
                → [{prefix || '協力者'}A], [{prefix || '協力者'}B], ...
              </span>
            </div>
          </section>
        </div>
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button className="ribbon-btn-small" onClick={onClose}>キャンセル</button>
          <button className="ribbon-btn-primary" onClick={exportAnonymized}>
            匿名化版を書き出す
          </button>
        </div>
      </div>
    </div>
  );
}
