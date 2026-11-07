// ============================================================================
// プリンター印刷 - 新規ウィンドウを開いて window.print() を呼ぶ
// - 全体を html-to-image で PNG キャプチャ
// - 分割時は各ページ範囲でオフスクリーン canvas にクロップ
// - @page CSS で用紙サイズ / マージンを指定、1 ページ 1 img をレイアウト
// ============================================================================

import { toPng } from 'html-to-image';
import type { PageBounds } from './pageSplit';
import { getPaperInch, type PaperSizeKey } from './paperSizes';
import { checkAborted, type ProgressCallback } from './exportProgress';
import { captureRatio, cropPageToCanvas, buildFilter as imageFilter } from './exportImage';

export interface PrintOptions {
  /** N ページ分割（未指定 or 1 枚なら単一ページ印刷） */
  pages?: PageBounds[];
  /** 用紙サイズ（@page size に指定） */
  paperSize: PaperSizeKey;
  /** カスタム用紙サイズ時の実寸（inch） */
  customPaperWidthPx?: number;
  customPaperHeightPx?: number;
  /** 背景色 */
  background?: 'white' | 'transparent';
  /** 出力フィルタ */
  includeGrid?: boolean;
  includePaperGuides?: boolean;
  includeRulers?: boolean;
  /** 画面の凡例を写さない（複数ページで、各ページにそのページの凡例を重ねるとき） */
  excludeLegend?: boolean;
  onProgress?: ProgressCallback;
  signal?: AbortSignal;
  /**
   * 先に開いておいた印刷用の窓。クリックの直後（await の前）に開かないと、Safari は画像を作り終えた
   * 後の window.open をポップアップとして止め、印刷できなかった（2026-11-07 Mac の確認で発見）。
   * openPrintWindow() で開いて渡す。未指定ならここで開く（Chrome・Edge は通る）
   */
  targetWindow?: Window | null;
}

// 出力（PNG・PDF）と同じ判定を使う。以前は印刷だけ別の判定で、接続点（Box の左右の丸）と
// リサイズ枠を除いておらず、印刷にだけ写っていた（2026-11-07）
const buildFilter = (opts: PrintOptions) => imageFilter(opts);

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = dataUrl;
  });
}

function computeStripFromPages(pages: PageBounds[]): { x: number; y: number; width: number; height: number } {
  const xs = pages.flatMap((p) => [p.innerX, p.innerX + p.innerWidth]);
  const ys = pages.flatMap((p) => [p.innerY, p.innerY + p.innerHeight]);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y };
}

/**
 * 指定 element をプリンター印刷する。
 * - 新規ウィンドウを開き、img タグで各ページを貼り付け、@page CSS で用紙サイズ指定、window.print() を呼ぶ
 * - ユーザーがブラウザの印刷ダイアログでプリンターと倍率を選択して印刷
 */
export async function printDiagram(
  elementId: string,
  opts: PrintOptions,
): Promise<void> {
  const node = document.getElementById(elementId);
  if (!node) throw new Error(`Element not found: #${elementId}`);

  const paper = getPaperInch(opts.paperSize, opts.customPaperWidthPx, opts.customPaperHeightPx);
  const pagesLen = opts.pages && opts.pages.length > 1 ? opts.pages.length : 1;
  const totalSteps = 1 + pagesLen + 1; // capture + crops + print window
  opts.onProgress?.({ current: 0, total: totalSteps, label: 'プレビューをキャプチャ中...' });
  checkAborted(opts.signal);

  // 全体を 1 回キャプチャ。用紙の上で 300dpi になる倍率（以前は 2 倍に固定で、解像度がプレビューの枠で決まった）
  const worldW = opts.pages && opts.pages.length > 1
    ? computeStripFromPages(opts.pages).width
    : paper.width * 96;
  const dataUrl = await toPng(node, {
    backgroundColor: opts.background === 'transparent' ? undefined : '#ffffff',
    pixelRatio: captureRatio(node, worldW),
    filter: buildFilter(opts),
  });
  checkAborted(opts.signal);

  // 各ページの dataURL を作成
  let pageDataUrls: string[];
  if (opts.pages && opts.pages.length > 1) {
    const img = await loadImage(dataUrl);
    const strip = computeStripFromPages(opts.pages);
    const ratioX = img.width / Math.max(1, strip.width);
    const ratioY = img.height / Math.max(1, strip.height);
    pageDataUrls = [];
    let idx = 0;
    for (const page of opts.pages) {
      idx++;
      checkAborted(opts.signal);
      opts.onProgress?.({ current: 1 + idx, total: totalSteps, label: `ページ ${idx} / ${opts.pages.length} をクロップ中` });
      // 描く範囲の外を消し、そのページの凡例を重ねる（PNG・PDF と共用）
      const canvas = await cropPageToCanvas(img, strip, page, ratioX, ratioY, opts.background);
      pageDataUrls.push(canvas.toDataURL('image/png'));
    }
  } else {
    pageDataUrls = [dataUrl];
  }

  // 印刷用 HTML を生成。@page size に inch 寸法を指定し、プリンタが用紙を選べるようにする
  const pageSizeCSS = `${paper.width}in ${paper.height}in`;
  const bodyBg = opts.background === 'transparent' ? 'transparent' : '#ffffff';

  const html = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8"/>
<title>TEMer 印刷プレビュー (${pageDataUrls.length} ページ)</title>
<style>
  @page { size: ${pageSizeCSS}; margin: 0; }
  html, body { margin: 0; padding: 0; background: ${bodyBg}; }
  .page {
    width: ${paper.width}in;
    height: ${paper.height}in;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    page-break-after: always;
    break-after: page;
    box-sizing: border-box;
  }
  .page:last-child { page-break-after: auto; break-after: auto; }
  .page img {
    max-width: 100%;
    max-height: 100%;
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }
  .instructions {
    position: fixed;
    top: 8px; left: 8px;
    background: #fffbe6;
    border: 1px solid #e6c200;
    padding: 6px 10px;
    font-family: sans-serif;
    font-size: 12px;
    z-index: 9999;
  }
  /* Safari は @page の size・margin を使わず、自分の余白とヘッダ・フッタを足す。用紙ぴったりの高さだと
     はみ出して何も無いページができたので、印刷のときは印刷できる範囲（100vw × 100vh）に合わせる（2026-11-07） */
  @media print {
    .instructions { display: none; }
    .page { width: 100vw; height: 100vh; }
  }
</style>
</head>
<body>
  <div class="instructions">
    印刷ダイアログで「用紙サイズ」「向き」がこの用紙に合っているか確認してください。${paper.width > paper.height ? 'Safari は向きを自動で合わせないので「横」を選んでください。' : ''}
    ダイアログを閉じたらこのウィンドウも閉じて構いません。
  </div>
${pageDataUrls.map((u, i) => `  <div class="page"><img src="${u}" alt="page ${i + 1}"/></div>`).join('\n')}
</body>
</html>`;

  opts.onProgress?.({ current: totalSteps, total: totalSteps, label: '印刷ウィンドウを開きます' });
  const win = opts.targetWindow && !opts.targetWindow.closed
    ? opts.targetWindow
    : window.open('', '_blank', 'width=960,height=720');
  if (!win) {
    throw new Error('ポップアップがブロックされました。ブラウザのポップアップブロックを解除してください。');
  }
  win.document.open();
  win.document.write(html);
  win.document.close();

  // 画像の load 完了を待つ
  await new Promise<void>((resolve) => {
    const check = () => {
      const imgs = Array.from(win.document.querySelectorAll('img')) as HTMLImageElement[];
      if (imgs.length === 0) return resolve();
      const pending = imgs.filter((im) => !im.complete);
      if (pending.length === 0) return resolve();
      Promise.all(pending.map((im) => new Promise<void>((res) => {
        im.addEventListener('load', () => res(), { once: true });
        im.addEventListener('error', () => res(), { once: true });
      }))).then(() => resolve());
    };
    if (win.document.readyState === 'complete') check();
    else win.addEventListener('load', () => check(), { once: true });
  });

  win.focus();
  win.print();
}
