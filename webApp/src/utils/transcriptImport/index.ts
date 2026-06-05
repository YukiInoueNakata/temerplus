// ============================================================================
// インタビュー原文インポート - 統合エントリ
// 4 形式 (txt / csv / xlsx / docx) をファイル拡張子で判別してパースし、
// Transcript を組み立てて返す。
// csv/xlsx は列マッピングが必要なので、初回パース結果 + 列マッピング適用
// の 2 段階に分かれる。
// ============================================================================

import { parseTxt } from './txt';
import { parseCsvRaw, buildParagraphsFromRows } from './csv';
import type { ColumnMapping } from './csv';
import { parseXlsx, detectHeader } from './xlsx';
import { parseDocx } from './docx';
import { genTranscriptId } from '../../store/defaults';
import type { Paragraph, Transcript } from '../../types';

export type TranscriptSourceFormat = 'txt' | 'csv' | 'xlsx' | 'docx';

export interface ImportInitialResult {
  format: TranscriptSourceFormat;
  filename: string;
  // 段落確定型 (txt / docx)
  paragraphs?: Paragraph[];
  // 列マッピング必要型 (csv / xlsx)
  tabular?: TabularSource;
}

export interface TabularSource {
  sheets: Array<{
    name: string;
    rows: string[][];                  // ヘッダ含む全行
    hasHeader: boolean;
    suggestedMapping: ColumnMapping;
  }>;
}

export { ColumnMapping };

// ----------------------------------------------------------------------------
// 拡張子判定
// ----------------------------------------------------------------------------

export function detectFormatFromFilename(filename: string): TranscriptSourceFormat | null {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.txt') || lower.endsWith('.md')) return 'txt';
  if (lower.endsWith('.csv') || lower.endsWith('.tsv')) return 'csv';
  if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) return 'xlsx';
  if (lower.endsWith('.docx')) return 'docx';
  return null;
}

// ----------------------------------------------------------------------------
// メイン: ファイルから初回パース結果を返す
// ----------------------------------------------------------------------------

export async function importTranscriptFile(file: File): Promise<ImportInitialResult> {
  const format = detectFormatFromFilename(file.name);
  if (!format) {
    throw new Error(
      `対応していない形式です: ${file.name}\n対応形式: .txt / .md / .csv / .tsv / .xlsx / .xls / .docx`
    );
  }

  switch (format) {
    case 'txt': {
      const text = await file.text();
      return { format, filename: file.name, paragraphs: parseTxt(text) };
    }
    case 'docx': {
      const buf = await file.arrayBuffer();
      return { format, filename: file.name, paragraphs: await parseDocx(buf) };
    }
    case 'csv': {
      const text = await file.text();
      const { rows, header, suggestedMapping } = parseCsvRaw(text);
      const allRows = header ? [header, ...rows] : rows;
      return {
        format,
        filename: file.name,
        tabular: {
          sheets: [
            {
              name: file.name,
              rows: allRows,
              hasHeader: !!header,
              suggestedMapping,
            },
          ],
        },
      };
    }
    case 'xlsx': {
      const buf = await file.arrayBuffer();
      const { sheets } = await parseXlsx(buf);
      return {
        format,
        filename: file.name,
        tabular: {
          sheets: sheets.map((sh) => {
            const hasHeader = detectHeader(sh.rows);
            // 列マッピング推測には csv パーサの自動推測を流用するため、
            // ヘッダ行を CSV テキスト相当に再構築してパースに渡す
            const csvText = sh.rows
              .map((r) => r.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(','))
              .join('\n');
            const { suggestedMapping } = parseCsvRaw(csvText);
            return {
              name: sh.name,
              rows: sh.rows,
              hasHeader,
              suggestedMapping,
            };
          }),
        },
      };
    }
  }
}

// ----------------------------------------------------------------------------
// 列マッピング確定後の Transcript 構築 (csv/xlsx 用)
// ----------------------------------------------------------------------------

export function buildTranscriptFromTabular(opts: {
  initialResult: ImportInitialResult;
  sheetIndex: number;
  hasHeader: boolean;
  mapping: ColumnMapping;
  title: string;
  participantId?: string;
  sessionNumber?: number;
}): Transcript {
  const { initialResult, sheetIndex, hasHeader, mapping, title, participantId, sessionNumber } = opts;
  if (!initialResult.tabular) throw new Error('Tabular でないファイルです');
  const sheet = initialResult.tabular.sheets[sheetIndex];
  if (!sheet) throw new Error('シートが見つかりません');
  const dataRows = hasHeader ? sheet.rows.slice(1) : sheet.rows;
  const paragraphs = buildParagraphsFromRows(dataRows, mapping);
  return {
    id: genTranscriptId(),
    participantId,
    sessionNumber,
    title,
    source: initialResult.format,
    importedAt: new Date().toISOString(),
    paragraphs,
  };
}

// ----------------------------------------------------------------------------
// 段落確定型 (txt/docx) の Transcript 構築
// ----------------------------------------------------------------------------

export function buildTranscriptFromParagraphs(opts: {
  initialResult: ImportInitialResult;
  title: string;
  participantId?: string;
  sessionNumber?: number;
}): Transcript {
  const { initialResult, title, participantId, sessionNumber } = opts;
  if (!initialResult.paragraphs) throw new Error('Paragraph 型でないファイルです');
  return {
    id: genTranscriptId(),
    participantId,
    sessionNumber,
    title,
    source: initialResult.format,
    importedAt: new Date().toISOString(),
    paragraphs: initialResult.paragraphs,
  };
}
