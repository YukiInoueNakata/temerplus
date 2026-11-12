// Box の手直しの道具（2026-11-08 ユーザー要望「種別の変更や位置の調整が面倒」）の検査
import { describe, it, expect, afterEach } from 'vitest';
import { useTEMStore } from './store';
import { changeSelectedBoxesType, moveSelectionItemLevel } from '../components/BoxQuickEdit';
import { LEVEL_PX } from './defaults';

const sheet = () => {
  const s = useTEMStore.getState();
  return s.doc.sheets.find((sh) => sh.id === s.doc.activeSheetId)!;
};

afterEach(() => { useTEMStore.getState().resetDocument(); });

describe('nudgeSelection（矢印のキー）', () => {
  it('選んでいる Box とメモだけを動かす', () => {
    const st = useTEMStore.getState();
    const a = st.addBox({ type: 'normal', label: 'A', x: 0, y: 0 });
    const b = st.addBox({ type: 'normal', label: 'B', x: 200, y: 0 });
    useTEMStore.getState().setSelection([a], [], []);
    useTEMStore.getState().nudgeSelection(10, -20);
    const boxes = sheet().boxes;
    expect(boxes.find((x) => x.id === a)).toMatchObject({ x: 10, y: -20 });
    expect(boxes.find((x) => x.id === b)).toMatchObject({ x: 200, y: 0 });
  });
});

describe('moveSelectionItemLevel（浮かぶツールバー・右クリック）', () => {
  it('横型は Item レベルを上げると画面の上へ 1 レベル', () => {
    const id = useTEMStore.getState().addBox({ type: 'normal', x: 0, y: 0 });
    useTEMStore.getState().setSelection([id], [], []);
    moveSelectionItemLevel(1);
    expect(sheet().boxes.find((x) => x.id === id)!.y).toBe(-LEVEL_PX);
  });
  it('縦型は Item レベルを上げると画面の右へ 1 レベル', () => {
    useTEMStore.getState().setLayout('vertical');
    const id = useTEMStore.getState().addBox({ type: 'normal', x: 0, y: 0 });
    useTEMStore.getState().setSelection([id], [], []);
    moveSelectionItemLevel(1);
    expect(sheet().boxes.find((x) => x.id === id)!.x).toBe(LEVEL_PX);
  });
});

describe('changeSelectedBoxesType（数字のキー・右クリック・浮かぶツールバー）', () => {
  it('選んでいる Box をまとめて変え、既定の名前のままの文字は新しい種別の名前に替える', () => {
    const st = useTEMStore.getState();
    const a = st.addBox({ type: 'normal', label: '行為' });
    const b = st.addBox({ type: 'normal', label: '大学に入る' });
    // 前の版の既定の名前（旧称）のままの Box も替える（2026-11-12 通常→行為、潜在経験→潜在的な行為）
    const c = st.addBox({ type: 'normal', label: '通常' });
    const d = st.addBox({ type: 'annotation', label: '潜在経験' });
    useTEMStore.getState().setSelection([a, b, c, d], [], []);
    changeSelectedBoxesType('BFP');
    const boxes = sheet().boxes;
    expect(boxes.every((x) => x.type === 'BFP')).toBe(true);
    expect(boxes.map((x) => x.label).sort()).toEqual(['分岐点', '分岐点', '分岐点', '大学に入る'].sort());
    // 選択も新しい ID に付け替わっている
    expect(useTEMStore.getState().selection.boxIds.every((id) => id.startsWith('BFP'))).toBe(true);
  });
});
