// MAXQDA コード付きセグメント取り込みのテスト
// - 列名の推測（日英）
// - 同一セグメントに複数コードが付いた行を 1 つに集約（dedupe）
// - コード集計と階層の分解、種別の推測
// - 逐語録（段落 + tags）と Box / SD / 時期ラベル、原文参照の組み立て
import { describe, it, expect } from 'vitest';
import {
  guessMaxqdaRole, dedupeSegments, summarizeCodes, splitCodePath, buildFromSegments,
  type MaxqdaRole,
} from './maxqdaImport';

const HEADER = ['文書グループ', '文書名', 'コード', '開始', '終了', 'セグメント', '重み', 'コメント'];
const MAPPING: MaxqdaRole[] = ['docGroup', 'docName', 'code', 'start', 'end', 'segment', 'weight', 'comment'];

/** 同じセグメント（1–3）に 2 つのコードが付いている典型的な書き出し */
const ROWS: string[][] = [
  HEADER,
  ['G', 'A さん 1回目', 'TEM\\分岐点', '1', '3', '留学を決めたのは友人の一言だった', '1', ''],
  ['G', 'A さん 1回目', '感受性\\否認', '1', '3', '留学を決めたのは友人の一言だった', '2', 'ここは重要'],
  ['G', 'A さん 1回目', 'TEM\\必須通過点', '4', '6', '渡航直後に言葉が通じず孤立した', '', ''],
  ['G', 'A さん 1回目', 'SD', '4', '6', '渡航直後に言葉が通じず孤立した', '', ''],
  ['G', 'A さん 1回目', '時期\\第1期', '1', '6', '', '', ''],
  ['G', 'B さん 1回目', 'TEM\\分岐点', '2', '2', '転職を機に海外へ', '', ''],
];

describe('guessMaxqdaRole', () => {
  it('日本語の標準列名を推測する', () => {
    expect(HEADER.map(guessMaxqdaRole)).toEqual(MAPPING);
  });
  it('英語の標準列名も推測する', () => {
    expect(['Document group', 'Document name', 'Code', 'Beginning', 'End', 'Segment', 'Weight score', 'Comment', 'Coverage %', 'Created by']
      .map(guessMaxqdaRole))
      .toEqual(['docGroup', 'docName', 'code', 'start', 'end', 'segment', 'weight', 'comment', 'coverage', 'codedBy']);
  });
});

describe('dedupeSegments', () => {
  it('同じ (文書, 開始, 終了) の行を 1 セグメントに集約し、コードを全部持つ', () => {
    const r = dedupeSegments(ROWS, { mapping: MAPPING, hasHeader: true });
    expect(r.docNames).toEqual(['A さん 1回目', 'B さん 1回目']);
    const a = r.segments.filter((s) => s.docName === 'A さん 1回目');
    expect(a).toHaveLength(3);
    const first = a[0];
    expect(first.text).toBe('留学を決めたのは友人の一言だった');
    expect(first.codes).toEqual(['TEM\\分岐点', '感受性\\否認']);
    expect(first.codeMeta['感受性\\否認'].comment).toBe('ここは重要');
    expect(first.rowIndexes).toEqual([2, 3]);
  });

  it('開始が数値なら文書内でその順に並ぶ', () => {
    const r = dedupeSegments(ROWS, { mapping: MAPPING, hasHeader: true });
    const a = r.segments.filter((s) => s.docName === 'A さん 1回目');
    expect(a.map((s) => s.start)).toEqual(['1', '1', '4']);
  });

  it('開始・終了が無いときは本文で集約し、警告を出す', () => {
    const mapping: MaxqdaRole[] = ['docGroup', 'docName', 'code', 'ignore', 'ignore', 'segment', 'ignore', 'ignore'];
    const r = dedupeSegments(ROWS, { mapping, hasHeader: true });
    expect(r.warnings.some((w) => w.includes('本文の一致'))).toBe(true);
    const a = r.segments.filter((s) => s.docName === 'A さん 1回目');
    // 本文が同じ 2 行 + 別の本文 2 行 + 本文空（時期）1 行
    expect(a.find((s) => s.text === '留学を決めたのは友人の一言だった')?.codes).toHaveLength(2);
  });
});

describe('splitCodePath / summarizeCodes', () => {
  it('階層区切りを分解する', () => {
    expect(splitCodePath('TEM\\分岐点')).toEqual({ parents: ['TEM'], leaf: '分岐点' });
    expect(splitCodePath('A > B > C')).toEqual({ parents: ['A', 'B'], leaf: 'C' });
    expect(splitCodePath('単独')).toEqual({ parents: [], leaf: '単独' });
  });

  it('件数を数え、語から種別と扱いを推測する', () => {
    const r = dedupeSegments(ROWS, { mapping: MAPPING, hasHeader: true });
    const codes = summarizeCodes(r.segments);
    const byCode = Object.fromEntries(codes.map((c) => [c.code, c]));
    expect(byCode['TEM\\分岐点'].count).toBe(2);
    expect(byCode['TEM\\分岐点'].docCount).toBe(2);
    expect(byCode['TEM\\分岐点'].suggestedType).toBe('BFP');
    expect(byCode['TEM\\分岐点'].suggestedAction).toBe('box');
    expect(byCode['TEM\\必須通過点'].suggestedType).toBe('OPP');
    expect(byCode['SD'].suggestedAction).toBe('sd');
    expect(byCode['時期\\第1期'].suggestedAction).toBe('period');
    expect(byCode['感受性\\否認'].suggestedAction).toBe('tag');
  });
});

describe('buildFromSegments', () => {
  const build = () => {
    const r = dedupeSegments(ROWS, { mapping: MAPPING, hasHeader: true });
    return buildFromSegments(r, {
      plans: [
        { code: 'TEM\\分岐点', action: 'box', boxType: 'BFP' },
        { code: 'TEM\\必須通過点', action: 'box', boxType: 'OPP' },
        { code: 'SD', action: 'sd' },
        { code: '時期\\第1期', action: 'period' },
        { code: '感受性\\否認', action: 'tag' },
      ],
      levelPx: 100, defaultWidth: 100, defaultHeight: 60,
      existingBoxIds: new Set(), existingSdsgIds: new Set(),
    });
  };

  it('文書ごとに逐語録を作り、段落の tags に全コードが載る', () => {
    const res = build();
    expect(res.transcripts.map((t) => t.title)).toEqual(['A さん 1回目', 'B さん 1回目']);
    const a = res.transcripts[0];
    expect(a.paragraphs[0].tags).toEqual(['TEM\\分岐点', '感受性\\否認']);
    expect(a.paragraphs[0].text).toBe('留学を決めたのは友人の一言だった');
    expect(a.participantId).toBe('A さん 1回目');
  });

  it('選んだコードだけが Box になり、原文参照が段落を指す', () => {
    const res = build();
    expect(res.boxes.map((b) => [b.id, b.type, b.label])).toEqual([
      ['BFP1', 'BFP', '分岐点'],
      ['OPP1', 'OPP', '必須通過点'],
      ['BFP2', 'BFP', '分岐点'],
    ]);
    // 「否認」は tag のみなので Box にならない
    expect(res.boxes.some((b) => b.label === '否認')).toBe(false);
    const ref = res.sourceRefs.find((r) => r.target.id === 'BFP1')!;
    expect(ref.ref.transcriptId).toBe(res.transcripts[0].id);
    expect(ref.ref.paragraphId).toBe(res.transcripts[0].paragraphs[0].id);
    expect(ref.ref.quoteText).toBe('留学を決めたのは友人の一言だった');
  });

  it('文書ごとに Item 軸を分け、文書内で Time 軸に並ぶ', () => {
    const res = build();
    const a = res.boxes.filter((b) => b.participantId === 'A さん 1回目');
    const b = res.boxes.filter((b) => b.participantId === 'B さん 1回目');
    expect(a.map((x) => x.x)).toEqual([0, 100]);
    expect(b[0].x).toBe(0);
    expect(b[0].y).not.toBe(a[0].y);
  });

  it('SD は直前の Box に紐付き、時期ラベルは 1 回だけ作られる', () => {
    const res = build();
    expect(res.sdsg).toHaveLength(1);
    expect(res.sdsg[0].type).toBe('SD');
    expect(res.sdsg[0].attachedTo).toBe('OPP1');
    expect(res.periodLabels.map((p) => p.label)).toEqual(['第1期']);
  });

  it('既存 ID と衝突しない', () => {
    const r = dedupeSegments(ROWS, { mapping: MAPPING, hasHeader: true });
    const res = buildFromSegments(r, {
      plans: [{ code: 'TEM\\分岐点', action: 'box', boxType: 'BFP' }],
      levelPx: 100, defaultWidth: 100, defaultHeight: 60,
      existingBoxIds: new Set(['BFP1', 'BFP2']), existingSdsgIds: new Set(),
    });
    expect(res.boxes.map((b) => b.id)).toEqual(['BFP3', 'BFP4']);
  });
});
