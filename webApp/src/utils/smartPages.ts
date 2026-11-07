// 出力の複数ページ: 変換後の図から、境目を空いた所に置いたページの範囲を作る（2026-11-07「案 B」）
import type { TEMDocument } from '../types';
import { collectSDSGRects } from './elementRects';
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
  return {
    solids,
    start: Math.min(...solids.map((s) => s[0])),
    end: Math.max(...solids.map((s) => s[1])),
  };
}

export function computeSmartPagesForDoc(doc: TEMDocument, opts: SmartPagesOptions): PageBounds[] {
  const paper = getPaperPx(opts.paperSize);
  const isH = doc.settings.layout !== 'vertical';
  const pageLen = isH ? paper.width : paper.height;
  const marginPx = pageLen * (opts.paperMarginRatio ?? 0.05);
  const spans = solidSpans(doc);
  const lg = doc.settings.legend;
  const legend = lg && lg.alwaysVisible && lg.includeInExport !== false ? { x: lg.position.x, y: lg.position.y } : undefined;
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
