// 時期ラベルの帯スタイルの区切り（2026-10-09 に画面・PPTX・SVG の 3 か所から共通化）
import { describe, it, expect } from 'vitest';
import { computePeriodBandBounds, type PeriodLabelGeometry } from './periodLabels';

const geom = (positions: Array<[string, number]>): PeriodLabelGeometry => ({
  startX: 0, startY: 0, endX: 1000, endY: 0, itemPx: 0, layout: 'horizontal',
  items: positions.map(([id, x]) => ({ id, x, y: 0, label: id })),
});

describe('computePeriodBandBounds', () => {
  it('区切りは隣り合う位置の中点、両端は時間矢印の端', () => {
    const { sorted, bounds } = computePeriodBandBounds(geom([['A', 200], ['B', 600], ['C', 800]]));
    expect(sorted.map((s) => s.id)).toEqual(['A', 'B', 'C']);
    expect(bounds).toEqual([0, 400, 700, 1000]);
  });
  it('入力順ではなく位置の順に並べる（値が隣を越えると順番が入れ替わる）', () => {
    const { sorted, bounds } = computePeriodBandBounds(geom([['A', 700], ['B', 600]]));
    expect(sorted.map((s) => s.id)).toEqual(['B', 'A']);
    expect(bounds).toEqual([0, 650, 1000]);
  });
});
