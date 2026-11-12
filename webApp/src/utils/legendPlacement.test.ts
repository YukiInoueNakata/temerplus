// 凡例の自動の置き方（2026-11-10 ユーザー「凡例は基本 非可逆的時間の右下で、横型なら 1 行のことが多い」）
import { describe, it, expect, afterEach } from 'vitest';
import { useTEMStore } from '../store/store';
import { computeAutoLegend } from './legendPlacement';
import { computeTimeArrow } from './timeArrow';
import { computeLegendColumns, computeLegendItems } from './legend';
import { estimateLegendSize } from './fitBounds';

const doc = () => useTEMStore.getState().doc;
const sheet = () => doc().sheets.find((s) => s.id === doc().activeSheetId)!;

afterEach(() => { useTEMStore.getState().resetDocument(); });

/** 横に並んだ Box を n 個と、つなぐ Line を作る */
const drawRow = (n: number, types: string[] = []) => {
  const st = useTEMStore.getState();
  const ids: string[] = [];
  for (let i = 0; i < n; i++) ids.push(st.addBox({ type: (types[i] ?? 'normal') as never, label: `B${i}`, x: i * 120, y: 0 }));
  for (let i = 0; i + 1 < n; i++) st.addLine(ids[i], ids[i + 1]);
  return ids;
};

describe('凡例の自動の置き方', () => {
  it('新しい図は自動で、凡例は時間の矢印の下・左端を矢印の始まりにそろえる（2026-11-13 に右寄せから変えた）', () => {
    expect(doc().settings.legend.placement).toBe('auto');
    drawRow(8, ['normal', 'BFP', 'OPP', 'normal', 'normal', 'normal', 'normal', 'EFP']);
    const s = doc().settings;
    const a = computeTimeArrow(sheet(), s.layout, s.timeArrow, s.sdsgSpace, s.typeLabelVisibility)!;
    const items = computeLegendItems(sheet(), s.legend, s.locale);
    const size = estimateLegendSize(s.legend, items, computeLegendColumns(s.legend, 'horizontal', items.length));
    expect(s.legend.layoutModeHorizontal).toBe('rows');
    expect(Math.abs(s.legend.position.x - Math.min(a.startX, a.endX))).toBeLessThanOrEqual(1);
    // 幅は矢印の長さに収まる
    expect(size.w).toBeLessThanOrEqual(Math.abs(a.endX - a.startX) + 1);
    expect(s.legend.position.y).toBeGreaterThan(Math.max(a.startY, a.endY));
  });

  it('行の数は矢印の長さに収まる最も少ない数（長い図は 1 行）', () => {
    drawRow(14, ['normal', 'BFP', 'OPP']);
    expect(doc().settings.legend.rowsHorizontal).toBe(1);
  });

  it('短い図では 2 行以上に折る', () => {
    drawRow(3, ['BFP', 'OPP', 'EFP']);
    const st = useTEMStore.getState();
    // 項目を増やす（点線の径路・SD・SG）
    const ids = sheet().boxes.map((b) => b.id);
    st.addLine(ids[0], ids[2], { type: 'XLine' });
    expect((doc().settings.legend.rowsHorizontal ?? 1)).toBeGreaterThanOrEqual(2);
  });

  it('Box を動かすと置き直し、その置き直しは「元に戻す」の記録に残らない', () => {
    const ids = drawRow(6, ['normal', 'BFP']);
    const before = { ...doc().settings.legend.position };
    const pastBefore = useTEMStore.temporal.getState().pastStates.length;
    // 左寄せなので、いちばん左の Box を左へ動かすと矢印の始まりとともに凡例も左へ動く
    useTEMStore.getState().updateBox(ids[0], { x: -600 });
    expect(doc().settings.legend.position.x).toBeLessThan(before.x);
    expect(useTEMStore.temporal.getState().pastStates.length).toBe(pastBefore + 1);
    useTEMStore.temporal.getState().undo();
    expect(doc().settings.legend.position).toEqual(before);
  });

  it('置き方が手動・未指定（既存の図）なら動かさない', () => {
    useTEMStore.setState((s) => ({ doc: { ...s.doc, settings: { ...s.doc.settings, legend: { ...s.doc.settings.legend, placement: undefined, position: { x: 7, y: 9 } } } } }));
    drawRow(5);
    expect(doc().settings.legend.position).toEqual({ x: 7, y: 9 });
    expect(computeAutoLegend(sheet(), doc().settings)).toBeNull();
  });

  it('縦型では時間の矢印の下の端より下に置く', () => {
    useTEMStore.getState().setLayout('vertical');
    drawRow(5, ['normal', 'BFP']);
    const s = doc().settings;
    expect(s.legend.placement).toBe('auto');
    const a = computeTimeArrow(sheet(), s.layout, s.timeArrow, s.sdsgSpace, s.typeLabelVisibility)!;
    expect(s.legend.position.y).toBeGreaterThan(Math.max(a.startY, a.endY));
  });
});
