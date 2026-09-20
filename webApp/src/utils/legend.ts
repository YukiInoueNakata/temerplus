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

export type LegendCategory = 'box' | 'line' | 'sdsg' | 'timeArrow';

export interface LegendItem {
  category: LegendCategory;
  key: string;
  label: string;
  description: string;
}

const BOX_DESCRIPTIONS: Record<BoxType, string> = {
  'normal':     '経験・出来事',
  'BFP':        '分岐点 (Bifurcation Point)',
  'EFP':        '等至点 (Equifinality Point)',
  'P-EFP':      '両極化等至点 (Polarized EFP)',
  'OPP':        '必須通過点 (Obligatory Passage Point)',
  'annotation': '潜在経験 / 想定された未実現経験',
  '2nd-EFP':    '第二等至点',
  'P-2nd-EFP':  '両極化第二等至点',
  'other':      'その他',
};

// 英語ロケール時の説明文（ラベル自体は BOX_TYPE_LABELS.en を使う）
const BOX_DESCRIPTIONS_EN: Record<BoxType, string> = {
  'normal':     'Experience / event',
  'BFP':        'Bifurcation Point',
  'EFP':        'Equifinality Point',
  'P-EFP':      'Polarized Equifinality Point',
  'OPP':        'Obligatory Passage Point',
  'annotation': 'Latent / imagined unrealized experience',
  '2nd-EFP':    'Second Equifinality Point',
  'P-2nd-EFP':  'Polarized Second Equifinality Point',
  'other':      'Other',
};

// Box 以外の凡例項目（径路 / SD・SG / 非可逆的時間）のラベルと説明
const NON_BOX_TEXT = {
  ja: {
    RLine:     { label: '実線径路',     description: '実現した径路' },
    XLine:     { label: '点線径路',     description: '想定された（未実現）径路' },
    SD:        { label: 'SD',           description: '社会的方向づけ（径路を妨害する力）' },
    SG:        { label: 'SG',           description: '社会的ガイド（径路を支援する力）' },
    timeArrow: { label: '非可逆的時間', description: '時間軸の方向' },
  },
  en: {
    RLine:     { label: 'Solid path',        description: 'Realized path' },
    XLine:     { label: 'Dashed path',       description: 'Imagined (unrealized) path' },
    SD:        { label: 'SD',                description: 'Social Direction (force obstructing the path)' },
    SG:        { label: 'SG',                description: 'Social Guidance (force supporting the path)' },
    timeArrow: { label: 'Irreversible Time', description: 'Direction of the time axis' },
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

  if (settings.includeBoxes) {
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
        description: isEn ? 'Other (user-defined)' : 'その他（利用者定義の種別）',
      });
    });
  }

  if (settings.includeLines) {
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
