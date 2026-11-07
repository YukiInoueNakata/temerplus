// ============================================================================
// コンテンツの bounding box 計算
// - Box, SDSG, 時間矢印, 時期ラベル, 凡例 すべてを含む
// - Canvas の fit 機能で使用
// ============================================================================

import type { Sheet, ProjectSettings, LayoutDirection } from '../types';
import { computeTimeArrow } from './timeArrow';
import { computePeriodLabels } from './periodLabels';
import { computeLegendItems, computeLegendColumns } from './legend';
import { collectSDSGRects, type Rect } from './elementRects';

export type { Rect };

export function computeContentBounds(
  sheet: Sheet,
  layout: LayoutDirection,
  settings: ProjectSettings,
): Rect | null {
  const xs: number[] = [];
  const ys: number[] = [];

  // Box
  sheet.boxes.forEach((b) => {
    xs.push(b.x, b.x + b.width);
    ys.push(b.y, b.y + b.height);
  });

  // SDSG - band / between / attached の 3 モードを区別
  // 位置計算は elementRects.collectSDSGRects に集約（重なり検出と共通）
  collectSDSGRects(sheet, layout, settings).forEach(({ rect }) => {
    xs.push(rect.x, rect.x + rect.width);
    ys.push(rect.y, rect.y + rect.height);
  });

  // 図上のメモ
  (sheet.notes ?? []).forEach((n) => {
    xs.push(n.x, n.x + n.width);
    ys.push(n.y, n.y + n.height);
  });

  // 時間矢印（alwaysVisible 問わず計算可能なら含める）
  if (settings.timeArrow) {
    const arrow = computeTimeArrow(sheet, layout, settings.timeArrow, settings.sdsgSpace, settings.typeLabelVisibility);
    if (arrow) {
      xs.push(arrow.startX, arrow.endX, arrow.labelX);
      ys.push(arrow.startY, arrow.endY, arrow.labelY);
    }
  }

  // 時期ラベル
  if (settings.periodLabels && sheet.periodLabels.length > 0) {
    const geom = computePeriodLabels(sheet, layout, settings.periodLabels, settings.timeArrow, settings.sdsgSpace, settings.typeLabelVisibility);
    if (geom) {
      xs.push(geom.startX, geom.endX);
      ys.push(geom.startY, geom.endY);
      // ラベルテキスト領域（テキスト自体の大きさ）も bbox に含める
      const fs = settings.periodLabels.fontSize ?? 13;
      geom.items.forEach((it) => {
        const maxLen = Math.max(6, (it.label ?? '').length);
        const textW = Math.max(80, maxLen * fs * 0.9);
        const textH = Math.max(20, fs * 1.8);
        if (layout === 'horizontal') {
          // 横型: label は x 中央 + y 上下どちらか
          xs.push(it.x - textW / 2, it.x + textW / 2);
          ys.push(it.y - textH, it.y + textH);
        } else {
          // 縦型: label は y 中心 + x 左右どちらか
          xs.push(it.x - textW, it.x + textW);
          ys.push(it.y - textH / 2, it.y + textH / 2);
        }
      });
    }
  }

  // 凡例（LegendOverlay の描き方に合わせた見積もり）
  if (settings.legend && settings.legend.alwaysVisible) {
    const items = computeLegendItems(sheet, settings.legend, settings.locale);
    if (items.length > 0) {
      const { w, h } = estimateLegendSize(settings.legend, items, computeLegendColumns(settings.legend, layout, items.length));
      xs.push(settings.legend.position.x, settings.legend.position.x + w);
      ys.push(settings.legend.position.y, settings.legend.position.y + h);
    }
  }

  if (xs.length === 0 || ys.length === 0) return null;
  return finish(xs, ys);
}

/**
 * 凡例の大きさの見積もり（図の座標）。LegendOverlay の作りに合わせる:
 * 外枠の padding 8・枠線、タイトル（行の高さ 1.2 + 下の余白 4 + 線 4 + 区切り 1）、
 * 項目は行の間 4・列の間 12、見本は sampleHeight に Box の枠の太さ（上下で最大 8）が足される。
 * 余白・枠の太さは出力で縮めないので、縮めた図では文字や見本より大きく効く。
 * 以前は行の高さを文字から決め、Box の見本の枠と余白を数えておらず、複数ページの出力で凡例の下が
 * 用紙からはみ出した（2026-11-07）。
 */
export function estimateLegendSize(
  lg: NonNullable<ProjectSettings['legend']>,
  items: { category: string; label: string }[],
  cols: number,
): { w: number; h: number } {
  if (lg.width != null && lg.height != null) return { w: lg.width, h: lg.height };
  const pad = 8;
  const bw = Math.max(0, lg.borderWidth ?? 1);
  const fs = lg.fontSize;
  const tfs = lg.titleFontSize ?? fs * 1.15;
  const sampleW = lg.sampleWidth ?? 32;
  const sampleH = lg.sampleHeight ?? 18;
  const showTitle = lg.showTitle !== false;
  const titleSide = (lg.titlePosition ?? 'top') !== 'top';
  const labelH = fs * 1.2 * (lg.showDescriptions ? 1 + 0.85 : 1);
  const iconH = (c: string) => (c === 'box' ? sampleH + 8 : sampleH);
  const rows: number[] = [];
  items.forEach((it, i) => {
    const r = Math.floor(i / cols);
    rows[r] = Math.max(rows[r] ?? 0, labelH, iconH(it.category));
  });
  const itemsH = rows.reduce((a, b) => a + b, 0) + Math.max(0, rows.length - 1) * 4;
  // 実測（Edge・2026-11-07）でタイトルの部分は文字の行 + 約 12（下の余白・線・区切り・行の上下）
  const titleH = showTitle && !titleSide ? tfs * 1.2 + 12 : 0;
  const maxLabel = Math.max(...items.map((it) => it.label.length));
  const colW = sampleW + 8 + 8 + maxLabel * fs * 1.05;
  const titleW = showTitle && titleSide ? tfs * 1.5 + 12 : 0;
  const contentW = Math.max(lg.minWidth, cols * colW + (cols - 1) * 12 + titleW);
  const h = lg.height ?? (pad * 2 + bw * 2 + Math.max(itemsH + titleH, titleSide && showTitle ? tfs * 1.2 * 2 : 0) + 4);
  const w = lg.width ?? (contentW + pad * 2 + bw * 2);
  return { w, h };
}

function finish(xs: number[], ys: number[]) {
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return {
    x: minX,
    y: minY,
    width: Math.max(1, maxX - minX),
    height: Math.max(1, maxY - minY),
  };
}
