// 原文 → 切片化 → Box 化（2026-11-08 ユーザー要望）の検査
import { describe, it, expect, beforeEach } from 'vitest';
import { useTEMStore } from './store';
import { LEVEL_PX } from './defaults';
import type { Transcript } from '../types';

const st = () => useTEMStore.getState();
const sheet = () => st().doc.sheets.find((s) => s.id === st().doc.activeSheetId)!;
const tr = () => st().doc.transcripts.find((t) => t.id === 'T1')!;

beforeEach(() => {
  st().resetDocument();
  const t: Transcript = {
    id: 'T1', title: 'A 第1回', source: 'manual', importedAt: '2026-11-08T00:00:00Z',
    paragraphs: [
      { id: 'P1', index: 0, text: '高校では友だちができなかった。部活もやめた。' },
      { id: 'P2', index: 1, text: '大学で先生に出会って変わった。' },
    ],
  };
  useTEMStore.setState((s) => ({ doc: { ...s.doc, transcripts: [t] } }));
});

describe('切片を作る・付いていく', () => {
  it('範囲を切片にすると、見出しの既定は引用（15 字まで）', () => {
    const id = st().addSegment('T1', { paragraphId: 'P1', charStart: 15, charEnd: 22, quoteText: '部活もやめた。' });
    expect(tr().segments?.find((s) => s.id === id)?.label).toBe('部活もやめた。');
  });
  it('段落の文字を書き換えると、切片の位置が付いていく', () => {
    const id = st().addSegment('T1', { paragraphId: 'P1', charStart: 15, charEnd: 22, quoteText: '部活もやめた。' });
    st().updateParagraphText('T1', 'P1', '（中略）高校では友だちができなかった。部活もやめた。');
    const seg = tr().segments!.find((s) => s.id === id)!;
    expect(seg.charStart).toBe(19);
    expect(seg.unresolved).toBeFalsy();
  });
  it('段落を分けると、後ろ側の切片は新しい段落へ移る', () => {
    const id = st().addSegment('T1', { paragraphId: 'P1', charStart: 15, charEnd: 22, quoteText: '部活もやめた。' });
    const newPid = st().splitParagraph('T1', 'P1', 15);
    const seg = tr().segments!.find((s) => s.id === id)!;
    expect(seg.paragraphId).toBe(newPid);
    expect(seg.charStart).toBe(0);
  });
});

describe('切片から Box を作る', () => {
  it('作った順ではなく、原文の順に時間の方向へ並ぶ。種別と Item レベルも入る', () => {
    const late = st().addSegment('T1', { paragraphId: 'P2', quoteText: '大学で先生に出会って変わった。', label: '先生との出会い' });
    const early = st().addSegment('T1', { paragraphId: 'P1', charStart: 0, charEnd: 14, quoteText: '高校では友だちができなかった。', label: '高校での孤立' });
    st().updateSegment('T1', late, { boxType: 'BFP', itemLevel: 1 });
    const ids = st().createBoxesFromSegments('T1', [late, early]);
    expect(ids).toHaveLength(2);
    const boxes = sheet().boxes;
    const bEarly = boxes.find((b) => b.label === '高校での孤立')!;
    const bLate = boxes.find((b) => b.label === '先生との出会い')!;
    expect(bEarly.x).toBeLessThan(bLate.x);
    expect(bLate.type).toBe('BFP');
    expect(bLate.y).toBe(-LEVEL_PX);
    expect(bLate.segmentId).toBe(late);
    expect(bLate.sourceRefs?.[0]).toMatchObject({ transcriptId: 'T1', paragraphId: 'P2' });
    // 同じ切片から二度は作らない
    expect(st().createBoxesFromSegments('T1', [late])).toHaveLength(0);
  });
  it('一覧で見出し・種別・Item レベルを直すと Box にも反映される（書き換えた Box の文字は残す）', () => {
    const a = st().addSegment('T1', { paragraphId: 'P1', quoteText: 'x', label: '孤立' });
    const b = st().addSegment('T1', { paragraphId: 'P2', quoteText: 'y', label: '出会い' });
    st().createBoxesFromSegments('T1', [a, b]);
    const boxB = sheet().boxes.find((x) => x.segmentId === b)!;
    st().updateBox(boxB.id, { label: '恩師との出会い' });
    st().updateSegment('T1', a, { label: '高校での孤立', boxType: 'OPP', itemLevel: -1 });
    st().updateSegment('T1', b, { label: '先生' });
    const boxA2 = sheet().boxes.find((x) => x.segmentId === a)!;
    expect(boxA2.label).toBe('高校での孤立');
    expect(boxA2.type).toBe('OPP');
    expect(boxA2.y).toBe(LEVEL_PX);
    expect(sheet().boxes.find((x) => x.segmentId === b)!.label).toBe('恩師との出会い');
  });
  it('切片を消しても Box は残り、結びつきだけが外れる', () => {
    const a = st().addSegment('T1', { paragraphId: 'P1', quoteText: 'x', label: '孤立' });
    st().createBoxesFromSegments('T1', [a]);
    st().removeSegment('T1', a);
    expect(tr().segments).toHaveLength(0);
    expect(sheet().boxes).toHaveLength(1);
    expect(sheet().boxes[0].segmentId).toBeUndefined();
  });
});

describe('原文の順に並べ直す', () => {
  it('時間の位置の並び（席）は保ったまま、原文の順に入れ替える。Item の位置は変えない', () => {
    const a = st().addSegment('T1', { paragraphId: 'P1', quoteText: 'x', label: 'A' });
    const b = st().addSegment('T1', { paragraphId: 'P2', quoteText: 'y', label: 'B' });
    st().createBoxesFromSegments('T1', [a, b]);
    const boxA = sheet().boxes.find((x) => x.segmentId === a)!;
    const boxB = sheet().boxes.find((x) => x.segmentId === b)!;
    // わざと入れ替えて置き、B を上の段へ
    st().updateBox(boxA.id, { x: 500 });
    st().updateBox(boxB.id, { x: 100, y: -200 });
    expect(st().arrangeBoxesByTextOrder()).toBe(2);
    const a2 = sheet().boxes.find((x) => x.segmentId === a)!;
    const b2 = sheet().boxes.find((x) => x.segmentId === b)!;
    expect([a2.x, b2.x]).toEqual([100, 500]);
    expect(b2.y).toBe(-200);
  });
});
