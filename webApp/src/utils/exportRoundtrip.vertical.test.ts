// Codex レビュー pass-1（2026-10-09）の指摘への回帰テスト
// #1 縦型の TEMer 出力を取り込み直すと SG が SD になっていた
// #2 四角形の SD/SG（shape='rect'）を取り込み直すと Box になっていた
// #3 縦型の帯モードで、PPTX / SVG だけ時間軸方向のサイズに spaceWidth を使い、画面（spaceHeight）とずれていた
import { describe, it, expect } from 'vitest';
import { hydrateDocument } from './hydrate';
import { exportToPPTX } from './exportPPT';
import { buildSVGDocuments } from './exportSVGNative';
import { collectSDSGRects } from './elementRects';
import { parsePptx, classifyShapes, buildFromPptx, DEFAULT_PPTX_BUILD_OPTIONS } from './pptxImport';
import { DEFAULT_SETTINGS } from '../store/defaults';
import type { ProjectSettings, Sheet, TEMDocument } from '../types';
import kanzakiRaw from '../../sample-tem/kanzaki2021_figure1.tem?raw';

async function roundtripSdsgTypes(sheet: Sheet, settings: ProjectSettings) {
  const bytes = await exportToPPTX({ sheet, settings, returnBytes: true });
  const file = await parsePptx(bytes as Uint8Array, 'roundtrip.pptx');
  const slide = file.slides[0];
  const plans = classifyShapes(slide, { widthPt: file.widthPt });
  const r = buildFromPptx(slide, plans, {
    ...DEFAULT_PPTX_BUILD_OPTIONS, levelPx: 100,
    existingBoxIds: [], existingLineIds: [], existingSdsgIds: [], existingNoteIds: [],
  });
  return r.sdsg.map((g) => g.type).sort();
}

const loadKanzaki = () => {
  const doc = hydrateDocument(JSON.parse(kanzakiRaw) as TEMDocument);
  const sheet = doc.sheets.find((s) => s.id === doc.activeSheetId) ?? doc.sheets[0];
  return { doc, sheet };
};

describe('PPTX の往復で SD/SG の種別が保たれる', () => {
  it('縦型レイアウトの出力（SD=左向き・SG=右向き）', async () => {
    const { doc, sheet } = loadKanzaki();
    const types = await roundtripSdsgTypes(sheet, { ...doc.settings, layout: 'vertical' });
    expect(types).toEqual(sheet.sdsg.map((g) => g.type).sort());
  }, 30_000);

  it('四角形の SD/SG（shape=rect）も Box にならず SD/SG に戻る', async () => {
    const { doc, sheet } = loadKanzaki();
    const rectSheet = { ...sheet, sdsg: sheet.sdsg.map((g) => ({ ...g, shape: 'rect' as const })) };
    const types = await roundtripSdsgTypes(rectSheet, doc.settings);
    expect(types).toEqual(sheet.sdsg.map((g) => g.type).sort());
  }, 30_000);
});

describe('縦型の帯モード: SVG の SD/SG の大きさが画面側の計算と一致する', () => {
  it('spaceWidth と spaceHeight が違っても、時間軸方向（縦）のサイズは spaceHeight 由来', () => {
    const sheet = {
      id: 'S1', name: 'S1', lines: [], periodLabels: [],
      boxes: [{ id: 'B1', type: 'normal', label: 'a', x: 0, y: 0, width: 60, height: 120, textOrientation: 'vertical' }],
      sdsg: [{
        id: 'G1', type: 'SD', label: 'sd', attachedTo: 'B1', attachedType: 'box',
        spaceMode: 'band-top', spaceWidth: 100, spaceHeight: 30, width: 100, height: 30,
      }],
    } as unknown as Sheet;
    const settings: ProjectSettings = {
      ...DEFAULT_SETTINGS,
      layout: 'vertical',
      sdsgSpace: { ...DEFAULT_SETTINGS.sdsgSpace!, enabled: true },
      timeArrow: { ...DEFAULT_SETTINGS.timeArrow, autoInsert: false, alwaysVisible: false, label: '' },
      legend: { ...DEFAULT_SETTINGS.legend, alwaysVisible: false, includeInExport: false },
    };
    const canvasRect = collectSDSGRects(sheet, 'vertical', settings).find((r) => r.sdsg.id === 'G1')!.rect;
    const svg = buildSVGDocuments({ sheet, settings, scale: false })[0];
    const poly = svg.match(/<polygon points="([^"]+)"/)![1].split(' ').map((p) => p.split(',').map(Number));
    const ys = poly.map((p) => p[1]);
    const xs = poly.map((p) => p[0]);
    expect(Math.max(...ys) - Math.min(...ys)).toBeCloseTo(canvasRect.height, 0);
    expect(Math.max(...xs) - Math.min(...xs)).toBeCloseTo(canvasRect.width, 0);
  });
});
