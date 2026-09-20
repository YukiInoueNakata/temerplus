// ============================================================================
// StatusBar - Bottom bar with current state info
// ============================================================================

import { useMemo } from 'react';
import { useTEMStore, useActiveSheet } from '../store/store';
import { detectOverlaps } from '../utils/overlapDetect';
import type { OverlapChecks } from '../utils/overlapDetect';

export function StatusBar({
  overlapChecks,
  showOverlapCount,
  onOpenOverlapCheck,
}: {
  overlapChecks: OverlapChecks;
  showOverlapCount: boolean;
  onOpenOverlapCheck: () => void;
}) {
  const view = useTEMStore((s) => s.view);
  const selection = useTEMStore((s) => s.selection);
  const dirty = useTEMStore((s) => s.dirty);
  const layout = useTEMStore((s) => s.doc.settings.layout);
  const settings = useTEMStore((s) => s.doc.settings);
  const sheet = useActiveSheet();

  // 常時表示が OFF のときは計算しない（編集のたびに走らせない）
  const overlapCount = useMemo(() => {
    if (!showOverlapCount || !sheet) return null;
    return detectOverlaps(sheet, settings.layout, settings, { checks: overlapChecks }).length;
  }, [showOverlapCount, sheet, settings, overlapChecks]);

  const totalSelected =
    selection.boxIds.length +
    selection.lineIds.length +
    selection.sdsgIds.length +
    selection.noteIds.length;

  return (
    <div className="status-bar">
      <span>ズーム: {Math.round(view.zoom * 100)}%</span>
      <span>グリッド: {view.showGrid ? 'ON' : 'OFF'}</span>
      <span>スナップ: {view.snapEnabled ? 'ON' : 'OFF'}</span>
      <span>レイアウト: {layout === 'horizontal' ? '横型' : '縦型'}</span>
      <span>選択: {totalSelected}</span>
      {overlapCount !== null && (
        <span
          onClick={onOpenOverlapCheck}
          style={{ cursor: 'pointer', color: overlapCount > 0 ? '#b45309' : undefined }}
          title="クリックで重なりチェックを開く"
        >
          重なり: {overlapCount} 件
        </span>
      )}
      <div style={{ flex: 1 }} />
      {dirty && <span className="dirty">● 未保存</span>}
      {!dirty && <span className="saved">✓ 保存済み</span>}
    </div>
  );
}
