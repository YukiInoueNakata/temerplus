// ============================================================================
// PeriodLabelsDialog - 時期ラベルの追加・編集・削除
// ============================================================================

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTEMStore, useActiveSheet } from '../store/store';
import { computePeriodLabels, computePeriodBandBounds } from '../utils/periodLabels';
import { LEVEL_PX } from '../store/defaults';

const fmtLevel = (v: number) => (Math.round(v * 100) / 100).toString();

export function PeriodLabelsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation('periodLabelsDialog');
  const sheet = useActiveSheet();
  const addPeriodLabel = useTEMStore((s) => s.addPeriodLabel);
  const updatePeriodLabel = useTEMStore((s) => s.updatePeriodLabel);
  const removePeriodLabel = useTEMStore((s) => s.removePeriodLabel);

  const settings = useTEMStore((s) => s.doc.settings);

  const [newLabel, setNewLabel] = useState('');
  const [newPosition, setNewPosition] = useState(0);
  // 行の並び順。入力のたびに位置順へ並べ替えると、編集中の行が飛んで別の行に見える
  // （2026-10-05 利用者の報告「ある時期ラベルが次のラベルを急に追い越す」の一因）。
  // 開いたとき・入力欄から離れたとき・追加したときだけ位置順に並べ直す
  const [orderIds, setOrderIds] = useState<string[]>([]);
  const sortByPosition = () => {
    if (!sheet) return;
    setOrderIds([...sheet.periodLabels].sort((a, b) => a.position - b.position).map((p) => p.id));
  };
  const labelCount = sheet?.periodLabels.length ?? 0;
  useEffect(() => {
    if (open) sortByPosition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, labelCount]);

  // 帯スタイルの各時期の範囲（Time_Level 単位）。図の区切りと同じ計算（computePeriodBandBounds）
  const isBand = settings.periodLabels.bandStyle === 'band';
  const rangeById = useMemo(() => {
    const m = new Map<string, [number, number]>();
    if (!sheet || !isBand) return m;
    const geom = computePeriodLabels(sheet, settings.layout, settings.periodLabels, settings.timeArrow,
      settings.sdsgSpace, settings.typeLabelVisibility);
    if (!geom) return m;
    const { sorted, bounds } = computePeriodBandBounds(geom);
    sorted.forEach((it, i) => m.set(it.id, [bounds[i] / LEVEL_PX, bounds[i + 1] / LEVEL_PX]));
    return m;
  }, [sheet, settings, isBand]);

  if (!open) return null;

  const rows = sheet
    ? [
      ...orderIds.map((id) => sheet.periodLabels.find((p) => p.id === id)).filter((p): p is NonNullable<typeof p> => !!p),
      ...sheet.periodLabels.filter((p) => !orderIds.includes(p.id)),
    ]
    : [];

  const handleAdd = () => {
    if (!newLabel.trim()) {
      alert(t('alert.empty'));
      return;
    }
    addPeriodLabel(newLabel.trim(), newPosition);
    setNewLabel('');
    setNewPosition((p) => p + 1);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{t('title')}</h3>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        <div className="modal-body">
          <section className="settings-section">
            <h4>{t('add.title')}</h4>
            <div className="setting-row">
              <label>{t('add.label')}</label>
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder={t('add.placeholder')}
                style={{ width: 180 }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
              />
            </div>
            <div className="setting-row">
              <label>{t('add.position')}</label>
              <input
                type="number"
                step="0.5"
                value={newPosition}
                onChange={(e) => setNewPosition(Number(e.target.value))}
                style={{ width: 100 }}
              />
            </div>
            <div className="setting-row" style={{ justifyContent: 'flex-end' }}>
              <button className="ribbon-btn-primary" onClick={handleAdd}>{t('add.button')}</button>
            </div>
          </section>

          <section className="settings-section">
            <h4>{t('list.title')}</h4>
            {sheet && sheet.periodLabels.length === 0 && (
              <p className="hint">{t('list.none')}</p>
            )}
            {sheet && sheet.periodLabels.length > 0 && (
              <table style={{ width: '100%', fontSize: '0.92em' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>{t('col.label')}</th>
                    <th style={{ textAlign: 'left', width: 80 }}>Time_Level</th>
                    {isBand && <th style={{ textAlign: 'left', width: 110 }}>{t('col.range')}</th>}
                    <th style={{ width: 40 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((pl) => (
                      <tr key={pl.id}>
                        <td>
                          <input
                            type="text"
                            value={pl.label}
                            onChange={(e) => updatePeriodLabel(pl.id, { label: e.target.value })}
                            style={{ width: '100%' }}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            step="0.5"
                            value={pl.position}
                            onChange={(e) => updatePeriodLabel(pl.id, { position: Number(e.target.value) })}
                            onBlur={sortByPosition}
                            style={{ width: 70 }}
                          />
                        </td>
                        {isBand && (
                          <td style={{ color: '#555', whiteSpace: 'nowrap' }}>
                            {rangeById.has(pl.id)
                              ? t('range', { from: fmtLevel(rangeById.get(pl.id)![0]), to: fmtLevel(rangeById.get(pl.id)![1]) })
                              : ''}
                          </td>
                        )}
                        <td>
                          <button className="row-btn danger" onClick={() => removePeriodLabel(pl.id)} title={t('delete')}>×</button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </section>

          <p className="hint">
            {isBand ? (
              <>
                {t('hint.band')}
                <br />
              </>
            ) : (
              <>
                {t('hint.point')}<br />
              </>
            )}
            {t('hint.toggle')}<br />
            {t('hint.settings')}
          </p>
        </div>
        <div className="modal-footer">
          <button className="ribbon-btn-primary" onClick={onClose}>{t('close')}</button>
        </div>
      </div>
    </div>
  );
}
