// MAXQDA 取り込みを store まで通したときの整合性
// - ウィザードの「取り込む」と同じ順序（addTranscript → importBoxes → importSDSGs → addSourceRef）で
//   適用し、Box / SD に原文参照が付き、参照先の段落が実在することを確認する
import { describe, it, expect, beforeEach } from 'vitest';
import { useTEMStore } from '../store/store';
import { createEmptyDocument } from '../store/defaults';
import { dedupeSegments, buildFromSegments, type MaxqdaRole } from './maxqdaImport';

const ROWS: string[][] = [
  ['文書グループ', '文書名', 'コード', '開始', '終了', 'セグメント'],
  ['G', 'A', 'TEM\\分岐点', '1', '2', '友人の一言'],
  ['G', 'A', 'DMIS\\否認', '1', '2', '友人の一言'],
  ['G', 'A', 'TEM\\必須通過点', '3', '4', '孤立した'],
  ['G', 'A', 'SD', '3', '4', '孤立した'],
  ['G', 'A', '時期\\第1期', '1', '4', ''],
];
const MAPPING: MaxqdaRole[] = ['docGroup', 'docName', 'code', 'start', 'end', 'segment'];

const activeSheet = () => {
  const s = useTEMStore.getState();
  return s.doc.sheets.find((sh) => sh.id === s.doc.activeSheetId)!;
};

beforeEach(() => {
  useTEMStore.getState().loadDocument(createEmptyDocument());
  const sheet = activeSheet();
  if (sheet.boxes.length > 0) useTEMStore.getState().removeBoxes(sheet.boxes.map((b) => b.id));
});

describe('MAXQDA 取り込みの store 適用', () => {
  it('Box / SD に原文参照が付き、段落の tags に全コードが載る', () => {
    const dedupe = dedupeSegments(ROWS, { mapping: MAPPING, hasHeader: true });
    const res = buildFromSegments(dedupe, {
      plans: [
        { code: 'TEM\\分岐点', action: 'box', boxType: 'BFP' },
        { code: 'TEM\\必須通過点', action: 'box', boxType: 'OPP' },
        { code: 'SD', action: 'sd' },
        { code: '時期\\第1期', action: 'period' },
      ],
      levelPx: 100, defaultWidth: 100, defaultHeight: 60,
      existingBoxIds: new Set(), existingSdsgIds: new Set(),
    });
    const st = useTEMStore.getState();
    res.transcripts.forEach((t) => st.addTranscript(t));
    st.importBoxes(res.boxes, []);
    st.importSDSGs(res.sdsg);
    st.importPeriodLabels(res.periodLabels);
    res.sourceRefs.forEach((r) => st.addSourceRef(r.target, r.ref));

    const doc = useTEMStore.getState().doc;
    const sheet = activeSheet();
    expect(sheet.boxes.map((b) => b.id)).toEqual(['BFP1', 'OPP1']);
    expect(sheet.sdsg.map((s) => s.id)).toEqual(['SD1']);
    expect(sheet.periodLabels.map((p) => p.label)).toEqual(['第1期']);

    // 原文参照が付いている
    const bfp = sheet.boxes.find((b) => b.id === 'BFP1')!;
    expect(bfp.sourceRefs).toHaveLength(1);
    const ref = bfp.sourceRefs![0];
    const t = doc.transcripts.find((x) => x.id === ref.transcriptId)!;
    expect(t).toBeTruthy();
    const p = t.paragraphs.find((x) => x.id === ref.paragraphId)!;
    expect(p.text).toBe('友人の一言');
    expect(ref.quoteText).toBe('友人の一言');
    expect(p.tags).toEqual(['TEM\\分岐点', 'DMIS\\否認']);

    const sd = sheet.sdsg.find((s) => s.id === 'SD1')!;
    expect(sd.sourceRefs).toHaveLength(1);
    expect(sd.attachedTo).toBe('OPP1');
  });

  it('本文が空のセグメント（時期だけの行）は段落にしない', () => {
    const dedupe = dedupeSegments(ROWS, { mapping: MAPPING, hasHeader: true });
    const res = buildFromSegments(dedupe, {
      plans: [{ code: '時期\\第1期', action: 'period' }],
      levelPx: 100, defaultWidth: 100, defaultHeight: 60,
      existingBoxIds: new Set(), existingSdsgIds: new Set(),
    });
    expect(res.transcripts[0].paragraphs.map((p) => p.text)).toEqual(['友人の一言', '孤立した']);
    expect(res.periodLabels.map((p) => p.label)).toEqual(['第1期']);
  });
});
