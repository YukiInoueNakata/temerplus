// 2026-11-07 複数ページの「案 B」（左寄せ・境目を Box の間の空いた所に・凡例は各ページ）の回帰テスト
import { describe, it, expect } from 'vitest';
import { hydrateDocument } from './hydrate';
import { applyExportTransform, DEFAULT_EXPORT_TRANSFORM } from './exportTransform';
import { computeSmartPagesForDoc, solidSpans } from './smartPages';
import { buildSVGDocuments } from './exportSVGNative';
import { applyExportContent } from './exportContent';
import { computeSmartPageBounds, pageClipRect } from './pageSplit';
import { legendSheetForClip } from './pageLegend';
import { computeTimeArrow } from './timeArrow';
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

describe('縦型レイアウト（横長テストの縦と横を入れ替えたもの）', () => {
  it('ページは縦に並び、境目が Box の中に来ない', () => {
    const d0 = load(wideRaw);
    d0.settings.layout = 'vertical';
    d0.sheets.forEach((s) => s.boxes.forEach((b) => {
      [b.x, b.y] = [b.y, b.x];
      [b.width, b.height] = [b.height, b.width];
    }));
    const d = applyExportContent(d0, { legend: true, periodLabels: true });
    const xf = { ...DEFAULT_EXPORT_TRANSFORM, paperSize: 'A4-portrait' as const, fitMode: 'fit-short' as const, pageCount: 4 };
    const t = applyExportTransform(d, xf);
    const pages = computeSmartPagesForDoc(t.doc, { paperSize: xf.paperSize, pageCount: 4, paperMarginRatio: xf.paperMarginRatio });
    expect(pages.every((p) => p.axis === 'y')).toBe(true);
    const { solids } = solidSpans(t.doc)!;
    for (let i = 0; i < 3; i++) {
      expect(pages[i + 1].innerY).toBeGreaterThan(pages[i].innerY);
      const cut = pages[i].clipEnd!;
      expect(solids.some(([a, b]) => cut > a && cut < b)).toBe(false);
    }
  });
});

describe('凡例が図の始まりより手前にあっても、各ページの窓の中に置く', () => {
  it('凡例を図の左に離して置く', () => {
    const d0 = load(wideRaw);
    d0.settings.legend = { ...d0.settings.legend, position: { x: -3000, y: d0.settings.legend.position.y } };
    const d = applyExportContent(d0, { legend: true, periodLabels: true });
    const xf = { ...DEFAULT_EXPORT_TRANSFORM, fitMode: 'fit-short' as const, pageCount: 4 };
    const t = applyExportTransform(d, xf);
    const pages = computeSmartPagesForDoc(t.doc, { paperSize: xf.paperSize, pageCount: 4, paperMarginRatio: xf.paperMarginRatio });
    pages.forEach((p) => {
      expect(p.legendAt!.x).toBeGreaterThanOrEqual(p.innerX);
      expect(p.legendAt!.x).toBeLessThan(p.innerX + p.innerWidth);
    });
  });
});

// ---- 2026-11-07 Codex レビューの指摘 ----
describe('境目を大きく左へずらしても、図の終わりが欠けない（High）', () => {
  it('Codex の数値例: A4 横・2 ページ・要素 [0,100] [560,1060] [1570,1800]', () => {
    const pages = computeSmartPageBounds({
      paperWidth: 1123, paperHeight: 794, layout: 'horizontal', pageCount: 2, marginPx: 56.15,
      solids: [[0, 100], [560, 1060], [1570, 1800]], contentStart: 0, contentEnd: 1800,
    });
    const last = pages[1];
    expect(last.innerX + last.innerWidth).toBeGreaterThanOrEqual(1800);
  });
});

describe('凡例の種類は、そのページで実際に描くものから決める（Medium）', () => {
  it('境目をまたぐ点線（つなぎの矢印）が、またいだ先のページの凡例にも入る', () => {
    const { doc, pages } = pagesFor(wideRaw, 4);
    const sheet = doc.sheets.find((s) => s.id === doc.activeSheetId)!;
    const ls = legendSheetForClip(sheet, pageClipRect(pages[1], 'horizontal'), 'horizontal', doc.settings);
    expect(ls.lines.some((l) => l.id === 'LINK_2')).toBe(true);
  });
  it('矢印に付けた SD/SG も、描いた位置がページにあれば凡例に入る', () => {
    const { doc, pages } = pagesFor(wideRaw, 4);
    const s0 = doc.sheets.find((s) => s.id === doc.activeSheetId)!;
    const line = s0.lines.find((l) => l.id === 'L_3_1')!;
    const sheet = { ...s0, sdsg: [...s0.sdsg, { ...s0.sdsg[0], id: 'SD_ON_LINE', attachedTo: line.id, attachedType: 'line' as const }] };
    const page = pages.find((p) => {
      const ls = legendSheetForClip(sheet, pageClipRect(p, 'horizontal'), 'horizontal', doc.settings);
      return ls.sdsg.some((s) => s.id === 'SD_ON_LINE');
    });
    expect(page).toBeDefined();
  });
});

describe('時間矢印の頭が 1 ページ目に入る（Medium）', () => {
  it('矢印を最初の Box より 2 Level 手前から始める', () => {
    const d0 = load(kanzakiRaw);
    d0.settings.timeArrow = { ...d0.settings.timeArrow, timeStartExtension: -2 };
    const d = applyExportContent(d0, { legend: true, periodLabels: true });
    const xf = { ...DEFAULT_EXPORT_TRANSFORM, fitMode: 'fit-short' as const, pageCount: 2 };
    const t = applyExportTransform(d, xf);
    const pages = computeSmartPagesForDoc(t.doc, { paperSize: xf.paperSize, pageCount: 2, paperMarginRatio: xf.paperMarginRatio });
    const sheet = t.doc.sheets.find((s) => s.id === t.doc.activeSheetId)!;
    const a = computeTimeArrow(sheet, t.doc.settings.layout, t.doc.settings.timeArrow, t.doc.settings.sdsgSpace, t.doc.settings.typeLabelVisibility)!;
    expect(pages[0].innerX).toBeLessThanOrEqual(Math.min(a.startX, a.endX));
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
