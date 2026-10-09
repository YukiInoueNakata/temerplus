// 逐語録の取り込みで Shift_JIS のファイルが文字化けしないこと（2026-10-09）
// 日本語版 Excel の「CSV（コンマ区切り）」保存や古いメモ帳の保存は Shift_JIS。以前は UTF-8 決め打ちだった
import { describe, it, expect } from 'vitest';
import { importTranscriptFile } from './index';

// "話者,発話\nA,こんにちは\nB,ありがとう" を Shift_JIS（cp932）で符号化したもの
const SJIS = new Uint8Array([
  0x98, 0x62, 0x8e, 0xd2, 0x2c, 0x94, 0xad, 0x98, 0x62, 0x0a, 0x41, 0x2c, 0x82, 0xb1, 0x82, 0xf1, 0x82, 0xc9,
  0x82, 0xbf, 0x82, 0xcd, 0x0a, 0x42, 0x2c, 0x82, 0xa0, 0x82, 0xe8, 0x82, 0xaa, 0x82, 0xc6, 0x82, 0xa4,
]);

describe('逐語録の取り込み: 文字コード', () => {
  it('Shift_JIS の CSV を正しく読む', async () => {
    const r = await importTranscriptFile(new File([SJIS], 'sjis.csv'));
    const rows = r.tabular!.sheets[0].rows;
    expect(rows.flat().join('|')).toContain('こんにちは');
    expect(rows.flat().join('|')).toContain('話者');
  });
  it('Shift_JIS のテキストを正しく読む', async () => {
    const r = await importTranscriptFile(new File([SJIS], 'sjis.txt'));
    expect(r.paragraphs!.map((p) => p.text).join('\n')).toContain('ありがとう');
  });
  it('UTF-8（BOM 付き）はそのまま読み、BOM を残さない', async () => {
    const bytes = new Uint8Array([0xef, 0xbb, 0xbf, ...new TextEncoder().encode('話者,発話\nA,こんにちは')]);
    const r = await importTranscriptFile(new File([bytes], 'utf8.csv'));
    expect(r.tabular!.sheets[0].rows[0][0]).toBe('話者');
  });
});
