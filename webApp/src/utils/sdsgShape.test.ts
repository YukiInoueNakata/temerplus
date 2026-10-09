// SD/SG の形・向き・ラベル配置の回帰テスト（2026-10-09）
// - 縦型は SD=左向き / SG=右向き が正（画面どおり）。PPTX・SVG は以前、逆向きだった
// - SVG は首付きの矢印だった → 画面と同じ五角形
// - 横型 SG・縦型 SD で種別ラベルとサブラベルが重なっていた
import { describe, it, expect } from 'vitest';
import { sdsgPentagonPoints, sdsgPptRotation, sdsgSubLabelShift, sdsgTypeTagOnSubLabelSide } from './sdsgShape';
import { collectElementRects } from './elementRects';
import { approximateMeasurer } from './textMeasure';
import { DEFAULT_SETTINGS } from '../store/defaults';
import type { ProjectSettings, Sheet, LayoutDirection } from '../types';

/** 頂点のうち、矢印の先端（他と離れた 1 点）を返す */
const tip = (pts: Array<{ x: number; y: number }>, axis: 'x' | 'y', dir: 1 | -1) =>
  pts.reduce((a, p) => (p[axis] * dir > a[axis] * dir ? p : a));

describe('sdsgPentagonPoints', () => {
  it('首の無い五角形（頂点 5 つ）', () => {
    expect(sdsgPentagonPoints(0, 0, 70, 40, true, true, 0.55)).toHaveLength(5);
  });
  it('横型: SD は下向き、SG は上向き', () => {
    expect(tip(sdsgPentagonPoints(0, 0, 70, 40, true, true, 0.55), 'y', 1)).toEqual({ x: 35, y: 40 });
    expect(tip(sdsgPentagonPoints(0, 0, 70, 40, true, false, 0.55), 'y', -1)).toEqual({ x: 35, y: 0 });
  });
  it('縦型: SD は左向き、SG は右向き（画面どおり）', () => {
    expect(tip(sdsgPentagonPoints(0, 0, 40, 70, false, true, 0.55), 'x', -1)).toEqual({ x: 0, y: 35 });
    expect(tip(sdsgPentagonPoints(0, 0, 40, 70, false, false, 0.55), 'x', 1)).toEqual({ x: 40, y: 35 });
  });
  it('三角部分の長さは (1 - rectRatio) × 矢印方向の長さ', () => {
    const pts = sdsgPentagonPoints(0, 0, 70, 40, true, true, 0.55);
    expect(pts[2]).toEqual({ x: 70, y: 22 });
  });
});

describe('sdsgPptRotation（右向きホームベースの回転）', () => {
  it('横型 SD=90 / SG=270、縦型 SD=180 / SG=0', () => {
    expect(sdsgPptRotation(true, true)).toBe(90);
    expect(sdsgPptRotation(true, false)).toBe(270);
    expect(sdsgPptRotation(false, true)).toBe(180);
    expect(sdsgPptRotation(false, false)).toBe(0);
  });
});

describe('種別ラベルとサブラベル', () => {
  it('同じ側に来るのは横型 SG と縦型 SD だけ', () => {
    expect(sdsgTypeTagOnSubLabelSide(true, false)).toBe(true);
    expect(sdsgTypeTagOnSubLabelSide(true, true)).toBe(false);
    expect(sdsgTypeTagOnSubLabelSide(false, true)).toBe(true);
    expect(sdsgTypeTagOnSubLabelSide(false, false)).toBe(false);
  });
  it('ずらす量は種別ラベルの厚み＋2px。種別ラベルを隠しているときは 0', () => {
    expect(sdsgSubLabelShift({ isH: true, isSD: false, typeTagVisible: true, typeFontSize: 10 })).toBeCloseTo(10 * 1.4 + 4 + 2);
    expect(sdsgSubLabelShift({ isH: true, isSD: true, typeTagVisible: true, typeFontSize: 10 })).toBe(0);
    expect(sdsgSubLabelShift({ isH: true, isSD: false, typeTagVisible: false, typeFontSize: 10 })).toBe(0);
  });

  const sheetWith = (type: 'SD' | 'SG'): Sheet => ({
    id: 'S1', name: 'S1', periodLabels: [], lines: [],
    boxes: [{ id: 'B1', type: 'normal', label: 'box', x: 0, y: 0, width: 100, height: 60 }],
    sdsg: [{
      id: 'G1', type, label: type, attachedTo: 'B1', attachedType: 'box',
      itemOffset: type === 'SG' ? 120 : -120, timeOffset: 0, subLabel: '外的な要因',
    }],
  } as unknown as Sheet);
  const settings: ProjectSettings = {
    ...DEFAULT_SETTINGS,
    timeArrow: { ...DEFAULT_SETTINGS.timeArrow, autoInsert: false, alwaysVisible: false, label: '' },
    legend: { ...DEFAULT_SETTINGS.legend, alwaysVisible: false },
  };
  const intersects = (a: { x: number; y: number; width: number; height: number }, b: typeof a) =>
    a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

  for (const [layout, type] of [['horizontal', 'SG'], ['vertical', 'SD'], ['horizontal', 'SD'], ['vertical', 'SG']] as Array<[LayoutDirection, 'SD' | 'SG']>) {
    it(`${layout} の ${type}: 種別ラベルとサブラベルが重ならない（重なり検出の矩形で確認）`, () => {
      const rects = collectElementRects(sheetWith(type), layout, settings, approximateMeasurer)
        .filter((r) => r.id === 'G1');
      const typeRect = rects.find((r) => r.part === 'typeLabel');
      const subRect = rects.find((r) => r.part === 'subLabel');
      expect(typeRect).toBeDefined();
      expect(subRect).toBeDefined();
      expect(intersects(typeRect!.rect, subRect!.rect)).toBe(false);
    });
  }
});
