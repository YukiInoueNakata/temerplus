// ============================================================================
// PPTX 出力の文字まわりを画面に合わせるための換算
// - 画面（React Flow）の文字サイズ・余白は CSS px、PptxGenJS の fontSize / margin /
//   lineSpacing は pt。1px = 0.75pt（96dpi 基準）で換算しないと文字だけが 4/3 倍になる
// - 画面のフォントは App.css のスタック（Hiragino Sans → Yu Gothic → Meiryo …）で
//   ブラウザが選んだもの。PPTX でフォント未指定だと PowerPoint のテーマ任せになる
// - 画面の行送りは line-height: normal（フォントごとに違う）。PowerPoint の「1 行」とは
//   一致しないので、ブラウザで比率を測って pt で明示する
// ============================================================================

import type PptxGenJS from 'pptxgenjs';

export const PT_PER_PX = 0.75;

/** App.css の html/body/#root と同じスタック（画面の既定フォント） */
export const APP_FONT_STACK = '"Hiragino Sans", "Yu Gothic", "Meiryo", system-ui, -apple-system, "Segoe UI", sans-serif';

const GENERIC_FAMILIES = new Set([
  'inherit', 'initial', 'unset', 'system-ui', '-apple-system', 'blinkmacsystemfont',
  'sans-serif', 'serif', 'monospace', 'cursive', 'fantasy',
  'ui-sans-serif', 'ui-serif', 'ui-monospace', 'ui-rounded',
]);

/** ブラウザで測れないとき（テスト等）の行送り比率 */
const FALLBACK_LINE_RATIO = 1.4;

/** 画面上の px（ズーム前の world px）× 出力倍率 → pt */
export function pxToPt(px: number, scale: number): number {
  return px * scale * PT_PER_PX;
}

/** CSS の font-family 値を名前の配列に分ける（引用符を外す） */
export function parseFontFamilyList(css: string | undefined): string[] {
  if (!css) return [];
  return css
    .split(',')
    .map((s) => s.trim().replace(/^["']|["']$/g, '').trim())
    .filter((s) => s.length > 0);
}

export function isGenericFamily(name: string): boolean {
  return GENERIC_FAMILIES.has(name.toLowerCase());
}

/**
 * 端末にフォントがあるか。canvas の文字幅を、総称フォントだけのときと比べて判定する
 * （document.fonts.check はローカルフォントに対して常に true を返すので使えない）。
 * ブラウザ外では判定できないので true を返す。
 */
const fontAvailableCache = new Map<string, boolean>();

export function isFontAvailable(name: string): boolean {
  if (typeof document === 'undefined') return true;
  // jsdom（テスト）は canvas を持たず、getContext のたびに警告を出す
  if (typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent)) return true;
  // 出力では文字を描くたびに呼ばれるので、フォント名ごとに結果を覚える
  const hit = fontAvailableCache.get(name);
  if (hit !== undefined) return hit;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return true;
  const sample = 'mmmmmmmmmmlliI 永あア123';
  const ok = ['monospace', 'serif', 'sans-serif'].some((base) => {
    ctx.font = `72px ${base}`;
    const w0 = ctx.measureText(sample).width;
    ctx.font = `72px "${name}", ${base}`;
    return ctx.measureText(sample).width !== w0;
  });
  fontAvailableCache.set(name, ok);
  return ok;
}

/**
 * PPTX に書くフォント名を決める。
 * 指定（Box の fontFamily 等）があれば、その中で端末にある最初の具体名を使う。
 * 無い・総称だけなら、画面の既定スタックで端末にある最初の名前を使う。
 */
export function resolvePptFontFace(
  css: string | undefined,
  available: (name: string) => boolean = isFontAvailable,
): string {
  const pick = (list: string[]) => list.find((n) => !isGenericFamily(n) && available(n));
  return pick(parseFontFamilyList(css))
    ?? pick(parseFontFamilyList(APP_FONT_STACK))
    ?? 'Yu Gothic';
}

const lineRatioCache = new Map<string, number>();

/** line-height: normal の行の高さ ÷ 文字サイズ（ブラウザで実測。フォントごとにキャッシュ） */
export function measureNormalLineRatio(fontFace: string): number {
  if (typeof document === 'undefined' || !document.body) return FALLBACK_LINE_RATIO;
  const hit = lineRatioCache.get(fontFace);
  if (hit) return hit;
  const el = document.createElement('div');
  el.textContent = '永あ\n永あ';
  el.style.cssText = [
    'position:absolute', 'visibility:hidden', 'left:-9999px', 'top:0',
    'white-space:pre', 'line-height:normal', 'font-size:100px',
    `font-family:"${fontFace}", sans-serif`,
  ].join(';');
  document.body.appendChild(el);
  const ratio = el.getBoundingClientRect().height / 200;
  el.remove();
  const r = Number.isFinite(ratio) && ratio > 0.8 && ratio < 3 ? ratio : FALLBACK_LINE_RATIO;
  lineRatioCache.set(fontFace, r);
  return r;
}

export interface PptTextDefaults {
  /** フォント名を決める（未指定・総称・スタックを具体名にする） */
  fontFace: (css: string | undefined) => string;
  /** フォント名 → line-height: normal の比率 */
  lineRatio: (fontFace: string) => number;
}

export const browserPptTextDefaults: PptTextDefaults = {
  fontFace: (css) => resolvePptFontFace(css),
  lineRatio: (face) => measureNormalLineRatio(face),
};

/**
 * slide.addText に、フォント名と行送り（pt）の既定を差し込む。
 * 個々の addText 呼び出しで指定済みの lineSpacing / lineSpacingMultiple は尊重する。
 * 20 か所ある addText に同じ処理を書き散らさないため、スライド生成の直後に 1 回だけ包む。
 */
export function applyPptTextDefaults(
  slide: PptxGenJS.Slide,
  defaults: PptTextDefaults = browserPptTextDefaults,
): PptxGenJS.Slide {
  const original = slide.addText.bind(slide);
  slide.addText = (text, options) => {
    if (!options) return original(text, options);
    const face = defaults.fontFace(options.fontFace);
    const next: PptxGenJS.TextPropsOptions = { ...options, fontFace: face };
    // 位置と大きさは画面に合わせて計算済み。margin 未指定だと PowerPoint の既定の内側余白
    // （左右 0.1in・上下 0.05in）が入り、文字の入る幅が狭まって折り返す
    if (options.margin == null) next.margin = 0;
    const fs = options.fontSize;
    if (typeof fs === 'number' && options.lineSpacing == null && options.lineSpacingMultiple == null) {
      next.lineSpacing = Math.round(fs * defaults.lineRatio(face) * 10) / 10;
    }
    return original(text, next);
  };
  return slide;
}
