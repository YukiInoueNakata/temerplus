// ============================================================================
// ShiftContentDialog - Box / Line / SDSG を Time_Level / Item_Level 方向に
// 平行移動するダイアログ。
// - 対象: 「選択中」または「全体（時期区分・時間矢印・凡例以外）」
// - ▲▼ ボタンは step 分だけ即時移動（キャンバスもリアルタイム追従）
// - 数値入力欄を使うと一括で任意値を移動（「移動」ボタン押下で反映）
// ============================================================================

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTEMStore } from '../store/store';
import { shortcutLabel } from '../utils/platform';

type ShiftTarget = 'selected' | 'all';

export function ShiftContentDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation('shiftContentDialog');
  const shiftAll = useTEMStore((s) => s.shiftActiveSheetContent);
  const shiftSelected = useTEMStore((s) => s.shiftSelectedBoxes);
  const selectedBoxIds = useTEMStore((s) => s.selection.boxIds);
  const layout = useTEMStore((s) => s.doc.settings.layout);
  const levelStep = useTEMStore((s) => s.doc.settings.levelStep);
  const [target, setTarget] = useState<ShiftTarget>('selected');
  const [dTime, setDTime] = useState(0);
  const [dItem, setDItem] = useState(0);
  const step = levelStep || 0.5;

  // 対象が「選択中」で選択が無ければ「全体」に切替
  useEffect(() => {
    if (target === 'selected' && selectedBoxIds.length === 0) {
      setTarget('all');
    }
  }, [target, selectedBoxIds.length]);

  const isH = layout === 'horizontal';
  const timeAxisLabel = isH ? t('axis.time.h') : t('axis.time.v');
  const itemAxisLabel = isH ? t('axis.item.h') : t('axis.item.v');

  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ mouseX: 0, mouseY: 0, dlgX: 0, dlgY: 0 });

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.current.mouseX;
      const dy = e.clientY - dragStart.current.mouseY;
      setPos({ x: dragStart.current.dlgX + dx, y: dragStart.current.dlgY + dy });
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragging]);

  if (!open) return null;

  const onHeaderMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.modal-close')) return;
    const cur = pos ?? { x: window.innerWidth / 2 - 220, y: window.innerHeight / 2 - 160 };
    dragStart.current = { mouseX: e.clientX, mouseY: e.clientY, dlgX: cur.x, dlgY: cur.y };
    setPos(cur);
    setDragging(true);
  };

  const modalStyle: React.CSSProperties = pos
    ? { width: 440, position: 'absolute', left: pos.x, top: pos.y, margin: 0 }
    : { width: 440 };

  // 即時移動
  const immediateShift = (dt: number, di: number) => {
    if (dt === 0 && di === 0) return;
    if (target === 'selected') {
      if (selectedBoxIds.length === 0) return;
      shiftSelected(selectedBoxIds, dt, di);
    } else {
      shiftAll(dt, di);
    }
  };

  const applyExplicit = () => {
    if (dTime === 0 && dItem === 0) {
      onClose();
      return;
    }
    immediateShift(dTime, dItem);
    setDTime(0);
    setDItem(0);
  };

  const selectedDisabled = selectedBoxIds.length === 0;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={modalStyle}>
        <div
          className="modal-header"
          onMouseDown={onHeaderMouseDown}
          style={{ cursor: dragging ? 'grabbing' : 'grab', userSelect: 'none' }}
          title={t('drag')}
        >
          <h3>{t('title')}</h3>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        <div className="modal-body">
          <p className="hint" style={{ marginTop: 0 }}>
            {t('hint', { step, key: shortcutLabel('Ctrl+Z') })}
          </p>
          <section className="settings-section">
            {/* 対象切替 */}
            <div className="setting-row">
              <label>{t('target')}</label>
              <div style={{ display: 'flex', gap: 10, fontSize: '0.9em' }}>
                <label style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <input
                    type="radio"
                    name="shiftTarget"
                    value="selected"
                    checked={target === 'selected'}
                    onChange={() => setTarget('selected')}
                    disabled={selectedDisabled}
                  />
                  <span style={{ color: selectedDisabled ? '#aaa' : undefined }}>
                    {t('target.selected', { count: selectedBoxIds.length })}
                  </span>
                </label>
                <label style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <input
                    type="radio"
                    name="shiftTarget"
                    value="all"
                    checked={target === 'all'}
                    onChange={() => setTarget('all')}
                  />
                  <span>{t('target.all')}</span>
                </label>
              </div>
            </div>

            {/* Time 軸 */}
            <div className="setting-row">
              <label>{timeAxisLabel}</label>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <button
                  className="ribbon-btn-small"
                  onClick={() => immediateShift(-step, 0)}
                  title={t('time.back', { step })}
                >◀</button>
                <input
                  type="number"
                  step={step}
                  value={dTime}
                  onChange={(e) => setDTime(Number(e.target.value))}
                  style={{ width: 80 }}
                />
                <button
                  className="ribbon-btn-small"
                  onClick={() => immediateShift(step, 0)}
                  title={t('time.forward', { step })}
                >▶</button>
              </div>
            </div>

            {/* Item 軸 */}
            <div className="setting-row">
              <label>{itemAxisLabel}</label>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <button
                  className="ribbon-btn-small"
                  onClick={() => immediateShift(0, step)}
                  title={t('item.up', { step })}
                >▲</button>
                <input
                  type="number"
                  step={step}
                  value={dItem}
                  onChange={(e) => setDItem(Number(e.target.value))}
                  style={{ width: 80 }}
                />
                <button
                  className="ribbon-btn-small"
                  onClick={() => immediateShift(0, -step)}
                  title={t('item.down', { step })}
                >▼</button>
              </div>
            </div>

            <div className="setting-row" style={{ justifyContent: 'flex-start', gap: 6 }}>
              <button className="ribbon-btn-small" onClick={applyExplicit}>
                {t('applyValues')}
              </button>
              <button
                className="ribbon-btn-small"
                onClick={() => { setDTime(0); setDItem(0); }}
              >
                {t('clearValues')}
              </button>
            </div>
          </section>
        </div>
        <div className="modal-footer">
          <button className="ribbon-btn-small" onClick={onClose}>{t('close')}</button>
        </div>
      </div>
    </div>
  );
}
