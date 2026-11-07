// 出力の複数ページ: 変換後の図から、境目を空いた所に置いたページの範囲を作る（2026-11-07「案 B」）
import type { TEMDocument } from '../types';
import { collectSDSGRects } from './elementRects';
import { computeTimeArrow } from './timeArrow';
import { computePeriodLabels } from './periodLabels';
import { computeLegendItems, computeLegendColumns } from './legend';
import { estimateLegendSize } from './fitBounds';
import { computeSmartPageBounds, estimatePagesNeeded, type PageBounds } from './pageSplit';
import { getPaperPx, type PaperSizeKey } from './paperSizes';

export interface SmartPagesOptions {
  paperSize: PaperSizeKey;
  pageCount: number;
  paperMarginRatio: number;
}

/** 切ってはいけない要素の長辺方向の区間と、図の始まり・終わり */
export function solidSpans(doc: TEMDocument): { solids: [number, number][]; start: number; end: number } | null {
  const sheet = doc.sheets.find((s) => s.id === doc.activeSheetId);
  if (!sheet) return null;
  const isH = doc.settings.layout !== 'vertical';
  const solids: [number, number][] = [];
  sheet.boxes.forEach((b) => solids.push(isH ? [b.x, b.x + b.width] : [b.y, b.y + b.height]));
  collectSDSGRects(sheet, doc.settings.layout, doc.settings).forEach(({ rect }) => {
    solids.push(isH ? [rect.x, rect.x + rect.width] : [rect.y, rect.y + rect.height]);
  });
  (sheet.notes ?? []).forEach((n) => solids.push(isH ? [n.x, n.x + n.width] : [n.y, n.y + n.height]));
  if (solids.length === 0) return null;
  // 図の始まり・終わりには時間矢印と時期区分も含める（Box より手前から始まる矢印の頭が、どのページにも
  // 出なかった。2026-11-07 Codex レビュー）。これらは境目で切ってよいので solids には入れない
  const ends: number[] = solids.flatMap((s) => [s[0], s[1]]);
  const st = doc.settings;
  if (st.timeArrow) {
    const a = computeTimeArrow(sheet, st.layout, st.timeArrow, st.sdsgSpace, st.typeLabelVisibility);
    if (a) ends.push(...(isH ? [a.startX, a.endX, a.labelX] : [a.startY, a.endY, a.labelY]));
  }
  if (st.periodLabels && sheet.periodLabels.length > 0) {
    const g = computePeriodLabels(sheet, st.layout, st.periodLabels, st.timeArrow, st.sdsgSpace, st.typeLabelVisibility);
    if (g) ends.push(...(isH ? [g.startX, g.endX] : [g.startY, g.endY]));
  }
  // 曲線の制御点（図の外へ張り出した曲線もページに入れる）
  sheet.lines.forEach((l) => (l.controlPoints ?? []).forEach((p) => ends.push(isH ? p.x : p.y)));
  const finite = ends.filter((v) => Number.isFinite(v));
  return { solids, start: Math.min(...finite), end: Math.max(...finite) };
}

export function computeSmartPagesForDoc(doc: TEMDocument, opts: SmartPagesOptions): PageBounds[] {
  const paper = getPaperPx(opts.paperSize);
  const isH = doc.settings.layout !== 'vertical';
  const pageLen = isH ? paper.width : paper.height;
  const marginPx = pageLen * (opts.paperMarginRatio ?? 0.05);
  const spans = solidSpans(doc);
  const lg = doc.settings.legend;
  const legend = lg && lg.alwaysVisible && lg.includeInExport !== false ? { x: lg.position.x, y: lg.position.y } : undefined;
  // 凡例の大きさ。各ページには SVG の凡例（文字の欄が 100px 以上）を重ねるので、幅はその作りとの大きいほう
  let legendSize: { w: number; h: number } | undefined;
  const sheet = doc.sheets.find((s) => s.id === doc.activeSheetId);
  if (legend && lg && sheet) {
    const items = computeLegendItems(sheet, lg, doc.settings.locale);
    if (items.length > 0) {
      const cols = computeLegendColumns(lg, doc.settings.layout, items.length);
      const est = estimateLegendSize(lg, items, cols);
      // SVG の凡例（exportSVGNative の drawLegend）と同じ寸法の決め方。各ページにはこれを重ねる
      // （画面の凡例の見積もりだけだと、説明文つきなどで実際より小さく、下端・右端ではみ出しえた。pass-3）
      const fs = lg.fontSize;
      const tfs = lg.titleFontSize ?? fs * 1.15;
      const showTitle = lg.showTitle !== false;
      const rows = Math.ceil(items.length / cols);
      const rowH = Math.max(fs * (lg.showDescriptions ? 2 : 1) * 1.4 + 4, (lg.sampleHeight ?? 18) + 4);
      const gridW = cols * ((lg.sampleWidth ?? 32) + 16 + Math.max(100, fs * 10)) + (cols - 1) * 12;
      const gridH = rows * rowH + (rows - 1) * 4;
      const titleTop = (lg.titlePosition ?? 'top') === 'top';
      const svgW = titleTop ? gridW + 20 : gridW + 20 + (showTitle ? Math.max(60, tfs * 6) + 12 : 0);
      const svgH = titleTop ? gridH + 20 + (showTitle ? tfs * 1.4 + 6 : 0) : Math.max(gridH + 20, tfs * 2);
      legendSize = { w: Math.max(est.w, svgW, lg.minWidth) + 2, h: Math.max(est.h, svgH) + 2 };
    }
  }
  return computeSmartPageBounds({
    paperWidth: paper.width,
    paperHeight: paper.height,
    layout: doc.settings.layout,
    pageCount: opts.pageCount,
    marginPx,
    solids: spans?.solids ?? [],
    contentStart: spans?.start ?? 0,
    contentEnd: spans?.end ?? pageLen,
    legend,
    legendSize,
  });
}

/** 今の倍率で、図が何ページ分あるかの目安（出力の画面の案内に出す） */
export function pagesNeededForDoc(doc: TEMDocument, opts: SmartPagesOptions): number | null {
  const spans = solidSpans(doc);
  if (!spans) return null;
  const paper = getPaperPx(opts.paperSize);
  const isH = doc.settings.layout !== 'vertical';
  const pageLen = isH ? paper.width : paper.height;
  return estimatePagesNeeded(spans.end - spans.start, pageLen, pageLen * (opts.paperMarginRatio ?? 0.05));
}
