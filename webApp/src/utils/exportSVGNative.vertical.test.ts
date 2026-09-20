// SVG 出力の縦書きテキストの回帰テスト
// 2026-09-20 のチュートリアルで見つかった不具合:
//   アプリ上は縦になっている長音「ー」が、SVG に書き出すと横のままだった。
//   DOM は writing-mode: vertical-rl でブラウザが字形を縦にするが、SVG 出力は
//   1 文字ずつ <text> を置く方式なので自前で 90°回す必要がある。
import { describe, it, expect } from 'vitest';
import { buildSVGDocuments } from './exportSVGNative';
import { DEFAULT_SETTINGS } from '../store/defaults';
import { VERTICAL_ROTATE_CHARS, needsVerticalRotation } from './verticalText';
import type { ProjectSettings, Sheet } from '../types';

const sheetWith = (label: string, textOrientation: 'horizontal' | 'vertical'): Sheet => ({
  id: 'S1',
  name: 'S1',
  boxes: [
    { id: 'B1', type: 'normal', label, x: 0, y: 0, width: 120, height: 160, textOrientation },
  ],
  lines: [],
  sdsg: [],
  periodLabels: [],
} as unknown as Sheet);

const settings = (): ProjectSettings => ({
  ...DEFAULT_SETTINGS,
  timeArrow: { ...DEFAULT_SETTINGS.timeArrow, autoInsert: false, alwaysVisible: false },
  legend: { ...DEFAULT_SETTINGS.legend, alwaysVisible: false, includeInExport: false },
});

/** 指定の文字を含む <text> 要素を取り出す */
function textElementsFor(svg: string, ch: string): string[] {
  const matches = svg.match(/<text[^>]*>[^<]*<\/text>/g) ?? [];
  return matches.filter((el) => el.endsWith(`>${ch}</text>`));
}

describe('needsVerticalRotation', () => {
  it('長音「ー」を回転対象に含む', () => {
    expect(needsVerticalRotation('ー')).toBe(true);
    expect(VERTICAL_ROTATE_CHARS.has('ー')).toBe(true);
  });

  it('半角ハイフン類も従来どおり回転対象', () => {
    ['-', '‐', '–', '—', '－', '−'].forEach((ch) => {
      expect(needsVerticalRotation(ch)).toBe(true);
    });
  });

  it('波ダッシュも対象', () => {
    expect(needsVerticalRotation('〜')).toBe(true);
    expect(needsVerticalRotation('～')).toBe(true);
  });

  it('通常の仮名・漢字・英字は回転しない', () => {
    ['あ', '亜', 'A', 'ア', '1'].forEach((ch) => {
      expect(needsVerticalRotation(ch)).toBe(false);
    });
  });
});

describe('SVG 出力: 縦書きの長音', () => {
  it('縦書きの Box では「ー」が 90°回転して出力される', () => {
    // 「データー」には長音が 2 つある。どちらも回転しているべき
    const [svg] = buildSVGDocuments({ sheet: sheetWith('データー', 'vertical'), settings: settings() });
    const els = textElementsFor(svg, 'ー');
    expect(els.length).toBe(2);
    els.forEach((el) => expect(el).toMatch(/transform="rotate\(90 /));
  });

  it('同じ縦書きでも通常の文字は回転しない', () => {
    const [svg] = buildSVGDocuments({ sheet: sheetWith('データー', 'vertical'), settings: settings() });
    const els = textElementsFor(svg, 'デ');
    expect(els.length).toBe(1);
    expect(els[0]).not.toMatch(/rotate\(/);
  });

  it('横書きの Box では 1 要素にまとめて出力され、回転もしない', () => {
    const [svg] = buildSVGDocuments({ sheet: sheetWith('データー', 'horizontal'), settings: settings() });
    // 横書きは行単位の <text>。文字単位に割れていないこと
    expect(textElementsFor(svg, 'ー')).toHaveLength(0);
    expect(svg).toContain('データー');
    const lineEl = (svg.match(/<text[^>]*>データー<\/text>/) ?? [])[0];
    expect(lineEl).toBeTruthy();
    expect(lineEl).not.toMatch(/rotate\(/);
  });

  it('縦書きのハイフンも回転する', () => {
    const [svg] = buildSVGDocuments({ sheet: sheetWith('あ-い', 'vertical'), settings: settings() });
    const els = textElementsFor(svg, '-');
    expect(els.length).toBe(1);
    expect(els[0]).toMatch(/transform="rotate\(90 /);
  });
});
