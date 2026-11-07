// 2026-11-07 Mac の確認で見つかった「出力で文字が枠からあふれる」の回帰テスト
// 記録: docs/verify-macos-20261107.md 所見 1
import { describe, it, expect } from 'vitest';
import { hydrateDocument } from './hydrate';
import { applyExportTransform, DEFAULT_EXPORT_TRANSFORM } from './exportTransform';
import type { TEMDocument } from '../types';
import kanzakiRaw from '../../sample-tem/kanzaki2021_figure1.tem?raw';

function demo(): TEMDocument {
  return hydrateDocument(JSON.parse(kanzakiRaw) as TEMDocument);
}
const active = (d: TEMDocument) => d.sheets.find((s) => s.id === d.activeSheetId)!;
const fitBoth = { ...DEFAULT_EXPORT_TRANSFORM, fitMode: 'fit-both' as const };
const manual = (s: number) => ({ ...DEFAULT_EXPORT_TRANSFORM, fitMode: 'manual' as const, globalScale: s, autoCenterOnPaper: false });

describe('全体の倍率で文字も縮める', () => {
  it('両方に収める: Box の幅と文字の大きさの比が変わらない', () => {
    const d = demo();
    const { doc: out, effectiveScale } = applyExportTransform(d, fitBoth);
    expect(effectiveScale).toBeLessThan(1);
    const b0 = active(d).boxes[0];
    const b1 = active(out).boxes.find((b) => b.id === b0.id)!;
    const fs0 = b0.style?.fontSize ?? d.settings.defaultFontSize;
    expect(b1.width / b0.width).toBeCloseTo(effectiveScale, 5);
    expect(b1.style!.fontSize! / fs0).toBeCloseTo(effectiveScale, 5);
    // 小さくなりすぎる文字は最小の大きさ（既定 6）で止める
    expect(b1.typeLabelFontSize).toBeCloseTo(Math.max(6, 11 * effectiveScale), 5);
  });

  it('時期区分・時間矢印の文字も縮める', () => {
    const d = demo();
    const { doc: out } = applyExportTransform(d, manual(0.5));
    expect(out.settings.periodLabels.fontSize).toBeCloseTo(Math.max(6, d.settings.periodLabels.fontSize * 0.5), 5);
    expect(out.settings.timeArrow.fontSize).toBeCloseTo(Math.max(6, d.settings.timeArrow.fontSize * 0.5), 5);
  });

  it('大きさの指定が無い SD/SG は既定の 70×40 を縮める', () => {
    const d = demo();
    const sg = active(d).sdsg[0];
    sg.width = undefined;
    sg.height = undefined;
    const { doc: out } = applyExportTransform(d, manual(0.5));
    const sg1 = active(out).sdsg.find((s) => s.id === sg.id)!;
    expect(sg1.width).toBe(35);
    expect(sg1.height).toBe(20);
  });

  it('メモも Box と一緒に縮み、用紙の中央に寄せるときも一緒に動く', () => {
    const d = demo();
    const sh = active(d);
    const b0 = sh.boxes[0];
    sh.notes = [{ id: 'N1', x: b0.x + 200, y: b0.y + 100, width: 120, height: 60, text: 'メモ' }];
    const { doc: out, effectiveScale: s } = applyExportTransform(d, fitBoth);
    const o = active(out);
    const b1 = o.boxes.find((b) => b.id === b0.id)!;
    const n1 = o.notes![0];
    expect(n1.x - b1.x).toBeCloseTo(200 * s, 5);
    expect(n1.y - b1.y).toBeCloseTo(100 * s, 5);
    expect(n1.width).toBeCloseTo(120 * s, 5);
    expect(n1.fontSize).toBeCloseTo(Math.min(d.settings.defaultFontSize ?? 13, 13) * s, 5);
  });

  it('曲線の制御点も縮めて一緒に動かす', () => {
    const d = demo();
    const sh = active(d);
    const l = sh.lines[0];
    const b0 = sh.boxes[0];
    l.controlPoints = [{ x: b0.x + 50, y: b0.y }, { x: b0.x + 100, y: b0.y + 40 }];
    const { doc: out, effectiveScale: s } = applyExportTransform(d, fitBoth);
    const o = active(out);
    const b1 = o.boxes.find((b) => b.id === b0.id)!;
    const cp = o.lines.find((x) => x.id === l.id)!.controlPoints!;
    expect(cp[0].x - b1.x).toBeCloseTo(50 * s, 5);
    expect(cp[1].y - b1.y).toBeCloseTo(40 * s, 5);
  });

  it('テーマで決めた文字の大きさを出力で既定値に戻さない', () => {
    const d = demo();
    const b0 = active(d).boxes.find((b) => b.type === 'normal' && b.style?.fontSize == null)!;
    d.settings.boxTypePresets = { normal: { fontSize: 20 } };
    const { doc: out } = applyExportTransform(d, manual(1));
    expect(active(out).boxes.find((b) => b.id === b0.id)!.style!.fontSize).toBe(20);
  });
});
