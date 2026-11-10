// ============================================================================
// 凡例の自動の置き方（2026-11-10 ユーザー「凡例は基本 非可逆的時間の右下で、横型なら 1 行のことが多い」）
// - 横型: 時間の矢印（と「非可逆的時間」の文字）の下に、凡例の右端を矢印の右端にそろえて置く。
//         行の数は、凡例の幅が矢印の長さに収まる最も少ない数（1 行で収まれば 1 行）
// - 縦型: 時間の矢印の下の端の下に、左端を矢印の文字の側にそろえて置く。行の数は図の幅に収まる最も少ない数
// 位置と行の数を返すだけで、書き込みは store（syncAutoLegend）が行う
// ============================================================================

import type { LegendSettings, ProjectSettings, Sheet } from '../types';
import { computeLegendColumns, computeLegendItems } from './legend';
import { computeTimeArrow } from './timeArrow';
import { estimateLegendSize } from './fitBounds';

/** 時間の矢印（文字を含む）と凡例のあいだ */
export const AUTO_LEGEND_GAP = 12;

export type AutoLegendPatch = Pick<LegendSettings, 'position'> &
  Partial<Pick<LegendSettings, 'layoutModeHorizontal' | 'rowsHorizontal' | 'layoutModeVertical' | 'rowsVertical'>>;

/** 置き方が自動のとき、凡例の位置と行の数を返す。自動でない・凡例に項目が無い・時間の矢印が無いときは null */
export function computeAutoLegend(sheet: Sheet, settings: ProjectSettings): AutoLegendPatch | null {
  const lg = settings.legend;
  if (!lg || lg.placement !== 'auto') return null;
  const items = computeLegendItems(sheet, lg, settings.locale);
  if (items.length === 0) return null;
  const a = computeTimeArrow(sheet, settings.layout, settings.timeArrow, settings.sdsgSpace, settings.typeLabelVisibility);
  if (!a) return null;

  // 幅が span に収まる最も少ない行の数（収まらなければ 1 列＝項目の数の行）
  const fit = (layout: 'horizontal' | 'vertical', span: number) => {
    const modeKey = layout === 'horizontal' ? 'layoutModeHorizontal' : 'layoutModeVertical';
    const rowsKey = layout === 'horizontal' ? 'rowsHorizontal' : 'rowsVertical';
    let rows = 1;
    let size = { w: 0, h: 0 };
    for (; rows <= items.length; rows++) {
      const cfg = { ...lg, [modeKey]: 'rows', [rowsKey]: rows } as LegendSettings;
      size = estimateLegendSize(cfg, items, computeLegendColumns(cfg, layout, items.length));
      if (size.w <= span) break;
    }
    rows = Math.min(rows, items.length);
    return { rows, size, modeKey, rowsKey } as const;
  };

  if (settings.layout === 'horizontal') {
    const left = Math.min(a.startX, a.endX);
    const right = Math.max(a.startX, a.endX);
    const { rows, size } = fit('horizontal', right - left);
    const below = settings.timeArrow.labelSideHorizontal === 'top'
      ? Math.max(a.startY, a.endY) + a.strokeWidth
      : a.labelY + a.fontSize;
    return {
      position: { x: Math.round(Math.max(left, right - size.w)), y: Math.round(below + AUTO_LEGEND_GAP) },
      layoutModeHorizontal: 'rows',
      rowsHorizontal: rows,
    };
  }

  // 縦型: 図の幅（Box の左右の端）に収める
  const xs = sheet.boxes.flatMap((b) => [b.x, b.x + b.width]);
  const minX = Math.min(a.endX, ...xs);
  const maxX = Math.max(a.endX, ...xs);
  const { rows } = fit('vertical', maxX - minX);
  const labelLeft = settings.timeArrow.labelSideVertical !== 'right' ? a.fontSize * 1.5 + 8 : 0;
  return {
    position: { x: Math.round(a.endX - labelLeft), y: Math.round(Math.max(a.startY, a.endY) + AUTO_LEGEND_GAP * 2) },
    layoutModeVertical: 'rows',
    rowsVertical: rows,
  };
}

/** 今の凡例の設定が patch と同じか（書き込みを減らし、書き込みの繰り返しを防ぐ） */
export function legendMatches(lg: LegendSettings, p: AutoLegendPatch): boolean {
  if (lg.position.x !== p.position.x || lg.position.y !== p.position.y) return false;
  for (const k of ['layoutModeHorizontal', 'rowsHorizontal', 'layoutModeVertical', 'rowsVertical'] as const) {
    if (p[k] !== undefined && lg[k] !== p[k]) return false;
  }
  return true;
}
