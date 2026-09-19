import { describe, it, expect } from 'vitest';
import {
  resolveConventionMeaning,
  hasConventionMeaning,
  setConventionMeaning,
  CONVENTION_MEANINGS,
} from './visualConventions';

describe('resolveConventionMeaning（旧 .tem との後方互換）', () => {
  it('未設定は no', () => {
    expect(resolveConventionMeaning(undefined)).toBe('no');
    expect(resolveConventionMeaning({})).toBe('no');
  });

  it('旧形式 hasMeaning: true → yes / false → no', () => {
    expect(resolveConventionMeaning({ hasMeaning: true })).toBe('yes');
    expect(resolveConventionMeaning({ hasMeaning: false })).toBe('no');
  });

  it('meaning があれば hasMeaning より優先される', () => {
    expect(resolveConventionMeaning({ hasMeaning: false, meaning: 'loose' })).toBe('loose');
    expect(resolveConventionMeaning({ hasMeaning: true, meaning: 'no' })).toBe('no');
  });

  it('不正な meaning は hasMeaning にフォールバックする', () => {
    const ent = { hasMeaning: true, meaning: 'maybe' } as unknown as Parameters<typeof resolveConventionMeaning>[0];
    expect(resolveConventionMeaning(ent)).toBe('yes');
  });
});

describe('setConventionMeaning', () => {
  it('meaning と hasMeaning を同時に更新する（旧バージョン互換）', () => {
    expect(setConventionMeaning(undefined, 'yes')).toEqual({ meaning: 'yes', hasMeaning: true });
    expect(setConventionMeaning(undefined, 'loose')).toEqual({ meaning: 'loose', hasMeaning: true });
    expect(setConventionMeaning(undefined, 'no')).toEqual({ meaning: 'no', hasMeaning: false });
  });

  it('description を保持する', () => {
    const out = setConventionMeaning({ hasMeaning: true, description: 'x' }, 'loose');
    expect(out.description).toBe('x');
    expect(out.meaning).toBe('loose');
  });

  it('往復変換が安定している', () => {
    CONVENTION_MEANINGS.forEach((m) => {
      expect(resolveConventionMeaning(setConventionMeaning(undefined, m))).toBe(m);
    });
  });
});

describe('hasConventionMeaning', () => {
  it('yes と loose は説明文の対象、no は対象外', () => {
    expect(hasConventionMeaning({ meaning: 'yes' })).toBe(true);
    expect(hasConventionMeaning({ meaning: 'loose' })).toBe(true);
    expect(hasConventionMeaning({ meaning: 'no' })).toBe(false);
    expect(hasConventionMeaning(undefined)).toBe(false);
  });
});
