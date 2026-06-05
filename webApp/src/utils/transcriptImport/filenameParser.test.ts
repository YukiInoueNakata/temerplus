// ============================================================================
// ファイル名解析のテスト
// ============================================================================

import { describe, it, expect } from 'vitest';
import { parseFilenameHints, stripExtension } from './filenameParser';

describe('stripExtension', () => {
  it('拡張子を除去', () => {
    expect(stripExtension('A_第1回.docx')).toBe('A_第1回');
    expect(stripExtension('Yuki.txt')).toBe('Yuki');
    expect(stripExtension('no_ext')).toBe('no_ext');
    expect(stripExtension('multi.dot.name.csv')).toBe('multi.dot.name');
  });
});

describe('parseFilenameHints', () => {
  it('「A_第1回」を解析', () => {
    const r = parseFilenameHints('A_第1回');
    expect(r.participantHint).toBe('A');
    expect(r.sessionHint).toBe(1);
  });

  it('「協力者A_第2回」の協力者プレフィクスを剥がす', () => {
    const r = parseFilenameHints('協力者A_第2回');
    expect(r.participantHint).toBe('A');
    expect(r.sessionHint).toBe(2);
  });

  it('「A_session2」を解析', () => {
    const r = parseFilenameHints('A_session2');
    expect(r.participantHint).toBe('A');
    expect(r.sessionHint).toBe(2);
  });

  it('「Yamada_v3」を解析', () => {
    const r = parseFilenameHints('Yamada_v3');
    expect(r.participantHint).toBe('Yamada');
    expect(r.sessionHint).toBe(3);
  });

  it('「B-1」を解析 (末尾の -N をセッションとする)', () => {
    const r = parseFilenameHints('B-1');
    expect(r.participantHint).toBe('B');
    expect(r.sessionHint).toBe(1);
  });

  it('「interview_C_3」を解析', () => {
    const r = parseFilenameHints('interview_C_3');
    expect(r.participantHint).toBe('C');
    expect(r.sessionHint).toBe(3);
  });

  it('「A第3回 (2026-04)」を解析', () => {
    const r = parseFilenameHints('A第3回 (2026-04)');
    expect(r.participantHint).toBe('A');
    expect(r.sessionHint).toBe(3);
  });

  it('「Yuki」のみは participant のみ', () => {
    const r = parseFilenameHints('Yuki');
    expect(r.participantHint).toBe('Yuki');
    expect(r.sessionHint).toBeUndefined();
  });

  it('「20240415_A」の先頭日付を除去', () => {
    const r = parseFilenameHints('20240415_A');
    expect(r.participantHint).toBe('A');
    expect(r.sessionHint).toBeUndefined();
  });

  it('全角数字を含む「A_第２回」も解析', () => {
    const r = parseFilenameHints('A_第２回');
    expect(r.participantHint).toBe('A');
    expect(r.sessionHint).toBe(2);
  });

  it('意味のない単語 (transcript / 逐語録) はスキップ', () => {
    expect(parseFilenameHints('transcript_A_1').participantHint).toBe('A');
    expect(parseFilenameHints('逐語録_B_2').participantHint).toBe('B');
  });

  it('数字のみのトークンは participant 候補から除外', () => {
    const r = parseFilenameHints('2024_A_1');
    expect(r.participantHint).toBe('A');
    expect(r.sessionHint).toBe(1);
  });
});
