// hydrateDocument の欠損補完テスト
// 旧 .tem / 作例ファイル（transcripts / participants を持たない 0.3）を読み込んでも
// 必須配列が空配列で補完され、TranscriptViewer 等が throw しないことを保証する。
import { describe, it, expect } from 'vitest';
import { hydrateDocument } from './hydrate';
import { createEmptyDocument } from '../store/defaults';
import type { TEMDocument } from '../types';

describe('hydrateDocument', () => {
  it('transcripts / participants が無い 0.3 ドキュメントを空配列で補完し 0.4 に上げる', () => {
    // 作例ファイル相当: version 0.3 で transcripts / participants 無し
    const base = createEmptyDocument();
    const legacy = {
      ...base,
      version: '0.3',
    } as unknown as Record<string, unknown>;
    delete legacy.transcripts;
    delete legacy.participants;

    const out = hydrateDocument(legacy as unknown as TEMDocument);

    expect(Array.isArray(out.transcripts)).toBe(true);
    expect(out.transcripts).toHaveLength(0);
    expect(Array.isArray(out.participants)).toBe(true);
    expect(out.participants).toHaveLength(0);
    expect(out.version).toBe('0.4');
  });

  it('既存の transcripts / participants は保持する', () => {
    const base = createEmptyDocument();
    const doc: TEMDocument = {
      ...base,
      participants: [{ id: 'p1', pseudonym: 'A' }],
      transcripts: [
        { id: 't1', title: 'T1', participantId: 'p1', source: 'manual', importedAt: '2026-06-22T00:00:00.000Z', paragraphs: [] },
      ],
    };

    const out = hydrateDocument(doc);

    expect(out.participants).toHaveLength(1);
    expect(out.transcripts).toHaveLength(1);
    expect(out.transcripts[0].id).toBe('t1');
  });
});
