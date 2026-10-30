// 出力に含める要素の確認（メモ・記号・コメント・凡例・時期ラベル）。2026-10-30 ユーザー指示
import { describe, it, expect } from 'vitest';
import { hydrateDocument } from './hydrate';
import { detectExportContent, missingChoices, applyExportContent, choiceCautions } from './exportContent';
import type { Note, TEMDocument } from '../types';
import kanzakiRaw from '../../sample-tem/kanzaki2021_figure1.tem?raw';

const note = (id: string, style?: Note['style']): Note => ({ id, x: 0, y: 0, width: 80, height: 40, text: id, style });

function docWith(edit: (d: TEMDocument) => void): TEMDocument {
  const doc = hydrateDocument(JSON.parse(kanzakiRaw) as TEMDocument);
  edit(doc);
  return doc;
}
const active = (d: TEMDocument) => d.sheets.find((s) => s.id === d.activeSheetId)!;

describe('出力に含める要素の確認', () => {
  it('図にある要素だけを確かめる対象にし、凡例はいつも対象', () => {
    const d = docWith((x) => { active(x).notes = [note('m1'), note('m2', 'callout'), note('s1', 'text')]; });
    const r = detectExportContent(active(d));
    expect(r.items.map((i) => [i.kind, i.count])).toEqual([['notes', 2], ['symbols', 1], ['legend', 1], ['periodLabels', active(d).periodLabels.length]]);
    expect(r.cautions).toEqual([]);
  });

  it('メモ・記号が無ければ対象にせず、時期ラベルが無ければ注意を出す', () => {
    const d = docWith((x) => { active(x).notes = []; active(x).periodLabels = []; });
    const r = detectExportContent(active(d));
    expect(r.items.map((i) => i.kind)).toEqual(['legend']);
    expect(r.cautions[0]).toContain('時期ラベル');
  });

  it('コメントは図に描けないものとして対象にする', () => {
    const d = docWith((x) => { active(x).comments = [{ id: 'c1', targetId: 'x', text: 't', createdAt: '', resolved: false }]; });
    const c = detectExportContent(active(d)).items.find((i) => i.kind === 'comments');
    expect(c?.cannotDraw).toBe(true);
  });

  it('選び終えるまでは未選択の一覧が残る', () => {
    const d = docWith((x) => { active(x).notes = [note('m1'), note('s1', 'text')]; });
    const r = detectExportContent(active(d));
    expect(missingChoices(r, {})).toHaveLength(r.items.length);
    expect(missingChoices(r, { notes: false, symbols: true, legend: true, periodLabels: true })).toEqual([]);
  });

  it('選んだ結果を出力用の doc に当てる（元の doc は変えない）', () => {
    const d = docWith((x) => { active(x).notes = [note('m1'), note('s1', 'text')]; });
    const out = applyExportContent(d, { notes: false, symbols: true, legend: false, periodLabels: false });
    expect(active(out).notes!.map((n) => n.id)).toEqual(['s1']);
    expect(out.settings.legend.includeInExport).toBe(false);
    expect(out.settings.legend.alwaysVisible).toBe(false);
    expect(out.settings.periodLabels.includeInExport).toBe(false);
    expect(active(d).notes).toHaveLength(2);
  });

  it('未選択の要素は元のまま（プレビューで見比べられる）', () => {
    const d = docWith((x) => { active(x).notes = [note('m1'), note('s1', 'text')]; });
    const out = applyExportContent(d, {});
    expect(active(out).notes).toHaveLength(2);
    expect(out.settings.legend).toEqual(d.settings.legend);
  });

  it('凡例を含めないときは注意を出す', () => {
    expect(choiceCautions({ legend: false })[0]).toContain('凡例');
    expect(choiceCautions({ legend: true })).toEqual([]);
  });
});
