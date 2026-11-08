// ============================================================================
// Settings Dialog - タブ化した設定モーダル
// タブ: 全体 / スナップ / 時間矢印 / 凡例 / 時期ラベル / プロジェクト
// ============================================================================

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTEMStore, useActiveSheet } from '../store/store';
import { produce } from 'immer';
import type {
  TimeArrowSettings,
  LegendSettings,
  PeriodLabelSettings,
  PeriodLabelBandStyle,
  LegendBackgroundStyle,
  LegendItemOverride,
  LegendTitleAlign,
  LegendTitlePosition,
  LegendTitleWritingMode,
  LegendTitleVerticalAlign,
  HorizontalLabelSide,
  VerticalLabelSide,
  TimeArrowLabelAlignHorizontal,
  TimeArrowLabelAlignVertical,
  TypeLabelVisibilityKey,
  BoxType,
  BoxTypePreset,
} from '../types';
import { CollapsibleSection } from './CollapsibleSection';
import { FontFamilyRow, FontSizeRow, ColorRow } from './DecorationEditor';
import { computeLegendItems } from '../utils/legend';
import { resolveLineDefaults } from '../utils/lineDefaults';
import type { PaperBaseKey } from '../types';
import {
  BUILTIN_THEMES,
  loadUserThemes,
  saveUserTheme,
  updateUserTheme,
  deleteUserTheme,
  themeToJsonString,
  parseThemesFromJson,
  type BoxStyleTheme,
} from '../utils/boxThemes';

type Tab = 'general' | 'snap' | 'typelabel' | 'boxstyle' | 'linestyle' | 'timearrow' | 'legend' | 'period' | 'sdsgspace' | 'project';

interface NavLeaf {
  key: Tab;
  /** 表示名の翻訳キー（settingsDialog.csv） */
  labelKey: string;
  /** 検索対象キーワードの翻訳キー (サブセクション・設定ラベル等) */
  keywordsKey?: string;
}
type NavItem =
  | { kind: 'item'; leaf: NavLeaf }
  | { kind: 'group'; labelKey: string; children: NavLeaf[] };

const NAV: NavItem[] = [
  { kind: 'item', leaf: { key: 'general', labelKey: 'nav.general', keywordsKey: 'nav.general.keywords' } },
  { kind: 'item', leaf: { key: 'snap', labelKey: 'nav.snap', keywordsKey: 'nav.snap.keywords' } },
  {
    kind: 'group',
    labelKey: 'nav.group.elements',
    children: [
      { key: 'boxstyle', labelKey: 'nav.boxstyle', keywordsKey: 'nav.boxstyle.keywords' },
      { key: 'linestyle', labelKey: 'nav.linestyle', keywordsKey: 'nav.linestyle.keywords' },
      { key: 'typelabel', labelKey: 'nav.typelabel', keywordsKey: 'nav.typelabel.keywords' },
      { key: 'timearrow', labelKey: 'nav.timearrow', keywordsKey: 'nav.timearrow.keywords' },
      { key: 'period', labelKey: 'nav.period', keywordsKey: 'nav.period.keywords' },
      { key: 'legend', labelKey: 'nav.legend', keywordsKey: 'nav.legend.keywords' },
      { key: 'sdsgspace', labelKey: 'nav.sdsgspace', keywordsKey: 'nav.sdsgspace.keywords' },
    ],
  },
  { kind: 'item', leaf: { key: 'project', labelKey: 'nav.project', keywordsKey: 'nav.project.keywords' } },
];

/** 言語の選択肢の名前は、その言語自身で書く（English と同じ扱い） */
const LANGUAGE_NAME_JA = '日本語'; // i18n-ok

const ALL_TABS: NavLeaf[] =NAV.flatMap((n) =>
  n.kind === 'item' ? [n.leaf] : n.children,
);

function matchesSearch(leaf: NavLeaf, q: string, tr: (key: string) => string): boolean {
  if (!q) return true;
  const lower = q.toLowerCase();
  if (tr(leaf.labelKey).toLowerCase().includes(lower)) return true;
  if (leaf.keywordsKey && tr(leaf.keywordsKey).toLowerCase().includes(lower)) return true;
  return false;
}

export function SettingsDialog({
  open,
  onClose,
  initialTab,
  tabNonce,
}: {
  open: boolean;
  onClose: () => void;
  initialTab?: string;
  // initialTab と同じ値が連続で指定されても切替を強制するためのカウンタ
  tabNonce?: number;
}) {
  const { t } = useTranslation('settingsDialog');
  // マウント時は initialTab を反映して 'general' フラッシュを避ける
  const [tab, setTab] = useState<Tab>(() =>
    initialTab && ALL_TABS.some((t) => t.key === initialTab) ? (initialTab as Tab) : 'general'
  );
  const [search, setSearch] = useState('');
  // ドラッグ位置（null = 中央配置）
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ mouseX: 0, mouseY: 0, dlgX: 0, dlgY: 0 });

  // open / initialTab / tabNonce いずれかの変化で initialTab を適用
  useEffect(() => {
    if (open && initialTab && ALL_TABS.some((t) => t.key === initialTab)) {
      setTab(initialTab as Tab);
    }
  }, [open, initialTab, tabNonce]);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.current.mouseX;
      const dy = e.clientY - dragStart.current.mouseY;
      setPos({
        x: dragStart.current.dlgX + dx,
        y: dragStart.current.dlgY + dy,
      });
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

  // ドラッグされている場合は left/top 絶対値、未ドラッグなら中央配置
  const modalStyle: React.CSSProperties = pos
    ? {
        width: 900,
        maxWidth: '95vw',
        height: 600,
        maxHeight: '85vh',
        position: 'absolute',
        left: pos.x,
        top: pos.y,
        margin: 0,
      }
    : { width: 900, maxWidth: '95vw', height: 600, maxHeight: '85vh' };

  const onHeaderMouseDown = (e: React.MouseEvent) => {
    // 子ボタン（×など）のクリックは除外
    if ((e.target as HTMLElement).closest('.modal-close')) return;
    const cur = pos ?? { x: window.innerWidth / 2 - 320, y: window.innerHeight / 2 - 200 };
    dragStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      dlgX: cur.x,
      dlgY: cur.y,
    };
    setPos(cur);
    setDragging(true);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={modalStyle}
      >
        <div
          className="modal-header"
          onMouseDown={onHeaderMouseDown}
          style={{ cursor: dragging ? 'grabbing' : 'grab', userSelect: 'none' }}
          title={t('dialog.dragToMove')}
        >
          <h3>{t('dialog.title')}</h3>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        <div className="settings-dialog-body">
          <nav className="settings-sidebar" role="tablist" aria-orientation="vertical">
            <div className="settings-sidebar-search">
              <input
                type="search"
                placeholder={t('dialog.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus={false}
              />
            </div>
            {NAV.map((n, i) => {
              if (n.kind === 'item') {
                const match = matchesSearch(n.leaf, search, t);
                return (
                  <button
                    key={n.leaf.key}
                    type="button"
                    role="tab"
                    aria-selected={tab === n.leaf.key}
                    className={
                      (tab === n.leaf.key ? 'settings-sidebar-item active' : 'settings-sidebar-item')
                      + (!match && search ? ' dimmed' : '')
                    }
                    onClick={() => setTab(n.leaf.key)}
                  >
                    {t(n.leaf.labelKey)}
                  </button>
                );
              }
              // group: show header only if any child matches (or search is empty)
              const anyChildMatches = !search || n.children.some((c) => matchesSearch(c, search, t));
              if (!anyChildMatches) return null;
              return (
                <div key={`grp-${i}`}>
                  <div className="settings-sidebar-group-header">{t(n.labelKey)}</div>
                  {n.children.map((c) => {
                    const match = matchesSearch(c, search, t);
                    return (
                      <button
                        key={c.key}
                        type="button"
                        role="tab"
                        aria-selected={tab === c.key}
                        className={
                          (tab === c.key ? 'settings-sidebar-item active' : 'settings-sidebar-item')
                          + ' is-child'
                          + (!match && search ? ' dimmed' : '')
                        }
                        onClick={() => setTab(c.key)}
                      >
                        {t(c.labelKey)}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </nav>
          <div className="settings-content-pane">
            {tab === 'general' && <GeneralSection onOpenLineTab={() => setTab('linestyle')} />}
            {tab === 'snap' && <SnapSection />}
            {tab === 'typelabel' && <TypeLabelSection />}
            {tab === 'boxstyle' && <BoxStyleSection />}
            {tab === 'linestyle' && <LineStyleSection />}
            {tab === 'timearrow' && <TimeArrowSettingsSection />}
            {tab === 'legend' && <LegendSettingsSection />}
            {tab === 'period' && <PeriodLabelSettingsSection />}
            {tab === 'sdsgspace' && <SDSGSpaceSection />}
            {tab === 'project' && <ProjectSection />}
          </div>
        </div>
        <div className="modal-footer">
          <button className="ribbon-btn-primary" onClick={onClose}>{t('dialog.close')}</button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Line（矢印）の既定スタイル: よく触る項目だけの入力群
// 「全体」タブと「Line（矢印）」タブの両方から使う（定義を 1 か所に保つ）
// ----------------------------------------------------------------------------
function LineDefaultsBasicFields() {
  const { t } = useTranslation('settingsDialog');
  const doc = useTEMStore((s) => s.doc);
  const setLineDefaults = useTEMStore((s) => s.setLineDefaults);
  const d = resolveLineDefaults(doc.settings);

  const clamp = (v: string, lo: number, hi: number, fallback: number) => {
    const n = Number(v);
    return Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : fallback));
  };

  return (
    <>
      <div className="setting-row">
        <label>{t('lineDefaults.type')}</label>
        <select
          value={d.type}
          onChange={(e) => setLineDefaults({ type: e.target.value as 'RLine' | 'XLine' })}
        >
          <option value="RLine">{t('lineDefaults.RLine')}</option>
          <option value="XLine">{t('lineDefaults.XLine')}</option>
        </select>
      </div>

      <div className="setting-row">
        <label>{t('common.shape')}</label>
        <select
          value={d.shape}
          onChange={(e) => setLineDefaults({ shape: e.target.value as 'straight' | 'elbow' | 'curve' })}
        >
          <option value="straight">{t('lineDefaults.straight')}</option>
          <option value="elbow">{t('lineDefaults.elbow')}</option>
          <option value="curve">{t('lineDefaults.curve')}</option>
        </select>
      </div>
      {d.shape === 'elbow' && (
        <div className="setting-row">
          <label>{t('lineDefaults.elbowBendRatio')}</label>
          <input
            type="number" min={0} max={1} step={0.05}
            value={d.elbowBendRatio}
            onChange={(e) => setLineDefaults({ elbowBendRatio: clamp(e.target.value, 0, 1, 0.5) })}
            title={t('lineDefaults.elbowBendRatio.tip')}
          />
        </div>
      )}
      {d.shape === 'curve' && (
        <div className="setting-row">
          <label>{t('lineDefaults.curveIntensity')}</label>
          <input
            type="number" min={0} max={1} step={0.05}
            value={d.curveIntensity}
            onChange={(e) => setLineDefaults({ curveIntensity: clamp(e.target.value, 0, 1, 0.5) })}
            title={t('lineDefaults.curveIntensity.tip')}
          />
        </div>
      )}

      <div className="setting-row">
        <label>{t('lineDefaults.color')}</label>
        <input
          type="color"
          value={d.color}
          onChange={(e) => setLineDefaults({ color: e.target.value })}
        />
      </div>
      <div className="setting-row">
        <label>{t('lineDefaults.strokeWidth')}</label>
        <input
          type="number" min={0.5} max={10} step={0.5}
          value={d.strokeWidth}
          onChange={(e) => setLineDefaults({ strokeWidth: clamp(e.target.value, 0.5, 10, 1.5) })}
        />
      </div>
    </>
  );
}

// ============================================================================
// General
// ============================================================================
function GeneralSection({ onOpenLineTab }: { onOpenLineTab?: () => void }) {
  const { t } = useTranslation('settingsDialog');
  const doc = useTEMStore((s) => s.doc);
  const setLayout = useTEMStore((s) => s.setLayout);
  const setLocale = useTEMStore((s) => s.setLocale);
  const setUIFontSize = useTEMStore((s) => s.setUIFontSize);
  const setRibbonFontSize = useTEMStore((s) => s.setRibbonFontSize);
  const ribbonFontSize = doc.settings.ribbonFontSize ?? 12;

  const updateLevelStep = (v: number) => {
    useTEMStore.setState((state) => ({
      doc: produce(state.doc, (d) => { d.settings.levelStep = v; }),
    }));
  };

  return (
    <section className="settings-section">
      <CollapsibleSection title={t('common.display')} sectionKey="settings-general-display" defaultOpen={true}>
        <div className="setting-row">
          <label>{t('common.layout')}</label>
          <select
            value={doc.settings.layout}
            onChange={(e) => setLayout(e.target.value as 'horizontal' | 'vertical')}
          >
            <option value="horizontal">{t('terms:layout.horizontal')}</option>
            <option value="vertical">{t('terms:layout.vertical')}</option>
          </select>
        </div>
        <div className="setting-row">
          <label>{t('general.language')}</label>
          <select
            value={doc.settings.locale}
            onChange={(e) => setLocale(e.target.value as 'ja' | 'en')}
          >
            <option value="ja">{LANGUAGE_NAME_JA}</option>
            <option value="en">English</option>
          </select>
        </div>
        <div className="setting-row">
          <label>{t('general.uiFontSize')}</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="range"
              min={10}
              max={40}
              value={doc.settings.uiFontSize}
              onChange={(e) => setUIFontSize(Number(e.target.value))}
              style={{ width: 120 }}
            />
            <input
              type="number"
              min={10}
              max={40}
              value={doc.settings.uiFontSize}
              onChange={(e) => setUIFontSize(Number(e.target.value))}
              style={{ width: 50 }}
            />
          </div>
        </div>
        <div className="setting-row">
          <label>{t('general.ribbonFontSize')}</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="range"
              min={8}
              max={24}
              value={ribbonFontSize}
              onChange={(e) => setRibbonFontSize(Number(e.target.value))}
              style={{ width: 120 }}
            />
            <input
              type="number"
              min={8}
              max={24}
              value={ribbonFontSize}
              onChange={(e) => setRibbonFontSize(Number(e.target.value))}
              style={{ width: 50 }}
            />
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title={t('general.editing')} sectionKey="settings-general-editing" defaultOpen={true}>
        <div className="setting-row">
          <label>{t('general.levelStep')}</label>
          <input
            type="number"
            step="0.1"
            min={0.1}
            max={2}
            value={doc.settings.levelStep ?? 0.5}
            onChange={(e) => updateLevelStep(Number(e.target.value))}
            style={{ width: 80 }}
          />
        </div>
        <p className="hint">{t('general.levelStep.hint')}</p>

        <h5 style={{ margin: '12px 0 4px', fontSize: '0.92em', color: '#555' }}>{t('general.boxAutoFit')}</h5>
        <div className="setting-row">
          <label>{t('general.autoFitBoxMode')}</label>
          <select
            value={doc.settings.defaultAutoFitBoxMode ?? 'width-fixed'}
            onChange={(e) => {
              useTEMStore.setState((state) => ({
                doc: produce(state.doc, (d) => {
                  d.settings.defaultAutoFitBoxMode = e.target.value as
                    'none' | 'width-fixed' | 'height-fixed';
                }),
              }));
            }}
          >
            <option value="none">{t('general.autoFitBoxMode.none')}</option>
            <option value="width-fixed">{t('general.autoFitBoxMode.widthFixed')}</option>
            <option value="height-fixed">{t('general.autoFitBoxMode.heightFixed')}</option>
          </select>
        </div>
        <div className="setting-row">
          <label>{t('general.autoFitText')}</label>
          <input
            type="checkbox"
            checked={doc.settings.defaultAutoFitText === true}
            onChange={(e) => {
              useTEMStore.setState((state) => ({
                doc: produce(state.doc, (d) => {
                  d.settings.defaultAutoFitText = e.target.checked;
                }),
              }));
            }}
          />
        </div>
        <p className="hint">
          {t('general.autoFit.hint1')}<br />
          {t('general.autoFit.hint2')}
        </p>
      </CollapsibleSection>

      <CollapsibleSection title={t('general.lineDefaults')} sectionKey="settings-general-line-defaults" defaultOpen={true}>
        <p className="hint">
          {t('general.lineDefaults.hint1')}
          {t('general.lineDefaults.hint2')}
        </p>
        <LineDefaultsBasicFields />
        <div className="setting-row" style={{ justifyContent: 'flex-start' }}>
          <button className="ribbon-btn-small" onClick={() => onOpenLineTab?.()}>
            {t('general.openLineTab')}
          </button>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title={t('paper.title')} sectionKey="settings-general-paper-guide" defaultOpen={false}>
        <PaperGuideSection />
      </CollapsibleSection>
    </section>
  );
}

// ============================================================================
// 用紙枠
// ============================================================================
function PaperGuideSection() {
  const { t } = useTranslation('settingsDialog');
  const doc = useTEMStore((s) => s.doc);
  const guide = doc.settings.paperGuides[0];
  if (!guide) return null;

  const update = (patch: Partial<typeof guide>) => {
    useTEMStore.setState((state) => ({
      doc: produce(state.doc, (d) => {
        d.settings.paperGuides[0] = { ...d.settings.paperGuides[0], ...patch };
      }),
    }));
  };

  const baseSize = guide.baseSize ?? 'A4';
  const isCustom = baseSize === 'custom';

  return (
    <>
      <h4 style={{ marginTop: 16 }}>{t('paper.title')}</h4>
      <p className="hint" style={{ marginTop: 0 }}>
        {t('paper.hint1')}
        {t('paper.hint2')}
      </p>
      <div className="setting-row">
        <label>{t('paper.size')}</label>
        <select
          value={baseSize}
          onChange={(e) => update({ baseSize: e.target.value as PaperBaseKey })}
          style={{ maxWidth: 220 }}
        >
          <option value="A4">{t('paper.size.A4')}</option>
          <option value="A3">{t('paper.size.A3')}</option>
          <option value="16:9">{t('paper.size.16x9')}</option>
          <option value="4:3">4:3</option>
          <option value="custom">{t('paper.size.custom')}</option>
        </select>
      </div>
      {isCustom && (
        <>
          <div className="setting-row">
            <label>{t('paper.customShort')}</label>
            <input
              type="number"
              min={50}
              value={guide.customWidth ?? 794}
              onChange={(e) => update({ customWidth: Math.max(50, Number(e.target.value)) })}
              style={{ width: 100 }}
            />
          </div>
          <div className="setting-row">
            <label>{t('paper.customLong')}</label>
            <input
              type="number"
              min={50}
              value={guide.customHeight ?? 1123}
              onChange={(e) => update({ customHeight: Math.max(50, Number(e.target.value)) })}
              style={{ width: 100 }}
            />
          </div>
        </>
      )}
      <div className="setting-row">
        <label>{t('paper.pageCount')}</label>
        <input
          type="number"
          min={1}
          max={50}
          value={guide.pageCount ?? 1}
          onChange={(e) => update({ pageCount: Math.max(1, Math.min(50, Number(e.target.value))) })}
          style={{ width: 80 }}
        />
      </div>
      <div className="setting-row">
        <label>{t('paper.maskOutside')}</label>
        <input
          type="checkbox"
          checked={guide.maskOutside !== false}
          onChange={(e) => update({ maskOutside: e.target.checked })}
        />
      </div>
      <ColorRow rowClassName="setting-row" label={t('common.lineColor')}
        value={guide.color}
        onChange={(c) => update({ color: c ?? '#000000' })}
        defaultLabel={t('common.defaultColor', { color: '#000000' })}
      />
    </>
  );
}

// ============================================================================
// Snap
// ============================================================================
function SnapSection() {
  const { t } = useTranslation('settingsDialog');
  const doc = useTEMStore((s) => s.doc);
  const view = useTEMStore((s) => s.view);
  const toggleGrid = useTEMStore((s) => s.toggleGrid);
  const toggleSnap = useTEMStore((s) => s.toggleSnap);
  const setGridPx = useTEMStore((s) => s.setGridPx);

  const updateSnap = (patch: Partial<typeof doc.settings.snap>) => {
    useTEMStore.setState((state) => ({
      doc: produce(state.doc, (d) => { d.settings.snap = { ...d.settings.snap, ...patch }; }),
    }));
  };

  return (
    <section className="settings-section">
      <h4>{t('common.display')}</h4>
      <div className="setting-row">
        <label>{t('snap.showGrid')}</label>
        <input type="checkbox" checked={view.showGrid} onChange={toggleGrid} />
      </div>
      <div className="setting-row">
        <label>{t('snap.enable')}</label>
        <input type="checkbox" checked={view.snapEnabled} onChange={toggleSnap} />
      </div>
      <p className="hint" style={{ marginTop: 0 }}>
        {t('snap.hint')}
      </p>

      <h4 style={{ marginTop: 14 }}>{t('snap.gridSpacing')}</h4>
      <div className="setting-row">
        <label>{t('snap.gridPx')}</label>
        <input
          type="number"
          min={2}
          max={200}
          value={doc.settings.snap.gridPx}
          onChange={(e) => setGridPx(Number(e.target.value))}
          style={{ width: 80 }}
        />
      </div>
      <p className="hint" style={{ marginTop: 0 }}>
        {t('snap.gridPx.hint')}
      </p>

      <h4 style={{ marginTop: 14 }}>{t('snap.alignGuides')}</h4>
      <div className="setting-row">
        <label>{t('snap.alignGuides.show')}</label>
        <input
          type="checkbox"
          checked={doc.settings.snap.alignGuides}
          onChange={(e) => updateSnap({ alignGuides: e.target.checked })}
        />
      </div>
      <div className="setting-row">
        <label>{t('snap.distancePx')}</label>
        <input
          type="number"
          min={0}
          max={200}
          value={doc.settings.snap.distancePx}
          onChange={(e) => updateSnap({ distancePx: Math.max(0, Number(e.target.value)) })}
          style={{ width: 80 }}
        />
      </div>
    </section>
  );
}

// ============================================================================
// Type label visibility
// ============================================================================
function TypeLabelSection() {
  const { t } = useTranslation('settingsDialog');
  const doc = useTEMStore((s) => s.doc);
  const vis = doc.settings.typeLabelVisibility;

  const keys: { key: TypeLabelVisibilityKey; label: string }[] = [
    { key: 'BFP', label: t('boxTypeLabel.BFP') },
    { key: 'EFP', label: t('boxTypeLabel.EFP') },
    { key: 'P-EFP', label: t('boxTypeLabel.P-EFP') },
    { key: 'OPP', label: t('boxTypeLabel.OPP') },
    { key: '2nd-EFP', label: t('boxTypeLabel.2nd-EFP') },
    { key: 'P-2nd-EFP', label: t('boxTypeLabel.P-2nd-EFP') },
    { key: 'SD', label: t('boxTypeLabel.SD') },
    { key: 'SG', label: t('boxTypeLabel.SG') },
  ];

  const setAll = (value: boolean) => {
    useTEMStore.setState((state) => ({
      doc: produce(state.doc, (d) => {
        keys.forEach((k) => {
          d.settings.typeLabelVisibility[k.key] = value;
        });
      }),
    }));
  };

  const setOne = (key: TypeLabelVisibilityKey, value: boolean) => {
    useTEMStore.setState((state) => ({
      doc: produce(state.doc, (d) => {
        d.settings.typeLabelVisibility[key] = value;
      }),
    }));
  };

  return (
    <section className="settings-section">
      <h4>{t('typeLabel.title')}</h4>
      <p className="hint" style={{ marginBottom: 6 }}>
        {t('typeLabel.hint')}
      </p>
      <div className="setting-row" style={{ justifyContent: 'flex-start', gap: 6, flexWrap: 'wrap' }}>
        <span style={{ color: '#555', fontSize: '0.9em' }}>{t('typeLabel.bulk')}</span>
        <button className="ribbon-btn-small" onClick={() => setAll(true)}>{t('typeLabel.showAll')}</button>
        <button className="ribbon-btn-small" onClick={() => setAll(false)}>{t('typeLabel.hideAll')}</button>
      </div>
      {keys.map((k) => (
        <div className="setting-row" key={k.key}>
          <label>{k.label}</label>
          <input
            type="checkbox"
            checked={vis?.[k.key] !== false}
            onChange={(e) => setOne(k.key, e.target.checked)}
          />
        </div>
      ))}
    </section>
  );
}

// ============================================================================
// Box スタイル（タイプ別プリセット）
// ============================================================================
function BoxStyleSection() {
  const { t } = useTranslation('settingsDialog');
  const doc = useTEMStore((s) => s.doc);
  const presets = doc.settings.boxTypePresets ?? {};

  const TYPE_LIST: { key: BoxType; label: string }[] = [
    { key: 'normal',     label: t('boxTypeLabel.normal') },
    { key: 'BFP',        label: t('boxTypeLabel.BFP') },
    { key: 'OPP',        label: t('boxTypeLabel.OPP') },
    { key: 'EFP',        label: t('boxTypeLabel.EFP') },
    { key: '2nd-EFP',    label: t('boxTypeLabel.2nd-EFP') },
    { key: 'P-EFP',      label: t('boxTypeLabel.P-EFP') },
    { key: 'P-2nd-EFP',  label: t('boxTypeLabel.P-2nd-EFP') },
    { key: 'annotation', label: t('boxTypeLabel.annotation') },
  ];

  const [activeType, setActiveType] = useState<BoxType>('normal');
  const preset: BoxTypePreset = presets[activeType] ?? {};

  // テーマ ----------
  const [userThemes, setUserThemes] = useState<BoxStyleTheme[]>(() => loadUserThemes());
  const [selectedThemeId, setSelectedThemeId] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const allThemes: BoxStyleTheme[] = [...BUILTIN_THEMES, ...userThemes];
  const selectedTheme = allThemes.find((t) => t.id === selectedThemeId) ?? null;

  const refreshUserThemes = () => setUserThemes(loadUserThemes());

  const updatePreset = (patch: Partial<BoxTypePreset>) => {
    useTEMStore.setState((state) => ({
      doc: produce(state.doc, (d) => {
        if (!d.settings.boxTypePresets) d.settings.boxTypePresets = {};
        const cur = d.settings.boxTypePresets[activeType] ?? {};
        d.settings.boxTypePresets[activeType] = { ...cur, ...patch };
      }),
      dirty: true,
    }));
  };

  const resetType = () => {
    useTEMStore.setState((state) => ({
      doc: produce(state.doc, (d) => {
        if (d.settings.boxTypePresets) {
          delete d.settings.boxTypePresets[activeType];
        }
      }),
      dirty: true,
    }));
  };

  // テーマを設定全体に適用（boxTypePresets を置換）
  const applyTheme = (theme: BoxStyleTheme) => {
    useTEMStore.setState((state) => ({
      doc: produce(state.doc, (d) => {
        d.settings.boxTypePresets = JSON.parse(JSON.stringify(theme.presets));
      }),
      dirty: true,
    }));
  };

  const handleApply = () => {
    if (!selectedTheme) { alert(t('theme.selectTheme')); return; }
    if (!confirm(t('theme.confirmApply', { name: selectedTheme.name }))) return;
    applyTheme(selectedTheme);
  };

  // 全 Box タイプのプリセットを削除し、すべて「自動」（工場出荷時）に戻す
  const handleResetAll = () => {
    if (!confirm(t('theme.confirmResetAll'))) return;
    useTEMStore.setState((state) => ({
      doc: produce(state.doc, (d) => { d.settings.boxTypePresets = {}; }),
      dirty: true,
    }));
  };

  const handleSaveNew = () => {
    const name = prompt(t('theme.promptName'));
    if (!name) return;
    const saved = saveUserTheme(name, presets);
    refreshUserThemes();
    setSelectedThemeId(saved.id);
  };

  const handleOverwrite = () => {
    if (!selectedTheme || selectedTheme.builtin) {
      alert(t('theme.selectUserToOverwrite'));
      return;
    }
    if (!confirm(t('theme.confirmOverwrite', { name: selectedTheme.name }))) return;
    updateUserTheme(selectedTheme.id, selectedTheme.name, presets, selectedTheme.description);
    refreshUserThemes();
  };

  const handleDelete = () => {
    if (!selectedTheme || selectedTheme.builtin) {
      alert(t('theme.selectUserToDelete'));
      return;
    }
    if (!confirm(t('theme.confirmDelete', { name: selectedTheme.name }))) return;
    deleteUserTheme(selectedTheme.id);
    refreshUserThemes();
    setSelectedThemeId('');
  };

  const handleExport = () => {
    if (!selectedTheme) { alert(t('theme.selectToExport')); return; }
    const json = themeToJsonString(selectedTheme);
    const safeName = selectedTheme.name.replace(/[\\/:*?"<>|]/g, '_');
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `temer-theme-${safeName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportCurrent = () => {
    const theme: BoxStyleTheme = { id: 'current', name: '現在の設定', presets }; // i18n-ok（書き出す JSON の中のテーマ名＝データ）
    const json = themeToJsonString(theme);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `temer-theme-current.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => fileInputRef.current?.click();
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = ''; // 同じファイルでも再度発火させる
    if (!f) return;
    const text = await f.text();
    const themes = parseThemesFromJson(text);
    if (themes.length === 0) {
      alert(t('theme.noValidTheme'));
      return;
    }
    let savedCount = 0;
    let lastId = '';
    for (const t of themes) {
      const saved = saveUserTheme(t.name, t.presets, t.description);
      lastId = saved.id;
      savedCount++;
    }
    refreshUserThemes();
    setSelectedThemeId(lastId);
    alert(t('theme.imported', { n: savedCount }));
  };

  return (
    <section className="settings-section">
      <h4>{t('boxStyle.title')}</h4>
      <p className="hint" style={{ marginBottom: 8 }}>
        {t('boxStyle.hint1')}
        {t('boxStyle.hint2')}
      </p>

      {/* テーマセクション */}
      <div style={{ padding: 8, background: '#f7f9fc', border: '1px solid #d8dde5', borderRadius: 4, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <strong style={{ fontSize: '0.92em' }}>{t('theme.label')}</strong>
          <select
            value={selectedThemeId}
            onChange={(e) => setSelectedThemeId(e.target.value)}
            style={{ flex: 1, minWidth: 180, fontSize: '0.88em' }}
          >
            <option value="">{t('theme.selectPlaceholder')}</option>
            <optgroup label={t('theme.group.builtin')}>
              {BUILTIN_THEMES.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </optgroup>
            {userThemes.length > 0 && (
              <optgroup label={t('theme.group.user')}>
                {userThemes.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </optgroup>
            )}
          </select>
          <button className="ribbon-btn-small" onClick={handleApply} disabled={!selectedTheme} title={t('theme.apply.tip')}>{t('theme.apply')}</button>
          <button className="ribbon-btn-small" onClick={handleResetAll} title={t('theme.resetAll.tip')}>{t('theme.resetAll')}</button>
          <button className="ribbon-btn-small" onClick={handleSaveNew} title={t('theme.saveNew.tip')}>{t('theme.saveNew')}</button>
          <button className="ribbon-btn-small" onClick={handleOverwrite} disabled={!selectedTheme || !!selectedTheme?.builtin} title={t('theme.overwrite.tip')}>{t('theme.overwrite')}</button>
          <button className="ribbon-btn-small" onClick={handleDelete} disabled={!selectedTheme || !!selectedTheme?.builtin} title={t('theme.delete.tip')}>{t('common.delete')}</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
          <button className="ribbon-btn-small" onClick={handleExport} disabled={!selectedTheme} title={t('theme.export.tip')}>{t('theme.export')}</button>
          <button className="ribbon-btn-small" onClick={handleExportCurrent} title={t('theme.exportCurrent.tip')}>{t('theme.exportCurrent')}</button>
          <button className="ribbon-btn-small" onClick={handleImportClick} title={t('theme.import.tip')}>{t('theme.import')}</button>
          <input ref={fileInputRef} type="file" accept=".json,application/json" onChange={handleImportFile} style={{ display: 'none' }} />
          {selectedTheme?.description && (
            <span style={{ fontSize: '0.82em', color: '#555', flex: '1 1 100%' }}>{selectedTheme.description}</span>
          )}
        </div>
      </div>

      <div className="setting-row" style={{ flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
        {TYPE_LIST.map((t) => (
          <button
            key={t.key}
            className={activeType === t.key ? 'settings-tab active' : 'settings-tab'}
            onClick={() => setActiveType(t.key)}
            style={{ padding: '4px 10px', fontSize: '0.88em' }}
          >
            {t.key}
          </button>
        ))}
      </div>

      <div style={{ fontSize: '0.86em', color: '#666', marginBottom: 6 }}>
        {t('boxStyle.editing')} <strong>{TYPE_LIST.find((t) => t.key === activeType)?.label}</strong>
      </div>

      <h5 style={{ margin: '8px 0 4px', fontSize: '0.92em', color: '#555' }}>{t('boxStyle.borderAndShape')}</h5>
      <div className="setting-row">
        <label>{t('boxStyle.borderStyle')}</label>
        <select
          value={preset.borderStyle ?? ''}
          onChange={(e) => updatePreset({ borderStyle: (e.target.value || undefined) as BoxTypePreset['borderStyle'] })}
        >
          <option value="">{t('common.autoParen')}</option>
          <option value="solid">{t('boxStyle.border.solid')}</option>
          <option value="dashed">{t('boxStyle.border.dashed')}</option>
          <option value="dotted">{t('boxStyle.border.dotted')}</option>
          <option value="double">{t('boxStyle.border.double')}</option>
        </select>
      </div>
      <div className="setting-row">
        <label>{t('common.borderWidthPx')}</label>
        <input
          type="number"
          min={0.5}
          max={8}
          step={0.5}
          value={preset.borderWidth ?? ''}
          placeholder={t('common.auto')}
          onChange={(e) => {
            const v = e.target.value;
            updatePreset({ borderWidth: v === '' ? undefined : Number(v) });
          }}
        />
      </div>
      <div className="setting-row">
        <label>{t('common.shape')}</label>
        <select
          value={preset.shape ?? ''}
          onChange={(e) => updatePreset({ shape: (e.target.value || undefined) as BoxTypePreset['shape'] })}
        >
          <option value="">{t('common.autoParen')}</option>
          <option value="rect">{t('boxStyle.shape.rect')}</option>
          <option value="ellipse">{t('boxStyle.shape.ellipse')}</option>
        </select>
      </div>

      <h5 style={{ margin: '10px 0 4px', fontSize: '0.92em', color: '#555' }}>{t('boxStyle.body')}</h5>
      <ColorRow rowClassName="setting-row" label={t('common.backgroundColor')}
        value={preset.backgroundColor}
        onChange={(c) => updatePreset({ backgroundColor: c })}
        allowNone defaultLabel={t('common.auto')} />
      <ColorRow rowClassName="setting-row" label={t('common.borderColor')}
        value={preset.borderColor}
        onChange={(c) => updatePreset({ borderColor: c })}
        allowNone defaultLabel={t('common.auto')} />
      <ColorRow rowClassName="setting-row" label={t('common.textColor')}
        value={preset.color}
        onChange={(c) => updatePreset({ color: c })}
        defaultLabel={t('common.auto')} />
      <FontSizeRow rowClassName="setting-row" label={t('boxStyle.fontSize')}
        value={preset.fontSize}
        onChange={(v) => updatePreset({ fontSize: v })}
        emptyAllowed placeholderText={t('common.auto')} />

      <h5 style={{ margin: '10px 0 4px', fontSize: '0.92em', color: '#555' }}>{t('boxStyle.typeLabelColors')}</h5>
      <ColorRow rowClassName="setting-row" label={t('common.textColor')}
        value={preset.typeLabelColor}
        onChange={(c) => updatePreset({ typeLabelColor: c })}
        defaultLabel={t('common.auto')} />
      <ColorRow rowClassName="setting-row" label={t('common.backgroundColor')}
        value={preset.typeLabelBackgroundColor}
        onChange={(c) => updatePreset({ typeLabelBackgroundColor: c })}
        allowNone defaultLabel={t('common.auto')} />
      <ColorRow rowClassName="setting-row" label={t('common.borderColor')}
        value={preset.typeLabelBorderColor}
        onChange={(c) => updatePreset({ typeLabelBorderColor: c })}
        allowNone defaultLabel={t('common.auto')} />
      <div className="setting-row">
        <label>{t('common.borderWidthPx')}</label>
        <input
          type="number"
          min={0}
          max={5}
          step={0.5}
          value={preset.typeLabelBorderWidth ?? ''}
          placeholder={t('common.auto')}
          onChange={(e) => {
            const v = e.target.value;
            updatePreset({ typeLabelBorderWidth: v === '' ? undefined : Number(v) });
          }}
        />
      </div>

      <h5 style={{ margin: '10px 0 4px', fontSize: '0.92em', color: '#555' }}>{t('boxStyle.subLabelColors')}</h5>
      <ColorRow rowClassName="setting-row" label={t('common.textColor')}
        value={preset.subLabelColor}
        onChange={(c) => updatePreset({ subLabelColor: c })}
        defaultLabel={t('common.auto')} />
      <ColorRow rowClassName="setting-row" label={t('common.backgroundColor')}
        value={preset.subLabelBackgroundColor}
        onChange={(c) => updatePreset({ subLabelBackgroundColor: c })}
        allowNone defaultLabel={t('common.auto')} />
      <ColorRow rowClassName="setting-row" label={t('common.borderColor')}
        value={preset.subLabelBorderColor}
        onChange={(c) => updatePreset({ subLabelBorderColor: c })}
        allowNone defaultLabel={t('common.auto')} />
      <div className="setting-row">
        <label>{t('common.borderWidthPx')}</label>
        <input
          type="number"
          min={0}
          max={5}
          step={0.5}
          value={preset.subLabelBorderWidth ?? ''}
          placeholder={t('common.auto')}
          onChange={(e) => {
            const v = e.target.value;
            updatePreset({ subLabelBorderWidth: v === '' ? undefined : Number(v) });
          }}
        />
      </div>

      <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end' }}>
        <button
          className="ribbon-btn-small"
          onClick={resetType}
          title={t('boxStyle.resetType.tip', { type: activeType })}
        >
          {t('boxStyle.resetType')}
        </button>
      </div>
    </section>
  );
}

// ============================================================================
// SD/SG 配置（専用スペース／帯）
// ============================================================================
function LineStyleSection() {
  const { t } = useTranslation('settingsDialog');
  const doc = useTEMStore((s) => s.doc);
  const setLineDefaults = useTEMStore((s) => s.setLineDefaults);
  const applyLineDefaultsToAll = useTEMStore((s) => s.applyLineDefaultsToAll);
  const sheet = useActiveSheet();
  const [includeType, setIncludeType] = useState(false);
  const [resetControlPoints, setResetControlPoints] = useState(false);

  // 未設定の項目は工場出荷値で埋めて表示する（旧 .tem を開いても空欄にならない）
  const d = resolveLineDefaults(doc.settings);
  const lineCount = sheet?.lines.length ?? 0;
  const manualCurveCount = sheet?.lines.filter(
    (l) => l.controlPoints && l.controlPoints.length >= 2,
  ).length ?? 0;

  const num = (v: string, fallback: number) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  };

  return (
    <div>
      <section className="settings-section">
        <h4>{t('line.defaultStyle')}</h4>
        <p className="hint">
          {t('line.defaultStyle.hint')}
        </p>
        <LineDefaultsBasicFields />
      </section>

      <section className="settings-section">
        <h4>{t('line.endpoints')}</h4>
        <p className="hint">
          {t('line.endpoints.hint')}
        </p>
        <div className="setting-row">
          <label>{t('line.startOffset')}</label>
          <div style={{ display: 'flex', gap: 4 }}>
            <input
              type="number" step={1} style={{ width: 80 }}
              value={d.startOffsetTime}
              onChange={(e) => setLineDefaults({ startOffsetTime: num(e.target.value, 0) })}
            />
            <input
              type="number" step={1} style={{ width: 80 }}
              value={d.startOffsetItem}
              onChange={(e) => setLineDefaults({ startOffsetItem: num(e.target.value, 0) })}
            />
          </div>
        </div>
        <div className="setting-row">
          <label>{t('line.endOffset')}</label>
          <div style={{ display: 'flex', gap: 4 }}>
            <input
              type="number" step={1} style={{ width: 80 }}
              value={d.endOffsetTime}
              onChange={(e) => setLineDefaults({ endOffsetTime: num(e.target.value, 0) })}
            />
            <input
              type="number" step={1} style={{ width: 80 }}
              value={d.endOffsetItem}
              onChange={(e) => setLineDefaults({ endOffsetItem: num(e.target.value, 0) })}
            />
          </div>
        </div>
        <div className="setting-row">
          <label>{t('line.startMargin')}</label>
          <input
            type="number" step={1}
            value={d.startMargin}
            onChange={(e) => setLineDefaults({ startMargin: num(e.target.value, 0) })}
            title={t('line.startMargin.tip')}
          />
        </div>
        <div className="setting-row">
          <label>{t('line.endMargin')}</label>
          <input
            type="number" step={1}
            value={d.endMargin}
            onChange={(e) => setLineDefaults({ endMargin: num(e.target.value, 0) })}
          />
        </div>

        <div className="setting-row">
          <label>{t('line.angleMode')}</label>
          <input
            type="checkbox"
            checked={d.angleMode}
            onChange={(e) => setLineDefaults({ angleMode: e.target.checked })}
          />
        </div>
        {d.angleMode && (
          <div className="setting-row">
            <label>{t('line.angleDeg')}</label>
            <input
              type="number" min={-85} max={85} step={1}
              value={d.angleDeg}
              onChange={(e) => setLineDefaults({
                angleDeg: Math.max(-85, Math.min(85, num(e.target.value, 0))),
              })}
            />
          </div>
        )}
      </section>

      <section className="settings-section">
        <h4>{t('line.bulk')}</h4>
        <p className="hint">
          {t('line.bulk.hint', { sheet: sheet?.name ?? '-', n: lineCount })}
        </p>
        <div className="setting-row">
          <label>{t('line.bulk.includeType')}</label>
          <input
            type="checkbox"
            checked={includeType}
            onChange={(e) => setIncludeType(e.target.checked)}
          />
        </div>
        {includeType && (
          <p className="hint" style={{ color: '#b45309' }}>
            {t('line.bulk.includeType.warn')}
          </p>
        )}
        <div className="setting-row">
          <label>{t('line.bulk.resetControlPoints')}</label>
          <input
            type="checkbox"
            checked={resetControlPoints}
            onChange={(e) => setResetControlPoints(e.target.checked)}
          />
        </div>
        <p className="hint">
          {t('line.bulk.controlPoints.hint', { n: manualCurveCount })}
        </p>
        <div className="setting-row" style={{ justifyContent: 'flex-start', gap: 6, flexWrap: 'wrap' }}>
          <button
            className="ribbon-btn-small"
            disabled={lineCount === 0}
            onClick={() => {
              const warnings = [
                t('line.bulk.confirm.apply', { n: lineCount }),
                t('line.bulk.confirm.reset'),
              ];
              if (includeType) warnings.push(t('line.bulk.confirm.type'));
              if (resetControlPoints && manualCurveCount > 0) {
                warnings.push(t('line.bulk.confirm.controlPoints', { n: manualCurveCount }));
              }
              warnings.push(t('common.confirmContinue'));
              if (!confirm(warnings.join('\n'))) return;
              applyLineDefaultsToAll({ includeType, resetControlPoints });
            }}
          >
            {t('line.bulk.apply')}
          </button>
        </div>
      </section>
    </div>
  );
}

function SDSGSpaceSection() {
  const { t } = useTranslation('settingsDialog');
  const doc = useTEMStore((s) => s.doc);
  const placeAllSDSGToBands = useTEMStore((s) => s.placeAllSDSGToBands);
  const layout = doc.settings.layout;
  const space = doc.settings.sdsgSpace;

  const updateSpace = (patch: Partial<NonNullable<typeof doc.settings.sdsgSpace>>) => {
    useTEMStore.setState((state) => ({
      doc: produce(state.doc, (d) => {
        if (!d.settings.sdsgSpace) return;
        d.settings.sdsgSpace = { ...d.settings.sdsgSpace, ...patch };
      }),
    }));
  };

  const updateBand = (which: 'top' | 'bottom', patch: Partial<NonNullable<typeof doc.settings.sdsgSpace>['bands']['top']>) => {
    useTEMStore.setState((state) => ({
      doc: produce(state.doc, (d) => {
        if (!d.settings.sdsgSpace) return;
        d.settings.sdsgSpace.bands[which] = { ...d.settings.sdsgSpace.bands[which], ...patch };
      }),
    }));
  };

  if (!space) {
    return <p className="hint">{t('sdsg.noData')}</p>;
  }

  const isH = layout === 'horizontal';
  const topLabel = isH ? t('sdsg.band.topH') : t('sdsg.band.topV');
  const bottomLabel = isH ? t('sdsg.band.bottomH') : t('sdsg.band.bottomV');

  return (
    <section className="settings-section">
      <h4>{t('sdsg.mode')}</h4>
      <p className="hint" style={{ marginTop: 0 }}>
        {t('sdsg.mode.hint1')}
        {t('sdsg.mode.hint2')}
      </p>
      <div className="setting-row">
        <label>{t('sdsg.enable')}</label>
        <input
          type="checkbox"
          checked={space.enabled}
          onChange={(e) => updateSpace({ enabled: e.target.checked })}
        />
      </div>
      <p className="hint">{t('sdsg.enable.hint')}</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 14 }}>
      <div>
      <h4 style={{ marginTop: 0 }}>{topLabel}</h4>
      <div className="setting-row">
        <label>{t('sdsg.band.use')}</label>
        <input
          type="checkbox"
          checked={space.bands.top.enabled}
          onChange={(e) => updateBand('top', { enabled: e.target.checked })}
        />
      </div>
      <div className="setting-row">
        <label>{t('sdsg.band.height')}</label>
        <select
          value={space.bands.top.heightMode ?? 'auto'}
          onChange={(e) => updateBand('top', { heightMode: e.target.value as 'auto' | 'manual' })}
          style={{ width: 120 }}
        >
          <option value="auto">{t('sdsg.band.height.auto')}</option>
          <option value="manual">{t('sdsg.band.height.manual')}</option>
        </select>
      </div>
      {(space.bands.top.heightMode ?? 'auto') === 'manual' && (
        <div className="setting-row">
          <label>{t('sdsg.band.heightLevel')}</label>
          <input
            type="number"
            min={0.1}
            max={10}
            step={0.1}
            value={space.bands.top.heightLevel}
            onChange={(e) => updateBand('top', { heightLevel: Math.max(0.1, Number(e.target.value)) })}
            style={{ width: 80 }}
          />
        </div>
      )}
      <div className="setting-row">
        <label>{t('sdsg.band.reference')}</label>
        <select
          value={space.bands.top.reference}
          onChange={(e) => updateBand('top', { reference: e.target.value as 'period' | 'timearrow' | 'boxes' })}
        >
          <option value="boxes">{t('sdsg.band.reference.boxes')}</option>
          <option value="period">{t('sdsg.band.reference.period')}</option>
          <option value="timearrow">{t('sdsg.band.reference.timearrow')}</option>
        </select>
      </div>
      <div className="setting-row">
        <label>{t('sdsg.band.offsetLevel')}</label>
        <input
          type="number"
          step={0.1}
          value={space.bands.top.offsetLevel}
          onChange={(e) => updateBand('top', { offsetLevel: Number(e.target.value) })}
          style={{ width: 80 }}
        />
      </div>
      <div className="setting-row">
        <label>{t('sdsg.band.showBorder')}</label>
        <input
          type="checkbox"
          checked={space.bands.top.showBorder}
          onChange={(e) => updateBand('top', { showBorder: e.target.checked })}
        />
      </div>
      <ColorRow rowClassName="setting-row" label={t('common.frameColor')}
        value={space.bands.top.borderColor}
        onChange={(c) => updateBand('top', { borderColor: c ?? '#9b59b6' })}
        defaultLabel={t('common.defaultColor', { color: '#9b59b6' })}
      />
      <div className="setting-row">
        <label>{t('sdsg.band.fill')}</label>
        <select
          value={space.bands.top.fillStyle ?? 'tinted'}
          onChange={(e) => updateBand('top', { fillStyle: e.target.value as 'tinted' | 'none' })}
        >
          <option value="tinted">{t('sdsg.band.fill.tinted')}</option>
          <option value="none">{t('sdsg.band.fill.none')}</option>
        </select>
      </div>
      <div className="setting-row">
        <label>{t('sdsg.band.labelPosition')}</label>
        <select
          value={space.bands.top.labelPosition ?? 'top-left'}
          onChange={(e) => updateBand('top', { labelPosition: e.target.value as 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'none' })}
        >
          <option value="top-left">{t('sdsg.band.labelPosition.topLeft')}</option>
          <option value="top-right">{t('sdsg.band.labelPosition.topRight')}</option>
          <option value="bottom-left">{t('sdsg.band.labelPosition.bottomLeft')}</option>
          <option value="bottom-right">{t('sdsg.band.labelPosition.bottomRight')}</option>
          <option value="none">{t('common.hidden')}</option>
        </select>
      </div>

      </div>
      <div>
      <h4 style={{ marginTop: 0 }}>{bottomLabel}</h4>
      <div className="setting-row">
        <label>{t('sdsg.band.use')}</label>
        <input
          type="checkbox"
          checked={space.bands.bottom.enabled}
          onChange={(e) => updateBand('bottom', { enabled: e.target.checked })}
        />
      </div>
      <div className="setting-row">
        <label>{t('sdsg.band.height')}</label>
        <select
          value={space.bands.bottom.heightMode ?? 'auto'}
          onChange={(e) => updateBand('bottom', { heightMode: e.target.value as 'auto' | 'manual' })}
          style={{ width: 120 }}
        >
          <option value="auto">{t('sdsg.band.height.auto')}</option>
          <option value="manual">{t('sdsg.band.height.manual')}</option>
        </select>
      </div>
      {(space.bands.bottom.heightMode ?? 'auto') === 'manual' && (
        <div className="setting-row">
          <label>{t('sdsg.band.heightLevel')}</label>
          <input
            type="number"
            min={0.1}
            max={10}
            step={0.1}
            value={space.bands.bottom.heightLevel}
            onChange={(e) => updateBand('bottom', { heightLevel: Math.max(0.1, Number(e.target.value)) })}
            style={{ width: 80 }}
          />
        </div>
      )}
      <div className="setting-row">
        <label>{t('sdsg.band.reference')}</label>
        <select
          value={space.bands.bottom.reference}
          onChange={(e) => updateBand('bottom', { reference: e.target.value as 'period' | 'timearrow' | 'boxes' })}
        >
          <option value="boxes">{t('sdsg.band.reference.boxes')}</option>
          <option value="period">{t('sdsg.band.reference.period')}</option>
          <option value="timearrow">{t('sdsg.band.reference.timearrow')}</option>
        </select>
      </div>
      <div className="setting-row">
        <label>{t('sdsg.band.offsetLevel')}</label>
        <input
          type="number"
          step={0.1}
          value={space.bands.bottom.offsetLevel}
          onChange={(e) => updateBand('bottom', { offsetLevel: Number(e.target.value) })}
          style={{ width: 80 }}
        />
      </div>
      <div className="setting-row">
        <label>{t('sdsg.band.showBorder')}</label>
        <input
          type="checkbox"
          checked={space.bands.bottom.showBorder}
          onChange={(e) => updateBand('bottom', { showBorder: e.target.checked })}
        />
      </div>
      <ColorRow rowClassName="setting-row" label={t('common.frameColor')}
        value={space.bands.bottom.borderColor}
        onChange={(c) => updateBand('bottom', { borderColor: c ?? '#27ae60' })}
        defaultLabel={t('common.defaultColor', { color: '#27ae60' })}
      />
      <div className="setting-row">
        <label>{t('sdsg.band.fill')}</label>
        <select
          value={space.bands.bottom.fillStyle ?? 'tinted'}
          onChange={(e) => updateBand('bottom', { fillStyle: e.target.value as 'tinted' | 'none' })}
        >
          <option value="tinted">{t('sdsg.band.fill.tinted')}</option>
          <option value="none">{t('sdsg.band.fill.none')}</option>
        </select>
      </div>
      <div className="setting-row">
        <label>{t('sdsg.band.labelPosition')}</label>
        <select
          value={space.bands.bottom.labelPosition ?? 'top-left'}
          onChange={(e) => updateBand('bottom', { labelPosition: e.target.value as 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'none' })}
        >
          <option value="top-left">{t('sdsg.band.labelPosition.topLeft')}</option>
          <option value="top-right">{t('sdsg.band.labelPosition.topRight')}</option>
          <option value="bottom-left">{t('sdsg.band.labelPosition.bottomLeft')}</option>
          <option value="bottom-right">{t('sdsg.band.labelPosition.bottomRight')}</option>
          <option value="none">{t('common.hidden')}</option>
        </select>
      </div>

      </div>
      </div>

      <h4 style={{ marginTop: 14 }}>{t('sdsg.behavior')}</h4>
      <div className="setting-row">
        <label>{t('sdsg.autoArrange')}</label>
        <input
          type="checkbox"
          checked={space.autoArrange}
          onChange={(e) => updateSpace({ autoArrange: e.target.checked })}
        />
      </div>
      <p className="hint">{t('sdsg.autoArrange.hint')}</p>
      <div className="setting-row">
        <label>{t('sdsg.shrinkToFitRow')}</label>
        <input
          type="checkbox"
          checked={space.bands.top.shrinkToFitRow !== false || space.bands.bottom.shrinkToFitRow !== false}
          onChange={(e) => {
            updateBand('top', { shrinkToFitRow: e.target.checked });
            updateBand('bottom', { shrinkToFitRow: e.target.checked });
          }}
        />
      </div>
      <p className="hint">{t('sdsg.shrinkToFitRow.hint')}</p>
      <div className="setting-row">
        <label>{t('sdsg.autoExpandHeight')} <span style={{ color: '#888', fontSize: '0.85em' }}>{t('sdsg.autoExpandHeight.manualOnly')}</span></label>
        <input
          type="checkbox"
          checked={!!(space.bands.top.autoExpandHeight || space.bands.bottom.autoExpandHeight)}
          onChange={(e) => {
            updateBand('top', { autoExpandHeight: e.target.checked });
            updateBand('bottom', { autoExpandHeight: e.target.checked });
          }}
        />
      </div>
      <p className="hint">
        {t('sdsg.autoExpandHeight.hint1')}
        {t('sdsg.autoExpandHeight.hint2')}
      </p>
      <div className="setting-row">
        <label>{t('sdsg.allowMismatched')}</label>
        <input
          type="checkbox"
          checked={space.allowMismatchedPlacement}
          onChange={(e) => updateSpace({ allowMismatchedPlacement: e.target.checked })}
        />
      </div>
      <p className="hint">
        {t('sdsg.allowMismatched.hint')}
      </p>
      <div className="setting-row">
        <label>{t('sdsg.autoFlip')}</label>
        <input
          type="checkbox"
          checked={space.autoFlipDirectionInBand}
          onChange={(e) => updateSpace({ autoFlipDirectionInBand: e.target.checked })}
        />
      </div>
      <p className="hint">
        {t('sdsg.autoFlip.hint')}
      </p>

      <h4 style={{ marginTop: 14 }}>{t('sdsg.bulk')}</h4>
      <div className="setting-row">
        <label>{t('sdsg.autoPlaceSD')}</label>
        <select
          value={space.autoPlaceSD}
          onChange={(e) => updateSpace({ autoPlaceSD: e.target.value as 'none' | 'top' | 'bottom' })}
        >
          <option value="none">{t('sdsg.place.none')}</option>
          <option value="top">{t('sdsg.place.top')}</option>
          <option value="bottom">{t('sdsg.place.bottomNeedsUnlock')}</option>
        </select>
      </div>
      <div className="setting-row">
        <label>{t('sdsg.autoPlaceSG')}</label>
        <select
          value={space.autoPlaceSG}
          onChange={(e) => updateSpace({ autoPlaceSG: e.target.value as 'none' | 'top' | 'bottom' })}
        >
          <option value="none">{t('sdsg.place.none')}</option>
          <option value="top">{t('sdsg.place.topNeedsUnlock')}</option>
          <option value="bottom">{t('sdsg.place.bottom')}</option>
        </select>
      </div>
      <div className="setting-row" style={{ justifyContent: 'flex-start', gap: 6, flexWrap: 'wrap' }}>
        <button
          className="ribbon-btn-small"
          onClick={() => {
            if (!confirm(t('sdsg.bulk.confirm'))) return;
            placeAllSDSGToBands(space.autoPlaceSD, space.autoPlaceSG);
          }}
        >
          {t('sdsg.bulk.apply')}
        </button>
      </div>
    </section>
  );
}

// ============================================================================
// Project info
// ============================================================================
function ProjectSection() {
  const { t } = useTranslation('settingsDialog');
  const doc = useTEMStore((s) => s.doc);
  const setDefaultBoxSize = useTEMStore((s) => s.setDefaultBoxSize);
  const setDefaultFontSize = useTEMStore((s) => s.setDefaultFontSize);
  return (
    <section className="settings-section">
      <h4>{t('project.docInfo')}</h4>
      <div className="setting-row">
        <label>{t('common.title')}</label>
        <input type="text" value={doc.metadata.title} readOnly style={{ width: 200 }} />
      </div>
      <div className="setting-row">
        <label>{t('project.createdAt')}</label>
        <input
          type="text"
          value={new Date(doc.metadata.createdAt).toLocaleString('ja-JP')}
          readOnly
          style={{ width: 200 }}
        />
      </div>
      <div className="setting-row">
        <label>{t('project.history')}</label>
        <span style={{ fontSize: 12, color: '#666' }}>
          {t('project.historyCount', { n: doc.history.length })}
        </span>
      </div>

      <h4 style={{ marginTop: 20, borderTop: '1px solid #e0e0e0', paddingTop: 12 }}>{t('project.defaults')}</h4>
      <h5 style={{ margin: '8px 0 4px', fontSize: '0.92em', color: '#555' }}>{t('project.defaultBoxSize')}</h5>
      <p className="hint" style={{ marginTop: 0 }}>
        {t('project.defaultBoxSize.hint1')}
        {t('project.defaultBoxSize.hint2')}
      </p>
      <div className="setting-row">
        <label>{t('project.defaultBoxWidth')}</label>
        <input
          type="number"
          min={20}
          max={1000}
          value={doc.settings.defaultBoxSize.width}
          onChange={(e) => setDefaultBoxSize({ width: Number(e.target.value) })}
          style={{ width: 100 }}
        />
      </div>
      <div className="setting-row">
        <label>{t('project.defaultBoxHeight')}</label>
        <input
          type="number"
          min={20}
          max={1000}
          value={doc.settings.defaultBoxSize.height}
          onChange={(e) => setDefaultBoxSize({ height: Number(e.target.value) })}
          style={{ width: 100 }}
        />
      </div>
      <div className="setting-row" style={{ justifyContent: 'flex-start', gap: 6 }}>
        <span style={{ color: '#555', fontSize: '0.9em' }}>{t('project.presets')}</span>
        <button className="ribbon-btn-small" onClick={() => setDefaultBoxSize({ width: 60, height: 100 })}>
          {t('project.preset.tall')}
        </button>
        <button className="ribbon-btn-small" onClick={() => setDefaultBoxSize({ width: 100, height: 50 })}>
          {t('project.preset.wide')}
        </button>
        <button className="ribbon-btn-small" onClick={() => setDefaultBoxSize({ width: 80, height: 80 })}>
          {t('project.preset.square')}
        </button>
      </div>

      <h5 style={{ margin: '12px 0 4px', fontSize: '0.92em', color: '#555' }}>{t('project.textDefaults')}</h5>
      <div className="setting-row">
        <label>{t('project.defaultFont')}</label>
        <input type="text" value={doc.settings.defaultFont} readOnly style={{ width: 180 }} />
      </div>
      <div className="setting-row">
        <label>{t('project.defaultFontSize')}</label>
        <input
          type="number"
          min={6}
          max={72}
          value={doc.settings.defaultFontSize}
          onChange={(e) => setDefaultFontSize(Number(e.target.value))}
          style={{ width: 80 }}
        />
      </div>
    </section>
  );
}

// ============================================================================
// Period label
// ============================================================================
function PeriodLabelSettingsSection() {
  const { t } = useTranslation('settingsDialog');
  const doc = useTEMStore((s) => s.doc);
  const pl = doc.settings.periodLabels;

  const update = (patch: Partial<PeriodLabelSettings>) => {
    useTEMStore.setState((state) => ({
      doc: produce(state.doc, (d) => {
        d.settings.periodLabels = { ...d.settings.periodLabels, ...patch };
      }),
    }));
  };

  return (
    <section className="settings-section">
      <div className="setting-row">
        <label>{t('common.showWhileEditing')}</label>
        <input
          type="checkbox"
          checked={pl.alwaysVisible}
          onChange={(e) => update({ alwaysVisible: e.target.checked })}
        />
      </div>
      <div className="setting-row">
        <label>{t('common.includeInExport')}</label>
        <input
          type="checkbox"
          checked={pl.includeInExport}
          onChange={(e) => update({ includeInExport: e.target.checked })}
        />
      </div>
      <div className="setting-row">
        <label>{t('period.bandStyle')}</label>
        <select
          value={pl.bandStyle ?? 'band'}
          onChange={(e) => update({ bandStyle: e.target.value as PeriodLabelBandStyle })}
        >
          <option value="band">{t('period.bandStyle.band')}</option>
          <option value="tick">{t('period.bandStyle.tick')}</option>
        </select>
      </div>
      <div className="setting-row">
        <label>{t('common.labelSideHorizontal')}</label>
        <select
          value={pl.labelSideHorizontal ?? 'top'}
          onChange={(e) => update({ labelSideHorizontal: e.target.value as HorizontalLabelSide })}
        >
          <option value="top">{t('common.top')}</option>
          <option value="bottom">{t('common.bottom')}</option>
        </select>
      </div>
      <div className="setting-row">
        <label>{t('common.labelSideVertical')}</label>
        <select
          value={pl.labelSideVertical ?? 'right'}
          onChange={(e) => update({ labelSideVertical: e.target.value as VerticalLabelSide })}
        >
          <option value="left">{t('common.left')}</option>
          <option value="right">{t('common.right')}</option>
        </select>
      </div>
      <div className="setting-row">
        <label>{t('common.itemReference')}</label>
        <select
          value={pl.itemReference}
          onChange={(e) => update({ itemReference: e.target.value as 'min' | 'max' })}
        >
          <option value="max">{t('common.itemReference.max')}</option>
          <option value="min">{t('common.itemReference.min')}</option>
        </select>
      </div>
      <div className="setting-row">
        <label>{t('common.offsetFromReference')}</label>
        <input
          type="number"
          step="0.5"
          value={pl.itemOffset}
          onChange={(e) => update({ itemOffset: Number(e.target.value) })}
          style={{ width: 70 }}
        />
      </div>
      <div className="setting-row">
        <label>{t('period.showDividers')}</label>
        <input
          type="checkbox"
          checked={pl.showDividers}
          onChange={(e) => update({ showDividers: e.target.checked })}
        />
      </div>
      <div className="setting-row">
        <label>{t('common.fontSize')}</label>
        <input
          type="number"
          min={8}
          max={40}
          value={pl.fontSize}
          onChange={(e) => update({ fontSize: Number(e.target.value) })}
          style={{ width: 70 }}
        />
      </div>

      <PeriodLabelListEditor />
    </section>
  );
}

// 現シートの時期ラベル一覧（追加・編集・削除）
function PeriodLabelListEditor() {
  const { t } = useTranslation('settingsDialog');
  const sheet = useActiveSheet();
  const addPeriodLabel = useTEMStore((s) => s.addPeriodLabel);
  const updatePeriodLabel = useTEMStore((s) => s.updatePeriodLabel);
  const removePeriodLabel = useTEMStore((s) => s.removePeriodLabel);
  const [newLabel, setNewLabel] = useState('');
  const [newPosition, setNewPosition] = useState(0);

  const handleAdd = () => {
    if (!newLabel.trim()) {
      alert(t('period.enterLabel'));
      return;
    }
    addPeriodLabel(newLabel.trim(), newPosition);
    setNewLabel('');
    setNewPosition((p) => p + 1);
  };

  return (
    <>
      <h4 style={{ marginTop: 16 }}>{t('period.list')}</h4>
      <p className="hint" style={{ marginTop: 0 }}>
        {t('period.list.hint')}
      </p>
      <div className="setting-row">
        <label>{t('period.newLabel')}</label>
        <input
          type="text"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder={t('period.newLabel.placeholder')}
          style={{ width: 140 }}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
        />
        <input
          type="number"
          step="0.5"
          value={newPosition}
          onChange={(e) => setNewPosition(Number(e.target.value))}
          style={{ width: 70, marginLeft: 4 }}
          title="Time_Level"
        />
        <button className="ribbon-btn-small" onClick={handleAdd} style={{ marginLeft: 4 }}>{t('period.add')}</button>
      </div>
      {sheet && sheet.periodLabels.length === 0 && (
        <p className="hint">{t('period.empty')}</p>
      )}
      {sheet && sheet.periodLabels.length > 0 && (
        <table style={{ width: '100%', fontSize: '0.92em', marginTop: 4 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>{t('common.label')}</th>
              <th style={{ textAlign: 'left', width: 80 }}>Time_Level</th>
              <th style={{ width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {[...sheet.periodLabels]
              .sort((a, b) => a.position - b.position)
              .map((pl) => (
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
                      style={{ width: 70 }}
                    />
                  </td>
                  <td>
                    <button className="row-btn danger" onClick={() => removePeriodLabel(pl.id)} title={t('common.delete')}>×</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </>
  );
}

// ============================================================================
// Legend
// ============================================================================
export function LegendSettingsSection() {
  const { t } = useTranslation('settingsDialog');
  const doc = useTEMStore((s) => s.doc);
  const sheet = useActiveSheet();
  const lg = doc.settings.legend;

  const update = (patch: Partial<LegendSettings>) => {
    useTEMStore.setState((state) => ({
      doc: produce(state.doc, (d) => {
        d.settings.legend = { ...d.settings.legend, ...patch };
      }),
    }));
  };

  const setOverride = (key: string, patch: Partial<LegendItemOverride>) => {
    useTEMStore.setState((state) => ({
      doc: produce(state.doc, (d) => {
        const ov = d.settings.legend.itemOverrides ?? {};
        ov[key] = { ...(ov[key] ?? {}), ...patch };
        d.settings.legend.itemOverrides = ov;
      }),
    }));
  };

  const clearOverride = (key: string) => {
    useTEMStore.setState((state) => ({
      doc: produce(state.doc, (d) => {
        const ov = d.settings.legend.itemOverrides ?? {};
        delete ov[key];
        d.settings.legend.itemOverrides = ov;
      }),
    }));
  };

  // 現シート上の凡例項目（上書き対象を提示する用）
  const currentItems = sheet ? computeLegendItems(sheet, lg, doc.settings.locale) : [];

  return (
    <div>
      <section className="settings-section">
        <h4>{t('legend.targets')}</h4>
        <div className="setting-row">
          <label>{t('legend.autoGenerate')}</label>
          <input type="checkbox" checked={lg.autoGenerate} onChange={(e) => update({ autoGenerate: e.target.checked })} />
        </div>
        <div className="setting-row">
          <label>{t('common.showWhileEditing')}</label>
          <input type="checkbox" checked={lg.alwaysVisible} onChange={(e) => update({ alwaysVisible: e.target.checked })} />
        </div>
        <div className="setting-row">
          <label>{t('common.includeInExport')}</label>
          <input type="checkbox" checked={lg.includeInExport} onChange={(e) => update({ includeInExport: e.target.checked })} />
        </div>
        <div className="setting-row">
          <label>{t('legend.includeBoxes')}</label>
          <input type="checkbox" checked={lg.includeBoxes} onChange={(e) => update({ includeBoxes: e.target.checked })} />
        </div>
        <div className="setting-row">
          <label>{t('legend.includeLines')}</label>
          <input type="checkbox" checked={lg.includeLines} onChange={(e) => update({ includeLines: e.target.checked })} />
        </div>
        <div className="setting-row">
          <label>{t('legend.includeSDSG')}</label>
          <input type="checkbox" checked={lg.includeSDSG} onChange={(e) => update({ includeSDSG: e.target.checked })} />
        </div>
        <div className="setting-row">
          <label>{t('legend.includeTimeArrow')}</label>
          <input type="checkbox" checked={lg.includeTimeArrow} onChange={(e) => update({ includeTimeArrow: e.target.checked })} />
        </div>
      </section>

      <section className="settings-section">
        <h4>{t('common.title')}</h4>
        <div className="setting-row">
          <label>{t('legend.showTitle')}</label>
          <input
            type="checkbox"
            checked={lg.showTitle !== false}
            onChange={(e) => update({ showTitle: e.target.checked })}
          />
        </div>
        <div className="setting-row">
          <label>{t('legend.titleText')}</label>
          <input
            type="text"
            value={lg.title}
            onChange={(e) => update({ title: e.target.value })}
            style={{ width: 160 }}
          />
        </div>
        <div className="setting-row">
          <label>{t('legend.titlePosition')}</label>
          <select
            value={lg.titlePosition ?? 'top'}
            onChange={(e) => update({ titlePosition: e.target.value as LegendTitlePosition })}
          >
            <option value="top">{t('common.top')}</option>
            <option value="left">{t('common.left')}</option>
          </select>
        </div>
        <div className="setting-row">
          <label>{t('legend.titleWritingMode')}</label>
          <select
            value={lg.titleWritingMode ?? 'horizontal'}
            onChange={(e) => update({ titleWritingMode: e.target.value as LegendTitleWritingMode })}
          >
            <option value="horizontal">{t('legend.writing.horizontal')}</option>
            <option value="vertical">{t('legend.writing.vertical')}</option>
          </select>
        </div>
        <div className="setting-row">
          <label>{t('legend.titleAlign')}</label>
          <select
            value={lg.titleAlign ?? 'left'}
            onChange={(e) => update({ titleAlign: e.target.value as LegendTitleAlign })}
          >
            <option value="left">{t('legend.align.left')}</option>
            <option value="center">{t('legend.align.center')}</option>
            <option value="right">{t('legend.align.right')}</option>
          </select>
        </div>
        {lg.titlePosition === 'left' && (
          <div className="setting-row">
            <label>{t('legend.titleVerticalAlign')}</label>
            <select
              value={lg.titleVerticalAlign ?? 'top'}
              onChange={(e) => update({ titleVerticalAlign: e.target.value as LegendTitleVerticalAlign })}
            >
              <option value="top">{t('legend.vAlign.top')}</option>
              <option value="middle">{t('common.middle')}</option>
              <option value="bottom">{t('legend.vAlign.bottom')}</option>
            </select>
          </div>
        )}
        <FontFamilyRow rowClassName="setting-row" label={t('legend.titleFont')}
          value={lg.titleFontFamily}
          onChange={(v) => update({ titleFontFamily: v })}
          emptyOptionLabel={t('legend.sameAsBody')} />
        <FontSizeRow rowClassName="setting-row" label={t('legend.titleSize')}
          value={lg.titleFontSize}
          onChange={(v) => update({ titleFontSize: v })}
          emptyAllowed
          placeholderText={t('legend.titleSize.default', { n: Math.round(lg.fontSize * 1.15) })} />
        <div className="setting-row">
          <label>{t('legend.titleDecoration')}</label>
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              className={lg.titleBold !== false ? 'style-btn active' : 'style-btn'}
              onClick={() => update({ titleBold: !(lg.titleBold !== false) })}
              title={t('common.bold')}
            ><b>B</b></button>
            <button
              className={lg.titleItalic ? 'style-btn active' : 'style-btn'}
              onClick={() => update({ titleItalic: !lg.titleItalic })}
              title={t('common.italic')}
            ><i>I</i></button>
            <button
              className={lg.titleUnderline ? 'style-btn active' : 'style-btn'}
              onClick={() => update({ titleUnderline: !lg.titleUnderline })}
              title={t('common.underline')}
            ><u>U</u></button>
          </div>
        </div>
      </section>

      <section className="settings-section">
        <h4>{t('common.layout')}</h4>
        <p className="hint" style={{ marginTop: 0 }}>
          {t('legend.layout.hint1')}<br />
          {t('legend.layout.hint2')}
        </p>
        {/* === 横型レイアウト === */}
        <div className="setting-row">
          <label>{t('legend.horizontal.mode')}</label>
          <select
            value={lg.layoutModeHorizontal === 'rows' ? 'rows' : 'columns'}
            onChange={(e) => update({ layoutModeHorizontal: e.target.value as 'columns' | 'rows' })}
          >
            <option value="columns">{t('legend.mode.columns')}</option>
            <option value="rows">{t('legend.mode.rows')}</option>
          </select>
        </div>
        {lg.layoutModeHorizontal === 'rows' ? (
          <div className="setting-row">
            <label>{t('legend.horizontal.rows')}</label>
            <input
              type="number"
              min={1}
              value={lg.rowsHorizontal ?? 1}
              onChange={(e) => update({ rowsHorizontal: Math.max(1, Number(e.target.value)) })}
              style={{ width: 70 }}
            />
          </div>
        ) : (
          <div className="setting-row">
            <label>{t('legend.horizontal.columns')}</label>
            <input
              type="number"
              min={1}
              value={lg.columnsHorizontal ?? 1}
              onChange={(e) => update({ columnsHorizontal: Math.max(1, Number(e.target.value)) })}
              style={{ width: 70 }}
            />
          </div>
        )}
        {/* === 縦型レイアウト === */}
        <div className="setting-row">
          <label>{t('legend.vertical.mode')}</label>
          <select
            value={lg.layoutModeVertical === 'rows' ? 'rows' : 'columns'}
            onChange={(e) => update({ layoutModeVertical: e.target.value as 'columns' | 'rows' })}
          >
            <option value="columns">{t('legend.mode.columns')}</option>
            <option value="rows">{t('legend.mode.rows')}</option>
          </select>
        </div>
        {lg.layoutModeVertical === 'rows' ? (
          <div className="setting-row">
            <label>{t('legend.vertical.rows')}</label>
            <input
              type="number"
              min={1}
              value={lg.rowsVertical ?? 1}
              onChange={(e) => update({ rowsVertical: Math.max(1, Number(e.target.value)) })}
              style={{ width: 70 }}
            />
          </div>
        ) : (
          <div className="setting-row">
            <label>{t('legend.vertical.columns')}</label>
            <input
              type="number"
              min={1}
              value={lg.columnsVertical ?? 1}
              onChange={(e) => update({ columnsVertical: Math.max(1, Number(e.target.value)) })}
              style={{ width: 70 }}
            />
          </div>
        )}
        <div className="setting-row">
          <label>{t('legend.sampleWidth')}</label>
          <input
            type="number"
            min={4}
            max={200}
            value={lg.sampleWidth ?? 32}
            onChange={(e) => update({ sampleWidth: Math.max(4, Number(e.target.value)) })}
            style={{ width: 80 }}
          />
        </div>
        <div className="setting-row">
          <label>{t('legend.sampleHeight')}</label>
          <input
            type="number"
            min={4}
            max={200}
            value={lg.sampleHeight ?? 18}
            onChange={(e) => update({ sampleHeight: Math.max(4, Number(e.target.value)) })}
            style={{ width: 80 }}
          />
        </div>
        <FontFamilyRow rowClassName="setting-row" label={t('legend.bodyFont')}
          value={lg.fontFamily}
          onChange={(v) => update({ fontFamily: v })}
          emptyOptionLabel={t('legend.uiDefault')} />
        <FontSizeRow rowClassName="setting-row" label={t('legend.bodyFontSize')}
          value={lg.fontSize}
          onChange={(v) => v !== undefined && update({ fontSize: v })}
          min={8} max={30} fallbackValue={11} />
        <div className="setting-row">
          <label>{t('legend.minWidth')}</label>
          <input
            type="number"
            min={50}
            max={800}
            value={lg.minWidth}
            onChange={(e) => update({ minWidth: Number(e.target.value) })}
            style={{ width: 70 }}
          />
        </div>
        <div className="setting-row">
          <label>{t('legend.showDescriptions')}</label>
          <input
            type="checkbox"
            checked={lg.showDescriptions === true}
            onChange={(e) => update({ showDescriptions: e.target.checked })}
          />
        </div>
      </section>

      <section className="settings-section">
        <h4>{t('legend.fixedSize')}</h4>
        <p className="hint" style={{ marginTop: 0 }}>
          {t('legend.fixedSize.hint1')}
          {t('legend.fixedSize.hint2')}
        </p>
        <div className="setting-row">
          <label>{t('legend.width')}</label>
          <input
            type="number"
            min={0}
            step={1}
            value={lg.width ?? ''}
            placeholder={t('common.auto')}
            onChange={(e) => {
              const v = e.target.value;
              update({ width: v === '' ? undefined : Math.max(40, Number(v)) });
            }}
            style={{ width: 100 }}
          />
        </div>
        <div className="setting-row">
          <label>{t('legend.height')}</label>
          <input
            type="number"
            min={0}
            step={1}
            value={lg.height ?? ''}
            placeholder={t('common.auto')}
            onChange={(e) => {
              const v = e.target.value;
              update({ height: v === '' ? undefined : Math.max(20, Number(v)) });
            }}
            style={{ width: 100 }}
          />
        </div>
        <div className="setting-row" style={{ justifyContent: 'flex-start', gap: 6 }}>
          <button className="ribbon-btn-small" onClick={() => update({ width: undefined, height: undefined })}>
            {t('legend.resetSize')}
          </button>
        </div>
      </section>

      <section className="settings-section">
        <h4>{t('legend.backgroundAndBorder')}</h4>
        <div className="setting-row">
          <label>{t('legend.background')}</label>
          <select
            value={lg.backgroundStyle ?? 'white'}
            onChange={(e) => update({ backgroundStyle: e.target.value as LegendBackgroundStyle })}
          >
            <option value="white">{t('legend.background.white')}</option>
            <option value="none">{t('legend.background.none')}</option>
          </select>
        </div>
        <div className="setting-row">
          <label>{t('legend.borderWidth')}</label>
          <input
            type="number"
            min={0}
            max={10}
            step={0.1}
            value={lg.borderWidth ?? 1}
            onChange={(e) => update({ borderWidth: Math.max(0, Number(e.target.value)) })}
            style={{ width: 80 }}
          />
        </div>
        <ColorRow rowClassName="setting-row" label={t('common.lineColor')}
          value={lg.borderColor}
          onChange={(c) => update({ borderColor: c ?? '#999999' })}
          defaultLabel={t('common.defaultColor', { color: '#999999' })}
        />
      </section>

      <section className="settings-section">
        <h4>{t('legend.separator')}</h4>
        <div className="setting-row">
          <label>{t('common.show')}</label>
          <input
            type="checkbox"
            checked={lg.titleSeparatorVisible !== false}
            onChange={(e) => update({ titleSeparatorVisible: e.target.checked })}
          />
        </div>
        <div
          style={{
            opacity: lg.titleSeparatorVisible === false ? 0.4 : 1,
            pointerEvents: lg.titleSeparatorVisible === false ? 'none' : undefined,
          }}
        >
          <ColorRow rowClassName="setting-row" label={t('legend.separator.color')}
            value={lg.titleSeparatorColor}
            onChange={(c) => update({ titleSeparatorColor: c ?? '#dddddd' })}
            defaultLabel={t('common.defaultColor', { color: '#dddddd' })}
          />
        </div>
      </section>

      <section className="settings-section">
        <CollapsibleSection title={t('legend.overrides')} sectionKey="settings-legend-item-overrides" defaultOpen={false}>
        <p className="hint" style={{ marginBottom: 6 }}>
          {t('legend.overrides.hint1')}
          {t('legend.overrides.hint2')}
        </p>
        {currentItems.length > 0 && (
          <div
            className="setting-row"
            style={{ justifyContent: 'flex-start', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}
          >
            <span style={{ color: '#555', fontSize: '0.9em' }}>{t('legend.overrides.allSecondLine')}</span>
            <button
              className="ribbon-btn-small"
              onClick={() => {
                currentItems.forEach((item) => {
                  setOverride(`${item.category}:${item.key}`, { showDescription: true });
                });
              }}
            >
              {t('legend.overrides.showAll')}
            </button>
            <button
              className="ribbon-btn-small"
              onClick={() => {
                currentItems.forEach((item) => {
                  setOverride(`${item.category}:${item.key}`, { showDescription: false });
                });
              }}
            >
              {t('legend.overrides.hideAll')}
            </button>
            <button
              className="ribbon-btn-small"
              onClick={() => {
                currentItems.forEach((item) => {
                  setOverride(`${item.category}:${item.key}`, { showDescription: undefined });
                });
              }}
              title={t('legend.overrides.resetAll.tip')}
            >
              {t('legend.overrides.resetAll')}
            </button>
          </div>
        )}
        {currentItems.length === 0 && <p className="hint">{t('legend.overrides.empty')}</p>}
        {currentItems.map((item) => {
          const key = `${item.category}:${item.key}`;
          const ov = lg.itemOverrides?.[key] ?? {};
          const showDesc = ov.showDescription ?? (lg.showDescriptions === true);
          return (
            <div
              key={key}
              style={{
                border: '1px solid #eee',
                borderRadius: 4,
                padding: 8,
                marginBottom: 6,
                background: '#fafafa',
              }}
            >
              <div style={{ fontSize: '0.85em', color: '#666', marginBottom: 4 }}>
                <code>{key}</code>
              </div>
              <div className="setting-row">
                <label>{t('legend.overrides.label')}</label>
                <input
                  type="text"
                  value={ov.label ?? ''}
                  placeholder={item.label}
                  onChange={(e) => setOverride(key, { label: e.target.value || undefined })}
                  style={{ width: 200 }}
                />
              </div>
              <div className="setting-row">
                <label>{t('legend.overrides.description')}</label>
                <input
                  type="text"
                  value={ov.description ?? ''}
                  placeholder={item.description}
                  onChange={(e) => setOverride(key, { description: e.target.value || undefined })}
                  style={{ width: 240 }}
                />
              </div>
              <div className="setting-row">
                <label>{t('legend.overrides.showDescription')}</label>
                <select
                  value={ov.showDescription === undefined ? '' : ov.showDescription ? 'true' : 'false'}
                  onChange={(e) => {
                    const v = e.target.value;
                    setOverride(key, {
                      showDescription: v === '' ? undefined : v === 'true',
                    });
                  }}
                >
                  <option value="">{showDesc ? t('legend.overrides.inheritShown') : t('legend.overrides.inheritHidden')}</option>
                  <option value="true">{t('common.show')}</option>
                  <option value="false">{t('common.hide')}</option>
                </select>
              </div>
              <div className="setting-row">
                <button
                  className="danger-btn"
                  onClick={() => clearOverride(key)}
                  style={{ fontSize: '0.8em' }}
                >
                  {t('legend.overrides.clear')}
                </button>
              </div>
            </div>
          );
        })}
        </CollapsibleSection>
      </section>

      <p className="hint">{t('legend.footer.hint')}</p>
    </div>
  );
}

// ============================================================================
// Time arrow
// ============================================================================
function TimeArrowSettingsSection() {
  const { t } = useTranslation('settingsDialog');
  const doc = useTEMStore((s) => s.doc);
  const ta = doc.settings.timeArrow;

  const update = (patch: Partial<TimeArrowSettings>) => {
    useTEMStore.setState((state) => ({
      doc: produce(state.doc, (d) => {
        d.settings.timeArrow = { ...d.settings.timeArrow, ...patch };
      }),
    }));
  };

  return (
    <section className="settings-section">
      <div className="setting-row">
        <label>{t('timeArrow.autoInsert')}</label>
        <input
          type="checkbox"
          checked={ta.autoInsert}
          onChange={(e) => update({ autoInsert: e.target.checked })}
        />
      </div>
      <div className="setting-row">
        <label>{t('timeArrow.alwaysVisible')}</label>
        <input
          type="checkbox"
          checked={ta.alwaysVisible}
          onChange={(e) => update({ alwaysVisible: e.target.checked })}
        />
      </div>
      <div className="setting-row">
        <label>{t('timeArrow.startExtension')}</label>
        <input
          type="number"
          step="0.5"
          value={ta.timeStartExtension}
          onChange={(e) => update({ timeStartExtension: Number(e.target.value) })}
          style={{ width: 70 }}
        />
      </div>
      <div className="setting-row">
        <label>{t('timeArrow.endExtension')}</label>
        <input
          type="number"
          step="0.5"
          value={ta.timeEndExtension}
          onChange={(e) => update({ timeEndExtension: Number(e.target.value) })}
          style={{ width: 70 }}
        />
      </div>
      <div className="setting-row">
        <label>{t('common.itemReference')}</label>
        <select
          value={ta.itemReference}
          onChange={(e) => update({ itemReference: e.target.value as 'min' | 'max' })}
        >
          <option value="max">{t('common.itemReference.max')}</option>
          <option value="min">{t('common.itemReference.min')}</option>
        </select>
      </div>
      <div className="setting-row">
        <label>{t('timeArrow.itemOffset')}</label>
        <input
          type="number"
          step="0.5"
          value={ta.itemOffset}
          onChange={(e) => update({ itemOffset: Number(e.target.value) })}
          style={{ width: 70 }}
          title={t('timeArrow.itemOffset.tip')}
        />
      </div>
      <div className="setting-row">
        <label>{t('common.label')}</label>
        <input
          type="text"
          value={ta.label}
          onChange={(e) => update({ label: e.target.value })}
          style={{ width: 180 }}
        />
      </div>
      <div className="setting-row">
        <label>{t('common.labelSideHorizontal')}</label>
        <select
          value={ta.labelSideHorizontal ?? 'bottom'}
          onChange={(e) => update({ labelSideHorizontal: e.target.value as HorizontalLabelSide })}
        >
          <option value="top">{t('common.top')}</option>
          <option value="bottom">{t('common.bottom')}</option>
        </select>
      </div>
      <div className="setting-row">
        <label>{t('common.labelSideVertical')}</label>
        <select
          value={ta.labelSideVertical ?? 'left'}
          onChange={(e) => update({ labelSideVertical: e.target.value as VerticalLabelSide })}
        >
          <option value="left">{t('common.left')}</option>
          <option value="right">{t('common.right')}</option>
        </select>
      </div>
      <div className="setting-row">
        <label>{t('timeArrow.labelOffset')}</label>
        <input
          type="number"
          min={0}
          step={1}
          value={ta.labelOffset ?? 4}
          onChange={(e) => update({ labelOffset: Math.max(0, Number(e.target.value)) })}
          style={{ width: 80 }}
        />
      </div>
      <div className="setting-row">
        <label>{t('timeArrow.labelAlignHorizontal')}</label>
        <select
          value={ta.labelAlignHorizontal ?? 'center'}
          onChange={(e) => update({ labelAlignHorizontal: e.target.value as TimeArrowLabelAlignHorizontal })}
        >
          <option value="center">{t('common.center')}</option>
          <option value="end">{t('timeArrow.labelAlign.end')}</option>
        </select>
      </div>
      <div className="setting-row">
        <label>{t('timeArrow.labelAlignVertical')}</label>
        <select
          value={ta.labelAlignVertical ?? 'center'}
          onChange={(e) => update({ labelAlignVertical: e.target.value as TimeArrowLabelAlignVertical })}
        >
          <option value="center">{t('common.center')}</option>
          <option value="start">{t('timeArrow.labelAlign.start')}</option>
        </select>
      </div>
      <FontFamilyRow rowClassName="setting-row" label={t('timeArrow.labelFont')}
        value={ta.labelFontFamily}
        onChange={(v) => update({ labelFontFamily: v })}
        emptyOptionLabel={t('timeArrow.uiDefault')} />
      <div className="setting-row">
        <label>{t('timeArrow.labelDecoration')}</label>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            className={ta.labelBold ? 'style-btn active' : 'style-btn'}
            onClick={() => update({ labelBold: !ta.labelBold })}
            title={t('common.bold')}
          ><b>B</b></button>
          <button
            className={ta.labelItalic ? 'style-btn active' : 'style-btn'}
            onClick={() => update({ labelItalic: !ta.labelItalic })}
            title={t('common.italic')}
          ><i>I</i></button>
          <button
            className={ta.labelUnderline ? 'style-btn active' : 'style-btn'}
            onClick={() => update({ labelUnderline: !ta.labelUnderline })}
            title={t('common.underline')}
          ><u>U</u></button>
        </div>
      </div>
      <div className="setting-row">
        <label>{t('timeArrow.strokeWidth')}</label>
        <input
          type="number"
          min={0.5}
          step="0.5"
          value={ta.strokeWidth}
          onChange={(e) => update({ strokeWidth: Number(e.target.value) })}
          style={{ width: 70 }}
        />
      </div>
      <div className="setting-row">
        <label>{t('common.fontSize')}</label>
        <input
          type="number"
          min={8}
          max={40}
          value={ta.fontSize}
          onChange={(e) => update({ fontSize: Number(e.target.value) })}
          style={{ width: 70 }}
        />
      </div>
    </section>
  );
}
