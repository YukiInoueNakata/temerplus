// 径路の線種と種別の食い違いの注意（2026-11-10 ユーザー要望「点線だけしかつながっていない Box は潜在的な経験．注意を促して」）
import { describe, it, expect, afterEach } from 'vitest';
import type { Box, Line } from '../types';
import { pathTypeIssueFor, findPathTypeIssues, suggestedTypeFor, PATH_TYPE_BADGE_CLASS } from './pathTypeCheck';
import { buildFilter } from './exportImage';
import { useTEMStore } from '../store/store';

const box = (id: string, type: Box['type'], extra: Partial<Box> = {}): Box =>
  ({ id, type, label: id, x: 0, y: 0, width: 60, height: 100, ...extra } as Box);
const line = (from: string, to: string, type: Line['type']): Line =>
  ({ id: `${from}_${to}`, type, from, to, connectionMode: 'center-to-center', shape: 'straight' } as Line);

describe('pathTypeIssueFor', () => {
  it('点線だけでつながる通常の Box は dashedOnly', () => {
    const lines = [line('A', 'X', 'XLine'), line('X', 'B', 'XLine')];
    expect(pathTypeIssueFor(box('X', 'normal'), lines)).toBe('dashedOnly');
  });
  it('実線が 1 本でもあれば知らせない', () => {
    const lines = [line('A', 'X', 'XLine'), line('X', 'B', 'RLine')];
    expect(pathTypeIssueFor(box('X', 'normal'), lines)).toBeNull();
  });
  it('どこにもつながっていない Box は知らせない（描き始め）', () => {
    expect(pathTypeIssueFor(box('X', 'normal'), [line('A', 'B', 'XLine')])).toBeNull();
  });
  it('潜在経験に実線がつながると latentOnSolid', () => {
    expect(pathTypeIssueFor(box('X', 'annotation'), [line('A', 'X', 'RLine')])).toBe('latentOnSolid');
    expect(pathTypeIssueFor(box('X', 'annotation'), [line('A', 'X', 'XLine')])).toBeNull();
  });
  it('P-EFP・BFP など通常と潜在経験以外の種別は対象にしない（P-EFP は点線だけでつながるのが普通）', () => {
    const lines = [line('A', 'X', 'XLine')];
    for (const t of ['P-EFP', 'BFP', 'EFP', 'OPP', 'P-2nd-EFP'] as const) {
      expect(pathTypeIssueFor(box('X', t), lines)).toBeNull();
    }
  });
  it('「このままにする」を選んだ Box とまとめ枠は知らせない', () => {
    const lines = [line('A', 'X', 'XLine')];
    expect(pathTypeIssueFor(box('X', 'normal', { pathTypeCheckIgnored: true }), lines)).toBeNull();
    expect(pathTypeIssueFor(box('X', 'normal', { isGroup: true }), lines)).toBeNull();
  });
  it('findPathTypeIssues はシートの中の該当をすべて返し、直す種別を示す', () => {
    const m = findPathTypeIssues({
      boxes: [box('A', 'normal'), box('X', 'normal'), box('L', 'annotation')],
      lines: [line('A', 'X', 'XLine'), line('A', 'L', 'RLine')],
    });
    expect([...m.entries()]).toEqual([['X', 'dashedOnly'], ['L', 'latentOnSolid']]);
    expect(suggestedTypeFor('dashedOnly')).toBe('annotation');
    expect(suggestedTypeFor('latentOnSolid')).toBe('normal');
  });
});

describe('出力には「!」の印を写さない', () => {
  it('buildFilter が印の class を除く', () => {
    const d = document.createElement('div');
    d.className = PATH_TYPE_BADGE_CLASS;
    const f = buildFilter({ includeControls: false, includeRulers: false, includeGrid: false, includePaperGuides: false } as Parameters<typeof buildFilter>[0]);
    expect(f(d)).toBe(false);
  });
});

describe('注意のボタンの操作（store）', () => {
  afterEach(() => { useTEMStore.getState().resetDocument(); });
  const sheet = () => { const s = useTEMStore.getState(); return s.doc.sheets.find((sh) => sh.id === s.doc.activeSheetId)!; };

  it('「潜在経験にする」で種別が潜在経験になり、注意が消える', () => {
    const st = useTEMStore.getState();
    const a = st.addBox({ type: 'BFP', label: 'A', x: 0, y: 0 });  // 点線の分かれ目は BFP
    const x = st.addBox({ type: 'normal', label: 'X', x: 200, y: 0 });
    st.addLine(a, x, { type: 'XLine' });
    expect(findPathTypeIssues(sheet()).get(x)).toBe('dashedOnly');
    useTEMStore.getState().changeBoxTypes([x], suggestedTypeFor('dashedOnly'));
    const after = sheet();
    expect(after.boxes.filter((b) => b.type === 'annotation')).toHaveLength(1);
    expect(findPathTypeIssues(after).size).toBe(0);
  });
  it('「このままにする」で以後は知らせない', () => {
    const st = useTEMStore.getState();
    const a = st.addBox({ type: 'BFP', label: 'A', x: 0, y: 0 });  // 点線の分かれ目は BFP
    const x = st.addBox({ type: 'normal', label: 'X', x: 200, y: 0 });
    st.addLine(a, x, { type: 'XLine' });
    useTEMStore.getState().updateBoxes([x], { pathTypeCheckIgnored: true });
    expect(findPathTypeIssues(sheet()).size).toBe(0);
  });
});
