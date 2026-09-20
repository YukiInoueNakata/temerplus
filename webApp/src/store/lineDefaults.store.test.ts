// Line 既定スタイルの store レベル回帰テスト
//   1. addLine が settings.lineDefaults を新規 Line の初期値にする
//   2. 重複 Line の自動オフセットは既定値に「足す」（既定を無視しない）
//   3. applyLineDefaultsToAll は現在のシートだけに効く（SD/SG 一括配置と同じ範囲）
//   4. 線種は既定で据え置き、手動制御点は既定で温存
import { describe, it, expect, beforeEach } from 'vitest';
import { useTEMStore } from './store';
import { createEmptyDocument } from './defaults';

/** 空ドキュメントに Box 2 つを用意する */
const setup = () => {
  useTEMStore.getState().loadDocument(createEmptyDocument());
  const s = useTEMStore.getState();
  const sheet = s.doc.sheets.find((sh) => sh.id === s.doc.activeSheetId)!;
  if (sheet.boxes.length > 0) {
    useTEMStore.getState().removeBoxes(sheet.boxes.map((b) => b.id));
  }
  const a = useTEMStore.getState().addBox({ label: 'A', x: 0, y: 0 });
  const b = useTEMStore.getState().addBox({ label: 'B', x: 200, y: 0 });
  return { a, b };
};

const activeSheet = () => {
  const s = useTEMStore.getState();
  return s.doc.sheets.find((sh) => sh.id === s.doc.activeSheetId)!;
};

const lineById = (id: string) => activeSheet().lines.find((l) => l.id === id)!;

beforeEach(() => {
  setup();
});

describe('addLine と既定スタイル', () => {
  it('lineDefaults 未設定なら従来どおりの Line になる', () => {
    const { a, b } = setup();
    const id = useTEMStore.getState().addLine(a, b);
    const l = lineById(id);
    expect(l.shape).toBe('straight');
    expect(l.style).toEqual({ color: '#222', strokeWidth: 1.5 });
  });

  it('設定した既定スタイルが新規 Line に適用される', () => {
    const { a, b } = setup();
    useTEMStore.getState().setLineDefaults({
      shape: 'curve', color: '#ff0000', strokeWidth: 3, startMargin: 6, angleMode: true, angleDeg: 20,
    });
    const id = useTEMStore.getState().addLine(a, b);
    const l = lineById(id);
    expect(l.shape).toBe('curve');
    expect(l.style).toEqual({ color: '#ff0000', strokeWidth: 3 });
    expect(l.startMargin).toBe(6);
    expect(l.angleMode).toBe(true);
    expect(l.angleDeg).toBe(20);
  });

  it('呼び出し側の patch は既定より優先される', () => {
    const { a, b } = setup();
    useTEMStore.getState().setLineDefaults({ shape: 'curve' });
    const id = useTEMStore.getState().addLine(a, b, { shape: 'elbow' });
    expect(lineById(id).shape).toBe('elbow');
  });

  it('同じ Box 間の 2 本目は、既定の Item オフセットに自動オフセットを足す', () => {
    const { a, b } = setup();
    useTEMStore.getState().setLineDefaults({ startOffsetItem: 10, endOffsetItem: 10 });
    const first = useTEMStore.getState().addLine(a, b);
    const second = useTEMStore.getState().addLine(a, b);
    expect(lineById(first).startOffsetItem).toBe(10);
    // 2 本目は +5 の振り分けが既定値に加算される
    expect(lineById(second).startOffsetItem).toBe(15);
    expect(lineById(second).endOffsetItem).toBe(15);
  });
});

describe('applyLineDefaultsToAll', () => {
  it('現在のシートの全 Line に適用される', () => {
    const { a, b } = setup();
    const l1 = useTEMStore.getState().addLine(a, b);
    const l2 = useTEMStore.getState().addLine(b, a);
    useTEMStore.getState().updateLines([l1], { shape: 'elbow', style: { color: '#00ff00', strokeWidth: 9 } });

    useTEMStore.getState().setLineDefaults({ shape: 'curve', color: '#123456', strokeWidth: 2 });
    useTEMStore.getState().applyLineDefaultsToAll();

    [l1, l2].forEach((id) => {
      const l = lineById(id);
      expect(l.shape).toBe('curve');
      expect(l.style).toEqual({ color: '#123456', strokeWidth: 2 });
    });
  });

  it('他のシートの Line は変更しない（SD/SG 一括配置と同じシート単位）', () => {
    const { a, b } = setup();
    const onSheet1 = useTEMStore.getState().addLine(a, b);
    const sheet1Id = activeSheet().id;

    const sheet2Id = useTEMStore.getState().addSheet('Sheet 2');
    useTEMStore.getState().setActiveSheet(sheet2Id);
    const c = useTEMStore.getState().addBox({ label: 'C', x: 0, y: 0 });
    const d = useTEMStore.getState().addBox({ label: 'D', x: 200, y: 0 });
    const onSheet2 = useTEMStore.getState().addLine(c, d);

    useTEMStore.getState().setLineDefaults({ strokeWidth: 7 });
    useTEMStore.getState().applyLineDefaultsToAll();

    // アクティブな Sheet 2 だけが変わる
    expect(lineById(onSheet2).style?.strokeWidth).toBe(7);
    const sheet1 = useTEMStore.getState().doc.sheets.find((sh) => sh.id === sheet1Id)!;
    expect(sheet1.lines.find((l) => l.id === onSheet1)!.style?.strokeWidth).toBe(1.5);
  });

  it('線種は既定で据え置き、includeType のときだけ揃える', () => {
    const { a, b } = setup();
    const r = useTEMStore.getState().addLine(a, b, { type: 'RLine' });
    const x = useTEMStore.getState().addLine(b, a, { type: 'XLine' });
    useTEMStore.getState().setLineDefaults({ type: 'RLine' });

    useTEMStore.getState().applyLineDefaultsToAll();
    expect(lineById(x).type).toBe('XLine');

    useTEMStore.getState().applyLineDefaultsToAll({ includeType: true });
    expect(lineById(x).type).toBe('RLine');
    expect(lineById(r).type).toBe('RLine');
  });

  it('手動の制御点は既定で温存し、resetControlPoints のときだけ破棄する', () => {
    const { a, b } = setup();
    const id = useTEMStore.getState().addLine(a, b);
    useTEMStore.getState().updateLines([id], {
      shape: 'curve',
      controlPoints: [{ x: 10, y: 20 }, { x: 30, y: 40 }],
    });

    useTEMStore.getState().applyLineDefaultsToAll();
    expect(lineById(id).controlPoints).toHaveLength(2);

    useTEMStore.getState().applyLineDefaultsToAll({ resetControlPoints: true });
    expect(lineById(id).controlPoints).toBeUndefined();
  });

  it('各 Line の style は別オブジェクトになる（共有参照を作らない）', () => {
    const { a, b } = setup();
    const l1 = useTEMStore.getState().addLine(a, b);
    const l2 = useTEMStore.getState().addLine(b, a);
    useTEMStore.getState().setLineDefaults({ strokeWidth: 4 });
    useTEMStore.getState().applyLineDefaultsToAll();

    useTEMStore.getState().updateLines([l1], { style: { color: '#222', strokeWidth: 8 } });
    expect(lineById(l2).style?.strokeWidth).toBe(4);
  });
});
