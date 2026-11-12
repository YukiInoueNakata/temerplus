// ============================================================================
// 凡例自動生成 - シートから使用記号を抽出
// ============================================================================

import type { Sheet, LegendSettings, BoxType, LayoutDirection, Locale } from '../types';
import { BOX_TYPE_LABELS } from '../store/defaults';

/**
 * 凡例の描画列数を算出する。
 * - layoutMode が 'columns' または未指定: 直接 columns 値を返す（既存挙動）
 * - layoutMode が 'rows': rows から ceil(items.length / rows) で逆算
 *
 * いずれも 1 以上に正規化される。
 */
export function computeLegendColumns(
  settings: LegendSettings,
  layout: LayoutDirection,
  itemCount: number,
): number {
  const mode = layout === 'vertical'
    ? settings.layoutModeVertical
    : settings.layoutModeHorizontal;
  if (mode === 'rows') {
    const rows = Math.max(1, Math.floor(
      (layout === 'vertical' ? settings.rowsVertical : settings.rowsHorizontal) ?? 1
    ));
    if (itemCount <= 0) return 1;
    return Math.max(1, Math.ceil(itemCount / rows));
  }
  const cols = (layout === 'vertical' ? settings.columnsVertical : settings.columnsHorizontal)
    ?? settings.columns ?? 1;
  return Math.max(1, Math.floor(cols));
}

/**
 * 凡例の 1 項目のラベルの欄の幅（px）。10 字ぶん（最小 100）を下限に、いちばん長いラベルが収まる幅にする。
 * 以前は 10 字ぶんの決め打ちで、簡素化方式の「実現しなかった行為・径路」（12 字）が SVG・PPTX で枠からはみ出した（2026-11-12）。
 * 1 字の幅は画面の見積もり（fitBounds.estimateLegendSize）と同じ 1.05em
 */
export function legendLabelCellPx(labels: string[], fontSize: number): number {
  const maxLen = Math.max(0, ...labels.map((l) => Array.from(l).length));
  return Math.max(100, fontSize * 10, maxLen * fontSize * 1.05);
}

export type LegendCategory = 'box' | 'line' | 'sdsg' | 'timeArrow';

export interface LegendItem {
  category: LegendCategory;
  key: string;
  label: string;
  description: string;
}

const BOX_DESCRIPTIONS: Record<BoxType, string> = {
  'normal':     '行為（実現した行為・経験）', // i18n-ok 凡例の日本語の側の値（英語は en の側・locale で切り替え済み）
  'BFP':        '分岐点 (Bifurcation Point)', // i18n-ok 凡例の日本語の側の値（英語は en の側・locale で切り替え済み）
  'EFP':        '等至点 (Equifinality Point)', // i18n-ok 凡例の日本語の側の値（英語は en の側・locale で切り替え済み）
  'P-EFP':      '両極化した等至点 (Polarized EFP)', // i18n-ok 凡例の日本語の側の値（英語は en の側・locale で切り替え済み）
  'OPP':        '必須通過点 (Obligatory Passage Point)', // i18n-ok 凡例の日本語の側の値（英語は en の側・locale で切り替え済み）
  'annotation': '潜在的な行為（実現しなかった行為）', // i18n-ok 凡例の日本語の側の値（英語は en の側・locale で切り替え済み）
  '2nd-EFP':    'セカンド等至点', // i18n-ok 凡例の日本語の側の値（英語は en の側・locale で切り替え済み）
  'P-2nd-EFP':  '両極化したセカンド等至点', // i18n-ok 凡例の日本語の側の値（英語は en の側・locale で切り替え済み）
  'other':      'その他', // i18n-ok 凡例の日本語の側の値（英語は en の側・locale で切り替え済み）
};

// 英語ロケール時の説明文（ラベル自体は BOX_TYPE_LABELS.en を使う）
const BOX_DESCRIPTIONS_EN: Record<BoxType, string> = {
  'normal':     'Action (realized action or experience)',
  'BFP':        'Bifurcation Point',
  'EFP':        'Equifinality Point',
  'P-EFP':      'Polarized Equifinality Point',
  'OPP':        'Obligatory Passage Point',
  'annotation': 'Potential action (unrealized action)',
  '2nd-EFP':    'Second Equifinality Point',
  'P-2nd-EFP':  'Polarized Second Equifinality Point',
  'other':      'Other',
};

// Box 以外の凡例項目（径路 / SD・SG / 非可逆的時間）のラベルと説明
const NON_BOX_TEXT = {
  ja: {
    RLine:     { label: '実線径路',     description: '実現した径路' }, // i18n-ok 凡例の日本語の側の値（英語は en の側・locale で切り替え済み）
    XLine:     { label: '点線径路',     description: '想定された（未実現）径路' }, // i18n-ok 凡例の日本語の側の値（英語は en の側・locale で切り替え済み）
    SD:        { label: 'SD',           description: '社会的方向づけ（径路を妨害する力）' }, // i18n-ok 凡例の日本語の側の値（英語は en の側・locale で切り替え済み）
    SG:        { label: 'SG',           description: '社会的助勢（径路を支援する力）' }, // i18n-ok 凡例の日本語の側の値（英語は en の側・locale で切り替え済み）
    timeArrow: { label: '非可逆的時間', description: '時間軸の方向' }, // i18n-ok 凡例の日本語の側の値（英語は en の側・locale で切り替え済み）
  },
  en: {
    RLine:     { label: 'Solid-line trajectory',  description: 'Realized trajectory' },
    XLine:     { label: 'Dotted-line trajectory', description: 'Imagined (unrealized) trajectory' },
    SD:        { label: 'SD',                description: 'Social Direction (force obstructing the trajectory)' },
    SG:        { label: 'SG',                description: 'Social Guidance (force supporting the trajectory)' },
    timeArrow: { label: 'Irreversible Time', description: 'Direction of the time axis' },
  },
} as const;

// 簡素化方式の凡例の 2 項目
const REALITY_TEXT = {
  ja: {
    observed:   { label: '実現した行為・径路',     description: '実線の Box と径路（データの中で確かめられた）' }, // i18n-ok 凡例の日本語の側の値（英語は en の側・locale で切り替え済み）
    unobserved: { label: '実現しなかった行為・径路', description: '点線の Box と径路（データの中では実現しなかった）' }, // i18n-ok 凡例の日本語の側の値（英語は en の側・locale で切り替え済み）
  },
  en: {
    observed:   { label: 'Realized action or trajectory',   description: 'Solid Boxes and trajectories (confirmed in the data)' },
    unobserved: { label: 'Unrealized action or trajectory', description: 'Dotted Boxes and trajectories (not realized in the data)' },
  },
} as const;

export function computeLegendItems(
  sheet: Sheet,
  settings: LegendSettings,
  locale: Locale = 'ja',
): LegendItem[] {
  const items: LegendItem[] = [];
  const isEn = locale === 'en';
  const txt = isEn ? NON_BOX_TEXT.en : NON_BOX_TEXT.ja;

  // 簡素化方式: 線種は実在性だけを表すので、Box と径路をまとめて実線・点線の 2 項目にする（2026-11-12 ユーザー指示）。
  // 見本は種別「行為」「潜在的な行為」の枠をテーマどおりに描く（キーをその種別にしてある）
  const realityOnly = settings.realityOnly === true && settings.includeBoxes;
  if (realityOnly) {
    const UNOBSERVED: BoxType[] = ['annotation', 'P-EFP', 'P-2nd-EFP'];
    const hasObserved = sheet.boxes.some((b) => !UNOBSERVED.includes(b.type)) || sheet.lines.some((l) => l.type === 'RLine');
    const hasUnobserved = sheet.boxes.some((b) => UNOBSERVED.includes(b.type)) || sheet.lines.some((l) => l.type === 'XLine');
    if (hasObserved) items.push({ category: 'box', key: 'normal', ...(isEn ? REALITY_TEXT.en.observed : REALITY_TEXT.ja.observed) });
    if (hasUnobserved) items.push({ category: 'box', key: 'annotation', ...(isEn ? REALITY_TEXT.en.unobserved : REALITY_TEXT.ja.unobserved) });
  }

  if (settings.includeBoxes && !realityOnly) {
    // 主種別に加え、併記種別も使用中として数える
    const usedTypes = new Set<BoxType>();
    sheet.boxes.forEach((b) => {
      usedTypes.add(b.type);
      if (b.secondaryType) usedTypes.add(b.secondaryType);
    });
    // 標準順序で並べる
    const order: BoxType[] = ['normal', 'BFP', 'EFP', 'P-EFP', 'OPP', 'annotation', '2nd-EFP', 'P-2nd-EFP'];
    order.forEach((type) => {
      if (usedTypes.has(type)) {
        const labels = BOX_TYPE_LABELS[type];
        items.push({
          category: 'box',
          key: type,
          label: (isEn ? labels?.en : labels?.ja) ?? type,
          description: (isEn ? BOX_DESCRIPTIONS_EN[type] : BOX_DESCRIPTIONS[type]) ?? '',
        });
      }
    });
    // 種別「その他」は customTypeLabel ごとに 1 項目（ラベル未入力のものは出さない）
    const otherLabels = Array.from(new Set(
      sheet.boxes
        .filter((b) => b.type === 'other')
        .map((b) => (b.customTypeLabel ?? '').trim())
        .filter((l) => l.length > 0),
    ));
    otherLabels.forEach((label) => {
      items.push({
        category: 'box',
        key: `other:${label}`,
        label,
        description: isEn ? 'Other (user-defined)' : 'その他（利用者定義の種別）', // i18n-ok 凡例の日本語の側の値（英語は en の側・locale で切り替え済み）
      });
    });
  }

  if (settings.includeLines && !realityOnly) {
    const usedTypes = new Set(sheet.lines.map((l) => l.type));
    if (usedTypes.has('RLine')) {
      items.push({ category: 'line', key: 'RLine', ...txt.RLine });
    }
    if (usedTypes.has('XLine')) {
      items.push({ category: 'line', key: 'XLine', ...txt.XLine });
    }
  }

  if (settings.includeSDSG && sheet.sdsg.length > 0) {
    const types = new Set(sheet.sdsg.map((s) => s.type));
    if (types.has('SD')) {
      items.push({ category: 'sdsg', key: 'SD', ...txt.SD });
    }
    if (types.has('SG')) {
      items.push({ category: 'sdsg', key: 'SG', ...txt.SG });
    }
  }

  if (settings.includeTimeArrow) {
    items.push({ category: 'timeArrow', key: 'timeArrow', ...txt.timeArrow });
  }

  return items;
}
