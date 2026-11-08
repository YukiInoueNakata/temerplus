// ============================================================================
// AnonymizeExportDialog
// 現在のドキュメントを匿名化して別名 .tem として書き出す。
// - 既に取り込み時に anonymizationMap がある Transcript はそれを継承
// - 追加の匿名化対象 (コンマ区切り) をユーザに入力させ、新マップを併用
// ============================================================================

import { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useTEMStore } from '../store/store';
import { anonymizeDocument, buildAnonymizationMap } from '../utils/anonymize';

export function AnonymizeExportDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation('anonymizeExportDialog');
  const doc = useTEMStore((s) => s.doc);
  const [additionalNames, setAdditionalNames] = useState('');
  const [prefix, setPrefix] = useState('協力者'); // i18n-ok 仮名の既定値（図のデータに入る値）

  // 既存の anonymizationMap を集約 (Transcript ごと)
  const existingMaps = useMemo(() => {
    return doc.transcripts.map((t) => ({
      title: t.title,
      sessionNumber: t.sessionNumber,
      map: t.metadata?.anonymizationMap ?? {},
    }));
  }, [doc.transcripts]);

  const pfx = prefix || '協力者'; // i18n-ok 仮名の既定値（図のデータに入る値）
  const totalExistingEntries = existingMaps.reduce((acc, m) => acc + Object.keys(m.map).length, 0);

  const exportAnonymized = () => {
    // 既存マップを統合 (重複は後勝ち)
    const merged: Record<string, string> = {};
    for (const m of existingMaps) Object.assign(merged, m.map);
    // 追加対象を加える
    const addMap = additionalNames.trim()
      ? buildAnonymizationMap(additionalNames, prefix.trim() || '協力者') // i18n-ok 仮名の既定値（図のデータに入る値）
      : {};
    Object.assign(merged, addMap);

    if (Object.keys(merged).length === 0) {
      alert(t('alert.noTargets'));
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
          <h3>{t('title')}</h3>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        <div className="modal-body" style={{ flex: 1, overflow: 'auto' }}>
          <p className="hint" style={{ marginTop: 0 }}>
            <Trans
              t={t}
              i18nKey="hint.intro"
              values={{ file: `${doc.metadata.title || 'Untitled'}_anonymized.tem` }}
              components={{ code: <code />, strong: <strong /> }}
            />
            <br />
            {t('hint.replaced')}
            <br />
            {t('hint.notReplaced')}
          </p>

          <section className="settings-section">
            <h4>{t('existing.title', { count: totalExistingEntries })}</h4>
            {existingMaps.length === 0 ? (
              <p className="hint">{t('existing.none')}</p>
            ) : (
              <ul style={{ paddingLeft: 16, fontSize: 12 }}>
                {existingMaps.map((m, i) => (
                  <li key={i}>
                    {m.sessionNumber !== undefined && (
                      <span style={{ color: '#888', marginRight: 4 }}>{t('existing.session', { n: m.sessionNumber })}</span>
                    )}
                    {t('existing.count', { title: m.title, count: Object.keys(m.map).length })}
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
            <h4>{t('additional.title')}</h4>
            <div className="setting-row" style={{ alignItems: 'flex-start' }}>
              <label>{t('additional.names')}</label>
              <textarea
                value={additionalNames}
                onChange={(e) => setAdditionalNames(e.target.value)}
                placeholder={t('additional.placeholder')}
                style={{ flex: 1, minHeight: 60, fontSize: 12, fontFamily: 'inherit', resize: 'vertical' }}
              />
            </div>
            <div className="setting-row">
              <label>{t('additional.prefix')}</label>
              <input
                type="text"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                style={{ width: 120 }}
              />
              <span style={{ fontSize: 11, color: '#666', marginLeft: 8 }}>
                → [{pfx}A], [{pfx}B], ...
              </span>
            </div>
          </section>
        </div>
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button className="ribbon-btn-small" onClick={onClose}>{t('cancel')}</button>
          <button className="ribbon-btn-primary" onClick={exportAnonymized}>
            {t('export')}
          </button>
        </div>
      </div>
    </div>
  );
}
