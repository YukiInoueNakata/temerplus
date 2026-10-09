// ============================================================================
// PeriodLabelsDialog - 時期ラベルの追加・編集・削除
// ============================================================================

import { useEffect, useMemo, useState } from 'react';
import { useTEMStore, useActiveSheet } from '../store/store';
import { computePeriodLabels, computePeriodBandBounds } from '../utils/periodLabels';
import { LEVEL_PX } from '../store/defaults';

const fmtLevel = (v: number) => (Math.round(v * 100) / 100).toString();

export function PeriodLabelsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
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
      alert('ラベルを入力してください');
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
          <h3>時期ラベル</h3>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        <div className="modal-body">
          <section className="settings-section">
            <h4>新規追加</h4>
            <div className="setting-row">
              <label>時期ラベル</label>
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="例: 入学前、就職後"
                style={{ width: 180 }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
              />
            </div>
            <div className="setting-row">
              <label>Time_Level（時間軸位置）</label>
              <input
                type="number"
                step="0.5"
                value={newPosition}
                onChange={(e) => setNewPosition(Number(e.target.value))}
                style={{ width: 100 }}
              />
            </div>
            <div className="setting-row" style={{ justifyContent: 'flex-end' }}>
              <button className="ribbon-btn-primary" onClick={handleAdd}>追加</button>
            </div>
          </section>

          <section className="settings-section">
            <h4>現在の時期ラベル</h4>
            {sheet && sheet.periodLabels.length === 0 && (
              <p className="hint">まだ時期ラベルがありません。</p>
            )}
            {sheet && sheet.periodLabels.length > 0 && (
              <table style={{ width: '100%', fontSize: '0.92em' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>ラベル</th>
                    <th style={{ textAlign: 'left', width: 80 }}>Time_Level</th>
                    {isBand && <th style={{ textAlign: 'left', width: 110 }}>帯の範囲</th>}
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
                              ? `${fmtLevel(rangeById.get(pl.id)![0])} 〜 ${fmtLevel(rangeById.get(pl.id)![1])}`
                              : ''}
                          </td>
                        )}
                        <td>
                          <button className="row-btn danger" onClick={() => removePeriodLabel(pl.id)} title="削除">×</button>
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
                {'Time_Level は時間軸上の位置（Box の Time_Level と同じ目盛り）です。'
                  + '帯の表示では、各時期の Time_Level を代表点として、区切りは隣り合う 2 つの時期の Time_Level のちょうど中間に引かれ、'
                  + 'ラベルは区切りと区切りの真ん中に置かれます（両端は時間矢印の端）。'
                  + 'そのため 1 つの値を変えると両側の区切りが動き、隣の時期の値を越えると順番が入れ替わります。'
                  + '区切りを置きたい位置の前後に、各時期の値を置いてください（範囲は右の列で確認できます）。'}
                <br />
              </>
            ) : (
              <>
                Time_Level は時間軸上の位置（Box の Time_Level と同じ目盛り）で、ラベルの中心がその位置に来ます。<br />
              </>
            )}
            時期ラベルは「表示」タブの「時期」トグルで表示/非表示を切替できます。<br />
            位置の調整（基準・オフセット）は「設定」ダイアログから。
          </p>
        </div>
        <div className="modal-footer">
          <button className="ribbon-btn-primary" onClick={onClose}>閉じる</button>
        </div>
      </div>
    </div>
  );
}
