// ページ分割の出力で SD/SG が消える不具合の回帰テスト（2026-10-10 利用者の報告）
// 以前はページごとに「付いている Box がそのページに見えている」SD/SG だけを残しており、
// 矢印（Line）に付けた SD/SG と、両端の Box が別ページにある幅モードの SD/SG が全ページで消えていた
import { describe, it, expect } from 'vitest';
import { hydrateDocument } from './hydrate';
import { applyExportTransform, DEFAULT_EXPORT_TRANSFORM } from './exportTransform';
import { computePageBounds } from './pageSplit';
import { getPaperPx } from './paperSizes';
import { exportToPPTX } from './exportPPT';
import { buildSVGDocuments } from './exportSVGNative';
import { parsePptx, visualRect } from './pptxImport';
import type { Sheet, TEMDocument } from '../types';
import kanzakiRaw from '../../sample-tem/kanzaki2021_figure1.tem?raw';

function splitDoc(edit: (s: Sheet) => Sheet) {
  const doc = hydrateDocument(JSON.parse(kanzakiRaw) as TEMDocument);
  const idx = doc.sheets.findIndex((s) => s.id === doc.activeSheetId);
  doc.sheets[idx] = edit(doc.sheets[idx]);
  // 出力ダイアログの「複数ページ」の既定（2 ページ・短辺に合わせる）
  const xf = { ...DEFAULT_EXPORT_TRANSFORM, pageCount: 2, fitMode: 'fit-short' as const };
  const tr = applyExportTransform(doc, xf);
  const paper = getPaperPx(xf.paperSize);
  const pages = computePageBounds({ paperWidth: paper.width, paperHeight: paper.height, layout: tr.doc.settings.layout, pageCount: 2, overlapPx: xf.pageOverlapPx });
  const sheet = tr.doc.sheets.find((s) => s.id === tr.doc.activeSheetId)!;
  return { sheet, settings: tr.doc.settings, pages, paperSize: xf.paperSize };
}

/** スライドの中に見えている SD/SG の図形の数（スライドごと） */
async function pptSdsgOnSlides(d: ReturnType<typeof splitDoc>) {
  const bytes = await exportToPPTX({ sheet: d.sheet, settings: d.settings, scale: false, offset: 0, paperSize: d.paperSize, pages: d.pages, returnBytes: true });
  const f = await parsePptx(bytes as Uint8Array, 'split.pptx');
  return f.slides.map((sl) => sl.shapes
    .filter((s) => /^TEMer S[DG]$/.test(s.name))
    .filter((s) => { const r = visualRect(s); return r.x + r.w > 0 && r.x < f.widthPt && r.y + r.h > 0 && r.y < f.heightPt; })
    .length);
}

/** SD/SG の五角形の数（ページごと）。凡例の図柄（線の太さ 1）と区別するため線の太さ 1.5 のものだけ数える */
const svgSdsgCount = (d: ReturnType<typeof splitDoc>) =>
  buildSVGDocuments({ sheet: d.sheet, settings: d.settings, paperSize: d.paperSize, scale: false, offset: 0, pages: d.pages })
    .map((svg) => (svg.match(/<polygon[^>]*stroke-width="1\.5"/g) ?? []).length);

describe('ページ分割の出力で SD/SG が消えない', () => {
  it('矢印（Line）に付けた SD/SG', async () => {
    const d = splitDoc((s) => ({ ...s, sdsg: s.sdsg.map((g) => ({ ...g, attachedTo: s.lines[0].id, attachedType: 'line' as const })) }));
    const ppt = await pptSdsgOnSlides(d);
    expect(ppt.reduce((a, b) => a + b, 0)).toBeGreaterThanOrEqual(d.sheet.sdsg.length);
  }, 30_000);

  it('幅モードで両端の Box が別ページにある SD/SG は、両方のページに出る', async () => {
    const d = splitDoc((s) => {
      const byX = [...s.boxes].sort((a, b) => a.x - b.x);
      return { ...s, sdsg: s.sdsg.map((g) => ({
        ...g, anchorMode: 'between' as const,
        attachedTo: byX[0].id, attachedType: 'box' as const,
        attachedTo2: byX[byX.length - 1].id, attachedType2: 'box' as const,
      })) };
    });
    const ppt = await pptSdsgOnSlides(d);
    expect(ppt).toEqual([d.sheet.sdsg.length, d.sheet.sdsg.length]);
    expect(svgSdsgCount(d)).toEqual([d.sheet.sdsg.length, d.sheet.sdsg.length]);
  }, 30_000);

  it('通常の SD/SG は従来どおり、付いている Box のページに出る', async () => {
    const d = splitDoc((s) => s);
    const ppt = await pptSdsgOnSlides(d);
    expect(ppt.reduce((a, b) => a + b, 0)).toBe(d.sheet.sdsg.length);
  }, 30_000);
});
