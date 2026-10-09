// テキスト計測（折返しを含む）のテスト
import { describe, it, expect } from 'vitest';
import { approximateMeasurer, splitChunks, measureWrapped, splitLines } from './textMeasure';

describe('splitLines', () => {
  it('CRLF / LF のどちらでも分割する', () => {
    expect(splitLines('a\nb\r\nc')).toEqual(['a', 'b', 'c']);
  });
});

describe('splitChunks（折返し位置）', () => {
  it('ラテン文字の単語は途中で切らない', () => {
    expect(splitChunks('Comes to respect')).toEqual(['Comes ', 'to ', 'respect']);
  });

  it('日本語は 1 文字ずつ折り返せる', () => {
    expect(splitChunks('本を借')).toEqual(['本', 'を', '借']);
  });

  it('日本語と英語が混ざっても境界で切れる', () => {
    expect(splitChunks('E先生')).toEqual(['E', '先', '生']);
  });
});

describe('measureWrapped', () => {
  const opts = { fontSize: 10 };
  // approximateMeasurer: 半角 = 5.5px / 全角 = 10px（fontSize 10 のとき）

  it('幅に収まる場合は 1 行', () => {
    const m = measureWrapped('abc', 100, opts, approximateMeasurer);
    expect(m.lines).toBe(1);
    expect(m.overflowX).toBe(0);
  });

  it('日本語は折り返して複数行になり、横にはみ出さない', () => {
    const m = measureWrapped('あいうえおかきくけこ', 30, opts, approximateMeasurer);
    expect(m.lines).toBeGreaterThan(1);
    expect(m.overflowX).toBe(0);
    expect(m.width).toBeLessThanOrEqual(30);
  });

  it('折り返せない長い単語は overflowX に出る', () => {
    // 'Relationships' = 13 文字 * 5.5 = 71.5px
    const m = measureWrapped('Relationships', 30, opts, approximateMeasurer);
    expect(m.overflowX).toBeGreaterThan(30);
    expect(m.lines).toBe(1);
  });

  it('明示的な改行は必ず行を分ける', () => {
    const m = measureWrapped('a\nb\nc', 1000, opts, approximateMeasurer);
    expect(m.lines).toBe(3);
  });

  it('maxWidth が 0 以下なら折返しなしとして測る', () => {
    const m = measureWrapped('あいうえお', 0, opts, approximateMeasurer);
    expect(m.lines).toBe(1);
    expect(m.width).toBeCloseTo(50, 1);
  });

  it('行数に応じて高さが増える', () => {
    const one = measureWrapped('あ', 100, opts, approximateMeasurer);
    const three = measureWrapped('あ\nあ\nあ', 100, opts, approximateMeasurer);
    expect(three.height).toBeCloseTo(one.height * 3, 5);
  });
});

describe('wrapLines', () => {
  const opts = { fontSize: 10 };
  it('折り返した行の配列を返し、measureWrapped の行数と一致する', async () => {
    const { wrapLines, measureWrapped, approximateMeasurer } = await import('./textMeasure');
    const w = wrapLines('あいうえおかきくけこ', 30, opts, approximateMeasurer);
    expect(w.lines.join('')).toBe('あいうえおかきくけこ');
    expect(w.lines.length).toBe(measureWrapped('あいうえおかきくけこ', 30, opts, approximateMeasurer).lines);
  });
  it('明示的な改行は保ち、行頭の空白は落とす', async () => {
    const { wrapLines, approximateMeasurer } = await import('./textMeasure');
    expect(wrapLines('a\nb', 1000, opts, approximateMeasurer).lines).toEqual(['a', 'b']);
    const w = wrapLines('hello world', 30, opts, approximateMeasurer);
    expect(w.lines.every((l) => !l.startsWith(' '))).toBe(true);
  });
});
