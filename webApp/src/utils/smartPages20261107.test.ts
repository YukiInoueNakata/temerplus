// 2026-11-07 複数ページの「案 B」（左寄せ・境目を Box の間の空いた所に・凡例は各ページ）の回帰テスト
import { describe, it, expect } from 'vitest';
import { hydrateDocument } from './hydrate';
import { applyExportTransform, DEFAULT_EXPORT_TRANSFORM } from './exportTransform';
import { computeSmartPagesForDoc, solidSpans } from './smartPages';
import { buildSVGDocuments } from './exportSVGNative';
import { applyExportContent } from './exportContent';
import type { TEMDocument } from '../types';
import kanzakiRaw from '../../sample-tem/kanzaki2021_figure1.tem?raw';
import wideRaw from '../../test-fixtures/wide-kanzaki-x4.tem?raw';

const load = (raw: string) => hydrateDocument(JSON.parse(raw) as TEMDocument);

function pagesFor(raw: string, n: number) {
  const d0 = load(raw);
  const d = applyExportContent(d0, { legend: true, periodLabels: true });
  const xf = { ...DEFAULT_EXPORT_TRANSFORM, fitMode: 'fit-short' as const, pageCount: n };
  const t = applyExportTransform(d, xf);
  const pages = computeSmartPagesForDoc(t.doc, { paperSize: xf.paperSize, pageCount: n, paperMarginRatio: xf.paperMarginRatio });
  return { doc: t.doc, pages };
}

describe.each([
  ['日本語デモ', kanzakiRaw, 2],
  ['横長テスト（詳細版 × 4）', wideRaw, 4],
  ['横長テスト（詳細版 × 4）を 6 ページ', wideRaw, 6],
])('%s・%i ページ', (_name, raw, n) => {
  it('ページ数どおり・境目が Box などの中に来ない・ページが途切れずにつながる', () => {
    const { doc, pages } = pagesFor(raw, n);
    expect(pages).toHaveLength(n);
    const { solids } = solidSpans(doc)!;
    for (let i = 0; i < n - 1; i++) {
      const cut = pages[i].clipEnd!;
      expect(cut).toBeDefined();
      expect(solids.some(([a, b]) => cut > a && cut < b)).toBe(false);
      expect(pages[i + 1].clipStart).toBe(cut);
      // 境目はそのページの窓の中
      expect(cut).toBeLessThanOrEqual(pages[i].innerX + pages[i].innerWidth);
    }
  });

  it('図全体が N ページに収まる（最後のページの窓の中で終わる）', () => {
    const { doc, pages } = pagesFor(raw, n);
    const { start, end } = solidSpans(doc)!;
    expect(pages[0].innerX).toBeLessThanOrEqual(start);
    const last = pages[n - 1];
    expect(end).toBeLessThanOrEqual(last.innerX + last.innerWidth);
  });

  it('凡例は各ページの同じ位置（ページの窓に対して）', () => {
    const { pages } = pagesFor(raw, n);
    const off = pages.map((p) => p.legendAt!.x - p.innerX);
    off.forEach((o) => expect(o).toBeCloseTo(off[0], 5));
  });
});

describe('SVG: 各ページに、そのページの種類だけの凡例を描く', () => {
  it('横長テスト 4 ページの全ページに凡例の枠がある', () => {
    const { doc, pages } = pagesFor(wideRaw, 4);
    const sheet = doc.sheets.find((s) => s.id === doc.activeSheetId)!;
    const svgs = buildSVGDocuments({ sheet, settings: doc.settings, paperSize: 'A4-landscape', scale: false, offset: 0, pages });
    expect(svgs).toHaveLength(4);
    svgs.forEach((s) => expect(s).toContain('凡例'));
  });
});
