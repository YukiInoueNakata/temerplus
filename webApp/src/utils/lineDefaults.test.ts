// Line（矢印）の既定スタイルの解決とパッチ化のテスト
// - 旧 .tem（settings.lineDefaults なし）でも工場出荷値へフォールバックすること
// - 一括適用のパッチに線種を既定で含めないこと（実線/点線の区別を壊さないため）
import { describe, it, expect } from 'vitest';
import {
  FACTORY_LINE_DEFAULTS,
  resolveLineDefaults,
  lineDefaultsToPatch,
} from './lineDefaults';

describe('resolveLineDefaults（後方互換）', () => {
  it('settings が未指定でも工場出荷値を返す', () => {
    expect(resolveLineDefaults()).toEqual(FACTORY_LINE_DEFAULTS);
  });

  it('lineDefaults が未定義の旧 .tem は工場出荷値へフォールバックする', () => {
    expect(resolveLineDefaults({ lineDefaults: undefined })).toEqual(FACTORY_LINE_DEFAULTS);
  });

  it('工場出荷値は各描画箇所のハードコード既定と一致する', () => {
    // Canvas / ExportPreviewCanvas / exportPPT / exportSVGNative の
    // `l.style?.color ?? '#222'` / `strokeWidth ?? 1.5` と同じ値
    expect(FACTORY_LINE_DEFAULTS.color).toBe('#222');
    expect(FACTORY_LINE_DEFAULTS.strokeWidth).toBe(1.5);
    expect(FACTORY_LINE_DEFAULTS.shape).toBe('straight');
    expect(FACTORY_LINE_DEFAULTS.type).toBe('RLine');
  });

  it('部分指定は指定分だけ上書きし、残りは工場出荷値のまま', () => {
    const r = resolveLineDefaults({ lineDefaults: { color: '#ff0000', angleMode: true } });
    expect(r.color).toBe('#ff0000');
    expect(r.angleMode).toBe(true);
    expect(r.strokeWidth).toBe(FACTORY_LINE_DEFAULTS.strokeWidth);
    expect(r.shape).toBe(FACTORY_LINE_DEFAULTS.shape);
  });

  it('0 や false を明示指定した場合に工場出荷値へ巻き戻らない', () => {
    const r = resolveLineDefaults({
      lineDefaults: { curveIntensity: 0, angleMode: false, strokeWidth: 0.5 },
    });
    expect(r.curveIntensity).toBe(0);
    expect(r.angleMode).toBe(false);
    expect(r.strokeWidth).toBe(0.5);
  });
});

describe('lineDefaultsToPatch', () => {
  const d = resolveLineDefaults({
    lineDefaults: { type: 'XLine', color: '#0000ff', strokeWidth: 3, startMargin: 4 },
  });

  it('既定では線種を含めない（実線/点線の区別を保つ）', () => {
    const patch = lineDefaultsToPatch(d);
    expect(patch.type).toBeUndefined();
    expect(patch.style).toEqual({ color: '#0000ff', strokeWidth: 3 });
    expect(patch.startMargin).toBe(4);
  });

  it('includeType を立てたときだけ線種を含める', () => {
    expect(lineDefaultsToPatch(d, { includeType: true }).type).toBe('XLine');
  });

  it('controlPoints には触れない（手動制御点は patch の対象外）', () => {
    expect('controlPoints' in lineDefaultsToPatch(d)).toBe(false);
  });
});
