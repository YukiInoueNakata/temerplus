// 論文用レポートの英語化（2026-11-08）
// - Word の本文は「図の言語」（doc.settings.locale）。画面の言語（i18n.language）とは別
// - 確認画面の入力状況などは「画面の言語」
import { describe, it, expect, afterEach } from 'vitest';
import JSZip from 'jszip';
import { Document, Packer } from 'docx';
import i18n from '../i18n';
import { hydrateDocument } from './hydrate';
import { buildPaperReportParagraphs } from './exportReport';
import { computeReportStatus, missingReportChoices, reportStateLabel } from './reportStatus';
import { describeNotation } from './notationDescribe';
import { conventionItemLabel, conventionMeaningLabel } from './visualConventions';
import type { TEMDocument } from '../types';
import kanzakiRaw from '../../sample-tem/kanzaki2021_figure1.tem?raw';

const JA = /[぀-ヿ㐀-鿿！-｠〈〉「」]/;

/** 利用者が入れた文字（ラベル・説明など）を英数字にし、あらゆる節が出るように埋めた文書 */
function englishDoc(locale: 'ja' | 'en'): TEMDocument {
  const doc = hydrateDocument(JSON.parse(kanzakiRaw) as TEMDocument);
  doc.settings.locale = locale;
  doc.metadata = {
    ...doc.metadata,
    title: '',
    author: 'Author',
    notationSystem: { base: 'Arakawa2012', customDescription: 'custom notes' },
    participantsInfo: { count: 2, description: 'two students', hsiDescription: 'level 1', pseudonyms: ['A', 'B'] },
    interview: { method: 'semi-structured', durationDescription: '60 min', timesCount: 2, analysisCombination: 'TEM', notes: 'none' },
    visualConventions: {
      horizontalLength: { meaning: 'yes', hasMeaning: true, description: 'time' },
      verticalPosition: { meaning: 'loose', hasMeaning: true },
      arrowAngle: { meaning: 'no', hasMeaning: false },
    },
    symbolMeanings: {},
    reportNotes: 'extra',
  };
  doc.participants = [{ id: 'p1', pseudonym: 'A' }];
  doc.transcripts = [{
    id: 'tr1', participantId: 'p1', sessionNumber: 1, title: 'T', source: 'manual', importedAt: '2026-01-01',
    paragraphs: [{ id: 'pa1', index: 3, text: 'hello' }],
  } as TEMDocument['transcripts'][number]];
  doc.sheets.forEach((sh, si) => {
    sh.name = `S${si}`;
    sh.periodLabels = [{ id: 'pl1', position: 1, label: si === 0 ? '' : 'P' } as TEMDocument['sheets'][number]['periodLabels'][number]];
    sh.boxes.forEach((b, i) => {
      b.label = i === 0 ? '' : `box ${i}`;
      b.subLabel = undefined;
      b.customTypeLabel = b.type === 'other' ? 'X' : undefined;
      b.description = i % 3 === 0 ? 'desc' : undefined;
      b.noDescriptionNeeded = i % 3 === 1 ? true : undefined;
      b.sourceRefs = i === 1 ? [{ id: 'r1', transcriptId: 'tr1', paragraphId: 'pa1', quoteText: 'hello', createdAt: '', unresolved: true }] : undefined;
    });
    if (sh.boxes[1]) sh.boxes[1].secondaryType = 'BFP';
    sh.lines.forEach((l) => { l.label = 'path'; l.description = undefined; l.noDescriptionNeeded = undefined; });
    sh.sdsg.forEach((s) => { s.label = 'force'; s.subLabel = undefined; s.description = undefined; s.noDescriptionNeeded = undefined; });
    sh.notes = [{ id: 'n1', x: 0, y: 0, width: 80, height: 40, text: 'memo', includeInReport: true, showLeader: true, leaderTo: sh.boxes[0]?.id }];
    sh.comments = sh.boxes[0]
      ? [{ id: 'c1', targetId: sh.boxes[0].id, text: 'comment', createdAt: '', resolved: true, replies: [{ id: 'r', text: 'ok', createdAt: '' }] }]
      : [];
  });
  return doc;
}

async function reportText(doc: TEMDocument, opts: Partial<Parameters<typeof buildPaperReportParagraphs>[1]>): Promise<string[]> {
  const children = await buildPaperReportParagraphs(doc, { includeDiagram: false, omitMissing: false, content: { notes: 'all', comments: true }, ...opts });
  const buf = await Packer.toBuffer(new Document({ sections: [{ children }] }));
  const xml = await (await JSZip.loadAsync(buf)).file('word/document.xml')!.async('string');
  return [...xml.matchAll(/<w:p[ >][\s\S]*?<\/w:p>/g)]
    .map((m) => [...m[0].matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((t) => t[1]).join(''))
    .map((x) => x.replace(/&quot;/g, '"').replace(/&amp;/g, '&'))
    .filter(Boolean);
}

afterEach(async () => { await i18n.changeLanguage('ja'); });

describe('論文用レポートの本文は図の言語', () => {
  it.each(['bracket', 'apa'] as const)('図の言語が英語なら本文に日本語が 1 字も無い（引用 %s）', async (style) => {
    const t = await reportText(englishDoc('en'), { sourceRefStyle: style });
    expect(t.filter((p) => JA.test(p))).toEqual([]);
    expect(t).toContain('TEM diagram report');
    expect(t).toContain('1. Notation declaration');
    expect(t.some((p) => p.startsWith('Results', 3) || p.endsWith('. Results'))).toBe(true);
    // 画面（paperReportDialog の英語）の例と同じ書き方
    expect(t.some((p) => p.includes(style === 'apa' ? '(A, session 1, §4) "hello" [could not be traced]' : '[Source T §4] "hello"'))).toBe(true);
    expect(t.some((p) => p.includes('(not entered)'))).toBe(true);
    expect(t).toContain(`${conventionItemLabel('verticalPosition', 'en')}: loosely meaningful. (no description entered)`);
    expect(t).toContain(`${conventionItemLabel('arrowAngle', 'en')}: not meaningful (appearance only)`);
  });

  it('画面の言語が英語でも、図の言語が日本語なら本文は日本語のまま', async () => {
    const ja = await reportText(englishDoc('ja'), {});
    await i18n.changeLanguage('en');
    const jaWithEnUi = await reportText(englishDoc('ja'), {});
    expect(jaWithEnUi).toEqual(ja);
    expect(ja).toContain('1. 記号体系の宣言');
  });

  it('記号の宣言の文（線種と意味）も図の言語', () => {
    const en = describeNotation(englishDoc('en'))!;
    expect(JA.test(en.meaning + en.lines.join(''))).toBe(false);
    expect(en.lines.some((l) => l.startsWith('Equifinality point (EFP): '))).toBe(true);
    const ja = describeNotation(englishDoc('ja'))!;
    expect(ja.lines.some((l) => l.startsWith('等至点（EFP）: '))).toBe(true);
  });
});

describe('確認画面の入力状況は画面の言語', () => {
  it('画面の言語が英語なら英語、日本語なら日本語', async () => {
    const d = englishDoc('ja');
    d.sheets[0].notes.push({ id: 'sym', x: 0, y: 0, width: 20, height: 20, text: '★', style: 'text' });
    await i18n.changeLanguage('en');
    const st = computeReportStatus(d, { symbols: true });
    expect(st.filter((s) => JA.test(s.label + (s.detail ?? '')))).toEqual([]);
    expect(st.find((s) => s.key === 'visual.horizontalLength')!.label).toBe('Notation policy: Spacing on the horizontal (time) axis');
    expect(missingReportChoices(d, {})).toEqual(['Notes', 'Symbols', 'Comments']);
    expect(reportStateLabel('done')).toBe('Done');
    expect(conventionMeaningLabel('loose')).toBe('Loosely meaningful');
    await i18n.changeLanguage('ja');
    expect(missingReportChoices(d, {})).toEqual(['メモ', '記号', 'コメント']);
    expect(reportStateLabel('partial')).toBe('一部');
  });
});
