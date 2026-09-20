// Note（図上のメモ）の store レベルテスト
//   1. addNote は Note1, Note2 … の連番 ID を振り、追加したメモを選択状態にする
//   2. 選択中の Box があればその右上に置く
//   3. updateNote / updateNotes / removeNotes が現在のシートに効く
//   4. removeNotes は選択からも外す
//   5. 既定は引き出し線 OFF・レポート出力 OFF（設計判断）
import { describe, it, expect, beforeEach } from 'vitest';
import { useTEMStore } from './store';
import { createEmptyDocument } from './defaults';

const activeSheet = () => {
  const s = useTEMStore.getState();
  return s.doc.sheets.find((sh) => sh.id === s.doc.activeSheetId)!;
};

beforeEach(() => {
  useTEMStore.getState().loadDocument(createEmptyDocument());
  const sheet = activeSheet();
  if (sheet.boxes.length > 0) useTEMStore.getState().removeBoxes(sheet.boxes.map((b) => b.id));
});

describe('addNote', () => {
  it('連番 ID を振り、追加したメモを選択する', () => {
    const id1 = useTEMStore.getState().addNote({ text: 'a' });
    const id2 = useTEMStore.getState().addNote({ text: 'b' });
    expect(id1).toBe('Note1');
    expect(id2).toBe('Note2');
    expect(activeSheet().notes.map((n) => n.id)).toEqual(['Note1', 'Note2']);
    expect(useTEMStore.getState().selection.noteIds).toEqual(['Note2']);
    expect(useTEMStore.getState().selection.boxIds).toEqual([]);
  });

  it('既定は付箋・引き出し線 OFF・レポート出力 OFF', () => {
    const id = useTEMStore.getState().addNote();
    const n = activeSheet().notes.find((x) => x.id === id)!;
    expect(n.style).toBe('note');
    expect(n.showLeader).toBeFalsy();
    expect(n.includeInReport).toBeFalsy();
    expect(n.width).toBeGreaterThan(0);
  });

  it('Box を選択中ならその右上に置く', () => {
    const b = useTEMStore.getState().addBox({ label: 'B', x: 300, y: 200 });
    useTEMStore.getState().setSelection([b], [], []);
    const box = activeSheet().boxes.find((x) => x.id === b)!;
    const id = useTEMStore.getState().addNote();
    const n = activeSheet().notes.find((x) => x.id === id)!;
    expect(n.x).toBe(box.x + box.width + 24);
    expect(n.y).toBe(box.y - 40);
  });
});

describe('updateNote / updateNotes / removeNotes', () => {
  it('更新が反映される', () => {
    const id = useTEMStore.getState().addNote({ text: 'x' });
    useTEMStore.getState().updateNote(id, { text: 'y', showLeader: true, leaderTo: 'B1' });
    const n = activeSheet().notes.find((x) => x.id === id)!;
    expect(n.text).toBe('y');
    expect(n.showLeader).toBe(true);
    expect(n.leaderTo).toBe('B1');
  });

  it('複数まとめて更新できる', () => {
    const a = useTEMStore.getState().addNote();
    const b = useTEMStore.getState().addNote();
    useTEMStore.getState().updateNotes([a, b], { style: 'callout', includeInReport: true });
    activeSheet().notes.forEach((n) => {
      expect(n.style).toBe('callout');
      expect(n.includeInReport).toBe(true);
    });
  });

  it('削除すると選択からも外れる', () => {
    const a = useTEMStore.getState().addNote();
    const b = useTEMStore.getState().addNote();
    useTEMStore.getState().setSelection([], [], [], { noteIds: [a, b] });
    useTEMStore.getState().removeNotes([a]);
    expect(activeSheet().notes.map((n) => n.id)).toEqual([b]);
    expect(useTEMStore.getState().selection.noteIds).toEqual([b]);
  });
});

describe('setSelection の noteIds', () => {
  it('opts.noteIds で Note を選択でき、指定が無ければ空になる', () => {
    const a = useTEMStore.getState().addNote();
    useTEMStore.getState().setSelection([], [], [], { noteIds: [a] });
    expect(useTEMStore.getState().selection.noteIds).toEqual([a]);
    useTEMStore.getState().setSelection([], [], []);
    expect(useTEMStore.getState().selection.noteIds).toEqual([]);
  });
});
