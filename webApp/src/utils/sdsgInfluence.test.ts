// 幅を持つ SD/SG の影響線のテスト
import { describe, it, expect } from 'vitest';
import { rectEdgePoint, influenceSegment, collectInfluenceSegments, hasInfluence } from './sdsgInfluence';
import { DEFAULT_SETTINGS } from '../store/defaults';
import type { Sheet, SDSG } from '../types';

describe('rectEdgePoint', () => {
  const r = { x: 0, y: 0, width: 100, height: 40 };
  it('真下方向なら下辺の中点', () => {
    expect(rectEdgePoint(r, 0, 1)).toEqual({ x: 50, y: 40 });
  });
  it('真右方向なら右辺の中点', () => {
    expect(rectEdgePoint(r, 1, 0)).toEqual({ x: 100, y: 20 });
  });
  it('斜めは先に当たる辺で止まる', () => {
    const p = rectEdgePoint(r, 1, 1);
    // 高さ 40 なので y 方向が先に当たる（k = 20）
    expect(p).toEqual({ x: 70, y: 40 });
  });
  it('方向ゼロなら中心', () => {
    expect(rectEdgePoint(r, 0, 0)).toEqual({ x: 50, y: 20 });
  });
});

describe('influenceSegment', () => {
  it('上の SD から下の Box へ、縁から縁まで', () => {
    const sd = { x: 0, y: 0, width: 300, height: 40 };
    const box = { x: 100, y: 200, width: 100, height: 60 };
    const s = influenceSegment(sd, box)!;
    expect(s.y1).toBe(40);       // SD の下辺
    expect(s.y2).toBe(200);      // Box の上辺
    expect(s.x1).toBe(150);
    expect(s.x2).toBe(150);
  });
  it('重なっている矩形では描かない', () => {
    const a = { x: 0, y: 0, width: 100, height: 100 };
    const b = { x: 10, y: 10, width: 20, height: 20 };
    expect(influenceSegment(a, b)).toBeNull();
  });
});

describe('collectInfluenceSegments', () => {
  const sheet = (): Sheet => ({
    id: 'S', name: 'S',
    boxes: [
      { id: 'A', type: 'normal', label: 'a', x: 0, y: 200, width: 80, height: 40 },
      { id: 'B', type: 'normal', label: 'b', x: 200, y: 200, width: 80, height: 40 },
      { id: 'C', type: 'normal', label: 'c', x: 400, y: 200, width: 80, height: 40 },
    ],
    lines: [],
    sdsg: [
      {
        id: 'SD1', type: 'SD', label: 'SD', attachedTo: 'A', attachedType: 'box',
        attachedTo2: 'C', attachedType2: 'box', anchorMode: 'between', betweenMode: 'edge-to-edge',
        itemOffset: -120, timeOffset: 0, width: 70, height: 40,
        shape: 'rect', influenceTargets: ['A', 'B', 'ZZZ'],
      } as SDSG,
    ],
    periodLabels: [], notes: [],
  } as unknown as Sheet);

  it('影響先ごとに 1 本、存在しない Box は飛ばす', () => {
    const segs = collectInfluenceSegments(sheet(), 'horizontal', DEFAULT_SETTINGS);
    expect(segs.map((s) => s.boxId).sort()).toEqual(['A', 'B']);
    segs.forEach((s) => {
      expect(s.sdsgId).toBe('SD1');
      expect(s.strokeWidth).toBe(3);      // 既定の太さ
      expect(s.y2).toBe(200);             // Box の上辺で止まる
      expect(s.y1).toBeLessThan(200);     // SD 側は上にある
    });
  });

  it('influenceTargets が無い SD/SG は対象外', () => {
    const sh = sheet();
    sh.sdsg[0].influenceTargets = undefined;
    expect(hasInfluence(sh.sdsg[0])).toBe(false);
    expect(collectInfluenceSegments(sh, 'horizontal', DEFAULT_SETTINGS)).toEqual([]);
  });

  it('太さは influenceStrokeWidth で上書きできる', () => {
    const sh = sheet();
    sh.sdsg[0].influenceStrokeWidth = 5;
    const segs = collectInfluenceSegments(sh, 'horizontal', DEFAULT_SETTINGS);
    expect(segs[0].strokeWidth).toBe(5);
  });
});
