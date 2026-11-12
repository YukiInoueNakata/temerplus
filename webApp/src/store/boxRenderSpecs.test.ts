import { describe, it, expect } from 'vitest';
import { BOX_RENDER_SPECS } from './defaults';

// 既定の太さ（テーマを当てないとき）。2026-11-12 ユーザー決定（v0.2.3）で揃えた。
// 以前は BFP 2.0・P-EFP 2.5・潜在経験 1.0 など 5 段階に分かれていた
describe('BOX_RENDER_SPECS の既定の太さ', () => {
  it('1 本線の枠（行為・その他・BFP・潜在的な行為）は 1.5', () => {
    for (const t of ['normal', 'other', 'BFP', 'annotation']) {
      expect(BOX_RENDER_SPECS[t].borderWidth).toBe(1.5);
    }
  });
  it('OPP と二重線（EFP・P-EFP とセカンド）は 3.0', () => {
    for (const t of ['OPP', 'EFP', '2nd-EFP', 'P-EFP', 'P-2nd-EFP']) {
      expect(BOX_RENDER_SPECS[t].borderWidth).toBe(3.0);
    }
  });
  it('線種は変えていない', () => {
    expect(BOX_RENDER_SPECS.annotation.borderStyle).toBe('dashed');
    expect(BOX_RENDER_SPECS.EFP.borderStyle).toBe('double');
    expect(BOX_RENDER_SPECS['P-EFP'].borderStyle).toBe('dashed');
    expect(BOX_RENDER_SPECS.OPP.borderStyle).toBe('solid');
  });
});
