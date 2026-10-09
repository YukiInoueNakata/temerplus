import { describe, it, expect } from 'vitest';
import type PptxGenJS from 'pptxgenjs';
import {
  pxToPt, parseFontFamilyList, isGenericFamily, resolvePptFontFace, applyPptTextDefaults,
  type PptTextDefaults,
} from './pptText';

describe('pxToPt', () => {
  it('1px = 0.75pt に出力倍率を掛ける', () => {
    expect(pxToPt(13, 1)).toBeCloseTo(9.75);
    expect(pxToPt(13, 0.5)).toBeCloseTo(4.875);
  });
});

describe('フォント名の決定', () => {
  it('CSS の font-family を名前の配列にする（引用符を外す）', () => {
    expect(parseFontFamilyList('"Hiragino Sans", \'Yu Gothic\', Meiryo, system-ui'))
      .toEqual(['Hiragino Sans', 'Yu Gothic', 'Meiryo', 'system-ui']);
    expect(parseFontFamilyList(undefined)).toEqual([]);
  });

  it('総称フォントを見分ける', () => {
    expect(isGenericFamily('system-ui')).toBe(true);
    expect(isGenericFamily('Sans-Serif')).toBe(true);
    expect(isGenericFamily('Meiryo')).toBe(false);
  });

  it('指定の中で端末にある最初の具体名を使う', () => {
    const has = (n: string) => n !== 'Hiragino Sans';
    expect(resolvePptFontFace('"Hiragino Sans", Meiryo', has)).toBe('Meiryo');
  });

  it('未指定・総称だけなら画面の既定スタックから選ぶ（Windows なら Yu Gothic、Mac なら Hiragino Sans）', () => {
    const win = (n: string) => n !== 'Hiragino Sans';
    const mac = () => true;
    expect(resolvePptFontFace(undefined, win)).toBe('Yu Gothic');
    expect(resolvePptFontFace('system-ui', win)).toBe('Yu Gothic');
    expect(resolvePptFontFace('inherit', mac)).toBe('Hiragino Sans');
  });
});

describe('applyPptTextDefaults', () => {
  const defaults: PptTextDefaults = { fontFace: (css) => css ?? 'Yu Gothic', lineRatio: () => 1.6 };
  const capture = () => {
    const calls: Array<PptxGenJS.TextPropsOptions | undefined> = [];
    const slide = {
      addText: (_text: unknown, opts?: PptxGenJS.TextPropsOptions) => { calls.push(opts); return slide; },
    } as unknown as PptxGenJS.Slide;
    return { slide: applyPptTextDefaults(slide, defaults), calls };
  };

  it('フォント名・行送り（pt）・余白 0 を差し込む', () => {
    const { slide, calls } = capture();
    slide.addText('a', { fontSize: 10 });
    expect(calls[0]).toMatchObject({ fontFace: 'Yu Gothic', lineSpacing: 16, margin: 0 });
  });

  it('呼び出し側の指定（フォント・余白・行送り）は尊重する', () => {
    const { slide, calls } = capture();
    slide.addText('a', { fontSize: 10, fontFace: 'Consolas', margin: 3, lineSpacingMultiple: 1.2 });
    expect(calls[0]).toMatchObject({ fontFace: 'Consolas', margin: 3, lineSpacingMultiple: 1.2 });
    expect(calls[0]?.lineSpacing).toBeUndefined();
  });

  it('fontSize が無い（文字列の配列で run ごとに持つ）ときは行送りを足さない', () => {
    const { slide, calls } = capture();
    slide.addText('a', { align: 'left' });
    expect(calls[0]?.lineSpacing).toBeUndefined();
    expect(calls[0]?.margin).toBe(0);
  });
});
