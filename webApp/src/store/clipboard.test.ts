// クリップボード（コピー / 貼付）の回帰テスト
// 2026-09-05 の点検で見つかった 4 点をここで守る:
//   1. データシートの位置指定挿入 (pasteFromClipboardAt) が Line / SDSG を落とさない
//   2. 貼付で採る ID が種別連番（Box=種別 prefix / Line=RL_n・XL_n / SDSG=SD1・SG1）
//   3. between モード SDSG の attachedTo2 も再マップされる
//   4. sourceRefs は複製時に ID を振り直す（同一 SourceRef.id の重複を作らない）
import { describe, it, expect, beforeEach } from 'vitest';
import { useTEMStore } from './store';
import { createEmptyDocument } from './defaults';
import type { SourceRef } from '../types';

const ref = (id: string): SourceRef => ({
  id,
  transcriptId: 'Tr_1',
  paragraphId: 'Pa_1',
  quoteText: '引用',
  createdAt: new Date().toISOString(),
});

/** 空ドキュメントに Box 2 + Line 1 + SDSG(between) 1 を作る */
const setupSheet = () => {
  const store = useTEMStore.getState();
  store.loadDocument(createEmptyDocument());
  const s = useTEMStore.getState();
  const sheetId = s.doc.activeSheetId;
  // 既定シートの Box を消してから作り直す（空ファイルは時期 1/2 の既定を持つ場合がある）
  const existing = s.doc.sheets.find((sh) => sh.id === sheetId)!;
  if (existing.boxes.length > 0) {
    useTEMStore.getState().removeBoxes(existing.boxes.map((b) => b.id));
  }
  const a = useTEMStore.getState().addBox({ label: 'A', x: 0, y: 0 });
  const b = useTEMStore.getState().addBox({ label: 'B', x: 200, y: 0 });
  const l = useTEMStore.getState().addLine(a, b);
  const sd = useTEMStore.getState().addSDSG({
    type: 'SD',
    attachedTo: a,
    attachedType: 'box',
    attachedTo2: b,
    attachedType2: 'box',
    anchorMode: 'between',
  });
  return { a, b, l, sd };
};

const sheet = () => {
  const st = useTEMStore.getState();
  return st.doc.sheets.find((sh) => sh.id === st.doc.activeSheetId)!;
};

describe('clipboard: copy / paste', () => {
  beforeEach(() => {
    useTEMStore.getState().loadDocument(createEmptyDocument());
  });

  it('pasteFromClipboardAt("box") は内部で完結する Line と SDSG も一緒に挿入する', () => {
    const { a, b, l, sd } = setupSheet();
    expect(sheet().lines).toHaveLength(1);

    useTEMStore.getState().setSelection([a, b], [l], [sd]);
    useTEMStore.getState().copyToClipboard();
    useTEMStore.getState().pasteFromClipboardAt('box', sheet().boxes.length);

    const s = sheet();
    expect(s.boxes).toHaveLength(4);
    expect(s.lines).toHaveLength(2);   // 矢印が落ちない
    expect(s.sdsg).toHaveLength(2);

    // 複製された Line は複製された Box 同士をつなぐ（元 Box を指さない）
    const newLine = s.lines.find((x) => x.id !== l)!;
    const newBoxIds = s.boxes.filter((x) => x.id !== a && x.id !== b).map((x) => x.id);
    expect(newBoxIds).toContain(newLine.from);
    expect(newBoxIds).toContain(newLine.to);
  });

  it('片端だけ選択した Line は連れてこない', () => {
    const { a, l } = setupSheet();
    useTEMStore.getState().setSelection([a], [l], []);
    useTEMStore.getState().copyToClipboard();
    useTEMStore.getState().pasteFromClipboardAt('box', sheet().boxes.length);

    const s = sheet();
    expect(s.boxes).toHaveLength(3);
    expect(s.lines).toHaveLength(1);   // 増えない
  });

  it('貼付で採る ID は種別連番（Line=RL_n / SDSG=SD1・SG1）', () => {
    const { a, b, l, sd } = setupSheet();
    useTEMStore.getState().setSelection([a, b], [l], [sd]);
    useTEMStore.getState().copyToClipboard();
    useTEMStore.getState().pasteFromClipboard();

    const s = sheet();
    const newLine = s.lines.find((x) => x.id !== l)!;
    const newSD = s.sdsg.find((x) => x.id !== sd)!;
    expect(newLine.id).toMatch(/^RL_\d+$/);
    expect(newSD.id).toMatch(/^SD\d+$/);   // 種別 SD に SG_ が付かない
  });

  it('between モードの attachedTo2 も複製先へ再マップされる', () => {
    const { a, b, l, sd } = setupSheet();
    useTEMStore.getState().setSelection([a, b], [l], [sd]);
    useTEMStore.getState().copyToClipboard();
    useTEMStore.getState().pasteFromClipboard();

    const s = sheet();
    const newSD = s.sdsg.find((x) => x.id !== sd)!;
    const newBoxIds = s.boxes.filter((x) => x.id !== a && x.id !== b).map((x) => x.id);
    expect(newBoxIds).toContain(newSD.attachedTo);
    expect(newBoxIds).toContain(newSD.attachedTo2);
  });

  it('sourceRefs は複製時に ID を振り直す', () => {
    const { a, b, l, sd } = setupSheet();
    useTEMStore.getState().updateBox(a, { sourceRefs: [ref('Sr_dup')] });
    useTEMStore.getState().setSelection([a, b], [l], [sd]);
    useTEMStore.getState().copyToClipboard();
    useTEMStore.getState().pasteFromClipboard();

    const s = sheet();
    const allRefIds = s.boxes.flatMap((x) => (x.sourceRefs ?? []).map((r) => r.id));
    expect(allRefIds).toHaveLength(2);
    expect(new Set(allRefIds).size).toBe(2);      // ID が重複しない
    // 引用内容そのものは保たれる
    const quotes = s.boxes.flatMap((x) => (x.sourceRefs ?? []).map((r) => r.quoteText));
    expect(quotes).toEqual(['引用', '引用']);
  });

  it('別シートへの貼付でも Box / Line / SDSG がそろって複製される', () => {
    const { a, b, l, sd } = setupSheet();
    useTEMStore.getState().setSelection([a, b], [l], [sd]);
    useTEMStore.getState().copyToClipboard();

    const targetSheetId = useTEMStore.getState().addSheet();
    useTEMStore.getState().pasteFromClipboard(targetSheetId);

    const target = useTEMStore.getState().doc.sheets.find((sh) => sh.id === targetSheetId)!;
    expect(target.boxes.filter((x) => x.label === 'A' || x.label === 'B')).toHaveLength(2);
    expect(target.lines).toHaveLength(1);
    expect(target.sdsg).toHaveLength(1);
  });
});
