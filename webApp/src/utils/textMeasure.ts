// ============================================================================
// テキストの描画サイズ計測
// - 重なり検出（overlapDetect）が「ラベルが実際に何 px を占めるか」を知るために使う
// - 実行環境に依存しないよう、計測関数を差し替えられる形にしてある
//   （ブラウザ = canvas の measureText / テスト = 決定的な近似）
// ============================================================================

export interface TextMetrics {
  width: number;
  height: number;
}

export interface MeasureOptions {
  fontSize: number;
  bold?: boolean;
  fontFamily?: string;
  /** 行間の倍率。既定 1.4（Box 本文の見た目に合わせた値） */
  lineHeight?: number;
}

export type TextMeasurer = (text: string, options: MeasureOptions) => TextMetrics;

/** 改行で分割する（明示的な改行のみ。自動折返しは考慮しない） */
export function splitLines(text: string): string[] {
  return String(text ?? '').split(/\r?\n/);
}

/**
 * canvas の measureText による計測。ブラウザでの既定実装。
 * canvas が使えない環境（jsdom 等）では近似計測へフォールバックする。
 */
let sharedCtx: CanvasRenderingContext2D | null | undefined;

function getContext(): CanvasRenderingContext2D | null {
  if (sharedCtx !== undefined) return sharedCtx;
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    // jsdom は getContext が null、もしくは measureText が 0 を返す
    sharedCtx = ctx && typeof ctx.measureText === 'function' ? ctx : null;
  } catch {
    sharedCtx = null;
  }
  return sharedCtx;
}

/**
 * 文字種を見た近似計測。全角はおよそ fontSize、半角はおよそ fontSize * 0.55 で数える。
 * canvas が無い環境でも決定的な値を返すので、テストの基準にも使える。
 */
export const approximateMeasurer: TextMeasurer = (text, options) => {
  const { fontSize, lineHeight = 1.4 } = options;
  const lines = splitLines(text);
  let maxWidth = 0;
  lines.forEach((line) => {
    let w = 0;
    for (const ch of line) {
      // 半角英数・記号・スペースは狭く、それ以外（かな・漢字・全角）は 1 文字幅
      w += /[ -ÿ｡-ﾟ]/.test(ch) ? fontSize * 0.55 : fontSize;
    }
    if (w > maxWidth) maxWidth = w;
  });
  return {
    width: maxWidth,
    height: lines.length * fontSize * lineHeight,
  };
};

/** ブラウザ既定の計測。canvas が使えなければ approximateMeasurer に落ちる。 */
export const canvasMeasurer: TextMeasurer = (text, options) => {
  const ctx = getContext();
  if (!ctx) return approximateMeasurer(text, options);
  const { fontSize, bold, fontFamily = 'system-ui', lineHeight = 1.4 } = options;
  ctx.font = `${bold ? '700 ' : ''}${fontSize}px ${fontFamily}`;
  const lines = splitLines(text);
  let maxWidth = 0;
  lines.forEach((line) => {
    const w = ctx.measureText(line).width;
    if (w > maxWidth) maxWidth = w;
  });
  // canvas が 0 を返す環境（jsdom）では近似へ
  if (maxWidth === 0 && lines.some((l) => l.length > 0)) {
    return approximateMeasurer(text, options);
  }
  return {
    width: maxWidth,
    height: lines.length * fontSize * lineHeight,
  };
};

/** テスト・計測差し替え用のリセット（canvas コンテキストのキャッシュを捨てる） */
export function resetMeasureCache(): void {
  sharedCtx = undefined;
}

// ----------------------------------------------------------------------------
// 折返しを考慮した計測
// Box 本文は CSS の white-space: pre-wrap で描かれるため、幅を超える行は自動で
// 折り返される。横にはみ出すのは「それ以上分割できない塊」が枠より広いときだけ。
// 分割できる位置は CSS の既定（overflow-wrap: normal）に合わせて次のとおり:
//   - 半角スペース等の空白の後
//   - CJK 文字の前後（日本語は文字単位で折り返せる）
// 逆に、ラテン文字の単語の途中では折り返さない。
// ----------------------------------------------------------------------------

const CJK = /[\u3000-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff00-\uff60\uffe0-\uffe6]/;

/** 1 行を「これ以上分割できない塊」へ分ける */
export function splitChunks(line: string): string[] {
  const chunks: string[] = [];
  let buf = '';
  for (const ch of line) {
    if (CJK.test(ch)) {
      if (buf) { chunks.push(buf); buf = ''; }
      chunks.push(ch);
      continue;
    }
    if (/\s/.test(ch)) {
      buf += ch;
      chunks.push(buf);
      buf = '';
      continue;
    }
    buf += ch;
  }
  if (buf) chunks.push(buf);
  return chunks;
}

export interface WrappedMetrics {
  /** 折返し後の描画幅（maxWidth 以下に収まる範囲） */
  width: number;
  /** 折返し後の高さ */
  height: number;
  /** 折返し後の行数 */
  lines: number;
  /** 分割できない塊が幅を超えた量（px）。0 なら横にはみ出さない */
  overflowX: number;
}

/**
 * 最大幅で折り返したときの描画サイズを返す。
 * maxWidth が 0 以下なら折返しなしとして扱う。
 */
export function measureWrapped(
  text: string,
  maxWidth: number,
  options: MeasureOptions,
  measure: TextMeasurer,
): WrappedMetrics {
  const { fontSize, lineHeight = 1.4 } = options;
  const widthOf = (t: string) => measure(t, { ...options, lineHeight: 1 }).width;

  if (maxWidth <= 0) {
    const m = measure(text, options);
    return { width: m.width, height: m.height, lines: splitLines(text).length, overflowX: 0 };
  }

  let totalLines = 0;
  let widest = 0;
  let overflowX = 0;

  splitLines(text).forEach((line) => {
    const chunks = splitChunks(line);
    if (chunks.length === 0) { totalLines += 1; return; }
    let current = '';
    let currentWidth = 0;
    let lineCount = 1;
    chunks.forEach((chunk) => {
      const chunkWidth = widthOf(chunk);
      // 単独で幅を超える塊は、それ自体がはみ出しになる
      if (chunkWidth > maxWidth) overflowX = Math.max(overflowX, chunkWidth - maxWidth);
      if (current === '') {
        current = chunk;
        currentWidth = chunkWidth;
        return;
      }
      if (currentWidth + chunkWidth <= maxWidth) {
        current += chunk;
        currentWidth += chunkWidth;
        return;
      }
      widest = Math.max(widest, currentWidth);
      lineCount += 1;
      // 行頭に来た空白は描画上無視される
      current = chunk.replace(/^\s+/, '');
      currentWidth = widthOf(current);
    });
    widest = Math.max(widest, currentWidth);
    totalLines += lineCount;
  });

  return {
    width: Math.min(widest, maxWidth),
    height: totalLines * fontSize * lineHeight,
    lines: totalLines,
    overflowX,
  };
}
