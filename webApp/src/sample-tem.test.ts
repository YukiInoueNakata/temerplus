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
import kanzakiEnRaw from '../sample-tem/kanzaki2021_figure1_en.tem?raw';

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

// 英語版デモ（2026-09-20 TEA 国際集会のハンズオン用）
// 日本語版と同一の構造を保ったまま、表示テキストだけ英語になっていることを担保する。
describe('sample-tem/kanzaki2021_figure1_en.tem', () => {
  const ja = hydrateDocument(JSON.parse(kanzakiRaw) as TEMDocument);
  const en = hydrateDocument(JSON.parse(kanzakiEnRaw) as TEMDocument);

  it('hydrate で 0.4 に正規化される', () => {
    expect(en.version).toBe('0.4');
    expect(Array.isArray(en.transcripts)).toBe(true);
  });

  it('locale が en で、凡例と時間軸のラベルが英語', () => {
    expect(en.settings.locale).toBe('en');
    expect(en.settings.legend.title).toBe('Legend');
    expect(en.settings.timeArrow.label).toBe('Irreversible Time');
  });

  it('日本語版と同じ構造（シート数・ID 一式・Line の接続）を保つ', () => {
    expect(en.sheets.length).toBe(ja.sheets.length);
    en.sheets.forEach((sheet, i) => {
      const src = ja.sheets[i];
      expect(sheet.boxes.map((b) => b.id)).toEqual(src.boxes.map((b) => b.id));
      expect(sheet.lines.map((l) => `${l.from}->${l.to}`)).toEqual(
        src.lines.map((l) => `${l.from}->${l.to}`),
      );
      expect(sheet.sdsg.map((s) => s.id)).toEqual(src.sdsg.map((s) => s.id));
      expect((sheet.periodLabels ?? []).map((p) => p.position)).toEqual(
        (src.periodLabels ?? []).map((p) => p.position),
      );
    });
  });

  it('表示テキストに日本語が残っていない', () => {
    const jaChars = /[぀-ヿ一-龯]/;
    const offenders: string[] = [];
    for (const sheet of en.sheets) {
      if (jaChars.test(sheet.name)) offenders.push(`sheet:${sheet.name}`);
      for (const b of sheet.boxes) {
        if (jaChars.test(b.label ?? '')) offenders.push(`box:${b.id}`);
        if (jaChars.test(b.subLabel ?? '')) offenders.push(`box.sub:${b.id}`);
      }
      for (const s of sheet.sdsg) {
        if (jaChars.test(s.label ?? '')) offenders.push(`sdsg:${s.id}`);
        if (jaChars.test(s.subLabel ?? '')) offenders.push(`sdsg.sub:${s.id}`);
      }
      for (const p of sheet.periodLabels ?? []) {
        if (jaChars.test(p.label ?? '')) offenders.push(`period:${p.id}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
