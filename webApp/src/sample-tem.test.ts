// 同梱サンプル .tem の整合性テスト
// - 読込パイプライン（hydrateDocument）を通って正しく読めること
// - transcript_demo: 全 sourceRef が実在の transcript/paragraph/box を指し、
//   quoteText === paragraph.text.slice(charStart, charEnd) が厳密に一致すること
//   （手編集や生成スクリプト変更で参照がズレた場合に検出する回帰テスト）
import { describe, it, expect } from 'vitest';
import { hydrateDocument } from './utils/hydrate';
import type { TEMDocument } from './types';
import demoRaw from '../sample-tem/transcript_demo.tem?raw';
import kanzakiRaw from '../sample-tem/kanzaki2021_figure1.tem?raw';

describe('sample-tem/transcript_demo.tem', () => {
  const doc = hydrateDocument(JSON.parse(demoRaw) as TEMDocument);

  it('version 0.4 / transcripts と participants を持つ', () => {
    expect(doc.version).toBe('0.4');
    expect(doc.transcripts.length).toBeGreaterThan(0);
    expect(doc.participants.length).toBeGreaterThan(0);
  });

  it('全 Box の sourceRef が実在の段落を指し、quoteText がオフセットと厳密一致する', () => {
    const transcriptById = new Map(doc.transcripts.map((t) => [t.id, t]));
    let checked = 0;
    for (const sheet of doc.sheets) {
      for (const box of sheet.boxes) {
        for (const ref of box.sourceRefs ?? []) {
          const t = transcriptById.get(ref.transcriptId);
          expect(t, `transcript ${ref.transcriptId} が存在する`).toBeTruthy();
          const para = t!.paragraphs.find((p) => p.id === ref.paragraphId);
          expect(para, `paragraph ${ref.paragraphId} が存在する`).toBeTruthy();
          expect(para!.text.slice(ref.charStart, ref.charEnd)).toBe(ref.quoteText);
          checked += 1;
        }
      }
    }
    expect(checked).toBeGreaterThanOrEqual(5);
  });
});

describe('sample-tem 読込互換', () => {
  it('kanzaki2021_figure1.tem も hydrate で 0.4 / transcripts=[] に正規化される', () => {
    const doc = hydrateDocument(JSON.parse(kanzakiRaw) as TEMDocument);
    expect(doc.version).toBe('0.4');
    expect(Array.isArray(doc.transcripts)).toBe(true);
  });
});
