// 画像出力（PNG・画像方式の SVG・PDF）で編集用の部品を写さないことの回帰テスト（2026-10-09）
// 利用者の PNG に、Box の左右の接続ハンドル（灰色の丸）が写り込んでいた
import { describe, it, expect } from 'vitest';
import { buildFilter } from './exportImage';

const el = (cls: string) => { const d = document.createElement('div'); d.className = cls; return d; };
const opts = { includeControls: false, includeRulers: false, includeGrid: false, includePaperGuides: false } as Parameters<typeof buildFilter>[0];

describe('buildFilter', () => {
  it('接続ハンドルとリサイズ枠は常に除く', () => {
    const f = buildFilter(opts);
    expect(f(el('react-flow__handle react-flow__handle-left source'))).toBe(false);
    expect(f(el('react-flow__resize-control handle top left'))).toBe(false);
  });
  it('Box 本体などは残す', () => {
    expect(buildFilter(opts)(el('react-flow__node react-flow__node-box'))).toBe(true);
  });
});
