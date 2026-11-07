// 2026-11-07 の併用レビュー（Claude＋Codex）で見つかった点の回帰テスト
// 記録: docs/reviews/2026-11-07_export-check_review.md（#1〜#8）
import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { Document, Packer } from 'docx';
import { hydrateDocument } from './hydrate';
import { BUILTIN_THEMES } from './boxThemes';
import { resolveBoxBorderDraw, doubleStrokeWidth } from './boxPreset';
import { describeNotation } from './notationDescribe';
import { buildSVGDocuments } from './exportSVGNative';
import { buildPaperReportParagraphs, reportFigureFilter } from './exportReport';
import { noteKindClass } from './noteStyle';
import { applyExportContent } from './exportContent';
import { applyExportTransform, DEFAULT_EXPORT_TRANSFORM } from './exportTransform';
import type { Box, BoxType, TEMDocument } from '../types';
import kanzakiRaw from '../../sample-tem/kanzaki2021_figure1.tem?raw';

const theme = (id: string) => BUILTIN_THEMES.find((t) => t.id === id)!;

function doc(themeId?: string): TEMDocument {
  const d = hydrateDocument(JSON.parse(kanzakiRaw) as TEMDocument);
  d.settings.boxTypePresets = themeId ? JSON.parse(JSON.stringify(theme(themeId).presets)) : {};
  return d;
}
const active = (d: TEMDocument) => d.sheets.find((s) => s.id === d.activeSheetId)!;

/** 1 つの Box だけのシートを SVG にする */
function svgOneBox(d: TEMDocument, type: BoxType, legend: boolean) {
  const sh = active(d);
  const box: Box = { ...sh.boxes[0], id: 'T1', type, secondaryType: undefined, x: 100, y: 100, width: 120, height: 60, label: 'x' };
  const sheet = { ...sh, boxes: [box], lines: [], sdsg: [], notes: [], periodLabels: [] };
  const settings = { ...d.settings, legend: { ...d.settings.legend, includeInExport: legend, alwaysVisible: legend } };
  const [svg] = buildSVGDocuments({ sheet, settings, paperSize: 'A4-landscape', scale: false, offset: 0 });
  return svg;
}

describe('#3 既存のテーマでは P-EFP は二重の点線のまま。簡素化方式だけ 1 本', () => {
  it('モノクロ（既定）・論文向けは二重の点線', () => {
    for (const id of ['theme-monochrome', 'theme-paper-bold']) {
      for (const t of ['P-EFP', 'P-2nd-EFP'] as BoxType[]) {
        expect(resolveBoxBorderDraw({ type: t } as Box, doc(id).settings).kind).toBe('double-dashed');
      }
    }
  });
  it('簡素化方式は点線 1 本', () => {
    expect(resolveBoxBorderDraw({ type: 'P-EFP' } as Box, doc('theme-simplified-reality').settings))
      .toEqual({ kind: 'single', style: 'dashed', width: 1.5 });
  });
  it('SVG: モノクロの P-EFP は点線の枠が 2 つ', () => {
    const rects = [...svgOneBox(doc('theme-monochrome'), 'P-EFP', false).matchAll(/<rect [^>]*stroke="#000000"[^>]*>/g)];
    expect(rects).toHaveLength(2);
    rects.forEach((r) => expect(r[0]).toContain('stroke-dasharray'));
  });
  it('記号の宣言: モノクロの P-EFP は「二重の点線」と書く', () => {
    const d = doc('theme-monochrome');
    active(d).boxes[0].type = 'P-EFP';
    expect(describeNotation(d)!.lines.join('\n')).toContain('両極化した等至点（P-EFP）: 二重の点線');
  });
});

describe('#7 テーマの二重線の太さを PPTX・SVG でも守る', () => {
  it('1 本の太さは指定の 3 分の 1（最低 1）', () => {
    expect(doubleStrokeWidth(1.5)).toBe(1);
    expect(doubleStrokeWidth(6)).toBe(2);
  });
  it('SVG: 太さ 6 の二重線は、太さ 2 の線 2 本', () => {
    const d = doc('theme-monochrome');
    d.settings.boxTypePresets!.EFP = { ...d.settings.boxTypePresets!.EFP, borderWidth: 6 };
    const rects = [...svgOneBox(d, 'EFP', false).matchAll(/<rect [^>]*stroke="#000000"[^>]*>/g)];
    expect(rects).toHaveLength(2);
    rects.forEach((r) => expect(r[0]).toMatch(/stroke-width="2"/));
  });
});

describe('#5 凡例の見本もテーマの線種に従う', () => {
  // 凡例の枠（#999）より後ろの rect が見本
  const legendRects = (d: TEMDocument) => {
    const svg = svgOneBox(d, 'EFP', true);
    return [...svg.slice(svg.indexOf('stroke="#999"')).matchAll(/<rect [^>]*stroke="#222"[^>]*>/g)].length;
  };
  it('簡素化方式の EFP の見本は 1 本（既定は二重線で 2 本）', () => {
    expect(legendRects(doc('theme-simplified-reality'))).toBe(legendRects(doc()) - 1);
  });
});

describe('#6 併記の種別は枠に出ないので、線種でなく種別ラベルで示すと書く', () => {
  it('EFP に OPP を併記した Box だけなら、OPP の線種は書かない', () => {
    const d = doc();
    const sh = active(d);
    const b0 = sh.boxes[0];
    d.sheets.forEach((s) => { s.boxes = []; });
    sh.boxes = [{ ...b0, type: 'EFP', secondaryType: 'OPP' }];
    const n = describeNotation(d)!;
    expect(n.lines).toContain('等至点（EFP）: 二重線');
    expect(n.lines).toContain('必須通過点（OPP）: 併記の種別ラベルだけで示す（枠は主の種別の線）');
    expect(n.meaning).toContain('枠を主の種別の線で描き');
  });
});

describe('#1 「載せるにしたものだけ」では、載せないメモを図からも除く', () => {
  const el = (cls: string) => { const e = document.createElement('div'); e.className = cls; return e; };
  const flagged = el(noteKindClass('note', true));
  const unflagged = el(noteKindClass('callout', false));
  const symbol = el(noteKindClass('text', false));
  it('flagged: 印の無いメモだけ除く（記号は記号の選択に従う）', () => {
    const f = reportFigureFilter({ notes: 'flagged', symbols: true });
    expect([f(flagged), f(unflagged), f(symbol)]).toEqual([true, false, true]);
  });
  it('none: メモをすべて除く／all: すべて残す', () => {
    const none = reportFigureFilter({ notes: 'none', symbols: false });
    expect([none(flagged), none(unflagged), none(symbol)]).toEqual([false, false, false]);
    const all = reportFigureFilter({ notes: 'all', symbols: true });
    expect([all(flagged), all(unflagged), all(symbol)]).toEqual([true, true, true]);
  });
});

describe('#8 論文用レポートを同時に 2 つ作っても、未入力の扱いが混ざらない', () => {
  async function text(d: TEMDocument, omitMissing: boolean) {
    const children = await buildPaperReportParagraphs(d, { omitMissing, includeDiagram: false });
    const buf = await Packer.toBuffer(new Document({ sections: [{ children }] }));
    return (await (await JSZip.loadAsync(buf)).file('word/document.xml')!.async('string'));
  }
  it('並行に作る', async () => {
    const d = doc();
    d.sheets.forEach((s) => s.boxes.forEach((b) => { b.description = undefined; b.noDescriptionNeeded = undefined; }));
    const [omit, keep] = await Promise.all([text(d, true), text(d, false)]);
    expect(omit).not.toContain('説明未記入');
    expect(keep).toContain('説明未記入');
  });
});

describe('#4 凡例を含めると選んだら、凡例も入れて用紙に収める', () => {
  it('含める要素を先に当ててから収めると、凡例の分まで縮めて収める', () => {
    const d = doc();
    d.settings.legend = { ...d.settings.legend, alwaysVisible: false, includeInExport: false, position: { x: 5000, y: 5000 } };
    const xf = { ...DEFAULT_EXPORT_TRANSFORM, fitMode: 'fit-both' as const };
    // 遠くに置いた凡例も用紙に収めるので、縮小の倍率が小さくなる
    const without = applyExportTransform(applyExportContent(d, { legend: false }), xf).effectiveScale;
    const withLegend = applyExportTransform(applyExportContent(d, { legend: true }), xf).effectiveScale;
    expect(withLegend).toBeLessThan(without);
  });
});
