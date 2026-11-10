// 論文用レポートの結果の節: ラベルを括る括弧と書く順（2026-11-10 ユーザー要望。TEM 論文 68 本の調べ）
import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { Document, Packer } from 'docx';
import { hydrateDocument } from './hydrate';
import { buildPaperReportParagraphs, type PaperReportOptions } from './exportReport';
import type { TEMDocument } from '../types';
import demoRaw from '../../sample-tem/fictional_piano_demo.tem?raw';

async function reportText(opts: Partial<PaperReportOptions>, locale: 'ja' | 'en' = 'ja'): Promise<string[]> {
  const doc = hydrateDocument(JSON.parse(demoRaw) as TEMDocument);
  doc.settings.locale = locale;
  const children = await buildPaperReportParagraphs(doc, { includeDiagram: false, content: { notes: 'all', comments: true }, ...opts });
  const buf = await Packer.toBuffer(new Document({ sections: [{ children }] }));
  const xml = await (await JSZip.loadAsync(buf)).file('word/document.xml')!.async('string');
  return [...xml.matchAll(/<w:p[ >][\s\S]*?<\/w:p>/g)]
    .map((m) => [...m[0].matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((t) => t[1]).join(''))
    .filter(Boolean);
}

describe('結果の節のラベルの括弧と順', () => {
  it('既定は日本語【…】（調べで最も多かった）・記号が先', async () => {
    const ps = await reportText({});
    expect(ps.some((p) => p.includes('BFP1 【同僚の演奏会を聴きに行く】'))).toBe(true);
    expect(ps.some((p) => p.includes('ラベルは【…】で括って示す'))).toBe(true);
  });

  it('〈〉・ラベルが先にすると「〈…〉（BFP1）」と書き、説明の文も〈…〉になる', async () => {
    const ps = await reportText({ labelStyle: { box: '〈〉', order: 'label-first' } });
    expect(ps.some((p) => p.includes('〈同僚の演奏会を聴きに行く〉（BFP1）'))).toBe(true);
    expect(ps.some((p) => p.includes('ラベルは〈…〉で括って示す'))).toBe(true);
    expect(ps.some((p) => p.includes('【同僚の演奏会を聴きに行く】'))).toBe(false);
  });

  it('SD・SG だけ別の括弧にすると、その旨の文を足し、SD/SG の行だけその括弧になる', async () => {
    const ps = await reportText({ labelStyle: { box: '〈〉', sdsg: '《》' } });
    expect(ps.some((p) => p.includes('SD1 《残業の多い職場》'))).toBe(true);
    expect(ps.some((p) => p.includes('（SD）と社会的助勢（SG）のラベルは《…》'))).toBe(true);
    // SD/SG が付く先の Box は Box の括弧
    expect(ps.some((p) => p.includes('《残業の多い職場》') && p.includes('〈同僚の演奏会を聴きに行く〉'))).toBe(true);
  });

  it('英語の図の既定は二重引用符で、ラベルが先なら「“…” (BFP1)」の形', async () => {
    const ps = await reportText({ labelStyle: { order: 'label-first' } }, 'en');
    expect(ps.some((p) => /“[^”]+” \(BFP1\)/.test(p))).toBe(true);
    expect(ps.some((p) => p.includes('⟨'))).toBe(false);
  });
});

describe('同じ括弧なら SD・SG の文を足さない', () => {
  it('Box に【】を選び SD・SG は自動（日本語【】）', async () => {
    const ps = await reportText({ labelStyle: { box: '【】', sdsg: 'auto' } });
    expect(ps.some((p) => p.includes('（SD）と社会的助勢（SG）のラベルは'))).toBe(false);
  });
});
