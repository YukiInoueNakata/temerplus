// カタログTEA 図 2-1 の例のテーマ（2026-11-10 ユーザー決定）と、凡例・記号体系の宣言の楕円
import { describe, it, expect } from 'vitest';
import { hydrateDocument } from './hydrate';
import { BUILTIN_THEMES } from './boxThemes';
import { legendSampleShape, resolveBoxBorderDraw } from './boxPreset';
import { describeNotation } from './notationDescribe';
import { renderLegendSVG } from './exportSVGNative';
import type { Box, TEMDocument } from '../types';
import kanzakiRaw from '../../sample-tem/kanzaki2021_figure1.tem?raw';

const theme = BUILTIN_THEMES.find((t) => t.id === 'theme-catalog-tea-fig2-1')!;

function doc(withTheme: boolean): TEMDocument {
  const d = hydrateDocument(JSON.parse(kanzakiRaw) as TEMDocument);
  d.settings.boxTypePresets = withTheme ? JSON.parse(JSON.stringify(theme.presets)) : {};
  return d;
}
const active = (d: TEMDocument) => d.sheets.find((s) => s.id === d.activeSheetId)!;

describe('カタログTEA 図 2-1 の例のテーマ', () => {
  it('組み込みテーマにあり、OPP は楕円、BFP は二重線、EFP は実線、P-EFP は点線 1 本', () => {
    expect(theme).toBeDefined();
    const d = doc(true);
    expect(theme.presets.OPP?.shape).toBe('ellipse');
    expect(resolveBoxBorderDraw({ type: 'BFP' } as Box, d.settings).kind).toBe('double');
    expect(resolveBoxBorderDraw({ type: 'EFP' } as Box, d.settings)).toMatchObject({ kind: 'single', style: 'solid' });
    expect(resolveBoxBorderDraw({ type: 'P-EFP' } as Box, d.settings)).toMatchObject({ kind: 'single', style: 'dashed' });
  });

  it('凡例の見本は、テーマが楕円を指定した種別だけ楕円', () => {
    const d = doc(true);
    expect(legendSampleShape('OPP', d.settings)).toBe('ellipse');
    expect(legendSampleShape('BFP', d.settings)).toBe('rect');
    expect(legendSampleShape('OPP', doc(false).settings)).toBe('rect');
  });

  it('SVG の凡例に楕円が出る（テーマなしでは出ない）', () => {
    const withTheme = doc(true);
    const svg = renderLegendSVG(active(withTheme), withTheme.settings)!.svg;
    expect(svg).toContain('<ellipse');
    const plain = doc(false);
    expect(renderLegendSVG(active(plain), plain.settings)!.svg).not.toContain('<ellipse');
  });

  it('論文用レポートの記号体系の宣言に「楕円」と書く', () => {
    const d = doc(true);
    d.settings.locale = 'ja';
    const desc = describeNotation(d)!;
    expect(desc.lines.find((l) => l.startsWith('必須通過点'))).toMatch(/楕円$/);
    expect(desc.lines.find((l) => l.startsWith('分岐点'))).not.toMatch(/楕円/);
  });
});
