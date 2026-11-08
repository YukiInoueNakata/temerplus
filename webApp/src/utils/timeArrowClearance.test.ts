// 時間の矢印・時期ラベルが、帯に置かない SD/SG（とその種別ラベル・サブラベル）に重ならないこと（2026-11-08）
// 神崎・鈴木 (2021) のデモで、下に置いた SG を時間の矢印が貫いていた（ユーザー指摘）。
// 原因: 矢印の計算が SD/SG の位置を「付けた Box の左上の角」から見積もり、画面は「中心」から描いていた。
// 横型だけでなく縦型でも確かめる。
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { TEMDocument, LayoutDirection } from '../types';
import { computeTimeArrow } from './timeArrow';
import { computePeriodLabels } from './periodLabels';
import { nonBandSDSGRect, nonBandSDSGExtent } from './sdsgPlacement';
import { useTEMStore } from '../store/store';

const demoRaw = readFileSync(resolve(__dirname, '../../sample-tem/kanzaki2021_figure1.tem'), 'utf8');
/** デモを読み込み、縦型はアプリと同じ切り替え（座標を 90 度回す）をしてから返す */
function demoIn(layout: LayoutDirection): TEMDocument {
  useTEMStore.getState().loadDocument(JSON.parse(demoRaw) as TEMDocument);
  if (layout === 'vertical') useTEMStore.getState().setLayout('vertical');
  return useTEMStore.getState().doc;
}

describe.each(['horizontal', 'vertical'] as LayoutDirection[])('%s', (layout) => {
  const isH = layout === 'horizontal';
  const demo = demoIn(layout);
  for (const sheet of demo.sheets) {
    const s = demo.settings;
    const extents = sheet.sdsg.map((sg) => {
      const r = nonBandSDSGRect(sg, sheet, layout)!;
      return { sg, e: nonBandSDSGExtent(sg, r, layout, s.typeLabelVisibility) };
    });
    it(`${sheet.name}: 時間の矢印は SG とそのラベルより外（低い Item 側）`, () => {
      const a = computeTimeArrow(sheet, layout, s.timeArrow, s.sdsgSpace, s.typeLabelVisibility)!;
      for (const { e } of extents) {
        // 横型: 低い Item 側 = 画面の下（y が大きい）。縦型: 左（x が小さい）
        if (isH) expect(a.startY).toBeGreaterThan(e.y + e.height);
        else expect(a.startX).toBeLessThan(e.x);
      }
    });
    it(`${sheet.name}: 時期ラベルは SD とそのラベルより外（高い Item 側）`, () => {
      const g = computePeriodLabels(sheet, layout, s.periodLabels, s.timeArrow, s.sdsgSpace, s.typeLabelVisibility);
      if (!g) return;
      for (const { e } of extents) {
        if (isH) expect(g.itemPx).toBeLessThan(e.y);
        else expect(g.itemPx).toBeGreaterThan(e.x + e.width);
      }
    });
  }
});

describe('Line に付けた SD/SG も位置が決まる', () => {
  it('Line の両端の Box の中心どうしの中点が基準', () => {
    const sheet = demoIn('horizontal').sheets[1];
    const line = sheet.lines[0];
    const sg = { ...sheet.sdsg[0], attachedTo: line.id, itemOffset: 0, timeOffset: 0, anchorMode: undefined };
    const r = nonBandSDSGRect(sg, sheet, 'horizontal');
    expect(r).not.toBeNull();
  });
});
