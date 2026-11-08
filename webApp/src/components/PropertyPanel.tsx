// ============================================================================
// PropertyPanel - Right sidebar (Figma-style)
// ============================================================================

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useTEMStore, useActiveSheet } from '../store/store';
import type { Box, BoxType, SDSG, Line, AutoFitBoxMode, Note } from '../types';
import { NOTE_SYMBOLS, applySymbolToText } from '../utils/noteStyle';
import { BOX_TYPE_LABELS } from '../store/defaults';
import {
  FontFamilyRow,
  FontSizeRow,
  BoldItalicUnderlineRow,
  ColorRow,
  TextAlignRow,
  VerticalAlignRow,
} from './DecorationEditor';
import { isSDSGOutOfRange } from '../utils/sdsgSpaceLayout';
import { SELECTABLE_BOX_TYPES, SECONDARY_BOX_TYPES } from '../utils/typeDisplay';
import { xyToTimeLevel, xyToItemLevel, setTimeLevelOnly, setItemLevelOnly } from '../utils/coords';
import { RichTextToolbar } from './RichTextToolbar';
import { produce } from 'immer';
import { ColorPicker } from './ColorPicker';
import { CollapsibleSection } from './CollapsibleSection';
import { SourceRefsSection } from './SourceRefsSection';

interface PropertyPanelProps {
  onOpenLegendSettings?: () => void;
  onOpenTranscriptViewer?: (focusBoxId?: string) => void;
}

export function PropertyPanel({ onOpenLegendSettings, onOpenTranscriptViewer }: PropertyPanelProps = {}) {
  const { t } = useTranslation('propertyPanel');
  const visible = useTEMStore((s) => s.view.propertyPanelVisible);
  const toggle = useTEMStore((s) => s.togglePropertyPanel);
  const selection = useTEMStore((s) => s.selection);
  const sheet = useActiveSheet();
  const width = useTEMStore((s) => s.view.propertyPanelWidth);
  const setWidth = useTEMStore((s) => s.setPropertyPanelWidth);
  const [resizing, setResizing] = useState(false);

  useEffect(() => {
    if (!resizing) return;
    const onMove = (e: MouseEvent) => {
      const panel = document.querySelector('.property-panel') as HTMLElement | null;
      if (!panel) return;
      const right = panel.getBoundingClientRect().right;
      const newWidth = Math.max(50, Math.min(900, right - e.clientX));
      setWidth(newWidth);
    };
    const onUp = () => setResizing(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [resizing, setWidth]);

  if (!visible) {
    return (
      <div className="panel-collapsed right" onClick={toggle} title={t('panel.show')}>
        <span style={{ writingMode: 'vertical-rl', fontWeight: 600, color: '#444', letterSpacing: '0.1em' }}>
          {t('panel.title')}
        </span>
      </div>
    );
  }

  if (!sheet) return null;

  const selectedBoxes = sheet.boxes.filter((b) => selection.boxIds.includes(b.id));
  const selectedLines = sheet.lines.filter((l) => selection.lineIds.includes(l.id));
  const selectedSDSGs = sheet.sdsg.filter((s) => selection.sdsgIds.includes(s.id));
  const selectedNotes = (sheet.notes ?? []).filter((n) => selection.noteIds.includes(n.id));
  const hasSelection = selectedBoxes.length > 0 || selectedLines.length > 0 || selectedSDSGs.length > 0 || selectedNotes.length > 0;

  return (
    <div className="property-panel" style={{ width }}>
      <div
        className="panel-resizer left"
        onMouseDown={(e) => { e.preventDefault(); setResizing(true); }}
        title={t('panel.resize')}
      />
      <div className="panel-header">
        <span>▼ {t('panel.title')} {hasSelection && `(${selectedBoxes.length + selectedLines.length})`}</span>
        <button className="panel-toggle" onClick={toggle} title={t('panel.minimize')}>×</button>
      </div>
      <div className="panel-body">
        {!hasSelection && !selection.legendSelected && <EmptyState />}
        {selection.legendSelected && <LegendProperties onOpenSettings={onOpenLegendSettings} />}
        {selectedBoxes.length > 0 && <BoxProperties boxes={selectedBoxes} onOpenTranscriptViewer={onOpenTranscriptViewer} />}
        {selectedLines.length > 0 && <LineProperties lines={selectedLines} onOpenTranscriptViewer={onOpenTranscriptViewer} />}
        {selectedSDSGs.length > 0 && <SDSGProperties sdsgs={selectedSDSGs} onOpenTranscriptViewer={onOpenTranscriptViewer} />}
        {selectedNotes.length > 0 && <NoteProperties notes={selectedNotes} />}
      </div>
    </div>
  );
}

// ============================================================================
// 凡例選択時のプロパティ（軽量 UI。詳細は SettingsDialog > 凡例 タブへ）
// ============================================================================
function LegendProperties({ onOpenSettings }: { onOpenSettings?: () => void }) {
  const { t } = useTranslation('propertyPanel');
  const doc = useTEMStore((s) => s.doc);
  const lg = doc.settings.legend;
  const layout = doc.settings.layout;
  const updateLegend = (patch: Partial<typeof lg>) => {
    useTEMStore.setState((state) => ({
      doc: produce(state.doc, (d) => {
        d.settings.legend = { ...d.settings.legend, ...patch };
      }),
      dirty: true,
    }));
  };
  const updatePosition = (which: 'x' | 'y', v: number) => {
    useTEMStore.setState((state) => ({
      doc: produce(state.doc, (d) => {
        d.settings.legend.position = { ...d.settings.legend.position, [which]: v };
      }),
      dirty: true,
    }));
  };

  const columnsKey = layout === 'vertical' ? 'columnsVertical' : 'columnsHorizontal';
  const rowsKey = layout === 'vertical' ? 'rowsVertical' : 'rowsHorizontal';
  const layoutModeKey = layout === 'vertical' ? 'layoutModeVertical' : 'layoutModeHorizontal';
  const currentMode: 'columns' | 'rows' = lg[layoutModeKey] === 'rows' ? 'rows' : 'columns';
  const currentCols = (lg[columnsKey] ?? lg.columns) ?? 1;
  const currentRows = lg[rowsKey] ?? 1;

  return (
    <div className="prop-section">
      <h4>{t('terms:legend')}</h4>
      <p className="hint" style={{ marginTop: 0, fontSize: '0.82em' }}>
        {t('legend.hint')}
      </p>
      <div className="prop-row">
        <label>{t('legend.includeInExport')}</label>
        <input
          type="checkbox"
          checked={lg.includeInExport !== false}
          onChange={(e) => updateLegend({ includeInExport: e.target.checked })}
        />
      </div>
      <div className="prop-row">
        <label>{t('legend.showTitle')}</label>
        <input
          type="checkbox"
          checked={lg.showTitle !== false}
          onChange={(e) => updateLegend({ showTitle: e.target.checked })}
        />
      </div>
      {lg.showTitle !== false && (
        <div className="prop-row">
          <label>{t('legend.title')}</label>
          <input
            type="text"
            value={lg.title ?? ''}
            onChange={(e) => updateLegend({ title: e.target.value })}
            placeholder={t('terms:legend')}
          />
        </div>
      )}
      <div className="prop-row">
        <label>{t('common.positionXY')}</label>
        <div style={{ display: 'flex', gap: 4 }}>
          <input
            type="number"
            value={lg.position?.x ?? 0}
            onChange={(e) => updatePosition('x', Number(e.target.value))}
            style={{ width: 70 }}
            title="px"
          />
          <input
            type="number"
            value={lg.position?.y ?? 0}
            onChange={(e) => updatePosition('y', Number(e.target.value))}
            style={{ width: 70 }}
          />
        </div>
      </div>
      <div className="prop-row">
        <label>{layout === 'vertical' ? t('legend.layoutMode.vertical') : t('legend.layoutMode.horizontal')}</label>
        <select
          value={currentMode}
          onChange={(e) => updateLegend({ [layoutModeKey]: e.target.value as 'columns' | 'rows' } as Partial<typeof lg>)}
        >
          <option value="columns">{t('legend.byColumns')}</option>
          <option value="rows">{t('legend.byRows')}</option>
        </select>
      </div>
      <div className="prop-row">
        <label>{currentMode === 'rows' ? t('legend.rows') : t('legend.columns')}</label>
        <input
          type="number"
          min={1}
          max={12}
          step={1}
          value={currentMode === 'rows' ? currentRows : currentCols}
          onChange={(e) => {
            const v = Math.max(1, Number(e.target.value) || 1);
            updateLegend({ [currentMode === 'rows' ? rowsKey : columnsKey]: v } as Partial<typeof lg>);
          }}
          style={{ width: 70 }}
        />
      </div>
      <div className="prop-row">
        <label>{t('legend.showDescriptions')}</label>
        <input
          type="checkbox"
          checked={lg.showDescriptions === true}
          onChange={(e) => updateLegend({ showDescriptions: e.target.checked })}
          title={t('legend.showDescriptions.tooltip')}
        />
      </div>
      <div className="prop-row" style={{ justifyContent: 'flex-start', gap: 6, marginTop: 8 }}>
        {onOpenSettings && (
          <button
            className="ribbon-btn-small"
            onClick={onOpenSettings}
            title={t('legend.advanced.tooltip')}
          >
            {t('legend.advanced')}
          </button>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  const { t } = useTranslation('propertyPanel');
  return (
    <div className="prop-empty">
      <p>{t('empty.message')}</p>
      <p style={{ fontSize: '0.92em', color: '#888', marginTop: 12 }}>
        {t('empty.tip')}
      </p>
    </div>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function getCommon<T, K extends keyof T>(items: T[], key: K): T[K] | undefined {
  if (items.length === 0) return undefined;
  const first = items[0][key];
  return items.every((item) => item[key] === first) ? first : undefined;
}

function getCommonStyle<K extends keyof NonNullable<Box['style']>>(
  items: Box[],
  key: K
): NonNullable<Box['style']>[K] | undefined {
  if (items.length === 0) return undefined;
  const first = items[0].style?.[key];
  return items.every((item) => item.style?.[key] === first) ? first : undefined;
}

// ============================================================================
// Box Properties
// ============================================================================

// ラベル入力欄 + 装飾ツールバー（単一選択時のみ使用）
function LabelWithToolbar({ box, updateBox }: {
  box: Box;
  updateBox: (id: string, patch: Partial<Box>) => void;
}) {
  const { t } = useTranslation('propertyPanel');
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  return (
    <div className="prop-row" style={{ alignItems: 'flex-start', flexDirection: 'column', gap: 4 }}>
      <label>{t('common.label')}</label>
      <RichTextToolbar
        textareaRef={taRef}
        value={box.label}
        onChange={(next) => updateBox(box.id, { label: next })}
        compact
      />
      <textarea
        ref={taRef}
        value={box.label}
        onChange={(e) => updateBox(box.id, { label: e.target.value })}
        rows={3}
        style={{ width: '100%', resize: 'vertical' }}
      />
      <div style={{ fontSize: '0.75em', color: '#888' }}>
        {t('label.example')}
      </div>
    </div>
  );
}

type PropTab = 'basic' | 'label' | 'idLabel' | 'subLabel' | 'autoFit';
type LineTab = 'basic' | 'endpoint' | 'info';

function BoxProperties({ boxes, onOpenTranscriptViewer }: { boxes: Box[]; onOpenTranscriptViewer?: (focusBoxId?: string) => void }) {
  const { t, i18n } = useTranslation('propertyPanel');
  // Box の種類の名前: 日本語の画面は従来どおり BOX_TYPE_LABELS、それ以外は用語の表（terms）から引く
  const boxTypeLabel = (bt: BoxType) => (i18n.language.startsWith('ja') ? BOX_TYPE_LABELS[bt].ja : t(`terms:boxType.${bt}`));
  const updateBox = useTEMStore((s) => s.updateBox);
  const updateBoxes = useTEMStore((s) => s.updateBoxes);
  const removeBoxes = useTEMStore((s) => s.removeBoxes);
  const renameBoxId = useTEMStore((s) => s.renameBoxId);
  const changeBoxType = useTEMStore((s) => s.changeBoxType);
  const levelStep = useTEMStore((s) => s.doc.settings.levelStep);
  const layout = useTEMStore((s) => s.doc.settings.layout);
  const [tab, setTab] = useState<PropTab>('basic');

  const isMulti = boxes.length > 1;
  const first = boxes[0];
  const ids = boxes.map((b) => b.id);

  const commonType = getCommon(boxes, 'type');
  const commonWidth = getCommon(boxes, 'width');
  const commonHeight = getCommon(boxes, 'height');
  const commonOrientation = getCommon(boxes, 'textOrientation') ?? 'horizontal';
  const commonBold = getCommonStyle(boxes, 'bold');
  const commonItalic = getCommonStyle(boxes, 'italic');
  const commonUnderline = getCommonStyle(boxes, 'underline');
  const commonFontSize = getCommonStyle(boxes, 'fontSize');
  const commonFontFamily = getCommonStyle(boxes, 'fontFamily');
  const commonTextAlign = getCommonStyle(boxes, 'textAlign');
  const commonVAlign = getCommonStyle(boxes, 'verticalAlign');
  const commonSubLabel = getCommon(boxes, 'subLabel');
  const commonSubLabelFS = getCommon(boxes, 'subLabelFontSize');
  const commonSubOffX = getCommon(boxes, 'subLabelOffsetX');
  const commonSubOffY = getCommon(boxes, 'subLabelOffsetY');

  const handleRenameId = () => {
    if (isMulti) return;
    const newId = prompt(t('box.renameId.prompt'), first.id);
    if (!newId || newId === first.id) return;
    const ok = renameBoxId(first.id, newId);
    if (!ok) alert(t('box.renameId.failed'));
  };

  const renderNumInput = (
    label: string,
    common: number | undefined,
    onChange: (v: number) => void,
    min?: number,
    max?: number,
  ) => (
    <div className="prop-row">
      <label>{label}</label>
      <input
        type="number"
        min={min}
        max={max}
        value={common === undefined ? '' : common}
        placeholder={common === undefined ? '' : ''}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (!isNaN(v)) onChange(v);
        }}
      />
    </div>
  );

  return (
    <div className="prop-section">
      <h4>Box {isMulti && <span className="multi-badge">{t('common.count', { count: boxes.length })}</span>}</h4>

      <div className="settings-tabs" style={{ marginBottom: 8, padding: 0 }}>
        <button className={tab === 'basic' ? 'settings-tab active' : 'settings-tab'} onClick={() => setTab('basic')}>{t('tab.basic')}</button>
        <button className={tab === 'label' ? 'settings-tab active' : 'settings-tab'} onClick={() => setTab('label')}>{t('common.label')}</button>
        <button className={tab === 'idLabel' ? 'settings-tab active' : 'settings-tab'} onClick={() => setTab('idLabel')}>{t('tab.typeLabel')}</button>
        <button className={tab === 'subLabel' ? 'settings-tab active' : 'settings-tab'} onClick={() => setTab('subLabel')}>{t('tab.subLabel')}</button>
        <button className={tab === 'autoFit' ? 'settings-tab active' : 'settings-tab'} onClick={() => setTab('autoFit')}>{t('tab.autoFit')}</button>
      </div>

      {/* ========== 基本 ========== */}
      {tab === 'basic' && <>
        {!isMulti && (
          <div className="prop-row">
            <label>ID</label>
            <div style={{ display: 'flex', gap: 4 }}>
              <input value={first.id} readOnly style={{ flex: 1, fontFamily: 'monospace' }} />
              <button className="style-btn" onClick={handleRenameId} title={t('box.renameId')}>✎</button>
            </div>
          </div>
        )}
        <div className="prop-row">
          <label>{t('common.type')}{!isMulti && <span style={{ fontSize: '0.85em', color: '#888', marginLeft: 6 }}>{t('box.type.autoId')}</span>}</label>
          <select
            value={commonType ?? ''}
            onChange={(e) => {
              const newType = e.target.value as BoxType;
              if (!isMulti) changeBoxType(first.id, newType);
              else useTEMStore.getState().changeBoxTypes(ids, newType);
            }}
          >
            {commonType === undefined && <option value=""></option>}
            {SELECTABLE_BOX_TYPES.map((bt) => (
              <option key={bt} value={bt}>{boxTypeLabel(bt)}</option>
            ))}
          </select>
        </div>
        <div className="prop-row">
          <label title={t('box.group.tooltip')}>{t('box.group')}</label>
          <input
            type="checkbox"
            checked={boxes.every((b) => b.isGroup)}
            onChange={(e) => {
              const on = e.target.checked;
              boxes.forEach((b) => updateBox(b.id, on
                ? { isGroup: true, textOrientation: 'horizontal', style: { ...(b.style ?? {}), verticalAlign: 'top' } }
                : { isGroup: undefined }));
            }}
          />
        </div>
        {/* 併記種別: 主種別に加えてもう 1 つの種別を採番・凡例に出す（例: 分岐点かつ必須通過点） */}
        {commonType !== undefined && commonType !== 'other' && (
          <div className="prop-row">
            <label>{t('box.secondaryType')}</label>
            <select
              value={getCommon(boxes, 'secondaryType') ?? ''}
              onChange={(e) => updateBoxes(ids, { secondaryType: (e.target.value || undefined) as BoxType | undefined })}
              title={t('box.secondaryType.tooltip')}
            >
              <option value="">{t('common.none')}</option>
              {SECONDARY_BOX_TYPES.filter((bt) => bt !== commonType).map((bt) => (
                <option key={bt} value={bt}>{boxTypeLabel(bt)}</option>
              ))}
            </select>
          </div>
        )}
        {/* 種別「その他」: 種別ラベルを自由記入（新しい概念のため） */}
        {commonType === 'other' && (
          <>
            <div className="prop-row">
              <label>{t('box.customTypeLabel')}</label>
              <input
                value={getCommon(boxes, 'customTypeLabel') ?? ''}
                placeholder={t('box.customTypeLabel.placeholder')}
                onChange={(e) => updateBoxes(ids, { customTypeLabel: e.target.value })}
                title={t('box.customTypeLabel.tooltip')}
              />
            </div>
            <div className="prop-row">
              <label>{t('box.customTypeNumbered')}</label>
              <input
                type="checkbox"
                checked={getCommon(boxes, 'customTypeNumbered') === true}
                onChange={(e) => updateBoxes(ids, { customTypeNumbered: e.target.checked || undefined })}
              />
            </div>
          </>
        )}
        {!isMulti && (
          <div className="prop-row">
            <label>{t('box.position')}</label>
            <div style={{ display: 'flex', gap: 4 }}>
              <input
                type="number"
                step={levelStep}
                value={xyToTimeLevel(first.x, first.y, layout).toFixed(1)}
                onChange={(e) => {
                  const newPos = setTimeLevelOnly(first.x, first.y, Number(e.target.value), layout);
                  updateBox(first.id, newPos);
                }}
                title={layout === 'horizontal' ? 'Time_Level (→+)' : 'Time_Level (↓+)'}
              />
              <input
                type="number"
                step={levelStep}
                value={xyToItemLevel(first.x, first.y, layout).toFixed(1)}
                onChange={(e) => {
                  const newPos = setItemLevelOnly(first.x, first.y, Number(e.target.value), layout);
                  updateBox(first.id, newPos);
                }}
                title={layout === 'horizontal' ? 'Item_Level (↑+)' : 'Item_Level (→+)'}
              />
            </div>
          </div>
        )}
        {renderNumInput(t('common.widthPx'), commonWidth, (v) => updateBoxes(ids, { width: v }), 20, 1000)}
        {renderNumInput(t('common.heightPx'), commonHeight, (v) => updateBoxes(ids, { height: v }), 20, 1000)}
        <CollapsibleSection title={t('common.idBadge')} sectionKey="box-basic-id-badge" compact defaultOpen={false}>
          <div className="prop-row">
            <label>{t('common.fontSize')}</label>
            <input
              type="number"
              min={6}
              max={40}
              value={getCommon(boxes, 'idFontSize') ?? 10}
              placeholder={getCommon(boxes, 'idFontSize') === undefined ? '' : ''}
              onChange={(e) => updateBoxes(ids, { idFontSize: Number(e.target.value) })}
            />
          </div>
          <div className="prop-row">
            <label>{t('common.offsetTimeItem')}</label>
            <div style={{ display: 'flex', gap: 4 }}>
              <input
                type="number"
                value={getCommon(boxes, 'idOffsetX') ?? 0}
                onChange={(e) => updateBoxes(ids, { idOffsetX: Number(e.target.value) })}
                title={t('common.offsetTime.tooltip')}
              />
              <input
                type="number"
                value={getCommon(boxes, 'idOffsetY') ?? 0}
                onChange={(e) => updateBoxes(ids, { idOffsetY: Number(e.target.value) })}
                title={t('common.offsetItem.tooltip')}
              />
            </div>
          </div>
        </CollapsibleSection>
      </>}

      {/* ========== ラベル ========== */}
      {tab === 'label' && <>
        {!isMulti && <LabelWithToolbar box={first} updateBox={updateBox} />}
        <FontFamilyRow
          value={commonFontFamily}
          onChange={(v) => updateBoxes(ids, { style: { ...first.style, fontFamily: v } })}
        />
        <FontSizeRow
          value={commonFontSize}
          onChange={(v) => updateBoxes(ids, { style: { ...first.style, fontSize: v } })}
        />
        <BoldItalicUnderlineRow
          bold={commonBold}
          italic={commonItalic}
          underline={commonUnderline}
          onBoldToggle={(v) => updateBoxes(ids, { style: { ...first.style, bold: v } })}
          onItalicToggle={(v) => updateBoxes(ids, { style: { ...first.style, italic: v } })}
          onUnderlineToggle={(v) => updateBoxes(ids, { style: { ...first.style, underline: v } })}
        />
        <ColorRow
          label={t('common.textColor')}
          value={first.style?.color}
          onChange={(c) => updateBoxes(ids, { style: { ...first.style, color: c } })}
          defaultLabel={t('color.default222')}
        />
        <ColorRow
          label={t('common.bgColor')}
          value={first.style?.backgroundColor}
          onChange={(c) => updateBoxes(ids, { style: { ...first.style, backgroundColor: c } })}
          allowNone
          defaultLabel={t('color.defaultWhite')}
        />
        <ColorRow
          label={t('common.borderColor')}
          value={first.style?.borderColor}
          onChange={(c) => updateBoxes(ids, { style: { ...first.style, borderColor: c } })}
          allowNone
          defaultLabel={t('color.default222')}
        />
        <div className="prop-row">
          <label>{t('box.textOrientation')}</label>
          <select
            value={commonOrientation}
            onChange={(e) => updateBoxes(ids, { textOrientation: e.target.value as 'horizontal' | 'vertical' })}
          >
            <option value="horizontal">{t('box.textOrientation.horizontal')}</option>
            <option value="vertical">{t('box.textOrientation.vertical')}</option>
          </select>
        </div>
        {commonOrientation === 'vertical' && (
          <div className="prop-row">
            <label>{t('box.asciiUpright')}</label>
            <select
              value={getCommon(boxes, 'asciiUpright') === undefined ? '' : (getCommon(boxes, 'asciiUpright') ? 'upright' : 'mixed')}
              onChange={(e) => updateBoxes(ids, { asciiUpright: e.target.value === 'upright' })}
            >
              {getCommon(boxes, 'asciiUpright') === undefined && <option value=""></option>}
              <option value="upright">{t('ascii.upright.stacked')}</option>
              <option value="mixed">{t('ascii.rotated.traditional')}</option>
            </select>
          </div>
        )}
        <TextAlignRow
          value={commonTextAlign}
          onChange={(v) => updateBoxes(ids, { style: { ...first.style, textAlign: v } })}
        />
        <VerticalAlignRow
          value={commonVAlign}
          onChange={(v) => updateBoxes(ids, { style: { ...first.style, verticalAlign: v } })}
        />
      </>}

      {/* ========== タイプラベル（種別バッジ） ========== */}
      {tab === 'idLabel' && <>
        <p className="hint" style={{ marginTop: 0 }}>
          {t('box.typeLabel.hint1')}<br />
          {t('box.typeLabel.hint2')}
        </p>
        <div className="prop-row">
          <label>{t('common.numbered')}</label>
          <input
            type="checkbox"
            checked={getCommon(boxes, 'typeLabelNumbered') !== false}
            onChange={(e) => updateBoxes(ids, { typeLabelNumbered: e.target.checked ? undefined : false })}
            title={t('box.numbered.tooltip')}
          />
        </div>
        <FontSizeRow
          value={getCommon(boxes, 'typeLabelFontSize')}
          onChange={(v) => updateBoxes(ids, { typeLabelFontSize: v })}
          fallbackValue={11}
          max={40}
        />
        <FontFamilyRow
          value={getCommon(boxes, 'typeLabelFontFamily')}
          onChange={(v) => updateBoxes(ids, { typeLabelFontFamily: v })}
          emptyOptionLabel={t('common.sameAsBox')}
        />
        <BoldItalicUnderlineRow
          bold={getCommon(boxes, 'typeLabelBold') !== false}
          italic={!!getCommon(boxes, 'typeLabelItalic')}
          onBoldToggle={(v) => updateBoxes(ids, { typeLabelBold: v })}
          onItalicToggle={(v) => updateBoxes(ids, { typeLabelItalic: v })}
        />
        <div className="prop-row">
          <label>{t('box.typeLabel.ascii')}</label>
          <select
            value={getCommon(boxes, 'typeLabelAsciiUpright') === undefined
              ? ''
              : (getCommon(boxes, 'typeLabelAsciiUpright') ? 'upright' : 'mixed')}
            onChange={(e) => updateBoxes(ids, { typeLabelAsciiUpright: e.target.value === 'upright' })}
          >
            {getCommon(boxes, 'typeLabelAsciiUpright') === undefined && <option value="">{t('common.sameAsBox')}</option>}
            <option value="upright">{t('ascii.upright')}</option>
            <option value="mixed">{t('ascii.rotated')}</option>
          </select>
        </div>
        <ColorRow
          label={t('common.textColor')}
          value={getCommon(boxes, 'typeLabelColor')}
          onChange={(c) => updateBoxes(ids, { typeLabelColor: c })}
          defaultLabel={t('color.default222')}
        />
        <ColorRow
          label={t('common.bgColor')}
          value={getCommon(boxes, 'typeLabelBackgroundColor')}
          onChange={(c) => updateBoxes(ids, { typeLabelBackgroundColor: c })}
          allowNone
          defaultLabel={t('color.defaultTransparent')}
        />
        <ColorRow
          label={t('common.borderColor')}
          value={getCommon(boxes, 'typeLabelBorderColor')}
          onChange={(c) => updateBoxes(ids, { typeLabelBorderColor: c })}
          allowNone
          defaultLabel={t('color.defaultNoBorder')}
        />
        <div className="prop-row">
          <label>{t('common.borderWidthPx')}</label>
          <input
            type="number"
            min={0}
            max={5}
            step={0.5}
            value={getCommon(boxes, 'typeLabelBorderWidth') ?? 0}
            placeholder={getCommon(boxes, 'typeLabelBorderWidth') === undefined ? '' : ''}
            onChange={(e) => updateBoxes(ids, { typeLabelBorderWidth: Number(e.target.value) })}
            title={t('common.borderWidth.tooltip')}
          />
        </div>
      </>}

      {/* ========== サブラベル ========== */}
      {tab === 'subLabel' && <>
        <div className="prop-row">
          <label>{t('box.subLabel')}</label>
          <input
            type="text"
            value={!isMulti ? (first.subLabel ?? '') : (commonSubLabel ?? '')}
            placeholder={isMulti && commonSubLabel === undefined ? '' : t('box.subLabel.placeholder')}
            onChange={(e) => updateBoxes(ids, { subLabel: e.target.value })}
          />
        </div>
        <div className="prop-row">
          <label>{t('common.fontSize')}</label>
          <input
            type="number"
            min={6}
            max={40}
            value={commonSubLabelFS ?? 10}
            placeholder={commonSubLabelFS === undefined ? '' : ''}
            onChange={(e) => updateBoxes(ids, { subLabelFontSize: Number(e.target.value) })}
          />
        </div>
        <div className="prop-row">
          <label>{t('common.offsetTimeItem')}</label>
          <div style={{ display: 'flex', gap: 4 }}>
            <input
              type="number"
              value={commonSubOffX ?? 0}
              onChange={(e) => updateBoxes(ids, { subLabelOffsetX: Number(e.target.value) })}
              title={t('common.offsetTime.tooltip')}
            />
            <input
              type="number"
              value={commonSubOffY ?? 0}
              onChange={(e) => updateBoxes(ids, { subLabelOffsetY: Number(e.target.value) })}
              title={t('common.offsetItem.tooltip')}
            />
          </div>
        </div>
        <div className="prop-row">
          <label>{t('box.subLabel.ascii')}</label>
          <select
            value={getCommon(boxes, 'subLabelAsciiUpright') === undefined
              ? ''
              : (getCommon(boxes, 'subLabelAsciiUpright') ? 'upright' : 'mixed')}
            onChange={(e) => updateBoxes(ids, { subLabelAsciiUpright: e.target.value === 'upright' })}
          >
            {getCommon(boxes, 'subLabelAsciiUpright') === undefined && <option value="">{t('common.sameAsBox')}</option>}
            <option value="upright">{t('ascii.upright.stacked2')}</option>
            <option value="mixed">{t('ascii.rotated.traditional')}</option>
          </select>
        </div>
        <ColorRow
          label={t('common.textColor')}
          value={getCommon(boxes, 'subLabelColor')}
          onChange={(c) => updateBoxes(ids, { subLabelColor: c })}
          defaultLabel={t('color.default555')}
        />
        <ColorRow
          label={t('common.bgColor')}
          value={getCommon(boxes, 'subLabelBackgroundColor')}
          onChange={(c) => updateBoxes(ids, { subLabelBackgroundColor: c })}
          allowNone
          defaultLabel={t('color.defaultTranslucentWhite')}
        />
        <ColorRow
          label={t('common.borderColor')}
          value={getCommon(boxes, 'subLabelBorderColor')}
          onChange={(c) => updateBoxes(ids, { subLabelBorderColor: c })}
          allowNone
          defaultLabel={t('color.defaultNoBorder')}
        />
        <div className="prop-row">
          <label>{t('common.borderWidthPx')}</label>
          <input
            type="number"
            min={0}
            max={5}
            step={0.5}
            value={getCommon(boxes, 'subLabelBorderWidth') ?? 0}
            placeholder={getCommon(boxes, 'subLabelBorderWidth') === undefined ? '' : ''}
            onChange={(e) => updateBoxes(ids, { subLabelBorderWidth: Number(e.target.value) })}
            title={t('common.borderWidth.tooltip')}
          />
        </div>
      </>}

      {/* ========== 自動調整 ========== */}
      {tab === 'autoFit' && <>
        <div className="prop-row">
          <label>{t('box.autoFitText')}</label>
          <input
            type="checkbox"
            checked={getCommon(boxes, 'autoFitText') === true}
            onChange={(e) => updateBoxes(ids, { autoFitText: e.target.checked })}
            title={t('box.autoFitText.tooltip')}
          />
        </div>
        <div className="prop-row">
          <label>{t('box.autoFitBoxMode')}</label>
          <select
            value={getCommon(boxes, 'autoFitBoxMode') ?? ''}
            onChange={(e) => {
              const v = e.target.value;
              updateBoxes(ids, { autoFitBoxMode: v === '' ? undefined : (v as AutoFitBoxMode) });
            }}
          >
            <option value="">{t('box.autoFitBoxMode.inherit')}</option>
            <option value="none">{t('box.autoFitBoxMode.none')}</option>
            <option value="width-fixed">{t('box.autoFitBoxMode.widthFixed')}</option>
            <option value="height-fixed">{t('box.autoFitBoxMode.heightFixed')}</option>
          </select>
        </div>
        <p className="hint" style={{ margin: 0 }}>
          {t('box.autoFit.hint')}
        </p>
        <div className="prop-row" style={{ flexWrap: 'wrap', gap: 4, justifyContent: 'flex-start' }}>
          <button className="ribbon-btn-small"
            onClick={() => useTEMStore.getState().fitBoxesToLabel(ids)}
            title={t('box.fitToLabel.tooltip')}>{t('box.fitToLabel')}</button>
          <button className="ribbon-btn-small"
            onClick={() => useTEMStore.getState().fitBoxesTextToBox(ids)}
            title={t('box.fitTextToBox.tooltip')}>{t('box.fitTextToBox')}</button>
          {isMulti && (
            <>
              <button className="ribbon-btn-small"
                onClick={() => useTEMStore.getState().matchBoxesSize(ids, 'width')}>{t('match.width')}</button>
              <button className="ribbon-btn-small"
                onClick={() => useTEMStore.getState().matchBoxesSize(ids, 'height')}>{t('match.height')}</button>
              <button className="ribbon-btn-small"
                onClick={() => useTEMStore.getState().matchBoxesSize(ids, 'both')}>{t('match.size')}</button>
              <button className="ribbon-btn-small"
                onClick={() => useTEMStore.getState().matchBoxesFontSize(ids)}>{t('match.fontSize')}</button>
            </>
          )}
        </div>
        <CollapsibleSection title={t('common.paperReport')} sectionKey="box-autofit-paper-report" compact defaultOpen={false}>
          {!isMulti && (
            <div className="prop-row" style={{ alignItems: 'flex-start' }}>
              <label>{t('common.description')}</label>
              <textarea
                value={first.description ?? ''}
                onChange={(e) => updateBoxes([first.id], { description: e.target.value })}
                style={{ width: '100%', minHeight: 60, resize: 'vertical' }}
                placeholder={t('box.description.placeholder')}
              />
            </div>
          )}
          <div className="prop-row">
            <label>{t('common.noDescriptionNeeded')}</label>
            <input
              type="checkbox"
              checked={getCommon(boxes, 'noDescriptionNeeded') === true}
              onChange={(e) => updateBoxes(ids, { noDescriptionNeeded: e.target.checked })}
            />
          </div>
        </CollapsibleSection>
      </>}

      {!isMulti && (
        <SourceRefsSection
          target={{ type: 'box', id: first.id }}
          onOpenTranscriptViewer={onOpenTranscriptViewer}
        />
      )}

      <div className="prop-row">
        <button className="danger-btn" onClick={() => removeBoxes(ids)}>{t('common.delete')}</button>
      </div>
    </div>
  );
}

// ============================================================================
// SDSG Properties
// ============================================================================
function SDSGProperties({ sdsgs, onOpenTranscriptViewer }: { sdsgs: SDSG[]; onOpenTranscriptViewer?: (focusBoxId?: string) => void }) {
  const { t } = useTranslation('propertyPanel');
  const updateSDSG = useTEMStore((s) => s.updateSDSG);
  const updateSDSGs = useTEMStore((s) => s.updateSDSGs);
  const matchSDSGsSize = useTEMStore((s) => s.matchSDSGsSize);
  const matchSDSGsFontSize = useTEMStore((s) => s.matchSDSGsFontSize);
  const removeSDSG = useTEMStore((s) => s.removeSDSG);
  const setSDSGSpaceMode = useTEMStore((s) => s.setSDSGSpaceMode);
  const sdsgSpace = useTEMStore((s) => s.doc.settings.sdsgSpace);
  const sdsgLayout = useTEMStore((s) => s.doc.settings.layout);
  const sheet = useActiveSheet();
  const isMulti = sdsgs.length > 1;
  const first = sdsgs[0];
  const ids = sdsgs.map((s) => s.id);
  const [tab, setTab] = useState<PropTab>('basic');

  // 複数選択対応用の共通値（ラベル / idLabel / subLabel タブで使用）
  const commonFont = getCommonStyle(sdsgs as unknown as Box[], 'fontFamily');
  const commonFS = getCommonStyle(sdsgs as unknown as Box[], 'fontSize');
  const commonBold = getCommonStyle(sdsgs as unknown as Box[], 'bold');
  const commonItalic = getCommonStyle(sdsgs as unknown as Box[], 'italic');
  const commonUnderline = getCommonStyle(sdsgs as unknown as Box[], 'underline');
  const commonTextColor = getCommonStyle(sdsgs as unknown as Box[], 'color');
  const commonBg = getCommonStyle(sdsgs as unknown as Box[], 'backgroundColor');
  const commonBorder = getCommonStyle(sdsgs as unknown as Box[], 'borderColor');
  const commonTextAlign = getCommonStyle(sdsgs as unknown as Box[], 'textAlign');
  const commonVAlign = getCommonStyle(sdsgs as unknown as Box[], 'verticalAlign');
  const commonAscii = getCommon(sdsgs, 'asciiUpright');

  const commonTLFontSize = getCommon(sdsgs, 'typeLabelFontSize');
  const commonTLFontFamily = getCommon(sdsgs, 'typeLabelFontFamily');
  const commonTLBold = getCommon(sdsgs, 'typeLabelBold');
  const commonTLItalic = getCommon(sdsgs, 'typeLabelItalic');
  const commonTLNumbered = getCommon(sdsgs, 'typeLabelNumbered');
  const commonTLAscii = getCommon(sdsgs, 'typeLabelAsciiUpright');
  const commonTLColor = getCommon(sdsgs, 'typeLabelColor');
  const commonTLBg = getCommon(sdsgs, 'typeLabelBackgroundColor');
  const commonTLBorderColor = getCommon(sdsgs, 'typeLabelBorderColor');
  const commonTLBorderWidth = getCommon(sdsgs, 'typeLabelBorderWidth');

  const commonSubFS = getCommon(sdsgs, 'subLabelFontSize');
  const commonSubOffX = getCommon(sdsgs, 'subLabelOffsetX');
  const commonSubOffY = getCommon(sdsgs, 'subLabelOffsetY');
  const commonSubAscii = getCommon(sdsgs, 'subLabelAsciiUpright');
  const commonSubColor = getCommon(sdsgs, 'subLabelColor');
  const commonSubBg = getCommon(sdsgs, 'subLabelBackgroundColor');
  const commonSubBorderColor = getCommon(sdsgs, 'subLabelBorderColor');
  const commonSubBorderWidth = getCommon(sdsgs, 'subLabelBorderWidth');
  const isH = sdsgLayout === 'horizontal';
  const topBandLabel = isH ? t('sdsg.band.top.h') : t('sdsg.band.top.v');
  const bottomBandLabel = isH ? t('sdsg.band.bottom.h') : t('sdsg.band.bottom.v');

  // outOfRange 判定 (選択中の SDSG いずれかが帯からはみ出しているか)
  const projectSettings = useTEMStore((s) => s.doc.settings);
  const outOfRangeSDSGs = sheet
    ? sdsgs.filter((sg) => isSDSGOutOfRange(sg, sheet, sdsgLayout, projectSettings))
    : [];
  const hasOutOfRange = outOfRangeSDSGs.length > 0;
  const firstOutBand = outOfRangeSDSGs[0]
    ? (outOfRangeSDSGs[0].spaceMode === 'band-top' ? 'top' : 'bottom')
    : null;
  const updateBandPatch = (which: 'top' | 'bottom', patch: Partial<NonNullable<typeof projectSettings.sdsgSpace>['bands']['top']>) => {
    useTEMStore.setState((state) => ({
      doc: produce(state.doc, (d) => {
        if (!d.settings.sdsgSpace) return;
        d.settings.sdsgSpace.bands[which] = { ...d.settings.sdsgSpace.bands[which], ...patch };
      }),
    }));
  };
  const fixEnableAutoExpand = () => {
    if (!firstOutBand) return;
    updateBandPatch(firstOutBand, { autoExpandHeight: true, heightMode: 'manual' });
  };
  const fixEnableShrink = () => {
    if (!firstOutBand) return;
    updateBandPatch(firstOutBand, { shrinkToFitRow: true });
  };
  const fixDecreaseRow = () => {
    outOfRangeSDSGs.forEach((sg) => {
      const cur = sg.spaceRowOverride ?? 0;
      updateSDSG(sg.id, { spaceRowOverride: Math.max(0, cur - 1) });
    });
  };

  const changeSpaceMode = (newMode: 'attached' | 'band-top' | 'band-bottom') => {
    const ids = sdsgs.map((s) => s.id);
    // 種別と帯の組合せチェック
    const allowMismatched = sdsgSpace?.allowMismatchedPlacement ?? false;
    if (!allowMismatched) {
      const blocked = sdsgs.find(
        (s) =>
          (newMode === 'band-top' && s.type === 'SG') ||
          (newMode === 'band-bottom' && s.type === 'SD'),
      );
      if (blocked) {
        alert(
          t('sdsg.mismatch.alert'),
        );
        return;
      }
    }
    if (!confirm(t('sdsg.spaceMode.confirm'))) return;
    setSDSGSpaceMode(ids, newMode);
  };

  return (
    <div className="prop-section">
      <h4>SD/SG {isMulti && <span className="multi-badge">{t('common.count', { count: sdsgs.length })}</span>}</h4>

      <div className="settings-tabs" style={{ marginBottom: 8, padding: 0 }}>
        <button className={tab === 'basic' ? 'settings-tab active' : 'settings-tab'} onClick={() => setTab('basic')}>{t('tab.basic')}</button>
        <button className={tab === 'label' ? 'settings-tab active' : 'settings-tab'} onClick={() => setTab('label')}>{t('common.label')}</button>
        <button className={tab === 'idLabel' ? 'settings-tab active' : 'settings-tab'} onClick={() => setTab('idLabel')}>{t('tab.typeLabel')}</button>
        <button className={tab === 'subLabel' ? 'settings-tab active' : 'settings-tab'} onClick={() => setTab('subLabel')}>{t('tab.subLabel')}</button>
        <button className={tab === 'autoFit' ? 'settings-tab active' : 'settings-tab'} onClick={() => setTab('autoFit')}>{t('tab.autoFit')}</button>
      </div>

      {!isMulti && (
        <>
          {/* ========== 基本 ========== */}
          {tab === 'basic' && <>
            <div className="prop-row">
              <label>ID</label>
              <input value={first.id} readOnly style={{ fontFamily: 'monospace', fontSize: '0.85em' }} />
            </div>
            <div className="prop-row">
              <label>{t('common.type')}</label>
              <select
                value={first.type}
                onChange={(e) => updateSDSG(first.id, { type: e.target.value as 'SD' | 'SG' })}
              >
                <option value="SD">{t('sdsg.type.SD')}</option>
                <option value="SG">{t('sdsg.type.SG')}</option>
              </select>
            </div>
            <div className="prop-row">
              <label>{t('sdsg.attachedTo')}</label>
              {sheet ? (
                <select
                  value={first.attachedTo}
                  onChange={(e) => updateSDSG(first.id, { attachedTo: e.target.value })}
                  style={{ fontFamily: 'monospace', fontSize: '0.85em' }}
                >
                  {/* 現在値が Box / Line どちらにも無い場合の救済 */}
                  {!sheet.boxes.some((b) => b.id === first.attachedTo)
                    && !sheet.lines.some((l) => l.id === first.attachedTo) && (
                    <option value={first.attachedTo}>{t('sdsg.attachedTo.current', { id: first.attachedTo })}</option>
                  )}
                  <optgroup label="Box">
                    {sheet.boxes.map((b) => (
                      <option key={b.id} value={b.id}>Box: {b.id} — {b.label}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Line">
                    {sheet.lines.map((l) => (
                      <option key={l.id} value={l.id}>Line: {l.id}</option>
                    ))}
                  </optgroup>
                </select>
              ) : null}
            </div>

            {/* 2 つ目の対象（attachedTo2）— 値を入れた瞬間 between に、空に戻すと single に自動切替 */}
            <div className="prop-row">
              <label>{t('sdsg.attachedTo2')}</label>
              {sheet ? (
                <select
                  value={first.attachedTo2 ?? ''}
                  onChange={(e) => {
                    const v = e.target.value || undefined;
                    if (v) {
                      // between 化: betweenMode 既定値も併せてセット
                      updateSDSG(first.id, {
                        attachedTo2: v,
                        anchorMode: 'between',
                        betweenMode: first.betweenMode ?? 'edge-to-edge',
                      });
                    } else {
                      // single へ戻す
                      updateSDSG(first.id, { attachedTo2: undefined, anchorMode: 'single' });
                    }
                  }}
                  style={{ fontFamily: 'monospace', fontSize: '0.85em' }}
                  title={t('sdsg.attachedTo2.tooltip')}
                >
                  <option value="">{t('sdsg.attachedTo2.none')}</option>
                  <optgroup label="Box">
                    {sheet.boxes.filter((b) => b.id !== first.attachedTo).map((b) => (
                      <option key={b.id} value={b.id}>Box: {b.id} — {b.label}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Line">
                    {sheet.lines.filter((l) => l.id !== first.attachedTo).map((l) => (
                      <option key={l.id} value={l.id}>Line: {l.id}</option>
                    ))}
                  </optgroup>
                </select>
              ) : null}
            </div>
            {first.anchorMode === 'between' && first.attachedTo2 && (
              <div className="prop-row">
                <label>{t('sdsg.betweenMode')}</label>
                <select
                  value={first.betweenMode ?? 'edge-to-edge'}
                  onChange={(e) => updateSDSG(first.id, { betweenMode: e.target.value as 'edge-to-edge' | 'center-to-center' })}
                >
                  <option value="edge-to-edge">{t('sdsg.betweenMode.edge')}</option>
                  <option value="center-to-center">{t('sdsg.betweenMode.center')}</option>
                </select>
              </div>
            )}
            {first.anchorMode === 'between' && first.attachedTo2 && (
              <CollapsibleSection title={t('sdsg.influence')} sectionKey="sdsg-influence" compact defaultOpen={true}>
                <p className="hint" style={{ marginTop: 0 }}>
                  {t('sdsg.influence.hint')}
                </p>
                <div className="prop-row">
                  <label>{t('sdsg.shape')}</label>
                  <select
                    value={first.shape ?? 'pentagon'}
                    onChange={(e) => updateSDSG(first.id, { shape: e.target.value as 'pentagon' | 'rect' })}
                  >
                    <option value="pentagon">{t('sdsg.shape.pentagon')}</option>
                    <option value="rect">{t('sdsg.shape.rect')}</option>
                  </select>
                </div>
                <div className="prop-row" style={{ alignItems: 'flex-start' }}>
                  <label>{t('sdsg.influenceTargets')}</label>
                  <div style={{ maxHeight: 140, overflowY: 'auto', border: '1px solid #ddd', borderRadius: 4, padding: 4, width: '100%' }}>
                    {(sheet?.boxes ?? []).map((b) => {
                      const cur = first.influenceTargets ?? [];
                      const on = cur.includes(b.id);
                      return (
                        <label key={b.id} style={{ display: 'flex', gap: 6, alignItems: 'center', fontWeight: 'normal', fontSize: '0.85em' }}>
                          <input
                            type="checkbox"
                            checked={on}
                            onChange={(e) => {
                              const next = e.target.checked ? [...cur, b.id] : cur.filter((x) => x !== b.id);
                              updateSDSG(first.id, {
                                influenceTargets: next.length > 0 ? next : undefined,
                                // 影響先を初めて付けたときは四角形に切り替える（案 X の既定）
                                ...(next.length > 0 && !first.shape ? { shape: 'rect' as const } : {}),
                              });
                            }}
                          />
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {b.id}  {(b.label || '').replace(/\s+/g, ' ').slice(0, 20)}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
                <div className="prop-row">
                  <label>{t('sdsg.influenceStrokeWidth')}</label>
                  <input
                    type="number" min={1} max={12} step={0.5}
                    value={first.influenceStrokeWidth ?? 3}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      if (!Number.isFinite(v) || v <= 0) return;
                      updateSDSG(first.id, { influenceStrokeWidth: Math.max(1, Math.min(12, v)) });
                    }}
                  />
                </div>
              </CollapsibleSection>
            )}

            {/* 配置方式 */}
            <div className="prop-row">
              <label>{t('sdsg.spaceMode')}</label>
              <select
                value={(first.spaceMode === 'band-top' || first.spaceMode === 'band-bottom') ? 'band' : 'attached'}
                onChange={(e) => {
                  const val = e.target.value as 'attached' | 'band';
                  if (val === 'attached') {
                    changeSpaceMode('attached');
                  } else {
                    const target = first.type === 'SD' ? 'band-top' : 'band-bottom';
                    changeSpaceMode(target);
                  }
                }}
              >
                <option value="attached">{t('sdsg.spaceMode.attached')}</option>
                <option value="band">{t('sdsg.spaceMode.band')}</option>
              </select>
            </div>

            {/* band モード固有の設定 */}
            {(first.spaceMode === 'band-top' || first.spaceMode === 'band-bottom') && (
              <>
                <div className="prop-row">
                  <label>{t('sdsg.bandPosition')}</label>
                  <select
                    value={first.spaceMode}
                    onChange={(e) => changeSpaceMode(e.target.value as 'band-top' | 'band-bottom')}
                  >
                    <option value="band-top">{topBandLabel}</option>
                    <option value="band-bottom">{bottomBandLabel}</option>
                  </select>
                </div>
                {!sdsgSpace?.enabled && (
                  <div className="prop-row" style={{ padding: 6, background: '#fff8e1', border: '1px solid #ffc107', borderRadius: 4 }}>
                    <span style={{ fontSize: '0.85em', color: '#856404' }}>
                      {t('sdsg.bandDisabled')}
                    </span>
                  </div>
                )}
                {first.anchorMode === 'between' && (
                  <div className="prop-row" style={{ padding: 6, background: '#e3f2fd', border: '1px solid #2196f3', borderRadius: 4 }}>
                    <span style={{ fontSize: '0.82em', color: '#0d47a1' }}>
                      {t('sdsg.betweenBand.hint')}
                    </span>
                  </div>
                )}
                {hasOutOfRange && (
                  <div
                    className="prop-row"
                    style={{
                      padding: 8,
                      background: '#fdecea',
                      border: '1px solid #e74c3c',
                      borderRadius: 4,
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: 6,
                    }}
                  >
                    <span style={{ fontSize: '0.85em', color: '#a02722', fontWeight: 'bold' }}>
                      {t('sdsg.outOfRange', { count: outOfRangeSDSGs.length })}
                    </span>
                    <span style={{ fontSize: '0.78em', color: '#5b1a17' }}>
                      {t('sdsg.outOfRange.hint')}
                    </span>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      <button
                        className="ribbon-btn-small"
                        onClick={fixEnableAutoExpand}
                        title={t('sdsg.fix.expand.tooltip')}
                      >{t('sdsg.fix.expand')}</button>
                      <button
                        className="ribbon-btn-small"
                        onClick={fixEnableShrink}
                        title={t('sdsg.fix.shrink.tooltip')}
                      >{t('sdsg.fix.shrink')}</button>
                      <button
                        className="ribbon-btn-small"
                        onClick={fixDecreaseRow}
                        title={t('sdsg.fix.rowInward.tooltip')}
                      >{t('sdsg.fix.rowInward')}</button>
                    </div>
                  </div>
                )}
                <CollapsibleSection title={t('sdsg.bandDetail')} sectionKey="sdsg-basic-band-detail" compact defaultOpen={true}>
                <div className="prop-row">
                  <label>{t('sdsg.bandRow')}</label>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={first.spaceRowOverride ?? ''}
                      placeholder={t('common.auto')}
                      onChange={(e) => {
                        const v = e.target.value;
                        updateSDSG(first.id, { spaceRowOverride: v === '' ? undefined : Math.max(0, Number(v)) });
                      }}
                      style={{ width: 60 }}
                      title={t('sdsg.bandRow.tooltip')}
                    />
                    <button className="ribbon-btn-small"
                      onClick={() => {
                        const cur = first.spaceRowOverride ?? 0;
                        updateSDSG(first.id, { spaceRowOverride: Math.max(0, cur - 1) });
                      }}
                      title={t('sdsg.bandRow.up.tooltip')}>↑</button>
                    <button className="ribbon-btn-small"
                      onClick={() => {
                        const cur = first.spaceRowOverride ?? 0;
                        updateSDSG(first.id, { spaceRowOverride: cur + 1 });
                      }}
                      title={t('sdsg.bandRow.down.tooltip')}>↓</button>
                    <button className="ribbon-btn-small"
                      onClick={() => updateSDSG(first.id, { spaceRowOverride: undefined })}
                      title={t('sdsg.bandRow.auto.tooltip')}>{t('common.auto')}</button>
                  </div>
                </div>
                <div className="prop-row">
                  <label>{t('sdsg.bandInsetTime')}</label>
                  <input
                    type="number"
                    step={0.5}
                    value={first.spaceInsetTime ?? 0}
                    onChange={(e) => updateSDSG(first.id, { spaceInsetTime: Number(e.target.value) })}
                  />
                </div>
                <div className="prop-row">
                  <label>{t('sdsg.bandInsetItem')}</label>
                  <input
                    type="number"
                    step={0.5}
                    value={first.spaceInsetItem ?? 0}
                    onChange={(e) => updateSDSG(first.id, { spaceInsetItem: Number(e.target.value) })}
                  />
                </div>
                <div className="prop-row">
                  <label>{isH ? t('sdsg.spaceWidth.time') : t('sdsg.spaceWidth.item')}</label>
                  <input
                    type="number"
                    value={first.spaceWidth ?? first.width ?? 70}
                    onChange={(e) => updateSDSG(first.id, { spaceWidth: Number(e.target.value) })}
                    title={isH
                      ? t('sdsg.spaceWidth.time.tooltip')
                      : t('sdsg.spaceWidth.item.tooltip')}
                  />
                </div>
                <div className="prop-row">
                  <label>{isH ? t('sdsg.spaceHeight.item') : t('sdsg.spaceHeight.time')}</label>
                  <input
                    type="number"
                    value={first.spaceHeight ?? first.height ?? 40}
                    onChange={(e) => updateSDSG(first.id, { spaceHeight: Number(e.target.value) })}
                    title={isH
                      ? t('sdsg.spaceHeight.item.tooltip')
                      : t('sdsg.spaceHeight.time.tooltip')}
                  />
                </div>
                <p className="hint" style={{ margin: '0 0 6px', fontSize: '0.8em', color: '#666' }}>
                  {isH
                    ? t('sdsg.spaceSize.hint.h')
                    : t('sdsg.spaceSize.hint.v')}
                </p>
                </CollapsibleSection>
              </>
            )}

            {/* attached モード固有の設定（attachedTo2 / anchorMode / betweenMode は上の共通 UI を使用） */}
            {(first.spaceMode == null || first.spaceMode === 'attached') && (
              <CollapsibleSection title={t('sdsg.attachedDetail')} sectionKey="sdsg-basic-attached-detail" compact defaultOpen={true}>
                <div className="prop-row">
                  <label>{t('sdsg.timeOffset')}</label>
                  <input
                    type="number"
                    step={0.5}
                    value={first.timeOffset ?? 0}
                    onChange={(e) => updateSDSG(first.id, { timeOffset: Number(e.target.value) })}
                  />
                </div>
                <div className="prop-row">
                  <label>{t('sdsg.itemOffset')}</label>
                  <input
                    type="number"
                    step={0.5}
                    value={first.itemOffset ?? 0}
                    onChange={(e) => updateSDSG(first.id, { itemOffset: Number(e.target.value) })}
                  />
                </div>
                {(() => {
                  // このセクションは attached モードのときだけ描かれる。
                  // その中でも between アンカーのときは、時間軸方向のサイズが
                  // 2 Box 間のスパンから自動計算されるため入力しても効かない。
                  // （帯に配置中のときは spaceWidth / spaceHeight が使われる。
                  //   そちらは「帯」セクション側の入力欄が担当する）
                  const isBetween = first.anchorMode === 'between';
                  const timeIsWidth = sdsgLayout === 'horizontal';
                  const widthIgnored = isBetween && timeIsWidth;
                  const heightIgnored = isBetween && !timeIsWidth;
                  const reason = t('sdsg.betweenSize.reason');
                  return (
                    <>
                      <div className="prop-row">
                        <label>{t('common.widthPx')}</label>
                        <input
                          type="number"
                          min={10}
                          step={5}
                          value={first.width ?? 70}
                          disabled={widthIgnored}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            if (!Number.isFinite(v) || v <= 0) return;
                            updateSDSG(first.id, { width: v });
                          }}
                          title={widthIgnored ? reason : ''}
                        />
                      </div>
                      <div className="prop-row">
                        <label>{t('common.heightPx')}</label>
                        <input
                          type="number"
                          min={10}
                          step={5}
                          value={first.height ?? 40}
                          disabled={heightIgnored}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            if (!Number.isFinite(v) || v <= 0) return;
                            updateSDSG(first.id, { height: v });
                          }}
                          title={heightIgnored ? reason : ''}
                        />
                      </div>
                      {(widthIgnored || heightIgnored) && (
                        <p className="hint" style={{ color: '#b45309' }}>{reason}</p>
                      )}
                    </>
                  );
                })()}
              </CollapsibleSection>
            )}

            <div className="prop-row">
              <label>{t('sdsg.rectRatio')}</label>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <input
                  type="range"
                  min={0.1}
                  max={0.9}
                  step={0.05}
                  value={first.rectRatio ?? 0.55}
                  onChange={(e) => updateSDSG(first.id, { rectRatio: Number(e.target.value) })}
                  style={{ width: 90 }}
                />
                <input
                  type="number"
                  min={0.1}
                  max={0.9}
                  step={0.05}
                  value={first.rectRatio ?? 0.55}
                  onChange={(e) => updateSDSG(first.id, { rectRatio: Number(e.target.value) })}
                  style={{ width: 60 }}
                />
              </div>
            </div>
          </>}
          <div className="prop-row">
            <label>{t('sdsg.idFontSize')}</label>
            <input
              type="number"
              min={6}
              max={40}
              value={getCommon(sdsgs, 'idFontSize') ?? 9}
              placeholder={getCommon(sdsgs, 'idFontSize') === undefined ? '' : ''}
              onChange={(e) => updateSDSGs(ids, { idFontSize: Number(e.target.value) })}
            />
          </div>
          <div className="prop-row">
            <label>{t('sdsg.idOffset')}</label>
            <div style={{ display: 'flex', gap: 4 }}>
              <input
                type="number"
                value={getCommon(sdsgs, 'idOffsetX') ?? 0}
                onChange={(e) => updateSDSGs(ids, { idOffsetX: Number(e.target.value) })}
                title={t('common.offsetTime.tooltip')}
              />
              <input
                type="number"
                value={getCommon(sdsgs, 'idOffsetY') ?? 0}
                onChange={(e) => updateSDSGs(ids, { idOffsetY: Number(e.target.value) })}
                title={t('common.offsetItem.tooltip')}
              />
            </div>
          </div>
        </>
      )}

      {/* ========== ラベル ========== (複数選択対応) */}
      {tab === 'label' && (<>
        {!isMulti && (
          <div className="prop-row">
            <label>{t('common.label')}</label>
            <textarea
              value={first.label}
              onChange={(e) => updateSDSG(first.id, { label: e.target.value })}
              rows={2}
              style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit' }}
              title={t('sdsg.label.tooltip')}
            />
          </div>
        )}
        <FontFamilyRow
          value={commonFont}
          onChange={(v) => updateSDSGs(ids, { style: { fontFamily: v } })}
          emptyOptionLabel={t('sdsg.fontFamily.uiDefault')}
        />
        <FontSizeRow
          value={commonFS}
          onChange={(v) => updateSDSGs(ids, { style: { fontSize: v } })}
          fallbackValue={11}
          max={40}
        />
        <BoldItalicUnderlineRow
          bold={commonBold !== false}
          italic={!!commonItalic}
          underline={!!commonUnderline}
          onBoldToggle={(v) => updateSDSGs(ids, { style: { bold: v } })}
          onItalicToggle={(v) => updateSDSGs(ids, { style: { italic: v } })}
          onUnderlineToggle={(v) => updateSDSGs(ids, { style: { underline: v } })}
        />
        <ColorRow
          label={t('common.textColor')}
          value={commonTextColor}
          onChange={(c) => updateSDSGs(ids, { style: { color: c } })}
          defaultLabel={t('color.default222')}
        />
        <ColorRow
          label={t('common.bgColor')}
          value={commonBg}
          onChange={(c) => updateSDSGs(ids, { style: { backgroundColor: c } })}
          allowNone
          defaultLabel={t('color.defaultWhite')}
        />
        <ColorRow
          label={t('common.borderColor')}
          value={commonBorder}
          onChange={(c) => updateSDSGs(ids, { style: { borderColor: c } })}
          allowNone
          defaultLabel={t('color.default333')}
        />
        <TextAlignRow
          value={commonTextAlign}
          onChange={(v) => updateSDSGs(ids, { style: { textAlign: v } })}
        />
        <VerticalAlignRow
          value={commonVAlign}
          onChange={(v) => updateSDSGs(ids, { style: { verticalAlign: v } })}
        />
        <div className="prop-row">
          <label>{t('sdsg.labelArea')}</label>
          <select
            value={getCommon(sdsgs, 'labelArea') ?? 'pentagon'}
            onChange={(e) => updateSDSGs(ids, { labelArea: e.target.value as 'pentagon' | 'rect' })}
            title={t('sdsg.labelArea.tooltip')}
          >
            <option value="pentagon">{t('sdsg.labelArea.pentagon')}</option>
            <option value="rect">{t('sdsg.labelArea.rect')}</option>
          </select>
        </div>
        <div className="prop-row">
          <label>{t('common.offsetTimeItem')}</label>
          <div style={{ display: 'flex', gap: 4 }}>
            <input
              type="number"
              value={getCommon(sdsgs, 'labelOffsetX') ?? 0}
              onChange={(e) => updateSDSGs(ids, { labelOffsetX: Number(e.target.value) })}
              title={t('sdsg.labelOffsetTime.tooltip')}
            />
            <input
              type="number"
              value={getCommon(sdsgs, 'labelOffsetY') ?? 0}
              onChange={(e) => updateSDSGs(ids, { labelOffsetY: Number(e.target.value) })}
              title={t('sdsg.labelOffsetItem.tooltip')}
            />
          </div>
        </div>
        <div className="prop-row">
          <label>{t('sdsg.asciiUpright')}</label>
          <input
            type="checkbox"
            checked={commonAscii ?? true}
            ref={(el) => { if (el) el.indeterminate = commonAscii === undefined; }}
            onChange={(e) => updateSDSGs(ids, { asciiUpright: e.target.checked })}
          />
        </div>
      </>)}

      {/* ========== タイプラベル（種別バッジ SD/SG） ========== (複数選択対応) */}
      {tab === 'idLabel' && (<>
        <p className="hint" style={{ marginTop: 0 }}>
          {t('sdsg.typeLabel.hint')}
        </p>
        <div className="prop-row">
          <label>{t('common.numbered')}</label>
          <input
            type="checkbox"
            checked={commonTLNumbered !== false}
            ref={(el) => { if (el) el.indeterminate = commonTLNumbered === undefined; }}
            onChange={(e) => updateSDSGs(ids, { typeLabelNumbered: e.target.checked ? undefined : false })}
            title={t('sdsg.numbered.tooltip')}
          />
        </div>
        <FontSizeRow
          value={commonTLFontSize}
          onChange={(v) => updateSDSGs(ids, { typeLabelFontSize: v })}
          fallbackValue={11}
          max={40}
        />
        <FontFamilyRow
          value={commonTLFontFamily}
          onChange={(v) => updateSDSGs(ids, { typeLabelFontFamily: v })}
          emptyOptionLabel={t('sdsg.sameAsBody')}
        />
        <BoldItalicUnderlineRow
          bold={commonTLBold !== false}
          italic={!!commonTLItalic}
          onBoldToggle={(v) => updateSDSGs(ids, { typeLabelBold: v })}
          onItalicToggle={(v) => updateSDSGs(ids, { typeLabelItalic: v })}
        />
        <div className="prop-row">
          <label>{t('sdsg.asciiUpright')}</label>
          <input
            type="checkbox"
            checked={commonTLAscii ?? (commonAscii ?? true)}
            ref={(el) => { if (el) el.indeterminate = commonTLAscii === undefined; }}
            onChange={(e) => updateSDSGs(ids, { typeLabelAsciiUpright: e.target.checked })}
          />
        </div>
        <ColorRow
          label={t('common.textColor')}
          value={commonTLColor}
          onChange={(c) => updateSDSGs(ids, { typeLabelColor: c })}
          defaultLabel={t('color.default222')}
        />
        <ColorRow
          label={t('common.bgColor')}
          value={commonTLBg}
          onChange={(c) => updateSDSGs(ids, { typeLabelBackgroundColor: c })}
          allowNone
          defaultLabel={t('color.defaultTransparent')}
        />
        <ColorRow
          label={t('common.borderColor')}
          value={commonTLBorderColor}
          onChange={(c) => updateSDSGs(ids, { typeLabelBorderColor: c })}
          allowNone
          defaultLabel={t('color.defaultNoBorder')}
        />
        <div className="prop-row">
          <label>{t('common.borderWidthPx')}</label>
          <input
            type="number"
            min={0}
            max={5}
            step={0.5}
            value={commonTLBorderWidth ?? 0}
            placeholder={commonTLBorderWidth === undefined ? '' : ''}
            onChange={(e) => updateSDSGs(ids, { typeLabelBorderWidth: Number(e.target.value) })}
            title={t('common.borderWidth.tooltip')}
          />
        </div>
      </>)}

      {/* ========== サブラベル ========== (複数選択対応) */}
      {tab === 'subLabel' && (<>
        {!isMulti && (
          <div className="prop-row">
            <label>{t('tab.subLabel')}</label>
            <input
              type="text"
              value={first.subLabel ?? ''}
              onChange={(e) => updateSDSG(first.id, { subLabel: e.target.value })}
            />
          </div>
        )}
        {isMulti && (
          <p className="hint" style={{ margin: '0 0 4px', fontSize: '0.82em', color: '#888' }}>
            {t('sdsg.subLabel.multiHint', { count: sdsgs.length })}
          </p>
        )}
        <div className="prop-row">
          <label>{t('common.fontSize')}</label>
          <input
            type="number"
            min={6}
            max={40}
            value={commonSubFS ?? 10}
            placeholder={commonSubFS === undefined ? '' : ''}
            onChange={(e) => updateSDSGs(ids, { subLabelFontSize: Number(e.target.value) })}
          />
        </div>
        <div className="prop-row">
          <label>{t('common.positionXY')}</label>
          <div style={{ display: 'flex', gap: 4 }}>
            <input
              type="number"
              value={commonSubOffX ?? 0}
              placeholder={commonSubOffX === undefined ? '' : ''}
              onChange={(e) => updateSDSGs(ids, { subLabelOffsetX: Number(e.target.value) })}
            />
            <input
              type="number"
              value={commonSubOffY ?? 0}
              placeholder={commonSubOffY === undefined ? '' : ''}
              onChange={(e) => updateSDSGs(ids, { subLabelOffsetY: Number(e.target.value) })}
            />
          </div>
        </div>
        <div className="prop-row">
          <label>{t('sdsg.asciiUpright')}</label>
          <input
            type="checkbox"
            checked={commonSubAscii ?? (commonAscii ?? true)}
            ref={(el) => { if (el) el.indeterminate = commonSubAscii === undefined; }}
            onChange={(e) => updateSDSGs(ids, { subLabelAsciiUpright: e.target.checked })}
          />
        </div>
        <ColorRow
          label={t('common.textColor')}
          value={commonSubColor}
          onChange={(c) => updateSDSGs(ids, { subLabelColor: c })}
          defaultLabel={t('color.default555')}
        />
        <ColorRow
          label={t('common.bgColor')}
          value={commonSubBg}
          onChange={(c) => updateSDSGs(ids, { subLabelBackgroundColor: c })}
          allowNone
          defaultLabel={t('color.defaultTranslucentWhite')}
        />
        <ColorRow
          label={t('common.borderColor')}
          value={commonSubBorderColor}
          onChange={(c) => updateSDSGs(ids, { subLabelBorderColor: c })}
          allowNone
          defaultLabel={t('color.defaultNoBorder')}
        />
        <div className="prop-row">
          <label>{t('common.borderWidthPx')}</label>
          <input
            type="number"
            min={0}
            max={5}
            step={0.5}
            value={commonSubBorderWidth ?? 0}
            placeholder={commonSubBorderWidth === undefined ? '' : ''}
            onChange={(e) => updateSDSGs(ids, { subLabelBorderWidth: Number(e.target.value) })}
            title={t('common.borderWidth.tooltip')}
          />
        </div>
      </>)}

      {/* ========== 自動調整 ========== (複数選択バッチ操作) */}
      {tab === 'autoFit' && (<>
        {!isMulti && (
          <p className="hint" style={{ marginTop: 0, color: '#888' }}>
            {t('sdsg.autoFit.singleHint')}
          </p>
        )}
        {isMulti && (
          <>
            <p className="hint" style={{ marginTop: 0 }}>
              {t('sdsg.autoFit.multiHint', { count: sdsgs.length })}
            </p>
            <div className="prop-row" style={{ flexWrap: 'wrap', gap: 4, justifyContent: 'flex-start' }}>
              <button className="ribbon-btn-small"
                onClick={() => matchSDSGsSize(ids, 'width')}>{t('match.width')}</button>
              <button className="ribbon-btn-small"
                onClick={() => matchSDSGsSize(ids, 'height')}>{t('match.height')}</button>
              <button className="ribbon-btn-small"
                onClick={() => matchSDSGsSize(ids, 'both')}>{t('match.size')}</button>
              <button className="ribbon-btn-small"
                onClick={() => matchSDSGsFontSize(ids)}>{t('match.fontSize')}</button>
            </div>
          </>
        )}
      </>)}

      {!isMulti && (
        <SourceRefsSection
          target={{ type: 'sdsg', id: first.id }}
          onOpenTranscriptViewer={onOpenTranscriptViewer}
        />
      )}

      <div className="prop-row">
        <button className="danger-btn" onClick={() => sdsgs.forEach((s) => removeSDSG(s.id))}>{t('common.delete')}</button>
      </div>
    </div>
  );
}

function LineProperties({ lines, onOpenTranscriptViewer }: { lines: Line[]; onOpenTranscriptViewer?: (focusBoxId?: string) => void }) {
  const { t } = useTranslation('propertyPanel');
  const updateLines = useTEMStore((s) => s.updateLines);
  const removeLines = useTEMStore((s) => s.removeLines);
  const sheet = useActiveSheet();
  const [tab, setTab] = useState<LineTab>('basic');

  const isMulti = lines.length > 1;
  const first = lines[0];
  const ids = lines.map((l) => l.id);

  const commonType = lines.every((l) => l.type === first.type) ? first.type : undefined;
  const commonShape = lines.every((l) => l.shape === first.shape) ? first.shape : undefined;
  const commonStartMargin = getCommon(lines, 'startMargin');
  const commonEndMargin = getCommon(lines, 'endMargin');
  const commonStartOffTime = getCommon(lines, 'startOffsetTime');
  const commonEndOffTime = getCommon(lines, 'endOffsetTime');
  const commonStartOffItem = getCommon(lines, 'startOffsetItem');
  const commonEndOffItem = getCommon(lines, 'endOffsetItem');
  const commonAngleMode = lines.every((l) => (l.angleMode ?? false) === (first.angleMode ?? false))
    ? !!first.angleMode
    : undefined;
  const commonAngleDeg = getCommon(lines, 'angleDeg');
  const allAngleOn = lines.every((l) => l.angleMode);

  return (
    <div className="prop-section">
      <h4>Line {isMulti && <span className="multi-badge">{t('common.count', { count: lines.length })}</span>}</h4>

      <div className="settings-tabs" style={{ marginBottom: 8, padding: 0 }}>
        <button className={tab === 'basic' ? 'settings-tab active' : 'settings-tab'} onClick={() => setTab('basic')}>{t('tab.basic')}</button>
        <button className={tab === 'endpoint' ? 'settings-tab active' : 'settings-tab'} onClick={() => setTab('endpoint')}>{t('tab.endpoint')}</button>
        <button className={tab === 'info' ? 'settings-tab active' : 'settings-tab'} onClick={() => setTab('info')}>{t('tab.info')}</button>
      </div>

      {tab === 'basic' && <>
      <div className="prop-row">
        <label>{t('line.type')}</label>
        <select value={commonType ?? ''} onChange={(e) => updateLines(ids, { type: e.target.value as 'RLine' | 'XLine' })}>
          {commonType === undefined && <option value=""></option>}
          <option value="RLine">{t('line.type.RLine')}</option>
          <option value="XLine">{t('line.type.XLine')}</option>
        </select>
      </div>

      <div className="prop-row">
        <label>{t('line.shape')}</label>
        <select
          value={commonShape ?? ''}
          onChange={(e) => updateLines(ids, { shape: e.target.value as 'straight' | 'elbow' | 'curve' })}
        >
          {commonShape === undefined && <option value=""></option>}
          <option value="straight">{t('line.shape.straight')}</option>
          <option value="elbow">{t('line.shape.elbow')}</option>
          <option value="curve">{t('line.shape.curve')}</option>
        </select>
      </div>
      {commonShape === 'elbow' && (
        <div className="prop-row">
          <label>{t('line.elbowBendRatio')}</label>
          <input
            type="number"
            min={0}
            max={1}
            step={0.05}
            value={getCommon(lines, 'elbowBendRatio') ?? 0.5}
            placeholder={getCommon(lines, 'elbowBendRatio') === undefined ? '' : ''}
            onChange={(e) => {
              const v = Math.max(0, Math.min(1, Number(e.target.value) || 0));
              updateLines(ids, { elbowBendRatio: v });
            }}
            title={t('line.elbowBendRatio.tooltip')}
          />
        </div>
      )}
      {commonShape === 'curve' && (
        <>
          <div className="prop-row">
            <label>{t('line.curveIntensity')}</label>
            <input
              type="number"
              min={0}
              max={1}
              step={0.05}
              value={getCommon(lines, 'curveIntensity') ?? 0.5}
              placeholder={getCommon(lines, 'curveIntensity') === undefined ? '' : ''}
              disabled={lines.some((l) => l.controlPoints && l.controlPoints.length >= 2)}
              onChange={(e) => {
                const v = Math.max(0, Math.min(1, Number(e.target.value) || 0));
                updateLines(ids, { curveIntensity: v });
              }}
              title={t('line.curveIntensity.tooltip')}
            />
          </div>
          <div className="prop-row">
            <label>{t('line.controlPoints')}</label>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <span style={{ fontSize: '0.82em', color: '#666' }}>
                {lines.some((l) => l.controlPoints && l.controlPoints.length >= 2)
                  ? t('line.controlPoints.manual')
                  : t('line.controlPoints.auto')}
              </span>
              <button
                className="ribbon-btn-small"
                onClick={() => updateLines(ids, { controlPoints: undefined })}
                disabled={!lines.some((l) => l.controlPoints && l.controlPoints.length >= 2)}
                title={t('line.controlPoints.reset.tooltip')}
              >
                {t('line.controlPoints.reset')}
              </button>
            </div>
          </div>
        </>
      )}

      {(() => {
        const firstColor = first.style?.color;
        const commonLineColor = lines.every((l) => l.style?.color === firstColor) ? firstColor : undefined;
        const firstWidth = first.style?.strokeWidth;
        const commonWidth = lines.every((l) => l.style?.strokeWidth === firstWidth) ? firstWidth : undefined;
        return (
          <>
            <div className="prop-row">
              <label>{t('line.color')}</label>
              <ColorPicker
                value={commonLineColor}
                onChange={(c) => updateLines(ids, { style: { ...first.style, color: c } })}
                defaultLabel={t('color.default222')}
              />
            </div>
            <div className="prop-row">
              <label>{t('line.strokeWidth')}</label>
              <input
                type="number"
                min={0.5}
                max={6}
                step={0.5}
                value={commonWidth ?? 1.5}
                placeholder={commonWidth === undefined ? '' : ''}
                onChange={(e) => updateLines(ids, { style: { ...first.style, strokeWidth: Number(e.target.value) } })}
              />
            </div>
          </>
        );
      })()}

      </>}

      {tab === 'endpoint' && <>
      <CollapsibleSection title={t('line.angleMode')} sectionKey="line-angle" compact defaultOpen={true}>
        <div className="prop-row">
          <label>{t('line.angleMode')}</label>
          <input
            type="checkbox"
            checked={!!commonAngleMode}
            ref={(el) => { if (el) el.indeterminate = commonAngleMode === undefined; }}
            disabled={commonShape === 'elbow' || commonShape === 'curve'}
            onChange={(e) => updateLines(ids, { angleMode: e.target.checked })}
          />
        </div>
        {(commonShape === 'elbow' || commonShape === 'curve') && (
          <p className="hint" style={{ margin: '0 0 4px', fontSize: '0.82em', color: '#888' }}>
            {t('line.angleMode.disabled')}
          </p>
        )}
        <div className="prop-row">
          <label>{t('line.angleDeg')}</label>
          <input
            type="number"
            min={-85}
            max={85}
            step={1}
            value={commonAngleDeg ?? 0}
            placeholder={commonAngleDeg === undefined ? '' : ''}
            disabled={!allAngleOn || commonShape === 'elbow' || commonShape === 'curve'}
            onChange={(e) => {
              const v = Math.max(-85, Math.min(85, Number(e.target.value) || 0));
              updateLines(ids, { angleDeg: v });
            }}
            title={t('line.angleDeg.tooltip')}
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title={t('line.offsets')} sectionKey="line-offset" compact>
        {allAngleOn && (
          <p className="hint" style={{ margin: '0 0 4px', fontSize: '0.82em', color: '#888' }}>
            {t('line.offsets.angleHint')}
          </p>
        )}
        <div className="prop-row">
          <label>{t('line.startOffset')}</label>
          <div style={{ display: 'flex', gap: 4 }}>
            <input
              type="number"
              value={commonStartOffTime ?? 0}
              placeholder={commonStartOffTime === undefined ? '' : ''}
              onChange={(e) => updateLines(ids, { startOffsetTime: Number(e.target.value) })}
            />
            <input
              type="number"
              value={commonStartOffItem ?? 0}
              placeholder={commonStartOffItem === undefined ? '' : ''}
              onChange={(e) => updateLines(ids, { startOffsetItem: Number(e.target.value) })}
            />
          </div>
        </div>
        <div className="prop-row">
          <label>{t('line.endOffset')}</label>
          <div style={{ display: 'flex', gap: 4 }}>
            <input
              type="number"
              value={commonEndOffTime ?? 0}
              placeholder={commonEndOffTime === undefined ? '' : ''}
              onChange={(e) => updateLines(ids, { endOffsetTime: Number(e.target.value) })}
            />
            <input
              type="number"
              value={commonEndOffItem ?? 0}
              placeholder={commonEndOffItem === undefined ? '' : ''}
              onChange={(e) => updateLines(ids, { endOffsetItem: Number(e.target.value) })}
            />
          </div>
        </div>
        <div className="prop-row">
          <label>{t('line.startMargin')}</label>
          <input
            type="number"
            value={commonStartMargin ?? 0}
            placeholder={commonStartMargin === undefined ? '' : ''}
            disabled={allAngleOn}
            onChange={(e) => updateLines(ids, { startMargin: Number(e.target.value) })}
          />
        </div>
        <div className="prop-row">
          <label>{t('line.endMargin')}</label>
          <input
            type="number"
            value={commonEndMargin ?? 0}
            placeholder={commonEndMargin === undefined ? '' : ''}
            disabled={allAngleOn}
            onChange={(e) => updateLines(ids, { endMargin: Number(e.target.value) })}
          />
        </div>
      </CollapsibleSection>
      </>}

      {tab === 'info' && <>
      {!isMulti && (
        <>
          <div className="prop-row">
            <label>ID</label>
            <input value={first.id} readOnly style={{ fontFamily: 'monospace', fontSize: '0.85em' }} />
          </div>
          <div className="prop-row">
            <label>From → To</label>
            <div style={{ fontSize: '0.85em', color: '#666', fontFamily: 'monospace' }}>
              {first.from} → {first.to}
            </div>
          </div>
          {(() => {
            const siblings = sheet?.lines.filter((l) => l.from === first.from && l.to === first.to) ?? [];
            if (siblings.length <= 1) return null;
            const index = siblings.findIndex((l) => l.id === first.id);
            return (
              <div className="prop-row">
                <label>{t('line.parallel')}</label>
                <div style={{ fontSize: '0.85em', color: '#666' }}>
                  {t('line.parallel.value', { n: index + 1, total: siblings.length })}
                </div>
              </div>
            );
          })()}
        </>
      )}

      {/* 論文用 description */}
      <h5 style={{ margin: '10px 0 4px', fontSize: '0.92em', color: '#555' }}>{t('common.paperReport')}</h5>
      {!isMulti && (
        <div className="prop-row" style={{ alignItems: 'flex-start' }}>
          <label>{t('common.description')}</label>
          <textarea
            value={first.description ?? ''}
            onChange={(e) => updateLines([first.id], { description: e.target.value })}
            style={{ width: '100%', minHeight: 60, resize: 'vertical' }}
            placeholder={t('line.description.placeholder')}
          />
        </div>
      )}
      <div className="prop-row">
        <label>{t('common.noDescriptionNeeded')}</label>
        <input
          type="checkbox"
          checked={getCommon(lines, 'noDescriptionNeeded') === true}
          onChange={(e) => updateLines(ids, { noDescriptionNeeded: e.target.checked })}
        />
      </div>

      <CollapsibleSection title={t('common.idBadge')} sectionKey="line-id-badge" compact defaultOpen={false}>
        <div className="prop-row">
          <label>{t('common.fontSize')}</label>
          <input
            type="number"
            min={6}
            max={40}
            value={getCommon(lines, 'idFontSize') ?? 9}
            placeholder={getCommon(lines, 'idFontSize') === undefined ? '' : ''}
            onChange={(e) => updateLines(ids, { idFontSize: Number(e.target.value) })}
          />
        </div>
        <div className="prop-row">
          <label>{t('common.offsetTimeItem')}</label>
          <div style={{ display: 'flex', gap: 4 }}>
            <input
              type="number"
              value={getCommon(lines, 'idOffsetX') ?? 0}
              onChange={(e) => updateLines(ids, { idOffsetX: Number(e.target.value) })}
              title={t('common.offsetTime.tooltip')}
            />
            <input
              type="number"
              value={getCommon(lines, 'idOffsetY') ?? -12}
              onChange={(e) => updateLines(ids, { idOffsetY: Number(e.target.value) })}
              title={t('common.offsetItem.tooltip')}
            />
          </div>
        </div>
      </CollapsibleSection>
      </>}

      {!isMulti && (
        <SourceRefsSection
          target={{ type: 'line', id: first.id }}
          onOpenTranscriptViewer={onOpenTranscriptViewer}
        />
      )}

      <div className="prop-row">
        <button className="danger-btn" onClick={() => removeLines(ids)}>{t('common.delete')}</button>
      </div>
    </div>
  );
}

// ============================================================================
// Note Properties（図上のメモ）
// ============================================================================
function NoteProperties({ notes }: { notes: Note[] }) {
  const { t } = useTranslation('propertyPanel');
  const updateNotes = useTEMStore((s) => s.updateNotes);
  const removeNotes = useTEMStore((s) => s.removeNotes);
  const sheet = useActiveSheet();
  const isMulti = notes.length > 1;
  const first = notes[0];
  const ids = notes.map((n) => n.id);
  const targets = [
    ...(sheet?.boxes ?? []).map((b) => ({ id: b.id, label: `${b.id}  ${(b.label || '').replace(/\s+/g, ' ').slice(0, 18)}` })),
    ...(sheet?.sdsg ?? []).map((s) => ({ id: s.id, label: `${s.id}  (${s.type})` })),
  ];

  return (
    <div className="prop-section">
      <h4>{t('note.title')} {isMulti && <span className="badge">{t('common.count', { count: notes.length })}</span>}</h4>
      <p className="hint" style={{ marginTop: 0 }}>
        {t('note.hint')}
      </p>
      {!isMulti && (
        <div className="prop-row">
          <label>{t('note.text')}</label>
          <textarea
            value={first.text}
            onChange={(e) => updateNotes(ids, { text: e.target.value })}
            rows={4}
            style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit' }}
          />
        </div>
      )}
      <div className="prop-row">
        <label>{t('note.style')}</label>
        <select
          value={getCommon(notes, 'style') ?? 'note'}
          onChange={(e) => updateNotes(ids, { style: e.target.value as Note['style'] })}
        >
          <option value="note">{t('note.style.note')}</option>
          <option value="callout">{t('note.style.callout')}</option>
          <option value="text">{t('note.style.text')}</option>
        </select>
      </div>
      <div className="prop-row" style={{ flexWrap: 'wrap', gap: 4 }}>
        <label>{t('note.symbols')}</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {NOTE_SYMBOLS.map((sym) => (
            <button
              key={sym}
              className="row-btn"
              style={{ minWidth: 26, fontSize: '1.05em' }}
              title={t('note.symbols.tooltip')}
              onClick={() => notes.forEach((n) => updateNotes([n.id], {
                text: n.style === 'text' ? applySymbolToText(n.text, sym) : `${n.text}${sym}`,
              }))}
            >{sym}</button>
          ))}
        </div>
      </div>
      <ColorRow
        label={t('common.textColor')}
        value={getCommon(notes, 'color')}
        onChange={(c) => updateNotes(ids, { color: c })}
        defaultLabel={t('color.default333')}
      />
      <div className="prop-row">
        <label>{t('note.fontSize')}</label>
        <input
          type="number" min={6} max={72} step={1}
          value={getCommon(notes, 'fontSize') ?? ''}
          placeholder={t('note.fontSize.default')}
          onChange={(e) => {
            const v = Number(e.target.value);
            updateNotes(ids, { fontSize: e.target.value === '' || !Number.isFinite(v) ? undefined : Math.max(6, Math.min(72, v)) });
          }}
        />
      </div>
      <div className="prop-row">
        <label>{t('note.showLeader')}</label>
        <input
          type="checkbox"
          checked={getCommon(notes, 'showLeader') === true}
          onChange={(e) => updateNotes(ids, { showLeader: e.target.checked || undefined })}
          title={t('note.showLeader.tooltip')}
        />
      </div>
      {getCommon(notes, 'showLeader') === true && (
        <div className="prop-row">
          <label>{t('note.leaderTo')}</label>
          <select
            value={getCommon(notes, 'leaderTo') ?? ''}
            onChange={(e) => updateNotes(ids, { leaderTo: e.target.value || undefined })}
          >
            <option value="">{t('note.leaderTo.placeholder')}</option>
            {targets.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
          </select>
        </div>
      )}
      <div className="prop-row">
        <label>{t('note.includeInReport')}</label>
        <input
          type="checkbox"
          checked={getCommon(notes, 'includeInReport') === true}
          onChange={(e) => updateNotes(ids, { includeInReport: e.target.checked || undefined })}
          title={t('note.includeInReport.tooltip')}
        />
      </div>
      <div className="prop-row">
        <button className="btn-danger" style={{ width: '100%' }} onClick={() => removeNotes(ids)}>{t('common.delete')}</button>
      </div>
    </div>
  );
}
