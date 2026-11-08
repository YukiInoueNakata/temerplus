// ============================================================================
// Ribbon - PowerPoint-style ribbon UI
// タブ: File / Home / Insert / 表示 / 出力 / Help
// ============================================================================

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { saveUILanguage, type UILanguage } from '../utils/uiLanguage';
import { useTEMStore } from '../store/store';
import type { BoxType } from '../types';
import { pickBetweenAnchors } from '../utils/sdsgBetween';
import { ChangelogDialog } from './ChangelogDialog';
import changelogData from '../data/changelog.json';
import { hasUnseen, CHANGELOG_SEEN_KEY, type ChangelogEntry } from '../utils/changelog';
import { shortcutLabel } from '../utils/platform';

const readLastSeen = () => {
  try {
    return localStorage.getItem(CHANGELOG_SEEN_KEY);
  } catch {
    return null;
  }
};

type RibbonTab = 'file' | 'home' | 'insert' | 'arrange' | 'view' | 'help';

export function Ribbon({
  onOpenSettings,
  onOpenInsertBetween,
  onOpenPeriodLabels,
  onOpenPeriodSettings,
  onOpenExport,
  onOpenPaperReport,
  onOpenResize,
  onOpenCSVImport,
  onCSVExport,
  onOpenShiftContent,
  onOpenOverlapCheck,
  onOpenTranscript,
  onOpenTranscriptBulkImport,
  onOpenWizard,
  onSave,
  onSaveAs,
  onOpen,
  onOpenAsNewSheets,
  onNew,
}: {
  onOpenSettings: () => void;
  onOpenInsertBetween: () => void;
  onOpenPeriodLabels: () => void;
  onOpenPeriodSettings: () => void;
  onOpenExport: () => void;
  onOpenPaperReport: () => void;
  onOpenResize: () => void;
  onOpenCSVImport: () => void;
  onCSVExport: () => void;
  onOpenShiftContent: () => void;
  onOpenOverlapCheck: () => void;
  onOpenTranscript: () => void;
  onOpenTranscriptBulkImport: () => void;
  onOpenWizard?: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onOpen: () => void;
  onOpenAsNewSheets: () => void;
  onNew: () => void;
}) {
  const [activeTab, setActiveTab] = useState<RibbonTab>('home');
  const { t } = useTranslation('ribbon');
  const [changelogOpen, setChangelogOpen] = useState(false);
  // 前回「更新情報」を開いてから新しい更新があれば、ヘルプタブと更新情報ボタンに「新」を付ける
  const [unseen, setUnseen] = useState(() => hasUnseen(changelogData as ChangelogEntry[], readLastSeen()));
  const openChangelog = () => {
    setChangelogOpen(true);
    setUnseen(false);
  };

  return (
    <div className="ribbon">
      <div className="ribbon-tabs">
        {(['file', 'home', 'insert', 'arrange', 'view', 'help'] as const).map((tab) => (
          <button
            key={tab}
            className={`ribbon-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {t(`translation:ribbon.tabs.${tab}`)}
            {tab === 'help' && unseen && <span className="ribbon-new-badge" title={t('badge.new.title')}>{t('badge.new')}</span>}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <LayoutToggle />
        {SHOW_LOCALE_TOGGLE && <LocaleToggle />}
        <SaveButton onSave={onSave} />
      </div>
      <div className="ribbon-body">
        {activeTab === 'file' && <FileTab onSave={onSave} onSaveAs={onSaveAs} onOpen={onOpen} onOpenAsNewSheets={onOpenAsNewSheets} onNew={onNew} onOpenExport={onOpenExport} onOpenPaperReport={onOpenPaperReport} onOpenCSVImport={onOpenCSVImport} onCSVExport={onCSVExport} onOpenSettings={onOpenSettings} onOpenResize={onOpenResize} onOpenShiftContent={onOpenShiftContent} onOpenTranscript={onOpenTranscript} onOpenTranscriptBulkImport={onOpenTranscriptBulkImport} />}
        {activeTab === 'home' && <HomeTab />}
        {activeTab === 'insert' && <InsertTab onOpenInsertBetween={onOpenInsertBetween} onOpenPeriodLabels={onOpenPeriodLabels} />}
        {activeTab === 'arrange' && <ArrangeTab onOpenOverlapCheck={onOpenOverlapCheck} />}
        {activeTab === 'view' && <ViewTab onOpenPeriodSettings={onOpenPeriodSettings} onOpenPeriodLabels={onOpenPeriodLabels} />}
        {activeTab === 'help' && <HelpTab onOpenWizard={onOpenWizard} onOpenChangelog={openChangelog} unseen={unseen} />}
      </div>
      <ChangelogDialog open={changelogOpen} onClose={() => setChangelogOpen(false)} />
    </div>
  );
}

// 言語切替ボタンの表示フラグ。
// 2026-09-05: en の翻訳がリボンタブ名など 15 語だけで、English に切り替えると
// 大半が日本語のまま残り「壊れて見える」状態になる（2026-09-20 TEA 国際集会の
// ハンズオンで参加者が触るため）。翻訳を主要 UI（SettingsDialog / PropertyPanel /
// 各ダイアログ）まで広げたら true に戻す。i18n の基盤（i18next / locales）は
// そのまま残してある。
const SHOW_LOCALE_TOGGLE = true;

// 画面の言語の切り替え（利用者の好み。ブラウザに保存し、図のファイルは変えない）
function LocaleToggle() {
  const { i18n } = useTranslation();
  const lang: UILanguage = i18n.language === 'en' ? 'en' : 'ja';
  // 言語の切り替えボタンは両方の言語で書く（訳さない）
  const toggleTitle = 'Language / 言語'; // i18n-ok
  const toggleLabel = lang === 'ja' ? '日本語 / English' : 'English / 日本語'; // i18n-ok
  return (
    <button
      className="ribbon-btn-small"
      onClick={() => {
        const next: UILanguage = lang === 'ja' ? 'en' : 'ja';
        saveUILanguage(next);
        void i18n.changeLanguage(next);
      }}
      title={toggleTitle}
    >
      {toggleLabel}
    </button>
  );
}

function LayoutToggle() {
  const layout = useTEMStore((s) => s.doc.settings.layout);
  const setLayout = useTEMStore((s) => s.setLayout);
  const isHorizontal = layout === 'horizontal';
  const { t } = useTranslation('ribbon');
  return (
    <div className="layout-toggle" role="group" aria-label={t('layout.group')}>
      <button
        className={`layout-toggle-btn ${isHorizontal ? 'active' : ''}`}
        onClick={() => setLayout('horizontal')}
        title={t('layout.horizontal.title')}
      >
        <span className="layout-icon">⇨</span>
        <span>{t('layout.horizontal')}</span>
      </button>
      <button
        className={`layout-toggle-btn ${!isHorizontal ? 'active' : ''}`}
        onClick={() => setLayout('vertical')}
        title={t('layout.vertical.title')}
      >
        <span className="layout-icon">⇩</span>
        <span>{t('layout.vertical')}</span>
      </button>
    </div>
  );
}

function SaveButton({ onSave }: { onSave: () => void }) {
  const dirty = useTEMStore((s) => s.dirty);
  const { t } = useTranslation('ribbon');
  return (
    <button className="ribbon-btn-primary" onClick={onSave} title={t('save.title', { key: shortcutLabel('Ctrl+S') })}>
      {dirty ? t('save.dirty') : t('save')}
    </button>
  );
}

// ---------------------------------------------------------------------------

function FileTab({ onSave, onSaveAs, onOpen, onOpenAsNewSheets, onNew, onOpenExport, onOpenPaperReport, onOpenCSVImport, onCSVExport, onOpenSettings, onOpenResize, onOpenShiftContent, onOpenTranscript, onOpenTranscriptBulkImport }: {
  onSave: () => void;
  onSaveAs: () => void;
  onOpen: () => void;
  onOpenAsNewSheets: () => void;
  onNew: () => void;
  onOpenExport: () => void;
  onOpenPaperReport: () => void;
  onOpenCSVImport: () => void;
  onCSVExport: () => void;
  onOpenSettings: () => void;
  onOpenResize: () => void;
  onOpenShiftContent: () => void;
  onOpenTranscript: () => void;
  onOpenTranscriptBulkImport: () => void;
}) {
  const { t } = useTranslation('ribbon');
  return (
    <>
      <RibbonGroup title={t('file.group.file')}>
        <RibbonButton label={t('file.new', { key: shortcutLabel('Ctrl+N') })} icon="📄" onClick={onNew} title={t('file.new.title')} />
        <RibbonButton label={t('file.open', { key: shortcutLabel('Ctrl+O') })} icon="📂" onClick={onOpen} title={t('file.open.title')} />
        <RibbonButton label={t('file.openAsSheets')} icon="📂+" onClick={onOpenAsNewSheets} title={t('file.openAsSheets.title')} />
        <RibbonButton label={t('file.save', { key: shortcutLabel('Ctrl+S') })} icon="💾" onClick={onSave} />
        <RibbonButton label={t('file.saveAs')} icon="💾+" onClick={onSaveAs} />
        <RibbonButton label={t('file.resize')} icon="⤡" onClick={onOpenResize} title={t('file.resize.title')} />
        <RibbonButton label={t('file.shift')} icon="✥" onClick={onOpenShiftContent} title={t('file.shift.title')} />
      </RibbonGroup>
      <RibbonGroup title={t('file.group.import')}>
        <RibbonButton label={t('file.importTable')} icon="📥" onClick={onOpenCSVImport} title={t('file.importTable.title')} />
        <RibbonButton label={t('file.transcript')} icon="📖" onClick={onOpenTranscript} title={t('file.transcript.title')} />
        <RibbonButton label={t('file.transcriptBulk')} icon="📦" onClick={onOpenTranscriptBulkImport} title={t('file.transcriptBulk.title')} />
      </RibbonGroup>
      <RibbonGroup title={t('file.group.export')}>
        <RibbonButton label={t('file.export')} icon="📤" onClick={onOpenExport} title={t('file.export.title')} />
        <RibbonButton label={t('file.csvExport')} icon="📑" onClick={onCSVExport} title={t('file.csvExport.title')} />
        <RibbonButton label={t('file.paperReport')} icon="📝" onClick={onOpenPaperReport} title={t('file.paperReport.title')} />
      </RibbonGroup>
      <RibbonGroup title={t('file.group.env')}>
        <RibbonButton label={t('file.settings')} icon="⚙" onClick={onOpenSettings} title={t('file.settings.title')} />
      </RibbonGroup>
    </>
  );
}

function HomeTab() {
  const copyToClipboard = useTEMStore((s) => s.copyToClipboard);
  const pasteFromClipboard = useTEMStore((s) => s.pasteFromClipboard);
  const selection = useTEMStore((s) => s.selection);
  const removeBoxes = useTEMStore((s) => s.removeBoxes);
  const removeLines = useTEMStore((s) => s.removeLines);
  const removeSDSG = useTEMStore((s) => s.removeSDSG);
  const getClipboardInfo = useTEMStore((s) => s.getClipboardInfo);
  // クリップボード実体はストア外のモジュール変数なので、バージョンを購読して再評価する
  const clipboardVersion = useTEMStore((s) => s.clipboardVersion);
  const clipboardCount = useMemo(() => {
    const info = getClipboardInfo();
    return info.boxCount + info.lineCount + info.sdsgCount;
  }, [getClipboardInfo, clipboardVersion]);
  const selectedCount =
    selection.boxIds.length + selection.lineIds.length + selection.sdsgIds.length;
  const canvasMode = useTEMStore((s) => s.view.canvasMode);
  const setCanvasMode = useTEMStore((s) => s.setCanvasMode);
  const { t } = useTranslation('ribbon');

  const handleDelete = () => {
    // Delete キー（App.tsx）と同じ範囲を消す。SD/SG が消えないと挙動が食い違う
    if (selection.boxIds.length > 0) removeBoxes(selection.boxIds);
    if (selection.lineIds.length > 0) removeLines(selection.lineIds);
    if (selection.sdsgIds.length > 0) selection.sdsgIds.forEach((id) => removeSDSG(id));
  };

  return (
    <>
      <RibbonGroup title={t('home.group.mode')}>
        <RibbonButton
          label={`${t('home.move')}${canvasMode === 'move' ? ' ✓' : ''}`}
          icon="✋"
          onClick={() => setCanvasMode('move')}
          title={t('home.move.title')}
          active={canvasMode === 'move'}
        />
        <RibbonButton
          label={`${t('home.pointer')}${canvasMode === 'pointer' ? ' ✓' : ''}`}
          icon="➤"
          onClick={() => setCanvasMode('pointer')}
          title={t('home.pointer.title')}
          active={canvasMode === 'pointer'}
        />
        <RibbonButton
          label={`${t('home.select')}${canvasMode === 'select' ? ' ✓' : ''}`}
          icon="⊡"
          onClick={() => setCanvasMode('select')}
          title={t('home.select.title')}
          active={canvasMode === 'select'}
        />
      </RibbonGroup>
      <RibbonGroup title={t('home.group.basic')}>
        <RibbonButton label={t('home.undo', { key: shortcutLabel('Ctrl+Z') })} icon="↶" onClick={() => useTEMStore.temporal.getState().undo()} />
        <RibbonButton label={t('home.redo', { key: shortcutLabel('Ctrl+Y', 'Ctrl+Shift+Z') })} icon="↷" onClick={() => useTEMStore.temporal.getState().redo()} />
        <RibbonButton
          label={t('home.copy')}
          icon="📋"
          onClick={copyToClipboard}
          disabled={selectedCount === 0}
          title={selectedCount > 0 ? t('home.copy.title', { count: selectedCount }) : t('home.noSelection')}
        />
        <RibbonButton
          label={t('home.paste')}
          icon="📥"
          onClick={() => pasteFromClipboard()}
          disabled={clipboardCount === 0}
          title={clipboardCount > 0 ? t('home.paste.title', { count: clipboardCount }) : t('home.paste.empty')}
        />
        <RibbonButton
          label={t('home.delete')}
          icon="🗑"
          onClick={handleDelete}
          disabled={selectedCount === 0}
          title={selectedCount > 0 ? t('home.delete.title', { count: selectedCount }) : t('home.noSelection')}
        />
      </RibbonGroup>
      <RibbonGroup title={t('home.group.edit')}>
        <RibbonButton label={t('home.selectAll')} icon="☰" onClick={() => useTEMStore.getState().selectAll()} />
        <RibbonButton
          label={t('home.duplicate')}
          icon="⎘"
          onClick={() => { copyToClipboard(); pasteFromClipboard(); }}
          disabled={selectedCount === 0}
          title={selectedCount > 0 ? t('home.duplicate.title', { count: selectedCount }) : t('home.noSelection')}
        />
        <RibbonButton
          label={t('home.fitBoth')}
          icon="↔↕"
          onClick={() => {
            const ids = useTEMStore.getState().selection.boxIds;
            if (ids.length === 0) {
              alert(t('alert.selectBox'));
              return;
            }
            useTEMStore.getState().fitBoxesToLabel(ids, 'both');
          }}
          title={t('home.fitBoth.title')}
        />
        <RibbonButton
          label={t('home.fitWidth')}
          icon="↔Aa"
          onClick={() => {
            const ids = useTEMStore.getState().selection.boxIds;
            if (ids.length === 0) {
              alert(t('alert.selectBox'));
              return;
            }
            useTEMStore.getState().fitBoxesToLabel(ids, 'width');
          }}
          title={t('home.fitWidth.title')}
        />
        <RibbonButton
          label={t('home.fitHeight')}
          icon="↕Aa"
          onClick={() => {
            const ids = useTEMStore.getState().selection.boxIds;
            if (ids.length === 0) {
              alert(t('alert.selectBox'));
              return;
            }
            useTEMStore.getState().fitBoxesToLabel(ids, 'height');
          }}
          title={t('home.fitHeight.title')}
        />
        <SwapBoxesButton />
        <SwapBoxesFullButton />
        <ShiftAfterButton />
      </RibbonGroup>
    </>
  );
}

// ============================================================================
// 整理タブ - 整列・サイズ / 順序
// ============================================================================
function ArrangeTab({ onOpenOverlapCheck }: { onOpenOverlapCheck: () => void }) {
  const selection = useTEMStore((s) => s.selection);
  const bringToFront = useTEMStore((s) => s.bringToFront);
  const sendToBack = useTEMStore((s) => s.sendToBack);
  const bringForward = useTEMStore((s) => s.bringForward);
  const sendBackward = useTEMStore((s) => s.sendBackward);
  const firstSelectedId = selection.boxIds[0] ?? selection.lineIds[0];
  const { t } = useTranslation('ribbon');

  return (
    <>
      <RibbonGroup title={t('arrange.group.align')}>
        <AlignButton type="left" />
        <AlignButton type="center-h" />
        <AlignButton type="right" />
        <AlignButton type="top" />
        <AlignButton type="middle" />
        <AlignButton type="bottom" />
        <AlignButton type="distribute-h" />
        <RibbonButton
          label={t('arrange.matchWidth')}
          icon="↔"
          title={t('arrange.matchWidth.title')}
          onClick={() => {
            const ids = useTEMStore.getState().selection.boxIds;
            if (ids.length < 2) { alert(t('alert.selectTwoOrMore')); return; }
            useTEMStore.getState().matchBoxesSize(ids, 'width');
          }}
        />
        <RibbonButton
          label={t('arrange.matchHeight')}
          icon="↕"
          title={t('arrange.matchHeight.title')}
          onClick={() => {
            const ids = useTEMStore.getState().selection.boxIds;
            if (ids.length < 2) { alert(t('alert.selectTwoOrMore')); return; }
            useTEMStore.getState().matchBoxesSize(ids, 'height');
          }}
        />
        <RibbonButton
          label={t('arrange.matchSize')}
          icon="▭"
          title={t('arrange.matchSize.title')}
          onClick={() => {
            const ids = useTEMStore.getState().selection.boxIds;
            if (ids.length < 2) { alert(t('alert.selectTwoOrMore')); return; }
            useTEMStore.getState().matchBoxesSize(ids, 'both');
          }}
        />
        <RibbonButton
          label={t('arrange.matchFontSize')}
          icon="Aa"
          title={t('arrange.matchFontSize.title')}
          onClick={() => {
            const ids = useTEMStore.getState().selection.boxIds;
            if (ids.length < 2) { alert(t('alert.selectTwoOrMore')); return; }
            useTEMStore.getState().matchBoxesFontSize(ids);
          }}
        />
      </RibbonGroup>
      <RibbonGroup title={t('arrange.group.check')}>
        <RibbonButton
          label={t('arrange.overlap')}
          icon="⚠"
          title={t('arrange.overlap.title')}
          onClick={onOpenOverlapCheck}
        />
      </RibbonGroup>
      <RibbonGroup title={t('arrange.group.order')}>
        <RibbonButton label={t('arrange.toFront')} icon="⬆⬆" onClick={() => firstSelectedId && bringToFront(firstSelectedId)} />
        <RibbonButton label={t('arrange.forward')} icon="⬆" onClick={() => firstSelectedId && bringForward(firstSelectedId)} />
        <RibbonButton label={t('arrange.backward')} icon="⬇" onClick={() => firstSelectedId && sendBackward(firstSelectedId)} />
        <RibbonButton label={t('arrange.toBack')} icon="⬇⬇" onClick={() => firstSelectedId && sendToBack(firstSelectedId)} />
      </RibbonGroup>
    </>
  );
}

function SwapBoxesButton() {
  const selection = useTEMStore((s) => s.selection);
  const swapBoxes = useTEMStore((s) => s.swapBoxes);
  const { t } = useTranslation('ribbon');

  const canSwap = selection.boxIds.length === 2;

  const handleSwap = () => {
    if (!canSwap) {
      alert(t('alert.selectTwoBoxes'));
      return;
    }
    swapBoxes(selection.boxIds[0], selection.boxIds[1]);
  };

  return (
    <RibbonButton
      label={`${t('home.swap')}${canSwap ? '' : '*'}`}
      icon="⇄"
      onClick={handleSwap}
    />
  );
}

function ShiftAfterButton() {
  const selection = useTEMStore((s) => s.selection);
  const shiftBoxesAfter = useTEMStore((s) => s.shiftBoxesAfter);
  const { t } = useTranslation('ribbon');

  const canShift = selection.boxIds.length === 1;

  const handleShift = () => {
    if (!canShift) {
      alert(t('alert.selectBaseBox'));
      return;
    }
    const input = prompt(t('prompt.shiftLevels'), '1');
    if (input === null) return;
    const delta = Number(input);
    if (isNaN(delta) || delta === 0) {
      alert(t('alert.nonZero'));
      return;
    }
    shiftBoxesAfter(selection.boxIds[0], delta);
  };

  return (
    <RibbonButton
      label={`${t('home.shiftAfter')}${canShift ? '' : '*'}`}
      icon="⇉"
      onClick={handleShift}
    />
  );
}

function SwapBoxesFullButton() {
  const selection = useTEMStore((s) => s.selection);
  const swapBoxesFullLinks = useTEMStore((s) => s.swapBoxesFullLinks);
  const { t } = useTranslation('ribbon');

  const canSwap = selection.boxIds.length === 2;

  const handleSwap = () => {
    if (!canSwap) {
      alert(t('alert.selectTwoBoxes'));
      return;
    }
    swapBoxesFullLinks(selection.boxIds[0], selection.boxIds[1]);
  };

  return (
    <RibbonButton
      label={`${t('home.swapFull')}${canSwap ? '' : '*'}`}
      icon="⇆"
      onClick={handleSwap}
    />
  );
}

function AlignButton({ type }: { type: 'left' | 'center-h' | 'right' | 'top' | 'middle' | 'bottom' | 'distribute-h' }) {
  const selection = useTEMStore((s) => s.selection);
  const updateBox = useTEMStore((s) => s.updateBox);
  const doc = useTEMStore((s) => s.doc);
  const { t } = useTranslation('ribbon');

  // 文言は ribbon.csv の align.<type>
  const icons: Record<typeof type, string> = {
    'left': '⇤',
    'center-h': '≡',
    'right': '⇥',
    'top': '⤒',
    'middle': '≣',
    'bottom': '⤓',
    'distribute-h': '⇔',
  };
  const label = t(`align.${type}`);
  const icon = icons[type];

  const handleAlign = () => {
    if (selection.boxIds.length < 2) return;
    const sheet = doc.sheets.find((s) => s.id === doc.activeSheetId);
    if (!sheet) return;
    const boxes = sheet.boxes.filter((b) => selection.boxIds.includes(b.id));
    if (boxes.length < 2) return;

    if (type === 'left') {
      const minX = Math.min(...boxes.map((b) => b.x));
      boxes.forEach((b) => updateBox(b.id, { x: minX }));
    } else if (type === 'right') {
      const maxR = Math.max(...boxes.map((b) => b.x + b.width));
      boxes.forEach((b) => updateBox(b.id, { x: maxR - b.width }));
    } else if (type === 'center-h') {
      const centers = boxes.map((b) => b.x + b.width / 2);
      const avg = centers.reduce((a, c) => a + c, 0) / centers.length;
      boxes.forEach((b) => updateBox(b.id, { x: avg - b.width / 2 }));
    } else if (type === 'top') {
      const minY = Math.min(...boxes.map((b) => b.y));
      boxes.forEach((b) => updateBox(b.id, { y: minY }));
    } else if (type === 'bottom') {
      const maxB = Math.max(...boxes.map((b) => b.y + b.height));
      boxes.forEach((b) => updateBox(b.id, { y: maxB - b.height }));
    } else if (type === 'middle') {
      const centers = boxes.map((b) => b.y + b.height / 2);
      const avg = centers.reduce((a, c) => a + c, 0) / centers.length;
      boxes.forEach((b) => updateBox(b.id, { y: avg - b.height / 2 }));
    } else if (type === 'distribute-h') {
      const sorted = [...boxes].sort((a, b) => a.x - b.x);
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      const totalWidth = last.x + last.width - first.x;
      const gaps = (totalWidth - sorted.reduce((acc, b) => acc + b.width, 0)) / (sorted.length - 1);
      let cur = first.x;
      sorted.forEach((b, i) => {
        if (i === 0) { cur = first.x + b.width + gaps; return; }
        if (i === sorted.length - 1) return;
        updateBox(b.id, { x: cur });
        cur += b.width + gaps;
      });
    }
  };

  return <RibbonButton label={label} icon={icon} onClick={handleAlign} />;
}

function InsertTab({ onOpenInsertBetween, onOpenPeriodLabels }: { onOpenInsertBetween: () => void; onOpenPeriodLabels: () => void }) {
  const addBox = useTEMStore((s) => s.addBox);
  const selection = useTEMStore((s) => s.selection);
  const addSequentialLines = useTEMStore((s) => s.addSequentialLines);
  const addSDSG = useTEMStore((s) => s.addSDSG);
  const addNote = useTEMStore((s) => s.addNote);
  const boxTypes: BoxType[] = ['normal', 'annotation', 'BFP', 'EFP', 'P-EFP', 'OPP', 'other'];
  const { t } = useTranslation('ribbon');

  // 選択数で自動分岐:
  //   Box 0 + Line 0 → エラー
  //   Box 0 + Line 1+ → single (Line 先頭)
  //   Box 1            → single
  //   Box 2            → between (両 Box)
  //   Box 3+           → between (Time レベル最小・最大の 2 Box)
  const handleAddSDSG = (type: 'SD' | 'SG') => {
    const st = useTEMStore.getState();
    const sheet = st.doc.sheets.find((s) => s.id === st.doc.activeSheetId);
    const isH = st.doc.settings.layout === 'horizontal';
    const { boxIds, lineIds } = selection;

    if (boxIds.length === 0 && lineIds.length === 0) {
      alert(t('alert.selectBoxOrLine'));
      return;
    }

    // Box 0 個 + Line のみ → single (先頭 Line)
    if (boxIds.length === 0) {
      addSDSG({ type, attachedTo: lineIds[0], label: type });
      return;
    }

    // Box 1 個 → single
    if (boxIds.length === 1) {
      addSDSG({ type, attachedTo: boxIds[0], label: type });
      return;
    }

    // Box 2+ 個 → between
    // 3 個以上は Time レベル（横型=x / 縦型=y）の最小・最大 Box を採用
    if (!sheet) return;
    const selectedBoxes = sheet.boxes.filter((b) => boxIds.includes(b.id));
    const pair = pickBetweenAnchors(selectedBoxes, isH);
    if (!pair) return;
    addSDSG({
      type,
      attachedTo: pair.lowBoxId,
      attachedTo2: pair.highBoxId,
      anchorMode: 'between',
      betweenMode: 'edge-to-edge',
      label: type,
    });
  };

  // 1 ボタンで Box 2 個 = 単線、3 個以上 = 選択順に順次接続。
  const handleSequentialArrow = (type: 'RLine' | 'XLine') => {
    if (selection.boxIds.length < 2) {
      alert(t('alert.selectTwoOrMoreForArrow'));
      return;
    }
    addSequentialLines(selection.boxIds, type);
  };

  return (
    <>
      <RibbonGroup title="Box">
        {boxTypes.map((type) => (
          <RibbonButton
            key={type}
            label={t(`terms:boxType.${type}`)}
            icon={getIconForBoxType(type)}
            onClick={() => addBox({ type, label: t(`terms:boxType.${type}`) })}
          />
        ))}
      </RibbonGroup>
      <RibbonGroup title={t('insert.group.note')}>
        <RibbonButton
          label={t('insert.note')}
          icon="✎"
          title={t('insert.note.title')}
          onClick={() => addNote()}
        />
        <RibbonButton
          label={t('insert.symbol')}
          icon="★"
          title={t('insert.symbol.title')}
          onClick={() => {
            const st = useTEMStore.getState();
            const sh = st.doc.sheets.find((s) => s.id === st.doc.activeSheetId);
            const box = sh?.boxes.find((b) => st.selection.boxIds.includes(b.id));
            addNote({
              style: 'text', text: '★', fontSize: 24, width: 36, height: 36,
              ...(box ? { x: box.x + box.width - 18, y: box.y - 18 } : {}),
            });
          }}
        />
      </RibbonGroup>
      <RibbonGroup title={t('insert.group.between')}>
        <RibbonButton label={t('insert.between')} icon="↔+" onClick={onOpenInsertBetween} />
      </RibbonGroup>
      <RibbonGroup title={t('insert.group.line')}>
        <RibbonButton label={t('terms:line.RLine')} icon="→" onClick={() => handleSequentialArrow('RLine')} title={t('insert.arrow.title')} />
        <RibbonButton label={t('terms:line.XLine')} icon="⇢" onClick={() => handleSequentialArrow('XLine')} title={t('insert.arrow.title')} />
      </RibbonGroup>
      <RibbonGroup title={t('insert.group.sdsgCreate')}>
        <RibbonButton label={t('insert.addSD')} icon="▽" onClick={() => handleAddSDSG('SD')} title={t('insert.sdsg.title')} />
        <RibbonButton label={t('insert.addSG')} icon="△" onClick={() => handleAddSDSG('SG')} title={t('insert.sdsg.title')} />
      </RibbonGroup>
      <RibbonGroup title={t('insert.group.sdsgPlace')}>
        <RibbonButton
          label={t('insert.togglePlacement')}
          icon="☰⇄"
          onClick={() => {
            const st = useTEMStore.getState();
            const ids = st.selection.sdsgIds;
            if (ids.length === 0) { alert(t('alert.selectSDSG')); return; }
            const sheet = st.doc.sheets.find((s) => s.id === st.doc.activeSheetId);
            if (!sheet) return;
            const selected = sheet.sdsg.filter((s) => ids.includes(s.id));
            // 1 つでも attached（または未指定）が含まれていれば全体を band へ。
            // 全部 band なら attached に戻す（トグル動作）。
            const hasAttached = selected.some((s) => !s.spaceMode || s.spaceMode === 'attached');
            if (hasAttached) {
              const sdIds: string[] = [];
              const sgIds: string[] = [];
              selected.forEach((s) => {
                if (s.type === 'SD') sdIds.push(s.id);
                else sgIds.push(s.id);
              });
              if (sdIds.length > 0) st.setSDSGSpaceMode(sdIds, 'band-top');
              if (sgIds.length > 0) st.setSDSGSpaceMode(sgIds, 'band-bottom');
            } else {
              st.setSDSGSpaceMode(ids, 'attached');
            }
          }}
          title={t('insert.togglePlacement.title')}
        />
      </RibbonGroup>
      <RibbonGroup title={t('insert.group.other')}>
        <RibbonButton label={t('insert.periodLabels')} icon="🏷" onClick={onOpenPeriodLabels} />
      </RibbonGroup>
    </>
  );
}

function getIconForBoxType(type: BoxType): string {
  switch (type) {
    case 'normal': return '□';
    case 'BFP': return '◇';
    case 'EFP': return '⊟';
    case 'P-EFP': return '⚃';
    case 'OPP': return '▣';
    case 'annotation': return '◈';
    case 'other': return '▢';
    default: return '□';
  }
}

function ViewTab({ onOpenPeriodSettings, onOpenPeriodLabels: _onOpenPeriodLabels }: { onOpenPeriodSettings: () => void; onOpenPeriodLabels: () => void }) {
  const view = useTEMStore((s) => s.view);
  const toggleGrid = useTEMStore((s) => s.toggleGrid);
  const toggleHandles = useTEMStore((s) => s.toggleHandles);
  const toggleSnap = useTEMStore((s) => s.toggleSnap);
  const togglePaperGuides = useTEMStore((s) => s.togglePaperGuides);
  const toggleDataSheet = useTEMStore((s) => s.toggleDataSheet);
  const togglePropertyPanel = useTEMStore((s) => s.togglePropertyPanel);
  const toggleCommentMode = useTEMStore((s) => s.toggleCommentMode);
  const toggleBoxIds = useTEMStore((s) => s.toggleBoxIds);
  const toggleSDSGIds = useTEMStore((s) => s.toggleSDSGIds);
  const toggleLineIds = useTEMStore((s) => s.toggleLineIds);
  const toggleAllIds = useTEMStore((s) => s.toggleAllIds);
  const toggleTopRuler = useTEMStore((s) => s.toggleTopRuler);
  const toggleLeftRuler = useTEMStore((s) => s.toggleLeftRuler);
  const toggleLegend = useTEMStore((s) => s.toggleLegend);
  const requestFit = useTEMStore((s) => s.requestFit);
  const { t } = useTranslation('ribbon');
  // 入のときはボタンの名前の後ろに ✓ を付ける
  const on = (label: string, active: boolean) => (active ? `${label} ✓` : label);
  const legendVisible = useTEMStore((s) => s.doc.settings.legend.alwaysVisible);
  const togglePeriodLabels = useTEMStore((s) => s.togglePeriodLabels);
  const periodLabelsVisible = useTEMStore((s) => s.doc.settings.periodLabels.alwaysVisible);
  const timeArrowVisible = useTEMStore((s) => s.doc.settings.timeArrow.alwaysVisible);
  const typeLabelVisibility = useTEMStore((s) => s.doc.settings.typeLabelVisibility);
  const sdsgSpaceEnabled = useTEMStore((s) => s.doc.settings.sdsgSpace?.enabled ?? false);
  const toggleSDSGSpace = () => {
    useTEMStore.setState((state) => ({
      doc: {
        ...state.doc,
        settings: {
          ...state.doc.settings,
          sdsgSpace: state.doc.settings.sdsgSpace
            ? { ...state.doc.settings.sdsgSpace, enabled: !state.doc.settings.sdsgSpace.enabled }
            : state.doc.settings.sdsgSpace,
        },
      },
    }));
  };
  const toggleTimeArrow = () => {
    useTEMStore.setState((state) => ({
      doc: {
        ...state.doc,
        settings: {
          ...state.doc.settings,
          timeArrow: {
            ...state.doc.settings.timeArrow,
            alwaysVisible: !state.doc.settings.timeArrow.alwaysVisible,
          },
        },
      },
    }));
  };

  // すべてのタイプラベルが表示されていれば「ON」、1つでも非表示なら「OFF」とみなし
  // クリックで全てをその逆にトグル
  const allTypeLabelsOn =
    typeLabelVisibility &&
    (Object.keys(typeLabelVisibility) as (keyof typeof typeLabelVisibility)[])
      .every((k) => typeLabelVisibility[k] !== false);
  const toggleAllTypeLabels = () => {
    const nextVal = !allTypeLabelsOn;
    useTEMStore.setState((state) => ({
      doc: {
        ...state.doc,
        settings: {
          ...state.doc.settings,
          typeLabelVisibility: {
            BFP: nextVal,
            EFP: nextVal,
            'P-EFP': nextVal,
            OPP: nextVal,
            '2nd-EFP': nextVal,
            'P-2nd-EFP': nextVal,
            SD: nextVal,
            SG: nextVal,
          },
        },
      },
    }));
  };

  return (
    <>
      <RibbonGroup title={t('view.group.display')}>
        <RibbonButton label={on(t('view.grid'), view.showGrid)} icon="⊞" onClick={toggleGrid} active={view.showGrid} />
        <RibbonButton
          label={on(t('view.handles'), view.showHandles ?? true)}
          icon="⦿"
          onClick={toggleHandles}
          active={view.showHandles ?? true}
          title={t('view.handles.title')}
        />
        <RibbonButton label={on(t('view.snap'), view.snapEnabled)} icon="⊡" onClick={toggleSnap} active={view.snapEnabled} />
        <RibbonButton label={on(t('view.paperGuides'), view.showPaperGuides)} icon="▭" onClick={togglePaperGuides} active={view.showPaperGuides} />
        {(() => {
          const anyIdOn = view.showBoxIds || view.showSDSGIds || view.showLineIds;
          const allIdOn = view.showBoxIds && view.showSDSGIds && view.showLineIds;
          const label = allIdOn ? 'ID ✓' : anyIdOn ? 'ID …' : 'ID';
          return (
            <RibbonButton
              label={label}
              icon="🏷"
              onClick={toggleAllIds}
              active={anyIdOn}
              title={t('view.ids.title', { box: view.showBoxIds ? 'ON' : 'OFF', sdsg: view.showSDSGIds ? 'ON' : 'OFF', line: view.showLineIds ? 'ON' : 'OFF' })}
            />
          );
        })()}
        <RibbonButton label={view.showBoxIds ? 'Box-ID ✓' : 'Box-ID'} icon="🔖" onClick={toggleBoxIds} active={view.showBoxIds} title={t('view.boxIds.title')} />
        <RibbonButton label={view.showSDSGIds ? 'SDSG-ID ✓' : 'SDSG-ID'} icon="🔖" onClick={toggleSDSGIds} active={view.showSDSGIds} title={t('view.sdsgIds.title')} />
        <RibbonButton label={view.showLineIds ? 'Line-ID ✓' : 'Line-ID'} icon="🔖" onClick={toggleLineIds} active={view.showLineIds} title={t('view.lineIds.title')} />
        <RibbonButton label={on(t('view.topRuler'), view.showTopRuler)} icon="📏" onClick={toggleTopRuler} active={view.showTopRuler} />
        <RibbonButton label={on(t('view.leftRuler'), view.showLeftRuler)} icon="📐" onClick={toggleLeftRuler} active={view.showLeftRuler} />
        <RibbonButton
          label={on(t('view.typeLabels'), !!allTypeLabelsOn)}
          icon="🅰"
          onClick={toggleAllTypeLabels}
          title={t('view.typeLabels.title')}
          active={!!allTypeLabelsOn}
        />
        <RibbonButton
          label={on(t('view.sdsgBand'), sdsgSpaceEnabled)}
          icon="▤"
          onClick={toggleSDSGSpace}
          title={t('view.sdsgBand.title')}
          active={sdsgSpaceEnabled}
        />
      </RibbonGroup>
      <RibbonGroup title={t('view.group.elements')}>
        <RibbonButton label={on(t('terms:timeArrow'), timeArrowVisible)} icon="→" onClick={toggleTimeArrow} active={timeArrowVisible} />
        <RibbonButton label={on(t('terms:legend'), legendVisible)} icon="📋" onClick={toggleLegend} active={legendVisible} />
        <RibbonButton label={on(t('view.periods'), periodLabelsVisible)} icon="🏷" onClick={togglePeriodLabels} active={periodLabelsVisible} />
        <RibbonButton label={t('view.periodEdit')} icon="📝" onClick={onOpenPeriodSettings} title={t('view.periodEdit.title')} />
      </RibbonGroup>
      <RibbonGroup title={t('view.group.panels')}>
        <RibbonButton label={on(t('view.data'), view.dataSheetVisible)} icon="🗂" onClick={toggleDataSheet} />
        <RibbonButton label={on(t('view.properties'), view.propertyPanelVisible)} icon="⚙" onClick={togglePropertyPanel} />
        <RibbonButton label={on(t('view.comments'), view.commentMode)} icon="💬" onClick={toggleCommentMode} />
      </RibbonGroup>
      <RibbonGroup title={t('view.group.fit')}>
        <RibbonButton label={t('view.fitAll')} icon="🔳" onClick={() => requestFit('all')} title={t('view.fitAll.title')} />
        <RibbonButton label={t('view.fitWidth')} icon="↔" onClick={() => requestFit('width')} title={t('view.fitWidth.title')} />
        <RibbonButton label={t('view.fitHeight')} icon="↕" onClick={() => requestFit('height')} title={t('view.fitHeight.title')} />
      </RibbonGroup>
    </>
  );
}

function HelpTab({ onOpenWizard, onOpenChangelog, unseen }: { onOpenWizard?: () => void; onOpenChangelog: () => void; unseen: boolean }) {
  const { t } = useTranslation('ribbon');
  return (
    <RibbonGroup title={t('help.group.support')}>
      <RibbonButton label={t('help.wizard')} icon="🪄" onClick={onOpenWizard} title={t('help.wizard.title')} />
      <RibbonButton label={t('help.tour')} icon="🎓" disabled title={t('help.tour.title')} />
      <RibbonButton
        label={t('help.manual')}
        icon="📘"
        title={t('help.manual.title')}
        onClick={() => window.open(t('help.manual.url'), '_blank', 'noopener')}
      />
      <RibbonButton label={t('help.video')} icon="🎬" disabled title={t('help.video.title')} />
      <RibbonButton label={unseen ? t('help.changelog.unseen') : t('help.changelog')} icon="📰" onClick={onOpenChangelog} title={t('help.changelog.title')} active={unseen} />
      <RibbonButton label={t('help.about')} icon="ℹ" onClick={() => alert(t('help.about.message', { version: 'v0.2.0' }))} />
    </RibbonGroup>
  );
}

// ---------------------------------------------------------------------------

function RibbonGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="ribbon-group">
      <div className="ribbon-group-items">{children}</div>
      <div className="ribbon-group-title">{title}</div>
    </div>
  );
}

function RibbonButton({
  label,
  icon,
  onClick,
  title,
  active,
  disabled,
}: {
  label: string;
  icon: string;
  onClick?: () => void;
  title?: string;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      className={active ? 'ribbon-btn active' : 'ribbon-btn'}
      onClick={onClick}
      title={title ?? label}
      disabled={disabled}
      style={disabled ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
    >
      <span className="ribbon-btn-icon">{icon}</span>
      <span className="ribbon-btn-label">{label}</span>
    </button>
  );
}
