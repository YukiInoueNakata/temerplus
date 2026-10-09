// ============================================================================
// 表ファイル（CSV / TSV / XLSX / XLS）を「シートごとの行配列」に読む共通パーサ
// - 取り込みウィザードの入口。ヘッダ行を含む生の行を返し、解釈は呼び出し側が行う
// - CSV は Papaparse、Excel は SheetJS（既存の逐語録取り込みと同じ依存）
// ============================================================================

import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface TabularSheet {
  name: string;
  rows: string[][];        // ヘッダ行を含む全行（空行は除く）
}

export interface TabularFile {
  filename: string;
  format: 'csv' | 'xlsx';
  sheets: TabularSheet[];
}

export function detectTabularFormat(filename: string): 'csv' | 'xlsx' | null {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.csv') || lower.endsWith('.tsv') || lower.endsWith('.txt')) return 'csv';
  if (lower.endsWith('.xlsx') || lower.endsWith('.xls') || lower.endsWith('.xlsm')) return 'xlsx';
  return null;
}

function normalizeRows(rows: unknown[][]): string[][] {
  return rows
    .map((r) => r.map((c) => (c === null || c === undefined ? '' : String(c))))
    .filter((r) => r.some((c) => c.trim().length > 0));
}

export function parseCsvToSheet(text: string, name = 'CSV'): TabularSheet {
  // 区切り文字は自動判定（カンマ / タブ / セミコロン）
  const parsed = Papa.parse<string[]>(text, { skipEmptyLines: true });
  return { name, rows: normalizeRows(parsed.data as unknown[][]) };
}

export function parseXlsxToSheets(buffer: ArrayBuffer | Uint8Array): TabularSheet[] {
  // Node（テスト）では ArrayBuffer を渡すと文字列扱いされることがあるので Uint8Array に揃える
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  const wb = XLSX.read(bytes, { type: 'array', cellDates: true });
  return wb.SheetNames.map((name) => {
    const ws = wb.Sheets[name];
    const aoa = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, blankrows: false, defval: '' });
    return { name, rows: normalizeRows(aoa as unknown[][]) };
  });
}

/** 1 行目がヘッダらしいか（数値でない文字列が過半数） */
export function looksLikeHeader(rows: string[][]): boolean {
  if (rows.length < 2) return false;
  const first = rows[0];
  const nonNumeric = first.filter((c) => c.trim() !== '' && Number.isNaN(Number(c))).length;
  return nonNumeric >= Math.ceil(first.length / 2);
}

/**
 * CSV のバイト列を文字列にする。UTF-8（BOM 付き含む）として厳密に読めなければ Shift_JIS とみなす。
 * 日本語版 Excel の「CSV（コンマ区切り）」保存は Shift_JIS で、UTF-8 決め打ちだと黙って文字化けする
 */
export function decodeCsvBytes(bytes: Uint8Array): { text: string; encoding: 'utf-8' | 'shift_jis' } {
  try {
    const text = new TextDecoder('utf-8', { fatal: true, ignoreBOM: false }).decode(bytes);
    return { text, encoding: 'utf-8' };
  } catch {
    return { text: new TextDecoder('shift_jis').decode(bytes), encoding: 'shift_jis' };
  }
}

export async function parseTabularFile(file: File): Promise<TabularFile> {
  const format = detectTabularFormat(file.name);
  if (!format) {
    throw new Error(`対応していない形式です: ${file.name}（対応: .csv / .tsv / .xlsx / .xls）`);
  }
  if (format === 'csv') {
    const { text } = decodeCsvBytes(new Uint8Array(await file.arrayBuffer()));
    return { filename: file.name, format, sheets: [parseCsvToSheet(text, file.name)] };
  }
  const buffer = await file.arrayBuffer();
  return { filename: file.name, format, sheets: parseXlsxToSheets(buffer) };
}
