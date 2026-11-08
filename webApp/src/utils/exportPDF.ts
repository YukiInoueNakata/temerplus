// ============================================================================
// PDF 出力
// - キャンバス DOM を PNG 化し、jsPDF に埋め込んで PDF 化
// - 用紙サイズに fit させる（余白指定）
// ============================================================================

import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';
import { getPaperInch, type PaperSizeKey } from './paperSizes';
import { buildFilter, cropPageToCanvas, type ExportOptions } from './exportImage';
import type { PageBounds } from './pageSplit';
import { checkAborted, type ProgressCallback } from './exportProgress';
import i18n from '../i18n';

export interface PDFExportOptions extends ExportOptions {
  paperSize: PaperSizeKey;
  customWidth?: number;   // custom 時、px
  customHeight?: number;  // custom 時、px
  margin?: number;        // inch（上下左右）既定 0.3
  /** N ページ分割。未指定または要素 1 個なら単一ページ */
  pages?: PageBounds[];
  /** pages 指定時の、全ページを覆う world 座標 bbox */
  stripBounds?: { x: number; y: number; width: number; height: number };
  onProgress?: ProgressCallback;
  signal?: AbortSignal;
}

export async function exportToPDF(
  elementId: string,
  filename: string,
  opts: PDFExportOptions,
): Promise<void> {
  const node = document.getElementById(elementId);
  if (!node) throw new Error(`Element not found: #${elementId}`);

  const paper = getPaperInch(opts.paperSize, opts.customWidth, opts.customHeight);
  const margin = opts.margin ?? 0.3;
  const contentW = Math.max(1, paper.width - margin * 2);
  const contentH = Math.max(1, paper.height - margin * 2);

  // PNG をまず生成（ピクセル解像度は用紙サイズ × DPI）。図を用紙に収めて文字を縮めても読めるよう 300dpi
  // （以前は 150dpi。2026-11-07）。大きすぎる canvas は Safari で作れないので、辺と面積に上限を置く
  const dpi = 300;
  const nodeRect = node.getBoundingClientRect();
  const rw = Math.max(1, nodeRect.width);
  const rh = Math.max(1, nodeRect.height);
  // 複数ページは帯（全ページ分）を写すので、帯の長さに対して 300dpi にする（以前は用紙 1 枚分で、
  // 1 ページあたりの解像度が 300dpi ÷ ページ数に下がっていた）
  const multiPages = opts.pages && opts.pages.length > 1 ? opts.pages : null;
  const stripForRatio = multiPages ? (opts.stripBounds ?? computeStripFromPages(multiPages)) : null;
  const targetPx = stripForRatio
    ? { w: (stripForRatio.width / 96) * dpi, h: (stripForRatio.height / 96) * dpi }
    : { w: paper.width * dpi, h: paper.height * dpi };
  const ratio = Math.max(1, Math.min(
    targetPx.w / rw,
    targetPx.h / rh,
    16000 / Math.max(rw, rh),
    Math.sqrt(16_000_000 / (rw * rh)),
  ));

  const dataUrl = await toPng(node, {
    backgroundColor: opts.background === 'transparent' ? undefined : '#ffffff',
    pixelRatio: ratio,
    filter: buildFilter(opts),
  });

  const pdf = new jsPDF({
    orientation: paper.width >= paper.height ? 'landscape' : 'portrait',
    unit: 'in',
    format: [paper.width, paper.height],
  });

  const pages = opts.pages && opts.pages.length > 1 ? opts.pages : null;

  if (!pages) {
    // 単一ページ出力（従来動作）
    const imgAspect = nodeRect.width / Math.max(1, nodeRect.height);
    const boxAspect = contentW / contentH;
    let drawW: number;
    let drawH: number;
    if (imgAspect >= boxAspect) {
      drawW = contentW;
      drawH = contentW / imgAspect;
    } else {
      drawH = contentH;
      drawW = contentH * imgAspect;
    }
    const x = margin + (contentW - drawW) / 2;
    const y = margin + (contentH - drawH) / 2;
    pdf.addImage(dataUrl, 'PNG', x, y, drawW, drawH, undefined, 'FAST');
    pdf.save(filename);
    return;
  }

  // N ページ分割出力
  const strip = opts.stripBounds ?? computeStripFromPages(pages);
  // 撮影された画像を HTMLImageElement に load
  const img = await loadImage(dataUrl);
  const imgW = img.width, imgH = img.height;
  // world → 撮影画像の px 比率
  const ratioX = imgW / Math.max(1, strip.width);
  const ratioY = imgH / Math.max(1, strip.height);

  const total = pages.length;
  for (let i = 0; i < pages.length; i++) {
    checkAborted(opts.signal);
    opts.onProgress?.({ current: i + 1, total, label: i18n.t('exportPDF:progress.page', { n: i + 1, total }) });
    const page = pages[i];
    if (i > 0) {
      pdf.addPage([paper.width, paper.height], paper.width >= paper.height ? 'landscape' : 'portrait');
    }
    // ページを切り出す（描く範囲の外を消し、そのページの凡例を重ねる。PNG・印刷と共用）
    const canvas = await cropPageToCanvas(img, strip, page, ratioX, ratioY, opts.background);
    const sw = canvas.width;
    const sh = canvas.height;
    const pageDataUrl = canvas.toDataURL('image/png');

    // コンテンツ領域にアスペクト維持で fit
    const imgAspect = sw / Math.max(1, sh);
    const boxAspect = contentW / contentH;
    let drawW: number, drawH: number;
    if (imgAspect >= boxAspect) {
      drawW = contentW;
      drawH = contentW / imgAspect;
    } else {
      drawH = contentH;
      drawW = contentH * imgAspect;
    }
    const x = margin + (contentW - drawW) / 2;
    const y = margin + (contentH - drawH) / 2;
    pdf.addImage(pageDataUrl, 'PNG', x, y, drawW, drawH, undefined, 'FAST');
  }
  pdf.save(filename);
}

function computeStripFromPages(pages: PageBounds[]): { x: number; y: number; width: number; height: number } {
  const xs = pages.flatMap((p) => [p.innerX, p.innerX + p.innerWidth]);
  const ys = pages.flatMap((p) => [p.innerY, p.innerY + p.innerHeight]);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return {
    x,
    y,
    width: Math.max(...xs) - x,
    height: Math.max(...ys) - y,
  };
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = dataUrl;
  });
}
