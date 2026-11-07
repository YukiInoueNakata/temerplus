// ============================================================================
// ページ分割（長辺方向分割）用ヘルパー
// - 横型レイアウト: x 軸方向に N 分割（境界線は縦方向）
// - 縦型レイアウト: y 軸方向に N 分割（境界線は横方向）
// - overlap は各ページの端に両側 overlap_px 分の余白を加えた描画窓
// - 用紙ストリップ原点規約は既存 `PaperGuideOverlay` (Canvas.tsx:1218-1219) と一致
//     横型: originX=0,            originY=-paperHeight/2
//     縦型: originX=-paperWidth/2, originY=0
// ============================================================================

import type { LayoutDirection } from '../types';

export interface PageBounds {
  index: number;
  // 描画窓（overlap 込み）— 各フォーマットで「この矩形を 1 ページに描画」する対象
  x: number;
  y: number;
  width: number;
  height: number;
  // 用紙本体の範囲（overlap 抜き）
  innerX: number;
  innerY: number;
  innerWidth: number;
  innerHeight: number;
  /**
   * このページで描く範囲（長辺方向の図の座標）。境目を Box どうしの間の空いた所に置き、
   * 境目より先はこのページに描かない（computeSmartPageBounds）。未指定ならページ全体を描く
   */
  clipStart?: number;
  clipEnd?: number;
  /** このページに描く凡例の位置（図の座標）。各ページに、そのページに出てくる種類だけで描く */
  legendAt?: { x: number; y: number };
  /** clipStart・clipEnd の向き（横型 'x'・縦型 'y'） */
  axis?: 'x' | 'y';
  /** 画像の出力（PNG・PDF・印刷）で各ページに重ねる凡例（renderLegendSVG の結果。出力の画面が付ける） */
  legendImage?: { svg: string; w: number; h: number };
}

/** ページで描く範囲を矩形で（clip が無ければページ全体） */
export function pageClipRect(page: PageBounds, layout: LayoutDirection): { x: number; y: number; width: number; height: number } {
  const isH = layout === 'horizontal';
  const s = page.clipStart ?? (isH ? page.innerX : page.innerY);
  const e = page.clipEnd ?? (isH ? page.innerX + page.innerWidth : page.innerY + page.innerHeight);
  return isH
    ? { x: s, y: page.innerY, width: Math.max(0, e - s), height: page.innerHeight }
    : { x: page.innerX, y: s, width: page.innerWidth, height: Math.max(0, e - s) };
}

export interface SmartPageInput {
  paperWidth: number;
  paperHeight: number;
  layout: LayoutDirection;
  pageCount: number;
  /** 各ページの両端に空ける余白（図の座標）。境目の前後の余白にも使う */
  marginPx: number;
  /** 切ってはいけない要素の長辺方向の区間 [start, end]（Box・SD/SG・メモ） */
  solids: [number, number][];
  /** 図の長辺方向の始まりと終わり */
  contentStart: number;
  contentEnd: number;
  /** 凡例の位置（図の座標）。各ページの同じ位置に描く */
  legend?: { x: number; y: number };
  /** 凡例の大きさの見積もり（図の座標）。凡例の全体が用紙に入るよう位置を抑えるのに使う */
  legendSize?: { w: number; h: number };
}

/**
 * 境目を Box どうしの間の空いた所に置くページ分割（2026-11-07 ユーザー決定「案 B」）。
 * - 1 ページ目は図の始まりから（左寄せ）。各ページは用紙 1 枚分の窓で、窓の右端から余白を引いた所までに、
 *   要素の切れ目（solids の外）があればそこを境目にする。見つからなければ余白の所で切る
 * - 次のページは「境目 − 余白」から始め、境目から描く（境目の前は空ける）
 * - 境目は窓の半分より先で探す（ページが短くなりすぎないように）
 * 返すページ数は pageCount。図が入りきらないときは最後のページの終わりで切れる
 */
export function computeSmartPageBounds(input: SmartPageInput): PageBounds[] {
  const { paperWidth, paperHeight, layout, marginPx, solids, contentStart, contentEnd } = input;
  const n = Math.max(1, Math.floor(input.pageCount));
  const isH = layout === 'horizontal';
  const W = isH ? paperWidth : paperHeight;
  // 要素の中、または要素から 8px 以内は境目にしない
  const insideSolid = (x: number) => solids.some(([a, b]) => x > a - 8 && x < b + 8);
  const pages: PageBounds[] = [];
  // 1 ページ目の窓の始まり: 図の始まり − 余白
  let winStart = contentStart - marginPx;
  let clipStart = -Infinity;
  // 凡例の、ページの窓の始まりからの位置。凡例の全体が用紙に入るよう、長辺・短辺とも
  // 「端から余白の 1/4」の内側に抑える（以前は左上だけを見て、右端や上下で凡例がはみ出した）
  const pad = marginPx * 0.25;
  const S = isH ? paperHeight : paperWidth; // 短辺の長さ（窓は短辺方向に -S/2..S/2）
  const lgLong = input.legendSize ? (isH ? input.legendSize.w : input.legendSize.h) : 0;
  const lgShort = input.legendSize ? (isH ? input.legendSize.h : input.legendSize.w) : 0;
  const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), Math.max(lo, hi));
  const legendOffset = input.legend
    ? clamp((isH ? input.legend.x : input.legend.y) - winStart, pad, W - lgLong - pad)
    : 0;
  const legendShort = input.legend
    ? clamp(isH ? input.legend.y : input.legend.x, -S / 2 + pad, S / 2 - lgShort - pad)
    : 0;
  for (let i = 0; i < n; i++) {
    const last = i === n - 1;
    let cut = winStart + W - marginPx;
    if (!last && cut < contentEnd) {
      // この位置で切ったとき、残りのページで図の終わりまで届くか。次の窓は「境目 − 余白」から始まり、
      // 途中のページは 1 枚で最大「用紙 − 余白 × 2」進み、最後のページは窓の端まで描く。
      // 届かない境目を選ぶと最後のページで図の終わりが欠けた（2026-11-07 Codex レビュー High）
      const left = n - 1 - i;
      const reach = (c: number) => c + (left - 1) * (W - marginPx * 2) + (W - marginPx);
      const feasible = (c: number) => contentEnd <= reach(c) - 4;
      // 窓の右端側から左へ、要素の切れ目を探す（solids の端の外側を候補にする）
      const lo = winStart + W * 0.5;
      // 要素から 10px 離す（2px だと描画の丸めで隣の Box の縁が細く残った）
      const candidates = [cut, ...solids.flatMap(([a, b]) => [a - 10, b + 10])]
        .filter((x) => x >= lo && x <= cut && !insideSolid(x) && feasible(x))
        .sort((a, b) => b - a);
      // 空いた所で届く境目が無ければ、いちばん先まで進む位置で切る（図の終わりが欠けないことを優先）
      if (candidates.length > 0) cut = candidates[0];
    }
    const cEnd = last ? Infinity : cut;
    const innerMain = winStart;
    const legendAt = input.legend
      ? (isH ? { x: winStart + legendOffset, y: legendShort } : { x: legendShort, y: winStart + legendOffset })
      : undefined;
    pages.push(isH
      ? {
          index: i, x: innerMain, y: -paperHeight / 2, width: paperWidth, height: paperHeight,
          innerX: innerMain, innerY: -paperHeight / 2, innerWidth: paperWidth, innerHeight: paperHeight,
          clipStart: Number.isFinite(clipStart) ? clipStart : undefined,
          clipEnd: Number.isFinite(cEnd) ? cEnd : undefined,
          legendAt, axis: 'x',
        }
      : {
          index: i, x: -paperWidth / 2, y: innerMain, width: paperWidth, height: paperHeight,
          innerX: -paperWidth / 2, innerY: innerMain, innerWidth: paperWidth, innerHeight: paperHeight,
          clipStart: Number.isFinite(clipStart) ? clipStart : undefined,
          clipEnd: Number.isFinite(cEnd) ? cEnd : undefined,
          legendAt, axis: 'y',
        });
    clipStart = cut;
    winStart = cut - marginPx;
  }
  return pages;
}

/** 図を用紙の高さ（短辺）に合わせたときに、境目を空いた所に置いて何ページ要るかの目安 */
export function estimatePagesNeeded(contentLength: number, pageLength: number, marginPx: number): number {
  const usable = Math.max(1, pageLength - marginPx * 2);
  return Math.max(1, contentLength / usable);
}

export interface PageLayoutInput {
  paperWidth: number;        // world px
  paperHeight: number;       // world px
  layout: LayoutDirection;
  pageCount: number;         // 1 = 分割なし
  overlapPx: number;         // 各ページの隣接側に付ける余白（両端側ページは片側のみ）
  /** ストリップ原点を上書きしたい場合（既定は Canvas 規約） */
  originX?: number;
  originY?: number;
}

/**
 * 均等 N 分割のページ境界を算出。
 * モデル: **ステップ = paperSize − overlap**（隣接ページで overlap 分を共有）
 *  - 各ページの内側（出力される範囲）は `paperWidth × paperHeight`
 *  - 隣接ページの内側が overlap 分重なる
 *  - overlap = 0 なら綺麗な N 分割
 * ストリップ全体の長さ = paperW × 1 + (N-1) × (paperW − overlap)
 */
export function computePageBounds(input: PageLayoutInput): PageBounds[] {
  const { paperWidth, paperHeight, layout, overlapPx } = input;
  const n = Math.max(1, Math.floor(input.pageCount));
  const isH = layout === 'horizontal';
  const originX = input.originX ?? (isH ? 0 : -paperWidth / 2);
  const originY = input.originY ?? (isH ? -paperHeight / 2 : 0);
  const pages: PageBounds[] = [];
  for (let i = 0; i < n; i++) {
    if (isH) {
      // step = paperWidth - overlap。単一ページ時(n=1)は step 未使用
      const step = paperWidth - overlapPx;
      const innerX = originX + step * i;
      const innerY = originY;
      pages.push({
        index: i,
        x: innerX,
        y: innerY,
        width: paperWidth,
        height: paperHeight,
        innerX,
        innerY,
        innerWidth: paperWidth,
        innerHeight: paperHeight,
      });
    } else {
      const step = paperHeight - overlapPx;
      const innerX = originX;
      const innerY = originY + step * i;
      pages.push({
        index: i,
        x: innerX,
        y: innerY,
        width: paperWidth,
        height: paperHeight,
        innerX,
        innerY,
        innerWidth: paperWidth,
        innerHeight: paperHeight,
      });
    }
  }
  return pages;
}

/** rect が page の描画窓に重なるか（端接触は true） */
export function rectIntersectsPage(
  rect: { x: number; y: number; width: number; height: number },
  page: PageBounds,
): boolean {
  return !(
    rect.x + rect.width < page.x ||
    rect.x > page.x + page.width ||
    rect.y + rect.height < page.y ||
    rect.y > page.y + page.height
  );
}

/** rect が page の「内側（用紙本体）」に完全に収まるか */
export function rectInsidePageInner(
  rect: { x: number; y: number; width: number; height: number },
  page: PageBounds,
): boolean {
  return (
    rect.x >= page.innerX &&
    rect.x + rect.width <= page.innerX + page.innerWidth &&
    rect.y >= page.innerY &&
    rect.y + rect.height <= page.innerY + page.innerHeight
  );
}

/**
 * ストリップ全体の bbox（全ページを包含する矩形）。
 * プレビューの fit 計算等で使用。
 */
export function computeStripBounds(input: PageLayoutInput): { x: number; y: number; width: number; height: number } {
  const pages = computePageBounds(input);
  if (pages.length === 0) {
    const isH = input.layout === 'horizontal';
    return {
      x: isH ? 0 : -input.paperWidth / 2,
      y: isH ? -input.paperHeight / 2 : 0,
      width: input.paperWidth,
      height: input.paperHeight,
    };
  }
  const first = pages[0];
  const last = pages[pages.length - 1];
  return {
    x: Math.min(first.innerX, last.innerX),
    y: Math.min(first.innerY, last.innerY),
    width: Math.max(first.innerX + first.innerWidth, last.innerX + last.innerWidth) - Math.min(first.innerX, last.innerX),
    height: Math.max(first.innerY + first.innerHeight, last.innerY + last.innerHeight) - Math.min(first.innerY, last.innerY),
  };
}
