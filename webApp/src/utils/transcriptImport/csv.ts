// ============================================================================
// csv パーサ
// - papaparse で行に分割
// - ヘッダ行を自動推測して text/speaker/timestamp 列をマッピング
// - 列マッピングはユーザが UI で上書きできるよう ColumnMapping をエクスポート
// ============================================================================

import Papa from 'papaparse';
import { detectSpeaker } from './speaker';
import { genParagraphId } from '../../store/defaults';
import type { Paragraph } from '../../types';

export interface ColumnMapping {
  textColumn: number;           // 必須（本文列）
  speakerColumn?: number;       // -1 / undefined = なし
  timestampColumn?: number;
}

export interface CsvParseResult {
  rows: string[][];             // 全データ行（ヘッダ除く）
  header?: string[];            // ヘッダ行（存在すれば）
  suggestedMapping: ColumnMapping;
}

// ヘッダ名のパターン（部分一致、大文字小文字無視）
const SPEAKER_HEADERS = ['speaker', 'name', 'speaker_name', '話者', '発言者', '人物'];
const TIMESTAMP_HEADERS = ['timestamp', 'time', 'time_code', 'タイムスタンプ', '時刻', '時間'];
const TEXT_HEADERS = ['text', 'utterance', 'transcript', 'body', '発言', '本文', 'テキスト', '内容'];

function matchHeader(name: string, candidates: string[]): boolean {
  const lower = name.trim().toLowerCase();
  return candidates.some((c) => lower.includes(c.toLowerCase()));
}

/**
 * CSV テキストを Papaparse で行配列に変換し、ヘッダ自動推測する。
 */
export function parseCsvRaw(text: string): CsvParseResult {
  const parsed = Papa.parse<string[]>(text, {
    skipEmptyLines: true,
    delimiter: '',           // 自動判定
  });
  const allRows: string[][] = (parsed.data ?? []).map((row) =>
    Array.isArray(row) ? row.map((cell) => String(cell ?? '')) : []
  );

  if (allRows.length === 0) {
    return {
      rows: [],
      suggestedMapping: { textColumn: 0 },
    };
  }

  // ヘッダ自動検出: 最初の行が「列数分の非空文字 + 数字混入が少ない」ならヘッダとみなす
  const first = allRows[0];
  const looksLikeHeader =
    first.length > 0 &&
    first.every((c) => c.trim().length > 0) &&
    first.every((c) => !/^\d+(\.\d+)?$/.test(c.trim()));

  let header: string[] | undefined;
  let dataRows: string[][];
  if (looksLikeHeader) {
    header = first;
    dataRows = allRows.slice(1);
  } else {
    dataRows = allRows;
  }

  // 列マッピング推測
  const colCount = Math.max(...allRows.map((r) => r.length));
  let speakerColumn: number | undefined;
  let timestampColumn: number | undefined;
  let textColumn = 0;

  if (header) {
    for (let i = 0; i < header.length; i++) {
      const h = header[i];
      if (speakerColumn === undefined && matchHeader(h, SPEAKER_HEADERS)) speakerColumn = i;
      if (timestampColumn === undefined && matchHeader(h, TIMESTAMP_HEADERS)) timestampColumn = i;
      if (matchHeader(h, TEXT_HEADERS)) textColumn = i;
    }
    // text 列が見つからなければ、speaker/timestamp 以外で最も長い文字列の列を採用
    const headerHits = new Set([speakerColumn, timestampColumn].filter((x) => x !== undefined) as number[]);
    if (!header.some((h) => matchHeader(h, TEXT_HEADERS)) && colCount > headerHits.size) {
      // 各列の平均文字数を見て最長を text とする
      const colLens = new Array(colCount).fill(0);
      const colCounts = new Array(colCount).fill(0);
      for (const r of dataRows) {
        for (let i = 0; i < r.length; i++) {
          colLens[i] += r[i].length;
          colCounts[i]++;
        }
      }
      let maxAvg = -1;
      for (let i = 0; i < colCount; i++) {
        if (headerHits.has(i)) continue;
        const avg = colCounts[i] > 0 ? colLens[i] / colCounts[i] : 0;
        if (avg > maxAvg) {
          maxAvg = avg;
          textColumn = i;
        }
      }
    }
  } else if (colCount === 1) {
    textColumn = 0;
  } else {
    // ヘッダなし複数列: 最長平均の列を text とする
    const colLens = new Array(colCount).fill(0);
    const colCounts = new Array(colCount).fill(0);
    for (const r of dataRows) {
      for (let i = 0; i < r.length; i++) {
        colLens[i] += r[i].length;
        colCounts[i]++;
      }
    }
    let maxAvg = -1;
    for (let i = 0; i < colCount; i++) {
      const avg = colCounts[i] > 0 ? colLens[i] / colCounts[i] : 0;
      if (avg > maxAvg) {
        maxAvg = avg;
        textColumn = i;
      }
    }
  }

  return {
    rows: dataRows,
    header,
    suggestedMapping: { textColumn, speakerColumn, timestampColumn },
  };
}

/**
 * 列マッピングを使って rows を Paragraph[] に変換する。
 */
export function buildParagraphsFromRows(rows: string[][], mapping: ColumnMapping): Paragraph[] {
  return rows
    .map((row, i): Paragraph | null => {
      const text = (row[mapping.textColumn] ?? '').trim();
      if (text.length === 0) return null;
      let speaker = mapping.speakerColumn !== undefined ? (row[mapping.speakerColumn] ?? '').trim() : undefined;
      // 話者が空かつ text の先頭から話者表記を抽出
      let body = text;
      if (!speaker || speaker.length === 0) {
        const d = detectSpeaker(text);
        if (d.speaker) {
          speaker = d.speaker;
          body = d.text;
        } else {
          speaker = undefined;
        }
      }
      const timestamp = mapping.timestampColumn !== undefined
        ? ((row[mapping.timestampColumn] ?? '').trim() || undefined)
        : undefined;
      return {
        id: genParagraphId(),
        index: i,
        speaker,
        timestamp,
        text: body,
      };
    })
    .filter((p): p is Paragraph => p !== null)
    .map((p, i) => ({ ...p, index: i }));
}
