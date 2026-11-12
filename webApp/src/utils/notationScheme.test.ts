// 記号の簡素化方式（線種は実在性だけ・種別はラベル）。論文 04_report_format.md 補論、論文 cc からの依頼 3
// - 設定画面のテーマで選ぶ。P-EFP・P-2nd EFP は点線（観察されなかった側。2026-10-30 ユーザー決定）
// - テーマの線種・太さを PPTX・SVG も守る（以前は種別で決め打ちして画面と食い違っていた）
// - 選んだ表記を論文用レポートの Block 1 にそのまま書く
import { describe, it, expect } from 'vitest';
import { hydrateDocument } from './hydrate';
import { BUILTIN_THEMES } from './boxThemes';
import { resolveBoxBorderDraw } from './boxPreset';
import { describeNotation } from './notationDescribe';
import { buildSVGDocuments } from './exportSVGNative';
import { exportToPPTX } from './exportPPT';
import JSZip from 'jszip';
import type { Box, BoxType, TEMDocument } from '../types';
import kanzakiRaw from '../../sample-tem/kanzaki2021_figure1.tem?raw';

const simplified = BUILTIN_THEMES.find((t) => t.id === 'theme-simplified-reality')!;

function doc(withTheme: boolean): TEMDocument {
  const d = hydrateDocument(JSON.parse(kanzakiRaw) as TEMDocument);
  d.settings.boxTypePresets = withTheme ? JSON.parse(JSON.stringify(simplified.presets)) : {};
  return d;
}
const active = (d: TEMDocument) => d.sheets.find((s) => s.id === d.activeSheetId)!;

/** 1 つの種別の Box だけを置いたシートで、枠の SVG の rect を数える（Box 本体の位置の rect だけ） */
function svgBoxRects(d: TEMDocument, type: BoxType) {
  const sh = active(d);
  const box: Box = { ...sh.boxes[0], id: 'T1', type, secondaryType: undefined, x: 100, y: 100, width: 120, height: 60, label: 'x' };
  const sheet = { ...sh, boxes: [box], lines: [], sdsg: [], notes: [], periodLabels: [] };
  const settings = { ...d.settings, legend: { ...d.settings.legend, includeInExport: false } };
  const [svg] = buildSVGDocuments({ sheet, settings, paperSize: 'A4-landscape', scale: false, offset: 0 });
  return [...svg.matchAll(/<rect [^>]*stroke="#(?:222|000000)"[^>]*>/g)].map((m) => m[0]);
}

describe('簡素化方式のテーマ', () => {
  it('観察された種別は同じ実線、潜在経験と P-EFP は点線', () => {
    const d = doc(true);
    const draw = (type: BoxType) => resolveBoxBorderDraw({ type } as Box, d.settings);
    for (const t of ['normal', 'BFP', 'OPP', 'EFP', '2nd-EFP'] as BoxType[]) expect(draw(t)).toEqual({ kind: 'single', style: 'solid', width: 1.5 });
    for (const t of ['annotation', 'P-EFP', 'P-2nd-EFP'] as BoxType[]) expect(draw(t)).toEqual({ kind: 'single', style: 'dashed', width: 1.5 });
  });

  it('テーマで線を指定していなければ、種別ごとの既定の描き方のまま', () => {
    expect(resolveBoxBorderDraw({ type: 'EFP' } as Box, doc(false).settings)).toEqual({ kind: 'factory' });
  });
});

describe('テーマの線種を SVG・PPTX も守る', () => {
  it('SVG: 既定の EFP は二重線（2 本）、簡素化方式では 1 本の実線', () => {
    expect(svgBoxRects(doc(false), 'EFP')).toHaveLength(2);
    const r = svgBoxRects(doc(true), 'EFP');
    expect(r).toHaveLength(1);
    expect(r[0]).not.toContain('stroke-dasharray');
  });

  it('SVG: 簡素化方式の P-EFP は 1 本の点線（既定は二重の点線）', () => {
    expect(svgBoxRects(doc(false), 'P-EFP')).toHaveLength(2);
    const r = svgBoxRects(doc(true), 'P-EFP');
    expect(r).toHaveLength(1);
    expect(r[0]).toContain('stroke-dasharray');
  });

  it('PPTX: 簡素化方式では EFP の二重線（2 枚重ね）を描かない', async () => {
    const count = async (d: TEMDocument) => {
      const sh = active(d);
      const box: Box = { ...sh.boxes[0], id: 'T1', type: 'EFP', secondaryType: undefined, x: 100, y: 100, width: 120, height: 60, label: 'x' };
      const sheet = { ...sh, boxes: [box], lines: [], sdsg: [], notes: [], periodLabels: [] };
      const settings = { ...d.settings, legend: { ...d.settings.legend, includeInExport: false }, timeArrow: { ...d.settings.timeArrow, enabled: false } };
      const bytes = await exportToPPTX({ sheet, settings, scale: false, offset: 0, paperSize: 'A4-landscape', returnBytes: true });
      const xml = await (await JSZip.loadAsync(bytes as Uint8Array)).file('ppt/slides/slide1.xml')!.async('string');
      return (xml.match(/<a:ln[ >]/g) ?? []).length;
    };
    expect(await count(doc(true))).toBe((await count(doc(false))) - 1);
  }, 30_000);
});

describe('論文用レポートの Block 1 は今の図の線種から書く', () => {
  it('既定の表記: 線種は種別と実在性の両方', () => {
    const n = describeNotation(doc(false))!;
    expect(n.realityOnly).toBe(false);
    expect(n.lines).toContain('等至点（EFP）: 二重線');
    expect(n.meaning).toContain('両方');
  });

  it('簡素化方式: 線種は実在性だけ、種別はラベル', () => {
    const n = describeNotation(doc(true))!;
    expect(n.realityOnly).toBe(true);
    expect(n.lines).toContain('等至点（EFP）: 実線');
    expect(n.meaning).toContain('実在性だけ');
    expect(n.meaning).toContain('種別ラベル');
  });

  it('簡素化方式で種別ラベルを隠していれば、その旨を書く', () => {
    const d = doc(true);
    d.settings.typeLabelVisibility = { ...d.settings.typeLabelVisibility, OPP: false };
    expect(describeNotation(d)!.meaning).toContain('必須通過点（OPP）の種別ラベルは表示していない');
  });
});

// 簡素化方式は線の角度に意味を持たせない表記。当てると径路を原則カギ線にする（2026-11-12 ユーザー指示）
describe('簡素化方式のテーマと径路のカギ線', () => {
  it('当てると線の既定と今ある線がカギ線になり、記号体系の文に角度に意味を持たせないと書く', async () => {
    const { applyThemeToDoc } = await import('./boxThemes');
    const d = doc(false);
    expect(active(d).lines.length).toBeGreaterThan(0);
    applyThemeToDoc(d, simplified);
    expect(d.settings.lineDefaults?.shape).toBe('elbow');
    for (const sh of d.sheets) for (const l of sh.lines) expect(l.shape).toBe('elbow');
    const n = describeNotation(d)!;
    expect(n.realityOnly).toBe(true);
    expect(n.meaning).toContain('角度');
  });
  it('線を 1 本でも直線に戻したら、角度の文は書かない', async () => {
    const { applyThemeToDoc } = await import('./boxThemes');
    const d = doc(false);
    applyThemeToDoc(d, simplified);
    active(d).lines[0].shape = 'straight';
    expect(describeNotation(d)!.meaning).not.toContain('角度');
  });
  it('線の形を持たないテーマ（モノクロなど）は線を変えない', async () => {
    const { applyThemeToDoc } = await import('./boxThemes');
    const d = doc(false);
    const before = active(d).lines.map((l) => l.shape);
    applyThemeToDoc(d, BUILTIN_THEMES.find((t) => t.id === 'theme-monochrome')!);
    expect(active(d).lines.map((l) => l.shape)).toEqual(before);
  });
});
