// SVG 出力の Box 本文の折り返しの回帰テスト（2026-10-09）
// 以前は改行文字でしか行を分けず、画面では折り返して枠に収まる文字が 1 行のまま枠からはみ出した。
import { describe, it, expect } from 'vitest';
import { buildSVGDocuments } from './exportSVGNative';
import { DEFAULT_SETTINGS } from '../store/defaults';
import type { ProjectSettings, Sheet } from '../types';

const LABEL = 'あいうえおかきくけこさしすせそ';

const sheetWith = (textOrientation: 'horizontal' | 'vertical'): Sheet => ({
  id: 'S1', name: 'S1', lines: [], sdsg: [], periodLabels: [],
  boxes: [{ id: 'B1', type: 'normal', label: LABEL, x: 0, y: 0, width: 80, height: 80, textOrientation }],
} as unknown as Sheet);

const settings = (): ProjectSettings => ({
  ...DEFAULT_SETTINGS,
  timeArrow: { ...DEFAULT_SETTINGS.timeArrow, autoInsert: false, alwaysVisible: false },
  legend: { ...DEFAULT_SETTINGS.legend, alwaysVisible: false, includeInExport: false },
});

/** 本文の <text> を（横書きは行ごと、縦書きは 1 文字ずつ）取り出す */
const texts = (svg: string) =>
  [...svg.matchAll(/<text x="([\d.-]+)" y="([\d.-]+)"[^>]*>([^<]*)<\/text>/g)]
    .map((m) => ({ x: Number(m[1]), y: Number(m[2]), s: m[3] }))
    .filter((t) => t.s && LABEL.includes(t.s));

describe('SVG 出力: Box 本文の折り返し', () => {
  it('横書きは枠の幅で複数行に折り返し、元の文字をすべて含む', () => {
    const svg = buildSVGDocuments({ sheet: sheetWith('horizontal'), settings: settings(), scale: false })[0];
    const lines = texts(svg);
    expect(lines.length).toBeGreaterThan(1);
    expect(lines.map((l) => l.s).join('')).toBe(LABEL);
    // 行は上から下へ
    expect(lines.map((l) => l.y)).toEqual([...lines.map((l) => l.y)].sort((a, b) => a - b));
  });

  it('縦書きは枠の高さに収まる文字数で列を分ける（1 列に全部積まない）', () => {
    const svg = buildSVGDocuments({ sheet: sheetWith('vertical'), settings: settings(), scale: false })[0];
    const chars = texts(svg).filter((t) => t.s.length === 1);
    const columns = new Set(chars.map((c) => Math.round(c.x)));
    expect(columns.size).toBeGreaterThan(1);
    // どの文字も枠（高さ 80）の内側に置かれる
    const ys = chars.map((c) => c.y);
    expect(Math.max(...ys) - Math.min(...ys)).toBeLessThan(80);
  });

  it('フォント未指定でも font-family を書く（閲覧側の既定フォントに任せない）', () => {
    const svg = buildSVGDocuments({ sheet: sheetWith('horizontal'), settings: settings(), scale: false })[0];
    expect(svg).toMatch(/font-family:[^"]*Yu Gothic/);
  });
});
