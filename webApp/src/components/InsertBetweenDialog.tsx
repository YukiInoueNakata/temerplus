// ============================================================================
// InsertBetweenDialog - 2選択Boxの間に挿入
// モード:
//   1. simple: 位置変更なし、A-B間に均等配置、A→B矢印は A→C1→..→CN→B に分割
//   2. expand-shift: レベル指定で挿入+シフト
//      - AからCまでのレベル差 (deltaAtoC)
//      - CからBまでのレベル差 (deltaCtoB)
//      - 内側Box間は 1レベル固定
//      - B以降のBoxも shift 分シフト
// ============================================================================

import { useState, useMemo, useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useTEMStore, useActiveSheet } from '../store/store';
import { LEVEL_PX } from '../store/defaults';

export function InsertBetweenDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation('insertBetweenDialog');
  const selection = useTEMStore((s) => s.selection);
  const sheet = useActiveSheet();
  const layout = useTEMStore((s) => s.doc.settings.layout);
  const insertBoxesBetween = useTEMStore((s) => s.insertBoxesBetween);

  const [mode, setMode] = useState<'simple' | 'expand-shift'>('simple');
  const [count, setCount] = useState(1);
  const [deltaAtoC, setDeltaAtoC] = useState(1);
  const [deltaCtoB, setDeltaCtoB] = useState(1);

  const [startBox, endBox] = useMemo(() => {
    if (!sheet) return [undefined, undefined];
    const sel = selection.boxIds;
    if (sel.length !== 2) return [undefined, undefined];
    const boxes = sel.map((id) => sheet.boxes.find((b) => b.id === id)).filter((b): b is NonNullable<typeof b> => !!b);
    if (boxes.length !== 2) return [undefined, undefined];
    const [a, b] = boxes;
    const aTime = layout === 'horizontal' ? a.x : a.y;
    const bTime = layout === 'horizontal' ? b.x : b.y;
    return aTime <= bTime ? [a, b] : [b, a];
  }, [sheet, selection.boxIds, layout]);

  useEffect(() => {
    if (open) {
      setCount(1);
      setMode('simple');
      setDeltaAtoC(1);
      setDeltaCtoB(1);
    }
  }, [open]);

  if (!open) return null;

  const isValid = startBox && endBox && count >= 1;

  const handleSubmit = () => {
    if (!isValid) return;
    insertBoxesBetween(
      startBox!.id,
      endBox!.id,
      count,
      mode,
      mode === 'expand-shift' ? { deltaAtoC, deltaCtoB } : undefined
    );
    onClose();
  };

  const currentStartLevel = startBox
    ? ((layout === 'horizontal' ? startBox.x : startBox.y) / LEVEL_PX).toFixed(1)
    : '-';
  const currentEndLevel = endBox
    ? ((layout === 'horizontal' ? endBox.x : endBox.y) / LEVEL_PX).toFixed(1)
    : '-';

  // expand-shift のプレビュー計算
  const previewEndLevel = startBox
    ? Number(currentStartLevel) + deltaAtoC + (count - 1) + deltaCtoB
    : 0;
  const shift = endBox
    ? previewEndLevel - Number(currentEndLevel)
    : 0;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{t('title')}</h3>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        <div className="modal-body">
          {!startBox || !endBox ? (
            <div style={{ padding: 20, color: '#d33' }}>
              <Trans t={t} i18nKey="selectTwo" />
            </div>
          ) : (
            <>
              <section className="settings-section">
                <h4>{t('selected.title')}</h4>
                <div className="setting-row">
                  <label>{t('selected.start')}</label>
                  <span><code>{startBox.id}</code> / {startBox.label}<br />{t('selected.current')} <strong>{currentStartLevel}</strong></span>
                </div>
                <div className="setting-row">
                  <label>{t('selected.end')}</label>
                  <span><code>{endBox.id}</code> / {endBox.label}<br />{t('selected.current')} <strong>{currentEndLevel}</strong></span>
                </div>
              </section>

              <section className="settings-section">
                <h4>{t('settings.title')}</h4>
                <div className="setting-row">
                  <label>{t('settings.count')}</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={count}
                    onChange={(e) => setCount(Math.max(1, Number(e.target.value)))}
                    style={{ width: 60 }}
                  />
                </div>
                <div className="setting-row">
                  <label>{t('settings.mode')}</label>
                  <select value={mode} onChange={(e) => setMode(e.target.value as 'simple' | 'expand-shift')}>
                    <option value="simple">{t('mode.simple')}</option>
                    <option value="expand-shift">{t('mode.expandShift')}</option>
                  </select>
                </div>
                <p className="hint">
                  {t('settings.splitArrow')}
                </p>
              </section>

              {mode === 'simple' && (
                <section className="settings-section">
                  <p className="hint">
                    <Trans
                      t={t}
                      i18nKey="hint.simple"
                      values={{ start: currentStartLevel, end: currentEndLevel, n: count }}
                    />
                  </p>
                </section>
              )}

              {mode === 'expand-shift' && (
                <section className="settings-section">
                  <h4>{t('delta.title')}</h4>
                  <div className="setting-row">
                    <label>{t('delta.aToC')}</label>
                    <input
                      type="number"
                      step="0.1"
                      min={0.1}
                      value={deltaAtoC}
                      onChange={(e) => setDeltaAtoC(Number(e.target.value))}
                      style={{ width: 80 }}
                    />
                  </div>
                  <div className="setting-row">
                    <label>{t('delta.cToB')}</label>
                    <input
                      type="number"
                      step="0.1"
                      min={0.1}
                      value={deltaCtoB}
                      onChange={(e) => setDeltaCtoB(Number(e.target.value))}
                      style={{ width: 80 }}
                    />
                  </div>
                  <p className="hint">
                    <Trans
                      t={t}
                      i18nKey={count > 1 ? 'hint.expandShift.multi' : 'hint.expandShift.single'}
                      values={{
                        start: currentStartLevel,
                        aToC: deltaAtoC,
                        cToB: deltaCtoB,
                        newEnd: previewEndLevel.toFixed(1),
                        oldEnd: currentEndLevel,
                        shift: `${shift >= 0 ? '+' : ''}${shift.toFixed(1)}`,
                      }}
                    />
                  </p>
                </section>
              )}
            </>
          )}
        </div>
        <div className="modal-footer">
          <button className="ribbon-btn-small" onClick={onClose}>{t('cancel')}</button>
          <button
            className="ribbon-btn-primary"
            onClick={handleSubmit}
            disabled={!isValid}
            style={!isValid ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          >
            {t('insert')}
          </button>
        </div>
      </div>
    </div>
  );
}
