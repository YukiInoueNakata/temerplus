// ============================================================================
// BoxQuickEdit - Box の種別と位置を手早く直す道具（2026-11-08 ユーザー要望「種別の変更や位置の調整が面倒」）
// - changeSelectedBoxesType: 選んでいる Box の種別をまとめて変える（数字のキー 1〜7・右クリック・浮かぶツールバー）
// - moveSelectionItemLevel: 選んでいる Box・メモを Item の方向に 1 レベル動かす（横型は上が +、縦型は右が +）
// - BoxContextMenu: Box を右クリックしたときのメニュー
// - BoxFloatingToolbar: 選んだ Box の上に出る小さなツールバー（BoxNode から NodeToolbar の中に置く）
// ============================================================================
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useTEMStore } from '../store/store';
import { BOX_TYPE_LABELS, LEVEL_PX } from '../store/defaults';
import { SELECTABLE_BOX_TYPES } from '../utils/typeDisplay';
import type { BoxType } from '../types';
import { FOCUS_COMMENT_EVENT } from './CommentsSection';

export function changeSelectedBoxesType(type: BoxType): void {
  // まとめて 1 回で変える（「元に戻す」1 回で戻る）。ID の付け替えと選択の付け替えもする
  useTEMStore.getState().changeBoxTypes([...useTEMStore.getState().selection.boxIds], type);
}

/** delta=+1 で Item レベルを 1 上げる（横型は画面の上へ、縦型は画面の右へ） */
export function moveSelectionItemLevel(delta: number): void {
  const st = useTEMStore.getState();
  if (st.doc.settings.layout === 'horizontal') st.nudgeSelection(0, -delta * LEVEL_PX);
  else st.nudgeSelection(delta * LEVEL_PX, 0);
}

/** 種別の表示名（日本語の画面は BOX_TYPE_LABELS、ほかは用語の表） */
function useBoxTypeLabel() {
  const { t, i18n } = useTranslation();
  return (bt: BoxType) => (i18n.language.startsWith('ja') ? BOX_TYPE_LABELS[bt].ja : t(`terms:boxType.${bt}`));
}

// Item レベルの上げ下げの矢印（横型は ↑↓、縦型は →←）
function itemArrows(layout: string): { up: string; down: string } {
  return layout === 'horizontal' ? { up: '↑', down: '↓' } : { up: '→', down: '←' };
}

export function BoxContextMenu({ x, y, onClose }: { x: number; y: number; onClose: () => void }) {
  const { t } = useTranslation('boxQuickEdit');
  const label = useBoxTypeLabel();
  const layout = useTEMStore((s) => s.doc.settings.layout);
  const selected = useTEMStore((s) => s.selection.boxIds);
  // ストアから集合を作って返すと、呼ばれるたびに別のものになり描き直しが止まらないので、元の値を受け取って描くときに作る
  const boxes = useTEMStore((s) => s.doc.sheets.find((sh) => sh.id === s.doc.activeSheetId)?.boxes);
  const currentTypes = new Set((boxes ?? []).filter((b) => selected.includes(b.id)).map((b) => b.type));
  const ref = useRef<HTMLDivElement>(null);
  const arrows = itemArrows(layout);

  // 外をクリック・Esc・ホイールで閉じる
  useEffect(() => {
    const close = (e: Event) => { if (ref.current && e.target instanceof Node && ref.current.contains(e.target)) return; onClose(); };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('mousedown', close, true);
    window.addEventListener('wheel', close, true);
    window.addEventListener('keydown', key, true);
    return () => {
      window.removeEventListener('mousedown', close, true);
      window.removeEventListener('wheel', close, true);
      window.removeEventListener('keydown', key, true);
    };
  }, [onClose]);

  const run = (fn: () => void) => () => { fn(); onClose(); };
  const item = (text: string, onClick: () => void, opts: { checked?: boolean; hint?: string; danger?: boolean } = {}) => (
    <button
      type="button"
      className="box-context-menu-item"
      onClick={run(onClick)}
      style={{ color: opts.danger ? '#b00020' : undefined }}
    >
      <span style={{ width: 14, display: 'inline-block' }}>{opts.checked ? '✓' : ''}</span>
      <span style={{ flex: 1 }}>{text}</span>
      {opts.hint && <span style={{ color: '#888', marginLeft: 16 }}>{opts.hint}</span>}
    </button>
  );

  return (
    <div
      ref={ref}
      role="menu"
      className="box-context-menu"
      style={{ position: 'fixed', left: x, top: y, zIndex: 2000 }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="box-context-menu-title">{t('menu.type', { count: selected.length })}</div>
      {SELECTABLE_BOX_TYPES.map((bt, i) =>
        item(label(bt), () => changeSelectedBoxesType(bt), { checked: currentTypes.size === 1 && currentTypes.has(bt), hint: String(i + 1) }))}
      <div className="box-context-menu-sep" />
      {item(t('menu.itemUp', { arrow: arrows.up }), () => moveSelectionItemLevel(1), { hint: layout === 'horizontal' ? 'Shift+↑' : 'Shift+→' })}
      {item(t('menu.itemDown', { arrow: arrows.down }), () => moveSelectionItemLevel(-1), { hint: layout === 'horizontal' ? 'Shift+↓' : 'Shift+←' })}
      <div className="box-context-menu-sep" />
      {selected.length === 1 && item(t('menu.edit'), () => useTEMStore.getState().requestEditNode(selected[0]), { hint: 'Enter' })}
      {selected.length === 1 && item(t('comments:menu'), () => {
        // プロパティパネルのコメントの入力欄に移る（パネルが畳まれていれば開く）
        const st = useTEMStore.getState();
        if (!st.view.propertyPanelVisible) st.togglePropertyPanel();
        window.setTimeout(() => window.dispatchEvent(new Event(FOCUS_COMMENT_EVENT)), 50);
      })}
      {item(t('menu.delete'), () => useTEMStore.getState().removeBoxes([...selected]), { hint: 'Delete', danger: true })}
    </div>
  );
}

/** 選んだ Box の上に出す小さなツールバー（種別・Item レベルの上げ下げ）。選んでいる Box すべてに効く */
export function BoxFloatingToolbar({ boxType }: { boxType: BoxType }) {
  const { t } = useTranslation('boxQuickEdit');
  const label = useBoxTypeLabel();
  const layout = useTEMStore((s) => s.doc.settings.layout);
  const count = useTEMStore((s) => s.selection.boxIds.length);
  const arrows = itemArrows(layout);
  const btn: React.CSSProperties = { padding: '1px 7px', fontSize: 13, border: '1px solid #bbb', background: '#fff', borderRadius: 3, cursor: 'pointer' };
  return (
    <div
      className="box-floating-toolbar nodrag nopan"
      style={{ display: 'flex', gap: 4, alignItems: 'center', background: '#f7f9fc', border: '1px solid #c5d2e6', borderRadius: 4, padding: '3px 5px', boxShadow: '0 1px 4px rgba(0,0,0,0.15)', fontSize: 12 }}
      onMouseDown={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      <select
        value={SELECTABLE_BOX_TYPES.includes(boxType) ? boxType : ''}
        title={t('toolbar.type.title')}
        onChange={(e) => changeSelectedBoxesType(e.target.value as BoxType)}
        style={{ fontSize: 12 }}
      >
        {!SELECTABLE_BOX_TYPES.includes(boxType) && <option value="">{label(boxType)}</option>}
        {SELECTABLE_BOX_TYPES.map((bt, i) => <option key={bt} value={bt}>{`${i + 1}. ${label(bt)}`}</option>)}
      </select>
      <button type="button" style={btn} title={t('toolbar.itemUp.title')} onClick={() => moveSelectionItemLevel(1)}>{arrows.up}</button>
      <button type="button" style={btn} title={t('toolbar.itemDown.title')} onClick={() => moveSelectionItemLevel(-1)}>{arrows.down}</button>
      {count > 1 && <span style={{ color: '#666' }}>{t('toolbar.count', { count })}</span>}
    </div>
  );
}
