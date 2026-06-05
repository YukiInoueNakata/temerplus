// ============================================================================
// 凡例自動生成 - シートから使用記号を抽出
// ============================================================================

import type { Sheet, LegendSettings, BoxType, LayoutDirection } from '../types';
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
};

export function computeLegendItems(sheet: Sheet, settings: LegendSettings): LegendItem[] {
  const items: LegendItem[] = [];

  if (settings.includeBoxes) {
    const usedTypes = new Set(sheet.boxes.map((b) => b.type));
    // 標準順序で並べる
    const order: BoxType[] = ['normal', 'BFP', 'EFP', 'P-EFP', 'OPP', 'annotation', '2nd-EFP', 'P-2nd-EFP'];
    order.forEach((type) => {
      if (usedTypes.has(type)) {
        items.push({
          category: 'box',
          key: type,
          label: BOX_TYPE_LABELS[type]?.ja ?? type,
          description: BOX_DESCRIPTIONS[type] ?? '',
        });
      }
    });
  }

  if (settings.includeLines) {
    const usedTypes = new Set(sheet.lines.map((l) => l.type));
    if (usedTypes.has('RLine')) {
      items.push({ category: 'line', key: 'RLine', label: '実線径路', description: '実現した径路' });
    }
    if (usedTypes.has('XLine')) {
      items.push({ category: 'line', key: 'XLine', label: '点線径路', description: '想定された（未実現）径路' });
    }
  }

  if (settings.includeSDSG && sheet.sdsg.length > 0) {
    const types = new Set(sheet.sdsg.map((s) => s.type));
    if (types.has('SD')) {
      items.push({ category: 'sdsg', key: 'SD', label: 'SD', description: '社会的方向づけ（径路を妨害する力）' });
    }
    if (types.has('SG')) {
      items.push({ category: 'sdsg', key: 'SG', label: 'SG', description: '社会的ガイド（径路を支援する力）' });
    }
  }

  if (settings.includeTimeArrow) {
    items.push({ category: 'timeArrow', key: 'timeArrow', label: '非可逆的時間', description: '時間軸の方向' });
  }

  return items;
}
