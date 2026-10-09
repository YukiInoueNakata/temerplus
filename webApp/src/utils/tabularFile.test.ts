// 表ファイルの読み込みのテスト（2026-10-01 レビュー対応: CSV の文字コード）
import { describe, it, expect } from 'vitest';
import { decodeCsvBytes, parseCsvToSheet } from './tabularFile';

describe('decodeCsvBytes', () => {
  it('UTF-8（BOM 付き）はそのまま読み、BOM を外す', () => {
    const bytes = new Uint8Array([0xef, 0xbb, 0xbf, ...new TextEncoder().encode('ラベル,種別\n留学,BFP')]);
    const r = decodeCsvBytes(bytes);
    expect(r.encoding).toBe('utf-8');
    expect(parseCsvToSheet(r.text).rows).toEqual([['ラベル', '種別'], ['留学', 'BFP']]);
  });

  it('Shift_JIS（日本語版 Excel の CSV 保存）は文字化けさせずに読む', () => {
    // 「あ,い」「漢字」の Shift_JIS: あ=82A0 い=82A2 漢=8ABF 字=8E9A
    const bytes = new Uint8Array([0x82, 0xa0, 0x2c, 0x82, 0xa2, 0x0a, 0x8a, 0xbf, 0x8e, 0x9a, 0x2c, 0x41]);
    const r = decodeCsvBytes(bytes);
    expect(r.encoding).toBe('shift_jis');
    expect(parseCsvToSheet(r.text).rows).toEqual([['あ', 'い'], ['漢字', 'A']]);
  });
});
