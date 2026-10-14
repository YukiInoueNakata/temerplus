// まとめ枠（Box.isGroup）の回帰テスト（2026-10-15 利用者の要望: 複数の P-EFP を 1 つの大きな枠にまとめたい）
import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { rectInside, itemsInsideGroup, boxesInPaintOrder } from './groupFrame';
import { detectOverlaps } from './overlapDetect';
import { approximateMeasurer } from './textMeasure';
import { exportToPPTX } from './exportPPT';
import { buildSVGDocuments } from './exportSVGNative';
import { DEFAULT_SETTINGS } from '../store/defaults';
import type { Box, ProjectSettings, Sheet } from '../types';

const box = (id: string, x: number, y: number, w: number, h: number, extra: Partial<Box> = {}): Box =>
  ({ id, type: 'normal', label: id, x, y, width: w, height: h, ...extra } as Box);

const group = box('G', 0, 0, 400, 200, { type: 'P-EFP', isGroup: true, label: '関係が続かない状態' });
const inner1 = box('A', 20, 60, 100, 60, { type: 'P-EFP' });
const inner2 = box('B', 200, 60, 100, 60, { type: 'P-EFP' });
const outside = box('C', 600, 60, 100, 60);
const sheet = {
  id: 'S1', name: 'S1', sdsg: [], periodLabels: [], notes: [],
  boxes: [inner1, outside, group, inner2],
  lines: [{ id: 'L1', type: 'RLine', from: 'C', to: 'B' }],
} as unknown as Sheet;
const settings: ProjectSettings = {
  ...DEFAULT_SETTINGS,
  timeArrow: { ...DEFAULT_SETTINGS.timeArrow, autoInsert: false, alwaysVisible: false, label: '' },
  legend: { ...DEFAULT_SETTINGS.legend, alwaysVisible: false, includeInExport: false },
};

describe('まとめ枠の判定', () => {
  it('中に収まる Box だけを中身とみなす', () => {
    expect(rectInside(inner1, group)).toBe(true);
    expect(rectInside(outside, group)).toBe(false);
    expect(itemsInsideGroup(group, sheet.boxes).boxIds.sort()).toEqual(['A', 'B']);
  });
  it('描画順はまとめ枠が先（大きい枠ほど奥）', () => {
    const outer = box('G0', -50, -50, 600, 400, { isGroup: true });
    expect(boxesInPaintOrder([inner1, group, outer, outside]).map((b) => b.id)).toEqual(['G0', 'G', 'A', 'C']);
  });
});

describe('重なりチェック', () => {
  it('まとめ枠とその中の Box の重なりは警告しない', () => {
    const issues = detectOverlaps(sheet, 'horizontal', settings, { measure: approximateMeasurer });
    const pairs = issues.filter((i) => i.kind === 'boxBox').map((i) => i.targets.map((t) => t.id).sort().join('-'));
    expect(pairs).not.toContain('A-G');
    expect(pairs).not.toContain('B-G');
    // 中の Box へ向かう矢印がまとめ枠の上を通るのも警告しない
    expect(issues.some((i) => i.kind === 'lineLabel' && i.targets.some((t) => t.id === 'G' && t.part === 'box'))).toBe(false);
  });
});

describe('出力でまとめ枠を背面に描く', () => {
  it('PPTX: まとめ枠の図形が矢印より前（XML で先）に来る', async () => {
    const bytes = await exportToPPTX({ sheet, settings, scale: false, returnBytes: true });
    const xml = await (await JSZip.loadAsync(bytes as Uint8Array)).file('ppt/slides/slide1.xml')!.async('string');
    const groupAt = xml.indexOf('<a:t>関係が続かない状態</a:t>');
    const lineAt = xml.search(/prst="line"/);
    expect(groupAt).toBeGreaterThan(0);
    expect(lineAt).toBeGreaterThan(0);
    // 枠の本体（矩形）は本文の手前にあるので、本文の位置より前に矢印が無ければよい
    expect(groupAt).toBeLessThan(lineAt);
  }, 30_000);

  it('SVG: まとめ枠の見出しが矢印より前に書かれる', () => {
    const svg = buildSVGDocuments({ sheet, settings, scale: false })[0];
    const groupAt = svg.indexOf('関係が続かない状態');
    // 矢印の線は <path d="M ..." stroke="#222">
    const lineAt = svg.search(/<path d="M [^"]+" fill="none" stroke="#222"/);
    expect(groupAt).toBeGreaterThan(0);
    expect(lineAt).toBeGreaterThan(0);
    expect(groupAt).toBeLessThan(lineAt);
  });
});
