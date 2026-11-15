// 論文用レポート: 出力前の確認（済／未／一部・メモや記号を載せるか・未入力の扱い）と、表記方針の 9 項目
// 論文 04_report_format.md 4 節・Block 4、2026-10-30 の依頼とユーザー決定
import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { Document, Packer } from 'docx';
import { hydrateDocument } from './hydrate';
import { computeReportStatus, missingReportChoices, usedSymbols, symbolKeyOf } from './reportStatus';
import { buildPaperReportParagraphs } from './exportReport';
import { VISUAL_CONVENTION_ITEMS, conventionItemLabel } from './visualConventions';
import type { Note, TEMDocument } from '../types';
import kanzakiRaw from '../../sample-tem/kanzaki2021_figure1.tem?raw';

const note = (id: string, text: string, style?: Note['style'], includeInReport?: boolean): Note =>
  ({ id, x: 0, y: 0, width: 80, height: 40, text, style, includeInReport });

function fresh(edit?: (d: TEMDocument) => void): TEMDocument {
  const doc = hydrateDocument(JSON.parse(kanzakiRaw) as TEMDocument);
  doc.metadata = { ...doc.metadata, notationSystem: undefined, participantsInfo: undefined, interview: undefined, visualConventions: undefined, symbolMeanings: undefined, reportNotes: undefined };
  for (const sh of doc.sheets) {
    sh.notes = [];
    sh.comments = [];
    sh.boxes.forEach((b) => { b.description = undefined; b.noDescriptionNeeded = undefined; });
  }
  edit?.(doc);
  return doc;
}
const active = (d: TEMDocument) => d.sheets.find((s) => s.id === d.activeSheetId)!;

/** 生成した Word の本文（段落ごと） */
async function reportText(doc: TEMDocument, opts: Partial<Parameters<typeof buildPaperReportParagraphs>[1]>): Promise<string[]> {
  const children = await buildPaperReportParagraphs(doc, { ...opts, includeDiagram: false });
  const buf = await Packer.toBuffer(new Document({ sections: [{ children }] }));
  const xml = await (await JSZip.loadAsync(buf)).file('word/document.xml')!.async('string');
  return [...xml.matchAll(/<w:p[ >][\s\S]*?<\/w:p>/g)]
    .map((m) => [...m[0].matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((t) => t[1]).join(''))
    .filter(Boolean);
}

describe('表記方針は論文 Block 4 の表の 11 項目（影・立体感は TEMer に機能が無いので除く）', () => {
  it('項目と並び', () => {
    expect(VISUAL_CONVENTION_ITEMS.map((i) => i.key)).toEqual([
      'horizontalLength', 'verticalPosition', 'arrowAngle', 'arrowLength',
      'boxWidth', 'boxHeight', 'lineWeight', 'colors', 'boxShape',
      'fontDecoration', 'textAlignment',
    ]);
  });
});

describe('出力前の確認: 入力状況', () => {
  it('何も書いていなければ未。Box の説明は件数つき', () => {
    const st = computeReportStatus(fresh());
    expect(st.find((s) => s.key === 'notation')?.state).toBe('missing');
    // 出力前の確認画面にも 11 項目すべてが並ぶ（足した フォント装飾・テキスト配置 も）
    expect(st.filter((s) => s.key.startsWith('visual.'))).toHaveLength(11);
    expect(st.map((s) => s.label)).toContain('表記方針: フォント装飾（太字・斜体・サイズ）');
    expect(st.map((s) => s.label)).toContain('表記方針: テキスト配置（中央・左寄せなど）');
    expect(st.filter((s) => s.key.startsWith('visual.')).every((s) => s.state === 'missing')).toBe(true);
    expect(st.find((s) => s.key === 'desc.box')?.state).toBe('missing');
  });

  it('一部だけ書いたら「一部（10 件中 8 件）」の形', () => {
    const d = fresh((x) => { active(x).boxes.slice(0, 2).forEach((b) => { b.description = 'x'; }); active(x).boxes[2].noDescriptionNeeded = true; });
    const total = d.sheets.flatMap((s) => s.boxes).length;
    const it = computeReportStatus(d).find((s) => s.key === 'desc.box')!;
    expect(it.state).toBe('partial');
    expect(it.detail).toBe(`${total} 件中 3 件`);
  });

  it('表記方針は「意味あり」で説明が空なら一部、「意味なし」なら済', () => {
    const d = fresh((x) => { x.metadata.visualConventions = { arrowAngle: { meaning: 'yes' }, boxShape: { meaning: 'no' } }; });
    const st = computeReportStatus(d);
    expect(st.find((s) => s.key === 'visual.arrowAngle')?.state).toBe('partial');
    expect(st.find((s) => s.key === 'visual.boxShape')?.state).toBe('done');
  });

  it('記号を載せると選んだら、記号の意味の入力状況も出す', () => {
    const d = fresh((x) => { active(x).notes = [note('s1', '★ 転機', 'text'), note('s2', '〇', 'text')]; x.metadata.symbolMeanings = { '★': '強調された転機' }; });
    expect(usedSymbols(d)).toEqual(['★', '〇']);
    expect(computeReportStatus(d, {}).find((s) => s.key === 'symbolMeanings')).toBeUndefined();
    const it = computeReportStatus(d, { symbols: true }).find((s) => s.key === 'symbolMeanings')!;
    expect(it.state).toBe('partial');
  });

  it('記号メモの記号は先頭の記号、記号で始まらなければ本文', () => {
    expect(symbolKeyOf(note('a', '★ 重要', 'text'))).toBe('★');
    expect(symbolKeyOf(note('a', '＊', 'text'))).toBe('＊');
  });
});

describe('出力前の確認: 図にある要素を載せるか（毎回選ぶ）', () => {
  it('図にあるものだけ選ばせる', () => {
    expect(missingReportChoices(fresh(), {})).toEqual([]);
    const d = fresh((x) => { active(x).notes = [note('m', 'メモ'), note('s', '★', 'text')]; });
    expect(missingReportChoices(d, {})).toEqual(['メモ', '記号']);
    expect(missingReportChoices(d, { notes: 'none', symbols: false })).toEqual([]);
  });
});

describe('論文用レポートの Word', () => {
  it('未入力を含めない（既定）: 未入力の節は出さず、節の番号は詰める', async () => {
    const d = fresh((x) => { x.metadata.interview = { method: '半構造化面接', durationDescription: '', timesCount: 0 }; });
    const t = await reportText(d, {});
    expect(t).not.toContain('（未入力）');
    expect(t.some((p) => p.includes('説明未記入'))).toBe(false);
    // 記号の宣言は図の線種から書くので必ず出る。協力者・表記方針は未入力なので出さず、番号を詰める。
    // 順は論文の報告フォーマット（協力者 → データ収集 → 記号 → 表記方針 → 要素一覧。2026-11-15）
    expect(t).toContain('1. インタビュー／データ収集の方法');
    expect(t).toContain('2. 用いた記号の宣言');
    expect(t).toContain('3. 要素一覧');
    expect(t.some((p) => p.startsWith('協力者') || p.endsWith('協力者情報'))).toBe(false);
  });

  it('「（未入力）」と書いて含める: 9 項目すべてと要素の説明の抜けが分かる', async () => {
    const t = await reportText(fresh(), { omitMissing: false });
    // すべての節が論文の報告フォーマットの順に並ぶ
    const order = ['1. 協力者情報', '2. インタビュー／データ収集の方法', '3. 用いた記号の宣言', '4. 表記方針の明文化', '5. 要素一覧'];
    const pos = order.map((h) => t.indexOf(h));
    expect(pos.every((p) => p >= 0)).toBe(true);
    expect([...pos].sort((a, b) => a - b)).toEqual(pos);
    for (const it of VISUAL_CONVENTION_ITEMS) expect(t).toContain(`${conventionItemLabel(it.key)}: （未入力）`);
    expect(t.some((p) => p.includes('（説明未記入）'))).toBe(true);
  });

  it('論文の表3〜表5 の欄（1・4・9 の法則・抽象化のプロセス・文献と準拠／参照・異なる点・SD/SG・凡例）を書く', async () => {
    const t = (await reportText(fresh((x) => {
      x.metadata.participantsInfo = { count: 4, description: '看護師', hsiDescription: '転職を経験した人', sampleSizeRationale: '多様性の水準（4人）' };
      x.metadata.interview = { method: '半構造化', durationDescription: '', timesCount: 2, abstractionProcess: '逐語録から一次コードを経て Box に' };
      x.metadata.notationSystem = { base: 'Arakawa2012', sources: '安田（2023）', sourceRelation: 'conform', differences: 'SD を図形で描いた', sdsgExpression: '五角形で上下に置いた', legendLocation: 'inFigure' };
    }), {})).join(String.fromCharCode(10));
    expect(t).toContain('1・4・9 の法則との関係: 多様性の水準（4人）');
    expect(t).toContain('HSI（歴史的構造化ご招待）の論理: 転職を経験した人');
    expect(t).toContain('形式: 半構造化');
    expect(t).toContain('データの抽象化プロセス: 逐語録から一次コードを経て Box に');
    expect(t).toContain('表記は次の文献に準拠した（そのまま従った）: 安田（2023）');
    expect(t).toContain('文献と異なる点: SD を図形で描いた');
    expect(t).toContain('SD・SG の表現: 五角形で上下に置いた');
    expect(t).toContain('凡例は図中に示した。');
  });

  it('参照を選ぶと「参照した（一部を取り入れた）」と書く', async () => {
    const t = (await reportText(fresh((x) => { x.metadata.notationSystem = { base: 'custom', sources: 'Kawai (2016)', sourceRelation: 'refer' }; }), {})).join(String.fromCharCode(10));
    expect(t).toContain('表記は次の文献を参照した（一部を取り入れた）: Kawai (2016)');
  });

  it('記号体系は「準拠」でなく「参照」と書く', async () => {
    const t = await reportText(fresh((x) => { x.metadata.notationSystem = { base: 'Arakawa2012' }; }), {});
    expect(t.find((p) => p.includes('荒川'))).toContain('参照');
    expect(t.join('')).not.toContain('準拠');
  });

  it('記号を載せると、意味を記号体系の宣言に書く', async () => {
    const d = fresh((x) => { active(x).notes = [note('s1', '★ 転機', 'text')]; x.metadata.symbolMeanings = { '★': '強調された転機' }; });
    expect(await reportText(d, { content: { symbols: true } })).toContain('・★: 強調された転機');
    expect((await reportText(d, { content: { symbols: false } })).join('')).not.toContain('強調された転機');
  });

  it('メモは選んだとおりに注記へ載せる（記号メモは載せない）', async () => {
    const d = fresh((x) => { active(x).notes = [note('m1', '解釈A', 'note', true), note('m2', '解釈B', 'callout'), note('s1', '★', 'text')]; });
    const has = async (choice: 'all' | 'flagged' | 'none') => {
      const j = (await reportText(d, { content: { notes: choice } })).join('\n');
      return [j.includes('解釈A'), j.includes('解釈B'), j.includes('s1')];
    };
    expect(await has('all')).toEqual([true, true, false]);
    expect(await has('flagged')).toEqual([true, false, false]);
    expect(await has('none')).toEqual([false, false, false]);
  });

  it('コメントは「載せる」を選んだときだけ', async () => {
    const d = fresh((x) => { const b = active(x).boxes[0]; active(x).comments = [{ id: 'c1', targetId: b.id, text: '要確認', createdAt: '', resolved: false }]; });
    expect((await reportText(d, { content: { comments: true } })).some((p) => p.includes('要確認'))).toBe(true);
    expect((await reportText(d, { content: { comments: false } })).some((p) => p.includes('要確認'))).toBe(false);
  });
});
