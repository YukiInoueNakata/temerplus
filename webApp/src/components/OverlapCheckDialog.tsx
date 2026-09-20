// ============================================================================
// OverlapCheckDialog - 重なりチェックの結果一覧
// - 4 種の検査を個別にオンオフでき、設定は localStorage に残る
// - 行をクリックすると該当要素を選択し、その位置へ画面を寄せる
// ============================================================================

import { useMemo } from 'react';
import { useTEMStore, useActiveSheet } from '../store/store';
import {
  detectOverlaps,
  OVERLAP_CHECK_LABELS,
  countByKind,
  type OverlapCheck,
  type OverlapChecks,
  type OverlapIssue,
} from '../utils/overlapDetect';

export const OVERLAP_CHECK_ORDER: OverlapCheck[] = ['labelLabel', 'boxBox', 'textOverflow', 'lineLabel'];

export function OverlapCheckDialog({
  open,
  onClose,
  checks,
  onChangeChecks,
  showInStatusBar,
  onChangeShowInStatusBar,
}: {
  open: boolean;
  onClose: () => void;
  checks: OverlapChecks;
  onChangeChecks: (next: OverlapChecks) => void;
  showInStatusBar: boolean;
  onChangeShowInStatusBar: (next: boolean) => void;
}) {
  const doc = useTEMStore((s) => s.doc);
  const sheet = useActiveSheet();
  const setSelection = useTEMStore((s) => s.setSelection);
  const requestFocusRect = useTEMStore((s) => s.requestFocusRect);

  const issues = useMemo(
    () => (sheet ? detectOverlaps(sheet, doc.settings.layout, doc.settings, { checks }) : []),
    [sheet, doc.settings, checks],
  );
  const counts = useMemo(() => countByKind(issues), [issues]);

  if (!open) return null;

  const jumpTo = (issue: OverlapIssue) => {
    if (!sheet) return;
    const boxIds: string[] = [];
    const lineIds: string[] = [];
    const sdsgIds: string[] = [];
    issue.targets.forEach((t) => {
      if (t.part === 'line') { lineIds.push(t.id); return; }
      if (t.part === 'sdsg') { sdsgIds.push(t.id); return; }
      if (sheet.boxes.some((b) => b.id === t.id)) boxIds.push(t.id);
      else if (sheet.sdsg.some((s) => s.id === t.id)) sdsgIds.push(t.id);
    });
    setSelection(boxIds, lineIds, sdsgIds);
    requestFocusRect(issue.focusRect);
  };

  const toggle = (key: OverlapCheck) => {
    onChangeChecks({ ...checks, [key]: !checks[key] });
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1200 }}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: 720, maxWidth: '94vw' }}>
        <div className="modal-header">
          <h3>重なりチェック</h3>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        <div className="modal-body" style={{ maxHeight: '64vh', overflowY: 'auto' }}>
          <p className="hint">
            現在のシート（{sheet?.name ?? '-'}）の要素の位置から、視覚的にぶつかっている箇所を計算します。
            行をクリックすると、その要素を選択して画面を寄せます。
          </p>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', margin: '10px 0 14px' }}>
            {OVERLAP_CHECK_ORDER.map((key) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 'normal' }}>
                <input type="checkbox" checked={checks[key]} onChange={() => toggle(key)} />
                {OVERLAP_CHECK_LABELS[key]}
                <span style={{ color: '#888' }}>({checks[key] ? counts[key] : '-'})</span>
              </label>
            ))}
          </div>

          {issues.length === 0 ? (
            <p style={{ padding: '18px 0', color: '#2e7d32' }}>
              重なりは見つかりませんでした。
            </p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.92em' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                  <th style={{ padding: '4px 6px', width: 130 }}>種類</th>
                  <th style={{ padding: '4px 6px' }}>内容</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((issue, i) => (
                  <tr
                    key={`${issue.kind}-${i}`}
                    onClick={() => jumpTo(issue)}
                    style={{ borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}
                    title="クリックで該当箇所を選択して表示"
                  >
                    <td style={{ padding: '4px 6px', color: '#666', whiteSpace: 'nowrap' }}>
                      {OVERLAP_CHECK_LABELS[issue.kind]}
                    </td>
                    <td style={{ padding: '4px 6px' }}>{issue.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 'normal' }}>
            <input
              type="checkbox"
              checked={showInStatusBar}
              onChange={(e) => onChangeShowInStatusBar(e.target.checked)}
            />
            ステータスバーに件数を常時表示
          </label>
          <button className="ribbon-btn-primary" onClick={onClose}>閉じる</button>
        </div>
      </div>
    </div>
  );
}
