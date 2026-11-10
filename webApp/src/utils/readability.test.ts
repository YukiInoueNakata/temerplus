// 紙面での読みやすさの点検（2026-11-10。カタログTEA 第 2 章の留意点: 7 pt 未満は読みにくい）
import { describe, it, expect } from 'vitest';
import { hydrateDocument } from './hydrate';
import { applyExportTransform, DEFAULT_EXPORT_TRANSFORM } from './exportTransform';
import { readabilitySummary, textSizesOnPaper, MIN_READABLE_PT, PX_TO_PT } from './readability';
import type { TEMDocument } from '../types';
import kanzakiRaw from '../../sample-tem/kanzaki2021_figure1.tem?raw';

const demo = () => hydrateDocument(JSON.parse(kanzakiRaw) as TEMDocument);

describe('紙面での文字の大きさ', () => {
  it('用紙の px を pt にする（96 px = 72 pt）', () => {
    const d = demo();
    const sh = d.sheets.find((s) => s.id === d.activeSheetId)!;
    sh.boxes = [{ ...sh.boxes[0], label: 'あ', style: { ...(sh.boxes[0].style ?? {}), fontSize: 16 } }];
    const box = textSizesOnPaper(d).find((x) => x.kind === 'box')!;
    expect(box.pt).toBeCloseTo(16 * PX_TO_PT);
    expect(box.pt).toBeCloseTo(12);
  });

  it('全体を小さく縮めると 7 pt を下回る文字が出る（縮めなければ少ない）', () => {
    const fit = (globalScale: number) =>
      readabilitySummary(applyExportTransform(demo(), { ...DEFAULT_EXPORT_TRANSFORM, fitMode: 'manual', globalScale, minFontSize: 0 }).doc);
    const small = fit(0.4);
    const large = fit(1);
    expect(small.tooSmall.length).toBeGreaterThan(large.tooSmall.length);
    expect(small.smallest!.pt).toBeLessThan(large.smallest!.pt);
    expect(small.tooSmall.length).toBeGreaterThan(0);
    expect(small.tooSmall.every((x) => x.pt < MIN_READABLE_PT)).toBe(true);
  });

  it('ページの描く範囲が用紙より広いときは、その倍率で小さくなる', () => {
    const d = demo();
    const a = readabilitySummary(d, 1).smallest!.pt;
    const b = readabilitySummary(d, 0.5).smallest!.pt;
    expect(b).toBeCloseTo(a / 2);
  });

  it('文字の無い Box と、種別ラベルの出ない通常の経験は数えない', () => {
    const d = demo();
    const sh = d.sheets.find((s) => s.id === d.activeSheetId)!;
    sh.boxes = [{ ...sh.boxes[0], type: 'normal', label: '', typeLabelFontSize: 2 }];
    sh.sdsg = []; sh.notes = []; sh.periodLabels = [];
    const kinds = textSizesOnPaper(d).map((x) => x.kind);
    expect(kinds).not.toContain('box');
    expect(kinds).not.toContain('typeLabel');
  });
});
