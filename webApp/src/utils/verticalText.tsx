// ============================================================================
// 縦書きテキスト補正
// - writingMode: vertical-rl + textOrientation: upright の環境では
//   半角ハイフン（- U+002D / ‐ U+2010 / － U+FF0D / − U+2212）が横棒のままになる。
//   これを 90°回転させて縦書きと整合させる。
//   長音「ー U+30FC」も同様に対応（既に upright の場合はブラウザが縦向きに倒すが、
//   mixed の場合にも補正したいので共通処理）。
// ============================================================================

import type { ReactNode } from 'react';

const ROTATE_CHARS = new Set([
  '-',       // U+002D HYPHEN-MINUS
  '\u2010',  // HYPHEN
  '\u2011',  // NON-BREAKING HYPHEN
  '\u2012',  // FIGURE DASH
  '\u2013',  // EN DASH
  '\u2014',  // EM DASH
  '\uFF0D',  // FULLWIDTH HYPHEN-MINUS
  '\u2212',  // MINUS SIGN
]);

/**
 * 縦書きで「横倒しの字形」になるべき文字の集合。
 *
 * DOM 描画では writing-mode: vertical-rl が効くので、長音・波ダッシュ等は
 * ブラウザが自動で縦向きの字形にしてくれる（ROTATE_CHARS はブラウザが面倒を
 * 見ない半角ハイフン類だけを補正している）。
 * 一方 SVG 出力は 1 文字ずつ <text> を置く方式で writing-mode に頼れないため、
 * 「本来縦向きになる文字」を明示的に 90°回転させる必要がある。
 * その判定にこの集合を使う（ROTATE_CHARS を含む上位集合）。
 */
export const VERTICAL_ROTATE_CHARS = new Set([
  ...ROTATE_CHARS,
  '\u30FC',  // ー KATAKANA-HIRAGANA PROLONGED SOUND MARK（長音）
  '\uFF70',  // ｰ HALFWIDTH KATAKANA-HIRAGANA PROLONGED SOUND MARK
  '\u301C',  // 〜 WAVE DASH
  '\uFF5E',  // ～ FULLWIDTH TILDE
  '\u2015',  // ― HORIZONTAL BAR
  '\u2500',  // ─ BOX DRAWINGS LIGHT HORIZONTAL
]);

/** 縦書きで 90°回転させるべき文字か */
export function needsVerticalRotation(ch: string): boolean {
  return VERTICAL_ROTATE_CHARS.has(ch);
}

/**
 * 縦書き時に半角ハイフン等を 90°回転させて描画する。
 * vertical=false の場合はそのまま text を返す。
 */
export function renderVerticalAwareText(text: string, vertical: boolean): ReactNode {
  if (!vertical || !text) return text;
  const parts: ReactNode[] = [];
  let buf = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ROTATE_CHARS.has(ch)) {
      if (buf) {
        parts.push(buf);
        buf = '';
      }
      parts.push(
        <span
          key={i}
          style={{
            display: 'inline-block',
            transform: 'rotate(90deg)',
            // 縦書き時の位置調整
            transformOrigin: 'center',
          }}
        >
          {ch}
        </span>
      );
    } else {
      buf += ch;
    }
  }
  if (buf) parts.push(buf);
  return parts;
}
