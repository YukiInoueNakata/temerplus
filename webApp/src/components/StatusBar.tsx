// ============================================================================
// StatusBar - Bottom bar with current state info
// ============================================================================

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('statusBar');

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
      <span>{t('zoom', { value: Math.round(view.zoom * 100) })}</span>
      <span>{t('grid', { state: view.showGrid ? 'ON' : 'OFF' })}</span>
      <span>{t('snap', { state: view.snapEnabled ? 'ON' : 'OFF' })}</span>
      <span>{t('layout', { layout: layout === 'horizontal' ? t('terms:layout.horizontal') : t('terms:layout.vertical') })}</span>
      <span>{t('selection', { count: totalSelected })}</span>
      {overlapCount !== null && (
        <span
          onClick={onOpenOverlapCheck}
          style={{ cursor: 'pointer', color: overlapCount > 0 ? '#b45309' : undefined }}
          title={t('overlap.title')}
        >
          {t('overlap', { count: overlapCount })}
        </span>
      )}
      <div style={{ flex: 1 }} />
      {dirty && <span className="dirty">{t('unsaved')}</span>}
      {!dirty && <span className="saved">{t('saved')}</span>}
    </div>
  );
}
