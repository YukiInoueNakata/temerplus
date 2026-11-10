// 同梱のデモ（架空の例「ピアノの再開」。scripts/gen-fictional-demo.cjs で作る。2026-11-10）の検査
import { describe, it, expect } from 'vitest';
import { hydrateDocument } from './hydrate';
import { findPathTypeIssues } from './pathTypeCheck';
import type { TEMDocument } from '../types';
import jaRaw from '../../sample-tem/fictional_piano_demo.tem?raw';
import enRaw from '../../sample-tem/fictional_piano_demo_en.tem?raw';

for (const [lang, raw] of [['ja', jaRaw], ['en', enRaw]] as const) {
  describe(`架空の例のデモ（${lang}）`, () => {
    const d = hydrateDocument(JSON.parse(raw) as TEMDocument);
    const sh = d.sheets[0];
    it('図の言語・時間の矢印の文字・凡例の題がその言語', () => {
      expect(d.settings.locale).toBe(lang);
      expect(d.settings.timeArrow.label).toBe(lang === 'ja' ? '非可逆的時間' : 'Irreversible Time');
      expect(d.settings.legend.title).toBe(lang === 'ja' ? '凡例' : 'Legend');
      expect(d.settings.legend.placement).toBe('auto');
    });
    it('EFP・P-EFP・BFP・OPP・潜在経験・SD・SG・実線と点線の径路・時期ラベルがある', () => {
      const types = new Set(sh.boxes.map((b) => b.type));
      for (const t of ['normal', 'EFP', 'P-EFP', 'BFP', 'OPP', 'annotation']) expect(types.has(t as never)).toBe(true);
      expect(new Set(sh.sdsg.map((g) => g.type))).toEqual(new Set(['SD', 'SG']));
      expect(new Set(sh.lines.map((l) => l.type))).toEqual(new Set(['RLine', 'XLine']));
      expect(sh.periodLabels.length).toBe(3);
    });
    it('最初の Box は通常で、点線だけでつながる通常の Box は無い', () => {
      const first = [...sh.boxes].sort((a, b) => a.x - b.x)[0];
      expect(first.type).toBe('normal');
      expect(findPathTypeIssues(sh).size).toBe(0);
    });
    it('Line の両端は図の中の Box', () => {
      const ids = new Set(sh.boxes.map((b) => b.id));
      for (const l of sh.lines) { expect(ids.has(l.from)).toBe(true); expect(ids.has(l.to)).toBe(true); }
      for (const g of sh.sdsg) { expect(g.attachedType).toBe('box'); expect(ids.has(g.attachedTo as string)).toBe(true); }
    });
  });
}

describe('シートの配列が欠けた .tem を読んでも落ちない', () => {
  it('notes などを空の配列で補う', () => {
    const raw = JSON.parse(jaRaw) as TEMDocument;
    const sh = raw.sheets[0] as unknown as Record<string, unknown>;
    delete sh.notes; delete sh.comments; delete sh.periodLabels;
    const d = hydrateDocument(raw);
    expect(d.sheets[0].notes).toEqual([]);
    expect(d.sheets[0].comments).toEqual([]);
    expect(d.sheets[0].periodLabels).toEqual([]);
  });
});
