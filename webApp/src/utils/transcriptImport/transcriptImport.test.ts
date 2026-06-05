// ============================================================================
// インタビュー原文インポート - 主要パーサのテスト
// ============================================================================

import { describe, it, expect } from 'vitest';
import { parseTxt } from './txt';
import { parseCsvRaw, buildParagraphsFromRows } from './csv';
import { detectSpeaker } from './speaker';

describe('detectSpeaker', () => {
  it('"A:" を speaker として検出', () => {
    const r = detectSpeaker('A: 私は研究室に入りました');
    expect(r.speaker).toBe('A');
    expect(r.text).toBe('私は研究室に入りました');
  });

  it('全角コロン "A：" も検出', () => {
    const r = detectSpeaker('A：これは発言です');
    expect(r.speaker).toBe('A');
    expect(r.text).toBe('これは発言です');
  });

  it('"Q:" "A1:" のような典型パターンを検出', () => {
    expect(detectSpeaker('Q: 質問です').speaker).toBe('Q');
    expect(detectSpeaker('A1: 答え1').speaker).toBe('A1');
  });

  it('日本語話者名も検出', () => {
    const r = detectSpeaker('山田: そうですね');
    expect(r.speaker).toBe('山田');
    expect(r.text).toBe('そうですね');
  });

  it('カッコ表記 "[A]" も検出', () => {
    const r = detectSpeaker('[A] 発言内容');
    expect(r.speaker).toBe('A');
    expect(r.text).toBe('発言内容');
  });

  it('話者表記なしの場合は text=入力のまま', () => {
    const r = detectSpeaker('普通の文章です');
    expect(r.speaker).toBeUndefined();
    expect(r.text).toBe('普通の文章です');
  });
});

describe('parseTxt', () => {
  it('空行で段落分割', () => {
    const text = '第1段落です。\n\n第2段落です。\n\n第3段落です。';
    const paragraphs = parseTxt(text);
    expect(paragraphs.length).toBe(3);
    expect(paragraphs[0].text).toBe('第1段落です。');
    expect(paragraphs[2].text).toBe('第3段落です。');
  });

  it('段落先頭の話者表記を分離', () => {
    const text = 'A: 私は学生です\n\nB: 私は教員です';
    const paragraphs = parseTxt(text);
    expect(paragraphs.length).toBe(2);
    expect(paragraphs[0].speaker).toBe('A');
    expect(paragraphs[0].text).toBe('私は学生です');
    expect(paragraphs[1].speaker).toBe('B');
  });

  it('空行が無いファイルは行ベース分割にフォールバック', () => {
    const text = 'A: 行1\nA: 行2\nA: 行3';
    const paragraphs = parseTxt(text);
    expect(paragraphs.length).toBe(3);
    expect(paragraphs.every((p) => p.speaker === 'A')).toBe(true);
  });

  it('段落内の改行は保持', () => {
    const text = 'A: 1行目\n2行目\n\nB: 別段落';
    const paragraphs = parseTxt(text);
    expect(paragraphs.length).toBe(2);
    expect(paragraphs[0].speaker).toBe('A');
    expect(paragraphs[0].text).toContain('1行目');
    expect(paragraphs[0].text).toContain('2行目');
  });

  it('index は 0 始まりで連番', () => {
    const paragraphs = parseTxt('a\n\nb\n\nc');
    expect(paragraphs.map((p) => p.index)).toEqual([0, 1, 2]);
  });
});

describe('parseCsvRaw', () => {
  it('ヘッダ行を検出して text 列を speaker/timestamp と分離', () => {
    const text = 'speaker,timestamp,text\nA,00:00:01,こんにちは\nB,00:00:05,はい';
    const { rows, header, suggestedMapping } = parseCsvRaw(text);
    expect(header).toEqual(['speaker', 'timestamp', 'text']);
    expect(rows.length).toBe(2);
    expect(suggestedMapping.textColumn).toBe(2);
    expect(suggestedMapping.speakerColumn).toBe(0);
    expect(suggestedMapping.timestampColumn).toBe(1);
  });

  it('日本語ヘッダ "話者", "本文" を認識', () => {
    const text = '話者,本文\nA,内容です';
    const { suggestedMapping } = parseCsvRaw(text);
    expect(suggestedMapping.speakerColumn).toBe(0);
    expect(suggestedMapping.textColumn).toBe(1);
  });

  it('ヘッダなし複数列は最長平均の列を text に推測', () => {
    // 全行で 1 列目に数字が含まれる → ヘッダ判定されない (数字混入で見送り)
    const text = '1,短い\n2,これは長めの本文ですずっと長く続きます\n3,中ぐらい';
    const { rows, header, suggestedMapping } = parseCsvRaw(text);
    expect(header).toBeUndefined();
    expect(rows.length).toBe(3);
    expect(suggestedMapping.textColumn).toBe(1);
  });
});

describe('buildParagraphsFromRows', () => {
  it('mapping に従って Paragraph を構築', () => {
    const rows = [
      ['A', '00:00:01', 'こんにちは'],
      ['B', '00:00:05', 'お元気ですか'],
    ];
    const paragraphs = buildParagraphsFromRows(rows, { textColumn: 2, speakerColumn: 0, timestampColumn: 1 });
    expect(paragraphs.length).toBe(2);
    expect(paragraphs[0].speaker).toBe('A');
    expect(paragraphs[0].timestamp).toBe('00:00:01');
    expect(paragraphs[0].text).toBe('こんにちは');
    expect(paragraphs.map((p) => p.index)).toEqual([0, 1]);
  });

  it('text 列が空の行はスキップ', () => {
    const rows = [
      ['A', '01', 'hello'],
      ['B', '02', ''],
      ['C', '03', 'world'],
    ];
    const paragraphs = buildParagraphsFromRows(rows, { textColumn: 2, speakerColumn: 0 });
    expect(paragraphs.length).toBe(2);
    expect(paragraphs.map((p) => p.text)).toEqual(['hello', 'world']);
  });

  it('speaker 列が無くても text から話者表記を抽出', () => {
    const rows = [['A: 自動抽出される']];
    const paragraphs = buildParagraphsFromRows(rows, { textColumn: 0 });
    expect(paragraphs[0].speaker).toBe('A');
    expect(paragraphs[0].text).toBe('自動抽出される');
  });
});
