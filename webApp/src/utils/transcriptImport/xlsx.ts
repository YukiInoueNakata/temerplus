// ============================================================================
// xlsx パーサ (SheetJS)
// - 動的 import で初期バンドルサイズを増やさない
// - 全シートを { name, rows } の配列で返し、ユーザが UI でシートを選ぶ
// - 列マッピングは csv パーサと共通の ColumnMapping を使う
// ============================================================================

import type { ColumnMapping } from './csv';
import { buildParagraphsFromRows } from './csv';
import type { Paragraph } from '../../types';

export interface XlsxSheet {
  name: string;
  rows: string[][];          // 全行（ヘッダ含む生データ）
}

export interface XlsxParseResult {
  sheets: XlsxSheet[];
}

/**
 * xlsx ファイルを全シート読み込む。
 */
export async function parseXlsx(buffer: ArrayBuffer): Promise<XlsxParseResult> {
  const XLSX = await import('xlsx');
  const wb = XLSX.read(buffer, { type: 'array', cellDates: true });
  const sheets: XlsxSheet[] = wb.SheetNames.map((name) => {
    const ws = wb.Sheets[name];
    // header:1 で 2 次元配列（各行が cell の配列）を取得
    const aoa = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, blankrows: false, defval: '' });
    const rows: string[][] = aoa.map((row) =>
      Array.isArray(row) ? row.map((cell) => String(cell ?? '')) : []
    );
    return { name, rows };
  });
  return { sheets };
}

// csv と同じ自動推測関数を再利用するため re-export
export { parseCsvRaw, buildParagraphsFromRows } from './csv';
export type { ColumnMapping };

/**
 * 1 シートの行配列 + 列マッピングから Paragraph[] を作る。
 * （csv と xlsx で共通ロジック）
 */
export function buildParagraphsFromXlsxSheet(
  rows: string[][],
  mapping: ColumnMapping,
  hasHeader: boolean,
): Paragraph[] {
  const dataRows = hasHeader ? rows.slice(1) : rows;
  return buildParagraphsFromRows(dataRows, mapping);
}

/**
 * ヘッダ自動検出（csv と同じロジック）
 */
export function detectHeader(rows: string[][]): boolean {
  if (rows.length === 0) return false;
  const first = rows[0];
  return (
    first.length > 0 &&
    first.every((c) => c.trim().length > 0) &&
    first.every((c) => !/^\d+(\.\d+)?$/.test(c.trim()))
  );
}
