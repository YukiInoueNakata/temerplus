// TEMer 自身の pptx 出力を取り込み直す往復テスト（2026-10-01 レビュー対応）
// 同梱デモ（神崎・鈴木 2021 Figure 1: 32 Box / 34 Line / 4 SD・SG / 4 期）を exportToPPTX で書き出し、
// parsePptx → classifyShapes → buildFromPptx で読み戻して、要素の数・種別・ラベルが保たれることを確かめる。
import { describe, it, expect } from 'vitest';
import { hydrateDocument } from './hydrate';
import { exportToPPTX } from './exportPPT';
import { parsePptx, classifyShapes, buildFromPptx, DEFAULT_PPTX_BUILD_OPTIONS } from './pptxImport';
import type { TEMDocument } from '../types';
import kanzakiRaw from '../../sample-tem/kanzaki2021_figure1.tem?raw';

describe('TEMer の pptx 出力の取り込み直し', () => {
  it('Box・Line・SD/SG・時期ラベルの数と、Box の種別・ラベルが保たれる', async () => {
    const doc = hydrateDocument(JSON.parse(kanzakiRaw) as TEMDocument);
    const sheet = doc.sheets.find((s) => s.id === doc.activeSheetId) ?? doc.sheets[0];
    const bytes = await exportToPPTX({ sheet, settings: doc.settings, returnBytes: true });
    expect(bytes).toBeInstanceOf(Uint8Array);

    const file = await parsePptx(bytes as Uint8Array, 'roundtrip.pptx');
    const slide = file.slides[0];
    const plans = classifyShapes(slide, { widthPt: file.widthPt });
    const r = buildFromPptx(slide, plans, {
      ...DEFAULT_PPTX_BUILD_OPTIONS, levelPx: 100,
      existingBoxIds: [], existingLineIds: [], existingSdsgIds: [], existingNoteIds: [],
    });

    expect(r.boxes).toHaveLength(sheet.boxes.length);
    expect(r.sdsg).toHaveLength(sheet.sdsg.length);
    expect(r.sdsg.map((g) => g.type).sort()).toEqual(sheet.sdsg.map((g) => g.type).sort());
    expect(r.periodLabels).toHaveLength(sheet.periodLabels.length);
    // 矢印: 元の Line のうち、取り込み直して同じ 2 つの Box（ラベルで対応づけ）をつなぐものの数
    const labelOfOrig = new Map(sheet.boxes.map((b) => [b.id, b.label.replace(/\s+/g, '')]));
    const labelOfNew = new Map(r.boxes.map((b) => [b.id, b.label.replace(/\s+/g, '')]));
    const origPairs = new Set(sheet.lines.map((l) => `${labelOfOrig.get(l.from)}>${labelOfOrig.get(l.to)}`));
    const newPairs = r.lines.map((l) => `${labelOfNew.get(l.from)}>${labelOfNew.get(l.to)}`);
    expect(newPairs.filter((p) => origPairs.has(p)).length).toBe(sheet.lines.length);
    // Box の種別とラベル（ラベルの集合で突き合わせ）
    const typeByLabel = (bs: Array<{ label: string; type: string }>) =>
      bs.map((b) => `${b.label.replace(/\s+/g, '')}:${b.type}`).sort();
    expect(typeByLabel(r.boxes)).toEqual(typeByLabel(sheet.boxes));
    // サブラベル（協力者 ID など）は Box に戻り、凡例・種別バッジはメモにならない
    const subOf = (bs: Array<{ label: string; subLabel?: string; participantId?: string }>, useParticipant: boolean) =>
      bs.map((b) => `${b.label.replace(/\s+/g, '')}:${(b.subLabel ?? (useParticipant ? b.participantId : undefined) ?? '').replace(/\s+/g, '')}`).sort();
    expect(subOf(r.boxes, false)).toEqual(subOf(sheet.boxes, true));
    expect(r.notes).toHaveLength(sheet.notes.length);
  }, 30_000);
});
