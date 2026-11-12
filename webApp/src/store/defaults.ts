// ============================================================================
// Default values and factory functions
// ============================================================================

import type {
  LayoutDirection,
  ProjectSettings,
  Sheet,
  TEMDocument,
  ViewState,
  Box,
  Line,
  SDSG,
  PeriodLabel,
  Locale,
} from '../types';
import i18n from '../i18n';
import { initialUILanguage } from '../utils/uiLanguage';

export const DEFAULT_SETTINGS: ProjectSettings = {
  layout: 'horizontal',
  locale: 'ja',
  gridSize: 10,
  snap: {
    alignGuides: true,
    distanceSnap: true,
    distancePx: 20,
    gridSnap: false,
    gridPx: 10,
  },
  showLegend: true,
  legendPosition: 'right',
  timelineLabel: { ja: '非可逆的時間', en: 'Irreversible Time' }, // i18n-ok 日英の対そのもの
  timelineAutoInsert: true,
  defaultFont: 'system-ui',
  defaultFontSize: 13,
  defaultBoxSize: { width: 60, height: 100 },
  defaultAutoFitText: false,
  defaultAutoFitBox: false,
  defaultAutoFitBoxMode: 'width-fixed',
  paperGuides: [
    { enabled: false, size: 'A4-landscape', baseSize: 'A4', color: '#000000', pageCount: 2, maskOutside: true },
  ],
  uiFontSize: 13,
  ribbonFontSize: 12,
  levelStep: 0.5,
  timeArrow: {
    autoInsert: true,
    alwaysVisible: true,
    timeStartExtension: -0.5,
    timeEndExtension: 0.5,
    // 既定: 下部（min Item_Level 基準、offset=0 でちょうどその位置）
    itemReference: 'min',
    itemOffset: 0,
    label: '非可逆的時間', // i18n-ok 日本語の図の既定値（新しい図は createDefaultSettings が図の言語で入れる）
    strokeWidth: 2.5,
    fontSize: 14,
    labelSideHorizontal: 'bottom',
    labelSideVertical: 'left',
    labelBold: false,
    labelItalic: false,
    labelUnderline: false,
    labelOffset: 4,
    labelAlignHorizontal: 'center',
    labelAlignVertical: 'center',
  },
  legend: {
    autoGenerate: true,
    alwaysVisible: true,
    includeInExport: true,
    // 横型で IL=-5 / TL=0 が左上端になる位置（storage 座標: x=0, y=500）
    position: { x: 0, y: 500 },
    includeBoxes: true,
    includeLines: true,
    includeSDSG: true,
    includeTimeArrow: false,
    title: '凡例', // i18n-ok 日本語の図の既定値（新しい図は createDefaultSettings が図の言語で入れる）
    fontSize: 11,
    minWidth: 200,
    showDescriptions: false,
    columns: 1,
    columnsHorizontal: 1,
    columnsVertical: 1,
    showTitle: true,
    titleBold: true,
    titleItalic: false,
    titleUnderline: false,
    titleAlign: 'left',
    titlePosition: 'top',
    titleWritingMode: 'horizontal',
    titleVerticalAlign: 'top',
    backgroundStyle: 'white',
    borderWidth: 1,
    borderColor: '#999',
    sampleWidth: 32,
    sampleHeight: 18,
    titleSeparatorVisible: true,
    titleSeparatorColor: '#dddddd',
    itemOverrides: {},
  },
  periodLabels: {
    alwaysVisible: true,
    includeInExport: true,
    itemReference: 'max',
    itemOffset: 0,
    fontSize: 13,
    showDividers: true,
    dividerStrokeWidth: 1,
    bandStyle: 'band',
    labelSideHorizontal: 'top',
    labelSideVertical: 'right',
  },
  typeLabelVisibility: {
    BFP: true,
    EFP: true,
    'P-EFP': true,
    OPP: true,
    '2nd-EFP': true,
    'P-2nd-EFP': true,
    SD: true,
    SG: true,
  },
  sdsgSpace: {
    enabled: false,
    bands: {
      top: {
        enabled: true,
        heightMode: 'auto',
        heightLevel: 1.5,
        reference: 'boxes',       // Box 群の外側を既定（時期区分/時間矢印は別途選択可）
        offsetLevel: 0.2,
        showBorder: true,
        borderColor: '#9b59b6',
        fillStyle: 'tinted',
        labelPosition: 'top-left',
        shrinkToFitRow: false,
        autoExpandHeight: false,
      },
      bottom: {
        enabled: true,
        heightMode: 'auto',
        heightLevel: 1.5,
        reference: 'boxes',       // Box 群の外側を既定
        offsetLevel: 0.2,
        showBorder: true,
        borderColor: '#27ae60',
        fillStyle: 'tinted',
        labelPosition: 'top-left',
        shrinkToFitRow: false,
        autoExpandHeight: false,
      },
    },
    autoPlaceSD: 'top',
    autoPlaceSG: 'bottom',
    allowMismatchedPlacement: false,
    autoArrange: true,
    autoFlipDirectionInBand: false,
  },
};

// snapEnabled は localStorage に保存してプロジェクト跨ぎでユーザ好みを維持
const SNAP_ENABLED_KEY = 'temer:snapEnabled';
function readSnapEnabled(): boolean {
  try {
    const v = localStorage.getItem(SNAP_ENABLED_KEY);
    if (v === null) return true;
    return v === '1';
  } catch { return true; }
}
export function writeSnapEnabled(on: boolean): void {
  try { localStorage.setItem(SNAP_ENABLED_KEY, on ? '1' : '0'); } catch { /* noop */ }
}

export const DEFAULT_VIEW_STATE: ViewState = {
  zoom: 1,
  panX: 0,
  panY: 0,
  showGrid: true,
  showHandles: true,
  showPaperGuides: false,
  showLegend: true,
  showComments: true,
  showBoxIds: true,
  showSDSGIds: true,
  showLineIds: false,
  showTopRuler: true,
  showLeftRuler: true,
  dataSheetVisible: false,
  propertyPanelVisible: true,
  snapEnabled: readSnapEnabled(),
  commentMode: true,   // コメントの印を出す（リボン「表示 > コメント」で隠せる。2026-11-10）
  canvasMode: 'move',
  dataSheetWidth: 360,
  propertyPanelWidth: 300,
};

// 1 level = 100px（ユーザ要望で統一）
export const LEVEL_PX = 100;
export const MINOR_TICK_PX = 10;

// Available fonts (bundled system fonts)
// - 表示名は画面の言語。訳す名前は labelKey（defaults の翻訳の表）で持ち、使う時に fontOptionLabel で引く
export interface FontOption { value: string; label?: string; labelKey?: string }
export const FONT_OPTIONS: FontOption[] = [
  { value: 'system-ui', labelKey: 'defaults:font.system' },
  { value: '"Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif', labelKey: 'defaults:font.hiraginoYuGothic' },
  { value: '"Yu Mincho", "Hiragino Mincho Pro", "Yu Mincho Light", serif', labelKey: 'defaults:font.yuMinchoHiraginoMincho' },
  { value: '"Meiryo", "メイリオ", sans-serif', labelKey: 'defaults:font.meiryo' }, // i18n-ok フォントの CSS の値
  { value: '"Noto Sans JP", sans-serif', label: 'Noto Sans JP' },
  { value: '"Noto Serif JP", serif', label: 'Noto Serif JP' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: '"Times New Roman", serif', label: 'Times New Roman' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: '"Courier New", monospace', label: 'Courier New' },
];

/** フォントの選択肢の表示名（画面の言語） */
export function fontOptionLabel(f: FontOption): string {
  if (f.labelKey) return i18n.t(f.labelKey);
  return f.label ?? f.value;
}

// ----------------------------------------------------------------------------
// ID generators
// ----------------------------------------------------------------------------

const genId = (prefix: string): string =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

// 旧ExcelマクロのID命名規則に準拠した prefix
// dic_fig_type に対応: Type → Prefix
export const ID_PREFIXES: Record<string, string> = {
  'normal':      'Item',
  'other':       'Other',
  'BFP':         'BFP',
  'EFP':         'EFP',
  'P-EFP':       'P_EFP',
  'OPP':         'OPP',
  'annotation':  'Latent',  // 潜在経験
  '2nd-EFP':     'EFP2',
  'P-2nd-EFP':   'P_EFP2',
};

// 種別別に連番を付けたIDを生成（Excel マクロ準拠）
// 既存IDから最大値を見つけて +1
export function genBoxIdByType(type: string, existingIds: string[]): string {
  const prefix = ID_PREFIXES[type] ?? 'Item';
  const pattern = new RegExp(`^${prefix}(\\d+)$`);
  let maxNum = 0;
  for (const id of existingIds) {
    const m = id.match(pattern);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n > maxNum) maxNum = n;
    }
  }
  return `${prefix}${maxNum + 1}`;
}

// 種別連番の共通ヘルパー（prefix + 既存 ID の最大値 +1）
function nextSequentialId(prefix: string, existingIds: string[]): string {
  const pattern = new RegExp(`^${prefix}(\\d+)$`);
  let maxNum = 0;
  for (const id of existingIds) {
    const m = id.match(pattern);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n > maxNum) maxNum = n;
    }
  }
  return `${prefix}${maxNum + 1}`;
}

// Line ID: RLine → RL_n / XLine → XL_n（addLine と同一規則。貼付でも使う）
export function genLineIdByType(lineType: string, existingIds: string[]): string {
  return nextSequentialId(lineType === 'XLine' ? 'XL_' : 'RL_', existingIds);
}

// SDSG ID: SD → SD1 / SG → SG1（addSDSG と同一規則。貼付でも使う）
export function genSDSGIdByType(type: 'SD' | 'SG', existingIds: string[]): string {
  return nextSequentialId(type, existingIds);
}

export const genBoxId = () => genId('Box');  // fallback (random) - 使用しない方針
// 非推奨（種別を見ないランダム ID）。ID 規則を統一するため genLineIdByType /
// genSDSGIdByType を使う。旧ファイル互換のため export は残す。
export const genLineId = () => genId('L');
export const genSDSGId = () => genId('SG');
export const genAnnotationId = () => genId('Ann');
export const genCommentId = () => genId('C');
export const genPeriodId = () => genId('P');
export const genSheetId = () => genId('Sheet');
export const genParticipantId = () => genId('Part');
// Phase 4: 原文連動
export const genTranscriptId = () => genId('Tr');
export const genParagraphId = () => genId('Pa');
export const genSourceRefId = () => genId('Sr');
export const genSegmentId = () => genId('Seg');

// ----------------------------------------------------------------------------
// Factories
// ----------------------------------------------------------------------------

export function createEmptySheet(name: string, order: number): Sheet {
  return {
    id: genSheetId(),
    name,
    type: 'individual',
    order,
    boxes: [],
    lines: [],
    sdsg: [],
    notes: [],
    comments: [],
    periodLabels: [],
  };
}

/** 画面の言語（新しい図の言語の既定。i18n の初期化前は利用者の好み・ブラウザの言語） */
export function currentUILocale(): Locale {
  const lng = i18n.resolvedLanguage ?? i18n.language ?? initialUILanguage();
  return lng.startsWith('en') ? 'en' : 'ja';
}

/**
 * 新しい図の設定（図の言語 locale と、図に入る既定の文字＝非可逆的時間の矢印のラベル・凡例の題を図の言語で入れる）。
 * 既存のファイルを開いたときは使わない（そのファイルの locale と文字を使う）
 */
export function createDefaultSettings(locale: Locale = currentUILocale()): ProjectSettings {
  return {
    ...DEFAULT_SETTINGS,
    locale,
    timeArrow: { ...DEFAULT_SETTINGS.timeArrow, label: i18n.t('terms:timeArrow', { lng: locale }) },
    // 新しい図の凡例は自動で時間の矢印の右下に置く（既存の図は placement が無いので手動のまま。2026-11-10）
    legend: { ...DEFAULT_SETTINGS.legend, title: i18n.t('terms:legend', { lng: locale }), placement: 'auto' },
  };
}

/**
 * Box の文字を縦書きにするか。横型の図で、図の言語が日本語・中国語のときだけ（2026-11-08）。
 * 英語などを縦書きにすると 1 字ずつ縦に積まれて読めないので、横書き・横長の Box にする
 */
export function usesVerticalBoxText(layout: LayoutDirection, locale?: string): boolean {
  const l = (locale ?? 'ja').toLowerCase();
  return layout === 'horizontal' && (l.startsWith('ja') || l.startsWith('zh'));
}

export function createSampleSheet(name: string, order: number, locale: Locale = currentUILocale()): Sheet {
  const sheet = createEmptySheet(name, order);
  const tl = (key: string, opts: Record<string, unknown> = {}) => i18n.t(key, { ...opts, lng: locale });
  // 標準構成:
  //   Item1(出発点) → OPP1(必須通過点) → BFP1(分岐点) → EFP1(等至点) / P_EFP1(両極化した等至点)
  //   SD / SG は BFP1 に紐づけ
  //   時期1 = 出発点〜等至点、時期2 = 等至点以降
  const boxes: Box[] = [
    { id: 'Item1',  type: 'normal', label: tl('defaults:sample.start'), x: 100, y: 200, width: 60, height: 100, textOrientation: 'vertical' },
    { id: 'OPP1',   type: 'OPP',    label: tl('defaults:sample.opp'), x: 300, y: 200, width: 60, height: 120, textOrientation: 'vertical' },
    { id: 'BFP1',   type: 'BFP',    label: tl('defaults:sample.bfp'), x: 500, y: 200, width: 60, height: 100, textOrientation: 'vertical' },
    { id: 'EFP1',   type: 'EFP',    label: tl('defaults:sample.efp'), x: 700, y: 100, width: 70, height: 120, textOrientation: 'vertical' },
    { id: 'P_EFP1', type: 'P-EFP',  label: tl('defaults:sample.pefp'), x: 700, y: 300, width: 70, height: 120, textOrientation: 'vertical' },
  ];
  // 英語などの図は横書き・横長の Box にする（中心はそのまま）
  if (!usesVerticalBoxText('horizontal', locale)) {
    for (const b of boxes) {
      const cx = b.x + b.width / 2, cy = b.y + b.height / 2;
      [b.width, b.height] = [b.height, b.width];
      b.x = cx - b.width / 2; b.y = cy - b.height / 2;
      b.textOrientation = 'horizontal';
    }
  }
  const lines: Line[] = [
    { id: 'RL_1', type: 'RLine', from: 'Item1', to: 'OPP1',   connectionMode: 'center-to-center', shape: 'straight' },
    { id: 'RL_2', type: 'RLine', from: 'OPP1',  to: 'BFP1',   connectionMode: 'center-to-center', shape: 'straight' },
    { id: 'RL_3', type: 'RLine', from: 'BFP1',  to: 'EFP1',   connectionMode: 'center-to-center', shape: 'straight' },
    { id: 'XL_1', type: 'XLine', from: 'BFP1',  to: 'P_EFP1', connectionMode: 'center-to-center', shape: 'straight' },
  ];
  // SD / SG を分岐点(BFP1) に配置。既定サイズ 70x40
  const sdsg: SDSG[] = [
    { id: 'SD1', type: 'SD', label: 'SD', attachedTo: 'BFP1', attachedType: 'box', itemOffset: -120, timeOffset: 0, width: 70, height: 40 },
    { id: 'SG1', type: 'SG', label: 'SG', attachedTo: 'BFP1', attachedType: 'box', itemOffset: 130,  timeOffset: 0, width: 70, height: 40 },
  ];
  // 時期ラベル: 時期1 (出発点〜等至点中央あたり)、時期2 (等至点以降)
  // Item 左端 x=100 → timeLevel=1, EFP x=700 → timeLevel=7
  // 中央 ≒ timeLevel=4（時期1）、timeLevel=7.5（時期2）
  const periodLabels: PeriodLabel[] = [
    { id: genPeriodId(), position: 4,   label: tl('defaults:sample.period', { n: 1 }) },
    { id: genPeriodId(), position: 7.5, label: tl('defaults:sample.period', { n: 2 }) },
  ];
  sheet.boxes = boxes;
  sheet.lines = lines;
  sheet.sdsg = sdsg;
  sheet.periodLabels = periodLabels;
  return sheet;
}

/** 新しい空の図。図の言語は画面の言語（locale を渡せばそれ） */
export function createEmptyDocument(locale: Locale = currentUILocale()): TEMDocument {
  const sheet = createEmptySheet('Sheet 1', 0);
  return {
    version: '0.4',
    sheets: [sheet],
    activeSheetId: sheet.id,
    participants: [],
    settings: createDefaultSettings(locale),
    metadata: {
      title: 'Untitled TEM',
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    },
    history: [],
    transcripts: [],
  };
}

export function createSampleDocument(locale: Locale = currentUILocale()): TEMDocument {
  const sheet = createSampleSheet(i18n.t('defaults:sample.sheetName', { lng: locale }), 0, locale);
  return {
    version: '0.4',
    sheets: [sheet],
    activeSheetId: sheet.id,
    participants: [
      { id: genParticipantId(), pseudonym: 'A' },
    ],
    settings: createDefaultSettings(locale),
    metadata: {
      title: 'Sample TEM',
      author: i18n.t('defaults:sample.author', { lng: locale }),
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    },
    history: [],
    transcripts: [],
  };
}

// ----------------------------------------------------------------------------
// Literature-standard rendering specs per Box type
// ----------------------------------------------------------------------------

export interface BoxRenderSpec {
  borderStyle: 'solid' | 'double' | 'dashed' | 'dotted';
  borderWidth: number;
  defaultShape: 'rect' | 'ellipse';
}

export const BOX_RENDER_SPECS: Record<string, BoxRenderSpec> = {
  // 文献標準準拠（Arakawa 2012、Kawai 2016 など）。線種で種別を分ける。
  // 太さは 1 本線を 1.5、OPP と二重線（EFP・P-EFP とセカンド）を 3.0 にそろえた（2026-11-12 ユーザー決定・v0.2.3）。
  // 以前は BFP 2.0・P-EFP 2.5・潜在経験 1.0 と 5 段階に分かれていた。二重線の 3.0 は 2 本の合計（CSS の double は 3px 未満だと 1 本になる）
  normal:       { borderStyle: 'solid',  borderWidth: 1.5, defaultShape: 'rect' },
  other:        { borderStyle: 'solid',  borderWidth: 1.5, defaultShape: 'rect' },  // その他: 見た目は通常と同じ
  BFP:          { borderStyle: 'solid',  borderWidth: 1.5, defaultShape: 'rect' },
  EFP:          { borderStyle: 'double', borderWidth: 3.0, defaultShape: 'rect' },
  // P-EFP: 二重+点線（CSS単体では表現不可なので BoxNode で2重枠を特別描画）
  'P-EFP':      { borderStyle: 'dashed', borderWidth: 3.0, defaultShape: 'rect' },
  OPP:          { borderStyle: 'solid',  borderWidth: 3.0, defaultShape: 'rect' },
  annotation:   { borderStyle: 'dashed', borderWidth: 1.5, defaultShape: 'rect' },  // 潜在的な行為: 点線
  '2nd-EFP':    { borderStyle: 'double', borderWidth: 3.0, defaultShape: 'rect' },
  'P-2nd-EFP':  { borderStyle: 'dashed', borderWidth: 3.0, defaultShape: 'rect' },
};

export const BOX_TYPE_LABELS: Record<string, { ja: string; en: string; shortJa?: string }> = {
  normal:      { ja: '行為',               en: 'Action', shortJa: '行為' }, // i18n-ok 日本語の側の値（英語は en・用語は terms）
  other:       { ja: 'その他',             en: 'Other',  shortJa: 'その他' }, // i18n-ok 日本語の側の値（英語は en・用語は terms）
  BFP:         { ja: '分岐点',             en: 'BFP',    shortJa: 'BFP' }, // i18n-ok 日本語の側の値（英語は en・用語は terms）
  EFP:         { ja: '等至点',             en: 'EFP',    shortJa: 'EFP' }, // i18n-ok 日本語の側の値（英語は en・用語は terms）
  'P-EFP':     { ja: '両極化した等至点',       en: 'P-EFP',  shortJa: 'P-EFP' }, // i18n-ok 日本語の側の値（英語は en・用語は terms）
  OPP:         { ja: '必須通過点',         en: 'OPP',    shortJa: 'OPP' }, // i18n-ok 日本語の側の値（英語は en・用語は terms）
  annotation:  { ja: '潜在的な行為',       en: 'Potential action', shortJa: '潜在' }, // i18n-ok 日本語の側の値（英語は en・用語は terms）
  '2nd-EFP':   { ja: 'セカンド等至点',         en: '2nd EFP', shortJa: '2nd EFP' }, // i18n-ok 日本語の側の値（英語は en・用語は terms）
  'P-2nd-EFP': { ja: '両極化したセカンド等至点',   en: 'P-2nd EFP', shortJa: 'P-2nd' }, // i18n-ok 日本語の側の値（英語は en・用語は terms）
};

// Exported for testing / other consumers
export { genId };
