// 種別ラベル（採番）のテスト
// - 併記種別: 主種別と併記種別の両方が採番され " / " でつながる
// - 種別「その他」: customTypeLabel をそのまま出す。空なら非表示。連番は任意
import { describe, it, expect } from 'vitest';
import { computeBoxDisplay, boxHasType, SECONDARY_BOX_TYPES, SELECTABLE_BOX_TYPES } from './typeDisplay';
import type { Box } from '../types';

const box = (id: string, type: Box['type'], x: number, extra: Partial<Box> = {}): Box =>
  ({ id, type, label: id, x, y: 0, width: 80, height: 40, ...extra } as Box);

describe('computeBoxDisplay: 従来どおりの採番', () => {
  it('同種別が 1 つなら番号なし、複数なら時間軸順に採番', () => {
    const a = box('a', 'BFP', 0);
    const b = box('b', 'BFP', 100);
    expect(computeBoxDisplay([a], a, 'horizontal')).toBe('BFP');
    expect(computeBoxDisplay([a, b], b, 'horizontal')).toBe('BFP-2');
  });

  it('EFP は英語オーディナル', () => {
    const a = box('a', 'EFP', 0);
    const b = box('b', 'EFP', 100);
    expect(computeBoxDisplay([a, b], a, 'horizontal')).toBe('EFP');
    expect(computeBoxDisplay([a, b], b, 'horizontal')).toBe('2nd EFP');
  });

  it('normal は空', () => {
    const a = box('a', 'normal', 0);
    expect(computeBoxDisplay([a], a, 'horizontal')).toBe('');
  });
});

describe('computeBoxDisplay: 併記種別', () => {
  it('主種別と併記種別を " / " でつなぎ、それぞれ採番する', () => {
    const opp1 = box('opp1', 'OPP', 0);
    const both = box('both', 'BFP', 100, { secondaryType: 'OPP' });
    const bfp1 = box('bfp1', 'BFP', 50);
    const all = [opp1, both, bfp1];
    // BFP は bfp1(x=50) → both(x=100) の順で 2 番目。OPP は opp1 → both で 2 番目
    expect(computeBoxDisplay(all, both, 'horizontal')).toBe('BFP-2 / OPP-2');
  });

  it('併記種別は他の Box の採番にも数えられる', () => {
    const both = box('both', 'BFP', 0, { secondaryType: 'OPP' });
    const opp = box('opp', 'OPP', 100);
    // opp は OPP として 2 番目（both が OPP を併記しているため）
    expect(computeBoxDisplay([both, opp], opp, 'horizontal')).toBe('OPP-2');
  });

  it('主種別と同じ併記種別は無視する', () => {
    const a = box('a', 'BFP', 0, { secondaryType: 'BFP' });
    expect(computeBoxDisplay([a], a, 'horizontal')).toBe('BFP');
  });

  it('boxHasType は主・併記のどちらでも真', () => {
    const a = box('a', 'BFP', 0, { secondaryType: 'OPP' });
    expect(boxHasType(a, 'BFP')).toBe(true);
    expect(boxHasType(a, 'OPP')).toBe(true);
    expect(boxHasType(a, 'EFP')).toBe(false);
  });

  it('併記に選べるのは採番のある種別だけ', () => {
    expect(SECONDARY_BOX_TYPES).not.toContain('normal');
    expect(SECONDARY_BOX_TYPES).not.toContain('annotation');
    expect(SECONDARY_BOX_TYPES).not.toContain('other');
  });
});

describe('computeBoxDisplay: 種別「その他」', () => {
  it('customTypeLabel をそのまま表示、空なら非表示', () => {
    const a = box('a', 'other', 0, { customTypeLabel: 'TLMG' });
    const b = box('b', 'other', 100);
    expect(computeBoxDisplay([a, b], a, 'horizontal')).toBe('TLMG');
    expect(computeBoxDisplay([a, b], b, 'horizontal')).toBe('');
  });

  it('customTypeNumbered なら同名内で連番', () => {
    const a = box('a', 'other', 0, { customTypeLabel: 'X', customTypeNumbered: true });
    const b = box('b', 'other', 100, { customTypeLabel: 'X', customTypeNumbered: true });
    const c = box('c', 'other', 200, { customTypeLabel: 'Y', customTypeNumbered: true });
    expect(computeBoxDisplay([a, b, c], a, 'horizontal')).toBe('X-1');
    expect(computeBoxDisplay([a, b, c], b, 'horizontal')).toBe('X-2');
    expect(computeBoxDisplay([a, b, c], c, 'horizontal')).toBe('Y');
  });

  it('その他は選択可能な種別に含まれる', () => {
    expect(SELECTABLE_BOX_TYPES).toContain('other');
  });
});
