// 2026-11-08 のレビュー（Codex＋独立）で直した点の検査
import { describe, it, expect, beforeEach } from 'vitest';
import { useTEMStore, beginHistoryGesture, endHistoryGesture } from './store';
import { anonymizeDocument } from '../utils/anonymize';
import type { Transcript } from '../types';

const st = () => useTEMStore.getState();
const undo = () => useTEMStore.temporal.getState().undo();
const active = () => st().doc.sheets.find((s) => s.id === st().doc.activeSheetId)!;
const tr = () => st().doc.transcripts.find((t) => t.id === 'T1')!;

beforeEach(() => {
  st().resetDocument();
  useTEMStore.temporal.getState().clear();
  const t: Transcript = {
    id: 'T1', title: 'A', source: 'manual', importedAt: '2026-11-08T00:00:00Z',
    paragraphs: [
      { id: 'P1', index: 0, text: '山田太郎さんに会った。' },
      { id: 'P2', index: 1, text: 'それから変わった。' },
    ],
  };
  useTEMStore.setState((s) => ({ doc: { ...s.doc, transcripts: [t] } }));
  useTEMStore.temporal.getState().clear();
});

describe('ドラッグ・大きさの変更は「元に戻す」1 回で戻る', () => {
  it('途中で何度書き込んでも、1 回でドラッグの前に戻る（1 つ前の操作は戻らない）', () => {
    const id = st().addBox({ type: 'normal', x: 0, y: 0 });
    beginHistoryGesture();
    st().updateBox(id, { x: 50 });
    st().updateBox(id, { x: 120 });
    endHistoryGesture();
    expect(active().boxes.find((b) => b.id === id)!.x).toBe(120);
    undo();
    const b = active().boxes.find((x) => x.id === id);
    expect(b).toBeDefined();
    expect(b!.x).toBe(0);
  });
  it('終わったあとの操作も記録に残る（記録が止まったままにならない）', () => {
    const id = st().addBox({ type: 'normal', x: 0, y: 0 });
    beginHistoryGesture(); st().updateBox(id, { x: 50 }); endHistoryGesture();
    st().updateBox(id, { label: '後の操作' });
    undo();
    expect(active().boxes.find((x) => x.id === id)!.label).not.toBe('後の操作');
    expect(active().boxes.find((x) => x.id === id)!.x).toBe(50);
  });
});

describe('種別の変更', () => {
  it('まとめて変えても「元に戻す」1 回で全部戻る', () => {
    const a = st().addBox({ type: 'normal' });
    const b = st().addBox({ type: 'normal' });
    st().changeBoxTypes([a, b], 'BFP');
    expect(active().boxes.every((x) => x.type === 'BFP')).toBe(true);
    undo();
    expect(active().boxes.every((x) => x.type === 'normal')).toBe(true);
  });
  it('複製したシートの同じ ID の Box は変わらない（ID も重ならない）', () => {
    const a = st().addBox({ type: 'normal' });
    const sheet1 = st().doc.activeSheetId;
    const sheet2 = st().duplicateSheet(sheet1);
    st().setActiveSheet(sheet1);
    st().changeBoxType(a, 'BFP');
    const s2 = st().doc.sheets.find((s) => s.id === sheet2)!;
    expect(s2.boxes.find((x) => x.id === a)?.type).toBe('normal');
    const ids = active().boxes.map((x) => x.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('切片の種別', () => {
  it('切片の種別を変えると、切片と Box が「元に戻す」1 回で一緒に戻る', () => {
    const seg = st().addSegment('T1', { paragraphId: 'P2', quoteText: 'それから変わった。', label: '転機' });
    st().createBoxesFromSegments('T1', [seg]);
    useTEMStore.temporal.getState().clear();
    st().updateSegment('T1', seg, { boxType: 'BFP' });
    expect(active().boxes.find((b) => b.segmentId === seg)!.type).toBe('BFP');
    undo();
    expect(tr().segments!.find((s) => s.id === seg)!.boxType).toBeUndefined();
    expect(active().boxes.find((b) => b.segmentId === seg)!.type).toBe('normal');
  });
  it('ほかのシートの、同じ切片から作った Box にも反映される', () => {
    const seg = st().addSegment('T1', { paragraphId: 'P2', quoteText: 'x', label: '転機' });
    st().createBoxesFromSegments('T1', [seg]);
    const sheet1 = st().doc.activeSheetId;
    const sheet2 = st().duplicateSheet(sheet1);
    st().setActiveSheet(sheet1);
    st().updateSegment('T1', seg, { boxType: 'OPP' });
    for (const id of [sheet1, sheet2]) {
      const sh = st().doc.sheets.find((s) => s.id === id)!;
      expect(sh.boxes.find((b) => b.segmentId === seg)!.type).toBe('OPP');
    }
  });
});

describe('段落全体の切片', () => {
  it('範囲を段落の初めから終わりまでで持ち、段落を書き換えても追えなくならない', () => {
    const seg = st().addSegment('T1', { paragraphId: 'P2', quoteText: 'それから変わった。' });
    const s0 = tr().segments!.find((s) => s.id === seg)!;
    expect([s0.charStart, s0.charEnd, s0.wholeParagraph]).toEqual([0, 9, true]);
    st().updateParagraphText('T1', 'P2', 'それから少しずつ変わった。');
    const s1 = tr().segments!.find((s) => s.id === seg)!;
    expect(s1.unresolved).toBeFalsy();
    expect(s1.quoteText).toBe('それから少しずつ変わった。');
    expect(s1.charEnd).toBe(13);
  });
});

describe('匿名化と逐語録の削除', () => {
  it('匿名化で、切片の引用・見出しと、切片から作った Box の文字も置き換わる', () => {
    const seg = st().addSegment('T1', { paragraphId: 'P1', quoteText: '山田太郎さんに会った。' });
    st().createBoxesFromSegments('T1', [seg]);
    const out = anonymizeDocument(st().doc, { 山田太郎: 'A氏' });
    const sg = out.transcripts[0].segments![0];
    expect(sg.quoteText).not.toContain('山田太郎');
    expect(sg.label).not.toContain('山田太郎');
    const box = out.sheets.flatMap((s) => s.boxes).find((b) => b.segmentId === seg)!;
    expect(box.label).not.toContain('山田太郎');
  });
  it('逐語録を消すと、その切片から作った Box の結びつきが外れる', () => {
    const seg = st().addSegment('T1', { paragraphId: 'P2', quoteText: 'x' });
    st().createBoxesFromSegments('T1', [seg]);
    st().removeTranscript('T1');
    expect(active().boxes[0].segmentId).toBeUndefined();
  });
});
